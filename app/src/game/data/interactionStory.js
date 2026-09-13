// 交互剧情库 - 按属性分类，每个交互类型30+剧情
// 分类维度：身份(凡人/修仙)、职业、年龄段、性格、性别、好感度、地点

const { randInt, randChoice, chance } = require('../engine/utils');

// 交谈剧情库 - 按好感度和性格分类
const CHAT_EVENTS = {
  // 低好感 (0-30)
  lowFavor: [
    { text: '{npc}冷冷地看了你一眼，敷衍地说了几句便不再理会你。', effects: { favor: -2 }, journal: '与{npc}交谈，对方态度冷淡。' },
    { text: '{npc}似乎对你心存戒备，说话时总是顾左右而言他，不愿透露真实想法。', effects: { favor: -1 }, journal: '与{npc}交谈，对方心存戒备。' },
    { text: '你试图与{npc}搭话，但对方只是哼了一声，转身便走，留下你一人尴尬地站在原地。', effects: { favor: -3 }, journal: '与{npc}交谈被无视。' },
    { text: '{npc}语气不善地说："你这人怎么回事？没事别来烦我。"', effects: { favor: -5, reputation: -1 }, journal: '与{npc}交谈发生口角。' },
    { text: '{npc}上下打量了你一番，轻蔑地说："就你也配和我说话？"', effects: { favor: -8, reputation: -2 }, journal: '被{npc}羞辱。' },
    { text: '你与{npc}聊了几句，发现对方话里有话，似乎在试探你的底细。', effects: { favor: 0 }, journal: '与{npc}交谈，对方意图不明。' },
    { text: '{npc}不耐烦地挥挥手："走走走，别挡着我做事。"', effects: { favor: -2 }, journal: '被{npc}驱赶。' },
    { text: '你向{npc}问好，对方只是冷冷地点了点头，便不再说话。', effects: { favor: -1 }, journal: '与{npc}简单寒暄。' },
  ],
  // 中好感 (31-70)
  midFavor: [
    { text: '你与{npc}在{location}偶遇，两人聊起了近来的见闻。{npc}兴致勃勃地讲述着他在各地的经历，你听得津津有味。', effects: { favor: 3, reputation: 1 }, journal: '与{npc}在{location}畅谈见闻。' },
    { text: '{npc}邀请你一起喝茶，两人从修炼心得聊到江湖趣事，相谈甚欢。', effects: { favor: 5, cultivationExp: 10 }, journal: '与{npc}品茶论道。' },
    { text: '你与{npc}讨论起修炼上的疑惑，对方耐心地为你解答，让你获益匪浅。', effects: { favor: 4, cultivationExp: 20 }, journal: '向{npc}请教修炼心得。' },
    { text: '{npc}告诉你一个关于{location}的秘密传说，你听得入了迷。', effects: { favor: 3, reputation: 2 }, journal: '从{npc}处听闻{location}传说。' },
    { text: '两人边走边聊，{npc}分享了一些他年轻时的趣事，逗得你哈哈大笑。', effects: { favor: 4, hp: 10 }, journal: '与{npc}相谈甚欢。' },
    { text: '{npc}见你修炼遇到瓶颈，主动分享了他当年突破时的经验。', effects: { favor: 5, cultivationExp: 30 }, journal: '{npc}传授突破经验。' },
    { text: '你与{npc}聊起天下大势，两人各抒己见，虽然观点不尽相同，但都觉得对方见识不凡。', effects: { favor: 3, enlightenment: 1 }, journal: '与{npc}纵论天下。' },
    { text: '{npc}神秘兮兮地告诉你一个他刚得到的消息，据说附近有宝物出世。', effects: { favor: 4, reputation: 1 }, journal: '从{npc}处获得宝物情报。' },
    { text: '在{location}的街角，你与{npc}不期而遇，两人索性找了个地方坐下长谈。', effects: { favor: 3, silver: -50 }, journal: '与{npc}在{location}小聚。' },
    { text: '{npc}对你的修炼进度表示赞赏，并鼓励你继续努力。', effects: { favor: 4, cultivationExp: 15 }, journal: '得到{npc}的鼓励。' },
  ],
  // 高好感 (71-100)
  highFavor: [
    { text: '{npc}见到你十分高兴，拉着你的手说："你可算来了，我正想找你呢！"两人促膝长谈，直到夜深。', effects: { favor: 5, cultivationExp: 25, hp: 20 }, journal: '与{npc}彻夜长谈。' },
    { text: '你与{npc}已是莫逆之交，每次见面都有说不完的话。这次{npc}将他珍藏多年的修炼笔记借给了你。', effects: { favor: 3, cultivationExp: 50, enlightenment: 2 }, journal: '{npc}借予珍藏修炼笔记。' },
    { text: '{npc}深情地看着你说："能认识你，是我此生最大的幸运。"两人相视一笑，一切尽在不言中。', effects: { favor: 8, hp: 30, mp: 20 }, journal: '与{npc}互诉衷肠。' },
    { text: '你与{npc}在{location}并肩漫步，聊着过去、现在和未来。{npc}说希望能一直和你做朋友。', effects: { favor: 6, reputation: 3 }, journal: '与{npc}在{location}漫步。' },
    { text: '{npc}神秘地告诉你一个只有最亲近之人才知道的秘密，并叮嘱你千万不要外传。', effects: { favor: 5, reputation: 5 }, journal: '{npc}告知重大秘密。' },
    { text: '两人把酒言欢，{npc}喝得微醺，开始讲述他从未对人说过的往事，你静静聆听，时而感慨，时而落泪。', effects: { favor: 7, silver: -100, hp: 15 }, journal: '与{npc}把酒言欢，听闻往事。' },
    { text: '{npc}认真地说："以后有什么困难尽管找我，你的事就是我的事。"你心中暖流涌动。', effects: { favor: 6, reputation: 2 }, journal: '{npc}许下患难与共的承诺。' },
    { text: '你与{npc}讨论功法到深夜，两人各有所悟，修为都有精进。', effects: { favor: 4, cultivationExp: 40, mp: 10 }, journal: '与{npc}研讨功法至深夜。' },
  ],
  // 按性格特殊剧情
  byPersonality: {
    '温和宽厚': [
      { text: '{npc}温和地笑着，耐心地听你说话，时不时点头附和，让你感觉如沐春风。', effects: { favor: 4, hp: 10 }, journal: '与温和的{npc}交谈如沐春风。' },
      { text: '{npc}语重心长地劝诫你："修炼一途，贵在坚持，切不可急于求成。"你深以为然。', effects: { favor: 3, enlightenment: 1 }, journal: '{npc}温和劝诫。' },
    ],
    '阴险狡诈': [
      { text: '{npc}眼珠一转，话里话外都在试探你的底细，你小心翼翼地应对，不敢露出破绽。', effects: { favor: 0, reputation: -1 }, journal: '与狡诈的{npc}虚与委蛇。' },
      { text: '{npc}皮笑肉不笑地说了几句恭维话，你总觉得他没安好心。', effects: { favor: -1 }, journal: '被狡诈的{npc}恭维，心生警惕。' },
    ],
    '豪迈直爽': [
      { text: '{npc}哈哈大笑，拍着你的肩膀说："好兄弟！走，喝酒去！"不由分说便拉着你往酒馆走去。', effects: { favor: 5, silver: -80, hp: 15 }, journal: '被豪迈的{npc}拉去喝酒。' },
      { text: '{npc}直言不讳地指出你修炼中的问题，虽然话不好听，但确实切中要害。', effects: { favor: 3, cultivationExp: 25 }, journal: '豪爽的{npc}直言指点。' },
    ],
    '孤僻冷漠': [
      { text: '{npc}只是淡淡地看了你一眼，说了句"无聊"便闭目养神，不再理你。', effects: { favor: -2 }, journal: '被冷漠的{npc}无视。' },
      { text: '你说了半天，{npc}才冷冷地回了一两个字，但你能感觉到他并非完全无动于衷。', effects: { favor: 1 }, journal: '与冷漠的{npc}艰难交流。' },
    ],
    '活泼开朗': [
      { text: '{npc}叽叽喳喳地说个不停，从天上的飞鸟说到地上的蚂蚁，逗得你忍俊不禁。', effects: { favor: 4, hp: 10 }, journal: '与活泼的{npc}相谈甚欢。' },
      { text: '{npc}兴奋地拉着你看这看那，像个孩子一样对什么都充满好奇。', effects: { favor: 3, reputation: 1 }, journal: '被活泼的{npc}拉着四处逛。' },
    ],
    '好色之徒': [
      { text: '{npc}色眯眯地盯着你看，嘴里说着一些不着调的话，让你很不舒服。', effects: { favor: -3, reputation: -1 }, journal: '被好色的{npc}言语骚扰。' },
      { text: '{npc}对你动手动脚，你严厉地制止了他，他才悻悻地收回手。', effects: { favor: -8, reputation: -2 }, journal: '被{npc}非礼，严厉制止。' },
    ],
  },
  // 按地点特殊剧情
  byLocation: {
    '大夏皇都': [
      { text: '在繁华的大夏皇都，你与{npc}聊起了朝中的新鲜事，{npc}神秘地说最近宫里似乎有大动作。', effects: { favor: 3, reputation: 2 }, journal: '在皇都与{npc}议论朝政。' },
    ],
    '清风镇': [
      { text: '在清风镇的茶馆里，你与{npc}听着说书先生的故事，时不时交流几句感想。', effects: { favor: 3, silver: -10 }, journal: '在清风镇茶馆听书。' },
    ],
    '青云剑宗': [
      { text: '在青云剑宗的山门前，你与{npc}讨论剑道，{npc}对青云剑宗的剑法赞不绝口。', effects: { favor: 4, cultivationExp: 15 }, journal: '在青云剑宗论剑。' },
    ],
    '自由坊市': [
      { text: '在自由坊市的喧嚣中，你与{npc}聊起了最近的物价行情，{npc}说最近灵石越来越不值钱了。', effects: { favor: 2, silver: 20 }, journal: '在坊市与{npc}聊行情。' },
    ],
  },
};

