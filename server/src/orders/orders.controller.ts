import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { AdminGuard, CurrentUser, JwtAuthGuard, OptionalAuthGuard } from '../common/guards'
import type { AuthUser } from '../common/token.service'
import { ConfirmPaymentDto, CreateOrderDto, UpdateOrderDto, UpdateShippingDto } from './dto'
import { OrdersService } from './orders.service'

/** 쿼리 문자열을 0 이상의 정수로 파싱하고, 실패하면 기본값을 쓴다. */
function intQuery(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: AuthUser) {
    return this.orders.createOrder(dto, user?.id ?? null)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('excludeCancelled') excludeCancelled?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.orders.findMine(user.id, {
      from,
      to,
      excludeCancelled: excludeCancelled === 'true',
      limit: intQuery(limit, 100),
      offset: intQuery(offset, 0),
    })
  }

  @Get('counts')
  @UseGuards(AdminGuard)
  counts() {
    return this.orders.countStatuses()
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.orders.findAll({ status, limit: intQuery(limit, 100), offset: intQuery(offset, 0) })
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.findOne(id, user)
  }

  @Patch(':id/shipping')
  @UseGuards(JwtAuthGuard)
  updateShipping(@Param('id') id: string, @Body() dto: UpdateShippingDto, @CurrentUser() user: AuthUser) {
    return this.orders.updateShipping(id, user, dto)
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orders.update(id, dto)
  }

  @Post(':id/confirm')
  @HttpCode(200)
  confirmPayment(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.orders.confirmPayment(id, dto)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.cancel(id, user)
  }

  @Delete(':id')
  @UseGuards(OptionalAuthGuard)
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.orders.remove(id, user)
  }
}