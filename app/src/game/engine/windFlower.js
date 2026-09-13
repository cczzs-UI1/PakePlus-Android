// 风花雪月系统：温柔乡中的灵姬/灵郎
// 仅包含：结识、谈情说爱（好感）、赠礼、赎身、记事、子嗣查看
// 生成规则：按容貌/年龄推算受欢迎程度（1-5级），决定身价与消费档位
const { randInt, randChoice, chance, genId, genderize } = require('./utils');
const { tryConceive } = require('./family');

// 温柔乡地点 -> 档次名称
const VENUES = {
  '自由坊市': { name: '坊市花月楼', base: 1.0, tierName: '修真雅韵' },
};


// 道德取向：返回 sin 与 merit 差值（>0 为道德低，<0 为道德高）
function moralScore(player) {
  const karma = player.karma || {};
  return (karma.sin || 0) - (karma.merit || 0);
}

const GIVEN_NAMES = {
  男: ['子玉', '无尘', '清玄', '墨言', '临风', '白衣', '惊鸿', '止水', '青衫', '凌云', '问天', '听雨'],
  女: ['婉清', '若雪', '凝霜', '月眉', '紫嫣', '青鸾', '霓裳', '如烟', '流萤', '绯羽', '诗瑶', '梦蝶'],
};

// 容貌等级名称
function appearanceLabel(appearance) {
  if (appearance >= 85) return '倾国倾城';
  if (appearance >= 70) return '花容月貌';
  if (appearance >= 55) return '清丽脱俗';
  if (appearance >= 40) return '眉清目秀';
  return '端庄大方';
}

// 由容貌/年龄推算受欢迎程度（1-5级）
function calcPopularity(appearance, age) {
  let score = appearance;
  if (age > 40) score -= 25;
  else if (age > 30) score -= 10;
  else if (age < 18) score -= 5;
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 55) return 3;
  if (score >= 40) return 2;
  return 1;
}

// 各受欢迎等级的基础消费（银两）
const POPULARITY_COST = { 1: 100, 2: 300, 3: 800, 4: 2000, 5: 5000 };
// 赎身价格倍率
const REDEEM_MULT = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 40 };

// 生成一位灵姬/灵郎（forceTier 用于补足时固定受欢迎等级，保证每级至少2人）
function generatePerson(location, forceTier) {
  const gender = chance(60) ? '女' : '男';
  const age = randInt(18, 32);
  const appearance = randInt(35, 98);
  const popularity = forceTier || calcPopularity(appearance, age);
  const name = (gender === '女' ? randChoice(GIVEN_NAMES.女) : randChoice(GIVEN_NAMES.男));
  const surname = randChoice(['苏', '柳', '白', '沈', '林', '叶', '顾', '云', '秦', '花', '月', '风', '洛', '温']);
  return {
    id: genId('wf'),
    name: `${surname}${name}`,
    gender,
    age,
    appearance,
    appearanceLabel: appearanceLabel(appearance),
    popularity,
    cost: Math.floor(POPULARITY_COST[popularity] * (VENUES[location]?.base || 1)),
    redeemPrice: Math.floor(POPULARITY_COST[popularity] * (REDEEM_MULT[popularity] || 20) * (VENUES[location]?.base || 1)),
    favor: 0,          // 好感度 0-100
    known: false,      // 是否已结识
    notes: [`初入${VENUES[location]?.name || '温柔乡'}，与你相识。`],
    freed: false,      // 是否已赎身
    location,
    isWindFlower: true,
    fertility: gender === '女' ? randInt(25, 60) : randInt(30, 65),
    // 以下字段使怀孕判定体系（tryConceive）可直接用于灵姬/灵郎
    hp: { current: 100, max: 100 },
    mp: { current: 60, max: 60 },
    lifespan: 80,
    attributes: { physique: randInt(30, 55), spirit: randInt(30, 55) },
    spiritRoot: { type: randChoice(['火', '水', '木', '金', '土', '雷', '风', '冰']), purity: randInt(40, 80) },
    inventory: [],
    statusEffects: [],
    isPregnant: false,
    pregnancyMonths: 0,
    pregnancyFather: null,
  };
}

