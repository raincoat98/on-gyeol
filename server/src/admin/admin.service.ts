import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma.service'
import { RELATION_ALIASES, serialize } from '../common/serialize'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [pendingInquiryCount, paidOrderCount, todayOrderCount, sales, recentInquiries, paidOrders] =
      await Promise.all([
        this.prisma.inquiry.count({ where: { status: 'pending' } }),
        this.prisma.order.count({ where: { status: 'paid' } }),
        this.prisma.order.count({
          where: { createdAt: { gte: todayStart }, status: { not: 'cancelled' } },
        }),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: todayStart }, status: { not: 'cancelled' } },
        }),
        this.prisma.inquiry.findMany({
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { product: { select: { name: true } } },
        }),
        this.prisma.order.findMany({
          where: { status: 'paid' },
          orderBy: { createdAt: 'desc' },
          include: { orderItems: true },
        }),
      ])

    return {
      pendingInquiryCount,
      paidOrderCount,
      todayOrderCount,
      todaySales: sales._sum.totalAmount ?? 0,
      recentInquiries: serialize(recentInquiries, RELATION_ALIASES),
      paidOrders: serialize(paidOrders, RELATION_ALIASES),
    }
  }
}