'use client'

import { useEffect, useState } from 'react'

export default function AboutEmail() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const parts = ['support', 'tsunagu-setana', 'jp']
    setEmail(`${parts[0]}@${parts[1]}.${parts[2]}`)
  }, [])

  if (!email) return <span className="text-[#8a8a8a]">読み込み中…</span>

  return (
    <a
      href={`mailto:${email}`}
      className="text-[#5b7e95] hover:underline break-all"
    >
      {email}
    </a>
  )
}
