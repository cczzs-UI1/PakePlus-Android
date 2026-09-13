// 宅子系统 - 府邸等级、功能地点、升级
const { randInt, randChoice, clamp } = require('./utils');

// 宅子等级
const MANSION_LEVELS = [
  { level: 1, name: '茅草屋', desc: '简陋的茅草屋，仅能遮风挡雨', capacity: 2, servants: 0, upgradeCost: { silver: 500 }, bg: 'cottage' },
  { level: 2, name: '土坯房', desc: '土坯砌成的房屋，比茅草屋好些', capacity: 4, servants: 1, upgradeCost: { silver: 2000 }, bg: 'mudhouse' },
  { level: 3, name: '青砖小院', desc: '青砖灰瓦的小院子，还算体面', capacity: 6, servants: 3, upgradeCost: { silver: 5000 }, bg: 'courtyard' },
  { level: 4, name: '三进宅院', desc: '三进三出的宅院，颇有规模', capacity: 10, servants: 5, upgradeCost: { silver: 15000, spiritStone: 100 }, bg: 'mansion' },
  { level: 5, name: '豪门大宅', desc: '豪门大户的宅邸，亭台楼阁一应俱全', capacity: 20, servants: 10, upgradeCost: { silver: 50000, spiritStone: 500 }, bg: 'luxury_mansion' },
  { level: 6, name: '侯府', desc: '封侯拜相的府邸，气势恢宏', capacity: 30, servants: 20, upgradeCost: { spiritStone: 2000 }, bg: 'marquis' },
  { level: 7, name: '王府', desc: '亲王府邸，金碧辉煌', capacity: 50, servants: 40, upgradeCost: { spiritStone: 5000 }, bg: 'palace' },
  { level: 8, name: '仙府', desc: '修仙者的洞府，灵气充沛', capacity: 100, servants: 50, upgradeCost: { spiritStone: 20000 }, bg: 'xianfu' },
  { level: 9, name: '洞天福地', desc: '传说中的洞天福地，与世隔绝', capacity: 200, servants: 100, upgradeCost: { spiritStone: 100000 }, bg: 'dongtian' },
];

// 宅子功能地点
const MANSION_AREAS = [
  { id: 'main_hall', name: '正厅', desc: '接待宾客、处理事务的地方', unlockLevel: 1 },
  { id: 'master_room', name: '正房', desc: '正妻/主人的住所', unlockLevel: 1 },
  { id: 'back_yard', name: '后院', desc: '妾室们的住所', unlockLevel: 3 },
  { id: 'left_wing', name: '左厢房', desc: '女儿们的住所（子嗣可无限居住）', unlockLevel: 1 },
  { id: 'right_wing', name: '右厢房', desc: '男儿们的住所（子嗣可无限居住）', unlockLevel: 1 },
  { id: 'servant_quarter', name: '仆役所', desc: '下人们的住所', unlockLevel: 2 },
  { id: 'kitchen', name: '厨房', desc: '烹制饮食的地方', unlockLevel: 1 },
  { id: 'spirit_field', name: '灵田', desc: '种植灵药和蔬菜的灵田', unlockLevel: 1 },
  { id: 'study', name: '书房', desc: '读书学习的地方，修炼速度+10%', unlockLevel: 3 },
  { id: 'meditation_room', name: '静室', desc: '闭关修炼的地方，修炼速度+20%', unlockLevel: 4 },
  { id: 'alchemy_room', name: '炼丹房', desc: '炼丹的地方，炼丹成功率+10%', unlockLevel: 3 },
  { id: 'forge_room', name: '炼器房', desc: '炼器的地方，炼器成功率+10%', unlockLevel: 4 },
  { id: 'formation_room', name: '制阵房', desc: '制阵的地方，制阵成功率+10%', unlockLevel: 4 },
  { id: 'garden', name: '花园', desc: '休憩赏景的花园，心情+10', unlockLevel: 3 },
  { id: 'treasury', name: '库房', desc: '存放财物的地方', unlockLevel: 2 },
  { id: 'stable', name: '马厩', desc: '饲养坐骑的地方', unlockLevel: 3 },
  { id: 'training_ground', name: '演武场', desc: '练习武艺的地方，攻击+5%', unlockLevel: 4 },
];

// 初始化宅子
function initMansion(player) {
  if (!player.mansion) {
    player.mansion = {
      level: 1,
      name: '茅草屋',
      areas: ['main_hall', 'master_room', 'kitchen', 'spirit_field', 'left_wing', 'right_wing'],
      servants: [],
      concubines: [],
      children: [],
      leftWing: [],   // 左厢房（女儿）居住子嗣 id
      rightWing: [],  // 右厢房（男儿）居住子嗣 id
      wife: null,
    };
  } else {
    // 旧档迁移：补齐左右厢房
    const m = player.mansion;
    if (!m.leftWing) m.leftWing = [];
    if (!m.rightWing) m.rightWing = [];
    if (!Array.isArray(m.areas)) m.areas = [];
    if (!m.areas.includes('left_wing')) m.areas.push('left_wing');
    if (!m.areas.includes('right_wing')) m.areas.push('right_wing');
  }
  return player.mansion;
}

// 子嗣自动入住对应性别厢房（安排住所）
function assignChildRoom(player, child) {
  initMansion(player);
  const m = player.mansion;
  if (!m.leftWing) m.leftWing = [];
  if (!m.rightWing) m.rightWing = [];
  // 先移出其他厢房
  m.leftWing = m.leftWing.filter(id => id !== child.id);
  m.rightWing = m.rightWing.filter(id => id !== child.id);
  if (!m.children) m.children = [];
  if (!m.children.includes(child.id)) m.children.push(child.id);
  if (child.gender === '女') {
    if (!m.leftWing.includes(child.id)) m.leftWing.push(child.id);
    return 'left_wing';
  } else {
    if (!m.rightWing.includes(child.id)) m.rightWing.push(child.id);
    return 'right_wing';
  }
}

