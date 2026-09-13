// 种族与血统
const RACES = {
  '人族': { lifespan: 100, traits: ['悟性均衡','可修万法'], rootBonus: 0, physiqueBonus: 0, spiritBonus: 0, desc: '天地主角，悟性均衡，可修万法。' },
  '妖族': { lifespan: 500, traits: ['肉身强横','寿命绵长'], rootBonus: 0, physiqueBonus: 20, spiritBonus: -10, bloodline: ['凡','地','天','圣'], desc: '肉身强横，寿命绵长，需化形方可入人族城镇。' },
  '魔族': { lifespan: 400, traits: ['伤敌自愈','惧雷劫'], rootBonus: -10, physiqueBonus: 15, spiritBonus: 5, demonQi: ['浊','煞','冥'], desc: '伤敌自愈，惧雷劫，魔气主导血统。' },
  '灵体': { lifespan: 0, traits: ['物理免疫','法术亲和'], rootBonus: 20, physiqueBonus: -30, spiritBonus: 30, types: ['剑灵','药灵','元素灵'], desc: '物理免疫，法术亲和，寿元依载体而定。' },
};

// 混血规则
const MIXED_RACES = {
  '人族+妖族': { result: '半妖', chance: 0.5, note: '需10岁前化形' },
  '人族+灵体': { result: '灵体', chance: 1.0, note: '继承种族较少' },
  '魔族+任意': { result: '魔族', chance: 1.0, note: '魔气主导' },
};

// 灵根类型及效果
const SPIRIT_ROOTS = {
  '金': { purity: 80, cultivateBonus: 1.0, combatBonus: { attack: 15, attackMagic: 10 }, element: '金', desc: '金灵根，主攻伐，剑修首选。攻击力+15，法攻+10。', color: '#c0c0c0' },
  '木': { purity: 80, cultivateBonus: 1.1, combatBonus: { hp: 50, defense: 10 }, element: '木', desc: '木灵根，主生机，丹修首选。气血上限+50，防御+10，修炼速度+10%。', color: '#228b22' },
  '水': { purity: 80, cultivateBonus: 1.05, combatBonus: { mp: 30, defenseMagic: 15 }, element: '水', desc: '水灵根，主柔润，符修首选。灵力上限+30，法防+15。', color: '#4169e1' },
  '火': { purity: 80, cultivateBonus: 1.1, combatBonus: { attackMagic: 20, critRate: 5 }, element: '火', desc: '火灵根，主爆裂，丹修/法修首选。法攻+20，暴击率+5%，修炼速度+10%。', color: '#dc143c' },
  '土': { purity: 80, cultivateBonus: 0.95, combatBonus: { defense: 20, hp: 80 }, element: '土', desc: '土灵根，主厚重，体修首选。防御+20，气血上限+80。', color: '#8b4513' },
  '风': { purity: 85, cultivateBonus: 1.15, combatBonus: { agility: 15, dodgeRate: 8 }, element: '风', desc: '风灵根，主迅捷，身法修炼首选。身法+15，闪避率+8%，修炼速度+15%。', color: '#87ceeb' },
  '雷': { purity: 90, cultivateBonus: 1.2, combatBonus: { attack: 10, attackMagic: 25, critRate: 10 }, element: '雷', desc: '雷灵根，主毁灭，攻击力最强。攻击+10，法攻+25，暴击率+10%，修炼速度+20%。', color: '#9370db' },
  '冰': { purity: 85, cultivateBonus: 1.1, combatBonus: { attackMagic: 15, defenseMagic: 10 }, element: '冰', desc: '冰灵根，主冰封，可冻结敌人。法攻+15，法防+10，有概率冻结目标。', color: '#00ced1' },
  '魔': { purity: 95, cultivateBonus: 1.3, combatBonus: { attack: 20, attackMagic: 20, hp: -30 }, element: '魔', desc: '魔灵根，主吞噬，修炼最快但有伤天和。攻击+20，法攻+20，气血-30，修炼速度+30%。', color: '#800080' },
};

