// petLife.js - 灵宠生活系统
// 需求：性别/性格/成长期/灵宠间好感/子嗣/随机记事库/交配/怀孕/生产/血脉蛋/每旬0-3条记事双视角
const { randInt, randChoice, chance, clamp, genId } = require('./utils');

// ===== 20种灵宠专属性格 =====
const PET_PERSONALITIES = [
  '忠诚', '顽皮', '温顺', '高傲', '暴躁', '胆小', '机敏', '慵懒', '贪吃', '好奇',
  '好斗', '粘人', '独立', '护主', '活泼', '沉静', '狡黠', '憨厚', '灵慧', '冷酷',
];

// 成长期
const GROWTH_STAGES = ['幼年期', '少年期', '成年期'];
// 幼年期3旬→少年期、9旬→成年期（约3月龄成年）
const GROWTH_XUN = { infant: 3, teen: 9 };

// ===== 性别 =====
function randGender() { return Math.random() < 0.5 ? '雌' : '雄'; }

// ===== 状态描述（按记事类型推导） =====
const STATUS_BY_TYPE = {
  explore: '正在独自探索四周',
  play: '正在独自玩耍',
  mate_ok: '正与同伴亲密相伴',
  mate_bad: '正与同伴闹别扭',
  mate: '正与配偶耳鬓厮磨',
  owner: '正依偎在主人身边',
  child: '正与主人的子嗣嬉戏',
  concubine: '正与主人的妻妾亲近',
  feed: '正在享用美食',
  stroke: '正享受主人的抚摸',
  pregnant: '正在安静养胎',
  birth: '刚刚生产，正护着幼崽',
  grow: '正在欢快地成长',
  sick: '精神有些萎靡',
};

function statusOf(pet) {
  if (pet.isPregnant) return '正在安静养胎';
  if (!pet.journal || pet.journal.length === 0) return '正在悠闲地活动';
  const last = pet.journal[pet.journal.length - 1];
  return STATUS_BY_TYPE[last.type] || '正在悠闲地活动';
}

