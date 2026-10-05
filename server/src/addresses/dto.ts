import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  label?: string

  @IsString()
  recipientName: string

  @IsString()
  phone: string

  @IsString()
  address: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  label?: string

  @IsOptional()
  @IsString()
  recipientName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}