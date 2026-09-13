// 家族/子嗣/孕期系统
const { randInt, chance, clamp, genId } = require('./utils');
const { generateBaby } = require('./npcGenerator');
const { REALMS } = require('../data/realms');

// 孕率统一公式（需求13：由双方孕率属性决定，合理判定数值）
function calcPregnancyChance(male, female, opts = {}) {
  if (!male || !female || female.gender !== '女') return 0;
  let chance = (female.fertility || 25) * 0.5
    + (male.fertility || 40) * 0.3
    + (female.attributes?.physique || 20) * 0.3;
  // 年龄修正
  if (female.age > 45) chance -= 10;
  else if (female.age > 35) chance -= 5;
  if (female.age < 18) chance -= 8;
  // 根性接近
  const mp = male.spiritRoot?.purity || 50;
  const fp = female.spiritRoot?.purity || 50;
  if (Math.abs(mp - fp) < 20) chance += 5;
  // 送子丹
  if (female.inventory?.some(i => i.name === '送子丹' && i.count > 0)) chance += 40;
  // 婚配/情侣关系加成
  if (opts.relationship) chance += 10;
  return clamp(Math.round(chance), 5, 95);
}

// 受孕判定（统一使用孕率公式）
function tryConceive(male, female, gameState) {
  // 硬性条件
  if (female.gender !== '女') return { success: false, reason: '只有女性能怀孕' };
  if (female.age > female.lifespan * 0.7) return { success: false, reason: '年龄过大' };
  if (female.hp.current < female.hp.max * 0.8) return { success: false, reason: '气血不足' };
  if (female.isPregnant) return { success: false, reason: '已怀孕' };
  if (female.statusEffects?.some(s => ['虚弱', '重伤', '冰冻'].includes(s.name))) return { success: false, reason: '状态不佳' };

  // 概率计算（孕率公式）
  let probability = calcPregnancyChance(male, female, { relationship: true });

  // 送子丹：服用后必定受孕（消耗一颗）
  if (female.inventory?.some(i => i.name === '送子丹' && i.count > 0)) {
    probability = 100;
    const pill = female.inventory.find(i => i.name === '送子丹');
    pill.count--;
    if (pill.count <= 0) female.inventory = female.inventory.filter(i => i.name !== '送子丹');
  }

  if (chance(probability)) {
    female.isPregnant = true;
    female.pregnancyMonths = 0;
    female.pregnancyFather = male.id;
    return { success: true, months: 0 };
  }
  return { success: false, reason: '未受孕' };
}

// 孕期事件
function pregnancyEvent(npc) {
  const stage = npc.pregnancyMonths <= 3 ? 'early' : npc.pregnancyMonths <= 7 ? 'mid' : 'late';
  const events = {
    early: [
      { name: '灵气灌注', desc: '你感到腹中胎儿与你灵气相通，可顺势修炼或滋养胎儿。', options: ['顺势修炼（修为+500）', '滋养胎儿（子嗣根骨+5）'], effects: [{ cultivationExp: 500 }, { childBonus: { physique: 5 } }] },
      { name: '孕吐加剧', desc: '孕吐反应剧烈，身体有些虚弱。', options: ['强忍（气血-10%）', '休息（恢复20%）'], effects: [{ hpPercent: -10 }, { hpPercent: 20 }] },
      { name: '嗜酸如命', desc: '突然特别想吃酸的东西，口味大变。', options: ['买酸食（银两-50）', '忍住'], effects: [{ silver: -50 }, {}] },
      { name: '情绪波动', desc: '孕期情绪不稳，时而欢喜时而忧愁。', options: ['找人倾诉（好感+5）', '独自消化'], effects: [{ randomFavor: 5 }, {}] },
    ],
    mid: [
      { name: '胎动灵识', desc: '胎儿开始有了胎动，似乎能感知外界。', options: ['与之对话（神识+10）', '引导修炼（10%炼气）'], effects: [{ spirit: 10 }, { cultivationExp: 100 }] },
      { name: '灵力枯竭', desc: '胎儿吸收灵力过多，你感到灵力枯竭。', options: ['服用回灵丹', '强行压制（灵力上限-5%）'], effects: [{ item: '回灵丹' }, { mpMaxPercent: -5 }] },
      { name: '肚大如箩', desc: '肚子越来越大，行动有些不便。', options: ['减少活动', '坚持锻炼'], effects: [{}, { agility: -2 }] },
      { name: '胎梦吉祥', desc: '夜里做了一个吉祥的胎梦，预示胎儿不凡。', options: ['记下梦境', '找人解梦'], effects: [{ luck: 5 }, { reputation: 5 }] },
    ],
    late: [
      { name: '早产征兆', desc: '出现早产征兆，需要立即决定。', options: ['立即生产（成功率-20%）', '保胎（延后1月）'], effects: [{ birthPenalty: -20 }, { delayBirth: 1 }] },
      { name: '灵潮临盆', desc: '体内灵气涌动，似乎要提前临盆。', options: ['顺其自然（成功率+30%）', '布阵（额外+10%）'], effects: [{ birthBonus: 30 }, { birthBonus: 40 }] },
      { name: '宫缩频繁', desc: '宫缩越来越频繁，预产期快到了。', options: ['准备待产', '继续活动'], effects: [{}, { hpPercent: -5 }] },
      { name: '产前焦虑', desc: '临近生产，心中有些焦虑不安。', options: ['家人陪伴', '独自面对'], effects: [{ mental: 10 }, { mental: -5 }] },
    ],
  };
  if (chance(30)) {
    return events[stage][randInt(0, events[stage].length - 1)];
  }
  return null;
}

