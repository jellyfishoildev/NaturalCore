'use client'

import { useState, useCallback } from 'react'
import { Leaf, Sparkles, AlertCircle, Info } from 'lucide-react'
import SearchBar from './components/SearchBar'
import FilterPanel, { Filters } from './components/FilterPanel'
import MenuCard from './components/MenuCard'
import SkeletonCard from './components/SkeletonCard'
import { Recipe } from './api/search/route'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [insight, setInsight] = useState('')
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<Filters>({ exclude: [], diet: '', maxCalories: '' })

  const doSearch = useCallback(async (q: string, f: Filters) => {
    if (!q.trim()) return
    setIsLoading(true)
    setError('')
    setHasSearched(true)
    setTranslatedQuery(null)

    try {
      const params = new URLSearchParams({ query: q })
      if (f.exclude.length) params.set('exclude', f.exclude.join(','))
      if (f.diet) params.set('diet', f.diet)
      if (f.maxCalories) params.set('maxCalories', f.maxCalories)

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()

      if (data.error) { setError(data.error); setRecipes([]) }
      else {
        setRecipes(data.recipes)
        setInsight(data.insight)
        setTranslatedQuery(data.translatedQuery || null)
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = (q: string) => { setQuery(q); doSearch(q, filters) }
  const handleFilterChange = (f: Filters) => { setFilters(f); if (query) doSearch(query, f) }

  return (
    <div className="min-h-screen">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sage-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-cream-300/60 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-sage-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20">

        {/* ── HERO ── */}
        <header className="pt-16 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-sage-500 flex items-center justify-center shadow-lg shadow-sage-300/50 animate-float">
                <Leaf size={28} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cream-400 border-2 border-white flex items-center justify-center">
                <Sparkles size={10} className="text-bark-700" />
              </div>
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl text-bark-900 leading-tight mb-2 animate-fade-up">
            Natural
            <span className="italic text-sage-500"> Core</span>
          </h1>
          <p className="font-body text-bark-500 text-base animate-fade-up stagger-2">
            ค้นหาเมนูเพื่อสุขภาพ · รองรับภาษาไทย · วิเคราะห์ด้วย AI
          </p>

          <div className="flex justify-center gap-8 mt-8 animate-fade-up stagger-3">
            {[
              { num: '5,000+', label: 'เมนูอาหาร' },
              { num: 'ไทย / EN', label: 'ค้นหาได้ทั้งสองภาษา' },
              { num: 'AI', label: 'วิเคราะห์โภชนาการ' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="font-display text-2xl font-bold text-sage-600">{item.num}</div>
                <div className="font-body text-xs text-bark-500">{item.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── SEARCH + FILTER ── */}
        <div className="space-y-4 animate-fade-up stagger-4">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <FilterPanel filters={filters} onChange={handleFilterChange} />
        </div>

        {/* ── แสดงคำที่แปลได้ ── */}
        {translatedQuery && !isLoading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-bark-400 font-body">
            <Info size={12} className="text-sage-400" />
            แปล &ldquo;{query}&rdquo; → ค้นหาด้วย &ldquo;<span className="text-sage-600 font-medium">{translatedQuery}</span>&rdquo;
          </div>
        )}

        {/* ── AI INSIGHT ── */}
        {insight && !isLoading && (
          <div className="mt-6 p-5 bg-sage-50/80 backdrop-blur-sm border border-sage-200 rounded-2xl flex gap-3 animate-fade-up">
            <Sparkles size={18} className="text-sage-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-body text-sage-400 uppercase tracking-widest block mb-1">AI Insight</span>
              <p className="font-body text-bark-700 text-sm leading-relaxed">{insight}</p>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-600 font-body text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        <div className="mt-10">
          {/* Loading */}
          {isLoading && (
            <div>
              <div className="h-5 w-40 bg-cream-300 rounded-full mb-6 shimmer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && recipes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl text-bark-700">
                  พบ <span className="text-sage-500">{recipes.length}</span> เมนู
                  {query && <span className="text-bark-400 text-base font-body font-normal"> สำหรับ &ldquo;{query}&rdquo;</span>}
                </h2>
                {filters.exclude.length > 0 && (
                  <span className="text-xs font-body text-bark-400">ไม่มี: {filters.exclude.join(', ')}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe, i) => (
                  <MenuCard key={recipe.id} recipe={recipe} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && hasSearched && recipes.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🥲</div>
              <h3 className="font-display text-xl text-bark-700 mb-2">ไม่พบเมนูที่ตรงกัน</h3>
              <p className="font-body text-bark-400 text-sm">ลองเปลี่ยน Filter หรือใช้คำค้นหาอื่น</p>
            </div>
          )}

          {/* Welcome */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-16">
              <div className="text-5xl mb-6">🥗 🍣 🥑</div>
              <h3 className="font-display text-2xl text-bark-600 mb-2">เริ่มค้นหาเมนูสุขภาพ</h3>
              <p className="font-body text-bark-400 text-sm mb-1">พิมพ์ชื่อเมนูหรือส่วนผสมที่อยากกิน</p>
              <p className="font-body text-sage-500 text-xs">✨ รองรับภาษาไทย เช่น &ldquo;ปลาแซลมอน&rdquo; &ldquo;ไก่ย่าง&rdquo; &ldquo;สลัด&rdquo;</p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { emoji: '🐟', text: 'ปลาแซลมอน', q: 'ปลาแซลมอน', ex: [] },
                  { emoji: '🥦', text: 'Vegan Protein Bowl', q: 'protein bowl', ex: [] },
                  { emoji: '🍗', text: 'ไก่ย่าง ไม่มีนม', q: 'ไก่ย่าง', ex: ['dairy'] },
                ].map(ex => (
                  <button
                    key={ex.text}
                    onClick={() => {
                      const newFilters = { ...filters, exclude: ex.ex }
                      setFilters(newFilters)
                      setQuery(ex.q)
                      doSearch(ex.q, newFilters)
                    }}
                    className="p-4 bg-white/60 hover:bg-white/90 border border-cream-200 hover:border-sage-300 rounded-2xl font-body text-sm text-bark-600 transition-all hover:shadow-md group"
                  >
                    <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{ex.emoji}</span>
                    {ex.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center font-body text-xs text-bark-400/60">
          <p>Natural Core · Powered by Gemini AI + Spoonacular</p>
        </footer>
      </div>
    </div>
  )
}
