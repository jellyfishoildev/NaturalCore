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

// ── Helper: ดึงจาก Spoonacular ───────────────────────────────────────────────
async function fetchFromSpoonacular(
  query: string,
  exclude: string,
  diet: string,
  maxCalories: string
): Promise<Recipe[]> {
  const SPOONACULAR_KEY = process.env.SPOONACULAR_API_KEY

  // ถ้าไม่มี Spoonacular key ให้ใช้ mock data
  if (!SPOONACULAR_KEY || SPOONACULAR_KEY === 'YOUR_SPOONACULAR_API_KEY_HERE') {
    return getMockRecipes(query)
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

  const res = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params}`
  )

  if (!res.ok) {
    console.error('Spoonacular error:', res.status)
    return getMockRecipes(query)
  }

  const data = await res.json()

  return data.results.map((r: any) => ({
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
}

// ── Helper: ให้ Gemini วิเคราะห์ ─────────────────────────────────────────────
async function analyzeWithGemini(
  query: string,
  exclude: string,
  recipes: Recipe[]
): Promise<string> {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return `พบเมนูที่เกี่ยวกับ "${query}" จำนวน ${recipes.length} รายการ เหมาะสำหรับผู้รักสุขภาพ`
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const menuList = recipes.slice(0, 5).map(r => r.title).join(', ')
    const excludeText = exclude ? `(ไม่มีส่วนผสม: ${exclude})` : ''

    const prompt = `
คุณเป็นนักโภชนาการผู้เชี่ยวชาญ 
ผู้ใช้ค้นหาเมนู "${query}" ${excludeText}
พบเมนูเหล่านี้: ${menuList}

กรุณาตอบสั้นๆ 2-3 ประโยค เป็นภาษาไทย เกี่ยวกับ:
1. ประโยชน์ต่อสุขภาพของเมนูเหล่านี้
2. เหมาะกับใครหรือไลฟ์สไตล์แบบไหน

ห้ามใส่ bullet points ให้ตอบเป็นย่อหน้าเดียว
`
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error('Gemini error:', err)
    return `เมนู "${query}" เหล่านี้อุดมไปด้วยสารอาหารที่มีประโยชน์ต่อร่างกาย เหมาะสำหรับผู้ที่ใส่ใจสุขภาพ`
  }
}

// ── Mock data สำหรับ test ก่อนมี API key ────────────────────────────────────
function getMockRecipes(query: string): Recipe[] {
  const mockData: Recipe[] = [
    {
      id: 1, title: `Grilled ${query} with Herbs`,
      image: 'https://img.spoonacular.com/recipes/715415-312x231.jpg',
      readyInMinutes: 25, servings: 2, healthScore: 87,
      calories: 320, protein: 38, carbs: 8, fat: 14,
      diets: ['gluten free', 'dairy free'], dishTypes: ['main course'],
    },
    {
      id: 2, title: `${query} Buddha Bowl`,
      image: 'https://img.spoonacular.com/recipes/716429-312x231.jpg',
      readyInMinutes: 35, servings: 2, healthScore: 92,
      calories: 450, protein: 32, carbs: 45, fat: 12,
      diets: ['vegan', 'gluten free'], dishTypes: ['main course', 'lunch'],
    },
    {
      id: 3, title: `${query} Mediterranean Salad`,
      image: 'https://img.spoonacular.com/recipes/716268-312x231.jpg',
      readyInMinutes: 15, servings: 4, healthScore: 95,
      calories: 280, protein: 28, carbs: 12, fat: 16,
      diets: ['mediterranean', 'gluten free'], dishTypes: ['salad', 'lunch'],
    },
    {
      id: 4, title: `${query} Stir Fry with Vegetables`,
      image: 'https://img.spoonacular.com/recipes/663559-312x231.jpg',
      readyInMinutes: 20, servings: 3, healthScore: 88,
      calories: 380, protein: 35, carbs: 22, fat: 15,
      diets: ['dairy free'], dishTypes: ['main course', 'dinner'],
    },
    {
      id: 5, title: `Baked ${query} with Lemon`,
      image: 'https://img.spoonacular.com/recipes/640803-312x231.jpg',
      readyInMinutes: 40, servings: 2, healthScore: 90,
      calories: 350, protein: 42, carbs: 5, fat: 18,
      diets: ['gluten free', 'ketogenic'], dishTypes: ['main course'],
    },
    {
      id: 6, title: `${query} Power Bowl`,
      image: 'https://img.spoonacular.com/recipes/716408-312x231.jpg',
      readyInMinutes: 30, servings: 2, healthScore: 94,
      calories: 520, protein: 40, carbs: 48, fat: 14,
      diets: ['high protein'], dishTypes: ['lunch', 'dinner'],
    },
  ]
  return mockData
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || 'healthy'
  const exclude = searchParams.get('exclude') || ''
  const diet = searchParams.get('diet') || ''
  const maxCalories = searchParams.get('maxCalories') || ''

  try {
    const [recipes, aiInsight] = await Promise.all([
      fetchFromSpoonacular(query, exclude, diet, maxCalories),
      // AI insight จะทำหลัง recipes มา แต่เพื่อ performance ทำพร้อมกัน
      analyzeWithGemini(query, exclude, []).then(() => ''),
    ])

    // ทำ AI insight หลังได้ recipes
    const insight = await analyzeWithGemini(query, exclude, recipes)

    return NextResponse.json({ recipes, insight, total: recipes.length })
  } catch (err) {
    console.error('Search API error:', err)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่', recipes: [], insight: '' },
      { status: 500 }
    )
  }
}
