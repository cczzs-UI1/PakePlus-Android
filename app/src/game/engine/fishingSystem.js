// 捕鱼系统 - 鱼类数据、出海区、捕鱼小游戏
const { randInt, randChoice, shuffle } = require('./utils');

// 鱼类品级定义
const FISH_TIERS = {
  1: { name: '凡品', color: '#8b6914', basePrice: [10, 50] },
  2: { name: '良品', color: '#228b22', basePrice: [50, 200] },
  3: { name: '珍品', color: '#4169e1', basePrice: [200, 1000] },
  4: { name: '神品', color: '#9932cc', basePrice: [1000, 5000] },
};

// 鱼类数据（4个品级各10种）
const FISHES = {
  // 凡品鱼类（10种）
  1: [
    { name: '鲫鱼', desc: '常见的淡水鱼，肉质细嫩。', portrait: 'fish_1_1.jpg' },
    { name: '鲤鱼', desc: '吉祥的象征，肉质鲜美。', portrait: 'fish_1_2.jpg' },
    { name: '草鱼', desc: '草食性鱼类，适合红烧。', portrait: 'fish_1_3.jpg' },
    { name: '鲢鱼', desc: '滤食性鱼类，头大肉嫩。', portrait: 'fish_1_4.jpg' },
    { name: '鳙鱼', desc: '胖头鱼，鱼头是佳品。', portrait: 'fish_1_5.jpg' },
    { name: '青鱼', desc: '体型较大，肉质紧实。', portrait: 'fish_1_6.jpg' },
    { name: '鳊鱼', desc: '体型扁平，适合清蒸。', portrait: 'fish_1_7.jpg' },
    { name: '鲶鱼', desc: '无鳞鱼，肉质滑嫩。', portrait: 'fish_1_8.jpg' },
    { name: '黄鳝', desc: '形似蛇，滋补佳品。', portrait: 'fish_1_9.jpg' },
    { name: '泥鳅', desc: '小型鱼类，营养丰富。', portrait: 'fish_1_10.jpg' },
  ],
  // 良品鱼类（10种）
  2: [
    { name: '鲈鱼', desc: '江南名菜，肉质洁白。', portrait: 'fish_2_1.jpg' },
    { name: '桂鱼', desc: '名贵淡水鱼，刺少肉多。', portrait: 'fish_2_2.jpg' },
    { name: '黑鱼', desc: '凶猛肉食鱼，肉质劲道。', portrait: 'fish_2_3.jpg' },
    { name: '鳜鱼', desc: '桃花流水鳜鱼肥，鲜美无比。', portrait: 'fish_2_4.jpg' },
    { name: '石斑鱼', desc: '海鱼珍品，肉质细腻。', portrait: 'fish_2_5.jpg' },
    { name: '真鲷', desc: '红色海鱼，喜庆吉祥。', portrait: 'fish_2_6.jpg' },
    { name: '黑鲷', desc: '海鱼，肉质鲜美有弹性。', portrait: 'fish_2_7.jpg' },
    { name: '带鱼', desc: '银色长条海鱼，适合煎炸。', portrait: 'fish_2_8.jpg' },
    { name: '黄鱼', desc: '金色海鱼，滋补养颜。', portrait: 'fish_2_9.jpg' },
    { name: '墨鱼', desc: '软体动物，口感Q弹。', portrait: 'fish_2_10.jpg' },
  ],
  // 珍品鱼类（10种）
  3: [
    { name: '三文鱼', desc: '深海冷水鱼，富含油脂。', portrait: 'fish_3_1.jpg' },
    { name: '金枪鱼', desc: '海洋猎手，肉质鲜红。', portrait: 'fish_3_2.jpg' },
    { name: '鳕鱼', desc: '北极深海鱼，雪白细嫩。', portrait: 'fish_3_3.jpg' },
    { name: '龙虾', desc: '甲壳类之王，肉质鲜甜。', portrait: 'fish_3_4.jpg' },
    { name: '鲍鱼', desc: '海味之冠，滋补珍品。', portrait: 'fish_3_5.jpg' },
    { name: '海参', desc: '海中人参，营养价值极高。', portrait: 'fish_3_6.jpg' },
    { name: '扇贝', desc: '双壳贝类，柱肉鲜甜。', portrait: 'fish_3_7.jpg' },
    { name: '生蚝', desc: '海洋牛奶，滋阴壮阳。', portrait: 'fish_3_8.jpg' },
    { name: '帝王蟹', desc: '深海巨蟹，蟹腿饱满。', portrait: 'fish_3_9.jpg' },
    { name: '象拔蚌', desc: '长鼻贝类，口感脆嫩。', portrait: 'fish_3_10.jpg' },
  ],
  // 神品鱼类（10种）
  4: [
    { name: '龙鱼', desc: '传说中的龙鱼，蕴含灵气。', portrait: 'fish_4_1.jpg' },
    { name: '凤凰鱼', desc: '尾如凤凰，美丽非凡。', portrait: 'fish_4_2.jpg' },
    { name: '鲲鹏', desc: '北冥之鱼，化而为鸟。', portrait: 'fish_4_3.jpg' },
    { name: '鲛人', desc: '人身鱼尾，泣泪成珠。', portrait: 'fish_4_4.jpg' },
    { name: '玄武龟', desc: '北方神兽，万年长寿。', portrait: 'fish_4_5.jpg' },
    { name: '灵鳌', desc: '背负仙山的神龟。', portrait: 'fish_4_6.jpg' },
    { name: '螭吻', desc: '龙生九子之一，好望。', portrait: 'fish_4_7.jpg' },
    { name: '蜃龙', desc: '吐气成楼的海中蛟龙。', portrait: 'fish_4_8.jpg' },
    { name: '横公鱼', desc: '昼为鱼夜为人，食之可辟邪。', portrait: 'fish_4_9.jpg' },
    { name: '鲲', desc: '北冥有鱼，其名为鲲，不知其几千里也。', portrait: 'fish_4_10.jpg' },
  ],
};