// 灵根纯度等级
const ROOT_PURITY_LEVELS = [
  { min: 0, max: 30, name: '杂灵根', bonus: 0.5, desc: '灵根驳杂，修炼缓慢。' },
  { min: 31, max: 50, name: '下品灵根', bonus: 0.7, desc: '灵根不纯，勉强可修。' },
  { min: 51, max: 70, name: '中品灵根', bonus: 0.9, desc: '灵根尚可，中规中矩。' },
  { min: 71, max: 85, name: '上品灵根', bonus: 1.1, desc: '灵根纯净，修炼顺畅。' },
  { min: 86, max: 95, name: '极品灵根', bonus: 1.3, desc: '灵根极佳，天才之资。' },
  { min: 96, max: 100, name: '天灵根', bonus: 1.6, desc: '万年难遇的天灵根，修炼一日千里。' },
];

// 凡人界职业（不需要修仙境界）
const MORTAL_PROFESSIONS = {
  '农夫': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '务农为生，勤劳朴实。' },
  '渔夫': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '以捕鱼为生。' },
  '猎人': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '狩猎为生，身手敏捷。' },
  '铁匠': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '打造铁器的匠人。' },
  '木匠': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '木工手艺精湛。' },
  '裁缝': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '缝制衣物的匠人。' },
  '厨师': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '烹饪美食的厨师。' },
  '商人': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '走南闯北的商人。' },
  '书生': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '读书求功名的书生。' },
  '医生': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '治病救人的大夫。' },
  '捕快': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '维护治安的捕快。' },
  '士兵': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '军中普通士兵。' },
  '将领': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '统兵打仗的将领。' },
  '官员': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '朝廷命官。' },
  '地主': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '拥有大量田产的地主。' },
  '掌柜': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '店铺掌柜。' },
  '镖师': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '走镖护院的镖师。' },
  '戏子': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '唱戏卖艺的伶人。' },
  '歌姬': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '以歌舞娱人的女子。' },
  '丫鬟': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '大户人家的侍女。' },
  '管家': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '管理家事的管家。' },
  '私塾先生': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '教书先生。' },
  '算命先生': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '占卜算命的先生。' },
  '和尚': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '寺庙中的僧人。' },
  '道士': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '道观中的道士。' },
  '尼姑': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '寺庙中的尼姑。' },
  '道姑': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '道观中的道姑。' },
  '山贼': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '占山为王的山贼。' },
  '海盗': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '海上劫掠的海盗。' },
  '乞丐': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '沿街乞讨的乞丐。' },
  '小偷': { realm: 'mortal', minRealm: 0, gender: 'both', desc: '顺手牵羊的小偷。' },
  '仵作': { realm: 'mortal', minRealm: 0, gender: 'male', desc: '验尸的仵作。' },
  '媒婆': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '说媒拉纤的媒婆。' },
  '稳婆': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '接生的稳婆。' },
  '绣娘': { realm: 'mortal', minRealm: 0, gender: 'female', desc: '刺绣的绣娘。' },
};

// 修仙界职业（需要修仙境界）
const CULTIVATION_PROFESSIONS = {
  '炼丹师': {
    realm: 'cultivation', minRealm: 2,
    levels: ['学徒','初级','中级','高级','大师','宗师'],
    expNeed: [0, 100, 500, 2000, 5000, 15000],
    privileges: ['凡丹','灵丹','宝丹','古丹','圣丹','自创丹方'],
    successBonus: [0, 5, 10, 15, 20, 30],
    desc: '炼制丹药的修士。'
  },
  '炼器师': {
    realm: 'cultivation', minRealm: 2,
    levels: ['学徒','初级','中级','高级','大师','宗师'],
    expNeed: [0, 100, 500, 2000, 5000, 15000],
    privileges: ['凡兵','灵器','宝器','古器','圣器','自创器胚'],
    successBonus: [0, 5, 10, 15, 20, 30],
    desc: '炼制法器的修士。'
  },
  '阵法师': {
    realm: 'cultivation', minRealm: 2,
    levels: ['学徒','初级','中级','高级','大师','宗师'],
    expNeed: [0, 100, 500, 2000, 5000, 15000],
    privileges: ['基础阵','聚灵阵','困敌阵','护山阵','杀伐阵','跨界阵'],
    successBonus: [0, 5, 10, 15, 20, 30],
    desc: '布置阵法的修士。'
  },
  '符师': {
    realm: 'cultivation', minRealm: 2,
    levels: ['学徒','初级','中级','高级','大师','宗师'],
    expNeed: [0, 100, 500, 2000, 5000, 15000],
    privileges: ['凡符','灵符','宝符','古符','圣符','自创符箓'],
    successBonus: [0, 5, 10, 15, 20, 30],
    desc: '绘制符箓的修士。'
  },
  '剑修': { realm: 'cultivation', minRealm: 1, desc: '以剑入道的修士。' },
  '体修': { realm: 'cultivation', minRealm: 1, desc: '淬炼肉身的修士。' },
  '丹修': { realm: 'cultivation', minRealm: 1, desc: '以丹入道的修士。' },
  '符修': { realm: 'cultivation', minRealm: 1, desc: '以符入道的修士。' },
  '兽修': { realm: 'cultivation', minRealm: 1, desc: '驭兽修行的修士。' },
  '魔修': { realm: 'cultivation', minRealm: 1, desc: '修炼魔道的修士。' },
  '散修': { realm: 'cultivation', minRealm: 1, desc: '无门无派的修士。' },
  '宗门弟子': { realm: 'cultivation', minRealm: 1, desc: '宗门中的弟子。' },
  '宗门长老': { realm: 'cultivation', minRealm: 5, desc: '宗门中的长老。' },
  '坊市掌柜': { realm: 'cultivation', minRealm: 2, desc: '修仙坊市的掌柜。' },
  '冒险者': { realm: 'cultivation', minRealm: 1, desc: '四处冒险的修士。' },
  '赏金猎人': { realm: 'cultivation', minRealm: 2, desc: '接取悬赏的修士。' },
  '炼丹学徒': { realm: 'cultivation', minRealm: 1, desc: '学习炼丹的学徒。' },
  '炼器学徒': { realm: 'cultivation', minRealm: 1, desc: '学习炼器的学徒。' },
};

