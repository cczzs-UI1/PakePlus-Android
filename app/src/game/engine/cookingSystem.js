// 做菜系统 - 菜品定义、品级系统、制作、食用效果
const { randInt, randChoice, clamp, chance } = require('./utils');

// 品级定义
const QUALITY_TIERS = {
  '废菜': { multiplier: 0, healthPenalty: 20, color: '#666' },
  '凡品下品': { multiplier: 0.8, healthPenalty: 0, color: '#8b6914' },
  '凡品中品': { multiplier: 1.0, healthPenalty: 0, color: '#8b6914' },
  '凡品上品': { multiplier: 1.2, healthPenalty: 0, color: '#a0522d' },
  '良品下品': { multiplier: 1.5, healthPenalty: 0, color: '#228b22' },
  '良品中品': { multiplier: 1.8, healthPenalty: 0, color: '#228b22' },
  '良品上品': { multiplier: 2.2, healthPenalty: 0, color: '#32cd32' },
  '珍品下品': { multiplier: 2.8, healthPenalty: 0, color: '#4169e1' },
  '珍品中品': { multiplier: 3.3, healthPenalty: 0, color: '#4169e1' },
  '珍品上品': { multiplier: 4.0, healthPenalty: 0, color: '#6495ed' },
  '神品下品': { multiplier: 5.0, healthPenalty: 0, color: '#9932cc' },
  '神品中品': { multiplier: 6.0, healthPenalty: 0, color: '#9932cc' },
  '神品上品': { multiplier: 8.0, healthPenalty: 0, color: '#ff00ff' },
};

