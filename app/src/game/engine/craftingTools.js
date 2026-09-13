// 炼制工具系统 - 丹炉/器炉/阵盘
const { randInt, randChoice } = require('./utils');

// 丹炉品级
const FURNACE_TIERS = [
  { tier: 1, name: '凡品丹炉', price: 500, uses: 50, maxRecipeLevel: 1, desc: '最基础的丹炉，只能炼制凡品丹药' },
  { tier: 2, name: '良品丹炉', price: 2000, uses: 100, maxRecipeLevel: 2, desc: '品质不错的丹炉，可炼制良品及以下丹药' },
  { tier: 3, name: '珍品丹炉', price: 8000, uses: 200, maxRecipeLevel: 3, desc: '珍品丹炉，可炼制珍品及以下丹药' },
  { tier: 4, name: '极品丹炉', price: 30000, uses: 500, maxRecipeLevel: 4, desc: '极品丹炉，可炼制极品及以下丹药' },
  { tier: 5, name: '仙品丹炉', price: 100000, uses: 1000, maxRecipeLevel: 6, desc: '仙品丹炉，可炼制仙品及以下丹药' },
  { tier: 6, name: '神品丹炉', price: 500000, uses: 9999, maxRecipeLevel: 8, desc: '传说中的神品丹炉，可炼制所有丹药' },
];

// 器炉品级
const FORGE_TIERS = [
  { tier: 1, name: '凡品器炉', price: 800, uses: 50, maxRecipeLevel: 1, desc: '最基础的器炉，只能炼制凡品武器饰品' },
  { tier: 2, name: '良品器炉', price: 3000, uses: 100, maxRecipeLevel: 2, desc: '品质不错的器炉，可炼制良品及以下物品' },
  { tier: 3, name: '珍品器炉', price: 12000, uses: 200, maxRecipeLevel: 3, desc: '珍品器炉，可炼制珍品及以下物品' },
  { tier: 4, name: '极品器炉', price: 50000, uses: 500, maxRecipeLevel: 4, desc: '极品器炉，可炼制极品及以下物品' },
  { tier: 5, name: '仙品器炉', price: 150000, uses: 1000, maxRecipeLevel: 6, desc: '仙品器炉，可炼制仙品及以下物品' },
  { tier: 6, name: '神品器炉', price: 800000, uses: 9999, maxRecipeLevel: 8, desc: '传说中的神品器炉，可炼制所有物品' },
];

// 阵盘品级
const FORMATION_TIERS = [
  { tier: 1, name: '凡品阵盘', price: 600, uses: 50, maxRecipeLevel: 1, desc: '最基础的阵盘，只能布置凡品阵法' },
  { tier: 2, name: '良品阵盘', price: 2500, uses: 100, maxRecipeLevel: 2, desc: '品质不错的阵盘，可布置良品及以下阵法' },
  { tier: 3, name: '珍品阵盘', price: 10000, uses: 200, maxRecipeLevel: 3, desc: '珍品阵盘，可布置珍品及以下阵法' },
  { tier: 4, name: '极品阵盘', price: 40000, uses: 500, maxRecipeLevel: 4, desc: '极品阵盘，可布置极品及以下阵法' },
  { tier: 5, name: '仙品阵盘', price: 120000, uses: 1000, maxRecipeLevel: 6, desc: '仙品阵盘，可布置仙品及以下阵法' },
  { tier: 6, name: '神品阵盘', price: 600000, uses: 9999, maxRecipeLevel: 8, desc: '传说中的神品阵盘，可布置所有阵法' },
];

// 初始化炼制工具库存
function initCraftingTools(player) {
  if (!player.craftingTools) {
    player.craftingTools = {
      furnace: null, // 当前使用的丹炉 { tier, usesLeft }
      forge: null,   // 当前使用的器炉
      formation: null, // 当前使用的阵盘
      ownedFurnaces: [], // 拥有的丹炉列表
      ownedForges: [],   // 拥有的器炉列表
      ownedFormations: [], // 拥有的阵盘列表
    };
  }
}

