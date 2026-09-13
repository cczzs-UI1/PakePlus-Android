// 标签随机剧情库 - 每个标签根据属性、地点、性格等触发不同剧情
// 剧情格式：{ text, journal, effects, conditions }

const { randChoice, randInt, chance } = require('../engine/utils');

// 通用剧情生成辅助函数
function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

// ===== 身体特征标签剧情 =====
const bodyEvents = {
  beautiful: [
    // 根据地点、性格、好感度生成不同剧情
    (npc, location, ctx) => makeEvent(
      `${npc.name}走在${location}的街头，容貌绝美引得路人频频回头，甚至有人不慎撞在了柱子上。`,
      `${location}·${npc.name}因容貌出众引起围观。`,
      { reputation: 5, charm: 1 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位富家公子，对方被其美貌倾倒，主动上前搭话并赠送了一些财物。`,
      `${location}·${npc.name}被富家公子搭讪并获赠财物。`,
      { silver: randInt(50, 200), favorWithPlayer: ctx?.isPlayer ? 5 : 0 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的茶馆中休息，周围的人都在偷偷打量着${npc.name}，议论纷纷。`,
      `${location}·${npc.name}在茶馆被人围观议论。`,
      { reputation: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被一群地痞流氓骚扰，幸好有路过的侠客出手相救。`,
      `${location}·${npc.name}被地痞骚扰，被侠客所救。`,
      { hp: -10, reputation: 2 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的集市上买东西，小贩因为${npc.name}长得好看，主动给了优惠。`,
      `${location}·${npc.name}买东西时获得容貌优惠。`,
      { silver: randInt(10, 50) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}参加宴会，成为全场焦点，众人争相与${npc.name}结交。`,
      `${location}·${npc.name}在宴会上成为焦点。`,
      { reputation: 10, spiritStones: randInt(10, 50) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的寺庙中上香，方丈亲自接见，称${npc.name}有贵人之相。`,
      `${location}·${npc.name}被方丈称有贵人之相。`,
      { fateLuck: 5, reputation: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的河边散步，倒映在水中的容貌让鱼儿都忘记了游动。`,
      `${location}·${npc.name}容貌让鱼沉底。`,
      { charm: 2, fateLuck: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被星探发现，邀请其加入戏班子，承诺重金酬谢。`,
      `${location}·${npc.name}被星探邀请加入戏班。`,
      { silver: randInt(100, 300), reputation: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的雨中行走，一位好心人主动为${npc.name}撑伞，一路护送回家。`,
      `${location}·${npc.name}雨中被人护送。`,
      { favorWithPlayer: ctx?.isPlayer ? 8 : 0, reputation: 2 }
    ),
  ],
  handsome: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的酒楼喝酒，旁边桌的女子频频偷看，还主动过来敬酒。`,
      `${location}·${npc.name}被女子主动敬酒。`,
      { reputation: 5, charm: 1 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}比武招亲现场，凭借英俊外貌和武艺赢得了小姐的芳心。`,
      `${location}·${npc.name}比武招亲获胜。`,
      { reputation: 15, silver: randInt(200, 500) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的书院读书，同窗们都愿意与${npc.name}交往，请教问题。`,
      `${location}·${npc.name}在书院受人欢迎。`,
      { enlightenment: 3, reputation: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被一位富家小姐看中，托媒人上门说亲。`,
      `${location}·${npc.name}被富家小姐提亲。`,
      { reputation: 10, silver: randInt(100, 300) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的战场上冲锋陷阵，英俊的面容和勇猛的姿态激励了全军士气。`,
      `${location}·${npc.name}战场激励士气。`,
      { combatExp: 20, reputation: 10 }
    ),
  ],
  ugly: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的街头行走，路人纷纷避让，有的小孩甚至被吓哭了。`,
      `${location}·${npc.name}因容貌被人避让。`,
      { reputation: -3, willpower: 2 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}找工作，老板因为${npc.name}长得丑而拒绝了，虽然${npc.name}能力足够。`,
      `${location}·${npc.name}因容貌被拒聘。`,
      { silver: -20, willpower: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的茶馆中，旁边的人议论${npc.name}的容貌，言语刻薄。`,
      `${location}·${npc.name}被人议论容貌。`,
      { reputation: -5, willpower: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}救了一位落水的人，对方起初因为${npc.name}的容貌感到害怕，但得知是救命恩人后感激涕零。`,
      `${location}·${npc.name}救人后被感激。`,
      { reputation: 10, karma: 10, willpower: 5 }
    ),
  ],
  strong: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}看到一辆马车失控，冲上前去一把拉住了马，避免了一场事故。`,
      `${location}·${npc.name}力拉惊马救人。`,
      { reputation: 10, strength: 2, hp: -5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的比武大会上，凭借一身蛮力连胜数场，赢得了不少奖金。`,
      `${location}·${npc.name}比武大会连胜。`,
      { silver: randInt(100, 300), combatExp: 15, reputation: 8 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}帮人搬运重物，一次能扛普通人三倍的东西，雇主非常满意。`,
      `${location}·${npc.name}帮人搬运获赏。`,
      { silver: randInt(30, 80), physique: 1 }
    ),
  ],
  weak: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}感染了风寒，卧床不起，花了不少钱买药。`,
      `${location}·${npc.name}感染风寒。`,
      { hp: -20, silver: -randInt(30, 80) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被小偷偷了钱包，因为身体虚弱追不上，只能眼睁睁看着。`,
      `${location}·${npc.name}被偷无法追赶。`,
      { silver: -randInt(50, 150), willpower: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位名医，对方免费为${npc.name}调理身体，情况有所好转。`,
      `${location}·${npc.name}遇名医调理身体。`,
      { hp: 30, constitution: 2 }
    ),
  ],
};

// ===== 性格特质标签剧情 =====
const personalityEvents = {
  kind: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}看到一位乞丐，心生怜悯，给了对方一些银两和食物。`,
      `${location}·${npc.name}施舍乞丐。`,
      { silver: -randInt(10, 30), karma: 10, reputation: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}帮助一位迷路的老人找到了家，老人的家人非常感激。`,
      `${location}·${npc.name}帮助迷路老人。`,
      { karma: 8, reputation: 5, favorWithPlayer: ctx?.isPlayer ? 5 : 0 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的寺庙中做义工，帮忙打扫和照顾香客，方丈赠了一串佛珠。`,
      `${location}·${npc.name}寺庙做义工获赠佛珠。`,
      { karma: 15, fateLuck: 5, item: '佛珠' }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}看到有人欺负弱小，挺身而出制止了恶行。`,
      `${location}·${npc.name}挺身而出制止恶行。`,
      { karma: 12, reputation: 8, hp: -10 }
    ),
  ],
  cruel: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}因为一点小事就对仆人拳打脚踢，周围的人敢怒不敢言。`,
      `${location}·${npc.name}虐待仆人。`,
      { karma: -15, reputation: -5, intimidation: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的斗兽场中，看着野兽撕咬俘虏，哈哈大笑，还下注赢了不少钱。`,
      `${location}·${npc.name}斗兽场取乐赢钱。`,
      { silver: randInt(50, 200), karma: -20, reputation: -8 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}因为商家少找了一文钱，就把对方的摊子砸了。`,
      `${location}·${npc.name}打砸商家摊位。`,
      { karma: -10, silver: -randInt(20, 50), intimidation: 3 }
    ),
  ],
  greedy: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}看到地上有一个钱袋，环顾四周无人后迅速捡起揣入怀中。`,
      `${location}·${npc.name}捡钱袋据为己有。`,
      { silver: randInt(50, 200), karma: -5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的集市上买东西，拼命砍价，最后以极低的价格买下了商品。`,
      `${location}·${npc.name}砍价成功。`,
      { silver: randInt(20, 80) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被人骗去投资，结果血本无归，懊悔不已。`,
      `${location}·${npc.name}投资被骗。`,
      { silver: -randInt(100, 300), enlightenment: 3 }
    ),
  ],
  lazy: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的家中睡了一整天，什么事都没做，日上三竿才起床。`,
      `${location}·${npc.name}昏睡一整天。`,
      { hp: 10, silver: -10, cultivationExp: -5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的工作中偷懒，被工头发现后扣了工钱。`,
      `${location}·${npc.name}偷懒被扣工钱。`,
      { silver: -randInt(20, 50), reputation: -3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的树下打盹，梦见自己飞黄腾达，醒来后依然是老样子。`,
      `${location}·${npc.name}树下做白日梦。`,
      { hp: 5, willpower: -2 }
    ),
  ],
  diligent: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的书房中苦读至深夜，学问大有长进。`,
      `${location}·${npc.name}苦读至深夜。`,
      { enlightenment: 5, cultivationExp: 20, hp: -5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的练功场中苦练武功，汗水湿透了衣衫，武艺有所提升。`,
      `${location}·${npc.name}苦练武功。`,
      { combatExp: 25, physique: 2, hp: -10 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}帮人做工，因为勤劳肯干，雇主给了额外的赏钱。`,
      `${location}·${npc.name}勤劳获赏。`,
      { silver: randInt(30, 80), reputation: 5 }
    ),
  ],
};

// ===== 身份背景标签剧情 =====
const backgroundEvents = {
  orphan: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的孤儿院中长大，今天是${npc.name}的生日，却没有一个人记得。`,
      `${location}·${npc.name}生日无人记得。`,
      { willpower: 5, karma: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位好心的夫妇，对方提出愿意收养${npc.name}。`,
      `${location}·${npc.name}被夫妇收养。`,
      { silver: randInt(50, 150), reputation: 5, willpower: 3 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的街头乞讨，被一位武林高手看中，收为徒弟。`,
      `${location}·${npc.name}被武林高手收徒。`,
      { combatExp: 30, cultivationExp: 20, reputation: 5 }
    ),
  ],
  rich: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的豪宅中举办宴会，邀请了众多宾客，花费不菲。`,
      `${location}·${npc.name}举办豪华宴会。`,
      { silver: -randInt(200, 500), reputation: 15 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的商铺中查账，发现这个月的利润又增加了不少。`,
      `${location}·${npc.name}商铺利润增加。`,
      { silver: randInt(100, 300), reputation: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}被一群劫匪盯上，幸好护卫及时赶到，才没有损失。`,
      `${location}·${npc.name}遇劫匪被护卫所救。`,
      { hp: -5, reputation: 3 }
    ),
  ],
  noble: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的府邸中接待了一位来访的官员，两人相谈甚欢。`,
      `${location}·${npc.name}接待官员。`,
      { reputation: 10, spiritStones: randInt(20, 50) }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}参加了皇室举办的狩猎活动，表现出色获得了赏赐。`,
      `${location}·${npc.name}皇室狩猎获赏。`,
      { reputation: 15, silver: randInt(200, 400), item: '皇室赏赐' }
    ),
  ],
  slave: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的奴隶市场中被买卖，新主人看起来还算和善。`,
      `${location}·${npc.name}被转卖。`,
      { willpower: 5, hp: -10 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}趁主人不注意，偷偷逃跑了，但很快又被抓了回来。`,
      `${location}·${npc.name}逃跑被抓回。`,
      { hp: -30, willpower: 10 }
    ),
  ],
};