// ===== 灵宠记事库 =====
// 每条：{ t: 模板文本, minFavor?: 与对象好感下限, stage?: ['幼年期','少年期','成年期'] }
// 占位：{self}=灵宠名 {owner}=主控名 {other}=其他灵宠名 {kid}=子嗣名 {w}=妻妾名 {npc}=NPC名 {food}=食物名
const PET_STORIES = {
  // 灵宠独自发生
  explore: [
    { t: '{self}在附近的山林里穿梭了一整天，叼回一株沾着露水的{reward}，悄悄放在你门口。', reward: ['灵草', '灵果', '灵兽口粮', '银两'] },
    { t: '{self}不知跑到哪里疯玩，回来时满身草叶，爪子里还抓着{reward}，邀功似的冲你直摇尾巴。', reward: ['灵草', '灵谷', '妖兽肉'] },
    { t: '{self}在溪边玩耍时发现了一枚闪亮的{reward}，兴冲冲地叼来送给你。', reward: ['灵石', '妖丹', '灵果'] },
    { t: '{self}追着一只蝴蝶跑进了密林深处，过了许久才钻出来，嘴里衔着一株{reward}。', reward: ['灵草', '灵果'] },
    { t: '{self}趁你不注意溜出家门，回来后神秘兮兮地藏着什么——原来是一块{reward}。', reward: ['灵石', '妖丹'] },
    { t: '{self}今天格外亢奋，在院子里上蹿下跳，折腾累了才趴在树荫下打盹。' },
    { t: '{self}对着水里的倒影玩得不亦乐乎，时不时扑上去拍水花，弄得一身湿。' },
    { t: '{self}在墙角刨了个小坑，把不知哪捡来的{reward}埋了进去，还回头张望了几眼。', reward: ['灵谷', '灵石'] },
    { t: '{self}半夜溜出去看月亮，蹲在屋顶上一动不动，像个小小的剪影。' },
    { t: '{self}追着自己的尾巴转圈，转了十几圈后晕乎乎地栽倒在地，爬起来又继续。' },
    { t: '{self}找到一处灵气浓郁的角落，安安静静地趴着吐纳修炼，毛发间泛起淡淡光泽。' },
    { t: '{self}与一只野外的同类对峙良久，互不相让，最后各自悻悻离开。' },
  ],
  play: [
    { t: '{self}叼着你丢出去的树枝满院子跑，追到后得意地甩着尾巴等你再扔一次。' },
    { t: '{self}在草丛里打滚，把身上沾满花瓣和草屑，还打了个大大的喷嚏。' },
    { t: '{self}逮住一只蚂蚱，玩一会儿放掉，又扑住，玩得不亦乐乎。' },
    { t: '{self}在沙地上刨出好几个坑，把自己埋进去只露出脑袋，玩起了捉迷藏。' },
    { t: '{self}对着飘落的树叶蹦跳扑击，像在演练捕猎，姿势认真得可爱。' },
    { t: '{self}滚成一个毛团在院子里滚来滚去，撞到柱子才停下，晕头转向地爬了起来。' },
    { t: '{self}在阳光下追着自己的影子玩，时而停下来困惑地歪歪头。' },
    { t: '{self}把晒着的兽皮拖到地上当垫子，舒舒服服地趴在上面打盹。' },
    { t: '{self}学着你的样子端坐，模仿你打坐的姿势，逗得人忍俊不禁。' },
  ],
  // 与其他灵宠
  mate_ok: [
    { t: '{self}与{other}依偎在一起晒太阳，互相舔舐对方的毛发，关系十分要好。', minFavor: 40 },
    { t: '{self}和{other}合力叼来一根大骨头，谁也不肯独享，最后一起分享。', minFavor: 40 },
    { t: '{self}与{other}玩起了追逐游戏，一前一后在院子里疯跑，快乐极了。', minFavor: 30 },
    { t: '{self}趴在{other}身边，把脑袋枕在对方背上，睡得香甜。', minFavor: 50 },
    { t: '{self}叼来食物分给{other}，{other}蹭了蹭{self}的脖子表示感谢。', minFavor: 50 },
  ],
  mate_bad: [
    { t: '{self}与{other}为了抢一块肉吵了起来，互相龇牙低吼，最后不欢而散。', maxFavor: 40 },
    { t: '{self}被{other}抢走了最喜欢的玩具，气得一天没理对方。', maxFavor: 40 },
    { t: '{self}与{other}在院门口对峙，谁也不肯让路，气氛一度很紧张。', maxFavor: 30 },
    { t: '{self}偷吃了{other}的食物，被{other}追着满院子跑。', maxFavor: 40 },
  ],
  mate: [
    { t: '{self}与{other}在花丛间交颈依偎，耳鬓厮磨，亲昵得旁若无人。', stage: ['成年期'], minFavor: 70 },
    { t: '{self}与{other}结伴出游，回来后神态亲昵，看起来感情又深了几分。', stage: ['成年期'], minFavor: 60 },
  ],
  // 与主人
  owner: [
    { t: '{self}看到你回来，欢快地扑到你脚边，绕着你打转。' },
    { t: '{self}安静地趴在你身边，陪着你修炼，偶尔抬头看你一眼。' },
    { t: '{self}叼着心爱的玩具放到你手里，眼巴巴地望着你，想让你陪它玩。' },
    { t: '{self}在你打坐时悄悄把脑袋搭在你膝上，尾巴轻轻摆动。' },
    { t: '{self}用脑袋蹭着你的手心，发出满足的哼声。' },
    { t: '{self}跟在你身后亦步亦趋，像个小跟班，寸步不离。' },
    { t: '{self}夜里守在你房门口，听到动静就竖起耳朵，忠心耿耿。' },
    { t: '{self}在你闭关时守在外头，寸步不离地等着你出关。' },
  ],
  // 与主人子嗣
  child: [
    { t: '{self}正和{kid}在院子里追逐嬉闹，玩得一身是泥。' },
    { t: '{self}乖乖让{kid}抱着，偶尔伸出舌头舔舔{kid}的脸。' },
    { t: '{self}叼来玩具放在{kid}脚边，邀请{kid}一起玩。' },
    { t: '{self}被{kid}当马骑，却一点都不恼，反而走得很稳当。' },
    { t: '{self}在{kid}午睡时守在一旁，替{kid}赶走蚊虫。' },
  ],
  // 与主人妻妾
  concubine: [
    { t: '{self}亲昵地蹭着{w}的裙角，把{w}逗得直笑。' },
    { t: '{self}叼着一支野花放在{w}手里，像是在献殷勤。' },
    { t: '{self}安静地趴在{w}脚边，陪着{w}做针线活。' },
    { t: '{self}见{w}心情不好，围着她转圈逗她开心。' },
    { t: '{self}偷偷钻进{w}的房间，把{w}的胭脂盒拱到了地上。' },
  ],
  // 投喂事件
  feed: [
    { t: '你喂了{self}一些{food}，它吃得津津有味，尾巴摇得像风车。' },
    { t: '{self}闻到你手里的{food}，立刻窜过来，眼巴巴地望着你。' },
    { t: '你投喂{food}时，{self}轻轻舔了舔你的手指，表示亲昵。' },
    { t: '{self}把{food}叼到角落里慢慢享用，生怕被别的灵宠抢走。' },
    { t: '你拿出{food}，{self}开心地打了个滚，立刻凑上来大快朵颐。' },
  ],
  // 被抚摸
  stroke: [
    { t: '你轻轻抚摸{self}的脊背，它舒服地眯起眼睛，喉咙里发出咕噜声。' },
    { t: '你挠了挠{self}的下巴，它仰起头，一脸享受。' },
    { t: '你抚过{self}的毛发，它蹭了蹭你的手，亲近地依偎过来。' },
    { t: '你为{self}梳理毛发，它乖乖趴着，时不时回头看你一眼。' },
    { t: '你摸着{self}的脑袋，它闭上眼，呼吸渐渐平缓，睡着了。' },
  ],
  // 怀孕/生产
  pregnant: [
    { t: '{self}最近胃口变大了，总是懒洋洋地趴着，肚子里似乎有了新的小生命。' },
    { t: '{self}小心翼翼地走动，时不时护着肚子，眼里满是温柔。' },
    { t: '{self}最近变得格外粘人，总喜欢靠在你身边，寻求安慰。' },
  ],
  birth: [
    { t: '{self}产下了一枚{eggName}！它小心地用身体护着蛋，警惕地看着四周。' },
    { t: '{self}生产了一枚{eggName}，筋疲力尽却仍紧紧护着孩子。' },
  ],
  grow: [
    { t: '{self}最近长得飞快，个头又大了一圈，叫声也越来越洪亮。' },
    { t: '{self}换了一身新毛，毛色油亮，看起来精神多了。' },
    { t: '{self}开始学着捕捉小虫，动作虽然笨拙，却认真得很。' },
    { t: '{self}褪去了幼时的稚嫩，眼神里多了几分沉稳。' },
  ],
};

