// 情感类大世界剧情库 - 一见钟情/求爱/表白/示好/赠礼/厌恶/憎恶/仇杀/情杀/强迫/迷药等
// 所有剧情根据双方属性、好感度设定，赠礼只能赠送NPC有的东西
const { randChoice, chance, randInt, clamp } = require('./utils');

// 辅助：获取NPC库房中的随机物品
function getRandomItem(npc) {
  const items = npc.warehouse?.items || npc.inventory || [];
  if (items.length === 0) return null;
  return randChoice(items);
}

// 辅助：从NPC库房移除物品
function removeItem(npc, itemName) {
  const items = npc.warehouse?.items || npc.inventory || [];
  const idx = items.findIndex(i => i.name === itemName);
  if (idx === -1) return false;
  items[idx].count--;
  if (items[idx].count <= 0) items.splice(idx, 1);
  return true;
}

// 辅助：添加物品到NPC库房
function addItem(npc, itemName, count = 1) {
  const items = npc.warehouse?.items || npc.inventory;
  if (!items) return;
  const existing = items.find(i => i.name === itemName);
  if (existing) existing.count += count;
  else items.push({ name: itemName, count });
}

// ===== 一见钟情 =====
const loveAtFirstSightEvents = [
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && (a.favorWithPlayer === undefined || true),
    text: (a, b, l) => `${a.name}在${l}偶然遇见了${b.name}，只一眼便觉心跳加速，面红耳赤，竟是一见钟情，久久不能忘怀。`,
    effect: (a, b) => {
      a.relations = a.relations || {};
      a.relations[b.id] = (a.relations[b.id] || 0) + randInt(20, 40);
    },
    journal: (a, b, l) => `${l}·${a.name}对${b.name}一见钟情。`
  },
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender,
    text: (a, b, l) => `${a.name}在${l}的集市上与${b.name}擦肩而过，回眸一笑间，${a.name}便失了魂，站在原地半晌才回过神来。`,
    effect: (a, b) => {
      a.relations = a.relations || {};
      a.relations[b.id] = (a.relations[b.id] || 0) + randInt(15, 30);
    },
    journal: (a, b, l) => `${l}·${a.name}对${b.name}一见倾心。`
  },
];

// ===== 求爱/表白 =====
const confessionEvents = [
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && (a.relations?.[b.id] || 0) >= 30,
    text: (a, b, l) => `${a.name}在${l}的花园中鼓起勇气，向${b.name}表明了心意，言辞恳切，脸涨得通红。`,
    effect: (a, b) => {
      const currentFavor = b.relations?.[a.id] || 0;
      if (currentFavor >= 20) {
        b.relations = b.relations || {};
        b.relations[a.id] = currentFavor + randInt(10, 25);
        a.relations = a.relations || {};
        a.relations[b.id] = (a.relations[b.id] || 0) + randInt(5, 15);
      } else {
        b.relations = b.relations || {};
        b.relations[a.id] = Math.max(-20, currentFavor - randInt(5, 15));
      }
    },
    journal: (a, b, l) => `${l}·${a.name}向${b.name}表白。`
  },
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && (a.relations?.[b.id] || 0) >= 50,
    text: (a, b, l) => `${a.name}在${l}的月下设宴，席间取出一支玉簪，郑重地向${b.name}求亲，言辞真挚，令人动容。`,
    effect: (a, b) => {
      const currentFavor = b.relations?.[a.id] || 0;
      if (currentFavor >= 40) {
        if (!a.family) a.family = {};
        if (!b.family) b.family = {};
        a.family.spouse = b.id;
        b.family.spouse = a.id;
        b.masterOfHarem = a.gender === '男' ? a.id : null;
        a.reputation = (a.reputation || 0) + randInt(10, 25);
        b.reputation = (b.reputation || 0) + randInt(5, 15);
        // 关系网链接：双方互为配偶
        if (!a.relations) a.relations = {};
        a.relations[b.id] = { type: '配偶', favor: currentFavor, name: b.name };
        if (!b.relations) b.relations = {};
        b.relations[a.id] = { type: '配偶', favor: a.relations?.[b.id]?.favor || 50, name: a.name };
      }
    },
    journal: (a, b, l) => `${l}·${a.name}向${b.name}求亲。`
  },
];

