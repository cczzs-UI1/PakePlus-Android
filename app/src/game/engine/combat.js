// 战斗系统 - 回合制，合理化数值
const { randInt, randFloat, chance, clamp, randChoice } = require('./utils');
const { TALISMANS } = require('./talismanSystem');
const { getQingyunBuffs } = require('./qingyunArts');
const { getTechniqueBuffs } = require('./learning');
const { REALMS } = require('../data/realms');
const { ITEMS, getItemInfo } = require('../data/items');

// 战斗剧情库
const COMBAT_STORIES = {
  attack: [
    '{attacker}大喝一声，挥起{weapon}向{defender}劈去，{defender}急忙格挡，被震得连退数步。',
    '{attacker}身形一闪，如鬼魅般出现在{defender}身后，一掌拍在{defender}后心。',
    '{attacker}运转灵力，{weapon}上灵光暴涨，一道剑气斩向{defender}。',
    '{attacker}怒目圆睁，全身气血翻涌，一招力劈华山直取{defender}首级。',
    '{attacker}冷笑一声，指尖凝聚灵力，数道气弹如暴雨般射向{defender}。',
    '{attacker}脚下生风，绕着{defender}快速移动，寻找破绽后猛然出击。',
    '{attacker}深吸一口气，将全身灵力灌注于{weapon}，发出惊天一击。',
    '{attacker}假意败退，待{defender}追近时突然回身反击，打了{defender}一个措手不及。',
  ],
  crit: [
    '{attacker}抓住{defender}的破绽，一击命中要害，{defender}喷出一口鲜血！',
    '{attacker}的攻击精准无比，正中{defender}胸口，{defender}只觉五脏六腑都在翻腾。',
    '暴击！{attacker}的力量在这一刻爆发，{defender}被打得飞了出去，重重摔在地上。',
  ],
  dodge: [
    '{defender}身形微侧，险之又险地避开了{attacker}的攻击。',
    '{defender}早有防备，轻轻一跃便躲过了{attacker}的攻势。',
    '{attacker}的攻击落空了，{defender}如同风中柳絮般飘然避开。',
  ],
  flee: [
    '{attacker}虚晃一招，趁{defender}不备转身便逃，转眼间消失在远方。',
    '{attacker}施展遁术，灵光一闪便没了踪影。',
    '{attacker}且战且退，找到机会后迅速脱离了战斗。',
  ],
  fleeFail: [
    '{attacker}试图逃跑，但被{defender}一眼看穿，拦住了去路。',
    '{attacker}刚转身，{defender}便追了上来，无奈只能继续战斗。',
  ],
  usePill: [
    '{attacker}从怀中掏出一瓶丹药，倒出一粒吞下，脸色顿时红润了几分。',
    '{attacker}运转灵力，将丹药的药力迅速化开，气血和灵力都有所恢复。',
  ],
  equip: [
    '{attacker}将旧武器收起，换上了{weapon}，气势顿时不同。',
    '{attacker}穿上了{armor}，身上多了一层防护。',
  ],
  noMp: [
    '{attacker}灵力耗尽，无力再战，只能被动防御。',
    '{attacker}面色苍白，灵力已经见底，无法发动攻击。',
  ],
  draw: [
    '双方灵力皆已耗尽，无力再战，这场战斗以平局收场。',
    '激战过后，双方都已精疲力竭，各自退去。',
  ],
};

// 获取装备加成（使用新的EQUIPMENT_STATS系统）
function getEquipmentBonus(npc) {
  const bonus = { attack: 0, defense: 0, hp: 0, mp: 0, speed: 0, critRate: 0, dodgeRate: 0, magicAttack: 0, magicDefense: 0 };
  if (!npc.equipment) return bonus;
  const { EQUIPMENT_STATS } = require('./equipment');
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const itemName = npc.equipment[slot];
    if (itemName && EQUIPMENT_STATS[itemName]) {
      const stats = EQUIPMENT_STATS[itemName];
      if (stats.attack) bonus.attack += stats.attack;
      if (stats.defense) bonus.defense += stats.defense;
      if (stats.hpMax) bonus.hp += stats.hpMax;
      if (stats.mpMax) bonus.mp += stats.mpMax;
      if (stats.agility) bonus.speed += stats.agility;
      if (stats.critRate) bonus.critRate += stats.critRate;
      if (stats.magicAttack) bonus.magicAttack += stats.magicAttack;
      if (stats.magicDefense) bonus.magicDefense += stats.magicDefense;
    }
  }
  return bonus;
}

