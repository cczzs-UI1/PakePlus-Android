// NPC生成器
const { randInt, randChoice, randFloat, chance, genId, genName, getPortrait, clamp } = require('./utils');
const { RACES, SPIRIT_ROOTS, PROFESSIONS, MORTAL_PROFESSIONS, CULTIVATION_PROFESSIONS, IDENTITIES, IDENTITY_PROFESSIONS, IDENTITY_FACTIONS, rollMortalIdentity, getIdentityProfessionPool, getReasonableProfession } = require('../data/races');
const { REALMS, SUB_STAGES, calcStageExpNeed } = require('../data/realms');
const { PERSONALITIES, PERSONALITY_NAMES, LUST_TRAITS } = require('../data/personalities');
const { LOCATIONS, PLAYER_VISIBLE_LOCATIONS } = require('../data/locations');
const { getRandomTags, getTagInfo } = require('../data/tags');

// 出生地点池：按身份 zone 划分（只允许玩家地图可见地点，排除需要进入条件的特殊点）
const MORTAL_BIRTH_LOCATIONS = PLAYER_VISIBLE_LOCATIONS.filter(l => {
  const loc = LOCATIONS[l];
  return loc && loc.zone === '凡人界' && !loc.require;
});
const CULTIVATION_BIRTH_LOCATIONS = PLAYER_VISIBLE_LOCATIONS.filter(l => {
  const loc = LOCATIONS[l];
  return loc && loc.zone === '修仙界' && !loc.require;
});

// 身份解析：先生成身份，再按身份匹配职业/修为/出生地（需求：NPC生成规则重做）
// 优先顺序：显式身份 > 显式修为(>=2→修仙者) > 显式职业反推 > 显式地点zone > 完全随机
function resolveIdentity(options = {}) {
  if (options.identity) return options.identity;
  if (options.realmLevel !== undefined && options.realmLevel >= 2) return '修仙者';
  if (options.profession) {
    if (CULTIVATION_PROFESSIONS[options.profession]) return '修仙者';
    // 官场类职业 → 官员身份；其余凡人职业 → 平民身份
    if (['官员', '捕快', '将领', '士兵', '仵作'].includes(options.profession)) return '官员';
    return '平民';
  }
  if (options.location) {
    const loc = LOCATIONS[options.location];
    if (loc && loc.zone === '修仙界') return '修仙者';
    if (loc && loc.zone === '凡人界') return rollMortalIdentity();
  }
  return Math.random() < 0.25 ? '修仙者' : rollMortalIdentity();
}

// 修仙者修为：可随机（下限炼气境，随年龄提高上限）
function calcCultivationRealm(age, race) {
  return Math.max(2, calcStartingRealm(age, race));
}

// 按身份随机职业（含性别/修为过滤）
function rollProfessionByIdentity(identity, realmLevel, gender, location) {
  const pool = getIdentityProfessionPool(identity, realmLevel, gender);
  if (pool.length > 0) return randChoice(pool);
  return getReasonableProfession(realmLevel, gender, location) || (identity === '修仙者' ? '散修' : '农夫');
}

// 修为突破至炼气及以上时，身份自动变为修仙者并随机对应修仙职业（需求7）
function ensureCultivatorIdentity(npc) {
  if (!npc || npc.isAlive === false) return npc;
  // 皇室成员为血统身份（皇帝/皇后/妃嫔/皇嗣），修为突破后仍保持皇族身份，不强制转为修仙者
  if (npc.isRoyal || npc.isEmperor || npc.isEmpress || npc.isConsort) return npc;
  if (npc.realmLevel >= 2 && npc.identity !== '修仙者') {
    const oldIdentity = npc.identity || '凡人';
    npc.identity = '修仙者';
    if (!npc.publicInfo) npc.publicInfo = {};
    npc.publicInfo.identity = '修仙者';
    // 当前职业若非修仙职业 → 自动随机对应修仙职业
    const isCultProf = npc.profession && CULTIVATION_PROFESSIONS[npc.profession];
    if (!isCultProf) {
      const newProf = rollProfessionByIdentity('修仙者', npc.realmLevel, npc.gender, npc.location);
      npc.profession = newProf;
      const def = CULTIVATION_PROFESSIONS[newProf];
      if (def && def.levels) {
        npc.professionLevel = 0;
        npc.professionName = def.levels[0];
      } else {
        npc.professionName = newProf;
      }
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`突破至${npc.realm}，身份由${oldIdentity}变为修仙者，转修${newProf}之道。`);
    } else {
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`突破至${npc.realm}，身份由${oldIdentity}变为修仙者。`);
    }
  }
  return npc;
}

