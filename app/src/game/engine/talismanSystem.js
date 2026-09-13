// 符箓系统 - 阵法师协会：学习、制作（制符熟练度）、符箓商店
const { randInt, chance, randChoice, clamp, genId } = require('./utils');
const { ITEMS } = require('../data/items');

// 符箓大全（按品级：凡/灵/宝/仙）
const TALISMANS = [
  // 凡品
  { id: 'huoqiu', name: '火球符', tier: '凡', type: '攻击', learnCost: 100, materials: [{ name: '朱砂', count: 1 }, { name: '灵草', count: 1 }], basePrice: 50, exp: 30, desc: '掷出火球，造成火焰伤害', effect: { fireDamage: 30 } },
  { id: 'bingzhui', name: '冰锥符', tier: '凡', type: '攻击', learnCost: 100, materials: [{ name: '朱砂', count: 1 }, { name: '月华露', count: 1 }], basePrice: 50, exp: 30, desc: '射出冰锥，造成冰霜伤害', effect: { iceDamage: 25 } },
  { id: 'juli', name: '巨力符', tier: '凡', type: '增益', learnCost: 120, materials: [{ name: '朱砂', count: 1 }, { name: '妖兽骨', count: 1 }], basePrice: 60, exp: 35, desc: '贴符后力大无穷，攻击+30%（3回合）', effect: { atkBuff: 0.3 } },
  { id: 'fengxing', name: '风行符', tier: '凡', type: '增益', learnCost: 120, materials: [{ name: '朱砂', count: 1 }, { name: '灵木', count: 1 }], basePrice: 60, exp: 35, desc: '身轻如燕，移动消耗减半（3回合）', effect: { moveBuff: true } },
  // 灵品
  { id: 'hudun', name: '护盾符', tier: '灵', type: '防御', learnCost: 300, materials: [{ name: '朱砂', count: 2 }, { name: '灵木', count: 2 }], basePrice: 150, exp: 60, desc: '展开灵力护盾，抵挡一次伤害', effect: { shield: 50 } },
  { id: 'kundi', name: '困敌符', tier: '灵', type: '控制', learnCost: 350, materials: [{ name: '朱砂', count: 2 }, { name: '妖兽骨', count: 2 }], basePrice: 180, exp: 65, desc: '束缚敌人，3回合无法行动', effect: { bind: true } },
  // 宝品
  { id: 'huaxing2', name: '化形符', tier: '宝', type: '特殊', learnCost: 5000, materials: [{ name: '朱砂', count: 3 }, { name: '妖丹', count: 3 }, { name: '紫霞参', count: 1 }], basePrice: 2000, exp: 200, desc: '妖族佩戴可化为人形，进入人族城镇', effect: { transform: true, duration: -1 } },
  // 仙品
  { id: 'tianlei', name: '天雷符', tier: '仙', type: '攻击', learnCost: 20000, materials: [{ name: '雷竹', count: 2 }, { name: '朱砂', count: 5 }, { name: '妖丹', count: 3 }], basePrice: 8000, exp: 500, desc: '引动天雷，造成毁灭性伤害', effect: { thunderDamage: 200 } },
];

// 制符等级（需求8：制阵/制符熟练度）
const TALISMAN_LEVELS = [
  { level: 1, name: '制徒', expNeed: 0, successBonus: 0 },
  { level: 2, name: '制符师', expNeed: 300, successBonus: 5 },
  { level: 3, name: '符师', expNeed: 1200, successBonus: 10 },
  { level: 4, name: '大符师', expNeed: 3500, successBonus: 15 },
  { level: 5, name: '符宗', expNeed: 10000, successBonus: 20 },
  { level: 6, name: '符王', expNeed: 30000, successBonus: 25 },
  { level: 7, name: '符圣', expNeed: 80000, successBonus: 30 },
];

// 初始化制符技能
function initTalisman(player) {
  if (!player.talisman) {
    player.talisman = { level: 1, exp: 0, learned: ['huoqiu'] };
  }
  return player.talisman;
}

// 获取制符等级
function getTalismanLevel(player) {
  initTalisman(player);
  return TALISMAN_LEVELS.find(l => player.talisman.exp >= l.expNeed) || TALISMAN_LEVELS[0];
}

