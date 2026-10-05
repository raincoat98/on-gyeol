import { Controller, Get } from '@nestjs/common'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import { CatalogService } from './catalog.service'

@Controller('banners')
export class BannersController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list() {
    return serialize(await this.catalog.listBanners(), RELATION_ALIASES)
  }
}