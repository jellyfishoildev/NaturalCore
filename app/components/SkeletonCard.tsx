export default function SkeletonCard() {
  return (
    <div className="bg-white/80 rounded-2xl overflow-hidden border border-cream-200">
      <div className="shimmer h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-4 w-3/4 rounded-full" />
        <div className="shimmer h-3 w-1/2 rounded-full" />
        <div className="flex gap-2 mt-4">
          <div className="shimmer h-10 flex-1 rounded-xl" />
          <div className="shimmer h-10 flex-1 rounded-xl" />
          <div className="shimmer h-10 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
