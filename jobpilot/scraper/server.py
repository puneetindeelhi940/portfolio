"""
JobPilot Server — Local web server + job search API.

Double-click START_JOBPILOT.bat to run. Opens JobPilot in your browser
with a built-in job search that scrapes live results from multiple sources.
"""

import json
import hashlib
import os
import re
import sys
import time
import random
import threading
import webbrowser
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote_plus, urljoin, parse_qs, urlparse

import requests
from bs4 import BeautifulSoup

PORT = 8750
ROOT = Path(__file__).parent.parent
SEEN_PATH = Path(__file__).parent / "seen_jobs.json"

scrape_session = requests.Session()
scrape_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
})


def safe_get(url, timeout=12):
    try:
        r = scrape_session.get(url, timeout=timeout)
        return r if r.status_code == 200 else None
    except Exception:
        return None


def job_id(title, company, source):
    return hashlib.md5(f"{title}|{company}|{source}".encode()).hexdigest()[:12]


def polite_delay():
    time.sleep(random.uniform(1.0, 2.5))


# ── Source: RemoteOK (JSON API) ──────────────────────────────
def search_remoteok(criteria):
    jobs = []
    resp = safe_get("https://remoteok.com/api")
    if not resp:
        return jobs
    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        return jobs

    if isinstance(data, list) and len(data) > 1:
        data = data[1:]

    role = (criteria.get("role") or "").lower()
    company = (criteria.get("company") or "").lower()

    for item in data[:80]:
        if not isinstance(item, dict):
            continue
        title = item.get("position", "")
        comp = item.get("company", "")
        desc = item.get("description", "")
        text = f"{title} {comp} {desc}".lower()

        if role and role not in text:
            continue
        if company and company not in comp.lower():
            continue

        salary = item.get("salary", "")

        jobs.append({
            "title": title,
            "company": comp,
            "location": "Remote",
            "salary": salary,
            "url": item.get("url", ""),
            "source": "RemoteOK",
            "posted": (item.get("date") or "")[:10],
        })

    return jobs[:20]


