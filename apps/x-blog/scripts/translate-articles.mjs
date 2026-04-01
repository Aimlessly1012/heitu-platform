/**
 * Translate articles using chunked MyMemory API
 * Free tier: 5000 chars/day, 500 chars per request
 */

import Database from 'better-sqlite3';

const db = new Database('./data/articles.db');
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

async function translateChunk(text, sourceLang = 'en', targetLang = 'zh') {
  if (!text || text.trim() === '') return '';
  
  // MyMemory free tier: 500 chars per request
  const maxChars = 450; // Leave room for overhead
  const chunks = [];
  
  // Split by sentence/paragraph when possible
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChars) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      // If single sentence is too long, split by words
      if (sentence.length > maxChars) {
        const words = sentence.split(' ');
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).length <= maxChars) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  
  // Translate each chunk
  const translatedChunks = [];
  for (const chunk of chunks) {
    const langPair = `${sourceLang}|${targetLang === 'zh' ? 'ZH' : targetLang}`;
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(chunk)}&langpair=${langPair}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        translatedChunks.push(data.responseData.translatedText);
      } else {
        console.error(`  Chunk failed: ${data.responseDetails}`);
        translatedChunks.push(chunk); // Fallback to original
      }
    } catch (error) {
      console.error(`  Chunk error:`, error.message);
      translatedChunks.push(chunk);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  
  return translatedChunks.join('');
}

async function translateArticle(article) {
  console.log(`\nTranslating: ${article.title}`);
  console.log(`  Content length: ${article.content?.length || 0} chars`);
  
  let translatedContent = null;
  if (article.content && article.originalLanguage !== 'zh') {
    console.log('  Translating content...');
    translatedContent = await translateChunk(article.content);
    console.log(`  Content translated: ${translatedContent?.length || 0} chars`);
  } else if (article.originalLanguage === 'zh' || !article.content) {
    translatedContent = article.content;
  }
  
  let translatedSummary = null;
  if (article.summary && article.originalLanguage !== 'zh') {
    console.log('  Translating summary...');
    translatedSummary = await translateChunk(article.summary, article.originalLanguage || 'en', 'zh');
    console.log(`  Summary translated`);
  }
  
  return { translatedContent, translatedSummary };
}

async function main() {
  console.log('Starting chunked article translation...\n');
  console.log('Note: MyMemory free API allows ~5000 chars/day, translating in chunks\n');
  
  // Get articles needing translation
  const articles = db.prepare(`
    SELECT id, title, content, summary, original_language as originalLanguage, 
           translated_content as translatedContent
    FROM articles 
    ORDER BY created_at DESC
  `).all();
  
  const needsTranslation = articles.filter(a => 
    (!a.translatedContent || a.translatedContent === '') && 
    a.content && 
    a.originalLanguage !== 'zh'
  );
  
  console.log(`Articles needing translation: ${needsTranslation.length}`);
  console.log(`Total chars to translate: ${needsTranslation.reduce((sum, a) => sum + (a.content?.length || 0), 0)}`);
  
  for (const article of needsTranslation) {
    console.log(`\n--- Processing: ${article.id} ---`);
    try {
      const { translatedContent, translatedSummary } = await translateArticle(article);
      
      if (translatedContent) {
        const stmt = db.prepare(`
          UPDATE articles 
          SET translated_content = ?, translated_summary = ?, updated_at = datetime('now')
          WHERE id = ?
        `);
        stmt.run(translatedContent, translatedSummary || article.summary, article.id);
        console.log(`  ✓ Saved to database`);
      }
    } catch (error) {
      console.error(`  Error:`, error.message);
    }
  }
  
  console.log('\n=== Translation batch complete! ===');
  
  // Status
  const updated = db.prepare(`
    SELECT id, title, 
           CASE WHEN translated_content IS NOT NULL AND translated_content != '' THEN '✓' ELSE '✗' END as translated
    FROM articles 
    ORDER BY created_at DESC
  `).all();
  
  console.log('\nStatus:');
  updated.forEach(a => console.log(`  [${a.translated}] ${a.title.substring(0, 60)}`));
  
  db.close();
}

main().catch(console.error);
