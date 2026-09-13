// 标签随机剧情库（补充4）- 灵根标签、情色相关标签
const { randChoice, randInt, chance } = require('../engine/utils');

function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

// ===== 灵根标签 =====
const spiritualRootEvents = {
  spiritual_root_top: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，天灵根的优势尽显，修炼速度远超常人。`, `${l}·${n.name}天灵根修炼快。`, { cultivationExp: randInt(30, 60), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的宗门大比中，凭借天灵根的优势，轻松获得了第一名。`, `${l}·${n.name}宗门大比第一。`, { reputation: 15, spiritStones: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}被一位宗门长老看中，想要收为亲传弟子。`, `${l}·${n.name}被长老看中收徒。`, { cultivationExp: randInt(40, 80), reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，突破瓶颈如同喝水一般简单。`, `${l}·${n.name}突破瓶颈简单。`, { cultivationExp: randInt(25, 50), fateLuck: 5 }),
  ],
  spiritual_root_none: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，因为没有灵根，无法吸收灵气，只能另辟蹊径。`, `${l}·${n.name}无灵根无法修炼。`, { willpower: 5, cultivationExp: randInt(5, 10) }),
    (n, l) => makeEvent(`${n.name}在${l}的体修中，虽然没有灵根，但肉身修炼得异常强悍。`, `${l}·${n.name}无灵根修体。`, { hp: 30, strength: 5, combatExp: 15 }),
    (n, l) => makeEvent(`${n.name}在${l}的被人嘲笑没有灵根，但${n.name}用实力证明了自己。`, `${l}·${n.name}被嘲笑无灵根。`, { willpower: 10, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的奇遇中，得到了一种可以后天培育灵根的秘法。`, `${l}·${n.name}得培育灵根秘法。`, { mystery: 10, fateLuck: 10 }),
  ],
  spiritual_root_mixed: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，杂灵根虽然修炼慢，但属性全面，适应性强。`, `${l}·${n.name}杂灵根适应性强。`, { cultivationExp: randInt(10, 20), intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，凭借多种属性的法术，让对手防不胜防。`, `${l}·${n.name}杂灵根多属性战斗。`, { combatExp: 15, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，找到了适合杂灵根的修炼方法。`, `${l}·${n.name}找到杂灵根修炼法。`, { cultivationExp: randInt(15, 30), intelligence: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的炼丹中，杂灵根对多种药材的适应性让${n.name}事半功倍。`, `${l}·${n.name}杂灵根炼丹有优势。`, { alchemyExp: 15, cultivationExp: randInt(10, 20) }),
  ],
  spiritual_root_dual: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，双灵根相辅相成，修炼速度不慢。`, `${l}·${n.name}双灵根修炼。`, { cultivationExp: randInt(20, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，两种属性的法术配合，威力大增。`, `${l}·${n.name}双灵根法术配合。`, { combatExp: 20, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，两种属性达到了平衡，突破了瓶颈。`, `${l}·${n.name}双灵根平衡突破。`, { cultivationExp: randInt(25, 50), enlightenment: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的宗门中，双灵根的资质被重点培养。`, `${l}·${n.name}双灵根被重点培养。`, { cultivationExp: randInt(20, 40), spiritStones: randInt(20, 50) }),
  ],
  spiritual_root_triple: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，三灵根虽然不如单灵根，但胜在属性多样。`, `${l}·${n.name}三灵根属性多样。`, { cultivationExp: randInt(15, 30), intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的阵法学习中，三灵根对多种属性的理解让${n.name}进步很快。`, `${l}·${n.name}三灵根学阵法快。`, { formationExp: 15, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，三种属性的法术轮番使用，让对手疲于应对。`, `${l}·${n.name}三灵根法术轮番使用。`, { combatExp: 15, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，找到了三灵根的平衡之法，修为大进。`, `${l}·${n.name}三灵根平衡之法。`, { cultivationExp: randInt(20, 40), enlightenment: 5 }),
  ],
  spiritual_root_single: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，单灵根属性纯粹，修炼速度极快。`, `${l}·${n.name}单灵根修炼快。`, { cultivationExp: randInt(25, 50), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，单一属性的法术威力巨大。`, `${l}·${n.name}单灵根法术威力大。`, { combatExp: 20, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的宗门中，单灵根的资质被视为天才。`, `${l}·${n.name}单灵根被视为天才。`, { reputation: 10, spiritStones: randInt(30, 80) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，对单一属性的理解越来越深，突破了瓶颈。`, `${l}·${n.name}单灵根理解加深突破。`, { cultivationExp: randInt(30, 60), enlightenment: 5 }),
  ],
  mutated_spiritual_root: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，变异灵根展现出了奇异的能力，让周围人惊叹。`, `${l}·${n.name}变异灵根显奇异能力。`, { cultivationExp: randInt(30, 60), mystery: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，变异灵根的特殊属性让对手措手不及。`, `${l}·${n.name}变异灵根战斗出奇。`, { combatExp: 25, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的宗门中，变异灵根被视为百年难遇的奇才。`, `${l}·${n.name}变异灵根被视为奇才。`, { reputation: 15, spiritStones: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，变异灵根的潜力逐渐觉醒，修为突飞猛进。`, `${l}·${n.name}变异灵根潜力觉醒。`, { cultivationExp: randInt(40, 80), fateLuck: 10 }),
  ],
};

