import type { Database, ProductStatus } from './database'

export type { ProductStatus, InquiryStatus } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductOption = Database['public']['Tables']['product_options']['Row']
export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type Banner = Database['public']['Tables']['banners']['Row']

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  categories: Category | null
}

export type ProductDetail = ProductWithImages & {
  product_options: ProductOption[]
}