// 菜品定义（基础品级）
const DISHES = {
  // 凡品菜品
  '清炒时蔬': {
    name: '清炒时蔬', type: '素菜', baseQuality: '凡品',
    materials: [{ name: '青菜', count: 2 }], cookTime: 1,
    effects: { hp: 20, mp: 10 }, desc: '简单的清炒蔬菜，清爽可口。', price: 20,
  },
  '蛋炒饭': {
    name: '蛋炒饭', type: '主食', baseQuality: '凡品',
    materials: [{ name: '大米', count: 2 }, { name: '鸡蛋', count: 2 }], cookTime: 1,
    effects: { hp: 30, mp: 15 }, desc: '简单的蛋炒饭，香气扑鼻。', price: 30,
  },
  '红烧肉': {
    name: '红烧肉', type: '荤菜', baseQuality: '凡品',
    materials: [{ name: '猪肉', count: 2 }, { name: '酱油', count: 1 }], cookTime: 2,
    effects: { hp: 50, mp: 20, strength: 1 }, desc: '肥而不腻的红烧肉，入口即化。', price: 80,
  },
  '清蒸鱼': {
    name: '清蒸鱼', type: '荤菜', baseQuality: '凡品',
    materials: [{ name: '鲫鱼', count: 1 }, { name: '葱姜', count: 1 }], cookTime: 2,
    effects: { hp: 40, mp: 30, agility: 1 }, desc: '鲜嫩的清蒸鱼，营养丰富。', price: 60,
  },
  '红烧鲤鱼': {
    name: '红烧鲤鱼', type: '荤菜', baseQuality: '凡品',
    materials: [{ name: '鲤鱼', count: 1 }, { name: '酱油', count: 1 }], cookTime: 2,
    effects: { hp: 50, mp: 20, charm: 1 }, desc: '红烧鲤鱼，寓意年年有余。', price: 70,
  },
  '酸菜鱼': {
    name: '酸菜鱼', type: '荤菜', baseQuality: '良品',
    materials: [{ name: '草鱼', count: 1 }, { name: '葱姜', count: 1 }], cookTime: 3,
    effects: { hp: 80, mp: 40, appetite: 1 }, desc: '酸辣开胃的酸菜鱼，鱼肉嫩滑。', price: 150,
  },
  '松鼠桂鱼': {
    name: '松鼠桂鱼', type: '荤菜', baseQuality: '良品',
    materials: [{ name: '桂鱼', count: 1 }, { name: '蜂蜜', count: 1 }], cookTime: 3,
    effects: { hp: 100, mp: 50, charm: 2 }, desc: '形如松鼠，外酥里嫩，酸甜可口。', price: 200,
  },
  '清蒸石斑': {
    name: '清蒸石斑', type: '荤菜', baseQuality: '珍品',
    materials: [{ name: '石斑鱼', count: 1 }, { name: '葱姜', count: 1 }], cookTime: 3,
    effects: { hp: 150, mp: 80, constitution: 2 }, desc: '清蒸石斑鱼，肉质细腻，鲜美无比。', price: 500,
  },
  '刺身拼盘': {
    name: '刺身拼盘', type: '荤菜', baseQuality: '珍品',
    materials: [{ name: '三文鱼', count: 1 }, { name: '金枪鱼', count: 1 }], cookTime: 1,
    effects: { hp: 120, mp: 100, agility: 3 }, desc: '新鲜的生鱼片拼盘，原汁原味。', price: 800,
  },
  '龙虾宴': {
    name: '龙虾宴', type: '荤菜', baseQuality: '珍品',
    materials: [{ name: '龙虾', count: 1 }, { name: '葱姜', count: 2 }], cookTime: 4,
    effects: { hp: 200, mp: 100, strength: 3, charm: 2 }, desc: '丰盛的龙虾宴，豪气十足。', price: 1000,
  },
  '龙鱼脍': {
    name: '龙鱼脍', type: '荤菜', baseQuality: '神品',
    materials: [{ name: '龙鱼', count: 1 }, { name: '葱姜', count: 1 }], cookTime: 2,
    effects: { hp: 300, mp: 200, cultivationExp: 500, constitution: 5 }, desc: '用传说中的龙鱼制作的生鱼片，蕴含龙气。', price: 5000,
  },
  '鲲鹏展翅': {
    name: '鲲鹏展翅', type: '荤菜', baseQuality: '神品',
    materials: [{ name: '鲲鹏', count: 1 }, { name: '蜂蜜', count: 2 }], cookTime: 5,
    effects: { hp: 500, mp: 300, cultivationExp: 1000, strength: 10 }, desc: '以鲲鹏之肉制作的绝世佳肴，食之可展翅高飞。', price: 10000,
  },
  '鸡汤': {
    name: '鸡汤', type: '汤品', baseQuality: '凡品',
    materials: [{ name: '鸡肉', count: 1 }, { name: '枸杞', count: 1 }], cookTime: 3,
    effects: { hp: 60, mp: 40, constitution: 1 }, desc: '滋补的鸡汤，强身健体。', price: 100,
  },
  // 良品菜品
  '烤鸭': {
    name: '烤鸭', type: '荤菜', baseQuality: '良品',
    materials: [{ name: '鸭肉', count: 1 }, { name: '蜂蜜', count: 1 }], cookTime: 3,
    effects: { hp: 80, mp: 30, charm: 2 }, desc: '皮脆肉嫩的烤鸭，色香味俱全。', price: 200,
  },
  '羊肉汤': {
    name: '羊肉汤', type: '汤品', baseQuality: '良品',
    materials: [{ name: '羊肉', count: 2 }, { name: '葱姜', count: 1 }], cookTime: 3,
    effects: { hp: 100, mp: 50, constitution: 2 }, desc: '温补的羊肉汤，驱寒暖身。', price: 180,
  },
  '牛肉火锅': {
    name: '牛肉火锅', type: '荤菜', baseQuality: '良品',
    materials: [{ name: '牛肉', count: 2 }, { name: '葱姜', count: 2 }], cookTime: 4,
    effects: { hp: 120, mp: 40, strength: 2 }, desc: '热气腾腾的牛肉火锅，劲道十足。', price: 250,
  },
  // 珍品菜品
  '佛跳墙': {
    name: '佛跳墙', type: '荤菜', baseQuality: '珍品',
    materials: [{ name: '鲍鱼', count: 1 }, { name: '海参', count: 1 }, { name: '鱼翅', count: 1 }], cookTime: 5,
    effects: { hp: 150, mp: 100, constitution: 3, willpower: 2 }, desc: '集山珍海味于一坛，香气四溢，佛闻弃禅跳墙来。', price: 1000,
  },
  '百年灵芝炖鸡': {
    name: '百年灵芝炖鸡', type: '汤品', baseQuality: '珍品',
    materials: [{ name: '人参', count: 1 }, { name: '鸡肉', count: 1 }], cookTime: 4,
    effects: { hp: 200, mp: 150, cultivationExp: 200, constitution: 5 }, desc: '百年灵芝与土鸡同炖，大补之物。', price: 500,
  },
  // 修仙界菜品
  '灵米饭': {
    name: '灵米饭', type: '主食', baseQuality: '良品',
    materials: [{ name: '灵谷', count: 2 }], cookTime: 1,
    effects: { hp: 50, mp: 50, cultivationExp: 20 }, desc: '用灵谷煮成的米饭，蕴含灵气。', price: 50,
  },
  '聚灵草汤': {
    name: '聚灵草汤', type: '汤品', baseQuality: '良品',
    materials: [{ name: '聚灵草', count: 3 }], cookTime: 2,
    effects: { hp: 40, mp: 80, cultivationExp: 50 }, desc: '用聚灵草熬制的汤，灵气充沛。', price: 100,
  },
  '妖兽肉串': {
    name: '妖兽肉串', type: '荤菜', baseQuality: '珍品',
    materials: [{ name: '妖兽肉', count: 2 }], cookTime: 2,
    effects: { hp: 100, mp: 30, strength: 3, constitution: 2 }, desc: '烤制的妖兽肉，蕴含强大的生命力。', price: 150,
  },
  '灵茶': {
    name: '灵茶', type: '饮品', baseQuality: '凡品',
    materials: [{ name: '灵茶叶', count: 1 }], cookTime: 1,
    effects: { mp: 60, enlightenment: 1 }, desc: '用灵茶叶冲泡的茶水，清心明目。', price: 80,
  },
  '灵酒': {
    name: '灵酒', type: '饮品', baseQuality: '良品',
    materials: [{ name: '灵谷', count: 3 }], cookTime: 3,
    effects: { hp: 80, mp: 50, charm: 1 }, desc: '用灵谷酿造的美酒，醇香扑鼻。', price: 200,
  },
  // 神品菜品
  '仙丹级灵食': {
    name: '仙丹级灵食', type: '珍品', baseQuality: '神品',
    materials: [{ name: '人参', count: 1 }, { name: '妖兽内丹', count: 1 }], cookTime: 6,
    effects: { hp: 500, mp: 400, cultivationExp: 1000, allAttrs: 5 }, desc: '集天地灵物于一体，食之可脱胎换骨。', price: 5000,
  },
};

