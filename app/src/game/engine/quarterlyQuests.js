// 季度任务系统 - 50个任务（5个难度各10个），每季度随机8个
// 重新设计：所有任务均基于游戏内真实可完成的动作与真实可获取的物品
// 动作类型白名单：collect(采集/背包提交) travel deliver cultivate explore combat kill(山贼/妖兽) 
//                 interact trade reachRealm(突破) joinFaction(加入势力) alchemy(炼丹) forge(锻造)
//                 work(打工) harvest(灵田收获) fish(钓鱼) buy(商店购买) tame(驯服灵宠)
const { randInt, randChoice, shuffle, matchItemName } = require('./utils');

// 任务难度定义
const QUEST_DIFFICULTIES = {
  1: { name: '简单', minLevel: 1, rewardMultiplier: 1 },
  2: { name: '普通', minLevel: 2, rewardMultiplier: 1.5 },
  3: { name: '困难', minLevel: 3, rewardMultiplier: 2 },
  4: { name: '精英', minLevel: 4, rewardMultiplier: 3 },
  5: { name: '传说', minLevel: 5, rewardMultiplier: 5 },
};

// 50个季度任务（5个难度各10个）——全部为游戏内真实可完成
const QUARTERLY_QUESTS = [
  // ===== 难度1：简单（10个）=====
  {
    id: 'q_easy_01', difficulty: 1, title: '采集草药',
    locationHint: '落日森林（采集区）',
    desc: '镇上的药铺需要一批草药，去落日森林采集区收集10株聚灵草。',
    objectives: [{ type: 'collect', item: '聚灵草', count: 10, desc: '收集聚灵草×10（背包有即可提交）' }],
    rewards: { silver: 100, exp: 200 },
  },
  {
    id: 'q_easy_02', difficulty: 1, title: '送货上门',
    locationHint: '东海渔村',
    desc: '帮铁匠铺将一批铁器送到东海渔村。',
    objectives: [{ type: 'deliver', location: '东海渔村', count: 1, desc: '到东海渔村交付铁器（点击送铁器）' }],
    rewards: { silver: 80, exp: 150 },
  },
  {
    id: 'q_easy_03', difficulty: 1, title: '收集灵草',
    locationHint: '落日森林',
    desc: '采集5株灵草，炼丹铺急需原料。',
    objectives: [{ type: 'collect', item: '灵草', count: 5, desc: '收集灵草×5（背包有即可提交）' }],
    rewards: { silver: 60, exp: 100 },
  },
  {
    id: 'q_easy_04', difficulty: 1, title: '购买丹药',
    locationHint: '丹药铺（大夏皇都/自由坊市）',
    desc: '去丹药铺购买2颗回灵丹。',
    objectives: [{ type: 'buy', item: '回灵丹', count: 2, desc: '购买回灵丹×2（背包有即可提交）' }],
    rewards: { silver: 120, exp: 180 },
  },
  {
    id: 'q_easy_05', difficulty: 1, title: '送信任务',
    locationHint: '大夏皇都',
    desc: '帮驿站将一封信送到大夏皇都。',
    objectives: [{ type: 'travel', location: '大夏皇都', count: 1, desc: '前往大夏皇都' }],
    rewards: { silver: 100, exp: 200 },
  },
  {
    id: 'q_easy_06', difficulty: 1, title: '种植灵谷',
    locationHint: '灵田（自家宅子）',
    desc: '在灵田中种植并收获5份灵谷。',
    objectives: [{ type: 'harvest', item: '灵谷', count: 5, desc: '收获灵谷×5（背包有即可提交）' }],
    rewards: { silver: 50, exp: 120 },
  },
  {
    id: 'q_easy_07', difficulty: 1, title: '修炼指导',
    locationHint: '任意地点（修炼）',
    desc: '修炼5次，巩固基础。',
    objectives: [{ type: 'cultivate', count: 5, desc: '修炼5次' }],
    rewards: { silver: 30, exp: 300, spiritStone: 10 },
  },
  {
    id: 'q_easy_08', difficulty: 1, title: '钓鱼任务',
    locationHint: '东海渔村',
    desc: '去东海渔村钓5次鱼。',
    objectives: [{ type: 'fish', count: 5, desc: '钓鱼5次' }],
    rewards: { silver: 70, exp: 140 },
  },
  {
    id: 'q_easy_09', difficulty: 1, title: '打工帮忙',
    locationHint: '任意地点（工作）',
    desc: '帮各处店铺打工3次。',
    objectives: [{ type: 'work', count: 3, desc: '打工3次' }],
    rewards: { silver: 90, exp: 100 },
  },
  {
    id: 'q_easy_10', difficulty: 1, title: '购买丹药方',
    locationHint: '丹药铺（自由坊市）',
    desc: '购买1颗聚气丹，以备修行之需。',
    objectives: [{ type: 'buy', item: '聚气丹', count: 1, desc: '购买聚气丹×1（背包有即可提交）' }],
    rewards: { silver: 60, exp: 80 },
  },

  // ===== 难度2：普通（10个）=====
  {
    id: 'q_normal_01', difficulty: 2, title: '剿匪任务',
    locationHint: '黑风寨',
    desc: '黑风寨的山贼越来越猖獗，剿灭10名山贼。',
    objectives: [{ type: 'kill', enemy: '山贼', count: 10, desc: '消灭山贼×10' }],
    rewards: { silver: 300, exp: 500, spiritStone: 20 },
  },
  {
    id: 'q_normal_02', difficulty: 2, title: '采集灵药',
    locationHint: '落日森林（采集区）',
    desc: '采集20株聚灵草，丹塔需要大量原料。',
    objectives: [{ type: 'collect', item: '聚灵草', count: 20, desc: '收集聚灵草×20（背包有即可提交）' }],
    rewards: { silver: 200, exp: 400, spiritStone: 30 },
  },
  {
    id: 'q_normal_03', difficulty: 2, title: '护送商队',
    locationHint: '清风镇→大夏皇都',
    desc: '护送商队从清风镇到大夏皇都。',
    objectives: [
      { type: 'travel', location: '清风镇', count: 1, desc: '从清风镇出发' },
      { type: 'travel', location: '大夏皇都', count: 1, desc: '到达大夏皇都' },
    ],
    rewards: { silver: 400, exp: 600 },
  },
  {
    id: 'q_normal_04', difficulty: 2, title: '猎杀妖兽',
    locationHint: '落日森林',
    desc: '落日森林出现妖兽，猎杀5头妖兽。',
    objectives: [{ type: 'kill', enemy: '妖兽', count: 5, desc: '猎杀妖兽×5' }],
    rewards: { silver: 250, exp: 550, spiritStone: 25 },
  },
  {
    id: 'q_normal_05', difficulty: 2, title: '炼制丹药',
    locationHint: '丹塔/炼丹房',
    desc: '学习并炼制3颗回灵丹。',
    objectives: [{ type: 'alchemy', item: '回灵丹', count: 3, desc: '炼制回灵丹×3' }],
    rewards: { silver: 150, exp: 450, spiritStone: 40 },
  },
  {
    id: 'q_normal_06', difficulty: 2, title: '收集矿石',
    locationHint: '矿脉（采矿）',
    desc: '采集15块精铁，铁匠铺急需。',
    objectives: [{ type: 'collect', item: '精铁', count: 15, desc: '收集精铁×15（背包有即可提交）' }],
    rewards: { silver: 180, exp: 350 },
  },
  {
    id: 'q_normal_07', difficulty: 2, title: '突破筑基',
    locationHint: '任意地点（修炼）',
    desc: '突破至筑基境。',
    objectives: [{ type: 'reachRealm', realm: 3, desc: '突破至筑基境' }],
    rewards: { silver: 500, exp: 1000, spiritStone: 100 },
  },
  {
    id: 'q_normal_08', difficulty: 2, title: '丹药采购',
    locationHint: '丹药铺（自由坊市）',
    desc: '为商会采购3颗疗伤丹。',
    objectives: [{ type: 'buy', item: '疗伤丹', count: 3, desc: '购买疗伤丹×3（背包有即可提交）' }],
    rewards: { silver: 200, exp: 300 },
  },
  {
    id: 'q_normal_09', difficulty: 2, title: '种植聚灵草',
    locationHint: '灵田（自家宅子）',
    desc: '种植并收获10株聚灵草。',
    objectives: [{ type: 'harvest', item: '聚灵草', count: 10, desc: '收获聚灵草×10（背包有即可提交）' }],
    rewards: { silver: 160, exp: 400, spiritStone: 20 },
  },
  {
    id: 'q_normal_10', difficulty: 2, title: '探索遗迹',
    locationHint: '上古遗迹',
    desc: '探索上古遗迹一次。',
    objectives: [{ type: 'explore', location: '上古遗迹', count: 1, desc: '探索上古遗迹' }],
    rewards: { silver: 300, exp: 700, spiritStone: 50 },
  },

  // ===== 难度3：困难（10个）=====
  {
    id: 'q_hard_01', difficulty: 3, title: '剿灭匪患',
    locationHint: '黑风寨',
    desc: '黑风寨山贼猖獗，剿灭20名山贼。',
    objectives: [{ type: 'kill', enemy: '山贼', count: 20, desc: '消灭山贼×20' }],
    rewards: { silver: 1000, exp: 1500, spiritStone: 100 },
  },
  {
    id: 'q_hard_02', difficulty: 3, title: '采集珍稀矿石',
    locationHint: '矿脉/秘境',
    desc: '采集5块玄铁和5块灵晶石。',
    objectives: [
      { type: 'collect', item: '玄铁', count: 5, desc: '收集玄铁×5（背包有即可提交）' },
      { type: 'collect', item: '灵晶石', count: 5, desc: '收集灵晶石×5（背包有即可提交）' },
    ],
    rewards: { silver: 800, exp: 1200, spiritStone: 150 },
  },
  {
    id: 'q_hard_03', difficulty: 3, title: '猎杀大量妖兽',
    locationHint: '落日森林/秘境',
    desc: '猎杀10头妖兽，为民除害。',
    objectives: [{ type: 'kill', enemy: '妖兽', count: 10, desc: '猎杀妖兽×10' }],
    rewards: { silver: 600, exp: 1400, spiritStone: 120 },
  },
  {
    id: 'q_hard_04', difficulty: 3, title: '炼制筑基丹',
    locationHint: '炼丹房',
    desc: '炼制1颗筑基丹。',
    objectives: [{ type: 'alchemy', item: '筑基丹', count: 1, desc: '炼制筑基丹×1' }],
    rewards: { silver: 500, exp: 2000, spiritStone: 200 },
  },
  {
    id: 'q_hard_05', difficulty: 3, title: '突破金丹',
    locationHint: '任意地点',
    desc: '突破至结丹境。',
    objectives: [{ type: 'reachRealm', realm: 4, desc: '突破至结丹境' }],
    rewards: { silver: 2000, exp: 3000, spiritStone: 500 },
  },
  {
    id: 'q_hard_06', difficulty: 3, title: '万毒沼泽探险',
    locationHint: '万毒沼泽',
    desc: '深入万毒沼泽，采集10株毒草。',
    objectives: [{ type: 'collect', item: '毒草', count: 10, desc: '收集毒草×10（背包有即可提交）' }],
    rewards: { silver: 700, exp: 1300, spiritStone: 100 },
  },
  {
    id: 'q_hard_07', difficulty: 3, title: '炼器任务',
    locationHint: '锻造房',
    desc: '锻造3件法器。',
    objectives: [{ type: 'forge', count: 3, desc: '锻造3件法器' }],
    rewards: { silver: 600, exp: 1100, spiritStone: 80 },
  },
  {
    id: 'q_hard_08', difficulty: 3, title: '护送贵重物品',
    locationHint: '大夏皇都→自由坊市',
    desc: '护送一批贵重物品从大夏皇都到自由坊市。',
    objectives: [
      { type: 'travel', location: '大夏皇都', count: 1, desc: '从大夏皇都出发' },
      { type: 'travel', location: '自由坊市', count: 1, desc: '到达自由坊市' },
    ],
    rewards: { silver: 1200, exp: 1600, spiritStone: 80 },
  },
  {
    id: 'q_hard_09', difficulty: 3, title: '收服灵宠',
    locationHint: '采集时概率遇到',
    desc: '收服1头灵宠。',
    objectives: [{ type: 'tame', count: 1, desc: '收服1头灵宠' }],
    rewards: { silver: 500, exp: 1000, spiritStone: 150 },
  },
  {
    id: 'q_hard_10', difficulty: 3, title: '广交好友',
    locationHint: '任意地点',
    desc: '与各地NPC交谈互动15次。',
    objectives: [{ type: 'interact', count: 15, desc: '与NPC交互15次' }],
    rewards: { silver: 800, exp: 1500, spiritStone: 100, contribution: 200 },
  },

  // ===== 难度4：精英（10个）=====
  {
    id: 'q_elite_01', difficulty: 4, title: '妖兽围剿',
    locationHint: '落日森林/秘境',
    desc: '猎杀20头妖兽。',
    objectives: [{ type: 'kill', enemy: '妖兽', count: 20, desc: '猎杀妖兽×20' }],
    rewards: { silver: 5000, exp: 5000, spiritStone: 500 },
  },
  {
    id: 'q_elite_02', difficulty: 4, title: '采集仙品灵药',
    locationHint: '药王园（采药）',
    desc: '采集3株雪莲和2株千年灵芝。',
    objectives: [
      { type: 'collect', item: '雪莲', count: 3, desc: '收集雪莲×3（背包有即可提交）' },
      { type: 'collect', item: '千年灵芝', count: 2, desc: '收集千年灵芝×2（背包有即可提交）' },
    ],
    rewards: { silver: 3000, exp: 4000, spiritStone: 600 },
  },
  {
    id: 'q_elite_03', difficulty: 4, title: '突破元婴',
    locationHint: '任意地点',
    desc: '突破至元婴境。',
    objectives: [{ type: 'reachRealm', realm: 5, desc: '突破至元婴境' }],
    rewards: { silver: 8000, exp: 8000, spiritStone: 1000 },
  },
  {
    id: 'q_elite_04', difficulty: 4, title: '炼制金丹',
    locationHint: '炼丹房',
    desc: '炼制1颗金丹。',
    objectives: [{ type: 'alchemy', item: '金丹', count: 1, desc: '炼制金丹×1' }],
    rewards: { silver: 4000, exp: 6000, spiritStone: 800 },
  },
  {
    id: 'q_elite_05', difficulty: 4, title: '探索魔域',
    locationHint: '万妖山脉（采矿）',
    desc: '深入万妖山脉，采集5块魔晶。',
    objectives: [{ type: 'collect', item: '魔晶', count: 5, desc: '收集魔晶×5（背包有即可提交）' }],
    rewards: { silver: 3500, exp: 5500, spiritStone: 700 },
  },
  {
    id: 'q_elite_06', difficulty: 4, title: '妖兽之灾',
    locationHint: '落日森林/秘境',
    desc: '猎杀15头妖兽，震慑群兽。',
    objectives: [{ type: 'kill', enemy: '妖兽', count: 15, desc: '猎杀妖兽×15' }],
    rewards: { silver: 4000, exp: 5000, spiritStone: 500 },
  },
  {
    id: 'q_elite_07', difficulty: 4, title: '炼器大师',
    locationHint: '锻造房',
    desc: '锻造5件法器。',
    objectives: [{ type: 'forge', count: 5, desc: '锻造5件法器' }],
    rewards: { silver: 3000, exp: 4500, spiritStone: 600 },
  },
  {
    id: 'q_elite_08', difficulty: 4, title: '勤修苦练',
    locationHint: '任意地点',
    desc: '修炼20次，夯实根基。',
    objectives: [{ type: 'cultivate', count: 20, desc: '修炼20次' }],
    rewards: { silver: 2500, exp: 4000, spiritStone: 500 },
  },
  {
    id: 'q_elite_09', difficulty: 4, title: '四处探索',
    locationHint: '任意地点',
    desc: '探索各地10次，增长见闻。',
    objectives: [{ type: 'explore', count: 10, desc: '探索10次' }],
    rewards: { silver: 4500, exp: 6000, spiritStone: 800 },
  },
  {
    id: 'q_elite_10', difficulty: 4, title: '以战养战',
    locationHint: '任意地点',
    desc: '经历10场战斗，磨砺自身。',
    objectives: [{ type: 'combat', count: 10, desc: '战斗10次' }],
    rewards: { silver: 6000, exp: 7000, spiritStone: 1000, contribution: 500 },
  },

  // ===== 难度5：传说（10个）=====
  {
    id: 'q_legend_01', difficulty: 5, title: '百战成神',
    locationHint: '任意地点',
    desc: '经历20场战斗胜利，威名远扬。',
    objectives: [{ type: 'combat', count: 20, desc: '战斗20次' }],
    rewards: { silver: 20000, exp: 20000, spiritStone: 3000, item: '金丹' },
  },
  {
    id: 'q_legend_02', difficulty: 5, title: '仙品灵药',
    locationHint: '药王园（采药）',
    desc: '采集5株雪莲，献给宗门。',
    objectives: [{ type: 'collect', item: '雪莲', count: 5, desc: '收集雪莲×5（背包有即可提交）' }],
    rewards: { silver: 15000, exp: 18000, spiritStone: 2500 },
  },
  {
    id: 'q_legend_03', difficulty: 5, title: '突破化神',
    locationHint: '任意地点',
    desc: '突破至化神境。',
    objectives: [{ type: 'reachRealm', realm: 6, desc: '突破至化神境' }],
    rewards: { silver: 30000, exp: 30000, spiritStone: 5000, item: '增寿丹' },
  },
  {
    id: 'q_legend_04', difficulty: 5, title: '炼制元婴丹',
    locationHint: '炼丹房',
    desc: '炼制1颗元婴丹。',
    objectives: [{ type: 'alchemy', item: '元婴丹', count: 1, desc: '炼制元婴丹×1' }],
    rewards: { silver: 25000, exp: 25000, spiritStone: 4000 },
  },
  {
    id: 'q_legend_05', difficulty: 5, title: '妖丹收集',
    locationHint: '秘境/药王园',
    desc: '收集10颗妖丹，炼制大药。',
    objectives: [{ type: 'collect', item: '妖丹', count: 10, desc: '收集妖丹×10（背包有即可提交）' }],
    rewards: { silver: 50000, exp: 50000, spiritStone: 10000 },
  },
  {
    id: 'q_legend_06', difficulty: 5, title: '妖兽克星',
    locationHint: '落日森林/秘境',
    desc: '猎杀30头妖兽，妖兽闻风丧胆。',
    objectives: [{ type: 'kill', enemy: '妖兽', count: 30, desc: '猎杀妖兽×30' }],
    rewards: { silver: 18000, exp: 22000, spiritStone: 3500, item: '妖丹' },
  },
  {
    id: 'q_legend_07', difficulty: 5, title: '锻造宗师',
    locationHint: '锻造房',
    desc: '锻造10件法器。',
    objectives: [{ type: 'forge', count: 10, desc: '锻造10件法器' }],
    rewards: { silver: 20000, exp: 20000, spiritStone: 3000 },
  },
  {
    id: 'q_legend_08', difficulty: 5, title: '行者无疆',
    locationHint: '任意地点',
    desc: '探索各地20次，足迹遍布四方。',
    objectives: [{ type: 'explore', count: 20, desc: '探索20次' }],
    rewards: { silver: 15000, exp: 20000, spiritStone: 2500, item: '灵兽蛋' },
  },
  {
    id: 'q_legend_09', difficulty: 5, title: '天下名士',
    locationHint: '任意地点',
    desc: '与NPC互动30次，广结善缘。',
    objectives: [{ type: 'interact', count: 30, desc: '与NPC交互30次' }],
    rewards: { silver: 100000, exp: 50000, spiritStone: 10000 },
  },
  {
    id: 'q_legend_10', difficulty: 5, title: '商道巨擘',
    locationHint: '自由坊市',
    desc: '在坊市交易20次，积累财富。',
    objectives: [{ type: 'trade', count: 20, desc: '交易20次' }],
    rewards: { silver: 30000, exp: 30000, spiritStone: 5000 },
  },
];

