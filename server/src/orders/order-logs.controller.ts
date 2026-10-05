import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../common/guards'
import { CreateOrderLogDto } from './dto'
import { OrdersService } from './orders.service'

@Controller('order-logs')
@UseGuards(AdminGuard)
export class OrderLogsController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query('orderIds') orderIds?: string) {
    const ids = (orderIds ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
    return this.orders.findLogs(ids)
  }

  @Post()
  create(@Body() dto: CreateOrderLogDto) {
    return this.orders.createLog(dto)
  }
}