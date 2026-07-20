import os
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_market, routes_portfolio, routes_analytics
from app.ingestion import run_daily_ingestion
from app.analytics.save_metrics import update_all_instrument_metrics

# ... (your existing app setup and CORS middleware stay the same) ...

@app.post("/internal/run-ingestion", tags=["Admin & Automation"])
def trigger_ingestion(secret: str):
    """
    Protected webhook endpoint to trigger daily stock price ingestion and analytics calculation.
    """
    server_secret = os.getenv("INGESTION_SECRET")
    if not server_secret or secret != server_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid or missing INGESTION_SECRET."
        )
    
    try:
        # 1. Run stock price ingestion
        run_daily_ingestion.run()
        # 2. Run risk & Sortino/Sharpe analytics
        update_all_instrument_metrics()
        return {"status": "success", "message": "Daily ingestion and analytics completed cleanly."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")