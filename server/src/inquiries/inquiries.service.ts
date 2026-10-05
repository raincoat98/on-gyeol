import { Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from '../common/prisma.service'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import { CreateInquiryDto, ListInquiriesQueryDto, MineInquiriesQueryDto, UpdateInquiryDto } from './dto'

/** 문의의 상품 요약(README: products: {name, slug}) */
const PRODUCT_INCLUDE = {
  product: { select: { name: true, slug: true } },
} as const satisfies Prisma.InquiryInclude

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInquiryDto, userId: string | null) {
    const row = await this.prisma.inquiry.create({
      data: {
        productId: dto.productId?.trim() ? dto.productId : null,
        userId,
        customerName: dto.customerName,
        phone: dto.phone,
        message: dto.message,
      },
    })
    return serialize(row, RELATION_ALIASES)
  }

  async findMine(userId: string, query: MineInquiriesQueryDto) {
    const rows = await this.prisma.inquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 20,
      include: PRODUCT_INCLUDE,
    })
    return serialize(rows, RELATION_ALIASES)
  }

  async findAll(query: ListInquiriesQueryDto) {
    const rows = await this.prisma.inquiry.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 100,
      skip: query.offset ?? 0,
      include: PRODUCT_INCLUDE,
    })
    return serialize(rows, RELATION_ALIASES)
  }

  async counts() {
    const grouped = await this.prisma.inquiry.groupBy({ by: ['status'], _count: true })
    const counts = { pending: 0, replied: 0, closed: 0 }
    for (const row of grouped) {
      if (row.status === 'pending') counts.pending = row._count
      else if (row.status === 'replied') counts.replied = row._count
      else if (row.status === 'closed') counts.closed = row._count
    }
    return counts
  }

  async update(id: string, dto: UpdateInquiryDto) {
    const existing = await this.prisma.inquiry.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('문의를 찾을 수 없습니다.')

    const data: Prisma.InquiryUpdateInput = {}
    if (dto.status !== undefined && dto.status !== null) {
      data.status = dto.status
    }
    if (dto.adminReply !== undefined) {
      const reply = dto.adminReply?.trim() ? dto.adminReply : null
      data.adminReply = reply
      data.repliedAt = reply ? new Date() : null
    }

    const row = await this.prisma.inquiry.update({ where: { id }, data })
    return serialize(row, RELATION_ALIASES)
  }
}