// 初始化季度任务
function initQuarterlyQuests(state) {
  if (!state) return null;
  if (!state.quarterlyQuests) {
    state.quarterlyQuests = {
      available: [],
      active: [],
      completed: [],
      lastRefresh: null,
    };
  }
  return state.quarterlyQuests;
}

// 获取当前季度
function getCurrentQuarter(gameDate) {
  return Math.ceil(gameDate.month / 3);
}

// 刷新季度任务（每季度调用）
function refreshQuarterlyQuests(state) {
  initQuarterlyQuests(state);
  const currentQuarter = getCurrentQuarter(state.gameDate);
  const refreshKey = `${state.gameDate.year}年Q${currentQuarter}`;

  // 如果已经是当前季度的任务，不刷新
  if (state.quarterlyQuests.lastRefresh === refreshKey && state.quarterlyQuests.available.length > 0) {
    return state.quarterlyQuests.available;
  }

  // 根据玩家境界筛选可接任务
  const playerRealm = state.player.realmLevel || 1;
  const eligibleQuests = QUARTERLY_QUESTS.filter(q => {
    const minRealm = QUEST_DIFFICULTIES[q.difficulty].minLevel;
    return playerRealm >= minRealm - 1; // 允许低一级接取
  });

  // 随机选择8个任务
  const shuffled = shuffle([...eligibleQuests]);
  const selected = shuffled.slice(0, Math.min(8, shuffled.length));

  state.quarterlyQuests.available = selected.map(q => ({
    ...q,
    progress: q.objectives.map(o => ({ ...o, current: 0 })),
    accepted: false,
  }));
  state.quarterlyQuests.lastRefresh = refreshKey;

  return state.quarterlyQuests.available;
}

