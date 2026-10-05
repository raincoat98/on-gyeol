import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreateInquiryDto {
  /** 상품 상세가 아닌 일반 문의는 빈 문자열/누락으로 들어오며, 서비스에서 null 로 저장한다. */
  @IsOptional()
  @IsString()
  productId?: string

  @IsString()
  customerName: string

  @IsString()
  phone: string

  @IsString()
  message: string
}

export class MineInquiriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number
}

export class ListInquiriesQueryDto {
  @IsOptional()
  @IsString()
  status?: string

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

export class UpdateInquiryDto {
  @IsOptional()
  @IsString()
  status?: string

  /** 빈 문자열이면 null 로 저장하고 replied_at 을 비운다. */
  @IsOptional()
  @IsString()
  adminReply?: string | null
}