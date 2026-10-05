/**
 * Prisma 결과(camelCase)를 Supabase PostgREST 와 동일한 snake_case JSON 으로 변환한다.
 * 프론트엔드가 기존 Supabase 응답 형태(`product_images`, `order_items` 등)를 그대로 사용한다.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/**
 * @param rename snake_case 로 변환된 키 중 이름을 바꿀 것 (예: { category: 'categories' })
 */
export function serialize(value: unknown, rename?: Record<string, string>): Json {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map((item) => serialize(item, rename))
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'object') {
    const out: Record<string, Json> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const snake = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
      out[rename?.[snake] ?? snake] = serialize(val, rename)
    }
    return out
  }
  return value as Json
}

/** 단일 관계(category → categories) 이름을 바꾸는 표준 매핑 */
export const RELATION_ALIASES: Record<string, string> = {
  category: 'categories',
  product: 'products',
  order: 'orders',
}