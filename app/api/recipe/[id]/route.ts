import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY

  if (!SPOONACULAR_KEY || SPOONACULAR_KEY === 'YOUR_SPOONACULAR_API_KEY_HERE') {
    return NextResponse.json({ error: 'กรุณาใส่ Spoonacular API Key' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/${params.id}/information?includeNutrition=true&apiKey=${SPOONACULAR_KEY}`
    )
    const data = await res.json()

    // ให้ Gemini สรุปวิธีทำและประโยชน์
    let aiSummary = ''
    if (GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(
        `สรุปประโยชน์ต่อสุขภาพของเมนู "${data.title}" สั้นๆ 2 ประโยค เป็นภาษาไทย`
      )
      aiSummary = result.response.text()
    }

    return NextResponse.json({ ...data, aiSummary })
  } catch (err) {
    return NextResponse.json({ error: 'ไม่พบข้อมูลเมนู' }, { status: 500 })
  }
}
