// 珍宝阁系统 - 贡献值兑换秘宝 / 盗取藏宝阁
const { randInt, randChoice, chance, clamp } = require('./utils');

// 秘宝池定义（每月随机抽取20个展示）
const TREASURE_POOL = [
  { key: 'waist', name: '腰牌', category: 'special', desc: '皇宫通行腰牌，可入御花园。', cost: 50, itemName: '腰牌', count: 1 },
  // 随机武器
  { key: 'weapon_iron', name: '随机武器·凡', category: 'weapon', desc: '铁剑/钢刀/长枪/弓箭 之一', cost: 25, pool: ['铁剑', '钢刀', '长枪', '弓箭'] },
  { key: 'weapon_ling', name: '随机武器·灵', category: 'weapon', desc: '青锋剑/飞剑/拂尘/玉如意 之一', cost: 60, pool: ['青锋剑', '飞剑', '拂尘', '玉如意'] },
  { key: 'weapon_bao', name: '随机武器·宝', category: 'weapon', desc: '芭蕉扇/碎星锤 之一', cost: 150, pool: ['芭蕉扇', '碎星锤'] },
  // 随机丹药
  { key: 'pill_basic', name: '随机丹药·凡', category: 'pill', desc: '回灵丹/回春丹/解毒丹 之一', cost: 10, pool: ['回灵丹', '回春丹', '解毒丹'] },
  { key: 'pill_ling', name: '随机丹药·灵', category: 'pill', desc: '清心丹/聚气丹 之一', cost: 30, pool: ['清心丹', '聚气丹'] },
  { key: 'pill_break', name: '随机丹药·突破', category: 'pill', desc: '筑基丹 1枚', cost: 50, itemName: '筑基丹', count: 1 },
  // 器炉 / 丹炉
  { key: 'qi_lu1', name: '凡品器炉', category: 'furnace', desc: '可炼制凡品武器饰品', cost: 40, itemName: '凡品器炉', count: 1 },
  { key: 'qi_lu2', name: '良品器炉', category: 'furnace', desc: '可炼制良品及以下物品', cost: 100, itemName: '良品器炉', count: 1 },
  { key: 'dan_lu1', name: '凡品丹炉', category: 'furnace', desc: '可炼制凡品丹药', cost: 40, itemName: '凡品丹炉', count: 1 },
  { key: 'dan_lu2', name: '良品丹炉', category: 'furnace', desc: '可炼制良品及以下丹药', cost: 100, itemName: '良品丹炉', count: 1 },
];

// 转月时刷新当月秘宝（每月随机20个，可有重复）
function refreshTreasure(state) {
  const p = state.player;
  if (!p.treasureMonth || p.treasureMonth !== `${state.gameDate.year}-${state.gameDate.month}`) {
    const picks = [];
    for (let i = 0; i < 20; i++) {
      const t = randChoice(TREASURE_POOL);
      picks.push({ id: `tb_${i}_${Date.now()}`, ...t });
    }
    p.treasureGoods = picks;
    p.treasureMonth = `${state.gameDate.year}-${state.gameDate.month}`;
  }
  return p.treasureGoods || [];
}

// 获取当月秘宝列表
function getTreasureGoods(state) {
  refreshTreasure(state);
  return {
    contribution: state.player.contribution || 0,
    goods: (state.player.treasureGoods || []).map(g => ({ id: g.id, name: g.name, category: g.category, desc: g.desc, cost: g.cost })),
  };
}

// 兑换秘宝：扣除贡献，物品接入背包
function exchangeTreasure(state, goodsId) {
  const p = state.player;
  refreshTreasure(state);
  const goods = (p.treasureGoods || []).find(g => g.id === goodsId);
  if (!goods) return { error: '没有这件秘宝' };
  if ((p.contribution || 0) < goods.cost) return { error: `贡献不足，需要${goods.cost}点贡献（当前${p.contribution || 0}点）` };

  p.contribution -= goods.cost;
  let itemName = goods.itemName;
  let count = goods.count || 1;
  if (goods.pool) {
    itemName = randChoice(goods.pool);
  }
  const existing = (p.inventory || []).find(it => it.name === itemName);
  if (existing) existing.count += count;
  else p.inventory.push({ name: itemName, count });

  return {
    success: true,
    msg: `你以${goods.cost}点贡献兑换了【${itemName}】×${count}，已放入背包。`,
    itemName,
    count,
  };
}

// 盗取藏宝阁：按偷窃属性概率成功/失败，失败扣声望与罚款
function stealTreasure(state) {
  const p = state.player;
  refreshTreasure(state);
  const goods = (p.treasureGoods || []).filter(g => g.cost > 0);
  if (goods.length === 0) return { error: '藏宝阁中暂无可盗之物' };

  // 偷窃属性：偷窃等级 + 身法 + 运气
  const stealLevel = p.steal?.level || 1;
  const dexterity = p.attributes?.dexterity || 0;
  const luck = p.attributes?.luck || 0;
  const successRate = clamp(15 + stealLevel * 5 + dexterity * 0.3 + luck * 0.3, 10, 85);

  if (chance(successRate)) {
    const target = randChoice(goods);
    const itemName = target.pool ? randChoice(target.pool) : (target.itemName || target.name);
    const existing = (p.inventory || []).find(it => it.name === itemName);
    if (existing) existing.count += 1;
    else p.inventory.push({ name: itemName, count: 1 });
    return {
      success: true,
      msg: `你趁守卫不备，成功盗取了【${itemName}】！`,
      itemName,
      successRate: Math.round(successRate),
    };
  }

  // 失败：扣声望 + 罚款
  const reputationLoss = randInt(10, 30);
  const fine = randInt(50, 200);
  p.reputation = Math.max(0, (p.reputation || 0) - reputationLoss);
  p.silver = Math.max(0, (p.silver || 0) - fine);
  if (p.karma) p.karma.sin = (p.karma.sin || 0) + 5;
  return {
    success: false,
    msg: `你被藏宝阁守卫发现！逃跑途中损失声望${reputationLoss}，并被罚款${fine}银两。`,
    reputationLoss,
    fine,
    successRate: Math.round(successRate),
  };
}

module.exports = {
  TREASURE_POOL,
  getTreasureGoods,
  exchangeTreasure,
  stealTreasure,
};
