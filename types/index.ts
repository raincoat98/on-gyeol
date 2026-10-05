export type ProductStatus = 'active' | 'soldout' | 'hidden'
export type InquiryStatus = 'pending' | 'replied' | 'closed'
export type OrderStatus = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled'
export type UserRole = 'admin' | 'customer'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category_id: string | null
  price: number
  sale_price: number | null
  short_description: string | null
  description: string | null
  status: ProductStatus
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  is_main: boolean
  created_at: string
}

export interface ProductOption {
  id: string
  product_id: string
  color: string | null
  size: string | null
  stock_qty: number
  status: ProductStatus
  created_at: string
}

export interface Inquiry {
  id: string
  product_id: string | null
  user_id: string | null
  customer_name: string
  phone: string
  message: string
  status: InquiryStatus
  admin_reply: string | null
  replied_at: string | null
  created_at: string
  products?: Pick<Product, 'name' | 'slug'> | null
}

export interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  address: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_memo: string | null
  total_amount: number
  delivery_fee: number
  status: OrderStatus
  payment_key: string | null
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_slug: string
  image_url: string | null
  option_color: string | null
  option_size: string | null
  price: number
  quantity: number
  created_at: string
  orders?: Pick<Order, 'id' | 'user_id' | 'status'> | null
}

export interface OrderLog {
  id: string
  order_id: string
  action: string
  detail: string | null
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  order_item_id: string | null
  user_id: string
  rating: number
  content: string
  created_at: string
  products?: (Pick<Product, 'name' | 'slug'> & { product_images: ProductImage[] }) | null
}

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