// ===== 示好 =====
const friendlyEvents = [
  {
    condition: (a, b) => a.age >= 12 && (a.relations?.[b.id] || 0) >= 0,
    text: (a, b, l) => `${a.name}在${l}遇到${b.name}，主动上前寒暄，态度热情，言语间满是亲近之意。`,
    effect: (a, b) => {
      b.relations = b.relations || {};
      b.relations[a.id] = (b.relations[a.id] || 0) + randInt(2, 8);
    },
    journal: (a, b, l) => `${l}·${a.name}向${b.name}示好。`
  },
];

// ===== 赠礼（只能赠送NPC有的东西）=====
const giftEvents = [
  {
    condition: (a, b) => a.age >= 12 && (a.warehouse?.items?.length > 0 || a.inventory?.length > 0),
    text: (a, b, l) => {
      const item = getRandomItem(a);
      if (item) {
        return `${a.name}在${l}将自己珍藏的${item.name}赠送给${b.name}，${b.name}接过礼物，面露喜色。`;
      }
      return `${a.name}在${l}想送${b.name}一件礼物，却发现身无长物，只得作罢。`;
    },
    effect: (a, b) => {
      const item = getRandomItem(a);
      if (item) {
        removeItem(a, item.name);
        addItem(b, item.name);
        b.relations = b.relations || {};
        // 根据喜恶调整好感
        let favorChange = randInt(3, 10);
        if (b.likes?.includes(item.name)) favorChange = randInt(10, 20);
        if (b.dislikes?.includes(item.name)) favorChange = -randInt(5, 15);
        b.relations[a.id] = (b.relations[a.id] || 0) + favorChange;
      }
    },
    journal: (a, b, l) => {
      const item = getRandomItem(a);
      return `${l}·${a.name}赠送${item?.name || '礼物'}给${b.name}。`;
    }
  },
];

// ===== 厌恶 =====
const dislikeEvents = [
  {
    condition: (a, b) => (a.relations?.[b.id] || 0) < 0,
    text: (a, b, l) => `${a.name}在${l}看到${b.name}，面露厌恶之色，冷哼一声便转身离去，毫不掩饰自己的反感。`,
    effect: (a, b) => {
      a.relations = a.relations || {};
      a.relations[b.id] = (a.relations[b.id] || 0) - randInt(2, 8);
    },
    journal: (a, b, l) => `${l}·${a.name}对${b.name}表露厌恶。`
  },
];

// ===== 憎恶 =====
const hatredEvents = [
  {
    condition: (a, b) => (a.relations?.[b.id] || 0) < -30,
    text: (a, b, l) => `${a.name}在${l}与${b.name}相遇，眼中满是憎恶，咬牙切齿地咒骂了几句，若非有人拦着几乎要动手。`,
    effect: (a, b) => {
      a.relations = a.relations || {};
      a.relations[b.id] = (a.relations[b.id] || 0) - randInt(5, 15);
      b.relations = b.relations || {};
      b.relations[a.id] = (b.relations[a.id] || 0) - randInt(3, 10);
    },
    journal: (a, b, l) => `${l}·${a.name}对${b.name}心生憎恶。`
  },
];

// ===== 仇杀 =====
const revengeKillEvents = [
  {
    condition: (a, b) => (a.relations?.[b.id] || 0) < -60 && a.age >= 16 && b.isAlive,
    text: (a, b, l) => `${a.name}在${l}的偏僻处伏击了${b.name}，新仇旧恨一齐涌上，出手狠辣，招招致命。`,
    effect: (a, b) => {
      const damage = randInt(30, 80);
      b.hp.current = Math.max(0, b.hp.current - damage);
      if (b.hp.current <= 0) {
        b.isAlive = false;
        b.deathCause = `被${a.name}仇杀`;
        a.reputation = (a.reputation || 0) - randInt(20, 50);
      } else {
        b.hp.current = Math.max(1, b.hp.current);
        a.relations = a.relations || {};
        a.relations[b.id] = (a.relations[b.id] || 0) - randInt(10, 25);
      }
    },
    journal: (a, b, l) => `${l}·${a.name}伏击仇杀${b.name}。`
  },
];

// ===== 情杀 =====
const loveKillEvents = [
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && (a.relations?.[b.id] || 0) < -40 && b.isAlive,
    text: (a, b, l) => `${a.name}因爱生恨，在${l}将${b.name}约至僻静处，争执间痛下杀手，口中喃喃着"我得不到的谁也别想得到"。`,
    effect: (a, b) => {
      const damage = randInt(40, 100);
      b.hp.current = Math.max(0, b.hp.current - damage);
      if (b.hp.current <= 0) {
        b.isAlive = false;
        b.deathCause = `被${a.name}情杀`;
        a.reputation = (a.reputation || 0) - randInt(30, 60);
        a.statusEffects = a.statusEffects || [];
        a.statusEffects.push({ name: '心魔', turns: 90 });
      }
    },
    journal: (a, b, l) => `${l}·${a.name}因爱生恨情杀${b.name}。`
  },
];

