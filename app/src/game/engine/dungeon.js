// 副本与秘境系统
const { randInt, chance, randChoice, clamp } = require('./utils');
const { generateNPC } = require('./npcGenerator');

// 副本列表
const DUNGEONS = [
  {
    id: 'qingfeng_cave', name: '清风洞', location: '清风镇', tier: 1,
    desc: '清风镇外的一处洞穴，据说有妖兽出没，洞中常年清风拂面，因而得名。',
    minRealm: 1, maxRealm: 3,
    enemies: [{ name: '野狼', count: [2, 4] }, { name: '毒蛇', count: [1, 3] }],
    rewards: { exp: [100, 300], spiritStone: [50, 200], items: ['聚灵草', '灵草', '妖丹'] },
    boss: { name: '狼王', realmLevel: 2 },
    // 独特事件
    events: [
      { type: 'treasure', name: '野狼巢穴', desc: '你发现了野狼的巢穴，里面有一些猎物残骸和散落的物品。', rewards: ['妖丹', '兽皮', '野狼牙'] },
      { type: 'heal', name: '清泉水潭', desc: '洞中有一处清澈的水潭，泉水蕴含灵气，饮用后精神大振。', effects: { hp: 50, mp: 30 } },
      { type: 'danger', name: '毒蛇窝', desc: '你不慎踏入了毒蛇窝，群蛇围攻！', combat: true },
      { type: 'mystery', name: '石壁刻文', desc: '洞壁上刻着一些粗浅的修炼心得，研读后有所领悟。', effects: { cultivationExp: 100 } },
      { type: 'pet', name: '幼狼', desc: '你发现了一只失去母亲的幼狼，看起来可以驯服。', pet: { name: '苍狼', quality: '普通' } },
    ],
    uniqueItems: ['野狼牙', '清风草', '蛇胆'],
  },
  {
    id: 'heifeng_zhai_1', name: '黑风寨·一层（山门）', location: '黑风寨', tier: 1,
    desc: '黑风寨的山门，山贼喽啰把守森严，寨门前横着拒马与箭楼。',
    minRealm: 1, maxRealm: 3,
    enemies: [{ name: '山贼喽啰', count: [2, 4] }, { name: '山贼', count: [1, 3] }],
    rewards: { exp: [200, 500], silver: [200, 600], items: ['兽皮', '妖丹', '灵草'] },
    boss: { name: '寨门统领', realmLevel: 2 },
    events: [
      { type: 'treasure', name: '山贼粮仓', desc: '你摸进了山贼的粮仓，里面囤积着抢来的粮食和杂物。', rewards: ['兽皮', '灵草', '兽肉'] },
      { type: 'danger', name: '箭楼齐射', desc: '寨门箭楼上的山贼发现你，万箭齐发！', combat: true },
      { type: 'mystery', name: '悬赏告示', desc: '你看到寨门上贴着悬赏告示，原来官府悬赏捉拿这批山贼。', effects: { reputation: 10 } },
      { type: 'heal', name: '山涧清泉', desc: '寨外有一处山涧清泉，你洗了把脸，精神大振。', effects: { hp: 60, mp: 30 } },
      { type: 'pet', name: '小狼崽', desc: '你发现一只被山贼养着的小狼崽，眼中带着野性。', pet: { name: '苍狼', quality: '优秀' } },
    ],
    uniqueItems: ['兽皮', '妖丹', '山贼腰牌'],
  },
  {
    id: 'heifeng_zhai_2', name: '黑风寨·二层（聚义厅）', location: '黑风寨', tier: 2,
    desc: '黑风寨的聚义厅，山贼精兵来回巡逻，二当家在此坐镇。',
    minRealm: 2, maxRealm: 4,
    enemies: [{ name: '山贼', count: [2, 4] }, { name: '山贼精兵', count: [1, 3] }],
    rewards: { exp: [500, 1200], silver: [500, 1500], items: ['精铁', '妖丹', '聚灵草'] },
    boss: { name: '二当家·铁背熊', realmLevel: 3 },
    events: [
      { type: 'treasure', name: '聚义厅宝箱', desc: '聚义厅的角落里放着一口大箱子，里面是山贼抢来的财货。', rewards: ['精铁', '妖丹', '聚灵草'] },
      { type: 'danger', name: '埋伏突袭', desc: '山贼精兵从两侧杀出，将你围在聚义厅中！', combat: true },
      { type: 'mystery', name: '聚义厅壁画', desc: '聚义厅的墙壁上画着黑风寨的发家史，从中可以看出寨中的势力分布。', effects: { cultivationExp: 200, enlightenment: 15 } },
      { type: 'heal', name: '大碗烈酒', desc: '你抄起桌上一坛烈酒猛灌一口，浑身火热，伤势缓解。', effects: { hp: 100, mp: 50 } },
    ],
    uniqueItems: ['精铁', '山贼腰牌', '聚灵草'],
  },
  {
    id: 'heifeng_zhai_3', name: '黑风寨·三层（总坛）', location: '黑风寨', tier: 3,
    desc: '黑风寨的顶层总坛，大当家在此发号施令，守卫尽是山贼中的好手。',
    minRealm: 3, maxRealm: 5,
    enemies: [{ name: '山贼精兵', count: [3, 5] }, { name: '山贼头目', count: [1, 2] }],
    rewards: { exp: [1000, 2500], silver: [1000, 3000], items: ['精铁', '妖丹', '聚灵草'] },
    boss: { name: '大当家·黑风虎', realmLevel: 4 },
    events: [
      { type: 'treasure', name: '总坛宝库', desc: '你闯入了总坛深处的宝库，金银珠宝堆积如山！', rewards: ['腰牌', '精铁', '妖丹'] },
      { type: 'danger', name: '精锐尽出', desc: '大当家的精锐护卫尽数杀出，刀光剑影密如雨下！', combat: true },
      { type: 'mystery', name: '总坛账册', desc: '你翻看了总坛的账册，上面记着黑风寨与各方势力的暗中往来。', effects: { cultivationExp: 400, reputation: 15 } },
      { type: 'heal', name: '虎皮软榻', desc: '你在大当家的虎皮软榻上歇了片刻，气息平稳下来。', effects: { hp: 150, mp: 80 } },
      { type: 'pet', name: '幼虎', desc: '你发现一只被豢养的幼虎，眼中带着灵性。', pet: { name: '白虎', quality: '稀有' } },
    ],
    uniqueItems: ['腰牌', '精铁', '妖丹'],
  },
  {
    id: 'wan_du_swamp', name: '万毒沼泽深处', location: '万毒沼泽', tier: 3,
    desc: '沼泽深处毒物横行，危险重重，但也生长着许多珍稀的毒草灵药。',
    minRealm: 3, maxRealm: 5,
    enemies: [{ name: '毒蟾', count: [2, 4] }, { name: '毒蟒', count: [1, 3] }, { name: '毒雾妖', count: [1, 2] }],
    rewards: { exp: [500, 1500], spiritStone: [500, 1500], items: ['毒囊', '妖丹', '解毒丹'] },
    boss: { name: '万毒蟾蜍', realmLevel: 5 },
    events: [
      { type: 'treasure', name: '毒草园', desc: '你发现了一片天然的毒草园，各种珍稀毒草应有尽有。', rewards: ['断肠草', '蝎尾花', '毒蟾酥', '千年毒王花'] },
      { type: 'danger', name: '毒雾弥漫', desc: '沼泽中突然弥漫起剧毒雾气，你感到一阵眩晕！', effects: { hp: -100, mp: -50 }, status: '中毒' },
      { type: 'mystery', name: '毒圣遗骨', desc: '你发现了一位古代毒圣的遗骨，身旁有一本毒经。', rewards: ['毒经'], effects: { enlightenment: 20 } },
      { type: 'heal', name: '解毒泉', desc: '你发现了一处天然解毒泉，泉水可解百毒。', effects: { hp: 80, status: 'cleanse' } },
      { type: 'pet', name: '小毒蟾', desc: '你发现了一只可爱的小毒蟾，它似乎对你很亲近。', pet: { name: '毒蟾', quality: '优秀' } },
    ],
    uniqueItems: ['毒经', '万毒丹', '毒王花', '蟾蜍内丹'],
  },
  {
    id: 'shang_gu_ruins', name: '上古遗迹', location: '上古遗迹', tier: 4,
    desc: '上古修士遗留的遗迹，藏有重宝，但也有强大的守卫和致命的机关。',
    minRealm: 4, maxRealm: 7,
    enemies: [{ name: '石像守卫', count: [2, 4] }, { name: '怨灵', count: [2, 3] }, { name: '遗迹守护者', count: [1, 2] }],
    rewards: { exp: [1000, 3000], spiritStone: [1000, 5000], items: ['上古法宝', '灵石', '功法残卷'] },
    boss: { name: '遗迹之灵', realmLevel: 6 },
    events: [
      { type: 'treasure', name: '上古宝库', desc: '你找到了上古修士的宝库，里面法宝堆积如山！', rewards: ['上古法宝', '灵石', '功法残卷', '储物戒指'] },
      { type: 'danger', name: '上古杀阵', desc: '你触发了上古杀阵，万千剑气袭来！', combat: true, effects: { hp: -150 } },
      { type: 'mystery', name: '传承石碑', desc: '你发现了一块传承石碑，上面记载着上古功法的完整传承！', effects: { cultivationExp: 500, enlightenment: 30 }, rewards: ['上古功法'] },
      { type: 'heal', name: '灵脉泉眼', desc: '遗迹深处有一处灵脉泉眼，泉水蕴含浓郁灵气。', effects: { hp: 150, mp: 100, cultivationExp: 200 } },
      { type: 'pet', name: '器灵', desc: '你发现了一个初生的器灵，它愿意认你为主。', pet: { name: '器灵', quality: '稀有' } },
    ],
    uniqueItems: ['上古功法', '传承令', '遗迹钥匙', '太古符文'],
  },
  {
    id: 'mo_yu_abyss', name: '魔域深渊', location: '万妖山脉', tier: 5,
    desc: '魔域深处，魔气滔天，强者云集，是魔族的核心领地。',
    minRealm: 5, maxRealm: 8,
    enemies: [{ name: '魔兵', count: [3, 5] }, { name: '魔将', count: [1, 3] }, { name: '魔物', count: [2, 4] }],
    rewards: { exp: [2000, 5000], spiritStone: [2000, 8000], items: ['魔晶', '血煞丹', '魔功秘籍'] },
    boss: { name: '魔域领主', realmLevel: 8 },
    events: [
      { type: 'treasure', name: '魔晶矿脉', desc: '你发现了一条魔晶矿脉，里面蕴含大量魔晶！', rewards: ['魔晶', '血煞丹', '魔骨'] },
      { type: 'danger', name: '魔气侵蚀', desc: '浓郁的魔气侵蚀着你的心神，你感到一阵邪恶的念头涌出！', effects: { hp: -200, enlightenment: -10 }, status: '心魔' },
      { type: 'mystery', name: '魔神祭坛', desc: '你发现了一座古老的魔神祭坛，上面似乎可以献祭获得力量。', effects: { cultivationExp: 800, reputation: -20 }, rewards: ['魔神恩赐'] },
      { type: 'heal', name: '血池', desc: '你发现了一处血池，池中血水蕴含强大的生命力。', effects: { hp: 200, mp: 150 }, status: '嗜血' },
      { type: 'pet', name: '小魔宠', desc: '你收服了一只弱小的魔物，它对你忠心耿耿。', pet: { name: '魔宠', quality: '稀有' } },
    ],
    uniqueItems: ['魔神恩赐', '魔域令', '魔核', '血煞旗'],
  },
  {
    id: 'long_yuan', name: '龙渊秘境', location: '龙渊', tier: 6,
    desc: '传说中龙族栖息之地，机缘与危险并存，藏有龙族至宝。',
    minRealm: 6, maxRealm: 10,
    enemies: [{ name: '龙卫', count: [2, 3] }, { name: '蛟龙', count: [1, 2] }, { name: '龙子', count: [1, 1] }],
    rewards: { exp: [5000, 15000], spiritStone: [5000, 20000], items: ['龙鳞', '龙角', '龙珠', '龙族功法'] },
    boss: { name: '远古巨龙', realmLevel: 10 },
    events: [
      { type: 'treasure', name: '龙族宝库', desc: '你找到了传说中的龙族宝库，里面全是奇珍异宝！', rewards: ['龙鳞', '龙角', '龙珠', '龙族功法', '龙血'] },
      { type: 'danger', name: '龙威震慑', desc: '一股强大的龙威袭来，你感到灵魂都在颤抖！', effects: { hp: -300, mp: -200 }, status: '恐惧' },
      { type: 'mystery', name: '龙族传承', desc: '你获得了龙族的传承，化龙之法尽在其中！', effects: { cultivationExp: 2000, enlightenment: 50 }, rewards: ['化龙诀'] },
      { type: 'heal', name: '龙涎泉', desc: '你发现了龙涎泉，泉水可肉白骨、活死人。', effects: { hp: 300, mp: 250, cultivationExp: 500 } },
      { type: 'pet', name: '龙蛋', desc: '你发现了一枚龙蛋，似乎可以孵化！', pet: { name: '幼龙', quality: '传说' } },
    ],
    uniqueItems: ['化龙诀', '龙血', '龙珠', '龙族令牌'],
  },
  {
    id: 'hun_dun_sea', name: '混沌海秘境', location: '混沌海', tier: 7,
    desc: '混沌之气弥漫的神秘海域，传说有先天灵宝，是天地初开时的遗迹。',
    minRealm: 7, maxRealm: 10,
    enemies: [{ name: '混沌兽', count: [2, 4] }, { name: '混沌神魔', count: [1, 2] }],
    rewards: { exp: [10000, 30000], spiritStone: [10000, 50000], items: ['混沌之气', '先天灵宝', '混沌莲'] },
    boss: { name: '混沌魔神', realmLevel: 10 },
    events: [
      { type: 'treasure', name: '先天灵宝', desc: '你发现了一件先天灵宝，这可是天地初开时的至宝！', rewards: ['先天灵宝', '混沌之气', '混沌莲'] },
      { type: 'danger', name: '混沌风暴', desc: '混沌风暴突然来袭，天地都在扭曲！', effects: { hp: -500, mp: -400 }, combat: true },
      { type: 'mystery', name: '大道铭文', desc: '你看到了混沌中的大道铭文，对天道有了更深的理解！', effects: { cultivationExp: 5000, enlightenment: 100 } },
      { type: 'heal', name: '混沌灵泉', desc: '混沌灵泉可重塑肉身，你感到身体发生了蜕变。', effects: { hp: 500, mp: 400, cultivationExp: 1000 }, status: '混沌体' },
      { type: 'pet', name: '混沌精灵', desc: '一只混沌精灵被你吸引，愿意与你同行。', pet: { name: '混沌精灵', quality: '神话' } },
    ],
    uniqueItems: ['混沌莲', '大道铭文', '混沌珠', '开天斧碎片'],
  },
  {
    id: 'wan_jian_tomb', name: '万剑冢', location: '万剑冢', tier: 4,
    desc: '无数名剑陨落之地，剑气冲天，是剑修的圣地与绝地。',
    minRealm: 4, maxRealm: 7,
    enemies: [{ name: '剑灵', count: [3, 5] }, { name: '剑奴', count: [2, 3] }, { name: '剑魂', count: [1, 2] }],
    rewards: { exp: [800, 2500], spiritStone: [800, 3000], items: ['飞剑', '剑谱', '剑魄'] },
    boss: { name: '万剑之魂', realmLevel: 6 },
    events: [
      { type: 'treasure', name: '名剑冢', desc: '你发现了一处名剑冢，里面插着无数名剑！', rewards: ['飞剑', '剑谱', '剑魄', '剑穗'] },
      { type: 'danger', name: '剑气风暴', desc: '万千剑气形成风暴，朝你袭来！', effects: { hp: -180 }, combat: true },
      { type: 'mystery', name: '剑神传承', desc: '你获得了上古剑神的传承，剑术大进！', effects: { cultivationExp: 1000, combatExp: 500 }, rewards: ['万剑归宗'] },
      { type: 'heal', name: '养剑池', desc: '养剑池的池水可温养剑身，也能修复伤势。', effects: { hp: 120, mp: 80 } },
      { type: 'pet', name: '剑灵', desc: '一只初生的剑灵认你为主，可助你御剑飞行。', pet: { name: '剑灵', quality: '稀有' } },
    ],
    uniqueItems: ['万剑归宗', '剑神令', '剑魂石', '诛仙剑碎片'],
  },
];

