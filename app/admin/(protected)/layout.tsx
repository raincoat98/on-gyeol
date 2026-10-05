import { redirect } from 'next/navigation'
import { apiFetchUser } from '@/lib/api/server'
import type { User } from '@/types'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await apiFetchUser<User>()

  if (!user || user.role !== 'admin') redirect('/admin/login')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-surface overflow-auto">
        {children}
      </main>
    </div>
  )
}
