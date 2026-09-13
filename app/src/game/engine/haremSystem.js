// 后宅系统 - 位分体系、欢好、求娶、纳妾、惩罚

const { randInt, chance, randChoice, genderize } = require('./utils');
const { calcPregnancyChance } = require('./family');

// 后宅位分体系（男性主控的妻妾位分）
const CONCUBINE_RANKS_MALE = [
  { rank: 1, name: '正妻', desc: '明媒正娶的正室，地位最高', limit: 1 },
  { rank: 2, name: '平妻', desc: '与正妻地位相当的平妻', limit: 2 },
  { rank: 3, name: '贵妾', desc: '地位较高的妾室', limit: 4 },
  { rank: 4, name: '良妾', desc: '普通妾室', limit: 8 },
  { rank: 5, name: '侍妾', desc: '地位较低的妾室', limit: 16 },
  { rank: 6, name: '通房', desc: '最低等的妾室', limit: 99 },
];

// 后宅位分体系（女性主控的夫侍位分）
const CONCUBINE_RANKS_FEMALE = [
  { rank: 1, name: '正夫', desc: '明媒正娶的正室，地位最高', limit: 1 },
  { rank: 2, name: '平夫', desc: '与正夫地位相当的平夫', limit: 2 },
  { rank: 3, name: '贵侍', desc: '地位较高的夫侍', limit: 4 },
  { rank: 4, name: '良侍', desc: '普通夫侍', limit: 8 },
  { rank: 5, name: '侍君', desc: '地位较低的夫侍', limit: 16 },
  { rank: 6, name: '入幕之宾', desc: '最低等的夫侍', limit: 99 },
];

// 获取位分列表
function getConcubineRanks(gender) {
  return gender === '女' ? CONCUBINE_RANKS_FEMALE : CONCUBINE_RANKS_MALE;
}

// 获取位分名称
function getRankName(gender, rank) {
  const ranks = getConcubineRanks(gender);
  const r = ranks.find(r => r.rank === rank);
  return r ? r.name : '未知';
}

// 妻妾对主控的称呼
const SPOUSE_ADDRESSES = {
  '正妻': ['郎君', '郎君', '郎君'],
  '平妻': ['郎君', '郎君'],
  '贵妾': ['郎君', '主子'],
  '良妾': ['郎君', '主子'],
  '侍妾': ['主子', '郎君'],
  '通房': ['主子', '郎君'],
  '正夫': ['郎君', '娘子', '郎君'],
  '平夫': ['郎君', '娘子'],
  '贵侍': ['郎君', '主子'],
  '良侍': ['郎君', '主子'],
  '侍君': ['主子', '郎君'],
  '入幕之宾': ['主子', '郎君'],
};

// 获取妻妾对主控的称呼
function getSpouseAddress(gender, rank) {
  const rankName = getRankName(gender, rank);
  const addresses = SPOUSE_ADDRESSES[rankName] || ['主子'];
  return randChoice(addresses);
}

// 欢好剧情中 NPC 对玩家的称呼：
// 配偶/妾室 → 玩家短名（需求：亲属类 NPC 称呼玩家为自己的名字）；非亲属 → 空（不加称呼）
function spouseGreet(player, npc) {
  const mf = (player && player.family) || {};
  const isFamily = mf.spouse === npc.id || (mf.wives || []).includes(npc.id);
  if (!isFamily) return '';
  const { shortName } = require('./threeActStory');
  return shortName(player.name) + '，';
}

