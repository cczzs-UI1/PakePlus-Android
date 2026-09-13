// NPC扩展剧情库 - 婚配/一夜情/偷情/低劣行为/工作/子嗣/私生子/奸生子/宠物
// 所有剧情必须根据NPC实际情况触发
const { randChoice, chance, randInt, clamp, genderize } = require('./utils');

// hp 归一化：数字/NaN/缺失 → {current, max} 对象，保证后续操作 current 不崩溃
function hpObj(n) {
  if (!n.hp || typeof n.hp === 'number' || isNaN(n.hp)) {
    const v = typeof n.hp === 'number' && !isNaN(n.hp) ? n.hp : 100;
    n.hp = { current: v, max: v };
  }
  if (n.hp.current === undefined) n.hp.current = n.hp.max || 100;
  if (n.hp.max === undefined) n.hp.max = n.hp.current || 100;
  return n.hp;
}

// 是否已有妾室（兼容顶层 concubines 与 family.concubines）
function hasConcubine(n) {
  return !!((n.concubines && n.concubines.length) || (n.family && n.family.concubines && n.family.concubines.length));
}

// ===== 婚配类剧情 =====
const marriageEvents = [
  // 条件：未婚、成年
  {
    condition: (n) => n.age >= 16 && !n.family?.spouse && !hasConcubine(n) && n.gender === '男',
    needsTarget: true,
    text: (n, l, ctx) => {
      const bride = ctx?.target;
      if (bride) {
        return `${n.name}在${l}经媒人介绍，与${bride.name}相识，两人情投意合，不久便举办了婚礼，结为夫妻。`;
      }
      return `${n.name}在${l}经媒人说合，娶了一房媳妇，婚礼热热闹闹办了三天。`;
    },
    effect: (n, l, ctx) => {
      n.reputation = (n.reputation || 0) + randInt(5, 15);
      n.silver = (n.silver || 0) - randInt(100, 500);
      if (ctx?.target) {
        if (!n.family) n.family = {};
        n.family.spouse = ctx.target.id;
        if (!ctx.target.family) ctx.target.family = {};
        ctx.target.family.spouse = n.id;
        // 关系网链接
        if (!n.relations) n.relations = {};
        n.relations[ctx.target.id] = { type: '配偶', favor: 60, name: ctx.target.name };
        if (!ctx.target.relations) ctx.target.relations = {};
        ctx.target.relations[n.id] = { type: '配偶', favor: 60, name: n.name };
      }
    },
    journal: (n, l, ctx) => `${l}·${n.name}与${ctx?.target?.name || '一位路人'}成婚。`
  },
  {
    condition: (n) => n.age >= 16 && !n.family?.spouse && !hasConcubine(n) && n.gender === '女',
    needsTarget: true,
    text: (n, l, ctx) => {
      const groom = ctx?.target;
      if (groom) {
        return `${n.name}在${l}被花轿抬进了${groom.name}的府邸，从此嫁作人妇，与${groom.name}结为夫妻，开始了新的生活。`;
      }
      return `${n.name}在${l}经媒人说合，嫁与一户人家为妻，婚礼虽不奢华却也热闹。`;
    },
    effect: (n, l, ctx) => {
      n.reputation = (n.reputation || 0) + randInt(5, 10);
      if (ctx?.target) {
        if (!n.family) n.family = { children: [], spouse: null };
        n.family.spouse = ctx.target.id;
        if (!ctx.target.family) ctx.target.family = { children: [], spouse: null };
        ctx.target.family.spouse = n.id;
        // 设置关系
        if (!n.relations) n.relations = {};
        if (!ctx.target.relations) ctx.target.relations = {};
        n.relations[ctx.target.id] = { type: '夫妻', favor: randInt(50, 90), name: ctx.target.name };
        ctx.target.relations[n.id] = { type: '夫妻', favor: randInt(50, 90), name: n.name };
      }
    },
    journal: (n, l, ctx) => `${l}·${n.name}嫁与${ctx?.target?.name || '一位路人'}为妻。`
  },
  // 休妻
  {
    condition: (n) => n.family?.spouse && n.gender === '男' && chance(10),
    text: (n, l) => `${n.name}在${l}因与妻子感情不和，一纸休书将其休了，两人从此恩断义绝。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(5, 15);
      if (n.family) n.family.spouse = null;
    },
    journal: (n, l) => `${l}·${n.name}休妻。`
  },
];

// ===== 一夜情类剧情 =====
const oneNightStandEvents = [
  {
    condition: (n) => n.age >= 16,
    text: (n, l, ctx) => {
      const partner = ctx?.target;
      if (partner) {
        return `${n.name}在${l}的酒楼中与${partner.name}相遇，两人一见如故，喝了不少酒，当夜便共度良宵。`;
      }
      return n.gender === '女'
        ? `${n.name}在${l}的青楼中与一位蓝颜知己共度了一夜，次日醒来时人已不见，只留下一缕余香。`
        : `${n.name}在${l}的青楼中与一位红颜知己共度了一夜，次日醒来时人已不见，只留下一缕余香。`;
    },
    effect: (n, l, ctx) => {
      n.silver = (n.silver || 0) - randInt(20, 100);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(5, 15));
      if (ctx?.target) {
        // 可能怀孕
        if (n.gender === '女' && chance(15) && !n.isPregnant) {
          n.isPregnant = true;
          n.pregnancyMonths = 0;
          n.pregnancyFather = ctx.target.id;
        }
      }
    },
    journal: (n, l, ctx) => `${l}·${n.name}与${ctx?.target?.name || '一位路人'}一夜风流。`
  },
  {
    condition: (n) => n.age >= 18 && (n.personality === '风流' || n.personality === '淫荡'),
    text: (n, l) => `${n.name}在${l}的巷子里与一位野鸳鸯苟合，正巧被路过的人撞见，一时间传得沸沸扬扬。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(10, 25);
      n.silver = (n.silver || 0) - randInt(10, 50);
    },
    journal: (n, l) => `${l}·${n.name}偷情被人撞见。`
  },
];

