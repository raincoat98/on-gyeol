import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../common/prisma.service'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import type { AuthUser } from '../common/token.service'
import type {
  ConfirmPaymentDto,
  CreateOrderDto,
  CreateOrderLogDto,
  UpdateOrderDto,
  UpdateShippingDto,
} from './dto'
import { TossService } from './toss.service'

/** 주문번호: OG + YYYYMMDD + 5자리 난수 */
function generateOrderNumber(): string {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `OG${ymd}${rand}`
}

export type OrderListQuery = {
  status?: string
  from?: string
  to?: string
  excludeCancelled?: boolean
  limit: number
  offset: number
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly toss: TossService,
  ) {}

  /** 주문 + 주문항목을 한 트랜잭션으로 생성한다. */
  async createOrder(dto: CreateOrderDto, userId: string | null) {
    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerAddress: dto.customerAddress,
            customerMemo: dto.customerMemo ?? null,
            totalAmount: dto.totalAmount,
            deliveryFee: dto.deliveryFee ?? 3000,
          },
        })
        await tx.orderItem.createMany({
          data: dto.items.map((item) => ({
            orderId: created.id,
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            imageUrl: item.imageUrl ?? null,
            optionColor: item.optionColor ?? null,
            optionSize: item.optionSize ?? null,
            price: item.price,
            quantity: item.quantity,
          })),
        })
        return created
      })
      return { orderId: order.id, orderNumber: order.orderNumber }
    } catch {
      throw new BadRequestException('주문 생성에 실패했습니다.')
    }
  }

  async findMine(userId: string, query: OrderListQuery) {
    const where: Prisma.OrderWhereInput = { userId }

    const createdAt: Prisma.DateTimeFilter = {}
    if (query.from) createdAt.gte = new Date(`${query.from}T00:00:00`)
    if (query.to) createdAt.lte = new Date(`${query.to}T23:59:59`)
    if (query.from || query.to) where.createdAt = createdAt

    if (query.excludeCancelled) where.status = { not: 'cancelled' }

    const orders = await this.prisma.order.findMany({
      where,
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    })
    return serialize(orders, RELATION_ALIASES)
  }

  async findAll(query: OrderListQuery) {
    const orders = await this.prisma.order.findMany({
      where: query.status ? { status: query.status } : undefined,
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    })
    return serialize(orders, RELATION_ALIASES)
  }

  async countStatuses() {
    const grouped = await this.prisma.order.groupBy({ by: ['status'], _count: true })
    const counts = { pending: 0, paid: 0, shipping: 0, delivered: 0, cancelled: 0 }
    for (const row of grouped) {
      const key = row.status as keyof typeof counts
      if (key in counts) counts[key] = row._count
    }
    return counts
  }

  async findOne(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { orderItems: true } })
    if (!order || (user.role !== 'admin' && order.userId !== user.id)) {
      throw new NotFoundException('주문을 찾을 수 없습니다.')
    }
    return serialize(order, RELATION_ALIASES)
  }

  /** 관리자 주문 수정 */
  async update(id: string, dto: UpdateOrderDto) {
    await this.ensureOrder(id)

    const data: Prisma.OrderUpdateInput = {}
    if (dto.status !== undefined) data.status = dto.status
    if (dto.customerName !== undefined) data.customerName = dto.customerName
    if (dto.customerPhone !== undefined) data.customerPhone = dto.customerPhone
    if (dto.customerAddress !== undefined) data.customerAddress = dto.customerAddress
    if (dto.customerMemo !== undefined) data.customerMemo = dto.customerMemo

    const order = await this.prisma.order.update({ where: { id }, data, include: { orderItems: true } })
    return serialize(order, RELATION_ALIASES)
  }

  /** 고객 배송정보 수정 — 본인 주문이면서 pending/paid 상태일 때만 */
  async updateShipping(id: string, user: AuthUser, dto: UpdateShippingDto) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order || order.userId !== user.id) throw new NotFoundException('주문을 찾을 수 없습니다.')
    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('배송 준비 중인 주문은 수정할 수 없습니다.')
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        customerMemo: dto.customerMemo ?? null,
      },
      include: { orderItems: true },
    })
    return serialize(updated, RELATION_ALIASES)
  }

  /** 토스 결제 승인 후 주문을 paid 로 전환 */
  async confirmPayment(id: string, dto: ConfirmPaymentDto) {
    await this.ensureOrder(id)

    const result = await this.toss.confirmPayment(dto.paymentKey, id, dto.amount)
    if (!result.ok) throw new BadRequestException(result.message)

    await this.prisma.order.update({
      where: { id },
      data: { status: 'paid', paymentKey: dto.paymentKey, paymentMethod: result.method },
    })
    return { success: true }
  }

  /** 고객 주문 취소 — pending/paid 만, paid 는 토스 취소 API 호출 */
  async cancel(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order || order.userId !== user.id) throw new NotFoundException('주문을 찾을 수 없습니다.')
    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('취소할 수 없는 주문 상태입니다.')
    }

    if (order.status === 'paid' && order.paymentKey) {
      const result = await this.toss.cancelPayment(order.paymentKey, '고객 요청')
      if (!result.ok) throw new BadRequestException(result.message)
    }

    await this.prisma.order.update({ where: { id }, data: { status: 'cancelled' } })
    return { success: true }
  }

  /** 관리자는 모두, 비회원 주문/본인 주문은 pending 상태만 삭제 가능 (항목/로그는 cascade) */
  async remove(id: string, user?: AuthUser): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.')

    if (user?.role !== 'admin') {
      const isOwner = order.userId === null || order.userId === user?.id
      if (!isOwner) throw new NotFoundException('주문을 찾을 수 없습니다.')
      if (order.status !== 'pending') {
        throw new BadRequestException('결제 완료된 주문은 삭제할 수 없습니다.')
      }
    }

    await this.prisma.order.delete({ where: { id } })
  }

  async findOrderItem(id: string, user: AuthUser) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id },
      include: { order: { select: { id: true, userId: true, status: true } } },
    })
    if (!item || item.order.userId !== user.id) {
      throw new NotFoundException('주문 항목을 찾을 수 없습니다.')
    }
    return serialize(item, RELATION_ALIASES)
  }

  async findLogs(orderIds: string[]) {
    if (orderIds.length === 0) return []

    const logs = await this.prisma.orderLog.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { createdAt: 'desc' },
    })
    return serialize(logs)
  }

  async createLog(dto: CreateOrderLogDto) {
    await this.ensureOrder(dto.orderId)

    const log = await this.prisma.orderLog.create({
      data: { orderId: dto.orderId, action: dto.action, detail: dto.detail ?? null },
    })
    return serialize(log)
  }

  private async ensureOrder(id: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { id: true } })
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.')
  }
}