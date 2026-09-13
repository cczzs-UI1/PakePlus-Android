// 师徒与结义系统
const { randInt, chance, randChoice, clamp } = require('./utils');

// 师徒称呼系统
const MASTER_DISCIPLE_TITLES = {
  // 徒弟对师父的称呼
  discipleToMaster: {
    formal: '师尊',
    casual: '师父',
    respectful: '恩师',
    female: '师娘',
  },
  // 师父对徒弟的称呼
  masterToDisciple: {
    formal: '徒儿',
    casual: '弟子',
    affectionate: '乖徒',
    eldest: '大弟子',
  },
  // 师兄弟之间的称呼
  betweenDisciples: {
    elderMale: '师兄',
    elderFemale: '师姐',
    youngerMale: '师弟',
    youngerFemale: '师妹',
  },
  // 师门称呼
  sect: {
    masterWife: '师娘',
    masterHusband: '师父',
    masterFather: '师祖',
    masterMother: '师祖',
    discipleChild: '师侄',
  },
};

// 拜师剧情库
const REQUEST_MASTER_EVENTS = [
  {
    minFavor: 50, successRate: 0.7,
    text: '你整理衣冠，郑重地向{name}行三拜九叩大礼：“弟子{playerName}，愿拜入{name}门下，求师尊收录！”{name}沉吟片刻，微微颔首：“你我也算有缘，起来吧。”',
    journal: '拜{name}为师，行三拜九叩大礼，正式入门。',
    effects: { favor: 30, cultivationExp: 500, reputation: 10 },
  },
  {
    minFavor: 60, successRate: 0.8,
    text: '你献上精心准备的拜师礼，诚恳道：“{name}前辈修为高深，弟子一心向道，恳请前辈收我为徒！”{name}接过礼物，满意笑道：“好，好！从今日起，你便是我门下弟子。”',
    journal: '向{name}献上拜师礼，被收为门下弟子。',
    effects: { favor: 40, cultivationExp: 800, reputation: 15 },
  },
  {
    minFavor: 70, successRate: 0.9,
    text: '你在{name}洞府外长跪三日，终于感动{name}。{name}叹道：“你这孩子，倒是有恒心。也罢，我便收你为徒，传你衣钵。”你大喜过望，连连叩首。',
    journal: '在{name}洞府外长跪三日，终被收为亲传弟子。',
    effects: { favor: 50, cultivationExp: 1200, reputation: 20, enlightenment: 5 },
  },
  {
    minFavor: 80, successRate: 0.95,
    text: '{name}主动找到你：“你根骨清奇，悟性过人，可愿拜我为师？”你又惊又喜，当场跪下：“弟子愿意！谢师尊成全！”{name}抚须大笑，亲自为你举行入门仪式。',
    journal: '被{name}主动收为亲传弟子，视为衣钵传人。',
    effects: { favor: 60, cultivationExp: 2000, reputation: 30, enlightenment: 10, spirit: 5 },
  },
  // 失败剧情
  {
    minFavor: 0, successRate: 0, fail: true,
    text: '你向{name}提出拜师请求，{name}摇头道：“你我道不同，不相为谋。另寻高明吧。”你只得悻悻离去。',
    journal: '向{name}拜师被拒，道不同不相为谋。',
    effects: { favor: -10 },
  },
  {
    minFavor: 0, successRate: 0, fail: true,
    text: '{name}冷冷地看了你一眼：“就凭你这点资质，也想拜我为师？回去再修炼百年吧！”周围人哄堂大笑，你面红耳赤地离开了。',
    journal: '向{name}拜师被当众羞辱，资质被嫌弃。',
    effects: { favor: -20, reputation: -5 },
  },
  {
    minFavor: 0, successRate: 0, fail: true,
    text: '{name}叹了口气：“我门下弟子已满，实在无力再收。你的好意我心领了，日后若有机会再说吧。”你虽然失望，但也无可奈何。',
    journal: '向{name}拜师被拒，门下弟子已满。',
    effects: { favor: -5 },
  },
];