// 初始化/补足（每旬/月调用）：每个地点每个受欢迎等级至少2位
function initWindFlower(state) {
  if (!state.windFlower) state.windFlower = { generated: {} };
  const wf = state.windFlower;
  for (const loc of Object.keys(VENUES)) {
    if (!wf.generated[loc]) wf.generated[loc] = [];
    const list = wf.generated[loc];
    for (let tier = 1; tier <= 5; tier++) {
      const have = list.filter(p => p.popularity === tier && p.location === loc && !p.freed).length;
      for (let i = have; i < 2; i++) {
        list.push(generatePerson(loc, tier));
      }
    }
  }
  return wf;
}

// 获取某地点的风花雪月列表
function getWindFlower(state, location) {
  initWindFlower(state);
  const list = state.windFlower.generated[location] || [];
  const venue = VENUES[location];
  return {
    venue: venue || { name: '此处无温柔乡', base: 1, tierName: '' },
    hint: venue ? '' : '此地没有温柔乡。灵姬与灵郎聚集于：大夏皇都（京城温柔乡）、自由坊市（花月楼）、万妖山脉（百花谷）。',
    persons: list.filter(p => p.location === location).map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      appearance: p.appearance,
      appearanceLabel: p.appearanceLabel,
      popularity: p.popularity,
      cost: p.cost,
      redeemPrice: p.redeemPrice,
      favor: p.favor,
      known: p.known,
      freed: p.freed,
      portrait: portraitOf(p),
    })),
  };
}

// 选择一位灵姬/灵郎：支付选人费（茶资），进入交互界面
function selectPerson(state, player, personId) {
  initWindFlower(state);
  const found = findWFAnywhere(state, personId);
  const loc = found ? found.loc : player.location;
  const person = found ? found.person : null;
  if (!person) return { success: false, msg: '没有找到这个人' };
  if (person.freed) return { success: false, msg: `${person.name}已被赎身离开温柔乡` };
  const fee = person.cost;
  if ((player.silver || 0) < fee) return { success: false, msg: `请${person.name}作陪需要${fee}银两，你的银两不足` };
  player.silver -= fee;
  person.known = true;
  // 需求：与灵姬/灵郎交互（作陪）后判定双方认识：加入玩家已认识列表 + 灵姬灵郎认识玩家
  person.knownByPlayer = true;
  if (!player.acquaintances) player.acquaintances = [];
  if (!player.acquaintances.includes(person.id)) player.acquaintances.push(person.id);
  const venue = VENUES[loc] || { name: '温柔乡', base: 1 };
  const msg = `你请${person.name}作陪，花费${fee}银两。`;
  return {
    success: true,
    msg,
    person: {
      id: person.id, name: person.name, gender: person.gender, age: person.age,
      appearanceLabel: person.appearanceLabel, popularity: person.popularity,
      cost: person.cost, redeemPrice: person.redeemPrice, favor: person.favor,
      known: person.known, freed: person.freed,
      portrait: portraitOf(person),
    },
    state: state,
  };
}

// 跨地点查找灵姬/灵郎：相识列表可从任何地点发起交互（修复："没有找到这个人"）
function findWFAnywhere(state, personId) {
  const gen = (state.windFlower && state.windFlower.generated) || {};
  for (const l of Object.keys(gen)) {
    const p = (gen[l] || []).find(x => x.id === personId);
    if (p) return { person: p, loc: l };
  }
  return null;
}

// 灵姬/灵郎立绘（复用风花雪月人物立绘选取逻辑，首次选定后固定，避免面板刷新立绘变化）
function portraitOf(person) {
  if (person.portrait) return person.portrait;
  const { getPortrait } = require('./utils');
  person.portrait = getPortrait(person.age, person.gender);
  return person.portrait;
}

