import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../common/prisma.service'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import type { AuthUser } from '../common/token.service'
import { CreateReviewDto, ListReviewsQueryDto } from './dto'

/** 리뷰의 상품 요약(README: products: {name, slug, product_images}) */
const PRODUCT_INCLUDE = {
  product: { select: { name: true, slug: true, productImages: true } },
} as const satisfies Prisma.ReviewInclude

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListReviewsQueryDto) {
    const rows = await this.prisma.review.findMany({
      where: {
        ...(query.productId ? { productId: query.productId } : {}),
        ...(query.orderItemId ? { orderItemId: query.orderItemId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 100,
      skip: query.offset ?? 0,
      include: PRODUCT_INCLUDE,
    })
    return serialize(rows, RELATION_ALIASES)
  }

  async findMine(userId: string) {
    const rows = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: PRODUCT_INCLUDE,
    })
    return serialize(rows, RELATION_ALIASES)
  }

  async create(dto: CreateReviewDto, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')

    if (dto.orderItemId) {
      const orderItem = await this.prisma.orderItem.findUnique({
        where: { id: dto.orderItemId },
        include: { order: true },
      })
      if (!orderItem || orderItem.order.userId !== userId || orderItem.order.status !== 'delivered') {
        throw new BadRequestException('리뷰를 작성할 수 없는 주문입니다.')
      }

      const existing = await this.prisma.review.findFirst({ where: { orderItemId: dto.orderItemId } })
      if (existing) throw new ConflictException('이미 리뷰를 작성했습니다.')
    }

    const row = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        orderItemId: dto.orderItemId ?? null,
        userId,
        rating: dto.rating,
        content: dto.content,
      },
      include: PRODUCT_INCLUDE,
    })
    return serialize(row, RELATION_ALIASES)
  }

  async remove(id: string, user: AuthUser) {
    const review = await this.prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.')
    if (review.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('리뷰를 삭제할 권한이 없습니다.')
    }
    await this.prisma.review.delete({ where: { id } })
  }
}