// 收徒剧情库
const TAKE_DISCIPLE_EVENTS = [
  {
    minFavor: 30, successRate: 0.7,
    text: '{name}跪在你面前：“前辈修为高深，弟子{name}一心向道，恳请前辈收我为徒！”你见他心诚，点头道：“起来吧，从今日起，你便是我门下弟子。”',
    journal: '收{name}为徒，{name}行拜师礼。',
    effects: { favor: 20, reputation: 10 },
  },
  {
    minFavor: 50, successRate: 0.8,
    text: '{name}献上重礼，恳切道：“弟子仰慕前辈风采已久，愿随前辈修行，万望前辈收录！”你见他礼物丰厚，又心诚，便答应了。',
    journal: '收{name}为徒，获赠重礼。',
    effects: { favor: 30, reputation: 15, silver: 500 },
  },
  {
    minFavor: 60, successRate: 0.9,
    text: '{name}在你门外长跪不起，只求拜师。你被其诚意感动，亲自扶起：“好，好！有你这样的弟子，也是我的福气。”{name}大喜，连连叩首。',
    journal: '{name}长跪不起求拜师，被诚意感动，收为亲传弟子。',
    effects: { favor: 40, reputation: 20, enlightenment: 3 },
  },
  {
    minFavor: 70, successRate: 0.95,
    text: '你见{name}根骨清奇，是个可造之材，主动提出收徒。{name}又惊又喜：“弟子愿意！谢师尊成全！”当场举行入门仪式，引为佳话。',
    journal: '主动收{name}为徒，视为可造之材。',
    effects: { favor: 50, reputation: 25, cultivationExp: 300 },
  },
  // 失败剧情
  {
    minFavor: 0, successRate: 0, fail: true,
    text: '你向{name}提出收徒，{name}却摇头道：“前辈虽然修为高深，但弟子已有心仪的师父，恕难从命。”你有些尴尬。',
    journal: '想收{name}为徒被拒，对方已有心仪师父。',
    effects: { favor: -5 },
  },
  {
    minFavor: 0, successRate: 0, fail: true,
    text: '{name}冷笑一声：“就凭你这点修为，也想收我为徒？等你境界再高些再说吧！”你被怼得哑口无言。',
    journal: '想收{name}为徒被嫌弃修为不足。',
    effects: { favor: -15, reputation: -3 },
  },
];

// 师徒交互剧情库
const MASTER_DISCIPLE_INTERACTIONS = [
  // 师父对徒弟
  {
    type: 'master_teach',
    text: '师尊{name}将你叫到身前，耐心指点修炼中的疑惑。你听得茅塞顿开，修为大进！',
    journal: '师尊{name}指点修炼，茅塞顿开。',
    effects: { cultivationExp: 300, enlightenment: 2 },
  },
  {
    type: 'master_gift',
    text: '师尊{name}见你修炼刻苦，赏赐了你一些修炼资源。你感激涕零，连连道谢。',
    journal: '师尊{name}赏赐修炼资源。',
    effects: { spiritStone: 100, favor: 10 },
  },
  {
    type: 'master_test',
    text: '师尊{name}布置了一门功课考验你。你费尽心思终于完成，{name}满意地点了点头。',
    journal: '完成师尊{name}布置的功课，获得赞许。',
    effects: { cultivationExp: 200, willpower: 3 },
  },
  {
    type: 'master_scold',
    text: '师尊{name}见你修炼懈怠，严厉训斥了你一顿。你羞愧难当，从此发奋图强。',
    journal: '被师尊{name}训斥修炼懈怠，知耻后勇。',
    effects: { willpower: 5, favor: -5 },
  },
  // 徒弟对师父
  {
    type: 'disciple_gift',
    text: '弟子{name}献上精心准备的礼物，孝敬师尊。你心中欣慰，觉得这徒弟没白收。',
    journal: '弟子{name}献上礼物孝敬。',
    effects: { silver: 200, favor: 10 },
  },
  {
    type: 'disciple_visit',
    text: '弟子{name}前来请安，汇报近期修炼心得。你见他进步神速，十分欣慰。',
    journal: '弟子{name}前来请安，汇报修炼心得。',
    effects: { reputation: 5, favor: 5 },
  },
  {
    type: 'disciple_trouble',
    text: '弟子{name}在外惹了麻烦，跑来向你求助。你虽然生气，但还是出手帮他摆平了。',
    journal: '弟子{name}在外惹祸，出手帮其摆平。',
    effects: { reputation: -5, favor: -10, silver: -100 },
  },
  {
    type: 'disciple_breakthrough',
    text: '弟子{name}突破境界，特来向你报喜。你大喜过望，连连夸赞他有出息。',
    journal: '弟子{name}突破境界，特来报喜。',
    effects: { reputation: 10, favor: 15 },
  },
];

// 初始化师徒系统
function initMasterDisciple(player) {
  if (!player.masterDisciple) {
    player.masterDisciple = {
      master: null,
      disciples: [],
      swornBrothers: [],
    };
  }
  return player.masterDisciple;
}

