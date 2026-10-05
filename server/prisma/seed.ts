import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import '../src/common/load-env'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: '상의', slug: 'tops', sortOrder: 1 },
  { name: '하의', slug: 'bottoms', sortOrder: 2 },
  { name: '원피스', slug: 'onepiece', sortOrder: 3 },
  { name: '아우터', slug: 'outer', sortOrder: 4 },
  { name: '세일', slug: 'sale', sortOrder: 5 },
]

const PRODUCTS = [
  {
    name: '린넨 반팔 블라우스',
    slug: 'linen-short-blouse',
    categorySlug: 'tops',
    price: 45000,
    salePrice: null,
    shortDescription: '시원하고 고급스러운 린넨 소재의 여름 블라우스',
    description:
      '천연 린넨 소재로 통기성이 뛰어나 여름에도 쾌적하게 입을 수 있습니다. 넉넉한 실루엣으로 편안하게 착용 가능합니다.',
    isFeatured: true,
  },
  {
    name: '스트라이프 면 티셔츠',
    slug: 'stripe-cotton-tee',
    categorySlug: 'tops',
    price: 28000,
    salePrice: 22000,
    shortDescription: '깔끔한 스트라이프 패턴의 편안한 면 티셔츠',
    description:
      '부드러운 순면 소재로 피부에 자극이 없습니다. 심플한 스트라이프 패턴이 단정하고 세련된 느낌을 줍니다.',
    isFeatured: false,
  },
  {
    name: '시폰 루즈핏 블라우스',
    slug: 'chiffon-loose-blouse',
    categorySlug: 'tops',
    price: 52000,
    salePrice: null,
    shortDescription: '우아한 시폰 소재의 루즈핏 블라우스',
    description:
      '가볍고 부드러운 시폰 소재로 여성스러운 실루엣을 연출합니다. 다양한 하의와 매치하기 좋습니다.',
    isFeatured: true,
  },
  {
    name: '와이드 면 바지',
    slug: 'wide-cotton-pants',
    categorySlug: 'bottoms',
    price: 58000,
    salePrice: null,
    shortDescription: '편안한 와이드핏 면 바지',
    description: '고탄력 허리밴드로 착용감이 편안합니다. 다리가 길어 보이는 와이드핏 디자인입니다.',
    isFeatured: true,
  },
  {
    name: '플리츠 미디 스커트',
    slug: 'pleats-midi-skirt',
    categorySlug: 'bottoms',
    price: 48000,
    salePrice: 38000,
    shortDescription: '우아한 플리츠 디테일의 미디 스커트',
    description: '유연한 플리츠 디테일로 움직임이 편안합니다. 다양한 상의와 잘 어울리는 미디 기장입니다.',
    isFeatured: false,
  },
  {
    name: '린넨 와이드 팬츠',
    slug: 'linen-wide-pants',
    categorySlug: 'bottoms',
    price: 62000,
    salePrice: null,
    shortDescription: '시원한 린넨 소재의 와이드 팬츠',
    description:
      '천연 린넨 소재로 통기성이 좋아 여름에도 시원합니다. 넉넉한 와이드핏으로 편안한 착용감을 제공합니다.',
    isFeatured: false,
  },
  {
    name: '플로럴 맥시 원피스',
    slug: 'floral-maxi-dress',
    categorySlug: 'onepiece',
    price: 78000,
    salePrice: null,
    shortDescription: '화사한 플로럴 패턴의 맥시 원피스',
    description:
      '봄·여름에 어울리는 화사한 플로럴 패턴입니다. 발목까지 오는 맥시 기장으로 우아한 분위기를 연출합니다.',
    isFeatured: true,
  },
  {
    name: '체크 셔츠 원피스',
    slug: 'check-shirt-dress',
    categorySlug: 'onepiece',
    price: 65000,
    salePrice: 52000,
    shortDescription: '캐주얼한 체크 패턴 셔츠 원피스',
    description:
      '클래식한 체크 패턴의 셔츠 원피스입니다. 허리 벨트로 핏을 조절할 수 있어 다양한 체형에 잘 어울립니다.',
    isFeatured: true,
  },
  {
    name: '니트 A라인 원피스',
    slug: 'knit-aline-dress',
    categorySlug: 'onepiece',
    price: 72000,
    salePrice: null,
    shortDescription: '부드러운 니트 소재의 A라인 원피스',
    description: '고급 니트 소재로 포근하고 따뜻합니다. A라인 실루엣이 여성스러운 라인을 강조합니다.',
    isFeatured: false,
  },
  {
    name: '캐시미어 혼방 가디건',
    slug: 'cashmere-cardigan',
    categorySlug: 'outer',
    price: 95000,
    salePrice: null,
    shortDescription: '포근하고 고급스러운 캐시미어 혼방 가디건',
    description:
      '캐시미어 30% 혼방 소재로 부드럽고 따뜻합니다. 어떤 코디에도 잘 어울리는 베이직한 디자인입니다.',
    isFeatured: true,
  },
  {
    name: '린넨 오버핏 자켓',
    slug: 'linen-overfit-jacket',
    categorySlug: 'outer',
    price: 88000,
    salePrice: 72000,
    shortDescription: '시원한 린넨 소재의 오버핏 자켓',
    description: '봄·여름 간절기에 입기 좋은 린넨 자켓입니다. 오버핏 디자인으로 편안하게 착용 가능합니다.',
    isFeatured: false,
  },
  {
    name: '울 혼방 롱 코트',
    slug: 'wool-long-coat',
    categorySlug: 'outer',
    price: 145000,
    salePrice: null,
    shortDescription: '클래식한 울 혼방 롱 코트',
    description: '울 40% 혼방 소재로 가볍고 따뜻합니다. 시즌리스하게 입을 수 있는 클래식한 디자인입니다.',
    isFeatured: true,
  },
]