// 秘境事件
const DUNGEON_EVENTS = [
  { type: 'treasure', name: '发现宝箱', desc: '你发现了一个宝箱！', effect: 'bonus_reward' },
  { type: 'trap', name: '触发陷阱', desc: '你触发了陷阱！', effect: 'damage' },
  { type: 'rest', name: '灵泉', desc: '你发现一处灵泉，可以恢复状态', effect: 'heal' },
  { type: 'mystery', name: '神秘石碑', desc: '你发现一块神秘石碑，上面刻着功法', effect: 'exp_bonus' },
  { type: 'merchant', name: '神秘商人', desc: '你遇到了一位神秘商人', effect: 'shop' },
  { type: 'fountain', name: '许愿池', desc: '你发现一处许愿池', effect: 'random_buff' },
];

// 副本随机奇遇池（三选一，至少20种）
const DUNGEON_ENCOUNTERS = [
  { id: 'enc_lingquan', title: '灵泉涌动', desc: '前方灵泉汩汩涌动，泉眼处宝光闪烁，但也可能暗藏凶险。',
    options: [
      { text: '畅饮灵泉', desc: '可能恢复气血灵力，也可能被寒泉所伤', effects: { hp: 100, mp: 60 }, bad: { hp: -60 } },
      { text: '采集灵水', desc: '获得一瓶灵水（可入药）', item: '灵水' },
      { text: '小心绕开', desc: '安全离开，无所得', effects: {} },
    ] },
  { id: 'enc_shaonv', title: '求救声', desc: '密林深处传来少女的呼救声，似乎有人遇险。',
    options: [
      { text: '循声相助', desc: '可能获得感谢与声望，也可能落入陷阱', effects: { reputation: 15, silver: 200 }, bad: { hp: -80 } },
      { text: '暗中观察', desc: '看清局势再行动', effects: { enlightenment: 5 } },
      { text: '不予理会', desc: '径直离开', effects: {} },
    ] },
  { id: 'enc_huanjing', title: '迷雾幻境', desc: '一团彩雾弥漫，雾中隐约可见奇珍异宝，也可能是迷人心神的幻境。',
    options: [
      { text: '踏入幻境', desc: '可能获得大机缘，也可能心神受创', effects: { cultivationExp: 400, enlightenment: 10 }, bad: { mp: -100 } },
      { text: '运功驱散', desc: '消耗灵力破除幻雾', effects: { mp: -50 }, item: '幻雾残片' },
      { text: '绕道而行', desc: '安全离开', effects: {} },
    ] },
  { id: 'enc_baoku', title: '废弃宝库', desc: '你发现一间半掩的废弃石室，门缝里透出金属光泽。',
    options: [
      { text: '推门而入', desc: '可能获得宝物，也可能触发机关', effects: { silver: 500, item: '灵石' }, bad: { hp: -100 } },
      { text: '先探机关', desc: '仔细检查门上的机关', effects: { enlightenment: 8 }, item: '铜钥匙' },
      { text: '放弃离开', desc: '安全离开', effects: {} },
    ] },
  { id: 'enc_shou', title: '受伤的灵兽', desc: '一只灵兽倒在路边，腹部受伤，可怜地望着你。',
    options: [
      { text: '为它疗伤', desc: '灵兽感恩，可能跟随你', pet: { name: '灵鹿', quality: '优秀' }, effects: { karma: 5 } },
      { text: '取走内丹', desc: '获得妖丹，但会折损功德', item: '妖丹', karma: -5 },
      { text: '默默离开', desc: '不愿多事', effects: {} },
    ] },
  { id: 'enc_guzhan', title: '古战场遗迹', desc: '一片古战场遗迹，尸骨累累，断剑残戈散落各处，灵气却异常浓郁。',
    options: [
      { text: '搜寻遗物', desc: '可能找到前人遗宝', item: '古剑残片', effects: { cultivationExp: 200 } },
      { text: '祭拜亡灵', desc: '安抚亡魂，心性提升', effects: { enlightenment: 15, karma: 3 } },
      { text: '速速离开', desc: '此地不宜久留', effects: {} },
    ] },
  { id: 'enc_yaoteng', title: '妖藤拦路', desc: '一条粗壮的妖藤横亘在道路中央，藤蔓缓缓蠕动。',
    options: [
      { text: '斩断妖藤', desc: '可能获得妖藤心，也可能被藤刺所伤', item: '妖藤心', bad: { hp: -70 } },
      { text: '绕路而行', desc: '多花些时间绕开', effects: { mp: -10 } },
      { text: '以灵火灼烧', desc: '用灵力点燃妖藤', effects: { mp: -60 }, item: '妖藤灰' },
    ] },
  { id: 'enc_zuihan', title: '醉汉拦路', desc: '一个醉醺醺的修士拦住去路，非要与你赌酒。',
    options: [
      { text: '陪他饮酒', desc: '酒逢知己，可能获赠灵酒', item: '灵酒', effects: { hp: 40 } },
      { text: '婉言拒绝', desc: '礼貌离开', effects: {} },
      { text: '趁机套话', desc: '打听消息', effects: { enlightenment: 6 } },
    ] },
  { id: 'enc_midao', title: '幽暗密道', desc: '石壁一侧有道暗门，门后是一条幽暗的密道，不知通向何处。',
    options: [
      { text: '进入密道', desc: '可能发现宝藏，也可能有伏兵', item: '精铁', bad: { hp: -90 } },
      { text: '封死暗门', desc: '避免后方被偷袭', effects: {} },
      { text: '记住位置', desc: '先记下位置，日后再探', effects: { enlightenment: 3 } },
    ] },
  { id: 'enc_guatan', title: '神秘卦摊', desc: '一个白须老者摆着卦摊，笑吟吟地看着你。',
    options: [
      { text: '求一卦', desc: '可能获得吉兆加成或警示', effects: { cultivationExp: 150 }, bad: { reputation: -10 } },
      { text: '请教命理', desc: '听他讲些玄学', effects: { enlightenment: 10 } },
      { text: '径直走过', desc: '不理会', effects: {} },
    ] },
  { id: 'enc_xuanjin', title: '悬赏令', desc: '墙上钉着一张悬赏令：重金悬赏捉拿一位大盗。',
    options: [
      { text: '揭下悬赏', desc: '接下任务，日后可能有用', effects: { reputation: 10 }, item: '悬赏令' },
      { text: '抄录内容', desc: '记下悬赏信息', effects: { enlightenment: 4 } },
      { text: '不闻不问', desc: '事不关己', effects: {} },
    ] },
  { id: 'enc_milu', title: '迷路的老修士', desc: '一位老修士在原地打转，声称自己迷了路。',
    options: [
      { text: '为他指路', desc: '积善德，获感谢', effects: { karma: 3, reputation: 10 } },
      { text: '索取报酬', desc: '他可能是骗子，也可能真给报酬', effects: { silver: 150 }, bad: { reputation: -8 } },
      { text: '各自离开', desc: '不多管闲事', effects: {} },
    ] },
  { id: 'enc_duquan', title: '毒泉翻涌', desc: '一股黑色毒泉从地底涌出，泉边生长着几株毒草。',
    options: [
      { text: '采集毒草', desc: '获得剧毒药材', item: '断肠草', effects: { hp: -20 } },
      { text: '用玉瓶取毒水', desc: '获得毒水（可用于炼毒）', item: '毒泉之水' },
      { text: '避而远之', desc: '远离毒泉', effects: {} },
    ] },
  { id: 'enc_jianzhong', title: '剑冢残件', desc: '一处小剑冢，插着几柄残缺的古剑，剑意凛然。',
    options: [
      { text: '拔剑参悟', desc: '参悟剑意，可能获得传承', effects: { combatExp: 200, enlightenment: 8 } },
      { text: '取走残剑', desc: '获得一柄残剑', item: '古剑残片' },
      { text: '抱拳致意', desc: '对剑冢行礼后离开', effects: { karma: 2 } },
    ] },
  { id: 'enc_lingyu', title: '天降灵雨', desc: '天边忽然聚起灵云，降下一场细密的灵雨，润泽万物。',
    options: [
      { text: '雨中打坐', desc: '借灵雨修炼', effects: { cultivationExp: 300, mp: 80 } },
      { text: '收集灵雨', desc: '用器皿收集灵雨', item: '灵雨露' },
      { text: '找地方避雨', desc: '保持干爽', effects: {} },
    ] },
  { id: 'enc_xianjing', title: '捕兽陷阱', desc: '地上有一个兽夹陷阱，旁边躺着一只被夹住的野兔。',
    options: [
      { text: '救出野兔', desc: '野兔感激地蹭了蹭你', effects: { karma: 2 } },
      { text: '取走陷阱', desc: '获得一个兽夹（可改造）', item: '兽夹' },
      { text: '绕过陷阱', desc: '小心避开', effects: {} },
    ] },
  { id: 'enc_dongfu', title: '遗弃洞府', desc: '山壁上有座被人遗弃的洞府，禁制已经松动。',
    options: [
      { text: '强闯洞府', desc: '可能获得前辈遗宝', item: '功法残卷', bad: { hp: -100 } },
      { text: '破解禁制', desc: '慢慢参悟禁制进入', effects: { enlightenment: 12, mp: -40 } },
      { text: '不冒风险', desc: '转身离开', effects: {} },
    ] },
  { id: 'enc_kujing', title: '枯井回声', desc: '一口枯井深处传来隐约的响声，似有活物，又似有宝光。',
    options: [
      { text: '下井探查', desc: '可能发现井下秘室', item: '储物戒指', bad: { hp: -70 } },
      { text: '投石问路', desc: '试探井底情况', effects: { enlightenment: 4 } },
      { text: '封上井口', desc: '以防后患', effects: {} },
    ] },
  { id: 'enc_gubei', title: '上古残碑', desc: '一块残破的古碑斜立路旁，碑文模糊，隐约可见功法痕迹。',
    options: [
      { text: '研读碑文', desc: '参悟碑文功法', effects: { cultivationExp: 250, enlightenment: 10 } },
      { text: '拓印碑文', desc: '将碑文拓下带走', item: '古碑拓片' },
      { text: '拂拭灰尘', desc: '随手清理', effects: {} },
    ] },
  { id: 'enc_shouqun', title: '兽群奔袭', desc: '远处尘土飞扬，一群妖兽正朝这边狂奔而来！',
    options: [
      { text: '迎战兽群', desc: '击退妖兽获得材料', effects: { combatExp: 150 }, item: '妖兽皮', bad: { hp: -80 } },
      { text: '上树躲避', desc: '避其锋芒', effects: {} },
      { text: '施放威压', desc: '以气势震慑兽群', effects: { mp: -60, reputation: 8 } },
    ] },
  { id: 'enc_feixu', title: '废墟神像', desc: '一座破庙中，神像虽已斑驳，但香火仍有余温。',
    options: [
      { text: '虔诚上香', desc: '神像似有灵光一闪', effects: { karma: 5, cultivationExp: 100 } },
      { text: '搜刮庙内', desc: '查看有无值钱之物', effects: { silver: 120 }, bad: { karma: -3 } },
      { text: '修缮神像', desc: '简单修整残破处', effects: { karma: 8 } },
    ] },
  { id: 'enc_moya', title: '魔气涌泉', desc: '一道魔气从地缝中喷涌而出，四周草木枯萎。',
    options: [
      { text: '净化魔气', desc: '消耗灵力净化', effects: { mp: -80, karma: 6 } },
      { text: '引魔气炼体', desc: '风险与机缘并存', effects: { cultivationExp: 350, hp: -60 } },
      { text: '远远避开', desc: '不沾染魔气', effects: {} },
    ] },
  { id: 'enc_shidan', title: '神秘丹药', desc: '路中央放着一只玉瓶，瓶身贴着一张字条：赠有缘人。',
    options: [
      { text: '服下丹药', desc: '不知品阶，可能是灵丹也可能有毒', effects: { cultivationExp: 500 }, bad: { hp: -120 } },
      { text: '收入囊中', desc: '获得一枚丹药', item: '回元丹' },
      { text: '不去碰它', desc: '江湖险恶，谨慎为上', effects: {} },
    ] },
  { id: 'enc_tianshu', title: '天书幻影', desc: '空中浮现一行金色文字，转瞬即逝，似是天书真意。',
    options: [
      { text: '凝神铭记', desc: '强行记住天书内容', effects: { enlightenment: 20, mp: -100 } },
      { text: '以笔抄录', desc: '快速抄下部分文字', item: '天书残页' },
      { text: '目送消散', desc: '不强求', effects: { enlightenment: 5 } },
    ] },
  { id: 'enc_bingdao', title: '冰晶矿脉', desc: '岩壁上嵌着一层晶莹的冰晶矿，散发着寒气。',
    options: [
      { text: '开采冰晶', desc: '获得冰晶矿', item: '冰晶', effects: { mp: -30 } },
      { text: '吸收寒气', desc: '以寒气淬炼灵力', effects: { mp: 80, cultivationExp: 120 } },
      { text: '记录矿位', desc: '标记位置日后开采', effects: { enlightenment: 3 } },
    ] },
]

