import { IsEmail, IsOptional, IsString } from 'class-validator'

export class SignupDto {
  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsOptional()
  @IsString()
  fullName?: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  fullName?: string

  @IsOptional()
  @IsString()
  phone?: string
}