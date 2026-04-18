'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteOrder(orderId: string) {
  // order_logs FK cascade 없을 수 있으므로 먼저 삭제
  await serviceClient.from('order_logs').delete().eq('order_id', orderId)
  const { error } = await serviceClient.from('orders').delete().eq('id', orderId)
  if (error) throw new Error('삭제에 실패했습니다.')
  revalidatePath('/admin/orders')
}
