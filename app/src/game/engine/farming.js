// 种植系统 - 灵田、灵药种植、收获
const { randInt, chance, randChoice, clamp } = require('./utils');

// 可种植的作物（凡人界+修仙界）
const CROPS = [
  // 凡人界作物
  { id: 'qingcai', name: '青菜', tier: 0, growTime: 2, price: 10, seedPrice: 5, seedCurrency: 'silver', desc: '普通的青菜，生长迅速', yield: [2, 4], type: 'vegetable' },
  { id: 'baicai', name: '白菜', tier: 0, growTime: 3, price: 12, seedPrice: 6, seedCurrency: 'silver', desc: '白菜，耐寒易种', yield: [2, 4], type: 'vegetable' },
  { id: 'luobo', name: '萝卜', tier: 0, growTime: 2, price: 8, seedPrice: 4, seedCurrency: 'silver', desc: '萝卜，营养丰富', yield: [3, 5], type: 'vegetable' },
  { id: 'lajiao', name: '辣椒', tier: 0, growTime: 3, price: 15, seedPrice: 8, seedCurrency: 'silver', desc: '辣椒，辛辣开胃', yield: [2, 4], type: 'vegetable' },
  { id: 'shuidao', name: '水稻', tier: 0, growTime: 4, price: 20, seedPrice: 10, seedCurrency: 'silver', desc: '水稻，可收获大米', yield: [3, 6], type: 'grain' },
  { id: 'xiaomai', name: '小麦', tier: 0, growTime: 3, price: 18, seedPrice: 8, seedCurrency: 'silver', desc: '小麦，可收获面粉', yield: [2, 5], type: 'grain' },
  { id: 'huangdou', name: '黄豆', tier: 0, growTime: 4, price: 16, seedPrice: 7, seedCurrency: 'silver', desc: '黄豆，可做豆腐豆浆', yield: [2, 5], type: 'grain' },
  { id: 'congsuan', name: '葱蒜', tier: 0, growTime: 2, price: 8, seedPrice: 4, seedCurrency: 'silver', desc: '葱蒜，调味佳品', yield: [3, 6], type: 'spice' },
  // 修仙界灵药
  { id: 'lingcao', name: '聚灵草', tier: 1, growTime: 3, price: 50, seedPrice: 10, seedCurrency: 'spirit', desc: '最基础的灵草，可炼制低阶丹药', yield: [2, 4], type: 'spirit' },
  { id: 'huiyang', name: '回阳草', tier: 1, growTime: 4, price: 80, seedPrice: 20, seedCurrency: 'spirit', desc: '可炼制回血丹', yield: [1, 3], type: 'spirit' },
  { id: 'bingxin', name: '冰心莲', tier: 2, growTime: 6, price: 200, seedPrice: 50, seedCurrency: 'spirit', desc: '寒性灵药，可炼制冰心丹', yield: [1, 2], type: 'spirit' },
  { id: 'huoyan', name: '火焰花', tier: 2, growTime: 6, price: 200, seedPrice: 50, seedCurrency: 'spirit', desc: '火属性灵药，可炼制火焰丹', yield: [1, 2], type: 'spirit' },
  { id: 'zixia', name: '紫霞参', tier: 3, growTime: 10, price: 500, seedPrice: 150, seedCurrency: 'spirit', desc: '珍贵药材，可炼制筑基丹', yield: [1, 2], type: 'spirit' },
  { id: 'xuanyang', name: '玄阳果', tier: 3, growTime: 8, price: 400, seedPrice: 120, seedCurrency: 'spirit', desc: '阳性灵药，可炼制增阳丹', yield: [1, 3], type: 'spirit' },
  { id: 'wannian', name: '万年灵芝', tier: 4, growTime: 24, price: 2000, seedPrice: 500, seedCurrency: 'spirit', desc: '极品药材，可炼制高阶丹药', yield: [1, 1], type: 'spirit' },
  { id: 'longxu', name: '龙须草', tier: 4, growTime: 18, price: 1500, seedPrice: 400, seedCurrency: 'spirit', desc: '传说龙血浇灌而生', yield: [1, 2], type: 'spirit' },
  { id: 'fengxian', name: '凤仙花', tier: 3, growTime: 12, price: 600, seedPrice: 200, seedCurrency: 'spirit', desc: '凤凰血脉的灵药', yield: [1, 2], type: 'spirit' },
  { id: 'yuehua', name: '月华露', tier: 2, growTime: 5, price: 150, seedPrice: 40, seedCurrency: 'spirit', desc: '吸收月华而生的灵药', yield: [2, 4], type: 'spirit' },
  { id: 'leizhu', name: '雷竹', tier: 3, growTime: 9, price: 350, seedPrice: 100, seedCurrency: 'spirit', desc: '雷属性灵竹，可炼制雷丹', yield: [2, 3], type: 'spirit' },
  { id: 'hundun', name: '混沌莲', tier: 5, growTime: 36, price: 10000, seedPrice: 2000, seedCurrency: 'spirit', desc: '混沌中孕育的至宝', yield: [1, 1], type: 'spirit' },
  { id: 'linggu', name: '灵谷', tier: 1, growTime: 5, price: 60, seedPrice: 15, seedCurrency: 'spirit', desc: '蕴含灵气的粮食', yield: [2, 4], type: 'spirit_grain' },
  { id: 'renshen', name: '人参', tier: 2, growTime: 6, price: 150, seedPrice: 50, seedCurrency: 'spirit', desc: '大补之物，可炼制丹药', yield: [1, 2], type: 'spirit' },
  { id: 'xuelian', name: '雪莲', tier: 3, growTime: 7, price: 200, seedPrice: 80, seedCurrency: 'spirit', desc: '生长于高寒之地的灵药', yield: [1, 1], type: 'spirit' },
  { id: 'lingcha', name: '灵茶', tier: 2, growTime: 5, price: 100, seedPrice: 30, seedCurrency: 'spirit', desc: '可冲泡灵茶，清心明目', yield: [2, 4], type: 'spirit' },
];

