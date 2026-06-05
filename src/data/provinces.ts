import type { DishCategory, CookingMethod, FlavorProfile } from '../types'

/** 省份元数据（不含 SVG 路径，路径从 GeoJSON 动态生成） */
export interface ProvinceMeta {
  id: string
  name: string
  region: string
  cuisine_family: string
  color: string
  description: string
}

export const provinceMeta: ProvinceMeta[] = [
  // ===== 华北 =====
  {
    id: 'beijing',
    name: '北京',
    region: '华北',
    cuisine_family: '京菜',
    color: '#DC4848',
    description: '皇城根下的美食文化，宫廷菜与市井小吃交融，烤鸭享誉世界。',
  },
  {
    id: 'tianjin',
    name: '天津',
    region: '华北',
    cuisine_family: '津菜',
    color: '#D48806',
    description: '九河下梢，码头文化孕育了独特的津味小吃，狗不理包子名扬天下。',
  },
  {
    id: 'hebei',
    name: '河北',
    region: '华北',
    cuisine_family: '冀菜',
    color: '#7CB305',
    description: '环京津之地，驴肉火烧、正定八大碗，朴实厚重的北方味道。',
  },
  {
    id: 'shanxi',
    name: '山西',
    region: '华北',
    cuisine_family: '晋菜',
    color: '#EB2F96',
    description: '面食王国，刀削面、莜面栲栳栳，醋文化深入骨髓。',
  },
  {
    id: 'neimenggu',
    name: '内蒙古',
    region: '华北',
    cuisine_family: '蒙餐',
    color: '#8C8C8C',
    description: '草原上的盛宴，手把肉、烤全羊、奶茶奶酪，游牧民族的豪迈饮食。',
  },

  // ===== 东北 =====
  {
    id: 'liaoning',
    name: '辽宁',
    region: '东北',
    cuisine_family: '辽菜',
    color: '#1890FF',
    description: '满族饮食文化深厚，锅包肉外酥里嫩，大连海鲜鲜美无比。',
  },
  {
    id: 'jilin',
    name: '吉林',
    region: '东北',
    cuisine_family: '吉菜',
    color: '#2F54EB',
    description: '长白山珍馐，人参鸡、冷面、泡菜，朝鲜族风味浓郁。',
  },
  {
    id: 'heilongjiang',
    name: '黑龙江',
    region: '东北',
    cuisine_family: '黑菜',
    color: '#096DD9',
    description: '冰城美食，红肠、列巴、杀猪菜，俄罗斯风情与东北豪爽的碰撞。',
  },

  // ===== 华东 =====
  {
    id: 'shanghai',
    name: '上海',
    region: '华东',
    cuisine_family: '本帮菜',
    color: '#FA8C16',
    description: '海派美食，浓油赤酱的本帮菜，小笼包、生煎精致考究。',
  },
  {
    id: 'jiangsu',
    name: '江苏',
    region: '华东',
    cuisine_family: '苏菜',
    color: '#FAAD14',
    description: '淮扬菜天下闻名，狮子头、大煮干丝，刀工精细、口味清鲜。',
  },
  {
    id: 'zhejiang',
    name: '浙江',
    region: '华东',
    cuisine_family: '浙菜',
    color: '#E0A800',
    description: '杭帮菜清鲜爽脆，西湖醋鱼、东坡肉，江南水乡的精致味道。',
  },
  {
    id: 'anhui',
    name: '安徽',
    region: '华东',
    cuisine_family: '徽菜',
    color: '#E85050',
    description: '徽州菜重油重色重火功，臭鳜鱼、毛豆腐，山野之味独树一帜。',
  },
  {
    id: 'fujian',
    name: '福建',
    region: '华东',
    cuisine_family: '闽菜',
    color: '#13C2C2',
    description: '闽菜善用红糟、注重汤功，佛跳墙天下第一汤，海鲜丰富。',
  },
  {
    id: 'jiangxi',
    name: '江西',
    region: '华东',
    cuisine_family: '赣菜',
    color: '#389E0D',
    description: '赣菜辣而不猛，藜蒿炒腊肉、粉蒸肉，瓦罐汤鲜美醇厚。',
  },
  {
    id: 'shandong',
    name: '山东',
    region: '华东',
    cuisine_family: '鲁菜',
    color: '#A0D911',
    description: '鲁菜为八大菜系之首，糖醋鲤鱼、九转大肠，宫廷菜的根基。',
  },

  // ===== 华中 =====
  {
    id: 'henan',
    name: '河南',
    region: '华中',
    cuisine_family: '豫菜',
    color: '#722ED1',
    description: '中原味道，烩面、胡辣汤、洛阳水席，千年饮食文化传承。',
  },
  {
    id: 'hubei',
    name: '湖北',
    region: '华中',
    cuisine_family: '鄂菜',
    color: '#9254DE',
    description: '楚地美食，热干面、武昌鱼、排骨藕汤，早餐之都名不虚传。',
  },
  {
    id: 'hunan',
    name: '湖南',
    region: '华中',
    cuisine_family: '湘菜',
    color: '#B37FEB',
    description: '湘菜重辣重味，剁椒鱼头、臭豆腐、小炒肉，无辣不欢。',
  },

  // ===== 华南 =====
  {
    id: 'guangdong',
    name: '广东',
    region: '华南',
    cuisine_family: '粤菜',
    color: '#36CFC9',
    description: '食在广州，早茶点心、煲仔饭、白切鸡，追求食材本味。',
  },
  {
    id: 'guangxi',
    name: '广西',
    region: '华南',
    cuisine_family: '桂菜',
    color: '#5CDBD3',
    description: '桂林米粉、螺蛳粉、老友粉，粉的世界，酸辣鲜爽。',
  },
  {
    id: 'hainan',
    name: '海南',
    region: '华南',
    cuisine_family: '琼菜',
    color: '#87E8DE',
    description: '热带海岛美食，文昌鸡、加积鸭、东山羊、和乐蟹——海南四大名菜。',
  },

  // ===== 西南 =====
  {
    id: 'sichuan',
    name: '四川',
    region: '西南',
    cuisine_family: '川菜',
    color: '#D03030',
    description: '一菜一格、百菜百味，麻辣鲜香，火锅与串串的故乡。',
  },
  {
    id: 'chongqing',
    name: '重庆',
    region: '西南',
    cuisine_family: '渝菜',
    color: '#FF4D4F',
    description: '山城味道，重庆火锅麻辣霸道，小面酸辣粉，江湖菜豪放不羁。',
  },
  {
    id: 'guizhou',
    name: '贵州',
    region: '西南',
    cuisine_family: '黔菜',
    color: '#FF7A45',
    description: '酸汤为魂、辣子为骨，酸汤鱼、丝娃娃、肠旺面，少数民族风味独特。',
  },
  {
    id: 'yunnan',
    name: '云南',
    region: '西南',
    cuisine_family: '滇菜',
    color: '#FF9020',
    description: '鲜花入馔、野菌飘香，过桥米线、汽锅鸡，多民族饮食文化交融。',
  },
  {
    id: 'xizang',
    name: '西藏',
    region: '西南',
    cuisine_family: '藏餐',
    color: '#FFD666',
    description: '高原饮食，糌粑、酥油茶、青稞酒，藏族人民的生活智慧。',
  },

  // ===== 西北 =====
  {
    id: 'shaanxi',
    name: '陕西',
    region: '西北',
    cuisine_family: '陕菜',
    color: '#C27A00',
    description: '三秦大地，肉夹馍、凉皮、羊肉泡馍，面食文化博大精深。',
  },
  {
    id: 'gansu',
    name: '甘肃',
    region: '西北',
    cuisine_family: '陇菜',
    color: '#BB9B2A',
    description: '兰州牛肉面享誉全国，酿皮子、手抓羊肉，丝绸之路上的美味。',
  },
  {
    id: 'qinghai',
    name: '青海',
    region: '西北',
    cuisine_family: '青菜',
    color: '#614700',
    description: '高原美食，手抓羊肉、酿皮、甜醅，多民族饮食融合。',
  },
  {
    id: 'ningxia',
    name: '宁夏',
    region: '西北',
    cuisine_family: '宁菜',
    color: '#9A6E00',
    description: '滩羊之鲜天下知，手抓羊肉、羊杂碎，回族美食风味独特。',
  },
  {
    id: 'xinjiang',
    name: '新疆',
    region: '西北',
    cuisine_family: '疆菜',
    color: '#7B5800',
    description: '大盘鸡、烤羊肉串、馕、手抓饭，西域美食豪迈奔放。',
  },

  // ===== 港澳台 =====
  {
    id: 'hongkong',
    name: '香港',
    region: '华南',
    cuisine_family: '港式',
    color: '#2AB8B3',
    description: '中西合璧的美食天堂，港式茶餐厅、烧腊、菠萝包、丝袜奶茶。',
  },
  {
    id: 'macau',
    name: '澳门',
    region: '华南',
    cuisine_family: '澳式',
    color: '#47C8BF',
    description: '葡式蛋挞、猪扒包、非洲鸡，中葡美食文化交融的独特风味。',
  },
  {
    id: 'taiwan',
    name: '台湾',
    region: '华东',
    cuisine_family: '台菜',
    color: '#6DD5D0',
    description: '夜市天堂，卤肉饭、牛肉面、珍珠奶茶、蚵仔煎，小吃文化发达。',
  },
]

