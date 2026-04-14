#!/usr/bin/env python3
"""
AI Morning News Generator
主动巡逻 + 社区监听 → AI 聚合 → 写入博客

Usage: python3 generate_morning_news.py [--dry-run] [--date 2026-04-01]
"""

import json
import sys
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

# ============ 配置 ============

BLOG_API = os.environ.get("BLOG_API", "https://heitu.wang")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")

# 搜索关键词组
SEARCH_QUERIES = [
    # AI 动态
    "Claude AI news today 2026",
    "Anthropic Claude update announcement",
    "OpenAI GPT new feature release",
    # 工具更新
    "Claude Code skills plugin CLI update",
    "MCP model context protocol new",
    "AI developer tools update 2026",
    # AI 就业创业
    "AI engineer job hiring trend 2026",
    "AI startup funding launch 2026",
    # 教程
    "Harness Engineering AI agent tutorial",
    "Claude Code best practices guide",
    # Hermes / OpenClaw
    "Hermes AI agent OpenClaw update",
    "OpenClaw platform AI agent news",
]

SEARCH_QUERIES_ZH = [
    "Claude AI 最新动态",
    "AI 工具更新 Skills Plugin",
    "AI 创业 融资 2026",
    "AI 就业 招聘 趋势",
]

# HackerNews API
HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{}.json"

# GitHub Trending (scrape)
GITHUB_TRENDING_URL = "https://github.com/trending?since=daily&spoken_language_code=en"

# RSS 源
RSS_SOURCES = [
    {"name": "Anthropic Blog", "url": "https://www.anthropic.com/blog/rss"},
    {"name": "OpenAI Blog", "url": "https://openai.com/blog/rss/"},
    {"name": "LangChain Blog", "url": "https://blog.langchain.dev/rss/"},
]

# ============ 数据采集函数 ============

def tavily_search(query, max_results=5):
    """使用 Tavily API 搜索"""
    if not TAVILY_API_KEY:
        print(f"  [SKIP] Tavily: 未设置 TAVILY_API_KEY")
        return []
    
    try:
        data = json.dumps({
            "api_key": TAVILY_API_KEY,
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": False,
            "days": 1,
        }).encode("utf-8")
        
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
                    "snippet": r.get("content", "")[:300],
                    "source": "Tavily",
                    "source_query": query,
                })
            return results
    except Exception as e:
        print(f"  [ERROR] Tavily search '{query[:30]}...': {e}")
        return []


def fetch_hn_top(limit=30):
    """获取 HackerNews 热帖并筛选 AI 相关"""
    ai_keywords = ['ai', 'claude', 'anthropic', 'openai', 'gpt', 'llm', 'agent', 
                   'ml', 'machine learning', 'deep learning', 'transformer',
                   'gemini', 'copilot', 'cursor', 'mcp', 'skill', 'prompt']
    
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
                        "snippet": f"HN Score: {item.get('score', 0)} | Comments: {item.get('descendants', 0)}",
                        "source": "HackerNews",
                        "score_hint": item.get("score", 0),
                    })
            except:
                continue
        
        return results
    except Exception as e:
        print(f"  [ERROR] HackerNews: {e}")
        return []


def fetch_x_authors():
    """从项目代码中提取大V列表"""
    # 从脚本位置向上找到项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # skills/morning-news/scripts/ → 项目根目录
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
    authors_file = os.path.join(project_root, "src", "app", "authors", "page.tsx")
    
    if not os.path.exists(authors_file):
        print(f"  [WARN] Authors file not found: {authors_file}")
        return []
    
    with open(authors_file, "r") as f:
        content = f.read()
    
    # Extract usernames
    usernames = re.findall(r"username:\s*'([^']+)'", content)
    return usernames


