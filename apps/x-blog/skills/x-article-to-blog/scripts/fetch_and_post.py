#!/usr/bin/env python3
"""
X.com Article Fetcher for Blog

Fetches an X.com article using fxtwitter API and outputs the data.
Translation will be done by the AI assistant after fetching.
Usage: python3 fetch_and_post.py <x_url>
"""

import sys
import json
import urllib.request
import urllib.error
import re
from datetime import datetime


def detect_tags(title: str, content: str, summary: str) -> list:
    """Auto-detect tags based on article content."""
    
    # Tag rules
    TAG_RULES = {
        # Products/Tools
        'Claude': ['claude', 'anthropic'],
        'Claude Code': ['claude code', 'coding', 'shortcuts', '快捷键'],
        'OpenClaw': ['openclaw', 'plano', 'filter chain'],
        'Skills': ['skills', 'agent skills', '技能'],
        'MCP': ['mcp', 'model context protocol'],
        'Prompt Engineering': ['prompt', 'prompting', '提示词'],
        
        # Content types
        '教程': ['教程', 'tutorial', 'guide', '指南', '上手'],
        '最佳实践': ['best practice', 'practices', '实践'],
        '快捷键': ['shortcut', 'hotkey', '快捷键', 'keyboard'],
        '工作流': ['workflow', '工作流'],
        '技巧': ['tips', 'tricks', '技巧'],
        '资源合集': ['collection', '合集', '300+', 'everything'],
        
        # Features
        '效率提升': ['productivity', 'save time', 'hours', '效率', '省时'],
        '自动化': ['automation', 'automated', '自动化'],
        '安全': ['security', 'safety', 'filter', '安全'],
        
        # Topics
        'AI Agent': ['agent', 'agentic', 'ai agent'],
        '开发者向': ['developer', 'dev', 'code', 'repo', 'github', '开发'],
    }
    
    text = f"{title} {content[:2000]} {summary}".lower()
    tags = []
    
    for tag, keywords in TAG_RULES.items():
        for keyword in keywords:
            if keyword.lower() in text:
                tags.append(tag)
                break
    
    return tags


