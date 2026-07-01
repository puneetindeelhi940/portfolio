"""
JobPilot Scraper — Fetches jobs from multiple free sources.

Sources:
  1. RemoteOK       — public JSON API (remote jobs)
  2. We Work Remotely — RSS feeds
  3. Arbeitnow       — public JSON API
  4. The Muse        — public API (company pages)
  5. Indeed          — web scrape (best-effort, may get blocked)
  6. LinkedIn        — public job search scrape (best-effort)
  7. Google Jobs     — web scrape via Google search
  8. Company career pages — configurable list

Edit config.json to change keywords, locations, and target companies.
Run:  python jobpilot_scraper.py
Output: ../jobs_feed.json  (auto-loaded by JobPilot on next open)
"""

import json
import os
import sys
import time
import random
import hashlib
import re
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote_plus, urljoin

import xml.etree.ElementTree as ET

import requests
from bs4 import BeautifulSoup

SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config.json"
OUTPUT_PATH = SCRIPT_DIR.parent / "jobs_feed.json"
SEEN_PATH = SCRIPT_DIR / "seen_jobs.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

session = requests.Session()
session.headers.update(HEADERS)


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def load_seen():
    if SEEN_PATH.exists():
        with open(SEEN_PATH, "r") as f:
            return json.load(f)
    return []


def save_seen(seen):
    with open(SEEN_PATH, "w") as f:
        json.dump(seen, f)


def job_hash(title, company):
    raw = f"{title.lower().strip()}|{company.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()


def matches_keywords(text, keywords, exclude):
    text_lower = text.lower()
    if any(ex.lower() in text_lower for ex in exclude):
        return False
    return any(kw.lower() in text_lower for kw in keywords)


def safe_request(url, timeout=15, retries=2):
    for attempt in range(retries):
        try:
            resp = session.get(url, timeout=timeout)
            if resp.status_code == 200:
                return resp
            if resp.status_code == 429:
                time.sleep(3 + random.uniform(1, 3))
                continue
        except requests.RequestException:
            if attempt < retries - 1:
                time.sleep(2)
    return None


def polite_delay():
    time.sleep(random.uniform(1.5, 3.5))


# ═══════════════════════════════════════════════════════════════
# Source 1: RemoteOK (JSON API — very reliable)
# ═══════════════════════════════════════════════════════════════
def fetch_remoteok(config):
    print("  [RemoteOK] Fetching...")
    jobs = []
    url = "https://remoteok.com/api"
    resp = safe_request(url)
    if not resp:
        print("  [RemoteOK] Failed to fetch")
        return jobs

    try:
        data = resp.json()
    except (json.JSONDecodeError, ValueError):
        print("  [RemoteOK] Invalid response")
        return jobs

    if isinstance(data, list) and len(data) > 1:
        data = data[1:]  # first item is metadata

    cutoff = datetime.utcnow() - timedelta(days=config.get("days_fresh", 7))

    for item in data[:config.get("max_results_per_source", 50)]:
        if not isinstance(item, dict):
            continue
        title = item.get("position", "")
        company = item.get("company", "")
        text = f"{title} {company} {item.get('description', '')}"

        if not matches_keywords(text, config["keywords"], config.get("exclude_keywords", [])):
            continue

        date_str = item.get("date", "")
        try:
            posted = datetime.strptime(date_str[:19], "%Y-%m-%dT%H:%M:%S")
            if posted < cutoff:
                continue
        except (ValueError, TypeError):
            pass

        jobs.append({
            "title": title,
            "company": company,
            "location": "Remote",
            "url": item.get("url", ""),
            "salary": item.get("salary", ""),
            "source": "RemoteOK",
            "posted": date_str[:10] if date_str else "",
        })

    print(f"  [RemoteOK] Found {len(jobs)} matching jobs")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 2: We Work Remotely (RSS — reliable)
# ═══════════════════════════════════════════════════════════════
def parse_rss(xml_text):
    items = []
    try:
        root = ET.fromstring(xml_text)
        for item in root.iter("item"):
            title = item.findtext("title", "")
            link = item.findtext("link", "")
            desc = item.findtext("description", "")
            pub = item.findtext("pubDate", "")
            items.append({"title": title, "link": link, "description": desc, "pubDate": pub})
    except ET.ParseError:
        pass
    return items