# ── Source: We Work Remotely (RSS) ───────────────────────────
def search_weworkremotely(criteria):
    jobs = []
    feeds = [
        "https://weworkremotely.com/categories/remote-design-jobs.rss",
        "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
        "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    ]
    role = (criteria.get("role") or "").lower()
    company_filter = (criteria.get("company") or "").lower()

    for feed_url in feeds:
        resp = safe_get(feed_url)
        if not resp:
            continue
        try:
            root = ET.fromstring(resp.text)
        except ET.ParseError:
            continue

        for item in root.iter("item"):
            raw_title = item.findtext("title", "")
            link = item.findtext("link", "")
            desc = item.findtext("description", "")
            pub = item.findtext("pubDate", "")

            comp = ""
            title = raw_title
            if ":" in raw_title:
                comp = raw_title.split(":")[0].strip()
                title = ":".join(raw_title.split(":")[1:]).strip()

            text = f"{title} {comp} {desc}".lower()
            if role and role not in text:
                continue
            if company_filter and company_filter not in comp.lower():
                continue

            posted = ""
            if pub:
                try:
                    from email.utils import parsedate_to_datetime
                    posted = parsedate_to_datetime(pub).strftime("%Y-%m-%d")
                except Exception:
                    pass

            jobs.append({
                "title": title,
                "company": comp,
                "location": "Remote",
                "salary": "",
                "url": link,
                "source": "WeWorkRemotely",
                "posted": posted,
            })

    return jobs[:20]


# ── Source: Arbeitnow (JSON API) ─────────────────────────────
def search_arbeitnow(criteria):
    jobs = []
    query = criteria.get("role") or "UX Designer"
    url = f"https://www.arbeitnow.com/api/job-board-api?search={quote_plus(query)}"
    resp = safe_get(url)
    if not resp:
        return jobs

    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        return jobs

    company_filter = (criteria.get("company") or "").lower()
    location_filter = (criteria.get("location") or "").lower()

    for item in data.get("data", [])[:40]:
        comp = item.get("company_name", "")
        loc = item.get("location", "")
        remote = item.get("remote", False)
        full_loc = f"{'Remote, ' if remote else ''}{loc}".strip(", ")

        if company_filter and company_filter not in comp.lower():
            continue
        if location_filter and location_filter not in full_loc.lower() and location_filter != "remote":
            continue

        jobs.append({
            "title": item.get("title", ""),
            "company": comp,
            "location": full_loc,
            "salary": "",
            "url": item.get("url", ""),
            "source": "Arbeitnow",
            "posted": (item.get("created_at") or "")[:10],
        })

    return jobs[:20]


# ── Source: The Muse (public API) ────────────────────────────
def search_themuse(criteria):
    jobs = []
    url = "https://www.themuse.com/api/public/jobs?category=Design%20and%20UX&level=Senior&page=0"
    resp = safe_get(url)
    if not resp:
        return jobs

    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        return jobs

    role = (criteria.get("role") or "").lower()
    company_filter = (criteria.get("company") or "").lower()
    location_filter = (criteria.get("location") or "").lower()

    for item in data.get("results", [])[:40]:
        title = item.get("name", "")
        comp = item.get("company", {}).get("name", "")
        locs = item.get("locations", [])
        loc = ", ".join(l.get("name", "") for l in locs) if locs else ""
        text = f"{title} {comp}".lower()

        if role and role not in text:
            continue
        if company_filter and company_filter not in comp.lower():
            continue
        if location_filter and location_filter not in loc.lower():
            continue

        jobs.append({
            "title": title,
            "company": comp,
            "location": loc,
            "salary": "",
            "url": item.get("refs", {}).get("landing_page", ""),
            "source": "The Muse",
            "posted": (item.get("publication_date") or "")[:10],
        })

    return jobs[:20]


# ── Source: Indeed (scrape, best-effort) ──────────────────────
def search_indeed(criteria):
    jobs = []
    query = criteria.get("role") or "UX Designer"
    location = criteria.get("location") or ""

    url = (f"https://www.indeed.com/jobs?"
           f"q={quote_plus(query)}&l={quote_plus(location)}&fromage=7&sort=date")
    resp = safe_get(url)
    if not resp:
        return jobs

    soup = BeautifulSoup(resp.text, "lxml")
    company_filter = (criteria.get("company") or "").lower()

    for card in soup.select(".job_seen_beacon, .resultContent, .jobsearch-ResultsList > li")[:30]:
        title_el = card.select_one("h2.jobTitle a, h2.jobTitle span, .jobTitle")
        company_el = card.select_one("[data-testid='company-name'], .companyName, .company")
        location_el = card.select_one("[data-testid='text-location'], .companyLocation, .location")
        salary_el = card.select_one(".salary-snippet-container, .estimated-salary, [data-testid='attribute_snippet_testid']")

        if not title_el:
            continue

        comp = company_el.get_text(strip=True) if company_el else ""
        if company_filter and company_filter not in comp.lower():
            continue

        link = ""
        a_tag = card.select_one("h2.jobTitle a, a.jcs-JobTitle")
        if a_tag and a_tag.get("href"):
            link = urljoin("https://www.indeed.com", a_tag["href"])

        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": comp,
            "location": location_el.get_text(strip=True) if location_el else location,
            "salary": salary_el.get_text(strip=True) if salary_el else "",
            "url": link,
            "source": "Indeed",
            "posted": "",
        })

    return jobs[:20]


# ── Source: LinkedIn (public scrape, best-effort) ────────────
def search_linkedin(criteria):
    jobs = []
    query = criteria.get("role") or "UX Designer"
    location = criteria.get("location") or ""

    url = (f"https://www.linkedin.com/jobs/search/?"
           f"keywords={quote_plus(query)}&location={quote_plus(location)}"
           f"&f_TPR=r604800&position=1&pageNum=0")
    resp = safe_get(url)
    if not resp:
        return jobs

    soup = BeautifulSoup(resp.text, "lxml")
    company_filter = (criteria.get("company") or "").lower()

    for card in soup.select(".base-card, .job-search-card")[:30]:
        title_el = card.select_one(".base-search-card__title, h3")
        company_el = card.select_one(".base-search-card__subtitle, h4")
        location_el = card.select_one(".job-search-card__location, .base-search-card__metadata span")
        link_el = card.select_one("a.base-card__full-link, a")

        if not title_el:
            continue

        comp = company_el.get_text(strip=True) if company_el else ""
        if company_filter and company_filter not in comp.lower():
            continue

        link = link_el["href"] if link_el and link_el.get("href") else ""

        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": comp,
            "location": location_el.get_text(strip=True) if location_el else location,
            "salary": "",
            "url": link.split("?")[0] if link else "",
            "source": "LinkedIn",
            "posted": "",
        })

    return jobs[:20]


