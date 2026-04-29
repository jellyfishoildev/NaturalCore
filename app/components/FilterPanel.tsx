'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'

export interface Filters {
  exclude: string[]   // ส่วนผสมที่ไม่เอา
  diet: string        // ประเภทอาหาร
  maxCalories: string
}

interface FilterPanelProps {
  filters: Filters
  onChange: (f: Filters) => void
}

const EXCLUDE_OPTIONS = [
  { id: 'egg', label: '🥚 ไข่' },
  { id: 'dairy', label: '🥛 นม/Dairy' },
  { id: 'gluten', label: '🌾 กลูเตน' },
  { id: 'nuts', label: '🥜 ถั่ว' },
  { id: 'shellfish', label: '🦐 กุ้ง/หอย' },
  { id: 'soy', label: '🫘 ถั่วเหลือง' },
  { id: 'pork', label: '🐷 หมู' },
  { id: 'beef', label: '🐄 เนื้อวัว' },
]

const DIET_OPTIONS = [
  { id: '', label: 'ทั้งหมด' },
  { id: 'vegetarian', label: '🥗 Vegetarian' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'ketogenic', label: '🥩 Keto' },
  { id: 'paleo', label: '🦴 Paleo' },
  { id: 'gluten free', label: '🌾 Gluten Free' },
  { id: 'mediterranean', label: '🫒 Mediterranean' },
]

const CALORIE_OPTIONS = [
  { id: '', label: 'ไม่จำกัด' },
  { id: '300', label: '< 300 kcal' },
  { id: '500', label: '< 500 kcal' },
  { id: '700', label: '< 700 kcal' },
]

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  const toggleExclude = (id: string) => {
    const next = filters.exclude.includes(id)
      ? filters.exclude.filter(e => e !== id)
      : [...filters.exclude, id]
    onChange({ ...filters, exclude: next })
  }

  const activeCount = filters.exclude.length + (filters.diet ? 1 : 0) + (filters.maxCalories ? 1 : 0)

  const clearAll = () => onChange({ exclude: [], diet: '', maxCalories: '' })

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Toggle button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cream-300 bg-white/60 hover:border-sage-400 hover:bg-sage-50 text-bark-700 text-sm font-body transition-all"
        >
          <SlidersHorizontal size={16} className="text-sage-500" />
          <span>กรอง / Filter</span>
          {activeCount > 0 && (
            <span className="bg-sage-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono">
              {activeCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-bark-500/70 hover:text-red-500 transition-colors"
          >
            <X size={12} />
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Active filter badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.exclude.map(e => (
            <span key={e} className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-body">
              ไม่เอา {EXCLUDE_OPTIONS.find(o => o.id === e)?.label ?? e}
              <button onClick={() => toggleExclude(e)} className="hover:text-red-800">
                <X size={10} />
              </button>
            </span>
          ))}
          {filters.diet && (
            <span className="flex items-center gap-1 px-3 py-1 bg-sage-100 border border-sage-300 text-sage-700 rounded-full text-xs font-body">
              {DIET_OPTIONS.find(o => o.id === filters.diet)?.label}
              <button onClick={() => onChange({ ...filters, diet: '' })} className="hover:text-sage-900">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.maxCalories && (
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-body">
              {'< '}{filters.maxCalories} kcal
              <button onClick={() => onChange({ ...filters, maxCalories: '' })} className="hover:text-amber-900">
                <X size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter panel */}
      {open && (
        <div className="mt-3 p-5 bg-white/90 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-lg animate-fade-up">
          {/* Exclude ingredients */}
          <div className="mb-5">
            <h3 className="text-xs font-body font-semibold text-bark-500/70 uppercase tracking-widest mb-3">
              🚫 ไม่เอาส่วนผสม
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXCLUDE_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => toggleExclude(o.id)}
                  className={`filter-chip px-3 py-1.5 rounded-full border text-sm font-body transition-all ${
                    filters.exclude.includes(o.id)
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-cream-300 bg-white text-bark-600 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet type */}
          <div className="mb-5">
            <h3 className="text-xs font-body font-semibold text-bark-500/70 uppercase tracking-widest mb-3">
              ✅ ประเภทอาหาร
            </h3>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => onChange({ ...filters, diet: o.id })}
                  className={`filter-chip px-3 py-1.5 rounded-full border text-sm font-body transition-all ${
                    filters.diet === o.id
                      ? 'bg-sage-500 border-sage-500 text-white'
                      : 'border-cream-300 bg-white text-bark-600 hover:border-sage-300 hover:bg-sage-50'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max calories */}
          <div>
            <h3 className="text-xs font-body font-semibold text-bark-500/70 uppercase tracking-widest mb-3">
              🔥 แคลอรี่สูงสุด
            </h3>
            <div className="flex flex-wrap gap-2">
              {CALORIE_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => onChange({ ...filters, maxCalories: o.id })}
                  className={`filter-chip px-3 py-1.5 rounded-full border text-sm font-body transition-all ${
                    filters.maxCalories === o.id
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-cream-300 bg-white text-bark-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