// 学习符箓（阵法师协会，付学习费）
function learnTalisman(player, talismanId) {
  initTalisman(player);
  const t = TALISMANS.find(x => x.id === talismanId);
  if (!t) return { success: false, msg: '符箓不存在' };
  if (player.talisman.learned.includes(talismanId)) return { success: false, msg: `已学会${t.name}的绘制之法` };
  const lvl = getTalismanLevel(player);
  const tierIdx = ['凡', '灵', '宝', '仙'].indexOf(t.tier);
  const needLvl = tierIdx + 1;
  if (lvl.level < needLvl) return { success: false, msg: `绘制${t.tier}品符箓需${TALISMAN_LEVELS[needLvl - 1].name}以上（当前${lvl.name}）` };
  if ((player.spiritStone || 0) < t.learnCost) return { success: false, msg: `学习${t.name}需${t.learnCost}灵石` };
  player.spiritStone -= t.learnCost;
  player.talisman.learned.push(talismanId);
  return { success: true, msg: `你学会了绘制${t.name}！`, talisman: t };
}

// 制作符箓（消耗材料，按制符熟练度判定成功率，失败损材）
function craftTalisman(player, talismanId) {
  initTalisman(player);
  const t = TALISMANS.find(x => x.id === talismanId);
  if (!t) return { success: false, msg: '符箓不存在' };
  if (!player.talisman.learned.includes(talismanId)) return { success: false, msg: `你还没学会绘制${t.name}` };
  // 检查材料
  for (const m of t.materials) {
    const item = player.inventory.find(i => i.name === m.name);
    if (!item || item.count < m.count) return { success: false, msg: `材料不足：${m.name}（需要${m.count}，拥有${item?.count || 0}）` };
  }
  // 消耗材料
  for (const m of t.materials) {
    const item = player.inventory.find(i => i.name === m.name);
    item.count -= m.count;
  }
  // 成功率：40 + 等级加成 + 悟性×0.3 - 品级差×15
  const lvl = getTalismanLevel(player);
  const tierIdx = ['凡', '灵', '宝', '仙'].indexOf(t.tier);
  let successRate = 40 + lvl.successBonus + (player.attributes?.enlightenment || 20) * 0.3;
  successRate -= Math.max(0, tierIdx - (lvl.level - 1)) * 15;
  successRate = clamp(successRate, 10, 95);
  player.talisman.exp += t.exp;
  if (chance(successRate)) {
    const existing = player.inventory.find(i => i.name === t.name);
    if (existing) existing.count++;
    else player.inventory.push({ name: t.name, count: 1, type: 'talisman', tier: t.tier, desc: t.desc, effect: t.effect, price: t.basePrice });
    return { success: true, msg: `制符成功！获得【${t.name}】×1（成功率${Math.floor(successRate)}%）` };
  }
  return { success: false, msg: `制符失败，材料损毁。（成功率${Math.floor(successRate)}%）` };
}

// 符箓商店：每月随机20种，浮动价格（阵法师协会）
function getTalismanShop(state) {
  initTalisman(state.player);
  const monthKey = `${state.gameDate.year}-${state.gameDate.month}`;
  if (!state.talismanShop || state.talismanShop.month !== monthKey) {
    const shuffled = [...TALISMANS].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(20, shuffled.length));
    state.talismanShop = {
      month: monthKey,
      goods: picked.map(t => ({
        id: t.id,
        name: t.name,
        tier: t.tier,
        type: t.type,
        desc: t.desc,
        price: Math.max(10, Math.floor(t.basePrice * (0.8 + Math.random() * 0.6))),
        learnCost: t.learnCost,
      })),
    };
  }
  return state.talismanShop.goods;
}

// 商店购买符箓
function buyTalisman(state, player, talismanId) {
  const goods = getTalismanShop(state);
  const g = goods.find(x => x.id === talismanId);
  if (!g) return { success: false, msg: '商店没有这张符箓' };
  if ((player.spiritStone || 0) < g.price) return { success: false, msg: `灵石不足，购买${g.name}需${g.price}灵石` };
  player.spiritStone -= g.price;
  const existing = player.inventory.find(i => i.name === g.name);
  if (existing) existing.count++;
  else player.inventory.push({ name: g.name, count: 1, type: 'talisman', tier: g.tier, desc: g.desc, price: g.price, effect: TALISMANS.find(t => t.id === g.id)?.effect });
  return { success: true, msg: `你在阵法师协会购买了【${g.name}】，花费${g.price}灵石` };
}

module.exports = {
  TALISMANS, TALISMAN_LEVELS,
  initTalisman, getTalismanLevel, learnTalisman, craftTalisman, getTalismanShop, buyTalisman,
};
