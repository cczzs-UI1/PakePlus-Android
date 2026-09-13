// 商铺系统 - 肉铺、种子铺、药铺等，每月随机商品和价格浮动
const { randInt, randChoice, shuffle } = require('./utils');
const { ITEMS } = require('../data/items');
const { CROPS } = require('./farming');

// 肉铺可售卖的肉类列表
const MEAT_ITEMS = [
  '猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鱼肉', '鸡蛋',
  '葱姜', '酱油', '蜂蜜', '枸杞', '鲍鱼', '海参', '鱼翅',
  '妖兽肉', '兽肉',
];

// 种子铺可售卖的种子列表
const SEED_ITEMS = CROPS.map(c => c.name + '种子');

// 药铺可售卖的丹药列表
const PILL_ITEMS = [
  '金疮药', '安神汤', '解毒散', '回灵丹', '回春丹', '清心丹', '解毒丹',
  '筑基丹', '金丹破障丹', '元婴丹', '化神丹', '聚气丹', '送子丹', '顺产丹',
  '安胎丸', '化形丹', '融雪丹', '血煞丹',
];

// 药铺可售卖的药材列表（含炼丹/炼器/阵法材料，与炼制系统联动）
const HERB_ITEMS = [
  '人参', '鹿茸', '阿胶', '聚灵草', '灵草', '百年茯苓', '玄铁',
  '妖丹', '寒铁', '雷石', '妖兽皮', '灵稻', '妖兽内丹',
  '魔晶', '魂火', '阴魂珠',
  // 炼制/阵法联动材料
  '灵晶石', '阵旗', '灵蚕丝', '兽骨', '灵木', '灵宠精魄',
];

// 初始化商铺系统
function initShops(state) {
  if (!state) return null;
  if (!state.shops) {
    state.shops = {
      butcher: { items: [], lastRefresh: null },
      seedShop: { items: [], lastRefresh: null },
      pharmacy: { items: [], lastRefresh: null },
      fishMarket: { items: [], lastRefresh: null },
    };
  }
  return state.shops;
}

// 生成随机价格（基于基础价格和浮动区间）
function generatePrice(itemName) {
  const item = ITEMS[itemName];
  if (!item) return { price: 10, currency: 'silver' };

  const basePrice = item.price || 10;
  const currency = item.currency || 'silver';

  // 如果有价格区间，在区间内随机
  if (item.priceRange) {
    return {
      price: randInt(item.priceRange[0], item.priceRange[1]),
      currency,
    };
  }

  // 否则在基础价格的70%-130%之间浮动
  const minPrice = Math.floor(basePrice * 0.7);
  const maxPrice = Math.ceil(basePrice * 1.3);
  return {
    price: randInt(minPrice, maxPrice),
    currency,
  };
}

// 刷新肉铺商品（每月调用）
function refreshButcher(state) {
  initShops(state);
  const items = [];
  const shuffled = shuffle([...MEAT_ITEMS]);

  // 随机选择20种肉类
  const count = Math.min(20, shuffled.length);
  for (let i = 0; i < count; i++) {
    const itemName = shuffled[i];
    const priceInfo = generatePrice(itemName);
    const item = ITEMS[itemName];
    items.push({
      name: itemName,
      tier: item?.tier || '凡',
      price: priceInfo.price,
      currency: priceInfo.currency,
      stock: randInt(5, 30), // 库存
      desc: item?.desc || '',
    });
  }

  state.shops.butcher.items = items;
  state.shops.butcher.lastRefresh = `${state.gameDate.year}年${state.gameDate.month}月`;
  return items;
}

// 刷新种子铺商品（每月调用）
function refreshSeedShop(state) {
  initShops(state);
  const items = [];
  const shuffled = shuffle([...SEED_ITEMS]);

  // 随机选择20种种子
  const count = Math.min(20, shuffled.length);
  for (let i = 0; i < count; i++) {
    const seedName = shuffled[i];
    const cropName = seedName.replace('种子', '');
    const crop = CROPS.find(c => c.name === cropName);
    if (!crop) continue;

    const currency = crop.seedCurrency === 'silver' ? 'silver' : 'spirit';
    const basePrice = crop.seedPrice;
    const minPrice = Math.floor(basePrice * 0.7);
    const maxPrice = Math.ceil(basePrice * 1.3);

    items.push({
      name: seedName,
      tier: crop.tier === 0 ? '凡' : crop.tier === 1 ? '灵' : crop.tier === 2 ? '宝' : '仙',
      price: randInt(minPrice, maxPrice),
      currency,
      stock: randInt(10, 50),
      growTime: crop.growTime,
      desc: crop.desc,
    });
  }

  state.shops.seedShop.items = items;
  state.shops.seedShop.lastRefresh = `${state.gameDate.year}年${state.gameDate.month}月`;
  return items;
}

// 获取肉铺商品
function getButcherItems(state) {
  if (!state) return [];
  initShops(state);
  // 如果是新的一个月，刷新商品
  const currentMonth = `${state.gameDate.year}年${state.gameDate.month}月`;
  if (state.shops.butcher.lastRefresh !== currentMonth || state.shops.butcher.items.length === 0) {
    refreshButcher(state);
  }
  return state.shops.butcher.items;
}

// 获取种子铺商品
function getSeedShopItems(state) {
  if (!state) return [];
  initShops(state);
  const currentMonth = `${state.gameDate.year}年${state.gameDate.month}月`;
  if (state.shops.seedShop.lastRefresh !== currentMonth || state.shops.seedShop.items.length === 0) {
    refreshSeedShop(state);
  }
  return state.shops.seedShop.items;
}

