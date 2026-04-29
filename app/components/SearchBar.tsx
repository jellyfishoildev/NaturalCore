'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Sparkles } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

const SUGGESTIONS = [
  'Salmon', 'Chicken', 'Quinoa', 'Avocado', 'Tofu',
  'Broccoli', 'Sweet Potato', 'Lentils', 'Tuna', 'Kale'
]

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestion = (s: string) => {
    setValue(s)
    onSearch(s)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          {/* Icon */}
          <div className="absolute left-5 text-sage-400 pointer-events-none">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="ค้นหาเมนู หรือใส่ส่วนผสม... (เช่น Salmon, Avocado)"
            className="search-input w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-cream-300 bg-white/80 backdrop-blur-sm font-body text-bark-700 placeholder-bark-500/50 text-base transition-all focus:border-sage-400"
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 text-bark-500/60 hover:text-bark-700 transition-colors"
            >
              <X size={18} />
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="absolute right-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-body font-medium text-sm transition-all active:scale-95"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-cream-200 overflow-hidden z-50 animate-fade-up">
          <div className="px-4 py-2 flex items-center gap-2 text-xs text-bark-500/70 border-b border-cream-100">
            <Sparkles size={12} className="text-sage-400" />
            <span>คำแนะนำ</span>
          </div>
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={() => handleSuggestion(s)}
              className="w-full text-left px-5 py-3 hover:bg-sage-50 text-bark-700 font-body text-sm transition-colors flex items-center gap-3"
            >
              <Search size={14} className="text-sage-400" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {SUGGESTIONS.slice(0, 6).map(s => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            className="tag-pill px-3 py-1.5 rounded-full border border-cream-300 bg-white/60 text-bark-500 text-xs font-body hover:border-sage-400 hover:text-sage-600 hover:bg-sage-50 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
