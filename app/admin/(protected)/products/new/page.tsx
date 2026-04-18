import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-[#1C1C1E] mb-8 tracking-tight">상품 등록</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