// 购买工具
function buyTool(player, toolType, tier) {
  initCraftingTools(player);
  const tiers = toolType === 'furnace' ? FURNACE_TIERS : toolType === 'forge' ? FORGE_TIERS : FORMATION_TIERS;
  const tool = tiers.find(t => t.tier === tier);
  if (!tool) return { success: false, msg: '工具品级不存在' };

  const currency = tier <= 2 ? 'silver' : 'spiritStone';
  const money = player[currency] || 0;
  if (money < tool.price) return { success: false, msg: `${currency === 'silver' ? '银两' : '灵石'}不足` };

  player[currency] -= tool.price;
  const toolInstance = { tier: tool.tier, name: tool.name, usesLeft: tool.uses, maxUses: tool.uses };
  const ownedKey = toolType === 'furnace' ? 'ownedFurnaces' : toolType === 'forge' ? 'ownedForges' : 'ownedFormations';
  player.craftingTools[ownedKey].push(toolInstance);

  return { success: true, msg: `购买了${tool.name}！`, tool: toolInstance };
}

// 选择使用的工具
function selectTool(player, toolType, index) {
  initCraftingTools(player);
  const ownedKey = toolType === 'furnace' ? 'ownedFurnaces' : toolType === 'forge' ? 'ownedForges' : 'ownedFormations';
  const owned = player.craftingTools[ownedKey];
  if (index < 0 || index >= owned.length) return { success: false, msg: '工具不存在' };

  player.craftingTools[toolType] = owned[index];
  return { success: true, msg: `已选择使用${owned[index].name}` };
}

// 检查工具是否可炼制指定品级
function canCraft(player, toolType, recipeLevel) {
  initCraftingTools(player);
  const tool = player.craftingTools[toolType];
  if (!tool) return { success: false, msg: '没有装备炼制工具' };
  if (tool.usesLeft <= 0) return { success: false, msg: '工具使用次数已耗尽' };

  const tiers = toolType === 'furnace' ? FURNACE_TIERS : toolType === 'forge' ? FORGE_TIERS : FORMATION_TIERS;
  const tierInfo = tiers.find(t => t.tier === tool.tier);
  if (recipeLevel > tierInfo.maxRecipeLevel) return { success: false, msg: `${tool.name}只能炼制${tierInfo.maxRecipeLevel}品级及以下的物品` };

  return { success: true };
}

// 消耗工具使用次数
function consumeToolUse(player, toolType) {
  initCraftingTools(player);
  const tool = player.craftingTools[toolType];
  if (!tool) return false;
  tool.usesLeft--;
  if (tool.usesLeft <= 0) {
    // 从拥有列表中移除
    const ownedKey = toolType === 'furnace' ? 'ownedFurnaces' : toolType === 'forge' ? 'ownedForges' : 'ownedFormations';
    const idx = player.craftingTools[ownedKey].findIndex(t => t === tool);
    if (idx >= 0) player.craftingTools[ownedKey].splice(idx, 1);
    player.craftingTools[toolType] = null;
    return { broken: true, msg: `${tool.name}使用次数耗尽，已损坏！` };
  }
  return { broken: false, usesLeft: tool.usesLeft };
}

// 获取工具市场商品（每月随机）
// minTier/maxTier 控制该市场售卖的品级范围：
//   丹炉市场（丹塔）：1-6品级全卖，高品级价格不低
//   器炉坊（自由坊市）：3-6品级（中高品质）
//   铁匠铺：1-2品级（低品级）
function getToolMarketItems(toolType, minTier = 1, maxTier = 4) {
  const tiers = toolType === 'furnace' ? FURNACE_TIERS : toolType === 'forge' ? FORGE_TIERS : FORMATION_TIERS;
  return tiers.filter(t => t.tier >= minTier && t.tier <= maxTier).map(t => ({
    ...t,
    stock: randInt(1, 5),
    currentPrice: Math.floor(t.price * (0.9 + Math.random() * 0.2)), // 价格浮动90%-110%
  }));
}

module.exports = {
  FURNACE_TIERS,
  FORGE_TIERS,
  FORMATION_TIERS,
  initCraftingTools,
  buyTool,
  selectTool,
  canCraft,
  consumeToolUse,
  getToolMarketItems,
};