// 合并所有职业
const PROFESSIONS = { ...MORTAL_PROFESSIONS, ...CULTIVATION_PROFESSIONS };

// ===== 身份库（需求：先生成身份，再按身份匹配职业/修为/出生地）=====
// 四类身份：皇族 / 官员 / 平民 / 修仙者（凡人境以上的都是修仙者）
const IDENTITIES = ['皇族', '官员', '平民', '修仙者'];

// 身份 → 职业池划分（一个职业可属于多个身份；生成时还会按性别/修为下限过滤）
const IDENTITY_PROFESSIONS = {
  // 皇族：领衔官职/军职或闲职
  '皇族': ['官员', '将领', '地主', '书生', '商人'],
  // 官员：朝廷命官及其僚属
  '官员': ['官员', '捕快', '将领', '士兵', '仵作', '私塾先生', '地主', '管家'],
  // 平民：凡人界普通百姓各业（不含官场身份）
  '平民': ['农夫', '渔夫', '猎人', '铁匠', '木匠', '裁缝', '厨师', '商人', '书生', '医生', '掌柜',
           '镖师', '戏子', '歌姬', '丫鬟', '管家', '私塾先生', '算命先生', '和尚', '道士', '尼姑',
           '道姑', '山贼', '海盗', '乞丐', '小偷', '媒婆', '稳婆', '绣娘', '地主'],
  // 修仙者：修仙界各职业（凡人境以上的都是修仙者）
  '修仙者': ['炼丹师', '炼器师', '阵法师', '符师', '剑修', '体修', '丹修', '符修', '兽修', '魔修',
             '散修', '宗门弟子', '宗门长老', '坊市掌柜', '冒险者', '赏金猎人', '炼丹学徒', '炼器学徒'],
};

// 身份 → 势力归属
const IDENTITY_FACTIONS = {
  '皇族': '大夏皇朝',
  '官员': '大夏皇朝',
  '平民': '本地乡绅',
  '修仙者': '散修',
};

// 身份生成权重（仅凡人境时）：皇族5% / 官员15% / 平民80%
function rollMortalIdentity() {
  const r = Math.random();
  if (r < 0.05) return '皇族';
  if (r < 0.20) return '官员';
  return '平民';
}

// 按身份+性别+修为取合法职业池
function getIdentityProfessionPool(identity, realmLevel, gender = '男') {
  const genderKey = gender === '女' ? 'female' : 'male';
  const pool = IDENTITY_PROFESSIONS[identity] || [];
  return pool.filter(p => {
    const def = MORTAL_PROFESSIONS[p] || CULTIVATION_PROFESSIONS[p];
    if (!def) return false;
    if (def.realm === 'cultivation' && def.minRealm > realmLevel) return false;
    if (def.gender && def.gender !== 'both' && def.gender !== genderKey) return false;
    return true;
  });
}