// 与灵姬/灵郎互动
// action: chat(谈情说爱) | spring(春宵一度) | gift(赠送) | redeem(赎身) | notes(记事) | children(子嗣)
function interact(state, player, personId, action, itemName, mode, rankParam) {
  initWindFlower(state);
  const found = findWFAnywhere(state, personId);
  const loc = found ? found.loc : player.location;
  const person = found ? found.person : null;
  if (!person) return { success: false, msg: '没有找到这个人' };
  if (person.freed) return { success: false, msg: `${person.name}已被赎身离开温柔乡` };

  const venue = VENUES[loc] || { name: '温柔乡', base: 1 };

  if (action === 'chat') {
    // 谈情说爱：免费（费用已在选择时扣除），增加好感，剧情从性别库随机
    if (!person.known && person.favor <= 0) person.known = true;
    // 交互即认识：补全双方认识标记（兼容直接交互未先作陪的情况）
    person.knownByPlayer = true;
    if (!player.acquaintances) player.acquaintances = [];
    if (!player.acquaintances.includes(person.id)) player.acquaintances.push(person.id);
    const gain = randInt(5, 12);
    person.favor = Math.min(100, person.favor + gain);
    const pool = CHAT_EVENTS[person.gender] || CHAT_EVENTS.女;
    const reply = randChoice(pool).replace(/\{name\}/g, person.name);
    // 三段式包装（第1段 引入 + 第2段 核心 + 第3段 收束）
    const { buildThreeAct } = require('./threeActStory');
    const reply3 = buildThreeAct({ core: reply, action: 'chat', me: player, them: person, location: venue.name || player.location, rel: null });
    const msg = `你在${venue.name}与${person.name}品茶谈心，好感+${gain}，修为经验+1。\n${reply3}`;
    person.cultivationExp = (person.cultivationExp || 0) + 1;
    person.notes.push(`与你谈情说爱，好感增至${person.favor}。`);
    return { success: true, msg, favor: person.favor, state: state };
  }

  if (action === 'spring') {
    // 春宵一度：免费（费用已在选择时扣除），需已结识，剧情按道德取向选档
    if (!person.known) return { success: false, msg: `你还没有与${person.name}结识，先谈谈心吧` };
    const gain = randInt(8, 18);
    person.favor = Math.min(100, person.favor + gain);
    // 道德低（sin高）触发香艳剧情概率大；道德高（merit高）触发含蓄剧情概率大
    const ms = moralScore(player);
    const lib = SPRING_EVENTS[person.gender] || SPRING_EVENTS.女;
    let pool;
    if (ms > 0) {
      // 道德低：70% 香艳
      pool = (Math.random() < 0.7 ? lib.spicy : lib.gentle);
    } else if (ms < 0) {
      // 道德高：30% 香艳
      pool = (Math.random() < 0.3 ? lib.spicy : lib.gentle);
    } else {
      pool = (Math.random() < 0.5 ? lib.spicy : lib.gentle);
    }
    const reply = randChoice(pool).replace(/\{name\}/g, person.name);
    // 春宵三段式包装
    const { buildThreeAct: bta } = require('./threeActStory');
    const reply3 = bta({ core: reply, action: 'spring', me: player, them: person, location: venue.name || player.location, rel: null });
    let pregnancy = false;
    // 接入统一怀孕判定体系（tryConceive / 孕率公式）：异性且女方为女性时判定
    if (player.gender !== person.gender) {
      const female = player.gender === '女' ? player : person;
      const male = player.gender === '男' ? player : person;
      if (female && female.gender === '女' && !female.isPregnant && female.age >= 16 && female.age <= 45) {
        const tryR = tryConceive(male, female, state);
        pregnancy = !!tryR.success;
      }
    }
    const msg = `你在${venue.name}与${person.name}共度良宵，好感+${gain}。\n${reply3}${pregnancy ? ` 事后${person.gender === '女' ? person.name + '' : '你'}有了身孕！` : ''}`;
    person.notes.push(`与你共度良宵，好感增至${person.favor}。`);
    return { success: true, msg, favor: person.favor, pregnancy, state: state };
  }

  if (action === 'gift') {
    // 赠送礼物：好感按礼物价值增加
    if (!person.known) return { success: false, msg: `你还没有与${person.name}结识，先谈谈心吧` };
    if (!itemName) return { success: false, msg: '请选择要赠送的物品' };
    const item = player.inventory.find(i => i.name === itemName);
    if (!item || item.count <= 0) return { success: false, msg: `背包中没有${itemName}` };

    // 按喜好与物品价值计算好感
    let value = item.price || 50;
    let gain = Math.max(3, Math.min(25, Math.floor(value / 100) + 5));
    let extra = '';
    if (person.likes && person.likes.includes(itemName)) {
      gain += 15;
      extra = ` ${person.name}很喜欢这件礼物，好感大幅提升！`;
    }
    if (person.dislikes && person.dislikes.includes(itemName)) {
      gain = Math.max(1, gain - 8);
      extra = ` ${person.name}似乎不太喜欢这个礼物。`;
    }
    item.count--;
    if (item.count <= 0) player.inventory = player.inventory.filter(i => i.name !== itemName);
    person.favor = Math.min(100, person.favor + gain);
    person.notes.push(`你赠予了${itemName}，好感增至${person.favor}。`);
    return { success: true, msg: `你将${itemName}赠予${person.name}，好感+${gain}。${extra}`, favor: person.favor, state: state };
  }

  if (action === 'redeem') {
    // 赎身：好感≥50可赎身，花费赎身价
    // mode: 'mansion' 收入宅中为妻妾（需 rank 位分） | 'free' 只赎身（之后作为普通人活跃在大世界）
    if (!person.known) return { success: false, msg: `你还没有与${person.name}结识` };
    if (person.favor < 50) return { success: false, msg: `好感不足（${person.favor}/100），${person.name}还不愿随你离开，好感≥50方可赎身` };
    const price = person.redeemPrice;
    if ((player.silver || 0) < price) return { success: false, msg: `为${person.name}赎身需要${price}银两` };
    player.silver -= price;
    person.freed = true;
    person.notes.push(genderize(`你花费${price}银两为${person.name}赎身，他/她离开了温柔乡。`, person));

    // 将风花雪月人物转化为可在大世界活动的 NPC（无修为的人类）
    const npc = {
      id: person.id,
      name: person.name,
      gender: person.gender,
      age: person.age,
      ageMonths: 0,
      race: '人族',
      realm: '凡人境',
      realmLevel: 0,
      subStage: '前期',
      personality: '普通',
      personalityInfo: { name: '普通', weights: { cultivate: 1, social: 2, explore: 1, combat: 0, trade: 2, rest: 1 } },
      personalityTraits: { aggressiveness: 20, greed: 30, loyalty: 30, kindness: 60 },
      professionName: '自由身',
      location: player.location,
      targetLocation: null,
      action: '空闲',
      actionTurns: 0,
      status: { mood: '平静', health: 100, stamina: 80, wealth: 100 },
      attributes: { physique: 20, spirit: 20, enlightenment: 20, agility: 20, fateLuck: 30, strength: 20, constitution: 20, perception: 20, willpower: 20, charm: person.appearance || 50, reputation: 0, merit: 0, sin: 0, aggression: 10, mystery: 0, lust: 20, purity: 60, intimidation: 0 },
      combatStats: { hp: 60, mp: 20, attackPhys: 5, attackMagic: 3, defensePhys: 2, defenseMagic: 2 },
      hp: { current: 60, max: 60 },
      mp: { current: 20, max: 20 },
      cultivationExp: person.cultivationExp || 0,
      favorWithPlayer: person.favor,
      isAlive: true,
      isWindFlower: true,
      freed: true,
      knownByPlayer: true, // 已赎身：双方早已认识，保证人物页"已认识"列表可见
      notes: person.notes || [],
      family: {},
      likes: [],
      dislikes: [],
    };
    if (!state.npcs) state.npcs = [];
    state.npcs = state.npcs.filter(n => n.id !== person.id);
    state.npcs.push(npc);
    if (!player.family) player.family = {};
    if (!player.family.wives) player.family.wives = [];
    if (!player.family.spouse) player.family.spouse = null;

    if (mode === 'mansion') {
      // 收入宅中为妻妾（手动选择位分）
      const rank = Number(rankParam) || 6;
      if (rank === 1) {
        player.family.spouse = person.id;
        npc.concubineRank = 1;
      } else {
        if (!player.family.wives.includes(person.id)) player.family.wives.push(person.id);
        npc.concubineRank = rank;
      }
      person.notes.push(`你花费${price}银两为其赎身，收入宅中为妻妾。`);
      // 关系网链接：双方互为配偶
      if (!npc.relations) npc.relations = {};
      npc.relations[player.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: player.name };
      if (!player.relations) player.relations = {};
      player.relations[person.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: person.name };
      return { success: true, msg: `你花费${price}银两为${person.name}赎身，将其收入宅中！`, freed: true, name: person.name, mode: 'mansion', state: state };
    }
    // 只赎身：作为自由人活跃在大世界
    // 关系网链接：双方互为友人
    if (!npc.relations) npc.relations = {};
    npc.relations[player.id] = { type: '友人', favor: npc.favorWithPlayer || 0, name: player.name };
    if (!player.relations) player.relations = {};
    player.relations[person.id] = { type: '友人', favor: npc.favorWithPlayer || 0, name: person.name };
    return { success: true, msg: genderize(`你花费${price}银两为${person.name}赎身，他/她重获自由，从此在大世界中生活。`, person), freed: true, name: person.name, mode: 'free', state: state };
  }

  if (action === 'notes') {
    return { success: true, msg: '', notes: person.notes, name: person.name, state: state };
  }

  if (action === 'children') {
    const children = (person.family?.children || []).map(cid => {
      const npc = state.npcs.find(n => n.id === cid);
      return npc ? { name: npc.name, age: npc.age, realm: npc.realm, gender: npc.gender } : null;
    }).filter(Boolean);
    return { success: true, msg: '', children, name: person.name, state: state };
  }

  return { success: false, msg: '未知的互动' };
}

