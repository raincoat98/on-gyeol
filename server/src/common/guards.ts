import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'
import { ACCESS_TOKEN_COOKIE, AuthUser, TokenService } from './token.service'

type AuthedRequest = Request & { user?: AuthUser }

function readToken(req: Request): string | undefined {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies
  return cookies?.[ACCESS_TOKEN_COOKIE]
}

/** 로그인 필수 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const token = readToken(req)
    if (!token) throw new UnauthorizedException('로그인이 필요합니다.')
    req.user = this.tokens.verify(token)
    return true
  }
}

/** 로그인 선택 (비회원 주문/문의 지원) */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const token = readToken(req)
    if (token) {
      try {
        req.user = this.tokens.verify(token)
      } catch {
        req.user = undefined
      }
    }
    return true
  }
}

/** 관리자 필수 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const token = readToken(req)
    if (!token) throw new UnauthorizedException('로그인이 필요합니다.')
    const user = this.tokens.verify(token)
    if (user.role !== 'admin') throw new ForbiddenException('관리자 권한이 필요합니다.')
    req.user = user
    return true
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser | undefined =>
    context.switchToHttp().getRequest<AuthedRequest>().user,
)

export type { AuthedRequest }