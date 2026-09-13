// 浮动价格系统 - 所有物品的浮动价格和售卖地点
const { randInt, randChoice, clamp } = require('./utils');
const { GOODS } = require('../data/shops');

// 物品基础价格表（从GOODS中提取+补充）
const BASE_PRICES = {};

// 初始化基础价格
for (const goodsList of Object.values(GOODS)) {
  for (const item of goodsList) {
    BASE_PRICES[item.name] = {
      price: item.price,
      type: item.type,
      desc: item.desc,
    };
  }
}

// 补充其他物品的基础价格
const EXTRA_PRICES = {
  '聚灵草': { price: 10, type: '材料', desc: '最基础的灵草' },
  '灵谷': { price: 5, type: '材料', desc: '蕴含灵气的谷物' },
  '野山参': { price: 50, type: '材料', desc: '野生山参' },
  '铁矿石': { price: 15, type: '材料', desc: '普通铁矿石' },
  '妖兽皮': { price: 80, type: '材料', desc: '妖兽的皮毛' },
  '妖丹': { price: 200, type: '材料', desc: '妖兽内丹' },
  '兽骨': { price: 30, type: '材料', desc: '妖兽骨骼' },
  '鹿角': { price: 100, type: '材料', desc: '珍贵鹿角' },
  '百年灵芝': { price: 500, type: '灵药', desc: '百年灵芝' },
  '千年人参': { price: 3000, type: '灵药', desc: '千年人参' },
  '雪莲': { price: 800, type: '灵药', desc: '天山雪莲' },
  '何首乌': { price: 600, type: '灵药', desc: '百年何首乌' },
  '玄铁': { price: 500, type: '材料', desc: '玄铁矿石' },
  '灵晶石': { price: 300, type: '材料', desc: '蕴含灵气的晶石' },
  '玉佩': { price: 200, type: '饰品', desc: '普通玉佩' },
  '珍珠': { price: 150, type: '饰品', desc: '圆润珍珠' },
  '玛瑙': { price: 180, type: '饰品', desc: '红玛瑙' },
  '翡翠': { price: 400, type: '饰品', desc: '翡翠玉石' },
  '夜明珠': { price: 2000, type: '饰品', desc: '夜明珠' },
  '珊瑚': { price: 600, type: '饰品', desc: '红珊瑚' },
  '龙涎香': { price: 1500, type: '香料', desc: '龙涎香' },
  '灵兽蛋': { price: 1000, type: '灵宠', desc: '未知灵兽蛋' },
  '驯兽鞭': { price: 200, type: '工具', desc: '驯服灵兽的鞭子' },
  '灵兽粮': { price: 50, type: '消耗品', desc: '灵兽食物' },
  '灵兽项圈': { price: 300, type: '工具', desc: '灵兽项圈' },
  '功法残卷': { price: 800, type: '功法', desc: '残缺的功法' },
  '玉简': { price: 500, type: '功法', desc: '记载功法的玉简' },
  '心得笔记': { price: 300, type: '功法', desc: '修士心得笔记' },
  '毒囊': { price: 150, type: '材料', desc: '毒物的毒囊' },
  '解毒丹': { price: 120, type: '丹药', desc: '解除中毒' },
  '断肠草': { price: 80, type: '毒草', desc: '剧毒草药' },
  '蝎尾花': { price: 100, type: '毒草', desc: '蝎尾花' },
  '毒蟾酥': { price: 120, type: '毒草', desc: '毒蟾分泌物' },
  '上古法宝': { price: 10000, type: '法宝', desc: '上古修士法宝' },
  '灵石': { price: 1, type: '货币', desc: '修仙界通用货币' },
  '魔晶': { price: 500, type: '材料', desc: '魔族结晶' },
  '血煞丹': { price: 800, type: '丹药', desc: '魔道丹药' },
  '魔功秘籍': { price: 2000, type: '功法', desc: '魔道功法' },
  '龙鳞': { price: 3000, type: '材料', desc: '龙族鳞片' },
  '龙角': { price: 5000, type: '材料', desc: '龙族之角' },
  '龙珠': { price: 20000, type: '至宝', desc: '龙族龙珠' },
  '龙族功法': { price: 15000, type: '功法', desc: '龙族传承功法' },
  '混沌之气': { price: 50000, type: '至宝', desc: '混沌本源之气' },
  '先天灵宝': { price: 100000, type: '至宝', desc: '先天灵宝' },
  '混沌莲': { price: 80000, type: '至宝', desc: '混沌青莲' },
  '飞剑': { price: 1500, type: '法器', desc: '御剑飞行的飞剑' },
  '剑谱': { price: 1000, type: '功法', desc: '剑术图谱' },
  '剑魄': { price: 2000, type: '材料', desc: '剑之魂魄' },
  '回灵丹': { price: 100, type: '丹药', desc: '恢复灵力' },
  '回春丹': { price: 80, type: '丹药', desc: '恢复气血' },
  '炼器锤': { price: 200, type: '工具', desc: '炼器用锤' },
};

