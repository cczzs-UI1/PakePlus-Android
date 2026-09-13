// 装备系统 - 装备槽位、属性加成、装备管理
// 装备槽位：weapon(武器), armor(防具), accessory(饰品)

const { ITEMS } = require('../data/items');
const { FORGE_RECIPES } = require('./forge');
const ITEM_SLOT_MAP = { weapon: 'weapon', armor: 'armor', accessory: 'accessory', 武器: 'weapon', 防具: 'armor', 饰品: 'accessory' };

const EQUIPMENT_SLOTS = {
  weapon: { name: '武器', desc: '增加攻击力' },
  armor: { name: '防具', desc: '增加防御力和气血' },
  accessory: { name: '饰品', desc: '增加各种属性' },
};

// 所有装备的属性加成
const EQUIPMENT_STATS = {
  // ===== 武器 =====
  '铁剑': { slot: 'weapon', attack: 5, accuracy: 2, desc: '普通铁剑，锋利度一般。' },
  '钢刀': { slot: 'weapon', attack: 8, critRate: 3, desc: '精钢打造的刀，威力不俗。' },
  '长枪': { slot: 'weapon', attack: 7, accuracy: 5, desc: '长兵器，攻击范围大。' },
  '弓箭': { slot: 'weapon', attack: 6, agility: 3, desc: '远程武器，身法加成。' },
  '青锋剑': { slot: 'weapon', attack: 15, accuracy: 8, critRate: 5, desc: '青光闪闪的宝剑，削铁如泥。' },
  '碎星锤': { slot: 'weapon', attack: 20, strength: 5, desc: '沉重的巨锤，力大势沉。' },
  '飞剑': { slot: 'weapon', attack: 25, agility: 8, critRate: 8, desc: '可御剑飞行的法器，攻击迅捷。' },
  '桃木剑': { slot: 'weapon', attack: 3, magicAttack: 10, desc: '桃木所制，对鬼魅有奇效。' },
  '朱砂笔': { slot: 'weapon', attack: 4, magicAttack: 12, desc: '画符施法的法器。' },
  '拂尘': { slot: 'weapon', attack: 5, magicAttack: 15, spirit: 10, desc: '道门法器，灵力充沛。' },
  '玉如意': { slot: 'weapon', attack: 6, magicAttack: 18, charm: 5, desc: '玉制如意，温润而有灵性。' },
  '芭蕉扇': { slot: 'weapon', attack: 12, magicAttack: 25, desc: '可扇出大风的灵宝。' },
  '紫金葫芦': { slot: 'weapon', attack: 8, magicAttack: 30, desc: '可收人入内的仙家法宝。' },
  '轩辕剑': { slot: 'weapon', attack: 50, accuracy: 20, critRate: 15, desc: '上古神兵，威力无穷。' },
  '诛仙剑': { slot: 'weapon', attack: 60, critRate: 25, desc: '诛仙四剑之首，杀伐之气冲天。' },

  // ===== 防具 =====
  '布衣': { slot: 'armor', defense: 2, hpMax: 10, desc: '普通布衣，聊胜于无。' },
  '皮甲': { slot: 'armor', defense: 5, hpMax: 20, agility: 2, desc: '兽皮缝制，轻便灵活。' },
  '铁甲': { slot: 'armor', defense: 10, hpMax: 40, strength: 3, desc: '铁制铠甲，防护力强。' },
  '法袍': { slot: 'armor', defense: 4, hpMax: 15, magicDefense: 10, mpMax: 20, desc: '修士法袍，灵力护体。' },
  '道袍': { slot: 'armor', defense: 5, hpMax: 20, magicDefense: 15, spirit: 10, desc: '道门法袍，清心静气。' },
  '袈裟': { slot: 'armor', defense: 6, hpMax: 25, willpower: 10, desc: '佛门袈裟，邪祟不侵。' },
  '五行混天绫': { slot: 'armor', defense: 15, hpMax: 50, magicDefense: 20, desc: '五行之力凝聚的法宝。' },
  '战甲': { slot: 'armor', defense: 18, hpMax: 80, strength: 5, desc: '战将铠甲，防护极佳。' },
  '玄武甲': { slot: 'armor', defense: 25, hpMax: 120, magicDefense: 15, desc: '玄武龟壳所制，坚不可摧。' },
  '天蚕衣': { slot: 'armor', defense: 20, hpMax: 100, agility: 10, desc: '天蚕丝织成，刀枪不入且轻便。' },
  '九龙袍': { slot: 'armor', defense: 30, hpMax: 150, magicDefense: 25, charm: 10, desc: '绣有九龙的皇袍，气运加身。' },

  // ===== 饰品 =====
  '玉佩': { slot: 'accessory', charm: 5, spirit: 5, hpMax: 10, desc: '温润玉佩，养气安神。' },
  '玉簪': { slot: 'accessory', charm: 8, enlightenment: 3, desc: '玉制发簪，雅致脱俗。' },
  '戒指': { slot: 'accessory', attack: 3, defense: 3, desc: '普通戒指，略有加成。' },
  '储物戒': { slot: 'accessory', spirit: 10, mpMax: 15, desc: '可储物的法器戒指。' },
  '纳戒': { slot: 'accessory', spirit: 20, mpMax: 30, enlightenment: 5, desc: '更大空间的储物戒指。' },
  '灵兽袋': { slot: 'accessory', charm: 3, beastTaming: 10, desc: '可收纳灵兽的袋子。' },
  '传讯玉符': { slot: 'accessory', spirit: 5, enlightenment: 3, desc: '可远距离传讯的玉符。' },
  '护身符': { slot: 'accessory', defense: 5, hpMax: 20, willpower: 5, desc: '辟邪护身的符箓。' },
  '避水珠': { slot: 'accessory', defense: 3, agility: 5, desc: '可在水中自由呼吸的宝珠。' },
  '避火珠': { slot: 'accessory', defense: 5, magicDefense: 10, desc: '可抵御火焰的宝珠。' },
  '聚灵珠': { slot: 'accessory', spirit: 15, mpMax: 30, cultivationSpeed: 5, desc: '聚集灵气的宝珠，修炼加速。' },
  '定魂珠': { slot: 'accessory', willpower: 15, spirit: 10, mpMax: 20, desc: '安定魂魄的宝珠，心魔不生。' },
  '混沌珠': { slot: 'accessory', spirit: 50, mpMax: 100, cultivationSpeed: 20, enlightenment: 15, desc: '混沌之力凝结的至宝，功效非凡。' },
};

