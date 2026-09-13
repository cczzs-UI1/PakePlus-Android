// 宅子剧情系统 - 各地点随机剧情库
const { randInt, randChoice, chance, genderize } = require('./utils');

// 正厅剧情库
const HALL_EVENTS = [
  {
    id: 'friend_visit',
    name: '朋友拜访',
    condition: (player) => (player.acquaintances || []).length > 0,
    text: (player, npc) => `你正在正厅品茶，忽闻下人通报，${npc.name}前来拜访。${npc.name}进门后笑道："许久不见，特来探望。"`,
    options: [
      { text: '热情款待，留饭', effect: { favor: 15, silver: -50, reputation: 5 } },
      { text: '简单寒暄，送客', effect: { favor: 5 } },
      { text: '冷淡相待', effect: { favor: -10, reputation: -3 } },
    ],
    resultText: (choice, npc) => choice === 0 ? `你设宴款待${npc.name}，相谈甚欢，临别时${npc.name}再三道谢。` : choice === 1 ? `你与${npc.name}寒暄几句后便送其离开。` : `你态度冷淡，${npc.name}面露不悦，悻悻离去。`,
  },
  {
    id: 'friend_gift',
    name: '朋友送礼',
    condition: (player) => (player.acquaintances || []).length > 0,
    text: (player, npc) => `${npc.name}带着礼物登门拜访，说道："近日得了些好物，特来送与你。"`,
    options: [
      { text: '欣然收下，回赠银两', effect: { favor: 10, silver: -30, randomItem: true } },
      { text: '欣然收下', effect: { favor: 5, randomItem: true } },
      { text: '婉言谢绝', effect: { favor: -5, reputation: 3 } },
    ],
    resultText: (choice, npc) => choice < 2 ? `你收下了${npc.name}的礼物。` : `你婉言谢绝了${npc.name}的好意，${npc.name}虽有些意外，但也未勉强。`,
  },
  {
    id: 'servant_seduce',
    name: '仆役爬床',
    condition: (player) => (player.mansion?.servants || []).filter(s => s.gender !== player.gender && s.age >= 14).length > 0,
    text: (player, servant) => `夜深人静，${servant.name}悄悄来到你的卧房，红着脸说："主人，让我伺候你歇息吧。"`,
    options: [
      { text: '欣然接受', effect: { servantLoyalty: 15, servantSatisfaction: 20, possiblePregnancy: true } },
      { text: '婉言拒绝', effect: { servantLoyalty: -5, servantSatisfaction: -10 } },
      { text: '严厉斥责，逐出府', effect: { servantLoyalty: -50, dismissServant: true } },
    ],
    resultText: (choice, servant) => choice === 0 ? `你留下了${servant.name}，一夜温存。` : choice === 1 ? `你婉言拒绝了${servant.name}，他/她有些失望地退下了。` : `你严厉斥责了${servant.name}，并将其逐出府去。`,
  },
  {
    id: 'wife_visit',
    name: '妻妾拜访',
    condition: (player) => (player.family?.spouse || (player.family?.wives || []).length > 0),
    text: (player, wife) => `${wife.name}端着参汤来到正厅，温柔地说："夫君，趁热喝了吧，补补身子。"`,
    options: [
      { text: '感动喝下，温存一番', effect: { favor: 20, hp: 20, possiblePregnancy: true } },
      { text: '喝下，道谢', effect: { favor: 10, hp: 10 } },
      { text: '不耐烦地挥手', effect: { favor: -15 } },
    ],
    resultText: (choice, wife) => choice === 0 ? `你喝下参汤，与${wife.name}温存了一番。` : choice === 1 ? `你喝下参汤，向${wife.name}道了谢。` : `你不耐烦地挥挥手，${wife.name}眼眶一红，默默退下了。`,
  },
  {
    id: 'concubine_seduce',
    name: '妾室勾引',
    condition: (player) => (player.family?.wives || []).length > 0,
    text: (player, concubine) => `${concubine.name}穿着轻薄的衣衫来到正厅，眼波流转地说："夫君，妾身新学了一支舞，跳给你看可好？"`,
    options: [
      { text: '欣然观赏，临幸于她', effect: { favor: 25, possiblePregnancy: true } },
      { text: '观赏舞蹈，赏赐', effect: { favor: 10, silver: -20 } },
      { text: '斥责其不守妇道', effect: { favor: -20, reputation: 5 } },
    ],
    resultText: (choice, concubine) => choice === 0 ? `你观赏了${concubine.name}的舞蹈，随后临幸了她。` : choice === 1 ? `你观赏了${concubine.name}的舞蹈，打赏了些银两。` : `你斥责了${concubine.name}，她羞愤交加地退下了。`,
  },
];

