// 青楼系统 - 五大青楼交互
const { randInt, chance, randChoice, clamp } = require('./utils');
const { generateNPC } = require('./npcGenerator');

// 五大青楼定义
const BROTHELS = {
  明月台: {
    name: '明月台',
    location: '自由坊市',
    tier: '顶级',
    desc: '坊市最风雅之地，风花雪月所在，常有修仙者光顾',
    minRealm: 3,
    entryFee: 200,
    girls: [],
    style: '清雅',
  },
};

// 位份体系（九等）
const RANKS = [
  { rank: 1, name: '侍女', desc: '最低等，端茶倒水', price: 10 },
  { rank: 2, name: '歌姬', desc: '以歌舞娱人', price: 50 },
  { rank: 3, name: '舞姬', desc: '以舞姿动人', price: 80 },
  { rank: 4, name: '才女', desc: '琴棋书画样样精通', price: 150 },
  { rank: 5, name: '入幕之宾', desc: '可入幕谈心', price: 300 },
  { rank: 6, name: '红牌', desc: '楼中红人', price: 500 },
  { rank: 7, name: '花魁', desc: '一楼之花魁', price: 1000 },
  { rank: 8, name: '镇楼之宝', desc: '镇楼之宝，难得一见', price: 3000 },
  { rank: 9, name: '天仙下凡', desc: '传说中的存在', price: 10000 },
];

// 初始化青楼姑娘
function initBrothelGirls() {
  for (const brothel of Object.values(BROTHELS)) {
    const count = brothel.tier === '顶级' ? 12 : brothel.tier === '高级' ? 8 : 6;
    for (let i = 0; i < count; i++) {
      const girl = generateNPC({
        gender: '女',
        age: randInt(16, 28),
        location: brothel.location,
        race: brothel.style === '妖媚' ? randChoice(['妖族', '人族']) : '人族',
        realmLevel: clamp(randInt(1, 5), 1, 10),
      });
      girl.profession = '青楼女子';
      girl.professionName = RANKS[randInt(0, 5)].name;
      girl.brothel = brothel.name;
      girl.rank = randInt(1, 7);
      girl.price = RANKS[girl.rank - 1].price;
      girl.favorWithPlayer = randInt(-20, 30);
      girl.isWorking = true;
      brothel.girls.push(girl);
    }
  }
}

// 获取青楼信息
function getBrothel(name) {
  return BROTHELS[name];
}

// 获取青楼姑娘列表
function getGirls(brothelName, playerRealm) {
  const brothel = BROTHELS[brothelName];
  if (!brothel) return [];
  // 根据玩家境界显示可见姑娘
  return brothel.girls.filter(g => g.rank <= Math.min(7, playerRealm + 3));
}

