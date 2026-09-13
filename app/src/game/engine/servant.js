// 仆役系统 - 牙人所、购买、仆役面板、交互剧情
const { randInt, randChoice, chance, genId, clamp, genderize, SINGLE_SURNAMES, DOUBLE_SURNAMES, NAME_A_CHARS, NAME_B_CHARS } = require('./utils');

// 仆役类型
const SERVANT_TYPES = [
  { type: '小厮', gender: '男', desc: '跑腿打杂的年轻男仆', price: 50, skills: ['跑腿', '打杂'] },
  { type: '丫鬟', gender: '女', desc: '伺候起居的年轻女仆', price: 50, skills: ['伺候', '针线'] },
  { type: '护院', gender: '男', desc: '看家护院的壮汉', price: 200, skills: ['护卫', '练武'] },
  { type: '厨娘', gender: '女', desc: '擅长烹饪的女仆', price: 150, skills: ['烹饪', '管家'] },
  { type: '管家', gender: '男', desc: '管理府中事务的老练仆人', price: 500, skills: ['管家', '理财', '交际'] },
  { type: '嬷嬷', gender: '女', desc: '经验丰富的老仆，擅长管教下人', price: 300, skills: ['管教', '礼仪', '接生'] },
  { type: '花匠', gender: '男', desc: '打理花园的园丁', price: 100, skills: ['园艺', '种植'] },
  { type: '马夫', gender: '男', desc: '饲养马匹的车夫', price: 120, skills: ['驯马', '驾车'] },
  { type: '绣娘', gender: '女', desc: '擅长刺绣的女仆', price: 180, skills: ['刺绣', '针线'] },
  { type: '书童', gender: '男', desc: '陪读的少年仆人', price: 80, skills: ['磨墨', '整理', '读书'] },
  { type: '歌姬', gender: '女', desc: '擅长歌舞的美貌女仆', price: 800, skills: ['歌舞', '弹琴', '劝酒'] },
  { type: '舞姬', gender: '女', desc: '舞姿曼妙的女仆', price: 600, skills: ['舞蹈', '弹琴'] },
];

// 仆役性格
const SERVANT_PERSONALITIES = [
  '憨厚', '机灵', '勤快', '懒惰', '忠诚', '狡猾', '胆小', '胆大',
  '细心', '粗心', '温顺', '倔强', '嘴甜', '木讷', '好色', '贪财',
];

// 生成随机仆役（牙人所刷新用，不属于大世界NPC）
function generateServantForSale() {
  const type = randChoice(SERVANT_TYPES);
  const useDouble = Math.random() < 0.2;
  const surname = useDouble ? randChoice(DOUBLE_SURNAMES) : randChoice(SINGLE_SURNAMES);
  const nameA = randChoice(NAME_A_CHARS);
  const nameB = randChoice(NAME_B_CHARS);

  return {
    id: 'servant_sale_' + Date.now() + '_' + randInt(1000, 9999),
    name: surname + nameA + nameB,
    surname,
    givenName: nameA + nameB,
    gender: type.gender,
    age: randInt(12, 40),
    type: type.type,
    desc: type.desc,
    price: type.price + randInt(-20, 50),
    basePrice: type.price,
    skills: [...type.skills],
    personality: randChoice(SERVANT_PERSONALITIES),
    loyalty: randInt(30, 70),
    satisfaction: randInt(50, 80),
    health: randInt(70, 100),
    // 仆役没有灵根和修为
    hasSpiritRoot: false,
    realmLevel: 0,
    cultivationExp: 0,
    isServant: true,
    forSale: true,
  };
}

// 牙人所每月刷新仆役
function refreshServantsForSale() {
  const servants = [];
  const count = randInt(5, 10);
  for (let i = 0; i < count; i++) {
    servants.push(generateServantForSale());
  }
  return servants;
}

