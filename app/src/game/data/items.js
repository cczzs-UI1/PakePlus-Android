// 物品数据库 - 区分凡人界/修仙界，货币分为银两和灵石
// currency: 'silver' = 银两（凡人界），'spirit' = 灵石（修仙界及以上）
// realm: 'mortal' = 凡人界，'cultivation' = 修仙界，'demon' = 魔界冥界，'special' = 特殊

const ITEMS = {
  // ===== 凡人界物品（银两购买） =====
  // 凡人药品
  '金疮药': { type: 'pill', tier: '凡', realm: 'mortal', currency: 'silver', effect: { hp: 100 }, desc: '凡人界常用的金疮药，治疗外伤。', price: 50 },
  '安神汤': { type: 'pill', tier: '凡', realm: 'mortal', currency: 'silver', effect: { mp: 80 }, desc: '安神定志的汤药，恢复精神。', price: 30 },
  '解毒散': { type: 'pill', tier: '凡', realm: 'mortal', currency: 'silver', effect: { removeDebuff: ['中毒'] }, desc: '解除常见毒素。', price: 80 },
  '人参': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '百年人参，大补元气。', price: 200 },
  '鹿茸': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '鹿茸，补肾壮阳。', price: 150 },
  '阿胶': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '补血滋阴的珍贵药材。', price: 120 },

  // 凡人武器
  '铁剑': { type: 'weapon', tier: '凡', realm: 'mortal', currency: 'silver', attack: 8, desc: '普通铁剑，凡人武士常用。', price: 100 },
  '钢刀': { type: 'weapon', tier: '凡', realm: 'mortal', currency: 'silver', attack: 10, desc: '精钢打造的砍刀。', price: 150 },
  '长枪': { type: 'weapon', tier: '凡', realm: 'mortal', currency: 'silver', attack: 12, desc: '军中常用的长枪。', price: 120 },
  '弓箭': { type: 'weapon', tier: '凡', realm: 'mortal', currency: 'silver', attack: 9, desc: '狩猎用的弓箭。', price: 80 },
  '皮甲': { type: 'armor', tier: '凡', realm: 'mortal', currency: 'silver', defense: 5, desc: '兽皮制成的护甲。', price: 100 },
  '铁甲': { type: 'armor', tier: '凡', realm: 'mortal', currency: 'silver', defense: 10, desc: '军中制式铁甲。', price: 300 },

  // 凡人材料
  '精铁': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '锻造武器的精铁。', price: 50 },
  '煤炭': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '打铁用的煤炭。', price: 20 },
  '兽皮': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '野兽的皮毛。', price: 30 },
  '兽肉': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '可食用的兽肉。', price: 10 },
  '粮食': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '日常食用的粮食。', price: 5 },
  '丝绸': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '上等丝绸。', price: 100 },
  '茶叶': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '上好的茶叶。', price: 60 },
  '食盐': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '日常调味品。', price: 10 },
  '酒': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '粮食酿造的酒。', price: 30 },

  // 肉类食材
  '猪肉': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '新鲜的猪肉，肥而不腻。', price: 25, priceRange: [15, 40] },
  '牛肉': { type: 'food_material', tier: '凡中品', realm: 'mortal', currency: 'silver', desc: '劲道的牛肉，营养丰富。', price: 40, priceRange: [30, 60] },
  '羊肉': { type: 'food_material', tier: '凡中品', realm: 'mortal', currency: 'silver', desc: '鲜嫩的羊肉，温补之品。', price: 35, priceRange: [25, 55] },
  '鸡肉': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '散养的鸡肉，肉质紧实。', price: 20, priceRange: [12, 35] },
  '鸭肉': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '肥美的鸭肉，适合烤制。', price: 22, priceRange: [15, 35] },
  '鱼肉': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '鲜活的鱼肉，细嫩鲜美。', price: 18, priceRange: [10, 30] },
  '鸡蛋': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '新鲜的鸡蛋，营养丰富。', price: 8, priceRange: [5, 15] },
  '葱姜': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '调味用的葱姜。', price: 5, priceRange: [3, 10] },
  '酱油': { type: 'food_material', tier: '凡下品', realm: 'mortal', currency: 'silver', desc: '酿造的酱油，提鲜上色。', price: 10, priceRange: [6, 18] },
  '蜂蜜': { type: 'food_material', tier: '凡中品', realm: 'mortal', currency: 'silver', desc: '天然蜂蜜，甘甜滋补。', price: 50, priceRange: [35, 80] },
  '枸杞': { type: 'food_material', tier: '凡中品', realm: 'mortal', currency: 'silver', desc: '滋补的枸杞，明目养颜。', price: 40, priceRange: [30, 60] },
  '鲍鱼': { type: 'food_material', tier: '珍品', realm: 'mortal', currency: 'silver', desc: '海味珍品，肉质鲜美。', price: 200, priceRange: [150, 350] },
  '海参': { type: 'food_material', tier: '珍品', realm: 'mortal', currency: 'silver', desc: '海中人参，滋补佳品。', price: 180, priceRange: [130, 300] },
  '鱼翅': { type: 'food_material', tier: '珍品', realm: 'mortal', currency: 'silver', desc: '鲨鱼鳍，名贵食材。', price: 300, priceRange: [200, 500] },
  '妖兽肉': { type: 'food_material', tier: '灵品', realm: 'cultivation', currency: 'spirit', desc: '妖兽的肉，蕴含灵气。', price: 50, priceRange: [30, 80] },
  '妖兽内丹': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '妖兽体内的内丹，蕴含强大灵力。', price: 500 },

  // 凡人物品
  '胭脂': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '女子化妆用的胭脂。', price: 50 },
  '香水': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '花香调制的香水。', price: 80 },
  '珠宝': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '珍贵的珠宝首饰。', price: 500 },
  '古董': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '古董字画。', price: 300 },
  '书籍': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '各类书籍。', price: 40 },
  '笔墨纸砚': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '文房四宝。', price: 80 },

  // ===== 修仙界物品（灵石购买） =====
  // 丹药
  '回灵丹': { type: 'pill', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { mp: 500 }, desc: '恢复灵力的基础丹药。', price: 50 },
  '回春丹': { type: 'pill', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { hp: 500, removeDebuff: ['虚弱'] }, desc: '恢复气血，解除虚弱。', price: 80 },
  '清心丹': { type: 'pill', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { removeDebuff: ['心魔缠身','走火入魔'] }, desc: '清心静神，解除心魔。', price: 200 },
  '解毒丹': { type: 'pill', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { removeDebuff: ['中毒','炎毒'] }, desc: '解除中毒状态。', price: 60 },
  '筑基丹': { type: 'pill', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 3, bonus: 30 }, desc: '筑基期突破必备，提升30%成功率。', price: 1000 },
  '金丹破障丹': { type: 'pill', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 4 }, desc: '金丹期突破必备。', price: 5000 },
  '元婴丹': { type: 'pill', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 5 }, desc: '元婴期突破必备。', price: 20000 },
  '化神丹': { type: 'pill', tier: '古', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 6 }, desc: '化神期突破必备。', price: 80000 },
  '炼虚丹': { type: 'pill', tier: '古', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 7 }, desc: '炼虚期突破必备。', price: 300000 },
  '合体丹': { type: 'pill', tier: '圣', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 8 }, desc: '合体期突破必备。', price: 1000000 },
  '大乘丹': { type: 'pill', tier: '圣', realm: 'cultivation', currency: 'spirit', effect: { breakthrough: 9 }, desc: '大乘期突破必备。', price: 5000000 },
  '送子丹': { type: 'pill', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { pregnancy: 100 }, desc: '服用后受孕概率锁定100%。', price: 3000 },
  '顺产丹': { type: 'pill', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { birthBonus: 20 }, desc: '生产成功率+20%。', price: 800 },
  '安胎丸': { type: 'pill', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { miscarry: 1 }, desc: '流产概率降至1%，幼崽属性+5%。', price: 1500 },
  '化形丹': { type: 'pill', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { transform: true }, desc: '妖族/半妖永久化形。', price: 5000 },
  '融雪丹': { type: 'pill', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { removeDebuff: ['冻伤'] }, desc: '解除冻伤，恢复根骨。', price: 600 },
  '聚气丹': { type: 'pill', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { cultivationExp: 500 }, desc: '增加修为500。', price: 100 },

  // 符箓
  '疾风符': { type: 'talisman', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { buff: '轻身术', duration: 3 }, desc: '使用后闪避+40%。', price: 30 },
  '净魔符': { type: 'talisman', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { removeDebuff: ['魔气侵蚀'] }, desc: '净化魔气。', price: 150 },
  '天雷符': { type: 'talisman', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { damage: 500, element: '雷' }, desc: '召唤天雷攻击敌人。', price: 1000 },

  // 修仙装备
  '青锋剑': { type: 'weapon', tier: '灵', realm: 'cultivation', currency: 'spirit', attack: 50, desc: '青云剑宗制式长剑。', price: 800 },
  '碎星锤': { type: 'weapon', tier: '古', realm: 'cultivation', currency: 'spirit', attack: 300, desc: '传说中可碎星辰的重锤。', price: 150000 },
  '五行混天绫': { type: 'armor', tier: '古', realm: 'cultivation', currency: 'spirit', defense: 200, desc: '五行交织的护身宝绫。', price: 120000 },
  '玄龟甲壳': { type: 'petArmor', tier: '灵', realm: 'cultivation', currency: 'spirit', defense: 25, hp: 100, desc: '玄龟壳制成的宠物护甲。', price: 600 },
  '雷鸣铃': { type: 'petBell', tier: '宝', realm: 'cultivation', currency: 'spirit', speed: 15, element: '雷', desc: '宠物铃铛，雷系加成。', price: 3000 },
  '飞剑': { type: 'weapon', tier: '灵', realm: 'cultivation', currency: 'spirit', attack: 80, desc: '可御剑飞行的飞剑。', price: 1500 },
  '法袍': { type: 'armor', tier: '灵', realm: 'cultivation', currency: 'spirit', defense: 30, mp: 200, desc: '修士常用的法袍。', price: 600 },
  // 扩充修仙武器
  '桃木剑': { type: 'weapon', tier: '凡', realm: 'cultivation', currency: 'spirit', attack: 20, desc: '桃木制成，可驱邪。', price: 100 },
  '朱砂笔': { type: 'weapon', tier: '凡', realm: 'cultivation', currency: 'spirit', attack: 15, mp: 30, desc: '画符用的朱砂笔，亦可攻敌。', price: 150 },
  '拂尘': { type: 'weapon', tier: '灵', realm: 'cultivation', currency: 'spirit', attack: 35, mp: 80, desc: '道门法器，可攻可守。', price: 500 },
  '玉如意': { type: 'weapon', tier: '灵', realm: 'cultivation', currency: 'spirit', attack: 45, mp: 100, desc: '温润如玉，内含灵气。', price: 700 },
  '芭蕉扇': { type: 'weapon', tier: '宝', realm: 'cultivation', currency: 'spirit', attack: 150, element: '风', desc: '可扇出大风的宝扇。', price: 8000 },
  '紫金葫芦': { type: 'weapon', tier: '宝', realm: 'cultivation', currency: 'spirit', attack: 120, mp: 200, desc: '可收人入内的法宝。', price: 6000 },
  '轩辕剑': { type: 'weapon', tier: '圣', realm: 'cultivation', currency: 'spirit', attack: 500, hp: 300, mp: 300, desc: '上古神兵，正气凛然。', price: 1500000 },
  '诛仙剑': { type: 'weapon', tier: '圣', realm: 'cultivation', currency: 'spirit', attack: 600, attackBonus: 20, desc: '诛仙四剑之首，杀气冲天。', price: 2000000 },
  // 扩充修仙护甲
  '布衣': { type: 'armor', tier: '凡', realm: 'cultivation', currency: 'spirit', defense: 5, desc: '普通布衣。', price: 50 },
  '道袍': { type: 'armor', tier: '凡', realm: 'cultivation', currency: 'spirit', defense: 10, mp: 30, desc: '道士穿的道袍。', price: 100 },
  '袈裟': { type: 'armor', tier: '灵', realm: 'cultivation', currency: 'spirit', defense: 25, hp: 100, desc: '佛门袈裟，可辟邪。', price: 400 },
  '战甲': { type: 'armor', tier: '灵', realm: 'cultivation', currency: 'spirit', defense: 40, hp: 200, desc: '修士作战用的战甲。', price: 800 },
  '玄武甲': { type: 'armor', tier: '宝', realm: 'cultivation', currency: 'spirit', defense: 80, hp: 500, desc: '以玄武壳炼制的宝甲。', price: 5000 },
  '天蚕衣': { type: 'armor', tier: '古', realm: 'cultivation', currency: 'spirit', defense: 120, speed: 30, desc: '天蚕丝织成，刀枪不入。', price: 80000 },
  '九龙袍': { type: 'armor', tier: '圣', realm: 'cultivation', currency: 'spirit', defense: 200, hp: 1000, mp: 500, desc: '绣有九条金龙的帝袍。', price: 1000000 },
  // 饰品
  '玉佩': { type: 'accessory', tier: '凡', realm: 'mortal', currency: 'silver', mp: 20, desc: '普通玉佩，养身安神。', price: 200 },
  '玉簪': { type: 'accessory', tier: '凡', realm: 'mortal', currency: 'silver', mp: 15, desc: '女子束发用的玉簪。', price: 150 },
  '戒指': { type: 'accessory', tier: '凡', realm: 'mortal', currency: 'silver', attack: 3, desc: '普通戒指。', price: 100 },
  '储物戒': { type: 'accessory', tier: '灵', realm: 'cultivation', currency: 'spirit', mp: 100, desc: '可存储物品的戒指。', price: 1000 },
  '纳戒': { type: 'accessory', tier: '宝', realm: 'cultivation', currency: 'spirit', mp: 300, desc: '空间更大的储物戒指。', price: 5000 },
  '灵兽袋': { type: 'accessory', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '可收纳灵兽的袋子。', price: 800 },
  '传讯玉符': { type: 'accessory', tier: '灵', realm: 'cultivation', currency: 'spirit', mp: 50, desc: '可远距离传讯的玉符。', price: 600 },
  '护身符': { type: 'accessory', tier: '凡', realm: 'cultivation', currency: 'spirit', defense: 10, hp: 50, desc: '可抵挡一次攻击的护身符。', price: 200 },
  '避水珠': { type: 'accessory', tier: '灵', realm: 'cultivation', currency: 'spirit', mp: 80, desc: '佩戴可在水中呼吸。', price: 500 },
  '避火珠': { type: 'accessory', tier: '灵', realm: 'cultivation', currency: 'spirit', defense: 20, element: '火', desc: '佩戴可避火。', price: 500 },
  '聚灵珠': { type: 'accessory', tier: '宝', realm: 'cultivation', currency: 'spirit', mp: 200, cultivateBonus: 10, desc: '聚集灵气，修炼加速。', price: 3000 },
  '定魂珠': { type: 'accessory', tier: '古', realm: 'cultivation', currency: 'spirit', hp: 500, mp: 300, desc: '稳固神魂，防止走火入魔。', price: 60000 },
  '混沌珠': { type: 'accessory', tier: '圣', realm: 'special', currency: 'spirit', hp: 1000, mp: 1000, cultivateBonus: 50, desc: '混沌初开时的灵宝，内含一方世界。', price: 2000000 },

  // 修仙材料
  '灵稻': { type: 'material', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '可食用或炼制辟谷丹。', price: 10 },
  '聚灵草': { type: 'material', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '炼制回灵丹的材料。', price: 20 },
  '灵草': { type: 'material', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '基础炼丹材料。', price: 15 },
  '百年茯苓': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '炼制筑基丹的材料。', price: 200 },
  '玄铁': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '炼器基础材料。', price: 150 },
  '妖丹': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '妖兽内丹，炼器炼丹材料。', price: 300 },
  '古宝碎片': { type: 'material', tier: '古', realm: 'cultivation', currency: 'spirit', desc: '古宝碎片，可用于升级产业。', price: 30000 },
  '圣物碎片': { type: 'material', tier: '圣', realm: 'cultivation', currency: 'spirit', desc: '圣物碎片，极其稀有。', price: 300000 },
  '寒铁': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '极寒之地的铁矿。', price: 250 },
  '雷石': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '蕴含雷电之力的石头。', price: 800 },
  '妖兽皮': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '妖兽的皮毛。', price: 100 },

  // ===== 魔界冥界物品 =====
  '魔晶': { type: 'material', tier: '宝', realm: 'demon', currency: 'spirit', desc: '魔域出产的魔晶。', price: 500 },
  '血煞丹': { type: 'pill', tier: '宝', realm: 'demon', currency: 'spirit', effect: { attack: 50, duration: 10 }, desc: '血煞魔宗秘药，短时提升攻击。', price: 1000 },
  '魔功秘籍': { type: 'material', tier: '古', realm: 'demon', currency: 'spirit', desc: '魔道功法秘籍。', price: 50000 },
  '魂火': { type: 'material', tier: '宝', realm: 'demon', currency: 'spirit', desc: '阴气凝结的魂火。', price: 800 },
  '阴魂珠': { type: 'material', tier: '灵', realm: 'demon', currency: 'spirit', desc: '凝聚阴魂的珠子。', price: 400 },

  // ===== 炼丹/炼器材料（配方引用，补全可获取）=====
  '灵木': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '蕴含灵气的木材，锻造常用。', price: 40 },
  '珍珠': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '圆润晶莹的珍珠，可入饰可入药。', price: 80 },
  '朱砂': { type: 'material', tier: '凡', realm: 'mortal', currency: 'silver', desc: '朱红砂石，制符绘阵的原料。', price: 60 },
  '回阳草': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '生于朝阳之地的灵草，可入药。', price: 150 },
  '月华露': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '月夜凝成的灵露，蕴含精纯灵气。', price: 120 },
  '紫霞参': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '紫气缭绕的宝参，炼丹圣品。', price: 800 },
  '玄阳果': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '蕴含阳气的灵果。', price: 300 },
  '凤仙花': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '娇艳的灵花，有安胎养元之效。', price: 400 },
  '冰心莲': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '生于寒潭的冰莲，清心凝神。', price: 900 },
  '千年灵芝': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '千年温养的灵芝，大补元气。', price: 1500 },
  '万年人参': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '万年药王，夺天地造化。', price: 5000 },
  '雷竹': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '雷击而不死的灵竹，蕴含雷力。', price: 1200 },
  '龙须草': { type: 'material', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '形似龙须的灵草，元婴丹主材。', price: 2000 },
  '妖兽骨': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '妖兽的骸骨，炼器淬炼材料。', price: 100 },
  '混沌莲': { type: 'material', tier: '仙', realm: 'cultivation', currency: 'spirit', desc: '混沌初开时遗留的仙莲。', price: 20000 },

  // ===== 特殊道具 =====
  '化形符': { type: 'special', tier: '灵', realm: 'special', currency: 'spirit', effect: { transform: true, duration: -1 }, desc: '妖族佩戴可进入人族城镇。', price: 500 },
  // ===== 符箓（阵法师协会学习/制作/购买）=====
  '火球符': { type: 'talisman', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { fireDamage: 30 }, desc: '掷出火球，造成火焰伤害。', price: 50 },
  '冰锥符': { type: 'talisman', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { iceDamage: 25 }, desc: '射出冰锥，造成冰霜伤害。', price: 50 },
  '巨力符': { type: 'talisman', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { atkBuff: 0.3 }, desc: '贴符后力大无穷，攻击+30%。', price: 60 },
  '风行符': { type: 'talisman', tier: '凡', realm: 'cultivation', currency: 'spirit', effect: { moveBuff: true }, desc: '身轻如燕，移动消耗减半。', price: 60 },
  '护盾符': { type: 'talisman', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { shield: 50 }, desc: '展开灵力护盾，抵挡一次伤害。', price: 150 },
  '困敌符': { type: 'talisman', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { bind: true }, desc: '束缚敌人，3回合无法行动。', price: 180 },
  '天雷符': { type: 'talisman', tier: '仙', realm: 'cultivation', currency: 'spirit', effect: { thunderDamage: 200 }, desc: '引动天雷，造成毁灭性伤害。', price: 8000 },

  '避魔珠': { type: 'special', tier: '宝', realm: 'special', currency: 'spirit', effect: { antiDemon: true }, desc: '佩戴可进入魔域。', price: 2000 },
  '皇家手令': { type: 'special', tier: '凡', realm: 'mortal', currency: 'silver', effect: { access: '大夏皇陵' }, desc: '皇家信物，可入皇陵。', price: 0 },
  '龙鳞信物': { type: 'special', tier: '古', realm: 'special', currency: 'spirit', effect: { access: '龙渊' }, desc: '龙族信物，可入龙渊。', price: 0 },
  '定海神针': { type: 'special', tier: '圣', realm: 'special', currency: 'spirit', effect: { access: '归墟海眼' }, desc: '大禹治水所留神针。', price: 0 },
  '入梦丹': { type: 'special', tier: '宝', realm: 'special', currency: 'spirit', effect: { access: '太虚梦境' }, desc: '可入太虚梦境。', price: 3000 },
  '空间坐标': { type: 'special', tier: '古', realm: 'special', currency: 'spirit', effect: { access: '洞天福地' }, desc: '洞天福地的空间坐标。', price: 0 },
  '腰牌': { type: 'special', tier: '凡', realm: 'mortal', currency: 'silver', effect: { access: '御花园' }, desc: '皇宫通行腰牌。', price: 0 },
  '虎符': { type: 'special', tier: '凡', realm: 'mortal', currency: 'silver', effect: { access: '禁军大营' }, desc: '调兵虎符。', price: 0 },
  // ===== 产业类物品（第九批：使用后获得对应产业）=====
  '灵石矿脉': { type: 'estate', tier: '宝', realm: 'cultivation', currency: 'spirit', effect: { estate: 'mine' }, desc: '一条小型灵石矿脉的契书，每月产出灵石。', price: 50000 },
  '灵田契约': { type: 'estate', tier: '灵', realm: 'cultivation', currency: 'spirit', effect: { estate: 'farmland' }, desc: '一块灵田的契约，获得后可种植灵植、每月收获。', price: 20000 },
  '店铺地契': { type: 'estate', tier: '宝', realm: 'mortal', currency: 'silver', effect: { estate: 'shop' }, desc: '凡人街市一间店铺的地契，可上架货物、NPC每月购买。', price: 30000 },
  '洞府钥匙': { type: 'estate', tier: '圣', realm: 'cultivation', currency: 'spirit', effect: { estate: 'cave' }, desc: '一座仙山洞府的钥匙，对标顶级宅邸。', price: 100000 },
  // ===== 灵兽蛋与灵兽用品（第九批）=====
  '灵鼠蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚灵鼠的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 50 },
  '灵猫蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚灵猫的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 50 },
  '灵貂蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚灵貂的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 50 },
  '灵雀蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚灵雀的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 50 },
  '彩蝶蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚彩蝶的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 50 },
  '玉兔蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚玉兔的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '苍狼蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚苍狼的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '哮天犬蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚哮天犬的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '青鳞蛇蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚青鳞蛇的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '灵猴蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚灵猴的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '锦鲤蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚锦鲤的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '山魈蛋': { type: 'petEgg', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚山魈的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 150 },
  '玄龟蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚玄龟的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '黑熊蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚黑熊的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '仙鹤蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚仙鹤的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '金蟾蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚金蟾的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '冰蛛蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚冰蛛的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '独角犀蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚独角犀的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '银狼王蛋': { type: 'petEgg', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '一枚银狼王的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 400 },
  '白虎蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚白虎的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '火麒麟蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚火麒麟的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '雷豹蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚雷豹的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '金翅大鹏蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚金翅大鹏的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '赤炎狮蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚赤炎狮的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '九色鹿蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚九色鹿的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '紫电貂蛋': { type: 'petEgg', tier: '宝', realm: 'cultivation', currency: 'spirit', desc: '一枚紫电貂的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 1000 },
  '九尾狐蛋': { type: 'petEgg', tier: '古', realm: 'cultivation', currency: 'spirit', desc: '一枚九尾狐的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 3000 },
  '朱雀蛋': { type: 'petEgg', tier: '古', realm: 'cultivation', currency: 'spirit', desc: '一枚朱雀的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 3000 },
  '白泽蛋': { type: 'petEgg', tier: '古', realm: 'cultivation', currency: 'spirit', desc: '一枚白泽的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 3000 },
  '青龙蛋': { type: 'petEgg', tier: '圣', realm: 'cultivation', currency: 'spirit', desc: '一枚青龙的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 8000 },
  '玄武蛋': { type: 'petEgg', tier: '圣', realm: 'cultivation', currency: 'spirit', desc: '一枚玄武的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 8000 },
  '混沌兽蛋': { type: 'petEgg', tier: '圣', realm: 'cultivation', currency: 'spirit', desc: '一枚混沌兽的灵兽蛋，孵化后概率获得灵兽（也可能孵化出死蛋）。', price: 8000 },
  '灵果': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '蕴含灵气的仙果，喂食灵兽可获得大量晋升经验。', price: 50 },
  '灵谷': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '灵田中收获的灵谷，可喂食灵兽。', price: 20 },
  '灵兽口粮': { type: 'material', tier: '灵', realm: 'cultivation', currency: 'spirit', desc: '精心调配的灵兽口粮，喂食稳定获得晋升经验。', price: 30 },
  '捕兽网': { type: 'material', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '捕捉灵兽成功率+20%。', price: 100 },
  '死蛋': { type: 'material', tier: '凡', realm: 'cultivation', currency: 'spirit', desc: '一枚未能孵化的死蛋，已无生机。', price: 5 },
};

// 物品品质颜色
const TIER_COLORS = {
  '凡': '#aaaaaa',
  '灵': '#4ade80',
  '宝': '#60a5fa',
  '古': '#c084fc',
  '圣': '#fbbf24',
};

// 获取物品信息
function getItemInfo(name) {
  return ITEMS[name] || null;
}

// 获取凡人界物品
function getMortalItems() {
  return Object.entries(ITEMS).filter(([k, v]) => v.realm === 'mortal').map(([k, v]) => ({ name: k, ...v }));
}

// 获取修仙界物品
function getCultivationItems() {
  return Object.entries(ITEMS).filter(([k, v]) => v.realm === 'cultivation').map(([k, v]) => ({ name: k, ...v }));
}

// 根据界域获取物品
function getItemsByRealm(realm) {
  return Object.entries(ITEMS).filter(([k, v]) => v.realm === realm).map(([k, v]) => ({ name: k, ...v }));
}

module.exports = { ITEMS, TIER_COLORS, getItemInfo, getMortalItems, getCultivationItems, getItemsByRealm };;
