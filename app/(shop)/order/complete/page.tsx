'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

function CompleteContent() {
  const searchParams = useSearchParams()

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const orderNumber = searchParams.get('orderNumber')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // paymentKey가 없으면 직접 접근 or 카카오페이 등 리다이렉트 없는 경우
    if (!paymentKey || !orderId || !amount) {
      // orderNumber만 있으면 성공으로 간주 (일부 결제수단)
      if (orderNumber) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg('결제 정보를 찾을 수 없습니다.')
      }
      return
    }

    fetch('/api/orders/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMsg(data.error ?? '결제 확인에 실패했습니다.')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('네트워크 오류가 발생했습니다.')
      })
  }, [paymentKey, orderId, amount, orderNumber])

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-[#9C9189]">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <XCircle size={56} className="mx-auto text-red-400 mb-4" />
        <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-2">결제 실패</h1>
        <p className="text-[#9C9189] mb-8">{errorMsg}</p>
        <Link
          href="/cart"
          className="inline-block bg-[#5C4A2A] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#8B6F47] transition"
        >
          장바구니로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-2">주문이 완료되었습니다</h1>
      {orderNumber && (
        <p className="text-[#8B6F47] text-sm mb-2">주문번호: <span className="font-semibold">{orderNumber}</span></p>
      )}
      <p className="text-[#9C9189] text-sm mb-8">
        주문 확인 후 1~3 영업일 이내 발송됩니다.<br />
        문의사항은 카카오톡 또는 전화로 연락주세요.
      </p>
      <Link
        href="/products"
        className="inline-block bg-[#5C4A2A] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#8B6F47] transition"
      >
        쇼핑 계속하기
      </Link>
    </div>
  )
}

export default function OrderCompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  )
}