// 合并价格表
for (const [name, info] of Object.entries(EXTRA_PRICES)) {
  if (!BASE_PRICES[name]) {
    BASE_PRICES[name] = info;
  }
}

// 售卖地点配置
const SELL_LOCATIONS = {
  '杂货铺': { items: ['粗布衣', '精铁剑', '皮革甲'], locations: ['清风镇', '大夏皇都', '东海渔村', '自由坊市'] },
  '丹药铺': { items: ['回灵丹', '回血丹', '聚气丹', '筑基丹', '金丹', '元婴丹', '疗伤丹', '清心丹', '送子丹', '顺产丹', '增寿丹', '解毒丹'], locations: ['大夏皇都', '自由坊市', '丹塔', '青云剑宗'] },
  '符箓铺': { items: ['火球符', '冰锥符', '护盾符', '困敌符', '巨力符', '风行符'], locations: ['大夏皇都', '自由坊市', '天星阁'] },
  '兵器铺': { items: ['精铁剑', '玄铁刀', '青锋剑', '破甲枪', '灵宝弓', '玉骨扇'], locations: ['大夏皇都', '自由坊市', '万剑冢'] },
  '材料行': { items: ['聚灵草', '灵谷', '野山参', '铁矿石', '妖兽皮', '妖丹', '兽骨', '鹿角', '玄铁', '灵晶石'], locations: ['自由坊市', '万妖山脉', '兽灵山'] },
  '珍宝阁': { items: ['玉佩', '珍珠', '玛瑙', '翡翠', '夜明珠', '珊瑚', '龙涎香'], locations: ['大夏皇都', '珍宝阁'] },
  '灵宠铺': { items: ['灵兽蛋', '驯兽鞭', '灵兽粮', '灵兽项圈'], locations: ['自由坊市', '兽灵山'] },
  '功法阁': { items: ['功法残卷', '玉简', '心得笔记'], locations: ['自由坊市', '天星阁', '青云剑宗'] },
  '坊市': { items: ['*'], locations: ['自由坊市', '移动仙市'] }, // *表示所有物品
};

// 市场波动因子（每月变化）
let marketFactors = {};

// 初始化市场因子
function initMarketFactors() {
  marketFactors = {};
  for (const itemName of Object.keys(BASE_PRICES)) {
    marketFactors[itemName] = {
      demand: 0.8 + Math.random() * 0.4, // 需求因子 0.8-1.2
      supply: 0.8 + Math.random() * 0.4, // 供给因子 0.8-1.2
      trend: (Math.random() - 0.5) * 0.1, // 趋势 -0.05到0.05
    };
  }
}