// 从记事库按条件取一条
function pickStory(pool, pet, opts = {}) {
  const arr = PET_STORIES[pool] || [];
  const candidates = arr.filter(s => {
    if (s.stage && !s.stage.includes(pet.growthStage)) return false;
    if (s.minFavor !== undefined && (opts.favor === undefined || opts.favor < s.minFavor)) return false;
    if (s.maxFavor !== undefined && (opts.favor === undefined || opts.favor > s.maxFavor)) return false;
    return true;
  });
  const base = candidates.length ? randChoice(candidates) : randChoice(arr);
  let t = base.t;
  const replace = { self: pet.name, owner: opts.owner || '主人', other: opts.other || '同伴', kid: opts.kid || '小主人', w: opts.w || '夫人', npc: opts.npc || '', food: opts.food || '食物' };
  for (const k of Object.keys(replace)) t = t.split('{' + k + '}').join(replace[k]);
  // 奖励占位：探索所得入背包
  if (base.reward) t = t.replace('{reward}', randChoice(base.reward));
  return t;
}

// ===== 初始化/迁移 =====
function initPetLife(player) {
  if (!player.pets) player.pets = [];
  for (const pet of player.pets) {
    if (!pet.id) pet.id = 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    if (!pet.gender) pet.gender = randGender();
    if (!pet.personality || !PET_PERSONALITIES.includes(pet.personality)) pet.personality = randChoice(PET_PERSONALITIES);
    if (!pet.growthStage) { pet.growthXun = pet.growthXun || 0; pet.growthStage = GROWTH_STAGES[pet.growthXun >= GROWTH_XUN.teen ? 2 : (pet.growthXun >= GROWTH_XUN.infant ? 1 : 0)]; }
    if (typeof pet.growthXun !== 'number') pet.growthXun = 0;
    if (!pet.status) pet.status = '正在悠闲地活动';
    if (typeof pet.following !== 'boolean') pet.following = false;
    if (!pet.petRelations) pet.petRelations = {};
    if (!pet.family) pet.family = { father: null, mother: null, children: [] };
    if (!Array.isArray(pet.journal)) pet.journal = [];
    if (typeof pet.isPregnant !== 'boolean') { pet.isPregnant = false; pet.pregnancyMonths = 0; pet.pregnancyFather = null; }
    // 投喂晋升兜底
    if (typeof pet.promoteCur !== 'number') pet.promoteCur = 0;
    if (typeof pet.promoteExp !== 'number') {
      const t = require('./pet').PET_TYPES.find(x => x.id === pet.typeId);
      pet.promoteExp = (t && t.promoteExp) || 200;
    }
    if (!pet.feedValues || Object.keys(pet.feedValues).length === 0) {
      const t = require('./pet').PET_TYPES.find(x => x.id === pet.typeId);
      if (t && t.feedValues) pet.feedValues = Object.assign({}, t.feedValues);
    }
  }
  // 灵宠蛋迁移：蛋在背包 inventory 中（名称以"蛋"结尾且与 PET_TYPES 名匹配）
  return player.pets;
}

