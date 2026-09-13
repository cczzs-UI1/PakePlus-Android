// 种植系统 - 种子、灵田、种植、生长、采摘
const { randInt, randChoice, clamp } = require('./utils');

// 种子定义
const SEEDS = {
  // 凡人界种子
  '青菜种子': {
    name: '青菜种子',
    type: '蔬菜',
    growthTime: 2, // 生长时间（旬）
    harvest: { name: '青菜', count: [2, 4] },
    price: 10,
    desc: '普通的青菜种子，生长迅速。',
  },
  '水稻种子': {
    name: '水稻种子',
    type: '粮食',
    growthTime: 4,
    harvest: { name: '大米', count: [3, 6] },
    price: 15,
    desc: '水稻种子，可收获大米。',
  },
  '小麦种子': {
    name: '小麦种子',
    type: '粮食',
    growthTime: 3,
    harvest: { name: '面粉', count: [2, 5] },
    price: 12,
    desc: '小麦种子，可收获面粉。',
  },
  '白菜种子': {
    name: '白菜种子',
    type: '蔬菜',
    growthTime: 3,
    harvest: { name: '白菜', count: [2, 4] },
    price: 12,
    desc: '白菜种子，耐寒易种。',
  },
  '萝卜种子': {
    name: '萝卜种子',
    type: '蔬菜',
    growthTime: 2,
    harvest: { name: '萝卜', count: [3, 5] },
    price: 10,
    desc: '萝卜种子，营养丰富。',
  },
  '辣椒种子': {
    name: '辣椒种子',
    type: '蔬菜',
    growthTime: 3,
    harvest: { name: '辣椒', count: [2, 4] },
    price: 15,
    desc: '辣椒种子，辛辣开胃。',
  },
  '葱蒜种子': {
    name: '葱蒜种子',
    type: '调料',
    growthTime: 2,
    harvest: { name: '葱姜', count: [3, 6] },
    price: 8,
    desc: '葱蒜种子，调味佳品。',
  },
  '黄豆种子': {
    name: '黄豆种子',
    type: '粮食',
    growthTime: 4,
    harvest: { name: '黄豆', count: [2, 5] },
    price: 14,
    desc: '黄豆种子，可做豆腐豆浆。',
  },
  '鸡苗': {
    name: '鸡苗',
    type: '家禽',
    growthTime: 5,
    harvest: { name: '鸡肉', count: [1, 2] },
    price: 30,
    desc: '小鸡苗，长大后可收获鸡肉和鸡蛋。',
  },
  '鸭苗': {
    name: '鸭苗',
    type: '家禽',
    growthTime: 5,
    harvest: { name: '鸭肉', count: [1, 2] },
    price: 35,
    desc: '小鸭苗，肉质鲜美。',
  },
  // 修仙界种子
  '聚灵草种子': {
    name: '聚灵草种子',
    type: '灵草',
    growthTime: 4,
    harvest: { name: '聚灵草', count: [1, 3] },
    price: 50,
    desc: '聚灵草种子，可吸收天地灵气。',
    spirit: true,
  },
  '灵谷种子': {
    name: '灵谷种子',
    type: '灵粮',
    growthTime: 5,
    harvest: { name: '灵谷', count: [2, 4] },
    price: 80,
    desc: '灵谷种子，蕴含灵气的粮食。',
    spirit: true,
  },
  '百年灵芝孢子': {
    name: '百年灵芝孢子',
    type: '灵药',
    growthTime: 8,
    harvest: { name: '百年灵芝', count: [1, 1] },
    price: 200,
    desc: '百年灵芝孢子，生长缓慢但珍贵。',
    spirit: true,
  },
  '人参种子': {
    name: '人参种子',
    type: '灵药',
    growthTime: 6,
    harvest: { name: '人参', count: [1, 2] },
    price: 100,
    desc: '人参种子，大补之物。',
    spirit: true,
  },
  '雪莲种子': {
    name: '雪莲种子',
    type: '灵药',
    growthTime: 7,
    harvest: { name: '雪莲', count: [1, 1] },
    price: 150,
    desc: '雪莲种子，生长于高寒之地。',
    spirit: true,
  },
  '灵茶叶种': {
    name: '灵茶叶种',
    type: '灵茶',
    growthTime: 5,
    harvest: { name: '灵茶叶', count: [2, 4] },
    price: 120,
    desc: '灵茶种子，可冲泡灵茶。',
    spirit: true,
  },
  '妖兽幼崽': {
    name: '妖兽幼崽',
    type: '灵兽',
    growthTime: 8,
    harvest: { name: '妖兽肉', count: [2, 4] },
    price: 300,
    desc: '妖兽幼崽，长大后可收获妖兽肉和内丹。',
    spirit: true,
  },
  '何首乌种子': {
    name: '何首乌种子',
    type: '灵药',
    growthTime: 6,
    harvest: { name: '何首乌', count: [1, 2] },
    price: 100,
    desc: '何首乌种子，乌发延年。',
    spirit: true,
  },
};

