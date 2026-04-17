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
import subprocess
import sys
import os
import re
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

# ============ config ============

def _load_env_file():
    """Auto-load .env.local from project root if env vars aren't set.

    Searches common paths so the script works under hermes cron (which
    doesn't source the project's .env.local automatically).
    """
    candidates = [
        "/root/peko/heitu-platform/apps/x-blog/.env.local",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../.env.local"),
        os.path.join(os.getcwd(), ".env.local"),
    ]
    for path in candidates:
        path = os.path.abspath(path)
        if not os.path.exists(path):
            continue
        try:
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val
            print(f"  [env] loaded {path}")
            break
        except Exception as e:
            print(f"  [env] failed to load {path}: {e}")


_load_env_file()

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

HERMES_BIN = os.environ.get("HERMES_BIN", "/root/.local/bin/hermes")

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
    """Search X posts from each blogger via Tavily"""
    all_results = []

    for username in authors:
        # Search for recent posts by this user
        query = f"from:@{username} x.com/{username}/status"
        items = tavily_search(query, max_results=max_per_author, include_domains=["x.com", "twitter.com"])

        valid = []
        for item in items:
            url = item.get("url", "")
            # Only keep actual tweet URLs (contain /status/)
            if "/status/" not in url:
                continue

            item["author"] = username
            item["source"] = f"X/@{username}"

            # Clean up title - prefer tweet content over page title
            title = item.get("title", "")
            content = item.get("content", "")

            # "Username on X: \"actual tweet text\"" -> extract tweet text
            if " on X:" in title:
                title = title.split(" on X:", 1)[1].strip().strip('"').strip()
            elif " / X" in title:
                title = title.split(" / X")[0].strip()
            # Remove "(@username)" prefix
            title = re.sub(r'^.*?\(@\w+\)\s*', '', title).strip()

            # If title is generic ("on X", "on X - Twitter", username only), use content
            if not title or title.lower() in ['on x', 'on x - twitter', '', username.lower()] or len(title) < 5:
                # Use first sentence of content as title
                title = content.split('.')[0].split('\n')[0][:120] if content else f"@{username} post"

            item["title"] = f"@{username}: {title}" if not title.startswith('@') else title
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


# ============ content enrichment ============

def fetch_x_tweet_full(url):
    """Use fxtwitter (free, no auth) to get full tweet text + thread context.

    Converts x.com/user/status/123 → api.fxtwitter.com/user/status/123 (JSON).
    Returns full tweet text or None.
    """
    m = re.search(r'(?:x\.com|twitter\.com)/([^/]+)/status/(\d+)', url)
    if not m:
        return None
    username, tweet_id = m.group(1), m.group(2)
    api_url = f"https://api.fxtwitter.com/{username}/status/{tweet_id}"
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": "MorningNewsBot/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        tweet = data.get("tweet", {})
        text = tweet.get("text", "") or ""
        if not isinstance(text, str):
            text = ""

        # X long-form post: real content lives in article.content.blocks[*].text
        article = tweet.get("article")
        if isinstance(article, dict):
            atitle = article.get("title", "") or ""
            paragraphs = []
            content = article.get("content")
            if isinstance(content, dict):
                blocks = content.get("blocks", [])
                if isinstance(blocks, list):
                    for b in blocks:
                        if isinstance(b, dict):
                            t = b.get("text", "")
                            if isinstance(t, str) and t.strip():
                                paragraphs.append(t.strip())
            article_text = "\n\n".join(paragraphs)
            if not article_text:
                preview = article.get("preview_text", "")
                if isinstance(preview, str):
                    article_text = preview
            if article_text:
                text = (atitle + "\n\n" + article_text).strip() if atitle else article_text

        # If it's a thread / reply, prepend parent context
        replying_to = tweet.get("replying_to")
        replying_to_status = tweet.get("replying_to_status")
        if isinstance(replying_to_status, dict):
            parent_text = replying_to_status.get("text", "") or ""
            parent_user = replying_to if isinstance(replying_to, str) else ""
            if not parent_user and isinstance(replying_to_status.get("author"), dict):
                parent_user = replying_to_status["author"].get("screen_name", "")
            if parent_text:
                text = f"[Replying to @{parent_user}: {parent_text}]\n\n{text}"

        return text.strip() or None
    except Exception as e:
        print(f"  [fxtwitter] {username}/{tweet_id}: {e}")
        return None