// 出海区定义
const FISHING_ZONES = [
  { id: 'zone_1', name: '近海浅滩', tier: 1, cost: 50, costType: 'silver', maxCatches: 10, desc: '近海浅滩，凡品鱼类较多。' },
  { id: 'zone_2', name: '深海渔场', tier: 2, cost: 200, costType: 'silver', maxCatches: 10, desc: '深海渔场，良品鱼类较多。' },
  { id: 'zone_3', name: '珊瑚礁群', tier: 3, cost: 500, costType: 'spirit', maxCatches: 10, desc: '珊瑚礁群，珍品鱼类较多。' },
  { id: 'zone_4', name: '归墟海眼', tier: 4, cost: 2000, costType: 'spirit', maxCatches: 10, desc: '归墟海眼，神品鱼类较多。' },
];

// 初始化捕鱼状态
function initFishingState(state) {
  if (!state) return null;
  if (!state.fishing) {
    state.fishing = {
      currentZone: null,
      catchesLeft: 0,
      lastRefresh: null,
      fishMarket: { items: [], lastRefresh: null },
    };
  }
  return state.fishing;
}

// 进入出海区
function enterFishingZone(state, zoneId) {
  const fishing = initFishingState(state);
  const zone = FISHING_ZONES.find(z => z.id === zoneId);
  if (!zone) return { success: false, msg: '出海区不存在' };

  const player = state.player;
  if (zone.costType === 'silver') {
    if (player.silver < zone.cost) return { success: false, msg: `银两不足，需要${zone.cost}银两` };
    player.silver -= zone.cost;
  } else {
    if (player.spiritStone < zone.cost) return { success: false, msg: `灵石不足，需要${zone.cost}灵石` };
    player.spiritStone -= zone.cost;
  }

  fishing.currentZone = zoneId;
  fishing.catchesLeft = zone.maxCatches;

  return { success: true, msg: `你花费${zone.cost}${zone.costType === 'silver' ? '银两' : '灵石'}进入了${zone.name}！`, zone: zone };
}

