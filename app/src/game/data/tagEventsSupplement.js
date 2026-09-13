// 标签随机剧情库（补充）- 为所有缺少剧情的标签添加随机剧情
const { randChoice, randInt, chance } = require('../engine/utils');

function makeEvent(text, journal, effects = {}) {
  return { text, journal, effects };
}

// ===== 身体特征标签（补充）=====
const bodyEvents = {
  tall: [
    (n, l) => makeEvent(`${n.name}走在${l}的人群中，身高八尺格外显眼，周围的人都要仰头才能与${n.name}对视。`, `${l}·${n.name}因身高出众引人注目。`, { intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的门框上撞了头，引来周围人一阵善意的笑声。`, `${l}·${n.name}进门时撞了头。`, { hp: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}被招兵的军官看中，力邀其加入军队，承诺优厚待遇。`, `${l}·${n.name}被军官看中招兵。`, { silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的比武场上，凭借身高优势轻松击败了对手。`, `${l}·${n.name}比武获胜。`, { reputation: 5, silver: randInt(30, 80) }),
  ],
  short: [
    (n, l) => makeEvent(`${n.name}在${l}的人群中穿梭自如，小巧的身材让${n.name}行动格外灵活。`, `${l}·${n.name}行动灵活。`, { agility: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}被人误认为是孩童，闹出了不少笑话。`, `${l}·${n.name}被误认为孩童。`, { charm: 1 }),
    (n, l) => makeEvent(`${n.name}在${l}的捉迷藏游戏中，凭借小巧的身形屡屡获胜。`, `${l}·${n.name}捉迷藏获胜。`, { silver: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位矮人族的长者，对方见${n.name}身形小巧，传授了一些身法技巧。`, `${l}·${n.name}得矮人传授身法。`, { agility: 5 }),
  ],
  scar: [
    (n, l) => makeEvent(`${n.name}在${l}的酒馆中，身上的疤痕引起了周围人的敬畏，没人敢轻易招惹。`, `${l}·${n.name}的疤痕令人敬畏。`, { intimidation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位老兵，对方看到${n.name}的疤痕，认出是战场上留下的，主动请${n.name}喝酒。`, `${l}·${n.name}被老兵认出战场疤痕。`, { silver: randInt(20, 50) }),
    (n, l) => makeEvent(`${n.name}在${l}被一个小孩指着疤痕问东问西，${n.name}耐心地讲述了疤痕的来历。`, `${l}·${n.name}向小孩讲述疤痕来历。`, { reputation: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的决斗中，疤痕让对手心生忌惮，未战先怯。`, `${l}·${n.name}的疤痕震慑对手。`, { reputation: 3 }),
  ],
  tattoo: [
    (n, l) => makeEvent(`${n.name}在${l}露出身上的纹身，周围人纷纷猜测其来历，有人说是江湖帮派，有人说是神秘图腾。`, `${l}·${n.name}的纹身引人猜测。`, { mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位纹身师，对方对${n.name}的纹身赞不绝口，想要临摹学习。`, `${l}·${n.name}的纹身被纹身师称赞。`, { charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的帮派聚会中，纹身被认出是某个势力的标志，受到了特殊礼遇。`, `${l}·${n.name}的纹身被认出势力标志。`, { silver: randInt(30, 100) }),
    (n, l) => makeEvent(`${n.name}在${l}被官府的人盘问纹身的来历，费了一番口舌才脱身。`, `${l}·${n.name}因纹身被官府盘问。`, { reputation: -3 }),
  ],
  heterochromia: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，异色双瞳引起了路人的好奇，有人说是祥瑞，有人说是妖异。`, `${l}·${n.name}的异色双瞳引人议论。`, { mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位相士，对方称异色双瞳是天眼之相，能看穿虚妄。`, `${l}·${n.name}被相士称有天眼之相。`, { perception: 5, fateLuck: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的赌坊中，凭借敏锐的观察力赢了不少钱。`, `${l}·${n.name}在赌坊赢钱。`, { silver: randInt(50, 200) }),
    (n, l) => makeEvent(`${n.name}在${l}被一个邪教组织盯上，认为异色双瞳是祭祀的最佳人选。`, `${l}·${n.name}被邪教盯上。`, { hp: -15, reputation: -5 }),
  ],
  silver_hair: [
    (n, l) => makeEvent(`${n.name}走在${l}的街头，一头银发在阳光下闪闪发光，引得路人频频侧目。`, `${l}·${n.name}的银发引人注目。`, { charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位隐世高人，对方称银发是修仙者的象征，主动指点了一二。`, `${l}·${n.name}得高人指点。`, { cultivationExp: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的画摊上，被画师请求做模特，画了一幅肖像画。`, `${l}·${n.name}做画师模特。`, { silver: randInt(20, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}被误认为是某位传说中的仙人，受到了众人的朝拜。`, `${l}·${n.name}被误认为仙人。`, { reputation: 10, spiritStone: randInt(5, 20) }),
  ],
  red_hair: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，红发如火般耀眼，让人一眼就能记住。`, `${l}·${n.name}的红发引人注目。`, { charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}与人发生争执，红发让${n.name}看起来更加愤怒，对方先怂了。`, `${l}·${n.name}红发震慑对手。`, { intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位火属性修士，对方称红发是火灵根的外显，想要收${n.name}为徒。`, `${l}·${n.name}被火属性修士看中。`, { cultivationExp: randInt(15, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的节日庆典上，红发与喜庆的气氛相得益彰，被选为庆典的吉人。`, `${l}·${n.name}被选为庆典吉人。`, { reputation: 5, silver: randInt(30, 80) }),
  ],
  delicate: [
    (n, l) => makeEvent(`${n.name}在${l}的集市上，肌肤胜雪引来不少羡慕的目光。`, `${l}·${n.name}的肌肤令人羡慕。`, { charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的胭脂铺中，店主极力推荐各种护肤品，称${n.name}的皮肤是最好的广告。`, `${l}·${n.name}被胭脂铺店主称赞。`, { silver: randInt(10, 40) }),
    (n, l) => makeEvent(`${n.name}在${l}的阳光下，皮肤白得几乎透明，引得周围人啧啧称奇。`, `${l}·${n.name}的肌肤在阳光下发光。`, { charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位美容师，对方想要研究${n.name}的护肤秘方。`, `${l}·${n.name}被美容师研究。`, { silver: randInt(20, 60) }),
  ],
  muscular: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，肌肉虬结的身材让路人纷纷避让。`, `${l}·${n.name}的肌肉令人畏惧。`, { intimidation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的举重比赛中，轻松举起了最重的石锁，赢得满堂喝彩。`, `${l}·${n.name}举重比赛获胜。`, { reputation: 8, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}帮一位老人搬运行李，老人感激不尽，硬塞了一些谢礼。`, `${l}·${n.name}帮老人搬运行李。`, { karma: 5, silver: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}被一个武馆馆主看中，邀请其做教头。`, `${l}·${n.name}被武馆邀请做教头。`, { silver: randInt(100, 300) }),
  ],
  limp: [
    (n, l) => makeEvent(`${n.name}在${l}的街头一瘸一拐地走着，有人投来同情的目光，也有人暗自嘲笑。`, `${l}·${n.name}因腿疾引人侧目。`, { willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位好心人，主动上前搀扶并询问是否需要帮助。`, `${l}·${n.name}遇到好心人搀扶。`, { karma: 3, silver: randInt(5, 20) }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，虽然腿脚不便，但凭借丰富的经验击败了对手。`, `${l}·${n.name}带伤比武获胜。`, { reputation: 10, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}被一群小混混嘲笑腿疾，${n.name}虽然愤怒但只能隐忍。`, `${l}·${n.name}被小混混嘲笑。`, { willpower: 5, reputation: -3 }),
  ],
  blind: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，虽然双目失明，但听觉异常敏锐，能准确判断周围人的位置。`, `${l}·${n.name}失明但听觉敏锐。`, { perception: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位乐师，对方称盲人的乐感远超常人，想要收${n.name}为徒。`, `${l}·${n.name}被乐师收为徒。`, { charm: 3, silver: randInt(20, 60) }),
    (n, l) => makeEvent(`${n.name}在${l}的茶馆中，凭借过人的听力听出了隔壁桌的密谋，避免了一场灾祸。`, `${l}·${n.name}听出密谋避免灾祸。`, { fateLuck: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}被一个小偷盯上，以为盲人好欺负，结果被${n.name}一把抓住。`, `${l}·${n.name}抓住小偷。`, { reputation: 5, silver: randInt(10, 30) }),
  ],
  deaf: [
    (n, l) => makeEvent(`${n.name}在${l}的街头，虽然听不见声音，但视觉极为敏锐，能看清远处的细节。`, `${l}·${n.name}失聪但视觉敏锐。`, { perception: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}与人交流时，凭借读唇术准确理解了对方的意思，让人大为惊讶。`, `${l}·${n.name}用读唇术交流。`, { intelligence: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的嘈杂环境中，因为听不见反而能专心做事，效率远超常人。`, `${l}·${n.name}在嘈杂中专心做事。`, { cultivationExp: randInt(5, 15) }),
    (n, l) => makeEvent(`${n.name}在${l}被人从背后叫骂，但因为听不见，反而避免了一场冲突。`, `${l}·${n.name}因听不见避免冲突。`, { fateLuck: 5 }),
  ],
  eunuch: [
    (n, l) => makeEvent(`${n.name}在${l}的宫中当差，因为已净身，得以在皇城禁地行走，接触到不少机密。`, `${l}·${n.name}在皇城禁地当差接触机密。`, { mystery: 5, silver: randInt(30, 100) }),
    (n, l) => makeEvent(`${n.name}在${l}被人嘲笑是阉人，但${n.name}早已习惯，不为所动。`, `${l}·${n.name}被人嘲笑阉人。`, { willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的后宫争斗中，因为无欲无求，反而成为各方势力拉拢的对象。`, `${l}·${n.name}被各方势力拉拢。`, { reputation: 5, silver: randInt(50, 200) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位老太监，对方传授了不少宫中生存之道。`, `${l}·${n.name}得老太监传授生存之道。`, { intelligence: 5 }),
  ],
  virgin: [
    (n, l) => makeEvent(`${n.name}在${l}遇到一位修士，对方称处子之身元阴未失，是修炼的上好资质。`, `${l}·${n.name}被称修炼资质上佳。`, { cultivationExp: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的青楼门口被拉客，但${n.name}严词拒绝，保持了清白。`, `${l}·${n.name}拒绝青楼诱惑。`, { karma: 5, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}被一个采花贼盯上，但${n.name}机智地逃脱了。`, `${l}·${n.name}逃脱采花贼。`, { agility: 3, fateLuck: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的婚礼上，作为伴娘/伴郎受到了新人的祝福。`, `${l}·${n.name}参加婚礼受祝福。`, { fateLuck: 3 }),
  ],
  experienced: [
    (n, l) => makeEvent(`${n.name}在${l}的青楼中，凭借丰富的经验成为了头牌，客人络绎不绝。`, `${l}·${n.name}成为青楼头牌。`, { silver: randInt(100, 300), charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一个青涩少年，${n.name}主动传授了一些闺房之术。`, `${l}·${n.name}传授少年闺房之术。`, { reputation: -5, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与多位宾客调笑，成为全场最受欢迎的人。`, `${l}·${n.name}在宴会上大受欢迎。`, { reputation: 5, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}被一位富甲看中，想要纳为妾室，承诺重金聘礼。`, `${l}·${n.name}被富甲看中纳妾。`, { silver: randInt(200, 500) }),
  ],
};

// ===== 性格特质标签（补充）=====
const personalityEvents = {
  loyal: [
    (n, l) => makeEvent(`${n.name}在${l}的主人遇到危险时，毫不犹豫地挺身而出，身受重伤也不退后。`, `${l}·${n.name}护主受伤。`, { hp: -20, reputation: 15, karma: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}面对敌人的利诱，坚决不背叛自己的朋友，受到了众人的尊敬。`, `${l}·${n.name}拒绝利诱不背叛朋友。`, { reputation: 10, willpower: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友落难时，倾其所有相助，让朋友感动不已。`, `${l}·${n.name}倾囊相助落难朋友。`, { silver: -randInt(50, 200), karma: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}被主人重重赏赐，以表彰其多年的忠心耿耿。`, `${l}·${n.name}因忠诚受赏赐。`, { silver: randInt(100, 300), reputation: 5 }),
  ],
  treacherous: [
    (n, l) => makeEvent(`${n.name}在${l}暗中出卖了朋友的秘密，换取了一大笔钱财。`, `${l}·${n.name}出卖朋友秘密。`, { silver: randInt(100, 300), karma: -15, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}的权力斗争中，见风使舵，投靠了更有权势的一方。`, `${l}·${n.name}见风使舵投靠新主。`, { reputation: -5, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的背后说人坏话，被当事人听到，双方结下梁子。`, `${l}·${n.name}背后说人坏话被听到。`, { reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}的交易中暗中做手脚，被对方发现，差点引发冲突。`, `${l}·${n.name}交易做手脚被发现。`, { reputation: -10, silver: -randInt(30, 80) }),
  ],
  brave: [
    (n, l) => makeEvent(`${n.name}在${l}遇到山贼打劫，毫不畏惧地冲上去搏斗，成功击退了山贼。`, `${l}·${n.name}勇斗山贼。`, { hp: -15, reputation: 15, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}的比武场上，主动挑战最强的对手，虽然落败但赢得了尊重。`, `${l}·${n.name}挑战最强对手。`, { hp: -20, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的火灾中，勇敢地冲入火场救出了被困的老人。`, `${l}·${n.name}冲入火场救人。`, { hp: -10, karma: 15, reputation: 10 }),
    (n, l) => makeEvent(`${n.name}在${l}的深夜独行时，遇到了猛兽，${n.name}不仅不逃，反而主动迎战。`, `${l}·${n.name}夜遇猛兽主动迎战。`, { hp: -25, cultivationExp: randInt(20, 50) }),
  ],
  cowardly: [
    (n, l) => makeEvent(`${n.name}在${l}遇到一点危险就吓得屁滚尿流，被周围人嘲笑。`, `${l}·${n.name}遇危险吓得逃跑。`, { reputation: -10, agility: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，还没开打就主动认输，让对手大失所望。`, `${l}·${n.name}比武主动认输。`, { reputation: -5, silver: -randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}听到一声巨响，吓得躲到了桌子底下，引来一阵哄笑。`, `${l}·${n.name}被巨响吓得躲桌底。`, { reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}因为胆小，错过了一个发财的好机会，事后懊悔不已。`, `${l}·${n.name}因胆小错过机会。`, { fateLuck: -5 }),
  ],
  wise: [
    (n, l) => makeEvent(`${n.name}在${l}的一场纠纷中，三言两语就化解了双方的矛盾，众人皆服。`, `${l}·${n.name}智解纠纷。`, { reputation: 10, silver: randInt(30, 80) }),
    (n, l) => makeEvent(`${n.name}在${l}的书店中，与店主畅谈古今，店主佩服不已，赠送了几本珍本。`, `${l}·${n.name}与店主畅谈获赠珍本。`, { intelligence: 5, cultivationExp: randInt(10, 30) }),
    (n, l) => makeEvent(`${n.name}在${l}的棋局中，轻松击败了当地的围棋高手，名声大噪。`, `${l}·${n.name}围棋击败高手。`, { reputation: 8, silver: randInt(50, 150) }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位迷路的旅人，${n.name}根据星象和地形，准确指出了方向。`, `${l}·${n.name}为旅人指路。`, { karma: 5, reputation: 3 }),
  ],
  foolish: [
    (n, l) => makeEvent(`${n.name}在${l}被人用简单的骗局骗走了不少钱财，事后才反应过来。`, `${l}·${n.name}被骗走钱财。`, { silver: -randInt(50, 200), reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}的争论中，因为逻辑混乱被对方驳得哑口无言。`, `${l}·${n.name}争论被驳倒。`, { reputation: -3 }),
    (n, l) => makeEvent(`${n.name}在${l}做错了一件事，却怎么也想不明白错在哪里，让周围人哭笑不得。`, `${l}·${n.name}做错事不知错在哪。`, { intelligence: -2 }),
    (n, l) => makeEvent(`${n.name}在${l}被人卖了还帮着数钱，等反应过来时人已经跑了。`, `${l}·${n.name}被卖了还帮数钱。`, { silver: -randInt(30, 100), fateLuck: -5 }),
  ],
  generous: [
    (n, l) => makeEvent(`${n.name}在${l}遇到一个乞丐，毫不犹豫地掏出了一大把银子施舍。`, `${l}·${n.name}施舍乞丐。`, { silver: -randInt(30, 100), karma: 10, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的朋友聚会中，主动抢着买单，朋友们都很感激。`, `${l}·${n.name}聚会抢着买单。`, { silver: -randInt(50, 150), reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}看到一个穷人买不起药，主动帮其付了药钱。`, `${l}·${n.name}帮穷人付药钱。`, { silver: -randInt(20, 80), karma: 8 }),
    (n, l) => makeEvent(`${n.name}在${l}的赈灾中，捐出了大量财物，受到了官府的表彰。`, `${l}·${n.name}赈灾受表彰。`, { silver: -randInt(100, 300), reputation: 15 }),
  ],
  humble: [
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，虽然身份尊贵，但依然对每个人都彬彬有礼，让人如沐春风。`, `${l}·${n.name}待人彬彬有礼。`, { reputation: 5, charm: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位老者，虚心请教问题，老者大为欣赏，传授了一些心得。`, `${l}·${n.name}虚心请教得老者传授。`, { intelligence: 5, cultivationExp: randInt(10, 25) }),
    (n, l) => makeEvent(`${n.name}在${l}的比赛中获胜后，依然谦虚地表示是运气好，让对手也心生好感。`, `${l}·${n.name}获胜后依然谦虚。`, { reputation: 8 }),
    (n, l) => makeEvent(`${n.name}在${l}不耻下问，向一个地位比自己低的人请教，学到了不少东西。`, `${l}·${n.name}不耻下问。`, { intelligence: 3 }),
  ],
  proud: [
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，目中无人，对周围的人都不屑一顾，引起了不少人的反感。`, `${l}·${n.name}目中无人引人反感。`, { reputation: -8, intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的比武中，因为轻敌而落败，颜面尽失。`, `${l}·${n.name}轻敌落败。`, { hp: -15, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}拒绝了别人的好意帮助，认为自己完全可以搞定，结果搞砸了。`, `${l}·${n.name}拒绝帮助搞砸事情。`, { reputation: -5, silver: -randInt(20, 50) }),
    (n, l) => makeEvent(`${n.name}在${l}的才华展示中，因为过于骄傲，得罪了不少同行。`, `${l}·${n.name}骄傲得罪同行。`, { reputation: -5 }),
  ],
  chaste: [
    (n, l) => makeEvent(`${n.name}在${l}遇到一位权贵的调戏，${n.name}严词拒绝，宁死不从。`, `${l}·${n.name}拒绝权贵调戏。`, { karma: 10, willpower: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的青楼门口，被人拉客，但${n.name}洁身自好，转身就走。`, `${l}·${n.name}洁身自好远离青楼。`, { karma: 5, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}被一位富家公子追求，但${n.name}表示非所爱之人不嫁。`, `${l}·${n.name}拒绝富家公子追求。`, { charm: 3, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的节日庆典上，保持着端庄的仪态，受到了长辈们的称赞。`, `${l}·${n.name}端庄受长辈称赞。`, { reputation: 5 }),
  ],
  lustful: [
    (n, l) => makeEvent(`${n.name}在${l}的青楼中流连忘返，花了不少钱财，身体也有些吃不消。`, `${l}·${n.name}在青楼流连忘返。`, { silver: -randInt(50, 200), hp: -10, spirit: -15 }),
    (n, l) => makeEvent(`${n.name}在${l}的街头看到一位${n.gender === '女' ? '俊朗公子' : '美人'}，忍不住上前调戏，被对方扇了一巴掌。`, `${l}·${n.name}调戏${n.gender === '女' ? '公子' : '美人'}被扇巴掌。`, { hp: -5, reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}的宴会上，与一位看对眼的${n.gender === '女' ? '俊朗客人' : '美貌客人'}共度良宵。`, `${l}·${n.name}宴会与人共度良宵。`, { hp: -15, spirit: -20, charm: 2 }),
    (n, l) => makeEvent(`${n.name}在${l}因为纵欲过度，精神有些萎靡，被医生告诫要节制。`, `${l}·${n.name}纵欲过度被告诫。`, { hp: -20, spirit: -25 }),
  ],
  vengeful: [
    (n, l) => makeEvent(`${n.name}在${l}遇到了曾经的仇人，暗中策划报复，让对方吃了个暗亏。`, `${l}·${n.name}暗中报复仇人。`, { karma: -10, reputation: -5 }),
    (n, l) => makeEvent(`${n.name}在${l}因为一点小事就记恨在心，处处给对方使绊子。`, `${l}·${n.name}因小事记恨使绊子。`, { reputation: -8 }),
    (n, l) => makeEvent(`${n.name}在${l}的仇人遇到困难时，不仅不帮忙，反而落井下石。`, `${l}·${n.name}落井下石。`, { karma: -15, reputation: -10 }),
    (n, l) => makeEvent(`${n.name}在${l}终于找到了报仇的机会，狠狠地教训了仇人一顿。`, `${l}·${n.name}报仇教训仇人。`, { hp: -10, karma: -8, reputation: 5 }),
  ],
  forgiving: [
    (n, l) => makeEvent(`${n.name}在${l}遇到了曾经伤害过自己的人，${n.name}大度地原谅了对方。`, `${l}·${n.name}原谅曾经伤害自己的人。`, { karma: 10, reputation: 8, willpower: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的纠纷中，主动让步，化解了一场可能的冲突。`, `${l}·${n.name}主动让步化解冲突。`, { karma: 5, reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}的下属犯了错，${n.name}宽容地给了对方一次改过的机会。`, `${l}·${n.name}宽容下属犯错。`, { reputation: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}被人不小心冒犯，${n.name}一笑置之，让对方大为感激。`, `${l}·${n.name}一笑置之被冒犯。`, { charm: 3, reputation: 3 }),
  ],
  mysterious: [
    (n, l) => makeEvent(`${n.name}在${l}的茶馆中，独自坐在角落，周身散发着神秘的气息，引得众人猜测。`, `${l}·${n.name}神秘气质引人猜测。`, { mystery: 5 }),
    (n, l) => makeEvent(`${n.name}在${l}突然消失了几天，回来后对去了哪里绝口不提，更加神秘。`, `${l}·${n.name}神秘消失又回来。`, { mystery: 8 }),
    (n, l) => makeEvent(`${n.name}在${l}遇到一位知情人，对方似乎知道${n.name}的来历，但被${n.name}一个眼神制止了。`, `${l}·${n.name}的来历被知情人认出。`, { mystery: 5, intimidation: 3 }),
    (n, l) => makeEvent(`${n.name}在${l}的深夜，独自一人在屋顶上仰望星空，似乎在等待什么。`, `${l}·${n.name}深夜屋顶等待。`, { mystery: 3, cultivationExp: randInt(5, 15) }),
  ],
};

// 导出补充的标签剧情
module.exports = {
  bodyEvents,
  personalityEvents,
};