// 取主控背包中所有灵宠蛋
function listPetEggs(player) {
  const inv = player.inventory || [];
  const eggs = [];
  const known = new Set(['灵鼠蛋', '灵猫蛋', '灵貂蛋', '灵雀蛋', '彩蝶蛋', '玉兔蛋', '苍狼蛋', '哮天犬蛋', '青鳞蛇蛋', '灵猴蛋', '锦鲤蛋', '山魈蛋', '玄龟蛋', '黑熊蛋', '仙鹤蛋', '金蟾蛋', '冰蛛蛋', '独角犀蛋', '银狼王蛋', '白虎蛋', '火麒麟蛋', '雷豹蛋', '金翅大鹏蛋', '赤炎狮蛋', '九色鹿蛋', '紫电貂蛋', '九尾狐蛋', '朱雀蛋', '白泽蛋', '青龙蛋', '玄武蛋', '混沌兽蛋']);
  for (const it of inv) {
    if (known.has(it.name) && it.count > 0) {
      eggs.push({ name: it.name, count: it.count, isBloodEgg: false });
    }
  }
  // 血脉蛋（父母血脉产的蛋，特殊前缀标记）
  for (const it of inv) {
    if (/^血脉·/.test(it.name) && it.count > 0) {
      eggs.push({ name: it.name, count: it.count, isBloodEgg: true });
    }
  }
  return eggs;
}

// ===== 记事写入 =====
function petAddJournal(pet, type, msg, state, dateText) {
  if (!pet.journal) pet.journal = [];
  pet.journal.push({ time: dateText || (state && state.gameDateText) || '', type, msg });
  pet.status = statusOf(pet);
  // 同步主控记事（与主控相关类型）
  if (state && state.player) {
    const ownerMsg = msg.replace(new RegExp(pet.name, 'g'), pet.name);
    state.player.journal = state.player.journal || [];
    state.player.journal.push({ time: dateText || state.gameDateText || '', msg: `${ownerMsg}`, type: 'pet' });
  }
  return pet;
}

