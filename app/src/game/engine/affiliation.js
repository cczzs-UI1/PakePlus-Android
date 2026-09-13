// 人物归属体系 - 后宅管理、偷情、被发现、后果系统
const { randChoice, chance, randInt, clamp } = require('./utils');

// 判断NPC是否属于某人的后宅
function isInHarem(npc, masterId) {
  if (!npc.family) return false;
  if (npc.family.spouse === masterId) return true;
  if (npc.concubines && npc.concubines.includes(masterId)) return false; // 这是主人的妾，不是npc的
  // 检查npc是否是某人的妾
  return npc.masterOfHarem === masterId;
}

// 获取NPC的后宅主人
function getHaremMaster(npc, allNpcs) {
  if (!npc.family) return null;
  if (npc.family.spouse) {
    const spouse = allNpcs.find(n => n.id === npc.family.spouse);
    if (spouse && spouse.gender === '男') return spouse; // 丈夫是主人
  }
  if (npc.masterOfHarem) {
    return allNpcs.find(n => n.id === npc.masterOfHarem);
  }
  return null;
}

// 获取NPC的后宅成员
function getHaremMembers(npc, allNpcs) {
  const members = [];
  if (npc.family?.spouse) {
    const spouse = allNpcs.find(n => n.id === npc.family.spouse);
    if (spouse) members.push({ npc: spouse, relation: '正妻' });
  }
  if (npc.concubines) {
    for (const cid of npc.concubines) {
      const concubine = allNpcs.find(n => n.id === cid);
      if (concubine) members.push({ npc: concubine, relation: '妾室' });
    }
  }
  return members;
}

// 判断NPC是否可以正大光明进行某些行为（男性主人）
function canActOpenly(npc) {
  return npc.gender === '男'; // 男性可以正大光明纳妾、逛青楼
}

// 判断NPC是否需要偷偷进行（女性后宅成员）
function mustActSecretly(npc, allNpcs) {
  const master = getHaremMaster(npc, allNpcs);
  return master !== null; // 有主人的后宅成员需要偷偷进行
}

// 偷情被发现的概率
function getDiscoveryChance(npc, location) {
  let chance_val = 15; // 基础15%被发现
  // 性格影响
  if (npc.personality === '淫荡风骚' || npc.personality === '欲求不满') chance_val += 10;
  if (npc.personality === '精明细算' || npc.personality === '圆滑世故') chance_val -= 10;
  // 地点影响
  if (['青楼', '明月台'].includes(location)) chance_val -= 10;
  if (['金銮殿', '大夏皇都', '青云剑宗', '丹塔'].includes(location)) chance_val += 15;
  // 标签影响
  if (npc.tags?.includes('水性杨花')) chance_val += 10;
  if (npc.tags?.includes('谨小慎微')) chance_val -= 15;
  return clamp(chance_val, 5, 80);
}

// 被发现后的后果
function handleDiscovery(npc, master, allNpcs, location) {
  const outcomes = [
    {
      name: '原谅',
      chance: 25,
      effect: () => {
        npc.reputation = (npc.reputation || 0) - randInt(5, 15);
        master.reputation = (master.reputation || 0) - randInt(2, 8);
        return `${master.name}虽然愤怒，但最终选择了原谅${npc.name}，只是警告下不为例。`;
      }
    },
    {
      name: '合离',
      chance: 20,
      effect: () => {
        if (npc.family) npc.family.spouse = null;
        npc.masterOfHarem = null;
        npc.reputation = (npc.reputation || 0) - randInt(10, 25);
        master.reputation = (master.reputation || 0) - randInt(5, 15);
        return `${master.name}无法忍受${npc.name}的背叛，一纸休书将其休弃，两人从此各奔东西。`;
      }
    },
    {
      name: '惩罚',
      chance: 30,
      effect: () => {
        npc.hp.current = Math.max(1, npc.hp.current - randInt(20, 50));
        npc.reputation = (npc.reputation || 0) - randInt(15, 30);
        npc.statusEffects = npc.statusEffects || [];
        npc.statusEffects.push({ name: '禁足', turns: 30 });
        return `${master.name}大怒，将${npc.name}狠狠责罚了一顿，并禁足三月，不许踏出房门一步。`;
      }
    },
    {
      name: '逐出府',
      chance: 15,
      effect: () => {
        if (npc.family) npc.family.spouse = null;
        npc.masterOfHarem = null;
        npc.silver = Math.max(0, (npc.silver || 0) - randInt(50, 200));
        npc.reputation = (npc.reputation || 0) - randInt(20, 40);
        // 随机移动到其他地点
        const locations = ['清风镇', '落日森林', '东海渔村', '落日森林', '自由坊市'];
        npc.location = randChoice(locations);
        return `${master.name}怒不可遏，将${npc.name}逐出府邸，身无分文地流落他乡。`;
      }
    },
    {
      name: '沉塘',
      chance: 10,
      effect: () => {
        npc.isAlive = false;
        npc.deathCause = '偷情被沉塘';
        master.reputation = (master.reputation || 0) - randInt(10, 20);
        return `${master.name}为保全家族颜面，将${npc.name}偷偷沉了塘，对外只称暴病而亡。`;
      }
    },
  ];

  // 根据主人性格调整概率
  let adjustedOutcomes = outcomes.map(o => ({ ...o }));
  if (master.personality === '冷厉决绝' || master.personality === '阴险狡诈') {
    adjustedOutcomes.find(o => o.name === '沉塘').chance += 15;
    adjustedOutcomes.find(o => o.name === '原谅').chance -= 10;
  }
  if (master.personality === '温和宽厚' || master.personality === '古道热肠') {
    adjustedOutcomes.find(o => o.name === '原谅').chance += 15;
    adjustedOutcomes.find(o => o.name === '沉塘').chance -= 10;
  }

  // 随机选择后果
  const total = adjustedOutcomes.reduce((sum, o) => sum + o.chance, 0);
  let roll = Math.random() * total;
  for (const outcome of adjustedOutcomes) {
    roll -= outcome.chance;
    if (roll <= 0) {
      const text = outcome.effect();
      return { outcome: outcome.name, text };
    }
  }
  return { outcome: '原谅', text: outcomes[0].effect() };
}

// 偷偷进行的行为
function secretAction(npc, actionType, allNpcs, location) {
  const master = getHaremMaster(npc, allNpcs);
  if (!master) return { needSecret: false };

  const discoveryChance = getDiscoveryChance(npc, location);
  if (chance(discoveryChance)) {
    const result = handleDiscovery(npc, master, allNpcs, location);
    return { needSecret: true, discovered: true, ...result };
  }
  return { needSecret: true, discovered: false };
}

module.exports = {
  isInHarem,
  getHaremMaster,
  getHaremMembers,
  canActOpenly,
  mustActSecretly,
  getDiscoveryChance,
  handleDiscovery,
  secretAction,
};
