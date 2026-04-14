#!/usr/bin/env python3
"""
AI Morning News Generator - X Blogger Edition
Focused on high-quality X/Twitter posts from curated bloggers.

Data sources (priority order):
1. Tavily site:x.com search per blogger (primary)
2. HackerNews AI hot posts (supplement)
3. RSS feeds from official blogs (supplement)

Usage: python3 generate_morning_news.py [--dry-run] [--date 2026-04-01]
"""

import json
import sys
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

# ============ config ============

BLOG_API = os.environ.get("BLOG_API", "https://heitu.wang")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")

# X bloggers to follow (from authors page)
X_AUTHORS = [
    "nash_su",
    "affaanmustafa",
    "Voxyz_ai",
    "zodchiii",
    "heynavtoor",
    "PandaTalk8",
    "LawrenceW_Zen",
    "Khazix0918",
    "bindureddy",
    "rowancheung",
    "jackclarkSF",
    "alexalbert__",
]

# Additional topic searches (kept minimal to save Tavily quota)
TOPIC_QUERIES = [
    "Claude Code Hermes OpenClaw latest news",
    "Anthropic Claude new feature release today",
    "AI agent MCP skills update",
]

# RSS feeds (free, no quota)
RSS_SOURCES = [
    {"name": "Anthropic Blog", "url": "https://www.anthropic.com/blog/rss"},
    {"name": "OpenAI Blog", "url": "https://openai.com/blog/rss/"},
    {"name": "LangChain Blog", "url": "https://blog.langchain.dev/rss/"},
]

# HackerNews
HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# ============ data collection ============

def tavily_search(query, max_results=5, include_domains=None):
    """Tavily API search"""
    if not TAVILY_API_KEY:
        print(f"  [SKIP] no TAVILY_API_KEY")
        return []

    try:
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": False,
            "days": 2,
        }
        if include_domains:
            payload["include_domains"] = include_domains

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://api.tavily.com/search",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            results = []
            for r in result.get("results", []):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")[:500],
                    "source": "Tavily",
                    "source_query": query,
                })
            return results
    except Exception as e:
        print(f"  [ERROR] Tavily '{query[:40]}': {e}")
        return []


def fetch_x_blogger_posts(authors, max_per_author=5):
    """Search X posts from each blogger via Tavily site:x.com/username/status"""
    all_results = []

    for username in authors:
        # Search for actual tweet posts, not profile pages
        query = f"site:x.com/{username}/status"
        items = tavily_search(query, max_results=max_per_author, include_domains=["x.com", "twitter.com"])

        valid = []
        for item in items:
            url = item.get("url", "")
            # Only keep actual tweet URLs (contain /status/)
            if "/status/" not in url:
                continue

            item["author"] = username
            item["source"] = f"X/@{username}"

            # Clean up title
            title = item.get("title", "")
            # "Username on X: \"actual tweet text\"" -> extract tweet text
            if " on X:" in title:
                title = title.split(" on X:", 1)[1].strip().strip('"').strip()
            elif " / X" in title:
                title = title.split(" / X")[0].strip()
            # Remove "(@username)" prefix
            title = re.sub(r'^.*?\(@\w+\)\s*', '', title).strip()
            item["title"] = title or item.get("content", "")[:80]
            valid.append(item)

        print(f"  [@{username}] {len(valid)} tweets (filtered from {len(items)} results)")
        all_results.extend(valid)

    return all_results


def fetch_hn_top(limit=30):
    """HackerNews AI hot posts"""
    ai_keywords = ['ai', 'claude', 'anthropic', 'openai', 'gpt', 'llm', 'agent',
                   'gemini', 'mcp', 'hermes', 'openclaw', 'cursor', 'copilot']
    try:
        with urllib.request.urlopen(HN_TOP_URL, timeout=10) as resp:
            top_ids = json.loads(resp.read().decode())[:limit]

        results = []
        for item_id in top_ids:
            try:
                url = HN_ITEM_URL.format(item_id)
                with urllib.request.urlopen(url, timeout=5) as resp:
                    item = json.loads(resp.read().decode())

                title = (item.get("title") or "").lower()
                if any(kw in title for kw in ai_keywords):
                    results.append({
                        "title": item.get("title", ""),
                        "url": item.get("url") or f"https://news.ycombinator.com/item?id={item_id}",
                        "content": f"HN Score: {item.get('score', 0)} | Comments: {item.get('descendants', 0)}",
                        "source": "HackerNews",
                        "score_hint": item.get("score", 0),
                    })
            except:
                continue
        return results
    except Exception as e:
        print(f"  [ERROR] HackerNews: {e}")
        return []