// ===== 强迫 =====
const forceEvents = [
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && a.realmLevel >= b.realmLevel && b.isAlive,
    text: (a, b, l) => a.gender === '女'
      ? `${a.name}在${l}的偏僻处拦住了${b.name}，见四下无人，竟起了歹意，仗着修为将${b.name}压入暗处。`
      : `${a.name}在${l}的偏僻处拦住了${b.name}，见四下无人，竟起了歹意，用强力将${b.name}拖入了暗处。`,
    effect: (a, b) => {
      b.hp.current = Math.max(1, b.hp.current - randInt(10, 30));
      b.relations = b.relations || {};
      b.relations[a.id] = (b.relations[a.id] || 0) - randInt(30, 60);
      a.reputation = (a.reputation || 0) - randInt(15, 40);
      // 可能怀孕
      if (b.gender === '女' && chance(20)) {
        b.isPregnant = true;
        b.pregnancyMonths = 0;
        b.pregnancyFather = a.id;
      }
      b.statusEffects = b.statusEffects || [];
      b.statusEffects.push({ name: '心理阴影', turns: 60 });
    },
    journal: (a, b, l) => `${l}·${a.name}强迫了${b.name}。`
  },
];

// ===== 迷药 =====
const drugEvents = [
  {
    condition: (a, b) => a.age >= 16 && b.age >= 16 && a.gender !== b.gender && (a.warehouse?.items?.some(i => i.name.includes('迷药') || i.name.includes('春药')) || chance(30)),
    text: (a, b, l) => a.gender === '女'
      ? `${a.name}在${l}的茶楼中请${b.name}喝茶，趁其不备在茶中下了迷药，${b.name}饮下后不久便头晕目眩，浑身无力。`
      : `${a.name}在${l}的酒楼中请${b.name}喝酒，趁其不备在酒中下了迷药，${b.name}饮下后不久便头晕目眩，浑身无力。`,
    effect: (a, b) => {
      b.hp.current = Math.max(1, b.hp.current - randInt(5, 15));
      b.mp.current = Math.max(0, b.mp.current - randInt(20, 50));
      b.relations = b.relations || {};
      b.relations[a.id] = (b.relations[a.id] || 0) - randInt(25, 50);
      a.reputation = (a.reputation || 0) - randInt(10, 30);
      b.statusEffects = b.statusEffects || [];
      b.statusEffects.push({ name: '中毒', turns: 3 });
      // 可能怀孕
      if (b.gender === '女' && chance(25)) {
        b.isPregnant = true;
        b.pregnancyMonths = 0;
        b.pregnancyFather = a.id;
      }
    },
    journal: (a, b, l) => `${l}·${a.name}对${b.name}下了迷药。`
  },
];

// 所有情感剧情
const ALL_EMOTION_EVENTS = [
  ...loveAtFirstSightEvents,
  ...confessionEvents,
  ...friendlyEvents,
  ...giftEvents,
  ...dislikeEvents,
  ...hatredEvents,
  ...revengeKillEvents,
  ...loveKillEvents,
  ...forceEvents,
  ...drugEvents,
];

// 根据NPC和目标选择合适的情感剧情
function pickEmotionEvent(npc, target, location) {
  const valid = ALL_EMOTION_EVENTS.filter(e => e.condition(npc, target));
  if (valid.length === 0) return null;
  return randChoice(valid);
}

// 触发情感剧情
function triggerEmotionEvent(npc, allNpcs, location) {
  // 选择目标：优先选择有关系的NPC，否则随机选择同地点的异性
  let targets = allNpcs.filter(n =>
    n.id !== npc.id && n.isAlive && n.location === location && n.gender !== npc.gender && n.age >= 12
  );

  // 优先选择有关系的
  const withRelations = targets.filter(n => npc.relations?.[n.id] !== undefined);
  if (withRelations.length > 0 && chance(70)) {
    targets = withRelations;
  }

  if (targets.length === 0) return null;

  const target = randChoice(targets);
  const event = pickEmotionEvent(npc, target, location);
  if (!event) return null;

  const text = event.text(npc, target, location);
  event.effect(npc, target);
  const journal = event.journal(npc, target, location);

  return { text, journal, target: target.name };
}

module.exports = {
  ALL_EMOTION_EVENTS,
  pickEmotionEvent,
  triggerEmotionEvent,
};