// 欢好剧情库（根据好感、性格、年龄；每段按主控性别分男女双版：男版对象为女子，女版对象为男子）
const INTIMACY_EVENTS = [
  {
    minFavor: 80, personalities: ['热情', '开朗', '淫荡', '色情', '花痴', '色中饿鬼', '狐媚惑主', '人尽可夫', '欲壑难填'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}见你到来，眼中闪过一丝喜色，大步迎上前来，声音低沉带笑："${spouseGreet(player, npc)}你可算来了，我可想你想得紧。"说罢便将你揽入怀中，低头在你发间落下一吻。`
      : `${npc.name}见你到来，眼中闪过一丝喜色，主动迎上前来，柔声道："${spouseGreet(player, npc)}你可算来了，人家等你好久了。"说罢便依偎进你怀中，指尖轻轻绕着你的衣带。`,
    effects: { favor: 5, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 60, personalities: ['温柔', '体贴', '善良'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}耳根微红，声音放柔了几分："${spouseGreet(player, npc)}今夜……让我陪你多坐一会儿吧。"烛光下他眉眼温和，伸手替你拢了拢鬓边的发丝。`
      : `${npc.name}羞涩地低下头，轻声道："${spouseGreet(player, npc)}今晚...让妾身伺候你歇息吧。"你点头应允，她红着脸为你宽衣。`,
    effects: { favor: 8, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 40, personalities: ['普通', '冷静'],
    text: (player, npc) => player.gender === '女' ? `你与${npc.name}相对而坐，聊了一会儿家常。夜色渐深，你并未急着离开，${npc.name}看了你一眼，温声道："夜深了，不如歇下吧。"`
      : `你与${npc.name}相对而坐，聊了一会儿家常。夜色渐深，你提出留宿，${npc.name}犹豫了一下，最终还是点了点头。`,
    effects: { favor: 3, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 20, personalities: ['冷漠', '孤傲'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}淡淡地看了你一眼，道："${spouseGreet(player, npc)}若是只为此事而来，那便快些吧。"语气虽冷，却还是侧身给你让了座。`
      : `${npc.name}淡淡地看了你一眼，道："${spouseGreet(player, npc)}若是只为此事而来，那便快些吧。"虽言语冷淡，但并未拒绝。`,
    effects: { favor: 1, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 0, personalities: ['淫荡', '色情', '花痴', '色中饿鬼'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}见你到来，目光在你身上流连，拉着你的手揉捏自己的胸，嗓音低哑了几分："${spouseGreet(player, npc)}你可算来了，我等得心都急了。"说着边让你摸摸她的小穴，里面早已淫水泛滥，只待你的进入。`
      : `${npc.name}见你到来，立刻迎了上来，眼中满是渴望："哎呀，${spouseGreet(player, npc)}可想死奴家了，快些进来吧！"`,
    effects: { favor: 10, hp: -15, spirit: -20, possiblePregnancy: true },
  },
  {
    minFavor: 50, personalities: ['活泼', '俏皮'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}眨眨眼，笑着凑近你，低声说："今晚月色正好，陪我去檐下坐坐可好？"你点头应下，两人并肩坐到天明，他时不时偏过头来看你。`
      : `${npc.name}眨眨眼，俏皮地凑到你耳边小声说："今晚月色正好，陪人家赏月可好？"你笑着应下，两人在檐下依偎到天明。`,
    effects: { favor: 6, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 60, personalities: ['书卷气', '清雅'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}放下手中的书卷，浅笑道："知音难觅，今夜愿与你同饮一盏清茶。"烛影摇曳，他说话时目光温和，不知不觉便已夜深。`
      : `${npc.name}放下手中的书卷，浅笑道："知音难觅，今夜愿与君同饮一盏清茶。"烛影摇曳，两人对坐谈心，不知不觉便已夜深。`,
    effects: { favor: 7, hp: -8, spirit: -12, possiblePregnancy: true },
  },
  {
    minFavor: 30, personalities: ['稳重', '成熟'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}握住你的手，低声道："既已认定是你，日后定不负你。"灯下相视，满室温柔。`
      : `${npc.name}轻轻握住你的手，低声道："既已认定是你，余生便都是你。"灯下相视，满室温柔。`,
    effects: { favor: 5, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 70, personalities: ['忠贞', '深情'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}将你轻轻揽入怀中，声音低沉而认真："此生此世，唯愿护你周全。"窗外细雨绵绵，屋内却暖意融融。`
      : `${npc.name}将你拥入怀中，声音有些发颤："此生此世，唯愿与你白首不离。"窗外细雨绵绵，屋内却暖意融融。`,
    effects: { favor: 9, hp: -10, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 40, personalities: ['武痴', '豪爽'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}朗声一笑："不打不相识，你我既已交心，当浮一大白！"把酒言欢间，他看向你的目光渐渐柔和，直至天明。`
      : `${npc.name}哈哈一笑："不打不相识，你我既已交心，何不共饮三杯？"把酒言欢间，两人越坐越近，直至天明。`,
    effects: { favor: 4, hp: -12, spirit: -15, possiblePregnancy: true },
  },
  {
    minFavor: 20, personalities: ['傲娇', '别扭'],
    text: (player, npc) => player.gender === '女' ? `${npc.name}别过脸去，耳朵却红透了："才...才不是特意等你！"你忍住笑意靠近，他嘴上说着不要，却也没有躲开你伸来的手。`
      : `${npc.name}别过脸去，耳朵却红透了："才...才不是特意等你！"你忍住笑意靠近，她嘴上说着不要，身体却诚实得很。`,
    effects: { favor: 5, hp: -10, spirit: -15, possiblePregnancy: true },
  },


];

// 与他人妻妾欢好的特殊剧情（背德感，含蓄表达；男女双版）
const INTIMACY_ADULTERY_EVENTS = [
  {
    text: (player, npc) => player.gender === '女' ? `夜深人静，你与${npc.name}在廊下不期而遇。他眼中闪过复杂的情绪，最终还是默默引你进了门。烛火摇曳间，两人心照不宣，仿佛这片刻的欢愉能抵过漫长岁月的遗憾。`
      : `夜深人静，你与${npc.name}在廊下不期而遇。她眼中闪过复杂的情绪，最终还是默默引你进了门。烛火摇曳间，两人心照不宣，仿佛这片刻的欢愉能抵过漫长岁月的遗憾。`,
    effects: { favor: 8, hp: -12, spirit: -18, possiblePregnancy: true, sin: 8 },
  },
  {
    text: (player, npc) => player.gender === '女' ? `${npc.name}低声叹息："我这辈子...大概就是这样了。"你心头一紧，忍不住上前握住了他的手。那一夜，你们仿佛忘记了各自的身份，只余两颗心的靠近。`
      : `${npc.name}低声叹息："我这辈子...大概就是这样了。"你心头一紧，忍不住上前握住了她的手。那一夜，你们仿佛忘记了各自的身份，只余两颗心的靠近。`,
    effects: { favor: 10, hp: -12, spirit: -18, possiblePregnancy: true, sin: 8 },
  },
  {
    text: (player, npc) => player.gender === '女' ? `你们借着"请教功法"的名义相约后山。四下无人时，${npc.name}轻声道："莫要负了我。"你们在月下相拥，既甜蜜又带着一丝背德的战栗。`
      : `你们借着"请教功法"的名义相约后山。四下无人时，${npc.name}轻声道："莫要负了我。"你们在月下相拥，既甜蜜又带着一丝背德的战栗。`,
    effects: { favor: 6, hp: -12, spirit: -18, possiblePregnancy: true, sin: 8 },
  },
  {
    text: (player, npc) => player.gender === '女' ? `${npc.name}递给你一只玉佩，耳语道："今夜子时，东院海棠树下。"明知不该，你还是赴了约。暗夜里交织的呼吸，成了你们共同的秘密。`
      : `${npc.name}递给你一只荷包，耳语道："今夜子时，东院海棠树下。"明知不该，你还是赴了约。暗夜里交织的呼吸，四溅的淫水，成了你们共同的秘密。`,
    effects: { favor: 7, hp: -12, spirit: -18, possiblePregnancy: true, sin: 8 },
  },
];

// 欢好被拒绝的剧情（男女双版，按主控性别）
const INTIMACY_REJECT_EVENTS = [
  {
    text: (player, npc) => `${npc.name}皱了皱眉，后退一步道："${spouseGreet(player, npc)}请自重，我不是随便的人。"`,
    favor: -10,
  },
  {
    text: (player, npc) => player.gender === '女' ? `${npc.name}冷笑道："就凭你也想让我动心？还是省省吧！"`
      : `${npc.name}冷笑道："就凭你也想碰我？也不撒泡尿照照自己！"`,
    favor: -20,
    harsh: true,
  },
  {
    text: (player, npc) => `${npc.name}面露难色："今日身体不适，改日再说吧。"`,
    favor: -5,
  },
  {
    text: (player, npc) => player.gender === '女' ? `${npc.name}转身就走，丢下一句："不知分寸！"`
      : `${npc.name}转身就走，丢下一句："无耻之徒！"`,
    favor: -15,
    harsh: true,
  },
];

// ===== 需求②③：欢好细节层次 + 性别区分 + 多调用姓名 =====

// 是否三代血亲（父母/子女/同胞）
function isBloodRel(player, npc) {
  const pf = player.family || {};
  const nf = npc.family || {};
  if (pf.father === npc.id || pf.mother === npc.id) return true;
  if ((pf.children || []).includes(npc.id)) return true;
  // 同胞：父亲相同且非本人
  if (nf.father && nf.father === pf.father && npc.id !== player.id) return true;
  return false;
}

// 欢好态度层次（抗拒/半推半就/迷迷瞪瞪/顺从/主动）——由好感与性格决定
function intimacyAttitude(player, npc, favor) {
  const personality = npc.personality || '';
  const lusty = ['淫荡', '色情', '花痴', '色中饿鬼', '狐媚惑主', '人尽可夫', '欲壑难填'].includes(personality);
  if (lusty) return 'eager';
  if (favor >= 80) return 'dreamy';
  if (favor >= 55) return 'willing';
  if (favor >= 25) return 'half';
  return 'reserved';
}

const ATTITUDE_INTROS = {
  eager: (player) => player.gender === '女'
    ? '灯下对视，{them}眼中春意流转，不等你开口便主动倾身靠近，呼吸拂过你的耳畔。'
    : '灯下对视，{them}眼中春意流转，不等你开口便主动倾身过来，气息微乱。',
  dreamy: (player) => player.gender === '女'
    ? '{them}被你哄得有些迷糊，眼神迷迷瞪瞪的，身子软软靠了过来，嘴里含混应着，脸颊微微泛红。'
    : '{them}被你哄得有些迷糊，眼神迷迷瞪瞪的，身子软软靠了过来，嘴里含混应着。',
  willing: (player) => player.gender === '女'
    ? '{them}低低应了一声，虽有些羞赧，却并未推拒，反而向你这边靠了靠。'
    : '{them}低低应了一声，虽有些羞赧，却并未推拒，任你轻轻牵起手。',
  half: (player) => player.gender === '女'
    ? '{them}羞红了脸，嘴上说着"不成不成"，手上却没挣开，半推半就之间，终究依了你。'
    : '{them}羞红了脸，嘴上说着"不成不成"，手上却没挣开，半推半就之间，终究依了你。',
  reserved: (player) => player.gender === '女'
    ? '{them}有些局促，垂着眼，好半晌才微微点了点头，声音轻得像蚊子哼。'
    : '{them}有些局促，咬着唇，好半晌才微微点了点头，声音轻得像蚊子哼。',
};

// 性别化动作细节（男/女不同描写）
function genderAction(npc) {
  if (npc.gender === '女') {
    return randChoice([
      '她垂下眼帘，耳根泛起薄红，指尖轻轻攥紧了衣角。',
      '她呼吸微促，发丝有些乱了，颊边浮起一层红晕。',
      '她睫毛轻颤，不敢抬眼，声音又低又软。',
    ]);
  }
  return randChoice([
    '他喉结微动，别开目光，呼吸却沉了几分。',
    '他耳根发红，嗓音低哑了几分，指尖微微收紧。',
    '他眉心微松，气息不稳，一时竟说不出完整的话。',
  ]);
}

// 亲属专属欢好剧情（含蓄 + 禁忌感，保持成人剧情含蓄风格；男女双版）
const INTIMACY_FAMILY_EVENTS = [
  {
    text: (player, npc) => player.gender === '女' ? `你们隔着一步之遥，{them}垂着眼，声音带着几分复杂的颤意："这本不该……"话未说完，已被你轻轻握住手。这一夜，你们谁都没有再提身份，只有烛火摇摇曳曳。`
      : `你们隔着一步之遥，{them}垂着眼，声音带着几分复杂的颤意："这本不该……"话未说完，已被你轻轻握住手。这一夜，你们谁都没有再提身份，只有烛火摇摇曳曳。`,
  },
  {
    text: (player, npc) => player.gender === '女' ? `{them}避开你的目光，胸口起伏不定，低声道："若是被人知晓……"你抬手掩住{them}未尽的话。四目相对间，一切都乱了分寸，却又无可挽回。`
      : `{them}避开你的目光，胸口起伏不定，低声道："若是被人知晓……"你抬手掩住{them}未尽的话。四目相对间，一切都乱了分寸，却又无可挽回。`,
  },
  {
    text: (player, npc) => player.gender === '女' ? `月光漏进窗来，{them}整个人僵在原地，脸颊烧得厉害，却始终没有挣开你的手。良久，{them}轻叹一声，缓缓闭上了眼。`
      : `月光漏进窗来，{them}整个人僵在原地，脸颊烧得厉害，却始终没有挣开你的手。良久，{them}轻叹一声，缓缓闭上了眼。`,
  },
];

// 构建增强后的欢好核心文本：态度引导 + 主体事件 + 性别细节，全程调用姓名
function buildIntimacyCore(player, npc, baseText) {
  const favor = npc.favorWithPlayer || 0;
  const att = intimacyAttitude(player, npc, favor);
  let intro = ATTITUDE_INTROS[att](player).replace(/\{them\}/g, npc.name);
  let body = typeof baseText === 'function' ? baseText(player, npc) : baseText;
  // 把"她/他/她 他"等指代替换为姓名（多调用私会方的姓名）
  body = body.replace(/她\/他/g, npc.name).replace(/她\s?\/?\s?他/g, npc.name).replace(/她/g, npc.name).replace(/他/g, npc.name);
  // 若主体文本仍无性别动作细节，追加一句
  if (!/她|他/.test(body)) {
    body = body + genderAction(npc);
  }
  return `${intro}\n${body}`;
}

// 触发欢好
function triggerIntimacy(player, npc) {
  // 未成年不能欢好
  if (npc.age < 16 || player.age < 16) {
    return { success: false, error: '未成年不可欢好' };
  }

  // 已是妻妾的不会拒绝
  const isSpouse = player.family?.spouse === npc.id ||
    (player.family?.wives || []).includes(npc.id) ||
    npc.family?.spouse === player.id;

  const favor = npc.favorWithPlayer || 0;
  const personality = npc.personality || '普通';

  // 计算同意概率
  let acceptChance = 0;
  if (isSpouse) {
    acceptChance = 100; // 妻妾不会拒绝
  } else {
    // 高好感时几乎不会拒绝
    if (favor >= 90) {
      acceptChance = 99;
    } else if (favor >= 80) {
      acceptChance = 95;
    } else if (favor >= 60) {
      acceptChance = 85;
    } else {
      acceptChance = Math.max(5, Math.min(80, favor * 0.5 + 20));
    }
    // 性格影响（只在小幅范围内浮动，避免高好感仍被大幅拒绝）
    if (['淫荡', '色情', '花痴', '色中饿鬼', '狐媚惑主', '人尽可夫', '欲壑难填'].includes(personality)) {
      acceptChance = Math.min(100, acceptChance + 5);
    } else if (['冰清玉洁', '性冷淡', '冷漠', '孤傲'].includes(personality)) {
      acceptChance = Math.max(acceptChance - 10, favor >= 80 ? 85 : 5);
    }
  }

  if (!chance(acceptChance)) {
    // 高好感时使用温和的拒绝文案，不出现羞辱性言语
    const pool = favor >= 60 ? INTIMACY_REJECT_EVENTS.filter(e => !e.harsh) : INTIMACY_REJECT_EVENTS;
    const reject = randChoice(pool.length > 0 ? pool : INTIMACY_REJECT_EVENTS);
    npc.favorWithPlayer = Math.max(-100, (npc.favorWithPlayer || 0) + reject.favor);
    return {
      success: false,
      text: reject.text(player, npc),
      favorChange: reject.favor,
    };
  }

  // 与他人妻妾欢好 → 触发背德特殊剧情
  const isOthersSpouse = (npc.family?.spouse && npc.family.spouse !== player.id) || npc.isConsort;
  let event = null;
  if (isOthersSpouse) {
    event = {
      text: () => randChoice(INTIMACY_ADULTERY_EVENTS).text(player, npc),
      effects: randChoice(INTIMACY_ADULTERY_EVENTS).effects,
    };
    event.adultery = true;
  } else if (isBloodRel(player, npc)) {
    // 需求②：亲属欢好 → 专属剧情（禁忌感，含蓄），并叠加态度细节
    event = {
      text: () => randChoice(INTIMACY_FAMILY_EVENTS).text(player, npc),
      effects: { favor: 5, hp: -10, spirit: -15, possiblePregnancy: true },
    };
  } else {
    // 选择合适的剧情
    const validEvents = INTIMACY_EVENTS.filter(e => favor >= e.minFavor &&
      (!e.personalities || e.personalities.length === 0 || e.personalities.includes(personality)));
    event = validEvents.length > 0 ? randChoice(validEvents) : INTIMACY_EVENTS[2];
  }

  // 应用效果
  const e = event.effects;
  if (e.favor) npc.favorWithPlayer = Math.min(1000, (npc.favorWithPlayer || 0) + e.favor);
  if (e.hp) player.hp.current = Math.max(1, player.hp.current - e.hp);
  if (e.spirit) player.mp.current = Math.max(0, player.mp.current - e.spirit);

  // 怀孕判定（仅女性）
  let pregnancy = false;
  if (e.possiblePregnancy) {
    const female = player.gender === '女' ? player : npc;
    const male = player.gender === '男' ? player : npc;
    // 仅异性间欢好才触发怀孕判定（孕率统一公式，需求13）
    if (female.gender === '女' && male.gender === '男' && female.age >= 16 && !female.isPregnant) {
      const pregChance = calcPregnancyChance(male, female, { relationship: (npc.favorWithPlayer || 0) >= 60 });
      if (chance(pregChance)) {
        female.isPregnant = true;
        female.pregnancyMonths = 0;
        female.pregnancyFather = male.id;
        pregnancy = true;
      }
    }
  }

  // 人物标签实时变化：欢好过不再保持处子之身
  for (const who of [player, npc]) {
    if (!Array.isArray(who.tags)) who.tags = [];
    who.tags = who.tags.filter(t => t !== 'virgin');
    if (!who.tags.includes('experienced')) who.tags.push('experienced');
  }
  if (event.adultery && npc.karma) {
    npc.karma.sin = (npc.karma.sin || 0) + (event.effects.sin || 0);
  }

  return {
    success: true,
    text: buildIntimacyCore(player, npc, event.text),
    favorChange: e.favor || 0,
    pregnancy,
    adultery: !!event.adultery,
  };
}

// 求娶判定
function tryMarry(player, npc) {
  if (npc.age < 16 || player.age < 16) {
    return { success: false, error: '未成年不可求娶' };
  }
  // 已有正室不能求娶
  if (player.family?.spouse) {
    return { success: false, error: '已有正室，不可再求娶正妻' };
  }
  // 对方已有配偶（正室或妾室，含顶层 concubines）
  if (npc.family?.spouse || (npc.family?.concubines || []).length > 0 || (npc.concubines || []).length > 0) {
    return { success: false, error: '对方已有配偶' };
  }

  const favor = npc.favorWithPlayer || 0;
  const personality = npc.personality || '普通';

  let acceptChance = Math.max(10, Math.min(90, favor * 0.4 + 30));
  if (['势利', '贪财好色'].includes(personality)) {
    if (player.silver > 5000 || player.spiritStone > 500) acceptChance += 20;
  }
  if (['浪漫', '热情'].includes(personality)) acceptChance += 15;
  if (['冷漠', '孤傲'].includes(personality)) acceptChance -= 15;

  if (!chance(acceptChance)) {
    const rejects = [
      `${npc.name}摇了摇头："婚姻大事，岂能儿戏，我还需要再考虑考虑。"`,
      `${npc.name}面露难色："你我之间...似乎还不到那一步。"`,
      `${npc.name}轻叹一声："我心中已有他人，恕难从命。"`,
      `${npc.name}冷笑道："就凭你也想娶我？做梦！"`,
    ];
    npc.favorWithPlayer = Math.max(-100, favor - 5);
    return { success: false, text: randChoice(rejects), favorChange: -5 };
  }

  // 求娶成功
  if (!player.family) player.family = { children: [], spouse: null, wives: [] };
  if (!player.family.wives) player.family.wives = [];
  player.family.spouse = npc.id;

  if (!npc.family) npc.family = { children: [], spouse: null };
  npc.family.spouse = player.id;
  npc.concubineRank = 1; // 正妻/正夫
  npc.location = player.location; // 嫁过来后住在一起

  // 关系网链接：双方互为配偶
  if (!npc.relations) npc.relations = {};
  npc.relations[player.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: player.name };
  if (!player.relations) player.relations = {};
  player.relations[npc.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: npc.name };

  const rankName = getRankName(player.gender, 1);
  return {
    success: true,
    text: `${npc.name}红着脸点了点头："我...我愿意。"你大喜过望，当即定下婚期。不久后，你将${npc.name}明媒正娶，纳为${rankName}。`,
    favorChange: 50,
  };
}

// 纳妾判定
function tryTakeConcubine(player, npc, chosenRank = null) {
  if (npc.age < 16 || player.age < 16) {
    return { success: false, error: '未成年不可纳妾' };
  }
  // 对方已有配偶（正室或妾室，含顶层 concubines）——优先判定
  if ((npc.family?.spouse && npc.family.spouse !== player.id) ||
    (npc.family?.concubines || []).length > 0 ||
    (npc.concubines || []).length > 0) {
    return { success: false, error: '对方已有配偶' };
  }
  // 宅等级联动：最低级宅院没有妾室居所，不可纳妾
  const mansionLevel = player.mansion?.level || 1;
  if (mansionLevel < 2) {
    return { success: false, error: '你的宅院过于简陋（仅能容正房），尚无妾室居所，请先修缮宅院' };
  }
  // 对方已是正室
  if (player.family?.spouse === npc.id) {
    return { success: false, error: '对方已是正室' };
  }
  // 对方已是妾室
  if ((player.family?.wives || []).includes(npc.id)) {
    return { success: false, error: '对方已是你的妾室' };
  }

  const favor = npc.favorWithPlayer || 0;
  const personality = npc.personality || '普通';

  let acceptChance = Math.max(15, Math.min(85, favor * 0.45 + 25));
  if (['淫荡', '色情', '花痴', '势利'].includes(personality)) acceptChance += 20;
  if (['冰清玉洁', '孤傲', '冷漠'].includes(personality)) acceptChance -= 20;

  if (!chance(acceptChance)) {
    const rejects = [
      `${npc.name}咬着唇道："我...我不想做妾，要做就做正室。"`,
      `${npc.name}摇摇头："妾身蒲柳之姿，不敢高攀。"`,
      `${npc.name}面露不屑："让我做妾？你也配！"`,
    ];
    npc.favorWithPlayer = Math.max(-100, favor - 3);
    return { success: false, text: randChoice(rejects), favorChange: -3 };
  }

  // 纳妾成功
  if (!player.family) player.family = { children: [], spouse: null, wives: [] };
  if (!player.family.wives) player.family.wives = [];
  player.family.wives.push(npc.id);

  if (!npc.family) npc.family = { children: [], spouse: null };
  npc.family.spouse = player.id;
  npc.concubineRank = chosenRank || 4; // 默认良妾/良侍
  npc.location = player.location;

  // 关系网链接：双方互为配偶
  if (!npc.relations) npc.relations = {};
  npc.relations[player.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: player.name };
  if (!player.relations) player.relations = {};
  player.relations[npc.id] = { type: '配偶', favor: npc.favorWithPlayer || 0, name: npc.name };

  const rankName = getRankName(player.gender, npc.concubineRank);
  return {
    success: true,
    text: `${npc.name}含羞带怯地应了下来。你择了个吉日，将${npc.name}纳入后宅，封为${rankName}。`,
    favorChange: 30,
    rank: npc.concubineRank,
  };
}

// 惩罚剧情库
const PUNISH_EVENTS = {
  demote: [
    { text: (npc, newRank) => `你将${npc.name}叫到面前，冷冷道："你近来行事不端，罚你降为${getRankName('男', newRank)}，以观后效。"${npc.name}脸色惨白，跪地求饶。`, favor: -15 },
    { text: (npc, newRank) => `你以${npc.name}善妒为由，将其降为${getRankName('男', newRank)}。${npc.name}虽心有不甘，但也不敢多言。`, favor: -20 },
  ],
  kneel: [
    { text: (npc) => `你罚${npc.name}在祠堂跪三个时辰。${npc.name}不敢违抗，只得乖乖跪下。`, favor: -10 },
    { text: (npc) => `你怒斥${npc.name}的过错，罚其在院中罚跪一夜。`, favor: -12 },
  ],
  scold: [
    { text: (npc) => `你将${npc.name}训斥了一顿，言辞严厉，${npc.name}吓得瑟瑟发抖。`, favor: -8 },
    { text: (npc) => `你当着众人的面斥责${npc.name}，让其颜面尽失。`, favor: -15 },
  ],
  forbid: [
    { text: (npc) => `你罚${npc.name}禁足一月，不得出房门一步。`, favor: -10 },
    { text: (npc) => `你下令${npc.name}抄写家规百遍，以儆效尤。`, favor: -8 },
  ],
};

// 惩罚妻妾
function punishConcubine(player, npc, punishType, newRank = null) {
  if (!player.family?.wives?.includes(npc.id) && player.family?.spouse !== npc.id) {
    return { error: '对方不是你的妻妾' };
  }

  const events = PUNISH_EVENTS[punishType] || PUNISH_EVENTS.scold;
  const event = randChoice(events);

  if (punishType === 'demote' && newRank) {
    npc.concubineRank = newRank;
  }

  npc.favorWithPlayer = Math.max(-100, (npc.favorWithPlayer || 0) + event.favor);

  return {
    success: true,
    text: event.text(npc, newRank),
    favorChange: event.favor,
    newRank: punishType === 'demote' ? newRank : null,
  };
}

// 检查是否是主控的妻妾
function isPlayerSpouse(player, npcId) {
  return player.family?.spouse === npcId ||
    (player.family?.wives || []).includes(npcId);
}

// ===== 需求：偷情剧情系统（对已有配偶的NPC）=====
// 按好感与双方修为分流：同意/半推半就/被强迫/被迷晕/被拒，强调氛围、玩法、快感、心理
// 每段按主控性别分男女双版：男版对象为已婚女子（用"她"），女版对象为已婚男子（用"他"）
const STEAL_LOVE_EVENTS = {
  // 情投意合（高好感，双方你情我愿）
  agree: [
    (player, n, h) => player.gender === '女'
      ? `${n.name}与你对视一眼，眼中藏着笑意，低声道："我那${h}今夜不在……"你心领神会，跟着他闪入偏院。屋里只点了一盏灯，两人摸索着互相舔着，淫叫连连。这一夜，他格外放得开，主动得近乎放肆，事后靠在你肩头，轻声说"别让她知道"。`
      : `${n.name}与你对视一眼，眼中藏着笑意，低声道："我那${h}今夜不在……"你心领神会，跟着她闪入偏院。屋里只点了一盏灯，两人都屏着呼吸，指尖相触时都颤了一下。这一夜，她格外放得开，主动得近乎放肆，事后靠在你肩头，轻声说"别让他知道"。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}借着去庙里上香的由头约你见面。香火缭绕中，他趁人不备塞给你一张字条，上面只写着"老地方"。你赴约时，他已等在房中，衣裳半解，眼里带着几分孤注一掷的热切："日子太闷了，我只想……放肆一回。"`
      : `${n.name}借着去庙里上香的由头约你见面。香火缭绕中，她趁人不备塞给你一张字条，上面只写着"老地方"。你赴约时，她已等在房中，衣裳半解，眼里带着几分孤注一掷的热切："日子太闷了，我只想……放肆一回。"`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}与你在屏风后相见，两人相视一笑，默契地压低了声音。情到浓时，他咬着你的耳垂，气息滚烫："别出声……别让人知道。"背德的紧张让一切都格外刺激，结束时他还在你怀里，久久不愿起来。`
      : `${n.name}与你在屏风后相见，两人相视一笑，默契地压低了声音。情到浓时，她咬着你的耳垂，气息滚烫："别出声……别让人知道。"背德的紧张让一切都格外刺激，结束时她还在你怀里，久久不愿起来。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}托人传话约你在花房相见。你到时，他正摆弄着一盆花，见你来便放下手中的花剪，上前握住你的手："那${h}去外地跑商了，要三五日才回。"这几日，你们夜夜幽会，他仿佛要把压抑多年的情意都倾泻出来。`
      : `${n.name}托人传话约你在花房相见。你到时，她正摆弄着一盆花，见你来便放下手中的花剪，上前挽住你的手臂："那${h}去外地跑商了，要三五日才回。"这几日，你们夜夜幽会，她仿佛要把压抑多年的情意都倾泻出来。`,
  ],
  // 半推半就（好感尚可，或修为压制下的半顺从）
  half: [
    (player, n, h) => player.gender === '女'
      ? `${n.name}见是你，神色有些慌乱，压低声音道："你、你怎么来了……让${h}看见可怎么好。"话虽如此，他的脚步却未挪动半分。你走近一步，他后退一步，最终退到墙角，被你轻轻拢在身前。他挣了两下便软了身子，红着脸低声道："就、就这一回……"`
      : `${n.name}见是你，神色有些慌乱，压低声音道："你、你怎么来了……让${h}看见可怎么好。"话虽如此，她的脚步却未挪动半分。你走近一步，她后退一步，最终退到墙角，被你轻轻拢在怀里。她挣了两下便软了身子，红着脸低声道："就、就这一回……"`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}迟疑地看了看门外，又看了看你，咬着唇道："我不该……"你握住他的手，他挣了一下没挣开，便也由着你了。灯花爆了一下，两人都吓了一跳，随即又忍不住低声笑起来，气氛反而松了下来。`
      : `${n.name}迟疑地看了看门外，又看了看你，咬着唇道："我不该……"你握住她的手，她挣了一下没挣开，便也由着你了。灯花爆了一下，两人都吓了一跳，随即又忍不住低声笑起来，气氛反而松了下来。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}嘴上说着"使不得使不得"，身子却微微向你倾了过来。你顺势拉住他的手，他浑身一僵，随即缓缓放松，把脸埋进你肩头，闷声道："你这冤家……"`
      : `${n.name}嘴上说着"使不得使不得"，身子却微微向你倾了过来。你顺势揽住她的腰，她浑身一僵，随即缓缓放松，把脸埋进你怀里，闷声道："你这冤家……"`,
  ],
  // 被强迫（玩家修为明显占优，强行欢好）
  forced: [
    (player, n, h) => player.gender === '女'
      ? `${n.name}惊怒交加，压着声音喝道："你放肆！我是${h}的人！"你却不给他挣脱的机会，将他抵在墙上。他奋力挣扎，却敌不过你修为压制的力道，渐渐力竭，只能咬着牙承受，眼角沁出泪来，喉间溢出破碎的呜咽。事毕，他背过身去，声音沙哑："你……你会遭报应的。"`
      : `${n.name}惊怒交加，压着声音喝道："你放肆！我是${h}的人！"你却不给她挣脱的机会，一把将她按在墙上。她奋力挣扎，却敌不过你修为压制的力道，渐渐力竭，只能咬着牙承受，眼角沁出泪来，喉间溢出破碎的呜咽。事毕，她背过身去，声音沙哑："你……你会遭报应的。"`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}见你逼近，脸色煞白，后退着撞在桌沿："别过来……我喊人了！"你抬手布下一道隔音结界，他的呼喊被闷在喉咙里。你缓缓上前，他浑身发抖，眼眶通红，却终究挣脱不得。这一夜过去，他看你的眼神里满是恨意与畏惧。`
      : `${n.name}见你逼近，脸色煞白，后退着撞在桌沿："别过来……我喊人了！"你抬手布下一道隔音结界，她的呼喊被闷在喉咙里。你缓缓上前，她浑身发抖，眼眶通红，却终究挣脱不得。这一夜过去，她看你的眼神里满是恨意与畏惧。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}被你堵在巷子里，声音发颤："我娘子若知道了，定不会放过你。"你轻笑一声，将他抵在墙边。他挣扎不过，渐渐放弃抵抗，身子软了下去，只有眼泪无声地滑落。你离去时，他还蜷在墙角，衣衫凌乱，久久没有动弹。`
      : `${n.name}被你堵在巷子里，声音发颤："我夫君若知道了，定不会放过你。"你轻笑一声，将她抵在墙边。她挣扎不过，渐渐放弃抵抗，身子软了下去，只有眼泪无声地滑落。你离去时，她还蜷在墙角，衣衫凌乱，久久没有动弹。`,
  ],
  // 被迷晕（玩家修为占优，用手段迷晕后欢好）
  drugged: [
    (player, n, h) => player.gender === '女'
      ? `${n.name}接过你递来的那杯酒，喝了几口便觉得头晕目眩，扶着额道："我怎么……有些困……"话未说完，他便软软倒在你怀里。你将他扶到榻上脱去他的衣物，握着他的鸡巴肆意玩弄，看着他憋得通红后终于将鸡巴塞进穴里让他射了出来。这一夜，他浑然不知发生了什么，次日醒来只觉得浑身酸软，却想不起缘由。`
      : `${n.name}接过你递来的那杯酒，喝了几口便觉得头晕目眩，扶着额道："我怎么……有些困……"话未说完，她便软软倒在你怀里。你将她抱到榻上脱去她的衣物，将她的胸含进嘴中啃咬，摸着她的小穴水津津的，舔完胸又移到小穴细舔起来，听着她的呻吟你更加兴奋，开始肆无忌惮的抽插玩弄。次日感觉着小穴的异样羞红了脸，却又忍不住偷偷扣挖。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}闻到房中异样的香气，只觉得眼皮越来越沉，勉强看了你一眼，便昏睡过去。你将他安置在榻上，将穴口对着他的嘴揉弄，淫水流出也被他喝进去，你爽的高潮了一次后才将穴口又对准了鸡巴重重坐下，数次抽插后终于再次高潮。次日他醒来看着床上的痕迹和鸡巴上的残留已然想到了什么却未声张。`
      : `${n.name}闻到房中异样的香气，只觉得眼皮越来越沉，勉强看了你一眼，便昏睡过去。你将她双腿分开捆绑在椅子上，胸部直挺挺地对着你，你一边插着她的小穴一边狠狠吸着她的胸，她呻吟着喷出水，直到你爽够了才离开。次日她醒来仍保持着被捆绑的状态，地上留着一滩淫水，穴里一直被塞着玉柄，挣开捆绑跪在地上却让玉柄更加深入，竟然偷偷开始自慰，嘴中叫着你的名字。。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}警惕地不肯喝你递来的茶，你便趁他转身时在香炉里添了一味安神香。不多时，他困意上涌，倚着柱子滑坐下去。你就地脱掉你们的衣物，将他的鸡巴含进嘴里直到立起，你掰开穴口直接坐了下去，揉着自己的胸淫叫，他被你刺激地直接射了进去，你仍未放过他，直到数次射入体力耗尽后才放过他。翌日他醒来看着床上的痕迹和鸡巴上的残留已然想到了什么却未声张。`
      : `${n.name}警惕地不肯喝你递来的茶，你便趁她转身时在香炉里添了一味安神香。不多时，她困意上涌，倚着柱子滑坐下去。你接住她，抱入内室，想到前几日听到的趣事将准备好的草莓塞进她的小穴，直到塞满，红色的汁液和淫水混合着流出，透着诱人的气味，你低头用舌头在里面搅动，软烂的草莓被你吞下去，玩够了后才插入她的小穴，她迷糊着回应着你，抱着你一同抵达。第二日她醒来后意犹未尽的继续扣挖着。`,
  ],
  // 被拒（玩家修为不占优且好感不足，偷情失败）
  rejected: [
    (player, n, h) => `${n.name}冷冷地看着你，后退两步，声音不大却满是寒意："我与${h}夫妻多年，你莫要痴心妄想。今日之事我便当没发生过，若再有下次，休怪我翻脸。"你碰了一鼻子灰，只得悻悻而退。`,
    (player, n, h) => player.gender === '女'
      ? `${n.name}厉声喝道："放肆！我乃${h}的夫郎，岂容你轻薄！"说着便要喊人。你连忙退开，他犹自气得浑身发抖，指着门外道："滚！"`
      : `${n.name}厉声喝道："放肆！我乃${h}的妻室，岂容你轻薄！"说着便要喊人。你连忙退开，她犹自气得浑身发抖，指着门外道："滚！"`,
    (player, n, h) => `${n.name}面沉如水，语气冰冷："你若有半点礼义廉耻，就不该动这般心思。我念你年幼无知，不与你计较，从今往后，莫要再出现在我面前。"`,
  ],
};

