import os
import requests
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_KEY")
BASE = "https://www.alphavantage.co/query"

def fetch_daily(ticker: str):
    """
    Fetches daily time series data for a given ticker from Alpha Vantage.
    """
    if not API_KEY:
        raise ValueError("ALPHA_VANTAGE_KEY is missing from your .env file!")
        
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": ticker,
        "outputsize": "compact",
        "apikey": API_KEY,
    }
    
    print(f"[{ticker}] Calling Alpha Vantage API...")
    resp = requests.get(BASE, params=params)
    resp.raise_for_status()
    
    raw_json = resp.json()
    
    # Handle API rate limit error messages safely
    if "Information" in raw_json:
        print(f"[{ticker}] Rate limit note from API: {raw_json['Information']}")
        return {}
    if "Note" in raw_json:
        print(f"[{ticker}] API Note: {raw_json['Note']}")
        return {}
        
    data = raw_json.get("Time Series (Daily)", {})
    return data