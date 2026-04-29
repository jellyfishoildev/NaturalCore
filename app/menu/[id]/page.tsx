'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Clock, Users, Flame, Heart, Leaf,
  ChefHat, ListChecks, BarChart3, Sparkles, AlertCircle
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Nutrient { name: string; amount: number; unit: string; percentOfDailyNeeds: number }
interface Ingredient { id: number; name: string; amount: number; unit: string; image: string }
interface Step { number: number; step: string; ingredients: { name: string }[] }

interface RecipeDetail {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  healthScore: number
  summary: string
  diets: string[]
  dishTypes: string[]
  extendedIngredients: Ingredient[]
  analyzedInstructions: { steps: Step[] }[]
  nutrition?: { nutrients: Nutrient[] }
  aiSummary?: string
  // mock fallback fields
  isMock?: boolean
  mockIngredients?: string[]
  mockSteps?: string[]
  mockNutrients?: { name: string; amount: number; unit: string; percent: number }[]
}

// ── Mock detail data ─────────────────────────────────────────────────────────
function getMockDetail(id: string, title: string): RecipeDetail {
  return {
    id: Number(id),
    title: title || 'Healthy Recipe',
    image: `https://placehold.co/800x500/e4ede4/4f7f4f?text=${encodeURIComponent(title?.slice(0,14) || 'Recipe')}`,
    readyInMinutes: 30,
    servings: 2,
    healthScore: 88,
    summary: 'เมนูนี้เป็นตัวอย่างจาก Mock Data เนื่องจากยังไม่ได้ตั้งค่า Spoonacular API Key กรุณาใส่ API Key ใน .env.local เพื่อดูข้อมูลจริง',
    diets: ['gluten free', 'dairy free'],
    dishTypes: ['main course'],
    extendedIngredients: [],
    analyzedInstructions: [],
    isMock: true,
    mockIngredients: [
      '200g วัตถุดิบหลัก (เช่น ปลาแซลมอน, ไก่, เต้าหู้)',
      '2 ช้อนโต๊ะ น้ำมันมะกอก',
      '3 กลีบ กระเทียมสับ',
      '1 ช้อนชา เกลือ',
      '½ ช้อนชา พริกไทยดำ',
      '1 ถ้วย ผักตามชอบ (บรอกโคลี, ผักโขม)',
      '1 ช้อนโต๊ะ น้ำมะนาว',
      'สมุนไพรสด เช่น ผักชี หรือ โหระพา',
    ],
    mockSteps: [
      'เตรียมวัตถุดิบทั้งหมด ล้างและหั่นให้พร้อม',
      'ตั้งกระทะบนไฟกลาง ใส่น้ำมันมะกอกรอให้ร้อน',
      'ใส่กระเทียมลงผัดจนหอม ประมาณ 1-2 นาที',
      'ใส่วัตถุดิบหลักลงปรุง ปรุงรสด้วยเกลือและพริกไทย',
      'เพิ่มผักลงไปผัดให้สุก ราดน้ำมะนาวก่อนเสิร์ฟ',
      'จัดเสิร์ฟพร้อมสมุนไพรสดตกแต่ง',
    ],
    mockNutrients: [
      { name: 'Calories', amount: 350, unit: 'kcal', percent: 18 },
      { name: 'Protein', amount: 38, unit: 'g', percent: 76 },
      { name: 'Carbohydrates', amount: 12, unit: 'g', percent: 4 },
      { name: 'Fat', amount: 16, unit: 'g', percent: 25 },
      { name: 'Fiber', amount: 4, unit: 'g', percent: 16 },
      { name: 'Sodium', amount: 480, unit: 'mg', percent: 21 },
    ],
    aiSummary: 'เมนูนี้อุดมไปด้วยโปรตีนและสารอาหารที่จำเป็น เหมาะสำหรับผู้ที่ต้องการดูแลสุขภาพและรักษาน้ำหนัก',
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
}

const KEY_NUTRIENTS = ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fiber', 'Sodium', 'Sugar', 'Vitamin C', 'Iron', 'Calcium']

// ── Component ────────────────────────────────────────────────────────────────
export default function MenuDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps' | 'nutrition'>('ingredients')

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const savedTitle = sessionStorage.getItem(`recipe-title-${id}`) || ''
        const res = await fetch(`/api/recipe/${id}`)
        if (!res.ok) throw new Error('not found')
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setRecipe(data)
      } catch {
        // fallback to mock
        const savedTitle = sessionStorage.getItem(`recipe-title-${id}`) || ''
        setRecipe(getMockDetail(id, savedTitle))
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-sage-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
        <p className="font-body text-bark-500 text-sm">กำลังโหลดข้อมูลเมนู...</p>
      </div>
    </div>
  )

  if (!recipe) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="font-body text-bark-600">ไม่พบข้อมูลเมนู</p>
        <button onClick={() => router.back()} className="mt-4 text-sage-500 underline font-body text-sm">กลับไปค้นหา</button>
      </div>
    </div>
  )

  const nutrients = recipe.isMock
    ? recipe.mockNutrients!
    : (recipe.nutrition?.nutrients ?? [])
        .filter(n => KEY_NUTRIENTS.includes(n.name))
        .map(n => ({ name: n.name, amount: Math.round(n.amount), unit: n.unit, percent: Math.round(n.percentOfDailyNeeds) }))

  const ingredients = recipe.isMock ? recipe.mockIngredients! : recipe.extendedIngredients
  const steps = recipe.isMock ? recipe.mockSteps! : (recipe.analyzedInstructions?.[0]?.steps ?? [])

  const calories = recipe.isMock
    ? recipe.mockNutrients!.find(n => n.name === 'Calories')?.amount
    : recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount

  return (
    <div className="min-h-screen">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sage-200/30 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full bg-cream-300/50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-20">

        {/* Back button */}
        <div className="pt-8 pb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-bark-500 hover:text-sage-600 font-body text-sm transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            กลับไปค้นหา
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 mb-8 shadow-xl">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://placehold.co/800x500/e4ede4/4f7f4f?text=${encodeURIComponent(recipe.title.slice(0, 12))}`
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Health score */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Heart size={14} className="text-rose-500" fill="currentColor" />
            <span className="font-body font-semibold text-sm text-bark-700">{recipe.healthScore}</span>
          </div>

          {/* Diet tags */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {recipe.diets.slice(0, 3).map(d => (
              <span key={d} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-sage-700 text-xs rounded-full font-body capitalize flex items-center gap-1">
                <Leaf size={10} />
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Title & Meta */}
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display text-3xl sm:text-4xl text-bark-900 leading-tight mb-4">
            {recipe.title}
          </h1>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: <Clock size={16} />, label: `${recipe.readyInMinutes} นาที`, color: 'text-blue-500' },
              { icon: <Users size={16} />, label: `${recipe.servings} คน`, color: 'text-purple-500' },
              { icon: <Flame size={16} />, label: calories ? `${Math.round(calories)} kcal` : 'N/A', color: 'text-orange-500' },
              { icon: <ChefHat size={16} />, label: recipe.dishTypes?.[0] ?? 'Main Course', color: 'text-sage-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-cream-200 font-body text-sm text-bark-600">
                <span className={item.color}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mock data notice */}
        {recipe.isMock && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-700 font-body text-sm animate-fade-up">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>กำลังแสดง Mock Data</strong> — ใส่ Spoonacular API Key ใน .env.local เพื่อดูข้อมูลจริง
            </div>
          </div>
        )}

        {/* AI Summary */}
        {recipe.aiSummary && (
          <div className="mb-8 p-5 bg-sage-50/80 border border-sage-200 rounded-2xl flex gap-3 animate-fade-up">
            <Sparkles size={18} className="text-sage-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-body text-sage-400 uppercase tracking-widest block mb-1">AI วิเคราะห์</span>
              <p className="font-body text-bark-700 text-sm leading-relaxed">{recipe.aiSummary}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {recipe.summary && (
          <div className="mb-8 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-cream-200 animate-fade-up">
            <h2 className="font-display text-lg text-bark-800 mb-2 flex items-center gap-2">
              📋 เกี่ยวกับเมนูนี้
            </h2>
            <p className="font-body text-bark-600 text-sm leading-relaxed">
              {stripHtml(recipe.summary).slice(0, 400)}{recipe.summary.length > 400 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 animate-fade-up">
          <div className="flex gap-1 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-cream-200 w-fit">
            {([
              { id: 'ingredients', label: '🥕 ส่วนผสม', icon: <ListChecks size={14} /> },
              { id: 'steps', label: '👨‍🍳 วิธีทำ', icon: <ChefHat size={14} /> },
              { id: 'nutrition', label: '📊 โภชนาการ', icon: <BarChart3 size={14} /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-body text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-sage-500 text-white shadow-md'
                    : 'text-bark-500 hover:text-bark-700 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-up">

          {/* Ingredients */}
          {activeTab === 'ingredients' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 overflow-hidden">
              <div className="p-5 border-b border-cream-100">
                <h2 className="font-display text-xl text-bark-800">
                  ส่วนผสม
                  <span className="ml-2 text-sm font-body text-bark-400 font-normal">
                    ({Array.isArray(ingredients) ? ingredients.length : 0} รายการ)
                  </span>
                </h2>
              </div>
              <div className="divide-y divide-cream-100">
                {recipe.isMock
                  ? (ingredients as string[]).map((ing, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-sage-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sm flex-shrink-0">
                          🥄
                        </div>
                        <span className="font-body text-bark-700 text-sm">{ing}</span>
                      </div>
                    ))
                  : (ingredients as Ingredient[]).map((ing, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-sage-50/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {ing.image ? (
                            <img
                              src={`https://img.spoonacular.com/ingredients_50x50/${ing.image}`}
                              alt={ing.name}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : <span className="text-sm">🥄</span>}
                        </div>
                        <span className="font-body text-bark-700 text-sm capitalize flex-1">{ing.name}</span>
                        <span className="font-body text-bark-400 text-xs">
                          {ing.amount} {ing.unit}
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>
          )}

          {/* Steps */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {recipe.isMock
                ? (steps as string[]).map((step, i) => (
                    <div key={i} className="flex gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 p-5">
                      <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="font-body text-bark-700 text-sm leading-relaxed pt-1.5">{step}</p>
                    </div>
                  ))
                : (steps as Step[]).length > 0
                  ? (steps as Step[]).map(step => (
                      <div key={step.number} className="flex gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 p-5">
                        <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0">
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-bark-700 text-sm leading-relaxed">{step.step}</p>
                          {step.ingredients.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {step.ingredients.map(ing => (
                                <span key={ing.name} className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs rounded-full font-body capitalize">
                                  {ing.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  : (
                    <div className="text-center py-12 text-bark-400 font-body">
                      <ChefHat size={40} className="mx-auto mb-3 opacity-30" />
                      ไม่มีข้อมูลวิธีทำ กรุณาดูจากเว็บต้นทาง
                    </div>
                  )
              }
            </div>
          )}

          {/* Nutrition */}
          {activeTab === 'nutrition' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 overflow-hidden">
              <div className="p-5 border-b border-cream-100">
                <h2 className="font-display text-xl text-bark-800">ข้อมูลโภชนาการ</h2>
                <p className="font-body text-xs text-bark-400 mt-1">ต่อ 1 serving</p>
              </div>
              <div className="p-5 space-y-4">
                {nutrients.map((n, i) => {
                  const pct = Math.min(n.percent, 100)
                  const color =
                    n.name === 'Calories' ? 'bg-orange-400' :
                    n.name === 'Protein' ? 'bg-blue-400' :
                    n.name === 'Carbohydrates' ? 'bg-amber-400' :
                    n.name === 'Fat' ? 'bg-yellow-500' :
                    n.name === 'Fiber' ? 'bg-sage-400' :
                    'bg-purple-400'
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-body text-sm text-bark-700">{n.name}</span>
                        <span className="font-body text-sm font-medium text-bark-800">
                          {n.amount}{n.unit}
                          <span className="text-bark-400 font-normal ml-1 text-xs">({n.percent}% DV)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
