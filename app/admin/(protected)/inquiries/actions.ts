'use server'

import { revalidatePath } from 'next/cache'
import { apiFetch } from '@/lib/api/server'

export async function saveInquiryReply(inquiryId: string, reply: string) {
  const trimmed = reply.trim()
  await apiFetch(`/inquiries/${inquiryId}`, {
    method: 'PATCH',
    body: JSON.stringify({ adminReply: trimmed || null, status: trimmed ? 'replied' : 'pending' }),
  })
  revalidatePath('/admin/inquiries')
}