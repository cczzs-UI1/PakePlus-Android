// ===== 子嗣/私生子/妻妾 弹窗剧情系统（需求批次：子嗣系统全面扩展）=====
const { randInt, randChoice, chance, clamp, genId, genderize } = require('./utils');

// 年龄分层：child(0-6) / youth(7-15) / adult(16+)
function ageStage(age) {
  if (age <= 6) return 'child';
  if (age <= 15) return 'youth';
  return 'adult';
}
const STAGES = ['child', 'youth', 'adult'];
const STAGE_NAME = { child: '幼年', youth: '少年', adult: '成年' };

// ============ 剧情库（每个按钮每个年龄层≥5种）============
const TALK = {
  child: [
    '你蹲下身来，{name}扑进你怀里，奶声奶气地说想你了。',
    '{name}仰着小脸问你："我什么时候能像您一样厉害呀？"',
    '{name}抓着一朵小花跑过来，踮起脚要送给你。',
    '{name}午睡刚醒，揉着眼睛跑来找你，黏着你讲了个故事才肯罢休。',
    '{name}奶声奶气地学着你的口吻说话，逗得周围人都笑了。',
    '{name}悄悄把珍藏的糖果塞进你手里，说是偷偷留给你的。',
  ],
  youth: [
    '{name}正捧着书卷研读，见你来了，起身行礼，眼神中带着少年人的热切。',
    '{name}跟你讲起近日修炼的困惑，你耐心指点，{name}若有所思地点点头。',
    '{name}兴冲冲地跑来，说今天在演武场打赢了同门，想听你夸一句。',
    '{name}低头摆弄着手里的法器，小声说想跟你出门历练见见世面。',
    '{name}问你外面的世界是什么样的，眼里满是向往。',
    '{name}犹豫半晌，终于鼓起勇气，向你说出藏在心里很久的一个请求。',
  ],
  adult: [
    '{name}与你对坐饮茶，说起近日见闻，言语间已有了几分沉稳气象。',
    '{name}向你请教修行上的疑惑，你与对方论道良久，彼此都有收获。',
    '{name}说近日在坊市结识了几位同道，想听听你的看法。',
    '{name}默默为你斟茶，关切地问你近来是否安好。',
    '{name}与你谈起家族前程，言语恳切，显然思虑已久。',
    '{name}提议与你结伴去某处秘境历练，说想多学些本事。',
  ],
};

const GIFT = {
  child: [
    '你给了{name}一份小点心，{name}高兴得眼睛都亮了，甜甜地道了谢。',
    '你送给{name}一只木雕小兽，{name}爱不释手，晚上睡觉都要抱着。',
    '{name}收到你的礼物，开心得蹦了起来，抱着你的腿蹭了又蹭。',
    '你把一枚灵果递给{name}，{name}小口小口地啃着，一脸满足。',
    '{name}小心翼翼地把礼物收进怀里，说这是最珍贵的宝贝。',
  ],
  youth: [
    '你赠给{name}一件趁手的物件，{name}郑重道谢，说会好好珍惜。',
    '{name}收到礼物后爱不释手，当晚就琢磨着怎么用。',
    '你送{name}一瓶丹药，{name}惊讶地睁大眼睛，连声道谢。',
    '{name}接过礼物，耳根微红，低声说了句"谢谢"。',
    '{name}仔细端详着你的礼物，眼里闪着光，说将来也要回报你。',
  ],
  adult: [
    '你赠予{name}一件宝物，对方郑重收下，道："厚恩不敢忘。"',
    '{name}接过你的礼物，微微动容，说会将其作为传家之物珍藏。',
    '你送{name}一份修炼资源，对方躬身谢过，眼中多了几分亲近。',
    '{name}收下礼物，沉吟片刻，说日后定当全力回报。',
    '你赠{name}一卷功法，对方如获至宝，当场就要研读。',
  ],
};

const SPAR = {
  child: [
    '你陪{name}玩闹式地比划了几下，{name}咯咯直笑，缠着你不肯停。',
    '{name}学着你挥拳，小胳膊小腿舞得虎虎生风，可爱极了。',
    '你让{name}打你手心，{name}使足了力气，还得意地扬起小脸。',
    '{name}模仿你修炼的动作，有模有样，逗得你忍俊不禁。',
    '你抱着{name}转了几圈，{name}开心地喊"再来一次！"',
  ],
  youth: [
    '你和{name}切磋了几个回合，{name}招式虽稚嫩，胜在肯下功夫。',
    '{name}与你过招，被你的巧劲带了个趔趄，却也不恼，反而更来了精神。',
    '切磋中你点拨了{name}几处破绽，{name}若有所思，认真记下。',
    '{name}使尽浑身解数与你对练，虽落了下风，但那股不服输的劲让你欣慰。',
    '你陪{name}练了一套拳，{name}气息虽乱，却兴奋地说找到了感觉。',
  ],
  adult: [
    '你与{name}切磋一番，双方都尽了全力，结束后相视一笑。',
    '{name}的招式已颇见火候，与你过招竟能拆解数合，你暗自欣慰。',
    '切磋中你指点了{name}一处关键，对方茅塞顿开，连声道谢。',
    '{name}与你比斗半晌，虽败下阵来，却豪迈道："下次定要讨教回来！"',
    '你与{name}论武切磋，各有领悟，都觉受益匪浅。',
  ],
};

