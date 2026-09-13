// 学习系统 - 炼丹/炼器/阵法/功法的学习进度
const { randInt, randChoice, clamp } = require('./utils');

// 可学习的丹方
const LEARN_ALCHEMY_RECIPES = [
  { id: 'huiling', name: '回灵丹', level: 1, exp: 100, desc: '恢复灵力30%', materials: ['聚灵草', '灵谷'] },
  { id: 'huixue', name: '回血丹', level: 1, exp: 100, desc: '恢复气血30%', materials: ['野山参', '灵谷'] },
  { id: 'juqi', name: '聚气丹', level: 2, exp: 200, desc: '增加修为500', materials: ['聚灵草', '百年灵芝'] },
  { id: 'liaoshang', name: '疗伤丹', level: 2, exp: 200, desc: '治疗伤势，恢复50%气血', materials: ['野山参', '何首乌'] },
  { id: 'qingxin', name: '清心丹', level: 3, exp: 300, desc: '清除心魔，突破成功率+10%', materials: ['雪莲', '清心草'] },
  { id: 'jiedu', name: '解毒丹', level: 1, exp: 80, desc: '解除中毒状态', materials: ['甘草', '金银花'] },
  { id: 'zhuji', name: '筑基丹', level: 4, exp: 500, desc: '筑基期突破必备', materials: ['百年灵芝', '聚灵草', '灵晶石'] },
  { id: 'jindan', name: '金丹', level: 6, exp: 1000, desc: '结丹期突破必备', materials: ['千年人参', '金丹草', '灵晶石'] },
  { id: 'yuanying', name: '元婴丹', level: 8, exp: 2000, desc: '元婴期突破必备', materials: ['元婴果', '千年人参', '龙涎香'] },
  { id: 'zengshou', name: '增寿丹', level: 5, exp: 800, desc: '增加寿元50年', materials: ['千年人参', '雪莲', '何首乌'] },
  { id: 'songzi', name: '送子丹', level: 3, exp: 300, desc: '服用后必受孕', materials: ['送子草', '百年灵芝'] },
  { id: 'shunchan', name: '顺产丹', level: 2, exp: 150, desc: '生产成功率+20%', materials: ['益母草', '野山参'] },
  { id: 'poyu', name: '破障丹', level: 7, exp: 1500, desc: '突破瓶颈成功率+30%', materials: ['破障草', '千年人参', '灵晶石'] },
  { id: 'shedan', name: '蛇胆丹', level: 2, exp: 180, desc: '提升毒抗', materials: ['蛇胆', '金银花'] },
  { id: 'hudan', name: '虎胆丹', level: 3, exp: 250, desc: '提升勇气和攻击', materials: ['虎胆', '何首乌'] },
];

// 可学习的炼器配方
const LEARN_FORGE_RECIPES = [
  { id: 'jingtiejian', name: '精铁剑', level: 1, exp: 100, desc: '攻击+10', materials: ['铁矿石', '精铁'] },
  { id: 'pigejia', name: '皮革甲', level: 1, exp: 80, desc: '防御+8', materials: ['妖兽皮', '针线'] },
  { id: 'xuantiedao', name: '玄铁刀', level: 2, exp: 200, desc: '攻击+20', materials: ['玄铁', '铁矿石'] },
  { id: 'qingfengjian', name: '青锋剑', level: 3, exp: 300, desc: '攻击+35，速度+5', materials: ['玄铁', '灵晶石', '精铁'] },
  { id: 'pojiaqiang', name: '破甲枪', level: 3, exp: 300, desc: '攻击+40，破甲', materials: ['玄铁', '兽骨', '精铁'] },
  { id: 'lingbaogong', name: '灵宝弓', level: 4, exp: 400, desc: '攻击+30，远程', materials: ['灵木', '妖兽筋', '玄铁'] },
  { id: 'yugushan', name: '玉骨扇', level: 4, exp: 400, desc: '法攻+25，风度+10', materials: ['玉骨', '灵蚕丝', '灵晶石'] },
  { id: 'xuanbingkai', name: '玄冰铠', level: 5, exp: 500, desc: '防御+50，冰抗', materials: ['玄铁', '冰晶石', '妖兽皮'] },
  { id: 'yuruyi', name: '玉如意', level: 3, exp: 250, desc: '法攻+20，悟性+5', materials: ['翡翠', '灵晶石', '珍珠'] },
  { id: 'feijian', name: '飞剑', level: 6, exp: 800, desc: '可御剑飞行，攻击+50', materials: ['玄铁', '灵晶石', '剑魄'] },
  { id: 'fahai', name: '法海钵', level: 5, exp: 600, desc: '法攻+40，灵力+100', materials: ['紫金', '灵晶石', '佛骨'] },
  { id: 'zhaoyaojing', name: '照妖镜', level: 4, exp: 450, desc: '可照出妖物原形', materials: ['青铜', '灵晶石', '朱砂'] },
];

