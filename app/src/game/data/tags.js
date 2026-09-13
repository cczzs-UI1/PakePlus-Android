// 标签系统 - 人物标签定义、效果、触发剧情
// 标签分类：身体特征、性格特质、身份背景、特殊际遇、情感状态、修为特质

const TAGS = {
  // ===== 身体特征标签 =====
  body: {
    beautiful: {
      name: '倾国倾城', desc: '容貌绝美，令人一见倾心',
      effects: { charm: 20, reputation: 5 },
      triggerChance: 0.15,
    },
    handsome: {
      name: '英俊潇洒', desc: '面容俊朗，风度翩翩',
      effects: { charm: 15, reputation: 3 },
      triggerChance: 0.12,
    },
    ugly: {
      name: '其貌不扬', desc: '容貌丑陋，常遭人白眼',
      effects: { charm: -15, willpower: 5 },
      triggerChance: 0.1,
    },
    strong: {
      name: '虎背熊腰', desc: '身材魁梧，力大无穷',
      effects: { strength: 15, constitution: 10 },
      triggerChance: 0.1,
    },
    weak: {
      name: '体弱多病', desc: '身体孱弱，时常生病',
      effects: { constitution: -15, hpMax: -50 },
      triggerChance: 0.12,
    },
    tall: {
      name: '身高八尺', desc: '身材高大，气势逼人',
      effects: { strength: 5, intimidation: 10 },
      triggerChance: 0.08,
    },
    short: {
      name: '小巧玲珑', desc: '身材娇小，灵活敏捷',
      effects: { agility: 10, dodge: 5 },
      triggerChance: 0.08,
    },
    scar: {
      name: '身有疤痕', desc: '身上有明显的伤疤，透着沧桑',
      effects: { intimidation: 10, willpower: 5 },
      triggerChance: 0.1,
    },
    tattoo: {
      name: '身有纹身', desc: '身上有神秘的纹身图案',
      effects: { intimidation: 8, mystery: 10 },
      triggerChance: 0.08,
    },
    heterochromia: {
      name: '异色双瞳', desc: '双眼颜色不同，奇异非常',
      effects: { mystery: 15, perception: 10 },
      triggerChance: 0.05,
    },
    silver_hair: {
      name: '一头银发', desc: '天生银发，超凡脱俗',
      effects: { charm: 10, mystery: 10 },
      triggerChance: 0.06,
    },
    red_hair: {
      name: '红发如火', desc: '一头红发，热情似火',
      effects: { charm: 8, aggression: 10 },
      triggerChance: 0.06,
    },
    delicate: {
      name: '肌肤胜雪', desc: '皮肤白皙细腻，如凝脂一般',
      effects: { charm: 12 },
      triggerChance: 0.1,
    },
    muscular: {
      name: '肌肉虬结', desc: '浑身肌肉，充满爆发力',
      effects: { strength: 12, attack: 8 },
      triggerChance: 0.08,
    },
    limp: {
      name: '腿脚不便', desc: '一条腿有残疾，行走不便',
      effects: { agility: -20, speed: -15 },
      triggerChance: 0.05,
    },
    blind: {
      name: '双目失明', desc: '双眼看不见，但其他感官异常敏锐',
      effects: { perception: 20, hearing: 30, agility: -10 },
      triggerChance: 0.03,
    },
    deaf: {
      name: '双耳失聪', desc: '听不见声音，但视觉极为敏锐',
      effects: { perception: 15, sight: 25 },
      triggerChance: 0.03,
    },
    eunuch: {
      name: '断情绝欲', desc: '无欲无求',
      effects: { charm: -5, willpower: 15, yin: 20 },
      triggerChance: 0.04,
    },
    virgin: {
      name: '处子之身', desc: '尚未经历人事，元阴/元阳未失',
      effects: { purity: 20, cultivationSpeed: 5 },
      triggerChance: 0.15,
    },
    experienced: {
      name: '阅人无数', desc: '情场老手，深谙男女之事',
      effects: { charm: 10, seduction: 20 },
      triggerChance: 0.1,
    },
  },

  // ===== 性格特质标签 =====
  personality: {
    kind: {
      name: '心地善良', desc: '心怀慈悲，乐于助人',
      effects: { merit: 10, reputation: 5 },
      triggerChance: 0.12,
    },
    cruel: {
      name: '心狠手辣', desc: '行事狠辣，不留余地',
      effects: { sin: 15, intimidation: 10 },
      triggerChance: 0.1,
    },
    loyal: {
      name: '忠义无双', desc: '重情重义，忠心耿耿',
      effects: { reputation: 10, willpower: 10 },
      triggerChance: 0.1,
    },
    treacherous: {
      name: '阴险狡诈', desc: '城府极深，惯于背刺',
      effects: { intrigue: 20, sin: 5 },
      triggerChance: 0.08,
    },
    brave: {
      name: '英勇无畏', desc: '胆识过人，不惧强敌',
      effects: { courage: 20, attack: 5 },
      triggerChance: 0.1,
    },
    cowardly: {
      name: '胆小如鼠', desc: '遇事退缩，贪生怕死',
      effects: { courage: -20, dodge: 10 },
      triggerChance: 0.08,
    },
    wise: {
      name: '睿智过人', desc: '智慧超群，料事如神',
      effects: { intelligence: 20, enlightenment: 10 },
      triggerChance: 0.08,
    },
    foolish: {
      name: '愚不可及', desc: '头脑简单，易被欺骗',
      effects: { intelligence: -20, gullible: 20 },
      triggerChance: 0.08,
    },
    greedy: {
      name: '贪财好色', desc: '贪图财富，迷恋美色',
      effects: { greed: 20, lust: 15 },
      triggerChance: 0.12,
    },
    generous: {
      name: '慷慨大方', desc: '乐善好施，不吝财物',
      effects: { reputation: 15, charm: 5 },
      triggerChance: 0.08,
    },
    jealous: {
      name: '嫉贤妒能', desc: '心胸狭窄，见不得别人好',
      effects: { intrigue: 10, sin: 5 },
      triggerChance: 0.1,
    },
    humble: {
      name: '谦虚谨慎', desc: '为人低调，不骄不躁',
      effects: { enlightenment: 10, reputation: 5 },
      triggerChance: 0.08,
    },
    proud: {
      name: '骄傲自大', desc: '目空一切，刚愎自用',
      effects: { intimidation: 10, reputation: -5 },
      triggerChance: 0.1,
    },
    diligent: {
      name: '勤奋刻苦', desc: '勤学不辍，孜孜不倦',
      effects: { cultivationSpeed: 15, willpower: 10 },
      triggerChance: 0.1,
    },
    lazy: {
      name: '好吃懒做', desc: '游手好闲，不思进取',
      effects: { cultivationSpeed: -15, laziness: 20 },
      triggerChance: 0.1,
    },
    chaste: {
      name: '冰清玉洁', desc: '守身如玉，不近男色/女色',
      effects: { purity: 25, willpower: 15 },
      triggerChance: 0.08,
    },
    lustful: {
      name: '欲壑难填', desc: '沉迷情欲，难以自拔',
      effects: { lust: 25, seduction: 10 },
      triggerChance: 0.12,
    },
    vengeful: {
      name: '睚眦必报', desc: '有仇必报，绝不手软',
      effects: { vengeance: 20, willpower: 10 },
      triggerChance: 0.1,
    },
    forgiving: {
      name: '宽宏大量', desc: '不计前嫌，以德报怨',
      effects: { merit: 15, reputation: 10 },
      triggerChance: 0.06,
    },
    mysterious: {
      name: '神秘莫测', desc: '来历成谜，行事诡异',
      effects: { mystery: 25, intrigue: 10 },
      triggerChance: 0.08,
    },
  },

  // ===== 身份背景标签 =====
  background: {
    noble: {
      name: '名门之后', desc: '出身名门望族，家世显赫',
      effects: { reputation: 20, spiritStone: 1000 },
      triggerChance: 0.08,
    },
    commoner: {
      name: '平民出身', desc: '普通人家出身，无依无靠',
      effects: { willpower: 10 },
      triggerChance: 0.2,
    },
    orphan: {
      name: '孤儿', desc: '自幼父母双亡，孤苦伶仃',
      effects: { willpower: 15, independence: 20 },
      triggerChance: 0.12,
    },
    rich: {
      name: '富甲一方', desc: '家财万贯，富可敌国',
      effects: { spiritStone: 5000, reputation: 10 },
      triggerChance: 0.05,
    },
    poor: {
      name: '一贫如洗', desc: '家徒四壁，穷困潦倒',
      effects: { spiritStone: -500, willpower: 10 },
      triggerChance: 0.15,
    },
    scholar: {
      name: '书香门第', desc: '世代读书，学识渊博',
      effects: { intelligence: 15, reputation: 5 },
      triggerChance: 0.08,
    },
    military: {
      name: '将门之后', desc: '祖辈从军，武艺传家',
      effects: { strength: 10, attack: 8 },
      triggerChance: 0.08,
    },
    merchant: {
      name: '商贾之家', desc: '世代经商，精于算计',
      effects: { intelligence: 10, business: 20 },
      triggerChance: 0.1,
    },
    farmer: {
      name: '农家子弟', desc: '世代务农，勤劳朴实',
      effects: { constitution: 10, willpower: 5 },
      triggerChance: 0.15,
    },
    artisan: {
      name: '匠人之后', desc: '祖辈手艺，精巧绝伦',
      effects: { dexterity: 15, craftsmanship: 20 },
      triggerChance: 0.08,
    },
    criminal: {
      name: '罪臣之后', desc: '家族获罪，背负骂名',
      effects: { reputation: -20, sin: 10 },
      triggerChance: 0.05,
    },
    slave: {
      name: '曾为奴隶', desc: '曾经是奴隶，受尽屈辱',
      effects: { willpower: 20, hatred: 15 },
      triggerChance: 0.05,
    },
    refugee: {
      name: '流亡之人', desc: '因战乱流离失所',
      effects: { survival: 20, willpower: 10 },
      triggerChance: 0.08,
    },
    retired: {
      name: '退隐江湖', desc: '曾经叱咤风云，如今归隐',
      effects: { mystery: 15, experience: 20 },
      triggerChance: 0.05,
    },
    wanted: {
      name: '通缉要犯', desc: '被官府通缉，四处逃亡',
      effects: { sin: 20, stealth: 15 },
      triggerChance: 0.05,
    },
    bounty_hunter: {
      name: '赏金猎人', desc: '以捉拿通缉犯为生',
      effects: { combat: 15, tracking: 20 },
      triggerChance: 0.06,
    },
    doctor: {
      name: '医者仁心', desc: '精通医术，救死扶伤',
      effects: { healing: 25, merit: 10 },
      triggerChance: 0.06,
    },
    poisoner: {
      name: '用毒高手', desc: '精通毒术，杀人无形',
      effects: { poison: 25, stealth: 10 },
      triggerChance: 0.05,
    },
    thief: {
      name: '妙手空空', desc: '轻功了得，擅长偷盗',
      effects: { stealth: 25, agility: 15 },
      triggerChance: 0.06,
    },
    assassin: {
      name: '暗影刺客', desc: '行踪诡秘，一击必杀',
      effects: { attack: 15, stealth: 20, critical: 10 },
      triggerChance: 0.04,
    },
  },

  // ===== 特殊际遇标签 =====
  destiny: {
    chosen_one: {
      name: '天选之人', desc: '被命运选中，气运加身',
      effects: { luck: 30, destiny: 20 },
      triggerChance: 0.03,
    },
    cursed: {
      name: '身负诅咒', desc: '被邪恶诅咒缠身，命运多舛',
      effects: { luck: -20, darkPower: 15 },
      triggerChance: 0.05,
    },
    reincarnated: {
      name: '转世重修', desc: '前世记忆尚存，经验丰富',
      effects: { experience: 30, enlightenment: 15 },
      triggerChance: 0.04,
    },
    transmigrated: {
      name: '穿越者', desc: '来自另一个世界，知识渊博',
      effects: { intelligence: 25, creativity: 20 },
      triggerChance: 0.03,
    },
    blessed: {
      name: '神灵庇佑', desc: '得到神灵的祝福',
      effects: { luck: 20, merit: 15 },
      triggerChance: 0.05,
    },
    demon_possessed: {
      name: '魔物附体', desc: '体内有魔物寄居，力量强大但危险',
      effects: { attack: 20, darkPower: 25, sanity: -10 },
      triggerChance: 0.04,
    },
    spirit_guide: {
      name: '灵体相伴', desc: '有灵体一直陪伴左右',
      effects: { perception: 20, mystery: 15 },
      triggerChance: 0.05,
    },
    ancient_inheritance: {
      name: '上古传承', desc: '获得了上古大能的传承',
      effects: { cultivationSpeed: 20, power: 15 },
      triggerChance: 0.03,
    },
    bloodline: {
      name: '神兽血脉', desc: '体内流着神兽的血液',
      effects: { power: 20, constitution: 15 },
      triggerChance: 0.04,
    },
    innately_weak: {
      name: '天生绝脉', desc: '经脉天生堵塞，修炼困难',
      effects: { cultivationSpeed: -30, but: '突破后实力远超同阶' },
      triggerChance: 0.05,
    },
    photographic_memory: {
      name: '过目不忘', desc: '记忆力超群，学什么都快',
      effects: { intelligence: 20, learningSpeed: 25 },
      triggerChance: 0.05,
    },
    battle_genius: {
      name: '战斗天才', desc: '天生的战斗机器，悟性极高',
      effects: { combat: 25, learningSpeed: 15 },
      triggerChance: 0.05,
    },
    alchemy_genius: {
      name: '丹道奇才', desc: '对炼丹有超凡的天赋',
      effects: { alchemy: 25, learningSpeed: 15 },
      triggerChance: 0.04,
    },
    forge_genius: {
      name: '炼器鬼才', desc: '对炼器有独特的理解',
      effects: { forge: 25, craftsmanship: 15 },
      triggerChance: 0.04,
    },
    formation_genius: {
      name: '阵法宗师', desc: '对阵法有天生的敏感度',
      effects: { formation: 25, intelligence: 10 },
      triggerChance: 0.04,
    },
    beast_tamer: {
      name: '万兽亲和', desc: '天生能与妖兽沟通',
      effects: { pet: 25, charm: 10 },
      triggerChance: 0.05,
    },
    lucky_star: {
      name: '福星高照', desc: '运气好到离谱',
      effects: { luck: 25, dropRate: 20 },
      triggerChance: 0.04,
    },
    unlucky: {
      name: '霉运缠身', desc: '喝凉水都塞牙',
      effects: { luck: -25, but: '大难不死必有后福' },
      triggerChance: 0.05,
    },
    wealthy_encounter: {
      name: '贵人相助', desc: '生命中总有贵人出现',
      effects: { reputation: 10, opportunity: 20 },
      triggerChance: 0.06,
    },
    love_rival: {
      name: '情场失意', desc: '感情路上总是坎坷',
      effects: { loveLuck: -20, but: '最终会遇到真爱' },
      triggerChance: 0.08,
    },
  },

  // ===== 情感状态标签 =====
  emotion: {
    in_love: {
      name: '深陷情网', desc: '正处于热恋之中',
      effects: { happiness: 20, cultivationSpeed: -5 },
      triggerChance: 0.1,
    },
    heartbroken: {
      name: '心如死灰', desc: '被情所伤，万念俱灰',
      effects: { happiness: -20, willpower: 10 },
      triggerChance: 0.08,
    },
    jealous_love: {
      name: '妒火中烧', desc: '因爱生妒，难以自控',
      effects: { aggression: 15, rationality: -10 },
      triggerChance: 0.08,
    },
    unrequited: {
      name: '暗恋之人', desc: '默默喜欢着某人，不敢表白',
      effects: { melancholy: 15, writing: 10 },
      triggerChance: 0.12,
    },
    married: {
      name: '已婚', desc: '已经成家立业',
      effects: { stability: 20, responsibility: 15 },
      triggerChance: 0.1,
    },
    widowed: {
      name: '丧偶', desc: '伴侣已逝，独自生活',
      effects: { melancholy: 15, independence: 10 },
      triggerChance: 0.06,
    },
    divorced: {
      name: '和离', desc: '与伴侣和平分开',
      effects: { freedom: 15, melancholy: 5 },
      triggerChance: 0.05,
    },
    engaged: {
      name: '已定亲', desc: '已有婚约在身',
      effects: { stability: 10, pressure: 10 },
      triggerChance: 0.08,
    },
    secret_lover: {
      name: '地下情人', desc: '有不能公开的恋人',
      effects: { excitement: 15, risk: 15 },
      triggerChance: 0.06,
    },
    betrayed: {
      name: '遭人背叛', desc: '被信任的人背叛过',
      effects: { distrust: 25, caution: 15 },
      triggerChance: 0.08,
    },
    grateful: {
      name: '感恩戴德', desc: '对某人感激不尽',
      effects: { loyalty: 20, kindness: 10 },
      triggerChance: 0.1,
    },
    vengeful_love: {
      name: '因爱生恨', desc: '由爱转恨，一心报复',
      effects: { vengeance: 25, darkness: 10 },
      triggerChance: 0.05,
    },
    longing: {
      name: '思念远方', desc: '思念着远方的人',
      effects: { melancholy: 15, focus: -5 },
      triggerChance: 0.1,
    },
    content: {
      name: '知足常乐', desc: '对现状很满足',
      effects: { happiness: 15, stress: -10 },
      triggerChance: 0.1,
    },
    ambitious: {
      name: '野心勃勃', desc: '志在天下，不甘平凡',
      effects: { motivation: 25, ruthlessness: 10 },
      triggerChance: 0.1,
    },
    depressed: {
      name: '郁郁寡欢', desc: '长期情绪低落',
      effects: { happiness: -20, health: -10 },
      triggerChance: 0.08,
    },
    excited: {
      name: '热血沸腾', desc: '充满激情和斗志',
      effects: { motivation: 20, energy: 15 },
      triggerChance: 0.1,
    },
    calm: {
      name: '心如止水', desc: '心境平和，波澜不惊',
      effects: { enlightenment: 15, focus: 10 },
      triggerChance: 0.08,
    },
    angry: {
      name: '怒火中烧', desc: '正处于愤怒之中',
      effects: { aggression: 20, rationality: -15 },
      triggerChance: 0.1,
    },
    fearful: {
      name: '惶恐不安', desc: '心中充满恐惧',
      effects: { caution: 20, courage: -15 },
      triggerChance: 0.08,
    },
  },

  // ===== 修为特质标签 =====
  cultivation: {
    qi_sensation: {
      name: '气感敏锐', desc: '对灵气的感知远超常人',
      effects: { cultivationSpeed: 15, perception: 10 },
      triggerChance: 0.1,
    },
    slow_cultivator: {
      name: '修炼缓慢', desc: '修炼速度比常人慢',
      effects: { cultivationSpeed: -20, but: '基础扎实' },
      triggerChance: 0.1,
    },
    fast_cultivator: {
      name: '修炼神速', desc: '修炼速度极快',
      effects: { cultivationSpeed: 25 },
      triggerChance: 0.05,
    },
    bottleneck_prone: {
      name: '瓶颈频繁', desc: '经常遇到修炼瓶颈',
      effects: { breakthroughRate: -20, but: '突破后实力更强' },
      triggerChance: 0.1,
    },
    smooth_sailing: {
      name: '一路畅通', desc: '修炼几乎没有瓶颈',
      effects: { breakthroughRate: 25 },
      triggerChance: 0.04,
    },
    combat_cultivator: {
      name: '战修', desc: '以战入道，战斗中修炼更快',
      effects: { combatExp: 30, cultivationSpeed: -5 },
      triggerChance: 0.08,
    },
    meditation_cultivator: {
      name: '禅修', desc: '以静入道，打坐修炼效率高',
      effects: { meditationExp: 30, combatExp: -10 },
      triggerChance: 0.08,
    },
    dual_cultivator: {
      name: '双修体质', desc: '适合双修，阴阳调和',
      effects: { dualCultivation: 30, charm: 10 },
      triggerChance: 0.05,
    },
    body_refiner: {
      name: '体修', desc: '主修肉体，肉身成圣',
      effects: { constitution: 20, attack: 10, cultivationSpeed: -10 },
      triggerChance: 0.06,
    },
    sword_innate: {
      name: '天生剑骨', desc: '天生适合练剑',
      effects: { sword: 30, attack: 10 },
      triggerChance: 0.04,
    },
    pill_body: {
      name: '药体', desc: '对丹药吸收效率极高',
      effects: { pillEffect: 30, poisonResist: 15 },
      triggerChance: 0.05,
    },
    spiritual_root_top: {
      name: '天灵根', desc: '最顶级的灵根，修炼一日千里',
      effects: { cultivationSpeed: 50 },
      triggerChance: 0.02,
    },
    spiritual_root_none: {
      name: '无灵根', desc: '没有灵根，无法修炼',
      effects: { cultivationSpeed: -100, but: '可走体修路线' },
      triggerChance: 0.03,
    },
    spiritual_root_mixed: {
      name: '杂灵根', desc: '多种灵根混杂，修炼缓慢',
      effects: { cultivationSpeed: -25 },
      triggerChance: 0.15,
    },
    spiritual_root_dual: {
      name: '双灵根', desc: '两种灵根，资质不错',
      effects: { cultivationSpeed: 10 },
      triggerChance: 0.1,
    },
    spiritual_root_triple: {
      name: '三灵根', desc: '三种灵根，资质一般',
      effects: { cultivationSpeed: -5 },
      triggerChance: 0.12,
    },
    spiritual_root_single: {
      name: '单灵根', desc: '单一灵根，资质上佳',
      effects: { cultivationSpeed: 20 },
      triggerChance: 0.06,
    },
    mutated_spiritual_root: {
      name: '变异灵根', desc: '罕见的变异灵根，潜力巨大',
      effects: { cultivationSpeed: 35, specialPower: 20 },
      triggerChance: 0.02,
    },
    dao_heart: {
      name: '道心坚定', desc: '道心稳固，不易走火入魔',
      effects: { willpower: 25, breakthroughRate: 15 },
      triggerChance: 0.06,
    },
  },
  // ===== 情欲特质标签 =====
  lust: {
    nymphomaniac: {
      name: '花痴', desc: '对情爱极度渴望，难以自持',
      effects: { lust: 30, charm: 10, willpower: -15 },
      triggerChance: 0.08,
    },
    satyriasis: {
      name: '色中饿鬼', desc: '对女色/男色极度贪婪',
      effects: { lust: 25, charm: 5, willpower: -10 },
      triggerChance: 0.08,
    },
    seductive: {
      name: '狐媚惑主', desc: '天生媚骨，善于诱惑他人',
      effects: { charm: 25, seduction: 20, willpower: -5 },
      triggerChance: 0.06,
    },
    voluptuous: {
      name: '丰乳肥臀', desc: '身材火辣，曲线诱人',
      effects: { charm: 20, lust: 15, constitution: 5 },
      triggerChance: 0.07,
    },
    handsome_devil: {
      name: '邪魅狂狷', desc: '容貌邪魅，对异性有致命吸引力',
      effects: { charm: 22, lust: 12, intimidation: 8 },
      triggerChance: 0.06,
    },
    romantic: {
      name: '风流才子', desc: '才情并茂，处处留情',
      effects: { charm: 18, enlightenment: 10, lust: 10 },
      triggerChance: 0.08,
    },
    promiscuous: {
      name: '人尽可夫', desc: '私生活混乱，来者不拒',
      effects: { lust: 28, charm: 8, reputation: -15 },
      triggerChance: 0.05,
    },
    virgin: {
      name: '处子之身', desc: '保持童贞，纯净无瑕',
      effects: { charm: 15, purity: 20, lust: -20 },
      triggerChance: 0.1,
    },
    cuckold: {
      name: '绿帽癖', desc: '喜欢看伴侣与他人亲热',
      effects: { lust: 20, willpower: -10, reputation: -10 },
      triggerChance: 0.03,
    },
    masochist: {
      name: '受虐体质', desc: '在痛苦中能获得快感',
      effects: { lust: 15, painResist: 20, willpower: 5 },
      triggerChance: 0.04,
    },
    sadist: {
      name: '施虐倾向', desc: '喜欢在情爱中虐待对方',
      effects: { lust: 15, intimidation: 15, willpower: 5 },
      triggerChance: 0.04,
    },
    bisexual: {
      name: '双性恋', desc: '男女皆可，来者不拒',
      effects: { lust: 10, charm: 8, social: 5 },
      triggerChance: 0.06,
    },
    incestuous: {
      name: '乱伦倾向', desc: '对亲属有异常的情欲',
      effects: { lust: 20, reputation: -20, karma: -15 },
      triggerChance: 0.02,
    },
    exhibitionist: {
      name: '暴露癖', desc: '喜欢在人前暴露身体',
      effects: { lust: 18, charm: 5, reputation: -10 },
      triggerChance: 0.03,
    },
    voyeur: {
      name: '窥淫癖', desc: '喜欢偷看他人亲热',
      effects: { lust: 15, perception: 10, stealth: 8 },
      triggerChance: 0.04,
    },
    dual_cultivation_body: {
      name: '双修圣体', desc: '天生适合双修，阴阳调和',
      effects: { dualCultivation: 30, charm: 15, cultivationSpeed: 10 },
      triggerChance: 0.03,
    },
    yin_body: {
      name: '纯阴之体', desc: '至阴之体，对男性修士大补',
      effects: { charm: 20, dualCultivation: 25, constitution: -5 },
      triggerChance: 0.03,
    },
    yang_body: {
      name: '纯阳之体', desc: '至阳之体，对女性修士大补',
      effects: { charm: 20, dualCultivation: 25, attack: 10 },
      triggerChance: 0.03,
    },
    lustful_dao: {
      name: '以欲入道', desc: '将情欲化为修行动力',
      effects: { lust: 20, cultivationSpeed: 15, willpower: -5 },
      triggerChance: 0.04,
    },
    frigid: {
      name: '性冷淡', desc: '对情欲毫无兴趣',
      effects: { lust: -30, willpower: 15, concentration: 10 },
      triggerChance: 0.05,
    },
  },
};