const STEAL = {
  child: [
    '{name}悄悄翻你的储物袋，被逮个正着，{name}眨巴着眼睛装无辜。',
    '{name}偷偷拿了你一枚灵果，被发现后低着头，小声说"我错了"。',
    '{name}偷穿你的法袍，拖着长长的衣摆在屋里走来走去，被撞个正着。',
    '{name}想偷藏你的法器玩，结果拿不动，一屁股坐在地上。',
    '{name}趁你不注意偷吃丹药，被辣得直吐舌头，眼泪汪汪。',
  ],
  youth: [
    '{name}趁你不备翻你的东西，被你撞见，涨红了脸连连摆手。',
    '{name}偷拿了你的灵石，被发现后支支吾吾，最终老实交代。',
    '{name}想偷学你的功法口诀，被你发现，讪讪地摸了摸鼻子。',
    '{name}偷看你藏的秘籍，被逮住后满脸通红，保证再也不犯。',
    '{name}摸走了你一件小物件，转身却舍不得丢，被你寻到。',
  ],
  adult: [
    '{name}试图从你身上顺走一件东西，手法却还欠火候，被你识破。',
    '{name}翻你的行囊被撞见，神色坦然道："只是看看，绝无他意。"',
    '{name}手脚不干净，偷了你的东西，被发现后却振振有词。',
    '{name}想盗取你的丹药，被当场拿住，面上却毫无悔意。',
    '{name}潜进你的库房翻找，被你撞破，气氛一时僵住。',
  ],
};

const FIGHT = {
  child: [
    '{name}跟你闹别扭，气鼓鼓地朝你扔了个果子，转身就跑。',
    '{name}不知为何生了气，挥舞着小拳头要"打你"，却软绵绵的没有力道。',
    '{name}气冲冲地跟你对峙，眼眶却红了，没两下就扑进你怀里哭。',
    '{name}因为玩具被抢而闹脾气，朝你撒泼打滚。',
    '{name}学人家打架的架势，张牙舞爪地冲你比划，自己被自己逗笑了。',
  ],
  youth: [
    '{name}不知何故与你起了争执，少年心性，竟然拔剑相向。',
    '{name}愤愤地朝你出手，被你轻易格开，脸上犹带不甘。',
    '{name}与你交手数招，落了下风，咬咬牙还要再上。',
    '{name}因为理念不合与你动了手，被制住后梗着脖子不说话。',
    '{name}一时冲动与你打了起来，打到一半却自己先红了眼眶。',
  ],
  adult: [
    '{name}与你话不投机，竟动了真怒，向你出手。',
    '{name}因故与你反目，拳脚相向，不留情面。',
    '{name}与你交手，招招狠辣，显然积怨已深。',
    '{name}拔剑指向你，冷声道："得罪了。"随即攻来。',
    '{name}与你大战一场，双方都挂了彩，气氛剑拔弩张。',
  ],
};

// 欢好剧情（限成年，5方向；每条按主控性别分男女双版：男版对象用"她"，女版对象用"他"）
const LOVE = {
  gentle: [
    (p, c) => p.gender === '女' ? '烛影摇红，{name}将你拢在怀中，揉捏着你的酥胸，手伸进你的穴中抽插不停地带出淫水，极尽缠绵。' : '烛影摇红，{name}依偎在你怀中，你揉捏着她的酥胸，手伸进的穴中抽插不停地带出淫水，极尽缠绵。',
    (p, c) => p.gender === '女' ? '{name}握住你的手，目光温柔，这一夜缠绵悱恻，彼此都动了真情。' : '{name}拉着你的手放进小穴中，声音妩媚，眼波流转，求着你快些让她爽到，你将她压在身下肆意玩弄。',
    (p, c) => p.gender === '女' ? '月下花前，{name}与你相拥，身心交融，事后靠在你怀中轻声说着情话。' : '月下花前，{name}与你相拥，身心交融，事后枕着你的肩头轻声说着情话。',
    (p, c) => p.gender === '女' ? '{name}贴着你的耳边低语，这一夜极尽温柔，醒来时你还靠在他臂弯里。' : '{name}贴在你耳边低语，这一夜极尽温柔，醒来时她还在你臂弯里。',
    (p, c) => '{name}与你十指相扣，共赴巫山，云雨之后，两人静静相拥，谁也没说话。',
  ],
  coax: [
    (p, c) => p.gender === '女' ? '你软语哄着{name}，他半推半就地解下了衣物，让你推到在床上，鸡巴因你的玩弄高高翘起，你笑着将鸡巴放入穴中重重坐下，一直玩到第二日。' : '你软语哄着{name}，她半推半就地依了你，躺在床上让你舔着小穴，浑身羞红，高潮时更是慌乱地捂着自己的嘴。',
    (p, c) => '你花言巧语，把{name}哄得晕晕乎乎，稀里糊涂就与你成就了好事。',
    (p, c) => '你百般讨好，{name}经不住你的缠磨，终究遂了你的意。',
    (p, c) => p.gender === '女' ? '你说尽好话，{name}又羞又恼，却还是被你的软语打动。' : '你说尽好话，{name}又羞又恼，却还是被你的花言巧语打动。',
    (p, c) => p.gender === '女' ? '你哄得{name}心花怒放，他红着脸应了你，这一夜温存缱绻。' : '你哄得{name}心花怒放，她红着脸应了你，这一夜温存缱绻。',
  ],
  force: [
    (p, c) => p.gender === '女' ? '你强行扒开他的衣肆意玩弄他，他不停地挣扎却还是被你玩地鸡巴翘起，淫声连连，事后冷冷地看着你，眼里满是恨意。' : '你强行绑住{name}，将她双腿分开直接插入，她直接哭了出来，却仍咬着嘴唇不出声，你继续抽插直到她高潮再也忍不住叫出声，事后看着你眼里满是恨意。',
    (p, c) => p.gender === '女' ? '{name}奋力反抗，终究不敌，被你得逞后，他咬紧嘴唇，一言不发。' : '{name}奋力反抗，终究不敌，被你得逞后，她咬紧嘴唇，一言不发。',
    (p, c) => p.gender === '女' ? '你不顾{name}的挣扎强要了他，事后他背过身去，肩膀微微发抖。' : '你不顾{name}的挣扎强要了她，事后她背过身去，肩膀微微发抖。',
    (p, c) => '{name}被你制住，动弹不得，只得任你施为，眼中满是屈辱。',
    (p, c) => p.gender === '女' ? '你仗着修为强行占有了{name}，他咬着牙，眼里蓄满了泪。' : '你仗着修为强行占了{name}的身子，她咬着牙，眼里蓄满了泪。',
  ],
  threaten: [
    (p, c) => '你以言语相胁，{name}脸色煞白，颤抖着依了你解下衣物，让你随意玩弄，事后对你愈发疏远。',
    (p, c) => p.gender === '女' ? '你威胁要断了{name}的修炼资源，他权衡之下，忍辱应了你。' : '你威胁要断了{name}的修炼资源，她权衡之下，忍辱应了你。',
    (p, c) => p.gender === '女' ? '你拿{name}在意的人要挟，他含泪从了你，心中却埋下了恨。' : '你拿{name}在意的人要挟，她含泪从了你，心中却埋下了恨。',
    (p, c) => '你放出狠话，{name}瑟缩了一下，最终还是顺从了你。',
    (p, c) => '你以逐出家门相胁，{name}沉默良久，终究还是跪下为你口交，祈求你不要这样对他。',
  ],
  halfpush: [
    (p, c) => p.gender === '女' ? '{name}嘴上说着不要，身子却不自觉地靠了过来，这一夜半推半就。' : '{name}嘴上说着不要，身子却不自觉地靠近了你，这一夜半推半就。',
    (p, c) => p.gender === '女' ? '{name}被你环住，象征性地挣了几下，便也由着你去了。' : '{name}被你抱住，象征性地推拒了几下，便也由着你去了。',
    (p, c) => '{name}面红耳赤地推你，力道却软绵绵的，最后顺从地依了你。',
    (p, c) => p.gender === '女' ? '{name}羞恼地骂你"轻浮"，却也没真的推开你，这一夜温情脉脉。' : '{name}羞恼地骂你"登徒子"，却也没真的推开你，这一夜温情脉脉。',
    (p, c) => '{name}半是嗔怪半是默许，半推半就之间，两人成就了好事。',
  ],
};