// 初始化副本状态
function initDungeonState() {
  return {
    active: null,
    floor: 0,
    maxFloors: 5,
    explored: 0,
    enemiesDefeated: 0,
    totalEnemies: 0,
    bossDefeated: false,
    rewards: { exp: 0, spiritStone: 0, items: [] },
    eventLog: [],
    lastEnterMonth: null,
    enteredThisMonth: false,
    gatherCount: 0,
    maxGather: 10,
  };
}

// 秘境进入费用（根据等级）
function getDungeonEntryFee(dungeon) {
  const tier = dungeon.tier || 1;
  if (tier <= 2) {
    return { currency: 'silver', amount: tier * 100 };
  } else if (tier <= 4) {
    return { currency: 'spirit', amount: tier * 200 };
  } else {
    return { currency: 'spirit', amount: tier * 500 };
  }
}

// 进入副本
function enterDungeon(player, dungeonId, gameDate) {
  const dungeon = DUNGEONS.find(d => d.id === dungeonId);
  if (!dungeon) return { success: false, msg: '副本不存在' };
  if (player.realmLevel < dungeon.minRealm) {
    return { success: false, msg: `境界不足，需要${dungeon.minRealm}阶以上` };
  }
  if (player.hp.current < player.hp.max * 0.3) {
    return { success: false, msg: '气血过低，无法进入副本' };
  }

  // 每月只能进入一次
  if (!player.dungeonState) player.dungeonState = initDungeonState();
  const currentMonth = `${gameDate.year}年${gameDate.month}月`;
  if (player.dungeonState.lastEnterMonth === currentMonth && player.dungeonState.enteredThisMonth) {
    return { success: false, msg: '本月已进入过秘境，下月再来吧' };
  }

  // 扣除进入费用
  const fee = getDungeonEntryFee(dungeon);
  if (fee.currency === 'silver') {
    if (player.silver < fee.amount) return { success: false, msg: `银两不足，需要${fee.amount}银两` };
    player.silver -= fee.amount;
  } else {
    if (player.spiritStone < fee.amount) return { success: false, msg: `灵石不足，需要${fee.amount}灵石` };
    player.spiritStone -= fee.amount;
  }

  const state = initDungeonState();
  state.active = dungeon;
  state.maxFloors = 3 + dungeon.tier;
  state.totalEnemies = randInt(5, 8) + dungeon.tier * 2;
  state.lastEnterMonth = currentMonth;
  state.enteredThisMonth = true;
  if (dungeon.startFloor) {
    state.floor = dungeon.startFloor - 1; // 从指定层开始（下一层即 startFloor）
  }
  if (dungeon.id.startsWith('bandit_')) {
    player.banditEnteredMonth = currentMonth;
  }

  return {
    success: true,
    msg: `你花费${fee.amount}${fee.currency === 'silver' ? '银两' : '灵石'}进入了${dungeon.name}！`,
    dungeonState: state,
    fee: fee,
  };
}

