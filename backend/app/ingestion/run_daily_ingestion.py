from app.analytics.save_metrics import update_all_instrument_metrics
import os
import time
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app.ingestion.alpha_vantage_client import fetch_daily

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from your .env file!")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

def run():
    print("Starting Daily Ingestion Job...")
    
    with engine.connect() as conn:
        # 1. Fetch our instruments from the database
        # Note: We limit to 5 per run initially to strictly respect Alpha Vantage's free tier!
        instruments = conn.execute(
            text("SELECT id, ticker FROM instruments ORDER BY id LIMIT 5")
        ).fetchall()
        
        print(f"Found {len(instruments)} instruments to process today.")
        
        for inst_id, ticker in instruments:
            try:
                # 2. Fetch price data from Alpha Vantage
                daily_data = fetch_daily(ticker)
                
                if not daily_data:
                    print(f"[{ticker}] No price data returned. Skipping...")
                    continue
                
                rows_inserted = 0
                
                # 3. Loop through the returned dates and prepare SQL insert
                for date_str, values in daily_data.items():
                    # Parse the string date into a Python date object
                    price_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                    
                    # Prepare our upsert query (insert or update if date already exists)
                    upsert_query = text("""
                        INSERT INTO daily_prices 
                            (instrument_id, date, open, high, low, close, volume)
                        VALUES 
                            (:inst_id, :date, :open, :high, :low, :close, :volume)
                        ON CONFLICT (instrument_id, date) 
                        DO UPDATE SET
                            open = EXCLUDED.open,
                            high = EXCLUDED.high,
                            low = EXCLUDED.low,
                            close = EXCLUDED.close,
                            volume = EXCLUDED.volume;
                    """)
                    
                    conn.execute(upsert_query, {
                        "inst_id": inst_id,
                        "date": price_date,
                        "open": float(values["1. open"]),
                        "high": float(values["2. high"]),
                        "low": float(values["3. low"]),
                        "close": float(values["4. close"]),
                        "volume": int(values["5. volume"]),
                    })
                    rows_inserted += 1
                
                # Commit all inserted dates for this stock
                conn.commit()
                print(f"[{ticker}] Successfully upserted {rows_inserted} days of price data!")
                
            except Exception as e:
                print(f"[{ticker}] Error processing: {e}")
                
            # 4. Sleep for 15 seconds between API requests to respect rate limits
            print("Sleeping for 15 seconds to respect Alpha Vantage API limits...\n")
            time.sleep(15)
        update_all_instrument_metrics()
    print("Daily ingestion and analytics pipeline complete!")

if __name__ == "__main__":
    run()