// 计算总攻击力（合理化）
function getTotalAttack(npc) {
  const qb = getQingyunBuffs(npc);
  const physique = npc.attributes?.physique || 50;
  const realmLevel = npc.realmLevel || 1;
  const tb = getTechniqueBuffs(npc);
  const base = (Math.floor(physique * 0.5) + realmLevel * 3) * (1 + (qb.attack || 0)) * (1 + (tb.attack || 0));
  const equip = getEquipmentBonus(npc);
  const attrAttack = npc.attributes?.attack || 0;
  return Math.floor(base + equip.attack * (1 + (qb.attack || 0)) + attrAttack);
}

// 计算总防御力（合理化）
function getTotalDefense(npc) {
  const qb = getQingyunBuffs(npc);
  const physique = npc.attributes?.physique || 50;
  const realmLevel = npc.realmLevel || 1;
  const tb = getTechniqueBuffs(npc);
  const base = (Math.floor(physique * 0.3) + realmLevel * 2) * (1 + (qb.defense || 0)) * (1 + (tb.defense || 0));
  const equip = getEquipmentBonus(npc);
  const attrDefense = npc.attributes?.defense || 0;
  return Math.floor(base + equip.defense * (1 + (qb.defense || 0)) + attrDefense);
}

// 计算最大气血（合理化）
function getMaxHp(npc) {
  const physique = npc.attributes?.physique || 50;
  const realmLevel = npc.realmLevel || 1;
  const base = 80 + physique * 2 + realmLevel * 30;
  const equip = getEquipmentBonus(npc);
  return base + equip.hp;
}

// 计算最大灵力（合理化）
function getMaxMp(npc) {
  const qb = getQingyunBuffs(npc);
  const spirit = npc.attributes?.spirit || 50;
  const realmLevel = npc.realmLevel || 1;
  const tb = getTechniqueBuffs(npc);
  const base = (40 + spirit * 1.5 + realmLevel * 20) * (1 + (qb.mpMax || 0)) * (1 + (tb.mpMax || 0));
  const equip = getEquipmentBonus(npc);
  return Math.floor(base + equip.mp * (1 + (qb.mpMax || 0)));
}

// 计算攻击消耗灵力（合理化：5-15点）
function getMpCost(npc) {
  const realmLevel = npc.realmLevel || 1;
  return clamp(3 + realmLevel, 5, 20);
}

// 计算伤害（合理化：10-100点）
function calcDamage(attacker, defender) {
  const attackPower = getTotalAttack(attacker);
  const defensePower = getTotalDefense(defender);

  // 基础伤害 = 攻击力 - 防御力*0.4，最小5
  let baseDamage = Math.max(5, attackPower - defensePower * 0.4) * randFloat(0.85, 1.15);

  // 修为差距加成（每级5%）
  const realmDiff = attacker.realmLevel - defender.realmLevel;
  if (realmDiff > 0) baseDamage *= (1 + realmDiff * 0.05);
  else if (realmDiff < 0) baseDamage *= Math.max(0.5, 1 + realmDiff * 0.05);

  // 暴击（10%概率，1.5倍伤害）
  let isCrit = false;
  const critRate = 8 + (attacker.attributes?.agility || 50) * 0.05 + getEquipmentBonus(attacker).critRate;
  if (chance(critRate)) {
    baseDamage *= 1.5;
    isCrit = true;
  }

  // 闪避（8%概率）
  let dodgeRate = 5 + (defender.attributes?.agility || 50) * 0.05 + (defender.attributes?.dodge || 0) + getEquipmentBonus(defender).dodgeRate;
  if (defender.statusEffects?.some(s => s.name === '风行')) dodgeRate += 20;
  if (chance(dodgeRate)) {
    return { damage: 0, dodged: true, crit: false };
  }

  // 状态修正
  if (attacker.statusEffects?.some(s => s.name === '虚弱')) baseDamage *= 0.7;
  if (attacker.statusEffects?.some(s => s.name === '攻击提升')) {
    const buff = attacker.statusEffects.find(s => s.name === '攻击提升');
    baseDamage *= (1 + (buff.value || 10) / 100);
  }

  // 护盾抵挡
  if (defender.statusEffects?.some(x => x.name === '护盾')) {
    const sh = defender.statusEffects.find(x => x.name === '护盾');
    const blocked = Math.min(baseDamage, sh.value || 0);
    baseDamage -= blocked;
    sh.value -= blocked;
    if (sh.value <= 0) defender.statusEffects = defender.statusEffects.filter(x => x !== sh);
  }
  return { damage: Math.max(0, Math.floor(baseDamage)), dodged: false, crit: isCrit };
}

