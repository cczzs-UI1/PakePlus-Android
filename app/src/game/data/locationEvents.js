// 地点功能按钮独立剧情库
// 格式: { 地点名: { 按钮名: [ { text, effects, journal, options? } ] } }

const { randInt, chance, randChoice } = require('../engine/utils');

const LOCATION_EVENTS = {
  // ===== 大夏皇都 =====
  '大夏皇都': {
    '官府悬赏': [
      { text: '你来到官府悬赏榜前，看到一张通缉江洋大盗的告示，赏金500两。', effects: { reputation: 2 }, journal: '在官府查看悬赏告示。', options: [{ text: '接下悬赏', effect: { silver: 500, reputation: 10, combat: true } }, { text: '看看就走', effect: {} }] },
      { text: '悬赏榜上新贴了一张寻人启事，寻找失踪的富家小姐，酬谢丰厚。', effects: {}, journal: '在官府看到寻人启事。', options: [{ text: '帮忙寻找', effect: { silver: 300, reputation: 5 } }, { text: '不予理会', effect: {} }] },
      { text: '一个官差拦住你，说你形迹可疑，要带你回去问话。', effects: {}, journal: '被官差盘问。', options: [{ text: '好言解释', effect: { reputation: -2 } }, { text: '贿赂官差', effect: { silver: -50 } }, { text: '强行离开', effect: { reputation: -10, combat: true } }] },
    ],
    '天机阁': [
      { text: '天机阁阁主为你推算命格，说你近期有贵人相助，但也有小人作祟。', effects: { enlightenment: 2 }, journal: '在天机阁推算命格。', options: [{ text: '重金答谢', effect: { silver: -100, reputation: 3 } }, { text: '点头称谢', effect: {} }] },
      { text: '你在天机阁看到一卷古旧的星图，上面记载着失传的星辰运行规律。', effects: { enlightenment: 3, cultivationExp: 50 }, journal: '在天机阁研读古星图。' },
      { text: '天机阁的弟子告诉你，近日星象异动，东南方有妖气冲天。', effects: {}, journal: '得知星象异动。' },
    ],
    '拍卖行': [
      { text: '拍卖行今日拍卖一件上古法器，竞价激烈，最终被一位神秘买家以天价拍走。', effects: {}, journal: '在拍卖行观看拍卖。', options: [{ text: '参与竞价', effect: { silver: -500, randomItem: true } }, { text: '只看不买', effect: {} }] },
      { text: '你在拍卖行后台看到一件被遗漏的拍品，似乎是件宝贝。', effects: {}, journal: '在拍卖行发现遗漏拍品。', options: [{ text: '告诉拍卖行', effect: { reputation: 5, silver: 100 } }, { text: '悄悄拿走', effect: { randomItem: true, reputation: -10 } }] },
    ],
    '赌坊': [
      { text: '你在赌坊玩骰子，手气不错，赢了一把。', effects: { silver: randInt(50, 200) }, journal: '在赌坊赢了银两。' },
      { text: '赌坊里有人出老千被抓，被打断了手扔了出去。', effects: {}, journal: '目睹赌坊出老千被抓。' },
      { text: '你赌红了眼，一把押上全部身家，结果输了个精光。', effects: { silver: -Math.floor((Math.random()*500)+100) }, journal: '在赌坊输了银两。' },
    ],
    '御花园': [
      { text: '你在御花园漫步，遇到一位嫔妃正在赏花，她对你微微一笑。', effects: { charm: 2 }, journal: '在御花园偶遇嫔妃。' },
      { text: '御花园的牡丹开得正盛，你忍不住驻足观赏，心情舒畅。', effects: { hp: 10, spirit: 5 }, journal: '在御花园赏花。' },
    ],
  },

  // ===== 清风镇 =====
  '清风镇': {
    '铁匠铺': [
      { text: '铁匠铺的老铁匠正在打造一把宝剑，火星四溅，你看得入了迷。', effects: { enlightenment: 1 }, journal: '在铁匠铺看打铁。', options: [{ text: '请教锻造术', effect: { forgeExp: 20 } }, { text: '购买兵器', effect: { silver: -100, randomItem: 'weapon' } }] },
      { text: '老铁匠说他最近缺一批精铁，如果你能带来，可以半价打造兵器。', effects: {}, journal: '老铁匠需要精铁。' },
    ],
    '药铺': [
      { text: '药铺的老大夫正在给病人诊脉，你在一旁等候，学到了一些药理知识。', effects: { enlightenment: 1, alchemyExp: 10 }, journal: '在药铺学药理。' },
      { text: '药铺新到了一批百年人参，价格不菲。', effects: {}, journal: '药铺新到百年人参。', options: [{ text: '购买人参', effect: { silver: -300, item: '人参' } }, { text: '看看就走', effect: {} }] },
    ],
    '茶馆': [
      { text: '茶馆里说书先生正在讲一段仙侠传奇，你听得津津有味。', effects: { enlightenment: 1, spirit: 5 }, journal: '在茶馆听说书。' },
      { text: '邻桌两个江湖人在窃窃私语，似乎在商量一笔大买卖。', effects: {}, journal: '在茶馆听到江湖人密谈。' },
      { text: '茶馆老板娘给你端来一壶好茶，说是新到的明前龙井。', effects: { spirit: 10, charm: 1 }, journal: '在茶馆喝明前龙井。' },
    ],
    '驿站': [
      { text: '驿站的驿卒正在分拣信件，你看到一封寄往青云剑宗的急件。', effects: {}, journal: '在驿站看到急件。' },
      { text: '你在驿站遇到一位赶路的商人，他说可以捎你一程去下一个城镇。', effects: {}, journal: '在驿站遇到商人。', options: [{ text: '搭车同行', effect: { travel: true } }, { text: '婉言谢绝', effect: {} }] },
    ],
    '种子铺': [
      { text: '种子铺老板向你推荐一种新到的灵谷种子，据说产量是普通种子的三倍。', effects: {}, journal: '在种子铺看到灵谷种子。', options: [{ text: '购买种子', effect: { silver: -50, item: '种子' } }, { text: '不感兴趣', effect: {} }] },
    ],
    '民居区': [
      { text: '你在民居区散步，听到一户人家传来争吵声，似乎是夫妻不和。', effects: {}, journal: '在民居区听到争吵。' },
      { text: '一个老婆婆摔倒在路边，你上前扶起了她。', effects: { reputation: 5, karma: 3 }, journal: '扶起摔倒的老婆婆。' },
    ],
  },

  // ===== 落日森林 =====
  '落日森林': {
    '采集区': [
      { text: '你在采集区发现了一株罕见的灵草，小心翼翼地采了下来。', effects: { item: '灵草', count: randInt(1, 3), cultivationExp: 20 }, journal: '在采集区采到灵草。' },
      { text: '采集区的草药被人采光了，你只找到一些普通的野草。', effects: { cultivationExp: 5 }, journal: '采集区草药被采光。' },
      { text: '你采药时惊动了一条毒蛇，被咬了一口！', effects: { hp: -20, status: '中毒' }, journal: '采药时被毒蛇咬伤。' },
    ],
    '猎场': [
      { text: '你在猎场追踪一只野兔，追了半天终于捕获。', effects: { item: '兽肉', count: randInt(1, 2), cultivationExp: 15 }, journal: '在猎场捕获野兔。' },
      { text: '你遇到一头野猪，经过一番搏斗将其猎杀。', effects: { item: '兽皮', item2: '兽肉', hp: -10, cultivationExp: 30 }, journal: '在猎场猎杀野猪。' },
      { text: '猎场里遇到另一个猎人，他邀请你一起狩猎。', effects: {}, journal: '在猎场遇到猎人。', options: [{ text: '结伴狩猎', effect: { item: '兽肉', count: 3, reputation: 3 } }, { text: '独自行动', effect: {} }] },
    ],
    '迷瘴沼泽': [
      { text: '沼泽中瘴气弥漫，你屏住呼吸快速穿过，还是感到一阵头晕。', effects: { hp: -15, spirit: -10 }, journal: '穿越迷瘴沼泽。' },
      { text: '你在沼泽中发现了一株罕见的毒菇，这可是炼制毒药的好材料。', effects: { item: '断肠草', cultivationExp: 25 }, journal: '在沼泽发现毒菇。' },
      { text: '沼泽深处传来诡异的叫声，似乎有什么危险的东西。', effects: {}, journal: '听到沼泽深处的诡异叫声。', options: [{ text: '深入探查', effect: { combat: true, randomItem: true } }, { text: '速速离开', effect: {} }] },
    ],
  },

  // ===== 东海渔村 =====
  '东海渔村': {
    '码头出海': [
      { text: '你乘船出海，海风拂面，远处海鸥翱翔。', effects: { spirit: 10 }, journal: '乘船出海。' },
      { text: '渔船捞起了一网海鱼，收获颇丰。', effects: { item: '兽肉', count: randInt(2, 5), silver: randInt(20, 80) }, journal: '出海捕鱼丰收。' },
      { text: '海上突然起了风暴，渔船剧烈摇晃，你险些落水。', effects: { hp: -15 }, journal: '出海遇到风暴。' },
      { text: '你在海上看到一座海市蜃楼，里面似乎有仙山楼阁。', effects: { enlightenment: 3 }, journal: '看到海市蜃楼。' },
    ],
    '鱼市': [
      { text: '鱼市上各种海鲜琳琅满目，你买了几条新鲜的海鱼。', effects: { silver: -30, item: '兽肉', count: 2 }, journal: '在鱼市买海鱼。' },
      { text: '鱼市老板说今天捕到了一条罕见的深海灵鱼，吃了可以增长修为。', effects: {}, journal: '鱼市有深海灵鱼。', options: [{ text: '买下灵鱼', effect: { silver: -200, cultivationExp: 100 } }, { text: '太贵了', effect: {} }] },
    ],
  },

  // ===== 黑风寨 =====
  '黑风寨': {
    '剿匪副本一层': [
      { text: '你潜入黑风寨，与山贼喽啰搏斗数合，打得他们抱头鼠窜。', effects: { cultivationExp: 120 }, journal: '在黑风寨剿匪。' },
      { text: '你在寨中瞭望哨上俯视群山，发现黑风寨依山而建，易守难攻。', effects: { cultivationExp: 80, enlightenment: 5 }, journal: '探明黑风寨地形。' },
      { text: '你撞见几个山贼在寨门口分赃，上前呵斥，山贼一哄而散。', effects: { silver: 80, reputation: 5 }, journal: '在黑风寨驱散分赃山贼。' },
      { text: '寨中酒香四溢，你混进山贼的酒宴，探听到寨主三层的布防消息。', effects: { cultivationExp: 150 }, journal: '混入黑风寨酒宴探听消息。' },
    ],
    '剿匪副本二层': [
      { text: '你摸上黑风寨二层，与山贼精兵短兵相接，一路杀向聚义厅。', effects: { cultivationExp: 200 }, journal: '强攻黑风寨二层。' },
      { text: '聚义厅前，二当家铁背熊正在饮酒，见你闯入，摔杯而起。', effects: { cultivationExp: 180 }, journal: '直面黑风寨二当家。' },
    ],
    '剿匪副本三层': [
      { text: '你登上黑风寨三层总坛，山贼头目层层拦路，刀光血影。', effects: { cultivationExp: 260 }, journal: '强攻黑风寨三层。' },
      { text: '总坛深处，大当家黑风虎端坐虎皮椅，目光如炬："敢上我这黑风寨的，你是头一个。"', effects: { cultivationExp: 300, reputation: 10 }, journal: '直面黑风寨大当家。' },
    ],
  },

  // ===== 青云剑宗 =====
  '青云剑宗': {
    '功法阁': [
      { text: '你在功法阁中翻阅典籍，发现一门失传的剑诀。', effects: { cultivationExp: 80, enlightenment: 3 }, journal: '在功法阁发现失传剑诀。' },
      { text: '功法阁的长老考验你的悟性，问了你几个修炼难题，你对答如流。', effects: { reputation: 5, enlightenment: 2 }, journal: '通过功法阁长老考验。' },
      { text: '你想借阅一本高级功法，被守门弟子拦下，说需要宗门贡献。', effects: {}, journal: '被功法阁守门弟子拦下。' },
    ],
    '试炼塔': [
      { text: '你进入试炼塔第一层，面对一个和你实力相当的幻影。', effects: { cultivationExp: 50, hp: -20 }, journal: '挑战试炼塔第一层。' },
      { text: '试炼塔中灵气浓郁，你修炼了一会儿，修为大有精进。', effects: { cultivationExp: 100, spirit: 20 }, journal: '在试炼塔修炼。' },
    ],
    '灵田矿脉': [
      { text: '你在灵田中劳作了一天，收获了一些灵谷。', effects: { item: '粮食', count: randInt(3, 8), cultivationExp: 20 }, journal: '在灵田劳作。' },
      { text: '矿脉中发现了一块品相不错的灵石矿。', effects: { item: '下品灵石', count: randInt(1, 5) }, journal: '在矿脉挖到灵石。' },
    ],
    '洗剑池': [
      { text: '你在洗剑池边静坐，感受到无数剑意环绕，对剑道的理解更深了。', effects: { enlightenment: 5, cultivationExp: 60 }, journal: '在洗剑池悟剑。' },
      { text: '洗剑池中浮出一把古剑，似乎是前人遗留。', effects: {}, journal: '洗剑池浮出古剑。', options: [{ text: '取剑', effect: { randomItem: 'weapon', combat: true } }, { text: '不取', effect: { enlightenment: 2 } }] },
    ],
    '镇魔塔': [
      { text: '镇魔塔中传来阵阵魔气，你感到一股压迫感。', effects: { spirit: -10 }, journal: '感受到镇魔塔的魔气。' },
      { text: '镇魔塔的守卫告诉你，塔里镇压着上古魔头，不可靠近。', effects: {}, journal: '得知镇魔塔镇压魔头。' },
    ],
  },

  // ===== 丹塔 =====
  '丹塔': {
    '丹方藏经阁': [
      { text: '你在丹方藏经阁中研读，学会了一张新丹方。', effects: { alchemyExp: 50, enlightenment: 2 }, journal: '在藏经阁学会新丹方。' },
      { text: '藏经阁深处有一卷古丹方，文字晦涩难懂，你研究了半天才略有所悟。', effects: { alchemyExp: 100, enlightenment: 5 }, journal: '研读古丹方。' },
      { text: '你发现一张被人遗漏的丹方，似乎是失传的上古丹方。', effects: { alchemyExp: 150, reputation: 10 }, journal: '发现失传上古丹方。' },
    ],
    '丹炉租赁': [
      { text: '你租了一尊丹炉，尝试炼制丹药，火候控制得不错。', effects: { alchemyExp: 30, item: '回灵丹', count: randInt(1, 3) }, journal: '租丹炉炼丹成功。' },
      { text: '炼丹时火候过猛，丹炉炸了，你被炸得灰头土脸。', effects: { alchemyExp: 10, hp: -15, silver: -50 }, journal: '炼丹失败炸炉。' },
    ],
    '丹道论战': [
      { text: '你参加丹道论战，与几位炼丹师辩论丹道，你的观点得到了大家的认可。', effects: { reputation: 10, enlightenment: 3, alchemyExp: 50 }, journal: '参加丹道论战获胜。' },
      { text: '论战中一位老炼丹师反驳了你的观点，你虚心接受，受益匪浅。', effects: { enlightenment: 5, alchemyExp: 80 }, journal: '在丹道论战中受教。' },
    ],
    '药王园': [
      { text: '你在药王园中采药，这里的草药品质极佳。', effects: { item: '灵草', count: randInt(2, 5), alchemyExp: 20 }, journal: '在药王园采药。' },
      { text: '药王园的守护灵鹤攻击你，你费了一番力气才将其赶走。', effects: { hp: -25, cultivationExp: 40 }, journal: '被药王园灵鹤攻击。' },
    ],
  },

  // ===== 天星阁 =====
  '天星阁': {
    '星盘推演': [
      { text: '你用星盘推演天机，看到了一段模糊的未来画面。', effects: { enlightenment: 5, cultivationExp: 50 }, journal: '用星盘推演天机。' },
      { text: '星盘显示你近期有财运，果然在路上捡到了一袋银两。', effects: { silver: randInt(50, 200), luck: 3 }, journal: '星盘显示财运，果然捡到银两。' },
    ],
    '命格占卜': [
      { text: '天星阁阁主为你占卜命格，说你是大器晚成之相，中年后必有大机缘。', effects: { enlightenment: 3, spirit: 10 }, journal: '占卜命格为大器晚成。' },
      { text: '占卜结果显示你命犯桃花，近期会有一段姻缘。', effects: { charm: 5 }, journal: '占卜命犯桃花。' },
    ],
    '星辰灌体': [
      { text: '你在观星台吸收星辰之力，感觉体内灵力澎湃。', effects: { cultivationExp: 100, spirit: 30, mp: 20 }, journal: '吸收星辰之力。' },
      { text: '星辰灌体时走火入魔，你强行压制，受了些内伤。', effects: { cultivationExp: 50, hp: -40 }, journal: '星辰灌体走火入魔。' },
    ],
  },

  // ===== 兽灵山 =====
  '兽灵山': {
    '灵宠蛋交易市场': [
      { text: '交易市场的货架上摆满了各色灵兽蛋，一只只灵光流转，仿佛在等待有缘人。', effects: { enlightenment: 2 }, journal: '逛灵宠蛋交易市场。' },
      { text: '你与摊主讨价还价，最终以实惠的价格买了一枚灵兽蛋。', effects: { spiritStone: -randInt(20, 60), reputation: 2 }, journal: '在灵宠蛋交易市场购得灵兽蛋。' },
    ],
    '灵兽用品区': [
      { text: '你在灵兽用品区挑选了一批灵兽口粮，准备回去好好投喂灵宠。', effects: { spiritStone: -20, reputation: 1 }, journal: '在灵兽用品区购买口粮。' },
      { text: '你向老掌柜请教喂食灵兽的诀窍，他告诉你不同食物对灵兽晋升效果不同。', effects: { enlightenment: 3 }, journal: '请教灵兽喂养诀窍。' },
    ],
  },

  // ===== 魔域深渊 =====
  
  // ===== 幽冥鬼域 =====
  
  // ===== 酆都城 =====
  
  // ===== 洞天福地 =====
  '洞天福地': {
    '时间加速': [
      { text: '你在时间加速区域修炼，外界一日，洞中一年，修为突飞猛进。', effects: { cultivationExp: 500, age: 1 }, journal: '在时间加速区修炼。' },
      { text: '时间流速紊乱，你在里面待了一会儿，出来发现头发都白了几根。', effects: { cultivationExp: 200, age: randInt(1, 3) }, journal: '时间流速紊乱导致衰老。' },
    ],
    '灵泉': [
      { text: '你在灵泉中沐浴，泉水蕴含的灵气渗入体内，修为大进。', effects: { cultivationExp: 150, hp: 50, mp: 30 }, journal: '在灵泉沐浴修炼。' },
      { text: '灵泉中有一条灵鱼，你抓住后吃了，味道鲜美且增长修为。', effects: { cultivationExp: 80, hp: 20 }, journal: '吃了灵泉中的灵鱼。' },
    ],
    '独立灵田': [
      { text: '你在独立灵田种植灵草，长势喜人。', effects: { item: '灵草', count: randInt(3, 8) }, journal: '在独立灵田种灵草。' },
      { text: '灵田被妖兽糟蹋了，你心疼不已。', effects: {}, journal: '灵田被妖兽糟蹋。' },
    ],
    '傀儡守卫': [
      { text: '你尝试操控傀儡守卫，费了半天劲才让它动起来。', effects: { enlightenment: 3, formationExp: 30 }, journal: '尝试操控傀儡守卫。' },
      { text: '傀儡守卫突然失控，向你发起攻击！', effects: { hp: -30 }, journal: '傀儡守卫失控攻击。', options: [{ text: '战斗', effect: { combat: true } }, { text: '逃跑', effect: { spirit: -10 } }] },
    ],
  },

  // ===== 龙渊 =====
  '龙渊': {
    '龙威试炼': [
      { text: '你承受龙威压制，咬紧牙关坚持了下来，意志得到磨练。', effects: { willpower: 10, cultivationExp: 100, hp: -20 }, journal: '通过龙威试炼。' },
      { text: '龙威太强，你被压得跪倒在地，受了些内伤。', effects: { hp: -40, willpower: 3 }, journal: '龙威试炼失败。' },
    ],
    '祖龙骸骨': [
      { text: '你在祖龙骸骨前感悟，感受到龙族的传承之力。', effects: { enlightenment: 8, cultivationExp: 200 }, journal: '在祖龙骸骨前感悟。' },
      { text: '骸骨中飞出一道龙魂，向你发起挑战。', effects: {}, journal: '龙魂挑战。', options: [{ text: '迎战', effect: { combat: true, cultivationExp: 300 } }, { text: '退避', effect: { willpower: -5 } }] },
    ],
    '龙蛋孵化': [
      { text: '你用灵力孵化龙蛋，蛋壳裂开，一条小龙钻了出来。', effects: { randomPet: true, spiritStone: -100 }, journal: '孵化出小龙。' },
      { text: '龙蛋毫无反应，似乎需要更纯净的灵力才能孵化。', effects: {}, journal: '龙蛋孵化失败。' },
    ],
  },

  // ===== 通天古路 =====
  '通天古路': {
    '九重天梯': [
      { text: '你攀登九重天梯，每一步都感受到巨大的压力，但修为也在飞速增长。', effects: { cultivationExp: 300, hp: -50, willpower: 10 }, journal: '攀登九重天梯。' },
      { text: '你爬到一半就力竭了，滚了下来，摔得鼻青脸肿。', effects: { hp: -60, cultivationExp: 100 }, journal: '攀登天梯失败滚落。' },
    ],
    '化劫池': [
      { text: '你在化劫池中淬炼身体，劫火焚身，痛苦万分但脱胎换骨。', effects: { cultivationExp: 400, hp: -80, constitution: 10 }, journal: '在化劫池脱胎换骨。' },
      { text: '化劫池的劫火太猛，你差点被烧成灰烬。', effects: { hp: -100 }, journal: '化劫池差点被烧死。' },
    ],
    '升仙碑': [
      { text: '你在升仙碑前留下名字，碑面金光一闪，似乎认可了你的实力。', effects: { reputation: 20, enlightenment: 10 }, journal: '在升仙碑留名。' },
      { text: '升仙碑对你毫无反应，看来你的修为还不够。', effects: {}, journal: '升仙碑未认可。' },
    ],
  },
};

// 通用地点剧情（用于没有特定剧情的按钮）
const GENERIC_EVENTS = [
  { text: '你在这里转了一圈，没有发现什么特别的东西。', effects: { cultivationExp: 10 }, journal: '在此地闲逛。' },
  { text: '你遇到一个路人，闲聊了几句便分开了。', effects: { spirit: 5 }, journal: '与路人闲聊。' },
  { text: '你在这里修炼了一会儿，略有收获。', effects: { cultivationExp: 20, spirit: 10 }, journal: '在此地修炼。' },
  { text: '你看到天边有一道剑光飞过，似乎是某位高人路过。', effects: { enlightenment: 1 }, journal: '看到高人剑光。' },
  { text: '一阵微风吹过，带来远方的气息，你若有所思。', effects: { enlightenment: 2 }, journal: '若有所思。' },
];

// 获取某地点某按钮的随机剧情
function getLocationEvent(location, button) {
  const locEvents = LOCATION_EVENTS[location];
  if (locEvents && locEvents[button] && locEvents[button].length > 0) {
    return randChoice(locEvents[button]);
  }
  return randChoice(GENERIC_EVENTS);
}

// 获取某地点所有按钮的剧情
function getLocationEvents(location) {
  return LOCATION_EVENTS[location] || {};
}

module.exports = { LOCATION_EVENTS, GENERIC_EVENTS, getLocationEvent, getLocationEvents };
