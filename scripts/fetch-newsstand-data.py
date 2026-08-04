#!/usr/bin/env python3
"""
Fetch data for the "Viral vs Verified" newsstand
(builders-universe · Darker Patterns galaxy).

LEFT  column  ("Popular news")  — viral claims that spread widely and were
                                   DEBUNKED. Pulled straight from fact-checker
                                   feeds, so every item is a real, documented
                                   piece of misinformation. Nothing is invented.
RIGHT column  ("Reliable news") — top headlines from high-trust newsrooms.

Run on an 8-hour GitHub Action cron. Writes assets/data/newsstand.json.
If the network fails for a source we simply skip it; if EVERYTHING fails we
keep the previous JSON untouched so the page never goes blank.
"""

import json
import os
import re
import sys
import html
from datetime import datetime, timezone

import feedparser

OUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets", "data", "newsstand.json"
)

WANT_PER_COLUMN = 17
UA = "Mozilla/5.0 (compatible; PuneetNewsstand/1.0; +https://puneetindeelhi940.github.io/portfolio)"

# ── Sources ────────────────────────────────────────────────────────────────
# Fact-checker / debunk feeds. Everything published here is misinformation that
# went viral and was checked FALSE / misleading. Ordered by how reliably each
# feed maps to "viral hoax". Feeds that 403 from one IP often work from another,
# so we keep several and gracefully skip the ones that fail.
DEBUNK_SOURCES = [
    ("Lead Stories",    "https://leadstories.com/atom.xml"),
    ("Snopes",          "https://www.snopes.com/feed/"),
    ("FactCheck.org",   "https://www.factcheck.org/feed/"),
    ("Check Your Fact", "https://checkyourfact.com/feed/"),
    ("Science Feedback","https://science.feedback.org/feed/"),
    ("PolitiFact",      "https://www.politifact.com/rss/all/"),
    ("AFP Fact Check",  "https://factcheck.afp.com/rss.xml"),
    ("Alt News",        "https://www.altnews.in/feed/"),
    ("Full Fact",       "https://fullfact.org/feed/all/"),
    ("USA TODAY",       "https://www.usatoday.com/news/factcheck/rss/"),
]

