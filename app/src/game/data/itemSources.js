// 物品获取方式系统 - 每个物品的获取地点和方式
// 格式: { 物品名: [{ location: 地点, method: 方式, chance: 概率, count: [min, max] }] }

const ITEM_SOURCES = {
  // ===== 药品类 =====
  '金疮药': [
    { location: '清风镇', method: '药店购买', chance: 0.8, count: [1, 3] },
    { location: '大夏皇都', method: '药店购买', chance: 0.9, count: [1, 5] },
    { location: '自由坊市', method: '摊位购买', chance: 0.5, count: [1, 2] },
  ],
  '安神汤': [
    { location: '清风镇', method: '药店购买', chance: 0.6, count: [1, 2] },
    { location: '大夏皇都', method: '药店购买', chance: 0.8, count: [1, 3] },
  ],
  '解毒散': [
    { location: '清风镇', method: '药店购买', chance: 0.5, count: [1, 2] },
    { location: '万毒沼泽', method: '探索采集', chance: 0.3, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 2] },
  ],
  '人参': [
    { location: '落日森林', method: '采药', chance: 0.2, count: [1, 2] },
    { location: '万妖山脉', method: '采药', chance: 0.25, count: [1, 3] },
    { location: '大夏皇都', method: '药店购买', chance: 0.7, count: [1, 2] },
  ],
  '鹿茸': [
    { location: '落日森林', method: '狩猎', chance: 0.15, count: [1, 1] },
    { location: '万妖山脉', method: '狩猎', chance: 0.2, count: [1, 2] },
    { location: '大夏皇都', method: '药店购买', chance: 0.5, count: [1, 1] },
  ],
  '阿胶': [
    { location: '东海渔村', method: '购买', chance: 0.3, count: [1, 2] },
    { location: '大夏皇都', method: '药店购买', chance: 0.6, count: [1, 2] },
  ],

  // ===== 武器装备类 =====
  '铁剑': [
    { location: '清风镇', method: '铁匠铺购买', chance: 0.7, count: [1, 1] },
    { location: '大夏皇都', method: '兵器铺购买', chance: 0.9, count: [1, 1] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 1] },
  ],
  '钢刀': [
    { location: '清风镇', method: '铁匠铺购买', chance: 0.6, count: [1, 1] },
    { location: '大夏皇都', method: '兵器铺购买', chance: 0.8, count: [1, 1] },
    { location: '落日森林', method: '击败山贼', chance: 0.3, count: [1, 1] },
  ],
  '长枪': [
    { location: '清风镇', method: '铁匠铺购买', chance: 0.5, count: [1, 1] },
    { location: '大夏皇都', method: '兵器铺购买', chance: 0.7, count: [1, 1] },
    { location: '禁军大营', method: '军需购买', chance: 0.6, count: [1, 1] },
  ],
  '弓箭': [
    { location: '清风镇', method: '铁匠铺购买', chance: 0.5, count: [1, 1] },
    { location: '落日森林', method: '猎人处收购', chance: 0.4, count: [1, 1] },
    { location: '大夏皇都', method: '兵器铺购买', chance: 0.7, count: [1, 1] },
  ],
  '皮甲': [
    { location: '清风镇', method: '裁缝铺购买', chance: 0.6, count: [1, 1] },
    { location: '落日森林', method: '猎人处收购', chance: 0.3, count: [1, 1] },
    { location: '大夏皇都', method: '防具铺购买', chance: 0.8, count: [1, 1] },
  ],
  '铁甲': [
    { location: '大夏皇都', method: '防具铺购买', chance: 0.7, count: [1, 1] },
    { location: '禁军大营', method: '军需购买', chance: 0.5, count: [1, 1] },
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 1] },
  ],
  '青锋剑': [
    { location: '青云剑宗', method: '宗门兑换', chance: 0.3, count: [1, 1] },
    { location: '万剑冢', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '珍宝阁', method: '购买', chance: 0.2, count: [1, 1] },
  ],
  '碎星锤': [
    { location: '天星阁', method: '购买', chance: 0.2, count: [1, 1] },
    { location: '上古遗迹', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],

  // ===== 材料类 =====
  '精铁': [
    { location: '清风镇', method: '铁匠铺购买', chance: 0.6, count: [1, 5] },
    { location: '大夏皇都', method: '材料铺购买', chance: 0.8, count: [1, 10] },
    { location: '裂风峡谷', method: '采矿', chance: 0.4, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.5, count: [1, 5] },
  ],
  '煤炭': [
    { location: '清风镇', method: '杂货店购买', chance: 0.7, count: [1, 10] },
    { location: '大夏皇都', method: '材料铺购买', chance: 0.9, count: [1, 20] },
    { location: '裂风峡谷', method: '采矿', chance: 0.5, count: [1, 5] },
  ],
  '兽皮': [
    { location: '落日森林', method: '狩猎', chance: 0.5, count: [1, 3] },
    { location: '万妖山脉', method: '狩猎', chance: 0.6, count: [1, 5] },
    { location: '清风镇', method: '猎人处收购', chance: 0.4, count: [1, 2] },
  ],
  '兽肉': [
    { location: '落日森林', method: '狩猎', chance: 0.7, count: [1, 5] },
    { location: '万妖山脉', method: '狩猎', chance: 0.8, count: [1, 8] },
    { location: '东海渔村', method: '购买', chance: 0.5, count: [1, 3] },
    { location: '清风镇', method: '肉铺购买', chance: 0.6, count: [1, 3] },
  ],
  '灵草': [
    { location: '落日森林', method: '采药', chance: 0.4, count: [1, 3] },
    { location: '万妖山脉', method: '采药', chance: 0.5, count: [1, 5] },
    { location: '万毒沼泽', method: '采药', chance: 0.45, count: [1, 4] },
    { location: '丹塔', method: '购买', chance: 0.6, count: [1, 5] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 3] },
  ],

  // ===== 日常用品类 =====
  '粮食': [
    { location: '清风镇', method: '米铺购买', chance: 0.9, count: [1, 10] },
    { location: '大夏皇都', method: '米铺购买', chance: 0.95, count: [1, 20] },
    { location: '东海渔村', method: '购买', chance: 0.5, count: [1, 5] },
  ],
  '丝绸': [
    { location: '大夏皇都', method: '布庄购买', chance: 0.8, count: [1, 5] },
    { location: '珍宝阁', method: '购买', chance: 0.5, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 3] },
  ],
  '茶叶': [
    { location: '大夏皇都', method: '茶铺购买', chance: 0.8, count: [1, 5] },
    { location: '清风镇', method: '杂货店购买', chance: 0.5, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 3] },
  ],
  '食盐': [
    { location: '清风镇', method: '杂货店购买', chance: 0.8, count: [1, 5] },
    { location: '大夏皇都', method: '杂货店购买', chance: 0.9, count: [1, 10] },
    { location: '东海渔村', method: '购买', chance: 0.6, count: [1, 5] },
  ],
  '酒': [
    { location: '清风镇', method: '酒馆购买', chance: 0.8, count: [1, 5] },
    { location: '大夏皇都', method: '酒铺购买', chance: 0.9, count: [1, 10] },
    { location: '自由坊市', method: '摊位购买', chance: 0.5, count: [1, 3] },
  ],
  '胭脂': [
    { location: '大夏皇都', method: '胭脂铺购买', chance: 0.8, count: [1, 3] },
    { location: '珍宝阁', method: '购买', chance: 0.5, count: [1, 2] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 2] },
  ],
  '香水': [
    { location: '大夏皇都', method: '胭脂铺购买', chance: 0.6, count: [1, 2] },
    { location: '珍宝阁', method: '购买', chance: 0.4, count: [1, 1] },
  ],
  '珠宝': [
    { location: '珍宝阁', method: '购买', chance: 0.7, count: [1, 2] },
    { location: '大夏皇都', method: '珠宝铺购买', chance: 0.8, count: [1, 3] },
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '沉没仙宫', method: '探索获取', chance: 0.2, count: [1, 2] },
  ],
  '古董': [
    { location: '珍宝阁', method: '购买', chance: 0.5, count: [1, 1] },
    { location: '大夏皇都', method: '古董铺购买', chance: 0.6, count: [1, 2] },
    { location: '上古遗迹', method: '探索获取', chance: 0.2, count: [1, 1] },
    { location: '大夏皇陵', method: '探索获取', chance: 0.25, count: [1, 2] },
  ],
  '书籍': [
    { location: '大夏皇都', method: '书店购买', chance: 0.8, count: [1, 3] },
    { location: '天星阁', method: '购买', chance: 0.6, count: [1, 2] },
    { location: '大夏皇都', method: '赏赐', chance: 0.1, count: [1, 1] },
  ],
  '笔墨纸砚': [
    { location: '大夏皇都', method: '书店购买', chance: 0.7, count: [1, 3] },
    { location: '清风镇', method: '杂货店购买', chance: 0.4, count: [1, 2] },
  ],

  // ===== 丹药品类 =====
  '回灵丹': [
    { location: '丹塔', method: '购买/炼制', chance: 0.6, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 2] },
    { location: '青云剑宗', method: '宗门兑换', chance: 0.3, count: [1, 2] },
  ],
  '回春丹': [
    { location: '丹塔', method: '购买/炼制', chance: 0.5, count: [1, 2] },
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 1] },
  ],
  '清心丹': [
    { location: '丹塔', method: '购买/炼制', chance: 0.4, count: [1, 2] },
    { location: '天星阁', method: '购买', chance: 0.3, count: [1, 1] },
  ],
  '解毒丹': [
    { location: '丹塔', method: '购买/炼制', chance: 0.5, count: [1, 2] },
    { location: '万毒沼泽', method: '探索获取', chance: 0.2, count: [1, 1] },
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 1] },
  ],
  '筑基丹': [
    { location: '丹塔', method: '炼制', chance: 0.2, count: [1, 1] },
    { location: '青云剑宗', method: '宗门兑换', chance: 0.15, count: [1, 1] },
    { location: '珍宝阁', method: '购买', chance: 0.1, count: [1, 1] },
  ],
  '金丹破障丹': [
    { location: '丹塔', method: '炼制', chance: 0.1, count: [1, 1] },
    { location: '上古遗迹', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '元婴丹': [
    { location: '丹塔', method: '炼制', chance: 0.08, count: [1, 1] },
    { location: '沉没仙宫', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '化神丹': [
    { location: '丹塔', method: '炼制', chance: 0.05, count: [1, 1] },
    { location: '混沌海', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '炼虚丹': [
    { location: '通天古路', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '合体丹': [
    { location: '混沌海', method: '探索获取', chance: 0.06, count: [1, 1] },
  ],
  '大乘丹': [
    { location: '归墟海眼', method: '探索获取', chance: 0.05, count: [1, 1] },
  ],
  '送子丹': [
    { location: '丹塔', method: '炼制', chance: 0.3, count: [1, 1] },
    { location: '自由坊市', method: '摊位购买', chance: 0.2, count: [1, 1] },
  ],
  '顺产丹': [
    { location: '丹塔', method: '炼制', chance: 0.4, count: [1, 2] },
    { location: '大夏皇都', method: '药店购买', chance: 0.3, count: [1, 1] },
  ],
  '安胎丸': [
    { location: '丹塔', method: '炼制', chance: 0.5, count: [1, 2] },
    { location: '大夏皇都', method: '药店购买', chance: 0.4, count: [1, 2] },
  ],
  '化形丹': [
    { location: '丹塔', method: '炼制', chance: 0.1, count: [1, 1] },
    { location: '万妖山脉', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '融雪丹': [
    { location: '丹塔', method: '炼制', chance: 0.15, count: [1, 1] },
    { location: '上古遗迹', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '聚气丹': [
    { location: '丹塔', method: '购买/炼制', chance: 0.7, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.5, count: [1, 2] },
    { location: '青云剑宗', method: '宗门兑换', chance: 0.4, count: [1, 2] },
  ],

  // ===== 符箓类 =====
  '疾风符': [
    { location: '天星阁', method: '购买/绘制', chance: 0.5, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 2] },
  ],
  '净魔符': [
    { location: '天星阁', method: '购买/绘制', chance: 0.4, count: [1, 2] },
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 1] },
  ],
  '天雷符': [
    { location: '天星阁', method: '购买/绘制', chance: 0.3, count: [1, 1] },
    { location: '珍宝阁', method: '购买', chance: 0.2, count: [1, 1] },
  ],

  // ===== 修仙材料类 =====
  '下品灵石': [
    { location: '自由坊市', method: '兑换', chance: 0.9, count: [1, 10] },
    { location: '裂风峡谷', method: '采矿', chance: 0.3, count: [1, 5] },
    { location: '上古遗迹', method: '探索获取', chance: 0.4, count: [1, 10] },
    { location: '大夏皇都', method: '钱庄兑换', chance: 0.8, count: [1, 20] },
  ],
  '中品灵石': [
    { location: '自由坊市', method: '兑换', chance: 0.5, count: [1, 5] },
    { location: '上古遗迹', method: '探索获取', chance: 0.2, count: [1, 3] },
    { location: '沉没仙宫', method: '探索获取', chance: 0.25, count: [1, 5] },
  ],
  '上品灵石': [
    { location: '混沌海', method: '探索获取', chance: 0.15, count: [1, 2] },
    { location: '归墟海眼', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '玄铁': [
    { location: '裂风峡谷', method: '采矿', chance: 0.2, count: [1, 2] },
    { location: '万剑冢', method: '探索获取', chance: 0.25, count: [1, 3] },
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 2] },
  ],
  '寒铁': [
    { location: '上古遗迹', method: '采矿', chance: 0.2, count: [1, 2] },
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 2] },
  ],
  '赤炎金': [
    { location: '万妖山脉', method: '采矿', chance: 0.15, count: [1, 1] },
    { location: '万妖山脉', method: '探索获取', chance: 0.2, count: [1, 2] },
  ],
  '千年灵玉': [
    { location: '洞天福地', method: '探索获取', chance: 0.2, count: [1, 1] },
    { location: '龙渊', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '珍宝阁', method: '购买', chance: 0.1, count: [1, 1] },
  ],
  '凤凰羽': [
    { location: '万妖山脉', method: '探索获取', chance: 0.08, count: [1, 1] },
    { location: '兽灵山', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '龙鳞': [
    { location: '龙渊', method: '探索获取', chance: 0.12, count: [1, 2] },
    { location: '归墟海眼', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '九尾狐尾': [
    { location: '万妖山脉', method: '探索获取', chance: 0.06, count: [1, 1] },
    { location: '洞天福地', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '鲛人泪': [
    { location: '东海渔村', method: '购买', chance: 0.1, count: [1, 1] },
    { location: '归墟海眼', method: '探索获取', chance: 0.15, count: [1, 2] },
    { location: '混沌海', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '彼岸花': [
    { location: '上古遗迹', method: '采药', chance: 0.3, count: [1, 3] },
    { location: '上古遗迹', method: '采药', chance: 0.25, count: [1, 2] },
  ],
  '忘川水': [
    { location: '上古遗迹', method: '采集', chance: 0.2, count: [1, 1] },
    { location: '自由坊市', method: '购买', chance: 0.3, count: [1, 1] },
  ],
  '三生石': [
    { location: '上古遗迹', method: '探索获取', chance: 0.1, count: [1, 1] },
    { location: '自由坊市', method: '购买', chance: 0.15, count: [1, 1] },
  ],
  '幽冥火': [
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '万妖山脉', method: '探索获取', chance: 0.1, count: [1, 1] },
  ],
  '混沌之气': [
    { location: '混沌海', method: '采集', chance: 0.1, count: [1, 1] },
    { location: '太虚梦境', method: '探索获取', chance: 0.08, count: [1, 1] },
  ],
  '星辰碎片': [
    { location: '星辰裂缝', method: '探索获取', chance: 0.2, count: [1, 3] },
    { location: '通天古路', method: '探索获取', chance: 0.15, count: [1, 2] },
  ],
  '上古符文': [
    { location: '上古遗迹', method: '探索获取', chance: 0.2, count: [1, 2] },
    { location: '沉没仙宫', method: '探索获取', chance: 0.25, count: [1, 2] },
    { location: '万剑冢', method: '探索获取', chance: 0.15, count: [1, 1] },
  ],
  '妖兽内丹': [
    { location: '万妖山脉', method: '击杀妖兽', chance: 0.3, count: [1, 1] },
    { location: '兽灵山', method: '击杀妖兽', chance: 0.35, count: [1, 1] },
    { location: '落日森林', method: '击杀妖兽', chance: 0.2, count: [1, 1] },
  ],
  '妖丹': [
    { location: '万妖山脉', method: '击杀妖兽', chance: 0.25, count: [1, 1] },
    { location: '兽灵山', method: '击杀妖兽', chance: 0.3, count: [1, 1] },
  ],

  // ===== 特殊物品类 =====
  '飞剑': [
    { location: '青云剑宗', method: '宗门兑换', chance: 0.2, count: [1, 1] },
    { location: '万剑冢', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '珍宝阁', method: '购买', chance: 0.15, count: [1, 1] },
  ],
  '玉佩': [
    { location: '珍宝阁', method: '购买', chance: 0.6, count: [1, 1] },
    { location: '大夏皇都', method: '珠宝铺购买', chance: 0.7, count: [1, 2] },
    { location: '上古遗迹', method: '探索获取', chance: 0.2, count: [1, 1] },
  ],
  '香囊': [
    { location: '大夏皇都', method: '胭脂铺购买', chance: 0.6, count: [1, 2] },
    { location: '自由坊市', method: '摊位购买', chance: 0.4, count: [1, 1] },
  ],
  '字画': [
    { location: '珍宝阁', method: '购买', chance: 0.4, count: [1, 1] },
    { location: '大夏皇都', method: '古董铺购买', chance: 0.5, count: [1, 1] },
    { location: '大夏皇都', method: '赏赐', chance: 0.08, count: [1, 1] },
  ],
  '瓷器': [
    { location: '大夏皇都', method: '杂货店购买', chance: 0.7, count: [1, 3] },
    { location: '珍宝阁', method: '购买', chance: 0.5, count: [1, 2] },
  ],
  '兵器谱': [
    { location: '天星阁', method: '购买', chance: 0.3, count: [1, 1] },
    { location: '万剑冢', method: '探索获取', chance: 0.2, count: [1, 1] },
  ],
  '功法残卷': [
    { location: '上古遗迹', method: '探索获取', chance: 0.25, count: [1, 1] },
    { location: '沉没仙宫', method: '探索获取', chance: 0.3, count: [1, 1] },
    { location: '通天古路', method: '探索获取', chance: 0.2, count: [1, 1] },
  ],
  '丹方': [
    { location: '丹塔', method: '研读获取', chance: 0.4, count: [1, 1] },
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 1] },
  ],
  '阵图': [
    { location: '天星阁', method: '购买', chance: 0.3, count: [1, 1] },
    { location: '上古遗迹', method: '探索获取', chance: 0.15, count: [1, 1] },
  ],
  '坐骑蛋': [
    { location: '兽灵山', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '万妖山脉', method: '探索获取', chance: 0.1, count: [1, 1] },
    { location: '自由坊市', method: '购买', chance: 0.2, count: [1, 1] },
  ],
  '宠物蛋': [
    { location: '兽灵山', method: '探索获取', chance: 0.2, count: [1, 1] },
    { location: '万妖山脉', method: '探索获取', chance: 0.15, count: [1, 1] },
    { location: '自由坊市', method: '购买', chance: 0.25, count: [1, 1] },
  ],
  '鱼苗': [
    { location: '东海渔村', method: '购买', chance: 0.6, count: [1, 5] },
    { location: '大夏皇都', method: '购买', chance: 0.4, count: [1, 3] },
  ],
  '种子': [
    { location: '清风镇', method: '杂货店购买', chance: 0.8, count: [1, 10] },
    { location: '大夏皇都', method: '杂货店购买', chance: 0.7, count: [1, 10] },
  ],
  '毒药': [
    { location: '万毒沼泽', method: '购买/炼制', chance: 0.4, count: [1, 2] },
    { location: '自由坊市', method: '摊位购买', chance: 0.2, count: [1, 1] },
    { location: '落日森林', method: '购买', chance: 0.3, count: [1, 1] },
  ],
  '蒙汗药': [
    { location: '落日森林', method: '购买', chance: 0.4, count: [1, 2] },
    { location: '自由坊市', method: '摊位购买', chance: 0.25, count: [1, 1] },
  ],
  '春药': [
    { location: '自由坊市', method: '摊位购买', chance: 0.3, count: [1, 1] },
    { location: '大夏皇都', method: '暗市购买', chance: 0.2, count: [1, 1] },
  ],
  '银票': [
    { location: '大夏皇都', method: '钱庄兑换', chance: 0.9, count: [1, 1] },
    { location: '清风镇', method: '钱庄兑换', chance: 0.7, count: [1, 1] },
  ],
};

// 获取某地点可获取的所有物品
function getItemsAtLocation(location) {
  const items = [];
  for (const [itemName, sources] of Object.entries(ITEM_SOURCES)) {
    for (const source of sources) {
      if (source.location === location) {
        items.push({ item: itemName, method: source.method, chance: source.chance, count: source.count });
      }
    }
  }
  return items;
}

// 获取某物品的所有获取方式
function getItemSources(itemName) {
  return ITEM_SOURCES[itemName] || [];
}

// 在某地点随机获取物品
function getRandomItemAtLocation(location) {
  const items = getItemsAtLocation(location);
  if (items.length === 0) return null;
  const valid = items.filter(i => Math.random() < i.chance);
  if (valid.length === 0) return null;
  const chosen = valid[Math.floor(Math.random() * valid.length)];
  const count = chosen.count[0] + Math.floor(Math.random() * (chosen.count[1] - chosen.count[0] + 1));
  return { item: chosen.item, count, method: chosen.method };
}

module.exports = { ITEM_SOURCES, getItemsAtLocation, getItemSources, getRandomItemAtLocation };
