'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function saveInquiryReply(inquiryId: string, reply: string) {
  const trimmed = reply.trim()
  const { error } = await serviceClient
    .from('inquiries')
    .update({
      admin_reply: trimmed || null,
      replied_at: trimmed ? new Date().toISOString() : null,
      status: trimmed ? 'replied' : 'pending',
    })
    .eq('id', inquiryId)

  if (error) throw new Error('답변 저장에 실패했습니다.')
  revalidatePath('/admin/inquiries')
}