// 每月刷新市场
function refreshMarket() {
  for (const itemName of Object.keys(marketFactors)) {
    const factor = marketFactors[itemName];
    // 需求随机波动
    factor.demand = clamp(factor.demand + (Math.random() - 0.5) * 0.15, 0.5, 1.5);
    // 供给随机波动
    factor.supply = clamp(factor.supply + (Math.random() - 0.5) * 0.15, 0.5, 1.5);
    // 趋势变化
    factor.trend = clamp(factor.trend + (Math.random() - 0.5) * 0.05, -0.1, 0.1);
  }
}

// 获取物品当前价格
function getCurrentPrice(itemName) {
  const base = BASE_PRICES[itemName];
  if (!base) return { price: 100, basePrice: 100, fluctuation: 1 };

  const factor = marketFactors[itemName] || { demand: 1, supply: 1, trend: 0 };
  // 价格 = 基础价 * (需求/供给) * (1 + 趋势)
  const fluctuation = (factor.demand / factor.supply) * (1 + factor.trend);
  const price = Math.floor(base.price * clamp(fluctuation, 0.3, 3));

  return {
    price,
    basePrice: base.price,
    fluctuation: parseFloat(fluctuation.toFixed(2)),
    demand: parseFloat(factor.demand.toFixed(2)),
    supply: parseFloat(factor.supply.toFixed(2)),
    trend: parseFloat(factor.trend.toFixed(3)),
  };
}

// 获取某地点可售卖的物品
function getSellableItems(location) {
  const items = [];
  for (const [shopType, config] of Object.entries(SELL_LOCATIONS)) {
    if (config.locations.includes(location)) {
      if (config.items.includes('*')) {
        // 坊市卖所有物品
        for (const itemName of Object.keys(BASE_PRICES)) {
          if (!items.find(i => i.name === itemName)) {
            items.push({ name: itemName, shop: shopType, ...getCurrentPrice(itemName) });
          }
        }
      } else {
        for (const itemName of config.items) {
          if (!items.find(i => i.name === itemName)) {
            items.push({ name: itemName, shop: shopType, ...getCurrentPrice(itemName) });
          }
        }
      }
    }
  }
  return items;
}

// 获取某地点的商店商品（每月刷新）
function getShopGoodsForLocation(location) {
  const shops = [];
  for (const [shopType, config] of Object.entries(SELL_LOCATIONS)) {
    if (config.locations.includes(location) || location === '自由坊市' || location === '移动仙市') {
      const goods = [];
      const itemPool = config.items.includes('*') ? Object.keys(BASE_PRICES) : config.items;
      // 随机选择5-10件商品
      const count = Math.min(randInt(5, 10), itemPool.length);
      const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
      for (let i = 0; i < count; i++) {
        const itemName = shuffled[i];
        const priceInfo = getCurrentPrice(itemName);
        const base = BASE_PRICES[itemName];
        goods.push({
          name: itemName,
          price: priceInfo.price,
          basePrice: priceInfo.basePrice,
          fluctuation: priceInfo.fluctuation,
          type: base?.type || '其他',
          desc: base?.desc || '',
          stock: randInt(1, 10),
        });
      }
      shops.push({
        type: shopType,
        name: shopType,
        goods,
      });
    }
  }
  return shops;
}

// 卖出物品价格（买入价的50-70%）
function getSellPrice(itemName) {
  const priceInfo = getCurrentPrice(itemName);
  return Math.floor(priceInfo.price * (0.5 + Math.random() * 0.2));
}

// 获取价格趋势描述
function getPriceTrendText(itemName) {
  const priceInfo = getCurrentPrice(itemName);
  if (priceInfo.fluctuation > 1.3) return '价格高涨';
  if (priceInfo.fluctuation > 1.1) return '价格偏高';
  if (priceInfo.fluctuation < 0.7) return '价格暴跌';
  if (priceInfo.fluctuation < 0.9) return '价格偏低';
  return '价格平稳';
}

module.exports = {
  BASE_PRICES,
  SELL_LOCATIONS,
  initMarketFactors,
  refreshMarket,
  getCurrentPrice,
  getSellableItems,
  getShopGoodsForLocation,
  getSellPrice,
  getPriceTrendText,
};