// 私生子请求收留（需求：动作/神态/语言/称呼丰富）
const BASTARD_ASK = [
  '{name}怀抱着襁褓中的婴儿，在府门外踌躇良久，终于叩响门环。你开门时，她眼眶微红，声音发颤："这孩子是你的骨血……我实在养不起了，求你看在一夜情分上，收留这孩子吧。"说罢，将孩子往你怀里一送，别过头去，肩头轻轻耸动。',
  '{name}顶着寒风抱着孩子寻上门来，脸颊冻得发白，语气疲惫而恳切："这孩子跟着我只会受苦。你若还念旧情，便收了；若不肯，我便只能……"话未说完，她低头吻了吻孩子的额头，泪珠无声滚落。',
  '{name}站在门外，怀里是刚出生不久的婴儿，她/他望着你，眼中带着恳求和几分愧疚："孩子毕竟是你的血脉，跟着我这个没本事的人，怕是要荒废了根骨。你收下吧，就当……就当可怜我们娘俩。"',
  '一个面容憔悴的女子抱着婴儿寻来，见了你声音沙哑："这孩子是你的血脉，我生下他便已耗费了大半精力，你若愿意希望能留下他好好安置。"',
  '{name}寻到你面前，把孩子往你手中一递，眼眶通红，却强撑着笑道："这是你的孩子，你要还是不要？若是要，便好好待这孩子；若是不要……我便抱走，此生再不提这事。"',
];

// 未被接回府的子嗣：请求归家（需求：动作/神态/语言/称呼丰富）
const RETURN_HOME = [
  '{name}站在你家府门外，踌躇了半晌，终于鼓起勇气上前叩门。门开时，{name}低着头，攥着衣角，半晌才轻声道："……我想回家。"话音未落，眼眶已微微泛红。',
  '{name}托人递来一封亲笔信，信中字迹工整却带着几分忐忑："近来常梦到府中的灯火，恳请您允我归家，日后定当晨昏定省，侍奉膝下。"',
  '{name}远远望着你的府邸，目光在门匾上停留许久，嘴唇翕动了几下，终究没有上前，只默默站了一炷香，才转身离去，背影有些萧索。',
  '{name}寻了个由头登门，说是路过讨杯茶喝。言语间几次欲言又止，指尖无意识地摩挲着杯沿，最终也只是笑了笑，说声"打扰了"便告辞而去。',
  '{name}在门外徘徊许久，来来回回走了好几趟，才终于叩响门环。见到你的那一刻，鼻尖一酸，声音哽咽："我……我想回家了。"',
];

// 府外张望
const PEEK = [
  '有人看见{name}在府门外徘徊，远远张望着，却始终没有进来。',
  '{name}偷偷躲在巷口，望着你家的大门，神情落寞。',
  '下人禀报，说{name}在府外转了好几圈，最终又走了。',
  '{name}站在墙外，听着府内的动静，好一会儿才默默离去。',
  '守门人看见{name}在门外站了许久，想进门又不敢，最后叹着气走了。',
];

