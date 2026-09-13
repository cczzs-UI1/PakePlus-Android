// 标签随机剧情库（补充3）- 情感状态、修为特质、情色相关标签
const { randChoice, randInt, chance } = require('../engine/utils');

function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

// ===== 情感状态标签 =====
const emotionEvents = {
  love_rival: [
    (n, l) => makeEvent(`${n.name}在${l}看到情敌与心上人在一起，心中一阵酸楚。`, `${l}·${n.name}见情敌与心上人一起。`, { willpower: 3, charm: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与情敌明争暗斗，谁也不肯让步。`, `${l}·${n.name}与情敌明争暗斗。`, { reputation: -3, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}暗中调查情敌的底细，想要找到对方的弱点。`, `${l}·${n.name}暗中调查情敌。`, { intelligence: 3, mystery: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，与情敌大打出手，两败俱伤。`, `${l}·${n.name}与情敌比武两败俱伤。`, { hp: -30, reputation: 5 }),
  ],
  jealous_love: [
    (n, l) => makeEvent(`${n.name}在${l}看到爱人和别人说笑，醋意大发，当场就发了脾气。`, `${l}·${n.name}吃醋发脾气。`, { charm: -3, willpower: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}的背后，偷偷调查爱人的行踪，生怕对方出轨。`, `${l}·${n.name}偷偷调查爱人行踪。`, { mystery: 3, intelligence: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}因为嫉妒，和爱人大吵了一架，两人冷战了好几天。`, `${l}·${n.name}因嫉妒与爱人吵架。`, { charm: -5, willpower: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友劝说下，终于意识到自己的嫉妒心太重，向爱人道了歉。`, `${l}·${n.name}意识到嫉妒心重道歉。`, { charm: 3, willpower: 5 }),
  ],
  unrequited: [
    (n, l) => makeEvent(`${n.name}在${l}的角落里，默默看着心上人，心中满是苦涩。`, `${l}·${n.name}默默看着心上人。`, { willpower: 3, charm: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}的节日里，精心准备了礼物，却始终没有勇气送出去。`, `${l}·${n.name}准备礼物没勇气送出。`, { silver: -randInt(20, 50), willpower: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}的梦中，与心上人共度良宵，醒来后才发现是一场空。`, `${l}·${n.name}梦中心上人。`, { spirit: -10, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}终于鼓起勇气表白，却被对方婉拒，伤心了好久。`, `${l}·${n.name}表白被拒。`, { charm: -5, willpower: 5, hp: -10 }),
  ],
  married: [
    (n, l) => makeEvent(`${n.name}在${l}的家中，与配偶一起做饭，其乐融融。`, `${l}·${n.name}与配偶一起做饭。`, { charm: 3, hp: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的纪念日，给配偶准备了惊喜，对方非常感动。`, `${l}·${n.name}纪念日给配偶惊喜。`, { silver: -randInt(50, 150), charm: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}与配偶因为小事吵架，不过很快就和好了。`, `${l}·${n.name}与配偶吵架又和好。`, { charm: -2, willpower: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的配偶生病了，${n.name}悉心照料，终于康复。`, `${l}·${n.name}照料生病配偶。`, { karma: 5, hp: -10 }),
  ],
  widowed: [
    (n, l) => makeEvent(`${n.name}在${l}的忌日，来到配偶的坟前，默默流泪。`, `${l}·${n.name}配偶坟前流泪。`, { willpower: 5, hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的深夜，梦到了已故的配偶，醒来后怅然若失。`, `${l}·${n.name}梦到已故配偶。`, { spirit: -15, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的亲友劝说下，终于决定开始新的生活。`, `${l}·${n.name}决定开始新生活。`, { willpower: 5, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}整理配偶的遗物，发现了一封未寄出的信，感动不已。`, `${l}·${n.name}发现配偶未寄出的信。`, { willpower: 5, charm: 3 }),
  ],
  divorced: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，遇到了前夫/妻，两人尴尬地打了个招呼。`, `${l}·${n.name}街头遇到前夫/妻。`, { charm: -2, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友聚会上，被人问起离婚的原因，${n.name}只是苦笑。`, `${l}·${n.name}被问离婚原因苦笑。`, { reputation: -3, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的新生活中，逐渐走出了离婚的阴影。`, `${l}·${n.name}走出离婚阴影。`, { charm: 3, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的财产分割中，与前配偶闹得很不愉快。`, `${l}·${n.name}财产分割不愉快。`, { silver: -randInt(50, 200), reputation: -5 }),
  ],
  engaged: [
    (n, l) => makeEvent(`${n.name}在${l}的筹备婚礼，忙得不可开交，但心里很幸福。`, `${l}·${n.name}筹备婚礼。`, { silver: -randInt(100, 300), charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的试穿礼服，未婚夫/妻看得眼睛都直了。`, `${l}·${n.name}试穿礼服。`, { charm: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的婚前检查中，一切正常，两人都松了口气。`, `${l}·${n.name}婚前检查正常。`, { hp: 10, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的单身派对上，和朋友们玩得很开心。`, `${l}·${n.name}单身派对开心。`, { hp: -10, charm: 3 }),
  ],
  secret_lover: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，偷偷与情人幽会，生怕被人发现。`, `${l}·${n.name}深夜偷会情人。`, { charm: 3, mystery: 5, hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的集市上，与情人擦肩而过，假装不认识。`, `${l}·${n.name}集市与情人假装不认识。`, { mystery: 3, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的旅馆中，与情人共度良宵，却差点被熟人撞见。`, `${l}·${n.name}旅馆幽会差点被撞见。`, { mystery: 5, hp: -15, spirit: -20 }),
    (n, l) => makeEvent(`${n.name}在${l}的情人送给${n.name}一件定情信物，${n.name}小心收藏。`, `${l}·${n.name}收到情人定情信物。`, { charm: 5, mystery: 3 }),
  ],
  betrayed: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，回想起被背叛的经历，恨得咬牙切齿。`, `${l}·${n.name}深夜回想被背叛。`, { willpower: 5, karma: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了曾经背叛自己的人，双方都很尴尬。`, `${l}·${n.name}遇到背叛者。`, { charm: -3, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友劝说下，终于放下了仇恨，开始新生活。`, `${l}·${n.name}放下仇恨。`, { karma: 5, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的暗中策划，想要让背叛者付出代价。`, `${l}·${n.name}策划报复背叛者。`, { intelligence: 3, karma: -5 }),
  ],
  grateful: [
    (n, l) => makeEvent(`${n.name}在${l}的恩人遇到困难时，毫不犹豫地伸出援手。`, `${l}·${n.name}帮助恩人。`, { karma: 10, silver: -randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的节日里，特意准备了厚礼去拜访恩人。`, `${l}·${n.name}节日拜访恩人。`, { silver: -randInt(50, 150), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的公开场合，向恩人表达了感激之情。`, `${l}·${n.name}公开感谢恩人。`, { reputation: 5, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的恩人生病时，日夜守护在床边。`, `${l}·${n.name}守护生病恩人。`, { karma: 10, hp: -10 }),
  ],
  vengeful_love: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，回想起因爱生恨的经历，眼中闪过一丝狠厉。`, `${l}·${n.name}因爱生恨。`, { karma: -5, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到了曾经的爱人，双方剑拔弩张。`, `${l}·${n.name}遇到旧爱剑拔弩张。`, { charm: -5, intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的暗中操作，让旧爱的生意受到了损失。`, `${l}·${n.name}暗中报复旧爱。`, { karma: -10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友劝说下，终于放下了这段孽缘。`, `${l}·${n.name}放下孽缘。`, { karma: 5, willpower: 5 }),
  ],
  longing: [
    (n, l) => makeEvent(`${n.name}在${l}的月夜，思念着远方的爱人，久久不能入眠。`, `${l}·${n.name}月夜思念远方爱人。`, { spirit: -10, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的信中，写下了满满的思念，却迟迟没有寄出。`, `${l}·${n.name}写思念信未寄出。`, { charm: 3, willpower: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}的梦中，与远方的爱人重逢，醒来后泪流满面。`, `${l}·${n.name}梦中重逢爱人。`, { spirit: -15, hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}终于收到了爱人的回信，激动得手都在发抖。`, `${l}·${n.name}收到爱人回信。`, { charm: 5, spirit: 10 }),
  ],
  content: [
    (n, l) => makeEvent(`${n.name}在${l}的午后，悠闲地喝着茶，觉得生活很美好。`, `${l}·${n.name}午后喝茶享受生活。`, { hp: 10, spirit: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的散步中，欣赏着沿途的风景，心情愉悦。`, `${l}·${n.name}散步欣赏风景。`, { hp: 5, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友聚会上，知足地笑着，觉得现在的生活很好。`, `${l}·${n.name}聚会知足微笑。`, { charm: 3, reputation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，心态平和，进展反而比平时快。`, `${l}·${n.name}心态平和修炼快。`, { cultivationExp: randInt(10, 25), willpower: 3 }),
  ],
  ambitious: [
    (n, l) => makeEvent(`${n.name}在${l}的深夜，还在刻苦修炼，想要出人头地。`, `${l}·${n.name}深夜刻苦修炼。`, { cultivationExp: randInt(15, 30), hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，主动结交权贵，为将来铺路。`, `${l}·${n.name}宴会结交权贵。`, { reputation: 5, silver: -randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的竞争中，不择手段地击败了对手。`, `${l}·${n.name}不择手段击败对手。`, { reputation: -5, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的规划中，制定了一个宏大的目标，并开始实施。`, `${l}·${n.name}制定宏大目标。`, { intelligence: 5, willpower: 5 }),
  ],
  depressed: [
    (n, l) => makeEvent(`${n.name}在${l}的房间里，闷闷不乐，什么都不想做。`, `${l}·${n.name}闷闷不乐。`, { hp: -5, spirit: -10, cultivationExp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友关心下，终于说出了心中的苦闷。`, `${l}·${n.name}向朋友倾诉苦闷。`, { charm: 3, hp: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的借酒消愁，喝得酩酊大醉。`, `${l}·${n.name}借酒消愁。`, { silver: -randInt(20, 50), hp: -15, spirit: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的医生建议下，开始调理身体和心情。`, `${l}·${n.name}医生建议调理。`, { hp: 10, silver: -randInt(30, 80) }),
  ],
  excited: [
    (n, l) => makeEvent(`${n.name}在${l}的听到一个好消息，激动得跳了起来。`, `${l}·${n.name}听到好消息激动。`, { charm: 3, spirit: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的比赛中，热血沸腾，超水平发挥。`, `${l}·${n.name}比赛超水平发挥。`, { combatExp: 15, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的冒险中，兴奋不已，觉得生活充满了刺激。`, `${l}·${n.name}冒险兴奋。`, { cultivationExp: randInt(10, 25), hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友分享了好消息，大家都为${n.name}高兴。`, `${l}·${n.name}分享好消息。`, { charm: 5, reputation: 3 }),
  ],
  calm: [
    (n, l) => makeEvent(`${n.name}在${l}的危机中，镇定自若，想出了应对之策。`, `${l}·${n.name}危机中镇定应对。`, { intelligence: 5, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的打坐中，心如止水，修为有了新的感悟。`, `${l}·${n.name}打坐心如止水。`, { cultivationExp: randInt(15, 30), enlightenment: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的争论中，冷静地分析问题，让双方都心服口服。`, `${l}·${n.name}冷静分析问题。`, { intelligence: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的风景中，静静地欣赏，内心一片宁静。`, `${l}·${n.name}静静欣赏风景。`, { hp: 10, spirit: 10 }),
  ],
  angry: [
    (n, l) => makeEvent(`${n.name}在${l}的遇到不顺心的事，大发雷霆，吓得周围人不敢说话。`, `${l}·${n.name}大发雷霆。`, { intimidation: 5, reputation: -3, hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的与人争执，怒不可遏，差点动手。`, `${l}·${n.name}与人争执差点动手。`, { reputation: -5, intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的发泄后，终于冷静下来，有些后悔刚才的冲动。`, `${l}·${n.name}发泄后后悔。`, { willpower: 3, charm: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}的怒火中，爆发出了超常的力量，击败了对手。`, `${l}·${n.name}怒火中爆发力量。`, { combatExp: 15, hp: -15 }),
  ],
  fearful: [
    (n, l) => makeEvent(`${n.name}在${l}的听到一个恐怖的故事，吓得晚上都不敢一个人睡。`, `${l}·${n.name}听恐怖故事害怕。`, { willpower: -3, hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的危险中，吓得瑟瑟发抖，但还是硬着头皮上了。`, `${l}·${n.name}害怕但硬着头皮上。`, { willpower: 5, hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的噩梦中惊醒，满头大汗，心有余悸。`, `${l}·${n.name}噩梦惊醒。`, { spirit: -15, hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友陪伴下，终于克服了恐惧。`, `${l}·${n.name}朋友陪伴克服恐惧。`, { willpower: 5, charm: 3 }),
  ],
};

// ===== 修为特质标签 =====
const cultivationEvents = {
  qi_sensation: [
    (n, l) => makeEvent(`${n.name}在${l}的打坐中，气感比常人敏锐，很快就进入了状态。`, `${l}·${n.name}气感敏锐快速入静。`, { cultivationExp: randInt(10, 20), enlightenment: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，感受到了周围灵气的流动，修为大进。`, `${l}·${n.name}感受灵气流动。`, { cultivationExp: randInt(15, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的灵气浓郁之地，修炼速度比平时快了一倍。`, `${l}·${n.name}灵气浓郁地修炼快。`, { cultivationExp: randInt(20, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，发现了一处灵气节点，在此修炼事半功倍。`, `${l}·${n.name}发现灵气节点。`, { cultivationExp: randInt(25, 50), fateLuck: 5 }),
  ],
  slow_cultivator: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，进展缓慢，但${n.name}从不气馁，稳扎稳打。`, `${l}·${n.name}修炼缓慢稳扎稳打。`, { cultivationExp: randInt(5, 10), willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的看到别人修为大进，心中有些羡慕，但还是坚持自己的节奏。`, `${l}·${n.name}羡慕他人但坚持节奏。`, { willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，虽然慢，但基础打得非常扎实。`, `${l}·${n.name}基础扎实。`, { cultivationExp: randInt(5, 15), combatExp: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的瓶颈中，终于找到了突破的方法，厚积薄发。`, `${l}·${n.name}厚积薄发突破。`, { cultivationExp: randInt(30, 60), enlightenment: 5 }),
  ],
  bottleneck_prone: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，又遇到了瓶颈，怎么也突破不了。`, `${l}·${n.name}又遇瓶颈。`, { cultivationExp: -10, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的瓶颈中，苦苦思索，终于有了一丝明悟。`, `${l}·${n.name}瓶颈中思索有悟。`, { cultivationExp: randInt(10, 25), enlightenment: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的瓶颈中，选择外出历练，寻找突破的机缘。`, `${l}·${n.name}外出历练寻机缘。`, { cultivationExp: randInt(15, 30), fateLuck: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的瓶颈中，得到了高人的指点，豁然开朗。`, `${l}·${n.name}得高人指点突破。`, { cultivationExp: randInt(30, 50), enlightenment: 5 }),
  ],
  smooth_sailing: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，一路畅通，很快就突破了一个小境界。`, `${l}·${n.name}修炼一路畅通突破。`, { cultivationExp: randInt(30, 60), fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，几乎没有遇到瓶颈，让周围人羡慕不已。`, `${l}·${n.name}修炼无瓶颈。`, { cultivationExp: randInt(20, 40), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的闭关后，修为又上了一个台阶。`, `${l}·${n.name}闭关修为大进。`, { cultivationExp: randInt(25, 50) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，感悟天地大道，修为突飞猛进。`, `${l}·${n.name}感悟大道修为猛进。`, { cultivationExp: randInt(40, 80), enlightenment: 10 }),
  ],
  combat_cultivator: [
    (n, l) => makeEvent(`${n.name}在${l}的比武中，通过实战提升了修为。`, `${l}·${n.name}比武提升修为。`, { cultivationExp: randInt(15, 30), combatExp: 15 }),
    (n, l) => makeEvent(`${n.name}在${l}的生死搏斗中，突破了极限，修为大进。`, `${l}·${n.name}生死搏斗突破。`, { cultivationExp: randInt(30, 60), hp: -20 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，将战斗经验融入功法，威力大增。`, `${l}·${n.name}战斗经验融入功法。`, { combatExp: 20, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的切磋中，与对手交流心得，双方都有所收获。`, `${l}·${n.name}切磋交流心得。`, { cultivationExp: randInt(10, 20), charm: 3 }),
  ],
  meditation_cultivator: [
    (n, l) => makeEvent(`${n.name}在${l}的打坐中，心如止水，修为缓慢但稳定地提升。`, `${l}·${n.name}打坐修为稳定提升。`, { cultivationExp: randInt(10, 25), enlightenment: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的冥想中，感悟到了天地法则，修为大进。`, `${l}·${n.name}冥想感悟法则。`, { cultivationExp: randInt(25, 50), enlightenment: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的闭关冥想中，连续坐了七天七夜，出关后神清气爽。`, `${l}·${n.name}闭关冥想七天。`, { cultivationExp: randInt(30, 60), spirit: 20 }),
    (n, l) => makeEvent(`${n.name}在${l}的冥想中，进入了物我两忘的境界，收获颇丰。`, `${l}·${n.name}冥想物我两忘。`, { cultivationExp: randInt(20, 40), enlightenment: 5 }),
  ],
  dual_cultivator: [
    (n, l) => makeEvent(`${n.name}在${l}的双修中，与伴侣的修为都有了显著提升。`, `${l}·${n.name}双修修为提升。`, { cultivationExp: randInt(20, 50), hp: -15, spirit: -20 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，阴阳调和，突破了瓶颈。`, `${l}·${n.name}阴阳调和突破。`, { cultivationExp: randInt(30, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}的双修中，与伴侣的感情更加深厚了。`, `${l}·${n.name}双修感情加深。`, { charm: 5, cultivationExp: randInt(15, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，因为双修体质，修炼速度远超常人。`, `${l}·${n.name}双修体质修炼快。`, { cultivationExp: randInt(25, 50), fateLuck: 3 }),
  ],
  body_refiner: [
    (n, l) => makeEvent(`${n.name}在${l}的炼体中，承受着巨大的痛苦，但身体越来越强。`, `${l}·${n.name}炼体痛苦但变强。`, { hp: 20, strength: 3, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的战斗中，凭借强悍的肉身，硬抗了对手的攻击。`, `${l}·${n.name}肉身硬抗攻击。`, { combatExp: 15, hp: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的炼体中，突破了极限，肉身强度更上一层楼。`, `${l}·${n.name}炼体突破极限。`, { hp: 30, strength: 5, cultivationExp: randInt(20, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，将肉身锤炼得如同法宝一般。`, `${l}·${n.name}肉身如法宝。`, { hp: 25, defense: 10 }),
  ],
  soul_cultivator: [
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，神识越来越强大，能感知到更远的地方。`, `${l}·${n.name}神识强大。`, { spirit: 20, perception: 5, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的神识攻击中，轻松击败了对手。`, `${l}·${n.name}神识攻击击败对手。`, { combatExp: 15, spirit: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，灵魂出窍，游历了一番。`, `${l}·${n.name}灵魂出窍游历。`, { spirit: 30, mystery: 10, cultivationExp: randInt(20, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，感悟灵魂大道，修为大进。`, `${l}·${n.name}感悟灵魂大道。`, { cultivationExp: randInt(25, 50), enlightenment: 5 }),
  ],
  sword_innate: [
    (n, l) => makeEvent(`${n.name}在${l}的练剑中，人剑合一，剑法越来越精湛。`, `${l}·${n.name}练剑人剑合一。`, { combatExp: 20, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，一剑封喉，击败了对手。`, `${l}·${n.name}比武一剑封喉。`, { combatExp: 25, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，天生剑骨让${n.name}的剑修速度远超常人。`, `${l}·${n.name}天生剑骨修炼快。`, { cultivationExp: randInt(20, 40), combatExp: 15 }),
    (n, l) => makeEvent(`${n.name}在${l}的剑冢中，得到了一把名剑的认可。`, `${l}·${n.name}得名剑认可。`, { combatExp: 30, fateLuck: 10 }),
  ],
  pill_body: [
    (n, l) => makeEvent(`${n.name}在${l}的炼丹中，药体让${n.name}对药性的理解远超常人。`, `${l}·${n.name}药体理解药性。`, { alchemyExp: 15, cultivationExp: randInt(10, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的炼丹中，成功炼制出了一炉高品质丹药。`, `${l}·${n.name}炼制高品质丹药。`, { alchemyExp: 20, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的修炼中，药体让${n.name}吸收丹药的效果更好。`, `${l}·${n.name}药体吸收丹药效果好。`, { cultivationExp: randInt(15, 30), hp: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的炼丹中，得到了丹道宗师的指点。`, `${l}·${n.name}得丹道宗师指点。`, { alchemyExp: 25, cultivationExp: randInt(10, 20) }),
  ],
};

module.exports = {
  emotionEvents,
  cultivationEvents,
};
