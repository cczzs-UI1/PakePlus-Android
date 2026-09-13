// 标签随机剧情库（补充2）- 身份背景、特殊际遇、情感状态、修为特质等
const { randChoice, randInt, chance } = require('../engine/utils');

function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

// ===== 身份背景标签 =====
const backgroundEvents = {
  commoner: [
    (n, l) => makeEvent(`${n.name}在${l}的田间劳作，虽然辛苦但过得踏实。`, `${l}·${n.name}田间劳作。`, { silver: randInt(10, 30), cultivationExp: 1 }),
    (n, l) => makeEvent(`${n.name}在${l}的集市上摆摊，卖些自家产的蔬果。`, `${l}·${n.name}集市摆摊。`, { silver: randInt(15, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位过路的修士，对方见其根骨不错，指点了几句。`, `${l}·${n.name}得修士指点。`, { cultivationExp: randInt(5, 15) }),
    (n, l) => makeEvent(`${n.name}在${l}的村里帮忙修房子，村民们都很感激。`, `${l}·${n.name}帮村民修房子。`, { karma: 5, reputation: 3 }),
  ],
  poor: [
    (n, l) => makeEvent(`${n.name}在${l}的街头乞讨，好不容易讨到了几文钱。`, `${l}·${n.name}街头乞讨。`, { silver: randInt(5, 20), reputation: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}的破庙中过夜，又冷又饿，只能咬牙坚持。`, `${l}·${n.name}破庙过夜。`, { hp: -10, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位好心人，给了一些吃的和穿的。`, `${l}·${n.name}遇好心人施舍。`, { karma: 3, hp: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}因为太穷被人看不起，但${n.name}暗下决心要出人头地。`, `${l}·${n.name}因穷被看不起。`, { willpower: 5, ambition: 10 }),
  ],
  scholar: [
    (n, l) => makeEvent(`${n.name}在${l}的书房中苦读，学问又精进了不少。`, `${l}·${n.name}书房苦读。`, { intelligence: 3, cultivationExp: randInt(5, 15) }),
    (n, l) => makeEvent(`${n.name}在${l}的诗会上，一首诗惊艳全场，获得了不少赞誉。`, `${l}·${n.name}诗会惊艳全场。`, { reputation: 10, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的书院中教书，学生们都很喜欢这位先生。`, `${l}·${n.name}书院教书。`, { silver: randInt(30, 80), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的考试中高中，获得了功名，全家欢庆。`, `${l}·${n.name}考试高中。`, { reputation: 20, silver: randInt(100, 300) }),
  ],
  military: [
    (n, l) => makeEvent(`${n.name}在${l}的校场上操练，武艺又精进了几分。`, `${l}·${n.name}校场操练。`, { strength: 2, cultivationExp: randInt(5, 15) }),
    (n, l) => makeEvent(`${n.name}在${l}的军队中立了功，受到了上级的嘉奖。`, `${l}·${n.name}军队立功受奖。`, { reputation: 10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，凭借家传的武艺击败了对手。`, `${l}·${n.name}比武获胜。`, { reputation: 8, silver: randInt(30, 80) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位老兵，对方传授了一些战场上的实用技巧。`, `${l}·${n.name}得老兵传授技巧。`, { strength: 3, combatExp: 10 }),
  ],
  merchant: [
    (n, l) => makeEvent(`${n.name}在${l}的商铺中算账，今天的生意不错，赚了不少。`, `${l}·${n.name}商铺算账。`, { silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的商会上，谈成了一笔大生意，获利丰厚。`, `${l}·${n.name}谈成大生意。`, { silver: randInt(100, 300), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的旅途中遇到了劫匪，损失了一些货物。`, `${l}·${n.name}遇劫匪损失货物。`, { silver: -randInt(50, 150), hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的市场上低价收购了一批货物，准备高价卖出。`, `${l}·${n.name}低价收购货物。`, { silver: randInt(30, 100) }),
  ],
  farmer: [
    (n, l) => makeEvent(`${n.name}在${l}的田里收割，今年的收成不错。`, `${l}·${n.name}田里收割。`, { silver: randInt(20, 60), food: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的菜园里浇水施肥，蔬菜长得很好。`, `${l}·${n.name}菜园劳作。`, { silver: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了旱灾，庄稼减产了不少。`, `${l}·${n.name}遇旱灾减产。`, { silver: -randInt(20, 50), willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的集市上卖了自家的农产品，换了些零花钱。`, `${l}·${n.name}卖农产品。`, { silver: randInt(15, 40) }),
  ],
  artisan: [
    (n, l) => makeEvent(`${n.name}在${l}的作坊中打造器具，手艺越来越精湛了。`, `${l}·${n.name}作坊打造器具。`, { forgeExp: 5, silver: randInt(20, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}的工匠大赛中，凭借精湛的手艺获得了名次。`, `${l}·${n.name}工匠大赛获奖。`, { reputation: 10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}接到了一个大订单，需要加班加点才能完成。`, `${l}·${n.name}接到大订单。`, { silver: randInt(80, 200), hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的作坊中发明了一个新工具，提高了工作效率。`, `${l}·${n.name}发明新工具。`, { intelligence: 5, silver: randInt(30, 80) }),
  ],
  criminal: [
    (n, l) => makeEvent(`${n.name}在${l}的街头被人指指点点，因为家族的罪名而受到歧视。`, `${l}·${n.name}因家族罪名受歧视。`, { reputation: -10, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了当年陷害家族的仇人，眼中闪过一丝恨意。`, `${l}·${n.name}遇到陷害家族的仇人。`, { karma: -5, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的暗中调查当年的案件，希望有朝一日能为家族平反。`, `${l}·${n.name}暗中调查案件。`, { intelligence: 3, mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}被官府的人盯上，不得不低调行事。`, `${l}·${n.name}被官府盯上。`, { mystery: 5, agility: 3 }),
  ],
  refugee: [
    (n, l) => makeEvent(`${n.name}在${l}的难民窟中，和其他难民一起分享仅有的食物。`, `${l}·${n.name}难民窟分享食物。`, { karma: 5, hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的城门口排队，希望能进入城中避难。`, `${l}·${n.name}城门口排队入城。`, { willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了同样流亡的同乡，两人抱头痛哭。`, `${l}·${n.name}遇到流亡同乡。`, { charm: 2, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的好心人的帮助下，终于安顿了下来。`, `${l}·${n.name}得好心人帮助安顿。`, { karma: 5, reputation: 3 }),
  ],
  retired: [
    (n, l) => makeEvent(`${n.name}在${l}的院子里晒太阳，回忆着当年的江湖岁月。`, `${l}·${n.name}院子里回忆往事。`, { willpower: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位后辈请教，${n.name}耐心地传授了一些经验。`, `${l}·${n.name}向后辈传授经验。`, { reputation: 5, intelligence: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的茶馆中，听着年轻人谈论江湖事，微微一笑。`, `${l}·${n.name}茶馆听江湖事。`, { charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的旧友来访，两人把酒言欢，聊了整整一夜。`, `${l}·${n.name}旧友来访把酒言欢。`, { hp: -5, charm: 3 }),
  ],
  wanted: [
    (n, l) => makeEvent(`${n.name}在${l}的街头看到了自己的通缉令，赶紧压低帽檐溜走。`, `${l}·${n.name}看到通缉令溜走。`, { agility: 3, mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的客栈中，遇到了前来抓捕的官差，一番激战后逃脱。`, `${l}·${n.name}激战逃脱官差。`, { hp: -20, agility: 5, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的黑市中，花了一大笔钱让人帮忙抹去通缉。`, `${l}·${n.name}花钱抹通缉。`, { silver: -randInt(100, 300), reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的深夜，偷偷摸摸地行动，生怕被人认出。`, `${l}·${n.name}深夜偷偷行动。`, { mystery: 5, agility: 3 }),
  ],
  bounty_hunter: [
    (n, l) => makeEvent(`${n.name}在${l}的赏金告示前，挑选着合适的目标。`, `${l}·${n.name}挑选赏金目标。`, { intelligence: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}成功抓捕了一个通缉犯，获得了丰厚的赏金。`, `${l}·${n.name}抓捕通缉犯获赏金。`, { silver: randInt(100, 300), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的追捕中，与目标展开了激烈的搏斗，最终将其制服。`, `${l}·${n.name}搏斗制服目标。`, { hp: -15, silver: randInt(80, 200) }),
    (n, l) => makeEvent(`${n.name}在${l}的酒馆中，打听着目标的下落。`, `${l}·${n.name}酒馆打听目标下落。`, { intelligence: 3, silver: -randInt(10, 30) }),
  ],
  doctor: [
    (n, l) => makeEvent(`${n.name}在${l}的医馆中坐诊，为病人看病开方。`, `${l}·${n.name}医馆坐诊。`, { silver: randInt(30, 100), karma: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的山中采药，找到了几株珍贵的药材。`, `${l}·${n.name}山中采药。`, { alchemyExp: 5, silver: randInt(20, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}救治了一位危重病人，家属感激不尽，送上了厚礼。`, `${l}·${n.name}救治危重病人。`, { karma: 15, silver: randInt(100, 300), reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的研究中，发现了一个新的药方。`, `${l}·${n.name}发现新药方。`, { intelligence: 5, alchemyExp: 10 }),
  ],
  poisoner: [
    (n, l) => makeEvent(`${n.name}在${l}的密室中炼制毒药，手法越来越熟练。`, `${l}·${n.name}密室炼毒。`, { alchemyExp: 8, karma: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的黑市中，卖出了一批特制的毒药。`, `${l}·${n.name}黑市卖毒药。`, { silver: randInt(80, 200), reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的实验中，不小心中毒了，赶紧服用解药。`, `${l}·${n.name}实验中不小心中毒。`, { hp: -20, alchemyExp: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}被人请去下毒，获得了一大笔报酬。`, `${l}·${n.name}被请去下毒。`, { silver: randInt(150, 400), karma: -15, reputation: -10 }),
  ],
  thief: [
    (n, l) => makeEvent(`${n.name}在${l}的集市上，顺手牵羊偷了一个钱包。`, `${l}·${n.name}集市偷钱包。`, { silver: randInt(30, 100), agility: 2, karma: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的富户中，夜盗了不少财物。`, `${l}·${n.name}夜盗富户。`, { silver: randInt(100, 300), agility: 3, karma: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的偷窃中被人发现，一番追逐后才逃脱。`, `${l}·${n.name}偷窃被发现逃脱。`, { hp: -10, agility: 5, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的同行聚会中，交流着偷窃的技巧。`, `${l}·${n.name}同行交流技巧。`, { agility: 3, mystery: 3 }),
  ],
  assassin: [
    (n, l) => makeEvent(`${n.name}在${l}的屋顶上潜伏，等待着目标的出现。`, `${l}·${n.name}屋顶潜伏等待目标。`, { agility: 3, mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}完成了一次暗杀任务，获得了丰厚的报酬。`, `${l}·${n.name}完成暗杀任务。`, { silver: randInt(200, 500), karma: -20, reputation: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}的暗杀中被目标发现，一场激战后方才得手。`, `${l}·${n.name}激战中完成暗杀。`, { hp: -25, silver: randInt(150, 400) }),
    (n, l) => makeEvent(`${n.name}在${l}的暗处，观察着目标的生活规律，寻找下手机会。`, `${l}·${n.name}暗处观察目标。`, { intelligence: 3, mystery: 5 }),
  ],
};

// ===== 特殊际遇标签 =====
const specialEvents = {
  reincarnated: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，回忆起了前世的一些功法，修炼速度大增。`, `${l}·${n.name}回忆前世功法。`, { cultivationExp: randInt(30, 80), intelligence: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了前世的故人，对方却已经不认识${n.name}了。`, `${l}·${n.name}遇到前世故人。`, { willpower: 5, mystery: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的梦中，见到了前世的自己，获得了一些感悟。`, `${l}·${n.name}梦中见前世自己。`, { cultivationExp: randInt(20, 50), enlightenment: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}凭借前世的记忆，避开了一场大灾难。`, `${l}·${n.name}凭前世记忆避灾。`, { fateLuck: 10, hp: 20 }),
  ],
  transmigrated: [
    (n, l) => makeEvent(`${n.name}在${l}用现代知识解决了一个难题，让周围人大为惊讶。`, `${l}·${n.name}用现代知识解难题。`, { intelligence: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的梦中，回忆起了穿越前的生活，有些怀念。`, `${l}·${n.name}怀念穿越前生活。`, { willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的交易中，用现代的商业思维赚了一大笔钱。`, `${l}·${n.name}用现代商业思维赚钱。`, { silver: randInt(100, 300), intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了一个同样穿越而来的人，两人相谈甚欢。`, `${l}·${n.name}遇到同样穿越者。`, { charm: 5, mystery: 10 }),
  ],
  blessed: [
    (n, l) => makeEvent(`${n.name}在${l}的危险中，冥冥中有一股力量保护了${n.name}。`, `${l}·${n.name}受神灵庇佑脱险。`, { fateLuck: 10, hp: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}的神庙中祈祷，得到了神灵的回应，修为大进。`, `${l}·${n.name}神庙祈祷得神灵回应。`, { cultivationExp: randInt(30, 60), fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的旅途中，意外捡到了一件宝物。`, `${l}·${n.name}意外捡到宝物。`, { fateLuck: 10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的重病中，奇迹般地痊愈了，医生都说是神迹。`, `${l}·${n.name}重病奇迹痊愈。`, { hp: 50, fateLuck: 10, reputation: 5 }),
  ],
  demon_possessed: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，体内的魔物突然暴动，${n.name}费了好大劲才压制住。`, `${l}·${n.name}体内魔物暴动。`, { hp: -20, cultivationExp: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，借助魔物的力量击败了对手，但也受到了反噬。`, `${l}·${n.name}借魔物力量战斗。`, { hp: -15, combatExp: 20, karma: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的眼中闪过一丝红光，周围的人都感到一阵寒意。`, `${l}·${n.name}眼中闪过红光。`, { intimidation: 5, mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，与体内的魔物达成了某种协议，实力大增。`, `${l}·${n.name}与魔物达成协议。`, { cultivationExp: randInt(40, 80), karma: -10 }),
  ],
  spirit_guide: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，灵体主动指点了${n.name}一些修炼上的疑惑。`, `${l}·${n.name}得灵体指点修炼。`, { cultivationExp: randInt(20, 50), intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的危险中，灵体主动现身，帮助${n.name}度过了难关。`, `${l}·${n.name}灵体现身相助。`, { hp: 20, fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的梦中，灵体带着${n.name}游历了一个奇异的空间。`, `${l}·${n.name}灵体带梦游历。`, { intelligence: 5, mystery: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}与灵体交流，了解到了一些上古的秘辛。`, `${l}·${n.name}与灵体交流知秘辛。`, { mystery: 10, intelligence: 3 }),
  ],
  ancient_inheritance: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，上古传承的记忆又苏醒了一些，修为大进。`, `${l}·${n.name}上古传承记忆苏醒。`, { cultivationExp: randInt(30, 70), intelligence: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，下意识地使出了上古的招式，击败了对手。`, `${l}·${n.name}使出上古招式。`, { combatExp: 20, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的研究中，破解了传承中的一个难题，获得了新的能力。`, `${l}·${n.name}破解传承难题。`, { intelligence: 5, cultivationExp: randInt(20, 50) }),
    (n, l) => makeEvent(`${n.name}在${l}被一位隐世高人认出了传承的来历，对方大为震惊。`, `${l}·${n.name}被高人认出传承。`, { mystery: 10, reputation: 5 }),
  ],
  bloodline: [
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，神兽血脉觉醒，爆发出了惊人的力量。`, `${l}·${n.name}神兽血脉觉醒。`, { combatExp: 30, strength: 5, hp: 30 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，血脉之力帮助${n.name}突破了瓶颈。`, `${l}·${n.name}血脉之力助突破。`, { cultivationExp: randInt(30, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了同血脉的族人，两人相见甚欢。`, `${l}·${n.name}遇到同血脉族人。`, { charm: 5, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的血脉测试中，被测出有上古神兽血脉，引起了轰动。`, `${l}·${n.name}被测出血脉引起轰动。`, { reputation: 15, mystery: 10 }),
  ],
  innately_weak: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，因为天生绝脉，进展缓慢，${n.name}却从不放弃。`, `${l}·${n.name}天生绝脉修炼缓慢。`, { willpower: 5, cultivationExp: randInt(5, 15) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位神医，对方称有办法改善绝脉，但需要珍贵药材。`, `${l}·${n.name}遇神医称可改善绝脉。`, { intelligence: 3, mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，虽然修为低，但凭借毅力坚持到了最后。`, `${l}·${n.name}比武凭毅力坚持。`, { willpower: 10, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，另辟蹊径，找到了适合自己的修炼方法。`, `${l}·${n.name}另辟蹊径找修炼法。`, { intelligence: 5, cultivationExp: randInt(15, 30) }),
  ],
};

module.exports = {
  backgroundEvents,
  specialEvents,
};
