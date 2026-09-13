// NPC大世界随机事件系统 - 每月结束自动刷新
// 按身份/职位/年龄/性格/性别/地点分类，独自事件+交互事件
const { randChoice, chance, randInt } = require('./utils');

// ===== 按身份分类的独自事件 =====
const SOLO_BY_IDENTITY = {
  // 凡人界身份
  mortal: [
    { text: (n, l) => `${n.name}在${l}辛勤劳作，日出而作日落而息，虽辛苦却也安稳。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(5, 20); } },
    { text: (n, l) => `${n.name}在${l}的集市上摆摊卖些淫秽物品，生意极好，赚了些许银子。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(10, 40); } },
    { text: (n, l) => `${n.name}在${l}与邻居在巷子里口交被路人发现，慌得呛了好几口，事后无脸见人。`, effect: (n) => { n.reputation = (n.reputation || 0) - randInt(1, 3); } },
    { text: (n, l) => `${n.name}在${l}偶感风寒，咳嗽了好几天，吃了药才见好。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(5, 15)); n.silver = (n.silver || 0) - randInt(5, 15); } },
    { text: (n, l) => `${n.name}在${l}深夜撞见邻居对镜自慰，摸黑潜进去口称要帮她，不等同意就直接上手掰开对方的腿忘情地舔了起来，妇人激得喷了好几次都被自己舔了干净。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(1, 5); } },
    { text: (n, l) => `${n.name}在${l}的茶馆里为一位小娘子舔穴，她在上面吃饭，自己在下面舔穴，小娘子好几次被自己舔地发出呻吟，被伙计看了出来，竟趁着上菜与自己一起舔弄起小娘子，弄得她将淫水都喷进了饭菜里。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}捡到一个钱袋，犹豫再三后还是还给了失主。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 8); } },
    { text: (n, l) => `${n.name}在${l}喝醉了酒，在街上发疯地自慰，还满嘴淫叫，第二天后悔不已。`, effect: (n) => { n.reputation = (n.reputation || 0) - randInt(2, 5); n.silver = (n.silver || 0) - randInt(10, 30); } },
    { text: (n, l) => `${n.name}在${l}撞见了一对奸夫淫妇野地媾和，看得热火难耐，趁着二人筋疲力尽偷偷上去享用，爽得差点被发现。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(5, 10); n.silver = (n.silver || 0) - randInt(50, 200); } },
    { text: (n, l) => `${n.name}在${l}的田地里劳作时，挖出了一坛陈年好酒，饮下后浑身燥热，拽着路过的路人强行交合，满地狼藉。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 80); } },
  ],
  // 修仙界身份
  cultivation: [
    { text: (n, l) => `${n.name}于${l}与新得的性奴玩了三天三夜，被伺候地爽极了，修为也精进不少。`, effect: (n) => { n.cultivationExp += randInt(20, 80); } },
    { text: (n, l) => `${n.name}在${l}打坐悟道，忽有所感，修为瓶颈似有松动。`, effect: (n) => { n.cultivationExp += randInt(30, 100); n.attributes.enlightenment += 1; } },
    { text: (n, l) => `${n.name}在${l}炼制丹药，成了三炉废了一炉，总体还算顺利。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 100); } },
    { text: (n, l) => `${n.name}在${l}修炼时走火入魔，急忙收功调息，休养了半月才恢复。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(30, 60)); n.cultivationExp = Math.max(0, n.cultivationExp - randInt(20, 50)); } },
    { text: (n, l) => `${n.name}在${l}偶得奇遇，于山洞中发现一昏迷少女，淫性四起，将少女剥光对着樱桃小嘴，嫩胸和小穴肆意玩弄，事后直接拍屁股走人。`, effect: (n) => { n.cultivationExp += randInt(50, 150); n.attributes.enlightenment += 2; } },
    { text: (n, l) => `${n.name}在${l}与同道切磋技艺，互相印证，修为都有精进。`, effect: (n) => { n.cultivationExp += randInt(30, 80); } },
    { text: (n, l) => `${n.name}在${l}炼制法器时出了差错，法器报废，还受了些内伤。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(10, 30)); n.silver = (n.silver || 0) - randInt(50, 150); } },
    { text: (n, l) => `${n.name}在${l}云游四方，寻访名师，见识了不少奇人异士。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 8); n.attributes.spirit += 1; } },
    { text: (n, l) => `${n.name}在${l}突破境界成功！修为更上一层楼，气息越发深不可测。`, effect: (n) => { n.cultivationExp += randInt(100, 300); } },
    { text: (n, l) => `${n.name}在${l}渡劫失败，身体动弹不得，竟路人撞见拖进山洞被玩遍了全身，心中又怒又爽，事后又独自自慰幻想了许久。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(50, 100)); n.cultivationExp = Math.max(0, n.cultivationExp - randInt(50, 100)); } },
  ],
  // 魔界身份
  demon: [
    { text: (n, l) => `${n.name}在${l}吞噬魔气时放任魔气进入自己体内，穴口和胸部都被玩大了，终于吸收完魔气后，气息也更加邪异。`, effect: (n) => { n.cultivationExp += randInt(30, 100); } },
    { text: (n, l) => `${n.name}在${l}与其他魔族厮杀，吞噬了对方的修为，实力大增。`, effect: (n) => { n.cultivationExp += randInt(50, 150); n.hp.current = Math.max(1, n.hp.current - randInt(20, 50)); } },
    { text: (n, l) => `${n.name}在${l}被正道修士追杀，用身体勾引对方，又为对方口交让对方对着自己射了好几次才被放走。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(30, 80)); n.reputation = (n.reputation || 0) - randInt(5, 15); } },
  ],
};

// ===== 按职业分类的独自事件 =====
const SOLO_BY_PROFESSION = {
  '炼丹师': [
    { text: (n, l) => `${n.name}在${l}的丹房里埋头炼丹，成了一炉上品丹药，欣喜不已。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(50, 200); n.reputation = (n.reputation || 0) + randInt(2, 5); } },
    { text: (n, l) => `${n.name}在${l}尝试新丹方，结果炸炉了，狼狈不堪。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(10, 30)); n.silver = (n.silver || 0) - randInt(30, 100); } },
  ],
  '炼器师': [
    { text: (n, l) => `${n.name}在${l}的炼器室里叮叮当当打了一个月，终于铸成一件趁手法器。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(80, 250); } },
    { text: (n, l) => `${n.name}在${l}炼器时火候没掌握好，一件半成品法器废了。`, effect: (n) => { n.silver = (n.silver || 0) - randInt(40, 120); } },
  ],
  '猎人': [
    { text: (n, l) => `${n.name}在${l}附近的山林中狩猎，猎到一头大虫，卖了个好价钱。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 100); } },
    { text: (n, l) => `${n.name}在${l}狩猎时被妖兽反扑，受了些伤，勉强逃了回来。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(20, 50)); } },
  ],
  '商人': [
    { text: (n, l) => `${n.name}在${l}做了笔大买卖，低买高卖，赚得盆满钵满。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(100, 500); n.reputation = (n.reputation || 0) + randInt(1, 5); } },
    { text: (n, l) => `${n.name}在${l}被人坑了，进了一批假货，赔了不少银子。`, effect: (n) => { n.silver = (n.silver || 0) - randInt(50, 200); } },
  ],
  '书生': [
    { text: (n, l) => `${n.name}在${l}的书斋中苦读，终于将一部典籍融会贯通。`, effect: (n) => { n.attributes.spirit += randInt(1, 3); n.reputation = (n.reputation || 0) + randInt(1, 3); } },
    { text: (n, l) => `${n.name}在${l}参加诗会，吟了一首好诗，众人拍手称赞。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 10); } },
  ],
  '医生': [
    { text: (n, l) => `${n.name}在${l}救了一个危重病人，家属感激涕零，重金相谢。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 150); n.reputation = (n.reputation || 0) + randInt(3, 10); } },
    { text: (n, l) => `${n.name}在${l}采药时失足跌落山崖，幸好被树藤挂住，捡回一条命。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(30, 60)); } },
  ],
  '官员': [
    { text: (n, l) => `${n.name}在${l}处理政务，政绩斐然，得到上峰嘉奖。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(5, 15); n.silver = (n.silver || 0) + randInt(50, 200); } },
    { text: (n, l) => `${n.name}在${l}被政敌弹劾，灰头土脸，幸好最后化险为夷。`, effect: (n) => { n.reputation = (n.reputation || 0) - randInt(5, 15); } },
  ],
  '歌姬': [
    { text: (n, l) => `${n.name}在${l}的青楼中献艺，结束后被客人当地扒开衣服小穴里插满了鸡巴，胸上嘴里全身淫水。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(50, 200); n.reputation = (n.reputation || 0) + randInt(2, 8); } },
    { text: (n, l) => `${n.name}在${l}被一个恶客刁难，幸好老鸨出面解围，不然后果不堪设想。`, effect: (n) => { n.reputation = (n.reputation || 0) - randInt(1, 5); } },
  ],
};

// ===== 按性格分类的独自事件 =====
const SOLO_BY_PERSONALITY = {
  '温和宽厚': [
    { text: (n, l) => `${n.name}在${l}遇到了一个迷路的孩童，引诱他为自己口交，娇嫩的小嘴让自己喷了好几次，心中欢快极了。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 8); } },
    { text: (n, l) => `${n.name}在${l}好心将随身食物分给乞丐却被拽进巷子压着操了好几次，出来时身上全身精液，路都走不稳。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 5); } },
  ],
  '阴险狡诈': [
    { text: (n, l) => `${n.name}在${l}设计坑了一个熟人，占了不少便宜，心中暗暗得意。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 80); n.reputation = (n.reputation || 0) - randInt(3, 10); } },
    { text: (n, l) => `${n.name}在${l}偷偷摸摸地夹着玉柄走在路上，高潮了好几次，幸好没被人发现。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 100); } },
  ],
  '豪迈直爽': [
    { text: (n, l) => `${n.name}在${l}的酒馆里和人拼酒，喝倒了三个大汉，赢得满堂喝彩。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(5, 15); n.silver = (n.silver || 0) - randInt(30, 80); } },
    { text: (n, l) => `${n.name}在${l}路见不平拔刀相助，教训了几个地痞流氓。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(5, 12); n.hp.current = Math.max(1, n.hp.current - randInt(5, 20)); } },
  ],
  '孤僻冷漠': [
    { text: (n, l) => `${n.name}在${l}独自待在角落里，谁也不理，谁也不睬。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}一个人修炼，不与任何人来往，倒也清净。`, effect: (n) => { n.cultivationExp += randInt(10, 40); } },
  ],
  '活泼开朗': [
    { text: (n, l) => `${n.name}在${l}到处串门，和谁都能聊上几句，人缘好得不得了。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 6); } },
    { text: (n, l) => `${n.name}在${l}组织了一场聚会，大家玩得都很开心。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 8); n.silver = (n.silver || 0) - randInt(20, 60); } },
  ],
  '好色之徒': [
    { text: (n, l) => `${n.name}在${l}的青楼里流连忘返，花了不少银子，身子也亏空了。`, effect: (n) => { n.silver = (n.silver || 0) - randInt(50, 200); n.hp.current = Math.max(1, n.hp.current - randInt(5, 15)); } },
    { text: (n, l) => `${n.name}在${l}调戏良家妇女，凭借自己的本事让对方念念不忘。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(20, 50)); n.reputation = (n.reputation || 0) - randInt(5, 15); } },
  ],
};

// ===== 按年龄段分类的独自事件 =====
const SOLO_BY_AGE = {
  child: [ // 0-15岁
    { text: (n, l) => `${n.name}在${l}和小伙伴们玩耍，无忧无虑，笑声不断。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}调皮捣蛋，被家长追着打了半条街。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(1, 5)); } },
    { text: (n, l) => `${n.name}在${l}的私塾里读书，虽然坐不住，但也学了几个字。`, effect: (n) => { n.attributes.spirit += 1; } },
  ],
  young: [ // 16-30岁
    { text: (n, l) => `${n.name}在${l}意气风发，四处闯荡，立志要闯出一番名堂。`, effect: (n) => { n.cultivationExp += randInt(20, 60); n.reputation = (n.reputation || 0) + randInt(1, 5); } },
    { text: (n, l) => `${n.name}在${l}为了生计奔波，虽然辛苦，但充满希望。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(10, 40); } },
  ],
  middle: [ // 31-60岁
    { text: (n, l) => `${n.name}在${l}上有老下有小，为了家庭日夜操劳。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 60); n.hp.current = Math.max(1, n.hp.current - randInt(5, 15)); } },
    { text: (n, l) => `${n.name}在${l}事业小有成就，日子过得还算滋润。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 100); n.reputation = (n.reputation || 0) + randInt(2, 6); } },
  ],
  old: [ // 61岁+
    { text: (n, l) => `${n.name}在${l}颐养天年，含饴弄孙，日子过得悠闲自在。`, effect: (n) => { n.hp.current = n.hp.max; } },
    { text: (n, l) => `${n.name}在${l}身体大不如前，时常咳嗽，需要人照料。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(10, 30)); } },
  ],
};