// ===== 特殊际遇标签剧情 =====
const destinyEvents = {
  chosen_one: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的山洞中避雨，意外发现了一本上古功法，如获至宝。`,
      `${location}·${npc.name}发现上古功法。`,
      { cultivationExp: 100, enlightenment: 10, fateLuck: 10 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位白胡子老者，对方称${npc.name}是天命之人，赠了一枚仙丹。`,
      `${location}·${npc.name}遇老者获赠仙丹。`,
      { cultivationExp: 200, hp: 50, item: '仙丹' }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的悬崖边不慎坠落，却意外进入了一个秘境，获得了传承。`,
      `${location}·${npc.name}坠崖获秘境传承。`,
      { cultivationExp: 150, combatExp: 50, fateLuck: 15 }
    ),
  ],
  cursed: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的夜晚，身上的诅咒再次发作，痛苦不堪，折腾了一整夜。`,
      `${location}·${npc.name}诅咒发作。`,
      { hp: -30, willpower: 5, cultivationExp: -10 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位道士，对方看出了${npc.name}身上的诅咒，表示可以帮忙解除，但需要大量财物。`,
      `${location}·${npc.name}遇道士谈解咒。`,
      { silver: -randInt(200, 500), hp: 20, fateLuck: 5 }
    ),
  ],
  fast_cultivator: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的闭关室中修炼，仅用了三天就突破了一个小境界，令人惊叹。`,
      `${location}·${npc.name}三日突破小境界。`,
      { cultivationExp: 80, reputation: 10 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的论道大会上，凭借深厚的修为驳倒了多位前辈，一战成名。`,
      `${location}·${npc.name}论道大会成名。`,
      { reputation: 20, enlightenment: 8, spiritStones: randInt(50, 100) }
    ),
  ],
};

// ===== 情感状态标签剧情 =====
const emotionEvents = {
  in_love: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的花园中与心上人约会，两人情意绵绵，共度了美好时光。`,
      `${location}·${npc.name}与心上人约会。`,
      { hp: 20, charm: 2, favorWithPlayer: ctx?.isPlayer ? 15 : 0 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的首饰店中精心挑选了一份礼物，准备送给心上人。`,
      `${location}·${npc.name}为心上人买礼物。`,
      { silver: -randInt(50, 150), favorWithPlayer: ctx?.isPlayer ? 10 : 0 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}因为思念心上人而茶饭不思，整个人都憔悴了。`,
      `${location}·${npc.name}思念心上人憔悴。`,
      { hp: -15, willpower: 3 }
    ),
  ],
  heartbroken: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的酒馆中借酒消愁，喝得酩酊大醉，痛哭流涕。`,
      `${location}·${npc.name}借酒消愁。`,
      { hp: -20, silver: -randInt(30, 80), willpower: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到了前任，两人擦肩而过，谁也没有说话，${npc.name}的心在滴血。`,
      `${location}·${npc.name}遇前任心碎。`,
      { hp: -10, willpower: 8 }
    ),
  ],
  jealous: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}看到爱人和别人有说有笑，妒火中烧，上前大吵了一架。`,
      `${location}·${npc.name}因嫉妒吵架。`,
      { reputation: -5, favorWithPlayer: ctx?.isPlayer ? -10 : 0, hp: -5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}暗中跟踪爱人，想看看对方到底在和谁来往。`,
      `${location}·${npc.name}暗中跟踪爱人。`,
      { reputation: -3, enlightenment: 2 }
    ),
  ],
};