// 生成战斗描述
function generateCombatText(type, attacker, defender, extra = {}) {
  const pool = COMBAT_STORIES[type] || COMBAT_STORIES.attack;
  let text = randChoice(pool);
  text = text.replace(/\{attacker\}/g, attacker.name || '对方');
  text = text.replace(/\{defender\}/g, defender.name || '对方');
  text = text.replace(/\{winner\}/g, extra.winner || attacker.name);
  text = text.replace(/\{loser\}/g, extra.loser || defender.name);
  const attackerWeapon = attacker.equipment?.weapon || '手中武器';
  const defenderArmor = defender.equipment?.armor || '身上护甲';
  text = text.replace(/\{weapon\}/g, attackerWeapon);
  text = text.replace(/\{armor\}/g, defenderArmor);
  return text;
}

// 使用丹药
function usePill(npc, pillName) {
  // 玩家使用背包（inventory），NPC使用库房（warehouse）；两处都查找
  const itemList = (npc.warehouse?.items || []).concat(npc.inventory || []);
  const item = itemList.find(i => i.name === pillName && i.count > 0);
  if (!item) return { success: false, msg: '没有此丹药' };

  // 优先使用物品自带effect（炼制的丹药），否则查物品库
  let itemInfo = item.effect ? item : null;
  if (!itemInfo) itemInfo = getItemInfo(pillName);
  if (!itemInfo) return { success: false, msg: '没有此丹药的信息' };
  if (!itemInfo.effect) return { success: false, msg: '此物品不是丹药' };

  item.count--;
  if (item.count <= 0) {
    if (npc.warehouse?.items && npc.warehouse.items.includes(item)) npc.warehouse.items = npc.warehouse.items.filter(i => i !== item);
    else if (npc.inventory && npc.inventory.includes(item)) npc.inventory = npc.inventory.filter(i => i !== item);
  }

  const effects = [];
  const eff = itemInfo.effect;
  if (eff.hp) {
    const heal = Math.min(eff.hp, npc.hp.max - npc.hp.current);
    npc.hp.current = Math.min(npc.hp.max, npc.hp.current + eff.hp);
    effects.push(`气血+${heal}`);
  }
  if (eff.hpPct) {
    const heal = Math.min(Math.floor(npc.hp.max * eff.hpPct / 100), npc.hp.max - npc.hp.current);
    npc.hp.current = Math.min(npc.hp.max, npc.hp.current + heal);
    effects.push(`气血+${heal}（${eff.hpPct}%）`);
  }
  if (eff.mp) {
    const restore = Math.min(eff.mp, npc.mp.max - npc.mp.current);
    npc.mp.current = Math.min(npc.mp.max, npc.mp.current + eff.mp);
    effects.push(`灵力+${restore}`);
  }
  if (eff.mpPct) {
    const restore = Math.min(Math.floor(npc.mp.max * eff.mpPct / 100), npc.mp.max - npc.mp.current);
    npc.mp.current = Math.min(npc.mp.max, npc.mp.current + restore);
    effects.push(`灵力+${restore}（${eff.mpPct}%）`);
  }
  if (eff.attack) {
    if (!npc.statusEffects) npc.statusEffects = [];
    npc.statusEffects.push({ name: '攻击提升', turns: 3, value: eff.attack });
    effects.push(`攻击+${eff.attack}（3回合）`);
  }
  if (eff.removeDebuff) {
    if (npc.statusEffects) {
      npc.statusEffects = npc.statusEffects.filter(s => !eff.removeDebuff.includes(s.name));
    }
    effects.push('解除负面状态');
  }

  return { success: true, msg: `服用${pillName}，${effects.join('，')}`, effects };
}

