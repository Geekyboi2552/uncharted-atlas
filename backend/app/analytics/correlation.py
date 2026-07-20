import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def get_correlation_matrix(engine = None) -> pd.DataFrame:
    """
    Pulls closing prices for all instruments and returns a daily return correlation matrix.
    """
    if engine is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL is missing!")
        engine = create_engine(DATABASE_URL)
        
    query = """
        SELECT i.ticker, dp.date, dp.close 
        FROM daily_prices dp
        JOIN instruments i ON dp.instrument_id = i.id
        ORDER BY dp.date ASC;
    """
    
    # Read directly from Postgres into a Pandas DataFrame
    df = pd.read_sql_query(query, engine)
    
    if df.empty:
        return pd.DataFrame()
        
    # Pivot table: Dates as index, Tickers as columns, Close prices as values
    price_matrix = df.pivot(index='date', columns='ticker', values='close')
    
    # Calculate daily returns and drop missing values
    returns_matrix = price_matrix.pct_change().dropna(how='all')
    
    # Generate correlation matrix (-1.0 to 1.0)
    return returns_matrix.corr()