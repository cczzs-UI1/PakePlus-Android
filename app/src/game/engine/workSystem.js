// 打工系统 - 职业选择、条件限制、打工剧情、收益
// v2：凡人职业单职业制（选择/离职/经验/阶段进阶）；修仙职业多职业并存

const { randInt, chance, randChoice } = require('./utils');

// 职业阶段（通用）：学徒→熟手→精通→大师→宗师
const PROFESSION_STAGES = ['学徒', '熟手', '精通', '大师', '宗师'];
// 各阶段所需累计经验
const STAGE_EXP_NEED = [0, 100, 300, 600, 1000];
// 各阶段收益倍率
const STAGE_MULT = [1, 1.3, 1.7, 2.2, 3];

// 获取职业阶段信息
function getStageInfo(exp) {
  let stage = 1;
  for (let i = STAGE_EXP_NEED.length - 1; i >= 0; i--) {
    if (exp >= STAGE_EXP_NEED[i]) { stage = i + 1; break; }
  }
  return {
    stage,
    stageName: PROFESSION_STAGES[stage - 1],
    stageMult: STAGE_MULT[stage - 1],
    nextExp: stage < 5 ? STAGE_EXP_NEED[stage] : null,
    exp,
  };
}

// 初始化职业数据
function initProfessions(player) {
  if (!player.professions) {
    player.professions = { current: null, list: {}, cultivation: [] };
  }
  return player.professions;
}

// 获取玩家职业状态（前端面板用）
function getProfessionState(player) {
  initProfessions(player);
  const profs = player.professions;
  const currentProf = profs.current ? PROFESSIONS.find(p => p.id === profs.current) : null;
  const list = {};
  for (const [id, data] of Object.entries(profs.list || {})) {
    const prof = PROFESSIONS.find(p => p.id === id);
    if (prof) list[id] = { name: prof.name, category: prof.category, ...getStageInfo(data.exp || 0) };
  }
  return {
    current: currentProf ? { id: currentProf.id, name: currentProf.name, category: currentProf.category } : null,
    mortalProfessions: list,
    cultivation: profs.cultivation || [],
  };
}

// 选择凡人职业（单职业制：同一时间只能从事一个）
function selectProfession(player, professionId) {
  initProfessions(player);
  const profession = PROFESSIONS.find(p => p.id === professionId);
  if (!profession) return { success: false, msg: '没有这个职业' };
  if (profession.category !== '凡人界') return { success: false, msg: '修仙界职业无需选择，通过对应途径获得（如炼丹师需学成炼丹术）' };
  if (player.professions.current) {
    const cur = PROFESSIONS.find(p => p.id === player.professions.current);
    return { success: false, msg: `你已从事【${cur ? cur.name : player.professions.current}】，请先离职再选择新职业` };
  }
  if (!checkProfessionCondition(player, profession)) return { success: false, msg: `不满足【${profession.name}】的从业条件` };
  if (!player.professions.list[professionId]) {
    player.professions.list[professionId] = { exp: 0 };
  }
  player.professions.current = professionId;
  return { success: true, msg: `你选择了【${profession.name}】作为你的职业（经验保留，可随时离职）`, profession };
}

// 离职（经验保留）
function quitProfession(player) {
  initProfessions(player);
  if (!player.professions.current) return { success: false, msg: '你当前没有从事的职业' };
  const cur = PROFESSIONS.find(p => p.id === player.professions.current);
  player.professions.current = null;
  return { success: true, msg: `你辞去了【${cur ? cur.name : ''}】的工作，职业经验已保留，可随时重新选择` };
}

// 修仙职业获取（多职业并存，不冲突）
function addCultivationProfession(player, professionName) {
  initProfessions(player);
  if (!player.professions.cultivation.includes(professionName)) {
    player.professions.cultivation.push(professionName);
  }
}