def fetch_rss_feeds():
    """RSS feed articles"""
    results = []
    for source in RSS_SOURCES:
        try:
            req = urllib.request.Request(source["url"], headers={"User-Agent": "MorningNewsBot/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                xml = resp.read().decode()

            items = re.findall(r'<item>(.*?)</item>', xml, re.DOTALL)[:3]
            for item_xml in items:
                title_match = re.search(r'<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>', item_xml)
                link_match = re.search(r'<link>(.*?)</link>', item_xml)
                desc_match = re.search(r'<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</description>', item_xml, re.DOTALL)

                if title_match and link_match:
                    title = title_match.group(1).strip()
                    link = link_match.group(1).strip()
                    desc = re.sub(r'<[^>]+>', '', desc_match.group(1)[:300].strip()) if desc_match else ""
                    results.append({
                        "title": title,
                        "url": link,
                        "content": desc,
                        "source": f"RSS/{source['name']}",
                    })
        except Exception as e:
            print(f"  [WARN] RSS {source['name']}: {e}")
    return results


# ============ processing ============

def deduplicate(items):
    """URL dedup"""
    seen = set()
    unique = []
    for item in items:
        key = re.sub(r'[?#].*', '', item.get("url", "")).rstrip('/')
        if key and key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def auto_score(item):
    """Score 1-10 based on content relevance"""
    score = 6  # X blogger posts start higher

    text = (item.get("title", "") + " " + item.get("content", "")).lower()

    high = ['claude', 'anthropic', 'claude code', 'mcp', 'skill', 'openclaw', 'hermes', 'opencode']
    mid = ['openai', 'gpt', 'gemini', 'ai agent', 'prompt engineering', 'cursor']

    for kw in high:
        if kw in text:
            score += 2
            break
    for kw in mid:
        if kw in text:
            score += 1
            break

    # X blogger posts get bonus
    if item.get("source", "").startswith("X/@"):
        score += 1
    # Official blog posts get bonus
    if "Anthropic" in item.get("source", "") or "OpenAI" in item.get("source", ""):
        score += 1
    # HN high score bonus
    if item.get("score_hint", 0) > 100:
        score += 1

    # Penalize very short content (likely not useful)
    if len(item.get("content", "")) < 30:
        score -= 2

    return min(max(score, 1), 10)


def auto_tags(item):
    """Generate tags"""
    tags = ["morning-news"]
    text = (item.get("title", "") + " " + item.get("content", "")).lower()

    if "claude" in text or "anthropic" in text:
        tags.append("Claude")
    if "openai" in text or "gpt" in text:
        tags.append("OpenAI")
    if "agent" in text:
        tags.append("AI Agent")
    if "hermes" in text or "openclaw" in text:
        tags.append("Hermes")
    if any(kw in text for kw in ['skill', 'plugin', 'mcp', 'tool', 'sdk']):
        tags.append("new-feature")
    if any(kw in text for kw in ['tutorial', 'guide', 'how to', 'best practice']):
        tags.append("tutorial")

    if item.get("source", "").startswith("X/@"):
        tags.append("AI news")

    return list(set(tags))


# ============ output ============

def send_telegram(text):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    if len(text) > 4000:
        text = text[:3990] + "\n\n...(truncated)"
    try:
        data = json.dumps({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }).encode("utf-8")
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            print(f"  {'OK' if result.get('ok') else 'FAIL'} Telegram")
    except Exception as e:
        print(f"  [ERROR] Telegram: {e}")


def post_to_blog(items, date_str):
    api_url = f"{BLOG_API}/api/morning-news"
    payload = json.dumps({"date": date_str, "items": items}).encode("utf-8")
    req = urllib.request.Request(
        api_url, data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [ERROR] Post to blog: {e}")
        return None


# ============ main ============

def main():
    dry_run = "--dry-run" in sys.argv
    date_str = None
    for i, arg in enumerate(sys.argv):
        if arg == "--date" and i + 1 < len(sys.argv):
            date_str = sys.argv[i + 1]
    if not date_str:
        tz = timezone(timedelta(hours=8))
        date_str = datetime.now(tz).strftime("%Y-%m-%d")

    print(f"AI Morning News - {date_str}")
    print(f"{'[DRY RUN] ' if dry_run else ''}collecting...\n")

    all_items = []

    # 1. X blogger posts (primary source)
    print("== X Blogger Posts (Tavily) ==")
    x_items = fetch_x_blogger_posts(X_AUTHORS, max_per_author=3)
    all_items.extend(x_items)
    print(f"  Total: {len(x_items)} posts from {len(X_AUTHORS)} bloggers\n")

    # 2. Topic searches (3 queries only)
    print("== Topic Searches ==")
    for query in TOPIC_QUERIES:
        items = tavily_search(query, max_results=3)
        print(f"  [{len(items)}] {query[:50]}")
        all_items.extend(items)

    tavily_count = len(all_items)

    # 3. HackerNews
    print("\n== HackerNews ==")
    hn_items = fetch_hn_top(limit=30)
    print(f"  [{len(hn_items)}] AI hot posts")
    all_items.extend(hn_items)

    # 4. RSS
    print("\n== RSS Feeds ==")
    rss_items = fetch_rss_feeds()
    print(f"  [{len(rss_items)}] articles")
    all_items.extend(rss_items)

    # Processing
    print(f"\n== Processing ==")
    print(f"  Raw: {len(all_items)}")

    all_items = deduplicate(all_items)
    print(f"  Deduped: {len(all_items)}")

    for item in all_items:
        item["score"] = auto_score(item)
        item["tags"] = auto_tags(item)

    # Select top items (score >= 6 for X posts, >= 7 for others)
    selected = [item for item in all_items if item["score"] >= 6]
    selected.sort(key=lambda x: x["score"], reverse=True)
    selected = selected[:25]
    print(f"  Selected: {len(selected)}")

    # Report
    report_lines = [f"AI Morning News - {date_str}\n"]
    for item in selected:
        src = item.get("source", "")
        report_lines.append(f"[{item['score']}] {item['title'][:70]}")
        report_lines.append(f"    {item['url']}")
        report_lines.append(f"    {src}")
    report_lines.append(f"\nStats: Tavily {tavily_count} | HN {len(hn_items)} | RSS {len(rss_items)} | Final {len(selected)}")
    report = "\n".join(report_lines)

    print(f"\n{'='*50}")
    print(report)
    print(f"{'='*50}")

    # Write to blog
    if not dry_run and selected:
        print(f"\nPosting to blog...")
        blog_items = []
        for item in selected:
            blog_items.append({
                "title": item["title"],
                "url": item.get("url", ""),
                "content": item.get("content", ""),
                "summary": item.get("content", "")[:200],
                "author": item.get("author", item.get("source", "AI Morning News")),
                "authorUsername": item.get("author", "morning-news"),
                "originalLanguage": "zh" if any('\u4e00' <= c <= '\u9fff' for c in item.get("title", "")) else "en",
                "tags": item.get("tags", ["morning-news"]),
                "publishedAt": datetime.now(timezone(timedelta(hours=8))).isoformat(),
            })

        result = post_to_blog(blog_items, date_str)
        if result:
            created = sum(1 for r in result.get("results", []) if r.get("status") == "created")
            dupes = sum(1 for r in result.get("results", []) if r.get("status") == "duplicate")
            print(f"  Created: {created} | Dupes: {dupes}")
        else:
            print(f"  FAILED")

        send_telegram(report)
    elif dry_run:
        print(f"\n[DRY RUN] skipped blog write")

    # JSON output
    output_file = f"/tmp/morning-news-{date_str}.json"
    with open(output_file, "w") as f:
        json.dump({"date": date_str, "items": selected, "report": report}, f, ensure_ascii=False, indent=2)
    print(f"\nJSON: {output_file}")


if __name__ == "__main__":
    main()
