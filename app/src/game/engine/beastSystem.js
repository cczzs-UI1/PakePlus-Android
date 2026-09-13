// 妖兽体系 - 按等级生成妖兽，立绘、属性、战斗剧情库
const { randInt, randChoice, clamp } = require('./utils');

// 妖兽等级定义
const BEAST_TIERS = {
  1: { name: '凡兽', hpRange: [50, 150], mpRange: [20, 50], atkRange: [5, 15], defRange: [2, 8], expReward: [10, 30], dropRate: 0.3 },
  2: { name: '灵兽', hpRange: [150, 400], mpRange: [50, 150], atkRange: [15, 35], defRange: [8, 20], expReward: [30, 80], dropRate: 0.4 },
  3: { name: '妖兽', hpRange: [400, 1000], mpRange: [150, 400], atkRange: [35, 80], defRange: [20, 50], expReward: [80, 200], dropRate: 0.5 },
  4: { name: '妖王', hpRange: [1000, 3000], mpRange: [400, 1000], atkRange: [80, 200], defRange: [50, 120], expReward: [200, 500], dropRate: 0.6 },
  5: { name: '妖皇', hpRange: [3000, 8000], mpRange: [1000, 3000], atkRange: [200, 500], defRange: [120, 300], expReward: [500, 1500], dropRate: 0.7 },
  6: { name: '妖神', hpRange: [8000, 20000], mpRange: [3000, 8000], atkRange: [500, 1200], defRange: [300, 800], expReward: [1500, 5000], dropRate: 0.8 },
};

// 妖兽种类定义（按等级）
const BEAST_TYPES = {
  1: [
    { name: '野狼', portrait: 'wolf.jpg', desc: '森林中常见的野狼，性情凶猛。', drops: ['兽皮', '兽肉'] },
    { name: '野兔', portrait: 'rabbit.jpg', desc: '敏捷的野兔，跑得很快。', drops: ['兽肉'] },
    { name: '野猪', portrait: 'boar.jpg', desc: '粗壮的野猪，皮糙肉厚。', drops: ['兽皮', '兽肉'] },
    { name: '毒蛇', portrait: 'snake.jpg', desc: '有毒的蛇类，攻击带毒。', drops: ['兽肉', '毒囊'] },
    { name: '黑熊', portrait: 'bear.jpg', desc: '力大无穷的黑熊。', drops: ['兽皮', '兽肉', '熊掌'] },
  ],
  2: [
    { name: '灵狐', portrait: 'spirit_fox.jpg', desc: '有灵性的狐狸，擅长幻术。', drops: ['灵狐皮', '妖丹'] },
    { name: '青蛇', portrait: 'green_snake.jpg', desc: '修行百年的青蛇，有毒。', drops: ['蛇皮', '妖丹', '毒囊'] },
    { name: '赤焰虎', portrait: 'flame_tiger.jpg', desc: '浑身冒火的猛虎。', drops: ['虎皮', '妖丹', '赤焰晶'] },
    { name: '玄龟', portrait: 'mystic_turtle.jpg', desc: '防御极高的玄龟。', drops: ['龟甲', '妖丹'] },
    { name: '风狼', portrait: 'wind_wolf.jpg', desc: '速度极快的风属性狼。', drops: ['风狼皮', '妖丹', '风晶'] },
  ],
  3: [
    { name: '烈焰狮', portrait: 'flame_lion.jpg', desc: '掌控火焰的雄狮。', drops: ['狮皮', '妖丹', '烈焰晶'] },
    { name: '寒冰蟒', portrait: 'ice_python.jpg', desc: '吐息寒冰的巨蟒。', drops: ['蟒皮', '妖丹', '寒冰晶'] },
    { name: '雷鹰', portrait: 'thunder_eagle.jpg', desc: '翱翔天际的雷属性巨鹰。', drops: ['鹰羽', '妖丹', '雷晶'] },
    { name: '毒蝎王', portrait: 'poison_scorpion.jpg', desc: '剧毒的蝎子王。', drops: ['蝎壳', '妖丹', '毒囊'] },
    { name: '石巨人', portrait: 'stone_golem.jpg', desc: '由岩石构成的巨人。', drops: ['石心', '玄铁'] },
  ],
  4: [
    { name: '九尾天狐', portrait: 'nine_tail_fox.jpg', desc: '传说中的九尾狐，幻术通天。', drops: ['天狐皮', '妖丹', '九尾'] },
    { name: '蛟龙', portrait: 'flood_dragon.jpg', desc: '即将化龙的蛟。', drops: ['蛟皮', '妖丹', '龙鳞'] },
    { name: '凤凰', portrait: 'phoenix.jpg', desc: '浴火重生的神鸟。', drops: ['凤羽', '妖丹', '凤凰血'] },
    { name: '玄武', portrait: 'black_tortoise.jpg', desc: '北方神兽玄武。', drops: ['龟甲', '妖丹', '玄武盾'] },
    { name: '白虎', portrait: 'white_tiger.jpg', desc: '西方神兽白虎。', drops: ['虎皮', '妖丹', '白虎爪'] },
  ],
  5: [
    { name: '应龙', portrait: 'ying_dragon.jpg', desc: '有翼的神龙，呼风唤雨。', drops: ['龙鳞', '妖丹', '龙角'] },
    { name: '麒麟', portrait: 'qilin.jpg', desc: '祥瑞之兽，仁兽之首。', drops: ['麒麟角', '妖丹', '麒麟血'] },
    { name: '饕餮', portrait: 'taotie.jpg', desc: '上古凶兽，吞噬万物。', drops: ['饕餮牙', '妖丹', '饕餮胃'] },
    { name: '穷奇', portrait: 'qiongqi.jpg', desc: '上古凶兽，善恶颠倒。', drops: ['穷奇翼', '妖丹'] },
    { name: '梼杌', portrait: 'taowu.jpg', desc: '上古凶兽，顽固不化。', drops: ['梼杌皮', '妖丹'] },
  ],
  6: [
    { name: '祖龙', portrait: 'ancestor_dragon.jpg', desc: '万龙之祖，开天辟地。', drops: ['祖龙鳞', '妖丹', '祖龙角'] },
    { name: '元凤', portrait: 'yuan_phoenix.jpg', desc: '百鸟之祖，涅槃不灭。', drops: ['元凤羽', '妖丹', '元凤血'] },
    { name: '始麒麟', portrait: 'first_qilin.jpg', desc: '走兽之祖，祥瑞化身。', drops: ['始麒麟角', '妖丹', '始麒麟血'] },
    { name: '混沌', portrait: 'chaos.jpg', desc: '混沌之兽，无面无识。', drops: ['混沌核', '妖丹'] },
  ],
};

// 妖兽战斗剧情库
const BEAST_BATTLE_EVENTS = {
  playerAttack: [
    '你挥剑斩向{beast}，{beast}发出一声怒吼，身上留下一道伤痕。',
    '你凝聚灵力，一掌拍向{beast}，{beast}被震退数步。',
    '你施展身法，绕到{beast}身后，一剑刺出，{beast}吃痛反击。',
    '你取出法器，催动灵力击向{beast}，法器光芒大作，{beast}被击中。',
    '你大喝一声，全力一击轰向{beast}，{beast}被打得连连后退。',
  ],
  beastAttack: [
    '{beast}张开血盆大口，向你扑来，你勉强格挡，仍被震得气血翻涌。',
    '{beast}尾巴一甩，带着劲风扫向你，你侧身躲过，却被余波波及。',
    '{beast}喷出一道火焰/寒冰/雷电，你急忙运起护体灵力，仍被灼伤/冻伤/麻痹。',
    '{beast}怒吼一声，声波震得你头晕目眩，趁机一爪抓来，在你身上留下血痕。',
    '{beast}突然加速，化作一道残影撞向你，你来不及躲避，被撞飞出去。',
  ],
  playerCritical: [
    '你抓住{beast}的破绽，一剑刺入其要害，{beast}发出凄厉的惨叫。',
    '你灵光一闪，使出绝学，正中{beast}命门，{beast}重伤倒地。',
    '你气运加身，这一击威力倍增，{beast}被打得奄奄一息。',
  ],
  beastCritical: [
    '{beast}突然发狂，攻击力倍增，一爪将你拍飞，你口吐鲜血。',
    '{beast}使出本命神通，威力惊人，你被正面击中，身受重伤。',
    '{beast}眼中闪过一丝狡诈，假装败退，趁你追击时突然反击，你中招倒地。',
  ],
  victory: [
    '经过一番激战，你终于将{beast}斩杀。{beast}的尸体倒在地上，你上前搜刮战利品。',
    '你使出最后一击，{beast}轰然倒地。你松了口气，开始收集{beast}身上的材料。',
    '{beast}发出最后一声悲鸣，倒在血泊中。你 victory 了，获得了丰厚的战利品。',
  ],
  defeat: [
    '你不敌{beast}，被打得遍体鳞伤，只得狼狈逃窜。',
    '{beast}的实力远超你的想象，你拼尽全力才得以脱身，但身受重伤。',
    '你被{beast}击败，昏死过去。醒来时发现自己躺在路边，身上的东西少了一些。',
  ],
  flee: [
    '你见势不妙，施展身法逃离了战场。{beast}在身后怒吼，却追不上你。',
    '你扔出一颗烟雾弹，趁乱逃走。{beast}在烟雾中迷失了方向。',
    '你且战且退，终于摆脱了{beast}的追击。',
  ],
  fleeFail: [
    '你试图逃跑，但{beast}速度更快，拦住了你的去路。',
    '{beast}识破了你的意图，提前堵住了你的退路。',
    '你慌不择路，反而被{beast}追上，只得继续战斗。',
  ],
};

