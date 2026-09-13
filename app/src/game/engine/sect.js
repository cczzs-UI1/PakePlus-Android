// 宗门系统 - 加入、创建、任务、贡献、兑换
const { randInt, chance, randChoice, clamp, genId } = require('./utils');

// 预设宗门
const SECTS = [
  {
    id: 'qingyun', name: '青云剑宗', location: '青云剑宗', type: '剑修',
    desc: '以剑入道的名门正派，弟子众多，剑法超群',
    requirement: { realm: 2, karma: 0 },
    benefits: { expBonus: 1.1, atkBonus: 10 },
    contributionShop: [
      { item: '青锋剑', cost: 500 },
      { item: '筑基丹', cost: 1000 },
      { item: '清心丹', cost: 300 },
      { item: '飞剑', cost: 5000 },
    ],
  },
  {
    id: 'danta', name: '丹塔', location: '丹塔', type: '丹修',
    desc: '天下丹师汇聚之地，丹药之道的圣地',
    requirement: { realm: 2, karma: 0 },
    benefits: { alchemyBonus: 1.2, expBonus: 1.05 },
    contributionShop: [
      { item: '回灵丹', cost: 100 },
      { item: '筑基丹', cost: 800 },
      { item: '金丹', cost: 5000 },
      { item: '丹炉', cost: 3000 },
    ],
  },
  {
    id: 'tianxing', name: '天星阁', location: '天星阁', type: '符修',
    desc: '观测星象，炼制符箓的神秘门派',
    requirement: { realm: 3, karma: 0 },
    benefits: { talismanBonus: 1.2, expBonus: 1.05 },
    contributionShop: [
      { item: '火球符', cost: 50 },
            { item: '困敌符', cost: 150 },
    ],
  },
  {
    id: 'wanshou', name: '万兽门', location: '兽灵山', type: '兽修',
    desc: '驾驭妖兽，与灵宠共修的独特门派',
    requirement: { realm: 2, karma: -20 },
    benefits: { petBonus: 1.3, expBonus: 1.05 },
    contributionShop: [
      { item: '捕兽网', cost: 100 },
      { item: '灵兽袋', cost: 500 },
      { item: '妖丹', cost: 200 },
      { item: '驯兽鞭', cost: 800 },
    ],
  },
  {
    id: 'hehuan', name: '合欢宗', location: '明月台', type: '双修',
    desc: '以双修入道的门派，采阴补阳，采阳补阴',
    requirement: { realm: 3, karma: -10 },
    benefits: { dualCultivateBonus: 1.5, expBonus: 1.1 },
    contributionShop: [
      { item: '送子丹', cost: 3000 },
      { item: '增阳丹', cost: 500 },
      { item: '合欢散', cost: 200 },
      { item: '美颜丹', cost: 800 },
    ],
  },
  {
    id: 'mo', name: '血煞魔宗', location: '万妖山脉', type: '魔修',
    desc: '以杀证道的魔道大宗，行事狠辣',
    requirement: { realm: 3, karma: -50 },
    benefits: { atkBonus: 20, expBonus: 1.2 },
    contributionShop: [
      { item: '血煞丹', cost: 500 },
      { item: '魔功秘籍', cost: 3000 },
      { item: '血芙蓉', cost: 1000 },
      { item: '噬魂幡', cost: 8000 },
    ],
  },
];

// 宗门职位
const SECT_POSITIONS = [
  { position: '外门弟子', minContribution: 0, benefits: { expBonus: 1.0 } },
  { position: '内门弟子', minContribution: 500, benefits: { expBonus: 1.1 } },
  { position: '核心弟子', minContribution: 2000, benefits: { expBonus: 1.2 } },
  { position: '执事', minContribution: 5000, benefits: { expBonus: 1.3 } },
  { position: '长老', minContribution: 15000, benefits: { expBonus: 1.5 } },
  { position: '副掌门', minContribution: 40000, benefits: { expBonus: 1.7 } },
  { position: '掌门', minContribution: 100000, benefits: { expBonus: 2.0 } },
];