// 购买仆役
function buyServant(player, servantId, servantsForSale) {
  const servant = servantsForSale.find(s => s.id === servantId);
  if (!servant) return { error: '没有这个仆役' };

  // 检查宅子容量
  const mansionLevel = player.mansion?.level || 1;
  const maxServants = [0, 0, 1, 3, 5, 10, 20, 40, 50, 100][mansionLevel] || 0;
  const currentServants = player.mansion?.servants?.length || 0;

  if (currentServants >= maxServants) {
    return { error: `仆役已达上限（${maxServants}人），请升级宅子` };
  }

  if (player.silver < servant.price) {
    return { error: `银两不足，需要${servant.price}银两` };
  }

  player.silver -= servant.price;

  // 仆役成为玩家的人
  const ownedServant = {
    ...servant,
    id: 'servant_' + Date.now() + '_' + randInt(1000, 9999),
    forSale: false,
    ownerId: player.id || 'player',
    joinDate: new Date().toISOString(),
    assignedArea: null,
  };

  if (!player.mansion) player.mansion = { servants: [] };
  if (!player.mansion.servants) player.mansion.servants = [];
  player.mansion.servants.push(ownedServant);

  // 从出售列表移除
  const idx = servantsForSale.findIndex(s => s.id === servantId);
  if (idx >= 0) servantsForSale.splice(idx, 1);

  return {
    success: true,
    text: `你花费${servant.price}银两买下了${servant.name}（${servant.type}）。`,
    servant: ownedServant,
  };
}

// 仆役交互剧情
const SERVANT_INTERACTIONS = {
  talk: [
    { text: '{name}恭恭敬敬地向你请安："主人安好。"', loyalty: 2 },
    { text: '你与{name}闲聊了几句，他/她看起来很高兴。', satisfaction: 5, loyalty: 1 },
    { text: '{name}向你汇报了府中的近况，一切安好。', satisfaction: 3 },
    { text: '{name}有些拘谨地回答着你的问话，似乎有些紧张。', loyalty: 0 },
    { text: '你问{name}家中情况，他/她眼圈微红，说一切都好。', loyalty: 3, satisfaction: -2 },
  ],
  reward: [
    { text: '你赏赐了{name}一些银两，他/她喜出望外，连连道谢。', satisfaction: 15, loyalty: 10, silver: -20 },
    { text: '你赏了{name}一桌好酒好菜，他/她吃得很开心。', satisfaction: 10, loyalty: 5 },
    { text: '你赐给{name}一件新衣，他/她感激涕零。', satisfaction: 12, loyalty: 8 },
  ],
  punish: [
    { text: '你训斥了{name}一顿，他/她吓得瑟瑟发抖。', satisfaction: -10, loyalty: -5 },
    { text: '你罚{name}去扫院子，他/她虽有怨言但不敢不从。', satisfaction: -15, loyalty: -8 },
    { text: '你杖责了{name}，他/她忍痛受罚，心中暗恨。', satisfaction: -20, loyalty: -15, health: -10 },
  ],
  assign: [
    { text: '你安排{name}去{area}当差，他/她领命而去。', satisfaction: 0 },
    { text: '{name}欣然接受了新的差事，干劲十足。', satisfaction: 5, loyalty: 2 },
  ],
  dismiss: [
    { text: '你将{name}逐出府去，他/她收拾东西黯然离开。', satisfaction: -30, loyalty: -20 },
    { text: '{name}跪在地上苦苦哀求，但你去意已决。', satisfaction: -25, loyalty: -25 },
  ],
  sleep: [
    { text: '你将{name}叫到房中，一夜温存。', satisfaction: 10, loyalty: 15 },
    { text: '{name}半推半就，最终还是从了你。', satisfaction: 5, loyalty: 10 },
    { text: '{name}誓死不从，你只得作罢，心中有些不快。', satisfaction: -5, loyalty: -10 },
  ],
};

