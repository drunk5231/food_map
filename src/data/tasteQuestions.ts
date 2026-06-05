import type { TasteQuestion } from '../types'

export const tasteQuestions: TasteQuestion[] = [
  {
    id: 1,
    question: '朋友约你吃火锅，锅底你选？',
    options: [
      { text: '鸳鸯锅，照顾大家口味', scores: { spicy: 3, umami: 2 } },
      { text: '红油麻辣锅，必须的！', scores: { spicy: 8, numbing: 4 } },
      { text: '番茄锅，酸甜暖胃', scores: { sweet: 3, sour: 4 } },
      { text: '清汤菌菇锅，鲜美为主', scores: { umami: 6 } },
    ],
  },
  {
    id: 2,
    question: '路边闻到辣椒炒香，你的反应是？',
    options: [
      { text: '冲！必须尝一下', scores: { spicy: 7 } },
      { text: '有点馋，但怕太辣', scores: { spicy: 3 } },
      { text: '无感，找清淡的吃', scores: { umami: 2 } },
      { text: '闻着香就够了', scores: { aromatic: 3 } },
    ],
  },
  {
    id: 3,
    question: '下午茶你更想吃什么？',
    options: [
      { text: '绿豆糕、桂花糕', scores: { sweet: 6, aromatic: 3 } },
      { text: '奶茶配芋圆', scores: { sweet: 7 } },
      { text: '咸味小食（肉干、坚果）', scores: { salty: 5, umami: 3 } },
      { text: '水果拼盘', scores: { sweet: 3, sour: 2 } },
    ],
  },
  {
    id: 4,
    question: '月饼/粽子你选什么馅？',
    options: [
      { text: '豆沙/莲蓉（甜党）', scores: { sweet: 7 } },
      { text: '鲜肉/蛋黄（咸党）', scores: { salty: 6, umami: 5 } },
      { text: '都行，看心情', scores: { sweet: 3, salty: 3 } },
      { text: '水果/冰淇淋（新派）', scores: { sweet: 5, sour: 2 } },
    ],
  },
  {
    id: 5,
    question: '吃面/粉的时候你会加醋吗？',
    options: [
      { text: '必须加，多多益善', scores: { sour: 8 } },
      { text: '加一点点提味', scores: { sour: 3 } },
      { text: '不加，原味最好', scores: { umami: 3 } },
      { text: '我加辣椒油', scores: { spicy: 6 } },
    ],
  },
  {
    id: 6,
    question: '酸辣粉 vs 清汤馄饨，你选？',
    options: [
      { text: '酸辣粉！酸辣过瘾', scores: { sour: 7, spicy: 6 } },
      { text: '清汤馄饨，鲜香温暖', scores: { umami: 6, aromatic: 2 } },
    ],
  },
  {
    id: 7,
    question: '早餐你更想吃什么？',
    options: [
      { text: '豆浆油条配咸菜', scores: { salty: 6 } },
      { text: '白粥配腐乳/榨菜', scores: { salty: 5, umami: 3 } },
      { text: '甜豆脑/甜粥', scores: { sweet: 6 } },
      { text: '牛奶面包三明治', scores: { umami: 4 } },
    ],
  },
  {
    id: 8,
    question: '菜太淡了你怎么办？',
    options: [
      { text: '加酱油/豆瓣酱', scores: { salty: 6, umami: 4 } },
      { text: '加盐', scores: { salty: 7 } },
      { text: '挺好，清淡健康', scores: {} },
      { text: '加点辣椒提味', scores: { spicy: 5 } },
    ],
  },
  {
    id: 9,
    question: '选一种汤你天天喝？',
    options: [
      { text: '老母鸡汤/排骨汤', scores: { umami: 8 } },
      { text: '紫菜蛋花汤', scores: { umami: 4 } },
      { text: '番茄蛋汤', scores: { sour: 3, umami: 3 } },
      { text: '我不怎么喝汤', scores: {} },
    ],
  },
  {
    id: 10,
    question: '海鲜你更喜欢怎么吃？',
    options: [
      { text: '清蒸/白灼，吃原味鲜味', scores: { umami: 9 } },
      { text: '红烧/干锅，吃调料味', scores: { salty: 5, spicy: 4 } },
      { text: '烧烤/椒盐', scores: { aromatic: 6, salty: 4 } },
      { text: '不太吃海鲜', scores: {} },
    ],
  },
  {
    id: 11,
    question: '麻婆豆腐的灵魂是什么？',
    options: [
      { text: '花椒的麻', scores: { numbing: 8 } },
      { text: '辣椒的辣', scores: { spicy: 7 } },
      { text: '豆腐的嫩', scores: { umami: 5 } },
      { text: '都重要！缺一不可', scores: { numbing: 4, spicy: 4, umami: 3 } },
    ],
  },
  {
    id: 12,
    question: '吃麻辣小龙虾你能接受的辣度？',
    options: [
      { text: '蒜蓉的，不辣', scores: { aromatic: 6, umami: 4 } },
      { text: '微辣，有点味道就行', scores: { spicy: 3 } },
      { text: '中辣，要过瘾', scores: { spicy: 6, numbing: 3 } },
      { text: '变态辣，越辣越好', scores: { spicy: 9, numbing: 6 } },
    ],
  },
  {
    id: 13,
    question: '以下"怪味"你最能接受哪个？',
    options: [
      { text: '苦瓜', scores: { bitter: 7 } },
      { text: '折耳根（鱼腥草）', scores: { aromatic: 5, bitter: 3 } },
      { text: '臭豆腐/螺蛳粉', scores: { aromatic: 4, umami: 5 } },
      { text: '榴莲', scores: { sweet: 5, aromatic: 4 } },
    ],
  },
  {
    id: 14,
    question: '选一种你最离不开的烹饪方式？',
    options: [
      { text: '炒——镬气十足', scores: { aromatic: 7, umami: 4 } },
      { text: '蒸——原汁原味', scores: { umami: 7 } },
      { text: '炖/煲——浓郁醇厚', scores: { umami: 6, aromatic: 5 } },
      { text: '烤/炸——焦香酥脆', scores: { aromatic: 8 } },
    ],
  },
  {
    id: 15,
    question: '如果只能吃一个菜系一辈子，你选？',
    options: [
      { text: '川菜——麻辣鲜香', scores: { spicy: 5, numbing: 5, aromatic: 4 } },
      { text: '粤菜——清淡鲜美', scores: { umami: 7, sweet: 3 } },
      { text: '鲁菜——咸鲜醇厚', scores: { salty: 6, umami: 5 } },
      { text: '苏菜——甜糯精致', scores: { sweet: 6, umami: 4 } },
    ],
  },
]