// ===== 每旬更新：成长 + 记事 + 交配 + 怀孕 =====
function petXunUpdate(state, dateText) {
  const player = state.player;
  if (!player) return { logs: [] };
  const logs = [];
  const pets = player.pets || [];
  if (pets.length === 0) return { logs };

  // 1. 成长推进
  for (const pet of pets) {
    if (pet.isPregnant) {
      // 孕期推进（怀孕5旬后生产）
      pet.pregnancyMonths = (pet.pregnancyMonths || 0) + 1;
      if (pet.pregnancyMonths >= 5) {
        givePetBirth(state, pet, dateText, logs);
      } else if (chance(60)) {
        const msg = pickStory('pregnant', pet, { owner: player.name });
        petAddJournal(pet, 'pregnant', `${msg}`, state, dateText);
      }
      continue;
    }
    // 非孕期：成长
    pet.growthXun = (pet.growthXun || 0) + 1;
    const prevStage = pet.growthStage;
    if (pet.growthXun >= GROWTH_XUN.teen) pet.growthStage = '成年期';
    else if (pet.growthXun >= GROWTH_XUN.infant) pet.growthStage = '少年期';
    else pet.growthStage = '幼年期';
    if (pet.growthStage !== prevStage && chance(70)) {
      const msg = pickStory('grow', pet, { owner: player.name });
      petAddJournal(pet, 'grow', `${msg}`, state, dateText);
      logs.push(`${pet.name}成长为${pet.growthStage}！`);
    }
  }

  // 2. 交配判定（高好感成年期异性，小概率）
  const adults = pets.filter(p => p.growthStage === '成年期' && !p.isPregnant);
  for (const a of adults) {
    for (const b of adults) {
      if (a.id === b.id) continue;
      if (a.gender === b.gender) continue;
      const favor = (a.petRelations && a.petRelations[b.id]) ? a.petRelations[b.id].favor : 0;
      if (favor < 60) continue;
      if (!chance(3)) continue; // 小概率
      const female = a.gender === '雌' ? a : b;
      const male = a.gender === '雄' ? a : b;
      // 雌性5%怀孕
      if (chance(5)) {
        female.isPregnant = true;
        female.pregnancyMonths = 0;
        female.pregnancyFather = male.id;
        if (!female.petRelations) female.petRelations = {};
        if (!female.petRelations[male.id]) female.petRelations[male.id] = { favor: clamp((female.petRelations[male.id]?.favor || 50) + 10, 0, 100), type: '配偶' };
        female.petRelations[male.id].type = '配偶';
        const msg = `${female.name}与${male.name}春风一度，似乎有了身孕。`;
        petAddJournal(female, 'pregnant', msg, state, dateText);
        petAddJournal(male, 'mate', `${male.name}与${female.name}春风一度，{self}与${female.name}的感情更深了。`.replace('{self}', male.name), state, dateText);
        logs.push(`${female.name}怀上了${male.name}的孩子！`);
      } else {
        const msg = `${female.name}与${male.name}度过了一段缱绻时光。`;
        petAddJournal(female, 'mate', msg, state, dateText);
        petAddJournal(male, 'mate', `${male.name}与${female.name}度过了一段缱绻时光。`, state, dateText);
      }
    }
  }

  // 3. 每只灵宠每旬 0-3 条随机记事
  for (const pet of pets) {
    const n = randInt(0, 3);
    for (let i = 0; i < n; i++) {
      const evt = rollPetEvent(state, pet, dateText);
      if (evt) {
        petAddJournal(pet, evt.type, evt.msg, state, dateText);
        if (evt.log) logs.push(evt.log);
      }
    }
  }

  // 4. 状态刷新
  for (const pet of pets) pet.status = statusOf(pet);
  return { logs };
}

