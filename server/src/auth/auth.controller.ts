import { Body, Controller, Get, HttpCode, Patch, Post, Res, UseGuards } from '@nestjs/common'
import type { CookieOptions, Response } from 'express'
import { CurrentUser, JwtAuthGuard } from '../common/guards'
import { serialize } from '../common/serialize'
import { ACCESS_TOKEN_COOKIE } from '../common/token.service'
import type { AuthUser } from '../common/token.service'
import { AuthService } from './auth.service'
import { LoginDto, SignupDto, UpdateMeDto } from './dto'

/** 인증 쿠키 옵션 (로그인/가입 시 발급, 7일 유지) */
const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.signup(dto)
    res.cookie(ACCESS_TOKEN_COOKIE, token, AUTH_COOKIE_OPTIONS)
    return serialize(user)
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto)
    res.cookie(ACCESS_TOKEN_COOKIE, token, AUTH_COOKIE_OPTIONS)
    return serialize(user)
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return serialize(await this.auth.me(user.id))
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Body() dto: UpdateMeDto, @CurrentUser() user: AuthUser) {
    return serialize(await this.auth.updateMe(user.id, dto))
  }
}