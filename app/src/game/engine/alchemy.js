// 炼丹系统 - 丹方、材料、炼制、品质
const { randInt, chance, randChoice, clamp } = require('./utils');

// 丹方大全
const RECIPES = [
  // 一阶丹药
  { id: 'huiqi', name: '回气丹', tier: 1, materials: [{ name: '聚灵草', count: 2 }, { name: '灵草', count: 1 }], result: '回灵丹', basePrice: 100, exp: 50, desc: '恢复灵力30%' },
  { id: 'huixue', name: '回血丹', tier: 1, materials: [{ name: '聚灵草', count: 1 }, { name: '灵草', count: 2 }], result: '回血丹', basePrice: 80, exp: 50, desc: '恢复气血30%' },
  { id: 'jiedu', name: '解毒丹', tier: 1, materials: [{ name: '灵草', count: 3 }], result: '解毒丹', basePrice: 120, exp: 60, desc: '解除中毒状态' },
  { id: 'juqi', name: '聚气丹', tier: 1, materials: [{ name: '聚灵草', count: 3 }, { name: '妖丹', count: 1 }], result: '聚气丹', basePrice: 300, exp: 100, desc: '增加修为500' },
  // 二阶丹药
  { id: 'liaoshang', name: '疗伤丹', tier: 2, materials: [{ name: '回阳草', count: 2 }, { name: '妖丹', count: 1 }], result: '疗伤丹', basePrice: 150, exp: 150, desc: '治疗伤势，恢复50%气血' },
  { id: 'qingxin', name: '清心丹', tier: 2, materials: [{ name: '月华露', count: 2 }, { name: '灵草', count: 3 }], result: '清心丹', basePrice: 200, exp: 150, desc: '清除心魔，突破成功率+10%' },
  { id: 'zhuji', name: '筑基丹', tier: 2, materials: [{ name: '紫霞参', count: 1 }, { name: '妖丹', count: 2 }, { name: '聚灵草', count: 5 }], result: '筑基丹', basePrice: 2000, exp: 300, desc: '筑基期突破必备' },
  { id: 'zengli', name: '增力丹', tier: 2, materials: [{ name: '玄阳果', count: 2 }, { name: '妖兽骨', count: 1 }], result: '增力丹', basePrice: 250, exp: 180, desc: '攻击力+20%，持续3回合' },
  // 三阶丹药
  { id: 'jiedan', name: '金丹', tier: 3, materials: [{ name: '紫霞参', count: 3 }, { name: '千年灵芝', count: 1 }, { name: '妖丹', count: 5 }], result: '金丹', basePrice: 10000, exp: 500, desc: '结丹期突破必备' },
  { id: 'huiling', name: '回灵丹·上品', tier: 3, materials: [{ name: '冰心莲', count: 2 }, { name: '月华露', count: 3 }], result: '上品回灵丹', basePrice: 500, exp: 300, desc: '恢复灵力80%' },
  { id: 'songzi', name: '送子丹', tier: 3, materials: [{ name: '凤仙花', count: 2 }, { name: '玄阳果', count: 3 }, { name: '千年灵芝', count: 1 }], result: '送子丹', basePrice: 5000, exp: 400, desc: '服用后必受孕' },
  { id: 'shunchan', name: '顺产丹', tier: 3, materials: [{ name: '回阳草', count: 3 }, { name: '灵草', count: 5 }], result: '顺产丹', basePrice: 3000, exp: 350, desc: '生产成功率+20%' },
  // 四阶丹药
  { id: 'yuanying', name: '元婴丹', tier: 4, materials: [{ name: '万年人参', count: 1 }, { name: '龙须草', count: 2 }, { name: '妖丹', count: 10 }], result: '元婴丹', basePrice: 50000, exp: 1000, desc: '元婴期突破必备' },
  { id: 'zengshou', name: '增寿丹', tier: 4, materials: [{ name: '万年人参', count: 2 }, { name: '千年灵芝', count: 3 }], result: '增寿丹', basePrice: 20000, exp: 800, desc: '增加寿元50年' },
  { id: 'pojing', name: '破境丹', tier: 4, materials: [{ name: '龙须草', count: 3 }, { name: '雷竹', count: 2 }, { name: '妖丹', count: 5 }], result: '破境丹', basePrice: 15000, exp: 700, desc: '突破成功率+30%' },
  // 五阶丹药
  { id: 'huashen', name: '化神丹', tier: 5, materials: [{ name: '混沌莲', count: 1 }, { name: '万年人参', count: 2 }, { name: '龙须草', count: 5 }], result: '化神丹', basePrice: 200000, exp: 2000, desc: '化神期突破必备' },
  { id: 'feisheng', name: '飞升丹', tier: 5, materials: [{ name: '混沌莲', count: 2 }, { name: '万年人参', count: 3 }, { name: '千年灵芝', count: 5 }], result: '飞升丹', basePrice: 500000, exp: 3000, desc: '渡劫飞升必备' },
  { id: 'huiming', name: '慧明丹', tier: 5, materials: [{ name: '混沌莲', count: 1 }, { name: '月华露', count: 10 }], result: '慧明丹', basePrice: 100000, exp: 1500, desc: '悟性永久+5' },
  // 补全：凡品丹药（items 中存在但原无配方）
  { id: 'jinchuang', name: '金疮药', tier: 1, materials: [{ name: '灵草', count: 2 }, { name: '人参', count: 1 }], result: '金疮药', basePrice: 50, exp: 30, desc: '治疗外伤，恢复气血100' },
  { id: 'anshen', name: '安神汤', tier: 1, materials: [{ name: '灵草', count: 2 }], result: '安神汤', basePrice: 30, exp: 25, desc: '安神定志，恢复精神80' },
  { id: 'jiedusan', name: '解毒散', tier: 1, materials: [{ name: '灵草', count: 2 }, { name: '回阳草', count: 1 }], result: '解毒散', basePrice: 80, exp: 40, desc: '解除常见毒素' },
  { id: 'huichun', name: '回春丹', tier: 2, materials: [{ name: '回阳草', count: 2 }, { name: '灵草', count: 2 }], result: '回春丹', basePrice: 120, exp: 80, desc: '恢复气血50%，疗伤良药' },
  // 补全：突破/特殊丹药
  { id: 'jindanpozhan', name: '金丹破障丹', tier: 3, materials: [{ name: '紫霞参', count: 2 }, { name: '妖丹', count: 3 }, { name: '千年灵芝', count: 1 }], result: '金丹破障丹', basePrice: 12000, exp: 500, desc: '结丹期突破成功率+25%' },
  { id: 'liandu', name: '炼虚丹', tier: 6, materials: [{ name: '混沌莲', count: 1 }, { name: '万年人参', count: 3 }, { name: '龙须草', count: 5 }], result: '炼虚丹', basePrice: 150000, exp: 2500, desc: '炼虚期突破必备' },
  { id: 'heti', name: '合体丹', tier: 7, materials: [{ name: '混沌莲', count: 2 }, { name: '万年人参', count: 5 }, { name: '千年灵芝', count: 5 }], result: '合体丹', basePrice: 400000, exp: 4000, desc: '合体期突破必备' },
  { id: 'dacheng', name: '大乘丹', tier: 8, materials: [{ name: '混沌莲', count: 3 }, { name: '万年人参', count: 8 }, { name: '龙须草', count: 10 }], result: '大乘丹', basePrice: 1000000, exp: 6000, desc: '大乘期突破必备' },
  { id: 'antai', name: '安胎丸', tier: 2, materials: [{ name: '凤仙花', count: 1 }, { name: '灵草', count: 3 }], result: '安胎丸', basePrice: 800, exp: 100, desc: '安胎养元，孕期服用可保胎儿安稳' },
  { id: 'huaxing', name: '化形丹', tier: 3, materials: [{ name: '紫霞参', count: 1 }, { name: '妖丹', count: 3 }, { name: '千年灵芝', count: 1 }], result: '化形丹', basePrice: 8000, exp: 400, desc: '妖族服用可化为人形' },
  { id: 'rongxue', name: '融雪丹', tier: 2, materials: [{ name: '冰心莲', count: 1 }, { name: '月华露', count: 2 }], result: '融雪丹', basePrice: 500, exp: 150, desc: '化解寒毒，恢复灵力' },
  { id: 'xuesha', name: '血煞丹', tier: 3, materials: [{ name: '妖丹', count: 5 }, { name: '魂火', count: 2 }, { name: '玄阳果', count: 2 }], result: '血煞丹', basePrice: 3000, exp: 350, desc: '以血煞之气强化攻击，魔修爱用' },

];

