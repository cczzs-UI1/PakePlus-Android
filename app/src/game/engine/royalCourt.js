// 皇室系统：后妃位分（性别区分体系）、后宫晋升、选秀纳妃、皇帝继承
// 需求：皇子公主父母随机（皇帝+后妃）、后妃位分性别体系、后宫晋升途径、
//       皇帝死后随机子嗣继位、旧后宫变太后/太妃、每三年一月选秀、平时纳妃
const { randInt, randChoice, chance } = require('./utils');

// ③ 后妃位分体系（按皇帝性别区分，从高到低）
// 皇帝为男 → 女后宫位分；女帝 → 男后宫（面首）位分
const FEMALE_RANKS = ['皇后', '贵妃', '妃', '嫔', '贵人', '常在'];
const MALE_RANKS = ['皇夫', '君夫人', '贵君', '侍君', '良人', '御侍'];
const RANK_INDEX = {};
FEMALE_RANKS.forEach((r, i) => { RANK_INDEX[r] = i; });
MALE_RANKS.forEach((r, i) => { RANK_INDEX[r] = i; });

// 当前皇帝对应的后宫位分表
function consortRanks(emperor) {
  return emperor && emperor.gender === '女' ? MALE_RANKS : FEMALE_RANKS;
}
// 皇后位分名（女帝为皇夫）
function empressRankName(emperor) {
  return emperor && emperor.gender === '女' ? '皇夫' : '皇后';
}
// 旧皇后尊号（女帝旧皇夫为太君）
function dowagerEmpressRank(emperorGender) {
  return emperorGender === '女' ? '太君' : '太后';
}

// 组建后宫：为皇帝选皇后（皇夫）+ 3-5位妃嫔（皇帝死亡继位后调用）
// 只从未婚、非玩家三代亲属、非他人配偶、非同性别NPC中选；不足则新生成
function setupHaremForEmperor(state, emperor) {
  const emp = state.empire;
  if (!emp) return [];
  const events = [];
  const ranks = consortRanks(emperor);
  const empressRank = ranks[0];
  const { isCloseRelative } = require('./threeActStory');
  const player = state.player;
  const notMarriedToOthers = (n) => !n.family || !n.family.spouse;
  const notPlayerFamily = (n) => {
    if (!player || !player.family) return true;
    if (player.family.spouse === n.id) return false;
    if (player.family.father === n.id || player.family.mother === n.id) return false;
    if ((player.family.children || []).includes(n.id)) return false;
    if (isCloseRelative(player, n, state.npcs)) return false;
    return true;
  };
  const newConsortNpc = () => {
    const { generateNPC } = require('./npcGenerator');
    const n = generateNPC({ location: '大夏皇都', gender: emperor.gender === '女' ? '男' : '女', age: randInt(16, 32), realmLevel: 1, race: '人族' });
    state.npcs.push(n);
    return n;
  };

  // 皇后/皇夫
  let empress = null;
  const empressCandidates = state.npcs.filter(n =>
    n.gender !== emperor.gender && n.age >= 16 && n.age <= 40 && n.id !== emperor.id &&
    notMarriedToOthers(n) && notPlayerFamily(n) && !n.isDowager
  );
  if (empressCandidates.length > 0) {
    empress = randChoice(empressCandidates);
  } else {
    empress = newConsortNpc();
  }
  empress.profession = empressRank;
  empress.professionName = '大夏' + empressRank;
  empress.faction = '大夏皇室';
  empress.location = '大夏皇都';
  empress.isEmpress = true;
  empress.identity = '皇族';
  if (empress.publicInfo) empress.publicInfo.identity = '皇族';
  empress.isConsort = false;
  emp.harem.empress = empress.id;
  if (!emperor.family) emperor.family = { children: [], spouse: null };
  emperor.family.spouse = empress.id;
  if (!empress.family) empress.family = { children: [], spouse: null };
  empress.family.spouse = emperor.id;
  events.push(`册立${empress.name}为${empressRank}。`);

  // 妃嫔/面首 3-5 位（低阶位分）
  const consortCount = randInt(3, 5);
  const consortCandidates = state.npcs.filter(n =>
    n.gender !== emperor.gender && n.age >= 16 && n.age <= 35 &&
    n.id !== emperor.id && n.id !== empress.id &&
    notMarriedToOthers(n) && notPlayerFamily(n) && !n.isDowager
  );
  const pool = [...consortCandidates];
  for (let i = 0; i < consortCount; i++) {
    let consort;
    if (pool.length > 0) {
      consort = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    } else {
      consort = newConsortNpc();
    }
    const rank = ranks[randInt(2, ranks.length - 1)];
    consort.profession = rank;
    consort.professionName = '后宫' + rank;
    consort.faction = '大夏皇室';
    consort.location = '大夏皇都';
    consort.isConsort = true;
    consort.identity = '皇族';
    if (consort.publicInfo) consort.publicInfo.identity = '皇族';
    consort.consortRank = rank;
    if (!consort.family) consort.family = { children: [], spouse: null };
    consort.family.spouse = emperor.id;
    emp.harem.consorts.push(consort.id);
    if (!emperor.family.wives) emperor.family.wives = [];
    if (!emperor.family.wives.includes(consort.id)) emperor.family.wives.push(consort.id);
    events.push(`纳${consort.name}为${rank}。`);
  }
  return events;
}