// 偷情剧情触发（对已有配偶的NPC；修为高于对方→强行类，低于→按好感判定是否同意）
function triggerStealLove(player, npc, husband) {
  if (npc.age < 16 || player.age < 16) {
    return { success: false, error: '未成年不可偷情' };
  }
  // 非主控妻妾
  if (player.family?.spouse === npc.id || (player.family?.wives || []).includes(npc.id)) {
    return { success: false, error: '这是你的妻妾，何须偷情' };
  }
  // 对方必须有配偶（正室或妾室）
  const nf = npc.family || {};
  const hasSpouse = (nf.spouse && nf.spouse !== player.id) || (nf.wives || []).length > 0 ||
    (nf.concubines || []).length > 0 || npc.isConsort;
  if (!hasSpouse) {
    return { success: false, error: '对方并无配偶，谈不上偷情' };
  }
  const husbandName = husband && husband.name ? husband.name : (nf.spouseName || (npc.gender === '女' ? '其夫' : '其妻'));
  const favor = npc.favorWithPlayer || 0;
  const myRealm = player.realmLevel || 0;
  const npcRealm = npc.realmLevel || 0;
  const stronger = myRealm >= npcRealm + 1; // 修为明显占优

  let kind = 'agree';
  if (stronger) {
    // 修为占优 → 强行类（好感高则半推半就，好感低则被强迫/被迷晕）
    if (favor >= 55) kind = 'half';
    else kind = chance(50) ? 'forced' : 'drugged';
  } else {
    // 修为不占优 → 按好感判定
    if (favor >= 65) kind = 'agree';
    else if (favor >= 30) kind = 'half';
    else {
      // 被拒
      const txt = genderize(randChoice(STEAL_LOVE_EVENTS.rejected)(player, npc, husbandName), npc);
      npc.favorWithPlayer = Math.max(-100, (npc.favorWithPlayer || 0) - randInt(8, 15));
      return { success: false, text: txt, favorChange: -randInt(8, 15), kind: 'rejected' };
    }
  }

  const textFn = randChoice(STEAL_LOVE_EVENTS[kind]);
  const text = genderize(textFn(player, npc, husbandName), npc);
  const favorDelta = kind === 'agree' ? randInt(5, 9) : kind === 'half' ? randInt(2, 5) : randInt(-2, 2);
  npc.favorWithPlayer = Math.min(1000, (npc.favorWithPlayer || 0) + favorDelta);
  if (player.hp && player.hp.current) player.hp.current = Math.max(1, player.hp.current - randInt(8, 15));
  if (player.mp && player.mp.current) player.mp.current = Math.max(0, player.mp.current - randInt(12, 20));

  // 怀孕判定（仅异性偷情才判定：需双方性别不同，女性NPC且主控为男性→对方怀孕；主控为女性→主控怀孕）
  let pregnancy = false;
  if (player.gender === '男' && npc.gender === '女' && npc.age >= 16 && npc.age <= 45 && !npc.isPregnant) {
    const { calcPregnancyChance } = require('./family');
    const pregChance = calcPregnancyChance(player, npc, { relationship: favor >= 60 });
    if (chance(pregChance)) {
      npc.isPregnant = true;
      npc.pregnancyMonths = 0;
      npc.pregnancyFather = player.id;
      npc.pregnancyIsAffair = true;
      pregnancy = true;
    }
  } else if (player.gender === '女' && npc.gender === '男' && player.age >= 16 && player.age <= 45 && !player.isPregnant) {
    const { calcPregnancyChance } = require('./family');
    const pregChance = calcPregnancyChance(npc, player, { relationship: favor >= 60 });
    if (chance(pregChance)) {
      player.isPregnant = true;
      player.pregnancyMonths = 0;
      player.pregnancyFather = npc.id;
      player.pregnancyIsAffair = true;
      pregnancy = true;
    }
  }

  // 被发现的概率（强行/迷晕类更易败露）
  const exposeChance = kind === 'agree' ? 8 : kind === 'half' ? 12 : 25;
  let exposed = false;
  if (chance(exposeChance)) {
    exposed = true;
    npc.reputation = (npc.reputation || 0) - randInt(15, 35);
    if (npc.karma) npc.karma.sin = (npc.karma.sin || 0) + randInt(5, 10);
  }

  // 标签变化
  for (const who of [player, npc]) {
    if (!Array.isArray(who.tags)) who.tags = [];
    who.tags = who.tags.filter(t => t !== 'virgin');
    if (!who.tags.includes('experienced')) who.tags.push('experienced');
  }

  return {
    success: true,
    text,
    favorChange: favorDelta,
    pregnancy,
    kind,
    exposed,
    husbandName,
  };
}

module.exports = {
  CONCUBINE_RANKS_MALE, CONCUBINE_RANKS_FEMALE,
  getConcubineRanks, getRankName, getSpouseAddress,
  triggerIntimacy, tryMarry, tryTakeConcubine,
  punishConcubine, isPlayerSpouse,
  triggerStealLove,
};