// 职业列表及条件限制
const PROFESSIONS = [
  // ===== 凡人界职业 =====
  {
    id: 'farmer', name: '农夫', category: '凡人界',
    desc: '耕田种地，靠天吃饭',
    conditions: { minAge: 12, maxAge: 80, gender: 'any', minRealm: 0, maxRealm: 9 },
    workText: ['你扛着锄头来到田间，辛勤劳作了一天。', '你在田里忙了一整天，虽然辛苦但很充实。'],
    reward: { silver: [20, 50], exp: 1 },
  },
  {
    id: 'woodcutter', name: '樵夫', category: '凡人界',
    desc: '上山砍柴，卖柴为生',
    conditions: { minAge: 14, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9, minStrength: 30 },
    workText: ['你拿着斧头上山砍柴，砍了满满一担柴。', '你在山中砍了一天柴，累得腰酸背痛。'],
    reward: { silver: [30, 60], exp: 2 },
  },
  {
    id: 'fisherman', name: '渔夫', category: '凡人界',
    desc: '捕鱼捞虾，靠水吃水',
    conditions: { minAge: 14, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9, location: ['东海渔村', '落霞港'] },
    workText: ['你撒网捕鱼，收获颇丰。', '你在河边钓了一天鱼，收获不错。'],
    reward: { silver: [25, 55], exp: 1 },
  },
  {
    id: 'hunter', name: '猎人', category: '凡人界',
    desc: '进山打猎，获取猎物',
    conditions: { minAge: 16, maxAge: 60, gender: 'any', minRealm: 0, maxRealm: 9, minStrength: 40 },
    workText: ['你带着弓箭进山打猎，收获了几只野兔。', '你在山中追踪猎物一整天，终于有所收获。'],
    reward: { silver: [40, 80], exp: 3 },
  },
  {
    id: 'blacksmith', name: '铁匠学徒', category: '凡人界',
    desc: '在铁匠铺帮忙，学习打铁',
    conditions: { minAge: 14, maxAge: 60, gender: '男', minRealm: 0, maxRealm: 9, location: ['清风镇', '大夏皇都'] },
    workText: ['你在铁匠铺帮忙拉风箱、递工具，学了不少手艺。', '你在铁匠铺打了一天杂，虽然累但学到了东西。'],
    reward: { silver: [30, 50], exp: 2, forgeExp: 5 },
  },
  {
    id: 'shopkeeper', name: '店伙计', category: '凡人界',
    desc: '在店铺帮忙，招呼客人',
    conditions: { minAge: 14, maxAge: 65, gender: 'any', minRealm: 0, maxRealm: 9, minCharm: 30 },
    workText: ['你在店里招呼客人，忙了一整天。', '你帮店主整理货物、招待客人，表现不错。'],
    reward: { silver: [25, 45], exp: 1 },
  },
  {
    id: 'servant', name: '仆役', category: '凡人界',
    desc: '在大户人家做下人',
    conditions: { minAge: 12, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9 },
    workText: ['你在大户人家做杂役，端茶倒水、打扫卫生。', '你忙前忙后伺候主人，虽然辛苦但管吃住。'],
    reward: { silver: [15, 35], exp: 1 },
  },
  {
    id: 'performer', name: '说书人', category: '凡人界',
    desc: '在茶馆说书讲故事',
    conditions: { minAge: 18, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9, minCharm: 50, minWisdom: 40 },
    workText: ['你在茶馆拍案说书，听得客人连连叫好。', '你讲了一段精彩的故事，客人们纷纷打赏。'],
    reward: { silver: [50, 100], exp: 2 },
  },
  {
    id: 'doctor', name: '游医', category: '凡人界',
    desc: '走街串巷为人看病',
    conditions: { minAge: 20, maxAge: 80, gender: 'any', minRealm: 0, maxRealm: 9, minWisdom: 50, skill: '医术' },
    workText: ['你为几个病人看病，开了药方。', '你走街串巷为人治病，虽然辛苦但积了功德。'],
    reward: { silver: [60, 120], exp: 3, karma: 5 },
  },
  {
    id: 'escort', name: '镖师', category: '凡人界',
    desc: '护送商队货物',
    conditions: { minAge: 18, maxAge: 55, gender: '男', minRealm: 1, maxRealm: 9, minStrength: 50 },
    workText: ['你护送商队走了一趟镖，平安到达目的地。', '你一路上警惕万分，终于将货物安全送到。'],
    reward: { silver: [80, 150], exp: 5 },
  },
  {
    id: 'thief', name: '小偷', category: '凡人界',
    desc: '顺手牵羊，捞点外快',
    conditions: { minAge: 12, maxAge: 60, gender: 'any', minRealm: 0, maxRealm: 9, minAgility: 40 },
    workText: ['你在集市上趁人不备，顺了点东西。', '你溜进一户人家，偷了些财物。'],
    reward: { silver: [50, 200], exp: 2, karma: -10 },
    risk: { chance: 30, text: '你被人发现了，仓皇逃跑！', penalty: { silver: -30, karma: -5 } },
  },
  {
    id: 'prostitute', name: '青楼女子', category: '凡人界',
    desc: '在青楼陪客卖笑',
    conditions: { minAge: 16, maxAge: 45, gender: '女', minRealm: 0, maxRealm: 9, minCharm: 60, location: ['大夏皇都', '清风镇'] },
    workText: ['你在青楼陪客人喝酒聊天，得了不少打赏。', '你弹唱助兴，客人们纷纷叫好打赏。'],
    reward: { silver: [100, 300], exp: 1, charm: 2 },
  },
  {
    id: 'gigolo', name: '面首', category: '凡人界',
    desc: '以色侍人，赚些钱财',
    conditions: { minAge: 16, maxAge: 40, gender: '男', minRealm: 0, maxRealm: 9, minCharm: 60 },
    workText: ['你陪一位贵妇人度过了愉快的时光，得了不少赏赐。', '你生得俊俏，被富婆看中，得了不少好处。'],
    reward: { silver: [100, 300], exp: 1, charm: 2 },
  },
  // ===== 修仙界职业 =====
  {
    id: 'alchemy_helper', name: '丹童', category: '修仙界',
    desc: '在丹塔帮忙炼丹',
    conditions: { minAge: 12, maxAge: 100, gender: 'any', minRealm: 1, maxRealm: 9, minWisdom: 40, location: ['丹塔'] },
    workText: ['你在丹塔帮忙看管炉火、整理药材。', '你协助炼丹师炼制丹药，学了不少丹道知识。'],
    reward: { spiritStone: [5, 15], exp: 3, alchemyExp: 10 },
  },
  {
    id: 'forge_helper', name: '器徒', category: '修仙界',
    desc: '在器殿帮忙炼器',
    conditions: { minAge: 14, maxAge: 100, gender: 'any', minRealm: 1, maxRealm: 9, minStrength: 40, location: ['器殿'] },
    workText: ['你在器殿帮忙拉风箱、递工具。', '你协助炼器师打造法器，受益匪浅。'],
    reward: { spiritStone: [5, 15], exp: 3, forgeExp: 10 },
  },
  {
    id: 'formation_helper', name: '阵学徒', category: '修仙界',
    desc: '在阵阁学习阵法',
    conditions: { minAge: 14, maxAge: 100, gender: 'any', minRealm: 1, maxRealm: 9, minWisdom: 50, location: ['阵阁'] },
    workText: ['你在阵阁帮忙刻画阵纹、整理阵盘。', '你协助阵法师布置阵法，学到了不少东西。'],
    reward: { spiritStone: [5, 15], exp: 3, formationExp: 10 },
  },
  {
    id: 'spirit_guard', name: '灵卫', category: '修仙界',
    desc: '守护宗门或家族',
    conditions: { minAge: 18, maxAge: 80, gender: 'any', minRealm: 2, maxRealm: 9, minStrength: 50 },
    workText: ['你巡逻站岗，守护了一天的安宁。', '你执行了一次护卫任务，表现出色。'],
    reward: { spiritStone: [10, 25], exp: 5 },
  },
  {
    id: 'beast_tamer', name: '驯兽师', category: '修仙界',
    desc: '驯服妖兽，贩卖灵宠',
    conditions: { minAge: 16, maxAge: 80, gender: 'any', minRealm: 2, maxRealm: 9, minCharm: 40 },
    workText: ['你驯服了一只低阶妖兽，卖了个好价钱。', '你在妖兽森林待了一天，终于驯服了一只灵宠。'],
    reward: { spiritStone: [15, 40], exp: 4 },
  },
  {
    id: 'herbalist', name: '采药人', category: '修仙界',
    desc: '进山采集灵药',
    conditions: { minAge: 14, maxAge: 90, gender: 'any', minRealm: 1, maxRealm: 9, minWisdom: 30 },
    workText: ['你在山中采集了不少灵药。', '你找到了几株珍贵的草药，收获颇丰。'],
    reward: { spiritStone: [8, 20], exp: 2 },
  },
  {
    id: 'mercenary', name: '散修佣兵', category: '修仙界',
    desc: '接取悬赏任务',
    conditions: { minAge: 18, maxAge: 80, gender: 'any', minRealm: 2, maxRealm: 9, minStrength: 40 },
    workText: ['你接了一个悬赏任务，顺利完成。', '你完成了一个猎杀妖兽的任务，获得了报酬。'],
    reward: { spiritStone: [20, 50], exp: 8 },
  },
  {
    id: 'teacher', name: '教书先生', category: '凡人界',
    desc: '在私塾教书',
    conditions: { minAge: 25, maxAge: 80, gender: 'any', minRealm: 0, maxRealm: 9, minWisdom: 60 },
    workText: ['你在私塾教孩子们读书写字。', '你为学生们讲解经文，学生们受益匪浅。'],
    reward: { silver: [40, 80], exp: 2, reputation: 5 },
  },
  {
    id: 'artist', name: '画师', category: '凡人界',
    desc: '卖画为生',
    conditions: { minAge: 16, maxAge: 80, gender: 'any', minRealm: 0, maxRealm: 9, minCharm: 40, minWisdom: 40 },
    workText: ['你画了几幅画，卖了个好价钱。', '你为一位客人画了肖像，对方非常满意。'],
    reward: { silver: [50, 120], exp: 2, reputation: 3 },
  },
  {
    id: 'musician', name: '乐师', category: '凡人界',
    desc: '演奏乐器为生',
    conditions: { minAge: 16, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9, minCharm: 45 },
    workText: ['你在酒楼演奏，得了不少打赏。', '你一曲奏罢，满座皆惊，纷纷打赏。'],
    reward: { silver: [45, 100], exp: 2, charm: 1 },
  },
  {
    id: 'cook', name: '厨师', category: '凡人界',
    desc: '在酒楼做菜',
    conditions: { minAge: 16, maxAge: 70, gender: 'any', minRealm: 0, maxRealm: 9 },
    workText: ['你在酒楼掌勺，做了一天的菜。', '你做的菜广受好评，店主给了你额外赏钱。'],
    reward: { silver: [35, 70], exp: 2 },
  },
  {
    id: 'tailor', name: '裁缝', category: '凡人界',
    desc: '做衣服为生',
    conditions: { minAge: 14, maxAge: 75, gender: 'any', minRealm: 0, maxRealm: 9, minAgility: 30 },
    workText: ['你为客人量体裁衣，忙了一整天。', '你做了几件漂亮的衣服，卖了个好价钱。'],
    reward: { silver: [30, 65], exp: 2 },
  },
];

