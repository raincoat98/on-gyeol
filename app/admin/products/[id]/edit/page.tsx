import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: product },
    { data: categories },
    { data: images },
    { data: options },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
    supabase.from('product_options').select('*').eq('product_id', id).order('created_at'),
  ])

  if (!product) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-brand text-2xl font-bold text-[#5C4A2A] mb-8">상품 수정</h1>
      <ProductForm
        categories={categories ?? []}
        initialData={product}
        initialImages={images ?? []}
        initialOptions={options ?? []}
      />
    </div>
  )
}
