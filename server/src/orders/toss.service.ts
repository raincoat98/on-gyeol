import { Injectable } from '@nestjs/common'

/** 토스페이먼츠 호출 결과 — 성공/실패를 항상 같은 형태로 돌려준다. */
export type TossResult = { ok: true; method: string | null } | { ok: false; message: string }

const TOSS_API_BASE = 'https://api.tosspayments.com/v1'

/** 알 수 없는 JSON 응답에서 문자열 필드를 안전하게 꺼낸다. */
function readStringField(data: unknown, field: string): string | null {
  if (typeof data === 'object' && data !== null && field in data) {
    const value = (data as Record<string, unknown>)[field]
    if (typeof value === 'string' && value) return value
  }
  return null
}

@Injectable()
export class TossService {
  private readonly secretKey = process.env.TOSS_SECRET_KEY ?? 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'

  /** 결제 승인 — 성공 시 결제수단(method)을 함께 반환한다. */
  confirmPayment(paymentKey: string, orderId: string, amount: number): Promise<TossResult> {
    return this.request(`${TOSS_API_BASE}/payments/confirm`, { paymentKey, orderId, amount })
  }

  /** 결제 취소 */
  cancelPayment(paymentKey: string, cancelReason: string): Promise<TossResult> {
    const url = `${TOSS_API_BASE}/payments/${encodeURIComponent(paymentKey)}/cancel`
    return this.request(url, { cancelReason })
  }

  private async request(url: string, body: Record<string, unknown>): Promise<TossResult> {
    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64')
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encoded}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        return { ok: false, message: readStringField(data, 'message') ?? '결제 요청에 실패했습니다.' }
      }
      return { ok: true, method: readStringField(data, 'method') }
    } catch {
      return { ok: false, message: '결제 서비스와 통신하지 못했습니다.' }
    }
  }
}