def fetch_weworkremotely(config):
    print("  [WeWorkRemotely] Fetching...")
    jobs = []
    feeds = [
        "https://weworkremotely.com/categories/remote-design-jobs.rss",
        "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    ]

    for feed_url in feeds:
        resp = safe_request(feed_url)
        if not resp:
            continue

        entries = parse_rss(resp.text)

        for entry in entries[:config.get("max_results_per_source", 50)]:
            title = entry["title"]
            text = f"{title} {entry['description']}"

            if not matches_keywords(text, config["keywords"], config.get("exclude_keywords", [])):
                continue

            company = ""
            if ":" in title:
                company = title.split(":")[0].strip()
                title = ":".join(title.split(":")[1:]).strip()

            posted = ""
            if entry["pubDate"]:
                try:
                    from email.utils import parsedate_to_datetime
                    posted_dt = parsedate_to_datetime(entry["pubDate"])
                    posted = posted_dt.strftime("%Y-%m-%d")
                except Exception:
                    pass

            jobs.append({
                "title": title,
                "company": company,
                "location": "Remote",
                "url": entry["link"],
                "salary": "",
                "source": "WeWorkRemotely",
                "posted": posted,
            })

    print(f"  [WeWorkRemotely] Found {len(jobs)} matching jobs")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 3: Arbeitnow (JSON API — reliable)
# ═══════════════════════════════════════════════════════════════
def fetch_arbeitnow(config):
    print("  [Arbeitnow] Fetching...")
    jobs = []

    for kw in config["keywords"][:3]:
        url = f"https://www.arbeitnow.com/api/job-board-api?search={quote_plus(kw)}"
        resp = safe_request(url)
        if not resp:
            continue

        try:
            data = resp.json()
        except (json.JSONDecodeError, ValueError):
            continue

        for item in data.get("data", [])[:config.get("max_results_per_source", 50)]:
            title = item.get("title", "")
            company = item.get("company_name", "")
            location = item.get("location", "")
            remote = item.get("remote", False)

            jobs.append({
                "title": title,
                "company": company,
                "location": f"{'Remote, ' if remote else ''}{location}".strip(", "),
                "url": item.get("url", ""),
                "salary": "",
                "source": "Arbeitnow",
                "posted": item.get("created_at", "")[:10],
            })

        polite_delay()

    print(f"  [Arbeitnow] Found {len(jobs)} matching jobs")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 4: The Muse (public API — reliable)
# ═══════════════════════════════════════════════════════════════
def fetch_themuse(config):
    print("  [The Muse] Fetching...")
    jobs = []

    for kw in config["keywords"][:3]:
        url = f"https://www.themuse.com/api/public/jobs?category=Design%20and%20UX&level=Senior&page=0"
        resp = safe_request(url)
        if not resp:
            continue

        try:
            data = resp.json()
        except (json.JSONDecodeError, ValueError):
            continue

        for item in data.get("results", [])[:config.get("max_results_per_source", 50)]:
            title = item.get("name", "")
            company = item.get("company", {}).get("name", "")
            locations = item.get("locations", [])
            location = ", ".join(loc.get("name", "") for loc in locations) if locations else ""
            text = f"{title} {company} {item.get('contents', '')}"

            if not matches_keywords(text, config["keywords"], config.get("exclude_keywords", [])):
                continue

            pub_date = item.get("publication_date", "")

            jobs.append({
                "title": title,
                "company": company,
                "location": location,
                "url": item.get("refs", {}).get("landing_page", ""),
                "salary": "",
                "source": "The Muse",
                "posted": pub_date[:10] if pub_date else "",
            })

        polite_delay()

    print(f"  [The Muse] Found {len(jobs)} matching jobs")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 5: Indeed (web scrape — best effort, may get blocked)
# ═══════════════════════════════════════════════════════════════
def fetch_indeed(config):
    print("  [Indeed] Fetching (best-effort)...")
    jobs = []

    for kw in config["keywords"][:3]:
        for loc in config["locations"][:2]:
            url = (f"https://www.indeed.com/jobs?"
                   f"q={quote_plus(kw)}&l={quote_plus(loc)}&fromage={config.get('days_fresh', 7)}&sort=date")
            resp = safe_request(url)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            for card in soup.select(".job_seen_beacon, .resultContent, .jobsearch-ResultsList > li"):
                title_el = card.select_one("h2.jobTitle a, h2.jobTitle span, .jobTitle")
                company_el = card.select_one("[data-testid='company-name'], .companyName, .company")
                location_el = card.select_one("[data-testid='text-location'], .companyLocation, .location")

                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True) if company_el else ""
                location = location_el.get_text(strip=True) if location_el else loc

                link = ""
                a_tag = card.select_one("h2.jobTitle a, a.jcs-JobTitle")
                if a_tag and a_tag.get("href"):
                    link = urljoin("https://www.indeed.com", a_tag["href"])

                jobs.append({
                    "title": title,
                    "company": company,
                    "location": location,
                    "url": link,
                    "salary": "",
                    "source": "Indeed",
                    "posted": "",
                })

            polite_delay()

    print(f"  [Indeed] Found {len(jobs)} jobs (may be 0 if blocked)")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 6: LinkedIn (public search — best effort)
# ═══════════════════════════════════════════════════════════════
def fetch_linkedin(config):
    print("  [LinkedIn] Fetching (best-effort)...")
    jobs = []

    for kw in config["keywords"][:3]:
        for loc in config["locations"][:2]:
            url = (f"https://www.linkedin.com/jobs/search/?"
                   f"keywords={quote_plus(kw)}&location={quote_plus(loc)}"
                   f"&f_TPR=r604800&position=1&pageNum=0")  # past week

            resp = safe_request(url)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            for card in soup.select(".base-card, .job-search-card"):
                title_el = card.select_one(".base-search-card__title, h3")
                company_el = card.select_one(".base-search-card__subtitle, h4")
                location_el = card.select_one(".job-search-card__location, .base-search-card__metadata span")
                link_el = card.select_one("a.base-card__full-link, a")

                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True) if company_el else ""
                location = location_el.get_text(strip=True) if location_el else loc

                link = link_el["href"] if link_el and link_el.get("href") else ""

                jobs.append({
                    "title": title,
                    "company": company,
                    "location": location,
                    "url": link.split("?")[0] if link else "",
                    "salary": "",
                    "source": "LinkedIn",
                    "posted": "",
                })

            polite_delay()

    print(f"  [LinkedIn] Found {len(jobs)} jobs (may be 0 if blocked)")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 7: Google Jobs (via Google search scraping)
# ═══════════════════════════════════════════════════════════════
def fetch_google_jobs(config):
    print("  [Google Jobs] Fetching (best-effort)...")
    jobs = []

    for kw in config["keywords"][:3]:
        for loc in config["locations"][:2]:
            query = f"{kw} jobs {loc}"
            url = f"https://www.google.com/search?q={quote_plus(query)}&ibp=htl;jobs"
            resp = safe_request(url)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            for card in soup.select("li.iFjolb, div.PwjeAc, div[data-ved]"):
                title_el = card.select_one(".BjJfJf, .sH3zFd, div[role='heading']")
                company_el = card.select_one(".vNEEBe, .nJlQNd")
                location_el = card.select_one(".Qk80Jf, .pwTheOc")

                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True) if company_el else ""
                location_txt = location_el.get_text(strip=True) if location_el else loc

                jobs.append({
                    "title": title,
                    "company": company,
                    "location": location_txt,
                    "url": "",
                    "salary": "",
                    "source": "Google Jobs",
                    "posted": "",
                })

            polite_delay()

    print(f"  [Google Jobs] Found {len(jobs)} jobs (may be 0 if blocked)")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Source 8: Company Career Pages (configurable)
# ═══════════════════════════════════════════════════════════════

CAREER_PAGES = {
    "Google": "https://www.google.com/about/careers/applications/jobs/results/?q=UX%20Designer&target_level=SENIOR",
    "Meta": "https://www.metacareers.com/jobs?q=UX%20Designer&is_leadership=0",
    "Apple": "https://jobs.apple.com/en-us/search?search=UX+Designer&sort=newest",
    "Microsoft": "https://careers.microsoft.com/v2/global/en/search?q=UX%20Designer&lc=United%20States&p=Design&exp=Experienced&l=en_us",
    "Amazon": "https://www.amazon.jobs/en/search?base_query=UX+Designer&category%5B%5D=design",
    "Figma": "https://www.figma.com/careers/#job-openings",
    "Spotify": "https://www.lifeatspotify.com/jobs?query=design",
    "Airbnb": "https://careers.airbnb.com/positions/?department=design",
    "Notion": "https://www.notion.so/careers",
    "Stripe": "https://stripe.com/jobs/search?query=design",
    "Netflix": "https://jobs.netflix.com/search?q=design",
    "Salesforce": "https://careers.salesforce.com/en/jobs/?search=UX+Designer&country=United+States",
    "Adobe": "https://careers.adobe.com/us/en/search-results?keywords=UX%20Designer",
    "IBM": "https://www.ibm.com/careers/search?query=UX+Designer",
    "Dell": "https://jobs.dell.com/search-jobs/UX%20Designer",
    "Uber": "https://www.uber.com/us/en/careers/list/?query=UX%20Designer&department=Design",
    "Dropbox": "https://jobs.dropbox.com/all-jobs?query=design",
    "Pinterest": "https://www.pinterestcareers.com/jobs/?search=design",
    "Snap": "https://careers.snap.com/jobs?type=regular&role=Design",
}


def fetch_company_pages(config):
    print("  [Company Pages] Fetching...")
    jobs = []
    target_companies = config.get("companies", [])

    for company in target_companies:
        url = CAREER_PAGES.get(company)
        if not url:
            continue

        resp = safe_request(url, timeout=20)
        if not resp:
            print(f"    [{company}] Could not reach career page")
            continue

        soup = BeautifulSoup(resp.text, "lxml")
        text = soup.get_text(" ", strip=True).lower()

        design_mentions = 0
        for kw in config["keywords"]:
            if kw.lower() in text:
                design_mentions += 1

        if design_mentions > 0:
            job_links = []
            for a in soup.find_all("a", href=True):
                link_text = a.get_text(strip=True)
                href = a["href"]
                if any(kw.lower() in link_text.lower() for kw in config["keywords"]):
                    full_url = urljoin(url, href)
                    job_links.append((link_text, full_url))

            for title, link in job_links[:10]:
                if any(ex.lower() in title.lower() for ex in config.get("exclude_keywords", [])):
                    continue
                jobs.append({
                    "title": title,
                    "company": company,
                    "location": "",
                    "url": link,
                    "salary": "",
                    "source": f"{company} Careers",
                    "posted": "",
                })

        print(f"    [{company}] Found {len([j for j in jobs if j['company'] == company])} job links")
        polite_delay()

    print(f"  [Company Pages] Total: {len(jobs)} jobs")
    return jobs


# ═══════════════════════════════════════════════════════════════
# Main: Run all sources, deduplicate, output
# ═══════════════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("  JobPilot Scraper")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    config = load_config()
    print(f"Keywords: {', '.join(config['keywords'][:5])}...")
    print(f"Locations: {', '.join(config['locations'])}")
    print(f"Companies: {len(config.get('companies', []))} targets")
    print(f"Fresh within: {config.get('days_fresh', 7)} days")
    print()

    all_jobs = []
    sources = [
        ("RemoteOK", fetch_remoteok),
        ("WeWorkRemotely", fetch_weworkremotely),
        ("Arbeitnow", fetch_arbeitnow),
        ("The Muse", fetch_themuse),
        ("Indeed", fetch_indeed),
        ("LinkedIn", fetch_linkedin),
        ("Google Jobs", fetch_google_jobs),
        ("Company Pages", fetch_company_pages),
    ]

    for name, fetcher in sources:
        try:
            results = fetcher(config)
            all_jobs.extend(results)
        except Exception as e:
            print(f"  [{name}] Error: {e}")
        print()

    # Deduplicate
    seen_hashes = set()
    unique_jobs = []
    for job in all_jobs:
        h = job_hash(job["title"], job["company"])
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique_jobs.append(job)

    # Filter out previously seen jobs
    prev_seen = load_seen()
    new_jobs = [j for j in unique_jobs if job_hash(j["title"], j["company"]) not in prev_seen]

    # Convert to JobPilot import format
    jobpilot_jobs = []
    for j in new_jobs:
        jid = hashlib.md5(f"{j['title']}|{j['company']}|{j['source']}".encode()).hexdigest()[:12]
        jobpilot_jobs.append({
            "id": jid,
            "title": j["title"],
            "company": j["company"],
            "location": j["location"],
            "salary": j.get("salary", ""),
            "status": "new",
            "url": j["url"],
            "notes": f"Source: {j['source']}" + (f" | Posted: {j['posted']}" if j.get("posted") else ""),
            "type": "full-time",
            "priority": "medium",
            "addedAt": datetime.utcnow().isoformat() + "Z",
            "statusHistory": [],
        })

    # Save output
    output = {
        "jobs": jobpilot_jobs,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "sources_checked": len(sources),
        "total_found": len(all_jobs),
        "unique_found": len(unique_jobs),
        "new_jobs": len(new_jobs),
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    # Update seen list
    new_seen = prev_seen + [job_hash(j["title"], j["company"]) for j in new_jobs]
    save_seen(new_seen[-5000:])  # keep last 5000 to avoid growing forever

    print("=" * 60)
    print(f"  DONE!")
    print(f"  Total found across all sources: {len(all_jobs)}")
    print(f"  After deduplication:            {len(unique_jobs)}")
    print(f"  New (not seen before):          {len(new_jobs)}")
    print(f"  Output: {OUTPUT_PATH}")
    print("=" * 60)
    print()

    if len(new_jobs) == 0:
        print("No new jobs found. Try adjusting keywords in config.json.")
    else:
        print(f"{len(new_jobs)} new jobs ready! Open JobPilot in your browser to see them.")

    input("\nPress Enter to close...")


if __name__ == "__main__":
    main()