// ===== 偷情类剧情 =====
const affairEvents = [
  {
    condition: (n) => n.family?.spouse && n.age >= 18,
    text: (n, l, ctx) => {
      const lover = ctx?.target;
      if (lover) {
        return n.gender === '女'
          ? `${n.name}在${l}趁丈夫不在家，与${lover.name}私会，两人缠绵了大半天。`
          : `${n.name}在${l}趁妻子不在家，与${lover.name}私会，两人缠绵了大半天。`;
      }
      return `${n.name}在${l}与情人暗中幽会，小心翼翼，生怕被人发现。`;
    },
    effect: (n, l, ctx) => {
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(5, 10));
      // 可能被发现
      if (chance(20)) {
        n.reputation = (n.reputation || 0) - randInt(15, 40);
        if (n.family?.spouse) {
          // 配偶好感度下降
        }
      }
      // 可能怀孕
      if (n.gender === '女' && chance(20) && !n.isPregnant) {
        n.isPregnant = true;
        n.pregnancyMonths = 0;
        n.pregnancyFather = ctx?.target?.id;
        n.pregnancyIsAffair = true;
      }
    },
    journal: (n, l, ctx) => `${l}·${n.name}与${ctx?.target?.name || '一位情人'}私会。`
  },
  {
    condition: (n) => n.family?.spouse && n.age >= 20 && chance(15),
    text: (n, l) => n.gender === '女'
      ? `${n.name}在${l}与情人偷情时被丈夫当场捉奸，大闹了一场，整个街坊都知道了。`
      : `${n.name}在${l}与情人偷情时被妻子当场捉奸，大闹了一场，整个街坊都知道了。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(30, 60);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(20, 50));
      // 可能被休
      if (n.gender === '女' && chance(50)) {
        if (n.family) n.family.spouse = null;
      }
    },
    journal: (n, l) => `${l}·${n.name}偷情被当场捉奸。`
  },
];

// ===== 低劣行为类剧情 =====
const vileEvents = [
  {
    condition: (n) => n.age >= 12,
    text: (n, l) => `${n.name}在${l}的集市上偷了一位老婆婆的鸡蛋，被人发现后挨了一顿骂。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(3, 8);
      n.silver = (n.silver || 0) + randInt(1, 5);
    },
    journal: (n, l) => `${l}·${n.name}偷老婆婆鸡蛋被骂。`
  },
  {
    condition: (n) => n.age >= 14,
    text: (n, l) => `${n.name}在${l}的酒馆里吃了霸王餐，趁老板不注意偷偷溜了。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(5, 12);
      n.silver = (n.silver || 0) + randInt(10, 30);
    },
    journal: (n, l) => `${l}·${n.name}吃霸王餐溜走。`
  },
  {
    condition: (n) => n.age >= 16,
    text: (n, l) => `${n.name}在${l}与人打架斗殴，把对方打得头破血流，最后被官府罚了款。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(10, 25);
      n.silver = (n.silver || 0) - randInt(20, 100);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(10, 30));
    },
    journal: (n, l) => `${l}·${n.name}打架斗殴被罚款。`
  },
  {
    condition: (n) => n.age >= 18,
    text: (n, l) => `${n.name}在${l}放火烧了仇家的房子，幸好发现及时没有造成人员伤亡，但${n.name}也成了通缉犯。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(30, 60);
      n.karma = (n.karma || 0) - 50;
      n.isWanted = true;
    },
    journal: (n, l) => `${l}·${n.name}放火烧房成通缉犯。`
  },
  {
    condition: (n) => n.age >= 16 && (n.personality === '贪婪' || n.personality === '阴险'),
    text: (n, l) => `${n.name}在${l}设计陷害了一位无辜之人，害得对方家破人亡，自己却从中获利。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) + randInt(100, 500);
      n.karma = (n.karma || 0) - 80;
      n.reputation = (n.reputation || 0) - randInt(10, 30);
    },
    journal: (n, l) => `${l}·${n.name}设计陷害无辜。`
  },
];

