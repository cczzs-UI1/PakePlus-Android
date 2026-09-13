// 任务系统 - 主线、支线、日常任务
const { randInt, chance, randChoice, clamp, matchItemName } = require('./utils');

// 任务类型
const QUEST_TYPES = {
  main: '主线',
  side: '支线',
  daily: '日常',
  faction: '势力',
  hidden: '隐藏',
};

// 主线任务链
const MAIN_QUESTS = [
  {
    id: 'main_01',
    title: '初入仙途',
    desc: '你来到这个修仙世界，首先需要了解基本的修炼之法。',
    type: 'main',
    locationHint: '任意地点（修炼3次）',
    objectives: [{ type: 'cultivate', count: 3, desc: '修炼3次' }],
    rewards: { exp: 500, spiritStone: 200, item: '聚气丹', contribution: 20 },
    nextQuest: 'main_02',
  },
  {
    id: 'main_02',
    title: '炼气圆满',
    desc: '将修为提升到炼气境大圆满，准备突破筑基。',
    type: 'main',
    locationHint: '任意地点（修为满后突破）',
    objectives: [{ type: 'reachRealm', realm: 2, desc: '突破至炼气境' }],
    rewards: { exp: 1000, spiritStone: 500, item: '筑基丹', contribution: 40 },
    nextQuest: 'main_03',
  },
  {
    id: 'main_03',
    title: '筑基大道',
    desc: '突破至筑基境，正式踏入修仙者行列。',
    type: 'main',
    locationHint: '任意地点（服用筑基丹可提升成功率）',
    objectives: [{ type: 'reachRealm', realm: 3, desc: '突破至筑基境' }],
    rewards: { exp: 2000, spiritStone: 1000, item: "精铁剑", contribution: 60 },
    nextQuest: 'main_04',
  },
  {
    id: 'main_04',
    title: '宗门历练',
    desc: '加入一个宗门或势力，开始你的历练之路。',
    type: 'main',
    locationHint: '任意宗门/势力',
    objectives: [{ type: 'joinFaction', desc: '加入一个势力' }],
    rewards: { exp: 3000, spiritStone: 2000, contribution: 100 },
    nextQuest: 'main_05',
  },
  {
    id: 'main_05',
    title: '结丹之路',
    desc: '积累修为，突破至结丹境。',
    type: 'main',
    locationHint: '任意地点（突破结丹境）',
    objectives: [{ type: 'reachRealm', realm: 4, desc: '突破至结丹境' }],
    rewards: { exp: 5000, spiritStone: 5000, item: '金丹', contribution: 150 },
    nextQuest: 'main_06',
  },
  {
    id: 'main_06',
    title: '元婴出窍',
    desc: '凝结元婴，成为一方高手。',
    type: 'main',
    locationHint: '任意地点（突破元婴境）',
    objectives: [{ type: 'reachRealm', realm: 5, desc: '突破至元婴境' }],
    rewards: { exp: 10000, spiritStone: 10000, item: '元婴丹', contribution: 200 },
    nextQuest: 'main_07',
  },
  {
    id: 'main_07',
    title: '化神飞升',
    desc: '突破化神境，触摸飞升的门槛。',
    type: 'main',
    locationHint: '任意地点（突破化神境）',
    objectives: [{ type: 'reachRealm', realm: 6, desc: '突破至化神境' }],
    rewards: { exp: 20000, spiritStone: 20000, item: '增寿丹', contribution: 300 },
    nextQuest: null,
  },
];

