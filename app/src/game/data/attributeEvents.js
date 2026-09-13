// 属性随机剧情库 - 为每个数值属性生成30+随机剧情，可以增减属性
// 每个剧情包含：触发条件、剧情文本、记事文本、效果影响（增减属性）

const ATTRIBUTE_EVENTS = {
  // ===== 气血相关剧情（30+） =====
  hp: [
    {
      id: 'hp_001', type: 'increase', condition: { location: 'clinic' },
      text: '你在医馆中得到了名医的诊治，几副药下去，身体的暗伤都好了，气血充盈。',
      journal: '在医馆得名医诊治，暗伤痊愈，气血充盈。',
      effects: { hp: 100, constitution: 3 },
    },
    {
      id: 'hp_002', type: 'increase', condition: { item: 'healing_pill' },
      text: '你服下一颗疗伤丹药，药力在体内流转，受损的经脉迅速修复，气血恢复如初。',
      journal: '服下疗伤丹药，经脉修复，气血恢复。',
      effects: { hp: 150 },
    },
    {
      id: 'hp_003', type: 'increase', condition: { weather: 'sunny' },
      text: '今日阳光明媚，你在院中晒了晒太阳，感觉浑身暖洋洋的，气血都顺畅了不少。',
      journal: '晴日晒太阳，气血顺畅。',
      effects: { hp: 30, happiness: 5 },
    },
    {
      id: 'hp_004', type: 'decrease', condition: { action: 'combat' },
      text: '你在战斗中受了伤，一道深可见骨的伤口正在流血，必须尽快处理。',
      journal: '战斗中受伤，伤口深可见骨。',
      effects: { hp: -80, pain: 10 },
    },
    {
      id: 'hp_005', type: 'decrease', condition: { weather: 'cold' },
      text: '天气严寒，你不慎感染了风寒，浑身乏力，气血有些不畅。',
      journal: '严寒天气感染风寒，气血不畅。',
      effects: { hp: -40, constitution: -2 },
    },
    {
      id: 'hp_006', type: 'increase', condition: { action: 'rest' },
      text: '你好好休息了一番，睡了个好觉，醒来时神清气爽，气血都恢复了。',
      journal: '好好休息，神清气爽，气血恢复。',
      effects: { hp: 60, energy: 10 },
    },
    {
      id: 'hp_007', type: 'increase', condition: { item: 'ginseng' },
      text: '你服用了一支百年老山参，参气入体，气血翻涌，感觉身体强壮了不少。',
      journal: '服用百年老山参，气血翻涌，身体强壮。',
      effects: { hp: 200, constitution: 5, maxHp: 20 },
    },
    {
      id: 'hp_008', type: 'decrease', condition: { event: 'poisoned' },
      text: '你不慎中了毒，毒素在体内蔓延，气血不断被侵蚀，脸色苍白如纸。',
      journal: '中毒，毒素蔓延，气血被侵蚀。',
      effects: { hp: -100, poison: 15 },
    },
    {
      id: 'hp_009', type: 'increase', condition: { location: 'hot_spring' },
      text: '你在温泉中泡了许久，温泉水含有丰富的灵气，滋养着你的身体，气血都变得旺盛起来。',
      journal: '泡温泉，灵气滋养，气血旺盛。',
      effects: { hp: 80, relaxation: 15 },
    },
    {
      id: 'hp_010', type: 'decrease', condition: { action: 'overwork' },
      text: '你连日操劳，身体有些吃不消了，气血亏虚，需要好好休养。',
      journal: '连日操劳，气血亏虚。',
      effects: { hp: -50, fatigue: 15 },
    },
    {
      id: 'hp_011', type: 'increase', condition: { profession: 'doctor' },
      text: '你精通医理，为自己调配了一副滋补的药方，服用后气血大增。',
      journal: '自配滋补药方，气血大增。',
      effects: { hp: 120, medicalSkill: 5 },
    },
    {
      id: 'hp_012', type: 'decrease', condition: { hasTag: 'weak' },
      text: '你本就体弱，今日又吹了冷风，咳了几声，感觉气血又虚了几分。',
      journal: '体弱吹冷风，咳嗽，气血更虚。',
      effects: { hp: -30, sickness: 10 },
    },
    {
      id: 'hp_013', type: 'increase', condition: { action: 'exercise' },
      text: '你坚持每日锻炼体魄，身体越来越结实，气血也更加充沛。',
      journal: '坚持锻炼，体魄结实，气血充沛。',
      effects: { hp: 40, strength: 3, constitution: 3 },
    },
    {
      id: 'hp_014', type: 'decrease', condition: { event: 'ambush' },
      text: '你遭遇了埋伏，混战中被人从背后捅了一刀，伤口很深，气血狂泻。',
      journal: '遭埋伏，背后中刀，气血狂泻。',
      effects: { hp: -120, criticalWound: true },
    },
    {
      id: 'hp_015', type: 'increase', condition: { item: 'blood_enriching_soup' },
      text: '你喝了一碗补血汤，汤里加了不少珍贵药材，喝完后脸色红润，气血补足。',
      journal: '喝补血汤，脸色红润，气血补足。',
      effects: { hp: 90, complexion: 10 },
    },
    {
      id: 'hp_016', type: 'decrease', condition: { action: 'blood_letting' },
      text: '你为了救人性命，献出了不少鲜血，虽然做了好事，但自己的气血却亏虚了。',
      journal: '献血救人，自身气血亏虚。',
      effects: { hp: -60, merit: 10 },
    },
    {
      id: 'hp_017', type: 'increase', condition: { realm: 'breakthrough' },
      text: '你突破了境界，天地灵气涌入体内，洗筋伐髓，气血质量大幅提升。',
      journal: '境界突破，灵气洗筋伐髓，气血质量提升。',
      effects: { hp: 300, maxHp: 100, constitution: 10 },
    },
    {
      id: 'hp_018', type: 'decrease', condition: { event: 'curse' },
      text: '你被人下了诅咒，身体日渐消瘦，气血被邪力不断吞噬。',
      journal: '中诅咒，身体消瘦，气血被吞噬。',
      effects: { hp: -70, darkPower: 10 },
    },
    {
      id: 'hp_019', type: 'increase', condition: { location: 'spiritual_land' },
      text: '你在灵气充沛的地方修炼，灵气不断滋养着你的肉身，气血变得更加浑厚。',
      journal: '灵地修炼，灵气滋养肉身，气血浑厚。',
      effects: { hp: 70, cultivationExp: 100 },
    },
    {
      id: 'hp_020', type: 'decrease', condition: { action: 'dual_cultivation_excessive' },
      text: '你纵欲过度，身体被掏空了，气血两虚，走路都有些发飘。',
      journal: '纵欲过度，身体掏空，气血两虚。',
      effects: { hp: -90, willpower: -5, warning: '需节制' },
    },
    {
      id: 'hp_021', type: 'increase', condition: { item: 'peach' },
      text: '你吃了一颗仙桃，这桃子蕴含着天地灵气，吃下后气血翻涌，精神大振。',
      journal: '吃仙桃，灵气入体，气血翻涌，精神大振。',
      effects: { hp: 250, lifespan: 1, maxHp: 50 },
    },
    {
      id: 'hp_022', type: 'decrease', condition: { event: 'fall' },
      text: '你不小心从高处摔了下来，虽然有灵力护体，但还是摔伤了，气血翻腾。',
      journal: '高处摔落，摔伤，气血翻腾。',
      effects: { hp: -60, fracture: true },
    },
    {
      id: 'hp_023', type: 'increase', condition: { action: 'meditation' },
      text: '你打坐冥想，引导气血在体内循环，一个大周天后，气血畅通无阻。',
      journal: '打坐冥想，引导气血循环，畅通无阻。',
      effects: { hp: 50, enlightenment: 2 },
    },
    {
      id: 'hp_024', type: 'decrease', condition: { weather: 'heat' },
      text: '天气酷热，你中暑了，头晕目眩，气血上涌，十分难受。',
      journal: '酷热中暑，头晕目眩，气血上涌。',
      effects: { hp: -35, discomfort: 10 },
    },
    {
      id: 'hp_025', type: 'increase', condition: { item: 'deer_antler' },
      text: '你服用了鹿茸制成的补品，鹿茸大补，气血瞬间充盈，感觉浑身有使不完的劲。',
      journal: '服鹿茸补品，气血充盈，浑身是劲。',
      effects: { hp: 180, strength: 5, yang: 10 },
    },
    {
      id: 'hp_026', type: 'decrease', condition: { event: 'plague' },
      text: '你染上了瘟疫，浑身发热，气血被病魔折磨得虚弱不堪。',
      journal: '染瘟疫，浑身发热，气血虚弱。',
      effects: { hp: -110, plague: true, needDoctor: true },
    },
    {
      id: 'hp_027', type: 'increase', condition: { action: 'massage' },
      text: '你享受了一次专业的推拿按摩，筋骨舒展，气血运行更加顺畅。',
      journal: '推拿按摩，筋骨舒展，气血顺畅。',
      effects: { hp: 45, relaxation: 20 },
    },
    {
      id: 'hp_028', type: 'decrease', condition: { hasTag: 'old_injury' },
      text: '你的旧伤复发了，每逢阴雨天就隐隐作痛，气血运行受到阻碍。',
      journal: '旧伤复发，阴雨天疼痛，气血受阻。',
      effects: { hp: -40, oldInjury: true },
    },
    {
      id: 'hp_029', type: 'increase', condition: { item: 'dragon_blood' },
      text: '你得到了一瓶龙血，服下后龙血在体内燃烧，气血变得如龙族一般强悍。',
      journal: '服龙血，气血如龙般强悍。',
      effects: { hp: 500, maxHp: 200, constitution: 20, bloodline: 'dragon' },
    },
    {
      id: 'hp_030', type: 'decrease', condition: { action: 'self_harm' },
      text: '你心绪不宁，一时想不开伤害了自己，伤口虽然不深，但气血还是流失了不少。',
      journal: '心绪不宁自伤，气血流失。',
      effects: { hp: -50, mentalState: 'unstable', needComfort: true },
    },
    {
      id: 'hp_031', type: 'increase', condition: { location: 'paradise' },
      text: '你误入一处世外桃源，这里的食物和水都含有灵气，住了几日后气血大增。',
      journal: '入世外桃源，食灵物，气血大增。',
      effects: { hp: 150, happiness: 20, maxHp: 30 },
    },
    {
      id: 'hp_032', type: 'decrease', condition: { event: 'demon_possession' },
      text: '你被魔物暂时附体，虽然获得了强大的力量，但魔物的邪气也损伤了你的气血。',
      journal: '被魔物附体，获力量但气血受损。',
      effects: { hp: -80, darkPower: 20, attack: 15 },
    },
  ],

  // ===== 修为相关剧情（30+） =====
  cultivationExp: [
    {
      id: 'cult_001', type: 'increase', condition: { action: 'cultivate' },
      text: '你潜心修炼，灵气在经脉中运转，修为稳步提升。',
      journal: '潜心修炼，修为稳步提升。',
      effects: { cultivationExp: 100 },
    },
    {
      id: 'cult_002', type: 'increase', condition: { weather: 'spiritual_tide' },
      text: '今日灵气潮汐，天地间灵气浓度大增，你抓紧时间修炼，修为突飞猛进。',
      journal: '灵气潮汐日修炼，修为突飞猛进。',
      effects: { cultivationExp: 300 },
    },
    {
      id: 'cult_003', type: 'increase', condition: { item: 'cultivation_pill' },
      text: '你服下一颗聚气丹，丹药化作精纯的灵气，修为暴涨。',
      journal: '服聚气丹，修为暴涨。',
      effects: { cultivationExp: 500 },
    },
    {
      id: 'cult_004', type: 'decrease', condition: { event: 'qi_deviation' },
      text: '你修炼时走火入魔，灵气在体内乱窜，不仅修为倒退，还受了内伤。',
      journal: '走火入魔，修为倒退，身受内伤。',
      effects: { cultivationExp: -300, hp: -50 },
    },
    {
      id: 'cult_005', type: 'increase', condition: { hasTag: 'genius' },
      text: '你天赋异禀，修炼时举一反三，别人需要数月的功夫，你几天就练成了，修为大增。',
      journal: '天赋异禀，修炼神速，修为大增。',
      effects: { cultivationExp: 400, enlightenment: 5 },
    },
    {
      id: 'cult_006', type: 'increase', condition: { location: 'sect' },
      text: '你在宗门的修炼室中修炼，这里有聚灵阵辅助，修炼效率比平时高了不少。',
      journal: '宗门修炼室修炼，聚灵阵辅助，效率提升。',
      effects: { cultivationExp: 200 },
    },
    {
      id: 'cult_007', type: 'decrease', condition: { action: 'dual_cultivation_bad' },
      text: '你与不合适的人双修，不仅没有增进修为，反而因为阴阳不调导致修为倒退。',
      journal: '与人双修阴阳不调，修为倒退。',
      effects: { cultivationExp: -200, hp: -30 },
    },
    {
      id: 'cult_008', type: 'increase', condition: { action: 'dual_cultivation_good' },
      text: '你与道侣双修，阴阳调和，水乳交融，两人的修为都突飞猛进。',
      journal: '与道侣双修，阴阳调和，修为共进。',
      effects: { cultivationExp: 600, intimacy: 20, favor: 10 },
    },
    {
      id: 'cult_009', type: 'increase', condition: { event: 'enlightenment' },
      text: '你在修炼中突然福至心灵，领悟了一丝天地至理，修为瓶颈松动，大幅提升。',
      journal: '修炼中顿悟天地至理，瓶颈松动，修为大增。',
      effects: { cultivationExp: 800, enlightenment: 10 },
    },
    {
      id: 'cult_010', type: 'decrease', condition: { event: 'seal' },
      text: '你被人下了禁制，修为被封印了一部分，实力大减。',
      journal: '被下禁制，修为被封，实力大减。',
      effects: { cultivationExp: -500, sealed: true },
    },
    {
      id: 'cult_011', type: 'increase', condition: { item: 'spirit_fruit' },
      text: '你吃下一颗灵果，灵果中蕴含的精纯灵气被你完全吸收，修为精进。',
      journal: '食灵果，吸收灵气，修为精进。',
      effects: { cultivationExp: 350 },
    },
    {
      id: 'cult_012', type: 'increase', condition: { action: 'listen_to_lecture' },
      text: '你听了一位前辈的讲道，受益匪浅，许多修炼中的疑惑都解开了，修为增长。',
      journal: '听前辈讲道，疑惑尽解，修为增长。',
      effects: { cultivationExp: 250, enlightenment: 8 },
    },
    {
      id: 'cult_013', type: 'decrease', condition: { hasTag: 'lazy' },
      text: '你偷懒了好几天没有修炼，修为不进反退，手感都生疏了。',
      journal: '偷懒数日未修炼，修为不进反退。',
      effects: { cultivationExp: -100, laziness: 10 },
    },
    {
      id: 'cult_014', type: 'increase', condition: { event: 'life_death_experience' },
      text: '你经历了一场生死大战，在生死边缘领悟了战斗的真谛，修为因祸得福。',
      journal: '生死大战中领悟真谛，修为因祸得福。',
      effects: { cultivationExp: 700, combatExp: 200, willpower: 10 },
    },
    {
      id: 'cult_015', type: 'increase', condition: { location: 'ancient_ruins' },
      text: '你在上古遗迹中发现了一处修炼密室，里面残留着上古大能的道韵，参悟后修为大涨。',
      journal: '上古遗迹参悟大能道韵，修为大涨。',
      effects: { cultivationExp: 600, ancientKnowledge: 10 },
    },
    {
      id: 'cult_016', type: 'decrease', condition: { event: 'curse_cultivation' },
      text: '你被人下了散功咒，修为如流水般流失，必须尽快找到解法。',
      journal: '中散功咒，修为流失。',
      effects: { cultivationExp: -400, cursed: true },
    },
    {
      id: 'cult_017', type: 'increase', condition: { item: 'enlightenment_tea' },
      text: '你喝了一杯悟道茶，茶气入脑，灵台清明，修炼起来事半功倍，修为提升。',
      journal: '饮悟道茶，灵台清明，修为提升。',
      effects: { cultivationExp: 450, enlightenment: 5 },
    },
    {
      id: 'cult_018', type: 'increase', condition: { action: 'body_tempering' },
      text: '你用特殊方法淬炼肉身，虽然过程痛苦，但修为和体魄都得到了提升。',
      journal: '淬炼肉身，痛苦但修为体魄双提升。',
      effects: { cultivationExp: 300, constitution: 8, hp: 50 },
    },
    {
      id: 'cult_019', type: 'decrease', condition: { event: 'betrayal' },
      text: '你被最信任的人背叛，在修炼的关键时刻被偷袭，修为大损。',
      journal: '被信任之人偷袭，修为大损。',
      effects: { cultivationExp: -600, hp: -80, trust: -20 },
    },
    {
      id: 'cult_020', type: 'increase', condition: { hasTag: 'reincarnated' },
      text: '你带着前世的记忆修炼，许多经验都可以直接套用，修炼速度远超常人。',
      journal: '前世记忆辅助修炼，速度超常。',
      effects: { cultivationExp: 500, experience: 15 },
    },
    {
      id: 'cult_021', type: 'increase', condition: { location: 'demon_realm' },
      text: '你在魔域中修炼，虽然魔气侵蚀心智，但魔功的修炼速度确实快得惊人。',
      journal: '魔域修炼，魔气蚀心但速度惊人。',
      effects: { cultivationExp: 550, darkPower: 15, sanity: -5 },
    },
    {
      id: 'cult_022', type: 'decrease', condition: { action: 'help_others' },
      text: '你为了帮助别人突破，将自己的修为传给了对方，虽然做了好事，但自己的修为却下降了。',
      journal: '传功助人，自身修为下降。',
      effects: { cultivationExp: -250, merit: 15, favor: 10 },
    },
    {
      id: 'cult_023', type: 'increase', condition: { item: 'heavenly_peach' },
      text: '你得到了一颗蟠桃，吃下后不仅修为大增，还延长了寿命。',
      journal: '食蟠桃，修为大增且延寿。',
      effects: { cultivationExp: 1000, lifespan: 100, maxHp: 100 },
    },
    {
      id: 'cult_024', type: 'increase', condition: { event: 'star_alignment' },
      text: '今夜星辰排列成特殊的阵型，你借星力修炼，修为暴涨。',
      journal: '星象异变，借星力修炼，修为暴涨。',
      effects: { cultivationExp: 700, starPower: 10 },
    },
    {
      id: 'cult_025', type: 'decrease', condition: { event: 'artifact_backlash' },
      text: '你强行催动超出自己能力的法宝，被法宝反噬，修为受损。',
      journal: '强催法宝被反噬，修为受损。',
      effects: { cultivationExp: -350, hp: -60 },
    },
    {
      id: 'cult_026', type: 'increase', condition: { action: 'seclusion' },
      text: '你闭关苦修了一段时间，心无旁骛，修为有了长足的进步。',
      journal: '闭关苦修，心无旁骛，修为长足进步。',
      effects: { cultivationExp: 800, willpower: 5 },
    },
    {
      id: 'cult_027', type: 'increase', condition: { hasTag: 'chosen_one' },
      text: '你是天选之人，修炼时总有奇遇，这次又莫名其妙地修为大涨，连你自己都不清楚原因。',
      journal: '天选之人，莫名修为大涨。',
      effects: { cultivationExp: 900, luck: 10 },
    },
    {
      id: 'cult_028', type: 'decrease', condition: { event: 'love_sorrow' },
      text: '你为情所困，心神不宁，修炼时总是走神，修为不进反退。',
      journal: '为情所困，修炼走神，修为倒退。',
      effects: { cultivationExp: -150, melancholy: 15 },
    },
    {
      id: 'cult_029', type: 'increase', condition: { item: 'golden_core_pill' },
      text: '你服下一颗金丹，这是一位大能毕生修为所化，药力磅礴，修为疯狂增长。',
      journal: '服金丹，药力磅礴，修为疯长。',
      effects: { cultivationExp: 2000, realmBreakChance: 30 },
    },
    {
      id: 'cult_030', type: 'decrease', condition: { event: 'public_shame' },
      text: '你在大庭广众之下被人击败羞辱，道心动摇，修为出现了裂痕。',
      journal: '当众受辱，道心动摇，修为裂痕。',
      effects: { cultivationExp: -200, reputation: -10, willpower: -5 },
    },
    {
      id: 'cult_031', type: 'increase', condition: { location: 'dragon_palace' },
      text: '你在龙宫的藏宝库中发现了一颗龙珠，吸收龙珠的力量后，修为突飞猛进。',
      journal: '龙宫得龙珠，吸收力量，修为突飞猛进。',
      effects: { cultivationExp: 1200, dragonPower: 20 },
    },
    {
      id: 'cult_032', type: 'increase', condition: { action: 'write_book' },
      text: '你将自己的修炼心得写成了一本书，在写作的过程中对修炼有了更深的理解，修为提升。',
      journal: '撰写修炼心得，加深理解，修为提升。',
      effects: { cultivationExp: 350, reputation: 10, intelligence: 5 },
    },
  ],

  // ===== 灵石相关剧情（30+） =====
  spiritStone: [
    {
      id: 'ss_001', type: 'increase', condition: { action: 'sell' },
      text: '你将一些不需要的物品卖给了商人，换得了一笔灵石。',
      journal: '出售物品，获得灵石。',
      effects: { spiritStone: 200 },
    },
    {
      id: 'ss_002', type: 'increase', condition: { event: 'treasure' },
      text: '你在探索时发现了一个宝箱，打开后里面装满了灵石！',
      journal: '发现宝箱，获得大量灵石。',
      effects: { spiritStone: 1000, luck: 5 },
    },
    {
      id: 'ss_003', type: 'decrease', condition: { action: 'buy' },
      text: '你在商店购买了一些必需品，花掉了一笔灵石。',
      journal: '购物消费，灵石减少。',
      effects: { spiritStone: -150 },
    },
    {
      id: 'ss_004', type: 'increase', condition: { profession: 'merchant' },
      text: '你做了一笔好买卖，低买高卖，赚了一大笔灵石。',
      journal: '做买卖低买高卖，大赚一笔。',
      effects: { spiritStone: 800, businessSkill: 5 },
    },
    {
      id: 'ss_005', type: 'decrease', condition: { event: 'theft' },
      text: '你的钱包被小偷摸走了，损失了不少灵石。',
      journal: '被偷，损失灵石。',
      effects: { spiritStone: -300, anger: 10 },
    },
    {
      id: 'ss_006', type: 'increase', condition: { event: 'reward' },
      text: '你帮助了别人，对方感激不尽，送了你一笔灵石作为谢礼。',
      journal: '助人获谢礼，得到灵石。',
      effects: { spiritStone: 400, merit: 5, favor: 5 },
    },
    {
      id: 'ss_007', type: 'decrease', condition: { action: 'gamble_lose' },
      text: '你在赌坊手气不佳，输了不少灵石，心疼不已。',
      journal: '赌坊输钱，损失灵石。',
      effects: { spiritStone: -500, gambling: true },
    },
    {
      id: 'ss_008', type: 'increase', condition: { action: 'gamble_win' },
      text: '你在赌坊大杀四方，赢了个盆满钵满，灵石哗啦啦地进了口袋。',
      journal: '赌坊大胜，赢得大量灵石。',
      effects: { spiritStone: 1500, luck: 10 },
    },
    {
      id: 'ss_009', type: 'decrease', condition: { event: 'extortion' },
      text: '你被当地的恶霸敲诈了一笔，不交钱就不让你走。',
      journal: '被恶霸敲诈，损失灵石。',
      effects: { spiritStone: -200, anger: 15, sinTarget: 5 },
    },
    {
      id: 'ss_010', type: 'increase', condition: { location: 'mine' },
      text: '你在灵矿中挖到了一块品质上佳的灵石矿，卖了个好价钱。',
      journal: '灵矿挖到好矿，卖得好价。',
      effects: { spiritStone: 600, miningSkill: 5 },
    },
    {
      id: 'ss_011', type: 'decrease', condition: { action: 'donate' },
      text: '你向寺庙/道观捐了一笔香火钱，虽然灵石少了，但心里很踏实。',
      journal: '捐香火钱，灵石减少但心安。',
      effects: { spiritStone: -300, merit: 10, peace: 10 },
    },
    {
      id: 'ss_012', type: 'increase', condition: { event: 'inheritance' },
      text: '一位远房亲戚去世了，给你留下了一笔遗产，灵石数目可观。',
      journal: '继承远亲遗产，获得灵石。',
      effects: { spiritStone: 2000, nostalgia: 5 },
    },
    {
      id: 'ss_013', type: 'decrease', condition: { event: 'scam' },
      text: '你被人用花言巧语骗了，买了一堆没用的东西，灵石打了水漂。',
      journal: '被诈骗，买了无用之物，灵石打水漂。',
      effects: { spiritStone: -400, gullible: 5, anger: 10 },
    },
    {
      id: 'ss_014', type: 'increase', condition: { action: 'teach' },
      text: '你收了几个学生，收了一笔学费，灵石袋又鼓了起来。',
      journal: '收徒教学，获得学费。',
      effects: { spiritStone: 500, reputation: 5, teachingSkill: 5 },
    },
    {
      id: 'ss_015', type: 'decrease', condition: { action: 'bribe' },
      text: '你为了摆平一件事，不得不花钱打点关系，灵石像流水一样花出去。',
      journal: '花钱打点关系，灵石大减。',
      effects: { spiritStone: -800, intrigue: 10, problemSolved: true },
    },
    {
      id: 'ss_016', type: 'increase', condition: { event: 'lottery' },
      text: '你买的彩票居然中了头奖！一大笔灵石从天而降，你简直不敢相信自己的眼睛。',
      journal: '彩票中头奖，获得巨额灵石。',
      effects: { spiritStone: 5000, luck: 20, happiness: 30 },
    },
    {
      id: 'ss_017', type: 'decrease', condition: { event: 'fire' },
      text: '你家/住处失火了，虽然人没事，但不少灵石被烧毁了。',
      journal: '住处失火，灵石被烧。',
      effects: { spiritStone: -600, disaster: true },
    },
    {
      id: 'ss_018', type: 'increase', condition: { profession: 'alchemist' },
      text: '你炼制的丹药大受欢迎，一炉丹药卖了个好价钱，灵石滚滚而来。',
      journal: '丹药大卖，灵石滚滚而来。',
      effects: { spiritStone: 1200, alchemySkill: 5, reputation: 5 },
    },
    {
      id: 'ss_019', type: 'decrease', condition: { action: 'medical_bill' },
      text: '你生了一场大病，看医生抓药花了不少灵石。',
      journal: '生病就医，花费灵石。',
      effects: { spiritStone: -350, hp: 50 },
    },
    {
      id: 'ss_020', type: 'increase', condition: { event: 'ancient_treasure' },
      text: '你在上古遗迹中发现了一堆上古灵石，虽然年代久远，但灵气依然充沛，价值连城。',
      journal: '上古遗迹发现古灵石，价值连城。',
      effects: { spiritStone: 3000, ancientTreasure: true },
    },
    {
      id: 'ss_021', type: 'decrease', condition: { action: 'repair' },
      text: '你的法宝/装备损坏了，花了一大笔灵石请人修复。',
      journal: '修复装备，花费灵石。',
      effects: { spiritStone: -500, equipmentRepaired: true },
    },
    {
      id: 'ss_022', type: 'increase', condition: { event: 'gift_money' },
      text: '一位长辈/朋友知道你手头紧，塞给你一笔灵石，让你不要推辞。',
      journal: '长辈/朋友赠金，获得灵石。',
      effects: { spiritStone: 800, warmth: 15, favor: 10 },
    },
    {
      id: 'ss_023', type: 'decrease', condition: { event: 'tax' },
      text: '官府来收税了，你不得不交出一笔灵石。',
      journal: '官府收税，缴纳灵石。',
      effects: { spiritStone: -250, civicDuty: true },
    },
    {
      id: 'ss_024', type: 'increase', condition: { action: 'bodyguard' },
      text: '你接了一趟保镖的活儿，护送商队安全到达目的地，获得了丰厚的报酬。',
      journal: '做保镖护送商队，获丰厚报酬。',
      effects: { spiritStone: 700, combatExp: 100, reputation: 5 },
    },
    {
      id: 'ss_025', type: 'decrease', condition: { event: 'counterfeit' },
      text: '你收到了一批假灵石，发现时已经晚了，损失惨重。',
      journal: '收到假灵石，损失惨重。',
      effects: { spiritStone: -1000, anger: 20, caution: 10 },
    },
    {
      id: 'ss_026', type: 'increase', condition: { location: 'auction' },
      text: '你在拍卖会上拍下的一件物品后来被证明是稀世珍宝，转手卖了十倍的价钱！',
      journal: '拍卖会捡漏，转手十倍卖出。',
      effects: { spiritStone: 5000, luck: 15, businessSkill: 10 },
    },
    {
      id: 'ss_027', type: 'decrease', condition: { action: 'fine' },
      text: '你违反了规定，被官府罚了一笔灵石。',
      journal: '违规被罚款，损失灵石。',
      effects: { spiritStone: -300, reputation: -3 },
    },
    {
      id: 'ss_028', type: 'increase', condition: { event: 'dividend' },
      text: '你投资的生意分红了，一笔灵石稳稳地进了你的口袋。',
      journal: '生意分红，获得灵石。',
      effects: { spiritStone: 1500, investment: true },
    },
    {
      id: 'ss_029', type: 'decrease', condition: { event: 'robbery' },
      text: '你在路上遇到了劫匪，虽然击退了对方，但还是有一些灵石在混乱中丢失了。',
      journal: '遇劫匪，击退但混乱中丢失灵石。',
      effects: { spiritStone: -400, combatExp: 50, hp: -30 },
    },
    {
      id: 'ss_030', type: 'increase', condition: { action: 'sell_rare_item' },
      text: '你将一件罕见的宝物卖给了识货的收藏家，卖了一个天价！',
      journal: '卖稀世宝物给收藏家，得天价。',
      effects: { spiritStone: 8000, reputation: 10 },
    },
    {
      id: 'ss_031', type: 'decrease', condition: { action: 'wedding_expense' },
      text: '你举办了一场盛大的婚礼/宴会，花费不菲，但大家都很开心。',
      journal: '举办盛大婚礼/宴会，花费巨大但开心。',
      effects: { spiritStone: -2000, happiness: 25, reputation: 15 },
    },
    {
      id: 'ss_032', type: 'increase', condition: { event: 'god_of_wealth' },
      text: '你在财神庙烧香后，回去的路上居然捡到了一个装满灵石的钱袋！看来财神显灵了。',
      journal: '财神庙烧香后捡到钱袋，财神显灵。',
      effects: { spiritStone: 1500, luck: 10, merit: 5 },
    },
  ],

  // ===== 声望相关剧情（30+） =====
  reputation: [
    {
      id: 'rep_001', type: 'increase', condition: { action: 'heroic' },
      text: '你见义勇为，救下了被欺负的百姓，围观的人都为你叫好，你的名声传开了。',
      journal: '见义勇为救百姓，名声传开。',
      effects: { reputation: 15, merit: 10 },
    },
    {
      id: 'rep_002', type: 'decrease', condition: { action: 'bully' },
      text: '你欺负了弱小，被人看到了，大家都在背后议论你，名声变差了。',
      journal: '欺负弱小被人看到，名声变差。',
      effects: { reputation: -15, sin: 10 },
    },
    {
      id: 'rep_003', type: 'increase', condition: { event: 'tournament_win' },
      text: '你在比武大会上夺得了冠军，一战成名，无数人记住了你的名字。',
      journal: '比武大会夺冠，一战成名。',
      effects: { reputation: 50, combatExp: 300, spiritStone: 1000 },
    },
    {
      id: 'rep_004', type: 'increase', condition: { action: 'save_city' },
      text: '你拯救了整座城市免于灾难，全城百姓都对你感恩戴德，你的名字被传颂。',
      journal: '拯救全城，百姓感恩，名传四方。',
      effects: { reputation: 100, merit: 50, spiritStone: 5000 },
    },
    {
      id: 'rep_005', type: 'decrease', condition: { event: 'scandal' },
      text: '你卷入了一场丑闻，虽然不是你的错，但名声还是受到了影响。',
      journal: '卷入丑闻，名声受损。',
      effects: { reputation: -25, stress: 15 },
    },
    {
      id: 'rep_006', type: 'increase', condition: { profession: 'doctor' },
      text: '你医术高超，治好了许多疑难杂症，被人们称为"神医"，名声远播。',
      journal: '医术高超治疑难杂症，被称神医，名声远播。',
      effects: { reputation: 30, medicalSkill: 10, merit: 15 },
    },
    {
      id: 'rep_007', type: 'decrease', condition: { event: 'cheating' },
      text: '你在比赛/交易中作弊被发现了，大家都对你指指点点，名声扫地。',
      journal: '作弊被发现，名声扫地。',
      effects: { reputation: -40, integrity: -20 },
    },
    {
      id: 'rep_008', type: 'increase', condition: { action: 'donate_large' },
      text: '你捐了一大笔钱做慈善，修桥铺路，人们都称赞你是大善人。',
      journal: '巨资做慈善修桥铺路，被称大善人。',
      effects: { reputation: 40, merit: 30, spiritStone: -3000 },
    },
    {
      id: 'rep_009', type: 'increase', condition: { event: 'poem_famous' },
      text: '你写的一首诗/词流传开来，被文人墨客交口称赞，你有了才子/才女的名声。',
      journal: '诗词流传，被称才子/才女。',
      effects: { reputation: 25, intelligence: 10, art: 15 },
    },
    {
      id: 'rep_010', type: 'decrease', condition: { event: 'cowardice' },
      text: '你在关键时刻退缩了，被人认为是胆小鬼，名声一落千丈。',
      journal: '关键时刻退缩，被称胆小鬼，名声大跌。',
      effects: { reputation: -30, courage: -10, shame: 15 },
    },
    {
      id: 'rep_011', type: 'increase', condition: { action: 'defeat_strong' },
      text: '你击败了一位成名已久的高手，一战震惊天下，你的名字开始在江湖中流传。',
      journal: '击败成名高手，震惊天下，名传江湖。',
      effects: { reputation: 60, combatExp: 500, confidence: 20 },
    },
    {
      id: 'rep_012', type: 'increase', condition: { location: 'imperial_court' },
      text: '你在朝堂上发表了一番高论，得到了皇帝/大臣的赞赏，名声大噪。',
      journal: '朝堂高论获皇帝赞赏，名声大噪。',
      effects: { reputation: 45, intelligence: 15, officialRank: 1 },
    },
    {
      id: 'rep_013', type: 'decrease', condition: { event: 'affair_exposed' },
      text: '你的一段私情被曝光了，成为了人们茶余饭后的谈资，名声受损。',
      journal: '私情曝光，成谈资，名声受损。',
      effects: { reputation: -35, scandal: true, gossip: 20 },
    },
    {
      id: 'rep_014', type: 'increase', condition: { action: 'teach_public' },
      text: '你公开讲学，听众无数，大家都被你的学识折服，你的学者名声传开了。',
      journal: '公开讲学，听众无数，学者名声传开。',
      effects: { reputation: 35, intelligence: 10, students: 10 },
    },
    {
      id: 'rep_015', type: 'decrease', condition: { event: 'debt_default' },
      text: '你欠了钱不还，被债主到处宣扬，你的信用和名声都破产了。',
      journal: '欠债不还被宣扬，信用名声破产。',
      effects: { reputation: -40, credit: -30, spiritStone: 0 },
    },
    {
      id: 'rep_016', type: 'increase', condition: { event: 'artifact_forged' },
      text: '你锻造出了一件神兵利器，被炼器界奉为杰作，你的炼器大师名声传开了。',
      journal: '锻造神兵，被称炼器大师，名声传开。',
      effects: { reputation: 40, forgeSkill: 15, spiritStone: 2000 },
    },
    {
      id: 'rep_017', type: 'increase', condition: { event: 'pill_refined' },
      text: '你炼出了一炉极品丹药，丹香飘出十里，被丹道中人津津乐道，你有了丹道大师的名声。',
      journal: '炼出极品丹药，丹香十里，丹道大师名声传开。',
      effects: { reputation: 40, alchemySkill: 15, spiritStone: 2000 },
    },
    {
      id: 'rep_018', type: 'decrease', condition: { event: 'betrayal_exposed' },
      text: '你背叛朋友/组织的事情被揭露了，所有人都对你嗤之以鼻，名声臭了。',
      journal: '背叛之事被揭露，众人嗤之以鼻，名声臭。',
      effects: { reputation: -50, integrity: -30, enemies: 5 },
    },
    {
      id: 'rep_019', type: 'increase', condition: { action: 'mediation' },
      text: '你成功调解了一场重大纠纷，双方都对你感激不尽，你有了公正的名声。',
      journal: '调解重大纠纷，双方感激，获公正名声。',
      effects: { reputation: 30, wisdom: 15, merit: 10 },
    },
    {
      id: 'rep_020', type: 'decrease', condition: { event: 'plague_spread' },
      text: '你被认为是瘟疫的源头/传播者，人们都躲着你，名声极差。',
      journal: '被认为瘟疫源头，人人躲避，名声极差。',
      effects: { reputation: -45, isolation: 20, needClearName: true },
    },
    {
      id: 'rep_021', type: 'increase', condition: { event: 'beauty_contest' },
      text: '你在选美/才艺比赛中脱颖而出，被评为第一美人/才子，名声大噪。',
      journal: '选美/才艺比赛夺魁，名声大噪。',
      effects: { reputation: 50, charm: 15, fans: 20 },
    },
    {
      id: 'rep_022', type: 'increase', condition: { action: 'rescue_important' },
      text: '你救下了一位重要人物，对方大肆宣扬你的恩情，你的名声水涨船高。',
      journal: '救下重要人物，对方宣扬恩情，名声大涨。',
      effects: { reputation: 55, connections: 15, spiritStone: 1000 },
    },
    {
      id: 'rep_023', type: 'decrease', condition: { event: 'arrogance' },
      text: '你太过傲慢，得罪了不少人，大家都说你目中无人，名声变差。',
      journal: '傲慢得罪人，被说目中无人，名声变差。',
      effects: { reputation: -20, enemies: 3, humility: -10 },
    },
    {
      id: 'rep_024', type: 'increase', condition: { event: 'book_published' },
      text: '你写的书出版了，一经发售就洛阳纸贵，你的作家名声传开了。',
      journal: '著作出版洛阳纸贵，作家名声传开。',
      effects: { reputation: 35, intelligence: 10, spiritStone: 1500 },
    },
    {
      id: 'rep_025', type: 'increase', condition: { action: 'sect_founder' },
      text: '你创建了一个宗门，随着宗门的发展壮大，你的开山祖师名声也越来越响。',
      journal: '创建宗门，发展壮大，开山祖师名声渐响。',
      effects: { reputation: 60, leadership: 20, sectPower: 15 },
    },
    {
      id: 'rep_026', type: 'decrease', condition: { event: 'murder_accusation' },
      text: '你被指控谋杀，虽然最后证明是冤枉的，但名声还是受到了影响。',
      journal: '被指控谋杀，虽洗清但名声受损。',
      effects: { reputation: -30, injustice: 15, stress: 20 },
    },
    {
      id: 'rep_027', type: 'increase', condition: { event: 'beast_tamed' },
      text: '你驯服了一只传说中的凶兽，消息传开，人们都称你为"万兽之王"。',
      journal: '驯服传说凶兽，被称万兽之王。',
      effects: { reputation: 50, petSkill: 20, intimidation: 15 },
    },
    {
      id: 'rep_028', type: 'increase', condition: { action: 'charity_work' },
      text: '你长期做善事，帮助了无数人，人们都尊称你为"活菩萨"。',
      journal: '长期行善助无数人，被称活菩萨。',
      effects: { reputation: 45, merit: 40, blessing: 10 },
    },
    {
      id: 'rep_029', type: 'decrease', condition: { event: 'duel_loss_public' },
      text: '你在众目睽睽之下被人击败了，而且输得很难看，大家都在讨论你的失败。',
      journal: '当众惨败，众人讨论，名声受损。',
      effects: { reputation: -25, confidence: -15, shame: 10 },
    },
    {
      id: 'rep_030', type: 'increase', condition: { event: 'realm_breakthrough_public' },
      text: '你在众人见证下突破了一个大境界，所有人都为你震惊，你的天才名声更加响亮。',
      journal: '当众突破大境界，众人震惊，天才名声更响。',
      effects: { reputation: 70, cultivationExp: 1000, awe: 20 },
    },
    {
      id: 'rep_031', type: 'increase', condition: { action: 'diplomacy_success' },
      text: '你成功完成了一次重要的外交使命，避免了一场战争，你的外交家名声传开了。',
      journal: '完成外交使命避免战争，外交家名声传开。',
      effects: { reputation: 50, intelligence: 15, merit: 30 },
    },
    {
      id: 'rep_032', type: 'decrease', condition: { event: 'exposed_criminal' },
      text: '你过去的犯罪记录被人挖了出来，公之于众，名声一落千丈。',
      journal: '过去犯罪记录被曝光，名声一落千丈。',
      effects: { reputation: -60, sin: 20, wanted: true },
    },
  ],
};

// 获取属性随机剧情
function getAttributeEvent(attribute, context) {
  const events = ATTRIBUTE_EVENTS[attribute];
  if (!events || events.length === 0) return null;

  // 根据条件筛选
  const eligible = events.filter(e => {
    if (e.condition.location && context.location !== e.condition.location) return false;
    if (e.condition.weather && context.weather !== e.condition.weather) return false;
    if (e.condition.action && context.action !== e.condition.action) return false;
    if (e.condition.hasTag && !context.tags?.includes(e.condition.hasTag)) return false;
    if (e.condition.profession && context.profession !== e.condition.profession) return false;
    if (e.condition.item && !context.inventory?.some(i => i.name === e.condition.item)) return false;
    if (e.condition.type && context.type !== e.condition.type) return false;
    return true;
  });

  if (eligible.length === 0) return events[Math.floor(Math.random() * events.length)];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// 获取所有属性列表
function getAllAttributes() {
  return Object.keys(ATTRIBUTE_EVENTS);
}

// 获取属性剧情数量
function getAttributeEventCount(attribute) {
  return ATTRIBUTE_EVENTS[attribute]?.length || 0;
}

module.exports = { ATTRIBUTE_EVENTS, getAttributeEvent, getAllAttributes, getAttributeEventCount };