// ===== 普通NPC造访温柔乡的随机剧情库（谈情说爱 / 春宵一度）=====
const NPC_VISIT_EVENTS = {
  chat: [
    '{npc}在{venue}与{wf}谈情说爱，把酒言欢，{wf}浅笑嫣然，二人相谈甚欢。',
    '{npc}在{venue}寻得{wf}，邀其同饮几杯，说些风月闲话，尽兴而归。',
    '{npc}在{venue}与{wf}品茶谈心，听{wf}讲起近年趣事，不觉日暮。',
    '{npc}在{venue}与{wf}赏月谈情，临别时{wf}赠他（她）一缕香帕。',
    '{npc}在{venue}点了{wf}的曲儿，一曲终了，二人相视而笑。',
  ],
  spring: [
    '{npc}在{venue}与{wf}春宵一度，烛影摇红，帐暖香浓，翌日方别。',
    '{npc}在{venue}与{wf}共度良宵，月色溶溶，二人依偎到天明。',
    '{npc}在{venue}留宿{wf}处，一夜温存，次日才依依不舍离去。',
    '{npc}在{venue}与{wf}春宵一度，软语温存，好不缠绵。',
    '{npc}在{venue}与{wf}共赴巫山，罗帐轻垂，一夜风流。',
  ],
};

