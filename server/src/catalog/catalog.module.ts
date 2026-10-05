import { Module } from '@nestjs/common'
import { BannersController } from './banners.controller'
import { CatalogService } from './catalog.service'
import { CategoriesController } from './categories.controller'
import { ProductImagesController, ProductsController } from './products.controller'

@Module({
  controllers: [
    CategoriesController,
    ProductsController,
    ProductImagesController,
    BannersController,
  ],
  providers: [CatalogService],
})
export class CatalogModule {}