// 切磋剧情库
const SPAR_EVENTS = {
  lowFavor: [
    { text: '{npc}不屑地说："就你这点修为，也配和我切磋？"但还是勉强答应了。结果你被三招两式就打败了。', effects: { favor: -3, hp: -30, cultivationExp: 10 }, journal: '与{npc}切磋惨败。' },
    { text: '{npc}出手毫不留情，几招之内便将你击倒在地，冷冷地说："太弱了。"', effects: { favor: -5, hp: -50, cultivationExp: 15 }, journal: '被{npc}无情击败。' },
    { text: '你主动挑战{npc}，对方虽然答应了，但明显留了手，即便如此你还是输了。', effects: { favor: -1, hp: -20, cultivationExp: 20 }, journal: '与{npc}切磋，对方留手仍败。' },
  ],
  midFavor: [
    { text: '你与{npc}在{location}的空地上切磋，两人你来我往，打得难解难分。最后{npc}以一招险胜，两人都大汗淋漓，相视而笑。', effects: { favor: 5, hp: -20, cultivationExp: 40, combatExp: 30 }, journal: '与{npc}在{location}切磋，险败但收获颇丰。' },
    { text: '切磋中，{npc}故意露出破绽让你进攻，然后耐心地讲解你招式中的不足之处。', effects: { favor: 4, cultivationExp: 50, combatExp: 40 }, journal: '{npc}在切磋中指点招式。' },
    { text: '你与{npc}切磋了上百回合，从拳脚打到兵刃，又从兵刃打到法术，围观的人越来越多，纷纷叫好。', effects: { favor: 6, reputation: 5, hp: -30, cultivationExp: 35 }, journal: '与{npc}切磋引发围观。' },
    { text: '这次切磋你超常发挥，竟然逼得{npc}使出了真本事。虽然最后还是输了，但{npc}对你刮目相看。', effects: { favor: 8, cultivationExp: 60, reputation: 3 }, journal: '切磋中超常发挥，获{npc}认可。' },
    { text: '{npc}说："不错不错，有进步！再来！"两人又切磋了三场，你越战越勇，最后竟然赢了一场！', effects: { favor: 7, cultivationExp: 80, reputation: 5, hp: -40 }, journal: '与{npc}切磋多场，终胜一场。' },
  ],
  highFavor: [
    { text: '{npc}笑着说："好兄弟，让我看看你最近进步了多少！"两人放开手脚大战一场，打完后互相拍着肩膀大笑。', effects: { favor: 5, cultivationExp: 50, hp: -25, combatExp: 40 }, journal: '与好友{npc}痛快切磋。' },
    { text: '切磋中，{npc}毫不保留地将他的独门绝技演示给你看，并详细讲解其中奥妙。', effects: { favor: 4, cultivationExp: 100, enlightenment: 3 }, journal: '{npc}传授独门绝技。' },
    { text: '你与{npc}从白天切磋到黑夜，两人都突破了原有的瓶颈，修为同时精进！', effects: { favor: 6, cultivationExp: 150, hp: -50, mp: -30 }, journal: '与{npc}切磋至深夜，双双突破。' },
  ],
  byPersonality: {
    '好战嗜杀': [
      { text: '{npc}一听要切磋，眼睛都亮了，出手狠辣无比，招招致命，你拼尽全力才勉强接住。', effects: { favor: 2, hp: -60, cultivationExp: 50 }, journal: '与好战的{npc}生死切磋。' },
    ],
    '温和宽厚': [
      { text: '{npc}温和地说："点到为止即可。"切磋中处处留手，还时不时停下来指点你。', effects: { favor: 5, cultivationExp: 40, hp: -10 }, journal: '与温和的{npc}友好切磋。' },
    ],
    '阴险狡诈': [
      { text: '切磋中{npc}突然使出阴招，你防不胜防被暗算受伤。{npc}却笑着说："兵不厌诈嘛。"', effects: { favor: -10, hp: -50, reputation: -3 }, journal: '被狡诈的{npc}切磋时暗算。' },
    ],
  },
};

