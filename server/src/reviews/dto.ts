import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export class ListReviewsQueryDto {
  @IsOptional()
  @IsString()
  productId?: string

  @IsOptional()
  @IsString()
  orderItemId?: string

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

export class CreateReviewDto {
  @IsUUID()
  productId: string

  @IsOptional()
  @IsUUID()
  orderItemId?: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @IsString()
  content: string
}