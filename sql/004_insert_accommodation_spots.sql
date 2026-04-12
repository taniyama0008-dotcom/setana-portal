-- 宿泊施設スポットのサンプルデータ
-- ※ slug・name・description は実際の施設情報に合わせて修正してください
-- ※ latitude/longitude は実際の座標に合わせてください

INSERT INTO spots (
  slug, name, description, category, section,
  area, address, phone,
  latitude, longitude,
  has_onsen, has_meals, price_range, room_count,
  status
) VALUES
(
  'setana-onsen-hotel',
  'せたな温泉ホテル',
  '日本海を望む温泉付きホテル。新鮮な海の幸を使った夕食が自慢。',
  'accommodation',
  'shizen',
  'setana',
  '北海道久遠郡せたな町瀬棚区',
  NULL,
  42.45, 139.85,
  TRUE, TRUE, '8,000〜15,000円/泊',
  20,
  'public'
),
(
  'kitahiyama-minshuku',
  '民宿 北檜山荘',
  '温かいもてなしと家庭料理が魅力の民宿。山の自然に囲まれた静かな宿。',
  '民宿',
  'shizen',
  'kitahiyama',
  '北海道久遠郡せたな町北檜山区',
  NULL,
  42.50, 139.90,
  FALSE, TRUE, '6,000〜9,000円/泊',
  8,
  'public'
),
(
  'taisei-campground',
  '大成オートキャンプ場',
  '日本海に面したロケーション抜群のキャンプ場。設備充実でファミリーにも人気。',
  'campground',
  'shizen',
  'taisei',
  '北海道久遠郡せたな町大成区',
  NULL,
  42.40, 139.78,
  FALSE, FALSE, '2,000〜4,000円/サイト',
  NULL,
  'public'
);