// 探索副本一层
function exploreDungeonFloor(player, dungeonState) {
  if (!dungeonState.active) return { success: false, msg: '没有进行中的副本' };

  dungeonState.floor++;
  if (dungeonState.floor > dungeonState.maxFloors) {
    return completeDungeon(player, dungeonState);
  }

  const dungeon = dungeonState.active;
  const event = randChoice(DUNGEON_EVENTS);
  let result = { floor: dungeonState.floor, event: event.name, desc: event.desc, combat: null };

  // 处理事件
  switch (event.effect) {
    case 'bonus_reward':
      const bonusStone = randInt(100, 500) * dungeon.tier;
      dungeonState.rewards.spiritStone += bonusStone;
      result.bonus = `获得${bonusStone}灵石`;
      break;
    case 'damage':
      const damage = Math.floor(player.hp.max * 0.1);
      player.hp.current = Math.max(1, player.hp.current - damage);
      result.damage = `受到${damage}点伤害`;
      break;
    case 'heal':
      player.hp.current = Math.min(player.hp.max, player.hp.current + Math.floor(player.hp.max * 0.3));
      player.mp.current = Math.min(player.mp.max, player.mp.current + Math.floor(player.mp.max * 0.3));
      result.heal = '恢复30%气血和灵力';
      break;
    case 'exp_bonus':
      const exp = randInt(200, 500) * dungeon.tier;
      player.cultivationExp += exp;
      result.exp = `获得${exp}修为`;
      break;
  }

  // 遭遇敌人
  if (chance(70) && dungeonState.enemiesDefeated < dungeonState.totalEnemies) {
    const enemyType = randChoice(dungeon.enemies);
    const enemyCount = randInt(enemyType.count[0], enemyType.count[1]);
    result.combat = {
      enemyName: enemyType.name,
      count: enemyCount,
      realmLevel: clamp(dungeon.minRealm + randInt(0, dungeon.tier), 1, 10),
    };
    dungeonState.enemiesDefeated += enemyCount;
  }

  // Boss战
  if (dungeonState.floor === dungeonState.maxFloors && !dungeonState.bossDefeated) {
    result.boss = {
      name: dungeon.boss.name,
      realmLevel: dungeon.boss.realmLevel,
    };
  }

  dungeonState.eventLog.push(result);
  return { success: true, ...result, dungeonState };
}