// 炼丹等级
const ALCHEMY_LEVELS = [
  { level: 1, name: '丹徒', expNeed: 0, successBonus: 0 },
  { level: 2, name: '丹师', expNeed: 500, successBonus: 5 },
  { level: 3, name: '大丹师', expNeed: 2000, successBonus: 10 },
  { level: 4, name: '丹宗', expNeed: 5000, successBonus: 15 },
  { level: 5, name: '丹王', expNeed: 15000, successBonus: 20 },
  { level: 6, name: '丹皇', expNeed: 40000, successBonus: 25 },
  { level: 7, name: '丹圣', expNeed: 100000, successBonus: 30 },
];

// 丹药效果（按丹方id），用于战斗中使用丹药
const PILL_EFFECTS = {
  huiqi: { mpPct: 30 },
  huixue: { hpPct: 30 },
  jiedu: { removeDebuff: ['中毒'] },
  juqi: { cultivationExp: 500 },
  liaoshang: { hpPct: 50 },
  qingxin: { removeDebuff: ['心魔缠身', '走火入魔'] },
  zhuji: { breakthrough: 20 },
  zengli: { atkBuff: 20, duration: 3 },
  jiedan: { breakthrough: 30 },
  huiling: { mpPct: 80 },
  songzi: { pregnancy: 100 },
  shunchan: { birthBonus: 20 },
  yuanying: { breakthrough: 40 },
  zengshou: { lifespan: 50 },
  pojing: { breakthrough: 30 },
  huashen: { breakthrough: 50 },
  feisheng: { breakthrough: 60 },
  huiming: { enlightenment: 5 },
};