// 获取装备属性
// 装备属性：优先内置装备表，兜底查物品库（锻造/商店/掉落/拍卖获得的装备均可穿戴）
function getEquipmentStats(itemName) {
  if (EQUIPMENT_STATS[itemName]) return EQUIPMENT_STATS[itemName];
  // 锻造装备（FORGE_RECIPES，不在物品库中）兜底
  const fr = FORGE_RECIPES.find(r => r.name === itemName);
  if (fr) {
    const fslot = fr.type === '武器' ? 'weapon' : fr.type === '防具' ? 'armor' : fr.type === '饰品' ? 'accessory' : null;
    if (fslot) {
      return { slot: fslot, attack: fr.baseAtk || 0, defense: fr.baseDef || 0, desc: fr.desc || '', forgeItem: true };
    }
  }
  const it = ITEMS[itemName];
  if (!it) return null;
  const slot = ITEM_SLOT_MAP[it.type] || ITEM_SLOT_MAP[it.slot];
  if (!slot) return null;
  return {
    slot,
    attack: it.attack || 0,
    defense: it.defense || 0,
    magicAttack: it.magicAttack || it.magic || 0,
    magicDefense: it.magicDefense || 0,
    accuracy: it.accuracy || 0,
    critRate: it.critRate || 0,
    dodgeRate: it.dodgeRate || 0,
    agility: it.agility || 0,
    strength: it.strength || 0,
    hpMax: it.hpMax || it.hp || 0,
    mpMax: it.mpMax || it.mp || 0,
    spirit: it.spirit || 0,
    charm: it.charm || 0,
    enlightenment: it.enlightenment || 0,
    willpower: it.willpower || 0,
    cultivationSpeed: it.cultivationSpeed || it.cultivateBonus || 0,
    beastTaming: it.beastTaming || 0,
    desc: it.desc || '',
  };
}