// 获取可用任务
function getAvailableQuests(state) {
  if (!state) return [];
  initQuarterlyQuests(state);
  const list = refreshQuarterlyQuests(state);
  syncInventoryProgress(state);
  return list;
}

// 同步已接任务中"物品类"目标的进度 = 背包现有数量（解决"背包已有物品但显示0"的进度显示错误）
function syncInventoryProgress(state) {
  initQuarterlyQuests(state);
  for (const quest of state.quarterlyQuests.active) {
    if (quest.completed) continue;
    if (!quest.progress) quest.progress = quest.objectives.map(o => ({ ...o, current: 0 }));
    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (!obj.item) continue;
      const entries = (state.player.inventory || []).filter(it => matchItemName(it.name, obj.item));
      const have = entries.reduce((sum, it) => sum + (it.count || 1), 0);
      quest.progress[i] = { ...obj, current: Math.min(have, obj.count) };
    }
  }
}

// 接受任务
function acceptQuest(state, questId) {
  initQuarterlyQuests(state);
  const quest = state.quarterlyQuests.available.find(q => q.id === questId);
  if (!quest) return { success: false, msg: '任务不存在' };
  if (quest.accepted) return { success: false, msg: '已接受该任务' };

  quest.accepted = true;
  state.quarterlyQuests.active.push(quest);

  return { success: true, msg: `接受任务：${quest.title}` };
}