// 可学习的阵法
const LEARN_FORMATIONS = [
  { id: 'juling', name: '聚灵阵', level: 1, exp: 100, desc: '聚集灵气，修炼速度+20%', materials: ['灵晶石', '阵旗'] },
  { id: 'huti', name: '护体阵', level: 1, exp: 100, desc: '形成护盾，防御+30', materials: ['灵晶石', '阵旗'] },
  { id: 'mihun', name: '迷魂阵', level: 2, exp: 200, desc: '迷惑敌人，降低命中', materials: ['灵晶石', '迷魂香', '阵旗'] },
  { id: 'shashi', name: '杀阵', level: 3, exp: 300, desc: '攻击阵法，持续伤害', materials: ['灵晶石', '煞气石', '阵旗'] },
  { id: 'kongzhi', name: '困敌阵', level: 2, exp: 200, desc: '困住敌人3回合', materials: ['灵晶石', '捆仙绳', '阵旗'] },
  { id: 'chuansong', name: '传送阵', level: 4, exp: 500, desc: '远距离传送', materials: ['灵晶石', '空间石', '阵旗'] },
  { id: 'yinshen', name: '隐身阵', level: 3, exp: 350, desc: '隐藏身形', materials: ['灵晶石', '隐身草', '阵旗'] },
  { id: 'julei', name: '聚雷阵', level: 4, exp: 450, desc: '召唤雷电攻击', materials: ['灵晶石', '雷晶石', '阵旗'] },
  { id: 'liuhuo', name: '流火阵', level: 3, exp: 300, desc: '火焰攻击阵法', materials: ['灵晶石', '火晶石', '阵旗'] },
  { id: 'xuanbing', name: '玄冰阵', level: 3, exp: 300, desc: '冰冻敌人', materials: ['灵晶石', '冰晶石', '阵旗'] },
  { id: 'tiangang', name: '天罡阵', level: 5, exp: 600, desc: '全属性提升', materials: ['灵晶石', '天罡石', '阵旗'] },
  { id: 'disha', name: '地煞阵', level: 5, exp: 600, desc: '召唤地脉之力', materials: ['灵晶石', '地煞石', '阵旗'] },
  { id: 'zhouer', name: '周天星斗阵', level: 7, exp: 1000, desc: '引星辰之力攻击', materials: ['灵晶石', '星陨石', '阵旗'] },
  { id: 'taiji', name: '太极阵', level: 6, exp: 800, desc: '阴阳相生，攻防一体', materials: ['灵晶石', '太极石', '阵旗'] },
  { id: 'wanxiang', name: '万象归一阵', level: 8, exp: 1500, desc: '传说中的上古阵法', materials: ['混沌之气', '先天灵宝', '阵旗'] },
];

// 可学习的功法
const CULTIVATION_TECHNIQUES = [
  { id: 'tuna', name: '吐纳术', level: 1, exp: 50, desc: '基础修炼功法，修炼速度+10%', materials: [] },
  { id: 'julingjue', name: '聚灵诀', level: 2, exp: 150, desc: '聚气修炼，修炼速度+20%', materials: ['聚灵草'] },
  { id: 'qingxinjue', name: '清心诀', level: 3, exp: 250, desc: '清心寡欲，突破成功率+15%', materials: ['雪莲'] },
  { id: 'wuxingjue', name: '五行诀', level: 4, exp: 400, desc: '五行相生，全属性+10', materials: ['五行石'] },
  { id: 'taijijue', name: '太极诀', level: 5, exp: 600, desc: '阴阳调和，攻防兼备', materials: ['太极石'] },
  { id: 'xiantianjue', name: '先天诀', level: 6, exp: 800, desc: '返璞归真，修炼速度+50%', materials: ['先天灵宝碎片'] },
  { id: 'hundunjue', name: '混沌诀', level: 8, exp: 2000, desc: '混沌本源，无上功法', materials: ['混沌之气'] },
  { id: 'jianjue', name: '剑诀', level: 3, exp: 300, desc: '御剑之术，攻击+30%', materials: ['剑谱'] },
  { id: 'daofa', name: '道法', level: 4, exp: 400, desc: '道家法术，法攻+30%', materials: ['道法玉简'] },
  { id: 'foshou', name: '佛手', level: 4, exp: 400, desc: '佛门功法，防御+30%', materials: ['佛经'] },
];