// 随机滚动一个灵宠事件
function rollPetEvent(state, pet, dateText) {
  const player = state.player;
  const pets = player.pets || [];
  const others = pets.filter(p => p.id !== pet.id);
  const kids = (player.childrenList || []).length ? null : null; // 子嗣从 state.npcs 查

  const roll = randInt(1, 100);
  // 事件池权重
  const pools = [
    { w: 20, key: 'explore', need: null },
    { w: 15, key: 'play', need: null },
    { w: 12, key: 'owner', need: null },
    { w: 10, key: 'mate_ok', need: others.length > 0 },
    { w: 8, key: 'mate_bad', need: others.length > 0 },
    { w: 10, key: 'child', need: hasKids(state) },
    { w: 8, key: 'concubine', need: hasConcubine(state) },
  ];
  const available = pools.filter(p => p.need !== false);
  const totalW = available.reduce((s, p) => s + p.w, 0);
  let r = randInt(1, totalW);
  let chosen = available[0];
  for (const p of available) { if (r <= p.w) { chosen = p; break; } r -= p.w; }

  switch (chosen.key) {
    case 'explore': {
      const reward = randChoice(['灵草', '灵果', '灵兽口粮', '灵石', '妖丹', '银两']);
      const msg = pickStory('explore', pet, { owner: player.name });
      // 探索所得放入主控背包
      addItemToPlayer(player, reward);
      return { type: 'explore', msg, log: `${pet.name}探索带回${reward}` };
    }
    case 'play': {
      const msg = pickStory('play', pet, { owner: player.name });
      return { type: 'play', msg };
    }
    case 'owner': {
      const msg = pickStory('owner', pet, { owner: player.name });
      return { type: 'owner', msg };
    }
    case 'mate_ok': {
      const other = randChoice(others);
      const favor = (pet.petRelations && pet.petRelations[other.id]) ? pet.petRelations[other.id].favor : randInt(20, 50);
      if (!pet.petRelations) pet.petRelations = {};
      const nf = clamp(favor + randInt(5, 15), 0, 100);
      pet.petRelations[other.id] = { favor: nf, type: nf >= 70 ? '密友' : '朋友' };
      if (!other.petRelations) other.petRelations = {};
      other.petRelations[pet.id] = { favor: nf, type: nf >= 70 ? '密友' : '朋友' };
      const msg = pickStory('mate_ok', pet, { owner: player.name, other: other.name, favor: nf });
      return { type: 'mate_ok', msg };
    }
    case 'mate_bad': {
      const other = randChoice(others);
      const favor = (pet.petRelations && pet.petRelations[other.id]) ? pet.petRelations[other.id].favor : randInt(20, 50);
      if (!pet.petRelations) pet.petRelations = {};
      const nf = clamp(favor - randInt(5, 15), 0, 100);
      pet.petRelations[other.id] = { favor: nf, type: nf <= 20 ? '仇敌' : '不和' };
      if (!other.petRelations) other.petRelations = {};
      other.petRelations[pet.id] = { favor: nf, type: nf <= 20 ? '仇敌' : '不和' };
      const msg = pickStory('mate_bad', pet, { owner: player.name, other: other.name, favor: nf });
      return { type: 'mate_bad', msg };
    }
    case 'child': {
      const kid = randChoice(kidNpcs(state));
      const msg = pickStory('child', pet, { owner: player.name, kid: kid.name });
      return { type: 'child', msg };
    }
    case 'concubine': {
      const w = randChoice(concubineNames(state));
      const msg = pickStory('concubine', pet, { owner: player.name, w });
      return { type: 'concubine', msg };
    }
  }
  return null;
}

// ===== 生产 =====
function givePetBirth(state, pet, dateText, logs) {
  const player = state.player;
  const fatherId = pet.pregnancyFather;
  const father = (player.pets || []).find(p => p.id === fatherId);
  pet.isPregnant = false;
  pet.pregnancyMonths = 0;
  // 父或母血脉蛋
  const bloodFrom = Math.random() < 0.5 ? pet : father;
  const eggName = bloodFrom ? `血脉·${bloodFrom.name}蛋` : '血脉·灵宠蛋';
  // 入背包
  if (!player.inventory) player.inventory = [];
  const inv = player.inventory.find(i => i.name === eggName);
  if (inv) inv.count++;
  else player.inventory.push({ name: eggName, count: 1, type: 'egg', desc: `由${pet.name}产下的血脉蛋，可孵化出${bloodFrom ? bloodFrom.name : '灵宠'}血脉的后代` });
  const msg = pickStory('birth', pet, { owner: player.name, eggName });
  petAddJournal(pet, 'birth', msg, state, dateText);
  // 子嗣系统：记录父/母
  if (father) {
    if (!pet.family) pet.family = { father: null, mother: null, children: [] };
    if (!father.family) father.family = { father: null, mother: null, children: [] };
    // 蛋孵化后才生成幼崽，这里先记录蛋的父/母血脉关系
  }
  const l = `${pet.name}产下了一枚${eggName}！`;
  if (logs) logs.push(l);
  return { success: true, eggName, msg };
}

