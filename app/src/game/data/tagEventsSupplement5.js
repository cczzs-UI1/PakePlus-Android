// 标签随机剧情库（补充5）- 剩余特殊标签
const { randChoice, randInt, chance } = require('../engine/utils');

function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

const specialEvents2 = {
  photographic_memory: [
    (n, l) => makeEvent(`${n.name}在${l}的书店中，只看了一遍就记住了整本书的内容。`, `${l}·${n.name}过目不忘记住整本书。`, { intelligence: 5, cultivationExp: randInt(10, 25) }),
    (n, l) => makeEvent(`${n.name}在${l}的考试中，凭借过目不忘的本领，轻松取得了第一名。`, `${l}·${n.name}考试第一。`, { reputation: 10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，看了一遍功法就完全领悟了其中的精髓。`, `${l}·${n.name}看一遍领悟功法。`, { cultivationExp: randInt(20, 40), enlightenment: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的棋局中，记住了对手的每一步棋，轻松获胜。`, `${l}·${n.name}记棋路获胜。`, { intelligence: 3, reputation: 5 }),
  ],
  battle_genius: [
    (n, l) => makeEvent(`${n.name}在${l}的比武中，战斗天才的实力尽显，轻松击败了对手。`, `${l}·${n.name}战斗天才轻松获胜。`, { combatExp: 25, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的生死搏斗中，临阵突破，反败为胜。`, `${l}·${n.name}临阵突破反败为胜。`, { cultivationExp: randInt(30, 60), hp: -20 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，一眼就看出了对手的破绽，一击制胜。`, `${l}·${n.name}一眼看破破绽制胜。`, { combatExp: 20, reputation: 8 }),
    (n, l) => makeEvent(`${n.name}在${l}的宗门大比中，一路过关斩将，获得了冠军。`, `${l}·${n.name}宗门大比冠军。`, { reputation: 15, spiritStones: randInt(50, 150) }),
  ],
  forge_genius: [
    (n, l) => makeEvent(`${n.name}在${l}的炼器中，炼器鬼才的天赋尽显，成功炼制出了一件高品质法器。`, `${l}·${n.name}炼制高品质法器。`, { forgeExp: 25, silver: randInt(100, 300) }),
    (n, l) => makeEvent(`${n.name}在${l}的炼器大赛中，凭借精湛的技艺获得了第一名。`, `${l}·${n.name}炼器大赛第一。`, { reputation: 15, forgeExp: 30 }),
    (n, l) => makeEvent(`${n.name}在${l}的炼器中，发明了一种新的炼器手法，提高了成功率。`, `${l}·${n.name}发明炼器新手法。`, { intelligence: 5, forgeExp: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}被一位炼器大师看中，想要收为亲传弟子。`, `${l}·${n.name}被炼器大师收徒。`, { forgeExp: 30, reputation: 10 }),
  ],
  formation_genius: [
    (n, l) => makeEvent(`${n.name}在${l}的阵法学习中，阵法宗师的天赋尽显，很快就掌握了复杂的阵法。`, `${l}·${n.name}快速掌握阵法。`, { formationExp: 25, intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的阵法大赛中，凭借精妙的阵法布置获得了第一名。`, `${l}·${n.name}阵法大赛第一。`, { reputation: 15, formationExp: 30 }),
    (n, l) => makeEvent(`${n.name}在${l}的阵法研究中，发现了一个古阵法的秘密。`, `${l}·${n.name}发现古阵法秘密。`, { formationExp: 30, mystery: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}被一位阵法大师看中，想要收为亲传弟子。`, `${l}·${n.name}被阵法大师收徒。`, { formationExp: 30, reputation: 10 }),
  ],
  beast_tamer: [
    (n, l) => makeEvent(`${n.name}在${l}的山林中，万兽亲和的体质让野兽都主动亲近。`, `${l}·${n.name}野兽主动亲近。`, { charm: 3, fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的遇到了一头凶猛的妖兽，对方却主动臣服。`, `${l}·${n.name}妖兽主动臣服。`, { combatExp: 15, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的驯服了一头稀有坐骑，价值连城。`, `${l}·${n.name}驯服稀有坐骑。`, { silver: randInt(200, 500), reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的兽潮中，凭借万兽亲和的体质，安然无恙地通过。`, `${l}·${n.name}兽潮中安然通过。`, { fateLuck: 10, cultivationExp: randInt(10, 20) }),
  ],
  lucky_star: [
    (n, l) => makeEvent(`${n.name}在${l}的路上捡到了一个钱袋，里面有不少银子。`, `${l}·${n.name}捡到钱袋。`, { silver: randInt(50, 200), fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的抽奖中，幸运地抽中了头奖。`, `${l}·${n.name}抽奖中头奖。`, { silver: randInt(100, 300), fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的危险中，福星高照，奇迹般地躲过了一劫。`, `${l}·${n.name}福星高照躲过一劫。`, { fateLuck: 10, hp: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，意外发现了一处灵气浓郁的宝地。`, `${l}·${n.name}发现灵气宝地。`, { cultivationExp: randInt(30, 60), fateLuck: 10 }),
  ],
  unlucky: [
    (n, l) => makeEvent(`${n.name}在${l}的路上踩到了香蕉皮，摔了一跤。`, `${l}·${n.name}踩香蕉皮摔跤。`, { hp: -10, fateLuck: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}的钱包被偷了，损失了不少钱财。`, `${l}·${n.name}钱包被偷。`, { silver: -randInt(30, 100), fateLuck: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，走火入魔，受了内伤。`, `${l}·${n.name}修炼走火入魔。`, { hp: -25, spirit: -20, cultivationExp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的出门就遇到了暴雨，被淋成了落汤鸡。`, `${l}·${n.name}出门遇暴雨。`, { hp: -5, fateLuck: -3 }),
  ],
  wealthy_encounter: [
    (n, l) => makeEvent(`${n.name}在${l}的遇到了一位贵人，对方赠送了一大笔钱财。`, `${l}·${n.name}遇贵人赠财。`, { silver: randInt(200, 500), fateLuck: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的贵人指点下，找到了一条发财的门路。`, `${l}·${n.name}贵人指点发财门路。`, { silver: randInt(100, 300), intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的贵人帮助下，解决了一个大难题。`, `${l}·${n.name}贵人帮助解决难题。`, { reputation: 10, fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的贵人推荐下，获得了一个好职位。`, `${l}·${n.name}贵人推荐获好职位。`, { reputation: 10, silver: randInt(100, 200) }),
  ],
};

module.exports = {
  specialEvents2,
};