// 每月随机：普通NPC（非灵姬/灵郎）造访温柔乡，与灵姬/灵郎谈情或春宵
// 春宵时接入统一怀孕判定体系（tryConceive）
function generateWindFlowerVisits(state, gameDateText) {
  const events = [];
  initWindFlower(state);
  const { npcs } = state;
  // 所有有灵姬/灵郎在场的地点（NPC 可前往任意温柔乡）
  const locKeys = Object.keys(state.windFlower.generated || {}).filter(l =>
    (state.windFlower.generated[l] || []).some(p => !p.freed));
  if (!locKeys.length) return events;
  for (const npc of npcs) {
    if (!npc.isAlive) continue;
    // 8% 概率本月前往温柔乡寻欢
    if (!chance(8)) continue;
    const loc = randChoice(locKeys);
    const wfList = state.windFlower.generated[loc].filter(p => !p.freed);
    if (!wfList.length) continue;
    const wf = randChoice(wfList);
    const venue = VENUES[loc]?.name || '温柔乡';
    const isSpring = chance(30) && npc.gender !== wf.gender;
    if (isSpring) {
      const gain = randInt(8, 18);
      wf.favor = Math.min(100, wf.favor + gain);
      const text = randChoice(NPC_VISIT_EVENTS.spring).replace(/\{npc\}/g, npc.name).replace(/\{wf\}/g, wf.name).replace(/\{venue\}/g, venue);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${gameDateText}·${loc}·${text}`);
      wf.notes.push(`${gameDateText}·与${npc.name}春宵一度，好感+${gain}。`);
      let pregnancy = false;
      const male = npc.gender === '男' ? npc : null;
      const female = wf.gender === '女' ? wf : null;
      if (male && female && !female.isPregnant && female.age >= 16 && female.age <= 45) {
        const tryR = tryConceive(male, female, state);
        pregnancy = !!tryR.success;
      }
      events.push({ type: 'wf_spring', npc: npc.name, wf: wf.name, text, pregnancy });
    } else {
      const gain = randInt(3, 8);
      wf.favor = Math.min(100, wf.favor + gain);
      const text = randChoice(NPC_VISIT_EVENTS.chat).replace(/\{npc\}/g, npc.name).replace(/\{wf\}/g, wf.name).replace(/\{venue\}/g, venue);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${gameDateText}·${npc.location}·${text}`);
      wf.notes.push(`${gameDateText}·与${npc.name}谈情说爱，好感+${gain}。`);
      events.push({ type: 'wf_chat', npc: npc.name, wf: wf.name, text });
    }
  }
  return events;
}

