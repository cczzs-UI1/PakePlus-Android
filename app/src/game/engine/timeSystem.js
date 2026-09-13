// 时间与AP系统
const { REALMS, SUB_STAGES, calcStageExpNeed } = require('../data/realms');
const { randInt, chance, clamp, randChoice } = require('./utils');

// 游戏时间
function createGameDate(startYear = 1000) {
  return {
    year: startYear,
    month: 1,
    xun: 0, // 0=上旬, 1=中旬, 2=下旬
    turn: 1,
    day: 1,
  };
}

// 推进1个AP（1旬 = 3 AP）
function advanceAP(gameDate, apCost = 1) {
  for (let i = 0; i < apCost; i++) {
    gameDate.turn++;
    gameDate.day += 10;
    if (gameDate.day > 30) {
      gameDate.day = 1;
      gameDate.month++;
      if (gameDate.month > 12) {
        gameDate.month = 1;
        gameDate.year++;
      }
    }
    gameDate.xun = Math.floor((gameDate.day - 1) / 10);
  }
  return gameDate;
}

// 判断是否到了新的一个月（月度Tick）
function isNewMonth(oldDate, newDate) {
  return oldDate.month !== newDate.month || oldDate.year !== newDate.year;
}

// 月度Tick - 所有NPC和世界状态更新
function monthlyTick(gameState) {
  const events = [];
  const { npcs, player } = gameState;

  // 0. NPC移动（停留1-3月后才移动，主控查看中的NPC不移动）
  for (const npc of npcs) {
    if (!npc.isAlive) continue;
    if (gameState.viewingNpcId === npc.id) continue; // 主控正在查看的NPC不移动
    if (npc.id === player.id) continue; // 玩家不自动移动

    // 正在被主控查看面板的NPC不移动（避免"对方不在此处"的误判）
    if (npc.id === gameState.viewingNpcId) continue;

    // 初始化停留时间
    if (npc.locationStayMonths === undefined) npc.locationStayMonths = randInt(1, 3);
    if (npc.currentLocationMonths === undefined) npc.currentLocationMonths = 0;

    npc.currentLocationMonths++;
    if (npc.currentLocationMonths >= npc.locationStayMonths) {
      // 停留时间到，有概率移动
      if (chance(60)) {
        const oldLoc = npc.location;
        // 已认识的NPC有概率主动来玩家宅子做客（需求：宅子加入已认识NPC活动地点）
        const mansionVisit = player && player.mansion && npc.id !== player.id &&
          npc.knownByPlayer && npc.isAlive !== false &&
          !(player.family?.wives || []).includes(npc.id) &&
          !(npc.family?.spouse && npc.family.spouse === player.id) &&
          oldLoc !== player.location && chance(10);
        if (mansionVisit) {
          npc.location = player.location;
          npc.tempLocation = oldLoc;
          npc.invitedByPlayer = true;
          npc.inviteStayTurns = randInt(2, 4);
          npc.locationStayMonths = randInt(1, 3);
          npc.currentLocationMonths = 0;
          if (!npc.personalHistory) npc.personalHistory = [];
          npc.personalHistory.push(`${gameState.gameDateText}·${npc.name}前往${player.name}的宅子做客。`);
          events.push({ type: 'npc_move', npc: npc.name, from: oldLoc, to: '宅子中' });
          continue;
        }
        // 普通移动：只到玩家可见地点；15%概率进入副本秘境（NPC在副本中采集/偶遇妖兽）
        const { PLAYER_VISIBLE_LOCATIONS, DUNGEON_LOCATIONS } = require('../data/locations');
        const movePool = [...PLAYER_VISIBLE_LOCATIONS];
        if (chance(15)) movePool.push(...DUNGEON_LOCATIONS);
        const newLoc = randChoice(movePool.filter(l => l !== oldLoc));
        npc.location = newLoc;
        npc.locationStayMonths = randInt(1, 3); // 新地点停留1-3月
        npc.currentLocationMonths = 0;
        if (!npc.personalHistory) npc.personalHistory = [];
        npc.personalHistory.push(`${gameState.gameDateText}·${oldLoc}→${newLoc}·${npc.name}从${oldLoc}前往${newLoc}。`);
        events.push({ type: 'npc_move', npc: npc.name, from: oldLoc, to: newLoc });
      }
    }
  }

  // 1. 年龄增长
  for (const npc of npcs) {
    if (!npc.isAlive) continue;
    npc.ageMonths++;
    if (npc.ageMonths >= 12) {
      npc.ageMonths = 0;
      npc.age++;
      // 更新立绘
      if (npc.age === 4 || npc.age === 16) {
        npc.portrait = require('./utils').getPortrait(npc.age, npc.gender);
      }
      // 成长阶段
      if (npc.age <= 3) npc.growthStage = '襁褓期';
      else if (npc.age <= 15) npc.growthStage = '启蒙期';
      else npc.growthStage = '成年期';
    }

    // 死亡NPC或缺气血数据的NPC不再参与月度更新（防止转月/转年崩溃）
    if (!npc.isAlive || !npc.hp) continue;

    // 2. 修为增长
    if (npc.isAlive && npc.realmLevel < 10) {
      const passiveExp = Math.floor(npc.attributes.physique * 0.3 + npc.attributes.enlightenment * 0.2);
      npc.cultivationExp += passiveExp;

      // 3. 突破判定（按当前小层所需修为）
      const stageNeed = calcStageExpNeed(npc.realmLevel, SUB_STAGES.indexOf(npc.subStage || '前期'));
      if (npc.cultivationExp >= stageNeed) {
        if (chance(20 + npc.attributes.enlightenment * 0.3)) {
          const result = tryBreakthrough(npc);
          if (result.success) {
            events.push({ type: 'npc_breakthrough', npc: npc.name, realm: npc.realm + '·' + (npc.subStage || '') });
          }
        }
      }
    }

    // 4. 寿元判定
    if (npc.age >= npc.lifespan) {
      if (chance(30)) {
        npc.isAlive = false;
        npc.deathCause = '寿终正寝';
        events.push({ type: 'npc_death', npc: npc.name, cause: '寿终正寝' });
      }
    }

    // 5. 伤势恢复
    if (npc.hp.current < npc.hp.max) {
      npc.hp.current = Math.min(npc.hp.max, npc.hp.current + Math.floor(npc.hp.max * 0.1));
    }

    // 6. 孕期推进
    if (npc.isPregnant && npc.gender === '女') {
      npc.pregnancyMonths++;
      if (npc.pregnancyMonths >= 10) {
        // 生产
        events.push({ type: 'birth', mother: npc });
      }
    }

    // 7. 状态效果衰减
    if (npc.statusEffects) {
      npc.statusEffects = npc.statusEffects.filter(s => {
        s.turns--;
        return s.turns > 0;
      });
    }
  }

  // 8. 玩家修为被动增长
  if (player.realmLevel < 10) {
    player.cultivationExp += Math.floor(player.attributes.physique * 0.3);
  }

  // 8.5 玩家孕期推进
  if (player.gender === '女' && player.isPregnant) {
    player.pregnancyMonths++;
    // 孕期事件
    if (chance(30)) {
      const { pregnancyEvent } = require('./family');
      const evt = pregnancyEvent(player);
      if (evt) {
        events.push({ type: 'player_pregnancy_event', event: evt.name, evt });
      }
    }
    if (player.pregnancyMonths >= 10) {
      events.push({ type: 'player_birth', mother: player });
    }
  }

  // 9. 世界状态
  gameState.worldState.monthCount++;
  if (gameState.worldState.monthCount % 12 === 0) {
    gameState.worldState.yearCount++;
  }

  // 10. 大世界NPC随机事件刷新已移至每旬（consumeAP 按旬触发，上中下三旬各概率0-3条）
  const { formatGameTime } = require('./utils');
  const gameDateText = gameState.gameDateText || formatGameTime(gameState.gameDate);

  // 11. NPC扩展剧情触发（婚配/一夜情/偷情/低劣行为/工作/子嗣/私生子/宠物）
  try {
    const { triggerExtendedEvent } = require('./npcExtendedEvents');
    for (const npc of npcs) {
      if (!npc.isAlive || npc.id === player.id) continue;
      if (chance(15)) { // 15%概率触发扩展剧情
        const result = triggerExtendedEvent(npc, npc.location, { npcs, gameDateText });
        if (result) {
          events.push({ type: 'extended_event', npc: npc.name, event: result.text });
        }
      }
    }
  } catch (e) {
    console.error('扩展剧情触发错误:', e.message);
  }

  // 12. 标签剧情触发
  try {
    const { triggerTagEvents } = require('../data/tagEvents');
    for (const npc of npcs) {
      if (!npc.isAlive || npc.id === player.id) continue;
      if (npc.tags && npc.tags.length > 0 && chance(10)) { // 10%概率触发标签剧情
        const result = triggerTagEvents(npc, npc.location, { gameDateText });
        if (result && result.text) {
          events.push({ type: 'tag_event', npc: npc.name, event: result.text });
          // 记录到NPC记事
          if (!npc.journal) npc.journal = [];
          npc.journal.unshift({
            time: gameDateText,
            location: npc.location,
            content: result.journal || result.text,
            effects: result.effects || {},
          });
          if (npc.journal.length > 100) npc.journal.pop();
        }
      }
    }
  } catch (e) {
    console.error('标签剧情触发错误:', e.message);
  }

  // 13. NPC自动偷窃
  try {
    const { npcAutoSteal } = require('./steal');
    for (const npc of npcs) {
      if (!npc.isAlive || npc.id === player.id) continue;
      // 有偷窃倾向的NPC（性格贪婪/狡诈，或有偷窃相关标签）概率偷窃
      const hasStealTrait = npc.personality === '贪婪' || npc.personality === '狡诈' ||
        (npc.tags && npc.tags.some(t => ['手脚不干净', '梁上君子', '盗亦有道'].includes(t)));
      const stealChance = hasStealTrait ? 20 : 5;
      if (chance(stealChance)) {
        const result = npcAutoSteal(npc, npcs, npc.location);
        if (result) {
          events.push({ type: 'npc_steal', npc: npc.name, event: result.text });
        }
      }
    }
  } catch (e) {
    console.error('NPC自动偷窃错误:', e.message);
  }

  // 14. NPC情感剧情触发
  try {
    const { triggerEmotionEvent } = require('./emotionEvents');
    for (const npc of npcs) {
      if (!npc.isAlive || npc.id === player.id) continue;
      if (npc.age < 12) continue;
      if (chance(12)) { // 12%概率触发情感剧情
        const result = triggerEmotionEvent(npc, npcs, npc.location);
        if (result) {
          if (!npc.personalHistory) npc.personalHistory = [];
          npc.personalHistory.push(`${gameDateText}·${npc.location}·${result.journal}`);
          events.push({ type: 'emotion_event', npc: npc.name, event: result.text });
        }
      }
    }
  } catch (e) {
    console.error('情感剧情触发错误:', e.message);
  }

  // 15. 主控随机剧情触发（转月时）
  try {
    const { triggerTagEvents } = require('../data/tagEvents');
    const { getAttributeEvent } = require('../data/attributeStory');
    const player = gameState.player;

    // 主控标签剧情（15%概率）
    if (player.tags && player.tags.length > 0 && chance(15)) {
      const result = triggerTagEvents(player, player.location, { gameDateText });
      if (result && result.text) {
        events.push({ type: 'player_tag_event', npc: player.name, event: result.text });
        // 应用效果
        if (result.effects) {
          for (const key in result.effects) {
            if (typeof result.effects[key] === 'number') {
              if (key === 'cultivationExp') player.cultivationExp += result.effects[key];
              else if (key === 'silver') player.silver = Math.max(0, player.silver + result.effects[key]);
              else if (key === 'spiritStone') player.spiritStone = Math.max(0, player.spiritStone + result.effects[key]);
              else if (key === 'reputation') player.reputation = (player.reputation || 0) + result.effects[key];
              else if (player.attributes && player.attributes[key] !== undefined) {
                player.attributes[key] += result.effects[key];
              }
            }
          }
        }
      }
    }

    // 主控单人随机剧情（20%概率）
    if (chance(20)) {
      const attrNames = ['physique', 'spirit', 'enlightenment', 'agility', 'fateLuck', 'strength', 'constitution', 'willpower', 'charm'];
      const randomAttr = randChoice(attrNames);
      const event = getAttributeEvent(randomAttr, {
        location: player.location,
        tags: player.tags,
        profession: player.profession,
        inventory: player.inventory,
      });
      if (event) {
        events.push({ type: 'player_solo_event', npc: player.name, event: event.text });
        // 应用效果
        if (event.effects) {
          for (const key in event.effects) {
            if (typeof event.effects[key] === 'number') {
              if (key === 'cultivationExp') player.cultivationExp += event.effects[key];
              else if (key === 'silver') player.silver = Math.max(0, player.silver + event.effects[key]);
              else if (key === 'spiritStone') player.spiritStone = Math.max(0, player.spiritStone + event.effects[key]);
              else if (key === 'reputation') player.reputation = (player.reputation || 0) + event.effects[key];
              else if (player.attributes && player.attributes[key] !== undefined) {
                player.attributes[key] += event.effects[key];
              }
            }
          }
        }
      }
    }

    // 主控与已认识NPC的交互剧情（15%概率）
    if (player.acquaintances && player.acquaintances.length > 0 && chance(15)) {
      const knownNpcs = npcs.filter(n => player.acquaintances.includes(n.id) && n.isAlive && n.location === player.location);
      if (knownNpcs.length > 0) {
        const targetNpc = randChoice(knownNpcs);
        const { pickInteractionEvent } = require('../data/interactionStory');
        const event = pickInteractionEvent('chat', player, targetNpc, player.location);
        if (event) {
          events.push({ type: 'player_interaction_event', npc: player.name, target: targetNpc.name, event: event.text });
          if (event.effects?.favor) {
            targetNpc.favorWithPlayer = Math.max(-100, Math.min(100, (targetNpc.favorWithPlayer || 0) + event.effects.favor));
          }
        }
      }
    }
  } catch (e) {
    console.error('主控随机剧情触发错误:', e.message);
  }

  // 16. 皇室月度：后宫晋升、选秀纳妃、皇帝继承检查（皇帝驾崩→子嗣继位→旧后宫转太后/太妃）
  try {
    const rc = require('./royalCourt');
    if (gameState.empire) {
      const emp = gameState.empire;
      const emperor = gameState.npcs.find(n => n.id === emp.emperorId);
      if (emperor && emperor.isAlive === false) {
        const succ = rc.succeedEmperor(gameState);
        for (const s of succ) events.push({ type: 'royal_event', npc: '大夏皇室', event: s });
      } else if (emperor && emperor.isAlive) {
        const promos = rc.tryPromoteConsorts(gameState);
        for (const s of promos) events.push({ type: 'royal_event', npc: '大夏皇室', event: s });
        const sel = rc.tryImperialSelection(gameState, gameState.gameDate, gameDateText);
        for (const s of sel) events.push({ type: 'royal_event', npc: '大夏皇室', event: s });
      }
    }
  } catch (e) {
    console.error('皇室月度逻辑错误:', e.message);
  }

  return events;
}