// 刷新药铺商品（每月调用）
function refreshPharmacy(state) {
  initShops(state);
  const items = [];

  // 随机选择10种丹药
  const shuffledPills = shuffle([...PILL_ITEMS]);
  const pillCount = Math.min(10, shuffledPills.length);
  for (let i = 0; i < pillCount; i++) {
    const itemName = shuffledPills[i];
    const priceInfo = generatePrice(itemName);
    const item = ITEMS[itemName];
    items.push({
      name: itemName,
      category: 'pill',
      tier: item?.tier || '凡',
      price: priceInfo.price,
      currency: priceInfo.currency,
      stock: randInt(3, 15),
      desc: item?.desc || '',
      effect: item?.effect || null,
    });
  }

  // 随机选择10种药材
  const shuffledHerbs = shuffle([...HERB_ITEMS]);
  const herbCount = Math.min(10, shuffledHerbs.length);
  for (let i = 0; i < herbCount; i++) {
    const itemName = shuffledHerbs[i];
    const priceInfo = generatePrice(itemName);
    const item = ITEMS[itemName];
    items.push({
      name: itemName,
      category: 'material',
      tier: item?.tier || '凡',
      price: priceInfo.price,
      currency: priceInfo.currency,
      stock: randInt(5, 20),
      desc: item?.desc || '',
    });
  }

  state.shops.pharmacy.items = items;
  state.shops.pharmacy.lastRefresh = `${state.gameDate.year}年${state.gameDate.month}月`;
  return items;
}

// 获取药铺商品
function getPharmacyItems(state, category = null) {
  if (!state) return [];
  initShops(state);
  const currentMonth = `${state.gameDate.year}年${state.gameDate.month}月`;
  if (state.shops.pharmacy.lastRefresh !== currentMonth || state.shops.pharmacy.items.length === 0) {
    refreshPharmacy(state);
  }
  if (category) {
    return state.shops.pharmacy.items.filter(i => i.category === category);
  }
  return state.shops.pharmacy.items;
}

// 购买商品
function buyItem(state, shopType, itemName, count = 1) {
  initShops(state);
  const shop = state.shops[shopType];
  if (!shop) return { success: false, msg: '商铺不存在' };

  const item = shop.items.find(i => i.name === itemName);
  if (!item) return { success: false, msg: '商品不存在' };
  if (item.stock < count) return { success: false, msg: '库存不足' };

  const totalCost = item.price * count;
  const player = state.player;

  if (item.currency === 'silver') {
    if (player.silver < totalCost) return { success: false, msg: '银两不足' };
    player.silver -= totalCost;
  } else {
    if (player.spiritStone < totalCost) return { success: false, msg: '灵石不足' };
    player.spiritStone -= totalCost;
  }

  // 减少库存
  item.stock -= count;

  // 种子特殊处理：直接加入背包
  if (shopType === 'seedShop') {
    const existing = player.inventory.find(i => i.name === itemName);
    if (existing) existing.count += count;
    else player.inventory.push({ name: itemName, count, type: 'seed' });
  } else {
    // 肉类加入背包
    const existing = player.inventory.find(i => i.name === itemName);
    if (existing) existing.count += count;
    else player.inventory.push({ name: itemName, count, type: 'food_material' });
  }

  return { success: true, msg: `购买了${itemName}×${count}，花费${totalCost}${item.currency === 'silver' ? '银两' : '灵石'}。` };
}

// 出售商品
function sellItem(state, shopType, itemName, count = 1) {
  initShops(state);
  const shop = state.shops[shopType];
  if (!shop) return { success: false, msg: '商铺不存在' };

  const player = state.player;
  const invItem = player.inventory.find(i => i.name === itemName);
  if (!invItem || invItem.count < count) return { success: false, msg: '背包中没有足够的该物品' };

  // 查找商铺中的收购价格（如果商铺有该商品，用商铺价格的80%收购；否则用物品基础价格的60%）
  let sellPrice = 0;
  let currency = 'silver';
  const shopItem = shop.items.find(i => i.name === itemName);
  if (shopItem) {
    sellPrice = Math.floor(shopItem.price * 0.8);
    currency = shopItem.currency;
  } else {
    const item = ITEMS[itemName];
    if (item) {
      sellPrice = Math.floor((item.price || 10) * 0.6);
      currency = item.currency || 'silver';
    } else {
      sellPrice = 5;
    }
  }

  const totalEarn = sellPrice * count;

  // 减少背包物品
  invItem.count -= count;
  if (invItem.count <= 0) {
    player.inventory = player.inventory.filter(i => i.name !== itemName);
  }

  // 增加货币
  if (currency === 'silver') {
    player.silver += totalEarn;
  } else {
    player.spiritStone += totalEarn;
  }

  return { success: true, msg: `出售了${itemName}×${count}，获得${totalEarn}${currency === 'silver' ? '银两' : '灵石'}。` };
}

module.exports = {
  MEAT_ITEMS,
  SEED_ITEMS,
  PILL_ITEMS,
  HERB_ITEMS,
  initShops,
  refreshButcher,
  refreshSeedShop,
  refreshPharmacy,
  getButcherItems,
  getSeedShopItems,
  getPharmacyItems,
  buyItem,
  sellItem,
};
