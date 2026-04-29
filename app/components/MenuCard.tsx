'use client'

import { useRouter } from 'next/navigation'
import { Clock, Users, Flame, ArrowRight } from 'lucide-react'
import { Recipe } from '../api/search/route'

interface MenuCardProps {
  recipe: Recipe
  index: number
}

export default function MenuCard({ recipe, index }: MenuCardProps) {
  const router = useRouter()

  const healthColor =
    recipe.healthScore >= 80 ? 'text-sage-600 bg-sage-100' :
    recipe.healthScore >= 60 ? 'text-amber-600 bg-amber-100' :
    'text-red-500 bg-red-100'

  const staggerClass = `stagger-${Math.min(index + 1, 6)}`

  const handleClick = () => {
    sessionStorage.setItem(`recipe-title-${recipe.id}`, recipe.title)
    router.push(`/menu/${recipe.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`menu-card animate-fade-up ${staggerClass} bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-cream-200 group cursor-pointer`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-cream-200">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://placehold.co/312x231/e4ede4/4f7f4f?text=${encodeURIComponent(recipe.title.slice(0, 12))}`
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🥗</div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-sage-900/0 group-hover:bg-sage-900/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-full p-2 shadow-lg">
            <ArrowRight size={18} className="text-sage-600" />
          </div>
        </div>

        {/* Health score badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-body font-medium ${healthColor} backdrop-blur-sm`}>
          ♥ {recipe.healthScore}
        </div>

        {/* Diet tags */}
        <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
          {recipe.diets.slice(0, 2).map(diet => (
            <span key={diet} className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-sage-700 text-xs rounded-full font-body capitalize">
              {diet}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-body font-semibold text-bark-700 text-base leading-snug mb-3 line-clamp-2 group-hover:text-sage-600 transition-colors">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-bark-500/70 font-body mb-4">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-sage-400" />
            {recipe.readyInMinutes} นาที
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} className="text-sage-400" />
            {recipe.servings} คน
          </span>
          {recipe.calories ? (
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-amber-400" />
              {recipe.calories} kcal
            </span>
          ) : null}
        </div>

        {recipe.protein !== undefined && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-xl">
              <div className="text-xs font-body font-semibold text-blue-600">{recipe.protein}g</div>
              <div className="text-[10px] text-blue-400 font-body">Protein</div>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded-xl">
              <div className="text-xs font-body font-semibold text-amber-600">{recipe.carbs}g</div>
              <div className="text-[10px] text-amber-400 font-body">Carbs</div>
            </div>
            <div className="text-center p-2 bg-sage-50 rounded-xl">
              <div className="text-xs font-body font-semibold text-sage-600">{recipe.fat}g</div>
              <div className="text-[10px] text-sage-400 font-body">Fat</div>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end gap-1 text-sage-500 text-xs font-body opacity-0 group-hover:opacity-100 transition-opacity">
          ดูรายละเอียด <ArrowRight size={12} />
        </div>
      </div>
    </div>
  )
}