// ===== 灵姬/灵郎各式各样的记事剧情库（随机调用）=====
const WF_JOURNAL_EVENTS = {
  女: [
    '{name}在{venue}学了个新姿势，与姐妹互相玩弄着，淫水飞溅，累极睡去。',
    '{name}收到某位公子赠的玉柄，将其放入小穴整日插着，淫水早已打湿衣物，被客人看到直接拉进房中狠狠抽插。',
    '{name}与几位姐妹在{venue}后园赏花，采了几枝新开的梅。',
    '{name}今日迎来一位老客，手段老辣，被玩得失语，淫叫声整个楼都能听见。',
    '{name}在妆台前描眉，想着近日的趣事，不觉莞尔。',
    '{name}为{venue}添了一盏灯，说"亮堂些，客人也能看清姐妹们的小穴不是嘛"。',
    '{name}得了新裁的镂空衣裙，试穿后被大客户看上竟直接在大堂将她压在身下抽插，事后浑身精液地爬起。',
    '{name}在院中喂那只会说人话的鹦哥，教它说"郎君再深些，爽死我了"。',
    '{name}在院中露出小穴躺着，将食物放进小穴中，让鹦哥一下下啄食，爽的淫水直流，不停淫叫。',
    '{name}抚琴时因小穴正在被抽插着频繁弹错，被客人惩罚为他口，小穴的淫水流满了琴身。',
    '{name}听说城里流传了新的玩具，买回来与姐妹互玩，前后穴口都插满了，第二日累的差点起不来。',
  ],
  男: [
    '{name}在{venue}半褪衣物，抚弄自己的鸡巴，鸡巴高高翘起，淫声让台下客人淫性大发，结束后直接被多位客人齐齐玩弄。',
    '{name}跪在地上为女客舔小穴，爽得客人将大把灵石塞进他的后穴，他更加卖力的舔穴。',
    '{name}与几位兄弟在{venue}后院探讨如何讨客人欢心，技巧都精进了许多。',
    '{name}今日陪一位老主顾下棋，每输一局就被塞一个棋子，客人实在受不住他的勾引狠狠插进他的后穴。',
    '{name}在廊下吹箫，箫声清越，引得路人驻足。',
    '{name}换了一身新袍，在铜镜前自摸，精液射满了铜镜。',
    '{name}教{venue}的新来的小倌儿如何与让客人更爽。',
    '{name}得了把好扇，摇着扇子与客人说笑，被客人带进房中，结束后扇子已被塞在穴中，双眼失神，满地淫水。',
    '{name}在院中打了一套拳，身姿矫健，众人喝彩。',
    '{name}听说了江湖上新出的轶事，当作谈资讲给客人听。',
  ],
};

