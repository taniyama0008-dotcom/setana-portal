'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavorite } from '@/app/actions/favorite'

// Module-level cache so all cards on the same page share one fetch
let favPromise: Promise<Set<string>> | null = null

function loadFavorites(): Promise<Set<string>> {
  if (!favPromise) {
    favPromise = fetch('/api/me/favorites')
      .then((r) => r.json())
      .then((d: { spotIds: string[] }) => new Set(d.spotIds))
      .catch(() => new Set<string>())
  }
  return favPromise
}

interface FavoriteButtonProps {
  spotId: string
  slug: string
  /** Pass from server when status is pre-fetched (spot detail page). Omit for SpotCard. */
  initialFavorited?: boolean
  size?: 'sm' | 'md'
}

export default function FavoriteButton({
  spotId,
  slug,
  initialFavorited,
  size = 'md',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState<boolean | null>(
    initialFavorited !== undefined ? initialFavorited : null,
  )
  const [isPending, setIsPending] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (initialFavorited !== undefined) return
    loadFavorites().then((favs) => setFavorited(favs.has(spotId)))
  }, [spotId, initialFavorited])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return
    setIsPending(true)
    const result = await toggleFavorite(spotId, slug)
    setIsPending(false)
    if (result.needsLogin) {
      router.push('/login')
      return
    }
    // Update cache
    if (favPromise) {
      favPromise.then((favs) => {
        if (result.favorited) favs.add(spotId)
        else favs.delete(spotId)
      })
    }
    setFavorited(result.favorited)
    if (result.favorited) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 300)
    }
  }

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-[15px]' : 'w-10 h-10 text-[19px]'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? 'お気に入りから削除' : 'お気に入りに追加'}
      className={`
        ${sizeClass}
        rounded-full bg-white/90 hover:bg-white
        shadow-[0_2px_8px_rgba(0,0,0,0.15)]
        flex items-center justify-center
        transition-transform duration-200
        disabled:opacity-60
        ${bouncing ? 'scale-125' : 'scale-100'}
      `}
    >
      {favorited ? (
        <span className="text-[#e74c3c] leading-none select-none">♥</span>
      ) : (
        <span className="text-[#8a8a8a] leading-none select-none">♡</span>
      )}
    </button>
  )
}
