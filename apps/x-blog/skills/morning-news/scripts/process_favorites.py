#!/usr/bin/env python3
"""
Process favorited articles: crawl external links + translate/summarize with Hermes.

Step 1: Crawl (status=pending_crawl)
  - Use Tavily extract to fetch source_url content
  - Store in full_content, update status to pending_translation

Step 2: Translate (status=pending_translation)
  - Combine tweet content + full_content
  - Call Hermes for Chinese translation + summary
  - Update translated_content, translated_summary, status to completed

Usage: python3 process_favorites.py [--dry-run]
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

BLOG_API = os.environ.get("BLOG_API", "https://heitu.wang")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
HERMES_BIN = os.environ.get("HERMES_BIN", "/root/.local/bin/hermes")


def get_articles_by_status(status):
    """Fetch articles with given status."""
    try:
        url = f"{BLOG_API}/api/articles"
        req = urllib.request.Request(url, headers={"User-Agent": "ProcessBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        return [a for a in data.get("data", []) if a.get("status") == status]
    except Exception as e:
        print(f"[ERROR] fetch articles: {e}")
        return []


def update_article(article_id, updates):
    """PATCH article fields."""
    url = f"{BLOG_API}/api/articles/{article_id}"
    payload = json.dumps(updates).encode("utf-8")
    req = urllib.request.Request(url, data=payload,
        headers={"Content-Type": "application/json"}, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [ERROR] update {article_id}: {e}")
        return None


def tavily_extract(url):
    """Use Tavily extract API to get page content."""
    if not TAVILY_API_KEY:
        print("  [SKIP] no TAVILY_API_KEY")
        return None
    try:
        payload = json.dumps({
            "api_key": TAVILY_API_KEY,
            "urls": [url],
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.tavily.com/extract",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        results = data.get("results", [])
        if results:
            return results[0].get("raw_content", "") or results[0].get("text", "")
        return None
    except Exception as e:
        print(f"  [ERROR] tavily extract: {e}")
        return None


def translate_with_hermes(content, title):
    """Call Hermes to translate and summarize."""
    prompt = f"""Translate and summarize this article in Chinese.

Return ONLY valid JSON:
{{"translated_content": "full Chinese translation", "translated_summary": "2-3 sentence Chinese summary"}}

Title: {title}
Content:
{content[:4000]}"""

    try:
        result = subprocess.run(
            [HERMES_BIN, "chat", "-q", prompt],
            capture_output=True, text=True, timeout=120,
            env={**os.environ, "PATH": f"/root/.local/bin:/usr/local/bin:/usr/bin:/bin:{os.environ.get('PATH', '')}"},
        )
        output = result.stdout.strip()
        json_start = output.find("{")
        json_end = output.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            return json.loads(output[json_start:json_end])
        return None
    except Exception as e:
        print(f"  [ERROR] hermes: {e}")
        return None


def main():
    dry_run = "--dry-run" in sys.argv
    print(f"=== Process Favorites {'[DRY RUN]' if dry_run else ''} ===\n")

    # Step 1: Crawl pending articles
    print("-- Step 1: Crawl external links --")
    pending_crawl = get_articles_by_status("pending_crawl")
    print(f"Found {len(pending_crawl)} articles to crawl")

    for i, art in enumerate(pending_crawl):
        source_url = art.get("sourceUrl")
        print(f"\n[{i+1}/{len(pending_crawl)}] {art['title'][:60]}")

        if not source_url:
            print("  No source_url, skip to translation")
            if not dry_run:
                update_article(art["id"], {"status": "pending_translation"})
            continue

        if dry_run:
            print(f"  [DRY] Would crawl: {source_url}")
            continue

        print(f"  Crawling: {source_url}")
        full_content = tavily_extract(source_url)
        if full_content:
            update_article(art["id"], {
                "fullContent": full_content[:10000],
                "status": "pending_translation",
            })
            print(f"  OK ({len(full_content)} chars)")
        else:
            update_article(art["id"], {"status": "pending_translation"})
            print("  No content extracted, proceeding to translate tweet only")

    # Step 2: Translate pending articles
    print("\n-- Step 2: Translate & Summarize --")
    pending_translate = get_articles_by_status("pending_translation")
    print(f"Found {len(pending_translate)} articles to translate")

    for i, art in enumerate(pending_translate):
        title = art.get("title", "Untitled")
        content = art.get("fullContent") or art.get("content") or ""
        print(f"\n[{i+1}/{len(pending_translate)}] {title[:60]}")

        if not content:
            print("  [SKIP] no content")
            continue

        if dry_run:
            print("  [DRY] Would translate")
            continue

        result = translate_with_hermes(content, title)
        if result and result.get("translated_content"):
            update_article(art["id"], {
                "translatedContent": result["translated_content"],
                "translatedSummary": result.get("translated_summary", ""),
                "status": "completed",
            })
            print("  OK")
        else:
            update_article(art["id"], {"status": "failed", "error": "translation failed"})
            print("  FAILED")

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
