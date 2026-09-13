// 宠物系统 - 捕捉、培养、战斗辅助（第九批：32灵兽 + 灵兽蛋孵化 + 投喂晋升 + 蛋立绘）
const { randInt, chance, randChoice, clamp, genId } = require('./utils');
const { PET_PERSONALITIES, randGender, GROWTH_STAGES } = require('./petLife');

// 品级顺序（投喂晋升）
const QUALITY_ORDER = ['普通', '优秀', '稀有', '史诗', '传说'];
const QUALITY_MULT = { '普通': 1, '优秀': 1.2, '稀有': 1.5, '史诗': 2, '传说': 3 };

// 灵兽种类（32种：原有22 + 新增10；locations 全部改用现存26地点）
// eggArt: 蛋立绘文件（images/pet/eggs/ 下，按品级共用）；feedValues: 不同食物喂食经验；promoteExp: 晋升所需经验
const PET_TYPES = [
  // ===== 普通宠物（凡品 tier1-2）=====
  { id: 'mouse', name: '灵鼠', tier: 1, desc: '机敏的灵鼠，善于寻宝', baseStats: { atk: 4, def: 2, spd: 12, hp: 22 }, skill: '寻宝', locations: ['清风镇', '大夏皇都'], eggArt: 'egg_fan_1.png', promoteExp: 150, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 10, '灵兽口粮': 25, '灵果': 30, '洗髓丹': 50 } },
  { id: 'cat', name: '灵猫', tier: 1, desc: '通灵的猫，可预警危险', baseStats: { atk: 5, def: 3, spd: 10, hp: 30 }, skill: '预警', locations: ['清风镇', '大夏皇都', '青云剑宗'], eggArt: 'egg_fan_1.png', promoteExp: 150, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 10, '灵兽口粮': 25, '灵果': 30, '洗髓丹': 50 } },
  { id: 'mink', name: '灵貂', tier: 1, desc: '皮毛如雪的小貂，灵动可爱', baseStats: { atk: 6, def: 2, spd: 14, hp: 25 }, skill: '偷取', locations: ['天星阁', '自由坊市'], eggArt: 'egg_fan_1.png', promoteExp: 150, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 10, '灵兽口粮': 25, '灵果': 30, '洗髓丹': 50 } },
  { id: 'bird', name: '灵雀', tier: 1, desc: '可传信的灵鸟', baseStats: { atk: 3, def: 2, spd: 15, hp: 20 }, skill: '传信', locations: ['天星阁', '青云剑宗'], eggArt: 'egg_fan_2.png', promoteExp: 150, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 10, '灵兽口粮': 25, '灵果': 30, '洗髓丹': 50 } },
  { id: 'butterfly', name: '彩蝶', tier: 1, desc: '美丽的彩蝶，可致幻', baseStats: { atk: 2, def: 1, spd: 20, hp: 15 }, skill: '幻粉', locations: ['御花园', '万妖山脉'], eggArt: 'egg_fan_2.png', promoteExp: 120, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 10, '灵兽口粮': 25, '灵果': 30, '洗髓丹': 50 } },
  { id: 'rabbit', name: '玉兔', tier: 2, desc: '月宫玉兔的后裔', baseStats: { atk: 8, def: 5, spd: 18, hp: 40 }, skill: '治愈', locations: ['洞天福地', '太虚梦境'], eggArt: 'egg_fan_3.png', promoteExp: 260, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 12, '灵兽口粮': 30, '灵果': 40, '洗髓丹': 60 } },
  { id: 'wolf', name: '苍狼', tier: 2, desc: '凶猛的苍狼', baseStats: { atk: 14, def: 6, spd: 16, hp: 55 }, skill: '狼嚎', locations: ['落日森林', '万妖山脉'], eggArt: 'egg_fan_3.png', promoteExp: 260, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 30, '灵兽口粮': 30, '灵果': 35, '洗髓丹': 60 } },
  { id: 'dog', name: '哮天犬', tier: 2, desc: '忠心耿耿的犬类妖兽', baseStats: { atk: 15, def: 8, spd: 12, hp: 60 }, skill: '撕咬', locations: ['落日森林', '大夏皇都'], eggArt: 'egg_fan_3.png', promoteExp: 260, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 30, '灵兽口粮': 30, '灵果': 35, '洗髓丹': 60 } },
  { id: 'snake', name: '青鳞蛇', tier: 2, desc: '有毒的灵蛇', baseStats: { atk: 12, def: 5, spd: 14, hp: 50 }, skill: '毒牙', locations: ['万毒沼泽', '万妖山脉'], eggArt: 'egg_fan_4.png', promoteExp: 260, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 28, '灵兽口粮': 30, '灵果': 35, '洗髓丹': 60 } },
  { id: 'monkey', name: '灵猴', tier: 2, desc: '机灵的灵猴，擅长偷窃', baseStats: { atk: 10, def: 4, spd: 22, hp: 45 }, skill: '偷窃', locations: ['万妖山脉', '兽灵山'], eggArt: 'egg_fan_3.png', promoteExp: 260, feedValues: { '灵草': 18, '灵谷': 22, '妖兽肉': 25, '灵兽口粮': 30, '灵果': 40, '洗髓丹': 60 } },
  { id: 'koi', name: '锦鲤', tier: 2, desc: '通灵的锦鲤，带来好运', baseStats: { atk: 6, def: 10, spd: 8, hp: 35 }, skill: '祥瑞', locations: ['东海渔村', '归墟海眼'], eggArt: 'egg_fan_4.png', promoteExp: 240, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 15, '灵兽口粮': 30, '灵果': 40, '洗髓丹': 60 } },
  { id: 'mandrill', name: '山魈', tier: 2, desc: '力大凶悍的山中恶魈', baseStats: { atk: 16, def: 6, spd: 13, hp: 58 }, skill: '蛮力', locations: ['万妖山脉', '兽灵山'], eggArt: 'egg_fan_3.png', promoteExp: 280, feedValues: { '灵草': 12, '灵谷': 18, '妖兽肉': 32, '灵兽口粮': 30, '灵果': 35, '洗髓丹': 60 } },
  // ===== 良品宠物（tier3）=====
  { id: 'turtle', name: '玄龟', tier: 3, desc: '长寿的玄龟，防御极高', baseStats: { atk: 10, def: 25, spd: 3, hp: 150 }, skill: '龟甲护体', locations: ['东海渔村', '归墟海眼'], eggArt: 'egg_good_4.png', promoteExp: 500, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 35, '灵兽口粮': 40, '灵果': 45, '洗髓丹': 80 } },
  { id: 'bear', name: '黑熊', tier: 3, desc: '力大无穷的黑熊', baseStats: { atk: 20, def: 15, spd: 5, hp: 120 }, skill: '重击', locations: ['落日森林', '万妖山脉'], eggArt: 'egg_good_1.png', promoteExp: 500, feedValues: { '灵草': 12, '灵谷': 18, '妖兽肉': 40, '灵兽口粮': 40, '灵果': 40, '洗髓丹': 80 } },
  { id: 'crane', name: '仙鹤', tier: 3, desc: '仙风道骨的仙鹤', baseStats: { atk: 12, def: 10, spd: 20, hp: 80 }, skill: '延年益寿', locations: ['青云剑宗', '洞天福地'], eggArt: 'egg_good_2.png', promoteExp: 480, feedValues: { '灵草': 25, '灵谷': 30, '妖兽肉': 30, '灵兽口粮': 40, '灵果': 50, '洗髓丹': 80 } },
  { id: 'toad', name: '金蟾', tier: 3, desc: '招财进宝的金蟾', baseStats: { atk: 8, def: 18, spd: 4, hp: 100 }, skill: '吐宝', locations: ['万毒沼泽', '归墟海眼'], eggArt: 'egg_good_4.png', promoteExp: 480, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 30, '灵兽口粮': 40, '灵果': 45, '洗髓丹': 80 } },
  { id: 'spider', name: '冰蛛', tier: 3, desc: '吐丝结网的冰蛛', baseStats: { atk: 15, def: 8, spd: 12, hp: 70 }, skill: '冰封', locations: ['万妖山脉', '上古遗迹'], eggArt: 'egg_good_4.png', promoteExp: 500, feedValues: { '灵草': 18, '灵谷': 22, '妖兽肉': 35, '灵兽口粮': 40, '灵果': 45, '洗髓丹': 80 } },
  { id: 'rhino', name: '独角犀', tier: 3, desc: '皮糙肉厚的独角巨犀', baseStats: { atk: 22, def: 20, spd: 4, hp: 140 }, skill: '冲撞', locations: ['万妖山脉', '落日森林'], eggArt: 'egg_good_1.png', promoteExp: 520, feedValues: { '灵草': 12, '灵谷': 18, '妖兽肉': 40, '灵兽口粮': 40, '灵果': 40, '洗髓丹': 80 } },
  { id: 'silverwolf', name: '银狼王', tier: 3, desc: '狼群之王，银白如雪', baseStats: { atk: 24, def: 12, spd: 20, hp: 90 }, skill: '狼王咆哮', locations: ['落日森林', '裂风峡谷'], eggArt: 'egg_good_1.png', promoteExp: 520, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 42, '灵兽口粮': 40, '灵果': 45, '洗髓丹': 80 } },
  // ===== 珍品宠物（tier4）=====
  { id: 'tiger', name: '白虎', tier: 4, desc: '四象之一的白虎', baseStats: { atk: 40, def: 20, spd: 15, hp: 200 }, skill: '虎啸', locations: ['万妖山脉', '兽灵山'], eggArt: 'egg_rare_1.png', promoteExp: 800, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 50, '灵兽口粮': 55, '灵果': 55, '洗髓丹': 100 } },
  { id: 'qilin', name: '火麒麟', tier: 4, desc: '瑞兽麒麟，祥瑞之兆', baseStats: { atk: 35, def: 25, spd: 18, hp: 220 }, skill: '烈焰', locations: ['裂风峡谷', '万妖山脉'], eggArt: 'egg_rare_3.png', promoteExp: 850, feedValues: { '灵草': 18, '灵谷': 22, '妖兽肉': 45, '灵兽口粮': 55, '灵果': 60, '洗髓丹': 100 } },
  { id: 'leopard', name: '雷豹', tier: 4, desc: '速度极快的雷豹', baseStats: { atk: 38, def: 15, spd: 30, hp: 180 }, skill: '雷击', locations: ['万妖山脉', '裂风峡谷'], eggArt: 'egg_rare_1.png', promoteExp: 800, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 48, '灵兽口粮': 55, '灵果': 55, '洗髓丹': 100 } },
  { id: 'eagle', name: '金翅大鹏', tier: 4, desc: '展翅九万里的神鹰', baseStats: { atk: 42, def: 12, spd: 35, hp: 160 }, skill: '俯冲', locations: ['天星阁', '万妖山脉'], eggArt: 'egg_rare_2.png', promoteExp: 800, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 48, '灵兽口粮': 55, '灵果': 55, '洗髓丹': 100 } },
  { id: 'lion', name: '赤炎狮', tier: 4, desc: '鬃毛燃火的赤炎雄狮', baseStats: { atk: 44, def: 18, spd: 22, hp: 190 }, skill: '炎爆', locations: ['裂风峡谷', '万妖山脉'], eggArt: 'egg_rare_1.png', promoteExp: 850, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 50, '灵兽口粮': 55, '灵果': 55, '洗髓丹': 100 } },
  { id: 'deer', name: '九色鹿', tier: 4, desc: '身披九彩祥光的瑞鹿', baseStats: { atk: 28, def: 22, spd: 26, hp: 150 }, skill: '祥光', locations: ['洞天福地', '太虚梦境'], eggArt: 'egg_rare_3.png', promoteExp: 800, feedValues: { '灵草': 30, '灵谷': 35, '妖兽肉': 30, '灵兽口粮': 50, '灵果': 70, '洗髓丹': 100 } },
  { id: 'weasel', name: '紫电貂', tier: 4, desc: '身绕紫电的灵貂王', baseStats: { atk: 36, def: 14, spd: 34, hp: 130 }, skill: '紫电', locations: ['天星阁', '兽灵山'], eggArt: 'egg_rare_1.png', promoteExp: 800, feedValues: { '灵草': 15, '灵谷': 20, '妖兽肉': 45, '灵兽口粮': 55, '灵果': 55, '洗髓丹': 100 } },
  // ===== 神品宠物（tier5-6）=====
  { id: 'fox', name: '九尾狐', tier: 5, desc: '传说中的九尾狐，魅惑众生', baseStats: { atk: 30, def: 15, spd: 25, hp: 100 }, skill: '魅惑', locations: ['洞天福地', '太虚梦境'], eggArt: 'egg_god_3.png', promoteExp: 1200, feedValues: { '灵草': 25, '灵谷': 30, '妖兽肉': 50, '灵兽口粮': 60, '灵果': 80, '洗髓丹': 150 } },
  { id: 'phoenix', name: '朱雀', tier: 5, desc: '四象之一的朱雀，浴火重生', baseStats: { atk: 45, def: 18, spd: 30, hp: 180 }, skill: '涅槃', locations: ['裂风峡谷', '星辰裂缝'], eggArt: 'egg_god_2.png', promoteExp: 1200, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 55, '灵兽口粮': 60, '灵果': 80, '洗髓丹': 150 } },
  { id: 'baiZe', name: '白泽', tier: 5, desc: '通晓万物的瑞兽白泽', baseStats: { atk: 38, def: 28, spd: 22, hp: 200 }, skill: '通晓', locations: ['通天古路', '洞天福地'], eggArt: 'egg_god_3.png', promoteExp: 1300, feedValues: { '灵草': 30, '灵谷': 35, '妖兽肉': 45, '灵兽口粮': 60, '灵果': 80, '洗髓丹': 150 } },
  { id: 'dragon', name: '青龙', tier: 6, desc: '四象之首的青龙', baseStats: { atk: 60, def: 30, spd: 25, hp: 300 }, skill: '龙吟', locations: ['龙渊', '混沌海'], eggArt: 'egg_god_3.png', promoteExp: 2000, feedValues: { '灵草': 25, '灵谷': 30, '妖兽肉': 60, '灵兽口粮': 70, '灵果': 100, '洗髓丹': 200 } },
  { id: 'basilisk', name: '玄武', tier: 6, desc: '四象之一的玄武，防御无双', baseStats: { atk: 35, def: 50, spd: 8, hp: 400 }, skill: '龟蛇合击', locations: ['归墟海眼', '混沌海'], eggArt: 'egg_god_4.png', promoteExp: 2000, feedValues: { '灵草': 25, '灵谷': 30, '妖兽肉': 55, '灵兽口粮': 70, '灵果': 90, '洗髓丹': 200 } },
  { id: 'chaos', name: '混沌兽', tier: 6, desc: '混沌中诞生的异兽', baseStats: { atk: 70, def: 40, spd: 20, hp: 350 }, skill: '吞噬', locations: ['混沌海', '太虚梦境'], eggArt: 'egg_god_4.png', promoteExp: 2200, feedValues: { '灵草': 20, '灵谷': 25, '妖兽肉': 65, '灵兽口粮': 70, '灵果': 100, '洗髓丹': 200 } },
];