// 怨恨主控
const RESENT = [
  '{name}在背地里与人说起你，语气愤恨："他何曾把我当子女看过？"',
  '{name}愤愤道："既然不要我，又何必生我！"',
  '{name}对身边的人说，宁可在外面流浪，也不愿再回那个家。',
  '{name}恨声道："我这一生，最恨的便是那个抛下我的人。"',
  '{name}写下怨怼之语，说此生与那个家恩断义绝。',
];

// 妻妾日常
const CONCUBINE_DAILY = [
  '{name}正在院中侍弄花草，见你来了，柔柔一笑，起身行礼。',
  '{name}亲手煮了一盏茶，端到你面前，温声道："尝尝我的手艺。"',
  '{name}在房中抚琴，琴声悠扬，见你驻足，微微颔首。',
  '{name}正对着铜镜梳妆，见你进来，脸颊微红，垂下眼帘。',
  '{name}在廊下赏雪/观雨，见你走近，转头朝你展颜一笑。',
  '{name}缝制了一件衣裳，针脚细密，说是给你做的。',
];

// 妻妾告状（需求：动作/神态/语言/称呼丰富）
const CONCUBINE_TATTLE = [
  '{name}袅袅婷婷地走进来，朝你行了一礼，眼眶泛红："妾身特来您做主。{target}今日当着下人的面言语冲撞妾身，说妾身不过是狐媚惑主。妾身受些委屈倒罢了，只是怕坏了府里的名声。"说着，用帕子拭了拭眼角。',
  '{name}气冲冲地来见你，胸口微微起伏："您给评评理！{target}今日抢了妾身的份例，还说妾身不配用那些好东西。妾身与她理论，她反倒要妾身好看！"，咬着唇，眼中满是不忿。',
  '{name}低声诉道："{target}在背后说妾身的闲话，说什么「不过是个通房抬上来的」。被妾身撞见，两人便争执了几句。妾身不想惹事，可{target}句句戳人心窝子……"说着说着，声音便低了下去。',
  '{name}跪在你面前，泪眼婆娑："爷，妾身实在活不下去了。{target}仗着位分高，处处欺压妾身，今日更是当着众人的面让妾身下不来台。求爷为妾身做主，不然妾身日后在府中怕是要寸步难行了。"',
  '{name}掀起衣袖给你看，腕上一道红痕触目惊心："爷请看，这是{target}今日与妾身动手留下的。妾身忍气吞声惯了，可这次实在太过分，妾身只能来求爷做主。"',
];

// 妻妾勾引
const CONCUBINE_SEDUCE = [
  '{name}换上轻薄纱衣，倚在门边，眼波盈盈地望着你。',
  '{name}寻了个由头与你独处，言语间带着几分挑逗。',
  '{name}借着酒意靠在你身上，吐气如兰，明示暗示都有。',
  '{name}在浴后披着湿发来见你，一举一动都带着撩拨的意味。',
  '{name}邀你对酌，一杯一杯地劝酒，眼神越来越柔。',
];

// 看望私生子/流落在外的庶子女（需求：动作/神态/语言/称呼丰富，需先判定NPC存在）
const VISIT_BASTARD = [
  '你寻到{name}的住处时，{name}正在檐下读书。见你来了，{name}怔了怔，手中书卷险些落地，片刻才局促地起身行礼，声音微哑："您……您怎么来了？"你打量着{name}的居所，简陋却整洁，心头不觉一软。',
  '{name}见到你，眼睛先是一亮，又飞快地垂下眼帘，攥着衣角低声问："您……是来接我回家的吗？"问完又自嘲地笑了笑，"我随口问问，您别当真。"你看着{name}，一时竟不知如何作答。',
  '你远远看见{name}在巷口卖些山货，见你走近，{name}慌乱地擦了擦手，又怕你嫌弃，退后半步，勉强笑道："这地方腌臜，您别站这儿……"你问他过得好不好，{name}沉默片刻，轻声说："挺好的，您放心。"',
  '{name}正在院里劈柴，见你来了，动作一顿，斧头悬在半空。{name}抿了抿唇，把斧子放下，拍了拍手上的木屑，低声道："您来了。"顿了顿，又问，"……要不要进屋喝杯茶？"',
  '{name}隔着门缝看见你，先是惊喜，随即又像是想起了什么，神色黯淡下来，把门开了一半，攥着门框，轻声问："{name}，您来……是有事吗？"',
];

// 看望被遗弃子（无扶养人，流落在外）
const VISIT_ABANDONED = [
  '在破庙的角落里找到{name}，{name}蜷在一堆干草中，衣襟上沾着泥点，睡得却还算安稳。你轻轻替{name}掖了掖被角，他惊醒过来，看清是你，先是一喜，随即又紧紧抿住嘴，别过头去，肩头微微发抖。',
  '{name}正蹲在街边啃着一块干硬的饼，见到自己，猛地站起来，把饼藏到身后，脸上挤出笑："您怎么来了？"你递过去一袋银两，他盯着看了许久，才哑声道："……我不需要施舍。"却还是没忍住，红了眼眶。',
  '{name}靠在墙根晒着太阳，身上衣衫单薄。见你走近，他下意识往阴影里缩了缩，眼神里带着警惕和一丝说不清的期待："您是来找我的？"你点了点头，他沉默良久，轻声问："……这次，还要丢下我吗？"',
  '你找到{name}时，他正被几个野孩子围着哄笑。他咬着牙，倔强地不肯示弱，却在你出现的瞬间，眼底的光一下子软了下来。人群散去后，他望着你，声音有些发哽："我以为……您早就不记得我了。"',
  '{name}在桥洞下生了堆火，见你蹲下身来，火光映着他的脸，忽明忽暗。他笑了下，笑意却没到眼底："外面风大，您快些回去吧。"你问他冷不冷，他愣了半天，才轻声说："……有时候，是有点冷。"',
];