// 生成随机NPC
function generateNPC(options = {}) {
  const race = options.race || randChoice(['人族', '人族', '人族', '妖族', '魔族', '灵体']);
  const gender = options.gender || randChoice(['男', '女']);
  const age = options.age !== undefined ? options.age : randInt(16, 80);
  const name = options.name || genName(gender);

  // ===== 身份优先生成（需求：先身份 → 再职业/修为/出生地）=====
  const identity = resolveIdentity(options);
  // 按身份定修为：凡人身份→凡人境；修仙者→炼气及以上可随机
  const realmLevel = options.realmLevel !== undefined
    ? options.realmLevel
    : (identity === '修仙者' ? calcCultivationRealm(age, race) : 1);
  // 按身份定出生地点：凡人身份→凡人界；修仙者→修仙界
  const location = options.location || (identity === '修仙者'
    ? randChoice(CULTIVATION_BIRTH_LOCATIONS)
    : randChoice(MORTAL_BIRTH_LOCATIONS));
  // 按身份定职业（性别/修为过滤）
  const profession = options.profession || rollProfessionByIdentity(identity, realmLevel, gender, location);

  const realm = REALMS[realmLevel - 1];
  const subStage = options.subStage || randChoice(['前期', '中期', '后期']);
  const personality = options.personality || randChoice(PERSONALITY_NAMES);
  const lustTrait = options.lustTrait || randInt(1, 5);
  const customRanges = options.customRanges || null;
  const spiritRoot = options.spiritRoot || {
    type: randChoice(Object.keys(SPIRIT_ROOTS)),
    purity: randInt(30, 95),
  };

  const baseAttrs = calcBaseAttrs(race, realmLevel, spiritRoot.purity);

  const professionLevel = profession && PROFESSIONS[profession]?.levels ? randInt(0, PROFESSIONS[profession].levels.length - 1) : 0;

  // 势力归属：皇族/官员→大夏皇朝；平民→凡人界本地势力；修仙者→宗门/散修
  const faction = options.faction || (identity === '修仙者' || identity === '平民'
    ? generateFaction(location, race)
    : (IDENTITY_FACTIONS[identity] || '大夏皇朝'));

  // 出身父母姓名（供关系网/家族显示；玩家开局会创建真实父母NPC）
  const fatherName = options.fatherName || genName('男');
  const motherName = options.motherName || genName('女');
  const birthplace = options.birthplace || location;

  const npc = {
    id: genId('npc'),
    name,
    gender,
    race,
    age,
    identity,
    ageMonths: randInt(0, 11),
    lifespan: realm.lifespan,
    portrait: getPortrait(age, gender, customRanges),
    daoTitle: generateDaoTitle(realmLevel, personality),
    spiritRoot,
    lustTrait,
    lustTraitInfo: LUST_TRAITS[lustTrait],
    fertility: options.fertility !== undefined ? options.fertility : calcFertility(race, gender, age),
    personality,
    personalityInfo: PERSONALITIES[personality],
    likes: generateLikesDislikes('like', personality, gender, profession),
    dislikes: generateLikesDislikes('dislike', personality, gender, profession),
    realm: realm.name,
    realmLevel,
    subStage,
    cultivationExp: randInt(0, Math.floor(realm.expNeed * 0.8)),
    breakthroughExp: calcStageExpNeed(realmLevel, SUB_STAGES.indexOf(subStage)),
    attributes: baseAttrs,
    combatStats: calcCombatStats(baseAttrs, realmLevel),
    hp: { current: 0, max: 0 },
    mp: { current: 0, max: 0 },
    faction,
    profession,
    professionLevel,
    professionName: profession ? (PROFESSIONS[profession]?.levels ? PROFESSIONS[profession].levels[professionLevel] : profession) : null,
    location,
    targetLocation: null,
    action: '空闲',
    actionTurns: 0,
    schedule: generateSchedule(),
    personalityTraits: {
      aggressiveness: randInt(0, 100),
      greed: randInt(0, 100),
      loyalty: randInt(0, 100),
      kindness: randInt(0, 100),
    },
    status: {
      mood: '平静',
      health: 100,
      stamina: randInt(50, 100),
      wealth: randInt(100, 5000),
    },
    family: {
      father: null,
      mother: null,
      fatherName,
      motherName,
      spouse: null,
      children: [],
      siblings: [],
      lineage: null,
      heirApparent: null,
    },
    relations: {}, // npcId -> { type, strength }
    favorWithPlayer: 0,
    knownByPlayer: false,
    isAlive: true,
    isPregnant: false,
    pregnancyMonths: 0,
    masterDisciple: { master: null, disciples: [], swornBrothers: [] },
    skills: generateStartingSkills(realmLevel, profession),
    inventory: generateStartingInventory(realmLevel, profession),
    warehouse: generateWarehouse(realmLevel, profession),
    residence: generateResidence(location, realmLevel),
    tags: [], // 先初始化为空，后面根据条件分配
    personalHistory: [`出生于${birthplace}，父亲${fatherName}，母亲${motherName}`],
    publicInfo: {},
    privateInfo: {},
  };

  // 根据NPC属性分配符合条件的标签
  npc.tags = getRandomTags(randInt(2, 4), npc);

  // 应用标签效果到属性
  const { applyAllTagEffects } = require('../data/tags');
  applyAllTagEffects(npc);

  npc.hp.max = npc.combatStats.hp;
  npc.hp.current = npc.hp.max;
  npc.mp.max = npc.combatStats.mp;
  npc.mp.current = npc.mp.max;
  npc.publicInfo = {
    name: npc.name,
    age: npc.age,
    gender: npc.gender,
    identity: npc.identity,
    realm: npc.realm,
  };
  npc.privateInfo = {
    personality: npc.personality,
    family: npc.family,
    cultivationSkill: '未知',
  };

  return npc;
}