/** 八大菜系 + 代表性区域菜 */
export const cuisineFamilies = [
  { id: 'chuan', name: '川菜', region: '西南', color: '#E8372C', trait: '麻辣' },
  { id: 'yue', name: '粤菜', region: '华南', color: '#52C41A', trait: '清鲜' },
  { id: 'lu', name: '鲁菜', region: '华东', color: '#135200', trait: '咸鲜' },
  { id: 'su', name: '苏菜', region: '华东', color: '#FAAD14', trait: '甜鲜' },
  { id: 'zhe', name: '浙菜', region: '华东', color: '#D4B106', trait: '鲜嫩' },
  { id: 'min', name: '闽菜', region: '华东', color: '#389E0D', trait: '鲜香' },
  { id: 'xiang', name: '湘菜', region: '华中', color: '#FFA940', trait: '香辣' },
  { id: 'hui', name: '徽菜', region: '华东', color: '#7CB305', trait: '重味' },
] as const

/** 菜系分类中文名 */
export const categoryLabels: Record<DishCategory, string> = {
  snack: '小吃',
  main: '主菜',
  soup: '汤羹',
  dessert: '甜品',
  staple: '主食',
  cold_dish: '凉菜',
  street_food: '街头美食',
  drink: '饮品',
}

/** 烹饪方式中文名 */
export const cookingMethodLabels: Record<CookingMethod, string> = {
  stir_fry: '炒',
  steam: '蒸',
  boil: '煮',
  deep_fry: '炸',
  roast: '烤',
  cold: '凉拌',
  braise: '炖/烧',
  smoke: '熏',
  pickle: '腌',
}

/** 口味维度中文名 */
export const flavorLabels: Record<keyof FlavorProfile, string> = {
  spicy: '辣',
  sweet: '甜',
  sour: '酸',
  salty: '咸',
  umami: '鲜',
  numbing: '麻',
  bitter: '苦',
  aromatic: '香',
}

/** 口味维度颜色 */
export const flavorColors: Record<keyof FlavorProfile, string> = {
  spicy: '#E8372C',
  sweet: '#FA8C16',
  sour: '#FAAD14',
  salty: '#1890FF',
  umami: '#52C41A',
  numbing: '#722ED1',
  bitter: '#13C2C2',
  aromatic: '#EB2F96',
}
