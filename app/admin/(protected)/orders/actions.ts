'use server'

import { revalidatePath } from 'next/cache'
import { apiFetch } from '@/lib/api/server'

export async function deleteOrder(orderId: string) {
  await apiFetch(`/orders/${orderId}`, { method: 'DELETE' })
  revalidatePath('/admin/orders')
}