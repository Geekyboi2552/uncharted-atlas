from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/instruments")
def get_instruments(db: Session = Depends(get_db)):
    """Fetch all tracked stock instruments from the universe."""
    # Removed 'asset_class' and 'sector' to match your exact Supabase table schema
    query = text("SELECT id, ticker, name FROM instruments ORDER BY ticker ASC")
    result = db.execute(query).mappings().fetchall()
    return [dict(row) for row in result]

@router.get("/prices/{ticker}")
def get_prices(ticker: str, limit: int = 252, db: Session = Depends(get_db)):
    """Fetch recent historical daily closing prices for a specific ticker."""
    query = text("""
        SELECT dp.date, dp.open, dp.high, dp.low, dp.close, dp.volume 
        FROM daily_prices dp
        JOIN instruments i ON dp.instrument_id = i.id
        WHERE i.ticker = :ticker
        ORDER BY dp.date DESC
        LIMIT :limit
    """)
    result = db.execute(query, {"ticker": ticker.upper(), "limit": limit}).mappings().fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail=f"No price history found for ticker '{ticker}'")
        
    return [dict(row) for row in result]