// 后院剧情库
const BACKYARD_EVENTS = [
  {
    id: 'concubine_gossip',
    name: '妾室争风',
    condition: (player) => (player.family?.wives || []).length >= 2,
    text: (player, c1, c2) => `你刚走到后院，就听见${c1.name}和${c2.name}在争吵。${c1.name}冷笑道："哼，就你也配跟我争？"${c2.name}不甘示弱："你算什么东西！"`,
    options: [
      { text: '各打五十大板', effect: { favor1: -10, favor2: -10, reputation: 5 } },
      { text: '偏袒一方', effect: { favor1: 10, favor2: -20 } },
      { text: '好言相劝', effect: { favor1: 5, favor2: 5 } },
    ],
    resultText: (choice, c1, c2) => choice === 0 ? `你将两人各训斥了一顿，她们虽不服气，但也不敢再争。` : choice === 1 ? `你偏袒了${c1.name}，${c2.name}愤愤离去。` : `你好言相劝，两人终于不再争吵。`,
  },
  {
    id: 'garden_walk',
    name: '花园漫步',
    condition: () => true,
    text: () => '你在后花园中漫步，花香扑鼻，心情舒畅。',
    options: [
      { text: '继续漫步', effect: { hp: 10, spirit: 5 } },
      { text: '回房休息', effect: { hp: 5 } },
      { text: '修炼片刻', effect: { cultivationExp: 30 } },
    ],
    resultText: (choice) => choice === 0 ? '你在花园中漫步良久，身心舒畅。' : choice === 1 ? '你回房休息了片刻。' : '你在花园中找了处幽静之地，修炼了片刻。',
  },
];

// 书房剧情库
const STUDY_EVENTS = [
  {
    id: 'study_read',
    name: '研读典籍',
    condition: () => true,
    text: () => '你在书房中翻阅典籍，发现一本古籍中记载着失传的修炼心得。',
    options: [
      { text: '仔细研读', effect: { enlightenment: 3, cultivationExp: 50 } },
      { text: '略作浏览', effect: { enlightenment: 1, cultivationExp: 20 } },
      { text: '放回原处', effect: {} },
    ],
    resultText: (choice) => choice === 0 ? '你仔细研读了古籍，获益匪浅。' : choice === 1 ? '你略作浏览，记下了一些要点。' : '你将古籍放回原处。',
  },
  {
    id: 'guest_discuss',
    name: '友人论道',
    condition: (player) => (player.acquaintances || []).length > 0,
    text: (player, npc) => `${npc.name}来书房拜访，与你探讨修炼心得，两人相谈甚欢。`,
    options: [
      { text: '深入探讨', effect: { enlightenment: 2, favor: 10, cultivationExp: 30 } },
      { text: '泛泛而谈', effect: { favor: 5 } },
      { text: '托辞送客', effect: { favor: -5 } },
    ],
    resultText: (choice, npc) => choice === 0 ? `你与${npc.name}深入探讨，双方都有所得。` : choice === 1 ? `你与${npc.name}泛泛而谈。` : `你托辞有事，${npc.name}识趣地告辞了。`,
  },
];

