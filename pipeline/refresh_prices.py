import json
import os
import yfinance as yf
from datetime import datetime
from api.core.db import get_db_connection

def refresh_prices():
    portfolio_path = os.path.join(os.path.dirname(__file__), "..", "data", "portfolio.json")
    with open(portfolio_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    companies = data.get("portfolio", []) + data.get("watchlist", [])
    symbols = [f"{c['symbol']}.NS" for c in companies]
    
    print(f"Refreshing prices for {len(symbols)} tickers...")
    
    conn = get_db_connection()
    try:
        tickers_data = yf.download(symbols, period="1y", interval="1d", group_by="ticker", progress=False)
        for c in companies:
            sym = c["symbol"]
            ticker_ns = f"{sym}.NS"
            try:
                hist = tickers_data[ticker_ns] if len(symbols) > 1 else tickers_data
                if not hist.empty:
                    last_row = hist.iloc[-1]
                    close_p = float(last_row["Close"])
                    print(f"  {sym}: ₹{close_p:.2f}")
                    if conn:
                        with conn.cursor() as cur:
                            cur.execute("""
                                INSERT INTO prices (symbol, date, open, high, low, close, volume)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                                ON CONFLICT (symbol, date) DO UPDATE 
                                SET close = EXCLUDED.close, volume = EXCLUDED.volume
                            """, (sym, hist.index[-1].date(), float(last_row["Open"]), float(last_row["High"]), float(last_row["Low"]), close_p, int(last_row["Volume"])))
            except Exception as e:
                print(f"  Error fetching {sym}: {e}")
        if conn:
            conn.commit()
    except Exception as ex:
        print(f"Error during batch price refresh: {ex}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    refresh_prices()