// 获取宅子信息
function getMansionInfo(player) {
  initMansion(player);
  const levelInfo = MANSION_LEVELS[player.mansion.level - 1];
  const nextLevelInfo = player.mansion.level < MANSION_LEVELS.length ? MANSION_LEVELS[player.mansion.level] : null;
  const availableAreas = MANSION_AREAS.filter(a => a.unlockLevel <= player.mansion.level);
  return {
    ...player.mansion,
    levelInfo,
    nextLevelInfo,
    nextUpgradeCost: nextLevelInfo ? nextLevelInfo.upgradeCost : null,
    availableAreas,
    maxServants: levelInfo.servants,
    maxCapacity: levelInfo.capacity,
  };
}

// 升级宅子
function upgradeMansion(player) {
  initMansion(player);
  const currentLevel = player.mansion.level;
  if (currentLevel >= MANSION_LEVELS.length) {
    return { error: '已达最高等级' };
  }

  const nextLevel = MANSION_LEVELS[currentLevel];
  const cost = nextLevel.upgradeCost;

  // 检查资源
  if (cost.silver && player.silver < cost.silver) {
    return { error: `银两不足，需要${cost.silver}银两` };
  }
  if (cost.spiritStone && player.spiritStone < cost.spiritStone) {
    return { error: `灵石不足，需要${cost.spiritStone}灵石` };
  }

  // 扣除资源
  if (cost.silver) player.silver -= cost.silver;
  if (cost.spiritStone) player.spiritStone -= cost.spiritStone;

  // 升级
  player.mansion.level = currentLevel + 1;
  player.mansion.name = nextLevel.name;

  // 解锁新区域
  const newAreas = MANSION_AREAS.filter(a => a.unlockLevel === currentLevel + 1);
  for (const area of newAreas) {
    if (!player.mansion.areas.includes(area.id)) {
      player.mansion.areas.push(area.id);
    }
  }

  return {
    success: true,
    text: `宅子升级成功！从【${MANSION_LEVELS[currentLevel - 1].name}】升级为【${nextLevel.name}】！`,
    newLevel: currentLevel + 1,
    newName: nextLevel.name,
    newAreas: newAreas.map(a => a.name),
  };
}

// 获取区域信息
function getAreaInfo(player, areaId) {
  initMansion(player);
  const area = MANSION_AREAS.find(a => a.id === areaId);
  if (!area) return { error: '没有这个区域' };
  if (area.unlockLevel > player.mansion.level) {
    return { error: `需要宅子等级${area.unlockLevel}才能解锁` };
  }

  const info = { ...area };

  // 根据区域返回相关人物
  switch (areaId) {
    case 'master_room':
      info.people = player.mansion.wife ? [player.mansion.wife] : [];
      info.desc = player.mansion.wife ? `正妻${player.mansion.wife.name}的住所` : '主人的住所，暂无正妻';
      break;
    case 'back_yard':
      info.people = player.mansion.concubines || [];
      info.desc = `妾室住所，共${info.people.length}位妾室`;
      break;
    case 'left_wing':
      // mansion.leftWing 存子嗣ID数组（与 mansion.children 一致），此处返回ID由上层解析NPC
      info.people = (player.mansion.leftWing || []).slice();
      info.desc = `女儿住所，共${info.people.length}位女儿`;
      break;
    case 'right_wing':
      info.people = (player.mansion.rightWing || []).slice();
      info.desc = `男儿住所，共${info.people.length}位男儿`;
      break;
    case 'servant_quarter':
      info.people = player.mansion.servants || [];
      info.desc = `仆役住所，共${info.people.length}位仆役`;
      break;
    default:
      info.people = [];
  }

  return info;
}

// 宅子随机事件
const MANSION_EVENTS = [
  { area: 'garden', text: '你在花园中散步，心情舒畅，修炼时更加专注。', effects: { cultivationExp: 50 } },
  { area: 'study', text: '你在书房中研读古籍，有所领悟。', effects: { cultivationExp: 80, enlightenment: 5 } },
  { area: 'meditation_room', text: '你在静室中闭关修炼，灵气在体内运转自如。', effects: { cultivationExp: 150 } },
  { area: 'kitchen', text: '厨房做了一桌好菜，你大快朵颐，精神焕发。', effects: { hp: 50, mp: 30 } },
  { area: 'training_ground', text: '你在演武场练习武艺，身手更加敏捷。', effects: { combatExp: 30 } },
  { area: 'main_hall', text: '你在正厅静坐品茶，思考着近来的修炼心得，若有所悟。', effects: { cultivationExp: 30, enlightenment: 2 } },
  { area: 'main_hall', text: '你在正厅处理家中事务，虽然繁琐，但也锻炼了心性。', effects: { willpower: 3, reputation: 5 } },
  { area: 'main_hall', text: '正厅安静无人，你独自品茶，享受难得的宁静时光。', effects: { hp: 20, mp: 20 } },
  { area: 'treasury', text: '你清点库房财物，发现之前遗漏的一些灵石。', effects: { spiritStone: randInt(10, 50) } },
  { area: 'stable', text: '你去马厩看望坐骑，它对你十分亲近。', effects: {} },
];

function getMansionEvent(areaId) {
  const events = MANSION_EVENTS.filter(e => e.area === areaId);
  if (events.length === 0) return null;
  return randChoice(events);
}

module.exports = {
  MANSION_LEVELS,
  MANSION_AREAS,
  initMansion,
  getMansionInfo,
  upgradeMansion,
  getAreaInfo,
  getMansionEvent,
  assignChildRoom,
};