// 拜师（带概率和剧情）
function requestMaster(player, masterNPC, gameDateText) {
  initMasterDisciple(player);
  if (player.masterDisciple.master) return { success: false, msg: '你已有师父', text: '你已有师父，不可再拜他人。' };
  if (masterNPC.realmLevel <= player.realmLevel) return { success: false, msg: '对方境界不高于你，无法拜师', text: `${masterNPC.name}境界与你相当甚至更低，无法拜其为师。` };

  const favor = masterNPC.favorWithPlayer || 0;
  const eligible = REQUEST_MASTER_EVENTS.filter(e => !e.fail && favor >= e.minFavor);
  const failEvents = REQUEST_MASTER_EVENTS.filter(e => e.fail);

  if (eligible.length === 0) {
    const failEvent = randChoice(failEvents);
    return {
      success: false,
      text: failEvent.text.replace(/{name}/g, masterNPC.name).replace(/{playerName}/g, player.name),
      journal: failEvent.journal.replace(/{name}/g, masterNPC.name),
      npcJournal: `${player.name}向${masterNPC.name}拜师被拒。`,
      effects: failEvent.effects,
    };
  }

  const event = randChoice(eligible);
  const success = Math.random() < event.successRate;

  if (success) {
    player.masterDisciple.master = {
      id: masterNPC.id,
      name: masterNPC.name,
      realm: masterNPC.realm,
      portrait: masterNPC.portrait,
      joinDate: gameDateText,
    };
    // 对方侧师徒记录：成为你的师父，其门下多一位弟子
    if (!masterNPC.masterDisciple) masterNPC.masterDisciple = { master: null, disciples: [] };
    if (!masterNPC.masterDisciple.disciples) masterNPC.masterDisciple.disciples = [];
    if (!masterNPC.masterDisciple.disciples.find(d => d.id === player.id)) {
      masterNPC.masterDisciple.disciples.push({
        id: player.id,
        name: player.name,
        realm: player.realm,
        portrait: player.portrait,
        joinDate: gameDateText,
      });
    }
    // 关系网链接：对方视角你是其弟子，你视角对方是你的师父
    if (!masterNPC.relations) masterNPC.relations = {};
    masterNPC.relations[player.id] = { type: '徒弟', favor: masterNPC.favorWithPlayer || 0, name: player.name };
    if (!player.relations) player.relations = {};
    player.relations[masterNPC.id] = { type: '师父', favor: masterNPC.favorWithPlayer || 0, name: masterNPC.name };
    // 应用效果
    if (event.effects) {
      if (event.effects.favor) masterNPC.favorWithPlayer = Math.max(-100, Math.min(100, (masterNPC.favorWithPlayer || 0) + event.effects.favor));
      if (event.effects.cultivationExp) player.cultivationExp += event.effects.cultivationExp;
      if (event.effects.reputation) player.reputation = (player.reputation || 0) + event.effects.reputation;
      if (event.effects.enlightenment) player.attributes.enlightenment += event.effects.enlightenment;
      if (event.effects.spirit) player.attributes.spirit += event.effects.spirit;
    }
    return {
      success: true,
      text: event.text.replace(/{name}/g, masterNPC.name).replace(/{playerName}/g, player.name),
      journal: event.journal.replace(/{name}/g, masterNPC.name),
      npcJournal: `${masterNPC.name}收${player.name}为弟子。`,
      effects: event.effects,
    };
  } else {
    const failEvent = randChoice(failEvents);
    if (failEvent.effects?.favor) masterNPC.favorWithPlayer = Math.max(-100, Math.min(100, (masterNPC.favorWithPlayer || 0) + failEvent.effects.favor));
    return {
      success: false,
      text: failEvent.text.replace(/{name}/g, masterNPC.name).replace(/{playerName}/g, player.name),
      journal: failEvent.journal.replace(/{name}/g, masterNPC.name),
      npcJournal: `${player.name}向${masterNPC.name}拜师被拒。`,
      effects: failEvent.effects,
    };
  }
}