// ④a 后宫晋升：皇后空缺时最高位妃嫔补位；每月概率随机晋升一位妃嫔
function tryPromoteConsorts(state) {
  const emp = state.empire;
  if (!emp) return [];
  const emperor = state.npcs.find(n => n.id === emp.emperorId);
  if (!emperor || emperor.isAlive === false) return [];
  const events = [];
  const ranks = consortRanks(emperor);
  const empressRank = ranks[0];

  // 皇后空缺补位
  const empressNpc = emp.harem.empress ? state.npcs.find(n => n.id === emp.harem.empress) : null;
  if (!empressNpc || empressNpc.isAlive === false) {
    const consorts = emp.harem.consorts
      .map(id => state.npcs.find(n => n.id === id))
      .filter(n => n && n.isAlive);
    if (consorts.length > 0) {
      const sorted = [...consorts].sort((a, b) =>
        (RANK_INDEX[a.consortRank] ?? 99) - (RANK_INDEX[b.consortRank] ?? 99)
      );
      const top = sorted[0];
      emp.harem.empress = top.id;
      emp.harem.consorts = emp.harem.consorts.filter(id => id !== top.id);
      top.isEmpress = true;
      top.identity = '皇族';
      if (top.publicInfo) top.publicInfo.identity = '皇族';
      top.isConsort = false;
      top.profession = empressRank;
      top.professionName = '大夏' + empressRank;
      emperor.family.spouse = top.id;
      if (!top.family) top.family = { children: [], spouse: null };
      top.family.spouse = emperor.id;
      events.push(`后宫空缺，册立${top.name}为${empressRank}。`);
    }
  }

  // 随机晋升：10%概率随机一位妃嫔升一级位分
  const consorts = emp.harem.consorts
    .map(id => state.npcs.find(n => n.id === id))
    .filter(n => n && n.isAlive);
  if (consorts.length > 0 && chance(10)) {
    const c = randChoice(consorts);
    const idx = RANK_INDEX[c.consortRank] ?? 99;
    if (idx > 1) {
      const newRank = ranks[idx - 1];
      c.profession = newRank;
      c.professionName = '后宫' + newRank;
      c.consortRank = newRank;
      events.push(`${c.name}晋为${newRank}。`);
    }
  }
  return events;
}

// ⑤ 选秀/纳妃：每3年1月选秀（官员子嗣+凡人，0-3人入宫）；平时每月小概率纳妃（未婚未孕凡人）
function tryImperialSelection(state, gameDate, gameDateText) {
  const emp = state.empire;
  if (!emp) return [];
  const emperor = state.npcs.find(n => n.id === emp.emperorId);
  if (!emperor || emperor.isAlive === false) return [];
  const events = [];
  const ranks = consortRanks(emperor);
  const isDraft = (gameDate.year % 3 === 0) && gameDate.month === 1;
  const count = isDraft ? randInt(0, 3) : (chance(6) ? 1 : 0);
  if (count === 0) return events;

  // 候选：官员子嗣 或 凡人（成年、未婚、未孕、非皇室、非后妃、非灵姬灵郎、性别与皇帝相异）
  const candidates = state.npcs.filter(n => {
    if (!n.isAlive || n.id === emperor.id) return false;
    if (n.gender === emperor.gender) return false;
    if (n.age < 16) return false; // ④ 后妃生成限成年
    if (n.family && n.family.spouse) return false;
    if (n.isPregnant) return false;
    if (n.isRoyal || n.isConsort || n.isEmpress || n.isDowager) return false;
    if (n.isWindFlower) return false;
    const father = n.family && n.family.father ? state.npcs.find(f => f.id === n.family.father) : null;
    const isOfficialChild = father && (father.isOfficial || /尚书|丞相|太尉|御史|大将军/.test(father.profession || ''));
    if (!isOfficialChild && (n.realmLevel || 1) > 1) return false;
    return true;
  });

  for (let i = 0; i < count && candidates.length > 0; i++) {
    const pick = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
    const rank = ranks[randInt(3, ranks.length - 1)];
    pick.profession = rank;
    pick.professionName = '后宫' + rank;
    pick.consortRank = rank;
    pick.faction = '大夏皇室';
    pick.location = '大夏皇都';
    pick.isConsort = true;
    pick.identity = '皇族';
    if (pick.publicInfo) pick.publicInfo.identity = '皇族';
    if (!pick.family) pick.family = { children: [], spouse: null };
    pick.family.spouse = emperor.id;
    if (!emperor.family.wives) emperor.family.wives = [];
    if (!emperor.family.wives.includes(pick.id)) emperor.family.wives.push(pick.id);
    emp.harem.consorts.push(pick.id);
    const src = isDraft ? '选秀' : '纳妃';
    const note = `${gameDateText || ''}·${src}：${pick.name}入宫，封${rank}。`;
    if (!pick.personalHistory) pick.personalHistory = [];
    pick.personalHistory.push(note);
    if (!emperor.personalHistory) emperor.personalHistory = [];
    emperor.personalHistory.push(`${gameDateText || ''}·${src}：${pick.name}入宫，封${rank}。`);
    events.push(`${src}：${pick.name}入宫，封${rank}。`);
  }
  return events;
}

