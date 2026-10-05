import 'server-only'
import { cookies } from 'next/headers'
import { ApiError, apiErrorMessage } from './client'

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: init?.cache ?? 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
      Cookie: cookieStore.toString(),
    },
  })

  if (res.status === 204) return undefined as T // 204 No Content — 호출부가 void 로 다룬다

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, apiErrorMessage(data))
  }

  // 서버 응답 JSON — 호출부가 기대 타입으로 소비한다.
  const result = data as T
  return result
}

/** 서버 컴포넌트/라우트 핸들러용 — 로그인 쿠키를 자동으로 전달한다. */
export function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init)
}

/** 404 를 null 로 바꿔 단건 조회를 다룬다. */
export async function apiFetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await request<T>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** 로그인 쿠키가 유효하지 않으면(401/404) null. */
export async function apiFetchUser<T>(): Promise<T | null> {
  try {
    return await request<T>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) return null
    throw error
  }
}

export { API_URL, ApiError }