// 根据厨艺等级和基础品级决定最终品级
function determineQuality(cookLevel, baseQuality) {
  // 基础概率分布
  const baseIndex = ['凡品', '良品', '珍品', '神品'].indexOf(baseQuality);

  // 废菜概率（厨艺越低越容易失败）
  const failChance = Math.max(5, 25 - cookLevel * 3);
  if (chance(failChance)) return '废菜';

  // 品级偏移（厨艺越高越容易出高品级）
  const qualityBonus = Math.floor(cookLevel / 3);
  const subQualityBonus = cookLevel % 3;

  let tierIndex = Math.min(3, baseIndex + qualityBonus);
  const tiers = ['凡品', '良品', '珍品', '神品'];
  const tier = tiers[tierIndex];

  // 上/中/下品
  const subRoll = Math.random() * 100 + subQualityBonus * 10;
  let subTier;
  if (subRoll < 40) subTier = '下品';
  else if (subRoll < 75) subTier = '中品';
  else subTier = '上品';

  return `${tier}${subTier}`;
}

// 初始化做菜系统
function initCooking(player) {
  if (!player.cooking) {
    player.cooking = {
      level: 1,
      exp: 0,
      currentDish: null,
      cookProgress: 0,
      learnedRecipes: Object.keys(DISHES).slice(0, 5),
    };
  }
  return player.cooking;
}

