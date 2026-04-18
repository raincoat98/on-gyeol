import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: '주문 ID가 없습니다.' }, { status: 400 })

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    if (order.status !== 'pending') {
      return NextResponse.json({ error: '결제 완료된 주문은 삭제할 수 없습니다.' }, { status: 400 })
    }

    await supabase.from('orders').delete().eq('id', orderId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