// 工作随机剧情库（属性增减），工作时随机触发
const WORK_EVENTS = {
  // 通用事件
  common: [
    { text: '忙中出错，你打翻了器具，还伤到了自己。', effects: { hp: -20, agility: -1 } },
    { text: '你灵光一现，悟到了新的门道。', effects: { enlightenment: 2 } },
    { text: '这一天你的体力格外充沛，效率极高。', effects: { physique: 1, silver: 10 } },
    { text: '同伴提点了几句，你受益匪浅。', effects: { wisdom: 2 } },
    { text: '你累得腰酸背痛，还受了点小伤。', effects: { hp: -15, constitution: -1 } },
    { text: '一只灵鸟落在你肩头，你觉得这是吉兆。', effects: { fateLuck: 2 } },
    { text: '你心思浮躁，总也静不下心来。', effects: { spirit: -1, silver: -5 } },
    { text: '路过的高人看了你一眼，你浑身一凛。', effects: { perception: 2 } },
    { text: '你不小心说错了话，得罪了旁人。', effects: { reputation: -3 } },
    { text: '你帮了别人一个大忙，对方感激不尽。', effects: { reputation: 3, karma: 2 } },
    { text: '连日劳作，你的手磨出了厚茧，也更结实了。', effects: { strength: 1 } },
    { text: '你咬牙坚持了下来，意志更加坚定。', effects: { willpower: 2 } },
    { text: '你行事沉稳，得了东家青眼。', effects: { charm: 1, reputation: 2 } },
    { text: '一阵风吹来，你莫名感到通体舒畅。', effects: { spirit: 1, mp: 10 } },
    { text: '你偷懒歇了半晌，被人看在眼里。', effects: { reputation: -2, silver: -8 } },
    { text: '你认真钻研，技艺有所精进。', effects: { enlightenment: 1, silver: 15 } },
  ],
  // 凡人界事件
  mortal: [
    { text: '你劳作时救下一条被困的灵蛇，它朝你点点头游走了。', effects: { karma: 5, fateLuck: 1 } },
    { text: '路过的富商看中你的勤恳，多给了你赏钱。', effects: { silver: 50, reputation: 2 } },
    { text: '你与同行争执了几句，气氛有些僵。', effects: { charm: -1 } },
    { text: '你发现了一处前人埋藏的物件，悄悄收了起来。', effects: { silver: 80, karma: -3 } },
    { text: '你偶感风寒，却仍强撑着干完了活。', effects: { hp: -25, willpower: 2 } },
    { text: '你巧用智慧解决了一个难题，主家刮目相看。', effects: { wisdom: 3, reputation: 3 } },
    { text: '你在田边捡到一枚温润的玉佩，觉着有些古怪。', effects: { fateLuck: 3 } },
    { text: '你劝架时被误伤了一下。', effects: { hp: -15, karma: 3 } },
    { text: '你手脚麻利，干活又快又好，得了嘉奖。', effects: { agility: 2, silver: 20 } },
    { text: '你偷偷克扣了东家的一点银钱。', effects: { silver: 30, karma: -5 } },
  ],
  // 修仙界事件
  cultivation: [
    { text: '你观摩同门炼制的丹药，隐约有所领悟。', effects: { enlightenment: 3, alchemyExp: 5 } },
    { text: '你引动灵气时走了岔子，受了点内伤。', effects: { hp: -30, spirit: -2 } },
    { text: '你的灵器在炼制中炸裂，好在没有伤到人。', effects: { silver: -30, forgeExp: -5 } },
    { text: '你帮助一位散修渡过难关，他赠你一枚灵石。', effects: { spiritStone: 20, karma: 3 } },
    { text: '你运转功法时感到经脉一阵刺痛，似有暗伤。', effects: { constitution: -2 } },
    { text: '你夜里观星，忽有所感，悟性大增。', effects: { enlightenment: 4 } },
    { text: '你在交换会上眼光独到，低价淘到一株灵草。', effects: { spiritStone: 30, fateLuck: 2 } },
    { text: '你神识扫过一处洞府残骸，察觉异样。', effects: { perception: 3, spiritStone: 15 } },
    { text: '你的灵宠颇为亲近你，你心情大好。', effects: { spirit: 2, charm: 1 } },
    { text: '你被同门讥讽资质平庸，心中愤懑。', effects: { spirit: -2, willpower: 2 } },
    { text: '你闭关调息一夜，修为略有精进。', effects: { cultivationExp: 15 } },
    { text: '你误入一处灵气紊乱之地，气血翻涌。', effects: { hp: -20, mp: -20 } },
    { text: '你炼制时手稳心细，成功率大增。', effects: { agility: 1, alchemyExp: 8 } },
    { text: '你见一位前辈风姿卓绝，心生向往。', effects: { charm: 1, cultivationExp: 10 } },
  ],
};

// 检查玩家是否满足职业条件
function checkProfessionCondition(player, profession) {
  const cond = profession.conditions;
  if (player.age < cond.minAge || player.age > cond.maxAge) return false;
  if (cond.gender !== 'any' && player.gender !== cond.gender) return false;
  if (player.realmLevel < cond.minRealm || player.realmLevel > cond.maxRealm) return false;
  if (cond.minStrength && (player.attributes?.strength || 50) < cond.minStrength) return false;
  if (cond.minAgility && (player.attributes?.agility || 50) < cond.minAgility) return false;
  if (cond.minCharm && (player.attributes?.charm || 50) < cond.minCharm) return false;
  if (cond.minWisdom && (player.attributes?.wisdom || 50) < cond.minWisdom) return false;
  if (cond.location && !cond.location.includes(player.location)) return false;
  return true;
}

// 获取可选择的职业列表
function getAvailableProfessions(player) {
  return PROFESSIONS.filter(p => checkProfessionCondition(player, p));
}

// 执行打工
// 修仙界已获得职业的工作（需求：已获得的修仙职业可在工作区直接工作）
const CULTIVATION_WORK = {
  '炼丹师': { stone: [15, 40], expType: 'alchemy', exp: [8, 15], text: ['你开炉炼丹，为散修们炼制了一批固本培元的丹药，得了不少灵石。', '你在坊市支起丹摊，替人炼制丹药，丹香引来不少修士排队求购。'] },
  '炼器师': { stone: [15, 40], expType: 'forge', exp: [8, 15], text: ['你开炉炼器，打了一批趁手的法器出售，收入颇丰。', '你接了器殿的委托，炼制了几件灵器，得了丰厚报酬。'] },
  '阵法师': { stone: [12, 35], expType: 'formation', exp: [8, 15], text: ['你为一方势力布置了护山大阵，阵成之日灵光冲天，主家重金酬谢。', '你在坊市出售阵盘，讲解布阵之道，赚了不少灵石。'] },
  '剑修': { stone: [12, 35], expType: 'sword', exp: [6, 12], text: ['你受雇护送商队穿过妖兽出没之地，剑光所指，宵小退避，得了镖银。', '你前往演武场与人切磋剑术，连胜数场，赢得彩头。'] },
  '符师': { stone: [10, 30], expType: 'talisman', exp: [8, 15], text: ['你铺开符纸，画了一批灵符在坊市售卖，供不应求。', '你为修士定制护身符，符成之时灵光一闪，买家连声道谢。'] },
  '丹修': { stone: [20, 50], expType: 'alchemy', exp: [10, 20], text: ['你在丹塔坐堂炼丹，一手丹术出神入化，求丹者络绎不绝。', '你开坛炼丹数日，成丹颇多，灵石入账满满。'] },
  '符修': { stone: [12, 35], expType: 'talisman', exp: [10, 18], text: ['你精研符道，画符成功率极高，符箓远销各地。', '你为宗门批量制符，得了丰厚俸禄。'] },
  '体修': { stone: [10, 25], expType: 'body', exp: [6, 12], text: ['你在角斗场与人比试肉身之力，连胜数场，赢得赏钱。', '你帮人搬运灵矿，力大无穷，工钱给得格外丰厚。'] },
  '兽修': { stone: [10, 30], expType: 'beast', exp: [6, 12], text: ['你驯服了几只低阶妖兽卖给坊市，得了灵石。', '你替人驯养灵兽，调教得温顺听话，主家十分满意。'] },
  '冒险者': { stone: [8, 25], expType: 'explore', exp: [5, 10], text: ['你接下探索委托，深入秘境采集情报，归来得了报酬。', '你游历四方，顺手完成了几桩冒险委托，小有收获。'] },
  '赏金猎人': { stone: [15, 40], expType: 'hunt', exp: [6, 12], text: ['你接下一桩猎杀妖兽的悬赏，干净利落地完成，领了赏金。', '你追捕通缉犯归案，官府按例赏了你一笔灵石。'] },
  '宗门弟子': { stone: [8, 20], expType: 'sect', exp: [5, 10], text: ['你替宗门跑腿办差，办事妥当，得了宗门发放的灵石。', '你在宗门值守讲坛，为同门答疑解惑，得了功绩与灵石。'] },
  '宗门长老': { stone: [20, 50], expType: 'sect', exp: [8, 15], text: ['你坐镇宗门议事，为宗门谋划大事，得了丰厚的供奉。', '你开坛讲道，门下弟子听者云集，宗门礼敬有加。'] },
  '坊市掌柜': { stone: [15, 45], expType: 'trade', exp: [6, 12], text: ['你在自家店铺盘账理货，几日间进项颇丰。', '你运筹帷幄，谈成一桩大宗买卖，赚得盆满钵满。'] },
  '魔修': { stone: [15, 40], expType: 'demon', exp: [6, 12], text: ['你在魔域边缘猎取魔物，取其内丹售卖，收获不菲。', '你为一方魔道势力办事，得了不少魔石酬劳。'] },
  '散修': { stone: [5, 15], expType: 'none', exp: [3, 8], text: ['你四处游历，替人解决些琐事，得了些灵石度日。', '你在坊市接些零散活计，勉强维持修行所需。'] },
  '炼丹学徒': { stone: [6, 15], expType: 'alchemy', exp: [5, 10], text: ['你在丹炉旁打下手，观摩前辈炼丹，顺手做些杂活换点灵石。', '你替炼丹师整理药材、看护炉火，得了些辛苦钱。'] },
  '炼器学徒': { stone: [6, 15], expType: 'forge', exp: [5, 10], text: ['你在器坊帮忙拉风箱、打磨器坯，主家给了你些工钱。', '你协助炼器师锻打灵材，学艺的同时赚了点灵石。'] },
};

// 执行修仙界已获得职业的工作
function doCultivationWork(player, professionName) {
  initProfessions(player);
  const cult = player.professions?.cultivation || [];
  if (!cult.includes(professionName)) {
    return { error: `你尚未获得【${professionName}】职业` };
  }
  const cfg = CULTIVATION_WORK[professionName];
  if (!cfg) {
    // 未配置的职业给通用收益
    const stone = randInt(8, 25);
    player.spiritStone = (player.spiritStone || 0) + stone;
    return { success: true, text: `你以【${professionName}】的身份在坊市接了些活计，得了${stone}灵石。`, rewards: [`灵石+${stone}`] };
  }
  const text = randChoice(cfg.text);
  const stone = randInt(cfg.stone[0], cfg.stone[1]);
  player.spiritStone = (player.spiritStone || 0) + stone;
  const rewards = [`灵石+${stone}`];
  if (cfg.expType && cfg.expType !== 'none') {
    const expGain = randInt(cfg.exp[0], cfg.exp[1]);
    if (cfg.expType === 'alchemy') { player.alchemy = player.alchemy || { exp: 0 }; player.alchemy.exp = (player.alchemy.exp || 0) + expGain; }
    else if (cfg.expType === 'forge') { player.forge = player.forge || { exp: 0 }; player.forge.exp = (player.forge.exp || 0) + expGain; }
    else if (cfg.expType === 'formation') { player.formation = player.formation || { exp: 0 }; player.formation.exp = (player.formation.exp || 0) + expGain; }
    else if (cfg.expType === 'talisman') { player.talisman = player.talisman || { exp: 0 }; player.talisman.exp = (player.talisman.exp || 0) + expGain; }
    else if (cfg.expType === 'sword') { player.sword = player.sword || { exp: 0 }; player.sword.exp = (player.sword.exp || 0) + expGain; }
    rewards.push(`职业经验+${expGain}`);
  }
  return { success: true, text, rewards };
}

