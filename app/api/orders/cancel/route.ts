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

    const { orderId } = await req.json()
    if (!orderId) return NextResponse.json({ error: '주문 ID가 없습니다.' }, { status: 400 })

    // 본인 주문 확인
    const { data: order } = await serviceClient
      .from('orders')
      .select('id, status, payment_key, total_amount')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })

    if (!['pending', 'paid'].includes(order.status)) {
      return NextResponse.json({ error: '취소할 수 없는 주문 상태입니다.' }, { status: 400 })
    }

    // 결제 완료 주문: 토스페이먼츠 취소 API 호출
    if (order.status === 'paid' && order.payment_key) {
      const secretKey = process.env.TOSS_SECRET_KEY ?? 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'
      const encoded = Buffer.from(`${secretKey}:`).toString('base64')

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${order.payment_key}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${encoded}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cancelReason: '고객 요청' }),
        }
      )

      if (!tossRes.ok) {
        const tossError = await tossRes.json()
        return NextResponse.json(
          { error: tossError.message ?? '결제 취소에 실패했습니다.' },
          { status: 400 }
        )
      }
    }

    // 주문 상태 취소로 업데이트
    const { error: updateError } = await serviceClient
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json({ error: '주문 상태 업데이트에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