// 初始化种植系统
function initFarming(player) {
  if (!player.farm) {
    player.farm = {
      plots: [], // 灵田地块
      maxPlots: 4, // 初始4块地
      level: 1,
    };
    // 初始化空地块
    for (let i = 0; i < player.farm.maxPlots; i++) {
      player.farm.plots.push({ id: i, seed: null, growth: 0, ready: false });
    }
  }
  return player.farm;
}

// 获取灵田信息
function getFarmInfo(player) {
  initFarming(player);
  return player.farm;
}

// 种植
function plantSeed(player, plotId, seedName) {
  initFarming(player);
  const plot = player.farm.plots.find(p => p.id === plotId);
  if (!plot) return { success: false, msg: '没有这块地' };
  if (plot.seed) return { success: false, msg: '这块地已经种了东西' };

  const seed = SEEDS[seedName];
  if (!seed) return { success: false, msg: '没有这种种子' };

  // 检查背包中是否有种子
  const item = player.inventory.find(i => i.name === seedName);
  if (!item || item.count <= 0) return { success: false, msg: '背包中没有这种种子' };

  // 消耗种子
  item.count--;
  if (item.count <= 0) {
    player.inventory = player.inventory.filter(i => i.name !== seedName);
  }

  plot.seed = seedName;
  plot.growth = 0;
  plot.ready = false;

  return { success: true, msg: `在第${plotId + 1}块地种下了${seedName}，需要${seed.growthTime}旬成熟。` };
}

// 推进生长（每旬调用）
function tickFarm(player) {
  initFarming(player);
  const results = [];
  for (const plot of player.farm.plots) {
    if (plot.seed && !plot.ready) {
      plot.growth++;
      const seed = SEEDS[plot.seed];
      if (plot.growth >= seed.growthTime) {
        plot.ready = true;
        results.push({ plotId: plot.id, seed: plot.seed, msg: `${plot.seed}成熟了，可以采摘！` });
      }
    }
  }
  return results;
}

// 采摘
function harvest(player, plotId) {
  initFarming(player);
  const plot = player.farm.plots.find(p => p.id === plotId);
  if (!plot) return { success: false, msg: '没有这块地' };
  if (!plot.seed) return { success: false, msg: '这块地没有种东西' };
  if (!plot.ready) return { success: false, msg: '还没有成熟' };

  const seed = SEEDS[plot.seed];
  const count = randInt(seed.harvest.count[0], seed.harvest.count[1]);

  // 添加到背包
  const existing = player.inventory.find(i => i.name === seed.harvest.name);
  if (existing) existing.count += count;
  else player.inventory.push({ name: seed.harvest.name, count, type: seed.spirit ? 'spirit' : 'normal' });

  const result = { success: true, msg: `采摘了${seed.harvest.name}×${count}！`, item: seed.harvest.name, count };

  // 重置地块
  plot.seed = null;
  plot.growth = 0;
  plot.ready = false;

  // 增加种植经验
  player.farm.level = Math.min(10, player.farm.level + 0.1);

  return result;
}

// 一键采摘
function harvestAll(player) {
  initFarming(player);
  const results = [];
  for (const plot of player.farm.plots) {
    if (plot.ready) {
      const result = harvest(player, plot.id);
      if (result.success) results.push(result);
    }
  }
  return results;
}

// 扩建灵田
function expandFarm(player) {
  initFarming(player);
  const cost = player.farm.maxPlots * 100;
  if (player.silver < cost) return { success: false, msg: `需要${cost}银两` };
  if (player.farm.maxPlots >= 12) return { success: false, msg: '灵田已达上限（12块）' };

  player.silver -= cost;
  player.farm.maxPlots++;
  player.farm.plots.push({ id: player.farm.maxPlots - 1, seed: null, growth: 0, ready: false });

  return { success: true, msg: `扩建了一块灵田，现在有${player.farm.maxPlots}块地。` };
}

// 获取所有种子列表
function getAllSeeds() {
  return Object.values(SEEDS);
}

// 获取可购买的种子（种子铺）
function getSeedsForSale() {
  return Object.values(SEEDS).map(s => ({
    name: s.name,
    price: s.price,
    type: s.type,
    growthTime: s.growthTime,
    harvest: s.harvest.name,
    desc: s.desc,
    spirit: s.spirit || false,
  }));
}

module.exports = {
  SEEDS,
  initFarming,
  getFarmInfo,
  plantSeed,
  tickFarm,
  harvest,
  harvestAll,
  expandFarm,
  getAllSeeds,
  getSeedsForSale,
};