// 获取可制作的菜品
function getAvailableDishes(player) {
  initCooking(player);
  return player.cooking.learnedRecipes.map(name => DISHES[name]).filter(Boolean);
}

// 检查材料是否足够
function checkMaterials(player, dishName) {
  const dish = DISHES[dishName];
  if (!dish) return { success: false, msg: '没有这道菜' };
  for (const mat of dish.materials) {
    const have = player.inventory?.find(i => i.name === mat.name)?.count || 0;
    if (have < mat.count) {
      return { success: false, msg: `材料不足：需要${mat.name}×${mat.count}，只有${have}` };
    }
  }
  return { success: true };
}

// 开始做菜
function startCooking(player, dishName) {
  initCooking(player);
  if (player.cooking.currentDish) {
    return { success: false, msg: '正在制作其他菜品' };
  }
  const dish = DISHES[dishName];
  if (!dish) return { success: false, msg: '没有这道菜' };
  if (!player.cooking.learnedRecipes.includes(dishName)) {
    return { success: false, msg: '还没有学会这道菜' };
  }
  const check = checkMaterials(player, dishName);
  if (!check.success) return check;

  // 消耗材料
  for (const mat of dish.materials) {
    const item = player.inventory.find(i => i.name === mat.name);
    if (item) {
      item.count -= mat.count;
      if (item.count <= 0) {
        player.inventory = player.inventory.filter(i => i.name !== mat.name);
      }
    }
  }

  player.cooking.currentDish = dishName;
  player.cooking.cookProgress = 0;
  return { success: true, msg: `开始制作${dishName}，需要${dish.cookTime}旬完成。` };
}

// 推进做菜进度（每旬调用）
function tickCooking(player) {
  initCooking(player);
  if (!player.cooking.currentDish) return null;
  player.cooking.cookProgress++;
  const dish = DISHES[player.cooking.currentDish];
  if (player.cooking.cookProgress >= dish.cookTime) {
    // 完成做菜，决定品级
    const quality = determineQuality(player.cooking.level, dish.baseQuality);
    const qualityInfo = QUALITY_TIERS[quality];
    const count = 1 + (Math.random() < 0.2 ? 1 : 0);

    // 废菜处理
    if (quality === '废菜') {
      // 扣健康值（用hp代替）
      player.hp.current = Math.max(1, player.hp.current - qualityInfo.healthPenalty);
      // 废菜也加入背包，但标注为废菜
      const existing = player.inventory.find(i => i.name === `废菜(${dish.name})`);
      if (existing) existing.count += count;
      else player.inventory.push({ name: `废菜(${dish.name})`, count, type: 'food', quality: '废菜' });
    } else {
      // 正常菜品，根据品级调整效果
      const itemName = `${quality}${dish.name}`;
      const existing = player.inventory.find(i => i.name === itemName);
      if (existing) existing.count += count;
      else player.inventory.push({
        name: itemName, count, type: 'food', quality,
        baseEffects: dish.effects, multiplier: qualityInfo.multiplier,
      });
    }

    // 增加厨艺经验
    const expGain = 10 + (quality === '废菜' ? 0 : Math.floor(qualityInfo.multiplier * 5));
    player.cooking.exp += expGain;
    if (player.cooking.exp >= player.cooking.level * 100) {
      player.cooking.exp = 0;
      player.cooking.level++;
    }

    const result = {
      success: true, dish: dish.name, count, quality,
      level: player.cooking.level,
      isFailed: quality === '废菜',
    };
    player.cooking.currentDish = null;
    player.cooking.cookProgress = 0;
    return result;
  }
  return { progress: player.cooking.cookProgress, total: dish.cookTime, dish: dish.name };
}