// 更新任务进度
// 收集类(collect/buy/harvest/fish 有 item 的)：进度=背包数量（完成需提交）
// 动作类(cultivate/explore/combat/kill/travel/interact/trade/work/forge/tame/deliver/reachRealm/joinFaction/alchemy)：次数累加
function updateQuestProgress(state, type, params = {}) {
  initQuarterlyQuests(state);
  const results = [];

  for (const quest of state.quarterlyQuests.active) {
    if (quest.completed) continue;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (obj.type === type) {
        let match = true;
        if (obj.item && params.item !== obj.item) match = false;
        if (obj.enemy && params.enemy !== obj.enemy) match = false;
        if (obj.location && params.location !== obj.location) match = false;

        if (match) {
          if (obj.item) {
            // 有物品要求的任务（收集/购买/收获）：进度=背包总量（合并所有同名条目）
            const entries = (state.player.inventory || []).filter(it => matchItemName(it.name, obj.item));
            const have = entries.reduce((sum, it) => sum + (it.count || 1), 0);
            quest.progress[i] = { ...obj, current: Math.min(have, obj.count) };
          } else {
            const prev = quest.progress[i] || { ...obj, current: 0 };
            quest.progress[i] = { ...prev, current: Math.min(obj.count, (prev.current || 0) + (params.count || 1)) };
          }
          // 同步到 objective 供前端显示
          quest.objectives[i].current = quest.progress[i].current || 0;
        }
      }
    }

    // 检查是否完成（仅动作类任务自动完成；含物品要求的任务由提交触发）
    const hasItem = quest.objectives.some(o => o.item);
    if (!hasItem) {
      const allComplete = quest.objectives.every((obj, i) => {
        const p = quest.progress[i] || { current: 0 };
        return p.current >= obj.count;
      });
      if (allComplete && !quest.completed) {
        quest.completed = true;
        results.push({ quest, completed: true });
      }
    }
  }

  return results;
}