// 与姑娘交互
function interactWithGirl(player, girl, action) {
  const result = { success: false, msg: '', effects: {} };

  switch (action) {
    case 'drink': {
      // 饮酒作乐
      const cost = Math.floor(girl.price * 0.3);
      if (player.spiritStone < cost) {
        result.msg = `灵石不足，需要${cost}灵石。`;
        return result;
      }
      player.spiritStone -= cost;
      const favorGain = randInt(5, 15);
      girl.favorWithPlayer += favorGain;
      result.success = true;
      result.msg = `你与${girl.name}饮酒作乐，花费${cost}灵石，好感+${favorGain}。`;
      result.effects = { spiritStone: -cost, favor: favorGain };
      // 小概率触发事件
      if (chance(15)) {
        result.event = randChoice([
          '姑娘向你吐露了心事',
          '你听闻了一些江湖秘闻',
          '遇到了一位神秘客人',
          '姑娘为你弹奏了一曲',
        ]);
      }
      break;
    }
    case 'accompany': {
      // 留宿
      const cost = girl.price;
      if (player.spiritStone < cost) {
        result.msg = `灵石不足，${girl.name}的${girl.professionName}位份需要${cost}灵石。`;
        return result;
      }
      if (girl.favorWithPlayer < 20 && girl.rank >= 5) {
        result.msg = `${girl.name}对你好感不足，不愿接待。`;
        return result;
      }
      player.spiritStone -= cost;
      const favorGain = randInt(10, 30);
      girl.favorWithPlayer += favorGain;
      player.cultivationExp += Math.floor(100 + girl.realmLevel * 50);
      result.success = true;
      result.msg = `你与${girl.name}共度良宵，花费${cost}灵石，修为+${Math.floor(100 + girl.realmLevel * 50)}，好感+${favorGain}。`;
      result.effects = { spiritStone: -cost, exp: Math.floor(100 + girl.realmLevel * 50), favor: favorGain };
      // 青楼姑娘可能怀孕
      if (player.gender === '男' && girl.gender === '女' && chance(10) && !girl.isPregnant) {
        girl.isPregnant = true;
        girl.pregnancyMonths = 0;
        girl.pregnancyFather = player.id;
        result.msg += `不久后，${girl.name}发现自己有了身孕。`;
        result.pregnancy = true;
      }
      break;
    }
    case 'gift': {
      // 赠礼
      const cost = randInt(100, 500);
      if (player.spiritStone < cost) {
        result.msg = `灵石不足。`;
        return result;
      }
      player.spiritStone -= cost;
      const favorGain = Math.floor(cost / 10);
      girl.favorWithPlayer += favorGain;
      result.success = true;
      result.msg = `你赠送${girl.name}价值${cost}灵石的礼物，好感+${favorGain}。`;
      result.effects = { spiritStone: -cost, favor: favorGain };
      break;
    }
    case 'redeem': {
      // 赎身
      const redeemPrice = girl.price * 100;
      if (player.spiritStone < redeemPrice) {
        result.msg = `为${girl.name}赎身需要${redeemPrice}灵石，你灵石不足。`;
        return result;
      }
      if (girl.favorWithPlayer < 100) {
        result.msg = `${girl.name}对你好感不足${100}，不愿随你离开。`;
        return result;
      }
      player.spiritStone -= redeemPrice;
      girl.isWorking = false;
      girl.profession = '自由身';
      girl.professionName = '良家女子';
      girl.favorWithPlayer += 50;
      result.success = true;
      result.msg = `你花费${redeemPrice}灵石为${girl.name}赎身，她感激涕零，愿随你左右。`;
      result.effects = { spiritStone: -redeemPrice, favor: 50, redeemed: girl.id };
      break;
    }
    case 'chat': {
      // 闲聊
      const favorGain = randInt(1, 5);
      girl.favorWithPlayer += favorGain;
      result.success = true;
      result.msg = `你与${girl.name}闲聊了一会儿，好感+${favorGain}。`;
      result.effects = { favor: favorGain };
      break;
    }
  }

  return result;
}

// 青楼随机事件
function brothelRandomEvent(player, brothel) {
  const events = [
    {
      title: '花魁选婿',
      desc: `${brothel.name}正在举办花魁选婿大会，胜出者可与花魁共度良宵。`,
      options: [
        { text: '参加比试', cost: 500, successRate: 30 + player.realmLevel * 5 },
        { text: '重金竞拍', cost: 3000, successRate: 80 },
        { text: '不感兴趣', cost: 0 },
      ],
    },
    {
      title: '神秘客人',
      desc: '你注意到一位蒙面客人似乎在密谋什么。',
      options: [
        { text: '偷听', risk: 20 },
        { text: '上前搭话', risk: 10 },
        { text: '不理会', risk: 0 },
      ],
    },
    {
      title: '姑娘求助',
      desc: '一位姑娘悄悄向你求助，似乎被人逼迫。',
      options: [
        { text: '出手相助', cost: 1000, favor: 50 },
        { text: '询问详情', cost: 0 },
        { text: '明哲保身', cost: 0 },
      ],
    },
  ];
  return randChoice(events);
}

module.exports = { BROTHELS, RANKS, initBrothelGirls, getBrothel, getGirls, interactWithGirl, brothelRandomEvent };