// 厨房剧情库
const KITCHEN_EVENTS = [
  {
    id: 'cook_try',
    name: '尝试新菜',
    condition: () => true,
    text: () => '厨娘正在尝试一道新菜，香气四溢，你忍不住上前品尝。',
    options: [
      { text: '大加赞赏，打赏', effect: { servantLoyalty: 10, silver: -10, hp: 15 } },
      { text: '评价一般', effect: { servantLoyalty: -5, hp: 10 } },
      { text: '严厉批评', effect: { servantLoyalty: -15, hp: 5 } },
    ],
    resultText: (choice) => choice === 0 ? '你对新菜大加赞赏，厨娘喜笑颜开。' : choice === 1 ? '你评价一般，厨娘有些失望。' : '你严厉批评了厨娘，她战战兢兢地记下了。',
  },
];

// 静室剧情库
const MEDITATION_EVENTS = [
  {
    id: 'meditation_breakthrough',
    name: '静修悟道',
    condition: () => true,
    text: () => '你在静室中打坐修炼，忽觉灵台清明，似有所悟。',
    options: [
      { text: '继续参悟', effect: { cultivationExp: 80, enlightenment: 2 } },
      { text: '收功起身', effect: { cultivationExp: 30 } },
      { text: '强行突破', effect: { cultivationExp: 100, hp: -20 } },
    ],
    resultText: (choice) => choice === 0 ? '你继续参悟，修为大有精进。' : choice === 1 ? '你收功起身，感觉神清气爽。' : '你强行突破，虽有精进但也受了些内伤。',
  },
];

// 所有宅子地点剧情
const MANSION_EVENTS = {
  hall: HALL_EVENTS,
  backyard: BACKYARD_EVENTS,
  study: STUDY_EVENTS,
  kitchen: KITCHEN_EVENTS,
  meditation: MEDITATION_EVENTS,
  default: [...HALL_EVENTS, ...BACKYARD_EVENTS, ...STUDY_EVENTS],
};

// 触发宅子随机剧情
function triggerMansionEvent(player, area = 'hall', allNpcs = []) {
  const events = MANSION_EVENTS[area] || MANSION_EVENTS.default;
  const validEvents = events.filter(e => !e.condition || e.condition(player));
  if (validEvents.length === 0) return null;

  const event = randChoice(validEvents);
  let npc = null;
  let npc2 = null;
  let servant = null;
  let wife = null;

  // 根据剧情类型选择相关NPC
  if (event.id === 'friend_visit' || event.id === 'friend_gift' || event.id === 'guest_discuss') {
    const acquaintances = (player.acquaintances || []).map(id => allNpcs.find(n => n.id === id)).filter(Boolean);
    if (acquaintances.length > 0) npc = randChoice(acquaintances);
  } else if (event.id === 'servant_seduce') {
    const servants = (player.mansion?.servants || []).filter(s => s.gender !== player.gender && s.age >= 14);
    if (servants.length > 0) servant = randChoice(servants);
  } else if (event.id === 'wife_visit' || event.id === 'concubine_seduce') {
    const wives = [];
    if (player.family?.spouse) {
      const spouse = allNpcs.find(n => n.id === player.family.spouse);
      if (spouse) wives.push(spouse);
    }
    for (const wId of (player.family?.wives || [])) {
      const w = allNpcs.find(n => n.id === wId);
      if (w) wives.push(w);
    }
    if (wives.length > 0) wife = randChoice(wives);
  } else if (event.id === 'concubine_gossip') {
    const wives = (player.family?.wives || []).map(id => allNpcs.find(n => n.id === id)).filter(Boolean);
    if (wives.length >= 2) {
      npc = wives[0];
      npc2 = wives[1];
    }
  }

  // 如果需要NPC但没有，返回null
  if ((event.id === 'friend_visit' || event.id === 'friend_gift' || event.id === 'guest_discuss') && !npc) return null;
  if (event.id === 'servant_seduce' && !servant) return null;
  if ((event.id === 'wife_visit' || event.id === 'concubine_seduce') && !wife) return null;
  if (event.id === 'concubine_gossip' && (!npc || !npc2)) return null;

  const text = event.text(player, npc || servant || wife, npc2);

  return {
    id: event.id,
    name: event.name,
    text,
    options: event.options,
    npc,
    npc2,
    servant,
    wife,
    resultText: event.resultText,
  };
}