// 提交任务（背包直交）：含物品要求的任务，背包有足够物品即可提交完成并扣除
function submitQuestItems(state, questId) {
  initQuarterlyQuests(state);
  const questIndex = state.quarterlyQuests.active.findIndex(q => q.id === questId);
  if (questIndex === -1) return { success: false, msg: '任务不存在或未接受' };
  const quest = state.quarterlyQuests.active[questIndex];
  const hasItem = quest.objectives.some(o => o.item);
  if (!hasItem) return { success: false, msg: '该任务无需提交物品，达成条件后自动完成' };

  // 检查背包数量并扣除
  for (let i = 0; i < quest.objectives.length; i++) {
    const obj = quest.objectives[i];
    const entry = state.player.inventory?.find(it => matchItemName(it.name, obj.item));
    const have = entry ? (entry.count || 1) : 0;
    if (have < obj.count) {
      return { success: false, msg: `缺少${obj.item}：需要${obj.count}，背包现有${have}` };
    }
  }
  for (const obj of quest.objectives) {
    const entry = state.player.inventory.find(it => matchItemName(it.name, obj.item));
    entry.count -= obj.count;
    if (entry.count <= 0) state.player.inventory = state.player.inventory.filter(it => it.name !== obj.item);
  }

  // 标记完成并发奖
  quest.completed = true;
  const rewards = quest.rewards;
  if (rewards.silver) state.player.silver += rewards.silver;
  if (rewards.spiritStone) state.player.spiritStone += rewards.spiritStone;
  if (rewards.exp) state.player.cultivationExp += rewards.exp;
  if (rewards.contribution) state.player.contribution += rewards.contribution;
  if (rewards.item) {
    const existing = state.player.inventory.find(i => matchItemName(i.name, rewards.item));
    if (existing) existing.count++;
    else state.player.inventory.push({ name: rewards.item, count: 1, type: 'quest' });
  }

  state.quarterlyQuests.active.splice(questIndex, 1);
  state.quarterlyQuests.completed.push(quest);

  return { success: true, msg: `完成任务：${quest.title}，已扣除所需物品，获得奖励！`, rewards };
}