// 宗门任务
const SECT_QUESTS = [
  { id: 'sect_01', title: '巡逻山门', desc: '在宗门周围巡逻，防范外敌', contribution: 50, exp: 200, type: 'patrol' },
  { id: 'sect_02', title: '采集灵药', desc: '为宗门采集10株灵药', contribution: 80, exp: 300, type: 'collect', item: '灵草', count: 10 },
  { id: 'sect_03', title: '讨伐妖兽', desc: '讨伐3头危害宗门的妖兽', contribution: 100, exp: 500, type: 'kill', target: '妖兽', count: 3 },
  { id: 'sect_04', title: '护送物资', desc: '护送宗门物资到指定地点', contribution: 120, exp: 400, type: 'escort' },
  { id: 'sect_05', title: '宗门比武', desc: '参加宗门比武，取得好名次', contribution: 150, exp: 600, type: 'duel' },
  { id: 'sect_06', title: '清理矿脉', desc: '清理宗门矿脉中的妖兽', contribution: 100, exp: 350, type: 'explore', location: '裂风峡谷' },
  { id: 'sect_07', title: '丹堂帮忙', desc: '去丹堂帮忙炼制丹药', contribution: 80, exp: 250, type: 'alchemy' },
  { id: 'sect_08', title: '符堂帮忙', desc: '去符堂帮忙绘制符箓', contribution: 80, exp: 250, type: 'talisman' },
  { id: 'sect_09', title: '外出历练', desc: '外出历练一年，增长见闻', contribution: 200, exp: 1000, type: 'travel' },
  { id: 'sect_10', title: '刺杀任务', desc: '刺杀宗门的敌人（魔道专属）', contribution: 300, exp: 800, type: 'assassinate', karma: -30 },
];

// 初始化宗门状态
function initSect(player) {
  if (!player.sect) {
    player.sect = {
      id: null, name: null, position: null,
      contribution: 0, totalContribution: 0,
      joinedAt: null,
      dailyQuests: [],
      dailyQuestDate: null,
    };
  }
  return player.sect;
}

// 加入宗门
function joinSect(player, sectId) {
  initSect(player);
  if (player.sect.id) return { success: false, msg: '你已加入宗门' };

  const sect = SECTS.find(s => s.id === sectId);
  if (!sect) return { success: false, msg: '宗门不存在' };

  // 检查条件
  if (player.realmLevel < sect.requirement.realm) {
    return { success: false, msg: `境界不足，需要${sect.requirement.realm}阶以上` };
  }
  const karma = player.karma.merit - player.karma.sin;
  if (sect.requirement.karma > 0 && karma < sect.requirement.karma) {
    return { success: false, msg: '功德不足，无法加入此正派' };
  }
  if (sect.requirement.karma < 0 && karma > sect.requirement.karma) {
    return { success: false, msg: '你不够邪恶，无法加入此魔道' };
  }

  player.sect = {
    id: sect.id, name: sect.name, position: '外门弟子',
    contribution: 0, totalContribution: 0,
    joinedAt: new Date().toISOString(),
    dailyQuests: [], dailyQuestDate: null,
  };
  player.faction = sect.name;
  return { success: true, msg: `你加入了${sect.name}，成为外门弟子！` };
}

// 退出宗门
function leaveSect(player) {
  initSect(player);
  if (!player.sect.id) return { success: false, msg: '你还没有加入宗门' };
  const name = player.sect.name;
  player.sect = { id: null, name: null, position: null, contribution: 0, totalContribution: 0, joinedAt: null, dailyQuests: [], dailyQuestDate: null };
  player.faction = '散修';
  return { success: true, msg: `你退出了${name}，贡献清零。` };
}

// 获取宗门信息
function getSectInfo(player) {
  initSect(player);
  if (!player.sect.id) return null;
  const sect = SECTS.find(s => s.id === player.sect.id);
  const position = SECT_POSITIONS.find(p => player.sect.totalContribution >= p.minContribution) || SECT_POSITIONS[0];
  // 更新职位
  if (player.sect.position !== position.position) {
    player.sect.position = position.position;
  }
  return { ...player.sect, sectInfo: sect, positionInfo: position };
}