// 灵兽蛋定价（交易市场购买价，tier 基础）
function getEggPrice(tier) {
  return [0, 50, 150, 400, 1000, 3000, 8000][tier] || 500;
}

// 生成宠物
function generatePet(typeId = null) {
  const type = typeId ? PET_TYPES.find(t => t.id === typeId) : randChoice(PET_TYPES);
  if (!type) return null;

  const qualityRoll = randInt(1, 100);
  let qualityName, qualityMultiplier;
  if (qualityRoll <= 50) { qualityName = '普通'; qualityMultiplier = 1; }
  else if (qualityRoll <= 80) { qualityName = '优秀'; qualityMultiplier = 1.2; }
  else if (qualityRoll <= 95) { qualityName = '稀有'; qualityMultiplier = 1.5; }
  else if (qualityRoll <= 99) { qualityName = '史诗'; qualityMultiplier = 2; }
  else { qualityName = '传说'; qualityMultiplier = 3; }

  return {
    id: genId(),
    typeId: type.id,
    name: type.name,
    nickname: '',
    tier: type.tier,
    quality: qualityName,
    qualityMultiplier,
    desc: type.desc,
    level: 1,
    exp: 0,
    expToNext: 100,
    loyalty: randInt(30, 80),
    hunger: randInt(50, 100),
    // 第九批：投喂晋升
    feedValues: type.feedValues || {},
    promoteCur: 0,
    promoteExp: type.promoteExp || 200,
    stats: {
      atk: Math.floor(type.baseStats.atk * qualityMultiplier),
      def: Math.floor(type.baseStats.def * qualityMultiplier),
      spd: Math.floor(type.baseStats.spd * qualityMultiplier),
      hp: Math.floor(type.baseStats.hp * qualityMultiplier),
      maxHp: Math.floor(type.baseStats.hp * qualityMultiplier),
    },
    skill: type.skill,
    eggArt: type.eggArt || 'egg_fan_1.png',
    isActive: false,
    // 跟随状态（跟随：参与战斗+属性加成，最多3只）
    following: false,
    // 灵宠生活系统（需求）：性别/性格/成长期/状态/好感/子嗣/记事
    gender: randGender(),
    personality: randChoice(PET_PERSONALITIES),
    growthStage: '幼年期',
    growthXun: 0,
    status: '正在悠闲地活动',
    petRelations: {},
    family: { father: null, mother: null, children: [] },
    journal: [],
    isPregnant: false,
    pregnancyMonths: 0,
    pregnancyFather: null,
  };
}

// 捕捉宠物
function tryCapture(player, location) {
  const availablePets = PET_TYPES.filter(p => p.locations.includes(location));
  if (availablePets.length === 0) {
    return { success: false, msg: '此处没有可捕捉的宠物。' };
  }

  let captureRate = 20 + (player.attributes.enlightenment || 0) * 0.3;
  if (player.inventory?.some(i => i.name === '捕兽网')) captureRate += 20;
  if (player.inventory?.some(i => i.name === '灵兽袋')) captureRate += 30;

  if (chance(captureRate)) {
    const pet = generatePet(randChoice(availablePets).id);
    if (!player.pets) player.pets = [];
    player.pets.push(pet);
    return { success: true, msg: `你成功捕捉了一只${pet.quality}${pet.name}！`, pet };
  } else {
    return { success: false, msg: '宠物逃跑了...' };
  }
}

// 宠物升级
function levelUpPet(pet) {
  pet.level++;
  pet.expToNext = Math.floor(pet.expToNext * 1.5);
  pet.stats.atk += Math.floor(pet.stats.atk * 0.1);
  pet.stats.def += Math.floor(pet.stats.def * 0.1);
  pet.stats.spd += Math.floor(pet.stats.spd * 0.1);
  pet.stats.maxHp += Math.floor(pet.stats.maxHp * 0.1);
  pet.stats.hp = pet.stats.maxHp;
  return pet;
}

// 喂养宠物（灵石喂养，保持旧入口）
function feedPet(player, pet) {
  const cost = 20;
  if (player.spiritStone < cost) return { success: false, msg: '灵石不足' };
  player.spiritStone -= cost;
  pet.hunger = clamp(pet.hunger + 30, 0, 100);
  pet.loyalty = clamp(pet.loyalty + 5, 0, 100);
  pet.exp += 20;
  if (pet.exp >= pet.expToNext) {
    levelUpPet(pet);
    return { success: true, msg: `喂养了${pet.name}，它升级了！` };
  }
  return { success: true, msg: `喂养了${pet.name}，它看起来很开心。` };
}

// ===== 菜品对灵宠的增/减效益（每道菜：经验增益/好感变化；负值=减益） =====
// 食性：meat=肉食（喜荤，厌素） veg=草食（喜素，厌荤） aquatic=水栖（喜鱼鲜） mixed=杂食（荤素皆可）
const PET_DIET = {
  meat: ['wolf', 'snake', 'bear', 'tiger', 'lion', 'mandrill', 'rhino', 'silverwolf', 'leopard', 'dog', 'toad', 'phoenix', 'qilin', 'tiger'],
  veg: ['rabbit', 'deer', 'butterfly', 'crane', 'bird', 'koi'],
  aquatic: ['turtle', 'koi', 'dragon'],
};
function petDiet(typeId) {
  if (PET_DIET.meat.includes(typeId)) return 'meat';
  if (PET_DIET.veg.includes(typeId)) return 'veg';
  if (PET_DIET.aquatic.includes(typeId)) return 'aquatic';
  return 'mixed';
}
// 每道菜的基础效益（菜品 → 经验/好感；食材等级越高效益越高）
const DISH_FEED = {
  '清炒时蔬': { gain: 8, favor: 2 },
  '蛋炒饭': { gain: 10, favor: 3 },
  '红烧肉': { gain: 25, favor: 6 },
  '清蒸鱼': { gain: 20, favor: 5 },
  '红烧鲤鱼': { gain: 22, favor: 5 },
  '酸菜鱼': { gain: 25, favor: 4 },
  '松鼠桂鱼': { gain: 30, favor: 6 },
  '清蒸石斑': { gain: 40, favor: 8 },
  '刺身拼盘': { gain: 35, favor: 3 },
  '龙虾宴': { gain: 45, favor: 9 },
  '龙鱼脍': { gain: 60, favor: 12 },
  '鲲鹏展翅': { gain: 80, favor: 15 },
  '鸡汤': { gain: 18, favor: 6 },
  '烤鸭': { gain: 28, favor: 6 },
  '羊肉汤': { gain: 30, favor: 4 },
  '牛肉火锅': { gain: 32, favor: 7 },
  '佛跳墙': { gain: 50, favor: 10 },
  '百年灵芝炖鸡': { gain: 55, favor: 10 },
  '灵米饭': { gain: 15, favor: 4 },
  '聚灵草汤': { gain: 20, favor: 6 },
  '妖兽肉串': { gain: 40, favor: 8 },
  '灵茶': { gain: 10, favor: 3 },
  '灵酒': { gain: 15, favor: 5 },
  '仙丹级灵食': { gain: 100, favor: 20 },
};
// 荤菜清单（食性修正用）
const DISH_MEAT = ['红烧肉', '清蒸鱼', '红烧鲤鱼', '酸菜鱼', '松鼠桂鱼', '清蒸石斑', '刺身拼盘', '龙虾宴', '龙鱼脍', '鲲鹏展翅', '烤鸭', '牛肉火锅', '佛跳墙', '妖兽肉串', '羊肉汤'];