// 更换装备
function changeEquipment(npc, slot, itemName) {
  if (!npc.warehouse?.items) return { success: false, msg: '没有库房' };
  const item = npc.warehouse.items.find(i => i.name === itemName && i.count > 0);
  if (!item) return { success: false, msg: '没有此物品' };

  const itemInfo = getItemInfo(itemName);
  if (!itemInfo) return { success: false, msg: '物品不存在' };

  const slotTypeMap = { weapon: 'weapon', armor: 'armor', accessory: 'accessory' };
  if (itemInfo.type !== slotTypeMap[slot]) return { success: false, msg: `此物品不能装备到${slot}槽位` };

  if (!npc.equipment) npc.equipment = { weapon: null, armor: null, accessory: null };

  const oldItem = npc.equipment[slot];
  if (oldItem) {
    const existing = npc.warehouse.items.find(i => i.name === oldItem);
    if (existing) existing.count++;
    else npc.warehouse.items.push({ name: oldItem, count: 1 });
  }

  npc.equipment[slot] = itemName;
  item.count--;
  if (item.count <= 0) {
    npc.warehouse.items = npc.warehouse.items.filter(i => i !== item);
  }

  return { success: true, msg: `装备了${itemName}`, oldItem };
}

// NPC自动装备
function npcAutoEquip(npc) {
  if (!npc.equipment) npc.equipment = { weapon: null, armor: null, accessory: null };
  if (!npc.warehouse?.items) return;

  const slots = { weapon: 'weapon', armor: 'armor', accessory: 'accessory' };
  for (const [slot, type] of Object.entries(slots)) {
    if (!npc.equipment[slot]) {
      const equippable = npc.warehouse.items.filter(i => {
        const info = getItemInfo(i.name);
        return info && info.type === type && i.count > 0;
      });
      if (equippable.length > 0) {
        const best = equippable.sort((a, b) => {
          const ia = getItemInfo(a.name);
          const ib = getItemInfo(b.name);
          return (ib.attack || 0) + (ib.defense || 0) - (ia.attack || 0) - (ia.defense || 0);
        })[0];
        changeEquipment(npc, slot, best.name);
      }
    }
  }
}

// 计算逃跑成功率
function calcFleeChance(fleer, pursuer) {
  const fleeAgility = fleer.attributes?.agility || fleer.attributes?.speed || 50;
  const pursuerAgility = pursuer.attributes?.agility || pursuer.attributes?.speed || 50;
  const realmDiff = fleer.realmLevel - pursuer.realmLevel;
  let chance_val = 45 + (fleeAgility - pursuerAgility) * 0.3 + realmDiff * 5;
  return clamp(chance_val, 15, 85);
}

// 检查双方是否都灵力耗尽
function checkBothNoMp(player, enemy) {
  const playerMpCost = getMpCost(player);
  const enemyMpCost = getMpCost(enemy);
  return player.mp.current < playerMpCost && enemy.mp.current < enemyMpCost;
}

