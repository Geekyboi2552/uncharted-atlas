from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.api.deps import get_db, get_current_user
router = APIRouter(prefix="/portfolios", tags=["Portfolios & Holdings"])

# Pydantic Request Schemas
class PortfolioCreate(BaseModel):
    name: str
    description: str | None = None

class HoldingCreate(BaseModel):
    ticker: str
    quantity: float
    average_buy_price: float

@router.post("", status_code=status.HTTP_201_CREATED)
def create_portfolio(
    payload: PortfolioCreate, 
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user)
):
    """Create a new portfolio tied to the authenticated user's UUID."""
    user_id = user["sub"]
    query = text("""
        INSERT INTO portfolios (user_id, name, description) 
        VALUES (:uid, :name, :desc) 
        RETURNING id, name, description, created_at
    """)
    result = db.execute(query, {"uid": user_id, "name": payload.name, "desc": payload.description}).mappings().first()
    db.commit()
    return dict(result)

@router.get("")
def get_user_portfolios(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Fetch all portfolios owned by the authenticated user."""
    user_id = user["sub"]
    query = text("SELECT id, name, description, created_at FROM portfolios WHERE user_id = :uid")
    result = db.execute(query, {"uid": user_id}).mappings().fetchall()
    return [dict(row) for row in result]

@router.post("/{portfolio_id}/holdings", status_code=status.HTTP_201_CREATED)
def add_holding(
    portfolio_id: int, 
    payload: HoldingCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user)
):
    from app.main import trigger_ingestion
    from app.analytics.save_metrics import update_all_instrument_metrics
    from app.api.routes_analytics import get_portfolio_analytics
    """Add a stock holding to a specific portfolio."""
    # 1. Verify portfolio ownership
    owner_check = text("SELECT id FROM portfolios WHERE id = :pid AND user_id = :uid")
    if not db.execute(owner_check, {"pid": portfolio_id, "uid": user["sub"]}).first():
        raise HTTPException(status_code=403, detail="Not authorized to modify this portfolio.")
        
    # 2. Resolve Ticker to Instrument ID
    inst_query = text("SELECT id FROM instruments WHERE ticker = :ticker")
    inst = db.execute(inst_query, {"ticker": payload.ticker.upper()}).first()
    if not inst:
        raise HTTPException(status_code=404, detail=f"Instrument '{payload.ticker}' not found in database.")
        
    # 3. Insert Holding
    insert_sql = text("""
        INSERT INTO holdings (portfolio_id, instrument_id, quantity, average_buy_price)
        VALUES (:pid, :iid, :qty, :price)
        RETURNING id, portfolio_id, instrument_id, quantity, average_buy_price
    """)
    result = db.execute(insert_sql, {
        "pid": portfolio_id, 
        "iid": inst[0], 
        "qty": payload.quantity, 
        "price": payload.average_buy_price
    }).mappings().first()
    db.commit()
    def run_full_pipeline():
        try:
            print("🚀 Step 1: Starting market data ingestion...")
            #trigger_ingestion() 
            
            print("🧠 Step 2: Starting analytics engine...")
            update_all_instrument_metrics(portfolio_id)
            
            print("✅ Pipeline complete!")
        except Exception as e:
            print(f"❌ Background task failed: {e}")

    # --- 4. Triggering the Automation ---
    background_tasks.add_task(run_full_pipeline)
    #background_tasks.add_task(trigger_ingestion)
    return dict(result)

@router.get("/{portfolio_id}/holdings")
def get_holdings(portfolio_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Fetch all stock holdings inside a specific portfolio."""
    query = text("""
        SELECT h.id, i.ticker, i.name, h.quantity, h.average_buy_price 
        FROM holdings h
        JOIN instruments i ON h.instrument_id = i.id
        JOIN portfolios p ON h.portfolio_id = p.id
        WHERE h.portfolio_id = :pid AND p.user_id = :uid
    """)
    result = db.execute(query, {"pid": portfolio_id, "uid": user["sub"]}).mappings().fetchall()
    return [dict(row) for row in result]