const IMAGE_SEEDS: Record<string, string> = {
  'linen-short-blouse': 'linen-blouse-1',
  'stripe-cotton-tee': 'stripe-tee-1',
  'chiffon-loose-blouse': 'chiffon-blouse-1',
  'wide-cotton-pants': 'wide-pants-1',
  'pleats-midi-skirt': 'pleats-skirt-1',
  'linen-wide-pants': 'linen-pants-1',
  'floral-maxi-dress': 'floral-dress-1',
  'check-shirt-dress': 'check-dress-1',
  'knit-aline-dress': 'knit-dress-1',
  'cashmere-cardigan': 'cardigan-1',
  'linen-overfit-jacket': 'jacket-1',
  'wool-long-coat': 'coat-1',
}

const COLORS = ['베이지', '네이비', '블랙']
const SIZES = ['S', 'M', 'L', 'XL']

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    })
  }

  const categories = await prisma.category.findMany()
  const categoryIdBySlug: Record<string, string> = Object.fromEntries(
    categories.map((category) => [category.slug, category.id]),
  )

  for (const product of PRODUCTS) {
    const { categorySlug, ...fields } = product
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...fields, categoryId: categoryIdBySlug[categorySlug] ?? null },
      create: { ...fields, categoryId: categoryIdBySlug[categorySlug] ?? null },
    })

    await prisma.productImage.deleteMany({ where: { productId: saved.id } })
    await prisma.productImage.create({
      data: {
        productId: saved.id,
        imageUrl: `https://picsum.photos/seed/${IMAGE_SEEDS[product.slug]}/600/800`,
        sortOrder: 0,
        isMain: true,
      },
    })

    await prisma.productOption.deleteMany({ where: { productId: saved.id } })
    await prisma.productOption.createMany({
      data: COLORS.flatMap((color) =>
        SIZES.map((size) => ({
          productId: saved.id,
          color,
          size,
          stockQty: Math.floor(Math.random() * 20) + 5,
          status: 'active',
        })),
      ),
    })
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@ongyeol.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234!'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin', passwordHash },
    create: { email: adminEmail, passwordHash, role: 'admin', fullName: '관리자' },
  })

  console.log(`시드 완료: 카테고리 ${CATEGORIES.length}, 상품 ${PRODUCTS.length}, 관리자 ${adminEmail}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })