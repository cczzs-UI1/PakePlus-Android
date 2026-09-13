// 属性随机剧情库 - 根据属性类型触发不同的随机剧情
const { randInt, randChoice, chance } = require('../engine/utils');

// 各属性的随机剧情
const ATTRIBUTE_EVENTS = {
  physique: [ // 根骨
    { text: '你在修炼中感受到筋骨齐鸣，根骨似乎有了细微的提升，修炼速度也快了几分。', effects: { cultivationExp: 50, physique: 1 }, journal: '修炼中筋骨齐鸣，根骨精进。' },
    { text: '你偶遇一位游方郎中，他为你推拿筋骨，你感觉身体轻盈了不少。', effects: { physique: 2, hp: 30 }, journal: '偶遇游方郎推拿筋骨，根骨提升。' },
    { text: '你在山中采药时不慎跌落，却因祸得福，打通了一处淤塞的经脉。', effects: { physique: 3, cultivationExp: 100 }, journal: '山中跌落因祸得福，打通经脉。' },
    { text: '你服用了一株百年老参，药力在体内游走，滋养着四肢百骸。', effects: { physique: 2, hp: 50, silver: -200 }, journal: '服用百年老参，根骨滋养。' },
    { text: '你坚持每日打拳练体，身体愈发强健，根骨稳步提升。', effects: { physique: 1, strength: 1 }, journal: '坚持练体，身体强健。' },
  ],
  spirit: [ // 神识
    { text: '你静坐冥想，神识逐渐向外延展，能清晰感知到周围数丈内的一切。', effects: { spirit: 2, mp: 30, cultivationExp: 50 }, journal: '冥想中神识延展，感知提升。' },
    { text: '你研读了一本古籍，书中关于神识修炼的记载让你受益匪浅。', effects: { spirit: 2, enlightenment: 1 }, journal: '研读古籍，神识修炼心得。' },
    { text: '你在梦中游历了一处奇异空间，醒来后神识似乎壮大了几分。', effects: { spirit: 3, mp: 50 }, journal: '梦中游历，神识壮大。' },
    { text: '你尝试用神识探查物品，虽然失败了，但神识在锻炼中有所成长。', effects: { spirit: 1, mp: 20 }, journal: '锻炼神识，虽败犹荣。' },
    { text: '一位修士向你传授了养神之法，你依法修炼，神识稳步提升。', effects: { spirit: 2, cultivationExp: 80 }, journal: '习得养神之法，神识提升。' },
  ],
  enlightenment: [ // 悟性
    { text: '你参悟功法时忽然灵光一闪，许多之前不懂的地方豁然开朗。', effects: { enlightenment: 2, cultivationExp: 150 }, journal: '参悟功法灵光一闪，悟性提升。' },
    { text: '你与一位高人论道，对方一席话让你茅塞顿开，悟性大进。', effects: { enlightenment: 3, reputation: 10 }, journal: '与高人论道，茅塞顿开。' },
    { text: '你在瀑布下静坐，听着水声渐渐入了定，悟出了一丝天地至理。', effects: { enlightenment: 2, willpower: 1 }, journal: '瀑布下静坐悟道，悟性提升。' },
    { text: '你翻阅了大量典籍，虽然没有找到想要的答案，但知识面拓宽了不少。', effects: { enlightenment: 1, reputation: 5 }, journal: '博览群书，知识面拓宽。' },
    { text: '你尝试推演一道难题，虽然花了很长时间，但最终成功解开，悟性见长。', effects: { enlightenment: 2, cultivationExp: 100 }, journal: '推演难题成功，悟性提升。' },
  ],
  agility: [ // 身法
    { text: '你在林间追逐一只灵鹿，虽然没有追上，但身法灵活了不少。', effects: { agility: 2, hp: 20 }, journal: '林间追逐灵鹿，身法提升。' },
    { text: '你学习了一套轻身功法，修炼后身轻如燕，行走间几乎没有声音。', effects: { agility: 3, cultivationExp: 80 }, journal: '习得轻身功法，身轻如燕。' },
    { text: '你在山涧间跳跃穿行，惊险地避开了几处险境，身法在生死间精进。', effects: { agility: 2, willpower: 1 }, journal: '山涧穿行，身法精进。' },
    { text: '你模仿猴子在树上攀爬，渐渐掌握了借力的技巧，身法提升。', effects: { agility: 2, strength: 1 }, journal: '模仿猴形，身法提升。' },
    { text: '你每日早起练习步法，脚下越来越稳，身法稳步提升。', effects: { agility: 1, hp: 10 }, journal: '每日练习步法，身法提升。' },
  ],
  fateLuck: [ // 气运
    { text: '你出门时捡到了一个钱袋，里面有不少银两，看来今天运气不错。', effects: { fateLuck: 1, silver: 100 }, journal: '捡到钱袋，气运提升。' },
    { text: '你在路边遇到一位老者，他送了你一株灵草，说是与你有缘。', effects: { fateLuck: 2, cultivationExp: 50 }, journal: '偶遇老者赠灵草，气运提升。' },
    { text: '你误入一处山洞，却发现里面有前人留下的修炼笔记。', effects: { fateLuck: 3, cultivationExp: 200, enlightenment: 1 }, journal: '误入山洞得前人笔记，气运提升。' },
    { text: '你在集市上淘到了一件看似普通实则暗藏玄机的物品。', effects: { fateLuck: 2, silver: -50 }, journal: '集市淘宝，气运提升。' },
    { text: '你躲避了一场突如其来的灾祸，似乎有好运在暗中庇护。', effects: { fateLuck: 1, hp: 30 }, journal: '躲避灾祸，气运提升。' },
  ],
  strength: [ // 力量
    { text: '你举石锁锻炼，手臂越来越有力，力量稳步提升。', effects: { strength: 2, physique: 1 }, journal: '举石锁锻炼，力量提升。' },
    { text: '你帮助村民搬移巨石，虽然累得气喘吁吁，但力量见长。', effects: { strength: 2, reputation: 5, silver: 30 }, journal: '帮助村民搬石，力量提升。' },
    { text: '你与一位力士切磋，虽然输了，但学到了不少发力技巧。', effects: { strength: 2, cultivationExp: 50 }, journal: '与力士切磋，力量提升。' },
    { text: '你服用了一颗大力丸，药力在体内爆发，力量暂时大增。', effects: { strength: 3, silver: -100 }, journal: '服用大力丸，力量提升。' },
    { text: '你每日坚持俯卧撑，胸肌和臂力都有了明显的增长。', effects: { strength: 1, hp: 20 }, journal: '坚持锻炼，力量提升。' },
  ],
  constitution: [ // 体质
    { text: '你在温泉中浸泡，药力渗透肌肤，体质得到了改善。', effects: { constitution: 2, hp: 50, silver: -30 }, journal: '温泉浸泡，体质改善。' },
    { text: '你感染了一场风寒，虽然难受了几天，但痊愈后体质似乎增强了。', effects: { constitution: 2, hp: -20 }, journal: '风寒痊愈，体质增强。' },
    { text: '你食用了一只百年老鳖，大补之物让你的体质提升了不少。', effects: { constitution: 3, hp: 80, silver: -200 }, journal: '食用百年老鳖，体质提升。' },
    { text: '你坚持每日冷水浴，身体越来越抗寒，体质稳步提升。', effects: { constitution: 1, willpower: 1 }, journal: '冷水浴锻炼，体质提升。' },
    { text: '你在毒瘴中行走了一段路，虽然中了点毒，但抗毒性增强了。', effects: { constitution: 2, hp: -30 }, journal: '毒瘴中行走，抗毒性增强。' },
  ],
  willpower: [ // 意志
    { text: '你在寒冬中静坐，忍受着刺骨的寒冷，意志在磨砺中变得坚定。', effects: { willpower: 3, constitution: 1 }, journal: '寒冬静坐，意志坚定。' },
    { text: '你面对诱惑坚守本心，虽然失去了一些好处，但意志得到了锻炼。', effects: { willpower: 2, silver: -50, merit: 10 }, journal: '坚守本心，意志锻炼。' },
    { text: '你连续修炼三天三夜，虽然疲惫不堪，但意志在坚持中成长。', effects: { willpower: 2, cultivationExp: 100, hp: -30 }, journal: '连续修炼，意志成长。' },
    { text: '你经历了一次失败，但没有气馁，而是总结经验继续前行，意志更加坚定。', effects: { willpower: 3, enlightenment: 1 }, journal: '经历失败不气馁，意志坚定。' },
    { text: '你在闹市中静坐，无视周围的喧嚣，渐渐进入了物我两忘的境界。', effects: { willpower: 2, spirit: 1 }, journal: '闹市静坐，意志提升。' },
  ],
  charm: [ // 魅力
    { text: '你精心打扮了一番，走在街上回头率颇高，心情愉悦。', effects: { charm: 2, reputation: 5, silver: -30 }, journal: '精心打扮，魅力提升。' },
    { text: '你帮助了一位迷路的孩童，他的母亲对你感激不尽，连连称赞。', effects: { charm: 1, reputation: 10, merit: 5 }, journal: '帮助孩童，魅力提升。' },
    { text: '你在宴会上谈吐不凡，吸引了不少人的注意，魅力值提升。', effects: { charm: 2, reputation: 10, silver: -50 }, journal: '宴会上谈吐不凡，魅力提升。' },
    { text: '你学习了一些礼仪知识，举止愈发优雅，魅力稳步提升。', effects: { charm: 1, enlightenment: 1 }, journal: '学习礼仪，魅力提升。' },
    { text: '你面带微笑与人交谈，对方如沐春风，对你好感大增。', effects: { charm: 2, reputation: 5 }, journal: '微笑交谈，魅力提升。' },
  ],
};

// 根据属性类型获取随机剧情
function getAttributeEvent(attrType, context = {}) {
  const events = ATTRIBUTE_EVENTS[attrType];
  if (!events || events.length === 0) return null;

  const event = randChoice(events);
  let text = event.text;
  let journal = event.journal;

  // 替换上下文变量
  if (context.location) {
    text = text.replace(/{location}/g, context.location);
    journal = journal.replace(/{location}/g, context.location);
  }

  return {
    text,
    journal,
    effects: { ...event.effects },
  };
}

module.exports = { getAttributeEvent, ATTRIBUTE_EVENTS };