function calcStartingRealm(age, race) {
  if (age < 4) return 1;
  if (age < 10) return chance(30) ? 2 : 1;
  if (age < 16) return chance(50) ? 2 : 1;
  if (age < 25) {
    const r = Math.random();
    if (r < 0.3) return 1;
    if (r < 0.7) return 2;
    if (r < 0.9) return 3;
    return 4;
  }
  if (age < 40) {
    const r = Math.random();
    if (r < 0.1) return 2;
    if (r < 0.4) return 3;
    if (r < 0.7) return 4;
    if (r < 0.9) return 5;
    return 6;
  }
  if (age < 60) {
    const r = Math.random();
    if (r < 0.1) return 3;
    if (r < 0.3) return 4;
    if (r < 0.6) return 5;
    if (r < 0.85) return 6;
    return 7;
  }
  const r = Math.random();
  if (r < 0.1) return 4;
  if (r < 0.3) return 5;
  if (r < 0.55) return 6;
  if (r < 0.8) return 7;
  if (r < 0.95) return 8;
  return 9;
}

function calcBaseAttrs(race, realmLevel, rootPurity) {
  const raceData = RACES[race];
  const base = 20 + realmLevel * 8;
  return {
    // 基础五维
    physique: clamp(base + raceData.physiqueBonus + randInt(-10, 10), 1, 999),      // 根骨
    spirit: clamp(base + raceData.spiritBonus + randInt(-10, 10), 1, 999),          // 神识
    enlightenment: clamp(base + Math.floor(rootPurity / 5) + randInt(-10, 10), 1, 999), // 悟性
    agility: clamp(base + randInt(-10, 10), 1, 999),                                // 身法
    fateLuck: clamp(randInt(10, 80), 1, 100),                                       // 气运
    // 身体属性
    strength: clamp(base + raceData.physiqueBonus + randInt(-10, 10), 1, 999),      // 力量
    constitution: clamp(base + raceData.physiqueBonus + randInt(-10, 10), 1, 999),  // 体质
    perception: clamp(base + raceData.spiritBonus + randInt(-10, 10), 1, 999),      // 感知
    // 精神属性
    willpower: clamp(base + randInt(-10, 10), 1, 999),                              // 意志
    charm: clamp(base + randInt(-15, 15), 1, 999),                                  // 魅力
    // 社会属性
    reputation: clamp(randInt(0, 50), -100, 100),                                   // 声望
    merit: clamp(randInt(0, 30), 0, 1000),                                          // 功德
    sin: clamp(randInt(0, 20), 0, 1000),                                            // 罪孽
    // 特殊属性
    aggression: clamp(randInt(10, 60), 0, 100),                                     // 攻击性
    mystery: clamp(randInt(0, 50), 0, 100),                                         // 神秘
    lust: clamp(randInt(10, 50), 0, 100),                                           // 情欲
    purity: clamp(randInt(30, 80), 0, 100),                                         // 纯净
    intimidation: clamp(randInt(0, 40), 0, 100),                                    // 恐吓
  };
}