// 赠礼剧情库
const GIFT_EVENTS = {
  lowFavor: [
    { text: '{npc}接过礼物，随意地看了一眼便丢到一边，淡淡地说："就这？"你感到一阵尴尬。', effects: { favor: 1, reputation: -1 }, journal: '赠礼{npc}，对方不以为意。' },
    { text: '{npc}怀疑地看着你："你送我东西，有什么企图？"虽然收下了，但态度依然冷淡。', effects: { favor: 2 }, journal: '赠礼{npc}，对方心存疑虑。' },
    { text: '你将礼物递给{npc}，对方只是敷衍地道了声谢，便不再理会你。', effects: { favor: 1 }, journal: '赠礼{npc}，反应冷淡。' },
  ],
  midFavor: [
    { text: '{npc}接过礼物，眼前一亮："这正是我需要的！谢谢你！"对方的态度明显热情了许多。', effects: { favor: 8, reputation: 2 }, journal: '赠礼{npc}，对方十分喜欢。' },
    { text: '{npc}仔细端详着礼物，感动地说："你竟然记得我喜欢这个，太有心了。"', effects: { favor: 10, reputation: 3 }, journal: '赠礼{npc}，对方深受感动。' },
    { text: '你将精心准备的礼物送给{npc}，对方大喜过望，非要拉着你去喝酒以示感谢。', effects: { favor: 7, silver: -50, reputation: 2 }, journal: '赠礼{npc}，被邀喝酒答谢。' },
    { text: '{npc}收到礼物后，从怀中掏出一件回礼递给你："礼尚往来，这个你收下。"', effects: { favor: 6, spiritStone: 30 }, journal: '赠礼{npc}，收到回礼。' },
    { text: '礼物虽然不贵重，但{npc}看出了你的心意，郑重地收下并表示感谢。', effects: { favor: 5, reputation: 1 }, journal: '赠礼{npc}，心意被领会。' },
  ],
  highFavor: [
    { text: '{npc}接过礼物，眼眶微红："你总是这么贴心。"说着便将你紧紧抱住。', effects: { favor: 10, hp: 20, reputation: 3 }, journal: '赠礼{npc}，对方感动落泪。' },
    { text: '{npc}看到礼物后惊喜地说："这是我梦寐以求的东西！你怎么知道的？"然后给了你一个大大的拥抱。', effects: { favor: 12, cultivationExp: 30, reputation: 5 }, journal: '赠礼{npc}梦寐以求之物。' },
    { text: '你与{npc}交换了礼物，两人都觉得这是最有意义的一次交换。{npc}说要将这份礼物永远珍藏。', effects: { favor: 8, reputation: 5, enlightenment: 1 }, journal: '与{npc}交换珍贵礼物。' },
  ],
  byItemType: {
    '丹药': [
      { text: '{npc}接过丹药，闻了闻便赞道："好丹！这品质可不一般。"对你的炼丹术刮目相看。', effects: { favor: 6, reputation: 2 }, journal: '赠送丹药给{npc}，获赞丹术。' },
    ],
    '武器': [
      { text: '{npc}拔出武器试了试，满意地说："好兵器！趁手得很！"对你的品味大加赞赏。', effects: { favor: 7, combatExp: 20 }, journal: '赠送兵器给{npc}。' },
    ],
    '灵石': [
      { text: '{npc}掂了掂灵石袋，笑得合不拢嘴："够意思！以后有事尽管找我！"', effects: { favor: 10, reputation: 2 }, journal: '赠送灵石给{npc}。' },
    ],
  },
};

// 传书剧情库
const LETTER_EVENTS = {
  lowFavor: [
    { text: '你托人给{npc}捎去一封信，过了很久才收到一封简短的回信，只有"知道了"三个字。', effects: { favor: 1 }, journal: '传书{npc}，回复简短。' },
    { text: '信送出去了，但{npc}似乎没有回信的意思，你不禁有些后悔浪费了传书的灵石。', effects: { favor: 0, spiritStone: -10 }, journal: '传书{npc}未获回复。' },
  ],
  midFavor: [
    { text: '你给{npc}写了一封长信，诉说近来的见闻和修炼心得。不久收到回信，{npc}在信中详细回复了你的问题，并分享了他的近况。', effects: { favor: 5, cultivationExp: 20 }, journal: '与{npc}书信交流修炼心得。' },
    { text: '你在信中向{npc}请教一个修炼上的疑惑，对方在回信中详细解答，让你茅塞顿开。', effects: { favor: 4, cultivationExp: 40, enlightenment: 1 }, journal: '传书向{npc}请教，获益良多。' },
    { text: '你与{npc}书信往来，从修炼聊到生活，虽然相隔两地，但心的距离却近了。', effects: { favor: 6, reputation: 1 }, journal: '与{npc}频繁书信往来。' },
    { text: '{npc}在信中说他最近在{location}遇到了一些趣事，你读着信仿佛身临其境。', effects: { favor: 3, reputation: 2 }, journal: '从{npc}信中听闻{location}趣事。' },
  ],
  highFavor: [
    { text: '你在信中表达了对{npc}的思念，对方很快回信，字里行间满是深情，说也十分想念你。', effects: { favor: 8, hp: 20, mp: 15 }, journal: '与{npc}互诉思念。' },
    { text: '{npc}在信中说，等他处理完手头的事，就来{location}找你，到时候要好好聚一聚。', effects: { favor: 6, reputation: 3 }, journal: '{npc}信中说要来{location}相聚。' },
    { text: '你与{npc}的书信已经积了厚厚一叠，每一封都被你精心收藏。这次{npc}在信中寄来了一片他那里的特产叶子。', effects: { favor: 5, reputation: 2 }, journal: '与{npc}书信往来已成习惯。' },
  ],
};

// 三代以内亲属：使用亲属专属剧情库（需求：亲属按钮限定交谈/切磋/赠礼/偷窃/战斗/欢好/传书）
const { isCloseRelative, relLabel, pickRelativeStory, buildThreeAct } = require('../engine/threeActStory');

// 根据属性选择交互剧情
function pickInteractionEvent(action, player, npc, location) {
  let pool = [];
  const favor = npc.favorWithPlayer || 0;

  // 三代以内亲属 → 走亲属专属剧情（含称呼按亲属关系）
  if (isCloseRelative(player, npc)) {
    const rel = relLabel(player, npc);        // 主控视角：NPC 是主控的谁
    const pRel = relLabel(npc, player);       // NPC视角：主控是 NPC 的谁
    const relText = pickRelativeStory(action, player, npc, location);
    const actName = action === 'chat' ? '闲话家常' : action === 'spar' ? '切磋比试' : action === 'gift' ? '互赠礼物' : action === 'letter' ? '书信往来' : '交谈';
    // 双向记事（第4条）：主控记事用主控视角（主语=主控名），NPC记事用NPC视角（主语=NPC名，称呼按NPC视角）
    const playerJournal = `${location || '某地'}·${player.name}与${rel || '亲属'}${npc.name}${actName}。`;
    const npcJournal = `${location || '某地'}·${npc.name}与${pRel || '亲属'}${player.name}${actName}。`;
    return { text: relText, journal: playerJournal, npcJournal, effects: { favor: randInt(2, 8) }, isRelative: true, rel };
  }

  // 基础池按好感度：好感<0大概率减好感，好感>=0大概率加好感
  let basePool;
  if (action === 'chat') {
    if (favor < 0) basePool = CHAT_EVENTS.lowFavor;
    else if (favor <= 70) basePool = CHAT_EVENTS.midFavor;
    else basePool = CHAT_EVENTS.highFavor;
  } else if (action === 'spar') {
    if (favor < 0) basePool = SPAR_EVENTS.lowFavor;
    else if (favor <= 70) basePool = SPAR_EVENTS.midFavor;
    else basePool = SPAR_EVENTS.highFavor;
  } else if (action === 'gift') {
    if (favor < 0) basePool = GIFT_EVENTS.lowFavor;
    else if (favor <= 70) basePool = GIFT_EVENTS.midFavor;
    else basePool = GIFT_EVENTS.highFavor;
  } else if (action === 'letter') {
    if (favor < 0) basePool = LETTER_EVENTS.lowFavor;
    else if (favor <= 70) basePool = LETTER_EVENTS.midFavor;
    else basePool = LETTER_EVENTS.highFavor;
  } else basePool = CHAT_EVENTS.midFavor;

  pool = [...basePool];

  // 性格特殊剧情（50%概率）
  const personalityPool = action === 'chat' ? CHAT_EVENTS.byPersonality[npc.personality] :
                         action === 'spar' ? SPAR_EVENTS.byPersonality?.[npc.personality] : null;
  if (personalityPool && chance(50)) {
    pool = pool.concat(personalityPool);
  }

  // 地点特殊剧情（30%概率）
  const locationPool = action === 'chat' ? CHAT_EVENTS.byLocation?.[location] : null;
  if (locationPool && chance(30)) {
    pool = pool.concat(locationPool);
  }

  const event = randChoice(pool);
  // 替换占位符
  let text = event.text.replace(/\{npc\}/g, npc.name).replace(/\{location\}/g, location || '某地');
  let journal = event.journal.replace(/\{npc\}/g, npc.name).replace(/\{location\}/g, location || '某地');
  // 非亲属 NPC 视角记事（第4条：双向记事）
  const npcAct = action === 'chat' ? '交谈' : action === 'spar' ? '切磋比试' : action === 'gift' ? '互赠礼物' : action === 'letter' ? '书信往来' : '交谈';
  const npcJournal = `${location || '某地'}·${npc.name}与${player.name}${npcAct}。`;

  // 三段式包装：第1段（环境/登场+动作神态+称呼）+ 第2段（核心）+ 第3段（收束）
  // 动作/神态/语言与称呼按交互类型与关系自动组合
  const rel = relLabel(player, npc) || null;
  text = buildThreeAct({ core: text, action, me: player, them: npc, location, rel });

  return {
    text,
    journal,
    npcJournal,
    effects: { ...event.effects },
  };
}

module.exports = {
  CHAT_EVENTS, SPAR_EVENTS, GIFT_EVENTS, LETTER_EVENTS,
  pickInteractionEvent,
};
