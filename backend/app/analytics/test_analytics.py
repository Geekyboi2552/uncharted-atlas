import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from app.analytics.risk_metrics import daily_returns, sharpe_ratio, sortino_ratio, annualized_volatility, max_drawdown
from app.analytics.correlation import get_correlation_matrix

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def run_sanity_check():
    print("--- 🔬 RUNNING ANALYTICS SANITY CHECK ---")
    
    with engine.connect() as conn:
        instruments = conn.execute(text("SELECT id, ticker, name FROM instruments")).fetchall()
    
    results = []
    for inst_id, ticker, name in instruments:
        query = text("SELECT date, close FROM daily_prices WHERE instrument_id = :id ORDER BY date ASC")
        df = pd.read_sql_query(query, engine, params={"id": inst_id})
        
        if len(df) < 5:
            continue
            
        prices = df['close']
        returns = daily_returns(prices)
        
        results.append({
            "Ticker": ticker,
            "Days": len(prices),
            "Vol (Ann)": f"{annualized_volatility(returns)*100:.2f}%",
            "Sharpe": f"{sharpe_ratio(returns):.2f}",
            "Sortino": f"{sortino_ratio(returns):.2f}",
            "Max DD": f"{max_drawdown(prices)*100:.2f}%"
        })
        
    metrics_df = pd.DataFrame(results)
    if not metrics_df.empty:
        print("\n📊 RISK METRICS SUMMARY:")
        print(metrics_df.to_string(index=False))
    else:
        print("⚠️ Not enough price data yet. Run ingestion first!")
        
    print("\n🔗 CORRELATION MATRIX (Top 5x5):")
    corr_df = get_correlation_matrix(engine)
    if not corr_df.empty:
        print(corr_df.iloc[:5, :5].round(2))

if __name__ == "__main__":
    run_sanity_check()