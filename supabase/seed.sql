-- 샘플 상품 데이터
-- 카테고리 ID를 변수처럼 쓰기 위해 CTE 활용

with cat as (
  select id, slug from categories
)

-- 상품 insert (category_id를 slug로 조인)
, inserted_products as (
  insert into products (name, slug, category_id, price, sale_price, short_description, description, status, is_featured)
  values
    -- 상의
    (
      '린넨 반팔 블라우스',
      'linen-short-blouse',
      (select id from cat where slug = 'tops'),
      45000, null,
      '시원하고 고급스러운 린넨 소재의 여름 블라우스',
      '천연 린넨 소재로 통기성이 뛰어나 여름에도 쾌적하게 입을 수 있습니다. 넉넉한 실루엣으로 편안하게 착용 가능합니다.',
      'active', true
    ),
    (
      '스트라이프 면 티셔츠',
      'stripe-cotton-tee',
      (select id from cat where slug = 'tops'),
      28000, 22000,
      '깔끔한 스트라이프 패턴의 편안한 면 티셔츠',
      '부드러운 순면 소재로 피부에 자극이 없습니다. 심플한 스트라이프 패턴이 단정하고 세련된 느낌을 줍니다.',
      'active', false
    ),
    (
      '시폰 루즈핏 블라우스',
      'chiffon-loose-blouse',
      (select id from cat where slug = 'tops'),
      52000, null,
      '우아한 시폰 소재의 루즈핏 블라우스',
      '가볍고 부드러운 시폰 소재로 여성스러운 실루엣을 연출합니다. 다양한 하의와 매치하기 좋습니다.',
      'active', true
    ),
    -- 하의
    (
      '와이드 면 바지',
      'wide-cotton-pants',
      (select id from cat where slug = 'bottoms'),
      58000, null,
      '편안한 와이드핏 면 바지',
      '고탄력 허리밴드로 착용감이 편안합니다. 다리가 길어 보이는 와이드핏 디자인입니다.',
      'active', true
    ),
    (
      '플리츠 미디 스커트',
      'pleats-midi-skirt',
      (select id from cat where slug = 'bottoms'),
      48000, 38000,
      '우아한 플리츠 디테일의 미디 스커트',
      '유연한 플리츠 디테일로 움직임이 편안합니다. 다양한 상의와 잘 어울리는 미디 기장입니다.',
      'active', false
    ),
    (
      '린넨 와이드 팬츠',
      'linen-wide-pants',
      (select id from cat where slug = 'bottoms'),
      62000, null,
      '시원한 린넨 소재의 와이드 팬츠',
      '천연 린넨 소재로 통기성이 좋아 여름에도 시원합니다. 넉넉한 와이드핏으로 편안한 착용감을 제공합니다.',
      'active', false
    ),
    -- 원피스
    (
      '플로럴 맥시 원피스',
      'floral-maxi-dress',
      (select id from cat where slug = 'onepiece'),
      78000, null,
      '화사한 플로럴 패턴의 맥시 원피스',
      '봄·여름에 어울리는 화사한 플로럴 패턴입니다. 발목까지 오는 맥시 기장으로 우아한 분위기를 연출합니다.',
      'active', true
    ),
    (
      '체크 셔츠 원피스',
      'check-shirt-dress',
      (select id from cat where slug = 'onepiece'),
      65000, 52000,
      '캐주얼한 체크 패턴 셔츠 원피스',
      '클래식한 체크 패턴의 셔츠 원피스입니다. 허리 벨트로 핏을 조절할 수 있어 다양한 체형에 잘 어울립니다.',
      'active', true
    ),
    (
      '니트 A라인 원피스',
      'knit-aline-dress',
      (select id from cat where slug = 'onepiece'),
      72000, null,
      '부드러운 니트 소재의 A라인 원피스',
      '고급 니트 소재로 포근하고 따뜻합니다. A라인 실루엣이 여성스러운 라인을 강조합니다.',
      'active', false
    ),
    -- 아우터
    (
      '캐시미어 혼방 가디건',
      'cashmere-cardigan',
      (select id from cat where slug = 'outer'),
      95000, null,
      '포근하고 고급스러운 캐시미어 혼방 가디건',
      '캐시미어 30% 혼방 소재로 부드럽고 따뜻합니다. 어떤 코디에도 잘 어울리는 베이직한 디자인입니다.',
      'active', true
    ),
    (
      '린넨 오버핏 자켓',
      'linen-overfit-jacket',
      (select id from cat where slug = 'outer'),
      88000, 72000,
      '시원한 린넨 소재의 오버핏 자켓',
      '봄·여름 간절기에 입기 좋은 린넨 자켓입니다. 오버핏 디자인으로 편안하게 착용 가능합니다.',
      'active', false
    ),
    (
      '울 혼방 롱 코트',
      'wool-long-coat',
      (select id from cat where slug = 'outer'),
      145000, null,
      '클래식한 울 혼방 롱 코트',
      '울 40% 혼방 소재로 가볍고 따뜻합니다. 시즌리스하게 입을 수 있는 클래식한 디자인입니다.',
      'active', true
    )
  returning id, slug
)

-- 상품 이미지 insert
, inserted_images as (
  insert into product_images (product_id, image_url, sort_order, is_main)
  select
    p.id,
    case p.slug
      when 'linen-short-blouse'    then 'https://picsum.photos/seed/linen-blouse-1/600/800'
      when 'stripe-cotton-tee'     then 'https://picsum.photos/seed/stripe-tee-1/600/800'
      when 'chiffon-loose-blouse'  then 'https://picsum.photos/seed/chiffon-blouse-1/600/800'
      when 'wide-cotton-pants'     then 'https://picsum.photos/seed/wide-pants-1/600/800'
      when 'pleats-midi-skirt'     then 'https://picsum.photos/seed/pleats-skirt-1/600/800'
      when 'linen-wide-pants'      then 'https://picsum.photos/seed/linen-pants-1/600/800'
      when 'floral-maxi-dress'     then 'https://picsum.photos/seed/floral-dress-1/600/800'
      when 'check-shirt-dress'     then 'https://picsum.photos/seed/check-dress-1/600/800'
      when 'knit-aline-dress'      then 'https://picsum.photos/seed/knit-dress-1/600/800'
      when 'cashmere-cardigan'     then 'https://picsum.photos/seed/cardigan-1/600/800'
      when 'linen-overfit-jacket'  then 'https://picsum.photos/seed/jacket-1/600/800'
      when 'wool-long-coat'        then 'https://picsum.photos/seed/coat-1/600/800'
    end,
    0,
    true
  from inserted_products p
)

-- 상품 옵션 insert
insert into product_options (product_id, color, size, stock_qty, status)
select p.id, c.color, s.size, floor(random() * 20 + 5)::int, 'active'
from inserted_products p
cross join (values ('베이지'), ('네이비'), ('블랙')) as c(color)
cross join (values ('S'), ('M'), ('L'), ('XL')) as s(size);