# High-trust newsrooms for the right column.
RELIABLE_SOURCES = [
    ("Reuters",     "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best"),
    ("BBC News",    "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("NPR",         "https://feeds.npr.org/1001/rss.xml"),
    ("PBS NewsHour","https://www.pbs.org/newshour/feeds/rss/headlines"),
    ("AP News",     "https://apnews.com/index.rss"),
    ("The Guardian","https://www.theguardian.com/world/rss"),
    ("Deutsche Welle","https://rss.dw.com/rdf/rss-en-all"),
]

# ── Helpers ──────────────────────────────────────────────────────────────────
PREFIXES = re.compile(
    r"^\s*(fact[\s\-]?check|fact[\s\-]?checking|verify|debunk(?:ed|ing)?|"
    r"claim|viral|no|false|misleading|hoax|rumou?r|posts?|video|image|photo)\b"
    r"[\s:,\-–—]*", re.I)

TOPIC_MAP = [
    ("Health",    r"\b(vaccine|covid|virus|cancer|health|medic|drug|hospital|disease|fluoride|autism|wellness|remed)\b"),
    ("Science",   r"\b(nasa|space|climate|scien|solar|earth|asteroid|energy|weather|physics|study)\b"),
    ("Politics",  r"\b(trump|biden|congress|senate|election|vote|president|governor|democrat|republican|parliament|minister|modi)\b"),
    ("World",     r"\b(ukrain|russia|israel|gaza|china|migrant|war|border|un\b|nato|iran|refugee)\b"),
    ("Money",     r"\b(bank|dollar|econom|stock|crypto|bitcoin|tax|inflation|price|fed|market|walmart|amazon)\b"),
    ("Tech / AI", r"\b(\bai\b|artificial intelligence|deepfake|chatgpt|elon|musk|tesla|meta|google|iphone|robot|5g)\b"),
    ("Celebrity", r"\b(taylor|swift|celebrity|actor|singer|hollywood|died|death of|star|kardashian|royal|prince)\b"),
]

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = html.unescape(s)
    s = re.sub(r"<[^>]+>", "", s)          # strip stray HTML
    s = re.sub(r"\s+", " ", s).strip()
    s = s.strip('“”"\'')
    return s

def strip_prefix(title: str) -> str:
    """Drop leading 'Fact Check:' / 'VERIFY:' style prefixes so the row reads
    like the claim that was circulating, not the checker's house style."""
    prev = None
    out = title
    # apply repeatedly for stacked prefixes like "Fact Check: No, ..."
    while out != prev:
        prev = out
        out = PREFIXES.sub("", out).strip(" :,-–—")
    return out or title

def classify(text: str) -> str:
    low = text.lower()
    for label, pat in TOPIC_MAP:
        if re.search(pat, low):
            return label
    return "Trending"

def verdict_for(title: str) -> str:
    low = title.lower()
    if re.search(r"\b(satir)\b", low):
        return "SATIRE"
    if re.search(r"\b(mislead|missing context|partly|out of context|altered|edited|doctored)\b", low):
        return "MISLEADING"
    if re.search(r"\b(unproven|no evidence|unsupported)\b", low):
        return "UNPROVEN"
    return "FALSE"

def entry_time(e):
    for k in ("published_parsed", "updated_parsed"):
        t = getattr(e, k, None) or (e.get(k) if isinstance(e, dict) else None)
        if t:
            try:
                return datetime(*t[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return None

def fetch(url):
    return feedparser.parse(url, agent=UA, request_headers={"User-Agent": UA})

def pull(sources, want, kind):
    """Round-robin across sources so no single outlet dominates a column."""
    buckets = []
    for name, url in sources:
        try:
            feed = fetch(url)
            items = []
            for e in feed.entries[:25]:
                title = clean_text(getattr(e, "title", ""))
                link = getattr(e, "link", "") or ""
                if not title or len(title) < 12 or not link.startswith("http"):
                    continue
                if not re.search(r"[A-Za-z]", title):   # skip non-Latin-script items
                    continue
                items.append((name, title, link, entry_time(e)))
            if items:
                buckets.append(items)
                print(f"  [{kind}] {name}: {len(items)} items", file=sys.stderr)
            else:
                print(f"  [{kind}] {name}: no usable items", file=sys.stderr)
        except Exception as ex:
            print(f"  [{kind}] {name}: FAILED ({type(ex).__name__})", file=sys.stderr)

    out, seen = [], set()
    idx = 0
    while len(out) < want and buckets:
        progressed = False
        for b in buckets:
            if idx < len(b):
                progressed = True
                name, title, link, when = b[idx]
                key = re.sub(r"[^a-z0-9]", "", title.lower())[:60]
                if key in seen:
                    continue
                seen.add(key)
                out.append((name, title, link, when))
                if len(out) >= want:
                    break
        if not progressed:
            break
        idx += 1
    return out

def build():
    now = datetime.now(timezone.utc)

    popular = []
    for i, (src, title, link, when) in enumerate(pull(DEBUNK_SOURCES, WANT_PER_COLUMN, "fake"), 1):
        claim = strip_prefix(title)
        popular.append({
            "n": i,
            "claim": claim,
            "verdict": verdict_for(title),
            "source": src,
            "url": link,
            "topic": classify(claim),
        })

    reliable = []
    for i, (src, title, link, when) in enumerate(pull(RELIABLE_SOURCES, WANT_PER_COLUMN, "real"), 1):
        reliable.append({
            "n": i,
            "headline": title,
            "source": src,
            "url": link,
            "topic": classify(title),
            "published": when.isoformat() if when else None,
        })

    return popular, reliable, now

def main():
    popular, reliable, now = build()

    if len(popular) < 5 or len(reliable) < 5:
        # Not enough fresh data — keep the last good file rather than blanking.
        print(f"Too few items (fake={len(popular)}, real={len(reliable)}); "
              f"keeping previous data.", file=sys.stderr)
        if os.path.exists(OUT_PATH):
            sys.exit(0)
        # first-ever run with no fallback: still write what we have

    payload = {
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "refresh_hours": 8,
        "counts": {"popular": len(popular), "reliable": len(reliable)},
        "popular": popular,
        "reliable": reliable,
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Wrote {OUT_PATH}: {len(popular)} viral/false, {len(reliable)} reliable.")

if __name__ == "__main__":
    main()