// 生产
function giveBirth(mother, father, gameState, surnameOpt) {
  let successRate = 70;
  successRate += mother.attributes?.physique * 0.2 || 0;
  successRate += (mother.hp.current / mother.hp.max) * 30;
  if (mother.inventory?.some(i => i.name === '顺产丹' && i.count > 0)) {
    successRate += 20;
    const pill = mother.inventory.find(i => i.name === '顺产丹');
    pill.count--;
  }
  if (mother.pregnancyMonths < 10) successRate -= 20; // 早产
  if (mother.age > 40) successRate -= 15;
  if (mother.age > 50) successRate -= 20;
  successRate = clamp(successRate, 15, 95);

  mother.isPregnant = false;
  mother.pregnancyMonths = 0;
  mother.pregnancyFather = null;
  // 产后恢复状态
  mother.statusEffects = mother.statusEffects || [];
  mother.statusEffects.push({ name: '产后虚弱', turns: 3 });

  // 双胞胎概率
  const isTwins = chance(5);

  if (chance(successRate)) {
    // 顺产
    mother.hp.current = Math.max(1, Math.floor(mother.hp.current * 0.7));
    const babies = [];
    const baby1 = generateBaby(father, mother, surnameOpt);
    babies.push(baby1);
    if (isTwins) {
      const baby2 = generateBaby(father, mother, surnameOpt);
      babies.push(baby2);
    }
    for (const baby of babies) {
      if (!mother.family) mother.family = { children: [], spouse: null };
      if (!mother.family.children) mother.family.children = [];
      mother.family.children.push(baby.id);
      // 需求：父子嗣同步——父亲family缺失时也创建并记录，保证家族/后宅/关系网一致（父亲为真实NPC且有id）
      if (father && father.id && father.id !== 'unknown') {
        if (!father.family) father.family = { children: [], spouse: null };
        if (!father.family.children) father.family.children = [];
        if (!father.family.children.includes(baby.id)) father.family.children.push(baby.id);
      }
      if (gameState && gameState.npcs) {
        gameState.npcs.push(baby);
      }
    }
    return {
      success: true,
      type: isTwins ? '双胞胎' : '顺产',
      babies,
      baby: babies[0],
      mother
    };
  } else if (chance(50)) {
    // 难产
    mother.hp.current = Math.max(1, Math.floor(mother.hp.current * 0.4));
    if (chance(40)) {
      return { success: false, type: '难产夭折', mother };
    }
    const baby = generateBaby(father, mother, surnameOpt);
    baby.attributes.physique = Math.floor((baby.attributes.physique || 50) * 0.8);
    if (gameState && gameState.npcs) gameState.npcs.push(baby);
    // 需求：难产分支也同步父母双方family（原逻辑只在mother.family存在时记录，且漏记father）
    if (!mother.family) mother.family = { children: [], spouse: null };
    if (!mother.family.children) mother.family.children = [];
    if (!mother.family.children.includes(baby.id)) mother.family.children.push(baby.id);
    if (father && father.id && father.id !== 'unknown') {
      if (!father.family) father.family = { children: [], spouse: null };
      if (!father.family.children) father.family.children = [];
      if (!father.family.children.includes(baby.id)) father.family.children.push(baby.id);
    }
    return { success: true, type: '难产', baby, mother };
  } else {
    // 大出血
    mother.hp.current = 1;
    mother.statusEffects.push({ name: '大出血', turns: 6 });
    return { success: false, type: '大出血', mother };
  }
}

// 继承算法
function calcInheritance(deceased, candidates) {
  const scored = candidates.map(c => {
    let score = 0;
    // 血缘分
    if (c.id === deceased.family.heirApparent) score += 50;
    if (deceased.family.children.includes(c.id)) {
      const isFirst = deceased.family.children[0] === c.id;
      score += isFirst ? 70 : 45;
    } else if (c.id === deceased.family.spouse) score += 60;
    else if (deceased.family.siblings?.includes(c.id)) score += 30;
    else score += 10;

    // 境界权重
    const realmDiff = c.realmLevel - deceased.realmLevel;
    score += realmDiff * 15;

    // 声望
    score += (c.reputation || 0) / 50;

    // 年龄
    if (c.age < 10) score -= 20;
    if (c.age > 80) score -= 10;

    // 随机扰动
    score += randInt(-5, 5);

    return { candidate: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// 家族产业收益
function calcIndustryIncome(family) {
  let income = 0;
  if (family.industries) {
    for (const ind of family.industries) {
      const baseIncome = { 灵田: 100, 矿脉: 150, 店铺: 250, 洞府: 0, 牧场: 80 }[ind.type] || 50;
      income += baseIncome * ind.level;
      // 维护费
      income -= ind.level * 10;
    }
  }
  return Math.floor(income);
}

// 子嗣成长
function growChild(child, months) {
  for (let i = 0; i < months; i++) {
    if (child.age <= 3) {
      // 襁褓期
      child.hp.max += Math.floor((child.attributes.physique * 0.5 + randInt(1, 5)) / 12);
    } else if (child.age <= 9) {
      // 启蒙期
      child.attributes.physique += 1;
      child.attributes.enlightenment += 1;
      child.attributes.spirit += 0.5;
      child.attributes.agility += 0.5;
    } else if (child.age <= 15) {
      // 筑基期
      child.cultivationExp += child.attributes.physique * 2 + child.spiritRoot.purity * 0.5;
    }
  }
}

module.exports = { tryConceive, calcPregnancyChance, pregnancyEvent, giveBirth, calcInheritance, calcIndustryIncome, growChild };
