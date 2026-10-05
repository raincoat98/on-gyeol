import { Injectable, UnauthorizedException } from '@nestjs/common'
import jwt from 'jsonwebtoken'

export const ACCESS_TOKEN_COOKIE = 'access_token'

export type AuthUser = {
  id: string
  email: string
  role: string
}

type JwtPayload = {
  sub: string
  email: string
  role: string
}

@Injectable()
export class TokenService {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret-change-me'
  private readonly expiresIn = '7d'

  sign(user: AuthUser): string {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, this.secret, {
      expiresIn: this.expiresIn,
    })
  }

  verify(token: string): AuthUser {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload
      if (!payload?.sub) throw new Error('invalid payload')
      return { id: payload.sub, email: payload.email, role: payload.role }
    } catch {
      throw new UnauthorizedException('로그인이 필요합니다.')
    }
  }
}