// 执行一回合战斗（玩家行动）
function playerAction(player, enemy, action) {
  const log = [];

  if (action.type === 'attack') {
    const mpCost = getMpCost(player);
    if (player.mp.current < mpCost) {
      log.push(generateCombatText('noMp', player, enemy));
      log.push(`你灵力不足（当前灵力${player.mp.current}/${player.mp.max}），无法攻击！`);
      // 检查是否双方都灵力耗尽
      if (checkBothNoMp(player, enemy)) {
        log.push(generateCombatText('draw', player, enemy));
        return { log, type: 'draw' };
      }
      return { log, type: 'noMp' };
    }
    player.mp.current -= mpCost;

    const result = calcDamage(player, enemy);
    if (result.dodged) {
      log.push(generateCombatText('dodge', player, enemy));
      log.push(`你消耗灵力${mpCost}点（剩余灵力${player.mp.current}/${player.mp.max}），攻击被对方闪避。`);
    } else {
      enemy.hp.current = Math.max(0, enemy.hp.current - result.damage);
      let text = generateCombatText(result.crit ? 'crit' : 'attack', player, enemy);
      text += ` 你造成${result.damage}点伤害${result.crit ? '（暴击！）' : ''}，对方气血${enemy.hp.current}/${enemy.hp.max}；消耗灵力${mpCost}点，你的灵力${player.mp.current}/${player.mp.max}。`;
      log.push(text);
    }
  } else if (action.type === 'flee') {
    const fleeChance = calcFleeChance(player, enemy);
    if (chance(fleeChance)) {
      log.push(generateCombatText('flee', player, enemy));
      return { log, type: 'fled' };
    } else {
      log.push(generateCombatText('fleeFail', player, enemy));
      log.push(`逃跑失败（成功率${Math.floor(fleeChance)}%），对方拦住了你的去路。`);
    }
  } else if (action.type === 'pill' && action.item) {
    const result = usePill(player, action.item);
    if (result.success) {
      log.push(generateCombatText('usePill', player, enemy) + ' ' + result.msg);
      log.push(`你的气血${player.hp.current}/${player.hp.max}，灵力${player.mp.current}/${player.mp.max}。`);
    } else {
      log.push(result.msg);
    }
    return { log, type: 'pill' };
  } else if (action.type === 'talisman' && action.item) {
    const item = (player.inventory || []).find(i => i.name === action.item && i.count > 0);
    if (!item) { log.push('背包中没有此符箓。'); return { log, type: 'talisman' }; }
    const t = TALISMANS.find(x => x.name === action.item);
    if (!t || !t.effect) { log.push('此物品无法在战斗中使用。'); return { log, type: 'talisman' }; }
    item.count--;
    if (item.count <= 0) player.inventory = player.inventory.filter(i => i !== item);
    const eff = t.effect;
    let effMsg = `你祭出【${action.item}】！`;
    if (eff.fireDamage) {
      const dmg = Math.floor(eff.fireDamage * (1 + (player.realmLevel || 1) * 0.05));
      enemy.hp.current = Math.max(0, enemy.hp.current - dmg);
      effMsg += `火球炸裂，对对方造成${dmg}点伤害！`;
    } else if (eff.iceDamage) {
      const dmg = Math.floor(eff.iceDamage * (1 + (player.realmLevel || 1) * 0.05));
      enemy.hp.current = Math.max(0, enemy.hp.current - dmg);
      effMsg += `冰锥透体，对对方造成${dmg}点伤害！`;
    } else if (eff.thunderDamage) {
      const dmg = Math.floor(eff.thunderDamage * (1 + (player.realmLevel || 1) * 0.05));
      enemy.hp.current = Math.max(0, enemy.hp.current - dmg);
      effMsg += `天雷轰顶，对对方造成${dmg}点伤害！`;
    } else if (eff.shield) {
      if (!player.statusEffects) player.statusEffects = [];
      player.statusEffects.push({ name: '护盾', turns: 3, value: Math.floor(eff.shield) });
      effMsg += `灵力护盾展开，可抵挡${Math.floor(eff.shield)}点伤害（3回合）！`;
    } else if (eff.atkBuff) {
      if (!player.statusEffects) player.statusEffects = [];
      player.statusEffects.push({ name: '攻击提升', turns: 3, value: Math.floor(eff.atkBuff * 100) });
      effMsg += `巨力附体，攻击力提升${Math.floor(eff.atkBuff * 100)}%（3回合）！`;
    } else if (eff.bind) {
      if (!enemy.statusEffects) enemy.statusEffects = [];
      enemy.statusEffects.push({ name: '束缚', turns: 2 });
      effMsg += '困敌符化作灵光缠绕对方，对方2回合内无法行动！';
    } else if (eff.moveBuff) {
      if (!player.statusEffects) player.statusEffects = [];
      player.statusEffects.push({ name: '风行', turns: 3 });
      effMsg += '风行符生效，身法灵动，闪避大增（3回合）！';
    } else {
      effMsg += '符箓生效！';
    }
    log.push(effMsg);
    log.push(`你的气血${player.hp.current}/${player.hp.max}，灵力${player.mp.current}/${player.mp.max}。`);
    return { log, type: 'talisman' };
  } else if (action.type === 'equip' && action.slot && action.item) {
    const result = changeEquipment(player, action.slot, action.item);
    if (result.success) {
      log.push(generateCombatText('equip', player, enemy) + ' ' + result.msg);
    } else {
      log.push(result.msg);
    }
    return { log, type: 'equip' };
  }

  // 检查胜负
  if (enemy.hp.current <= 0) {
    log.push(`对方气血归零（${enemy.hp.current}/${enemy.hp.max}），你取得了胜利！`);
    return { log, type: 'victory' };
  }

  // 检查双方灵力耗尽
  if (checkBothNoMp(player, enemy)) {
    log.push(generateCombatText('draw', player, enemy));
    return { log, type: 'draw' };
  }

  return { log, type: 'continue' };
}

