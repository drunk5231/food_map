-- ============================================
-- 味觉地图 — Supabase 建表 + 示例数据
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 省份表
CREATE TABLE IF NOT EXISTS provinces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  cuisine_family TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#D4380D'
);

-- 2. 县/区表
CREATE TABLE IF NOT EXISTS counties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city_name TEXT NOT NULL,
  province_id TEXT NOT NULL REFERENCES provinces(id),
  svg_path TEXT,
  food_culture TEXT
);

-- 3. 美食表
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province_id TEXT NOT NULL REFERENCES provinces(id),
  county_id TEXT REFERENCES counties(id),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  spicy REAL DEFAULT 0,
  sweet REAL DEFAULT 0,
  sour REAL DEFAULT 0,
  salty REAL DEFAULT 0,
  umami REAL DEFAULT 0,
  numbing REAL DEFAULT 0,
  bitter REAL DEFAULT 0,
  aromatic REAL DEFAULT 0,

  cooking_methods TEXT[] DEFAULT '{}',
  main_ingredients TEXT[] DEFAULT '{}',
  difficulty INTEGER DEFAULT 1,

  recipe TEXT,
  story TEXT,
  history TEXT,
  best_season TEXT DEFAULT 'all',
  related_solar_terms TEXT[] DEFAULT '{}',

  emoji TEXT DEFAULT '🍜',
  description TEXT,

  pairing_drink TEXT,
  pairing_side TEXT,
  pairing_staple TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 节气表
