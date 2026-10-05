import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { AdminGuard } from '../common/guards'
import { RELATION_ALIASES, serialize } from '../common/serialize'
import { UPLOAD_DIR } from '../common/uploads'
import { CatalogService } from './catalog.service'
import {
  CreateProductDto,
  ListProductsQueryDto,
  ProductBySlugQueryDto,
  ProductOptionDto,
  UpdateProductDto,
} from './dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list(@Query() query: ListProductsQueryDto) {
    return serialize(await this.catalog.listProducts(query), RELATION_ALIASES)
  }

  // ':id' 보다 먼저 선언해야 'slug' 가 상품 id 로 해석되지 않는다.
  @Get('slug/:slug')
  async bySlug(@Param('slug') slug: string, @Query() query: ProductBySlugQueryDto) {
    return serialize(
      await this.catalog.getProductBySlug(slug, query.includeHidden === 'true'),
      RELATION_ALIASES,
    )
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    return serialize(await this.catalog.getProductById(id), RELATION_ALIASES)
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateProductDto) {
    return serialize(await this.catalog.createProduct(dto), RELATION_ALIASES)
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return serialize(await this.catalog.updateProduct(id, dto), RELATION_ALIASES)
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.catalog.deleteProduct(id)
  }

  @Put(':id/options')
  @UseGuards(AdminGuard)
  async replaceOptions(
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: ProductOptionDto, whitelist: true }))
    options: ProductOptionDto[],
  ) {
    return serialize(await this.catalog.replaceOptions(id, options), RELATION_ALIASES)
  }

  @Post(':id/images')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, callback) => {
          // Express 5 의 params 값은 string | string[] 이라 경로용 문자열로 좁힌다.
          const productId = req.params.id
          const dir = join(
            process.cwd(),
            UPLOAD_DIR,
            'products',
            Array.isArray(productId) ? productId[0] : productId,
          )
          mkdirSync(dir, { recursive: true })
          callback(null, dir)
        },
        filename: (_req, file, callback) => {
          callback(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`,
          )
        },
      }),
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('isMain') isMain?: string,
  ) {
    return serialize(await this.catalog.addImage(id, file, isMain === 'true'), RELATION_ALIASES)
  }
}

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly catalog: CatalogService) {}

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.catalog.deleteImage(id)
  }
}