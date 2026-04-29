import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY
  const GEMINI_KEY = process.env.GEMINI_API_KEY

  // ถ้าไม่มี key ให้บอกตรงๆ
  if (!SPOONACULAR_KEY || SPOONACULAR_KEY === 'YOUR_SPOONACULAR_API_KEY_HERE') {
    return NextResponse.json({ error: 'กรุณาใส่ Spoonacular API Key ใน .env.local' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/${params.id}/information?includeNutrition=true&apiKey=${SPOONACULAR_KEY}`
    )

    if (!res.ok) {
      console.error('Spoonacular recipe error:', res.status)
      return NextResponse.json({ error: `Spoonacular error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()

    // ให้ Gemini สรุป (ถ้ามี key)
    let aiSummary = ''
    if (GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await model.generateContent(
          `สรุปประโยชน์ต่อสุขภาพของเมนู "${data.title}" สั้นๆ 2 ประโยค เป็นภาษาไทย`
        )
        aiSummary = result.response.text()
      } catch (err) {
        console.error('Gemini error:', err)
      }
    }

    return NextResponse.json({ ...data, aiSummary })
  } catch (err) {
    console.error('Recipe API error:', err)
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 })
  }
}