// ===== 工作相关类剧情 =====
const workEvents = [
  {
    condition: (n) => n.professionName || n.profession,
    text: (n, l) => `${n.name}在${l}勤勤恳恳地工作了一个月，得到了雇主的嘉奖，发了些奖金。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) + randInt(20, 80);
      n.reputation = (n.reputation || 0) + randInt(1, 5);
    },
    journal: (n, l) => `${l}·${n.name}工作勤恳获嘉奖。`
  },
  {
    condition: (n) => n.professionName || n.profession,
    text: (n, l) => `${n.name}在${l}工作时出了差错，被雇主扣了半个月的工钱，还挨了一顿训斥。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(10, 50);
      n.reputation = (n.reputation || 0) - randInt(1, 5);
    },
    journal: (n, l) => `${l}·${n.name}工作出错被扣工钱。`
  },
  {
    condition: (n) => n.professionName || n.profession,
    text: (n, l) => `${n.name}在${l}的工作中展现了出色的能力，被雇主提拔为管事，薪水也涨了不少。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) + randInt(50, 150);
      n.reputation = (n.reputation || 0) + randInt(5, 15);
    },
    journal: (n, l) => `${l}·${n.name}被提拔为管事。`
  },
  {
    condition: (n) => n.professionName || n.profession,
    text: (n, l) => `${n.name}在${l}与同事发生了争执，两人吵得不可开交，最后被雇主各打五十大板。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(2, 8);
      n.silver = (n.silver || 0) - randInt(5, 20);
    },
    journal: (n, l) => `${l}·${n.name}与同事争执被罚。`
  },
];

// ===== 子嗣类剧情 =====
const childEvents = [
  // 条件：有子女
  {
    condition: (n) => n.family?.children && n.family.children.length > 0,
    text: (n, l, ctx) => {
      const child = ctx?.child;
      if (child) {
        return `${n.name}在${l}看着孩子${child.name}一天天长大，心中充满了欣慰，特意给孩子买了些新衣服。`;
      }
      return `${n.name}在${l}陪孩子们玩耍，享受天伦之乐，一家人其乐融融。`;
    },
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(10, 50);
      hpObj(n).current = Math.min(hpObj(n).max, hpObj(n).current + randInt(5, 15));
    },
    journal: (n, l) => `${l}·${n.name}享受天伦之乐。`
  },
  {
    condition: (n) => n.family?.children && n.family.children.length > 0,
    text: (n, l, ctx) => `${n.name}在${l}的孩子生病了，${n.name}焦急万分，请了好几位大夫来看，花了不少钱才治好。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(30, 150);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(5, 15));
    },
    journal: (n, l) => `${l}·${n.name}的孩子生病花钱医治。`
  },
  {
    condition: (n) => n.family?.children && n.family.children.length > 0,
    text: (n, l, ctx) => `${n.name}在${l}的孩子天资聪颖，读书过目不忘，${n.name}决定请一位好先生来教孩子读书。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(50, 200);
      n.reputation = (n.reputation || 0) + randInt(3, 10);
    },
    journal: (n, l) => `${l}·${n.name}为孩子请先生。`
  },
];