// 偷奸（与已婚女子暗中相会，女性触发怀孕判定；需先判定NPC存在）
const STEAL_LOVE = [
  '你趁着四下无人，寻到{name}的住处。她见你深夜来此，先是一惊，随即压低声音道："你好大的胆子，{husband}就在隔壁，你也敢来！"话虽如此，她眼中却漾着一层说不清道不明的波澜，犹豫片刻，终究侧身将你让了进去，进门后带你来到床边，缓慢脱去衣物，只见她的小穴早已淫水泛滥，拉着你的手插入小穴，触感湿滑紧致，随着你的动作发出阵阵呻吟......，结束后她依依不舍地送你离开。',
  '{name}与你约定在后园假山后相见。她来时裹着一件披风，披风被掀起，只见里面一件未穿，她夹着腿羞红着脸："愣着做甚，我的小穴可难受了，来嘛。"话音未落，你将她搂住，脸埋在胸上一轻一重的啃咬，手插进穴中，对方保住你双腿缠上你的腰迎合，嗯嗯啊啊看着爽到极致了，穴水蹭了你一身。',
  '你在{name}常去的街角候着她。她远远看见你，脚步一顿，左右张望一番，才快步走来，嗔道："你不要命了？{husband}若是撞见……"说着说着声音却低了下去，指尖轻轻勾了勾你的袖子，到底还是跟你走了。',
  '{name}借着出门采买的由头与你相会。她压低了帷帽，声音又轻又软："只此一次，往后莫要再寻我了。"可当你的手摸进她的小穴时却摸到一硬物，她尽然在穴中塞了一玉柄，穴水早已顺着腿滑下，她软软地嗯了一声，靠着你身上，媚眼如丝地求你帮她。',
  '你与{name}在客栈厢房相会。她摘下斗笠，露出一张因紧张而泛红的脸，咬着唇道："{husband}若是知道，非打断我的腿不可……"话虽如此，她却没有半分要走的意思，只抬手解开外衣露出内衫，隐约可见里面的酥胸和穴口，见你不动，了然地坐在桌子上掰开小穴拿起茶壶将壶口插进去，茶水顺着大腿流出，她娇媚地呼唤你："帮帮我嘛，好难受~"，你看够了才走近低头看着泛滥的穴口，低头喊住，将茶水尽数吸尽，惹的对方淫叫连连。"',
];

// 偷奸（女版：与已婚男子暗中相会——女方向，供NPC记事女偷男及女修主动偷情使用）
const STEAL_LOVE_F = [
  '你趁着四下无人，寻到{name}的住处。他见你深夜来此，先是一惊，随即压低声音道："你好大的胆子，{husband}就在隔壁，你也敢来！"话虽如此，他眼中却漾着一层说不清道不明的波澜，犹豫片刻，终究侧身将你让了进去，进门后环抱住你的腰，手往衣服里探去，你顺从地让他褪去你的衣物，躺在他的婚房上，他喉结滚动，将衣物褪去，鸡巴早已高高翘起，你看着那尺寸心中更加满意，淫水也流了出来，瘙痒难耐，"好郎君快进来吧"他将鸡巴狠狠装进你的穴里，你爽的淫叫出声，他开始不断抽插，淫水随着抽插不断溅出，也越撞越深......，终于你们感觉到了临界点，他狠狠将精液射进你的体内，你被冲得也夹紧小穴喷出淫水，事毕你们抱着入眠。',
  '{name}与你约定在后园假山后相见。他来时裹着一件披风，眉眼藏在阴影里，气息却微微发乱："你……你莫要声张，只当没这回事。"话音未落就被你拽进假山，你骑在他身上将他的衣物剥去，未被衣物遮挡的鸡巴高高翘起，你看得淫水直流，褪去自己的衣物对准鸡巴坐了下去，他没忍住发出来淫叫又飞快捂住自己的嘴，你起了坏心快速起落，惹得他不停发出呻吟，浑身羞红，你也爽得淫水直流......直到结束后你揉着腰回到宅子，穴口仍在不停地留着精液。',
  '你在{name}常去的街角候着他。他远远看见你，脚步一顿，左右张望一番，才快步走来，嗔道："你不要命了？{husband}若是撞见……"说着说着声音却低了下去，指尖轻轻勾了勾你的腰带拉着你进了巷子深处，只见他跪在你面前，将脸埋在你腿间，不停的啃舔，你被刺激的流出更多的水，终于你受不了了将他推倒，震碎他的衣物，将那早已变得粗壮的鸡巴塞进穴里，他懂事地抱起你不停地抽插直到你们一同高潮，事后你们若无其事地从巷子里走出。，',
  '{name}借着出门办事的由头与你相会。他压低了斗笠，声音又轻又软："只此一次，往后莫要再寻我了。"可当你的手搭上他腰间时，却见他腿间早已突起，你笑着将他压在墙上，手塞进他的嘴里搅动，又将他的衣服半褪将鸡巴握住，"想要吗，求我呀"，他口齿不清的求着你"求求你，让我爽吧"，你也不再忍受将鸡巴塞进穴里感受这它的粗壮，他被你刺激的直接射了出来，而后又立刻崛起，你不断抽插着身体也越来越热......你们都高潮后你又让他将你舔干净，一点不许剩。',
  '你与{name}在客栈厢房相会。他脱去衣物，露出一张因紧张而泛红的身体，咬着唇道："莫要让{husband}知道，否则……"说话间，他的鸡巴不断变粗，你让他抱起你带你到床上，你蒙着直接的眼让他随便来，你感受着他在你身上不断轻舔，鸡巴不断蹭过穴口但不进去，你刺激的身体拱起让他快点进来，玩弄了数时后他终于狠狠插进去，数次抽插后你们一同高潮并沉沉睡去，第二日特点鸡巴仍然在你的穴中......',
];

