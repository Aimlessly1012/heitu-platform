#!/usr/bin/env node

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

console.log('🗄️  初始化 X-Blog 数据库...\n');

// 确保 data 目录存在
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 创建 data/ 目录');
}

// 创建数据库
const db = new Database('./data/articles.db');
db.pragma('journal_mode = WAL');

console.log('✅ 数据库文件创建成功\n');

// 创建 users 表
console.log('📋 创建 users 表...');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    github_id TEXT UNIQUE,
    google_id TEXT UNIQUE,
    name TEXT,
    email TEXT,
    image TEXT,
    status TEXT DEFAULT 'pending',
    is_admin INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);
console.log('✅ users 表创建成功');

// 创建 articles 表
console.log('📋 创建 articles 表...');
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    author TEXT,
    author_username TEXT,
    published_at TEXT,
    content TEXT,
    summary TEXT,
    cover_image TEXT,
    translated_content TEXT,
    translated_summary TEXT,
    original_language TEXT,
    status TEXT DEFAULT 'pending',
    tags TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);
console.log('✅ articles 表创建成功');

// 创建 author_recommendations 表
console.log('📋 创建 author_recommendations 表...');
db.exec(`
  CREATE TABLE IF NOT EXISTS author_recommendations (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    specialties TEXT,
    submitted_by TEXT,
    submitted_at INTEGER DEFAULT (strftime('%s', 'now')),
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at INTEGER
  )
`);
console.log('✅ author_recommendations 表创建成功');

// 创建索引
console.log('📋 创建索引...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
  CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
  CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
`);
console.log('✅ 索引创建成功');

db.close();

console.log('\n🎉 数据库初始化完成！');
console.log('\n📊 数据库信息:');
console.log(`   位置: ${path.resolve('./data/articles.db')}`);
console.log(`   大小: ${fs.statSync('./data/articles.db').size} bytes`);
console.log('\n✅ 现在可以运行 npm run dev 了！');