def fetch_x_timeline(usernames, limit_per_user=3):
    """通过 fxtwitter API 获取大V最新推文"""
    results = []
    
    for username in usernames:
        try:
            api_url = f"https://api.fxtwitter.com/{username}"
            req = urllib.request.Request(api_url, headers={"User-Agent": "MorningNewsBot/1.0"})
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
            
            tweets = data.get("tweets", [])[:limit_per_user]
            for tweet in tweets:
                # 只要最近24小时的
                created = tweet.get("created_at", "")
                text = tweet.get("text", "")
                
                if len(text) > 50:  # 过滤太短的
                    results.append({
                        "title": f"@{username}: {text[:80]}...",
                        "url": f"https://x.com/{username}/status/{tweet.get('id', '')}",
                        "snippet": text[:300],
                        "source": f"X/@{username}",
                        "author": username,
                    })
        except Exception as e:
            print(f"  [WARN] X/@{username}: {e}")
            continue
    
    return results


def fetch_rss_feeds():
    """获取 RSS 订阅最新文章"""
    results = []
    
    for source in RSS_SOURCES:
        try:
            req = urllib.request.Request(
                source["url"],
                headers={"User-Agent": "MorningNewsBot/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                xml = resp.read().decode()
            
            # Simple XML parsing (no external deps)
            items = re.findall(r'<item>(.*?)</item>', xml, re.DOTALL)[:3]
            for item_xml in items:
                title_match = re.search(r'<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>', item_xml)
                link_match = re.search(r'<link>(.*?)</link>', item_xml)
                desc_match = re.search(r'<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</description>', item_xml, re.DOTALL)
                
                if title_match and link_match:
                    title = title_match.group(1).strip()
                    link = link_match.group(1).strip()
                    desc = desc_match.group(1)[:200].strip() if desc_match else ""
                    # Remove HTML tags from description
                    desc = re.sub(r'<[^>]+>', '', desc)
                    
                    results.append({
                        "title": title,
                        "url": link,
                        "snippet": desc,
                        "source": f"RSS/{source['name']}",
                    })
        except Exception as e:
            print(f"  [WARN] RSS {source['name']}: {e}")
            continue
    
    return results


# ============ 聚合处理 ============

def deduplicate(items):
    """URL去重"""
    seen_urls = set()
    unique = []
    for item in items:
        url = item.get("url", "")
        # Normalize URL
        url_key = re.sub(r'[?#].*', '', url).rstrip('/')
        if url_key not in seen_urls:
            seen_urls.add(url_key)
            unique.append(item)
    return unique


def auto_score(item):
    """自动评分（1-10），基于关键词和来源"""
    score = 5  # 基础分
    
    title = (item.get("title", "") + " " + item.get("snippet", "")).lower()
    
    # 高价值关键词
    high_keywords = ['claude', 'anthropic', 'claude code', 'mcp', 'skill', 'openclaw', 'hermes', 'opencode']
    mid_keywords = ['openai', 'gpt', 'gemini', 'ai agent', 'harness', 'prompt engineering']
    topic_keywords = ['ai engineer', 'ai startup', 'ai hiring', 'ai job', 'funding', '融资', '创业', '就业']
    
    for kw in high_keywords:
        if kw in title:
            score += 2
            break
    
    for kw in mid_keywords:
        if kw in title:
            score += 1
            break
    
    for kw in topic_keywords:
        if kw in title:
            score += 1
            break
    
    # 来源加分
    source = item.get("source", "")
    if "Anthropic" in source or "OpenAI" in source:
        score += 1
    if "HackerNews" in source and item.get("score_hint", 0) > 100:
        score += 1
    
    return min(score, 10)


def classify_item(item):
    """自动分类"""
    title = (item.get("title", "") + " " + item.get("snippet", "")).lower()
    
    if any(kw in title for kw in ['claude', 'anthropic', 'openai', 'gpt', 'gemini', 'model', 'release', 'launch']):
        return "AI 动态"
    if any(kw in title for kw in ['skill', 'plugin', 'cli', 'mcp', 'tool', 'update', 'sdk', 'api']):
        return "工具更新"
    if any(kw in title for kw in ['job', 'hiring', 'engineer', 'career', '就业', '招聘']):
        return "就业"
    if any(kw in title for kw in ['startup', 'funding', 'launch', 'product', '创业', '融资']):
        return "创业"
    if any(kw in title for kw in ['tutorial', 'guide', 'how to', 'best practice', '教程', '实践']):
        return "教程"
    return "综合"


def auto_tags(item, category):
    """自动生成标签"""
    tags = ["晨报"]
    title = (item.get("title", "") + " " + item.get("snippet", "")).lower()
    
    if "claude" in title:
        tags.append("Claude")
    if "openai" in title or "gpt" in title:
        tags.append("OpenAI")
    if "agent" in title:
        tags.append("AI Agent")
    
    # 分类标签
    category_tag_map = {
        "AI 动态": "AI资讯",
        "工具更新": "新功能",
        "就业": "AI资讯",
        "创业": "AI资讯",
        "教程": "开发教程",
    }
    if category in category_tag_map:
        tags.append(category_tag_map[category])
    
    return list(set(tags))


# ============ Telegram 推送 ============

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

def send_telegram(text):
    """通过 Telegram Bot 推送消息"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("  [SKIP] Telegram: 未设置 BOT_TOKEN 或 CHAT_ID")
        return
    
    # Telegram 消息限制 4096 字符，超长截断
    if len(text) > 4000:
        text = text[:3990] + "\n\n...（内容过长已截断）"
    
    try:
        api_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = json.dumps({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }).encode("utf-8")
        
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            if result.get("ok"):
                print("  ✅ Telegram 推送成功")
            else:
                print(f"  ❌ Telegram 推送失败: {result}")
    except Exception as e:
        print(f"  [ERROR] Telegram: {e}")


# ============ 输出 ============

def post_to_blog(items, date_str):
    """写入博客 morning-news API"""
    api_url = f"{BLOG_API}/api/morning-news"
    
    payload = {
        "date": date_str,
        "items": items,
    }
    
    json_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=json_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            return result
    except Exception as e:
        print(f"  [ERROR] Post to blog: {e}")
        return None


def format_report(categorized, date_str, stats):
    """生成文本报告"""
    lines = [f"🌅 HeiTu AI 早报 - {date_str}", ""]
    
    emoji_map = {
        "AI 动态": "🤖",
        "工具更新": "🔧",
        "就业": "💼",
        "创业": "🚀",
        "教程": "📖",
        "综合": "📌",
    }
    
    for category, items in categorized.items():
        if not items:
            continue
        emoji = emoji_map.get(category, "📌")
        lines.append(f"{emoji} {category}")
        for item in items:
            score_str = f"⭐{item['score']}" if item.get('score') else ""
            lines.append(f"  • {item['title'][:60]}")
            lines.append(f"    {item['url']}")
            if score_str:
                lines.append(f"    {score_str} | {item.get('source', '')}")
        lines.append("")
    
    lines.append(f"📊 统计：搜索 {stats['search_count']} 条 | 社区 {stats['community_count']} 条 | 精选 {stats['final_count']} 条")
    
    return "\n".join(lines)


# ============ 主流程 ============

def main():
    dry_run = "--dry-run" in sys.argv
    
    # 解析日期
    date_str = None
    for i, arg in enumerate(sys.argv):
        if arg == "--date" and i + 1 < len(sys.argv):
            date_str = sys.argv[i + 1]
    
    if not date_str:
        tz = timezone(timedelta(hours=8))
        date_str = datetime.now(tz).strftime("%Y-%m-%d")
    
    print(f"🌅 AI 早报生成器 - {date_str}")
    print(f"{'[DRY RUN] ' if dry_run else ''}开始采集...\n")
    
    all_items = []
    
    # === 主动巡逻 ===
    print("🔍 主动巡逻 - Tavily 搜索")
    for query in SEARCH_QUERIES + SEARCH_QUERIES_ZH:
        items = tavily_search(query, max_results=3)
        print(f"  [{len(items)}] {query[:40]}...")
        all_items.extend(items)
    
    search_count = len(all_items)
    
    # === HackerNews ===
    print("\n🔥 HackerNews 热帖")
    hn_items = fetch_hn_top(limit=30)
    print(f"  [{len(hn_items)}] AI 相关热帖")
    all_items.extend(hn_items)
    
    # === 社区监听 ===
    print("\n📡 社区监听 - X 大V")
    authors = fetch_x_authors()
    print(f"  监听 {len(authors)} 位大V: {', '.join(authors[:5])}...")
    x_items = fetch_x_timeline(authors, limit_per_user=2)
    print(f"  [{len(x_items)}] 推文")
    all_items.extend(x_items)
    
    print("\n📡 社区监听 - RSS")
    rss_items = fetch_rss_feeds()
    print(f"  [{len(rss_items)}] RSS 文章")
    all_items.extend(rss_items)
    
    community_count = len(all_items) - search_count
    
    # === 聚合处理 ===
    print(f"\n🧠 聚合处理")
    print(f"  原始: {len(all_items)} 条")
    
    # 去重
    all_items = deduplicate(all_items)
    print(f"  去重后: {len(all_items)} 条")
    
    # 评分
    for item in all_items:
        item["score"] = auto_score(item)
        item["category"] = classify_item(item)
        item["tags"] = auto_tags(item, item["category"])
    
    # 筛选 7 分以上
    selected = [item for item in all_items if item["score"] >= 7]
    selected.sort(key=lambda x: x["score"], reverse=True)
    
    # 最多 20 条
    selected = selected[:20]
    print(f"  精选 (≥7分): {len(selected)} 条")
    
    # 分类
    categorized = {}
    for item in selected:
        cat = item["category"]
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append(item)
    
    stats = {
        "search_count": search_count,
        "community_count": community_count,
        "final_count": len(selected),
    }
    
    # === 输出报告 ===
    report = format_report(categorized, date_str, stats)
    print(f"\n{'='*50}")
    print(report)
    print(f"{'='*50}")
    
    # === 写入博客 ===
    if not dry_run and selected:
        print(f"\n📤 写入博客...")
        blog_items = []
        for item in selected:
            blog_items.append({
                "title": item["title"],
                "url": item.get("url", ""),
                "content": item.get("snippet", ""),
                "summary": item.get("snippet", "")[:150],
                "author": item.get("author", item.get("source", "AI早报")),
                "authorUsername": item.get("author", "morning-news"),
                "originalLanguage": "zh" if any('\u4e00' <= c <= '\u9fff' for c in item.get("title", "")) else "en",
                "tags": item.get("tags", ["晨报"]),
                "publishedAt": datetime.now(timezone(timedelta(hours=8))).isoformat(),
            })
        
        result = post_to_blog(blog_items, date_str)
        if result:
            created = sum(1 for r in result.get("results", []) if r.get("status") == "created")
            dupes = sum(1 for r in result.get("results", []) if r.get("status") == "duplicate")
            print(f"  ✅ 新增: {created} | 重复跳过: {dupes}")
        else:
            print(f"  ❌ 写入失败")
    elif dry_run:
        print(f"\n[DRY RUN] 跳过写入博客")
    
    # 输出 JSON 供后续处理
    output = {
        "date": date_str,
        "stats": stats,
        "items": selected,
        "report": report,
    }
    
    # Telegram 推送
    if not dry_run and selected:
        send_telegram(report)
    
    # 写入临时文件
    output_file = f"/tmp/morning-news-{date_str}.json"
    with open(output_file, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n📄 JSON 输出: {output_file}")
    
    return output


if __name__ == "__main__":
    main()
