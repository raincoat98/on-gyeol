import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../common/prisma.service'
import { publicUploadUrl } from '../common/uploads'
import type {
  CreateProductDto,
  ListProductsQueryDto,
  ProductOptionDto,
  UpdateProductDto,
} from './dto'

/** 목록 조회용 관계 (상품 이미지 + 카테고리) */
const PRODUCT_LIST_INCLUDE = {
  productImages: true,
  category: true,
} satisfies Prisma.ProductInclude

/** 단건 조회용 관계 (옵션 포함) */
const PRODUCT_DETAIL_INCLUDE = {
  ...PRODUCT_LIST_INCLUDE,
  productOptions: true,
} satisfies Prisma.ProductInclude

const PRODUCT_ORDER_BY: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  'created_at.desc': { createdAt: 'desc' },
  'created_at.asc': { createdAt: 'asc' },
  'price.asc': { price: 'asc' },
  'price.desc': { price: 'desc' },
  'name.asc': { name: 'asc' },
}

/** 이름에서 slug 를 만든다. 남는 문자가 없으면 타임스탬프 기반 slug 를 쓴다. */
function buildProductSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || `product-${Date.now().toString(36)}`
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } })
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.')
    return category
  }

  listBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  listProducts(query: ListProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {}
    if (query.status) where.status = query.status
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.categorySlug) where.category = { slug: query.categorySlug }
    if (query.featured === 'true') where.isFeatured = true
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' }

    return this.prisma.product.findMany({
      where,
      include: PRODUCT_LIST_INCLUDE,
      orderBy: PRODUCT_ORDER_BY[query.sort ?? ''] ?? PRODUCT_ORDER_BY['created_at.desc'],
      take: query.limit,
      skip: query.offset,
    })
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_DETAIL_INCLUDE,
    })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    return product
  }

  async getProductBySlug(slug: string, includeHidden: boolean) {
    const product = await this.prisma.product.findFirst({
      where: { slug, ...(includeHidden ? {} : { status: { not: 'hidden' } }) },
      include: PRODUCT_DETAIL_INCLUDE,
    })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    return product
  }

  async createProduct(dto: CreateProductDto) {
    const slug = dto.slug?.trim() || buildProductSlug(dto.name)
    const duplicate = await this.prisma.product.findUnique({ where: { slug } })
    if (duplicate) throw new ConflictException('이미 사용 중인 slug 입니다.')

    const data: Prisma.ProductUncheckedCreateInput = { ...dto, slug }
    return this.prisma.product.create({ data })
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')

    if (dto.slug && dto.slug !== product.slug) {
      const duplicate = await this.prisma.product.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      })
      if (duplicate) throw new ConflictException('이미 사용 중인 slug 입니다.')
    }

    const data: Prisma.ProductUncheckedUpdateInput = { ...dto }
    return this.prisma.product.update({ where: { id }, data })
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    await this.prisma.product.delete({ where: { id } })
  }

  async replaceOptions(productId: string, options: ProductOptionDto[]) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')

    return this.prisma.$transaction(async (tx) => {
      await tx.productOption.deleteMany({ where: { productId } })
      if (options.length > 0) {
        await tx.productOption.createMany({
          data: options.map((option) => ({
            productId,
            color: option.color,
            size: option.size,
            stockQty: option.stockQty ?? 0,
            status: option.status ?? 'active',
          })),
        })
      }
      return tx.productOption.findMany({
        where: { productId },
        orderBy: { createdAt: 'asc' },
      })
    })
  }

  async addImage(productId: string, file: Express.Multer.File | undefined, isMain: boolean) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    if (!file) throw new BadRequestException('이미지 파일이 필요합니다.')

    const sortOrder = await this.prisma.productImage.count({ where: { productId } })
    return this.prisma.productImage.create({
      data: {
        productId,
        imageUrl: publicUploadUrl(`products/${productId}/${file.filename}`),
        isMain,
        sortOrder,
      },
    })
  }

  async deleteImage(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } })
    if (!image) throw new NotFoundException('이미지를 찾을 수 없습니다.')
    await this.prisma.productImage.delete({ where: { id } })
  }
}