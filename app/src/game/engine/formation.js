// 阵法系统 - 学习、布阵、战斗加成
const { randInt, chance, randChoice, clamp } = require('./utils');

// 阵法大全
const FORMATIONS = [
  // 一阶阵法
  { id: 'yizi', name: '一字长蛇阵', tier: 1, desc: '最基础的阵法，提升攻击力', atkBonus: 0.1, defBonus: 0, spdBonus: 0, cost: 500, learnLevel: 1 },
  { id: 'erlong', name: '二龙出水阵', tier: 1, desc: '双龙出水，提升攻击和速度', atkBonus: 0.08, defBonus: 0, spdBonus: 0.1, cost: 600, learnLevel: 1 },
  { id: 'sancai', name: '三才阵', tier: 1, desc: '天地人三才，攻防兼备', atkBonus: 0.05, defBonus: 0.05, spdBonus: 0.05, cost: 800, learnLevel: 1 },
  // 二阶阵法
  { id: 'sixiang', name: '四象阵', tier: 2, desc: '青龙白虎朱雀玄武，四象守护', atkBonus: 0.1, defBonus: 0.15, spdBonus: 0, cost: 2000, learnLevel: 2 },
  { id: 'wuxing', name: '五行阵', tier: 2, desc: '金木水火土，五行相生相克', atkBonus: 0.12, defBonus: 0.08, spdBonus: 0.05, cost: 2500, learnLevel: 2 },
  { id: 'liuhe', name: '六合阵', tier: 2, desc: '上下东西南北六合，全方位提升', atkBonus: 0.08, defBonus: 0.08, spdBonus: 0.08, cost: 3000, learnLevel: 2 },
  // 三阶阵法
  { id: 'qixing', name: '七星北斗阵', tier: 3, desc: '北斗七星，攻击大幅提升', atkBonus: 0.2, defBonus: 0.05, spdBonus: 0.1, cost: 8000, learnLevel: 3 },
  { id: 'bagua', name: '八卦阵', tier: 3, desc: '乾坤坎离震艮巽兑，八卦迷阵', atkBonus: 0.1, defBonus: 0.2, spdBonus: 0.05, cost: 10000, learnLevel: 3 },
  { id: 'jiugong', name: '九宫格', tier: 3, desc: '九宫八卦，变化无穷', atkBonus: 0.15, defBonus: 0.15, spdBonus: 0.1, cost: 12000, learnLevel: 3 },
  // 四阶阵法
  { id: 'shifang', name: '十方俱灭阵', tier: 4, desc: '十方天地，毁灭一切', atkBonus: 0.3, defBonus: 0.1, spdBonus: 0.1, cost: 30000, learnLevel: 4 },
  { id: 'zhoutian', name: '周天星斗阵', tier: 4, desc: '周天星斗，借天地之力', atkBonus: 0.2, defBonus: 0.2, spdBonus: 0.15, cost: 40000, learnLevel: 4 },
  { id: 'taiji', name: '太极两仪阵', tier: 4, desc: '太极生两仪，阴阳调和', atkBonus: 0.15, defBonus: 0.25, spdBonus: 0.1, cost: 35000, learnLevel: 4 },
  // 五阶阵法
  { id: 'dutian', name: '十二都天神煞阵', tier: 5, desc: '十二都天神煞，巫族镇族大阵', atkBonus: 0.4, defBonus: 0.2, spdBonus: 0.15, cost: 100000, learnLevel: 5 },
  { id: 'zhuxian', name: '诛仙剑阵', tier: 5, desc: '诛仙四剑，非四圣不可破', atkBonus: 0.5, defBonus: 0.1, spdBonus: 0.2, cost: 150000, learnLevel: 5 },
  { id: 'wanxian', name: '万仙大阵', tier: 5, desc: '万仙来朝，通天教主镇教大阵', atkBonus: 0.35, defBonus: 0.35, spdBonus: 0.2, cost: 200000, learnLevel: 5 },
];