// 初始化炼丹技能
function initAlchemy(player) {
  if (!player.alchemy) {
    player.alchemy = {
      level: 1, exp: 0,
      recipes: ['huiqi', 'huixue', 'jiedu'],
      learning: {}, // 正在学习的丹方进度 {recipeId: progress}
      towerRecipes: [], // 丹塔当前可学习的丹方
      towerRefreshMonth: null, // 丹塔刷新月份
    };
  }
  if (!player.alchemy.learning) player.alchemy.learning = {};
  if (!player.alchemy.towerRecipes) player.alchemy.towerRecipes = [];
  return player.alchemy;
}

// 刷新丹塔可学习丹方（每月一次）
function refreshTowerRecipes(player, gameDateText) {
  initAlchemy(player);
  const monthKey = gameDateText;
  if (player.alchemy.towerRefreshMonth === monthKey) return player.alchemy.towerRecipes;

  // 随机选择3-5个未学会的丹方
  const unlearned = RECIPES.filter(r => !player.alchemy.recipes.includes(r.id));
  const shuffled = unlearned.sort(() => Math.random() - 0.5);
  player.alchemy.towerRecipes = shuffled.slice(0, Math.min(5, shuffled.length)).map(r => r.id);
  player.alchemy.towerRefreshMonth = monthKey;
  return player.alchemy.towerRecipes;
}

// 研读丹方（增加学习进度）
function studyRecipe(player, recipeId) {
  initAlchemy(player);
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, msg: '丹方不存在' };
  if (player.alchemy.recipes.includes(recipeId)) return { success: false, msg: '已学会该丹方' };

  // 检查是否在丹塔可学习列表中
  if (!player.alchemy.towerRecipes.includes(recipeId)) {
    return { success: false, msg: '该丹方不在藏经阁当前可学习列表中' };
  }

  // 增加进度（悟性影响）
  const progressGain = Math.floor(10 + player.attributes.enlightenment * 0.5 + randInt(0, 10));
  if (!player.alchemy.learning[recipeId]) player.alchemy.learning[recipeId] = 0;
  player.alchemy.learning[recipeId] += progressGain;

  if (player.alchemy.learning[recipeId] >= 100) {
    player.alchemy.recipes.push(recipeId);
    delete player.alchemy.learning[recipeId];
    player.alchemy.towerRecipes = player.alchemy.towerRecipes.filter(id => id !== recipeId);
    return { success: true, msg: `研读成功！学会了${recipe.name}的炼制方法！`, learned: true, progress: 100 };
  }

  return { success: true, msg: `研读${recipe.name}，进度${player.alchemy.learning[recipeId]}%`, learned: false, progress: player.alchemy.learning[recipeId], gain: progressGain };
}

// 获取炼丹等级信息
function getAlchemyLevel(player) {
  initAlchemy(player);
  const lvl = ALCHEMY_LEVELS.find(l => player.alchemy.exp >= l.expNeed) || ALCHEMY_LEVELS[0];
  return lvl;
}