// 灵田等级
const FIELD_TIERS = [
  { tier: 1, name: '普通灵田', slots: 8, speedBonus: 1, price: 1000, effect: '基础灵田，可种植4种作物，生长速度正常。', qualityBonus: 0 },
  { tier: 2, name: '中品灵田', slots: 16, speedBonus: 1.2, price: 3000, effect: '灵气充沛的灵田，可种植6种作物，生长速度+20%，优秀品质概率+10%。', qualityBonus: 10 },
  { tier: 3, name: '上品灵田', slots: 24, speedBonus: 1.5, price: 8000, effect: '上品灵田，可种植9种作物，生长速度+50%，优秀品质概率+20%，极品品质概率+5%。', qualityBonus: 20 },
  { tier: 4, name: '极品灵田', slots: 34, speedBonus: 2, price: 20000, effect: '极品灵田，可种植12种作物，生长速度+100%，优秀品质概率+30%，极品品质概率+15%。', qualityBonus: 30 },
  { tier: 5, name: '仙田', slots: 40, speedBonus: 3, price: 30000, effect: '传说中的仙田，可种植20种作物，生长速度+200%，优秀品质概率+50%，极品品质概率+30%，可种植仙品灵药。', qualityBonus: 50 },
];

// 初始化灵田
function initField(player, tier = 1) {
  const fieldInfo = FIELD_TIERS[tier - 1];
  player.farm = {
    tier: fieldInfo.tier,
    name: fieldInfo.name,
    slots: fieldInfo.slots,
    speedBonus: fieldInfo.speedBonus,
    plots: Array(fieldInfo.slots).fill(null),
  };
  return player.farm;
}

// 购买/升级灵田
function upgradeField(player) {
  if (!player.farm) {
    if (player.spiritStone < FIELD_TIERS[0].price) {
      return { success: false, msg: `灵石不足，购买${FIELD_TIERS[0].name}需要${FIELD_TIERS[0].price}灵石` };
    }
    player.spiritStone -= FIELD_TIERS[0].price;
    initField(player, 1);
    return { success: true, msg: `你购买了${FIELD_TIERS[0].name}！` };
  }
  const nextTier = player.farm.tier + 1;
  if (nextTier > 5) return { success: false, msg: '已达最高等级灵田' };
  const fieldInfo = FIELD_TIERS[nextTier - 1];
  if (player.spiritStone < fieldInfo.price) {
    return { success: false, msg: `灵石不足，升级需要${fieldInfo.price}灵石` };
  }
  player.spiritStone -= fieldInfo.price;
  player.farm.tier = fieldInfo.tier;
  player.farm.name = fieldInfo.name;
  player.farm.slots = fieldInfo.slots;
  player.farm.speedBonus = fieldInfo.speedBonus;
  // 扩展地块
  while (player.farm.plots.length < fieldInfo.slots) {
    player.farm.plots.push(null);
  }
  return { success: true, msg: `灵田升级为${fieldInfo.name}！` };
}