// 支线任务池
const SIDE_QUESTS = [
  {
    id: 'side_01',
    title: '采药任务',
    desc: '帮镇上的药铺采集10株聚灵草。',
    locationHint: '落日森林（采集区）',
    type: 'side',
    objectives: [{ type: 'collect', item: '聚灵草', count: 10, desc: '采集10株聚灵草' }],
    rewards: { exp: 300, spiritStone: 200, contribution: 15 },
  },
  {
    id: 'side_02',
    title: '除暴安良',
    desc: '黑风寨的山贼为祸一方，去教训他们。',
    locationHint: '黑风寨（击败山贼）',
    type: 'side',
    objectives: [{ type: 'kill', target: '山贼', count: 5, desc: '击败5名山贼' }],
    rewards: { exp: 500, spiritStone: 300, reputation: 20, contribution: 25 },
  },
  {
    id: 'side_03',
    title: '护送商队',
    desc: '护送商队从清风镇到大夏皇都。',
    type: 'side',
    locationHint: '清风镇→大夏皇都（移动）',
    objectives: [{ type: 'travel', from: '清风镇', to: '大夏皇都', desc: '护送商队到达皇都' }],
    rewards: { exp: 400, spiritStone: 500, reputation: 10, contribution: 20 },
  },
  {
    id: 'side_04',
    title: '妖兽讨伐',
    desc: '落日森林出现妖兽伤人，前去讨伐。',
    locationHint: '落日森林（击败妖兽）',
    type: 'side',
    objectives: [{ type: 'kill', target: '妖兽', count: 3, desc: '击败3头妖兽' }],
    rewards: { exp: 600, spiritStone: 400, item: '妖丹', contribution: 30 },
  },
  {
    id: 'side_05',
    title: '寻人启事',
    desc: '一位老者的孙子走失了，帮他在大夏皇都打听寻找。',
    type: 'side',
    objectives: [{ type: 'explore', location: '大夏皇都', count: 2, desc: '在大夏皇都探索2次，寻找走失孩童' }],
    rewards: { exp: 350, spiritStone: 250, karma: 10, contribution: 18 },
    locationHint: '大夏皇都（探索2次）',
  },
  {
    id: 'side_06',
    title: '丹药委托',
    desc: '丹塔需要一批回灵丹，帮忙收集材料。',
    locationHint: '落日森林/丹塔（采集灵草）',
    type: 'side',
    objectives: [{ type: 'collect', item: '灵草', count: 20, desc: '收集20株灵草' }],
    rewards: { exp: 500, spiritStone: 600, item: '回灵丹', contribution: 25 },
  },
  {
    id: 'side_07',
    title: '矿脉探索',
    desc: '探索一处新发现的矿脉。',
    locationHint: '裂风峡谷（探索3次）',
    type: 'side',
    objectives: [{ type: 'explore', location: '裂风峡谷', count: 3, desc: '探索裂风峡谷3次' }],
    rewards: { exp: 450, spiritStone: 350, item: '寒铁', contribution: 22 },
  },
  {
    id: 'side_08',
    title: '传信任务',
    desc: '帮天星阁传递一封密信。',
    locationHint: '天星阁→大夏皇都（移动）',
    type: 'side',
    objectives: [{ type: 'travel', from: '天星阁', to: '大夏皇都', desc: '将密信送到皇都' }],
    rewards: { exp: 300, spiritStone: 400, reputation: 15, contribution: 20 },
  },
];

// 日常任务
const DAILY_QUESTS = [
  { id: 'daily_01', title: '日常修炼', desc: '每日修炼不可荒废。', locationHint: '任意地点（修炼1次）', type: 'daily', objectives: [{ type: 'cultivate', count: 1, desc: '修炼1次' }], rewards: { exp: 100, spiritStone: 50, contribution: 5 } },
  { id: 'daily_02', title: '日常探索', desc: '出去探索一番。', locationHint: '任意地点（探索2次）', type: 'daily', objectives: [{ type: 'explore', count: 2, desc: '探索2次' }], rewards: { exp: 150, spiritStone: 80, contribution: 8 } },
  { id: 'daily_03', title: '日常切磋', desc: '找人切磋武艺。', locationHint: '任意地点（进行1场战斗）', type: 'daily', objectives: [{ type: 'combat', count: 1, desc: '进行1场战斗' }], rewards: { exp: 200, spiritStone: 100, contribution: 10 } },
  { id: 'daily_04', title: '日常交易', desc: '去坊市看看。', locationHint: '自由坊市/商铺（交易1次）', type: 'daily', objectives: [{ type: 'trade', count: 1, desc: '进行1次交易' }], rewards: { exp: 100, spiritStone: 150, contribution: 6 } },
  { id: 'daily_05', title: '日常社交', desc: '与朋友联络感情。', locationHint: '任意地点（与NPC交互3次）', type: 'daily', objectives: [{ type: 'interact', count: 3, desc: '与NPC交互3次' }], rewards: { exp: 80, spiritStone: 60, favor: 10, contribution: 8 } },
];