// ===== 灵姬/灵郎谈情对话剧情库（恢复定义：此前删减地点时误删）=====
const CHAT_EVENTS = {
  女: [
    '{name}掩唇轻笑：“郎君今日气色好，是遇上什么喜事了？”',
    '{name}替你斟满一盏茶：“听闻郎君近日修行有成，不如让妾身为郎君庆祝一番。”，她露出流着淫水的小穴邀请你',
    '{name}靠在你身上轻声问起你的来历，眼中带着好奇与温柔。',
    '{name}抚了抚鬓边珠花，笑道：“郎君说话总是这般风趣。”',
    '{name}与你聊起坊间的轶事，说到妙处自己先笑了。',
    '{name}支着下巴看你：“郎君下次来，妾身弹一曲新学的曲子给你听。”',
    '{name}低声道：“在这样热闹的地方，能遇到个说心里话的人，当真难得。”',
    '{name}递来一块点心：“这是厨房新做的，郎君尝尝？”',
  ],
  男: [
    '{name}爽朗一笑：“郎君来了！今日可有空来我房中，我为您展示新学的手艺。”',
    '{name}放下酒杯倚靠在你身上，手不老实的往下摸：“郎君我们来些有意思的事吧。”',
    '{name}与你论了几句剑法，颇为投缘。',
    '{name}笑道：“这温柔乡里，也就与你还能谈些正事。”',
    '{name}见你衣衫沾尘，唤人取来新袍：“出门在外，总该体面些。”',
    '{name}低声道：“兄台若是累了，不妨在此歇一歇脚。”',
    '{name}给你倒酒：“酒逢知己千杯少，今晚不醉不归。”',
    '{name}说起近日见闻，眉飞色舞，兴致颇高。',
  ],
};