// 种植
function plant(player, plotIndex, cropId) {
  if (!player.farm) return { success: false, msg: '你还没有灵田' };
  if (plotIndex < 0 || plotIndex >= player.farm.slots) return { success: false, msg: '地块不存在' };
  if (player.farm.plots[plotIndex]) return { success: false, msg: '该地块已有作物' };

  const crop = CROPS.find(c => c.id === cropId);
  if (!crop) return { success: false, msg: '种子不存在' };

  // 根据种子类型使用不同货币
  const currency = crop.seedCurrency || 'spirit';
  if (currency === 'silver') {
    if (player.silver < crop.seedPrice) {
      return { success: false, msg: `银两不足，${crop.name}种子需要${crop.seedPrice}银两` };
    }
    player.silver -= crop.seedPrice;
  } else {
    if (player.spiritStone < crop.seedPrice) {
      return { success: false, msg: `灵石不足，${crop.name}种子需要${crop.seedPrice}灵石` };
    }
    player.spiritStone -= crop.seedPrice;
  }

  player.farm.plots[plotIndex] = {
    cropId: crop.id,
    name: crop.name,
    plantedAt: 0,
    growth: 0,
    growTime: crop.growTime,
    ready: false,
    type: crop.type || 'spirit',
  };
  return { success: true, msg: `你种下了${crop.name}。` };
}

// 推进生长（每次AP消耗时调用）
function growCrops(player) {
  if (!player.farm) return;
  for (const plot of player.farm.plots) {
    if (plot && !plot.ready) {
      plot.growth += player.farm.speedBonus;
      plot.plantedAt += player.farm.speedBonus;
      if (plot.growth >= plot.growTime) {
        plot.ready = true;
      }
    }
  }
}

// 收获
function harvest(player, plotIndex) {
  if (!player.farm) return { success: false, msg: '你还没有灵田' };
  const plot = player.farm.plots[plotIndex];
  if (!plot) return { success: false, msg: '该地块没有作物' };
  if (!plot.ready) return { success: false, msg: `${plot.name}还未成熟（${Math.floor(plot.growth)}/${plot.growTime}）` };

  const crop = CROPS.find(c => c.id === plot.cropId);
  const yield_count = randInt(crop.yield[0], crop.yield[1]);

  // 品质判定
  let quality = '普通';
  if (chance(20)) quality = '优秀';
  if (chance(5)) quality = '极品';

  const priceMultiplier = quality === '极品' ? 3 : quality === '优秀' ? 1.5 : 1;
  const totalPrice = Math.floor(crop.price * yield_count * priceMultiplier);

  // 加入背包
  const itemName = quality === '普通' ? crop.name : `${quality}${crop.name}`;
  const existing = player.inventory.find(i => i.name === itemName);
  if (existing) existing.count += yield_count;
  else player.inventory.push({ name: itemName, count: yield_count, type: crop.type === 'spirit' ? '材料' : '食材', price: Math.floor(crop.price * priceMultiplier) });

  player.farm.plots[plotIndex] = null;

  return {
    success: true,
    msg: `收获了${yield_count}株${quality}${crop.name}，价值约${totalPrice}${crop.seedCurrency === 'silver' ? '银两' : '灵石'}！`,
    yield: yield_count,
    quality,
    itemName: crop.name,
  };
}

// 全部收获
function harvestAll(player) {
  if (!player.farm) return { success: false, msg: '你还没有灵田' };
  let total = 0;
  let count = 0;
  for (let i = 0; i < player.farm.plots.length; i++) {
    if (player.farm.plots[i]?.ready) {
      const result = harvest(player, i);
      if (result.success) {
        total += result.yield;
        count++;
      }
    }
  }
  if (count === 0) return { success: false, msg: '没有可收获的作物' };
  return { success: true, msg: `共收获${count}块地，获得${total}株灵药！` };
}

// 获取灵田状态
function getFieldStatus(player) {
  if (!player.farm) return null;
  const tierInfo = FIELD_TIERS[player.farm.tier - 1];
  return {
    name: player.farm.name,
    tier: player.farm.tier,
    slots: player.farm.slots,
    speedBonus: player.farm.speedBonus,
    effect: tierInfo?.effect || '',
    qualityBonus: tierInfo?.qualityBonus || 0,
    upgradePrice: FIELD_TIERS[player.farm.tier]?.price || null,
    nextTierName: FIELD_TIERS[player.farm.tier]?.name || null,
    plots: player.farm.plots.map((p, i) => p ? {
      index: i,
      name: p.name,
      growth: Math.floor(p.growth),
      growTime: p.growTime,
      ready: p.ready,
      progress: Math.min(100, Math.floor(p.growth / p.growTime * 100)),
    } : { index: i, empty: true }),
  };
}

// 获取种子商店
function getSeedShop() {
  return CROPS.map(c => ({
    id: c.id,
    name: c.name,
    tier: c.tier,
    seedPrice: c.seedPrice,
    seedCurrency: c.seedCurrency || 'spirit',
    growTime: c.growTime,
    price: c.price,
    desc: c.desc,
    type: c.type || 'spirit',
  }));
}

module.exports = {
  CROPS, FIELD_TIERS,
  initField, upgradeField, plant, growCrops,
  harvest, harvestAll, getFieldStatus, getSeedShop,
};