// 食用菜品
function eatDish(player, dishName) {
  const item = player.inventory.find(i => i.name === dishName);
  if (!item || item.count <= 0) return { success: false, msg: '背包中没有这道菜' };

  item.count--;
  if (item.count <= 0) {
    player.inventory = player.inventory.filter(i => i.name !== dishName);
  }

  // 废菜处理
  if (item.quality === '废菜' || dishName.startsWith('废菜')) {
    player.hp.current = Math.max(1, player.hp.current - 20);
    return { success: true, msg: `食用了废菜，味道难以下咽，损失气血20。`, effects: { hp: -20 } };
  }

  // 正常菜品，根据品级应用效果
  const effects = item.baseEffects || {};
  const multiplier = item.multiplier || 1;
  const appliedEffects = {};

  if (effects.hp) {
    const hpGain = Math.floor(effects.hp * multiplier);
    player.hp.current = Math.min(player.hp.max, player.hp.current + hpGain);
    appliedEffects.hp = hpGain;
  }
  if (effects.mp) {
    const mpGain = Math.floor(effects.mp * multiplier);
    player.mp.current = Math.min(player.mp.max, player.mp.current + mpGain);
    appliedEffects.mp = mpGain;
  }
  if (effects.cultivationExp) {
    const expGain = Math.floor(effects.cultivationExp * multiplier);
    player.cultivationExp += expGain;
    appliedEffects.cultivationExp = expGain;
  }
  if (effects.strength) {
    const gain = Math.ceil(effects.strength * multiplier * 0.5);
    player.attributes.strength += gain;
    appliedEffects.strength = gain;
  }
  if (effects.constitution) {
    const gain = Math.ceil(effects.constitution * multiplier * 0.5);
    player.attributes.constitution += gain;
    appliedEffects.constitution = gain;
  }
  if (effects.agility) {
    const gain = Math.ceil(effects.agility * multiplier * 0.5);
    player.attributes.agility += gain;
    appliedEffects.agility = gain;
  }
  if (effects.charm) {
    const gain = Math.ceil(effects.charm * multiplier * 0.5);
    player.attributes.charm += gain;
    appliedEffects.charm = gain;
  }
  if (effects.enlightenment) {
    const gain = Math.ceil(effects.enlightenment * multiplier * 0.5);
    player.attributes.enlightenment += gain;
    appliedEffects.enlightenment = gain;
  }
  if (effects.allAttrs) {
    const gain = Math.ceil(effects.allAttrs * multiplier * 0.3);
    for (const key in player.attributes) {
      if (typeof player.attributes[key] === 'number') {
        player.attributes[key] += gain;
      }
    }
    appliedEffects.allAttrs = gain;
  }

  return {
    success: true,
    msg: `食用了${item.quality || ''}${dishName.replace(/^.+品/, '')}，恢复气血${appliedEffects.hp || 0}、灵力${appliedEffects.mp || 0}。`,
    effects: appliedEffects,
    quality: item.quality,
  };
}

// 学习新菜谱
function learnRecipe(player, dishName) {
  initCooking(player);
  if (player.cooking.learnedRecipes.includes(dishName)) {
    return { success: false, msg: '已经学会这道菜了' };
  }
  if (!DISHES[dishName]) return { success: false, msg: '没有这道菜' };
  player.cooking.learnedRecipes.push(dishName);
  return { success: true, msg: `学会了新菜谱：${dishName}` };
}

module.exports = {
  DISHES,
  QUALITY_TIERS,
  determineQuality,
  initCooking,
  getAvailableDishes,
  checkMaterials,
  startCooking,
  tickCooking,
  eatDish,
  learnRecipe,
};