// 阵法等级
const FORMATION_LEVELS = [
  { level: 1, name: '阵徒', expNeed: 0, bonusMultiplier: 1.0 },
  { level: 2, name: '阵师', expNeed: 500, bonusMultiplier: 1.1 },
  { level: 3, name: '大阵师', expNeed: 2000, bonusMultiplier: 1.2 },
  { level: 4, name: '阵宗', expNeed: 5000, bonusMultiplier: 1.35 },
  { level: 5, name: '阵王', expNeed: 15000, bonusMultiplier: 1.5 },
  { level: 6, name: '阵皇', expNeed: 40000, bonusMultiplier: 1.7 },
  { level: 7, name: '阵圣', expNeed: 100000, bonusMultiplier: 2.0 },
];

// 初始化阵法技能
function initFormation(player) {
  if (!player.formation) {
    player.formation = {
      level: 1,
      exp: 0,
      learned: ['yizi'],
      active: null,
    };
  }
  return player.formation;
}

// 获取阵法等级
function getFormationLevel(player) {
  initFormation(player);
  return FORMATION_LEVELS.find(l => player.formation.exp >= l.expNeed) || FORMATION_LEVELS[0];
}

// 获取已学阵法
function getLearnedFormations(player) {
  initFormation(player);
  return FORMATIONS.filter(f => player.formation.learned.includes(f.id));
}

// 获取可学阵法
function getAvailableFormations(player) {
  initFormation(player);
  const lvl = getFormationLevel(player);
  return FORMATIONS.filter(f => !player.formation.learned.includes(f.id) && f.learnLevel <= lvl.level);
}

// 学习阵法
function learnFormation(player, formationId) {
  initFormation(player);
  const formation = FORMATIONS.find(f => f.id === formationId);
  if (!formation) return { success: false, msg: '阵法不存在' };
  if (player.formation.learned.includes(formationId)) return { success: false, msg: '已学会该阵法' };

  const lvl = getFormationLevel(player);
  if (formation.learnLevel > lvl.level) {
    return { success: false, msg: `阵法等级不足，需要${FORMATION_LEVELS[formation.learnLevel - 1].name}` };
  }
  if (player.spiritStone < formation.cost) {
    return { success: false, msg: `灵石不足，需要${formation.cost}灵石` };
  }

  player.spiritStone -= formation.cost;
  player.formation.learned.push(formationId);
  player.formation.exp += formation.tier * 100;
  return { success: true, msg: `学会了${formation.name}！` };
}

// 布阵
function activateFormation(player, formationId) {
  initFormation(player);
  if (!player.formation.learned.includes(formationId)) {
    return { success: false, msg: '未学会该阵法' };
  }
  if (player.formation.active === formationId) {
    player.formation.active = null;
    return { success: true, msg: '撤去阵法' };
  }
  player.formation.active = formationId;
  const formation = FORMATIONS.find(f => f.id === formationId);
  return { success: true, msg: `布下${formation.name}！` };
}

// 获取当前阵法加成
function getFormationBonus(player) {
  initFormation(player);
  if (!player.formation.active) {
    return { atkBonus: 0, defBonus: 0, spdBonus: 0, name: null };
  }
  const formation = FORMATIONS.find(f => f.id === player.formation.active);
  const lvl = getFormationLevel(player);
  const mult = lvl.bonusMultiplier;
  return {
    atkBonus: formation.atkBonus * mult,
    defBonus: formation.defBonus * mult,
    spdBonus: formation.spdBonus * mult,
    name: formation.name,
  };
}

// 阵法特殊效果（战斗中触发）
function formationSpecialEffect(formation, player, enemy) {
  if (!formation) return null;
  const effects = {
    bagua: { name: '八卦迷阵', effect: '敌人陷入迷阵，命中率下降', dodgeBonus: 15 },
    taiji: { name: '太极卸力', effect: '以柔克刚，减少受到的伤害', damageReduction: 0.2 },
    zhuxian: { name: '诛仙剑气', effect: '诛仙四剑发动剑气攻击', damage: Math.floor(player.combatStats.attackMagic * 0.5) },
    dutian: { name: '都天神煞', effect: '煞气冲天，敌人恐惧', fear: true },
  };
  return effects[formation.id] || null;
}

module.exports = {
  FORMATIONS, FORMATION_LEVELS,
  initFormation, getFormationLevel, getLearnedFormations, getAvailableFormations,
  learnFormation, activateFormation, getFormationBonus, formationSpecialEffect,
};