// 初始化任务系统
function initQuests(player) {
  if (!player.quests) {
    player.quests = {
      active: [],
      completed: [],
      currentMain: 'main_01',
      dailyDate: null,
    };
    // 自动接取第一个主线
    acceptQuest(player, 'main_01');
  }
  return player.quests;
}

// 接取任务
function acceptQuest(player, questId) {
  initQuests(player);
  const allQuests = [...MAIN_QUESTS, ...SIDE_QUESTS, ...DAILY_QUESTS];
  const quest = allQuests.find(q => q.id === questId);
  if (!quest) return { success: false, msg: '任务不存在' };
  if (player.quests.active.find(q => q.id === questId)) {
    return { success: false, msg: '已接取该任务' };
  }
  if (player.quests.completed.find(q => q.id === questId)) {
    return { success: false, msg: '已完成该任务' };
  }

  player.quests.active.push({
    ...quest,
    progress: quest.objectives.map(o => ({ ...o, current: 0 })),
    acceptedAt: new Date().toISOString(),
  });
  return { success: true, msg: `接取任务：${quest.title}`, quest };
}

// 更新任务进度
function updateQuestProgress(player, actionType, data = {}) {
  if (!player.quests || player.quests.active.length === 0) return;

  for (const quest of player.quests.active) {
    const progress = quest.progress || [];
    for (const obj of progress) {
      if (obj.type === actionType) {
        // 检查条件匹配
        if (obj.location && data.location !== obj.location) continue;
        if (obj.item && data.item !== obj.item) continue;
        if (obj.target && data.target !== obj.target) continue;
        if (obj.realm && data.realm < obj.realm) continue;
        if (obj.subStage && data.subStage !== obj.subStage) continue;
        if (obj.from && data.from !== obj.from) continue;
        if (obj.to && data.to !== obj.to) continue;

        if (obj.type === 'collect') {
          // 收集类任务：进度=背包现有数量（完成需通过"提交"扣物，见 submitQuestItems）
          const entry = player.inventory?.find(it => matchItemName(it.name, obj.item));
          const have = entry ? (entry.count || 1) : 0;
          obj.current = Math.min(have, obj.count || Infinity);
          obj.completed = obj.current >= (obj.count || 1);
        } else {
          obj.count = obj.count || 1;
          obj.current = (obj.current || 0) + 1;
          if (obj.current >= obj.count) {
            obj.completed = true;
          }
        }
      }
    }
  }

  // 检查完成（收集类由提交触发，不在此自动结算）
  checkQuestCompletion(player);
}

// 检查任务完成（collect 类任务须玩家"提交"背包物品后才结算，见 submitQuestItems）
function checkQuestCompletion(player, opts = {}) {
  if (!player.quests) return;
  const completed = [];

  for (let i = player.quests.active.length - 1; i >= 0; i--) {
    const quest = player.quests.active[i];
    // 含收集目标的任务：默认跳过自动结算（等玩家提交物品）
    if (!opts.force && quest.progress.some(o => o.type === 'collect')) continue;
    const allDone = quest.progress.every(o => o.completed || o.current >= o.count);
    if (allDone) {
      completed.push(quest);
      player.quests.active.splice(i, 1);
      player.quests.completed.push({ id: quest.id, title: quest.title, completedAt: new Date().toISOString() });

      // 发放奖励
      if (quest.rewards) {
        if (quest.rewards.exp) player.cultivationExp += quest.rewards.exp;
        if (quest.rewards.spiritStone) player.spiritStone += quest.rewards.spiritStone;
        if (quest.rewards.silver) player.silver = (player.silver || 0) + quest.rewards.silver;
        if (quest.rewards.reputation) player.reputation += quest.rewards.reputation;
        if (quest.rewards.karma) {
          if (quest.rewards.karma > 0) player.karma.merit += quest.rewards.karma;
          else player.karma.sin -= quest.rewards.karma;
        }
        if (quest.rewards.item) {
          const existing = player.inventory.find(it => matchItemName(it.name, quest.rewards.item));
          if (existing) existing.count++;
          else player.inventory.push({ name: quest.rewards.item, count: 1 });
        }
        if (quest.rewards.contribution) player.contribution += quest.rewards.contribution;
      }

      // 主线任务自动接取下一个
      if (quest.type === 'main' && quest.nextQuest) {
        acceptQuest(player, quest.nextQuest);
        player.quests.currentMain = quest.nextQuest;
      }
    }
  }

  return completed;
}

