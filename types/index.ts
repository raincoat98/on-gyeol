import type { Database, ProductStatus } from './database'

export type { ProductStatus, InquiryStatus } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductOption = Database['public']['Tables']['product_options']['Row']
export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type Banner = Database['public']['Tables']['banners']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  categories: Category | null
}

export type ProductDetail = ProductWithImages & {
  product_options: ProductOption[]
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}