// 惩罚剧情（告状后）
const PUNISH_OPTIONS = [
  { key: 'rank', name: '降位分', text: '你沉声道："既不知收敛，便降你位分，以儆效尤。"{target}脸色一白，跪下领罚，眼中却藏着怨怼。' },
  { key: 'kneel', name: '罚跪', text: '你命{target}在院中夹着玉柄跪足两个时辰。{target}羞愤地跪着，府中上下都看在眼里。' },
  { key: 'scold', name: '口头训斥', text: '你当众训斥了{target}一番。{target}低着头应了，面上却不太服气。' },
];
const APPEASE_TEXT = '你温言安抚了{name}，又各赏了两人，劝她们以和为贵。{target}虽不情愿，也只得作罢。';
const REPRIMAND_TEXT = '你把两人都叫来训斥了一顿，各打了五大板。两人都低了头，不敢再闹。';

// ===== 子嗣随机记事库（按年龄/是否接回府/好感）=====
function randomChildJournal(child, player, adopted) {
  const stage = ageStage(child.age);
  const pool = [];
  if (stage === 'child') {
    pool.push(
      `${child.name}在宅中追着一只蝴蝶跑，摔了一跤，爬起来又接着追。`,
      `${child.name}学会了新词，逢人便显摆，奶声奶气惹人发笑。`,
      `${child.name}夜里做了噩梦，哭着醒来，好一会儿才被哄好。`,
      `${child.name}偷偷学着大人的样子打坐，没一会儿就睡着了。`,
      `${child.name}跟府里的小丫鬟玩捉迷藏，躲进了衣柜里。`,
    );
  } else if (stage === 'youth') {
    pool.push(
      `${child.name}晨起练功，一招一式都有板有眼。`,
      `${child.name}与好友结伴去集市，买了些零嘴回来。`,
      `${child.name}在书房研读古籍，读到精彩处抚掌大笑。`,
      `${child.name}与同龄人比试，赢了便眉飞色舞，输了便闷头苦练。`,
      `${child.name}偷偷练了套新法术，想给你一个惊喜。`,
    );
  } else {
    pool.push(
      `${child.name}闭关数日，出关时气息沉稳了几分。`,
      `${child.name}与同道论道，颇有心得。`,
      `${child.name}出外历练，带回一些稀罕物事。`,
      `${child.name}在坊市与人交易，做了一笔不错的买卖。`,
      `${child.name}静坐时顿悟，心境有所进益。`,
    );
  }
  if (adopted && player) {
    pool.push(
      `${child.name}在府中安住，晨昏定省，礼数周全。`,
      `${child.name}常与府中兄弟姐妹相处，渐渐熟络起来。`,
      `${child.name}得你指点修行，进展颇顺。`,
      `${child.name}在厢房中安顿下来，日子过得安稳。`,
    );
  }
  if (child.favorWithPlayer >= 50) {
    pool.push(`${child.name}提起你时满脸孺慕，说你是世上最好的父亲/母亲。`);
  } else if (child.favorWithPlayer < 0) {
    pool.push(`${child.name}提起你时脸色阴沉，显然积怨已深。`);
  }
  let picked = randChoice(pool);
  // 称呼随主控性别统一（家长称呼），他/她按子嗣性别
  if (player) {
    if (player.gender === '女') {
      picked = picked.replace(/爹爹\/娘亲/g, '娘亲').replace(/父亲\/母亲/g, '母亲').replace(/爹\/娘/g, '娘').replace(/父\/母/g, '母');
    } else {
      picked = picked.replace(/爹爹\/娘亲/g, '爹爹').replace(/父亲\/母亲/g, '父亲').replace(/爹\/娘/g, '爹').replace(/父\/母/g, '父');
    }
  }
  return genderize(picked, child);
}

// ===== 逻辑函数 =====