// 收徒（带概率和剧情）
function takeDisciple(player, npc, gameDateText) {
  initMasterDisciple(player);
  if (player.masterDisciple.disciples.length >= 10) return { success: false, msg: '弟子已满（最多10人）', text: '你门下弟子已满，无法再收。' };
  if (npc.realmLevel >= player.realmLevel) return { success: false, msg: '对方境界不低于你，无法收徒', text: `${npc.name}境界不低于你，不愿拜你为师。` };
  if (player.masterDisciple.disciples.find(d => d.id === npc.id)) return { success: false, msg: '已是你的弟子', text: `${npc.name}已经是你的弟子了。` };

  const favor = npc.favorWithPlayer || 0;
  const eligible = TAKE_DISCIPLE_EVENTS.filter(e => !e.fail && favor >= e.minFavor);
  const failEvents = TAKE_DISCIPLE_EVENTS.filter(e => e.fail);

  if (eligible.length === 0) {
    const failEvent = randChoice(failEvents);
    return {
      success: false,
      text: failEvent.text.replace(/{name}/g, npc.name),
      journal: failEvent.journal.replace(/{name}/g, npc.name),
      npcJournal: `${npc.name}向${player.name}拜师被拒。`,
      effects: failEvent.effects,
    };
  }

  const event = randChoice(eligible);
  const success = Math.random() < event.successRate;

  if (success) {
    player.masterDisciple.disciples.push({
      id: npc.id,
      name: npc.name,
      realm: npc.realm,
      portrait: npc.portrait,
      joinDate: gameDateText,
    });
    // 对方侧师徒记录：其拜你为师
    if (!npc.masterDisciple) npc.masterDisciple = { master: null, disciples: [] };
    npc.masterDisciple.master = {
      id: player.id,
      name: player.name,
      realm: player.realm,
      portrait: player.portrait,
      joinDate: gameDateText,
    };
    // 关系网链接：对方视角你是其师父
    if (!npc.relations) npc.relations = {};
    npc.relations[player.id] = { type: '师父', favor: npc.favorWithPlayer || 0, name: player.name };
    if (!player.relations) player.relations = {};
    player.relations[npc.id] = { type: '徒弟', favor: npc.favorWithPlayer || 0, name: npc.name };
    // 应用效果
    if (event.effects) {
      if (event.effects.favor) npc.favorWithPlayer = Math.max(-100, Math.min(100, (npc.favorWithPlayer || 0) + event.effects.favor));
      if (event.effects.reputation) player.reputation = (player.reputation || 0) + event.effects.reputation;
      if (event.effects.silver) player.silver += event.effects.silver;
      if (event.effects.cultivationExp) player.cultivationExp += event.effects.cultivationExp;
      if (event.effects.enlightenment) player.attributes.enlightenment += event.effects.enlightenment;
    }
    return {
      success: true,
      text: event.text.replace(/{name}/g, npc.name),
      journal: event.journal.replace(/{name}/g, npc.name),
      npcJournal: `${npc.name}拜${player.name}为师。`,
      effects: event.effects,
    };
  } else {
    const failEvent = randChoice(failEvents);
    if (failEvent.effects?.favor) npc.favorWithPlayer = Math.max(-100, Math.min(100, (npc.favorWithPlayer || 0) + failEvent.effects.favor));
    return {
      success: false,
      text: failEvent.text.replace(/{name}/g, npc.name),
      journal: failEvent.journal.replace(/{name}/g, npc.name),
      npcJournal: `${npc.name}向${player.name}拜师被拒。`,
      effects: failEvent.effects,
    };
  }
}

// 师徒交互
function masterDiscipleInteract(player, npc, type, gameDateText) {
  initMasterDisciple(player);
  let events;
  if (type === 'master') {
    // 玩家是徒弟，与师父交互
    if (!player.masterDisciple.master || player.masterDisciple.master.id !== npc.id) {
      return { success: false, text: '对方不是你的师父。' };
    }
    events = MASTER_DISCIPLE_INTERACTIONS.filter(e => e.type.startsWith('master_'));
  } else {
    // 玩家是师父，与徒弟交互
    if (!player.masterDisciple.disciples.find(d => d.id === npc.id)) {
      return { success: false, text: '对方不是你的弟子。' };
    }
    events = MASTER_DISCIPLE_INTERACTIONS.filter(e => e.type.startsWith('disciple_'));
  }

  const event = randChoice(events);
  // 应用效果
  if (event.effects) {
    if (event.effects.cultivationExp) player.cultivationExp += event.effects.cultivationExp;
    if (event.effects.enlightenment) player.attributes.enlightenment += event.effects.enlightenment;
    if (event.effects.willpower) player.attributes.willpower += event.effects.willpower;
    if (event.effects.spiritStone) player.spiritStone += event.effects.spiritStone;
    if (event.effects.silver) player.silver += event.effects.silver;
    if (event.effects.reputation) player.reputation = (player.reputation || 0) + event.effects.reputation;
    if (event.effects.favor) npc.favorWithPlayer = Math.max(-100, Math.min(100, (npc.favorWithPlayer || 0) + event.effects.favor));
  }

  return {
    success: true,
    text: event.text.replace(/{name}/g, npc.name),
    journal: event.journal.replace(/{name}/g, npc.name),
    npcJournal: `${npc.name}与${player.name}师徒相处。`,
    effects: event.effects,
  };
}

