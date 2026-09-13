// 标签条件系统 - 定义每个标签的获取条件
// 人物需满足条件后才能拥有对应标签

const TAG_CONDITIONS = {
  // ===== 身体特征标签 =====
  beautiful: {
    desc: '魅力≥80',
    check: (e) => (e.attributes?.charm || 0) >= 80,
  },
  handsome: {
    desc: '魅力≥70，男性',
    check: (e) => (e.attributes?.charm || 0) >= 70 && e.gender === '男',
  },
  ugly: {
    desc: '魅力≤30',
    check: (e) => (e.attributes?.charm || 0) <= 30,
  },
  strong: {
    desc: '力量≥70，体质≥60',
    check: (e) => (e.attributes?.strength || 0) >= 70 && (e.attributes?.constitution || 0) >= 60,
  },
  weak: {
    desc: '体质≤30',
    check: (e) => (e.attributes?.constitution || 0) <= 30,
  },
  tall: {
    desc: '力量≥60',
    check: (e) => (e.attributes?.strength || 0) >= 60,
  },
  short: {
    desc: '敏捷≥60，力量≤50',
    check: (e) => (e.attributes?.agility || 0) >= 60 && (e.attributes?.strength || 0) <= 50,
  },
  scar: {
    desc: '年龄≥20，经历过战斗',
    check: (e) => e.age >= 20,
  },
  tattoo: {
    desc: '年龄≥18，神秘≥40',
    check: (e) => e.age >= 18 && (e.attributes?.mystery || 0) >= 40,
  },
  heterochromia: {
    desc: '天生异相，感知≥60',
    check: (e) => (e.attributes?.perception || 0) >= 60,
  },
  silver_hair: {
    desc: '年龄≥50或修为≥筑基',
    check: (e) => e.age >= 50 || (e.realmLevel || 0) >= 3,
  },
  red_hair: {
    desc: '攻击性≥50',
    check: (e) => (e.attributes?.aggression || 0) >= 50,
  },
  delicate: {
    desc: '魅力≥65，体质≤50',
    check: (e) => (e.attributes?.charm || 0) >= 65 && (e.attributes?.constitution || 0) <= 50,
  },
  muscular: {
    desc: '力量≥75',
    check: (e) => (e.attributes?.strength || 0) >= 75,
  },
  limp: {
    desc: '敏捷≤30',
    check: (e) => (e.attributes?.agility || 0) <= 30,
  },
  blind: {
    desc: '感知≥70，视力缺陷',
    check: (e) => (e.attributes?.perception || 0) >= 70,
  },
  deaf: {
    desc: '感知≥60，听力缺陷',
    check: (e) => (e.attributes?.perception || 0) >= 60,
  },
  eunuch: {
    desc: '已净身，男性',
    check: (e) => e.gender === '男' && e.isEunuch,
  },
  virgin: {
    desc: '未经历人事，纯净≥50',
    check: (e) => !e.hasHadSex && (e.attributes?.purity || 0) >= 50,
  },
  experienced: {
    desc: '经历人事≥5次，魅力≥50',
    check: (e) => (e.sexCount || 0) >= 5 && (e.attributes?.charm || 0) >= 50,
  },

  // ===== 性格特质标签 =====
  loyal: {
    desc: '意志≥60，功德≥30',
    check: (e) => (e.attributes?.willpower || 0) >= 60 && (e.karma?.merit || 0) >= 30,
  },
  treacherous: {
    desc: '悟性≥60，罪孽≥30',
    check: (e) => (e.attributes?.enlightenment || 0) >= 60 && (e.karma?.sin || 0) >= 30,
  },
  brave: {
    desc: '意志≥60，力量≥50',
    check: (e) => (e.attributes?.willpower || 0) >= 60 && (e.attributes?.strength || 0) >= 50,
  },
  cowardly: {
    desc: '意志≤30',
    check: (e) => (e.attributes?.willpower || 0) <= 30,
  },
  wise: {
    desc: '悟性≥70，年龄≥30',
    check: (e) => (e.attributes?.enlightenment || 0) >= 70 && e.age >= 30,
  },
  foolish: {
    desc: '悟性≤30',
    check: (e) => (e.attributes?.enlightenment || 0) <= 30,
  },
  generous: {
    desc: '功德≥40，声望≥30',
    check: (e) => (e.karma?.merit || 0) >= 40 && (e.reputation || 0) >= 30,
  },
  humble: {
    desc: '意志≥50，魅力≥40',
    check: (e) => (e.attributes?.willpower || 0) >= 50 && (e.attributes?.charm || 0) >= 40,
  },
  proud: {
    desc: '声望≥50，修为≥筑基',
    check: (e) => (e.reputation || 0) >= 50 && (e.realmLevel || 0) >= 3,
  },
  chaste: {
    desc: '纯净≥70，意志≥50',
    check: (e) => (e.attributes?.purity || 0) >= 70 && (e.attributes?.willpower || 0) >= 50,
  },
  lustful: {
    desc: '情欲≥60',
    check: (e) => (e.attributes?.lust || 0) >= 60,
  },
  vengeful: {
    desc: '意志≥50，罪孽≥20',
    check: (e) => (e.attributes?.willpower || 0) >= 50 && (e.karma?.sin || 0) >= 20,
  },
  forgiving: {
    desc: '功德≥50，意志≥40',
    check: (e) => (e.karma?.merit || 0) >= 50 && (e.attributes?.willpower || 0) >= 40,
  },
  mysterious: {
    desc: '神秘≥60',
    check: (e) => (e.attributes?.mystery || 0) >= 60,
  },

  // ===== 身份背景标签 =====
  commoner: {
    desc: '凡人身份，银两≤500',
    check: (e) => (e.realmLevel || 0) <= 2 && (e.silver || 0) <= 500,
  },
  poor: {
    desc: '银两≤100，灵石≤10',
    check: (e) => (e.silver || 0) <= 100 && (e.spiritStones || 0) <= 10,
  },
  scholar: {
    desc: '悟性≥60，职业为文人相关',
    check: (e) => (e.attributes?.enlightenment || 0) >= 60,
  },
  military: {
    desc: '力量≥60，职业为武将相关',
    check: (e) => (e.attributes?.strength || 0) >= 60,
  },
  merchant: {
    desc: '悟性≥50，银两≥1000',
    check: (e) => (e.attributes?.enlightenment || 0) >= 50 && (e.silver || 0) >= 1000,
  },
  farmer: {
    desc: '体质≥50，凡人身份',
    check: (e) => (e.attributes?.constitution || 0) >= 50 && (e.realmLevel || 0) <= 2,
  },
  artisan: {
    desc: '悟性≥50，有手艺',
    check: (e) => (e.attributes?.enlightenment || 0) >= 50,
  },
  criminal: {
    desc: '罪孽≥50',
    check: (e) => (e.karma?.sin || 0) >= 50,
  },
  refugee: {
    desc: '银两≤50，气运≤30',
    check: (e) => (e.silver || 0) <= 50 && (e.attributes?.fateLuck || 0) <= 30,
  },
  retired: {
    desc: '年龄≥50',
    check: (e) => e.age >= 50,
  },
  wanted: {
    desc: '罪孽≥60，声望≤-20',
    check: (e) => (e.karma?.sin || 0) >= 60 && (e.reputation || 0) <= -20,
  },
  bounty_hunter: {
    desc: '力量≥60，敏捷≥50，年龄≥20',
    check: (e) => (e.attributes?.strength || 0) >= 60 && (e.attributes?.agility || 0) >= 50 && e.age >= 20,
  },
  doctor: {
    desc: '悟性≥60，有医术',
    check: (e) => (e.attributes?.enlightenment || 0) >= 60,
  },
  poisoner: {
    desc: '悟性≥60，罪孽≥30',
    check: (e) => (e.attributes?.enlightenment || 0) >= 60 && (e.karma?.sin || 0) >= 30,
  },
  thief: {
    desc: '敏捷≥60，罪孽≥20',
    check: (e) => (e.attributes?.agility || 0) >= 60 && (e.karma?.sin || 0) >= 20,
  },
  assassin: {
    desc: '敏捷≥70，罪孽≥50，年龄≥18',
    check: (e) => (e.attributes?.agility || 0) >= 70 && (e.karma?.sin || 0) >= 50 && e.age >= 18,
  },

  // ===== 特殊际遇标签 =====
  reincarnated: {
    desc: '特殊际遇，修为≥金丹',
    check: (e) => (e.realmLevel || 0) >= 5,
  },
  transmigrated: {
    desc: '特殊际遇，悟性≥70',
    check: (e) => (e.attributes?.enlightenment || 0) >= 70,
  },
  blessed: {
    desc: '气运≥80，功德≥50',
    check: (e) => (e.attributes?.fateLuck || 0) >= 80 && (e.karma?.merit || 0) >= 50,
  },
  demon_possessed: {
    desc: '罪孽≥60，修为≥筑基',
    check: (e) => (e.karma?.sin || 0) >= 60 && (e.realmLevel || 0) >= 3,
  },
  spirit_guide: {
    desc: '感知≥70，修为≥筑基',
    check: (e) => (e.attributes?.perception || 0) >= 70 && (e.realmLevel || 0) >= 3,
  },
  ancient_inheritance: {
    desc: '修为≥金丹，悟性≥60',
    check: (e) => (e.realmLevel || 0) >= 5 && (e.attributes?.enlightenment || 0) >= 60,
  },
  bloodline: {
    desc: '特殊血脉，力量≥70或体质≥70',
    check: (e) => (e.attributes?.strength || 0) >= 70 || (e.attributes?.constitution || 0) >= 70,
  },
  innately_weak: {
    desc: '体质≤25，修为≤炼气',
    check: (e) => (e.attributes?.constitution || 0) <= 25 && (e.realmLevel || 0) <= 2,
  },
  photographic_memory: {
    desc: '悟性≥80，感知≥60',
    check: (e) => (e.attributes?.enlightenment || 0) >= 80 && (e.attributes?.perception || 0) >= 60,
  },
  battle_genius: {
    desc: '力量≥70，敏捷≥60，修为≥筑基',
    check: (e) => (e.attributes?.strength || 0) >= 70 && (e.attributes?.agility || 0) >= 60 && (e.realmLevel || 0) >= 3,
  },
  forge_genius: {
    desc: '悟性≥70，力量≥60',
    check: (e) => (e.attributes?.enlightenment || 0) >= 70 && (e.attributes?.strength || 0) >= 60,
  },
  formation_genius: {
    desc: '悟性≥75，感知≥60',
    check: (e) => (e.attributes?.enlightenment || 0) >= 75 && (e.attributes?.perception || 0) >= 60,
  },
  beast_tamer: {
    desc: '魅力≥60，感知≥60',
    check: (e) => (e.attributes?.charm || 0) >= 60 && (e.attributes?.perception || 0) >= 60,
  },
  lucky_star: {
    desc: '气运≥85',
    check: (e) => (e.attributes?.fateLuck || 0) >= 85,
  },
  unlucky: {
    desc: '气运≤20',
    check: (e) => (e.attributes?.fateLuck || 0) <= 20,
  },
  wealthy_encounter: {
    desc: '气运≥70，声望≥30',
    check: (e) => (e.attributes?.fateLuck || 0) >= 70 && (e.reputation || 0) >= 30,
  },

  // ===== 情感状态标签 =====
  love_rival: {
    desc: '有情敌关系',
    check: (e) => e.hasLoveRival,
  },
  jealous_love: {
    desc: '已婚或有伴侣，意志≤50',
    check: (e) => (e.family?.spouse || e.hasPartner) && (e.attributes?.willpower || 0) <= 50,
  },
  unrequited: {
    desc: '有暗恋对象，魅力≤60',
    check: (e) => e.hasCrush && (e.attributes?.charm || 0) <= 60,
  },
  married: {
    desc: '已婚',
    check: (e) => !!e.family?.spouse,
  },
  widowed: {
    desc: '丧偶',
    check: (e) => e.isWidowed,
  },
  divorced: {
    desc: '和离',
    check: (e) => e.isDivorced,
  },
  engaged: {
    desc: '已定亲',
    check: (e) => e.isEngaged,
  },
  secret_lover: {
    desc: '有地下情人',
    check: (e) => e.hasSecretLover,
  },
  betrayed: {
    desc: '曾被背叛',
    check: (e) => e.wasBetrayed,
  },
  grateful: {
    desc: '有恩人，功德≥30',
    check: (e) => e.hasBenefactor && (e.karma?.merit || 0) >= 30,
  },
  vengeful_love: {
    desc: '因爱生恨，罪孽≥30',
    check: (e) => e.hasVengefulLove && (e.karma?.sin || 0) >= 30,
  },
  longing: {
    desc: '有思念的人，魅力≥50',
    check: (e) => e.hasLonging && (e.attributes?.charm || 0) >= 50,
  },
  content: {
    desc: '功德≥40，意志≥50',
    check: (e) => (e.karma?.merit || 0) >= 40 && (e.attributes?.willpower || 0) >= 50,
  },
  ambitious: {
    desc: '悟性≥60，声望≥20',
    check: (e) => (e.attributes?.enlightenment || 0) >= 60 && (e.reputation || 0) >= 20,
  },
  depressed: {
    desc: '意志≤40，气运≤40',
    check: (e) => (e.attributes?.willpower || 0) <= 40 && (e.attributes?.fateLuck || 0) <= 40,
  },
  excited: {
    desc: '力量≥50，攻击性≥40',
    check: (e) => (e.attributes?.strength || 0) >= 50 && (e.attributes?.aggression || 0) >= 40,
  },
  calm: {
    desc: '意志≥60，感知≥50',
    check: (e) => (e.attributes?.willpower || 0) >= 60 && (e.attributes?.perception || 0) >= 50,
  },
  angry: {
    desc: '攻击性≥60，意志≤50',
    check: (e) => (e.attributes?.aggression || 0) >= 60 && (e.attributes?.willpower || 0) <= 50,
  },
  fearful: {
    desc: '意志≤35，力量≤40',
    check: (e) => (e.attributes?.willpower || 0) <= 35 && (e.attributes?.strength || 0) <= 40,
  },

  // ===== 修为特质标签 =====
  qi_sensation: {
    desc: '感知≥60，修为≥炼气',
    check: (e) => (e.attributes?.perception || 0) >= 60 && (e.realmLevel || 0) >= 1,
  },
  slow_cultivator: {
    desc: '悟性≤40，修为≤筑基',
    check: (e) => (e.attributes?.enlightenment || 0) <= 40 && (e.realmLevel || 0) <= 3,
  },
  bottleneck_prone: {
    desc: '悟性≤50，意志≥50',
    check: (e) => (e.attributes?.enlightenment || 0) <= 50 && (e.attributes?.willpower || 0) >= 50,
  },
  smooth_sailing: {
    desc: '悟性≥70，气运≥60',
    check: (e) => (e.attributes?.enlightenment || 0) >= 70 && (e.attributes?.fateLuck || 0) >= 60,
  },
  combat_cultivator: {
    desc: '力量≥60，修为≥筑基',
    check: (e) => (e.attributes?.strength || 0) >= 60 && (e.realmLevel || 0) >= 3,
  },
  meditation_cultivator: {
    desc: '感知≥60，意志≥60',
    check: (e) => (e.attributes?.perception || 0) >= 60 && (e.attributes?.willpower || 0) >= 60,
  },
  dual_cultivator: {
    desc: '魅力≥60，修为≥筑基',
    check: (e) => (e.attributes?.charm || 0) >= 60 && (e.realmLevel || 0) >= 3,
  },
  body_refiner: {
    desc: '体质≥70，力量≥60',
    check: (e) => (e.attributes?.constitution || 0) >= 70 && (e.attributes?.strength || 0) >= 60,
  },
  soul_cultivator: {
    desc: '感知≥70，修为≥筑基',
    check: (e) => (e.attributes?.perception || 0) >= 70 && (e.realmLevel || 0) >= 3,
  },
  sword_innate: {
    desc: '力量≥65，敏捷≥60',
    check: (e) => (e.attributes?.strength || 0) >= 65 && (e.attributes?.agility || 0) >= 60,
  },
  pill_body: {
    desc: '体质≥60，悟性≥60',
    check: (e) => (e.attributes?.constitution || 0) >= 60 && (e.attributes?.enlightenment || 0) >= 60,
  },
  spiritual_root_top: {
    desc: '天灵根（纯度≥95）',
    check: (e) => (e.spiritRoot?.purity || 0) >= 95,
  },
  spiritual_root_none: {
    desc: '无灵根',
    check: (e) => !e.spiritRoot || e.spiritRoot.purity === 0,
  },
  spiritual_root_mixed: {
    desc: '杂灵根（纯度≤40）',
    check: (e) => (e.spiritRoot?.purity || 0) <= 40 && (e.spiritRoot?.purity || 0) > 0,
  },
  spiritual_root_dual: {
    desc: '双灵根（纯度70-85）',
    check: (e) => (e.spiritRoot?.purity || 0) >= 70 && (e.spiritRoot?.purity || 0) <= 85,
  },
  spiritual_root_triple: {
    desc: '三灵根（纯度50-70）',
    check: (e) => (e.spiritRoot?.purity || 0) >= 50 && (e.spiritRoot?.purity || 0) < 70,
  },
  spiritual_root_single: {
    desc: '单灵根（纯度85-95）',
    check: (e) => (e.spiritRoot?.purity || 0) > 85 && (e.spiritRoot?.purity || 0) < 95,
  },
  mutated_spiritual_root: {
    desc: '变异灵根（特殊属性）',
    check: (e) => e.spiritRoot?.isMutated,
  },

  // ===== 情色相关标签 =====
  nymphomaniac: {
    desc: '情欲≥80，女性，年龄≥18',
    check: (e) => (e.attributes?.lust || 0) >= 80 && e.gender === '女' && e.age >= 18,
  },
  satyriasis: {
    desc: '情欲≥80，男性，年龄≥18',
    check: (e) => (e.attributes?.lust || 0) >= 80 && e.gender === '男' && e.age >= 18,
  },
  seductive: {
    desc: '魅力≥75，女性，情欲≥50',
    check: (e) => (e.attributes?.charm || 0) >= 75 && e.gender === '女' && (e.attributes?.lust || 0) >= 50,
  },
  voluptuous: {
    desc: '魅力≥70，女性，体质≥50',
    check: (e) => (e.attributes?.charm || 0) >= 70 && e.gender === '女' && (e.attributes?.constitution || 0) >= 50,
  },
  handsome_devil: {
    desc: '魅力≥75，男性，罪孽≥20',
    check: (e) => (e.attributes?.charm || 0) >= 75 && e.gender === '男' && (e.karma?.sin || 0) >= 20,
  },
  romantic: {
    desc: '魅力≥65，悟性≥55',
    check: (e) => (e.attributes?.charm || 0) >= 65 && (e.attributes?.enlightenment || 0) >= 55,
  },
  promiscuous: {
    desc: '情欲≥70，性经历≥10次',
    check: (e) => (e.attributes?.lust || 0) >= 70 && (e.sexCount || 0) >= 10,
  },
  cuckold: {
    desc: '已婚，有特殊癖好',
    check: (e) => !!e.family?.spouse && e.hasCuckoldTrait,
  },
  masochist: {
    desc: '意志≤50，有情欲倾向',
    check: (e) => (e.attributes?.willpower || 0) <= 50 && (e.attributes?.lust || 0) >= 40,
  },
  sadist: {
    desc: '攻击性≥60，罪孽≥30',
    check: (e) => (e.attributes?.aggression || 0) >= 60 && (e.karma?.sin || 0) >= 30,
  },
  bisexual: {
    desc: '有双性恋倾向',
    check: (e) => e.isBisexual,
  },
  incestuous: {
    desc: '罪孽≥50，有情欲倾向',
    check: (e) => (e.karma?.sin || 0) >= 50 && (e.attributes?.lust || 0) >= 50,
  },
  exhibitionist: {
    desc: '情欲≥60，魅力≥55',
    check: (e) => (e.attributes?.lust || 0) >= 60 && (e.attributes?.charm || 0) >= 55,
  },
  voyeur: {
    desc: '感知≥60，情欲≥50',
    check: (e) => (e.attributes?.perception || 0) >= 60 && (e.attributes?.lust || 0) >= 50,
  },
  dual_cultivation_body: {
    desc: '魅力≥70，修为≥筑基，灵根纯度≥70',
    check: (e) => (e.attributes?.charm || 0) >= 70 && (e.realmLevel || 0) >= 3 && (e.spiritRoot?.purity || 0) >= 70,
  },
  yin_body: {
    desc: '纯阴之体，女性，体质≥60',
    check: (e) => e.gender === '女' && (e.attributes?.constitution || 0) >= 60 && e.isYinBody,
  },
  yang_body: {
    desc: '纯阳之体，男性，体质≥60',
    check: (e) => e.gender === '男' && (e.attributes?.constitution || 0) >= 60 && e.isYangBody,
  },
  lustful_dao: {
    desc: '以欲入道，情欲≥70，修为≥金丹',
    check: (e) => (e.attributes?.lust || 0) >= 70 && (e.realmLevel || 0) >= 5,
  },
  frigid: {
    desc: '性冷淡，情欲≤20',
    check: (e) => (e.attributes?.lust || 0) <= 20,
  },
};

// 检查实体是否满足标签条件
function checkTagConditions(entity, tagId) {
  const cond = TAG_CONDITIONS[tagId];
  if (!cond) return true; // 没有条件的标签默认可用
  try {
    return cond.check(entity);
  } catch (e) {
    return false;
  }
}

// 获取实体符合条件的所有标签
function getEligibleTags(entity) {
  const eligible = [];
  for (const tagId in TAG_CONDITIONS) {
    if (checkTagConditions(entity, tagId)) {
      eligible.push(tagId);
    }
  }
  return eligible;
}

// 获取标签条件描述
function getTagConditionDesc(tagId) {
  return TAG_CONDITIONS[tagId]?.desc || '无特殊条件';
}

module.exports = {
  TAG_CONDITIONS,
  checkTagConditions,
  getEligibleTags,
  getTagConditionDesc,
};