// 子嗣交互：返回 {msg, effect, journal}
function childAct(player, child, action, opts = {}) {
  const stage = ageStage(child.age);
  if (!child.relations) child.relations = {};
  const rel = child.relations[player.id] || (child.relations[player.id] = { type: player.gender === '女' ? '母' : '父', favor: child.favorWithPlayer || 50 });
  const favor = rel.favor;
  let msg = '', journal = '', favorDelta = 0;

  if (action === 'talk') {
    const pool = TALK[stage] || TALK.adult;
    msg = randChoice(pool).replace(/\{name\}/g, child.name);
    favorDelta = randInt(2, 6);
    journal = `与${child.name}交谈，好感+${favorDelta}。`;
  } else if (action === 'gift') {
    const itemName = opts.itemName;
    if (!itemName) return { error: '请选择要赠送的物品' };
    const item = (player.inventory || []).find(i => i.name === itemName && i.count > 0);
    if (!item) return { error: `背包中没有${itemName}` };
    item.count--;
    const pool = GIFT[stage] || GIFT.adult;
    msg = randChoice(pool).replace(/\{name\}/g, child.name) + `（${itemName}×1）`;
    favorDelta = randInt(5, 12);
    journal = `赠${child.name}${itemName}，好感+${favorDelta}。`;
  } else if (action === 'spar') {
    const pool = SPAR[stage] || SPAR.adult;
    msg = randChoice(pool).replace(/\{name\}/g, child.name);
    favorDelta = randInt(2, 7);
    journal = `与${child.name}切磋，好感+${favorDelta}。`;
  } else if (action === 'steal') {
    const pool = STEAL[stage] || STEAL.adult;
    msg = randChoice(pool).replace(/\{name\}/g, child.name);
    const caught = chance(70);
    if (caught) {
      favorDelta = -randInt(5, 12);
      journal = `${child.name}偷窃被识破，好感-${-favorDelta}。`;
    } else {
      // 偷窃成功：随机顺走玩家一样东西
      const inv = (player.inventory || []).filter(i => i.count > 0);
      if (inv.length) {
        const stolen = randChoice(inv);
        stolen.count--;
        msg += ` 你事后发现少了${stolen.name}。`;
        journal = `${child.name}偷走了你的${stolen.name}。`;
      } else {
        msg += ' 不过什么也没顺走。';
        journal = `${child.name}试图偷窃，但一无所获。`;
      }
    }
  } else if (action === 'fight') {
    const pool = FIGHT[stage] || FIGHT.adult;
    msg = randChoice(pool).replace(/\{name\}/g, child.name);
    // 战斗结算：按修为对比
    const pl = player.realmLevel || 1, cl = child.realmLevel || 1;
    if (chance(Math.max(20, 80 - (cl - pl) * 20))) {
      favorDelta = -randInt(3, 8);
      journal = `与${child.name}交手获胜，好感-${-favorDelta}。`;
      if (child.hp) child.hp.current = Math.max(1, child.hp.current - randInt(5, 15));
    } else {
      favorDelta = -randInt(8, 15);
      journal = `与${child.name}交手落败，好感-${-favorDelta}。`;
      if (player.hp) player.hp.current = Math.max(1, player.hp.current - randInt(10, 25));
    }
  } else if (action === 'love') {
    if (stage !== 'adult') return { error: `${child.name}还未成年，不可行此事` };
    // 按好感与关系选方向
    let dir;
    if (favor >= 80) dir = randChoice(['gentle', 'coax', 'halfpush', 'gentle']);
    else if (favor >= 50) dir = randChoice(['coax', 'halfpush', 'gentle']);
    else if (favor >= 20) dir = randChoice(['coax', 'halfpush', 'force', 'threaten']);
    else dir = randChoice(['force', 'threaten']);
    const pool = LOVE[dir] || LOVE.halfpush;
    const pick = randChoice(pool);
    msg = (typeof pick === 'function' ? pick(player, child) : pick).replace(/\{name\}/g, child.name);
    const dirName = { gentle: '依恋', coax: '哄骗', force: '强行', threaten: '威胁', halfpush: '半推半就' }[dir];
    journal = `与${child.name}欢好（${dirName}），${favor >= 0 ? '好感+' + randInt(2, 8) : '好感-' + randInt(2, 8)}。`;
    favorDelta = favor >= 0 ? randInt(2, 8) : -randInt(2, 8);
    // 怀孕判定（异性且成年女性）
    if (player.gender !== child.gender) {
      const female = player.gender === '女' ? player : child;
      const male = player.gender === '男' ? player : child;
      if (female.gender === '女' && !female.isPregnant && female.age >= 16 && female.age <= 45) {
        const { tryConceive } = require('./family');
        const tr = tryConceive(male, female, null);
        if (tr.success) {
          msg += ` 事后${female === player ? '你' : child.name}有了身孕！`;
          journal += ' 怀有身孕！';
        }
      }
    }
  } else if (action === 'returnHome') {
    // 接回府：按好感概率同意/拒绝
    const agree = chance(Math.max(20, Math.min(95, 50 + favor)));
    if (agree) {
      msg = `${child.name}眼中亮了起来，点了点头，终于跟你回了家。`;
      journal = `${child.name}同意回到府中。`;
      child.guardian = player.id;
      child.guardianName = player.name;
      child.location = player.location;
      rel.favor = Math.min(100, rel.favor + 10);
      return { msg, journal, accepted: true, favorDelta: 10, adopt: true };
    } else {
      msg = `${child.name}沉默片刻，摇了摇头："我还没想好……让我再想想。"`;
      journal = `${child.name}拒绝了回府。`;
      return { msg, journal, accepted: false, favorDelta: -2, adopt: false };
    }
  }

  rel.favor = clamp(rel.favor + favorDelta, -100, 100);
  child.favorWithPlayer = rel.favor;
  // 需求：称呼随主控性别统一（爹爹/娘亲、父亲/母亲、爹/娘、父/母）——家长称呼先按主控性别
  if (player.gender === '女') {
    msg = msg.replace(/爹爹\/娘亲/g, '娘亲').replace(/父亲\/母亲/g, '母亲').replace(/爹\/娘/g, '娘').replace(/父\/母/g, '母');
  } else {
    msg = msg.replace(/爹爹\/娘亲/g, '爹爹').replace(/父亲\/母亲/g, '父亲').replace(/爹\/娘/g, '爹').replace(/父\/母/g, '父');
  }
  // 需求：剧情指代按子嗣性别判定（他/她、亲女/亲儿，男性用他，女性用她）
  msg = genderize(msg, child);
  return { msg, journal, favorDelta, favor: rel.favor };
}