// 完成任务并领取奖励（动作类任务：进度满后领取）
function completeQuest(state, questId) {
  initQuarterlyQuests(state);
  const questIndex = state.quarterlyQuests.active.findIndex(q => q.id === questId);
  if (questIndex === -1) return { success: false, msg: '任务不存在或未接受' };

  const quest = state.quarterlyQuests.active[questIndex];
  if (!quest.completed) return { success: false, msg: '任务尚未完成' };

  // 发放奖励
  const rewards = quest.rewards;
  if (rewards.silver) state.player.silver += rewards.silver;
  if (rewards.spiritStone) state.player.spiritStone += rewards.spiritStone;
  if (rewards.exp) state.player.cultivationExp += rewards.exp;
  if (rewards.contribution) state.player.contribution += rewards.contribution;
  if (rewards.item) {
    const existing = state.player.inventory.find(i => matchItemName(i.name, rewards.item));
    if (existing) existing.count++;
    else state.player.inventory.push({ name: rewards.item, count: 1, type: 'quest' });
  }

  // 移除活动任务，加入已完成
  state.quarterlyQuests.active.splice(questIndex, 1);
  state.quarterlyQuests.completed.push(quest);

  return { success: true, msg: `完成任务：${quest.title}，获得奖励！`, rewards };
}

module.exports = {
  QUEST_DIFFICULTIES,
  QUARTERLY_QUESTS,
  initQuarterlyQuests,
  getCurrentQuarter,
  refreshQuarterlyQuests,
  getAvailableQuests,
  acceptQuest,
  updateQuestProgress,
  submitQuestItems,
  completeQuest,
};