// ===== 私生子/奸生子类剧情 =====
const illegitimateChildEvents = [
  // 条件：有私生子标记
  {
    condition: (n) => n.illegitimateChildren && n.illegitimateChildren.length > 0,
    text: (n, l, ctx) => `${n.name}在${l}偷偷去看望私生子，给孩子带了些银两和衣物，叮嘱孩子好好生活。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(20, 100);
    },
    journal: (n, l) => `${l}·${n.name}偷偷看望私生子。`
  },
  {
    condition: (n) => n.isIllegitimate === true,
    text: (n, l) => `${n.name}在${l}因为是私生子的身份被人嘲笑，${n.name}暗暗发誓一定要出人头地。`,
    effect: (n, l) => {
      n.willpower = (n.willpower || 0) + randInt(2, 8);
      n.reputation = (n.reputation || 0) - randInt(3, 10);
    },
    journal: (n, l) => `${l}·${n.name}因私生子身份被嘲笑。`
  },
  {
    condition: (n) => n.family?.spouse && n.age >= 25 && chance(10),
    text: (n, l) => `${n.name}在${l}发现妻子生的孩子长得不像自己，起了疑心，暗中调查后发现孩子竟是妻子与外人所生。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) - randInt(20, 50);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(10, 30));
      if (chance(30) && n.family) n.family.spouse = null;
    },
    journal: (n, l) => `${l}·${n.name}发现妻子所生为奸生子。`
  },
];

