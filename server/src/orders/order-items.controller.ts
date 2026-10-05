import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { CurrentUser, JwtAuthGuard } from '../common/guards'
import type { AuthUser } from '../common/token.service'
import { OrdersService } from './orders.service'

/** 리뷰 작성 검증용 — 주문항목 + 소속 주문(orders) 정보 */
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orders: OrdersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.findOrderItem(id, user)
  }
}