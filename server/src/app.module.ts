import { Module } from '@nestjs/common'
import { CommonModule } from './common/common.module'
import { AuthModule } from './auth/auth.module'
import { AddressesModule } from './addresses/addresses.module'
import { CatalogModule } from './catalog/catalog.module'
import { OrdersModule } from './orders/orders.module'
import { InquiriesModule } from './inquiries/inquiries.module'
import { ReviewsModule } from './reviews/reviews.module'
import { AdminModule } from './admin/admin.module'

@Module({
  imports: [
    CommonModule,
    AuthModule,
    AddressesModule,
    CatalogModule,
    OrdersModule,
    InquiriesModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule {}