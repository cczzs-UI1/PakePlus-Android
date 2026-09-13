// 炼器系统 - 装备打造、强化、附魔
const { randInt, chance, randChoice, clamp } = require('./utils');

// 锻造配方
const FORGE_RECIPES = [
  // 武器
  { id: 'tie_jian', name: '精铁剑', type: '武器', tier: 1, materials: [{ name: '精铁', count: 3 }, { name: '灵木', count: 1 }], baseAtk: 15, baseDef: 0, desc: '精铁打造的剑' },
  { id: 'qingfeng', name: '青锋剑', type: '武器', tier: 2, materials: [{ name: '精铁', count: 5 }, { name: '灵木', count: 2 }, { name: '妖丹', count: 1 }], baseAtk: 35, baseDef: 0, desc: '附带剑气的利剑' },
  { id: 'zidian', name: '紫电剑', type: '武器', tier: 3, materials: [{ name: '雷石', count: 3 }, { name: '精铁', count: 5 }, { name: '妖丹', count: 2 }], baseAtk: 60, baseDef: 0, element: '雷', desc: '雷属性飞剑' },
  { id: 'xuanchong', name: '玄铁重剑', type: '武器', tier: 2, materials: [{ name: '寒铁', count: 5 }, { name: '妖兽骨', count: 2 }], baseAtk: 45, baseDef: 10, desc: '沉重的重剑' },
  { id: 'feijian', name: '飞剑', type: '武器', tier: 4, materials: [{ name: '雷石', count: 5 }, { name: '寒铁', count: 5 }, { name: '妖丹', count: 5 }], baseAtk: 100, baseDef: 0, desc: '可御剑飞行的法宝' },
  // 防具
  { id: 'pijia', name: '皮革甲', type: '防具', tier: 1, materials: [{ name: '妖兽皮', count: 3 }], baseAtk: 0, baseDef: 10, desc: '皮革护甲' },
  { id: 'ruanjia', name: '软猬甲', type: '防具', tier: 3, materials: [{ name: '妖兽皮', count: 5 }, { name: '精铁', count: 3 }, { name: '妖丹', count: 2 }], baseAtk: 5, baseDef: 35, desc: '带反伤的护甲' },
  { id: 'jinsi', name: '金丝软甲', type: '防具', tier: 4, materials: [{ name: '妖兽皮', count: 8 }, { name: '寒铁', count: 5 }, { name: '妖丹', count: 3 }], baseAtk: 0, baseDef: 60, desc: '金丝编织的软甲' },
  // 饰品
  { id: 'yupei', name: '玉佩', type: '饰品', tier: 1, materials: [{ name: '灵木', count: 2 }], baseAtk: 0, baseDef: 5, mpBonus: 50, desc: '增加灵力上限' },
  { id: 'hufu', name: '护身符', type: '饰品', tier: 2, materials: [{ name: '朱砂', count: 3 }, { name: '灵木', count: 2 }], baseAtk: 0, baseDef: 10, special: '抵挡一次致命伤害', desc: '保命护身符' },
  { id: 'jiezhi', name: '储物戒指', type: '饰品', tier: 3, materials: [{ name: '妖丹', count: 3 }, { name: '灵木', count: 5 }], baseAtk: 0, baseDef: 5, special: '大容量储物', desc: '空间戒指' },
  // ===== 补全：items 中的武器/防具/饰品（原无配方）=====
  // 凡人武器
  { id: 'tiejian2', name: '铁剑', type: '武器', tier: 1, materials: [{ name: '精铁', count: 3 }], baseAtk: 8, baseDef: 0, desc: '普通铁剑，凡人武士常用' },
  { id: 'gangdao', name: '钢刀', type: '武器', tier: 1, materials: [{ name: '精铁', count: 4 }, { name: '煤炭', count: 1 }], baseAtk: 10, baseDef: 0, desc: '精钢打造的砍刀' },
  { id: 'changqiang', name: '长枪', type: '武器', tier: 1, materials: [{ name: '精铁', count: 5 }, { name: '灵木', count: 2 }], baseAtk: 12, baseDef: 0, desc: '军中常用的长枪' },
  { id: 'gongjian', name: '弓箭', type: '武器', tier: 1, materials: [{ name: '灵木', count: 3 }, { name: '兽皮', count: 1 }], baseAtk: 9, baseDef: 0, desc: '狩猎用的弓箭' },
  // 凡人防具
  { id: 'piyi2', name: '皮甲', type: '防具', tier: 1, materials: [{ name: '兽皮', count: 3 }], baseAtk: 0, baseDef: 5, desc: '兽皮制成的护甲' },
  { id: 'tiejia2', name: '铁甲', type: '防具', tier: 1, materials: [{ name: '精铁', count: 5 }, { name: '兽皮', count: 2 }], baseAtk: 0, baseDef: 10, desc: '军中制式铁甲' },
  // 修仙武器
  { id: 'suixing', name: '碎星锤', type: '武器', tier: 3, materials: [{ name: '寒铁', count: 4 }, { name: '妖兽骨', count: 3 }, { name: '妖丹', count: 1 }], baseAtk: 55, baseDef: 5, desc: '可碎星辰的重锤' },
  { id: 'wuxinghun', name: '五行混天绫', type: '武器', tier: 3, materials: [{ name: '灵木', count: 5 }, { name: '妖丹', count: 3 }, { name: '月华露', count: 2 }], baseAtk: 45, baseDef: 10, element: '五行', desc: '蕴含五行之力的混天绫' },
  { id: 'fapao', name: '法袍', type: '防具', tier: 2, materials: [{ name: '丝绸', count: 5 }, { name: '灵木', count: 3 }, { name: '月华露', count: 1 }], baseAtk: 5, baseDef: 20, desc: '修士所穿法袍' },
  { id: 'taomu', name: '桃木剑', type: '武器', tier: 2, materials: [{ name: '灵木', count: 5 }, { name: '朱砂', count: 2 }], baseAtk: 25, baseDef: 0, desc: '道士驱邪的桃木剑' },
  { id: 'zhushabi', name: '朱砂笔', type: '武器', tier: 2, materials: [{ name: '灵木', count: 3 }, { name: '朱砂', count: 3 }], baseAtk: 15, baseDef: 5, desc: '制符绘阵用的朱砂笔' },
  { id: 'fuchen', name: '拂尘', type: '武器', tier: 2, materials: [{ name: '灵木', count: 4 }, { name: '丝绸', count: 2 }], baseAtk: 20, baseDef: 8, desc: '道人手中拂尘' },
  { id: 'yuruyi', name: '玉如意', type: '武器', tier: 3, materials: [{ name: '灵木', count: 4 }, { name: '珍珠', count: 2 }, { name: '妖丹', count: 1 }], baseAtk: 35, baseDef: 10, desc: '象征如意的玉器' },
  { id: 'bajiaoshan', name: '芭蕉扇', type: '武器', tier: 4, materials: [{ name: '灵木', count: 5 }, { name: '雷竹', count: 2 }, { name: '妖丹', count: 2 }], baseAtk: 70, baseDef: 0, element: '风', desc: '一扇生风，威力无穷' },
  { id: 'zijinhulu', name: '紫金葫芦', type: '武器', tier: 4, materials: [{ name: '寒铁', count: 3 }, { name: '妖丹', count: 3 }, { name: '雷石', count: 2 }], baseAtk: 60, baseDef: 15, desc: '可收妖摄物的紫金葫芦' },
  { id: 'xuanyuan', name: '轩辕剑', type: '武器', tier: 5, materials: [{ name: '混沌莲', count: 1 }, { name: '万年人参', count: 2 }, { name: '妖丹', count: 10 }, { name: '龙须草', count: 5 }], baseAtk: 180, baseDef: 20, desc: '上古圣道之剑' },
  { id: 'zhuxian2', name: '诛仙剑', type: '武器', tier: 5, materials: [{ name: '混沌莲', count: 2 }, { name: '万年人参', count: 5 }, { name: '妖丹', count: 20 }], baseAtk: 250, baseDef: 0, desc: '诛仙四剑之首' },
  // 修仙防具
  { id: 'buyi', name: '布衣', type: '防具', tier: 1, materials: [{ name: '丝绸', count: 2 }], baseAtk: 0, baseDef: 3, desc: '粗布衣裳' },
  { id: 'daopao', name: '道袍', type: '防具', tier: 2, materials: [{ name: '丝绸', count: 4 }, { name: '灵木', count: 2 }], baseAtk: 0, baseDef: 12, desc: '修道之人所穿道袍' },
  { id: 'jiasha', name: '袈裟', type: '防具', tier: 2, materials: [{ name: '丝绸', count: 6 }, { name: '朱砂', count: 3 }], baseAtk: 0, baseDef: 15, desc: '佛门高僧所披袈裟' },
  { id: 'zhangjia', name: '战甲', type: '防具', tier: 2, materials: [{ name: '精铁', count: 5 }, { name: '兽皮', count: 4 }], baseAtk: 3, baseDef: 25, desc: '战场制式战甲' },
  { id: 'xuanwu', name: '玄武甲', type: '防具', tier: 3, materials: [{ name: '寒铁', count: 5 }, { name: '妖兽骨', count: 4 }, { name: '妖丹', count: 2 }], baseAtk: 0, baseDef: 45, desc: '玄武神兽之甲' },
  { id: 'tiancan', name: '天蚕衣', type: '防具', tier: 4, materials: [{ name: '丝绸', count: 8 }, { name: '月华露', count: 3 }, { name: '冰心莲', count: 1 }], baseAtk: 5, baseDef: 55, desc: '天蚕丝织成的宝衣' },
  { id: 'jiulongpao', name: '九龙袍', type: '防具', tier: 5, materials: [{ name: '丝绸', count: 10 }, { name: '龙须草', count: 3 }, { name: '妖丹', count: 5 }], baseAtk: 10, baseDef: 80, desc: '九龙缠绕的皇袍' },
  // 饰品
  { id: 'yuzan', name: '玉簪', type: '饰品', tier: 1, materials: [{ name: '灵木', count: 2 }, { name: '珍珠', count: 1 }], baseAtk: 0, baseDef: 3, mpBonus: 30, desc: '女子束发玉簪' },
  { id: 'jiezhi2', name: '戒指', type: '饰品', tier: 1, materials: [{ name: '精铁', count: 2 }, { name: '灵木', count: 1 }], baseAtk: 0, baseDef: 2, mpBonus: 20, desc: '普通戒指' },
  { id: 'chuwujie', name: '储物戒', type: '饰品', tier: 3, materials: [{ name: '灵木', count: 4 }, { name: '妖丹', count: 2 }], baseAtk: 0, baseDef: 5, special: '大容量储物', desc: '空间储物戒指' },
  { id: 'najie', name: '纳戒', type: '饰品', tier: 4, materials: [{ name: '灵木', count: 6 }, { name: '妖丹', count: 3 }, { name: '寒铁', count: 2 }], baseAtk: 0, baseDef: 8, special: '超大容量储物', desc: '高阶纳物戒指' },
  { id: 'lingshoudai', name: '灵兽袋', type: '饰品', tier: 2, materials: [{ name: '兽皮', count: 5 }, { name: '妖丹', count: 1 }, { name: '灵木', count: 2 }], baseAtk: 0, baseDef: 3, special: '收纳灵兽', desc: '可收纳灵兽的袋子' },
  { id: 'chuanxun', name: '传讯玉符', type: '饰品', tier: 2, materials: [{ name: '灵木', count: 3 }, { name: '朱砂', count: 3 }, { name: '月华露', count: 1 }], baseAtk: 0, baseDef: 5, special: '千里传讯', desc: '可千里传讯的玉符' },
  { id: 'bishuizhu', name: '避水珠', type: '饰品', tier: 2, materials: [{ name: '珍珠', count: 3 }, { name: '妖丹', count: 1 }], baseAtk: 0, baseDef: 4, special: '避水', desc: '佩戴可避水' },
  { id: 'bihuozhu', name: '避火珠', type: '饰品', tier: 2, materials: [{ name: '雷石', count: 2 }, { name: '妖丹', count: 1 }], baseAtk: 0, baseDef: 4, special: '避火', desc: '佩戴可避火' },
  { id: 'julingzhu', name: '聚灵珠', type: '饰品', tier: 3, materials: [{ name: '妖丹', count: 2 }, { name: '月华露', count: 3 }], baseAtk: 0, baseDef: 5, mpBonus: 150, desc: '聚拢灵气，加快修炼' },
  { id: 'dinghunzhu', name: '定魂珠', type: '饰品', tier: 4, materials: [{ name: '阴魂珠', count: 2 }, { name: '妖丹', count: 3 }], baseAtk: 0, baseDef: 10, special: '定魂安神', desc: '安定魂魄的宝珠' },
  { id: 'hundunzhu', name: '混沌珠', type: '饰品', tier: 5, materials: [{ name: '混沌莲', count: 1 }, { name: '妖丹', count: 10 }, { name: '龙须草', count: 3 }], baseAtk: 10, baseDef: 15, special: '混沌之力', desc: '蕴含混沌之力的至宝' },

];

// 强化等级
const ENHANCE_LEVELS = [
  { level: 0, name: '', atkBonus: 0, defBonus: 0, successRate: 100 },
  { level: 1, name: '+1', atkBonus: 5, defBonus: 3, successRate: 90 },
  { level: 2, name: '+2', atkBonus: 12, defBonus: 7, successRate: 75 },
  { level: 3, name: '+3', atkBonus: 22, defBonus: 13, successRate: 60 },
  { level: 4, name: '+4', atkBonus: 35, defBonus: 20, successRate: 45 },
  { level: 5, name: '+5', atkBonus: 50, defBonus: 30, successRate: 30 },
  { level: 6, name: '+6', atkBonus: 70, defBonus: 42, successRate: 20 },
  { level: 7, name: '+7', atkBonus: 95, defBonus: 55, successRate: 12 },
  { level: 8, name: '+8', atkBonus: 125, defBonus: 70, successRate: 7 },
  { level: 9, name: '+9', atkBonus: 160, defBonus: 90, successRate: 4 },
  { level: 10, name: '+10·神兵', atkBonus: 200, defBonus: 115, successRate: 2 },
];

// 附魔属性
const ELEMENTS = [
  { name: '金', atkBonus: 10, defBonus: 5, color: '#FFD700' },
  { name: '木', atkBonus: 5, defBonus: 10, color: '#32CD32' },
  { name: '水', atkBonus: 7, defBonus: 8, color: '#4169E1' },
  { name: '火', atkBonus: 12, defBonus: 3, color: '#FF4500' },
  { name: '土', atkBonus: 3, defBonus: 12, color: '#8B4513' },
  { name: '雷', atkBonus: 15, defBonus: 0, color: '#9370DB' },
  { name: '冰', atkBonus: 8, defBonus: 7, color: '#00CED1' },
  { name: '风', atkBonus: 10, defBonus: 5, color: '#98FB98' },
];

// 炼器等级
const FORGE_LEVELS = [
  { level: 1, name: '铁匠', expNeed: 0, successBonus: 0 },
  { level: 2, name: '铸师', expNeed: 500, successBonus: 5 },
  { level: 3, name: '大铸师', expNeed: 2000, successBonus: 10 },
  { level: 4, name: '器宗', expNeed: 5000, successBonus: 15 },
  { level: 5, name: '器王', expNeed: 15000, successBonus: 20 },
  { level: 6, name: '器皇', expNeed: 40000, successBonus: 25 },
  { level: 7, name: '器圣', expNeed: 100000, successBonus: 30 },
];

// 初始化炼器技能
function initForge(player) {
  if (!player.forge) {
    player.forge = { level: 1, exp: 0, recipes: ['tie_jian', 'pijia', 'yupei'] };
  }
  return player.forge;
}

// 获取炼器等级
function getForgeLevel(player) {
  initForge(player);
  return FORGE_LEVELS.find(l => player.forge.exp >= l.expNeed) || FORGE_LEVELS[0];
}

// 获取可锻造配方
function getAvailableForgeRecipes(player) {
  initForge(player);
  return FORGE_RECIPES.filter(r => player.forge.recipes.includes(r.id) || r.tier <= player.forge.level);
}

// 学习锻造配方
function learnForgeRecipe(player, recipeId) {
  initForge(player);
  const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, msg: '配方不存在' };
  if (player.forge.recipes.includes(recipeId)) return { success: false, msg: '已学会该配方' };
  player.forge.recipes.push(recipeId);
  return { success: true, msg: `学会了${recipe.name}的锻造方法！` };
}

// 锻造装备
function forgeItem(player, recipeId) {
  initForge(player);
  const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return { success: false, msg: '配方不存在' };

  // 检查材料
  for (const mat of recipe.materials) {
    const item = player.inventory.find(i => i.name === mat.name);
    if (!item || item.count < mat.count) {
      return { success: false, msg: `材料不足：${mat.name}（需要${mat.count}，拥有${item?.count || 0}）` };
    }
  }

  // 消耗材料
  for (const mat of recipe.materials) {
    const item = player.inventory.find(i => i.name === mat.name);
    item.count -= mat.count;
  }

  // 成功率
  const forgeLvl = getForgeLevel(player);
  let successRate = 50 + forgeLvl.successBonus + player.attributes.physique * 0.2;
  successRate -= (recipe.tier - player.forge.level) * 15;
  successRate = clamp(successRate, 10, 95);

  player.forge.exp += recipe.tier * 100;

  if (chance(successRate)) {
    // 品质判定
    const qualityRoll = Math.random() * 100;
    let quality, atkMult, defMult;
    if (qualityRoll < 60) { quality = '普通'; atkMult = 1; defMult = 1; }
    else if (qualityRoll < 85) { quality = '精良'; atkMult = 1.3; defMult = 1.3; }
    else if (qualityRoll < 97) { quality = '极品'; atkMult = 1.6; defMult = 1.6; }
    else { quality = '灵宝'; atkMult = 2; defMult = 2; }

    const equipment = {
      name: `${quality}${recipe.name}`,
      type: recipe.type,
      tier: recipe.tier,
      quality,
      attack: Math.floor(recipe.baseAtk * atkMult),
      defense: Math.floor(recipe.baseDef * defMult),
      enhanceLevel: 0,
      element: recipe.element || null,
      desc: recipe.desc,
      equipped: false,
    };

    player.inventory.push({ ...equipment, count: 1, isEquipment: true });
    return { success: true, msg: `锻造成功！获得${quality}${recipe.name}！`, equipment };
  } else {
    return { success: false, msg: `锻造失败，材料损毁。（成功率${Math.floor(successRate)}%）` };
  }
}

