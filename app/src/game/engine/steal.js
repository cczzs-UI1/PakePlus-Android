// 偷窃系统 - 偷窃等级、升级、概率、剧情库
const { randInt, chance, randChoice, clamp } = require('./utils');

// 偷窃等级定义
const STEAL_LEVELS = [
  { level: 1, name: '新手小偷', expNeed: 0, successBonus: 0, desc: '刚入行的小偷，手法生疏' },
  { level: 2, name: '惯偷', expNeed: 100, successBonus: 5, desc: '有一定经验的小偷' },
  { level: 3, name: '巧手贼', expNeed: 300, successBonus: 10, desc: '手法灵巧的窃贼' },
  { level: 4, name: '飞贼', expNeed: 600, successBonus: 15, desc: '来去如风的飞贼' },
  { level: 5, name: '神偷', expNeed: 1000, successBonus: 20, desc: '出神入化的神偷' },
  { level: 6, name: '盗圣', expNeed: 2000, successBonus: 25, desc: '传说中的盗圣' },
  { level: 7, name: '空空儿', expNeed: 4000, successBonus: 30, desc: '空空如也，万物可取' },
  { level: 8, name: '盗中仙', expNeed: 8000, successBonus: 35, desc: '盗中之仙，神鬼莫测' },
];

// 初始化偷窃属性
function initSteal(npc) {
  if (!npc.steal) {
    npc.steal = {
      level: 1,
      exp: 0,
      totalThefts: 0,
      successfulThefts: 0,
      caughtCount: 0,
    };
  }
  return npc.steal;
}

// 获取偷窃等级信息
function getStealLevel(npc) {
  initSteal(npc);
  const lvl = STEAL_LEVELS.find(l => npc.steal.exp >= l.expNeed) || STEAL_LEVELS[0];
  return lvl;
}

// 检查升级
function checkLevelUp(npc) {
  initSteal(npc);
  const currentLevel = npc.steal.level;
  const newLevel = STEAL_LEVELS.filter(l => npc.steal.exp >= l.expNeed).pop();
  if (newLevel && newLevel.level > currentLevel) {
    npc.steal.level = newLevel.level;
    return { leveledUp: true, newLevel: newLevel.level, newName: newLevel.name };
  }
  return { leveledUp: false };
}

// 计算偷窃成功率
function calcStealSuccessRate(thief, target) {
  initSteal(thief);
  const stealLvl = getStealLevel(thief);

  // 基础成功率
  let successRate = 30 + stealLvl.successBonus;

  // 修为差距影响（目标修为越高越难偷）
  const realmDiff = (target.realmLevel || 0) - (thief.realmLevel || 0);
  successRate -= realmDiff * 5;

  // 身法影响
  successRate += (thief.attributes?.agility || 0) * 0.2;
  successRate -= (target.attributes?.perception || target.attributes?.spirit || 0) * 0.15;

  // 性格影响
  if (thief.personality === '狡猾' || thief.personality === '阴险') successRate += 10;
  if (target.personality === '粗心' || target.personality === '憨厚') successRate += 10;
  if (target.personality === '谨慎' || target.personality === '精明') successRate -= 10;

  // 标签影响
  if (thief.tags?.includes('swift')) successRate += 8;
  if (target.tags?.includes('alert')) successRate -= 8;

  return clamp(successRate, 5, 95);
}

