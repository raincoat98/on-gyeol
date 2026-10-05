import { Controller, Get, Param } from '@nestjs/common'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import { CatalogService } from './catalog.service'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list() {
    return serialize(await this.catalog.listCategories(), RELATION_ALIASES)
  }

  @Get('slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    return serialize(await this.catalog.getCategoryBySlug(slug), RELATION_ALIASES)
  }
}