// 仆役交互
function interactWithServant(player, servantId, action) {
  const servant = player.mansion?.servants?.find(s => s.id === servantId);
  if (!servant) return { error: '没有这个仆役' };

  const interactions = SERVANT_INTERACTIONS[action];
  if (!interactions) return { error: '没有这个交互选项' };

  const event = randChoice(interactions);
  let text = genderize(event.text.replace(/{name}/g, servant.name).replace(/{area}/g, '仆役所'), servant);

  // 应用效果
  if (event.loyalty) servant.loyalty = clamp(servant.loyalty + event.loyalty, 0, 100);
  if (event.satisfaction) servant.satisfaction = clamp(servant.satisfaction + event.satisfaction, 0, 100);
  if (event.health) servant.health = clamp(servant.health + event.health, 0, 100);
  if (event.silver) player.silver = Math.max(0, player.silver + event.silver);

  // 特殊处理
  if (action === 'dismiss') {
    const idx = player.mansion.servants.findIndex(s => s.id === servantId);
    if (idx >= 0) player.mansion.servants.splice(idx, 1);
    text += ` ${servant.name}已被逐出府。`;
  }

  // 宠幸仆役可能导致怀孕
  if (action === 'sleep' && servant.gender === '女' && player.gender === '男' && !servant.isPregnant) {
    if (chance(15)) {
      servant.isPregnant = true;
      servant.pregnancyMonths = 0;
      servant.pregnancyFather = player.id;
      text += ` 一个月后，${servant.name}发现自己有了身孕。`;
    }
  }

  return {
    success: true,
    text,
    servant,
    effects: {
      loyalty: event.loyalty || 0,
      satisfaction: event.satisfaction || 0,
      health: event.health || 0,
    },
  };
}

// 仆役每月随机事件
const SERVANT_MONTHLY_EVENTS = [
  { text: '{name}干活勤快，把府中打理得井井有条。', satisfaction: 5, loyalty: 3, condition: s => s.personality === '勤快' },
  { text: '{name}偷懒耍滑，被你抓个正着。', satisfaction: -10, condition: s => s.personality === '懒惰' },
  { text: '{name}偷偷藏了些私房钱。', satisfaction: 0, condition: s => s.personality === '贪财' },
  { text: '{name}对你忠心耿耿，任劳任怨。', loyalty: 5, condition: s => s.personality === '忠诚' },
  { text: '{name}与其他仆役发生争执，闹得不可开交。', satisfaction: -5 },
  { text: '{name}生病了，需要休养。', health: -20 },
  { text: '{name}家中来信，说是老母病重，他/她忧心忡忡。', satisfaction: -15, loyalty: -5 },
  { text: '{name}做事机灵，帮你解决了一个小麻烦。', satisfaction: 10, loyalty: 5, condition: s => s.personality === '机灵' },
  { text: '{name}笨手笨脚打碎了一个花瓶。', satisfaction: -8, condition: s => s.personality === '粗心' },
  { text: '{name}细心地整理了你的书房，你很满意。', satisfaction: 8, condition: s => s.personality === '细心' },
  { text: '{name}与府中其他仆役暗生情愫，时常私会。', satisfaction: 0 },
  { text: '{name}趁着夜色偷偷溜出府去，不知去做什么。', loyalty: -3, condition: s => s.loyalty < 50 },
];

// 触发仆役月事件
function triggerServantMonthlyEvent(player, servant) {
  // 孕期推进
  if (servant.gender === '女' && servant.isPregnant) {
    servant.pregnancyMonths++;
    if (servant.pregnancyMonths >= 10) {
      servant.isPregnant = false;
      servant.pregnancyMonths = 0;
      return { text: `${servant.name}为你生下了一个孩子！`, servant, birth: true };
    }
    return { text: `${servant.name}已有身孕${servant.pregnancyMonths}月，安心养胎中。`, servant, pregnancy: true };
  }

  const validEvents = SERVANT_MONTHLY_EVENTS.filter(e => !e.condition || e.condition(servant));
  if (validEvents.length === 0) return null;

  const event = randChoice(validEvents);
  let text = genderize(event.text.replace(/{name}/g, servant.name), servant);

  if (event.loyalty) servant.loyalty = clamp(servant.loyalty + event.loyalty, 0, 100);
  if (event.satisfaction) servant.satisfaction = clamp(servant.satisfaction + event.satisfaction, 0, 100);
  if (event.health) servant.health = clamp(servant.health + event.health, 0, 100);

  return { text, servant };
}

module.exports = {
  SERVANT_TYPES,
  SERVANT_PERSONALITIES,
  generateServantForSale,
  refreshServantsForSale,
  buyServant,
  interactWithServant,
  triggerServantMonthlyEvent,
  SERVANT_INTERACTIONS,
};