// 击败Boss
function defeatBoss(player, dungeonState) {
  const dungeon = dungeonState.active;
  dungeonState.bossDefeated = true;

  // Boss奖励
  const exp = randInt(dungeon.rewards.exp[0], dungeon.rewards.exp[1]);
  const stone = randInt(dungeon.rewards.spiritStone[0], dungeon.rewards.spiritStone[1]);
  dungeonState.rewards.exp += exp;
  dungeonState.rewards.spiritStone += stone;

  // 掉落物品
  const dropCount = randInt(1, 3);
  for (let i = 0; i < dropCount; i++) {
    const item = randChoice(dungeon.rewards.items);
    dungeonState.rewards.items.push(item);
  }

  return {
    success: true,
    msg: `击败${dungeon.boss.name}！获得${exp}修为，${stone}灵石！`,
    dungeonState,
  };
}

// 完成副本
function completeDungeon(player, dungeonState) {
  const dungeon = dungeonState.active;

  // 发放奖励
  player.cultivationExp += dungeonState.rewards.exp;
  player.spiritStone += dungeonState.rewards.spiritStone;
  for (const item of dungeonState.rewards.items) {
    const existing = player.inventory.find(i => i.name === item);
    if (existing) existing.count++;
    else player.inventory.push({ name: item, count: 1 });
  }

  const result = {
    success: true,
    completed: true,
    msg: `副本完成！共获得${dungeonState.rewards.exp}修为，${dungeonState.rewards.spiritStone}灵石，${dungeonState.rewards.items.length}件物品。`,
    rewards: dungeonState.rewards,
  };

  dungeonState.active = null;
  return result;
}

// 退出副本
function exitDungeon(player, dungeonState) {
  if (!dungeonState.active) return { success: false, msg: '没有进行中的副本' };
  const dungeon = dungeonState.active;

  // 发放部分奖励（50%）
  player.cultivationExp += Math.floor(dungeonState.rewards.exp * 0.5);
  player.spiritStone += Math.floor(dungeonState.rewards.spiritStone * 0.5);

  dungeonState.active = null;
  return {
    success: true,
    msg: `你退出了${dungeon.name}，获得50%奖励。`,
  };
}

// 获取副本列表
function getDungeonList(player) {
  return DUNGEONS.map(d => ({
    ...d,
    available: player.realmLevel >= d.minRealm,
    difficulty: '★'.repeat(d.tier),
  }));
}

module.exports = {
  DUNGEONS, DUNGEON_EVENTS, DUNGEON_ENCOUNTERS,
  initDungeonState, enterDungeon, exploreDungeonFloor,
  defeatBoss, completeDungeon, exitDungeon, getDungeonList,
};
