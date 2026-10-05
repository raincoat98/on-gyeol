import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

const ORDER_STATUSES = ['pending', 'paid', 'shipping', 'delivered', 'cancelled'] as const

export class CreateOrderItemDto {
  @IsUUID()
  productId: string

  @IsString()
  productName: string

  @IsString()
  productSlug: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  optionColor?: string

  @IsOptional()
  @IsString()
  optionSize?: string

  @IsInt()
  @Min(0)
  price: number

  @IsInt()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsString()
  customerName: string

  @IsString()
  customerPhone: string

  @IsString()
  customerAddress: string

  @IsOptional()
  @IsString()
  customerMemo?: string

  @IsInt()
  @Min(0)
  totalAmount: number

  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFee?: number

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}

/** 관리자 주문 수정 — 전달된 필드만 반영한다. */
export class UpdateOrderDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: string

  @IsOptional()
  @IsString()
  customerName?: string

  @IsOptional()
  @IsString()
  customerPhone?: string

  @IsOptional()
  @IsString()
  customerAddress?: string

  @IsOptional()
  @IsString()
  customerMemo?: string
}

/** 고객 배송정보 수정 — status 가 pending/paid 일 때만 허용된다. */
export class UpdateShippingDto {
  @IsString()
  customerName: string

  @IsString()
  customerPhone: string

  @IsString()
  customerAddress: string

  @IsOptional()
  @IsString()
  customerMemo?: string
}

export class ConfirmPaymentDto {
  @IsString()
  paymentKey: string

  @IsInt()
  @Min(0)
  amount: number
}

export class CreateOrderLogDto {
  @IsUUID()
  orderId: string

  @IsString()
  action: string

  @IsOptional()
  @IsString()
  detail?: string
}