def fetch_x_article(url: str) -> dict:
    """Fetch article content from X.com using fxtwitter API."""
    
    # Extract username and status ID from URL
    match = re.search(r'x\.com/([^/]+)/(?:status|article)/(\d+)', url)
    if not match:
        raise ValueError(f"Invalid X.com URL format: {url}")
    
    username = match.group(1)
    status_id = match.group(2)
    
    api_url = f"https://api.fxtwitter.com/{username}/status/{status_id}"
    
    try:
        with urllib.request.urlopen(api_url, timeout=30) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        raise RuntimeError(f"Failed to fetch from fxtwitter: {e}")
    
    if data.get("code") != 200:
        raise RuntimeError(f"fxtwitter API error: {data.get('message', 'Unknown error')}")
    
    tweet = data.get("tweet", {})
    article = tweet.get("article", {})
    
    # Extract author info
    author_data = tweet.get("author", {})
    author = author_data.get("name", "")
    author_username = author_data.get("screen_name", "")
    
    # Extract cover image from article
    cover_media = article.get("cover_media", {})
    media_info = cover_media.get("media_info", {})
    cover_image = media_info.get("original_img_url", "")
    
    # Build media map from media_entities
    # media_id (string) -> url mapping
    media_id_to_url = {}
    media_entities = article.get("media_entities", []) or []
    
    for m in media_entities:
        media_id = str(m.get("media_id", ""))
        # Try different URL fields
        media_url = (
            m.get("media_info", {}).get("original_img_url") or
            m.get("media_info", {}).get("url") or
            m.get("url") or
            m.get("media_url")
        )
        if media_id and media_url:
            media_id_to_url[media_id] = media_url
    
    # Also check tweet media
    tweet_media = tweet.get("media", []) or tweet.get("photos", []) or []
    for m in tweet_media:
        media_id = str(m.get("id") or m.get("media_id") or "")
        media_url = m.get("url") or m.get("media_url") or m.get("full_url") or ""
        if media_id and media_url:
            media_id_to_url[media_id] = media_url
    
    # Build entityMap lookup: key -> entity
    entity_map = article.get("content", {}).get("entityMap", [])
    entity_by_key = {}
    for entity in entity_map:
        key = str(entity.get("key", ""))
        entity_by_key[key] = entity
    
    # Extract title
    title = article.get("title", "")
    preview_text = article.get("preview_text", "")
    
    # Extract content with media
    content_blocks = article.get("content", {}).get("blocks", [])
    
    content_parts = []
    media_found = []
    
    for block in content_blocks:
        block_type = block.get("type", "")
        block_key = block.get("key", "")
        
        # Check if this block has a media entity reference
        entity_ranges = block.get("entityRanges", [])
        for er in entity_ranges:
            key = str(er.get("key", ""))
            if key in entity_by_key:
                entity = entity_by_key[key]
                entity_type = entity.get("value", {}).get("type", "")
                
                if entity_type == "MEDIA":
                    # Get mediaItems to find localMediaId
                    media_items = entity.get("value", {}).get("data", {}).get("mediaItems", [])
                    for mi in media_items:
                        local_media_id = str(mi.get("localMediaId", ""))
                        media_id = str(mi.get("mediaId", ""))
                        
                        # Try to find URL via localMediaId -> media_entities
                        img_url = None
                        
                        # Method 1: Look up by localMediaId in media_entities
                        for me in media_entities:
                            if str(me.get("id", "")) == local_media_id:
                                img_url = me.get("media_info", {}).get("original_img_url")
                                break
                            # Also check by position in list (localMediaId is often 1-indexed position)
                            # Actually localMediaId is a string like "1", "3", etc.
                        
                        # Method 2: If we have media_id, look it up directly
                        if not img_url and media_id in media_id_to_url:
                            img_url = media_id_to_url[media_id]
                        
                        # Method 3: Try to find by media_id in media_entities
                        if not img_url:
                            for me in media_entities:
                                if str(me.get("media_id", "")) == media_id:
                                    img_url = me.get("media_info", {}).get("original_img_url")
                                    break
                        
                        if img_url:
                            img_tag = f'\n<img src="{img_url}" alt="文章图片" style="max-width:100%;margin:12px 0;border-radius:8px;" />\n'
                            content_parts.append(img_tag)
                            media_found.append(f"图片: {img_url[:80]}...")
                            break
        
        # Handle block types
        if block_type in ("unstyled", "paragraph"):
            text = block.get("text", "")
            if text.strip():
                content_parts.append(text)
        
        elif block_type == "header-two":
            text = block.get("text", "")
            if text.strip():
                content_parts.append(f"## {text}")
        
        elif block_type == "header-three":
            text = block.get("text", "")
            if text.strip():
                content_parts.append(f"### {text}")
        
        elif block_type == "ordered-list-item":
            text = block.get("text", "")
            if text.strip():
                content_parts.append(f"1. {text}")
        
        elif block_type == "unordered-list-item":
            text = block.get("text", "")
            if text.strip():
                content_parts.append(f"* {text}")
        
        elif block_type == "blockquote":
            text = block.get("text", "")
            if text.strip():
                content_parts.append(f"> {text}")
        
        elif block_type == "atomic":
            text = block.get("text", " ")
            if text.strip():
                content_parts.append(text)
    
    content = "\n\n".join(content_parts)
    
    # If no content, use preview_text
    if not content.strip():
        content = preview_text
    
    # Extract published date
    created_at = tweet.get("created_at", "")
    published_at = ""
    if created_at:
        try:
            dt = datetime.strptime(created_at, "%a %b %d %H:%M:%S %z %Y")
            published_at = dt.isoformat()
        except:
            published_at = created_at
    
    # Detect language
    chinese_chars = sum(1 for c in (title + " " + content[:500]) if '\u4e00' <= c <= '\u9fff')
    total_chars = len((title + " " + content[:500]))
    original_language = "zh" if (total_chars > 0 and chinese_chars / total_chars > 0.2) else "en"
    
    # Auto-detect tags based on title and content (no summary generation)
    tags = detect_tags(title, content, "")
    
    return {
        "url": url,
        "title": title,
        "author": author,
        "authorUsername": author_username,
        "content": content,
        "coverImage": cover_image,
        "publishedAt": published_at,
        "originalLanguage": original_language,
        "tags": tags,
        "status": "pending_translation"
    }


def post_to_blog(article_data: dict, api_url: str = "http://localhost:3001/api/articles") -> dict:
    """Post article to the blog API."""
    
    json_data = json.dumps(article_data).encode("utf-8")
    
    req = urllib.request.Request(
        api_url,
        data=json_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        if e.code == 409 and "already exists" in error_body:
            return {"status": "exists", "message": "Article already exists"}
        raise RuntimeError(f"HTTP {e.code}: {error_body}")
    except Exception as e:
        raise RuntimeError(f"Failed to post to blog: {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 fetch_and_post.py <x_url> [blog_api_url]")
        sys.exit(1)
    
    x_url = sys.argv[1]
    blog_api_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3001/api/articles"
    
    print(f"Fetching article from: {x_url}")
    article_data = fetch_x_article(x_url)
    
    print(f"\n=== Article Data (needs translation) ===")
    print(f"Title: {article_data['title']}")
    print(f"Author: {article_data['author']} (@{article_data['authorUsername']})")
    print(f"Language: {article_data['originalLanguage']}")
    print(f"Content length: {len(article_data['content'])} chars")
    if article_data.get("tags"):
        print(f"Tags: {', '.join(article_data['tags'])}")
    if article_data.get("coverImage"):
        print(f"Cover image: {article_data['coverImage'][:80]}...")
    
    # Always post to blog with status pending_translation
    # The AI will pick this up and translate
    print(f"\nPosting to blog: {blog_api_url}")
    result = post_to_blog(article_data, blog_api_url)
    
    if result.get("status") == "exists":
        print(f"\nArticle already exists!")
    else:
        print(f"\nSuccess! Article ID: {result.get('data', {}).get('id') or result.get('id')}")
        print(f"Status: pending_translation - AI will translate this article")
    
    return result


if __name__ == "__main__":
    main()
