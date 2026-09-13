// NPC仆役相关随机剧情记事库
const { randInt, randChoice, clamp, genderize } = require('./utils');
const { generateServantForSale } = require('./servant');

// NPC购买仆役剧情
const NPC_BUY_SERVANT_EVENTS = [
  {
    text: '{npc}在牙人所看中了一个{servantType}，花了{price}两银子买了下来，取名{servantName}。',
    condition: npc => npc.silver >= 100 && (!npc.servants || npc.servants.length < 5),
  },
  {
    text: '{npc}府上缺人使唤，便去牙人所买了个{servantType}{servantName}回来，吩咐他/她好生干活。',
    condition: npc => npc.silver >= 80 && (!npc.servants || npc.servants.length < 8),
  },
  {
    text: '{npc}一时兴起，在牙人所买下了容貌出众的{servantName}，收为贴身{servantType}。',
    condition: npc => npc.silver >= 500 && ['好色', '淫荡', '风流'].includes(npc.personality),
  },
];

// NPC使唤仆役剧情
const NPC_USE_SERVANT_EVENTS = [
  {
    text: '{npc}吩咐{servantName}去采买物品，{servantName}办得妥妥当当，{npc}很是满意。',
    condition: s => s.personality === '勤快' || s.personality === '机灵',
  },
  {
    text: '{servantName}笨手笨脚打碎了{npc}心爱的花瓶，被{npc}一顿好打。',
    condition: s => s.personality === '粗心',
    effects: { health: -15, satisfaction: -20 },
  },
  {
    text: '{npc}让{servantName}伺候更衣，{servantName}小心翼翼，不敢有丝毫怠慢。',
    condition: s => s.personality === '温顺' || s.personality === '胆小',
  },
  {
    text: '{servantName}偷懒被{npc}发现，被罚去扫了一个月的院子。',
    condition: s => s.personality === '懒惰',
    effects: { satisfaction: -15 },
  },
  {
    text: '{npc}心情大好，赏了{servantName}一些碎银子，{servantName}千恩万谢。',
    condition: npc => ['豪爽', '善良', '慷慨'].includes(npc.personality),
    effects: { satisfaction: 10, loyalty: 8 },
  },
  {
    text: '{servantName}办事得力，{npc}将他/她升为了管事，管着其他下人。',
    condition: s => s.loyalty >= 70 && s.skills.includes('管家'),
    effects: { satisfaction: 20, loyalty: 15 },
  },
];

// NPC驱逐仆役剧情
const NPC_DISMISS_SERVANT_EVENTS = [
  {
    text: '{servantName}犯了大错，被{npc}一怒之下逐出府去，连工钱都没结。',
    condition: s => s.satisfaction < 30 || s.loyalty < 20,
  },
  {
    text: '{npc}家道中落，养不起那么多下人了，便将{servantName}遣散回家。',
    condition: npc => npc.silver < 100,
  },
  {
    text: '{servantName}偷了府中财物被发现，{npc}将他/她扭送官府，严惩不贷。',
    condition: s => s.personality === '狡猾' || s.personality === '贪财',
  },
  {
    text: '{servantName}到了年纪，{npc}仁慈地给了他/她一笔银子，让他/她还乡成家。',
    condition: npc => ['善良', '仁慈'].includes(npc.personality) && s.age >= 25,
  },
];

// NPC与仆役的私情剧情
const NPC_SERVANT_AFFAIR_EVENTS = [
  {
    text: '{npc}与贴身{servantType}{servantName}暗生情愫，时常在假山后媾和。',
    condition: npc => ['好色', '淫荡', '风流'].includes(npc.personality) && s.gender !== npc.gender && s.age >= 16,
    effects: { satisfaction: 15, loyalty: 20 },
  },
  {
    text: '{npc}酒后失态，强占了{servantName}的身子，让对方给自己口了好几次，事后{servantName}仍欲求不满地自摸希望能再来一次。',
    condition: npc => ['好色', '淫荡'].includes(npc.personality) && s.gender !== npc.gender,
    effects: { satisfaction: -10, loyalty: 5 },
  },
  {
    text: '{servantName}衣衫半裸地跪在{npc}面前自慰，{npc}看得动了情将{servantName}直接就地操了。',
    condition: s => s.personality === '狡猾' || s.personality === '贪财',
    effects: { satisfaction: 10, loyalty: 10 },
  },
  {
    text: '{npc}纳{servantName}为妾，府中上下都来道贺。',
    condition: npc => npc.gender === '男' && s.gender === '女' && s.loyalty >= 80,
    effects: { satisfaction: 30, loyalty: 30 },
  },
  {
    text: '{npc}与{servantName}的私情被正妻发现，正妻大怒，将{servantName}发卖了出去。',
    condition: npc => npc.wife && s.gender === '女' && Math.random() < 0.3,
  },
];

