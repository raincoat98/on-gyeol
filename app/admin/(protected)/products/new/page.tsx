import { apiFetch } from '@/lib/api/server'
import ProductForm from '@/components/admin/ProductForm'
import type { Category } from '@/types'

export default async function NewProductPage() {
  const categories = await apiFetch<Category[]>('/categories')

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-ink mb-8 tracking-tight">상품 등록</h1>
      <ProductForm categories={categories} />
    </div>
  )
}