// ===== 修为特质标签剧情 =====
const cultivationEvents = {
  dao_heart: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的修炼中遭遇心魔，但凭借坚定的道心轻松破除，修为反而精进。`,
      `${location}·${npc.name}破心魔修为精进。`,
      { cultivationExp: 60, willpower: 10, enlightenment: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的论道中，以无瑕道心折服了众人，获得了前辈的指点。`,
      `${location}·${npc.name}道心折服众人获指点。`,
      { cultivationExp: 40, reputation: 10, enlightenment: 8 }
    ),
  ],
  bottleneck: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的闭关室中尝试突破，但瓶颈如山，始终无法越过，耗费了大量资源。`,
      `${location}·${npc.name}突破失败耗资源。`,
      { cultivationExp: -20, spiritStones: -randInt(30, 80), willpower: 5 }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}遇到一位高人，对方一语点破了${npc.name}修炼中的疑惑，瓶颈有所松动。`,
      `${location}·${npc.name}获高人点破瓶颈。`,
      { cultivationExp: 50, enlightenment: 10 }
    ),
  ],
  alchemy_genius: [
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的丹房中炼丹，一次就成功炼制出了一炉上品丹药，众人惊叹。`,
      `${location}·${npc.name}一炉炼成上品丹。`,
      { silver: randInt(100, 300), reputation: 10, item: '上品丹药' }
    ),
    (npc, location, ctx) => makeEvent(
      `${npc.name}在${location}的丹道大会上，凭借超凡的炼丹技艺夺得了头名。`,
      `${location}·${npc.name}丹道大会夺魁。`,
      { reputation: 20, spiritStones: randInt(50, 150), item: '丹道金牌' }
    ),
  ],
};

// 引入补充的标签剧情
const supp1 = require('./tagEventsSupplement');
const supp2 = require('./tagEventsSupplement2');
const supp3 = require('./tagEventsSupplement3');
const supp4 = require('./tagEventsSupplement4');
const supp5 = require('./tagEventsSupplement5');

// 合并所有标签剧情
const TAG_EVENTS = {
  ...bodyEvents,
  ...personalityEvents,
  ...backgroundEvents,
  ...destinyEvents,
  ...emotionEvents,
  ...cultivationEvents,
  ...supp1.bodyEvents,
  ...supp1.personalityEvents,
  ...supp2.backgroundEvents,
  ...supp2.specialEvents,
  ...supp3.emotionEvents,
  ...supp3.cultivationEvents,
  ...supp4.spiritualRootEvents,
  ...supp4.lustEvents,
  ...supp5.specialEvents2,
};

// ===== 通用标签剧情生成器 =====
// 为没有专门剧情的标签动态生成剧情
const { TAGS } = require('./tags');

function generateGenericTagEvent(tagId, npc, location, ctx = {}) {
  // 查找标签信息
  let tagInfo = null;
  let tagCategory = null;
  for (const cat in TAGS) {
    if (TAGS[cat][tagId]) {
      tagInfo = TAGS[cat][tagId];
      tagCategory = cat;
      break;
    }
  }
  if (!tagInfo) return null;

  const tagName = tagInfo.name || tagId;
  const tagDesc = tagInfo.desc || '';

  // 根据分类生成不同类型的剧情
  const templates = {
    body: [
      () => makeEvent(
        `${npc.name}在${location}的街头行走，${tagDesc}的特征引得路人纷纷侧目，有人羡慕有人嫉妒。`,
        `${location}·${npc.name}因${tagName}引起路人注意。`,
        { reputation: randInt(1, 5) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的集市上与人发生争执，对方被${npc.name}${tagName}的气势震慑，不敢再言。`,
        `${location}·${npc.name}以${tagName}震慑他人。`,
        { intimidation: randInt(2, 8), reputation: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的茶馆中休息，邻桌的人一直在议论${npc.name}的${tagName}，褒贬不一。`,
        `${location}·${npc.name}的${tagName}被人议论。`,
        { reputation: randInt(-3, 5) }
      ),
      () => makeEvent(
        `${npc.name}在${location}遇到一位相士，对方称${npc.name}的${tagName}预示着不凡的命运。`,
        `${location}·${npc.name}被相士称${tagName}主贵。`,
        { fateLuck: randInt(1, 5), reputation: 2 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的宴会上，${tagName}成为了众人关注的焦点，不少人主动前来结交。`,
        `${location}·${npc.name}因${tagName}成为宴会焦点。`,
        { reputation: randInt(3, 10), silver: randInt(10, 50) }
      ),
    ],
    personality: [
      () => makeEvent(
        `${npc.name}在${location}遇到一件棘手的事情，以${tagName}的性格从容应对，旁人叹服。`,
        `${location}·${npc.name}以${tagName}应对难题。`,
        { willpower: randInt(1, 5), reputation: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}与人交往时，${tagDesc}的处事方式让对方印象深刻。`,
        `${location}·${npc.name}的${tagName}性格让人印象深刻。`,
        { charm: randInt(1, 5), reputation: 2 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的酒馆中喝酒，${tagName}的性子引来了不少志同道合的朋友。`,
        `${location}·${npc.name}因${tagName}结识新朋友。`,
        { reputation: randInt(2, 8), silver: -randInt(5, 20) }
      ),
      () => makeEvent(
        `${npc.name}在${location}被人挑衅，但${tagName}的性格让${npc.name}选择了最恰当的应对方式。`,
        `${location}·${npc.name}以${tagName}应对挑衅。`,
        { willpower: randInt(2, 6), reputation: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}帮助了一位遇到困难的路人，${tagName}的善行得到了对方的感激。`,
        `${location}·${npc.name}因${tagName}帮助他人。`,
        { karma: randInt(1, 5), reputation: randInt(2, 6) }
      ),
    ],
    background: [
      () => makeEvent(
        `${npc.name}在${location}遇到一位故人，对方认出了${npc.name}${tagDesc}的身份，态度大变。`,
        `${location}·${npc.name}的${tagName}身份被认出。`,
        { reputation: randInt(-5, 10) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的官府办事，${tagName}的背景让办事效率大大提高。`,
        `${location}·${npc.name}因${tagName}背景办事顺利。`,
        { reputation: randInt(2, 8), silver: randInt(10, 50) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的商会中，${tagDesc}的来历让商人们另眼相看，给予了不少优惠。`,
        `${location}·${npc.name}因${tagName}获得商人优待。`,
        { silver: randInt(20, 100), reputation: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}被人问及身世，${tagName}的过去让听者唏嘘不已。`,
        `${location}·${npc.name}的${tagName}身世令人唏嘘。`,
        { willpower: randInt(1, 5), reputation: 2 }
      ),
      () => makeEvent(
        `${npc.name}在${location}遇到一位与${tagName}背景相关的人物，双方相谈甚欢。`,
        `${location}·${npc.name}遇到${tagName}相关人物。`,
        { reputation: randInt(3, 8), charm: 2 }
      ),
    ],
    destiny: [
      () => makeEvent(
        `${npc.name}在${location}遭遇了一场意外，但${tagName}的命运让${npc.name}化险为夷。`,
        `${location}·${npc.name}因${tagName}化险为夷。`,
        { fateLuck: randInt(2, 8), hp: randInt(-10, 20) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的寺庙中求签，签文印证了${tagDesc}的命运，${npc.name}感慨万千。`,
        `${location}·${npc.name}求签印证${tagName}命运。`,
        { enlightenment: randInt(1, 5), willpower: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}遇到一位神秘老者，对方预言了${npc.name}${tagName}的未来。`,
        `${location}·${npc.name}被老者预言${tagName}未来。`,
        { fateLuck: randInt(1, 6), enlightenment: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的修炼中，${tagName}的命格让${npc.name}对天道有了更深的领悟。`,
        `${location}·${npc.name}因${tagName}领悟天道。`,
        { cultivationExp: randInt(20, 60), enlightenment: randInt(2, 8) }
      ),
      () => makeEvent(
        `${npc.name}在${location}捡到了一件奇异的物品，似乎与${tagName}的命运有着某种联系。`,
        `${location}·${npc.name}捡到与${tagName}相关的物品。`,
        { fateLuck: randInt(3, 10), item: '奇异物品' }
      ),
    ],
    emotion: [
      () => makeEvent(
        `${npc.name}在${location}独自漫步，${tagDesc}的心情让${npc.name}对周围的事物有了不同的感受。`,
        `${location}·${npc.name}因${tagName}心情感慨。`,
        { enlightenment: randInt(1, 4), willpower: 2 }
      ),
      () => makeEvent(
        `${npc.name}在${location}遇到一位故人，${tagName}的情感让${npc.name}的态度与往常不同。`,
        `${location}·${npc.name}因${tagName}对故人态度不同。`,
        { charm: randInt(1, 5), reputation: 2 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的酒馆中借酒消愁，${tagName}的情绪让${npc.name}喝了不少酒。`,
        `${location}·${npc.name}因${tagName}借酒消愁。`,
        { silver: -randInt(10, 30), hp: -randInt(5, 15) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的花园中赏花，${tagName}的心境让${npc.name}感受到了难得的宁静。`,
        `${location}·${npc.name}因${tagName}心境宁静。`,
        { mp: randInt(10, 30), enlightenment: randInt(1, 3) }
      ),
      () => makeEvent(
        `${npc.name}在${location}与人发生了一段情感纠葛，${tagName}的状态让事情变得复杂。`,
        `${location}·${npc.name}因${tagName}陷入情感纠葛。`,
        { reputation: randInt(-5, 5), charm: randInt(1, 5) }
      ),
    ],
    cultivation: [
      () => makeEvent(
        `${npc.name}在${location}的修炼中，${tagDesc}的特质让${npc.name}的修炼效率大大提升。`,
        `${location}·${npc.name}因${tagName}修炼效率提升。`,
        { cultivationExp: randInt(20, 80), mp: randInt(10, 30) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的论道大会上，${tagName}的修为特质让众人刮目相看。`,
        `${location}·${npc.name}因${tagName}在论道中出彩。`,
        { reputation: randInt(5, 15), enlightenment: randInt(2, 8) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的秘境中探索，${tagName}的能力让${npc.name}发现了隐藏的宝物。`,
        `${location}·${npc.name}因${tagName}发现宝物。`,
        { spiritStone: randInt(20, 100), item: '天材地宝' }
      ),
      () => makeEvent(
        `${npc.name}在${location}与他人切磋，${tagName}的修为特点让${npc.name}占据了上风。`,
        `${location}·${npc.name}因${tagName}切磋获胜。`,
        { combatExp: randInt(10, 30), reputation: randInt(3, 10) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的闭关中，${tagName}的体质让${npc.name}突破了长久以来的瓶颈。`,
        `${location}·${npc.name}因${tagName}突破瓶颈。`,
        { cultivationExp: randInt(50, 150), enlightenment: randInt(3, 10) }
      ),
    ],
    lust: [
      () => makeEvent(
        `${npc.name}在${location}的青楼中，${tagDesc}的特质让${npc.name}成为了最受欢迎的客人。`,
        `${location}·${npc.name}因${tagName}在青楼受欢迎。`,
        { silver: -randInt(50, 200), charm: randInt(2, 8), reputation: randInt(-5, 5) }
      ),
      () => makeEvent(
        `${npc.name}在${location}遇到一位${npc.gender === '女' ? '俊朗公子' : '美貌女子'}，${tagName}的特质让对方对${npc.name}心生好感。`,
        `${location}·${npc.name}因${tagName}获得${npc.gender === '女' ? '俊才' : '美人'}青睐。`,
        { charm: randInt(3, 10), reputation: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}的宴会上，${tagName}的风情让在场的男女都为之倾倒。`,
        `${location}·${npc.name}因${tagName}倾倒众人。`,
        { charm: randInt(5, 15), reputation: randInt(-3, 8) }
      ),
      () => makeEvent(
        `${npc.name}在${location}的闺房中与人缠绵，${tagDesc}的能力让对方欲仙欲死。`,
        `${location}·${npc.name}因${tagName}床笫间得趣。`,
        { hp: randInt(-5, 10), mp: randInt(-10, 20), charm: 3 }
      ),
      () => makeEvent(
        `${npc.name}在${location}被人议论${tagName}的风流韵事，有人羡慕有人不齿。`,
        `${location}·${npc.name}的${tagName}韵事被人议论。`,
        { reputation: randInt(-8, 5), charm: randInt(1, 5) }
      ),
    ],
  };

  const categoryTemplates = templates[tagCategory] || templates.body;
  const eventFn = randChoice(categoryTemplates);
  return eventFn();
}

// 根据标签获取随机剧情（优先使用专门剧情，否则使用通用生成器）
function getTagEvent(tagId, npc, location, ctx = {}) {
  const events = TAG_EVENTS[tagId];
  if (events && events.length > 0) {
    const eventFn = randChoice(events);
    if (typeof eventFn === 'function') {
      return eventFn(npc, location, ctx);
    }
    return eventFn;
  }
  // 使用通用生成器
  return generateGenericTagEvent(tagId, npc, location, ctx);
}

// 检查NPC是否有某个标签
function hasTag(npc, tagId) {
  return npc.tags && npc.tags.includes(tagId);
}

// 为NPC触发标签相关的随机剧情（返回单个事件对象或null）
function triggerTagEvents(npc, location, ctx = {}) {
  if (!npc.tags || npc.tags.length === 0) return null;

  // 随机选择一个标签触发
  const tagId = randChoice(npc.tags);
  if (chance(15)) {
    const event = getTagEvent(tagId, npc, location, ctx);
    if (event) {
      // 应用事件效果到NPC
      if (event.effects) {
        applyEventEffects(npc, event.effects);
      }
      return { tagId, ...event };
    }
  }
  return null;
}

// 应用事件效果到人物
function applyEventEffects(entity, effects) {
  if (!effects) return;
  for (const [key, value] of Object.entries(effects)) {
    if (key === 'silver') {
      entity.silver = Math.max(0, (entity.silver || 0) + value);
    } else if (key === 'spiritStones' || key === 'spiritStone') {
      entity.spiritStones = Math.max(0, (entity.spiritStones || 0) + value);
    } else if (key === 'hp') {
      if (!entity.hp) entity.hp = { max: 100, current: 100 };
      entity.hp.current = Math.max(0, Math.min(entity.hp.max, entity.hp.current + value));
    } else if (key === 'spirit') {
      if (!entity.mp) entity.mp = { max: 50, current: 50 };
      entity.mp.current = Math.max(0, Math.min(entity.mp.max, entity.mp.current + value));
    } else if (key === 'cultivationExp') {
      entity.cultivationExp = (entity.cultivationExp || 0) + value;
    } else if (key === 'reputation') {
      entity.reputation = (entity.reputation || 0) + value;
    } else if (key === 'karma') {
      entity.karma = (entity.karma || 0) + value;
    } else if (key === 'fateLuck') {
      entity.fateLuck = (entity.fateLuck || 0) + value;
    } else if (key === 'charm') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.charm = (entity.attributes.charm || 0) + value;
    } else if (key === 'intelligence') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.intelligence = (entity.attributes.intelligence || 0) + value;
    } else if (key === 'strength') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.strength = (entity.attributes.strength || 0) + value;
    } else if (key === 'willpower') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.willpower = (entity.attributes.willpower || 0) + value;
    } else if (key === 'agility') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.agility = (entity.attributes.agility || 0) + value;
    } else if (key === 'perception') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.perception = (entity.attributes.perception || 0) + value;
    } else if (key === 'intimidation') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.intimidation = (entity.attributes.intimidation || 0) + value;
    } else if (key === 'mystery') {
      if (!entity.attributes) entity.attributes = {};
      entity.attributes.mystery = (entity.attributes.mystery || 0) + value;
    } else if (key === 'enlightenment') {
      entity.enlightenment = (entity.enlightenment || 0) + value;
    } else if (key === 'combatExp') {
      entity.combatExp = (entity.combatExp || 0) + value;
    } else if (key === 'alchemyExp') {
      entity.alchemyExp = (entity.alchemyExp || 0) + value;
    } else if (key === 'forgeExp') {
      entity.forgeExp = (entity.forgeExp || 0) + value;
    } else if (key === 'formationExp') {
      entity.formationExp = (entity.formationExp || 0) + value;
    }
  }
}

module.exports = {
  TAG_EVENTS,
  getTagEvent,
  hasTag,
  triggerTagEvents,
  generateGenericTagEvent,
};