// 仆役之间的剧情
const SERVANT_TO_SERVANT_EVENTS = [
  {
    text: '府中两个仆役{servant1}和{servant2}为了争宠吵了起来，闹得沸沸扬扬。',
  },
  {
    text: '{servant1}和{servant2}暗生情愫，常在月下私会。',
    condition: (s1, s2) => s1.gender !== s2.gender,
  },
  {
    text: '{servant1}欺负{servant2}，让他/她干最累的活。',
    condition: (s1, s2) => s1.loyalty > s2.loyalty,
  },
  {
    text: '{servant1}和{servant2}结为异姓兄弟/姐妹，互相照应。',
  },
  {
    text: '{servant1}偷了{servant2}的私房钱，两人大吵一架。',
    condition: s1 => s1.personality === '贪财' || s1.personality === '狡猾',
  },
];

// 仆役逃跑剧情
const SERVANT_ESCAPE_EVENTS = [
  {
    text: '{servantName}不堪忍受虐待，趁夜逃出了{npc}府，不知所踪。',
    condition: s => s.satisfaction < 20 && s.loyalty < 30,
  },
  {
    text: '{servantName}卷了府中财物逃走，{npc}大怒，派人四处追捕。',
    condition: s => s.personality === '贪财' && s.loyalty < 40,
  },
  {
    text: '{servantName}思乡心切，偷偷跑回了老家，{npc}也懒得追究。',
    condition: s => s.satisfaction < 40 && s.age < 20,
  },
];

// 为NPC生成仆役相关事件
function generateNpcServantEvent(npc) {
  const hasServants = npc.servants && npc.servants.length > 0;
  const events = [];

  // 购买仆役
  if (!hasServants || npc.servants.length < 5) {
    for (const e of NPC_BUY_SERVANT_EVENTS) {
      if (!e.condition || e.condition(npc)) {
        events.push({ type: 'buy', event: e });
      }
    }
  }

  // 使用仆役
  if (hasServants) {
    for (const servant of npc.servants) {
      for (const e of NPC_USE_SERVANT_EVENTS) {
        if (!e.condition || e.condition(servant) || e.condition(npc)) {
          events.push({ type: 'use', event: e, servant });
        }
      }
      // 驱逐
      for (const e of NPC_DISMISS_SERVANT_EVENTS) {
        if (!e.condition || e.condition(servant) || e.condition(npc)) {
          events.push({ type: 'dismiss', event: e, servant });
        }
      }
      // 私情
      for (const e of NPC_SERVANT_AFFAIR_EVENTS) {
        if (!e.condition || e.condition(npc, servant)) {
          events.push({ type: 'affair', event: e, servant });
        }
      }
      // 逃跑
      for (const e of SERVANT_ESCAPE_EVENTS) {
        if (!e.condition || e.condition(servant, npc)) {
          events.push({ type: 'escape', event: e, servant });
        }
      }
    }
  }

  if (events.length === 0) return null;

  const chosen = randChoice(events);
  const e = chosen.event;
  let text = e.text.replace(/{npc}/g, npc.name);

  if (chosen.servant) {
    text = text.replace(/{servantName}/g, chosen.servant.name);
    text = text.replace(/{servantType}/g, chosen.servant.type || '仆役');
  } else if (chosen.type === 'buy') {
    const newServant = generateServantForSale();
    text = text.replace(/{servantName}/g, newServant.name);
    text = text.replace(/{servantType}/g, newServant.type);
    text = text.replace(/{price}/g, newServant.price);
    // NPC实际购买
    if (!npc.servants) npc.servants = [];
    npc.servants.push({ ...newServant, forSale: false, ownerId: npc.id });
    npc.silver -= newServant.price;
  }

  // 应用效果
  if (chosen.servant && e.effects) {
    if (e.effects.loyalty) chosen.servant.loyalty = clamp(chosen.servant.loyalty + e.effects.loyalty, 0, 100);
    if (e.effects.satisfaction) chosen.servant.satisfaction = clamp(chosen.servant.satisfaction + e.effects.satisfaction, 0, 100);
    if (e.effects.health) chosen.servant.health = clamp(chosen.servant.health + e.effects.health, 0, 100);
  }
  // 性别指代修正：文本中的他/她按仆从性别判定
  text = genderize(text, chosen.servant || npc);

  // 处理驱逐和逃跑
  if (chosen.type === 'dismiss' || chosen.type === 'escape') {
    if (chosen.servant && npc.servants) {
      const idx = npc.servants.findIndex(s => s.id === chosen.servant.id);
      if (idx >= 0) npc.servants.splice(idx, 1);
    }
  }

  return {
    text,
    type: chosen.type,
    npc,
    servant: chosen.servant,
  };
}

module.exports = {
  NPC_BUY_SERVANT_EVENTS,
  NPC_USE_SERVANT_EVENTS,
  NPC_DISMISS_SERVANT_EVENTS,
  NPC_SERVANT_AFFAIR_EVENTS,
  SERVANT_TO_SERVANT_EVENTS,
  SERVANT_ESCAPE_EVENTS,
  generateNpcServantEvent,
};
