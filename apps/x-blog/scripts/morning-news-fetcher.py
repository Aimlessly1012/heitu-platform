#!/usr/bin/env python3
"""
每日晨报抓取脚本 - Claude 资讯
每天早上自动运行，抓取最新资讯并存入数据库
"""

import os
import sys
import json
import subprocess
import sqlite3
from datetime import datetime

# 路径配置
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'articles.db')

# Tavily API Key
TAVILY_API_KEY = os.environ.get('TAVILY_API_KEY', '')
TAVILY_API_URL = 'https://api.tavily.io/v1/search'

def search_tavily(query, max_results=5):
    """使用 Tavily API 搜索"""
    import urllib.request
    import urllib.parse
    
    data = {
        'api_key': TAVILY_API_KEY,
        'query': query,
        'max_results': max_results,
        'include_answer': True,
        'include_raw_content': False
    }
    
    req = urllib.request.Request(
        TAVILY_API_URL,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))

def generate_id():
    """生成随机ID"""
    import random
    return 'morning_' + datetime.now().strftime('%Y%m%d') + '_' + ''.join(
        random.choice('abcdefghijklmnopqrstuvwxyz0123456789') for _ in range(10)
    )

def save_to_db(items, date_str):
    """保存到数据库"""
    if not items:
        print("没有内容需要保存")
        return
    
    # 确保数据库目录存在
    os.makedirs(DATA_DIR, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    saved = 0
    for item in items:
        item_id = generate_id()
        now = datetime.now().isoformat()
        
        # 检查是否已存在
        cursor.execute('SELECT id FROM articles WHERE url = ?', (item.get('url', ''),))
        if cursor.fetchone():
            print(f"已存在: {item.get('title', '')[:30]}...")
            continue
        
        tags = json.dumps(item.get('tags', ['晨报', 'Claude']))
        
        cursor.execute('''
            INSERT INTO articles (id, url, title, author, authorUsername, content, summary, 
                translatedContent, translatedSummary, originalLanguage, coverImage, publishedAt,
                status, error, tags, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item_id,
            item.get('url', ''),
            item.get('title', ''),
            item.get('author', ''),
            item.get('authorUsername', ''),
            item.get('content', ''),
            item.get('summary', ''),
            item.get('translatedContent', ''),
            item.get('translatedSummary', ''),
            item.get('originalLanguage', 'zh'),
            item.get('coverImage', ''),
            item.get('publishedAt', now),
            'completed',
            None,
            tags,
            now,
            now
        ))
        saved += 1
        print(f"已保存: {item.get('title', '')[:40]}...")
    
    conn.commit()
    conn.close()
    print(f"\n✅ 共保存 {saved} 条晨报")

def main():
    print("🌅 每日晨报抓取开始")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    if not TAVILY_API_KEY:
        print("❌ 未设置 TAVILY_API_KEY")
        sys.exit(1)
    
    # 搜索主题
    queries = [
        ("Claude AI 新功能 2026", 5),
        ("Claude Code 技巧 2026", 3),
        ("Anthropic 最新消息", 2),
    ]
    
    all_items = []
    
    for query, max_results in queries:
        print(f"\n🔍 搜索: {query}")
        try:
            result = search_tavily(query, max_results)
            
            for r in result.get('results', []):
                item = {
                    'title': r.get('title', ''),
                    'url': r.get('url', ''),
                    'content': r.get('content', ''),
                    'summary': r.get('description', ''),
                    'author': '',
                    'authorUsername': '',
                    'publishedAt': datetime.now().isoformat(),
                    'tags': ['晨报', 'Claude', 'AI资讯'],
                }
                
                # 根据关键词添加更多标签
                title_lower = r.get('title', '').lower()
                if 'claude code' in title_lower or 'code' in title_lower:
                    item['tags'].append('Claude Code')
                if 'tip' in title_lower or '技巧' in title_lower:
                    item['tags'].append('实用技巧')
                if 'new' in title_lower or '功能' in title_lower:
                    item['tags'].append('新功能')
                    
                all_items.append(item)
            
            if result.get('answer'):
                print(f"   摘要: {result['answer'][:80]}...")
                
        except Exception as e:
            print(f"   搜索失败: {e}")
    
    # 去重
    seen_urls = set()
    unique_items = []
    for item in all_items:
        if item['url'] not in seen_urls:
            seen_urls.add(item['url'])
            unique_items.append(item)
    
    print(f"\n📊 共获取 {len(unique_items)} 条资讯")
    
    # 保存到数据库
    date_str = datetime.now().strftime('%Y%m%d')
    save_to_db(unique_items, date_str)
    
    print("\n✨ 抓取完成!")

if __name__ == '__main__':
    main()