// ===== 宠物类剧情 =====
const petEvents = [
  // 条件：有宠物
  {
    condition: (n) => n.pets && n.pets.length > 0,
    text: (n, l, ctx) => {
      const pet = ctx?.pet || n.pets[0];
      return `${n.name}在${l}带着宠物${pet.name || pet.type}外出遛弯，宠物活泼可爱，引得路人纷纷驻足观看。`;
    },
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) + randInt(1, 5);
    },
    journal: (n, l, ctx) => `${l}·${n.name}带宠物${ctx?.pet?.name || ctx?.pet?.type || '外出'}遛弯。`
  },
  {
    condition: (n) => n.pets && n.pets.length > 0,
    text: (n, l, ctx) => `${n.name}在${l}的宠物生病了，${n.name}急忙去找兽医，花了不少钱才把宠物治好。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(20, 100);
      hpObj(n).current = Math.max(1, hpObj(n).current - randInt(5, 10));
    },
    journal: (n, l) => `${l}·${n.name}的宠物生病医治。`
  },
  {
    condition: (n) => n.pets && n.pets.length > 0,
    text: (n, l, ctx) => `${n.name}在${l}的宠物产下了幼崽，${n.name}高兴坏了，决定留一只自己养，其余的送给亲友。`,
    effect: (n, l) => {
      n.reputation = (n.reputation || 0) + randInt(3, 10);
      if (!n.pets) n.pets = [];
      n.pets.push({ type: '幼崽', name: '小' + (n.pets[0]?.name || '宝'), level: 1 });
    },
    journal: (n, l) => `${l}·${n.name}的宠物产崽。`
  },
  // 获得新宠物
  {
    condition: (n) => n.age >= 10 && (!n.pets || n.pets.length < 3),
    text: (n, l) => `${n.name}在${l}的山林中捡到一只受伤的小兽，${n.name}心善将其带回家医治，小兽伤好后便留了下来。`,
    effect: (n, l) => {
      if (!n.pets) n.pets = [];
      const petTypes = ['小狗', '小猫', '兔子', '松鼠', '小鸟', '灵狐', '灵鹤'];
      n.pets.push({ type: randChoice(petTypes), name: '小' + randChoice(['白', '黑', '花', '黄', '灰']), level: 1, loyalty: randInt(30, 80) });
      n.karma = (n.karma || 0) + 10;
    },
    journal: (n, l) => `${l}·${n.name}捡到一只小兽收养。`
  },
  {
    condition: (n) => n.age >= 16 && (n.silver || 0) > 100,
    text: (n, l) => `${n.name}在${l}的集市上看中了一只灵兽，虽然价格不菲，但${n.name}还是咬牙买了下来。`,
    effect: (n, l) => {
      n.silver = (n.silver || 0) - randInt(50, 300);
      if (!n.pets) n.pets = [];
      const petTypes = ['灵犬', '灵猫', '灵兔', '灵鹤', '灵狐', '灵鹰'];
      n.pets.push({ type: randChoice(petTypes), name: randChoice(['雪', '霜', '风', '云', '雷', '电']) + '儿', level: randInt(1, 5), loyalty: randInt(50, 90) });
    },
    journal: (n, l) => `${l}·${n.name}购买了一只灵兽。`
  },
];

// 汇总所有扩展剧情
const EXTENDED_EVENTS = {
  marriage: marriageEvents,
  oneNightStand: oneNightStandEvents,
  affair: affairEvents,
  vile: vileEvents,
  work: workEvents,
  child: childEvents,
  illegitimate: illegitimateChildEvents,
  pet: petEvents,
};

// 根据NPC情况获取可用的扩展剧情
function getAvailableExtendedEvents(npc) {
  const available = [];
  for (const category in EXTENDED_EVENTS) {
    for (const event of EXTENDED_EVENTS[category]) {
      if (!event.condition || event.condition(npc)) {
        available.push({ category, ...event });
      }
    }
  }
  return available;
}

// 触发随机扩展剧情
function triggerExtendedEvent(npc, location, ctx = {}) {
  // 0-3岁襁褓期：不触发婚配/偷情/拜师等成人扩展剧情（年龄与剧情须相符）
  if (npc.age <= 3) return null;
  const available = getAvailableExtendedEvents(npc);
  if (available.length === 0) return null;

  // 子嗣/私生子类剧情：无有效存活子嗣时跳过（剧情与记事须与实际相符）
  const validPool = available.filter(ev => {
    if (ev.category === 'child') {
      const kids = (npc.family?.children || []);
      return kids.some(cid => (ctx.npcs || []).some(n => n.id === cid && n.isAlive));
    }
    if (ev.category === 'illegitimate') {
      const kids = (npc.illegitimateChildren || []);
      return kids.some(cid => (ctx.npcs || []).some(n => n.id === cid && n.isAlive));
    }
    return true;
  });
  const event = validPool.length > 0 ? randChoice(validPool) : null;
  if (!event) return null;

  // 为需要target的剧情自动选择合适的对象
  const eventCtx = { ...ctx };
  if (event.needsTarget && ctx.npcs) {
    let candidates = [];
    if (event.category === 'marriage') {
      // 婚配：选择异性、未婚（无正室且无妾室）、成年 NPC（优先同地点，其次全区）
      const targetGender = npc.gender === '男' ? '女' : '男';
      const baseFilter = n =>
        n.id !== npc.id &&
        n.gender === targetGender &&
        n.age >= 16 &&
        !n.family?.spouse &&
        !hasConcubine(n) &&
        n.isAlive;
      candidates = ctx.npcs.filter(n => baseFilter(n) && n.location === npc.location);
      if (candidates.length === 0) candidates = ctx.npcs.filter(baseFilter);
      // 婚配必须找到对象才触发（否则"娶/嫁的对象没有"剧情混乱）
      if (candidates.length === 0) return null;
    } else if (event.category === 'affair' || event.category === 'one_night') {
      // 偷情/一夜情：选择异性、成年 NPC（优先同地点，其次全区）
      const targetGender = npc.gender === '男' ? '女' : '男';
      const baseFilter = n =>
        n.id !== npc.id &&
        n.gender === targetGender &&
        n.age >= 16 &&
        n.isAlive;
      candidates = ctx.npcs.filter(n => baseFilter(n) && n.location === npc.location);
      if (candidates.length === 0) candidates = ctx.npcs.filter(baseFilter);
    }
    if (candidates.length > 0) {
      eventCtx.target = randChoice(candidates);
    }
  } else if (event.category === 'child' && ctx.npcs) {
    const kids = (npc.family?.children || []).map(cid => ctx.npcs.find(n => n.id === cid)).filter(Boolean);
    if (kids.length > 0) eventCtx.child = randChoice(kids);
  } else if (event.category === 'illegitimate' && ctx.npcs) {
    const kids = (npc.illegitimateChildren || []).map(cid => ctx.npcs.find(n => n.id === cid)).filter(Boolean);
    if (kids.length > 0) eventCtx.child = randChoice(kids);
  }

  const text = genderize(typeof event.text === 'function' ? event.text(npc, location, eventCtx) : event.text, npc);
  const journalRaw = typeof event.journal === 'function' ? event.journal(npc, location, eventCtx) : event.journal;
  const journal = (eventCtx.gameDateText ? eventCtx.gameDateText + '·' : '') + journalRaw;

  if (event.effect) {
    event.effect(npc, location, eventCtx);
  }

  // 记录记事
  if (!npc.personalHistory) npc.personalHistory = [];
  npc.personalHistory.push(journal);
  // 如果有target，也记录到target的记事中
  if (eventCtx.target && eventCtx.target.personalHistory) {
    eventCtx.target.personalHistory.push(journal);
  }

  return {
    category: event.category,
    text,
    journal,
  };
}

module.exports = {
  EXTENDED_EVENTS,
  getAvailableExtendedEvents,
  triggerExtendedEvent,
};
