import os
from fastapi import FastAPI, HTTPException, status, Depends,Security
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes_market, routes_portfolio, routes_analytics
from app.ingestion import run_daily_ingestion
from app.analytics.save_metrics import update_all_instrument_metrics
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware

# ... (your existing app setup and CORS middleware stay the same) ...
# 1. INITIALIZE THE APP FIRST! (Must come before any @app routes)
app = FastAPI(title="Uncharted Atlas API", version="1.0.0")
# Add your live Vercel URL to this list!
origins = [
    "http://localhost:8000", # Keeps local development working
    "https://uncharted-atlas.vercel.app/", # <-- PASTE YOUR VERCEL URL HERE
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 2. Setup your security header and dependencies
api_key_header = APIKeyHeader(name="X-Ingestion-Secret", auto_error=False)

def verify_ingestion_secret(api_key: str = Security(api_key_header)):
    secret = os.getenv("INGESTION_SECRET")
    if not secret or api_key != secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Ingestion Secret")
    return api_key

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