// 强化装备
function enhanceItem(player, itemName) {
  const item = player.inventory.find(i => i.name === itemName && i.isEquipment);
  if (!item) return { success: false, msg: '装备不存在' };
  if (item.enhanceLevel >= 10) return { success: false, msg: '已达最高强化等级' };

  const nextLevel = item.enhanceLevel + 1;
  const enhanceInfo = ENHANCE_LEVELS[nextLevel];
  const cost = (item.tier || 1) * nextLevel * 100;

  if (player.spiritStone < cost) return { success: false, msg: `灵石不足，需要${cost}灵石` };
  player.spiritStone -= cost;

  if (chance(enhanceInfo.successRate)) {
    item.enhanceLevel = nextLevel;
    item.name = item.name.replace(/\+\d+·?\S*/, '').trim() + (nextLevel >= 10 ? '·神兵' : `+${nextLevel}`);
    return { success: true, msg: `强化成功！${item.name}` };
  } else {
    // 失败有概率降级
    if (chance(30) && item.enhanceLevel > 0) {
      item.enhanceLevel--;
      return { success: false, msg: `强化失败，装备降级为+${item.enhanceLevel}` };
    }
    return { success: false, msg: `强化失败（成功率${enhanceInfo.successRate}%）` };
  }
}

// 附魔装备
function enchantItem(player, itemName, elementName) {
  const item = player.inventory.find(i => i.name === itemName && i.isEquipment);
  if (!item) return { success: false, msg: '装备不存在' };
  if (item.element) return { success: false, msg: '装备已有属性' };

  const element = ELEMENTS.find(e => e.name === elementName);
  if (!element) return { success: false, msg: '属性不存在' };

  const cost = 1000;
  if (player.spiritStone < cost) return { success: false, msg: `灵石不足，需要${cost}灵石` };
  player.spiritStone -= cost;

  if (chance(50)) {
    item.element = element.name;
    item.attack += element.atkBonus;
    item.defense += element.defBonus;
    return { success: true, msg: `附魔成功！装备获得${element.name}属性` };
  } else {
    return { success: false, msg: '附魔失败' };
  }
}

// 装备/卸下
function equipItem(player, itemName) {
  const item = player.inventory.find(i => i.name === itemName && i.isEquipment);
  if (!item) return { success: false, msg: '装备不存在' };

  // 卸下同类型装备
  for (const i of player.inventory) {
    if (i.isEquipment && i.type === item.type && i.equipped) {
      i.equipped = false;
    }
  }
  item.equipped = !item.equipped;
  return { success: true, msg: item.equipped ? `已装备${item.name}` : `已卸下${item.name}` };
}

// 获取已装备属性加成
function getEquipBonus(player) {
  let atk = 0, def = 0, mp = 0;
  for (const item of player.inventory) {
    if (item.isEquipment && item.equipped) {
      atk += item.attack || 0;
      def += item.defense || 0;
      mp += item.mpBonus || 0;
    }
  }
  return { atk, def, mp };
}

module.exports = {
  FORGE_RECIPES, ENHANCE_LEVELS, ELEMENTS, FORGE_LEVELS,
  initForge, getForgeLevel, getAvailableForgeRecipes, learnForgeRecipe,
  forgeItem, enhanceItem, enchantItem, equipItem, getEquipBonus,
};