// ④b 皇帝继承：皇帝死亡后随机在世子嗣继位；旧皇后/妃嫔转太后/太妃；新皇帝组建后宫
function succeedEmperor(state) {
  const emp = state.empire;
  if (!emp) return [];
  const old = state.npcs.find(n => n.id === emp.emperorId);
  if (!old || old.isAlive !== false) return []; // 只处理已驾崩的皇帝
  const events = [];
  const oldGender = old.gender;

  // 旧后宫转太后/太妃（旧皇后：太后/太君；妃嫔：太妃）
  const oldEmpress = emp.harem.empress ? state.npcs.find(n => n.id === emp.harem.empress) : null;
  if (oldEmpress) {
    oldEmpress.isEmpress = false;
    oldEmpress.isDowager = true;
    oldEmpress.profession = dowagerEmpressRank(oldGender);
    oldEmpress.professionName = '大夏' + dowagerEmpressRank(oldGender);
    oldEmpress.faction = '大夏皇室';
    events.push(`${oldEmpress.name}尊为${oldEmpress.professionName}。`);
  }
  for (const id of [...emp.harem.consorts]) {
    const c = state.npcs.find(n => n.id === id);
    if (!c) { emp.harem.consorts = emp.harem.consorts.filter(x => x !== id); continue; }
    c.isConsort = false;
    c.isDowager = true;
    c.profession = '太妃';
    c.professionName = '大夏太妃';
    c.faction = '大夏皇室';
    events.push(`${c.name}尊为太妃。`);
  }
  emp.harem.consorts = [];
  emp.harem.empress = null;

  // 随机在世子嗣继位
  const heirs = state.npcs.filter(n => n.isRoyal && n.isAlive && (emp.court.heirs || []).includes(n.id));
  const successor = heirs.length > 0 ? randChoice(heirs) : null;
  if (!successor) {
    events.push('先帝驾崩，膝下无子嗣继位，大夏皇位悬虚。');
    return events;
  }

  old.isEmperor = false;
  old.profession = '先帝';
  old.professionName = '大夏先帝';
  successor.isEmperor = true;
  successor.isRoyal = false;
  successor.identity = '皇族';
  if (successor.publicInfo) successor.publicInfo.identity = '皇族';
  successor.profession = '皇帝';
  successor.professionName = '大夏皇帝';
  successor.faction = '大夏皇室';
  successor.location = '大夏皇都';
  successor.silver = 999999;
  successor.spiritStone = 99999;
  emp.emperorId = successor.id;
  events.push(`${successor.name}继位，成为新一任大夏皇帝。`);

  // 新皇帝组建后宫
  events.push(...setupHaremForEmperor(state, successor));
  return events;
}

// 皇嗣父母随机：从 [皇后, ...妃嫔] 中随机选一位作为皇嗣之母（皇帝为其父）
function pickRoyalMother(state, empress, consortIds) {
  const pool = [empress, ...(consortIds || []).map(id => state.npcs.find(n => n.id === id)).filter(Boolean)];
  if (pool.length === 0) return empress;
  return randChoice(pool);
}

module.exports = {
  FEMALE_RANKS, MALE_RANKS, RANK_INDEX,
  consortRanks, empressRankName, dowagerEmpressRank,
  setupHaremForEmperor, tryPromoteConsorts, tryImperialSelection,
  succeedEmperor, pickRoyalMother,
};
