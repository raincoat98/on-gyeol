export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads'

/** 저장된 파일의 공개 URL. API 서버가 /uploads 정적 경로로 서비스한다. */
export function publicUploadUrl(filename: string): string {
  const base = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`
  return `${base.replace(/\/$/, '')}/${UPLOAD_DIR}/${filename}`
}