// 获取可炼制的丹方
function getAvailableRecipes(player) {
  initAlchemy(player);
  return RECIPES.filter(r => player.alchemy.recipes.includes(r.id) || r.tier <= player.alchemy.level);
}

// 获取所有丹方（用于学习）
function getAllRecipes() {
  return RECIPES;
}

// 学习丹方
function learnRecipe(player, recipeId) {
  initAlchemy(player);
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, msg: '丹方不存在' };
  if (player.alchemy.recipes.includes(recipeId)) return { success: false, msg: '已学会该丹方' };
  if (recipe.tier > player.alchemy.level + 1) return { success: false, msg: `炼丹等级不足，需要${ALCHEMY_LEVELS[recipe.tier - 1].name}` };

  player.alchemy.recipes.push(recipeId);
  return { success: true, msg: `学会了${recipe.name}的炼制方法！` };
}

// 检查材料是否足够
function checkMaterials(player, recipe) {
  for (const mat of recipe.materials) {
    const item = player.inventory.find(i => i.name === mat.name);
    if (!item || item.count < mat.count) {
      return { enough: false, missing: mat.name, need: mat.count, have: item?.count || 0 };
    }
  }
  return { enough: true };
}

// 炼制丹药
function refinePill(player, recipeId) {
  initAlchemy(player);
  const recipe = RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, msg: '丹方不存在' };
  if (!player.alchemy.recipes.includes(recipeId) && recipe.tier > player.alchemy.level) {
    return { success: false, msg: '未学会该丹方' };
  }

  // 检查材料
  const matCheck = checkMaterials(player, recipe);
  if (!matCheck.enough) {
    return { success: false, msg: `材料不足：${matCheck.missing}（需要${matCheck.need}，拥有${matCheck.have}）` };
  }

  // 消耗材料
  for (const mat of recipe.materials) {
    const item = player.inventory.find(i => i.name === mat.name);
    item.count -= mat.count;
  }

  // 计算成功率
  const alchemyLvl = getAlchemyLevel(player);
  let successRate = 40 + alchemyLvl.successBonus + player.attributes.enlightenment * 0.3;
  successRate -= (recipe.tier - player.alchemy.level) * 15;
  if (player.statusEffects?.some(s => s.name === '聚灵·灵韵')) successRate += 10;
  if (player.inventory?.some(i => i.name === '丹炉')) successRate += 15;
  successRate = clamp(successRate, 5, 95);

  // 增加炼丹经验
  player.alchemy.exp += recipe.exp;

  if (chance(successRate)) {
    // 成功
    const qualityRoll = Math.random() * 100;
    let quality, qualityMultiplier, count;
    if (qualityRoll < 60) { quality = '普通'; qualityMultiplier = 1; count = 1; }
    else if (qualityRoll < 85) { quality = '上品'; qualityMultiplier = 1.5; count = randInt(1, 2); }
    else if (qualityRoll < 97) { quality = '极品'; qualityMultiplier = 2; count = randInt(1, 3); }
    else { quality = '丹纹'; qualityMultiplier = 3; count = randInt(2, 4); }

    const itemName = quality === '普通' ? recipe.result : `${quality}${recipe.result}`;
    const existing = player.inventory.find(i => i.name === itemName);
    const effect = PILL_EFFECTS[recipe.id] || {};
    if (existing) existing.count += count;
    else player.inventory.push({ name: itemName, count, type: 'pill', desc: recipe.desc, price: Math.floor(recipe.basePrice * qualityMultiplier), effect });

    return {
      success: true,
      msg: `炼制成功！获得${count}颗${quality}${recipe.result}！`,
      quality, count, itemName,
    };
  } else {
    // 失败
    return {
      success: false,
      msg: `炼制失败，材料损毁。（成功率${Math.floor(successRate)}%）`,
      exploded: chance(10),
    };
  }
}

// 批量炼制
function refineBatch(player, recipeId, times = 1) {
  const results = [];
  for (let i = 0; i < times; i++) {
    const result = refinePill(player, recipeId);
    results.push(result);
    if (!result.success && result.msg.includes('材料不足')) break;
  }
  return results;
}

module.exports = {
  RECIPES, ALCHEMY_LEVELS,
  initAlchemy, getAlchemyLevel, getAvailableRecipes, getAllRecipes,
  learnRecipe, checkMaterials, refinePill, refineBatch,
  refreshTowerRecipes, studyRecipe,
};