// 孵化血脉蛋
function hatchBloodEgg(player, eggName, state, dateText) {
  if (!/^血脉·/.test(eggName)) return { success: false, msg: '这不是血脉蛋' };
  const inv = (player.inventory || []).find(i => i.name === eggName && i.count > 0);
  if (!inv) return { success: false, msg: `背包中没有${eggName}` };
  inv.count--;
  if (inv.count <= 0) player.inventory = player.inventory.filter(i => i.name !== eggName);
  // 找父/母类型
  const baseName = eggName.replace(/^血脉·/, '').replace(/蛋$/, '');
  const petType = require('./pet').PET_TYPES.find(t => t.name === baseName);
  const baby = require('./pet').generatePet(petType ? petType.id : null);
  baby.gender = randGender();
  baby.personality = randChoice(PET_PERSONALITIES);
  baby.growthStage = '幼年期';
  baby.growthXun = 0;
  // 血缘：从已有灵宠找同名类型作为父/母
  const parent = (player.pets || []).find(p => p.name === baseName && p.gender === '雌') || (player.pets || []).find(p => p.name === baseName);
  if (parent) {
    if (!parent.family) parent.family = { father: null, mother: null, children: [] };
    if (!baby.family) baby.family = { father: null, mother: null, children: [] };
    parent.family.children.push(baby.id);
    if (parent.gender === '雌') { baby.family.mother = parent.id; }
    else { baby.family.father = parent.id; }
    // 好感初始
    if (!parent.petRelations) parent.petRelations = {};
    parent.petRelations[baby.id] = { favor: 80, type: parent.gender === '雌' ? '母子' : '父子' };
    baby.petRelations = { [parent.id]: { favor: 80, type: parent.gender === '雌' ? '母子' : '父子' } };
  }
  if (!player.pets) player.pets = [];
  player.pets.push(baby);
  const msg = `${eggName.replace(/^血脉·/, '')}破壳而出，一只${baby.gender}${baby.name}来到了世间！`;
  petAddJournal(baby, 'grow', `${baby.name}破壳而出，睁着懵懂的眼睛打量着这个世界。`, state, dateText);
  return { success: true, pet: baby, msg };
}

// ===== 辅助 =====
function addItemToPlayer(player, itemName) {
  if (!player.inventory) player.inventory = [];
  const inv = player.inventory.find(i => i.name === itemName);
  if (inv) inv.count++;
  else player.inventory.push({ name: itemName, count: 1, desc: itemName });
}

function hasKids(state) {
  const p = state.player;
  if (!p) return false;
  return (state.npcs || []).some(n => n && n.isAlive !== false && n.family && (n.family.father === p.id || n.family.mother === p.id));
}

function kidNpcs(state) {
  const p = state.player;
  return (state.npcs || []).filter(n => n && n.isAlive !== false && n.family && (n.family.father === p.id || n.family.mother === p.id));
}

function hasConcubine(state) {
  const p = state.player;
  const m = p && p.mansion;
  return !!(m && m.concubines && m.concubines.length > 0);
}

function concubineNames(state) {
  const p = state.player;
  const m = p && p.mansion;
  if (!m || !m.concubines) return ['夫人'];
  const names = (state.npcs || []).filter(n => m.concubines.includes(n.id)).map(n => n.name);
  return names.length ? names : ['夫人'];
}

// ===== 抚摸事件 =====
function strokePet(player, pet, dateText) {
  const msg = pickStory('stroke', pet, { owner: player.name });
  pet.loyalty = clamp((pet.loyalty || 50) + 3, 0, 100);
  const favorGain = randInt(1, 3);
  petAddJournal(pet, 'stroke', msg, player && { player, gameDateText: dateText }, dateText);
  return { success: true, msg: msg.replace(new RegExp('你', 'g'), '你'), favorGain, loyalty: pet.loyalty };
}

// ===== 投喂事件（扩展：记录记事；feedValues 缺失时从 PET_TYPES 兜底） =====
function feedPetWithJournal(player, pet, foodName, dateText, count = 1) {
  const fv = pet.feedValues || {};
  if (Object.keys(fv).length === 0) {
    const t = require('./pet').PET_TYPES.find(x => x.id === pet.typeId);
    if (t && t.feedValues) { pet.feedValues = Object.assign({}, t.feedValues); }
  }
  const r = require('./pet').feedPetItem(player, pet, foodName, count);
  if (!r.success) return r;
  const msg = pickStory('feed', pet, { owner: player.name, food: foodName });
  petAddJournal(pet, 'feed', msg, player && { player, gameDateText: dateText }, dateText);
  return r;
}

module.exports = {
  PET_PERSONALITIES, GROWTH_STAGES, GROWTH_XUN, PET_STORIES,
  randGender, statusOf, initPetLife, listPetEggs, petAddJournal,
  petXunUpdate, rollPetEvent, givePetBirth, hatchBloodEgg,
  addItemToPlayer, pickStory, strokePet, feedPetWithJournal,
  hasKids, kidNpcs, hasConcubine, concubineNames,
};