CREATE TABLE IF NOT EXISTS solar_terms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  season TEXT NOT NULL,
  description TEXT,
  food_advice TEXT,
  recommended_dishes TEXT[] DEFAULT '{}'
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_dishes_province ON dishes(province_id);
CREATE INDEX IF NOT EXISTS idx_dishes_county ON dishes(county_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_counties_province ON counties(province_id);

-- RLS：公开读取
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_terms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read' AND tablename = 'provinces') THEN
    CREATE POLICY "Public read" ON provinces FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read' AND tablename = 'counties') THEN
    CREATE POLICY "Public read" ON counties FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read' AND tablename = 'dishes') THEN
    CREATE POLICY "Public read" ON dishes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read' AND tablename = 'solar_terms') THEN
    CREATE POLICY "Public read" ON solar_terms FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- 示例数据：3省详细美食 + 其余省份基础信息
-- ============================================

-- 省份数据
INSERT INTO provinces (id, name, region, cuisine_family, color, description) VALUES
('sichuan', '四川', '西南', '川菜', '#E8372C', '一菜一格、百菜百味，麻辣鲜香，火锅与串串的故乡。'),
('guangdong', '广东', '华南', '粤菜', '#52C41A', '食在广州，早茶点心、煲仔饭、白切鸡，追求食材本味。'),
('shandong', '山东', '华东', '鲁菜', '#135200', '鲁菜为八大菜系之首，糖醋鲤鱼、九转大肠，宫廷菜的根基。'),
('beijing', '北京', '华北', '京菜', '#D4380D', '皇城根下的美食文化，宫廷菜与市井小吃交融，烤鸭享誉世界。'),
('tianjin', '天津', '华北', '津菜', '#CF1322', '九河下梢，码头文化孕育了独特的津味小吃。'),
('hebei', '河北', '华北', '冀菜', '#A8071A', '环京津之地，驴肉火烧、正定八大碗，朴实厚重的北方味道。'),
('shanxi', '山西', '华北', '晋菜', '#8C0000', '面食王国，刀削面、莜面栲栳栳，醋文化深入骨髓。'),
('neimenggu', '内蒙古', '华北', '蒙餐', '#610B00', '草原上的盛宴，手把肉、烤全羊、奶茶奶酪。'),
('liaoning', '辽宁', '东北', '辽菜', '#1890FF', '满族饮食文化深厚，锅包肉外酥里嫩，大连海鲜鲜美无比。'),
('jilin', '吉林', '东北', '吉菜', '#096DD9', '长白山珍馐，人参鸡、冷面、泡菜，朝鲜族风味浓郁。'),
('heilongjiang', '黑龙江', '东北', '黑菜', '#0050B3', '冰城美食，红肠、列巴、杀猪菜，俄罗斯风情与东北豪爽的碰撞。'),
('shanghai', '上海', '华东', '本帮菜', '#FA8C16', '海派美食，浓油赤酱的本帮菜，小笼包、生煎精致考究。'),
('jiangsu', '江苏', '华东', '苏菜', '#FAAD14', '淮扬菜天下闻名，狮子头、大煮干丝，刀工精细、口味清鲜。'),
('zhejiang', '浙江', '华东', '浙菜', '#D4B106', '杭帮菜清鲜爽脆，西湖醋鱼、东坡肉，江南水乡的精致味道。'),
('anhui', '安徽', '华东', '徽菜', '#7CB305', '徽州菜重油重色重火功，臭鳜鱼、毛豆腐，山野之味独树一帜。'),
('fujian', '福建', '华东', '闽菜', '#389E0D', '闽菜善用红糟、注重汤功，佛跳墙天下第一汤。'),
('jiangxi', '江西', '华东', '赣菜', '#237804', '赣菜辣而不猛，藜蒿炒腊肉、粉蒸肉，瓦罐汤鲜美醇厚。'),
('henan', '河南', '华中', '豫菜', '#FF4D4F', '中原味道，烩面、胡辣汤、洛阳水席，千年饮食文化传承。'),
('hubei', '湖北', '华中', '鄂菜', '#FF7A45', '楚地美食，热干面、武昌鱼、排骨藕汤，早餐之都。'),
('hunan', '湖南', '华中', '湘菜', '#FFA940', '湘菜重辣重味，剁椒鱼头、臭豆腐、小炒肉，无辣不欢。'),
('guangxi', '广西', '华南', '桂菜', '#73D13D', '桂林米粉、螺蛳粉、老友粉，粉的世界，酸辣鲜爽。'),
('hainan', '海南', '华南', '琼菜', '#95DE64', '热带海岛美食，文昌鸡、加积鸭、东山羊、和乐蟹。'),
('chongqing', '重庆', '西南', '渝菜', '#CF1322', '山城味道，重庆火锅麻辣霸道，小面酸辣粉，江湖菜豪放不羁。'),
('guizhou', '贵州', '西南', '黔菜', '#EB2F96', '酸汤为魂、辣子为骨，酸汤鱼、丝娃娃、肠旺面。'),
('yunnan', '云南', '西南', '滇菜', '#9254DE', '鲜花入馔、野菌飘香，过桥米线、汽锅鸡，多民族饮食文化交融。'),
('xizang', '西藏', '西南', '藏餐', '#597EF7', '高原饮食，糌粑、酥油茶、青稞酒，藏族人民的生活智慧。'),
('shaanxi', '陕西', '西北', '陕菜', '#D48806', '三秦大地，肉夹馍、凉皮、羊肉泡馍，面食文化博大精深。'),
('gansu', '甘肃', '西北', '陇菜', '#D4A106', '兰州牛肉面享誉全国，酿皮子、手抓羊肉。'),
('qinghai', '青海', '西北', '青菜', '#B8860B', '高原美食，手抓羊肉、酿皮、甜醅。'),
('ningxia', '宁夏', '西北', '宁菜', '#9A6E00', '滩羊之鲜天下知，手抓羊肉、羊杂碎。'),
('xinjiang', '新疆', '西北', '疆菜', '#7B5800', '大盘鸡、烤羊肉串、馕、手抓饭，西域美食豪迈奔放。'),
('hongkong', '香港', '华南', '港式', '#36CFC9', '中西合璧的美食天堂，港式茶餐厅、烧腊、菠萝包。'),
('macau', '澳门', '华南', '澳式', '#5CDBD3', '葡式蛋挞、猪扒包、非洲鸡，中葡美食文化交融。'),
('taiwan', '台湾', '华东', '台菜', '#87E8DE', '夜市天堂，卤肉饭、牛肉面、珍珠奶茶、蚵仔煎。')
ON CONFLICT (id) DO NOTHING;

-- 四川美食（详细数据）
INSERT INTO dishes (id, name, province_id, category, tags, spicy, sweet, sour, salty, umami, numbing, bitter, aromatic, cooking_methods, main_ingredients, difficulty, story, history, best_season, related_solar_terms, emoji, description, pairing_drink, pairing_side, pairing_staple) VALUES
('sichuan_mapo_tofu', '麻婆豆腐', 'sichuan', 'main',
 ARRAY['非遗美食','经典川菜'],
 7, 0, 0, 4, 6, 6, 0, 5,
 ARRAY['stir_fry'],
 ARRAY['豆腐','牛肉末','郫县豆瓣','花椒','辣椒'],
 2,
 '清朝同治年间，成都万福桥边的陈兴盛饭铺，老板娘陈麻婆（因脸上有麻子得名）创制了此菜。她用当地产的黄豆制成嫩豆腐，配以牛肉末和郫县豆瓣，花椒麻、辣椒辣，豆腐嫩、味道鲜，食客赞不绝口，"麻婆豆腐"之名不胫而走。',
 '清同治年间（约1862年）',
 'all', '{}',
 '🫘', '麻辣鲜香，豆腐嫩滑，下饭神器',
 '盖碗茶', '泡菜', '米饭'),

('sichuan_hotpot', '四川火锅', 'sichuan', 'main',
 ARRAY['非遗美食','社交美食'],
 9, 0, 1, 5, 7, 7, 0, 7,
 ARRAY['boil'],
 ARRAY['牛油','辣椒','花椒','豆瓣','各种涮菜'],
 1,
 '四川火锅起源于长江边的船工纤夫，他们用瓦罐盛水，加入辣椒花椒，投入廉价的牛杂煮食驱寒。后逐渐演变为今天的牛油火锅，成为四川人最重要的社交方式——没有什么事是一顿火锅解决不了的。',
 '清代中期',
 'winter', ARRAY['大雪','冬至','小寒','大寒'],
 '🍲', '麻辣鲜香，牛油醇厚，越煮越香',
 '唯怡豆奶', '酥肉', '米饭'),

('sichuan_dan_dan_noodles', '担担面', 'sichuan', 'staple',
 ARRAY['非遗美食','成都名小吃'],
 6, 1, 2, 5, 5, 3, 0, 6,
 ARRAY['boil','cold'],
 ARRAY['面条','猪肉末','芽菜','辣椒油','花椒','芝麻酱'],
 2,
 '担担面因小贩用扁担挑着沿街叫卖而得名。扁担一头是炉子和锅，一头是碗筷和调料，走街串巷，吆喝"担担面——"。面条细薄，卤汁酥香，咸鲜微辣，一碗下肚，浑身舒坦。',
 '清道光年间（约1841年）',
 'all', '{}',
 '🍜', '麻辣咸鲜，面条细滑，芽菜酥香',
 '盖碗茶', '泡菜', ''),

('sichuan_kung_pao_chicken', '宫保鸡丁', 'sichuan', 'main',
 ARRAY['经典川菜','国际名菜'],
 6, 2, 3, 4, 5, 4, 0, 7,
 ARRAY['stir_fry'],
 ARRAY['鸡胸肉','花生','干辣椒','花椒','葱姜蒜'],
 2,
 '清朝四川总督丁宝桢（谥号"宫保"）喜食辣椒炒鸡丁，其家厨将鸡丁、辣椒、花生同炒，酸甜微辣，丁宝桢甚爱之。后人以其官职称此菜为"宫保鸡丁"，流传至今，成为中国菜在海外最知名的代表之一。',
 '清光绪年间（约1870年代）',
 'all', '{}',
 '🥜', '荔枝味型，鸡丁嫩滑，花生酥脆',
 '茉莉花茶', '凉拌黄瓜', '米饭'),

('sichuan_suancaiyu', '酸菜鱼', 'sichuan', 'main',
 ARRAY['经典川菜','家常菜'],
 5, 0, 6, 4, 7, 2, 0, 5,
 ARRAY['boil'],
 ARRAY['草鱼','酸菜','泡椒','花椒'],
 2,
 '酸菜鱼源自重庆江津的江边渔夫，他们将捕获的鲜鱼与当地人腌制的酸菜同煮，酸辣开胃。后经厨师改良，加入泡椒、花椒，汤底酸辣鲜美，鱼肉嫩滑，成为川渝地区最受欢迎的家常菜之一。',
 '20世纪80年代',
 'all', '{}',
 '🐟', '酸辣开胃，鱼肉嫩滑，汤鲜味美',
 '酸梅汤', '凉粉', '米饭'),

('sichuan_huiguo_rice', '回锅肉', 'sichuan', 'main',
 ARRAY['川菜之首','家常菜'],
 5, 1, 0, 4, 5, 0, 0, 7,
 ARRAY['stir_fry'],
 ARRAY['五花肉','蒜苗','郫县豆瓣','甜面酱'],
 2,
 '回锅肉被誉为"川菜之首"，四川人几乎家家会做、人人爱吃。将五花肉煮熟切片，再入锅与豆瓣、甜面酱同炒，肉片微卷如灯盏，肥而不腻，蒜苗清香。"回锅"之名，意为"再次回到锅中"。',
 '清代',
 'all', '{}',
 '🥩', '肥而不腻，咸鲜微辣，蒜苗飘香',
 '盖碗茶', '泡菜', '米饭'),

('sichuan_boiled_fish', '水煮鱼', 'sichuan', 'main',
 ARRAY['经典川菜','江湖菜'],
 8, 0, 0, 4, 6, 5, 0, 6,
 ARRAY['boil'],
 ARRAY['草鱼','豆芽','辣椒','花椒','豆瓣'],
 3,
 '水煮鱼源自重庆渝北地区，原是当地渔民的家常做法。将鲜鱼片在辣椒花椒的红油汤中煮熟，看似简单却极考功夫——鱼片要嫩滑不碎，汤底要麻辣鲜香。上桌时热油浇在干辣椒上，"嗞啦"一声，香气四溢。',
 '20世纪90年代',
 'all', '{}',
 '🐟', '麻辣鲜香，鱼片嫩滑，汤底浓郁',
 '冰粉', '凉菜', '米饭'),

('sichuan_tianshui_mian', '甜水面', 'sichuan', 'staple',
 ARRAY['成都名小吃'],
 3, 5, 0, 3, 2, 0, 0, 5,
 ARRAY['boil'],
 ARRAY['面条','红糖','辣椒油','芝麻酱','花椒'],
 2,
 '甜水面是成都独特的面食，面条粗壮如筷子，口感筋道弹牙。调料以红糖为主，配以辣椒油和芝麻酱，甜中带辣、辣中有麻，甜辣交织的独特风味让外地人惊讶、本地人痴迷。',
 '清代',
 'all', '{}',
 '🍜', '甜辣交织，面条筋道，风味独特',
 '盖碗茶', '', ''),

('sichuan_lengguotuan', '冷锅串串', 'sichuan', 'street_food',
 ARRAY['成都名小吃','街头美食'],
 7, 0, 1, 4, 5, 5, 0, 6,
 ARRAY['boil'],
 ARRAY['各种串串','火锅底料','辣椒油','花椒'],
 1,
 '冷锅串串是成都街头最受欢迎的小吃之一。将各种食材串在竹签上，放入调好味的麻辣汤底中浸泡入味，吃时从冷汤中取出。虽名"冷锅"，实为温热，麻辣鲜香、方便快捷，是成都人下班后的标配小吃。',
 '20世纪90年代',
 'all', '{}',
 '🍢', '麻辣入味，方便快捷，品种丰富',
 '冰粉', '', ''),

('sichuan_fuling_zhacai', '涪陵榨菜', 'sichuan', 'cold_dish',
 ARRAY['非遗美食','中国三大名腌菜'],
 1, 0, 2, 6, 3, 0, 0, 4,
 ARRAY['pickle'],
 ARRAY['青菜头','盐','辣椒','花椒'],
 2,
 '涪陵榨菜始创于1898年，选用涪陵特有的青菜头，经风脱水、盐腌、压榨等传统工艺制成。鲜嫩香脆，回味悠长，与法国酸黄瓜、德国甜酸甘蓝并称"世界三大名腌菜"。',
 '清光绪二十四年（1898年）',
 'all', '{}',
 '🥬', '鲜嫩香脆，咸鲜适口，佐餐佳品',
 '', '', '白粥'),

-- 广东美食（详细数据）
('guangdong_dim_sum', '广式早茶', 'guangdong', 'snack',
 ARRAY['非遗美食','社交文化'],
 0, 2, 0, 2, 7, 0, 0, 5,
 ARRAY['steam','boil'],
 ARRAY['虾饺','烧麦','肠粉','叉烧包','凤爪'],
 3,
 '广式早茶不仅是饮食，更是一种生活方式。"一盅两件"——一壶茶配两笼点心，是广东人最惬意的时光。茶楼里人声鼎沸，老人们看报聊天，年轻人谈生意叙旧，早茶可以从清晨吃到中午。虾饺晶莹剔透、烧麦鲜美多汁、肠粉滑嫩爽口，每一样都是匠心之作。',
 '清代中期',
 'all', '{}',
 '🥟', '一盅两件，精致考究，广东人的生活哲学',
 '普洱茶', '酱汁凤爪', '叉烧包'),

('guangdong_white_cut_chicken', '白切鸡', 'guangdong', 'main',
 ARRAY['粤菜经典','广东名菜'],
 0, 0, 0, 3, 8, 0, 0, 4,
 ARRAY['boil'],
 ARRAY['三黄鸡','姜葱','沙姜','花生油'],
 2,
 '白切鸡是粤菜的代表作，也是检验一家粤菜馆水平的试金石。选用三黄鸡，用浸煮法烹制——水开后关火，将鸡浸入热水中慢慢浸熟。皮爽肉滑、骨中带血、原汁原味，蘸姜葱酱食用，鲜美无比。广东人说"无鸡不成宴"，白切鸡就是宴席上的主角。',
 '清代',
 'all', '{}',
 '🐔', '皮爽肉滑，原汁原味，粤菜之魂',
 '白粥', '姜葱酱', '米饭'),

('guangdong_char_siu', '蜜汁叉烧', 'guangdong', 'main',
 ARRAY['广式烧腊','经典粤菜'],
 0, 5, 0, 4, 6, 0, 0, 7,
 ARRAY['roast'],
 ARRAY['猪梅花肉','蜂蜜','叉烧酱','五香粉'],
 3,
 '叉烧是广式烧腊的代表，选用猪梅花肉，以叉烧酱、蜂蜜等腌制后入炉烤制。好的叉烧色泽红亮、外焦里嫩、甜而不腻、肉汁丰富。广东人叫"半肥瘦"的叉烧最受欢迎——肥肉烤得化开渗入瘦肉，入口即化。',
 '清代',
 'all', '{}',
 '🥩', '色泽红亮，甜香四溢，外焦里嫩',
 '丝袜奶茶', '叉烧饭', '白饭'),

('guangdong_congee', '广式生滚粥', 'guangdong', 'staple',
 ARRAY['广东家常','早餐必备'],
 0, 0, 0, 2, 7, 0, 0, 3,
 ARRAY['boil'],
 ARRAY['大米','猪肝','瘦肉','皮蛋','鱼片'],
 2,
 '广式粥底讲究"绵滑"——大米加花生油腌制后慢火熬煮数小时，直到米粒完全化开、粥水融为一体。上桌前将新鲜食材放入滚粥中"生滚"，利用粥的余温将食材烫熟，鲜嫩无比。艇仔粥、及第粥、鱼片粥，各有风味。',
 '清代',
 'all', '{}',
 '🥣', '粥底绵滑，食材鲜嫩，温暖人心',
 '油条', '', ''),

('guangdong_wonton_noodle', '云吞面', 'guangdong', 'staple',
 ARRAY['广东名小吃'],
 0, 0, 0, 3, 7, 0, 0, 4,
 ARRAY['boil'],
 ARRAY['竹升面','鲜虾云吞','大地鱼汤底'],
 3,
 '云吞面的灵魂在于三样：竹升面、鲜虾云吞、大地鱼汤底。竹升面用鸭蛋和面，竹竿压打而成，弹牙爽滑；云吞包入整只鲜虾，鲜甜弹牙；汤底用大地鱼（比目鱼干）熬制，鲜美醇厚。一碗正宗的云吞面，面条要爽、云吞要鲜、汤底要靓。',
 '清代',
 'all', '{}',
 '🍜', '面条弹牙，云吞鲜美，汤底醇厚',
 '', '', ''),

('guangdong_cantonese_roast_goose', '广式烧鹅', 'guangdong', 'main',
 ARRAY['广式烧腊','非遗美食'],
 0, 2, 0, 4, 7, 0, 0, 8,
 ARRAY['roast'],
 ARRAY['黑棕鹅','五香盐','酸梅酱'],
 4,
 '烧鹅是广式烧腊的巅峰之作。选用广东特有的黑棕鹅，填入五香盐缝合后充气、烫皮、上糖水、风干，最后入明炉烤制。皮脆肉嫩、鹅油丰腴、香气扑鼻。蘸酸梅酱食用，酸甜解腻，堪称一绝。',
 '明代',
 'all', '{}',
 '🦆', '皮脆肉嫩，鹅油丰腴，烧腊之王',
 '酸梅酱', '', '白饭'),

-- 山东美食（详细数据）
('shandong_tangcu_liyu', '糖醋鲤鱼', 'shandong', 'main',
 ARRAY['鲁菜经典','宫廷菜'],
 0, 6, 5, 3, 5, 0, 0, 5,
 ARRAY['deep_fry'],
 ARRAY['黄河鲤鱼','糖','醋','番茄酱'],
 4,
 '糖醋鲤鱼是鲁菜的代表作，选用黄河鲤鱼，先炸后浇汁。鱼身炸至金黄酥脆、头尾翘起如跳龙门状，浇上酸甜浓郁的糖醋汁，"吱吱"作响。外酥里嫩、酸甜可口，是山东宴席上的压轴大菜。',
 '明代',
 'all', '{}',
 '🐟', '外酥里嫩，酸甜浓郁，鲁菜经典',
 '', '凉菜', '米饭'),

('shandong_jiuzhuan_dachang', '九转大肠', 'shandong', 'main',
 ARRAY['鲁菜经典','功夫菜'],
 0, 4, 3, 5, 5, 0, 2, 6,
 ARRAY['braise'],
 ARRAY['猪大肠','砂仁','肉桂','糖','醋'],
 5,
 '九转大肠是鲁菜中最考功夫的菜之一。将猪大肠反复清洗、焯水、油炸，再用砂仁、肉桂等十余种调料烧制。因制作工序繁复如"九转仙丹"而得名。成品色泽红润、五味俱全——酸甜苦辣咸兼备，口感软嫩而不失嚼劲。',
 '清光绪年间',
 'all', '{}',
 '🥘', '五味俱全，软嫩有嚼劲，鲁菜功夫',
 '', '', '米饭'),

('shandong_dezhou_braised_chicken', '德州扒鸡', 'shandong', 'main',
 ARRAY['非遗美食','中华老字号'],
 0, 1, 0, 4, 7, 0, 0, 6,
 ARRAY['braise'],
 ARRAY['童子鸡','砂仁','丁香','肉桂','八角'],
 4,
 '德州扒鸡始创于1616年（明万历四十四年），是中国四大名鸡之一。选用当年童子鸡，经油炸后放入老汤中慢炖，加入砂仁、丁香等十余味香料。成品色泽金黄、骨酥肉烂、咸香入味，提起鸡腿一抖，骨肉即分离。',
 '明万历四十四年（1616年）',
 'all', '{}',
 '🐔', '骨酥肉烂，咸香入味，中华老字号',
 '', '', ''),

('shandong_baorou', '把子肉', 'shandong', 'main',
 ARRAY['济南名菜','家常菜'],
 0, 2, 0, 5, 5, 0, 0, 5,
 ARRAY['braise'],
 ARRAY['五花肉','酱油','冰糖','八角'],
 2,
 '把子肉是济南的传统名菜，将五花肉切成大块，用麻绳捆扎（即"把子"），放入酱油、冰糖、八角等调料中慢炖数小时。肉块红亮酥烂、肥而不腻、入口即化，配米饭食用，是济南人心中最治愈的家常味道。',
 '清代',
 'all', '{}',
 '🥩', '红亮酥烂，肥而不腻，济南味道',
 '', '', '米饭'),

('shandong_jianbing', '山东煎饼', 'shandong', 'staple',
 ARRAY['山东名小吃','早餐必备'],
 0, 0, 0, 2, 3, 0, 0, 4,
 ARRAY['roast'],
 ARRAY['杂粮面糊','大葱','甜面酱','油条'],
 1,
 '山东煎饼是山东人最自豪的主食。用杂粮面糊在鏊子上摊成薄饼，卷上大葱、甜面酱、油条或各种菜肴。煎饼卷大葱是山东的标志性吃法——"煎饼卷大葱，撑死老公公"。薄如纸、韧如皮，越嚼越香。',
 '明代',
 'all', '{}',
 '🫓', '薄韧有嚼劲，卷万物，山东人的主食',
 '', '', ''),

-- 北京美食
('beijing_roast_duck', '北京烤鸭', 'beijing', 'main',
 ARRAY['非遗美食','国宴名菜','中华老字号'],
 0, 2, 0, 3, 7, 0, 0, 8,
 ARRAY['roast'],
 ARRAY['填鸭','甜面酱','葱丝','薄饼'],
 5,
 '北京烤鸭始于明朝宫廷，分"挂炉"和"焖炉"两大流派。全聚德的挂炉烤鸭用果木明火烤制，皮脆肉嫩、油而不腻；便宜坊的焖炉烤鸭暗火焖熟、肉质更嫩。片鸭师傅当面片鸭，108片不多不少，皮肉分装。蘸甜面酱、卷薄饼、配葱丝黄瓜，一口下去，鸭皮酥脆、鸭肉鲜嫩、酱香浓郁。',
 '明朝永乐年间',
 'all', '{}',
 '🦆', '皮脆肉嫩、油而不腻，国宴之光',
 '小米粥', '荷叶饼', ''),

('beijing_zhajiangmian', '炸酱面', 'beijing', 'staple',
 ARRAY['北京家常','老北京味道'],
 0, 1, 0, 5, 5, 0, 0, 5,
 ARRAY['stir_fry','boil'],
 ARRAY['手擀面','黄酱','五花肉丁','黄瓜丝','豆芽'],
 2,
 '炸酱面是北京人的"命根子"。黄酱用油慢慢炸香，加入五花肉丁炒至油亮，浇在手擀面上，配上八碟面码——黄瓜丝、心里美萝卜丝、豆芽、青豆、芹菜丁等。拌匀后大口吸溜，酱香浓郁、面条筋道，这就是老北京的满足感。',
 '清代',
 'summer', ARRAY['夏至'],
 '🍜', '酱香浓郁，面条筋道，八碟面码',
 '', '', ''),

-- 陕西美食
('shaanxi_roujiamo', '肉夹馍', 'shaanxi', 'street_food',
 ARRAY['非遗美食','陕西名小吃'],
 2, 0, 0, 5, 6, 0, 0, 7,
 ARRAY['braise','roast'],
 ARRAY['白吉馍','腊汁肉','香料'],
 2,
 '肉夹馍是陕西的标志性小吃，被称为"中式汉堡"。白吉馍外酥里软、层次分明，腊汁肉肥瘦相间、软烂入味。将腊汁肉剁碎夹入热馍中，肉汁渗入馍的每一层，咬一口，外酥内软、肉香四溢。陕西人说"肉夹馍"而非"馍夹肉"，是古汉语"肉夹于馍"的简称。',
 '战国时期',
 'all', '{}',
 '🫓', '外酥内软、肉香四溢，陕西第一小吃',
 '冰峰汽水', '', ''),

('shaanxi_biangbiang_mian', 'biangbiang面', 'shaanxi', 'staple',
 ARRAY['陕西名小吃','面条'],
 4, 0, 0, 4, 4, 2, 0, 6,
 ARRAY['boil'],
 ARRAY['宽面','辣椒面','蒜末','醋','酱油'],
 2,
 'biangbiang面是陕西最豪迈的面食。面条宽如裤带、长如腰带，一根面条就够一碗。"biang"字是笔画最多的汉字之一（58画），无法用电脑输入，只能手写。面条摔打在案板上发出"biang-biang"声而得名。浇上油泼辣子，"嗞啦"一声，香飘十里。',
 '清代',
 'all', '{}',
 '🍜', '面条宽厚，油泼辣子香，关中豪情',
 '', '', ''),

-- 湖南美食
('hunan_dujiao_yutou', '剁椒鱼头', 'hunan', 'main',
 ARRAY['湘菜经典','湖南名菜'],
 7, 0, 1, 4, 7, 0, 0, 6,
 ARRAY['steam'],
 ARRAY['鲢鱼头','剁椒','豆豉','蒜末'],
 2,
 '剁椒鱼头是湘菜的代表作，选用大鲢鱼头铺满剁椒蒸制。红亮的剁椒覆盖在白嫩的鱼头上，色如玛瑙、鲜辣交融。湖南人说"鱼头的肉最嫩，剁椒的味最鲜"，两者结合，鲜辣可口、开胃下饭。',
 '清代',
 'all', '{}',
 '🐟', '鲜辣交融，鱼头嫩滑，湘菜之魂',
 '米酒', '', '米饭'),

-- 云南美食
('yunnan_cross_bridge_rice_noodle', '过桥米线', 'yunnan', 'staple',
 ARRAY['非遗美食','云南名小吃'],
 1, 0, 0, 3, 7, 0, 0, 4,
 ARRAY['boil'],
 ARRAY['米线','鸡汤','薄肉片','鹌鹑蛋','豆腐皮'],
 2,
 '过桥米线源于云南蒙自，传说一位秀才在湖心岛读书，妻子每日送饭过桥，但米线送到时已凉。后来她发现鸡汤上覆盖一层油可以保温，便将薄肉片、米线等放入热油汤中烫熟，"过桥米线"由此得名。吃时先放肉片、再放蔬菜、最后放米线，汤鲜味美。',
 '清代',
 'all', '{}',
 '🍜', '汤鲜味美，食材丰富，云南第一小吃',
 '', '', ''),

-- 江浙美食
('jiangsu_dazhaxie', '阳澄湖大闸蟹', 'jiangsu', 'main',
 ARRAY['时令美食','江南名菜'],
 0, 2, 0, 2, 8, 0, 0, 5,
 ARRAY['steam'],
 ARRAY['大闸蟹','姜醋汁'],
 1,
 '阳澄湖大闸蟹是中国最负盛名的淡水蟹。"九雌十雄"——农历九月吃母蟹（蟹黄饱满）、十月吃公蟹（蟹膏丰腴）。清蒸后蘸姜醋汁食用，蟹肉鲜甜、蟹黄浓郁。古人云"蟹之鲜而肥，甘而腻，白似玉而黄似金，已造色香味三者之至极"。',
 '宋代',
 'autumn', ARRAY['秋分','寒露','霜降'],
 '🦀', '蟹黄浓郁，蟹肉鲜甜，江南至味',
 '黄酒', '姜丝', ''),

-- 广西美食
('guangxi_luosi_fen', '螺蛳粉', 'guangxi', 'staple',
 ARRAY['非遗美食','网红美食','臭味美食'],
 6, 0, 4, 4, 6, 0, 0, 5,
 ARRAY['boil'],
 ARRAY['米粉','螺蛳汤','酸笋','腐竹','花生','木耳'],
 2,
 '螺蛳粉源自广西柳州，以"臭"闻名天下。其独特气味来自发酵后的酸笋——闻着臭、吃着香。用螺蛳熬制的汤底鲜美浓郁，配以酸笋、腐竹、花生、木耳等配料，酸辣鲜爽、层次丰富。从地方小吃到全国网红，螺蛳粉用"臭味"征服了无数人的味蕾。',
 '20世纪70年代',
 'all', '{}',
 '🍜', '闻着臭吃着香，酸辣鲜爽，柳州之魂',
 '', '', ''),

-- 重庆美食
('chongqing_xiaomian', '重庆小面', 'chongqing', 'staple',
 ARRAY['重庆名小吃','早餐必备'],
 6, 0, 1, 4, 4, 2, 0, 6,
 ARRAY['boil'],
 ARRAY['碱水面','辣椒油','花椒','芽菜','花生碎'],
 2,
 '重庆小面是重庆人的早餐灵魂。一碗小面，调料多达十余种——辣椒油、花椒面、芽菜、花生碎、酱油、醋、蒜水、姜水……每家面馆都有自己的秘方。面条劲道、调料麻辣鲜香，重庆人说"小面虽小，味道事大"。',
 '清代',
 'all', '{}',
 '🍜', '麻辣鲜香，调料丰富，重庆早餐之魂',
 '', '', ''),

-- 贵州美食
('guizhou_sour_fish_soup', '酸汤鱼', 'guizhou', 'main',
 ARRAY['非遗美食','苗族名菜'],
 4, 0, 7, 3, 7, 0, 0, 5,
 ARRAY['boil'],
 ARRAY['稻花鱼','红酸汤','番茄','木姜子'],
 3,
 '酸汤鱼是贵州苗族的传统名菜。红酸汤用野生番茄自然发酵而成，酸味纯正、色泽红亮。将新鲜稻花鱼放入酸汤中煮熟，鱼肉鲜嫩、汤底酸辣开胃。苗家人说"三天不吃酸，走路打蹿蹿"，酸汤就是苗族饮食的灵魂。',
 '明代',
 'all', '{}',
 '🐟', '酸辣开胃，鱼肉鲜嫩，苗族风味',
 '米酒', '', '米饭'),

-- 香港美食
('hongkong_milk_tea', '港式丝袜奶茶', 'hongkong', 'drink',
 ARRAY['港式经典','非遗美食'],
 0, 3, 0, 0, 0, 0, 0, 7,
 ARRAY['boil'],
 ARRAY['红茶','淡奶'],
 2,
 '港式丝袜奶茶因滤网被茶染成深色、形似丝袜而得名。用多种红茶混合，经反复"拉茶"使茶味更醇厚，加入淡奶（植脂末），口感丝滑浓郁。茶餐厅里一杯奶茶配一个菠萝包，就是香港人最经典的下午茶。',
 '20世纪50年代',
 'all', '{}',
 '🥤', '茶味醇厚，口感丝滑，港式经典',
 '', '菠萝包', ''),

-- 台湾美食
('taiwan_beef_noodle', '台湾牛肉面', 'taiwan', 'staple',
 ARRAY['台湾名小吃','国民美食'],
 3, 1, 0, 4, 6, 0, 0, 5,
 ARRAY['braise'],
 ARRAY['牛腱肉','面条','豆瓣酱','番茄'],
 3,
 '台湾牛肉面是台湾最具代表性的国民美食。红烧牛肉面以浓郁的豆瓣酱汤底为特色，牛肉大块软烂、面条筋道弹牙。每年台北举办"牛肉面节"，各家名店争相竞技。一碗牛肉面，是台湾人最温暖的乡愁。',
 '20世纪50年代',
 'all', '{}',
 '🍜', '牛肉软烂，汤浓面弹，台湾之味',
 '', '', '')

ON CONFLICT (id) DO NOTHING;
