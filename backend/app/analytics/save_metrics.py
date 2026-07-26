import os
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from app.analytics.risk_metrics import daily_returns, sharpe_ratio, sortino_ratio, annualized_volatility, max_drawdown

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def update_portfolio_metrics(portfolio_id: int):
    """
    Calculates risk metrics for a specific portfolio based on its holdings
    and inserts them into computed_metrics.
    """
    print(f"\n--- 💾 CALCULATING METRICS FOR PORTFOLIO {portfolio_id} ---")
    
    with engine.connect() as conn:
        # 1. Join holdings, instruments, and prices to calculate daily portfolio value
        query = text("""
            SELECT dp.date, SUM(h.qty * dp.close) as portfolio_value
            FROM holdings h
            JOIN instruments i ON h.ticker = i.ticker
            JOIN daily_prices dp ON i.id = dp.instrument_id
            WHERE h.portfolio_id = :pid
            GROUP BY dp.date
            ORDER BY dp.date ASC
        """)
        
        df = pd.read_sql_query(query, engine, params={"pid": portfolio_id})
        
        if len(df) < 5:
            print(f"⚠️ Not enough price data to compute metrics for Portfolio {portfolio_id}.")
            return
            
        # 2. Calculate daily returns based on the total portfolio value
        returns = daily_returns(df['portfolio_value'])
        
        # 3. Map metrics to compute
        metrics_map = {
            "sharpe_ratio": sharpe_ratio(returns),
            "sortino_ratio": sortino_ratio(returns),
            "annualized_volatility": annualized_volatility(returns),
            "max_drawdown": max_drawdown(df['portfolio_value'])
        }
        
        # 4. Clean up old metrics for this portfolio so we don't get duplicates
        conn.execute(text("DELETE FROM computed_metrics WHERE portfolio_id = :pid"), {"pid": portfolio_id})
        
        total_inserted = 0
        for m_name, m_val in metrics_map.items():
            if pd.isna(m_val):
                continue
                
            # 5. Insert calculated metric with the ACTUAL portfolio_id (and instrument_id = NULL)
            insert_sql = text("""
                INSERT INTO computed_metrics 
                    (portfolio_id, instrument_id, metric_name, value, computed_at, formula_version)
                VALUES 
                    (:pid, NULL, :name, :val, :now, 'v1');
            """)
            
            conn.execute(insert_sql, {
                "pid": portfolio_id,
                "name": m_name,
                "val": float(m_val),
                "now": datetime.now(timezone.utc)
            })
            total_inserted += 1
            
        conn.commit()
        print(f"✅ Successfully inserted {total_inserted} metric records for Portfolio {portfolio_id}!")