// 春宵剧情库（spicy 香艳 / gentle 含蓄；按性别）
const SPRING_EVENTS = {
  女: {
    spicy: [
      '{name}软语呢喃，烛影摇红间，她插着自己的小穴淫水直流，你看不下去直接扑到她，她双腿缠着你的腰极尽卖力，你们闹腾了一整晚。',
      '{name}在你耳边低笑：“郎君今夜可要好好疼我。”锦帐落下，你舔着她的小穴狠狠吮吸，她被你弄得直接喷了出来，爽完后再让她为你口交，直到深夜。',
      '{name}眼波流转，替你解下外袍，指尖却若有若无地划过你胸口，你将她抱起放在桌上，手指在她的穴中扣挖，她呻吟着将嫩胸送进你的嘴边，你张嘴吸咬，她紧紧抱着你呻吟声不断放大......。',
      '{name}将酒水倒在直接身上，躺在床上自慰，嘴里叫着"求郎君赐福，妾室好想要~",你将她身上的酒水舔尽后才插进她的小穴，滑嫩又紧致。',
      '{name}用轻纱蒙住你的眼睛，笑吟吟道：“郎君且猜猜，我今日换了什么衣裳？”你向她摸去，只摸到薄薄的一层，在她胸上捏了捏手感正好，"郎君好坏呀"，你直接将她抱起放在秋千上，一边抽插一边荡，失重感让她的小穴更加收紧，你揉捏着她的胸在秋千上玩到高潮。',
      '{name}命人备好温汤，香雾袅袅中，她在水下亲吻着你又游走，你直接抓住她在水下将她玩弄，水随着你的动作进出着她的小穴，你将她压在水下，窒息与快感共存。',
      '{name}啜了一口酒，随即口渡酒渡入你口中，酒香与她的气息纠缠在一处。',
      '{name}调暗烛火，只余一豆灯光，她解下青丝，俯身将酥胸送进你嘴里，掰开小穴坐下，放声淫叫。',
      '{name}教你品香，却借机依进你怀里，将香抹在她的穴口让你品闻。',
      '{name}为你簪花，指尖轻轻划过你耳后，笑道：“郎君好强的定力。”说着却主动贴近，浑身赤裸着蹭着你，淫水蹭了你一身，见你不为所动又主动掰开小穴跪对着你，自慰给你看，淫水直接喷到了你身上，你啪啪几下打着她的屁股开始抽插。。',
      '{name}拨弄琴弦时弦音忽乱，她顺势让你的手放入她的穴中：“琴声乱了，心也乱了，不如……”，你抱着她扣挖着小穴，琴音也跟着乱颤。',
      '{name}以罗帕掩面，却在罗帕下偷偷吻了你一下，随即低笑出声，风情万种。',
    ],
    gentle: [
      '{name}依偎在你身边，轻声说了许多体己话，一夜安睡，心中温暖。',
      '{name}为你铺床叠被，又备好醒酒茶，体贴入微。',
      '{name}与你并肩赏月，话到天明，虽无云雨，亦觉情意绵长。',
    ],
  },
  男: {
    spicy: [
      '{name}搂住你腰身，低笑：“今夜便让奴家服侍郎君。”烛光下，将鸡巴对准你的穴口，细细研磨，你呻吟着将穴口往前递，他了然得抱起你狠狠按下去，直抵宫口，精液也射入其中。',
      '{name}俯身在你耳畔呵气：“听说郎君修行辛苦，正该好好放松。”一夜风流，尽是销魂。',
      '{name}牵着你手步入内室，罗衫半解，笑道：“郎君可莫要后悔。”',
      '{name}端起交杯酒与你共饮，饮罢搁下酒盏，指尖却在你手背上画着圈。',
      '{name}解下外袍蒙住你双眼：“郎君莫急，今夜且由我做主。”话音落处，温热的吻已落在你颈间。',
      '{name}备好温汤，将你按入水中，自己则缓缓褪下衣衫，步入汤池与你共浴。',
      '{name}含了一口酒，含着你的小穴以口渡酒，温凉的酒水进入小穴，你将他的头按下让他好好舔，直到你爽够。',
      '{name}调暗烛火，借着月色近前来，低声道：“有些事，还是暗处做来更有趣。”',
      '{name}替你揉开肩颈的酸乏，揉着揉着，手便摸向胸口和小穴，鸡巴抵着你的屁股，你放松得让他抱起将鸡巴放进你的小穴中。',
      '{name}用扇子挑起你下巴，眉眼含笑：“郎君这副模样，倒让我舍不得放你走了。”',
      '{name}将你抵在门边，跪着为你口交：“郎君舒服吗，我们且慢些出去。”，一边又自己撸着鸡巴，直到你高潮一次后才将鸡巴放入继续抽插。',
      '{name}轻笑着咬你耳垂：“奴家今日新学了些手段，正好让郎君品鉴。”说罢红帐轻落将买来的新玩具插进你的小穴，又开始对你的全身继续舔弄，爽的你直叫。',
    ],
    gentle: [
      '{name}为你捏肩捶背，又温了一壶酒，两人闲话至深夜。',
      '{name}轻声道：“有郎君相伴，这地方倒不那么冷了。”一夜相依而眠。',
      '{name}替你挑亮灯烛，笑说：“陪你坐坐便好，郎君若乏了，尽管安歇。”',
    ],
  },
};

// 每月随机：为每位已生成的灵姬/灵郎写入各式各样的记事（随机调用记事剧情库）
function generateWindFlowerJournals(state, gameDateText) {
  const events = [];
  initWindFlower(state);
  for (const loc of Object.keys(state.windFlower.generated || {})) {
    const venue = VENUES[loc]?.name || '温柔乡';
    for (const p of state.windFlower.generated[loc] || []) {
      if (p.freed) continue;
      if (!chance(65)) continue;
      const lib = WF_JOURNAL_EVENTS[p.gender] || WF_JOURNAL_EVENTS.女;
      const text = randChoice(lib).replace(/\{name\}/g, p.name).replace(/\{venue\}/g, venue);
      p.notes.push(`${gameDateText}·${text}`);
      events.push({ id: p.id, name: p.name, text });
    }
  }
  return events;
}

module.exports = { VENUES, CHAT_EVENTS, SPRING_EVENTS, initWindFlower, getWindFlower, interact, selectPerson, calcPopularity, appearanceLabel, generateWindFlowerVisits, generateWindFlowerJournals, NPC_VISIT_EVENTS, WF_JOURNAL_EVENTS };
