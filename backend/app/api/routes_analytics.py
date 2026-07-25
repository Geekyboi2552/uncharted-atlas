from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db, engine
from app.analytics.correlation import get_correlation_matrix


router = APIRouter(prefix="/analytics", tags=["Analytics Engine"])

@router.get("/portfolio/{portfolio_id}")
def get_portfolio_analytics(portfolio_id: int, db: Session = Depends(get_db)):
    """Retrieve pre-computed risk metrics (Sharpe, Sortino, Drawdown) for a portfolio."""
    query = text("""
        SELECT metric_name, value, computed_at, formula_version 
        FROM computed_metrics 
        WHERE portfolio_id = :pid
        ORDER BY computed_at DESC
    """)
    result = db.execute(query, {"pid": portfolio_id}).mappings().fetchall()
    
    if not result:
        raise HTTPException(status_code=404, detail="No computed metrics found for this portfolio ID.")
        
    return [dict(row) for row in result]

@router.get("/correlation")
def get_market_correlation():
    """Generates and returns the full daily returns correlation matrix across all instruments."""
    try:
        corr_df = get_correlation_matrix(engine)
        if corr_df.empty:
            return {"message": "Not enough price data to compute correlation matrix."}
        
        # Replace NaN values with None for clean JSON serialization
        corr_clean = corr_df.where(corr_df.notnull(), None)
        return corr_clean.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate correlation matrix: {str(e)}")