// 学习进度数据结构
// player.learning = {
//   alchemy: { recipeId: { progress: 0, learned: true/false } },
//   forge: {...},
//   formation: {...},
//   technique: {...},
// }

// 初始化学习系统
function initLearning(player) {
  if (!player.learning) {
    player.learning = {
      alchemy: {},
      forge: {},
      formation: {},
      technique: {},
    };
  }
}

// 学习进度增加
function addLearningProgress(player, category, itemId, amount) {
  initLearning(player);
  if (!player.learning[category]) player.learning[category] = {};
  if (!player.learning[category][itemId]) {
    player.learning[category][itemId] = { progress: 0, learned: false };
  }

  const data = player.learning[category][itemId];
  if (data.learned) return { alreadyLearned: true };

  const allItems = getAllItems(category);
  const item = allItems.find(i => i.id === itemId);
  if (!item) return { error: '没有这个学习内容' };

  data.progress = Math.min(item.exp, data.progress + amount);
  if (data.progress >= item.exp) {
    data.learned = true;
    return { success: true, learned: true, text: `你成功学会了【${item.name}】！` };
  }
  return { success: true, learned: false, progress: data.progress, max: item.exp, text: `学习进度：${data.progress}/${item.exp}` };
}

// 获取所有可学习内容
function getAllItems(category) {
  switch (category) {
    case 'alchemy': return LEARN_ALCHEMY_RECIPES;
    case 'forge': return LEARN_FORGE_RECIPES;
    case 'formation': return LEARN_FORMATIONS;
    case 'technique': return CULTIVATION_TECHNIQUES;
    default: return [];
  }
}

// 研读学习（消耗AP，增加进度）
function study(player, category, itemId) {
  initLearning(player);
  const allItems = getAllItems(category);
  const item = allItems.find(i => i.id === itemId);
  if (!item) return { error: '没有这个学习内容' };

  const data = player.learning[category]?.[itemId];
  if (data?.learned) return { error: '已经学会了' };

  // 悟性影响学习效率
  const enlightenment = player.attributes?.enlightenment || 30;
  const progress = randInt(10, 30) + Math.floor(enlightenment * 0.5);

  const result = addLearningProgress(player, category, itemId, progress);
  result.studyProgress = progress;
  result.itemName = item.name;
  return result;
}

// 请教NPC学习
function learnFromNPC(player, npc, category, itemId) {
  initLearning(player);
  const allItems = getAllItems(category);
  const item = allItems.find(i => i.id === itemId);
  if (!item) return { error: '没有这个学习内容' };

  // NPC的相关技能等级影响学习效率
  const npcSkill = npc.skills?.[category] || 1;
  const progress = randInt(20, 50) + npcSkill * 5;

  const result = addLearningProgress(player, category, itemId, progress);
  result.studyProgress = progress;
  result.itemName = item.name;
  result.teacher = npc.name;
  return result;
}

// 实践学习（通过制作/使用增加进度）
function practiceLearn(player, category, itemId, success) {
  initLearning(player);
  if (!success) return { success: false };
  const progress = randInt(5, 15);
  return addLearningProgress(player, category, itemId, progress);
}

// 获取学习列表
function getLearningList(player, category) {
  initLearning(player);
  const allItems = getAllItems(category);
  return allItems.map(item => {
    const data = player.learning[category]?.[item.id] || { progress: 0, learned: false };
    return {
      ...item,
      progress: data.progress,
      learned: data.learned,
      progressPercent: Math.floor((data.progress / item.exp) * 100),
    };
  });
}

// 检查是否已学会
function hasLearned(player, category, itemId) {
  initLearning(player);
  return player.learning[category]?.[itemId]?.learned || false;
}

// 获取已学会的列表
function getLearnedList(player, category) {
  return getLearningList(player, category).filter(i => i.learned);
}

// 学习随机事件
const LEARNING_EVENTS = [
  { text: '你潜心研读，忽有所悟，学习进度大增！', bonus: 50 },
  { text: '你反复推敲，终于理解了其中的奥妙。', bonus: 30 },
  { text: '你遇到了瓶颈，苦思冥想后豁然开朗。', bonus: 40 },
  { text: '你在梦中得到启示，醒来后恍然大悟。', bonus: 60 },
  { text: '你偶得前人笔记，参考后进步神速。', bonus: 45 },
  { text: '你今日心神不宁，学习效果一般。', bonus: 10 },
  { text: '你被外物打扰，学习进度缓慢。', bonus: 5 },
  { text: '你与同道切磋，互相印证后有所收获。', bonus: 35 },
];

function getRandomLearningEvent() {
  return randChoice(LEARNING_EVENTS);
}

