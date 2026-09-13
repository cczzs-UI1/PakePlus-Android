// 交互剧情库 - 为每个交互按钮生成30+剧情，根据属性分类
// 每个剧情包含：触发条件、剧情文本、记事文本、效果影响
const { genderize } = require('../engine/utils');

const INTERACTION_EVENTS = {
  // ===== 交谈剧情（30+） =====
  chat: [
    {
      id: 'chat_001', minFavor: 0, maxFavor: 100,
      condition: { time: 'day' },
      text: '你与{npc}在街头偶遇，两人聊起了近来的见闻。{npc}兴致勃勃地讲述着他在{location}的经历，你听得津津有味。',
      journal: '与{npc}在{location}交谈，听闻其近来见闻。',
      effects: { favor: 3, reputation: 1 },
    },
    {
      id: 'chat_002', minFavor: 20, maxFavor: 100,
      condition: { weather: 'rain' },
      text: '外面下着雨，你与{npc}在屋檐下避雨。雨声淅沥，两人聊起了各自的往事，{npc}的眼中闪过一丝怀念。',
      journal: '雨天与{npc}在屋檐下避雨长谈，互诉往事。',
      effects: { favor: 5, intimacy: 2 },
    },
    {
      id: 'chat_003', minFavor: 50, maxFavor: 100,
      condition: { gender: 'opposite' },
      text: '月色朦胧，你与{npc}在庭院中散步。{npc}忽然停下脚步，转头看向你，目光中带着一丝说不清的情愫。"你知道吗，和你在一起的时候，我总是很开心。"',
      journal: '月夜与{npc}庭院散步，{npc}吐露心声，言与你相处甚欢。',
      effects: { favor: 8, intimacy: 5 },
    },
    {
      id: 'chat_004', minFavor: 0, maxFavor: 30,
      condition: {},
      text: '你向{npc}搭话，{npc}只是淡淡地应了几句，似乎并不想多谈。气氛有些尴尬。',
      journal: '与{npc}搭话，对方态度冷淡，交谈甚少。',
      effects: { favor: 1 },
    },
    {
      id: 'chat_005', minFavor: 30, maxFavor: 60,
      condition: { profession: 'merchant' },
      text: '{npc}是个精明的商人，与你交谈时三句不离生意。他向你透露了一些最近的商情，你获益匪浅。',
      journal: '与商人{npc}交谈，获知近期商情。',
      effects: { favor: 3, intelligence: 2 },
    },
    {
      id: 'chat_006', minFavor: 40, maxFavor: 100,
      condition: { profession: 'scholar' },
      text: '{npc}博古通今，与你谈论诗词歌赋，言谈间尽显风流。你被其才学折服，不觉间已过了数个时辰。',
      journal: '与才子{npc}论诗谈文，受益匪浅。',
      effects: { favor: 5, intelligence: 3, reputation: 2 },
    },
    {
      id: 'chat_007', minFavor: 60, maxFavor: 100,
      condition: { gender: 'same' },
      text: '你与{npc}把酒言欢，畅谈天下大事。两人越谈越投机，大有相见恨晚之感。{npc}拍着你的肩膀说："得友如此，人生无憾！"',
      journal: '与{npc}把酒畅谈，相见恨晚，引为知己。',
      effects: { favor: 10, brotherhood: 5 },
    },
    {
      id: 'chat_008', minFavor: 10, maxFavor: 50,
      condition: { location: 'tavern' },
      text: '在酒馆中，你与{npc}拼桌而坐。几杯酒下肚，{npc}的话匣子打开了，开始滔滔不绝地讲起江湖轶事。',
      journal: '酒馆中与{npc}饮酒闲谈，听闻江湖轶事。',
      effects: { favor: 4, intelligence: 1 },
    },
    {
      id: 'chat_009', minFavor: 70, maxFavor: 100,
      condition: { gender: 'opposite', time: 'night' },
      text: '夜深人静，你与{npc}在房中对坐。烛火摇曳，{npc}的脸庞在光影中显得格外动人。两人低声细语，从天文地理谈到人生理想，不知不觉间已近天明。',
      journal: '深夜与{npc}房中长谈，烛火相伴，无所不谈。',
      effects: { favor: 12, intimacy: 10 },
    },
    {
      id: 'chat_010', minFavor: 0, maxFavor: 20,
      condition: { personality: 'cold' },
      text: '{npc}性格冷傲，对你的搭话只是冷冷地瞥了一眼，便不再理会。你讨了个没趣。',
      journal: '向冷傲的{npc}搭话，被无视。',
      effects: { favor: -2 },
    },
    {
      id: 'chat_011', minFavor: 20, maxFavor: 100,
      condition: { personality: 'warm' },
      text: '{npc}热情好客，拉着你问长问短。两人相谈甚欢，{npc}还邀请你改日去他家做客。',
      journal: '与热情的{npc}相谈甚欢，受邀做客。',
      effects: { favor: 6, reputation: 2 },
    },
    {
      id: 'chat_012', minFavor: 50, maxFavor: 100,
      condition: { realmDiff: 'higher' },
      text: '{npc}作为前辈，耐心地为你讲解修炼中的疑惑。他的指点让你茅塞顿开，修为隐约有了精进。',
      journal: '向前辈{npc}请教修炼之道，获其指点，修为精进。',
      effects: { favor: 5, cultivationExp: 200, enlightenment: 3 },
    },
    {
      id: 'chat_013', minFavor: 30, maxFavor: 100,
      condition: { realmDiff: 'lower' },
      text: '{npc}恭敬地向你请教问题，你耐心地为其解答。看着{npc}恍然大悟的样子，你心中也颇有成就感。',
      journal: '为后辈{npc}答疑解惑，颇有成就感。',
      effects: { favor: 4, reputation: 3, merit: 2 },
    },
    {
      id: 'chat_014', minFavor: 40, maxFavor: 100,
      condition: { location: 'garden' },
      text: '花园中百花盛开，你与{npc}漫步其中。{npc}指着一朵牡丹说："这花虽美，却只有一季，不如我们之间的情谊，历久弥新。"',
      journal: '与{npc}花园漫步，{npc}以花喻情，言情谊长久。',
      effects: { favor: 7, intimacy: 4 },
    },
    {
      id: 'chat_015', minFavor: 60, maxFavor: 100,
      condition: { hasTag: 'in_love' },
      text: '{npc}含情脉脉地看着你，轻声说："每次见到你，我的心就跳得厉害。你说，这是为什么呢？"你还没来得及回答，{npc}已经羞红了脸，低下头去。',
      journal: '{npc}对你含情脉脉，言见你便心跳加速，娇羞无限。',
      effects: { favor: 15, intimacy: 12, love: 10 },
    },
    {
      id: 'chat_016', minFavor: 0, maxFavor: 100,
      condition: { event: 'festival' },
      text: '正值佳节，街上热闹非凡。你与{npc}在人群中相遇，两人一起逛庙会、看花灯，度过了愉快的一天。',
      journal: '佳节与{npc}同逛庙会，共度佳节。',
      effects: { favor: 8, happiness: 10 },
    },
    {
      id: 'chat_017', minFavor: 20, maxFavor: 80,
      condition: { profession: 'warrior' },
      text: '{npc}是个豪爽的武人，与你交谈时大声说笑，毫不做作。他向你炫耀着自己的战斗经历，你听得热血沸腾。',
      journal: '与武人{npc}交谈，听其讲述战斗经历，热血沸腾。',
      effects: { favor: 5, courage: 3 },
    },
    {
      id: 'chat_018', minFavor: 50, maxFavor: 100,
      condition: { profession: 'doctor' },
      text: '{npc}精通医理，与你交谈时顺便为你把脉。他说你身体略有亏虚，给了你一些调养的建议。',
      journal: '与医者{npc}交谈，获其把脉并得调养建议。',
      effects: { favor: 4, hp: 50, constitution: 2 },
    },
    {
      id: 'chat_019', minFavor: 30, maxFavor: 100,
      condition: { location: 'mountain' },
      text: '山顶之上，你与{npc}并肩而立，俯瞰云海。{npc}感慨道："站在这里，才觉得天地之大，个人之渺小。"你深以为然。',
      journal: '与{npc}山顶观云海，感慨天地之大。',
      effects: { favor: 6, enlightenment: 5 },
    },
    {
      id: 'chat_020', minFavor: 70, maxFavor: 100,
      condition: { gender: 'opposite', hasTag: 'lustful' },
      text: '{npc}凑近你，呼吸可闻。{npc}在你耳边低语着暧昧的话语，手指轻轻划过你的手臂。"今晚，留下来陪我好吗？"',
      journal: '{npc}在你耳边低语暧昧，邀你今夜相伴。',
      effects: { favor: 10, intimacy: 15, lust: 10 },
    },
    {
      id: 'chat_021', minFavor: 10, maxFavor: 60,
      condition: { hasTag: 'mysterious' },
      text: '{npc}说话总是半遮半掩，让你摸不着头脑。{npc}似乎知道很多秘密，却不肯轻易透露。',
      journal: '与神秘的{npc}交谈，其言语隐晦，似藏秘密。',
      effects: { favor: 3, mystery: 5 },
    },
    {
      id: 'chat_022', minFavor: 40, maxFavor: 100,
      condition: { hasTag: 'old_friend' },
      text: '你与{npc}是多年老友，一见面就有说不完的话。两人回忆着过去的种种，时而大笑，时而感慨。',
      journal: '与老友{npc}重逢，回忆往事，感慨万千。',
      effects: { favor: 8, nostalgia: 10 },
    },
    {
      id: 'chat_023', minFavor: 0, maxFavor: 40,
      condition: { hasTag: 'arrogant' },
      text: '{npc}高高在上，与你说话时总是带着一股优越感。你虽然心里不舒服，但也只能忍着。',
      journal: '与傲慢的{npc}交谈，对方优越感十足。',
      effects: { favor: -1, anger: 5 },
    },
    {
      id: 'chat_024', minFavor: 50, maxFavor: 100,
      condition: { hasTag: 'kind' },
      text: '{npc}心地善良，与你交谈时总是关心着你的近况。{npc}叮嘱你要注意身体，不要太拼命修炼。',
      journal: '与善良的{npc}交谈，获其关心叮嘱。',
      effects: { favor: 6, warmth: 10, hp: 30 },
    },
    {
      id: 'chat_025', minFavor: 60, maxFavor: 100,
      condition: { gender: 'opposite', location: 'riverside' },
      text: '河边垂柳依依，你与{npc}并肩而行。{npc}忽然停下，捡起一颗石子投入水中，涟漪荡漾。"你看，这水面就像人心，看似平静，实则暗流涌动。"',
      journal: '与{npc}河边漫步，{npc}以水喻心，言语深意。',
      effects: { favor: 8, intimacy: 6, philosophy: 5 },
    },
    {
      id: 'chat_026', minFavor: 20, maxFavor: 100,
      condition: { weather: 'snow' },
      text: '大雪纷飞，你与{npc}在屋中围炉而坐。{npc}为你斟上一杯热酒，两人在温暖的屋内聊着天，窗外的寒冷仿佛与他们无关。',
      journal: '雪天与{npc}围炉饮酒，暖意融融。',
      effects: { favor: 7, happiness: 8 },
    },
    {
      id: 'chat_027', minFavor: 80, maxFavor: 100,
      condition: { gender: 'opposite', hasTag: 'chaste' },
      text: '{npc}虽然守身如玉，但在你面前却总是忍不住流露真情。{npc}红着脸说："我从未对别人这样过，只有你，让我无法自持。"',
      journal: '守身如玉的{npc}对你吐露真情，言唯对你无法自持。',
      effects: { favor: 15, intimacy: 12, special: 'chaste_break' },
    },
    {
      id: 'chat_028', minFavor: 30, maxFavor: 100,
      condition: { profession: 'cultivator' },
      text: '{npc}与你交流修炼心得，两人各抒己见，碰撞出不少火花。{npc}的一些独特见解让你受益匪浅。',
      journal: '与修士{npc}交流修炼心得，获益良多。',
      effects: { favor: 5, cultivationExp: 150, enlightenment: 3 },
    },
    {
      id: 'chat_029', minFavor: 10, maxFavor: 70,
      condition: { location: 'market' },
      text: '集市上人声鼎沸，你与{npc}在摊位前停下。{npc}向你推荐着一些稀奇古怪的玩意儿，你被逗得哈哈大笑。',
      journal: '集市中与{npc}闲逛，看稀奇玩意儿，欢笑不断。',
      effects: { favor: 4, happiness: 5 },
    },
    {
      id: 'chat_030', minFavor: 50, maxFavor: 100,
      condition: { hasTag: 'traumatized' },
      text: '{npc}很少向人敞开心扉，但今天却向你讲述了他过去的伤痛。你静静地听着，不时安慰几句。{npc}的眼眶红了，但嘴角却带着一丝释然的微笑。',
      journal: '{npc}向你倾诉过往伤痛，你安慰之，其稍感释然。',
      effects: { favor: 12, intimacy: 10, trust: 15 },
    },
    {
      id: 'chat_031', minFavor: 0, maxFavor: 100,
      condition: { realmDiff: 'same', profession: 'same' },
      text: '你与{npc}是同行，两人聊起行业内的种种，越聊越投机。{npc}还向你分享了一些独门技巧。',
      journal: '与同行{npc}交谈，获其分享独门技巧。',
      effects: { favor: 5, skillExp: 100 },
    },
    {
      id: 'chat_032', minFavor: 40, maxFavor: 100,
      condition: { time: 'dawn' },
      text: '清晨，你与{npc}在山顶看日出。朝阳缓缓升起，金光洒满大地。{npc}感叹道："新的一天又开始了，愿我们都能得偿所愿。"',
      journal: '清晨与{npc}山顶观日出，互勉得偿所愿。',
      effects: { favor: 6, hope: 10, cultivationExp: 100 },
    },
  ],

  // ===== 切磋剧情（30+） =====
  spar: [
    {
      id: 'spar_001', minFavor: 10, maxFavor: 100,
      condition: {},
      text: '你与{npc}在演武场切磋武艺。两人你来我往，打得难解难分。最终你以一招之差惜败，但{npc}对你的身手赞不绝口。',
      journal: '与{npc}演武场切磋，惜败一招，获其称赞。',
      effects: { favor: 3, combatExp: 100, hp: -30 },
    },
    {
      id: 'spar_002', minFavor: 20, maxFavor: 100,
      condition: { result: 'win' },
      text: '你与{npc}切磋，凭借精妙的招式击败了对方。{npc}拱手道："佩服佩服，你的武艺又有精进！"',
      journal: '与{npc}切磋获胜，对方佩服，言你武艺精进。',
      effects: { favor: 5, combatExp: 150, reputation: 3 },
    },
    {
      id: 'spar_003', minFavor: 0, maxFavor: 50,
      condition: { result: 'lose' },
      text: '你与{npc}切磋，被对方轻松击败。{npc}冷冷地说："就这点本事？还需要多练练。"你虽然有些沮丧，但也认清了差距。',
      journal: '与{npc}切磋惨败，对方不屑，言你需多加练习。',
      effects: { favor: -2, combatExp: 80, willpower: 5, hp: -50 },
    },
    {
      id: 'spar_004', minFavor: 50, maxFavor: 100,
      condition: { gender: 'opposite' },
      text: '你与{npc}切磋时，不小心将对方揽入怀中。两人四目相对，气氛变得暧昧起来。{npc}红着脸推开你，轻声说："你...你故意的吧？"',
      journal: '与{npc}切磋时不慎将其揽入怀中，气氛暧昧，{npc}娇羞。',
      effects: { favor: 8, intimacy: 10, combatExp: 50 },
    },
    {
      id: 'spar_005', minFavor: 30, maxFavor: 100,
      condition: { realmDiff: 'higher' },
      text: '你向前辈{npc}请教武艺，{npc}欣然应允。切磋中{npc}处处留手，但你依然被打得毫无还手之力。{npc}耐心地为你讲解招式要领。',
      journal: '向前辈{npc}请教武艺，被其压制，获其耐心指点。',
      effects: { favor: 5, combatExp: 200, skillExp: 100 },
    },
    {
      id: 'spar_006', minFavor: 40, maxFavor: 100,
      condition: { realmDiff: 'lower' },
      text: '后辈{npc}向你挑战，你欣然接受。切磋中你故意放水，让{npc}赢了几招。{npc}高兴得像个孩子，对你更加敬佩。',
      journal: '与后辈{npc}切磋，故意放水，其高兴且更敬佩你。',
      effects: { favor: 6, reputation: 4, merit: 3 },
    },
    {
      id: 'spar_007', minFavor: 60, maxFavor: 100,
      condition: { gender: 'same' },
      text: '你与{npc}惺惺相惜，切磋时都使出了真本事。两人打得天昏地暗，最后同时收招，哈哈大笑。"痛快！真是痛快！"',
      journal: '与{npc}全力切磋，旗鼓相当，大呼痛快。',
      effects: { favor: 10, combatExp: 250, brotherhood: 8, hp: -40 },
    },
    {
      id: 'spar_008', minFavor: 20, maxFavor: 80,
      condition: { location: 'mountain' },
      text: '山顶之上，你与{npc}迎风而立，切磋武艺。山风呼啸，两人的衣袂翻飞，宛如仙人。路过的行人都看呆了。',
      journal: '山顶与{npc}迎风切磋，衣袂翻飞，宛如仙人。',
      effects: { favor: 6, combatExp: 150, reputation: 5 },
    },
    {
      id: 'spar_009', minFavor: 0, maxFavor: 30,
      condition: { hasTag: 'arrogant' },
      text: '{npc}傲慢地接受了你的切磋请求，但根本没把你放在眼里。然而你却出人意料地与他斗了个旗鼓相当。{npc}的脸色变得很难看。',
      journal: '与傲慢的{npc}切磋，出人意料斗成平手，对方脸色难看。',
      effects: { favor: -5, combatExp: 180, reputation: 8 },
    },
    {
      id: 'spar_010', minFavor: 50, maxFavor: 100,
      condition: { hasTag: 'gentle' },
      text: '{npc}性格温和，切磋时处处留手，生怕伤到你。你知道他的好意，也配合着点到为止。两人切磋更像是在跳舞。',
      journal: '与温和的{npc}切磋，双方点到为止，宛如共舞。',
      effects: { favor: 7, combatExp: 80, intimacy: 5 },
    },
    {
      id: 'spar_011', minFavor: 30, maxFavor: 100,
      condition: { weather: 'rain' },
      text: '雨中切磋，别有一番风味。你与{npc}在雨中激战，雨水混着汗水流下。两人都淋成了落汤鸡，但都笑得很开心。',
      journal: '雨中与{npc}切磋，浑身湿透，却开怀大笑。',
      effects: { favor: 8, combatExp: 120, hp: -20, constitution: 3 },
    },
    {
      id: 'spar_012', minFavor: 70, maxFavor: 100,
      condition: { gender: 'opposite', hasTag: 'lustful' },
      text: '切磋中，{npc}故意贴近你的身体，呼吸喷在你的脖颈上。"你的身体好结实啊..."他低声呢喃，手指在你胸口画着圈。这场切磋已经变了味道。',
      journal: '与{npc}切磋时其故意贴近，言语暧昧，切磋变了味道。',
      effects: { favor: 10, intimacy: 18, lust: 15, combatExp: 50 },
    },
    {
      id: 'spar_013', minFavor: 10, maxFavor: 60,
      condition: { profession: 'warrior' },
      text: '{npc}是个沙场老兵，切磋时招招狠辣，带着战场上的杀气。你被压得喘不过气来，但也学到了不少实战技巧。',
      journal: '与沙场老兵{npc}切磋，招招狠辣，学到实战技巧。',
      effects: { favor: 4, combatExp: 200, courage: 5, hp: -40 },
    },
    {
      id: 'spar_014', minFavor: 40, maxFavor: 100,
      condition: { profession: 'cultivator' },
      text: '你与{npc}以法术切磋，各种灵光在空中交织碰撞，煞是好看。{npc}的法术精妙，让你大开眼界。',
      journal: '与修士{npc}法术切磋，灵光交织，大开眼界。',
      effects: { favor: 6, combatExp: 180, mp: -30, enlightenment: 3 },
    },
    {
      id: 'spar_015', minFavor: 0, maxFavor: 100,
      condition: { result: 'draw' },
      text: '你与{npc}切磋了数百回合，依然不分胜负。最后两人同时收招，相视而笑。"棋逢对手，将遇良才，痛快！"',
      journal: '与{npc}切磋数百回合不分胜负，惺惺相惜。',
      effects: { favor: 8, combatExp: 220, reputation: 5, hp: -35 },
    },
    {
      id: 'spar_016', minFavor: 20, maxFavor: 100,
      condition: { location: 'beach' },
      text: '海边沙滩上，你与{npc}切磋。脚下的沙子让两人的步伐都有些不稳，但这也增加了切磋的乐趣。海浪声中，两人的笑声格外响亮。',
      journal: '海边沙滩与{npc}切磋，步伐不稳，乐趣横生。',
      effects: { favor: 6, combatExp: 130, balance: 5 },
    },
    {
      id: 'spar_017', minFavor: 50, maxFavor: 100,
      condition: { hasTag: 'disabled' },
      text: '{npc}虽然身有残疾，但武艺却丝毫不受影响。他用独特的方式与你切磋，让你见识到了另一种武道。你对{npc}更加敬佩了。',
      journal: '与身有残疾的{npc}切磋，其武艺独特，令人敬佩。',
      effects: { favor: 8, combatExp: 160, willpower: 8 },
    },
    {
      id: 'spar_018', minFavor: 30, maxFavor: 100,
      condition: { time: 'night' },
      text: '月光下，你与{npc}切磋。两人的身影在月光下交错，宛如一幅水墨画。{npc}的招式在月光下显得格外飘逸。',
      journal: '月夜与{npc}切磋，身影交错，宛如水墨画卷。',
      effects: { favor: 7, combatExp: 140, aesthetics: 5 },
    },
    {
      id: 'spar_019', minFavor: 0, maxFavor: 40,
      condition: { hasTag: 'cowardly' },
      text: '{npc}胆小如鼠，切磋时总是躲躲闪闪，不敢与你正面交锋。你追了半天也没碰到他一下，最后只能作罢。',
      journal: '与胆小的{npc}切磋，其躲躲闪闪，无法正面交锋。',
      effects: { favor: -1, combatExp: 50, frustration: 5 },
    },
    {
      id: 'spar_020', minFavor: 60, maxFavor: 100,
      condition: { gender: 'opposite', hasTag: 'chaste' },
      text: '{npc}守身如玉，切磋时刻意与你保持距离。但你一个假动作让他失了平衡，跌入你怀中。{npc}又羞又急，连忙推开你，跑开了。',
      journal: '与守身如玉的{npc}切磋，假动作使其跌入你怀，羞急跑开。',
      effects: { favor: 5, intimacy: 8, shyness: 15 },
    },
    {
      id: 'spar_021', minFavor: 40, maxFavor: 100,
      condition: { hasTag: 'genius' },
      text: '{npc}是个武学天才，切磋中你刚使出的招式，他看一遍就能学会并加以改良。你既惊讶又佩服。',
      journal: '与武学天才{npc}切磋，其现学现用并改良招式，令人惊叹。',
      effects: { favor: 6, combatExp: 200, intelligence: 5 },
    },
    {
      id: 'spar_022', minFavor: 20, maxFavor: 100,
      condition: { location: 'forest' },
      text: '密林之中，你与{npc}切磋。树木成了最好的掩护，两人在林间穿梭追逐，切磋变成了一场追逐战。',
      journal: '密林中与{npc}切磋，穿梭追逐，演变为追逐战。',
      effects: { favor: 5, combatExp: 150, agility: 5 },
    },
    {
      id: 'spar_023', minFavor: 50, maxFavor: 100,
      condition: { hasTag: 'old_rival' },
      text: '你与{npc}是老对手了，每次切磋都格外认真。两人知根知底，每一招都被对方预判。这场切磋比的是谁先犯错。',
      journal: '与老对手{npc}切磋，知根知底，比拼耐心。',
      effects: { favor: 7, combatExp: 200, rivalry: 10 },
    },
    {
      id: 'spar_024', minFavor: 0, maxFavor: 100,
      condition: { event: 'tournament' },
      text: '在比武大会上，你与{npc}相遇。台下观众人山人海，两人都拿出了看家本领。这场切磋注定会被人们津津乐道。',
      journal: '比武大会上与{npc}对决，万众瞩目，精彩绝伦。',
      effects: { favor: 5, combatExp: 300, reputation: 15, hp: -50 },
    },
    {
      id: 'spar_025', minFavor: 30, maxFavor: 100,
      condition: { hasTag: 'drunk' },
      text: '{npc}喝得醉醺醺的，但切磋起来却更加厉害，招式飘忽不定，让你难以捉摸。"醉拳...你听说过吗？"他笑嘻嘻地说。',
      journal: '与醉酒的{npc}切磋，其招式飘忽，竟是醉拳。',
      effects: { favor: 6, combatExp: 170, uniqueSkill: '醉拳' },
    },
    {
      id: 'spar_026', minFavor: 70, maxFavor: 100,
      condition: { gender: 'opposite', location: 'hot_spring' },
      text: '温泉池中，你与{npc}切磋水性。水汽氤氲中，两人的身体若隐若现。{npc}故意泼了你一身水，然后咯咯笑着游走了。',
      journal: '温泉中与{npc}戏水，水汽氤氲，其泼水嬉笑。',
      effects: { favor: 10, intimacy: 15, happiness: 10 },
    },
    {
      id: 'spar_027', minFavor: 10, maxFavor: 60,
      condition: { hasTag: 'mercenary' },
      text: '{npc}是个雇佣兵，切磋时招招致命，完全不留情面。你勉强接了几招就已经伤痕累累。{npc}冷冷地说："在真正的战斗中，你已经死了。"',
      journal: '与雇佣兵{npc}切磋，招招致命，被其言实战中已死。',
      effects: { favor: -1, combatExp: 250, hp: -80, survival: 10 },
    },
    {
      id: 'spar_028', minFavor: 40, maxFavor: 100,
      condition: { hasTag: 'teacher' },
      text: '你的师父{npc}检查你的功课，与你切磋。他一边打一边指出你的不足，让你收获颇丰。',
      journal: '与师父{npc}切磋，被其指点不足，收获颇丰。',
      effects: { favor: 5, combatExp: 250, skillExp: 150, respect: 10 },
    },
    {
      id: 'spar_029', minFavor: 50, maxFavor: 100,
      condition: { gender: 'same', hasTag: 'sworn' },
      text: '你与结义兄弟{npc}切磋，两人都使出了全力。打完后互相拍着肩膀大笑，兄弟情谊在切磋中更加深厚。',
      journal: '与结义兄弟{npc}全力切磋，兄弟情谊更深。',
      effects: { favor: 10, combatExp: 200, brotherhood: 15, hp: -30 },
    },
    {
      id: 'spar_030', minFavor: 0, maxFavor: 100,
      condition: { result: 'critical_win' },
      text: '你与{npc}切磋时，突然福至心灵，领悟了一招新招式，一举击败了对方。{npc}目瞪口呆，连呼不可思议。',
      journal: '与{npc}切磋时顿悟新招，一举击败对方，其惊叹不已。',
      effects: { favor: 8, combatExp: 400, newSkill: true, reputation: 10 },
    },
    {
      id: 'spar_031', minFavor: 30, maxFavor: 100,
      condition: { location: 'snow' },
      text: '雪地中切磋，脚下打滑让两人都有些狼狈。但这也让切磋多了几分趣味，你们在雪中打滚笑闹，完全没了高手的样子。',
      journal: '雪地中与{npc}切磋，打滑狼狈，打滚笑闹。',
      effects: { favor: 8, combatExp: 100, happiness: 10, hp: -15 },
    },
    {
      id: 'spar_032', minFavor: 60, maxFavor: 100,
      condition: { gender: 'opposite', hasTag: 'experienced' },
      text: '{npc}是情场老手，切磋时总是故意与你发生身体接触。他在你耳边低语："你的身体反应好诚实啊..."你不禁面红耳赤。',
      journal: '与情场老手{npc}切磋，其故意身体接触并耳语挑逗，你面红耳赤。',
      effects: { favor: 8, intimacy: 20, lust: 12, combatExp: 60 },
    },
  ],

  // ===== 赠礼剧情（30+） =====
  gift: [
    {
      id: 'gift_001', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'common' },
      text: '你将一份普通的礼物送给{npc}。{npc}接过礼物，礼貌地道了谢，但从表情来看，他并不是特别喜欢。',
      journal: '赠{npc}普通礼物，其礼貌道谢，不甚喜欢。',
      effects: { favor: 2 },
    },
    {
      id: 'gift_002', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'liked' },
      text: '你将{npc}喜欢的东西送给他。{npc}眼睛一亮，惊喜地说："你怎么知道我喜欢这个？谢谢你！"',
      journal: '赠{npc}其喜好之物，其惊喜道谢。',
      effects: { favor: 8, happiness: 5 },
    },
    {
      id: 'gift_003', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'loved' },
      text: '你将{npc}梦寐以求的宝物送给他。{npc}激动得说不出话来，眼眶都红了。"这...这太珍贵了，我不能收..."但他的手却紧紧握着不放。',
      journal: '赠{npc}梦寐以求之宝，其激动落泪，爱不释手。',
      effects: { favor: 20, intimacy: 10, gratitude: 15 },
    },
    {
      id: 'gift_004', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'disliked' },
      text: '你将礼物送给{npc}，但{npc}的脸色却变了。原来这是他最讨厌的东西。{npc}勉强收下，但对你的好感大打折扣。',
      journal: '赠{npc}其厌恶之物，其脸色难看，好感大减。',
      effects: { favor: -5, displeasure: 10 },
    },
    {
      id: 'gift_005', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'flower', gender: 'female' },
      text: '你将一束鲜花送给{npc}。{npc}接过花，放在鼻尖轻嗅，脸上泛起红晕。"谢谢你...这花真美。"她轻声说。',
      journal: '赠{npc}鲜花，其轻嗅花香，脸红道谢。',
      effects: { favor: 10, intimacy: 8, romance: 10 },
    },
    {
      id: 'gift_006', minFavor: 20, maxFavor: 100,
      condition: { giftType: 'wine' },
      text: '你将一坛好酒送给{npc}。{npc}是个爱酒之人，当即拍开泥封，酒香四溢。"好酒！真是好酒！来，陪我喝几杯！"',
      journal: '赠{npc}美酒，其大喜，邀你共饮。',
      effects: { favor: 8, happiness: 8, brotherhood: 5 },
    },
    {
      id: 'gift_007', minFavor: 50, maxFavor: 100,
      condition: { giftType: 'jewelry', gender: 'female' },
      text: '你将一支精美的珠钗送给{npc}。她接过珠钗，对着铜镜插在发间，转头问你："好看吗？"烛光下，她的笑容比珠钗还要耀眼。',
      journal: '赠{npc}珠钗，其对镜插戴，问你好看否，笑容灿烂。',
      effects: { favor: 15, intimacy: 12, romance: 15 },
    },
    {
      id: 'gift_008', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'weapon', gender: 'male' },
      text: '你将一把宝刀送给{npc}。{npc}拔刀出鞘，寒光闪闪，他大喜过望："好刀！真是好刀！兄弟你太够意思了！"',
      journal: '赠{npc}宝刀，其大喜，赞你够意思。',
      effects: { favor: 12, brotherhood: 10, attack: 5 },
    },
    {
      id: 'gift_009', minFavor: 40, maxFavor: 100,
      condition: { giftType: 'book', profession: 'scholar' },
      text: '你将一本珍贵的古籍送给{npc}。{npc}是个书痴，接过书后就迫不及待地翻阅起来，完全忘了你的存在。',
      journal: '赠{npc}珍贵古籍，其沉迷阅读，忘乎所以。',
      effects: { favor: 12, intelligence: 5, gratitude: 10 },
    },
    {
      id: 'gift_010', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'medicine', hasTag: 'sick' },
      text: '你将珍贵的药材送给生病的{npc}。{npc}感动地说："你真是雪中送炭，这份恩情我记下了。"',
      journal: '赠生病的{npc}珍贵药材，其感动言铭记恩情。',
      effects: { favor: 15, hp: 100, gratitude: 15, merit: 5 },
    },
    {
      id: 'gift_011', minFavor: 50, maxFavor: 100,
      condition: { giftType: 'handmade', gender: 'opposite' },
      text: '你将亲手制作的礼物送给{npc}。虽然不算精致，但那份心意让{npc}十分感动。"这是你亲手做的？我会好好珍藏的。"他小心翼翼地收了起来。',
      journal: '赠{npc}亲手制作之物，其感动，言会好好珍藏。',
      effects: { favor: 18, intimacy: 15, sincerity: 20 },
    },
    {
      id: 'gift_012', minFavor: 0, maxFavor: 50,
      condition: { giftType: 'expensive', hasTag: 'poor' },
      text: '你将贵重的礼物送给家境贫寒的{npc}。{npc}犹豫了一下，还是收下了。"这份大礼...我一定会报答你的。"他的眼中满是感激。',
      journal: '赠贫寒的{npc}贵重礼物，其感激，言必报答。',
      effects: { favor: 12, gratitude: 20, merit: 8 },
    },
    {
      id: 'gift_013', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'pet' },
      text: '你将一只可爱的小宠物送给{npc}。{npc}一下子就被萌化了，抱着宠物爱不释手。"太可爱了！谢谢你，我会好好照顾它的！"',
      journal: '赠{npc}可爱小宠物，其爱不释手，言会好好照顾。',
      effects: { favor: 12, happiness: 15, intimacy: 8 },
    },
    {
      id: 'gift_014', minFavor: 60, maxFavor: 100,
      condition: { giftType: 'perfume', gender: 'female' },
      text: '你将一瓶名贵的香水送给{npc}。她打开瓶盖，在手腕上轻抹一点，然后凑近让你闻。"好闻吗？"香气幽幽，你不禁有些心醉。',
      journal: '赠{npc}名贵香水，其抹于手腕让你闻，香气幽人心醉。',
      effects: { favor: 15, intimacy: 18, romance: 12, lust: 5 },
    },
    {
      id: 'gift_015', minFavor: 20, maxFavor: 100,
      condition: { giftType: 'food' },
      text: '你将一盒精致的点心送给{npc}。{npc}尝了一口，眼睛亮了起来："好吃！这是哪里买的？下次带我一起去！"',
      journal: '赠{npc}精致点心，其称美味，邀你下次同去。',
      effects: { favor: 6, happiness: 8 },
    },
    {
      id: 'gift_016', minFavor: 40, maxFavor: 100,
      condition: { giftType: 'painting' },
      text: '你将一幅名画送给{npc}。{npc}是个雅士，展开画卷细细观赏，连连赞叹："妙笔！真是妙笔！这幅画我要挂在书房里日日观赏。"',
      journal: '赠{npc}名画，其赞叹不已，言将挂于书房日日观赏。',
      effects: { favor: 10, aesthetics: 10, gratitude: 8 },
    },
    {
      id: 'gift_017', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'money' },
      text: '你直接送了一笔灵石给{npc}。{npc}有些意外，但还是收下了。"这份人情我记下了。"他的态度比之前热络了不少。',
      journal: '赠{npc}灵石，其意外收下，态度热络不少。',
      effects: { favor: 5, gratitude: 5 },
    },
    {
      id: 'gift_018', minFavor: 70, maxFavor: 100,
      condition: { giftType: 'token', gender: 'opposite' },
      text: '你将一枚贴身的玉佩送给{npc}作为定情信物。{npc}接过玉佩，双手微微颤抖。"你...你是认真的吗？"得到你的肯定后，他将玉佩紧紧贴在胸口，泪流满面。',
      journal: '赠{npc}贴身玉佩作定情信物，其含泪紧贴胸口。',
      effects: { favor: 25, intimacy: 25, love: 20, engaged: true },
    },
    {
      id: 'gift_019', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'clothes', gender: 'female' },
      text: '你将一件漂亮的衣裙送给{npc}。她拿着裙子在身上比划，眼睛亮晶晶的。"我去换上给你看看！"不一会儿，她穿着新裙子出来，转了个圈："好看吗？"',
      journal: '赠{npc}漂亮衣裙，其换上后转圈问你好看否，明艳动人。',
      effects: { favor: 12, intimacy: 10, happiness: 12 },
    },
    {
      id: 'gift_020', minFavor: 20, maxFavor: 100,
      condition: { giftType: 'clothes', gender: 'male' },
      text: '你将一件气派的长袍送给{npc}。他穿上后显得更加英俊挺拔，对着铜镜照了又照，满意地说："不错不错，还是你有眼光。"',
      journal: '赠{npc}气派长袍，其穿上后更显英俊，赞你有眼光。',
      effects: { favor: 10, charm: 5, happiness: 8 },
    },
    {
      id: 'gift_021', minFavor: 50, maxFavor: 100,
      condition: { giftType: 'instrument', profession: 'musician' },
      text: '你将一把古琴送给{npc}。{npc}是个乐师，接过琴后轻抚琴弦，清音袅袅。"好琴！真是好琴！知音难觅，你就是我的知音！"',
      journal: '赠乐师{npc}古琴，其轻抚琴弦，言你为知音。',
      effects: { favor: 15, intimacy: 10, art: 10 },
    },
    {
      id: 'gift_022', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'trophy', profession: 'hunter' },
      text: '你将一件珍贵的猎物标本送给{npc}。{npc}是个猎人，一眼就看出这猎物的难得。"好家伙！这可是难得的猎物，你从哪弄来的？"',
      journal: '赠猎人{npc}珍贵猎物标本，其惊叹猎物难得。',
      effects: { favor: 10, respect: 8, brotherhood: 5 },
    },
    {
      id: 'gift_023', minFavor: 40, maxFavor: 100,
      condition: { giftType: 'pill', profession: 'cultivator' },
      text: '你将一瓶珍贵的丹药送给{npc}。{npc}是个修士，识得这丹药的价值。"这丹药可不便宜啊...你真的要送给我？"他郑重地收下了。',
      journal: '赠修士{npc}珍贵丹药，其识得价值，郑重收下。',
      effects: { favor: 12, cultivationExp: 200, gratitude: 10 },
    },
    {
      id: 'gift_024', minFavor: 60, maxFavor: 100,
      condition: { giftType: 'handwritten_letter', gender: 'opposite' },
      text: '你将一封亲笔写的情书送给{npc}。他展开信纸，细细阅读，脸上的表情从惊讶到感动，最后眼眶都红了。"这些话...你真的是这么想的吗？"',
      journal: '赠{npc}亲笔情书，其读后感动落泪，问你是否真心。',
      effects: { favor: 20, intimacy: 18, romance: 20, love: 10 },
    },
    {
      id: 'gift_025', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'rare_material', profession: 'blacksmith' },
      text: '你将一块罕见的矿石送给{npc}。{npc}是个铁匠，接过矿石后反复端详，激动地说："这可是百年难遇的好材料！你帮了我大忙了！"',
      journal: '赠铁匠{npc}罕见矿石，其激动言百年难遇，帮了大忙。',
      effects: { favor: 12, gratitude: 12, forgeExp: 100 },
    },
    {
      id: 'gift_026', minFavor: 0, maxFavor: 100,
      condition: { giftType: 'useless' },
      text: '你将一件没什么用的东西送给{npc}。{npc}接过来看了看，嘴角抽了抽，但还是礼貌地说了声谢谢。你能感觉到他在努力不表现出失望。',
      journal: '赠{npc}无用之物，其勉强道谢，难掩失望。',
      effects: { favor: 1, awkwardness: 5 },
    },
    {
      id: 'gift_027', minFavor: 50, maxFavor: 100,
      condition: { giftType: 'shared_memory' },
      text: '你将一件承载着两人共同回忆的物品送给{npc}。{npc}一看就想起了过去的时光，感慨万千。"你还留着这个...谢谢你，让我想起了那段美好的日子。"',
      journal: '赠{npc}承载共同回忆之物，其感慨万千，追忆美好时光。',
      effects: { favor: 15, intimacy: 12, nostalgia: 15 },
    },
    {
      id: 'gift_028', minFavor: 20, maxFavor: 100,
      condition: { giftType: 'spice', profession: 'chef' },
      text: '你将一包珍稀的香料送给{npc}。{npc}是个厨子，打开一闻就知道是好东西。"这香料可是做菜的极品！你太懂行了！"',
      journal: '赠厨子{npc}珍稀香料，其赞你懂行。',
      effects: { favor: 10, cookingExp: 50, happiness: 8 },
    },
    {
      id: 'gift_029', minFavor: 70, maxFavor: 100,
      condition: { giftType: 'ring', gender: 'female' },
      text: '你将一枚戒指单膝跪地送给{npc}。她捂住嘴，眼泪夺眶而出。"你...你这是在向我求婚吗？"周围的人都围了过来，起哄着喊"答应他"。',
      journal: '单膝跪地赠{npc}戒指求婚，其落泪，众人起哄。',
      effects: { favor: 30, intimacy: 30, love: 25, proposal: true, reputation: 10 },
    },
    {
      id: 'gift_030', minFavor: 40, maxFavor: 100,
      condition: { giftType: 'map', profession: 'explorer' },
      text: '你将一张古老的藏宝图送给{npc}。{npc}是个探险家，接过地图后眼睛都直了。"这是...传说中的藏宝图！你从哪得到的？我们一起去寻宝吧！"',
      journal: '赠探险家{npc}古老藏宝图，其大喜，邀你同去寻宝。',
      effects: { favor: 15, adventure: 20, excitement: 15 },
    },
    {
      id: 'gift_031', minFavor: 30, maxFavor: 100,
      condition: { giftType: 'incense', profession: 'monk' },
      text: '你将一盒名贵的檀香送给{npc}。{npc}是个出家人，接过香后双手合十："阿弥陀佛，施主有心了。这檀香正是我所需。"',
      journal: '赠僧人{npc}名贵檀香，其合十道谢，言正所需。',
      effects: { favor: 10, merit: 8, peace: 10 },
    },
    {
      id: 'gift_032', minFavor: 50, maxFavor: 100,
      condition: { giftType: 'lingerie', gender: 'female', hasTag: 'intimate' },
      text: '你将一套精致的亵衣送给{npc}。她的脸瞬间红透了，捶了你一下："你...你怎么送这种东西！"但她还是小心翼翼地收了起来，晚上你收到了她的传书："...其实挺好看的。"',
      journal: '赠{npc}精致亵衣，其脸红捶你，夜传书言其实挺好看。',
      effects: { favor: 12, intimacy: 25, lust: 15, shyness: 20 },
    },
  ],
};