// ===== 情色相关标签 =====
const lustEvents = {
  nymphomaniac: [
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，流连忘返，一夜数度春宵。`, `${l}·${n.name}青楼流连忘返。`, { silver: -randInt(100, 300), hp: -20, spirit: -30 }),
    (n, l) => makeEvent(`${n.name}在${l}的街头看到一位俊男，忍不住上前勾搭，两人共度良宵。`, `${l}·${n.name}勾搭俊男共度良宵。`, { hp: -15, spirit: -25, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与多位宾客调笑，最后带了一位回房。`, `${l}·${n.name}宴会带人回房。`, { hp: -20, spirit: -30, reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}因为纵欲过度，身体有些吃不消，被医生告诫要节制。`, `${l}·${n.name}纵欲过度被告诫。`, { hp: -25, spirit: -40 }),
  ],
  satyriasis: [
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，一夜数女，精力旺盛得让人惊叹。`, `${l}·${n.name}青楼一夜数女。`, { silver: -randInt(150, 400), hp: -20, spirit: -30 }),
    (n, l) => makeEvent(`${n.name}在${l}的街头看到一位美女，忍不住上前调戏，被对方扇了一巴掌。`, `${l}·${n.name}调戏美女被扇巴掌。`, { hp: -5, reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与一位看对眼的女客共度良宵。`, `${l}·${n.name}宴会与女客共度良宵。`, { hp: -15, spirit: -25 }),
    (n, l) => makeEvent(`${n.name}在${l}因为纵欲过度，腰膝酸软，不得不休息几天。`, `${l}·${n.name}纵欲过度腰膝酸软。`, { hp: -25, spirit: -40 }),
  ],
  seductive: [
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，一个眼神就让在场的男性神魂颠倒。`, `${l}·${n.name}媚眼勾魂。`, { charm: 5, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的谈判中，凭借狐媚之术，让对方答应了苛刻的条件。`, `${l}·${n.name}狐媚之术谈判成功。`, { silver: randInt(100, 300), charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的街头，引得路人频频回头，甚至有人撞在了柱子上。`, `${l}·${n.name}街头引人撞柱。`, { charm: 3, reputation: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的权贵面前，施展媚术，获得了不少好处。`, `${l}·${n.name}媚术获权贵好处。`, { silver: randInt(100, 300), spiritStones: randInt(10, 30) }),
  ],
  voluptuous: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，丰满的身材引得路人频频侧目。`, `${l}·${n.name}身材引人侧目。`, { charm: 3, reputation: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，凭借丰乳肥臀成为了头牌。`, `${l}·${n.name}青楼头牌。`, { silver: randInt(200, 500), charm: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，成为了全场男性关注的焦点。`, `${l}·${n.name}宴会焦点。`, { charm: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}被一位富甲看中，想要纳为妾室，承诺重金聘礼。`, `${l}·${n.name}被富甲看中纳妾。`, { silver: randInt(300, 800) }),
  ],
  handsome_devil: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，邪魅的笑容让无数少女心醉。`, `${l}·${n.name}邪魅笑容迷倒少女。`, { charm: 5, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，凭借邪魅狂狷的气质，迷倒了不少贵女。`, `${l}·${n.name}宴会迷倒贵女。`, { charm: 5, silver: randInt(100, 300) }),
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，成为了最受欢迎的客人。`, `${l}·${n.name}青楼受欢迎。`, { charm: 3, silver: -randInt(100, 200) }),
    (n, l) => makeEvent(`${n.name}在${l}的与一位有夫之妇勾搭，差点被其丈夫发现。`, `${l}·${n.name}勾搭有夫之妇。`, { charm: 3, reputation: -5, hp: -10 }),
  ],
  romantic: [
    (n, l) => makeEvent(`${n.name}在${l}的月下，为心上人吟诗一首，对方感动不已。`, `${l}·${n.name}月下吟诗感动心上人。`, { charm: 5, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的花田中，与爱人漫步，浪漫无比。`, `${l}·${n.name}花田漫步。`, { charm: 3, hp: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，一首情诗惊艳全场，获得了不少倾慕者的青睐。`, `${l}·${n.name}情诗惊艳全场。`, { charm: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的精心准备下，给了爱人一个浪漫的惊喜。`, `${l}·${n.name}给爱人浪漫惊喜。`, { silver: -randInt(50, 150), charm: 5 }),
  ],
  promiscuous: [
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，与多位客人周旋，来者不拒。`, `${l}·${n.name}青楼来者不拒。`, { silver: randInt(100, 300), hp: -20, spirit: -30, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的街头，与一位陌生人看对眼，直接去了旅馆。`, `${l}·${n.name}街头与陌生人去旅馆。`, { hp: -15, spirit: -25, reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与多位宾客发生了关系，名声大损。`, `${l}·${n.name}宴会多人关系。`, { hp: -25, spirit: -40, reputation: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}因为私生活混乱，染上了疾病，不得不求医。`, `${l}·${n.name}私生活混乱染病。`, { hp: -30, silver: -randInt(50, 150), reputation: -10 }),
  ],
  cuckold: [
    (n, l) => makeEvent(n.gender === '女' ? `${n.name}在${l}的丈夫与别人私通，${n.name}不仅不生气，反而觉得兴奋。` : `${n.name}在${l}的妻子与别人私通，${n.name}不仅不生气，反而觉得兴奋。`, `${l}·${n.name}配偶私通反觉兴奋。`, { charm: -5, reputation: -10, spirit: 10 }),
    (n, l) => makeEvent(n.gender === '女' ? `${n.name}在${l}的主动安排丈夫与别人幽会，自己在一旁观看。` : `${n.name}在${l}的主动安排妻子与别人幽会，自己在一旁观看。`, `${l}·${n.name}安排配偶幽会旁观。`, { reputation: -15, spirit: 15 }),
    (n, l) => makeEvent(n.gender === '女' ? `${n.name}在${l}的与丈夫和情妇一起，三人共度良宵。` : `${n.name}在${l}的与妻子和情夫一起，三人共度良宵。`, `${l}·${n.name}三人共度良宵。`, { hp: -20, spirit: -30, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的癖好被人发现，成为了众人的笑柄。`, `${l}·${n.name}癖好被发现成笑柄。`, { reputation: -20, willpower: 5 }),
  ],
  masochist: [
    (n, l) => makeEvent(`${n.name}在${l}的被主人惩罚，不仅不痛苦，反而觉得愉悦。`, `${l}·${n.name}受罚反觉愉悦。`, { hp: -10, spirit: 10, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的主动请求主人惩罚自己，获得了满足。`, `${l}·${n.name}主动请求受罚。`, { hp: -15, spirit: 15 }),
    (n, l) => makeEvent(`${n.name}在${l}的与爱人玩起了虐恋游戏，乐在其中。`, `${l}·${n.name}虐恋游戏。`, { hp: -20, spirit: -20, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的受虐倾向被爱人发现，对方有些惊讶但也接受了。`, `${l}·${n.name}受虐倾向被爱人接受。`, { charm: 3, willpower: 3 }),
  ],
  sadist: [
    (n, l) => makeEvent(`${n.name}在${l}的惩罚仆人，看到对方痛苦的表情，${n.name}感到愉悦。`, `${l}·${n.name}惩罚仆人感愉悦。`, { hp: -10, intimidation: 5, reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的与爱人玩起了施虐游戏，对方很享受。`, `${l}·${n.name}施虐游戏。`, { hp: -15, spirit: -15, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，看到对手流血，感到一阵兴奋。`, `${l}·${n.name}战斗见血兴奋。`, { combatExp: 15, intimidation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的施虐倾向被人发现，周围人都有些害怕${n.name}。`, `${l}·${n.name}施虐倾向被人害怕。`, { intimidation: 10, reputation: -5 }),
  ],
  bisexual: [
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与男女宾客都调笑，来者不拒。`, `${l}·${n.name}宴会男女通吃。`, { charm: 3, hp: -15, spirit: -20 }),
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，既找了姑娘也找了小倌。`, `${l}·${n.name}青楼男女都找。`, { silver: -randInt(100, 250), hp: -20, spirit: -30 }),
    (n, l) => makeEvent(`${n.name}在${l}的与一位同性好友发生了关系，两人关系变得微妙。`, `${l}·${n.name}与同性好友发生关系。`, { charm: 3, reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的双性恋倾向被爱人发现，对方有些惊讶但也接受了。`, `${l}·${n.name}双性恋被爱人接受。`, { charm: 3, willpower: 3 }),
  ],
  incestuous: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，与亲属发生了不伦关系，事后既后悔又刺激。`, `${l}·${n.name}与亲属不伦关系。`, { hp: -15, spirit: -25, karma: -20, reputation: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}的与亲属的不伦关系被人发现，成为了众人的笑柄。`, `${l}·${n.name}不伦关系被发现。`, { reputation: -30, karma: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}的与亲属的不伦关系持续了很久，两人都深陷其中。`, `${l}·${n.name}不伦关系持续。`, { hp: -20, spirit: -30, karma: -25 }),
    (n, l) => makeEvent(`${n.name}在${l}的终于下定决心结束不伦关系，但心中仍有不舍。`, `${l}·${n.name}决心结束不伦关系。`, { willpower: 10, karma: 5 }),
  ],
  exhibitionist: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，在空旷的地方暴露身体，感到一阵刺激。`, `${l}·${n.name}深夜暴露身体。`, { spirit: 15, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会中，故意走光，引得众人侧目。`, `${l}·${n.name}宴会故意走光。`, { charm: 3, reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}的暴露癖被人发现，报了官，${n.name}被罚了款。`, `${l}·${n.name}暴露癖被发现罚款。`, { silver: -randInt(50, 150), reputation: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}的与爱人玩起了暴露游戏，两人都很兴奋。`, `${l}·${n.name}暴露游戏。`, { hp: -10, spirit: -15, charm: 3 }),
  ],
  voyeur: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，偷偷窥视别人的闺房，感到一阵刺激。`, `${l}·${n.name}深夜窥视闺房。`, { spirit: 15, reputation: -10, agility: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的偷窥时被人发现，差点被打一顿。`, `${l}·${n.name}偷窥被发现。`, { hp: -20, reputation: -15, agility: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的偷窥中，看到了一些不该看的东西，被人追杀。`, `${l}·${n.name}偷窥被追杀。`, { hp: -25, agility: 10, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的与爱人玩起了偷窥游戏，两人都很兴奋。`, `${l}·${n.name}偷窥游戏。`, { hp: -10, spirit: -15, charm: 3 }),
  ],
  dual_cultivation_body: [
    (n, l) => makeEvent(`${n.name}在${l}的双修中，双修圣体的优势尽显，双方修为都大进。`, `${l}·${n.name}双修圣体修为大进。`, { cultivationExp: randInt(40, 80), hp: -15, spirit: -25 }),
    (n, l) => makeEvent(`${n.name}在${l}的被一位修士看中，想要与其双修，承诺重金。`, `${l}·${n.name}被修士看中求双修。`, { silver: randInt(200, 500), spiritStones: randInt(30, 80) }),
    (n, l) => makeEvent(`${n.name}在${l}的双修中，与伴侣的感情更加深厚，修为也突飞猛进。`, `${l}·${n.name}双修感情修为双进。`, { cultivationExp: randInt(30, 60), charm: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，双修圣体让${n.name}的修炼速度远超常人。`, `${l}·${n.name}双修圣体修炼快。`, { cultivationExp: randInt(25, 50), fateLuck: 5 }),
  ],
  yin_body: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，纯阴之体让${n.name}对阴属性灵气的吸收远超常人。`, `${l}·${n.name}纯阴之体修炼快。`, { cultivationExp: randInt(30, 60), spirit: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}的被一位阳属性修士看中，想要与其双修互补。`, `${l}·${n.name}被阳属性修士求双修。`, { cultivationExp: randInt(40, 80), silver: randInt(200, 500) }),
    (n, l) => makeEvent(`${n.name}在${l}的纯阴之体在阴属性阵法中，修炼速度倍增。`, `${l}·${n.name}纯阴之体阵法修炼。`, { cultivationExp: randInt(35, 70), spirit: 25 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，纯阴之体的潜力逐渐觉醒，修为大进。`, `${l}·${n.name}纯阴之体潜力觉醒。`, { cultivationExp: randInt(40, 80), fateLuck: 10 }),
  ],
  yang_body: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，纯阳之体让${n.name}对阳属性灵气的吸收远超常人。`, `${l}·${n.name}纯阳之体修炼快。`, { cultivationExp: randInt(30, 60), hp: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}的被一位阴属性修士看中，想要与其双修互补。`, `${l}·${n.name}被阴属性修士求双修。`, { cultivationExp: randInt(40, 80), silver: randInt(200, 500) }),
    (n, l) => makeEvent(`${n.name}在${l}的纯阳之体在阳属性阵法中，修炼速度倍增。`, `${l}·${n.name}纯阳之体阵法修炼。`, { cultivationExp: randInt(35, 70), hp: 25 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，纯阳之体的潜力逐渐觉醒，修为大进。`, `${l}·${n.name}纯阳之体潜力觉醒。`, { cultivationExp: randInt(40, 80), fateLuck: 10 }),
  ],
  lustful_dao: [
    (n, l) => makeEvent(`${n.name}在${l}的双修中，以欲入道，修为突飞猛进。`, `${l}·${n.name}以欲入道修为猛进。`, { cultivationExp: randInt(40, 80), hp: -20, spirit: -30 }),
    (n, l) => makeEvent(`${n.name}在${l}的被同道中人称为欲道修士，名声远扬。`, `${l}·${n.name}欲道修士名声远扬。`, { reputation: 10, charm: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，将情欲转化为修为，突破了瓶颈。`, `${l}·${n.name}情欲化修为突破。`, { cultivationExp: randInt(35, 70), enlightenment: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的以欲入道的修炼方式被正统修士所不齿，但${n.name}不在乎。`, `${l}·${n.name}以欲入道被不齿。`, { reputation: -5, willpower: 5 }),
  ],
  frigid: [
    (n, l) => makeEvent(`${n.name}在${l}的爱人求欢时，${n.name}毫无兴趣，拒绝了对方。`, `${l}·${n.name}拒绝爱人求欢。`, { charm: -3, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的被人调戏时，毫无反应，让对方觉得无趣。`, `${l}·${n.name}被调戏毫无反应。`, { charm: -2, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的性冷淡让爱人有些不满，两人因此吵了一架。`, `${l}·${n.name}性冷淡与爱人吵架。`, { charm: -5, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的医生建议下，开始调理身体，希望能改善。`, `${l}·${n.name}医生建议调理。`, { hp: 10, silver: -randInt(30, 80) }),
  ],
};

module.exports = {
  spiritualRootEvents,
  lustEvents,
};