def enrich_content(items):
    """Replace Tavily snippets with full tweet text for X items.

    fxtwitter returns clean original tweet text; we always prefer it over
    Tavily's snippet (which often contains UI metadata like view counts).
    """
    enriched = 0
    for item in items:
        url = item.get("url", "")
        if "x.com/" in url or "twitter.com/" in url:
            full_text = fetch_x_tweet_full(url)
            if full_text and len(full_text) >= 30:  # any non-trivial text
                item["content"] = full_text
                enriched += 1
    print(f"  Enriched {enriched}/{sum(1 for i in items if 'x.com/' in i.get('url','') or 'twitter.com/' in i.get('url',''))} X tweets")
    return items


# ============ translation ============

def _call_hermes_translate(items_to_translate, batch_label=""):
    """Call Hermes once for a list of items.

    Returns: (translations_list_or_None, error_kind)
      error_kind: None | 'rate_limit' | 'timeout' | 'parse_error' | 'other'
    """
    entries = []
    for idx, item in enumerate(items_to_translate):
        title = item.get("title", "")
        content = item.get("content", "")[:1500]
        entries.append(f'{idx+1}. Title: {title}\n   Content: {content}')

    entries_text = "\n".join(entries)
    prompt = f"""你是一个专业的 AI 技术资讯编辑，擅长把英文推文/文章翻译并归纳成高质量中文摘要。

请为下面 {len(items_to_translate)} 条资讯，各生成：
- translated_title: 简洁精准的中文标题（不超过 30 字，保留 @用户名 原样）
- translated_summary: 3-5 句中文深度归纳（共 80-200 字）。要求：
  * 第一句话点明核心观点或新信息是什么
  * 后续 2-4 句补充关键细节、数据、使用方式、或对开发者/用户的影响和价值
  * 不要只做字面翻译——提炼"是什么、为什么重要、有什么用"
  * 如果原内容本身很短，可以基于标题和已知上下文适度延展
  * 禁止使用"本文介绍"、"该推文说"等元描述，直接陈述事实

只返回合法 JSON 数组，不要任何其他文字、不要代码块包裹：
[{{"translated_title": "...", "translated_summary": "..."}}, ...]

资讯：
{entries_text}"""

    try:
        # -Q (uppercase) = quiet mode (suppresses banner), -q = query
        result = subprocess.run(
            [HERMES_BIN, "chat", "-Q", "-q", prompt],
            capture_output=True, text=True, timeout=180,
            env={**os.environ, "PATH": f"/root/.local/bin:/usr/local/bin:/usr/bin:/bin:{os.environ.get('PATH', '')}"},
        )
        output = result.stdout.strip()
        combined = output + "\n" + (result.stderr or "")

        # Detect rate-limit / quota errors surfaced by Hermes
        rate_limit_markers = ("HTTP 429", "Token Plan", "请稍后重试",
                              "rate limit", "rate_limit", "quota")
        if any(m in combined for m in rate_limit_markers) or \
           ("API call failed" in combined and "retries" in combined):
            snippet = combined.strip().splitlines()[0][:200] if combined.strip() else ""
            print(f"  {batch_label} [RATE LIMIT] {snippet}")
            return None, "rate_limit"

        # Strip ```json ... ``` code fences if present
        fence_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', output, re.DOTALL)
        if fence_match:
            json_text = fence_match.group(1)
        else:
            # Fallback: find outermost [...]
            json_start = output.find("[")
            json_end = output.rfind("]") + 1
            json_text = output[json_start:json_end] if json_start >= 0 and json_end > json_start else ""

        if json_text:
            try:
                return json.loads(json_text), None
            except json.JSONDecodeError as e:
                print(f"  {batch_label} [PARSE ERROR] {e}; head: {output[:120]!r}")
                return None, "parse_error"
        print(f"  {batch_label} [NO JSON] head: {output[:120]!r}")
        return None, "parse_error"
    except subprocess.TimeoutExpired:
        print(f"  {batch_label} [TIMEOUT]")
        return None, "timeout"
    except Exception as e:
        print(f"  {batch_label} [ERROR] {e}")
        return None, "other"


