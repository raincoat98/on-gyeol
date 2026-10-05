import { Module } from '@nestjs/common'
import { OrderItemsController } from './order-items.controller'
import { OrderLogsController } from './order-logs.controller'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { TossService } from './toss.service'

@Module({
  controllers: [OrdersController, OrderItemsController, OrderLogsController],
  providers: [OrdersService, TossService],
})
export class OrdersModule {}