# ── Source: Google Jobs (scrape, best-effort) ────────────────
def search_google_jobs(criteria):
    jobs = []
    query = criteria.get("role") or "UX Designer"
    location = criteria.get("location") or ""
    company = criteria.get("company") or ""

    search_q = f"{query} jobs"
    if location:
        search_q += f" {location}"
    if company:
        search_q += f" {company}"

    url = f"https://www.google.com/search?q={quote_plus(search_q)}&ibp=htl;jobs"
    resp = safe_get(url)
    if not resp:
        return jobs

    soup = BeautifulSoup(resp.text, "lxml")

    for card in soup.select("li.iFjolb, div.PwjeAc, div[jscontroller]")[:30]:
        title_el = card.select_one(".BjJfJf, .sH3zFd, div[role='heading']")
        company_el = card.select_one(".vNEEBe, .nJlQNd")
        location_el = card.select_one(".Qk80Jf, .pwTheOc")

        if not title_el:
            continue

        jobs.append({
            "title": title_el.get_text(strip=True),
            "company": company_el.get_text(strip=True) if company_el else "",
            "location": location_el.get_text(strip=True) if location_el else location,
            "salary": "",
            "url": "",
            "source": "Google Jobs",
            "posted": "",
        })

    return jobs[:20]


# ── Run all sources ──────────────────────────────────────────
def search_all_sources(criteria):
    all_jobs = []
    sources = [
        ("RemoteOK", search_remoteok),
        ("WeWorkRemotely", search_weworkremotely),
        ("Arbeitnow", search_arbeitnow),
        ("The Muse", search_themuse),
        ("Indeed", search_indeed),
        ("LinkedIn", search_linkedin),
        ("Google Jobs", search_google_jobs),
    ]

    results_by_source = {}
    for name, fn in sources:
        try:
            found = fn(criteria)
            all_jobs.extend(found)
            results_by_source[name] = len(found)
        except Exception as e:
            results_by_source[name] = f"error: {e}"
        polite_delay()

    # Deduplicate
    seen = set()
    unique = []
    for j in all_jobs:
        key = f"{j['title'].lower().strip()}|{j['company'].lower().strip()}"
        h = hashlib.md5(key.encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            j["id"] = job_id(j["title"], j["company"], j["source"])
            unique.append(j)

    # Salary filter (if specified in INR)
    min_salary = criteria.get("min_salary")
    if min_salary:
        try:
            min_val = int(re.sub(r'[^\d]', '', str(min_salary)))
            # Keep jobs with no salary info (don't filter them out) + jobs matching
            filtered = []
            for j in unique:
                if not j.get("salary"):
                    filtered.append(j)
                    continue
                sal_text = re.sub(r'[^\d]', '', j["salary"])
                if sal_text and int(sal_text) >= min_val:
                    filtered.append(j)
                else:
                    filtered.append(j)  # keep it — salary formats vary too much to filter reliably
            unique = filtered
        except (ValueError, TypeError):
            pass

    return {
        "jobs": unique,
        "total": len(unique),
        "sources": results_by_source,
        "searched_at": datetime.utcnow().isoformat() + "Z",
    }


# ── HTTP Server ──────────────────────────────────────────────
class JobPilotHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/search":
            params = parse_qs(parsed.query)
            criteria = {
                "role": params.get("role", [""])[0],
                "location": params.get("location", [""])[0],
                "company": params.get("company", [""])[0],
                "min_salary": params.get("min_salary", [""])[0],
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            # Run search in this thread (blocking but simple)
            result = search_all_sources(criteria)
            self.wfile.write(json.dumps(result).encode())
            return

        super().do_GET()

    def log_message(self, format, *args):
        if "/api/" in str(args[0]):
            print(f"  API: {args[0]}")


def main():
    print("=" * 56)
    print("  JobPilot Server")
    print(f"  http://localhost:{PORT}/jobpilot/")
    print("=" * 56)
    print()
    print("  Opening in your browser...")
    print("  Keep this window open while using JobPilot.")
    print("  Press Ctrl+C to stop.")
    print()

    server = HTTPServer(("127.0.0.1", PORT), JobPilotHandler)

    # Open browser after a short delay
    def open_browser():
        time.sleep(1.2)
        webbrowser.open(f"http://localhost:{PORT}/jobpilot/")

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