// 应用宅子剧情效果
function applyMansionEventEffect(player, event, choiceIndex, allNpcs = []) {
  const option = event.options[choiceIndex];
  const effect = option.effect;
  const results = [];

  if (effect.favor && event.npc) {
    event.npc.favorWithPlayer = Math.min(1000, (event.npc.favorWithPlayer || 0) + effect.favor);
    results.push(`对${event.npc.name}好感${effect.favor >= 0 ? '+' : ''}${effect.favor}`);
  }
  if (effect.favor1 && event.npc) {
    event.npc.favorWithPlayer = Math.min(1000, (event.npc.favorWithPlayer || 0) + effect.favor1);
  }
  if (effect.favor2 && event.npc2) {
    event.npc2.favorWithPlayer = Math.min(1000, (event.npc2.favorWithPlayer || 0) + effect.favor2);
  }
  if (effect.silver) {
    player.silver = Math.max(0, (player.silver || 0) + effect.silver);
    results.push(`银两${effect.silver >= 0 ? '+' : ''}${effect.silver}`);
  }
  if (effect.hp) {
    player.hp.current = Math.min(player.hp.max, Math.max(1, player.hp.current + effect.hp));
    results.push(`气血${effect.hp >= 0 ? '+' : ''}${effect.hp}`);
  }
  if (effect.cultivationExp) {
    player.cultivationExp += effect.cultivationExp;
    results.push(`修为+${effect.cultivationExp}`);
  }
  if (effect.enlightenment) {
    player.attributes.enlightenment += effect.enlightenment;
    results.push(`悟性+${effect.enlightenment}`);
  }
  if (effect.reputation) {
    player.reputation = (player.reputation || 0) + effect.reputation;
    results.push(`声望${effect.reputation >= 0 ? '+' : ''}${effect.reputation}`);
  }
  if (effect.servantLoyalty && event.servant) {
    event.servant.loyalty = Math.max(0, Math.min(100, (event.servant.loyalty || 50) + effect.servantLoyalty));
  }
  if (effect.servantSatisfaction && event.servant) {
    event.servant.satisfaction = Math.max(0, Math.min(100, (event.servant.satisfaction || 50) + effect.servantSatisfaction));
  }
  if (effect.dismissServant && event.servant) {
    const idx = (player.mansion?.servants || []).findIndex(s => s.id === event.servant.id);
    if (idx >= 0) player.mansion.servants.splice(idx, 1);
    results.push(`已将${event.servant.name}逐出府`);
  }
  if (effect.randomItem) {
    const items = ['回灵丹', '聚气丹', '疗伤丹', '下品灵石', '精铁', '灵草'];
    const item = randChoice(items);
    if (!player.inventory) player.inventory = [];
    const existing = player.inventory.find(i => i.name === item);
    if (existing) existing.count++;
    else player.inventory.push({ name: item, count: 1 });
    results.push(`获得${item}`);
  }
  if (effect.possiblePregnancy && event.servant && event.servant.gender === '女') {
    if (Math.random() < 0.15 && !event.servant.isPregnant) {
      event.servant.isPregnant = true;
      event.servant.pregnancyMonths = 0;
      event.servant.pregnancyFather = player.id;
      results.push(`${event.servant.name}有了身孕`);
    }
  }
  if (effect.possiblePregnancy && event.wife && event.wife.gender === '女') {
    if (Math.random() < 0.2 && !event.wife.isPregnant) {
      event.wife.isPregnant = true;
      event.wife.pregnancyMonths = 0;
      event.wife.pregnancyFather = player.id;
      results.push(`${event.wife.name}有了身孕`);
    }
  }

  const resultText = genderize(event.resultText(choiceIndex, event.npc || event.servant || event.wife, event.npc2), event.npc || event.servant || event.wife);
  return { resultText, effects: results };
}

module.exports = {
  triggerMansionEvent,
  applyMansionEventEffect,
  MANSION_EVENTS,
};
