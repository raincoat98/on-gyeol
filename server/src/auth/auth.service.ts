import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../common/prisma.service'
import { TokenService } from '../common/token.service'
import { LoginDto, SignupDto, UpdateMeDto } from './dto'

/** 비밀번호 해시를 절대 노출하지 않기 위한 사용자 조회 필드 */
export const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  fullName: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const

type SelectedUser = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async signup(dto: SignupDto): Promise<{ user: SelectedUser; token: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('이미 가입된 이메일입니다.')

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        fullName: dto.fullName ?? null,
        phone: dto.phone ?? null,
        role: 'customer',
      },
      select: USER_SELECT,
    })
    const token = this.tokens.sign({ id: user.id, email: user.email, role: user.role })
    return { user, token }
  }

  async login(dto: LoginDto): Promise<{ user: SelectedUser; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    const valid = user ? await bcrypt.compare(dto.password, user.passwordHash) : false
    if (!user || !valid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    const { passwordHash: _passwordHash, ...safe } = user
    const token = this.tokens.sign({ id: user.id, email: user.email, role: user.role })
    return { user: safe, token }
  }

  /** 쿠키의 userId 로 재조회해 역할 변경 등을 반영한다. */
  async me(userId: string): Promise<SelectedUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT })
    if (!user) throw new UnauthorizedException('로그인이 필요합니다.')
    return user
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<SelectedUser> {
    const data: Prisma.UserUpdateInput = {}
    if (dto.fullName !== undefined) data.fullName = dto.fullName === '' ? null : dto.fullName
    if (dto.phone !== undefined) data.phone = dto.phone

    return this.prisma.user.update({ where: { id: userId }, data, select: USER_SELECT })
  }
}