// 尝试突破（小层化：每境前期→中期→后期→下一境前期，不可跳跃）
function tryBreakthrough(npc) {
  if (!npc || !npc.hp) return { success: false, error: '无此NPC' };
  if (npc.realmLevel >= 10) return { success: false, error: '已达最高境界' };
  const stageIdx = SUB_STAGES.indexOf(npc.subStage || '前期');
  const need = calcStageExpNeed(npc.realmLevel, stageIdx);
  if (npc.cultivationExp < need) return { success: false, error: '修为不足' };

  let chance_val = npc.attributes.enlightenment * 0.5 + npc.spiritRoot.purity * 0.2;
  if (npc.statusEffects?.some(s => s.name === '虚弱')) chance_val -= 20;
  if (npc.statusEffects?.some(s => s.name === '心魔缠身')) chance_val -= 30;

  if (Math.random() * 100 < chance_val) {
    if (stageIdx < 2) {
      // 同境小层晋升：前期→中期→后期
      npc.subStage = SUB_STAGES[stageIdx + 1];
      npc.breakthroughExp = calcStageExpNeed(npc.realmLevel, stageIdx + 1);
    } else {
      // 境界突破：后期→下一境前期
      npc.realmLevel++;
      npc.realm = REALMS[npc.realmLevel - 1].name;
      npc.subStage = '前期';
      npc.cultivationExp = 0;
      npc.breakthroughExp = calcStageExpNeed(npc.realmLevel, 0);
      npc.lifespan = REALMS[npc.realmLevel - 1].lifespan;
      // 更新战斗属性
      const newStats = require('./npcGenerator').calcCombatStats(npc.attributes, npc.realmLevel);
      npc.combatStats = newStats;
      npc.hp.max = newStats.hp;
      npc.hp.current = newStats.hp;
      npc.mp.max = newStats.mp;
      npc.mp.current = newStats.mp;
      // 需求：修为从凡人境到以上的境界后，身份自动变为修仙者并自动随机对应职业
      require('./npcGenerator').ensureCultivatorIdentity(npc);
    }
    return { success: true };
  } else {
    npc.cultivationExp = Math.floor(npc.cultivationExp * 0.7);
    if (!npc.statusEffects) npc.statusEffects = [];
    npc.statusEffects.push({ name: '虚弱', turns: 3 });
    return { success: false };
  }
}

// AP消耗表
const AP_COSTS = {
  move_same_zone: 1,
  move_cross_zone: 2,
  explore: 1,
  cultivate: 1,
  craft: 1,
  rest: 1,
  interact_deep: 1,
  read: 1,
  care: 1,
  combat_enter: 1,
  combat_flee: 1,
};

module.exports = { createGameDate, advanceAP, isNewMonth, monthlyTick, tryBreakthrough, AP_COSTS };