def translate_batch_with_hermes(items):
    """Batch translate titles + summarize content via Hermes (MiniMax model).

    Throttling strategy (MiniMax Token Plan is sensitive to burst traffic):
    1. Small batches (3 per call) to keep per-request token cost low
    2. Baseline 4s sleep between batches (smooths out RPM)
    3. On rate-limit (HTTP 429), exponential backoff: 60s → 180s → 300s
    4. On timeout/parse error, short backoff: 10s → 20s
    5. Per-item fallback for still-failed batches, with 6s pacing + 90s if 429
    6. If a rate-limit is observed, bump the baseline inter-batch sleep to 10s
       for the remainder of the run (cooling-off mode)
    """
    if not os.path.exists(HERMES_BIN):
        print(f"  [SKIP] Hermes not found at {HERMES_BIN}")
        return items

    BATCH_SIZE = 3
    baseline_sleep = 4  # seconds between successful batches
    RATE_LIMIT_BACKOFF = [60, 180, 300]
    OTHER_BACKOFF = [10, 20]

    failed_items = []
    total_batches = (len(items) + BATCH_SIZE - 1) // BATCH_SIZE
    rate_limited_ever = False

    for start in range(0, len(items), BATCH_SIZE):
        batch = items[start:start + BATCH_SIZE]
        batch_num = start // BATCH_SIZE + 1
        label = f"Batch {batch_num}/{total_batches}:"

        translations = None
        for attempt in range(1 + max(len(RATE_LIMIT_BACKOFF), len(OTHER_BACKOFF))):
            translations, err = _call_hermes_translate(batch, label)
            if translations:
                break
            if err == "rate_limit":
                rate_limited_ever = True
                baseline_sleep = max(baseline_sleep, 10)
                if attempt < len(RATE_LIMIT_BACKOFF):
                    wait = RATE_LIMIT_BACKOFF[attempt]
                    print(f"  {label} rate-limited; sleeping {wait}s before retry {attempt+2}")
                    time.sleep(wait)
                else:
                    print(f"  {label} rate-limited; exhausted retries")
                    break
            elif err in ("timeout", "parse_error", "other"):
                if attempt < len(OTHER_BACKOFF):
                    wait = OTHER_BACKOFF[attempt]
                    print(f"  {label} {err}; sleeping {wait}s before retry {attempt+2}")
                    time.sleep(wait)
                else:
                    break
            else:
                break

        if translations:
            for i, trans in enumerate(translations):
                if i < len(batch):
                    batch[i]["translated_title"] = trans.get("translated_title", "")
                    batch[i]["translated_summary"] = trans.get("translated_summary", "")
            print(f"  {label} translated {len(translations)} items")
        else:
            print(f"  {label} [FALLBACK] queued for per-item retry")
            failed_items.extend(batch)

        # Pacing between batches
        if start + BATCH_SIZE < len(items):
            time.sleep(baseline_sleep)

    # Per-item fallback for items that failed in batch mode
    if failed_items:
        per_item_pace = 10 if rate_limited_ever else 6
        print(f"\n  Per-item fallback for {len(failed_items)} items (pace {per_item_pace}s):")
        for idx, item in enumerate(failed_items):
            label = f"Item {idx+1}/{len(failed_items)}:"
            translations, err = _call_hermes_translate([item], label)
            if err == "rate_limit":
                print(f"  {label} rate-limited; sleeping 90s then retry once")
                time.sleep(90)
                translations, err = _call_hermes_translate([item], label)
            if translations and translations[0]:
                item["translated_title"] = translations[0].get("translated_title", "")
                item["translated_summary"] = translations[0].get("translated_summary", "")
                print(f"  {label} OK")
            else:
                print(f"  {label} gave up ({err})")
            if idx + 1 < len(failed_items):
                time.sleep(per_item_pace)

    translated_count = sum(1 for item in items if item.get("translated_title"))
    print(f"  Total translated: {translated_count}/{len(items)}"
          f"{' (rate-limited during run)' if rate_limited_ever else ''}")
    return items


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

    # Enrich content (fetch full X tweet text via fxtwitter)
    print(f"\n== Enrich Content ==")
    selected = enrich_content(selected)

    # Translate & summarize
    print(f"\n== Translate & Summarize ==")
    if not dry_run:
        selected = translate_batch_with_hermes(selected)
    else:
        print("  [DRY RUN] skipped translation")

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
                "translatedTitle": item.get("translated_title", ""),
                "translatedSummary": item.get("translated_summary", ""),
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