// 提交任务物品（背包直交）：收集类任务，背包有足够物品即可提交完成并扣除物品
function submitQuestItems(player, questId) {
  initQuests(player);
  const quest = player.quests.active.find(q => q.id === questId);
  if (!quest) return { success: false, msg: '任务不存在或未接取' };
  const collectObjs = quest.progress.filter(o => o.type === 'collect');
  if (collectObjs.length === 0) {
    // 无收集目标：直接尝试结算（如已达条件）
    const done = checkQuestCompletion(player, { force: true });
    if (done.some(q => q.id === questId)) return { success: true, msg: `任务完成：${quest.title}`, rewards: quest.rewards };
    return { success: false, msg: '该任务无需提交物品，达成条件后自动完成' };
  }
  // 非收集目标必须先达成
  for (const obj of quest.progress) {
    if (obj.type !== 'collect' && !(obj.completed || (obj.current || 0) >= (obj.count || 1))) {
      return { success: false, msg: `前置条件未达成：${obj.desc || obj.type}` };
    }
  }
  // 检查背包数量
  for (const obj of collectObjs) {
    const entry = player.inventory?.find(it => matchItemName(it.name, obj.item));
    const have = entry ? (entry.count || 1) : 0;
    if (have < (obj.count || 1)) {
      return { success: false, msg: `缺少${obj.item}：需要${obj.count}，背包现有${have}` };
    }
  }
  // 扣除物品并标记完成
  for (const obj of collectObjs) {
    const entry = player.inventory.find(it => matchItemName(it.name, obj.item));
    entry.count -= (obj.count || 1);
    if (entry.count <= 0) player.inventory = player.inventory.filter(it => it.name !== obj.item);
    obj.current = obj.count;
    obj.completed = true;
  }
  // 结算奖励
  const done = checkQuestCompletion(player, { force: true });
  const finished = done.find(q => q.id === questId);
  if (finished) return { success: true, msg: `任务完成：${quest.title}，已扣除所需物品`, rewards: quest.rewards };
  return { success: false, msg: '任务提交失败' };
}

// 获取日常任务（每天刷新）
function getDailyQuests(player) {
  initQuests(player);
  const today = new Date().toDateString();
  if (player.quests.dailyDate !== today) {
    // 刷新日常
    player.quests.dailyDate = today;
    // 移除旧日常
    player.quests.active = player.quests.active.filter(q => q.type !== 'daily');
    // 随机接取3个日常
    const shuffled = [...DAILY_QUESTS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      acceptQuest(player, shuffled[i].id);
    }
  }
  return player.quests.active.filter(q => q.type === 'daily');
}

// 获取可接取的支线任务
function getAvailableSideQuests(player) {
  initQuests(player);
  const activeIds = player.quests.active.map(q => q.id);
  const completedIds = player.quests.completed.map(q => q.id);
  return SIDE_QUESTS.filter(q => !activeIds.includes(q.id) && !completedIds.includes(q.id));
}

// 需求⑦：collect类任务同步背包已有数量——接任务前已有的材料也计入进度并显示
function syncQuestInventory(player) {
  if (!player.quests || !player.quests.active) return;
  const inv = player.inventory || [];
  for (const quest of player.quests.active) {
    const progress = quest.progress || [];
    for (const obj of progress) {
      if (obj.type === 'collect' && obj.item) {
        const entry = inv.find(it => matchItemName(it.name, obj.item));
        const have = entry ? (entry.count || 1) : 0;
        const cap = obj.count || Infinity;
        const target = Math.min(have, cap);
        if (target > (obj.current || 0)) {
          obj.current = target;
          if (obj.current >= cap) obj.completed = true;
        }
      }
    }
  }
  checkQuestCompletion(player);
}

// 获取任务列表
function getQuestList(player) {
  initQuests(player);
  syncQuestInventory(player); // 背包已有材料计入 collect 进度
  return {
    active: player.quests.active,
    completed: player.quests.completed,
    currentMain: player.quests.currentMain,
  };
}

module.exports = {
  MAIN_QUESTS, SIDE_QUESTS, DAILY_QUESTS, QUEST_TYPES,
  initQuests, acceptQuest, updateQuestProgress,
  checkQuestCompletion, getDailyQuests, getAvailableSideQuests, getQuestList,
  submitQuestItems,
};