function doWork(player, professionId) {
  initProfessions(player);
  const profession = PROFESSIONS.find(p => p.id === professionId);
  if (!profession) return { error: '没有这个职业' };
  if (!checkProfessionCondition(player, profession)) return { error: '不满足该职业的条件' };

  // 凡人职业：必须先选择该职业（单职业制）
  if (profession.category === '凡人界' && player.professions.current !== professionId) {
    const cur = player.professions.current ? PROFESSIONS.find(p => p.id === player.professions.current) : null;
    return { error: cur ? `你当前从事【${cur.name}】，请先离职或选择【${profession.name}】` : `请先在职业面板选择【${profession.name}】再工作` };
  }

  const text = randChoice(profession.workText);
  const reward = profession.reward;
  let resultText = text;
  let rewards = [];

  // 凡人职业：按阶段加成收益（阶段越高收获越多）
  let stageInfo = null;
  if (profession.category === '凡人界') {
    if (!player.professions.list[professionId]) player.professions.list[professionId] = { exp: 0 };
    const entry = player.professions.list[professionId];
    // 每次工作获得职业经验
    const expGain = randInt(8, 15);
    entry.exp += expGain;
    const beforeStage = getStageInfo(entry.exp - expGain).stage;
    stageInfo = getStageInfo(entry.exp);
    rewards.push(`职业经验+${expGain}`);
    if (stageInfo.stage > beforeStage) {
      resultText += ` 你的【${profession.name}】技艺精进，晋升为${stageInfo.stageName}！`;
    }
  }

  const mult = stageInfo ? stageInfo.stageMult : 1;

  // 计算奖励（凡人职业乘阶段倍率）
  if (reward.silver) {
    const amount = Math.floor(randInt(reward.silver[0], reward.silver[1]) * mult);
    player.silver = (player.silver || 0) + amount;
    rewards.push(`银两+${amount}`);
  }
  if (reward.spiritStone) {
    const amount = randInt(reward.spiritStone[0], reward.spiritStone[1]);
    player.spiritStone = (player.spiritStone || 0) + amount;
    rewards.push(`灵石+${amount}`);
  }
  if (reward.exp) {
    player.cultivationExp = (player.cultivationExp || 0) + reward.exp;
    rewards.push(`修为+${reward.exp}`);
  }
  if (reward.karma) {
    player.karma = (player.karma || 0) + reward.karma;
    rewards.push(`功德${reward.karma > 0 ? '+' : ''}${reward.karma}`);
  }
  if (reward.reputation) {
    player.reputation = (player.reputation || 0) + reward.reputation;
    rewards.push(`声望+${reward.reputation}`);
  }
  if (reward.charm) {
    player.attributes.charm = (player.attributes.charm || 50) + reward.charm;
    rewards.push(`魅力+${reward.charm}`);
  }

  // 风险事件
  if (profession.risk && chance(profession.risk.chance)) {
    resultText += ' ' + profession.risk.text;
    if (profession.risk.penalty) {
      if (profession.risk.penalty.silver) {
        player.silver = Math.max(0, (player.silver || 0) + profession.risk.penalty.silver);
        rewards.push(`银两${profession.risk.penalty.silver}`);
      }
      if (profession.risk.penalty.karma) {
        player.karma = (player.karma || 0) + profession.risk.penalty.karma;
        rewards.push(`功德${profession.risk.penalty.karma}`);
      }
    }
  }

  // 随机剧情事件：工作时偶遇奇遇/挫折，增减属性（35%概率）
  if (chance(35)) {
    const categoryPool = profession.category === '修仙界' ? WORK_EVENTS.cultivation : WORK_EVENTS.mortal;
    const ev = randChoice(categoryPool.concat(WORK_EVENTS.common));
    resultText += ' ' + ev.text;
    const attrKeys = ['physique', 'spirit', 'enlightenment', 'agility', 'fateLuck', 'strength', 'constitution', 'perception', 'willpower', 'charm', 'wisdom'];
    for (const [key, val] of Object.entries(ev.effects)) {
      if (!val) continue;
      if (key === 'silver') {
        player.silver = Math.max(0, (player.silver || 0) + val);
        rewards.push(`银两${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'spiritStone') {
        player.spiritStone = Math.max(0, (player.spiritStone || 0) + val);
        rewards.push(`灵石${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'exp' || key === 'cultivationExp') {
        player.cultivationExp = Math.max(0, (player.cultivationExp || 0) + val);
        rewards.push(`修为${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'reputation') {
        player.reputation = Math.max(0, (player.reputation || 0) + val);
        rewards.push(`声望${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'karma') {
        player.karma = Math.max(0, (player.karma || 0) + val);
        rewards.push(`功德${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'hp') {
        player.hp.current = Math.max(1, Math.min(player.hp.max, (player.hp.current || 0) + val));
        rewards.push(`气血${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'mp') {
        player.mp.current = Math.max(0, Math.min(player.mp.max, (player.mp.current || 0) + val));
        rewards.push(`灵力${val >= 0 ? '+' : ''}${val}`);
      } else if (attrKeys.includes(key)) {
        player.attributes[key] = Math.max(1, (player.attributes[key] || 50) + val);
        const attrNames = { physique: '根骨', spirit: '神识', enlightenment: '悟性', agility: '身法', fateLuck: '气运', strength: '力量', constitution: '体质', perception: '感知', willpower: '意志', charm: '魅力', wisdom: '智慧' };
        rewards.push(`${attrNames[key]}${val >= 0 ? '+' : ''}${val}`);
      } else if (key === 'alchemyExp') {
        if (player.alchemy) player.alchemy.exp = (player.alchemy.exp || 0) + val;
        rewards.push(`丹术+${val}`);
      } else if (key === 'forgeExp') {
        if (player.forge) player.forge.exp = (player.forge.exp || 0) + val;
        rewards.push(`器术+${val}`);
      }
    }
  }

  resultText += ` 获得：${rewards.join('，')}`;

  return {
    success: true,
    text: resultText,
    rewards,
    profession: profession.name,
    category: profession.category,
    stage: stageInfo ? stageInfo.stageName : null,
  };
}

module.exports = {
  PROFESSIONS,
  PROFESSION_STAGES,
  STAGE_EXP_NEED,
  STAGE_MULT,
  getStageInfo,
  initProfessions,
  getProfessionState,
  selectProfession,
  quitProfession,
  addCultivationProfession,
  getAvailableProfessions,
  checkProfessionCondition,
  doWork,
  doCultivationWork,
};