// 计算某菜对某灵宠的实际投喂效益（食性匹配修正，负 favor=减益）
function dishFeedEffect(pet, dishName) {
  const base = DISH_FEED[dishName];
  if (!base) return null;
  const diet = petDiet(pet.typeId);
  const isMeat = DISH_MEAT.includes(dishName);
  let mult = 1;
  if (diet === 'meat') mult = isMeat ? 1.5 : 0.5;
  else if (diet === 'veg') mult = isMeat ? 0.5 : 1.5;
  else if (diet === 'aquatic') mult = (isMeat || dishName.includes('鱼') || dishName.includes('脍') || dishName.includes('刺身')) ? 1.4 : 0.8;
  return {
    gain: Math.max(1, Math.round(base.gain * mult)),
    favor: isMeat && diet === 'veg' ? -Math.round(base.favor * 2) : (!isMeat && diet === 'meat') ? -Math.round(base.favor) : base.favor,
  };
}

// 第九批：投喂晋升（消耗食物，获得对应经验；满则晋升品级）——支持灵宠食物与菜品，支持一次投喂多个
function feedPetItem(player, pet, foodName, count = 1) {
  count = Math.max(1, Math.floor(count) || 1);
  // 菜品路径（对灵宠有增/减效益）
  if (DISH_FEED[foodName]) {
    const idx = (player.inventory || []).findIndex(i => i.name === foodName && i.count > 0);
    if (idx === -1) return { success: false, msg: `背包中没有${foodName}` };
    if (player.inventory[idx].count < count) return { success: false, msg: `${foodName}数量不足（背包${player.inventory[idx].count}个）` };
    player.inventory[idx].count -= count;
    if (player.inventory[idx].count <= 0) player.inventory.splice(idx, 1);
    const eff = dishFeedEffect(pet, foodName);
    pet.promoteCur = (pet.promoteCur || 0) + eff.gain * count;
    pet.hunger = clamp((pet.hunger || 50) + 12 * count, 0, 100);
    pet.loyalty = clamp((pet.loyalty || 50) + eff.favor * count, 0, 100);
    if (eff.favor < 0) {
      return { success: true, msg: `你喂了${pet.name}${count}份【${foodName}】，它似乎不太喜欢（-${-eff.favor * count}好感，+${eff.gain * count}经验）`, dish: true };
    }
    return { success: true, msg: `你喂了${pet.name}${count}份【${foodName}】，它吃得很开心（+${eff.favor * count}好感，+${eff.gain * count}经验）`, dish: true };
  }
  if (!pet.feedValues || !pet.feedValues[foodName]) return { success: false, msg: `${foodName}不能喂给${pet.name}` };
  const idx = (player.inventory || []).findIndex(i => i.name === foodName && i.count > 0);
  if (idx === -1) return { success: false, msg: `背包中没有${foodName}` };
  if (player.inventory[idx].count < count) return { success: false, msg: `${foodName}数量不足（背包${player.inventory[idx].count}个）` };
  player.inventory[idx].count -= count;
  if (player.inventory[idx].count <= 0) player.inventory.splice(idx, 1);
  const gain = pet.feedValues[foodName] * count;
  pet.promoteCur = (pet.promoteCur || 0) + gain;
  pet.hunger = clamp((pet.hunger || 50) + 15 * count, 0, 100);
  pet.loyalty = clamp((pet.loyalty || 50) + 3 * count, 0, 100);
  if (pet.promoteCur >= pet.promoteExp) {
    // 晋升
    pet.promoteCur = 0;
    pet.promoteExp = Math.floor(pet.promoteExp * 1.6);
    const qi = QUALITY_ORDER.indexOf(pet.quality);
    if (qi >= 0 && qi < QUALITY_ORDER.length - 1) {
      const newQ = QUALITY_ORDER[qi + 1];
      pet.quality = newQ;
      pet.qualityMultiplier = QUALITY_MULT[newQ];
      // 按新品级重算属性（保留原成长部分按比例放大）
      const type = PET_TYPES.find(t => t.id === pet.typeId) || {};
      const bs = type.baseStats || {};
      pet.stats = {
        atk: Math.floor(bs.atk * pet.qualityMultiplier),
        def: Math.floor(bs.def * pet.qualityMultiplier),
        spd: Math.floor(bs.spd * pet.qualityMultiplier),
        hp: Math.floor(bs.hp * pet.qualityMultiplier),
        maxHp: Math.floor(bs.hp * pet.qualityMultiplier),
      };
      return { success: true, promoted: true, msg: `你投喂了${foodName}（+${gain}），【${pet.name}】晋升为【${newQ}】品级！` };
    } else {
      // 传说再晋升：品阶+1
      pet.tier = (pet.tier || 1) + 1;
      pet.quality = '传说';
      pet.qualityMultiplier = QUALITY_MULT['传说'] + (pet.tier - (PET_TYPES.find(t => t.id === pet.typeId)?.tier || pet.tier - 1)) * 0.5;
      const type = PET_TYPES.find(t => t.id === pet.typeId) || {};
      const bs = type.baseStats || {};
      pet.stats = {
        atk: Math.floor(bs.atk * pet.qualityMultiplier),
        def: Math.floor(bs.def * pet.qualityMultiplier),
        spd: Math.floor(bs.spd * pet.qualityMultiplier),
        hp: Math.floor(bs.hp * pet.qualityMultiplier),
        maxHp: Math.floor(bs.hp * pet.qualityMultiplier),
      };
      return { success: true, promoted: true, msg: `你投喂了${foodName}（+${gain}），【${pet.name}】突破至${pet.tier}阶！` };
    }
  }
  return { success: true, msg: `你投喂了${foodName}（+${gain}），${pet.name}晋升经验 ${pet.promoteCur}/${pet.promoteExp}。` };
}

// 孵化灵兽蛋（概率死物/不同品级）
function hatchPetEgg(player, eggName) {
  const eggDef = PET_EGGS[eggName];
  if (!eggDef) return { success: false, msg: '这不是一枚可孵化的灵兽蛋' };
  const idx = (player.inventory || []).findIndex(i => i.name === eggName && i.count > 0);
  if (idx === -1) return { success: false, msg: `背包中没有${eggName}` };
  player.inventory[idx].count--;
  if (player.inventory[idx].count <= 0) player.inventory.splice(idx, 1);
  const roll = Math.random();
  if (roll < 0.2) {
    player.inventory.push({ name: '死蛋', count: 1 });
    return { success: false, dead: true, msg: `蛋壳裂开，里面竟是一枚死蛋……孵化失败。` };
  }
  const pet = generatePet(eggDef.typeId);
  // 蛋孵化品质概率更高
  const qr = Math.random();
  let q;
  if (qr < 0.35) q = '普通';
  else if (qr < 0.65) q = '优秀';
  else if (qr < 0.85) q = '稀有';
  else if (qr < 0.97) q = '史诗';
  else q = '传说';
  pet.quality = q;
  pet.qualityMultiplier = QUALITY_MULT[q];
  const type = PET_TYPES.find(t => t.id === eggDef.typeId) || {};
  const bs = type.baseStats || {};
  pet.stats = {
    atk: Math.floor(bs.atk * pet.qualityMultiplier),
    def: Math.floor(bs.def * pet.qualityMultiplier),
    spd: Math.floor(bs.spd * pet.qualityMultiplier),
    hp: Math.floor(bs.hp * pet.qualityMultiplier),
    maxHp: Math.floor(bs.hp * pet.qualityMultiplier),
  };
  if (!player.pets) player.pets = [];
  player.pets.push(pet);
  return { success: true, pet, msg: `【${eggName}】破壳而出，孵化出${q}【${pet.name}】！` };
}