// 传功给弟子
function transmitPower(player, discipleId) {
  initMasterDisciple(player);
  const disciple = player.masterDisciple.disciples.find(d => d.id === discipleId);
  if (!disciple) return { success: false, msg: '没有这个弟子' };

  const cost = Math.floor(player.cultivationExp * 0.1);
  if (cost < 100) return { success: false, msg: '修为不足，无法传功' };

  player.cultivationExp -= cost;
  // 弟子获得80%传功
  const discipleNPC = player.acquaintances?.find(n => n.id === discipleId);
  if (discipleNPC) {
    discipleNPC.cultivationExp += Math.floor(cost * 0.8);
  }
  player.reputation += 10;
  return { success: true, msg: `你向${disciple.name}传功，消耗${cost}修为，弟子获得${Math.floor(cost * 0.8)}修为！` };
}

// 师徒每日奖励
function masterDailyReward(player) {
  initMasterDisciple(player);
  let totalExp = 0;
  // 有师父时，每日获得师父指点
  if (player.masterDisciple.master) {
    totalExp += 100 + player.realmLevel * 20;
  }
  // 有弟子时，每日获得弟子孝敬
  for (const d of player.masterDisciple.disciples) {
    totalExp += 50;
  }
  if (totalExp > 0) {
    player.cultivationExp += totalExp;
  }
  return totalExp;
}

// 结义
function swearBrotherhood(player, npc) {
  initMasterDisciple(player);
  if (player.masterDisciple.swornBrothers.length >= 5) return { success: false, msg: '结义兄弟已满（最多5人）' };
  if (player.masterDisciple.swornBrothers.find(b => b.id === npc.id)) return { success: false, msg: '已是结义兄弟' };
  if (npc.favorWithPlayer < 80) return { success: false, msg: `${npc.name}对你好感不足80，不愿结义` };
  if (player.spiritStone < 1000) return { success: false, msg: '结义需要1000灵石置办酒席' };

  player.spiritStone -= 1000;
  player.masterDisciple.swornBrothers.push({
    id: npc.id,
    name: npc.name,
    realm: npc.realm,
    portrait: npc.portrait,
    rank: player.masterDisciple.swornBrothers.length + 1,
    date: new Date().toISOString(),
  });
  npc.favorWithPlayer += 50;
  player.reputation += 20;
  return { success: true, msg: `你与${npc.name}结为异姓兄弟！` };
}

// 解除结义
function breakBrotherhood(player, npcId) {
  initMasterDisciple(player);
  const idx = player.masterDisciple.swornBrothers.findIndex(b => b.id === npcId);
  if (idx === -1) return { success: false, msg: '不是结义兄弟' };
  const brother = player.masterDisciple.swornBrothers[idx];
  player.masterDisciple.swornBrothers.splice(idx, 1);
  player.reputation -= 10;
  return { success: true, msg: `你与${brother.name}断绝了兄弟关系。` };
}

// 结义兄弟加成
function getBrotherhoodBonus(player) {
  initMasterDisciple(player);
  const count = player.masterDisciple.swornBrothers.length;
  return {
    atkBonus: count * 2,
    defBonus: count * 2,
    expBonus: 1 + count * 0.02,
  };
}

// 获取可拜师的NPC
function getAvailableMasters(player, npcs) {
  initMasterDisciple(player);
  return npcs.filter(n =>
    n.isAlive &&
    n.realmLevel > player.realmLevel &&
    n.favorWithPlayer >= 30 &&
    !player.masterDisciple.master
  );
}

// 获取可收徒的NPC
function getAvailableDisciples(player, npcs) {
  initMasterDisciple(player);
  return npcs.filter(n =>
    n.isAlive &&
    n.realmLevel < player.realmLevel &&
    n.favorWithPlayer >= 20 &&
    !player.masterDisciple.disciples.find(d => d.id === n.id)
  );
}

// 获取可结义的NPC
function getAvailableBrothers(player, npcs) {
  initMasterDisciple(player);
  return npcs.filter(n =>
    n.isAlive &&
    n.favorWithPlayer >= 50 &&
    !player.masterDisciple.swornBrothers.find(b => b.id === n.id) &&
    n.id !== player.masterDisciple.master?.id
  );
}

module.exports = {
  initMasterDisciple, requestMaster, takeDisciple, transmitPower,
  masterDailyReward, swearBrotherhood, breakBrotherhood, getBrotherhoodBonus,
  getAvailableMasters, getAvailableDisciples, getAvailableBrothers,
  masterDiscipleInteract, MASTER_DISCIPLE_TITLES,
};
