export type ProductStatus = 'active' | 'soldout' | 'hidden'
export type InquiryStatus = 'pending' | 'replied' | 'closed'

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          slug: string
          category_id?: string | null
          price: number
          sale_price?: number | null
          short_description?: string | null
          description?: string | null
          status?: ProductStatus
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category_id?: string | null
          price?: number
          sale_price?: number | null
          short_description?: string | null
          description?: string | null
          status?: ProductStatus
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          sort_order: number
          is_main: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          sort_order?: number
          is_main?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          sort_order?: number
          is_main?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          color: string | null
          size: string | null
          stock_qty: number
          status: ProductStatus
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          color?: string | null
          size?: string | null
          stock_qty?: number
          status?: ProductStatus
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          color?: string | null
          size?: string | null
          stock_qty?: number
          status?: ProductStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_options_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      inquiries: {
        Row: {
          id: string
          product_id: string | null
          customer_name: string
          phone: string
          message: string
          status: InquiryStatus
          created_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          customer_name: string
          phone: string
          message: string
          status?: InquiryStatus
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          customer_name?: string
          phone?: string
          message?: string
          status?: InquiryStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inquiries_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      banners: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          link_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          link_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