// 敌人回合
function enemyAction(enemy, player) {
  const log = [];

  // 束缚：无法行动
  if (enemy.statusEffects?.some(x => x.name === '束缚')) {
    log.push(`${enemy.name}被符箓灵光束缚，无法行动！`);
    enemy.statusEffects.forEach(x => { if (x.name === '束缚') x.turns--; });
    enemy.statusEffects = enemy.statusEffects.filter(x => x.turns > 0);
    return { log, type: 'bind' };
  }

  // 敌人AI：低气血时概率使用丹药
  if (enemy.hp.current < enemy.hp.max * 0.3 && chance(40)) {
    const pills = (enemy.warehouse?.items || []).filter(i => {
      const info = getItemInfo(i.name);
      return info && info.type === 'pill' && info.effect?.hp && i.count > 0;
    });
    if (pills.length > 0) {
      const pill = randChoice(pills);
      const result = usePill(enemy, pill.name);
      if (result.success) {
        log.push(generateCombatText('usePill', enemy, player) + ' ' + result.msg);
        log.push(`${enemy.name}的气血${enemy.hp.current}/${enemy.hp.max}，灵力${enemy.mp.current}/${enemy.mp.max}。`);
        return { log, type: 'pill' };
      }
    }
  }

  const mpCost = getMpCost(enemy);
  if (enemy.mp.current < mpCost) {
    log.push(generateCombatText('noMp', enemy, player));
    log.push(`${enemy.name}灵力不足（当前灵力${enemy.mp.current}/${enemy.mp.max}），无法攻击！`);
    // 检查是否双方都灵力耗尽
    if (checkBothNoMp(player, enemy)) {
      log.push(generateCombatText('draw', player, enemy));
      return { log, type: 'draw' };
    }
    return { log, type: 'noMp' };
  }
  enemy.mp.current -= mpCost;

  const result = calcDamage(enemy, player);
  if (result.dodged) {
    log.push(generateCombatText('dodge', enemy, player));
    log.push(`${enemy.name}消耗灵力${mpCost}点（剩余灵力${enemy.mp.current}/${enemy.mp.max}），攻击被你闪避。`);
  } else {
    player.hp.current = Math.max(0, player.hp.current - result.damage);
    let text = generateCombatText(result.crit ? 'crit' : 'attack', enemy, player);
    text += ` ${enemy.name}造成${result.damage}点伤害${result.crit ? '（暴击！）' : ''}，你的气血${player.hp.current}/${player.hp.max}；对方消耗灵力${mpCost}点，灵力${enemy.mp.current}/${enemy.mp.max}。`;
    log.push(text);
  }

  // 检查胜负
  if (player.hp.current <= 0) {
    log.push(`你的气血归零（${player.hp.current}/${player.hp.max}），战斗失败！`);
    return { log, type: 'defeat' };
  }

  // 检查双方灵力耗尽
  if (checkBothNoMp(player, enemy)) {
    log.push(generateCombatText('draw', player, enemy));
    return { log, type: 'draw' };
  }

  return { log, type: 'continue' };
}

// 战斗失败惩罚
function applyDefeatPenalty(loser) {
  const hpLoss = randInt(Math.floor(loser.hp.max * 0.1), Math.floor(loser.hp.max * 0.25));
  const expLoss = randInt(30, 100);
  loser.hp.current = Math.max(1, loser.hp.max - hpLoss);
  loser.cultivationExp = Math.max(0, (loser.cultivationExp || 0) - expLoss);
  if (!loser.statusEffects) loser.statusEffects = [];
  loser.statusEffects.push({ name: '虚弱', turns: 3 });
  return { hpLoss, expLoss };
}