// 偷窃剧情库 - 根据结果、地点、性格生成不同剧情
const stealSuccessEvents = [
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}趁${target.name}不注意，悄悄靠近，手一伸就将${item.name}摸了过来，${target.name}毫无察觉。`,
    journal: `${location}·${thief.name}从${target.name}处偷得${item.name}。`,
    effects: { stealExp: randInt(10, 25), reputation: -3, karma: -5 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}的人群中故意撞了${target.name}一下，顺手牵羊拿走了${item.name}，${target.name}还连说对不起。`,
    journal: `${location}·${thief.name}撞人顺走${target.name}的${item.name}。`,
    effects: { stealExp: randInt(15, 30), reputation: -5, karma: -8 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}趁${target.name}熟睡之际，轻轻翻开了${target.name}的包裹，取走了${item.name}，整个过程悄无声息。`,
    journal: `${location}·${thief.name}趁${target.name}熟睡偷得${item.name}。`,
    effects: { stealExp: randInt(20, 35), reputation: -8, karma: -10 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}用一根细铁丝拨开了${target.name}的房门锁，进去翻找了一番，拿走了${item.name}后扬长而去。`,
    journal: `${location}·${thief.name}入室盗窃${target.name}的${item.name}。`,
    effects: { stealExp: randInt(25, 40), reputation: -10, karma: -15 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}的酒楼中，趁${target.name}喝酒喝得迷迷糊糊，将${item.name}从${target.name}腰间解了下来。`,
    journal: `${location}·${thief.name}趁${target.name}醉酒偷得${item.name}。`,
    effects: { stealExp: randInt(15, 25), reputation: -5, karma: -8 }
  }),
];

const stealFailEvents = [
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}伸手去偷${target.name}的${item.name}，却被${target.name}一把抓住了手腕，${target.name}怒目而视。`,
    journal: `${location}·${thief.name}偷窃${target.name}被当场抓住。`,
    effects: { stealExp: randInt(5, 10), reputation: -15, hp: -randInt(10, 30), karma: -10 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}刚碰到${target.name}的${item.name}，${target.name}就转过身来，${thief.name}只好假装问路，尴尬地退开了。`,
    journal: `${location}·${thief.name}偷窃未遂假装问路。`,
    effects: { stealExp: randInt(3, 8), reputation: -5, favor: -10 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}偷窃${target.name}的${item.name}时被发现，${target.name}大声呼喊"抓小偷"，${thief.name}慌忙逃跑，还摔了一跤。`,
    journal: `${location}·${thief.name}偷窃被发现仓皇逃跑。`,
    effects: { stealExp: randInt(5, 15), reputation: -20, hp: -randInt(15, 40), karma: -15 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}行窃时被${target.name}的护卫发现，双方大打出手，${thief.name}虽然逃脱了，但也受了伤。`,
    journal: `${location}·${thief.name}行窃被护卫打伤逃脱。`,
    effects: { stealExp: randInt(10, 20), reputation: -25, hp: -randInt(30, 60), karma: -20 }
  }),
];

const stealCaughtEvents = [
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}偷窃${target.name}的${item.name}被当场抓住，${target.name}将${thief.name}痛打了一顿，还报了官。`,
    journal: `${location}·${thief.name}偷窃被抓送官。`,
    effects: { stealExp: randInt(5, 10), reputation: -30, hp: -randInt(30, 50), silver: -randInt(50, 200), karma: -20 }
  }),
  (thief, target, location, item) => ({
    text: `${thief.name}在${location}行窃被${target.name}抓住，${target.name}没有报官，而是要求${thief.name}赔偿损失并写下保证书。`,
    journal: `${location}·${thief.name}偷窃被抓私了赔偿。`,
    effects: { stealExp: randInt(5, 10), reputation: -20, silver: -randInt(100, 300), karma: -15 }
  }),
];