// 捕鱼（按概率获得鱼类）
function catchFish(state, success = true) {
  const fishing = initFishingState(state);
  if (!fishing.currentZone) return { success: false, msg: '未进入出海区' };
  if (fishing.catchesLeft <= 0) return { success: false, msg: '捕鱼次数已用完', zoneEnd: true };

  const zone = FISHING_ZONES.find(z => z.id === fishing.currentZone);
  fishing.catchesLeft--;

  if (!success) {
    const result = {
      success: false,
      fish: null,
      catchesLeft: fishing.catchesLeft,
      zoneEnd: fishing.catchesLeft <= 0,
      msg: '捕鱼失败！鱼跑了...',
    };
    if (fishing.catchesLeft <= 0) {
      fishing.currentZone = null;
    }
    return result;
  }

  // 概率：60%该品级，30%低于该品级，10%超出该品级
  const rand = Math.random() * 100;
  let fishTier = zone.tier;
  if (rand < 30) {
    fishTier = Math.max(1, zone.tier - 1);
  } else if (rand >= 90) {
    fishTier = Math.min(4, zone.tier + 1);
  }

  const fishes = FISHES[fishTier] || FISHES[1];
  const fish = randChoice(fishes);
  const tierInfo = FISH_TIERS[fishTier];

  // 生成价格
  const price = randInt(tierInfo.basePrice[0], tierInfo.basePrice[1]);

  // 添加到背包
  const player = state.player;
  const existing = player.inventory.find(i => i.name === fish.name);
  if (existing) existing.count++;
  else player.inventory.push({ name: fish.name, count: 1, type: 'fish', tier: fishTier, price: price });

  const result = {
    success: true,
    fish: { ...fish, tier: fishTier, tierName: tierInfo.name, price: price },
    catchesLeft: fishing.catchesLeft,
    zoneEnd: fishing.catchesLeft <= 0,
  };

  if (fishing.catchesLeft <= 0) {
    fishing.currentZone = null;
    result.msg = `你捕到了${tierInfo.name}【${fish.name}】！本区域捕鱼次数已用完。`;
  } else {
    result.msg = `你捕到了${tierInfo.name}【${fish.name}】！`;
  }

  return result;
}

// 离开出海区
function exitFishingZone(state) {
  const fishing = initFishingState(state);
  const zone = FISHING_ZONES.find(z => z.id === fishing.currentZone);
  fishing.currentZone = null;
  fishing.catchesLeft = 0;
  return { success: true, msg: `你离开了${zone?.name || '出海区'}。` };
}

// 刷新鱼市商品（每月）
function refreshFishMarket(state) {
  const fishing = initFishingState(state);
  const items = [];

  // 每个品级随机5种鱼
  for (let tier = 1; tier <= 4; tier++) {
    const fishes = shuffle([...FISHES[tier]]);
    const count = Math.min(5, fishes.length);
    for (let i = 0; i < count; i++) {
      const fish = fishes[i];
      const tierInfo = FISH_TIERS[tier];
      const basePrice = randInt(tierInfo.basePrice[0], tierInfo.basePrice[1]);
      // 价格浮动70%-130%
      const price = Math.floor(basePrice * (0.7 + Math.random() * 0.6));
      items.push({
        name: fish.name,
        tier: tier,
        tierName: tierInfo.name,
        price: price,
        currency: tier <= 2 ? 'silver' : 'spirit',
        stock: randInt(3, 15),
        desc: fish.desc,
        portrait: fish.portrait,
        category: 'fish',
      });
    }
  }

  fishing.fishMarket.items = items;
  fishing.fishMarket.lastRefresh = `${state.gameDate.year}年${state.gameDate.month}月`;
  return items;
}

// 获取鱼市商品
function getFishMarketItems(state) {
  const fishing = initFishingState(state);
  const currentMonth = `${state.gameDate.year}年${state.gameDate.month}月`;
  if (fishing.fishMarket.lastRefresh !== currentMonth || fishing.fishMarket.items.length === 0) {
    refreshFishMarket(state);
  }
  return fishing.fishMarket.items;
}

module.exports = {
  FISH_TIERS,
  FISHES,
  FISHING_ZONES,
  initFishingState,
  enterFishingZone,
  catchFish,
  exitFishingZone,
  refreshFishMarket,
  getFishMarketItems,
};