// 功法栏系统
// 功法 buff 字段：
//   cultivate: 修炼速度加成（0.1=+10%）
//   attack: 攻击加成（0.3=+30%）
//   defense: 防御加成
//   mpMax: 灵力上限加成
//   breakthrough: 突破成功率加成（百分点）
//   attr: 属性加成 { 根骨: n, 神识: n, 悟性: n }
const TECH_BUFFS = {
  tuna: { cultivate: 0.1 },
  julingjue: { cultivate: 0.2 },
  qingxinjue: { breakthrough: 15 },
  wuxingjue: { attr: { 根骨: 5, 神识: 5, 悟性: 5, 力量: 5, 身法: 5 } },
  taijijue: { attack: 0.08, defense: 0.08 },
  xiantianjue: { cultivate: 0.5 },
  hundunjue: { cultivate: 0.6, attack: 0.15, defense: 0.15, breakthrough: 5 },
  jianjue: { attack: 0.3 },
  daofa: { attack: 0.15, mpMax: 0.3 },
  foshou: { defense: 0.3, mpMax: 0.1 },
};

// 功法栏数量
const TECH_SLOTS = 5;

// 获取某功法 buff
function getTechBuff(techId) {
  return TECH_BUFFS[techId] || null;
}

// 汇总玩家已装备功法的总加成
function getTechniqueBuffs(npc) {
  const buff = { cultivate: 0, attack: 0, defense: 0, mpMax: 0, breakthrough: 0, attr: {} };
  const techs = npc?.equippedTechs || [];
  for (const id of techs) {
    const b = TECH_BUFFS[id];
    if (!b) continue;
    buff.cultivate += b.cultivate || 0;
    buff.attack += b.attack || 0;
    buff.defense += b.defense || 0;
    buff.mpMax += b.mpMax || 0;
    buff.breakthrough += b.breakthrough || 0;
    for (const [k, v] of Object.entries(b.attr || {})) {
      buff.attr[k] = (buff.attr[k] || 0) + v;
    }
  }
  return buff;
}

// 装备功法到栏位
function equipTechnique(player, techId) {
  initLearning(player);
  const item = CULTIVATION_TECHNIQUES.find(x => x.id === techId);
  if (!item) return { error: '没有该功法' };
  if (!player.learning.technique[techId]?.learned) return { error: `尚未学会【${item.name}】，无法放置` };
  if (!player.equippedTechs) player.equippedTechs = [];
  if (player.equippedTechs.includes(techId)) return { error: `【${item.name}】已在功法栏中` };
  if (player.equippedTechs.length >= TECH_SLOTS) return { error: `功法栏已满（最多${TECH_SLOTS}个），请先卸下一个` };
  player.equippedTechs.push(techId);
  return { success: true, msg: `已将【${item.name}】放入功法栏，加成生效` };
}

// 卸下功法
function unequipTechnique(player, techId) {
  initLearning(player);
  if (!player.equippedTechs) player.equippedTechs = [];
  const idx = player.equippedTechs.indexOf(techId);
  if (idx === -1) return { error: '该功法不在功法栏中' };
  const item = CULTIVATION_TECHNIQUES.find(x => x.id === techId);
  player.equippedTechs.splice(idx, 1);
  return { success: true, msg: `已卸下【${item ? item.name : ''}】` };
}

// 获取功法栏状态（前端渲染）
function getTechniqueState(player) {
  initLearning(player);
  if (!player.equippedTechs) player.equippedTechs = [];
  const equipped = player.equippedTechs.map(id => {
    const item = CULTIVATION_TECHNIQUES.find(x => x.id === id);
    return item ? { id: item.id, name: item.name, desc: item.desc, buff: TECH_BUFFS[id] || {} } : null;
  }).filter(Boolean);
  const learned = getLearnedList(player, 'technique').map(item => ({
    id: item.id, name: item.name, desc: item.desc, buff: TECH_BUFFS[item.id] || {},
  }));
  return {
    slots: TECH_SLOTS,
    equipped,
    learned,
    buffs: getTechniqueBuffs(player),
  };
}

module.exports = {
  LEARN_ALCHEMY_RECIPES,
  LEARN_FORGE_RECIPES,
  LEARN_FORMATIONS,
  CULTIVATION_TECHNIQUES,
  TECH_BUFFS,
  TECH_SLOTS,
  initLearning,
  addLearningProgress,
  getAllItems,
  study,
  learnFromNPC,
  practiceLearn,
  getLearningList,
  hasLearned,
  getLearnedList,
  getRandomLearningEvent,
  getTechBuff,
  getTechniqueBuffs,
  equipTechnique,
  unequipTechnique,
  getTechniqueState,
};
