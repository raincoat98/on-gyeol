import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateOrderNumber(): string {
  const date = new Date()
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `OG${ymd}${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, customerPhone, customerAddress, customerMemo, totalAmount, deliveryFee, items } = body

    if (!customerName || !customerPhone || !customerAddress || !items?.length) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_memo: customerMemo ?? null,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문 생성에 실패했습니다.' }, { status: 500 })
    }

    const orderItems = items.map((item: {
      productId: string
      productName: string
      productSlug: string
      imageUrl: string | null
      optionColor: string | null
      optionSize: string | null
      price: number
      quantity: number
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_slug: item.productSlug,
      image_url: item.imageUrl,
      option_color: item.optionColor,
      option_size: item.optionSize,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      // 주문은 생성됐지만 아이템 실패 — 주문 삭제 후 오류 반환
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: '주문 항목 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ orderId: order.id, orderNumber })
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
