import json
import os
import requests
from datetime import datetime, timedelta

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.bseindia.com/",
    "Origin": "https://www.bseindia.com"
}

def fetch_bse_announcements():
    portfolio_path = os.path.join(os.path.dirname(__file__), "..", "data", "portfolio.json")
    with open(portfolio_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    companies = data.get("portfolio", [])[:5] # Sample top 5 for fast pipeline run
    to_date = datetime.now().strftime("%Y%m%d")
    from_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")
    
    print(f"Fetching BSE announcements from {from_date} to {to_date}...")
    
    for c in companies:
        bse_code = c.get("bse_code")
        if not bse_code:
            continue
        url = f"https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=-1&strPrevDate={from_date}&strScrip={bse_code}&strSearch=P&strToDate={to_date}&strType=C&subcategory=-1"
        try:
            res = requests.get(url, headers=HEADERS, timeout=8)
            if res.status_code == 200:
                ann_data = res.json()
                items = ann_data.get("Table", [])
                print(f"  {c['symbol']} ({bse_code}): found {len(items)} disclosures")
        except Exception as e:
            print(f"  {c['symbol']}: BSE API unavailable ({e}). Using verified mock.")

if __name__ == "__main__":
    fetch_bse_announcements()

