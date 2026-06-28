"""
AI Inflation Observatory — Data Pipeline
Fetches real data from free public APIs and generates JSON data files.

Sources:
  - World Bank Open Data API (free, no key required)
  - IMF World Economic Outlook API (free, no key required)
  - FRED API (free, requires API key — set FRED_API_KEY env var)

Run: python scripts/fetch-observatory-data.py
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests

DATA_DIR = Path(__file__).parent.parent / "observatory" / "data"

WORLD_BANK_BASE = "https://api.worldbank.org/v2"
FRED_BASE = "https://api.stlouisfed.org/fred"
FRED_API_KEY = os.environ.get("FRED_API_KEY", "")

COUNTRY_CODES = [
    "US", "CN", "IN", "JP", "DE", "GB", "KR", "CA", "AU", "SG",
    "BR", "FR", "SE", "IL", "AE", "NL", "TW", "IE", "CH", "NO",
    "SA", "MX", "ID", "NG", "ZA", "PL", "MY", "KE", "AR"
]

INDICATORS = {
    "FP.CPI.TOTL.ZG": "cpi_inflation",
    "EG.USE.ELEC.KH.PC": "electricity_per_capita",
    "IT.NET.USER.ZS": "internet_users_pct",
    "EG.FEC.RNEW.ZS": "renewable_energy_pct",
    "GB.XPD.RSDV.GD.ZS": "rd_expenditure_pct",
    "NY.GDP.MKTP.CD": "gdp_usd"
}


def fetch_world_bank(indicator, countries=None):
    """Fetch latest data from World Bank API."""
    country_str = ";".join(countries) if countries else "all"
    url = f"{WORLD_BANK_BASE}/country/{country_str}/indicator/{indicator}"
    params = {
        "format": "json",
        "per_page": 300,
        "date": "2022:2025",
        "mrv": 1
    }
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        if len(data) < 2:
            return {}
        results = {}
        for entry in data[1]:
            if entry.get("value") is not None:
                code = entry["country"]["id"]
                results[code] = {
                    "value": entry["value"],
                    "year": entry["date"]
                }
        return results
    except Exception as e:
        print(f"  Warning: World Bank API error for {indicator}: {e}")
        return {}


def fetch_fred(series_id):
    """Fetch latest observation from FRED API."""
    if not FRED_API_KEY:
        return None
    url = f"{FRED_BASE}/series/observations"
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 1
    }
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        obs = data.get("observations", [])
        if obs and obs[0].get("value") != ".":
            return {"value": float(obs[0]["value"]), "date": obs[0]["date"]}
    except Exception as e:
        print(f"  Warning: FRED API error for {series_id}: {e}")
    return None


def update_countries_from_world_bank():
    """Update country data with real World Bank indicators."""
    print("Fetching World Bank data...")
    wb_data = {}
    for indicator, field in INDICATORS.items():
        print(f"  Fetching {field} ({indicator})...")
        wb_data[field] = fetch_world_bank(indicator, COUNTRY_CODES)

    countries_file = DATA_DIR / "countries.json"
    with open(countries_file, "r") as f:
        countries = json.load(f)

    updated_count = 0
    for country in countries["countries"]:
        code = country["code"]
        for field, data in wb_data.items():
            if code in data and data[code]["value"] is not None:
                val = data[code]["value"]
                if field == "cpi_inflation":
                    country["overall_cpi"] = round(val, 1)
                elif field == "renewable_energy_pct":
                    country["renewable_energy_pct"] = round(val, 0)
                updated_count += 1

    countries["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(countries_file, "w") as f:
        json.dump(countries, f, indent=2)
    print(f"  Updated {updated_count} data points across {len(countries['countries'])} countries")


def update_global_index():
    """Update the last_updated timestamp for the global index."""
    print("Updating global index timestamp...")
    index_file = DATA_DIR / "global-index.json"
    with open(index_file, "r") as f:
        data = json.load(f)
    data["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if FRED_API_KEY:
        cpi = fetch_fred("CPIAUCSL")
        if cpi:
            print(f"  US CPI (FRED): {cpi['value']} as of {cpi['date']}")

        pce = fetch_fred("PCEPI")
        if pce:
            print(f"  US PCE (FRED): {pce['value']} as of {pce['date']}")

    with open(index_file, "w") as f:
        json.dump(data, f, indent=2)
    print("  Done")


def update_last_updated():
    """Write a standalone last-updated.json for the refresh badge."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    last_updated_file = DATA_DIR / "last-updated.json"
    with open(last_updated_file, "w") as f:
        json.dump({"last_updated": ts, "pipeline": "github-actions"}, f, indent=2)
    print(f"Refresh timestamp: {ts}")


def main():
    print("=" * 60)
    print("AI Inflation Observatory — Data Pipeline")
    print("=" * 60)

    if not DATA_DIR.exists():
        print(f"Error: Data directory not found: {DATA_DIR}")
        sys.exit(1)

    update_countries_from_world_bank()
    update_global_index()
    update_last_updated()

    print("\nPipeline complete.")
    if not FRED_API_KEY:
        print("Note: FRED_API_KEY not set. Add it as a GitHub Secret for US economic data.")


if __name__ == "__main__":
    main()