// 生成妖兽
function generateBeast(tier = 1, location = '落日森林') {
  const tierInfo = BEAST_TIERS[tier] || BEAST_TIERS[1];
  const types = BEAST_TYPES[tier] || BEAST_TYPES[1];
  const beastType = randChoice(types);

  return {
    id: 'beast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: beastType.name,
    tier: tier,
    tierName: tierInfo.name,
    portrait: beastType.portrait,
    desc: beastType.desc,
    location: location,
    hp: randInt(tierInfo.hpRange[0], tierInfo.hpRange[1]),
    maxHp: 0,
    mp: randInt(tierInfo.mpRange[0], tierInfo.mpRange[1]),
    maxMp: 0,
    atk: randInt(tierInfo.atkRange[0], tierInfo.atkRange[1]),
    def: randInt(tierInfo.defRange[0], tierInfo.defRange[1]),
    expReward: randInt(tierInfo.expReward[0], tierInfo.expReward[1]),
    dropRate: tierInfo.dropRate,
    drops: beastType.drops,
    isBeast: true,
  };
}

// 生成秘境boss
function generateBoss(dungeonId, tier = 3) {
  const bossNames = {
    'bandit_1': { name: '落日森林二当家', tier: 2 },
    'bandit_2': { name: '落日森林大当家', tier: 3 },
    'bandit_3': { name: '落日森林寨主', tier: 4 },
    'trial_tower': { name: '试炼塔守护者', tier: 3 },
    'town_demon': { name: '镇魔塔魔尊', tier: 5 },
    'skeleton_camp': { name: '骷髅将军', tier: 3 },
    'necromancer_tower': { name: '死灵法师', tier: 4 },
    'puppet_guard': { name: '傀儡守卫长', tier: 3 },
    'void_beast': { name: '虚空兽王', tier: 5 },
    'dragon_trial': { name: '祖龙残影', tier: 6 },
    'heart_demon': { name: '心魔', tier: 4 },
    'nine_heaven': { name: '九重天守护者', tier: 5 },
    'prison_break': { name: '天牢死囚', tier: 3 },
  };

  const bossInfo = bossNames[dungeonId] || { name: '秘境守护者', tier: tier };
  const beast = generateBeast(bossInfo.tier, dungeonId);
  beast.name = bossInfo.name;
  beast.isBoss = true;
  beast.hp = Math.floor(beast.hp * 1.5);
  beast.atk = Math.floor(beast.atk * 1.3);
  beast.expReward = Math.floor(beast.expReward * 2);
  beast.dropRate = Math.min(0.95, beast.dropRate + 0.2);
  return beast;
}

// 获取妖兽战斗剧情
function getBeastBattleEvent(type, beastName) {
  const events = BEAST_BATTLE_EVENTS[type] || [];
  let event = randChoice(events);
  return event.replace(/{beast}/g, beastName);
}

// 妖兽掉落物品
function getBeastDrops(beast) {
  const drops = [];
  for (const dropName of beast.drops) {
    if (Math.random() < beast.dropRate) {
      drops.push({ name: dropName, count: randInt(1, 3) });
    }
  }
  // 妖王以上必掉妖丹
  if (beast.tier >= 3 && Math.random() < 0.8) {
    drops.push({ name: '妖丹', count: randInt(1, 2) });
  }
  return drops;
}

module.exports = {
  BEAST_TIERS,
  BEAST_TYPES,
  BEAST_BATTLE_EVENTS,
  generateBeast,
  generateBoss,
  getBeastBattleEvent,
  getBeastDrops,
};
