'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) throw new Error('삭제에 실패했습니다.')
  revalidatePath('/admin/orders')
}
