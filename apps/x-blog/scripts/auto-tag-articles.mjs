import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, '..', 'data', 'articles.db')

// 标签规则库
const TAG_RULES = {
  // 产品/工具
  'Claude': ['claude', 'anthropic'],
  'Claude Code': ['claude code', 'coding', 'shortcuts', '快捷键'],
  'OpenClaw': ['openclaw', 'plano', 'filter chain'],
  'Skills': ['skills', 'agent skills', '技能'],
  'MCP': ['mcp', 'model context protocol'],
  'Prompt Engineering': ['prompt', 'prompting', '提示词'],
  
  // 内容类型
  '教程': ['教程', 'tutorial', 'guide', '指南', '上手'],
  '最佳实践': ['best practice', 'practices', '实践'],
  '快捷键': ['shortcut', 'hotkey', '快捷键', 'keyboard'],
  '工作流': ['workflow', '工作流'],
  '技巧': ['tips', 'tricks', '技巧'],
  '资源合集': ['collection', '合集', '300+', 'everything'],
  
  // 功能特性
  '效率提升': ['productivity', 'save time', 'hours', '效率', '省时'],
  '自动化': ['automation', 'automated', '自动化'],
  '安全': ['security', 'safety', 'filter', '安全'],
  
  // 主题
  'AI Agent': ['agent', 'agentic', 'ai agent'],
  '开发者向': ['developer', 'dev', 'code', 'repo', 'github', '开发'],
}

function detectTags(title, content, summary) {
  const text = `${title} ${content || ''} ${summary || ''}`.toLowerCase()
  const tags = new Set()
  
  for (const [tag, keywords] of Object.entries(TAG_RULES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        tags.add(tag)
        break
      }
    }
  }
  
  return Array.from(tags)
}

const db = new Database(DB_PATH)

console.log('🏷️  Auto-tagging articles...\n')

const articles = db.prepare(`
  SELECT id, title, content, summary, translated_content, translated_summary
  FROM articles
  WHERE status = 'completed'
`).all()

console.log(`Found ${articles.length} completed articles\n`)

const updateStmt = db.prepare(`
  UPDATE articles 
  SET tags = ? 
  WHERE id = ?
`)

let updated = 0

for (const article of articles) {
  const content = article.translated_content || article.content || ''
  const summary = article.translated_summary || article.summary || ''
  
  const tags = detectTags(article.title, content.substring(0, 2000), summary)
  
  if (tags.length > 0) {
    updateStmt.run(JSON.stringify(tags), article.id)
    console.log(`✅ ${article.title.substring(0, 50)}...`)
    console.log(`   Tags: ${tags.join(', ')}\n`)
    updated++
  }
}

console.log(`\n🎉 Updated ${updated}/${articles.length} articles with tags!`)

db.close()