// 私生子收留处理
function adoptBastard(player, child, mother, gameState, adopt) {
  if (adopt) {
    child.guardian = player.id;
    child.guardianName = player.name;
    child.legitimacy = '庶子女'; // 从私生子女变为庶子女
    child.location = player.location;
    // 收入府
    const { initMansion, assignChildRoom } = require('./mansionSystem');
    const m = initMansion(player);
    if (!m.children) m.children = [];
    if (!m.children.includes(child.id)) m.children.push(child.id);
    assignChildRoom(player, child); // 安排入住对应性别厢房（左厢房/右厢房）
    if (!child.family) child.family = {};
    if (player.gender === '女') { child.family.mother = player.id; }
    else { child.family.father = player.id; }
    const msg = genderize(`你将${child.name}接入府中，认作${player.gender === '女' ? '亲女/亲儿' : '亲儿/亲女'}抚养。从此便是府中的子女。`, child);
    return { msg, adopted: true };
  } else {
    // 置之不理：对方随机处理（可能自己养/遗弃）
    const roll = randInt(1, 3);
    if (roll === 1 && mother) {
      mother.guardian = mother.id;
      mother.guardianName = mother.name;
      child.guardian = mother.id;
      child.guardianName = mother.name;
      return { msg: `你置之不理，${mother ? mother.name + '叹了口气' : '对方'}终究还是自己把孩子抱了回去抚养。`, adopted: false, keptByOther: true };
    } else if (roll === 2) {
      child.guardian = null;
      child.guardianName = null;
      return { msg: '你置之不理，对方哭着把孩子抱走了，后来听说孩子被送到了别处抚养。', adopted: false, abandoned: true };
    } else {
      child.guardian = null;
      child.guardianName = null;
      return { msg: '你置之不理。对方默默抱着孩子离开了，自此再未登门。', adopted: false, abandoned: true };
    }
  }
}

// 未接回府子嗣触发剧情（转月概率触发）
function triggerOutcastEvent(player, child, gameState) {
  // 已接回府（guardian 是主控）或已入府居住的不触发
  if (child.guardian === player.id) return null;
  const m = player.mansion;
  if (m && ((m.children || []).includes(child.id) || (m.leftWing || []).includes(child.id) || (m.rightWing || []).includes(child.id))) {
    return null;
  }
  // 需求：被拒绝回府3次后，不再触发该私生子"想被接回府"的剧情（彻底不再请求归家）
  if ((child.refusedReturnCount || 0) >= 3) return null;
  // 需求：对主控好感低的私生子，不触发"想被接回府"（returnHome）弹窗——低好感改为怨恨
  const rel = (child.relations && child.relations[player.id]) || {};
  const favor = typeof rel.favor === 'number' ? rel.favor : (child.favorWithPlayer || 50);
  const roll = randInt(1, 100);
  let type = 'returnHome', name = '子嗣归家', pool = RETURN_HOME;
  if (roll <= 25) { type = 'peek'; name = '府外张望'; pool = PEEK; }
  else if (roll <= 40) { type = 'resent'; name = '怨恨'; pool = RESENT; }
  // 低好感（favor < 30）→ 不请求归家，改为怨恨
  if (type === 'returnHome' && favor < 30) {
    type = 'resent'; name = '怨恨'; pool = RESENT;
  }
  const text = genderize(randChoice(pool).replace(/\{name\}/g, child.name), child);
  return { type, name, desc: text, childId: child.id, childName: child.name };
}

// 妻妾事件（日常/告状/勾引）
function concubineEvent(player, concubine, other, gameState) {
  const roll = randInt(1, 100);
  let type, name, desc, options = [];
  if (roll <= 35) {
    type = 'daily'; name = '日常'; desc = genderize(randChoice(CONCUBINE_DAILY).replace(/\{name\}/g, concubine.name), concubine);
  } else if (roll <= 70) {
    type = 'tattle'; name = '告状';
    desc = genderize(randChoice(CONCUBINE_TATTLE).replace(/\{name\}/g, concubine.name).replace(/\{target\}/g, other.name), concubine);
    options = [
      { key: 'punish_rank', label: '惩罚（降位分）' },
      { key: 'punish_kneel', label: '惩罚（罚跪）' },
      { key: 'punish_scold', label: '惩罚（口头训斥）' },
      { key: 'appease', label: '调解安抚' },
      { key: 'reprimand', label: '斥责' },
    ];
  } else {
    type = 'seduce'; name = '勾引';
    desc = genderize(randChoice(CONCUBINE_SEDUCE).replace(/\{name\}/g, concubine.name), concubine);
    options = [
      { key: 'enjoy', label: '享受' },
      { key: 'indifferent', label: '无感' },
    ];
  }
  return { type, name, desc, options, concubineId: concubine.id, concubineName: concubine.name, otherId: other ? other.id : null, otherName: other ? other.name : '' };
}

module.exports = {
  ageStage, STAGES, STAGE_NAME,
  TALK, GIFT, SPAR, STEAL, FIGHT, LOVE,
  BASTARD_ASK, RETURN_HOME, PEEK, RESENT,
  VISIT_BASTARD, VISIT_ABANDONED, STEAL_LOVE, STEAL_LOVE_F,
  CONCUBINE_DAILY, CONCUBINE_TATTLE, CONCUBINE_SEDUCE,
  PUNISH_OPTIONS, APPEASE_TEXT, REPRIMAND_TEXT,
  randomChildJournal, childAct, adoptBastard, triggerOutcastEvent, concubineEvent,
};