// 获取交互剧情
function getInteractionEvent(action, context) {
  const events = INTERACTION_EVENTS[action];
  if (!events || events.length === 0) return null;

  // 根据条件筛选
  const eligible = events.filter(e => {
    if (context.favor !== undefined && (e.minFavor > context.favor || e.maxFavor < context.favor)) return false;
    if (e.condition.gender === 'opposite' && context.gender === context.npcGender) return false;
    if (e.condition.gender === 'same' && context.gender !== context.npcGender) return false;
    if (e.condition.profession && context.npcProfession !== e.condition.profession) return false;
    if (e.condition.location && context.location !== e.condition.location) return false;
    if (e.condition.time && context.time !== e.condition.time) return false;
    if (e.condition.weather && context.weather !== e.condition.weather) return false;
    if (e.condition.hasTag && !context.npcTags?.includes(e.condition.hasTag)) return false;
    if (e.condition.realmDiff === 'higher' && context.npcRealmLevel <= context.playerRealmLevel) return false;
    if (e.condition.realmDiff === 'lower' && context.npcRealmLevel >= context.playerRealmLevel) return false;
    return true;
  });

  if (eligible.length === 0) return events[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// 应用剧情效果
function applyEventEffects(entity, effects) {
  if (!effects) return;
  for (const key in effects) {
    if (typeof effects[key] === 'number') {
      if (entity[key] !== undefined) {
        entity[key] += effects[key];
      }
    }
  }
}

// 替换剧情文本中的占位符（并按NPC性别修正"他"指代）
function fillEventText(text, context) {
  const t = text
    .replace(/\{npc\}/g, context.npcName || '某人')
    .replace(/\{location\}/g, context.location || '此地')
    .replace(/\{player\}/g, context.playerName || '你');
  if (context.npcGender) return genderize(t, { gender: context.npcGender });
  return t;
}

module.exports = { INTERACTION_EVENTS, getInteractionEvent, applyEventEffects, fillEventText };
