import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

    const { orderId, customerName, customerPhone, customerAddress, customerMemo } = await req.json()
    if (!orderId || !customerName || !customerPhone || !customerAddress) {
      return NextResponse.json({ error: '필수 항목을 입력해 주세요.' }, { status: 400 })
    }

    const { data: order } = await serviceClient
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    if (!['pending', 'paid'].includes(order.status)) {
      return NextResponse.json({ error: '배송 준비 중인 주문은 수정할 수 없습니다.' }, { status: 400 })
    }

    const { error } = await serviceClient
      .from('orders')
      .update({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_memo: customerMemo ?? null,
      })
      .eq('id', orderId)

    if (error) return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