// ===== 15岁以上男性专属事件库（20条，按性别随机触发）=====
const SOLO_BY_GENDER = {
  male: [
    { text: (n, l) => `${n.name}在${l}的演武场里练了一通拳脚，拳风虎虎生威，一身力气又长了几分。`, effect: (n) => { n.attributes = n.attributes || {}; n.attributes.physique = (n.attributes.physique || 0) + 1; } },
    { text: (n, l) => `${n.name}在${l}附近的山林里猎到一头肥硕野猪，扛回镇上卖了个好价钱。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 100); } },
    { text: (n, l) => `${n.name}在${l}跑了一趟远路，为寂寞的小娘子舔穴插穴，赚了点辛苦钱。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(40, 120); n.hp.current = Math.max(1, n.hp.current - randInt(3, 8)); } },
    { text: (n, l) => `${n.name}在${l}的酒馆里与几位兄弟拼酒，喝得面红耳赤，末了拍着胸脯请了顿酒钱。`, effect: (n) => { n.silver = (n.silver || 0) - randInt(20, 60); n.reputation = (n.reputation || 0) + randInt(1, 4); } },
    { text: (n, l) => `${n.name}在${l}寻了一处僻静地打坐吐纳，引气归元，修为略有精进。`, effect: (n) => { n.cultivationExp = (n.cultivationExp || 0) + randInt(20, 70); } },
    { text: (n, l) => `${n.name}在${l}的河里撒网捕鱼，收网时竟网住一条金鳞大鱼，引来众人围观。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 80); } },
    { text: (n, l) => `${n.name}在${l}上山砍了一担柴，挑到集市卖了，换了米面回家。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(10, 40); } },
    { text: (n, l) => `${n.name}在${l}的私塾替先生代了几堂课，讲得头头是道，得了乡邻夸赞。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 6); n.attributes = n.attributes || {}; n.attributes.spirit = (n.attributes.spirit || 0) + 1; } },
    { text: (n, l) => `${n.name}在${l}的赛马会上拔得头筹，赢下彩头，风光了一回。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 90); n.reputation = (n.reputation || 0) + randInt(2, 6); } },
    { text: (n, l) => `${n.name}在${l}与一条壮汉比武切磋，缠斗许久才险胜一招，对方心服口服。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 8); n.hp.current = Math.max(1, n.hp.current - randInt(5, 15)); } },
    { text: (n, l) => `${n.name}在${l}的悬崖峭壁上采得一株老药，转手卖给药铺，得了笔不菲的银子。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(50, 150); } },
    { text: (n, l) => `${n.name}在${l}帮邻里修葺漏雨的屋顶，忙了一整天，邻里感激不尽。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(3, 8); n.hp.current = Math.max(1, n.hp.current - randInt(3, 8)); } },
    { text: (n, l) => `${n.name}牵着一头牲口去${l}的集市赶集，卖了个好价，又添置了些家伙什。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 70); } },
    { text: (n, l) => `${n.name}在${l}的溪边钓了半日鱼，一无所获也不恼，只当修身养性。`, effect: (n) => { n.cultivationExp = (n.cultivationExp || 0) + randInt(5, 20); } },
    { text: (n, l) => `${n.name}在${l}的码头上遇见了位贵妇，心生歹念，下了迷药将她拖进暗处扒光衣服为自己口交，又咬着妇人保养良好的玉胸插着妇人紧致的小穴心中畅快极了。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(15, 50); } },
    { text: (n, l) => `${n.name}在${l}想拜一位名匠为师，被考较了一番手艺，虽未入门，也长了不少见识。`, effect: (n) => { n.attributes = n.attributes || {}; n.attributes.enlightenment = (n.attributes.enlightenment || 0) + 1; } },
    { text: (n, l) => `${n.name}在${l}的丹房外候了一整天，只为观摩老师傅开炉炼丹，暗中记下不少门道。`, effect: (n) => { n.cultivationExp = (n.cultivationExp || 0) + randInt(15, 45); } },
    { text: (n, l) => `${n.name}在${l}放牧时遇上一头饿狼叼羊，抄起棍棒赶跑了狼，羊群安然无恙。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 6); n.hp.current = Math.max(1, n.hp.current - randInt(3, 10)); } },
    { text: (n, l) => `${n.name}提着一包点心去${l}探望姑母，撞见姑母与野男人媾和，只觉又惊又刺激，事后装不知道地将点心给姑母，眼睛却忍不住乱瞟。`, effect: (n) => { n.silver = (n.silver || 0) - randInt(10, 30); n.reputation = (n.reputation || 0) + randInt(1, 3); } },
    { text: (n, l) => `${n.name}在${l}的油灯下读到深夜，将一卷兵书翻来覆去琢磨，自觉受益良多。`, effect: (n) => { n.attributes = n.attributes || {}; n.attributes.enlightenment = (n.attributes.enlightenment || 0) + 1; n.reputation = (n.reputation || 0) + randInt(1, 3); } },
  ],
  female: [
    { text: (n, l) => `${n.name}在${l}的窗下绣了一幅精美的绣品，被路过的夫人看中，高价买走。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 70); } },
    { text: (n, l) => `${n.name}在${l}的山间采药，识得几味药性，背了一篓草药回来晾晒。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(15, 50); n.attributes = n.attributes || {}; n.attributes.spirit = (n.attributes.spirit || 0) + 1; } },
    { text: (n, l) => `${n.name}在${l}的厨房里做了几样拿手菜，分给左邻右舍尝鲜，众人都赞她手巧。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 6); } },
    { text: (n, l) => `${n.name}在${l}的蚕房里养的一季蚕茧丰收，缫了丝换回不少银钱。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 90); } },
    { text: (n, l) => `${n.name}在${l}的织机前织出一匹细布，质地细密，被人夸手艺赛过老师傅。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(25, 80); } },
    { text: (n, l) => `${n.name}把自家园里种的菜挑到${l}的集市上卖，一上午便卖了个精光。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(15, 45); } },
    { text: (n, l) => `${n.name}在${l}帮邻家照看了半天孩子，孩子哭闹不止，她哄了半天才哄好。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(1, 4); } },
    { text: (n, l) => `${n.name}在${l}的庙里上了一炷香，为家人祈福，心里安定了不少。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}的园中赏花散心，折了一枝海棠簪在发间，心情大好。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}跟着${l}的稳婆学了几天接生的手法，胆大心细，得了稳婆一句夸。`, effect: (n) => { n.attributes = n.attributes || {}; n.attributes.spirit = (n.attributes.spirit || 0) + 1; n.reputation = (n.reputation || 0) + randInt(1, 3); } },
    { text: (n, l) => `${n.name}在${l}的月下抚琴一曲，琴声清越，路过的人驻足听了半晌。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 6); } },
    { text: (n, l) => `${n.name}在${l}的溪边洗衣，边捶衣边哼着小曲，心情倒也舒畅。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}的院中栽了一片花苗，日日浇水打理，盼着来年花开满园。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}的鸡窝里捡了一篮鸡蛋，攒着拿去换些油盐。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(5, 20); } },
    { text: (n, l) => `${n.name}做了几盒桂花糕送到${l}的学堂，孩子们吃得满嘴香甜，直喊她好。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(2, 5); n.silver = (n.silver || 0) - randInt(5, 15); } },
    { text: (n, l) => `${n.name}在${l}被媒人上门说亲，她只说家中事忙，婉言谢绝了。`, effect: (n) => {} },
    { text: (n, l) => `${n.name}在${l}寻了处清净地方打坐炼气，眉目舒展，修为隐隐有所增进。`, effect: (n) => { n.cultivationExp = (n.cultivationExp || 0) + randInt(15, 55); } },
    { text: (n, l) => `${n.name}在${l}的池塘边采了一筐莲蓬，剥出莲子晒干，卖给货郎换了钱。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(15, 50); } },
    { text: (n, l) => `${n.name}在${l}的灯下为家人缝制冬衣，一针一线都细细密密，针脚匀整。`, effect: (n) => { n.reputation = (n.reputation || 0) + randInt(1, 4); } },
    { text: (n, l) => `${n.name}把${l}的菜园打理得井井有条，瓜果满架，邻里都来讨要种子。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(10, 35); n.reputation = (n.reputation || 0) + randInt(1, 3); } },
  ],
};