// 判断是否为装备
function isEquipment(itemName) {
  if (EQUIPMENT_STATS[itemName]) return true;
  if (FORGE_RECIPES.some(r => r.name === itemName && ['武器', '防具', '饰品'].includes(r.type))) return true;
  const it = ITEMS[itemName];
  if (!it) return false;
  return !!(ITEM_SLOT_MAP[it.type] || ITEM_SLOT_MAP[it.slot]);
}

// 获取装备槽位
function getEquipmentSlot(itemName) {
  const stats = getEquipmentStats(itemName);
  return stats ? stats.slot : null;
}

// 计算装备总加成
function calcEquipmentBonus(equipment) {
  const bonus = {
    attack: 0, defense: 0, magicAttack: 0, magicDefense: 0,
    accuracy: 0, critRate: 0, dodgeRate: 0, agility: 0,
    strength: 0, hpMax: 0, mpMax: 0, spirit: 0,
    charm: 0, enlightenment: 0, willpower: 0,
    cultivationSpeed: 0, beastTaming: 0,
  };
  if (!equipment) return bonus;
  for (const slot of Object.keys(EQUIPMENT_SLOTS)) {
    const itemName = equipment[slot];
    const stats = itemName ? getEquipmentStats(itemName) : null;
    if (stats) {
      for (const [key, value] of Object.entries(stats)) {
        if (key !== 'slot' && key !== 'desc' && bonus[key] !== undefined) {
          bonus[key] += value;
        }
      }
    }
  }
  return bonus;
}

// 初始化装备槽
function initEquipment(player) {
  if (!player.equipment) {
    player.equipment = { weapon: null, armor: null, accessory: null };
  }
}

// 装备物品
function equipItem(player, itemName) {
  initEquipment(player);
  const stats = getEquipmentStats(itemName);
  if (!stats) return { error: '该物品不可装备' };

  // 检查背包中是否有该物品
  const invItem = player.inventory.find(i => i.name === itemName);
  if (!invItem || invItem.count <= 0) return { error: '背包中没有该物品' };

  const slot = stats.slot;
  const oldItem = player.equipment[slot];

  // 如果槽位已有装备，先卸下
  if (oldItem) {
    const existing = player.inventory.find(i => i.name === oldItem);
    if (existing) existing.count += 1;
    else player.inventory.push({ name: oldItem, count: 1 });
  }

  // 装备新物品
  player.equipment[slot] = itemName;
  invItem.count -= 1;
  if (invItem.count <= 0) {
    player.inventory = player.inventory.filter(i => i.count > 0);
  }

  return { success: true, slot, item: itemName, oldItem, bonus: calcEquipmentBonus(player.equipment) };
}

// 卸下装备
function unequipItem(player, slot) {
  initEquipment(player);
  const itemName = player.equipment[slot];
  if (!itemName) return { error: '该槽位没有装备' };

  const existing = player.inventory.find(i => i.name === itemName);
  if (existing) existing.count += 1;
  else player.inventory.push({ name: itemName, count: 1 });

  player.equipment[slot] = null;
  return { success: true, slot, item: itemName, bonus: calcEquipmentBonus(player.equipment) };
}

// 获取装备列表（背包中可装备的物品）
function getEquippableItems(player) {
  initEquipment(player);
  return player.inventory.filter(i => isEquipment(i.name) && i.count > 0);
}

module.exports = {
  EQUIPMENT_SLOTS, EQUIPMENT_STATS,
  getEquipmentStats, isEquipment, getEquipmentSlot,
  calcEquipmentBonus, initEquipment, equipItem, unequipItem, getEquippableItems,
};