// 灵兽蛋清单（交易市场可购买；与 PET_TYPES 一一对应）
const PET_EGGS = {};
for (const t of PET_TYPES) {
  PET_EGGS[`${t.name}蛋`] = { typeId: t.id, tier: t.tier, price: getEggPrice(t.tier), eggArt: t.eggArt };
}

// 灵兽用品区货物（喂食/捕获辅助）
const PET_SUPPLIES = [
  { name: '灵兽口粮', price: 30, desc: '精心调配的灵兽口粮，喂食+30晋升经验' },
  { name: '灵果', price: 50, desc: '蕴含灵气的仙果，喂食+35~100晋升经验' },
  { name: '捕兽网', price: 100, desc: '捕捉灵兽成功率+20%' },
  { name: '灵兽袋', price: 300, desc: '捕捉灵兽成功率+30%' },
];

// 宠物战斗辅助（需求：成长阶段/性格影响辅助强度；跟随的宠物必定参战）
function petAssistInCombat(pet, player, enemy) {
  // 跟随宠物必定出战；非跟随需 isActive 且忠诚足够
  if (!pet) return null;
  if (!pet.following) {
    if (!pet.isActive) return null;
    if (pet.loyalty < 30) return { msg: `${pet.name}忠诚度不足，不肯出战。` };
  }
  // 跟随加成：跟随宠物额外 +20% 战力（参与战斗的加成）
  const followBonus = pet.following ? 1.2 : 1;

  // 成长阶段修正：幼年0.8 / 少年1.1 / 成年1.3
  const stageMult = (pet.growthStage === '成年期' ? 1.3 : pet.growthStage === '少年期' ? 1.1 : 0.8) * followBonus;
  // 性格修正
  const atkBonus = ['好斗', '忠诚', '灵慧'].includes(pet.personality) ? 1.2 : ['贪吃', '慵懒'].includes(pet.personality) ? 0.9 : 1;
  const damage = Math.floor(pet.stats.atk * (0.5 + Math.random() * 0.5) * stageMult * atkBonus);
  enemy.hp.current = Math.max(0, enemy.hp.current - damage);

  // 技能效果
  let skillEffect = '';
  switch (pet.skill) {
    case '预警':
      player.dodgeBonus = (player.dodgeBonus || 0) + 10;
      skillEffect = '，提升了你的闪避';
      break;
    case '治愈':
    case '祥光':
    case '延年益寿':
      player.hp.current = Math.min(player.hp.max, player.hp.current + Math.floor(pet.stats.atk * stageMult));
      skillEffect = '，治愈了你';
      break;
    case '魅惑':
      if (chance(30)) {
        enemy.statusEffects = enemy.statusEffects || [];
        enemy.statusEffects.push({ name: '魅惑', turns: 2 });
        skillEffect = '，魅惑了敌人';
      }
      break;
    case '虎啸':
    case '龙吟':
    case '狼王咆哮':
      if (chance(25)) {
        enemy.statusEffects = enemy.statusEffects || [];
        enemy.statusEffects.push({ name: '恐惧', turns: 1 });
        skillEffect = '，震慑了敌人';
      }
      break;
    case '冰封':
      if (chance(25)) {
        enemy.statusEffects = enemy.statusEffects || [];
        enemy.statusEffects.push({ name: '冰冻', turns: 1 });
        skillEffect = '，冰冻了敌人';
      }
      break;
    case '雷击':
    case '紫电':
    case '炎爆':
      if (chance(20)) {
        const extra = Math.floor(pet.stats.atk * 0.8 * stageMult);
        enemy.hp.current = Math.max(0, enemy.hp.current - extra);
        skillEffect = `，追加${extra}点伤害`;
      }
      break;
  }

  pet.exp += 10;
  if (pet.exp >= pet.expToNext) levelUpPet(pet);

  return { damage, msg: `${pet.name}发动攻击，造成${damage}点伤害${skillEffect}！` };
}

// 设置出战宠物
function setActivePet(player, petId) {
  if (!player.pets) return { success: false, msg: '你没有宠物' };
  for (const pet of player.pets) {
    pet.isActive = pet.id === petId;
  }
  const pet = player.pets.find(p => p.id === petId);
  return { success: true, msg: `${pet?.name || '宠物'}已设为出战。` };
}

// 宠物改名
function renamePet(pet, nickname) {
  pet.nickname = nickname;
  return { success: true, msg: `宠物已改名为${nickname}。` };
}

module.exports = {
  PET_TYPES, PET_EGGS, PET_SUPPLIES, getEggPrice, generatePet, tryCapture, levelUpPet,
  feedPet, feedPetItem, hatchPetEgg, petAssistInCombat, setActivePet, renamePet,
  DISH_FEED, dishFeedEffect, petDiet,
};
