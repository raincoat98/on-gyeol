import { notFound } from 'next/navigation'
import { apiFetch, apiFetchOrNull } from '@/lib/api/server'
import ProductForm from '@/components/admin/ProductForm'
import type { Category, ProductDetail } from '@/types'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    apiFetchOrNull<ProductDetail>(`/products/${id}`),
    apiFetch<Category[]>('/categories'),
  ])

  if (!product) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-ink mb-8 tracking-tight">상품 수정</h1>
      <ProductForm
        categories={categories}
        initialData={product}
        initialImages={product.product_images}
        initialOptions={product.product_options}
      />
    </div>
  )
}