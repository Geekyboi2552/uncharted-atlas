import os
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from app.analytics.risk_metrics import daily_returns, sharpe_ratio, sortino_ratio, annualized_volatility, max_drawdown

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def update_all_instrument_metrics():
    """
    Calculates risk metrics for all tracked instruments and inserts them into computed_metrics.
    """
    print("\n--- 💾 CALCULATING & SAVING METRICS TO DATABASE ---")
    
    with engine.connect() as conn:
        instruments = conn.execute(text("SELECT id, ticker FROM instruments")).fetchall()
        
        total_inserted = 0
        for inst_id, ticker in instruments:
            query = text("SELECT close FROM daily_prices WHERE instrument_id = :id ORDER BY date ASC")
            df = pd.read_sql_query(query, engine, params={"id": inst_id})
            
            if len(df) < 5:
                continue
                
            returns = daily_returns(df['close'])
            
            # Map metrics to compute
            metrics_map = {
                "sharpe_ratio": sharpe_ratio(returns),
                "sortino_ratio": sortino_ratio(returns),
                "annualized_volatility": annualized_volatility(returns),
                "max_drawdown": max_drawdown(df['close'])
            }
            
            for m_name, m_val in metrics_map.items():
                if pd.isna(m_val):
                    continue
                    
                # Insert calculated metric into computed_metrics table
                insert_sql = text("""
                    INSERT INTO computed_metrics 
                        (portfolio_id, instrument_id, metric_name, value, computed_at, formula_version)
                    VALUES 
                        (NULL, :inst_id, :name, :val, :now, 'v1');
                """)
                
                conn.execute(insert_sql, {
                    "inst_id": inst_id,
                    "name": m_name,
                    "val": float(m_val),
                    "now": datetime.now(timezone.utc)
                })
                total_inserted += 1
                
        conn.commit()
        print(f"✅ Successfully inserted {total_inserted} new metric records into Supabase!")

if __name__ == "__main__":
    update_all_instrument_metrics()