// 皇朝官职
const OFFICIALS = {
  levels: ['九品','八品','七品','六品','五品','四品','三品','二品','一品'],
  names: ['县令','县丞','主簿','主事','郎中','侍郎','尚书','丞相','宰相'],
};

// 根据境界和性别获取合理职业
// 出生地点 → 推荐身份/职业池（随机身份需与出生地点相符）
const LOCATION_PROFESSION_MAP = {
  '大夏皇都': ['官员', '商人', '书生', '地主', '掌柜', '捕快', '歌姬', '丫鬟', '管家', '将领', '士兵'],
  '清风镇': ['农夫', '铁匠', '木匠', '裁缝', '厨师', '医生', '私塾先生', '道士', '和尚', '猎人'],
  '落日森林': ['猎人', '道士', '冒险者', '赏金猎人', '猎户'],
  '东海渔村': ['渔夫', '商人', '医生', '厨师', '猎人'],
  '大夏皇陵': ['道士', '和尚', '士兵', '看守'],
  '万毒沼泽': ['猎人', '医生', '冒险者', '采药人'],
  '青云剑宗': ['剑修', '宗门弟子', '宗门长老', '炼丹师', '炼器师', '阵法师'],
  '万妖山脉': ['兽修', '冒险者', '赏金猎人', '猎人'],
  '自由坊市': ['坊市掌柜', '商人', '炼丹师', '炼器师', '符师', '阵法师', '掌柜'],
  '上古遗迹': ['冒险者', '赏金猎人', '散修'],
  '丹塔': ['炼丹师', '炼丹学徒', '丹修'],
  '裂风峡谷': ['冒险者', '赏金猎人', '体修', '剑修'],
  '天星阁': ['阵法师', '符师', '符修', '体修'],
  '兽灵山': ['兽修', '猎人', '冒险者'],
};

function getReasonableProfession(realmLevel, gender = '男', location = null) {
  const genderKey = gender === '女' ? 'female' : 'male';
  const isMortal = realmLevel <= 1;

  // 出生地点职业池优先：随机身份需与出生地点相符
  if (location && LOCATION_PROFESSION_MAP[location]) {
    const pool = LOCATION_PROFESSION_MAP[location];
    const valid = pool.filter(p => {
      if (isMortal) {
        const def = MORTAL_PROFESSIONS[p];
        if (!def) return false; // 修仙职业在凡人地点不作为凡人身份
        return def.gender === 'both' || def.gender === genderKey;
      }
      const def = CULTIVATION_PROFESSIONS[p];
      if (!def) return false;
      return def.minRealm <= realmLevel &&
        (!def.gender || def.gender === 'both' || def.gender === genderKey);
    });
    if (valid.length > 0) return valid[Math.floor(Math.random() * valid.length)];
  }

  if (isMortal) {
    // 炼气期及以下，凡人职业为主，少量散修
    const validProfessions = Object.keys(MORTAL_PROFESSIONS).filter(p =>
      MORTAL_PROFESSIONS[p].gender === 'both' || MORTAL_PROFESSIONS[p].gender === genderKey
    );
    return Math.random() < 0.7
      ? validProfessions[Math.floor(Math.random() * validProfessions.length)]
      : '散修';
  } else {
    // 筑基及以上，修仙职业为主
    const cultProfessions = Object.keys(CULTIVATION_PROFESSIONS).filter(p =>
      CULTIVATION_PROFESSIONS[p].minRealm <= realmLevel &&
      (!CULTIVATION_PROFESSIONS[p].gender || CULTIVATION_PROFESSIONS[p].gender === 'both' || CULTIVATION_PROFESSIONS[p].gender === genderKey)
    );
    return cultProfessions[Math.floor(Math.random() * cultProfessions.length)] || '散修';
  }
}

module.exports = {
  RACES, MIXED_RACES, SPIRIT_ROOTS, ROOT_PURITY_LEVELS,
  PROFESSIONS, MORTAL_PROFESSIONS, CULTIVATION_PROFESSIONS,
  OFFICIALS, getReasonableProfession,
  IDENTITIES, IDENTITY_PROFESSIONS, IDENTITY_FACTIONS,
  rollMortalIdentity, getIdentityProfessionPool,
};
