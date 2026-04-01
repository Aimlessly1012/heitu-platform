import { NextRequest, NextResponse } from 'next/server'

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

interface TranslateRequest {
  text: string
  sourceLang?: string
  targetLang?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { text, sourceLang = 'en', targetLang = 'zh' } = body

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // MyMemory API - free tier, 5000 chars/day
    // Lang codes: en|ZH for English to Chinese
    const langPair = `${sourceLang}|${targetLang === 'zh' ? 'ZH' : targetLang}`
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData) {
      return NextResponse.json({
        translatedText: data.responseData.translatedText,
        match: data.responseData.match
      })
    } else {
      return NextResponse.json(
        { error: 'Translation failed', details: data },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation service error' },
      { status: 500 }
    )
  }
}