// ===== 0-3岁襁褓期专属记事（婴幼儿不参与劳作/摆摊/婚配等成人事件池）=====
const BABY_EVENTS = [
  { text: (n, l) => `${n.name}在${l}的摇篮里睡得正香，小脸红扑扑的，偶尔咂咂嘴。`, effect: () => {} },
  { text: (n, l) => `${n.name}被抱在怀里，睁着圆溜溜的眼睛，好奇地打量着周围的一切。`, effect: () => {} },
  { text: (n, l) => `${n.name}夜里哇哇大哭，奶娘哄了好一会儿，才抽抽噎噎地安静下来。`, effect: () => {} },
  { text: (n, l) => `${n.name}学着大人的样子咿呀学语，含糊不清地叫唤了几声，逗得人发笑。`, effect: () => {} },
  { text: (n, l) => `${n.name}在${l}的摇篮里伸着小手抓来抓去，抓到什么都要往嘴里塞。`, effect: () => {} },
  { text: (n, l) => `${n.name}被人逗弄时咯咯直笑，清脆的笑声传出去老远。`, effect: () => {} },
];

// ===== NPC交互事件（与其他NPC） =====
const INTERACTION_EVENTS = {
  // 父母（A对父/母 B；称呼按 B 实际性别动态显示，修复"母亲被称呼为父亲"）
  parent: [
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}在${l}的院中为${k}${n2.name}斟茶捶背，听其讲述当年旧事，${n2.name}眉眼舒展，神色欣慰。`; }, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(5, 20); } },
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}与${k}${n2.name}在${l}院中对弈，落子间闲话家常，${n2.name}赢了半目，捋须笑道："还是${n1.name}差些火候。"`; }, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) + randInt(1, 3); } },
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}在${l}为${k}${n2.name}梳发添衣，说起邻里长短，${n2.name}叮嘱道："出门在外，照顾好自己。"`; }, effect: (n1, n2) => { n2.hp.current = Math.min(n2.hp.max, n2.hp.current + randInt(5, 15)); } },
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}与${k}${n2.name}在${l}因家事争执了几句，${n2.name}板着脸训斥，${n1.name}低头听着，末了又和好如初。`; }, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}陪${k}${n2.name}去${l}的庙里上香，一路搀扶，${n2.name}念叨着家中琐事，${n1.name}耐心听着，频频点头。`; }, effect: (n1, n2) => { n2.hp.current = Math.min(n2.hp.max, n2.hp.current + randInt(3, 10)); } },
    { text: (n1, n2, l) => { const k = n2.gender === '女' ? '母亲' : '父亲'; return `${n1.name}在${l}买了一件新衣送给${k}${n2.name}，${n2.name}嘴上嫌贵，眉眼间却藏着笑意。`; }, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(20, 80); n2.reputation = (n2.reputation || 0) + randInt(1, 3); } },
  ],
  // 子女（A对子女 B）
  child: [
    { text: (n1, n2, l) => `${n1.name}在${l}的堂前教导儿子${n2.name}读书识字，${n2.name}歪头苦思，${n1.name}耐心讲解，声音温和。`, effect: (n1, n2) => { n2.attributes = n2.attributes || {}; n2.attributes.spirit = (n2.attributes.spirit || 0) + 1; } },
    { text: (n1, n2, l) => `${n1.name}在${l}的集市给女儿${n2.name}买了一串糖人，${n2.name}举着糖人笑逐颜开，${n1.name}看着也弯了嘴角。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(3, 15); } },
    { text: (n1, n2, l) => `${n1.name}见儿子${n2.name}在${l}练武擦破了皮，一边上药一边数落，手上动作却轻了又轻。`, effect: (n1, n2) => { n2.hp.current = Math.max(1, n2.hp.current - randInt(3, 10)); n2.hp.current = Math.min(n2.hp.max, n2.hp.current + randInt(5, 10)); } },
    { text: (n1, n2, l) => `${n1.name}与女儿${n2.name}在${l}商量家中大事，${n2.name}如今已能独当一面，${n1.name}欣慰地拍了拍其肩头。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) + randInt(1, 4); } },
    { text: (n1, n2, l) => `${n1.name}在${l}为远行的儿子${n2.name}收拾行囊，反复叮嘱路上小心，${n2.name}郑重应下，转身时眼含不舍。`, effect: (n1, n2) => {} },
  ],
  // 夫妻
  spouse: [
    { text: (n1, n2, l) => `${n1.name}与${n2.name}在${l}的灯下共话家常，说起往事，${n2.name}忍不住掩口而笑，${n1.name}也跟着笑出声来。`, effect: (n1, n2) => { n1.hp.current = Math.min(n1.hp.max, n1.hp.current + randInt(5, 10)); n2.hp.current = Math.min(n2.hp.max, n2.hp.current + randInt(5, 10)); } },
    { text: (n1, n2, l) => `${n1.name}在${l}为${n2.name}温了一壶酒，两人对酌，话虽不多，眉眼间皆是默契。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(5, 20); } },
    { text: (n1, n2, l) => `${n1.name}与${n2.name}在${l}因琐事拌了几句嘴，夜里${n2.name}又悄悄替${n1.name}掖好被角，两人重归于好。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}与${n2.name}在${l}携手赏月，${n2.name}靠在${n1.name}肩头，感叹岁月安稳，只愿长伴左右。`, effect: (n1, n2) => { n1.cultivationExp += randInt(10, 30); n2.cultivationExp += randInt(10, 30); } },
    { text: (n1, n2, l) => `${n1.name}远行归来，${n2.name}早早等在${l}门口，见其身影，眼眶微红，快步迎了上去。`, effect: (n1, n2) => { n1.hp.current = Math.min(n1.hp.max, n1.hp.current + randInt(5, 15)); } },
  ],
  // 妻妾（A与妾室 B）
  concubine: [
    { text: (n1, n2, l) => `${n1.name}与妾室${n2.name}在${l}的园中赏花，${n1.name}折下一枝替${n2.name}簪在鬓边，${n2.name}脸颊微红，垂下眼去。`, effect: (n1, n2) => { n2.favorWithPlayer = Math.max(-100, Math.min(100, (n2.favorWithPlayer || 0) + 1)); } },
    { text: (n1, n2, l) => `${n1.name}在${l}陪妾室${n2.name}说了许久体己话，${n2.name}心里那点委屈渐渐散了，重又露出笑颜。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}与妾室${n2.name}在${l}因争宠置气，${n1.name}好言安抚，${n2.name}转嗔为喜，缠着${n1.name}许下承诺。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}在${l}为妾室${n2.name}添了几件新衣裳，${n2.name}喜滋滋地比划着，直说${n1.name}最疼自己。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(20, 60); } },
    { text: (n1, n2, l) => `${n1.name}与妾室${n2.name}在${l}月下散步，${n2.name}挽着${n1.name}的手臂，絮絮说着家常，${n1.name}含笑听着。`, effect: (n1, n2) => {} },
  ],
  // 好友
  friend: [
    { text: (n1, n2, l) => `${n1.name}与好友${n2.name}在${l}偶遇，两人相谈甚欢，一起喝了顿酒。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(10, 30); } },
    { text: (n1, n2, l) => `${n1.name}向好友${n2.name}借了一笔银子，说好下月归还。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) + randInt(20, 100); n2.silver = (n2.silver || 0) - randInt(20, 100); } },
    { text: (n1, n2, l) => `${n1.name}与好友${n2.name}在${l}切磋技艺，互相印证，都有所得。`, effect: (n1, n2) => { n1.cultivationExp += randInt(20, 50); n2.cultivationExp += randInt(20, 50); } },
    { text: (n1, n2, l) => `${n1.name}帮好友${n2.name}解决了一个麻烦，${n2.name}感激不尽。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) + randInt(2, 8); } },
    { text: (n1, n2, l) => `${n1.name}与好友${n2.name}在${l}合伙做了笔生意，赚了不少。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) + randInt(30, 100); n2.silver = (n2.silver || 0) + randInt(30, 100); } },
  ],
  // 仇敌
  enemy: [
    { text: (n1, n2, l) => `${n1.name}在${l}与仇敌${n2.name}狭路相逢，双方剑拔弩张，各自冷笑一声，终究没有动手，擦肩而过。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) - randInt(1, 3); } },
    { text: (n1, n2, l) => `${n1.name}在${l}撞见仇敌${n2.name}，两人恶语相向，围观众人纷纷避让，最后被旁人劝开。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) - randInt(2, 5); n2.reputation = (n2.reputation || 0) - randInt(2, 5); } },
    { text: (n1, n2, l) => `${n1.name}暗地里给仇敌${n2.name}使了个绊子，${n2.name}在${l}吃了个哑巴亏，气得直跺脚。`, effect: (n1, n2) => { n2.silver = (n2.silver || 0) - randInt(20, 80); n1.reputation = (n1.reputation || 0) - randInt(1, 4); } },
    { text: (n1, n2, l) => `${n1.name}与仇敌${n2.name}在${l}大打出手，打得难解难分，各自带伤离去，约定来日再分高下。`, effect: (n1, n2) => { n1.hp.current = Math.max(1, n1.hp.current - randInt(20, 60)); n2.hp.current = Math.max(1, n2.hp.current - randInt(20, 60)); } },
    { text: (n1, n2, l) => `${n1.name}听说仇敌${n2.name}在${l}落难，犹豫再三，终究没有落井下石，只是冷眼旁观。`, effect: (n1, n2) => {} },
  ],
  // 师徒（A为师，B为徒）
  master: [
    { text: (n1, n2, l) => `${n1.name}在${l}的静室中指点徒弟${n2.name}修炼，见其渐渐开窍，欣慰地点头："根基既稳，往后便是水磨工夫。"`, effect: (n1, n2) => { n2.cultivationExp += randInt(20, 60); } },
    { text: (n1, n2, l) => `${n1.name}见徒弟${n2.name}在${l}偷懒，板着脸罚其抄写经义，末了又悄悄让厨房加了菜。`, effect: (n1, n2) => { n2.cultivationExp -= randInt(5, 15); } },
    { text: (n1, n2, l) => `${n1.name}在${l}为徒弟${n2.name}护法突破，一连守了三天三夜，待${n2.name}功成出关，才露出笑容。`, effect: (n1, n2) => { n2.cultivationExp += randInt(50, 120); n1.reputation = (n1.reputation || 0) + randInt(2, 6); } },
    { text: (n1, n2, l) => `${n1.name}与徒弟${n2.name}在${l}论道至深夜，${n2.name}偶有妙悟，${n1.name}大为赞赏，连说后生可畏。`, effect: (n1, n2) => { n1.cultivationExp += randInt(10, 30); n2.cultivationExp += randInt(20, 50); } },
    { text: (n1, n2, l) => `${n1.name}在${l}送别出师远行的徒弟${n2.name}，临行前细细叮嘱，${n2.name}郑重叩首，再抬头时眼眶微红。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) + randInt(2, 5); } },
  ],
  // 师徒（A为徒，B为师）
  disciple: [
    { text: (n1, n2, l) => `${n1.name}在${l}为师尊${n2.name}奉上一盏新茶，${n2.name}接过啜了一口，点头道："有心了。"`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}在${l}向师尊${n2.name}请教功法疑难，${n2.name}耐心讲解，${n1.name}茅塞顿开，连声道谢。`, effect: (n1, n2) => { n1.cultivationExp += randInt(30, 80); } },
    { text: (n1, n2, l) => `${n1.name}在${l}替师尊${n2.name}跑腿办事，一路妥当，${n2.name}满意地捋了捋须，夸其办事牢靠。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) + randInt(1, 4); } },
    { text: (n1, n2, l) => `${n1.name}与师尊${n2.name}在${l}坐而论道，${n1.name}将近日所悟一一禀报，${n2.name}听得频频点头。`, effect: (n1, n2) => { n1.cultivationExp += randInt(20, 50); n2.cultivationExp += randInt(10, 30); } },
    { text: (n1, n2, l) => `${n1.name}在${l}念及师尊${n2.name}多年栽培，亲手做了一件小物相赠，${n2.name}收下后神色动容。`, effect: (n1, n2) => { n2.reputation = (n2.reputation || 0) + randInt(1, 3); } },
  ],
  // 其他亲属（叔伯姑舅姨、堂表、祖孙）
  relative: [
    { text: (n1, n2, l) => `${n1.name}在${l}探望亲属${n2.name}，带去一包土产，${n2.name}一边说"来就来，带什么东西"，一边笑着收下。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(10, 40); } },
    { text: (n1, n2, l) => `${n1.name}与亲属${n2.name}在${l}叙旧，说起族中旧事，两人都感慨不已。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}在${l}向亲属${n2.name}借一件物什，${n2.name}二话不说便应下，还叮嘱不够再来取。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}与亲属${n2.name}在${l}一同祭祖扫墓，焚香叩拜，起身后相顾无言，只余追思。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}与亲属${n2.name}在${l}因一场喜事的份子钱闹了点别扭，隔日又说说笑笑，一笔带过。`, effect: (n1, n2) => {} },
  ],
  // 陌生人
  stranger: [
    { text: (n1, n2, l) => `${n1.name}在${l}与${n2.name}发生冲突，两人大吵了一架。`, effect: (n1, n2) => { n1.reputation = (n1.reputation || 0) - randInt(1, 5); n2.reputation = (n2.reputation || 0) - randInt(1, 5); } },
    { text: (n1, n2, l) => `${n1.name}在${l}向${n2.name}问路，${n2.name}热心地指了路。`, effect: (n1, n2) => { n2.reputation = (n2.reputation || 0) + randInt(1, 3); } },
    { text: (n1, n2, l) => `${n1.name}在${l}被${n2.name}撞了一下，两人对视一眼，各自走开。`, effect: (n1, n2) => {} },
    { text: (n1, n2, l) => `${n1.name}在${l}的茶馆里听${n2.name}讲了个有趣的故事，忍不住打赏了几文钱。`, effect: (n1, n2) => { n1.silver = (n1.silver || 0) - randInt(1, 10); n2.silver = (n2.silver || 0) + randInt(1, 10); } },
  ],
};

// 记事写入（个人记事限长，防止无限膨胀）
function pushHistory(n, text) {
  if (!n.personalHistory) n.personalHistory = [];
  n.personalHistory.push(text);
  if (n.personalHistory.length > 300) n.personalHistory = n.personalHistory.slice(-300);
}

// ===== 副本秘境事件（NPC在副本中概率采集/偶遇妖兽）=====
const DUNGEON_EVENTS = [
  { text: (n, l) => `${n.name}在${l}中采集灵草，收获颇丰。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(20, 80); } },
  { text: (n, l) => `${n.name}在${l}中偶遇妖兽，一番搏斗后险胜，得了些妖兽材料。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(30, 120); n.hp.current = Math.max(1, n.hp.current - randInt(5, 15)); } },
  { text: (n, l) => `${n.name}在${l}的角落发现一个散落的宝箱，打开后惊喜不已。`, effect: (n) => { n.silver = (n.silver || 0) + randInt(40, 150); } },
  { text: (n, l) => `${n.name}在${l}中搜寻遗迹，找到了一卷残破的修炼手札。`, effect: (n) => { n.cultivationExp += randInt(30, 100); } },
  { text: (n, l) => `${n.name}在${l}中遭遇妖兽群，寡不敌众，狼狈逃出。`, effect: (n) => { n.hp.current = Math.max(1, n.hp.current - randInt(20, 50)); } },
  { text: (n, l) => `${n.name}在${l}中拾得一枚不知名的灵果，服下后修为精进。`, effect: (n) => { n.cultivationExp += randInt(50, 150); } },
];

// 生成NPC大世界事件：每月结束，所有在世 NPC 各生成 0-3 条动态剧情
// 优先触发关系剧情（父母/夫妻/妻妾/好友/仇敌/师徒/其他亲属），需先判定确有此人
function generateWorldEvents(npcs, gameDateText) {
  const events = [];

  for (const npc of npcs) {
    if (!npc.hp) npc.hp = { current: 50, max: 50 };
    if (!npc.attributes) npc.attributes = {};

    if (!npc.isAlive) continue;
    const count = randInt(0, 3);
    const isBaby = npc.age <= 3;

    for (let i = 0; i < count; i++) {
      // 0-3岁襁褓期：跳过关系互动，只生成婴幼儿专属记事
      if (isBaby) {
        const event = pickSoloEvent(npc);
        if (event) {
          const text = event.text(npc, npc.location);
          event.effect(npc);
          pushHistory(npc, `${gameDateText}·${npc.location}·${text}`);
          events.push({ npc: npc.name, text, type: 'solo' });
        }
        continue;
      }
      // 找同地点且有关系的 NPC（关系剧情优先，65%概率）
      const candidates = npcs.filter(n => n.id !== npc.id && n.isAlive && n.location === npc.location);
      const related = candidates
        .map(n => ({ n, rel: getRelation(npc, n) }))
        .filter(x => x.rel !== 'stranger');

      let pushed = false;
      if (related.length > 0 && chance(65)) {
        const pick = randChoice(related);
        const event = pickInteractionEvent(pick.rel);
        if (event) {
          const text = event.text(npc, pick.n, npc.location);
          event.effect(npc, pick.n);
          const note = `${gameDateText}·${npc.location}·${text}`;
          pushHistory(npc, note);
          pushHistory(pick.n, note);
          events.push({ npc: npc.name, other: pick.n.name, text, type: 'interaction', rel: pick.rel });
          pushed = true;
        }
      }

      if (!pushed) {
        const event = pickSoloEvent(npc);
        if (event) {
          const text = event.text(npc, npc.location);
          event.effect(npc);
          pushHistory(npc, `${gameDateText}·${npc.location}·${text}`);
          events.push({ npc: npc.name, text, type: 'solo' });
        }
      }
    }
  }

  return events;
}

function pickSoloEvent(npc) {
  const pool = [];

  // 0-3岁襁褓期：只触发婴幼儿专属记事（年龄与剧情相符）
  if (npc.age <= 3) return randChoice(BABY_EVENTS);

  // 副本秘境：NPC在副本中概率采集/偶遇妖兽（专属事件池）
  const { DUNGEON_LOCATIONS } = require('../data/locations');
  if (DUNGEON_LOCATIONS.includes(npc.location)) {
    return randChoice(DUNGEON_EVENTS);
  }

  // 按身份
  const identity = npc.realmLevel <= 1 ? 'mortal' : npc.realmLevel <= 6 ? 'cultivation' : 'demon';
  if (SOLO_BY_IDENTITY[identity]) {
    pool.push(...SOLO_BY_IDENTITY[identity]);
  }

  // 按职业（50%概率）
  const prof = npc.professionName || npc.profession;
  if (prof && SOLO_BY_PROFESSION[prof] && chance(50)) {
    pool.push(...SOLO_BY_PROFESSION[prof]);
  }

  // 按性格（40%概率）
  if (npc.personality && SOLO_BY_PERSONALITY[npc.personality] && chance(40)) {
    pool.push(...SOLO_BY_PERSONALITY[npc.personality]);
  }

  // 按年龄（30%概率）
  const ageGroup = npc.age <= 15 ? 'child' : npc.age <= 30 ? 'young' : npc.age <= 60 ? 'middle' : 'old';
  if (SOLO_BY_AGE[ageGroup] && chance(30)) {
    pool.push(...SOLO_BY_AGE[ageGroup]);
  }

  // 15岁以上专属性别事件库（男性/女性各20条，50%概率按性别随机触发）
  if (npc.age > 15 && npc.gender && SOLO_BY_GENDER[npc.gender] && chance(50)) {
    pool.push(...SOLO_BY_GENDER[npc.gender]);
  }

  if (pool.length === 0) return SOLO_BY_IDENTITY.mortal[0];
  return randChoice(pool);
}

function pickInteractionEvent(relation) {
  const pool = INTERACTION_EVENTS[relation] || INTERACTION_EVENTS.stranger;
  return randChoice(pool);
}

function getRelation(n1, n2) {
  // 检查亲属关系（三代内细分）
  const f1 = n1.family || {};
  const f2 = n2.family || {};
  // 优先按 id 判定父母；name 匹配仅在对应侧无 id（幽灵父母）时启用，
  // 避免"随机幽灵名与无关NPC重名"导致陌生人被误判为父母
  if ((f1.father && f1.father === n2.id) || (f1.mother && f1.mother === n2.id)) return 'parent';
  if ((f2.father && f2.father === n1.id) || (f2.mother && f2.mother === n1.id)) return 'child';
  if ((!f1.father && f1.fatherName && f1.fatherName === n2.name) || (!f1.mother && f1.motherName && f1.motherName === n2.name)) return 'parent';
  if ((!f2.father && f2.fatherName && f2.fatherName === n1.name) || (!f2.mother && f2.motherName && f2.motherName === n1.name)) return 'child';
  if (f1.spouse === n2.id || f2.spouse === n1.id) return 'spouse';
  if ((f1.wives || []).includes(n2.id)) return 'concubine';
  if ((f1.children || []).includes(n2.id) || (f2.children || []).includes(n1.id)) return 'child';
  if ((f1.siblings || []).includes(n2.id) || (f2.siblings || []).includes(n1.id)) return 'relative';

  // 师徒
  if ((n1.masterDisciple || {}).master === n2.id || (n2.masterDisciple || {}).disciple?.some(d => d.id === n1.id)) return 'disciple';
  if ((n2.masterDisciple || {}).master === n1.id || (n1.masterDisciple || {}).disciple?.some(d => d.id === n2.id)) return 'master';

  // 检查关系网
  const rel1 = n1.relations && n1.relations[n2.id];
  const rel2 = n2.relations && n2.relations[n1.id];
  const rel = rel1 || rel2;
  if (rel) {
    if (rel.type === '敌人' || rel.type === '仇人') return 'enemy';
    return 'friend';
  }
  // 已结识
  if (n1.knownByPlayer && n2.knownByPlayer) return 'friend';
  return 'stranger';
}

module.exports = {
  generateWorldEvents,
  SOLO_BY_IDENTITY, SOLO_BY_PROFESSION, SOLO_BY_PERSONALITY, SOLO_BY_AGE, SOLO_BY_GENDER,
  INTERACTION_EVENTS,
};
