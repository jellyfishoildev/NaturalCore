import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Types ────────────────────────────────────────────────────────────────────
export interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  healthScore: number
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  diets: string[]
  dishTypes: string[]
  summary?: string
}

// ── Helper: ตรวจสอบว่าเป็นภาษาไทยมั้ย ───────────────────────────────────────
function isThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

// ── Helper: แปลภาษาไทย → อังกฤษ ด้วย Gemini ────────────────────────────────
async function translateToEnglish(thaiQuery: string, geminiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(
      `แปลคำค้นหาอาหารนี้เป็นภาษาอังกฤษสำหรับใช้กับ API ค้นหาเมนู: "${thaiQuery}"
      ตอบเป็น JSON เท่านั้น รูปแบบ: {"en": "คำแปลภาษาอังกฤษ"}
      ห้ามอธิบายเพิ่มเติม ตอบแค่ JSON เท่านั้น`
    )
    const text = result.response.text().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)
    return parsed.en || thaiQuery
  } catch {
    return thaiQuery
  }
}

// ── Helper: ดึงจาก Spoonacular ───────────────────────────────────────────────
async function fetchFromSpoonacular(
  query: string,
  exclude: string,
  diet: string,
  maxCalories: string
): Promise<{ recipes: Recipe[]; usedMock: boolean }> {
  const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY

  if (!SPOONACULAR_KEY || SPOONACULAR_KEY === 'YOUR_SPOONACULAR_API_KEY_HERE') {
    return { recipes: getMockRecipes(query), usedMock: true }
  }

  const params = new URLSearchParams({
    query,
    addRecipeNutrition: 'true',
    number: '12',
    apiKey: SPOONACULAR_KEY,
    ...(exclude && { excludeIngredients: exclude }),
    ...(diet && { diet }),
    ...(maxCalories && { maxCalories }),
  })

  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`)

    if (!res.ok) {
      console.error('Spoonacular error status:', res.status)
      return { recipes: getMockRecipes(query), usedMock: true }
    }

    const data = await res.json()
    console.log('Spoonacular response:', JSON.stringify(data).slice(0, 200))

    if (!data.results || data.results.length === 0) {
      return { recipes: getMockRecipes(query), usedMock: true }
    }

    const recipes = data.results.map((r: any) => ({
      id: r.id,
      title: r.title,
      image: r.image,
      readyInMinutes: r.readyInMinutes ?? 30,
      servings: r.servings ?? 2,
      healthScore: r.healthScore ?? 0,
      calories: Math.round(r.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount ?? 0),
      protein: Math.round(r.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount ?? 0),
      carbs: Math.round(r.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount ?? 0),
      fat: Math.round(r.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount ?? 0),
      diets: r.diets ?? [],
      dishTypes: r.dishTypes ?? [],
    }))

    return { recipes, usedMock: false }
  } catch (err) {
    console.error('Spoonacular fetch error:', err)
    return { recipes: getMockRecipes(query), usedMock: true }
  }
}

// ── Helper: Gemini วิเคราะห์ insight ────────────────────────────────────────
async function analyzeWithGemini(
  originalQuery: string,
  translatedQuery: string,
  exclude: string,
  recipes: Recipe[]
): Promise<string> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return `พบเมนูที่เกี่ยวกับ "${originalQuery}" จำนวน ${recipes.length} รายการ เหมาะสำหรับผู้รักสุขภาพ`
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const menuList = recipes.slice(0, 5).map(r => r.title).join(', ')
    const excludeText = exclude ? `(ไม่มีส่วนผสม: ${exclude})` : ''

    const result = await model.generateContent(
      `คุณเป็นนักโภชนาการผู้เชี่ยวชาญของเว็บ Natural Core
ผู้ใช้ค้นหาเมนู "${originalQuery}" ${excludeText}
พบเมนูเหล่านี้: ${menuList}
กรุณาตอบสั้นๆ 2-3 ประโยค เป็นภาษาไทย เกี่ยวกับประโยชน์ต่อสุขภาพและเหมาะกับไลฟ์สไตล์แบบไหน
ห้ามใส่ bullet points ตอบเป็นย่อหน้าเดียว`
    )
    return result.response.text()
  } catch (err) {
    console.error('Gemini insight error:', err)
    return `เมนู "${originalQuery}" อุดมไปด้วยสารอาหารที่มีประโยชน์ต่อร่างกาย เหมาะสำหรับผู้ที่ใส่ใจสุขภาพ`
  }
}

// ── Mock data ────────────────────────────────────────────────────────────────
function getMockRecipes(query: string): Recipe[] {
  return [
    { id: 1, title: `Grilled ${query} with Herbs`, image: 'https://img.spoonacular.com/recipes/715415-312x231.jpg', readyInMinutes: 25, servings: 2, healthScore: 87, calories: 320, protein: 38, carbs: 8, fat: 14, diets: ['gluten free', 'dairy free'], dishTypes: ['main course'] },
    { id: 2, title: `${query} Buddha Bowl`, image: 'https://img.spoonacular.com/recipes/716429-312x231.jpg', readyInMinutes: 35, servings: 2, healthScore: 92, calories: 450, protein: 32, carbs: 45, fat: 12, diets: ['vegan', 'gluten free'], dishTypes: ['main course', 'lunch'] },
    { id: 3, title: `${query} Mediterranean Salad`, image: 'https://img.spoonacular.com/recipes/716268-312x231.jpg', readyInMinutes: 15, servings: 4, healthScore: 95, calories: 280, protein: 28, carbs: 12, fat: 16, diets: ['mediterranean', 'gluten free'], dishTypes: ['salad', 'lunch'] },
    { id: 4, title: `${query} Stir Fry with Vegetables`, image: 'https://img.spoonacular.com/recipes/663559-312x231.jpg', readyInMinutes: 20, servings: 3, healthScore: 88, calories: 380, protein: 35, carbs: 22, fat: 15, diets: ['dairy free'], dishTypes: ['main course', 'dinner'] },
    { id: 5, title: `Baked ${query} with Lemon`, image: 'https://img.spoonacular.com/recipes/640803-312x231.jpg', readyInMinutes: 40, servings: 2, healthScore: 90, calories: 350, protein: 42, carbs: 5, fat: 18, diets: ['gluten free', 'ketogenic'], dishTypes: ['main course'] },
    { id: 6, title: `${query} Power Bowl`, image: 'https://img.spoonacular.com/recipes/716408-312x231.jpg', readyInMinutes: 30, servings: 2, healthScore: 94, calories: 520, protein: 40, carbs: 48, fat: 14, diets: ['high protein'], dishTypes: ['lunch', 'dinner'] },
  ]
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || 'healthy'
  const exclude = searchParams.get('exclude') || ''
  const diet = searchParams.get('diet') || ''
  const maxCalories = searchParams.get('maxCalories') || ''

  const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

  try {
    // 1. ถ้าเป็นภาษาไทย แปลก่อน
    let searchQuery = query
    if (isThai(query) && GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      searchQuery = await translateToEnglish(query, GEMINI_KEY)
      console.log(`Translated: "${query}" → "${searchQuery}"`)
    }

    // 2. ค้นหาจาก Spoonacular ด้วยคำภาษาอังกฤษ
    const { recipes, usedMock } = await fetchFromSpoonacular(searchQuery, exclude, diet, maxCalories)

    // 3. Gemini วิเคราะห์ insight (ใช้ query ภาษาไทยเดิมใน prompt)
    const insight = await analyzeWithGemini(query, searchQuery, exclude, recipes)

    return NextResponse.json({
      recipes,
      insight,
      total: recipes.length,
      translatedQuery: searchQuery !== query ? searchQuery : null,
      usedMock,
    })
  } catch (err) {
    console.error('Search API error:', err)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่', recipes: [], insight: '' },
      { status: 500 }
    )
  }
}
