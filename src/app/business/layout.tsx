import { redirect } from 'next/navigation'
import { getSessionUserId, getSessionRole } from '@/lib/session'
import BusinessNav from './BusinessNav'

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const uid = await getSessionUserId()
  const role = await getSessionRole()

  if (!uid || (role !== 'business' && role !== 'admin')) redirect('/')

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <BusinessNav />
      <main className="max-w-[900px] mx-auto px-5 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