// 获取所有标签
function getAllTags() {
  const all = {};
  const { TAG_CONDITIONS } = require('./tagConditions');
  for (const category in TAGS) {
    for (const id in TAGS[category]) {
      all[id] = {
        ...TAGS[category][id],
        category,
        id,
        condition: TAG_CONDITIONS[id]?.desc || '无特殊条件',
      };
    }
  }
  return all;
}

// 随机获取标签（可根据实体条件筛选）
function getRandomTags(count = 3, entity = null) {
  const all = getAllTags();
  let ids = Object.keys(all);

  // 如果提供了实体，只选择符合条件的标签
  if (entity) {
    const { checkTagConditions } = require('./tagConditions');
    ids = ids.filter(id => checkTagConditions(entity, id));
  }

  const selected = [];
  const used = new Set();
  while (selected.length < count && used.size < ids.length) {
    const id = ids[Math.floor(Math.random() * ids.length)];
    if (!used.has(id)) {
      used.add(id);
      selected.push(id);
    }
  }
  return selected;
}

// 应用标签效果到人物属性（实际修改数值）
function applyTagEffects(entity, tagId) {
  const all = getAllTags();
  const tag = all[tagId];
  if (!tag) return;
  if (!entity.tags) entity.tags = [];
  if (!entity.tags.includes(tagId)) entity.tags.push(tagId);

  if (!tag.effects) return;

  // 确保attributes存在
  if (!entity.attributes) entity.attributes = {};

  // 应用属性加成
  const attrMap = {
    charm: 'charm',
    reputation: 'reputation',
    strength: 'strength',
    constitution: 'constitution',
    willpower: 'willpower',
    intimidation: 'intimidation',
    agility: 'agility',
    dodge: 'dodge',
    mystery: 'mystery',
    intelligence: 'intelligence',
    wisdom: 'wisdom',
    luck: 'luck',
    enlightenment: 'enlightenment',
    perception: 'perception',
    charisma: 'charisma',
  };

  for (const [key, value] of Object.entries(tag.effects)) {
    if (key === 'hpMax') {
      if (!entity.hp) entity.hp = { max: 100, current: 100 };
      entity.hp.max = Math.max(1, entity.hp.max + value);
      entity.hp.current = Math.min(entity.hp.current, entity.hp.max);
    } else if (key === 'mpMax') {
      if (!entity.mp) entity.mp = { max: 50, current: 50 };
      entity.mp.max = Math.max(1, entity.mp.max + value);
      entity.mp.current = Math.min(entity.mp.current, entity.mp.max);
    } else if (key === 'cultivationSpeed') {
      entity.cultivationSpeed = (entity.cultivationSpeed || 1) + value;
    } else if (key === 'combatBonus') {
      entity.combatBonus = (entity.combatBonus || 0) + value;
    } else if (attrMap[key]) {
      entity.attributes[attrMap[key]] = (entity.attributes[attrMap[key]] || 0) + value;
    } else {
      // 其他属性直接加到attributes
      entity.attributes[key] = (entity.attributes[key] || 0) + value;
    }
  }
}

// 应用所有标签效果（批量）
function applyAllTagEffects(entity) {
  if (!entity.tags || entity.tags.length === 0) return;
  for (const tagId of entity.tags) {
    applyTagEffects(entity, tagId);
  }
}

// 获取标签信息
function getTagInfo(tagId) {
  const all = getAllTags();
  return all[tagId] || null;
}

module.exports = { TAGS, getAllTags, getRandomTags, applyTagEffects, applyAllTagEffects, getTagInfo };