// 执行偷窃
function doSteal(thief, target, location) {
  initSteal(thief);

  // 获取目标库房物品（NPC用warehouse.items，玩家用inventory）
  const targetInventory = target.warehouse?.items || target.inventory || [];
  const stealableItems = targetInventory.filter(i => i.count > 0 && i.name !== '银两' && i.name !== '灵石');

  if (stealableItems.length === 0) {
    return {
      success: false,
      msg: `${target.name}的库房空空如也，没有什么可偷的。`,
      event: null
    };
  }

  // 随机选择一个物品
  const item = randChoice(stealableItems);
  const stealCount = Math.min(item.count, randInt(1, Math.max(1, Math.floor(item.count / 2))));

  // 计算成功率
  const successRate = calcStealSuccessRate(thief, target);
  const success = chance(successRate);

  thief.steal.totalThefts++;

  let event;
  if (success) {
    // 偷窃成功
    thief.steal.successfulThefts++;
    thief.steal.exp += randInt(10, 30);

    // 转移物品
    item.count -= stealCount;
    // 小偷的物品存储（玩家用inventory，NPC用warehouse.items）
    const thiefInventory = thief.inventory || (thief.warehouse?.items) || [];
    if (!thief.inventory && thief.warehouse) {
      if (!thief.warehouse.items) thief.warehouse.items = [];
    }
    const thiefInv = thief.inventory || thief.warehouse.items;
    const existing = thiefInv.find(i => i.name === item.name);
    if (existing) existing.count += stealCount;
    else thiefInv.push({ ...item, count: stealCount });

    const eventFn = randChoice(stealSuccessEvents);
    event = eventFn(thief, target, location, { ...item, count: stealCount });
  } else {
    // 偷窃失败 - 不得物品，扣好感
    thief.steal.caughtCount++;
    thief.steal.exp += randInt(3, 10);

    // 扣除目标对小偷的好感
    if (target.favorWithPlayer !== undefined && thief.isPlayer) {
      target.favorWithPlayer = Math.max(-100, target.favorWithPlayer - randInt(10, 30));
    }
    // NPC之间的好感
    if (target.relations && thief.id) {
      if (!target.relations[thief.id]) target.relations[thief.id] = { favor: 0 };
      target.relations[thief.id].favor = Math.max(-100, (target.relations[thief.id].favor || 0) - randInt(10, 30));
    }

    // 20%概率被抓住
    if (chance(20)) {
      const eventFn = randChoice(stealCaughtEvents);
      event = eventFn(thief, target, location, item);
    } else {
      const eventFn = randChoice(stealFailEvents);
      event = eventFn(thief, target, location, item);
    }
    event.text += ` ${target.name}对你的好感下降了。`;
  }

  // 检查升级
  const levelResult = checkLevelUp(thief);
  if (levelResult.leveledUp) {
    event.text += `\n${thief.name}的偷窃技艺提升了！现为【${levelResult.newName}】。`;
    event.journal += `偷窃等级提升至${levelResult.newName}。`;
  }

  // 应用效果
  if (event.effects) {
    if (event.effects.hp) { if (!thief.hp || typeof thief.hp === 'number' || isNaN(thief.hp)) { const v = typeof thief.hp === 'number' && !isNaN(thief.hp) ? thief.hp : 100; thief.hp = { current: v, max: v }; } thief.hp.current = Math.max(1, thief.hp.current + event.effects.hp); }
    if (event.effects.silver) thief.silver = Math.max(0, (thief.silver || 0) + event.effects.silver);
    if (event.effects.reputation) thief.reputation = (thief.reputation || 0) + event.effects.reputation;
    if (event.effects.karma) thief.karma = (thief.karma || 0) + event.effects.karma;
    if (event.effects.favor && target.favorWithPlayer !== undefined) {
      // NPC之间的好感度
    }
  }

  // 记录记事
  if (!thief.personalHistory) thief.personalHistory = [];
  thief.personalHistory.push(`${require('../engine/timeSystem').getGameDateText ? '' : ''}${location}·${event.journal}`);

  return {
    success,
    msg: event.text,
    event,
    item: success ? { ...item, count: stealCount } : null,
    successRate
  };
}

// NPC自动偷窃判定
function npcAutoSteal(npc, allNpcs, location) {
  initSteal(npc);

  // 根据性格决定偷窃概率
  let stealChance = 5; // 基础5%
  if (npc.personality === '狡猾' || npc.personality === '阴险' || npc.personality === '贪婪') stealChance = 15;
  if (npc.personality === '正直' || npc.personality === '仁善') stealChance = 1;
  if (npc.tags?.includes('kleptomaniac')) stealChance = 30;

  if (!chance(stealChance)) return null;

  // 选择目标（同地点的其他NPC）
  const targets = allNpcs.filter(n =>
    n.id !== npc.id &&
    n.isAlive &&
    n.location === location &&
    (n.inventory || []).some(i => i.count > 0)
  );

  if (targets.length === 0) return null;

  const target = randChoice(targets);
  return doSteal(npc, target, location);
}

module.exports = {
  STEAL_LEVELS,
  initSteal,
  getStealLevel,
  checkLevelUp,
  calcStealSuccessRate,
  doSteal,
  npcAutoSteal,
};