function calcCombatStats(attrs, realmLevel) {
  const realm = REALMS[realmLevel - 1];
  const coeff = realm.coefficient;
  return {
    hp: Math.floor(80 + attrs.physique * 2 + realmLevel * 30),
    mp: Math.floor(40 + attrs.spirit * 1.5 + realmLevel * 20),
    attackPhys: Math.floor(attrs.physique * 0.5 + realmLevel * 3),
    attackMagic: Math.floor(attrs.spirit * 0.5 + realmLevel * 3),
    defensePhys: Math.floor(attrs.physique * 0.3 + realmLevel * 2),
    defenseMagic: Math.floor(attrs.spirit * 0.3 + realmLevel * 2),
    critRate: clamp(5 + attrs.agility * 0.05, 1, 50),
    dodgeRate: clamp(3 + attrs.agility * 0.05, 0, 40),
  };
}

function generateDaoTitle(realmLevel, personality) {
  const prefixes = ['清风', '明月', '流云', '孤鸿', '寒江', '雪夜', '烟雨', '醉仙', '忘忧', '追梦', '凌霄', '碧落', '黄泉', '赤霄', '紫电', '青霜', '白云', '苍梧', '玄冰', '烈焰'];
  const suffixes = ['道人', '真人', '居士', '散人', '子', '客', '翁', '叟', '姬', '娘', '仙子', '尊者', '老祖', '真君'];
  if (realmLevel < 3) return null;
  if (realmLevel < 5) return randChoice(prefixes) + randChoice(suffixes.slice(0, 4));
  return randChoice(prefixes) + randChoice(suffixes);
}

function generateFaction(location, race) {
  const loc = LOCATIONS[location];
  if (!loc) return '散修';
  if (loc.zone === '凡人界') return randChoice(['大夏皇朝', '散修', '本地乡绅']);
  if (loc.zone === '修仙界') {
    if (location === '青云剑宗') return '青云剑宗';
    return randChoice(['青云剑宗', '散修', '丹塔', '天星阁']);
  }
  if (loc.zone === '魔界') return randChoice(['魔域', '血煞教', '散魔']);
  if (loc.zone === '冥界') return randChoice(['酆都', '散修']);
  return '散修';
}