// 杀死对方，获取其库房和宠物
function killEnemy(killer, victim) {
  victim.isAlive = false;
  victim.deathCause = `被${killer.name}杀死`;
  victim.deathTime = Date.now();

  const loot = { items: [], pets: [], silver: 0, spiritStone: 0 };

  if (victim.warehouse?.items) {
    for (const item of victim.warehouse.items) {
      loot.items.push({ ...item });
      if (!killer.warehouse) killer.warehouse = { items: [], valuables: [] };
      const existing = killer.warehouse.items.find(i => i.name === item.name);
      if (existing) existing.count += item.count;
      else killer.warehouse.items.push({ ...item });
    }
    victim.warehouse.items = [];
  }

  if (victim.warehouse?.valuables) {
    for (const v of victim.warehouse.valuables) {
      loot.items.push({ name: v.name, count: 1, desc: v.desc });
    }
    victim.warehouse.valuables = [];
  }

  if (victim.pets && victim.pets.length > 0) {
    for (const pet of victim.pets) {
      loot.pets.push(pet);
      if (!killer.pets) killer.pets = [];
      killer.pets.push(pet);
    }
    victim.pets = [];
  }

  if (victim.silver) {
    loot.silver = victim.silver;
    killer.silver = (killer.silver || 0) + victim.silver;
    victim.silver = 0;
  }
  if (victim.spiritStone) {
    loot.spiritStone = victim.spiritStone;
    killer.spiritStone = (killer.spiritStone || 0) + victim.spiritStone;
    victim.spiritStone = 0;
  }

  if (victim.equipment) {
    for (const slot of ['weapon', 'armor', 'accessory']) {
      if (victim.equipment[slot]) {
        loot.items.push({ name: victim.equipment[slot], count: 1 });
        if (!killer.warehouse) killer.warehouse = { items: [], valuables: [] };
        const existing = killer.warehouse.items.find(i => i.name === victim.equipment[slot]);
        if (existing) existing.count++;
        else killer.warehouse.items.push({ name: victim.equipment[slot], count: 1 });
        victim.equipment[slot] = null;
      }
    }
  }

  return loot;
}

// NPC死亡后妻妾处理
function handleNpcDeathWives(npc, allNpcs) {
  const results = [];
  if (!npc.family?.wives && !npc.family?.spouse) return results;

  const wives = [];
  if (npc.family.spouse) wives.push(npc.family.spouse);
  if (npc.family.wives) wives.push(...npc.family.wives);

  for (const wifeId of wives) {
    const wife = allNpcs.find(n => n.id === wifeId);
    if (!wife) continue;

    const roll = Math.random();
    if (roll < 0.3) {
      wife.isAlive = false;
      wife.deathCause = `为${npc.name}殉情`;
      results.push({ wife: wife.name, action: '殉情' });
    } else if (roll < 0.6) {
      if (wife.family) {
        wife.family.spouse = null;
        if (wife.family.husbands) {
          wife.family.husbands = wife.family.husbands.filter(id => id !== npc.id);
        }
      }
      results.push({ wife: wife.name, action: '恢复自由身' });
    } else if (roll < 0.8) {
      const eligible = allNpcs.filter(n =>
        n.isAlive && n.id !== npc.id && n.id !== wife.id &&
        n.gender === '男' && n.age >= 16 && !n.family?.spouse
      );
      if (eligible.length > 0) {
        const newHusband = randChoice(eligible);
        if (!newHusband.family) newHusband.family = {};
        newHusband.family.spouse = wife.id;
        if (!newHusband.family.wives) newHusband.family.wives = [];
        if (!wife.family) wife.family = {};
        wife.family.spouse = newHusband.id;
        // 关系网更新
        if (!newHusband.relations) newHusband.relations = {};
        newHusband.relations[wife.id] = { type: '配偶', favor: 50, name: wife.name };
        if (!wife.relations) wife.relations = {};
        wife.relations[newHusband.id] = { type: '配偶', favor: 50, name: newHusband.name };
        results.push({ wife: wife.name, action: `改嫁${newHusband.name}` });
      }
    } else {
      results.push({ wife: wife.name, action: '守寡' });
    }
  }

  return results;
}

module.exports = {
  calcDamage,
  getEquipmentBonus,
  getTotalAttack,
  getTotalDefense,
  getMaxHp,
  getMaxMp,
  getMpCost,
  usePill,
  changeEquipment,
  npcAutoEquip,
  calcFleeChance,
  playerAction,
  enemyAction,
  applyDefeatPenalty,
  killEnemy,
  handleNpcDeathWives,
  generateCombatText,
  COMBAT_STORIES,
};
