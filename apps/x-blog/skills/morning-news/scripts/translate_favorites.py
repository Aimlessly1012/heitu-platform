#!/usr/bin/env python3
"""
Translate and summarize favorited articles using Hermes agent.
Queries pending_translation articles from the blog API,
sends each to Hermes for translation/summarization,
then updates the article via PATCH.

Usage: python3 translate_favorites.py [--dry-run]
"""

import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

BLOG_API = os.environ.get("BLOG_API", "https://heitu.wang")
HERMES_BIN = os.environ.get("HERMES_BIN", "/root/.local/bin/hermes")


def get_pending_articles():
    """Fetch articles with status=pending_translation from API."""
    try:
        url = f"{BLOG_API}/api/articles"
        req = urllib.request.Request(url, headers={"User-Agent": "TranslateBot/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())

        articles = data.get("data", [])
        pending = [a for a in articles if a.get("status") == "pending_translation" and a.get("isFavorited")]
        return pending
    except Exception as e:
        print(f"[ERROR] Failed to fetch articles: {e}")
        return []


def translate_with_hermes(content: str, title: str) -> dict | None:
    """Call Hermes CLI to translate and summarize an article."""
    prompt = f"""Please translate the following English article into Chinese and provide a summary.

Return ONLY a valid JSON object with these two fields:
- "translated_content": the full Chinese translation
- "translated_summary": a 2-3 sentence Chinese summary

Article title: {title}
Article content:
{content[:3000]}"""

    try:
        result = subprocess.run(
            [HERMES_BIN, "chat", "-q", prompt],
            capture_output=True,
            text=True,
            timeout=120,
            env={**os.environ, "PATH": f"/root/.local/bin:/usr/local/bin:/usr/bin:/bin:{os.environ.get('PATH', '')}"},
        )

        output = result.stdout.strip()
        if not output:
            print(f"  [WARN] Hermes returned empty output")
            return None

        # Try to extract JSON from output
        json_start = output.find("{")
        json_end = output.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            json_str = output[json_start:json_end]
            return json.loads(json_str)
        else:
            print(f"  [WARN] No JSON found in Hermes output")
            return None
    except subprocess.TimeoutExpired:
        print(f"  [ERROR] Hermes timed out")
        return None
    except json.JSONDecodeError as e:
        print(f"  [ERROR] Failed to parse Hermes JSON: {e}")
        return None
    except Exception as e:
        print(f"  [ERROR] Hermes call failed: {e}")
        return None


def update_article(article_id: str, translated_content: str, translated_summary: str):
    """Update article with translation via API."""
    url = f"{BLOG_API}/api/articles/{article_id}"
    payload = json.dumps({
        "translatedContent": translated_content,
        "translatedSummary": translated_summary,
        "status": "completed",
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="PATCH",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [ERROR] Failed to update article {article_id}: {e}")
        return None


def main():
    dry_run = "--dry-run" in sys.argv

    print("=== Translate Favorited Articles ===")

    articles = get_pending_articles()
    print(f"Found {len(articles)} pending translation articles")

    if not articles:
        print("Nothing to translate.")
        return

    for i, article in enumerate(articles):
        title = article.get("title", "Untitled")
        content = article.get("content", "")
        article_id = article.get("id", "")

        print(f"\n[{i+1}/{len(articles)}] Translating: {title[:60]}...")

        if not content:
            print("  [SKIP] No content to translate")
            continue

        if dry_run:
            print("  [DRY RUN] Would translate and update")
            continue

        result = translate_with_hermes(content, title)
        if not result:
            print("  [FAIL] Translation failed, skipping")
            continue

        translated_content = result.get("translated_content", "")
        translated_summary = result.get("translated_summary", "")

        if not translated_content:
            print("  [FAIL] Empty translation result")
            continue

        update_result = update_article(article_id, translated_content, translated_summary)
        if update_result:
            print(f"  [OK] Updated successfully")
        else:
            print(f"  [FAIL] Update failed")

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