// 生成NPC物品喜恶
function generateLikesDislikes(type, personality, gender, profession) {
  const allItems = ['回灵丹', '回春丹', '筑基丹', '聚气丹', '清心丹', '解毒丹',
    '铁剑', '钢刀', '长枪', '弓箭', '皮甲', '铁甲',
    '青锋剑', '飞剑', '法袍', '拂尘', '玉如意',
    '玉佩', '玉簪', '戒指', '储物戒', '护身符',
    '人参', '鹿茸', '阿胶', '茶叶', '酒', '丝绸',
    '胭脂', '香水', '珠宝', '古董', '书籍', '笔墨纸砚',
    '精铁', '灵草', '聚灵草', '妖丹', '玄铁',
    '疾风符', '天雷符', '净魔符'];

  // 根据性格和职业偏好
  const personalityLikes = {
    '温和宽厚': ['茶叶', '书籍', '玉佩', '回春丹'],
    '阴险狡诈': ['毒药', '珠宝', '天雷符'],
    '贪婪': ['珠宝', '灵石', '古董', '储物戒'],
    '狡诈': ['珠宝', '毒药', '古董'],
    '豪爽': ['酒', '钢刀', '长枪', '珠宝'],
    '孤僻': ['书籍', '玉佩', '清心丹', '聚灵草'],
    '淫荡风骚': ['胭脂', '香水', '珠宝', '回春丹'],
    '欲求不满': ['胭脂', '香水', '珠宝', '回春丹'],
    '媚骨天生': ['胭脂', '香水', '玉簪', '丝绸'],
    '浪荡不羁': ['酒', '珠宝', '古董'],
  };

  const professionLikes = {
    '炼丹师': ['回灵丹', '回春丹', '聚气丹', '灵草', '聚灵草'],
    '炼器师': ['精铁', '玄铁', '妖丹', '铁剑', '青锋剑'],
    '阵法师': ['玉佩', '护身符', '书籍'],
    '符师': ['疾风符', '天雷符', '净魔符', '笔墨纸砚'],
    '剑修': ['铁剑', '青锋剑', '飞剑', '拂尘'],
    '体修': ['铁甲', '长枪', '钢刀', '人参'],
    '商人': ['珠宝', '古董', '丝绸', '茶叶'],
    '书生': ['书籍', '笔墨纸砚', '茶叶', '玉佩'],
    '医生': ['人参', '鹿茸', '阿胶', '回春丹', '解毒丹'],
    '厨师': ['酒', '茶叶', '人参', '鹿茸'],
    '裁缝': ['丝绸', '胭脂', '香水', '玉簪'],
    '歌姬': ['胭脂', '香水', '珠宝', '玉簪'],
    '丫鬟': ['胭脂', '香水', '丝绸', '玉佩'],
  };

  let preferred = [];
  if (personalityLikes[personality]) preferred = preferred.concat(personalityLikes[personality]);
  if (professionLikes[profession]) preferred = preferred.concat(professionLikes[profession]);
  if (gender === '女') preferred = preferred.concat(['胭脂', '香水', '玉簪', '丝绸', '珠宝']);
  if (gender === '男') preferred = preferred.concat(['酒', '钢刀', '长枪', '古董']);

  // 去重
  preferred = [...new Set(preferred)];

  if (type === 'like') {
    // 从偏好中随机选3-5个
    const count = randInt(3, 5);
    const shuffled = preferred.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } else {
    // 从非偏好中随机选2-3个作为不喜欢
    const disliked = allItems.filter(i => !preferred.includes(i));
    const count = randInt(2, 3);
    const shuffled = disliked.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}

function generateSchedule() {
  return {
    '卯时': '起床打坐',
    '辰时': '工作/修炼',
    '巳时': '工作/修炼',
    '午时': '用膳/休息',
    '未时': '工作/修炼',
    '申时': '社交/探索',
    '酉时': '回家/修炼',
    '戌时': '休闲/社交',
    '亥时': '就寝',
  };
}

function generateStartingSkills(realmLevel, profession) {
  const skills = [];
  const basicSkills = ['吐纳术', '铁布衫'];
  skills.push(...basicSkills);
  if (realmLevel >= 2) skills.push('御剑术');
  if (realmLevel >= 3) skills.push(randChoice(['青莲剑诀', '寒冰盾', '回春术']));
  if (profession === '炼丹师') skills.push('丹火术');
  return skills;
}

function generateStartingInventory(realmLevel, profession) {
  const items = [];
  items.push({ name: '回灵丹', count: randInt(3, 10) });
  items.push({ name: '回春丹', count: randInt(2, 5) });
  if (realmLevel >= 3) items.push({ name: '筑基丹', count: chance(50) ? 1 : 0 });
  if (profession) items.push({ name: profession === '炼丹师' ? '丹炉' : profession === '炼器师' ? '炼器锤' : profession === '阵法师' ? '阵盘' : '符笔', count: 1 });
  return items.filter(i => i.count > 0);
}

function generateResidence(location, realmLevel) {
  const levels = ['茅屋', '茅屋', '瓦房', '独院', '府邸', '庄园'];
  const level = realmLevel >= 6 ? 5 : realmLevel >= 4 ? 4 : realmLevel >= 3 ? 3 : realmLevel >= 2 ? 2 : 1;
  return {
    address: `${location}·${levels[level - 1]}`,
    houseLevel: level,
    houseName: levels[level - 1],
    visitors: [],
  };
}

// 生成婴儿NPC
function generateBaby(father, mother, surnameOpt) {
  const gender = randChoice(['男', '女']);
  const race = determineRace(father.race, mother.race);
  const spiritRoot = inheritSpiritRoot(father, mother);
  const attrs = inheritAttrs(father, mother);
  const name = genName(gender, surnameOpt);

  const baby = {
    id: genId('npc'),
    name,
    gender,
    race,
    age: 0,
    ageMonths: 0,
    lifespan: (RACES[race] || RACES['人族+妖族'] || RACES['人族']).lifespan,
    portrait: getPortrait(0, gender, null),
    daoTitle: null,
    spiritRoot,
    lustTrait: 3,
    lustTraitInfo: LUST_TRAITS[3],
    personality: randChoice(PERSONALITY_NAMES),
    personalityInfo: null,
    realm: '凡人境',
    realmLevel: 1,
    subStage: '前期',
    cultivationExp: 0,
    breakthroughExp: calcStageExpNeed(1, 0), // 凡人境无修为需求，满即尝试突破入炼气
    attributes: attrs,
    combatStats: calcCombatStats(attrs, 1),
    hp: { current: 50, max: 50 },
    mp: { current: 30, max: 30 },
    faction: father.faction,
    profession: null,
    professionLevel: 0,
    professionName: null,
    location: father.location,
    targetLocation: null,
    guardian: null,      // 扶养人 id（需求：扶养人属性）
    guardianName: null,  // 扶养人姓名
    legitimacy: '私生子女', // 亲子女/庶子女/私生子女
    action: '襁褓中',
    actionTurns: 0,
    schedule: {},
    personalityTraits: { aggressiveness: 10, greed: 10, loyalty: 50, kindness: 50 },
    status: { mood: '平静', health: 100, stamina: 100, wealth: 0 },
    family: {
      father: father.id,
      mother: mother.id,
      spouse: null,
      children: [],
      siblings: [],
      lineage: (father.family && father.family.lineage) || father.name + '家',
      heirApparent: null,
    },
    relations: {},
    favorWithPlayer: 50,
    knownByPlayer: false,
    isAlive: true,
    isPregnant: false,
    pregnancyMonths: 0,
    skills: [],
    inventory: [],
    residence: father.residence,
    personalHistory: [`出生于${father.location}，父亲${father.name}，母亲${mother.name}`],
    publicInfo: {},
    privateInfo: {},
    growthStage: '襁褓期',
    innateTrait: rollInnateTrait(),
  };
  baby.personalityInfo = PERSONALITIES[baby.personality];
  baby.publicInfo = { name: baby.name, age: 0, gender: baby.gender, identity: '婴儿', realm: '凡人境' };
  baby.privateInfo = { personality: baby.personality, family: baby.family, innateTrait: baby.innateTrait };
  return baby;
}

function determineRace(race1, race2) {
  if (race1 === race2) return race1;
  if (race1 === '魔族' || race2 === '魔族') return '魔族';
  if ((race1 === '人族' && race2 === '妖族') || (race1 === '妖族' && race2 === '人族')) return chance(50) ? '人族' : '半妖';
  if (race1 === '灵体' || race2 === '灵体') return '灵体';
  return randChoice([race1, race2]);
}

function inheritSpiritRoot(father, mother) {
  let type;
  const r = Math.random();
  if (r < 0.5) type = randChoice([father.spiritRoot.type, mother.spiritRoot.type]);
  else if (r < 0.8) type = randChoice(SPIRIT_ROOTS);
  else type = chance(5) ? '混沌' : randChoice(SPIRIT_ROOTS);
  const purity = clamp(Math.floor((father.spiritRoot.purity + mother.spiritRoot.purity) / 2 + randInt(-15, 15)), 5, 100);
  return { type, purity };
}

function inheritAttrs(father, mother) {
  return {
    physique: clamp(Math.floor((father.attributes.physique + mother.attributes.physique) / 2 + randInt(-10, 10)), 1, 999),
    spirit: clamp(Math.floor((father.attributes.spirit + mother.attributes.spirit) / 2 + randInt(-10, 10)), 1, 999),
    enlightenment: clamp(Math.floor((father.attributes.enlightenment + mother.attributes.enlightenment) / 2 + randInt(-10, 10)), 1, 999),
    agility: clamp(Math.floor((father.attributes.agility + mother.attributes.agility) / 2 + randInt(-10, 10)), 1, 999),
    fateLuck: clamp(randInt(10, 80), 1, 100),
  };
}

function rollInnateTrait() {
  const r = Math.random();
  if (r < 0.75) return '普通凡人';
  if (r < 0.90) return '修炼天才';
  if (r < 0.94) return '天生圣体';
  if (r < 0.95) return '废柴逆袭';
  if (r < 0.99) return '双胞胎';
  return '先天道胎';
}

// 生成NPC库房（根据身份职业随机）
function generateWarehouse(realmLevel, profession) {
  const warehouse = {
    spiritStone: randInt(100, 5000) * realmLevel,
    items: [],
    valuables: [],
  };

  // 根据职业生成库房物品
  const professionItems = {
    warrior: ['精铁', '妖兽皮', '疗伤药', '烈酒', '盔甲碎片'],
    merchant: ['丝绸', '香料', '珠宝', '古董', '茶叶'],
    scholar: ['古籍', '笔墨纸砚', '字画', '印章', '书籍'],
    doctor: ['药材', '银针', '药臼', '药方', '药罐'],
    blacksmith: ['矿石', '煤炭', '铁锭', '锻造锤', '淬火油'],
    farmer: ['粮食', '蔬菜', '种子', '农具', '家禽'],
    fisherman: ['鱼干', '渔网', '鱼钩', '珍珠', '海盐'],
    hunter: ['兽皮', '兽肉', '箭矢', '陷阱', '鹿角'],
    cultivator: ['灵石', '丹药', '符箓', '法器', '灵草'],
    alchemist: ['丹炉', '药材', '丹方', '灵火', '药鼎'],
    musician: ['古琴', '笛子', '乐谱', '琴弦', '玉箫'],
    dancer: ['舞衣', '丝带', '花钿', '胭脂', '玉佩'],
    courtesan: ['丝绸', '胭脂', '珠宝', '香水', '情书'],
    monk: ['佛经', '木鱼', '袈裟', '念珠', '檀香'],
    taoist: ['道经', '桃木剑', '符箓', '八卦镜', '拂尘'],
    official: ['官印', '文书', '官服', '俸禄', '令牌'],
    thief: ['撬锁工具', '夜行衣', '迷药', '赃物', '匕首'],
    assassin: ['淬毒匕首', '夜行衣', '暗器', '毒药', '钢丝'],
  };

  const items = professionItems[profession] || professionItems.cultivator;
  const itemCount = randInt(3, 8);
  for (let i = 0; i < itemCount; i++) {
    const itemName = randChoice(items);
    const existing = warehouse.items.find(it => it.name === itemName);
    if (existing) existing.count += randInt(1, 5);
    else warehouse.items.push({ name: itemName, count: randInt(1, 5) });
  }

  // 贵重物品
  if (chance(30)) {
    warehouse.valuables.push({ name: '祖传宝物', value: randInt(500, 5000), desc: '家族传承的宝物' });
  }
  if (realmLevel >= 4 && chance(40)) {
    warehouse.valuables.push({ name: '修炼资源', value: randInt(1000, 10000), desc: '珍贵的修炼材料' });
  }

  return warehouse;
}


// 孕率属性计算（需求13：主控与所有NPC均有孕率，怀孕判定由孕率决定）
function calcFertility(race, gender, age) {
  let base = gender === '女' ? randInt(25, 65) : randInt(30, 70);
  if (race === '妖族') base += randInt(5, 15);
  if (race === '灵体') base -= randInt(10, 25);
  if (race === '魔族') base -= randInt(5, 15);
  if (age > 45) base -= 20;
  else if (age > 35) base -= 10;
  else if (age < 18) base -= 5;
  return clamp(base, 5, 90);
}

module.exports = { generateNPC, generateBaby, calcCombatStats, calcStartingRealm, generateWarehouse, generateLikesDislikes, resolveIdentity, ensureCultivatorIdentity };
