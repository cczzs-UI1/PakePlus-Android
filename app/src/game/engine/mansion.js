// 府邸系统 - 住宅购买、位份体系、家族管理
const { randInt, chance, randChoice, clamp } = require('./utils');

// 住宅等级
const RESIDENCE_TYPES = [
  { tier: 1, name: '茅草屋', price: 500, desc: '简陋的茅草屋，仅能遮风挡雨', capacity: 2, income: 0 },
  { tier: 2, name: '青砖小院', price: 3000, desc: '普通的青砖小院，干净整洁', capacity: 5, income: 10 },
  { tier: 3, name: '三进宅院', price: 15000, desc: '大户人家的三进宅院', capacity: 15, income: 50 },
  { tier: 4, name: '豪华府邸', price: 80000, desc: '豪华的大府邸，仆从如云', capacity: 50, income: 200 },
  { tier: 5, name: '侯府', price: 300000, desc: '封侯拜相的侯府', capacity: 200, income: 1000 },
  { tier: 6, name: '王府', price: 1000000, desc: '一字并肩王的王府', capacity: 500, income: 5000 },
  { tier: 7, name: '皇宫别院', price: 5000000, desc: '皇宫中的别院，帝王所赐', capacity: 1000, income: 20000 },
  { tier: 8, name: '仙人洞府', price: 20000000, desc: '仙人遗留的洞府，灵气充沛', capacity: 100, income: 10000, expBonus: 1.5 },
  { tier: 9, name: '天宫神殿', price: 100000000, desc: '天宫中的神殿，传说中的居所', capacity: 10000, income: 100000, expBonus: 2 },
];

// 家臣位份（九等）
const MEMBER_RANKS = [
  { rank: 1, name: '侍女/仆从', desc: '最低等的仆人', monthlyCost: 10 },
  { rank: 2, name: '护院', desc: '看家护院的武师', monthlyCost: 50 },
  { rank: 3, name: '管事', desc: '管理府中事务', monthlyCost: 100 },
  { rank: 4, name: '妾室', desc: '主人的妾室', monthlyCost: 200 },
  { rank: 5, name: '侧妃', desc: '地位较高的妾室', monthlyCost: 500 },
  { rank: 6, name: '正妻', desc: '明媒正娶的妻子', monthlyCost: 1000 },
  { rank: 7, name: '客卿', desc: '有一技之长的门客', monthlyCost: 1500 },
  { rank: 8, name: '供奉', desc: '高阶修士供奉', monthlyCost: 5000 },
  { rank: 9, name: '国师/长老', desc: '地位尊崇的大人物', monthlyCost: 20000 },
];

// 购买住宅
function buyResidence(player, tier) {
  const residence = RESIDENCE_TYPES[tier - 1];
  if (!residence) return { success: false, msg: '住宅等级不存在' };
  if (player.spiritStone < residence.price) {
    return { success: false, msg: `灵石不足，需要${residence.price}灵石` };
  }
  if (player.residence && player.residence.tier >= tier) {
    return { success: false, msg: '你已有同等或更高等级的住宅' };
  }

  player.spiritStone -= residence.price;
  player.residence = {
    tier: residence.tier,
    name: residence.name,
    desc: residence.desc,
    capacity: residence.capacity,
    income: residence.income,
    expBonus: residence.expBonus || 1,
    members: [],
    address: player.location,
  };
  return { success: true, msg: `你购置了${residence.name}！`, residence: player.residence };
}

// 升级住宅
function upgradeResidence(player) {
  if (!player.residence) return { success: false, msg: '你还没有住宅' };
  const nextTier = player.residence.tier + 1;
  if (nextTier > 9) return { success: false, msg: '已达最高等级' };
  return buyResidence(player, nextTier);
}

// 招纳家臣
function recruitMember(player, npc, rank) {
  if (!player.residence) return { success: false, msg: '你还没有住宅，无法招纳' };
  if (player.residence.members.length >= player.residence.capacity) {
    return { success: false, msg: '府邸已满，无法招纳更多人' };
  }
  if (npc.favorWithPlayer < 50) {
    return { success: false, msg: `${npc.name}对你好感不足，不愿加入` };
  }

  const rankInfo = MEMBER_RANKS[rank - 1];
  player.residence.members.push({
    npcId: npc.id,
    name: npc.name,
    rank: rank,
    rankName: rankInfo.name,
    monthlyCost: rankInfo.monthlyCost,
    joinDate: new Date().toISOString(),
  });
  npc.residence = { address: player.location, owner: player.id };
  npc.favorWithPlayer += 20;

  return { success: true, msg: `${npc.name}以${rankInfo.name}的身份加入你的府邸！` };
}

// 解除家臣
function dismissMember(player, npcId) {
  if (!player.residence) return { success: false, msg: '你还没有住宅' };
  const idx = player.residence.members.findIndex(m => m.npcId === npcId);
  if (idx === -1) return { success: false, msg: '此人不在你的府邸' };
  const member = player.residence.members[idx];
  player.residence.members.splice(idx, 1);
  return { success: true, msg: `你解除了${member.name}的${member.rankName}身份。` };
}

// 府邸月度结算
function monthlySettlement(player) {
  if (!player.residence) return { income: 0, cost: 0 };
  const income = player.residence.income;
  let cost = 0;
  for (const member of (player.residence.members || [])) {
    cost += member.monthlyCost;
  }
  const net = income - cost;
  player.spiritStone += net;
  return { income, cost, net };
}

// 府邸事件
function mansionEvent(player) {
  if (!player.residence) return null;
  const events = [
    {
      title: '府邸喜事',
      desc: '府中张灯结彩，似乎有什么喜事。',
      effect: { spiritStone: randInt(100, 500), msg: '府上收到了不少贺礼。' },
    },
    {
      title: '家臣立功',
      desc: '一位家臣为你立下了功劳。',
      effect: { reputation: randInt(5, 20), msg: '家臣立功，你的声望提升了。' },
    },
    {
      title: '府邸修缮',
      desc: '府邸需要修缮。',
      effect: { spiritStone: -randInt(100, 1000), msg: '花费灵石修缮了府邸。' },
    },
    {
      title: '贵客登门',
      desc: '一位贵客登门拜访。',
      effect: { favor: randInt(10, 30), msg: '贵客到访，你结交了新朋友。' },
    },
  ];
  if (chance(20)) {
    return randChoice(events);
  }
  return null;
}

// 拜访其他NPC的住宅
function visitResidence(visitor, host) {
  if (!host.residence) return { success: false, msg: `${host.name}没有住宅` };
  if (host.favorWithPlayer < 0) return { success: false, msg: `${host.name}不愿见你` };

  const results = [
    { msg: `你拜访了${host.name}的${host.residence.name}，受到热情款待。`, favor: 10 },
    { msg: `你在${host.name}府上做客，相谈甚欢。`, favor: 15, exp: 50 },
    { msg: `${host.name}留你用膳，席间得到一些指点。`, favor: 20, exp: 100 },
    { msg: `你拜访${host.name}，对方态度冷淡。`, favor: -5 },
  ];
  const result = randChoice(results);
  host.favorWithPlayer += result.favor || 0;
  visitor.cultivationExp += result.exp || 0;
  return { success: true, ...result };
}

module.exports = {
  RESIDENCE_TYPES, MEMBER_RANKS,
  buyResidence, upgradeResidence, recruitMember, dismissMember,
  monthlySettlement, mansionEvent, visitResidence,
};
