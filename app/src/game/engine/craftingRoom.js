// 炼制房间系统 - 炼丹房/炼器房/制阵房
const { randInt, randChoice, chance } = require('./utils');
const { RECIPES } = require('./alchemy');
const { LEARN_FORGE_RECIPES, LEARN_FORMATIONS } = require('./learning');
const { canCraft, consumeToolUse, initCraftingTools } = require('./craftingTools');

// 获取可炼制列表
function getCraftableList(player, craftType) {
  initCraftingTools(player);
  const tool = player.craftingTools?.[craftType === 'alchemy' ? 'furnace' : craftType === 'forge' ? 'forge' : 'formation'];

  let recipes = [];
  if (craftType === 'alchemy') {
    // 炼丹使用alchemy.js的丹方
    const learnedIds = player.alchemy?.recipes || [];
    recipes = RECIPES.filter(r => learnedIds.includes(r.id)).map(r => ({
      id: r.id,
      name: r.name,
      tier: r.tier,
      materials: r.materials,
      result: r.result,
      desc: r.desc,
    }));
  } else if (craftType === 'forge') {
    // 炼器使用learning.js的器方
    const learned = player.learning?.forge || {};
    recipes = LEARN_FORGE_RECIPES.filter(r => learned[r.id]?.learned).map(r => ({
      id: r.id,
      name: r.name,
      tier: r.level,
      materials: r.materials.map(m => ({ name: m, count: 1 })),
      result: r.name,
      desc: r.desc,
    }));
  } else if (craftType === 'formation') {
    // 制阵使用learning.js的阵法
    const learned = player.learning?.formation || {};
    recipes = LEARN_FORMATIONS.filter(r => learned[r.id]?.learned).map(r => ({
      id: r.id,
      name: r.name,
      tier: r.level,
      materials: r.materials.map(m => ({ name: m, count: 1 })),
      result: r.name + '阵盘',
      desc: r.desc,
    }));
  }

  return { recipes, currentTool: tool };
}

// 检查材料是否足够
function checkCraftMaterials(player, recipe) {
  const inventory = player.inventory || {};
  for (const mat of recipe.materials) {
    const have = inventory[mat.name] || 0;
    if (have < mat.count) {
      return { success: false, msg: `材料不足：需要${mat.count}个${mat.name}，只有${have}个` };
    }
  }
  return { success: true };
}

// 扣除材料
function consumeMaterials(player, recipe) {
  for (const mat of recipe.materials) {
    player.inventory[mat.name] = (player.inventory[mat.name] || 0) - mat.count;
    if (player.inventory[mat.name] <= 0) delete player.inventory[mat.name];
  }
}

// 炼制
function craft(player, craftType, recipeId) {
  initCraftingTools(player);
  const toolType = craftType === 'alchemy' ? 'furnace' : craftType === 'forge' ? 'forge' : 'formation';
  const { recipes } = getCraftableList(player, craftType);
  const recipe = recipes.find(r => r.id === recipeId);

  if (!recipe) return { success: false, msg: '未学会该配方或配方不存在' };

  // 检查工具
  const toolCheck = canCraft(player, toolType, recipe.tier);
  if (!toolCheck.success) return toolCheck;

  // 检查材料
  const matCheck = checkCraftMaterials(player, recipe);
  if (!matCheck.success) return matCheck;

  // 扣除材料
  consumeMaterials(player, recipe);

  // 消耗工具使用次数
  const toolResult = consumeToolUse(player, toolType);

  // 计算成功率
  const skillLevel = craftType === 'alchemy' ? (player.alchemy?.level || 1) :
                     craftType === 'forge' ? (player.forge?.level || 1) :
                     (player.formation?.level || 1);
  const baseSuccess = 50 + skillLevel * 5;
  const roomBonus = 10; // 房间加成
  const successRate = Math.min(95, baseSuccess + roomBonus);

  if (chance(successRate)) {
    // 成功
    const itemName = recipe.result;
    player.inventory[itemName] = (player.inventory[itemName] || 0) + 1;

    // 增加经验
    if (craftType === 'alchemy') {
      player.alchemy.exp = (player.alchemy.exp || 0) + recipe.tier * 20;
    } else if (craftType === 'forge') {
      if (!player.forge) player.forge = { level: 1, exp: 0 };
      player.forge.exp = (player.forge.exp || 0) + recipe.tier * 20;
    } else {
      if (!player.formation) player.formation = { level: 1, exp: 0, learned: [], active: null };
      player.formation.exp = (player.formation.exp || 0) + recipe.tier * 20;
    }

    let msg = `炼制成功！获得了【${itemName}】！`;
    if (toolResult.broken) msg += `\n${toolResult.msg}`;

    return { success: true, msg, item: itemName, toolBroken: toolResult.broken };
  } else {
    // 失败
    let msg = `炼制失败，材料损毁了。`;
    if (toolResult.broken) msg += `\n${toolResult.msg}`;
    return { success: false, msg, toolBroken: toolResult.broken };
  }
}

module.exports = {
  getCraftableList,
  checkCraftMaterials,
  craft,
};
