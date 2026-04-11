import { redirect } from 'next/navigation'
import { getSessionUserId, getSessionRole } from '@/lib/session'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const uid = await getSessionUserId()
  const role = await getSessionRole()

  if (!uid || role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
