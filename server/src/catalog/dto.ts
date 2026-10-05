import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator'

const PRODUCT_STATUSES = ['active', 'soldout', 'hidden'] as const

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string | null

  @IsInt()
  @Min(0)
  price: number

  @IsOptional()
  @IsInt()
  @Min(0)
  salePrice?: number | null

  @IsOptional()
  @IsString()
  shortDescription?: string | null

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: string

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean

  @IsOptional()
  @IsString()
  seoTitle?: string | null

  @IsOptional()
  @IsString()
  seoDescription?: string | null
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  salePrice?: number | null

  @IsOptional()
  @IsString()
  shortDescription?: string | null

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: string

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean

  @IsOptional()
  @IsString()
  seoTitle?: string | null

  @IsOptional()
  @IsString()
  seoDescription?: string | null
}

export class ProductOptionDto {
  @IsOptional()
  @IsString()
  color?: string | null

  @IsOptional()
  @IsString()
  size?: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number

  @IsOptional()
  @IsString()
  status?: string
}

export class ListProductsQueryDto {
  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @IsString()
  categorySlug?: string

  /** 'true' 일 때만 추천 상품으로 필터링한다. */
  @IsOptional()
  @IsString()
  featured?: string

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  sort?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number
}

export class ProductBySlugQueryDto {
  /** 'true' 이면 숨김 상품도 조회한다(관리자용). */
  @IsOptional()
  @IsString()
  includeHidden?: string
}