// 获取所有宗门列表
function getAllSects() {
  return SECTS;
}

// 获取日常宗门任务
function getDailySectQuests(player) {
  initSect(player);
  if (!player.sect.id) return [];
  const today = new Date().toDateString();
  if (player.sect.dailyQuestDate !== today) {
    player.sect.dailyQuestDate = today;
    // 随机3个任务
    const shuffled = [...SECT_QUESTS].sort(() => Math.random() - 0.5);
    player.sect.dailyQuests = shuffled.slice(0, 3).map(q => ({ ...q, completed: false, progress: 0 }));
  }
  return player.sect.dailyQuests;
}

// 完成宗门任务
function completeSectQuest(player, questId) {
  initSect(player);
  const quest = player.sect.dailyQuests.find(q => q.id === questId);
  if (!quest) return { success: false, msg: '任务不存在' };
  if (quest.completed) return { success: false, msg: '任务已完成' };

  quest.completed = true;
  player.sect.contribution += quest.contribution;
  player.sect.totalContribution += quest.contribution;
  player.cultivationExp += quest.exp;
  if (quest.karma) {
    if (quest.karma > 0) player.karma.merit += quest.karma;
    else player.karma.sin -= quest.karma;
  }

  // 检查职位晋升
  const newPosition = SECT_POSITIONS.find(p => player.sect.totalContribution >= p.minContribution);
  if (newPosition && player.sect.position !== newPosition.position) {
    const oldPos = player.sect.position;
    player.sect.position = newPosition.position;
    return { success: true, msg: `完成任务！贡献+${quest.contribution}，修为+${quest.exp}。职位晋升：${oldPos}→${newPosition.position}！` };
  }

  return { success: true, msg: `完成任务！贡献+${quest.contribution}，修为+${quest.exp}` };
}

// 贡献兑换
function exchangeContribution(player, itemName) {
  initSect(player);
  if (!player.sect.id) return { success: false, msg: '你还没有加入宗门' };
  const sect = SECTS.find(s => s.id === player.sect.id);
  const shopItem = sect.contributionShop.find(i => i.item === itemName);
  if (!shopItem) return { success: false, msg: '该物品不在兑换列表中' };
  if (player.sect.contribution < shopItem.cost) return { success: false, msg: `贡献不足，需要${shopItem.cost}贡献` };

  player.sect.contribution -= shopItem.cost;
  const existing = player.inventory.find(i => i.name === itemName);
  if (existing) existing.count++;
  else player.inventory.push({ name: itemName, count: 1 });
  return { success: true, msg: `兑换成功！消耗${shopItem.cost}贡献，获得${itemName}` };
}

// 创建宗门
function createSect(player, name, type) {
  initSect(player);
  if (player.sect.id) return { success: false, msg: '你已加入宗门，请先退出' };
  if (player.realmLevel < 5) return { success: false, msg: '需要元婴境以上才能创建宗门' };
  if (player.spiritStone < 100000) return { success: false, msg: '创建宗门需要10万灵石' };

  player.spiritStone -= 100000;
  const newSect = {
    id: 'custom_' + genId(),
    name, type, location: player.location,
    desc: `${name}是由${player.name}创建的宗门`,
    requirement: { realm: 1, karma: 0 },
    benefits: { expBonus: 1.1 },
    contributionShop: [{ item: '回灵丹', cost: 100 }],
    isCustom: true, founder: player.id,
  };
  SECTS.push(newSect);
  player.sect = {
    id: newSect.id, name, position: '掌门',
    contribution: 0, totalContribution: 100000,
    joinedAt: new Date().toISOString(),
    dailyQuests: [], dailyQuestDate: null,
  };
  player.faction = name;
  return { success: true, msg: `你创建了${name}，成为开山掌门！` };
}

module.exports = {
  SECTS, SECT_POSITIONS, SECT_QUESTS,
  initSect, joinSect, leaveSect, getSectInfo, getAllSects,
  getDailySectQuests, completeSectQuest, exchangeContribution, createSect,
};
