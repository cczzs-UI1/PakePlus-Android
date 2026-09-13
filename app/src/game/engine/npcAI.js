// NPC AI系统
const { randInt, chance, randChoice, clamp } = require('./utils');
const { LOCATIONS, ZONE_ADJACENCY } = require('../data/locations');

// NPC行为决策
function decideNPCAction(npc, gameState) {
  if (!npc.isAlive) return { action: 'dead' };
  if (npc.age < 4) return { action: '襁褓中', turns: 1 };
  if (!npc.hp || !npc.hp.current) return { action: '休息疗伤', turns: 1, location: npc.location };

  // 优先级判定
  // 1. 生命危险
  if (npc.hp.current < npc.hp.max * 0.3) {
    return { action: '休息疗伤', turns: 1, location: npc.location };
  }

  // 2. 孕期
  if (npc.isPregnant) {
    return { action: '养胎', turns: 1, location: npc.residence?.address || npc.location };
  }

  // 3. 日程
  const personality = npc.personalityInfo;
  const weights = personality?.weights || { cultivate: 1, social: 1, explore: 1, combat: 1, trade: 1, rest: 1 };
  const traits = npc.personalityTraits || {};

  // 基于性格和状态的行为选择
  const actions = [];
  actions.push({ action: '闭关修炼', weight: weights.cultivate * 2 });
  actions.push({ action: '社交拜访', weight: weights.social });
  actions.push({ action: '探索游历', weight: weights.explore });
  actions.push({ action: '坊市交易', weight: weights.trade });
  actions.push({ action: '休息', weight: weights.rest });

  if ((traits.aggressiveness || 0) > 60) {
    actions.push({ action: '猎杀妖兽', weight: 3 });
  }
  if ((traits.greed || 0) > 60 && npc.location && npc.location.includes('坊市')) {
    actions.push({ action: '坊市交易', weight: 5 });
  }
  if ((traits.loyalty || 0) > 50 && npc.faction !== '散修') {
    actions.push({ action: '势力巡逻', weight: 2 });
  }

  // 加权选择
  const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
  let r = Math.random() * totalWeight;
  let chosen = actions[0];
  for (const a of actions) {
    r -= a.weight;
    if (r <= 0) { chosen = a; break; }
  }

  // 执行行为
  return executeAction(npc, chosen.action, gameState);
}

function executeAction(npc, action, gameState) {
  switch (action) {
    case '闭关修炼':
      return {
        action: '闭关修炼',
        turns: randInt(1, 3),
        location: npc.residence?.address || npc.location,
        effect: { exp: Math.floor(npc.attributes.physique * 10 + npc.attributes.enlightenment * 5) },
      };
    case '猎杀妖兽':
      return {
        action: '猎杀妖兽',
        turns: 1,
        location: npc.location,
        effect: { item: '妖丹', exp: 50 },
      };
    case '坊市交易':
      return {
        action: '坊市交易',
        turns: 1,
        location: '自由坊市',
        effect: { spiritStone: randInt(-50, 100) },
      };
    case '社交拜访':
      return {
        action: '社交拜访',
        turns: 1,
        location: npc.location,
        effect: { favor: randInt(5, 15) },
      };
    case '探索游历': {
      // 只从玩家可见地点随机（已删除的特殊空间/动态地点不再进入）；15%概率去副本秘境
      const { PLAYER_VISIBLE_LOCATIONS, DUNGEON_LOCATIONS } = require('../data/locations');
      const locations = [...PLAYER_VISIBLE_LOCATIONS];
      if (chance(15)) locations.push(...DUNGEON_LOCATIONS);
      const target = randChoice(locations);
      return {
        action: '探索游历',
        turns: randInt(1, 3),
        location: target,
        effect: { exp: 30 },
      };
    }
    case '势力巡逻':
      return {
        action: '势力巡逻',
        turns: 1,
        location: npc.location,
        effect: { contribution: 20 },
      };
    case '休息疗伤':
      return {
        action: '休息疗伤',
        turns: 1,
        location: npc.residence?.address || npc.location,
        effect: { hp: Math.floor(npc.hp.max * 0.3) },
      };
    case '养胎':
      return {
        action: '养胎',
        turns: 1,
        location: npc.residence?.address || npc.location,
        effect: {},
      };
    default:
      return { action: '空闲', turns: 1, location: npc.location };
  }
}

// 更新NPC位置和状态
function updateNPC(npc, gameState) {
  if (!npc.isAlive) return;

  // 被邀请进宅子做客的NPC：在宅子停留一段时间（需求：不立刻离开）
  if (npc.invitedByPlayer && npc.inviteStayTurns > 0) {
    npc.inviteStayTurns--;
    npc.action = '在宅子做客';
    npc.actionTurns = 0;
    if (npc.inviteStayTurns <= 0) {
      // 做客结束，返回原地点
      delete npc.invitedByPlayer;
      delete npc.inviteStayTurns;
      if (npc.tempLocation) {
        npc.location = npc.tempLocation;
        npc.targetLocation = npc.tempLocation;
        npc.action = `移动中（返回${npc.tempLocation}）`;
        npc.actionTurns = 1;
      }
      delete npc.tempLocation;
    }
    return;
  }
  // 历史档兼容：无停留回合数的被邀请NPC默认再待1个月
  if (npc.invitedByPlayer && !npc.inviteStayTurns) {
    npc.inviteStayTurns = randInt(3, 6);
  }

  if (npc.actionTurns > 0) {
    npc.actionTurns--;
    return;
  }

  const decision = decideNPCAction(npc, gameState);
  npc.action = decision.action;
  npc.actionTurns = decision.turns || 1;
  if (decision.location && decision.location !== npc.location) {
    npc.targetLocation = decision.location;
    // 移动需要时间
    npc.action = `移动中（前往${decision.location}）`;
  }

  // 应用效果
  if (decision.effect) {
    if (decision.effect.exp) npc.cultivationExp += decision.effect.exp;
    if (decision.effect.spiritStone) {
      if (!npc.status) npc.status = {};
      npc.status.wealth = Math.max(0, (npc.status.wealth || 0) + decision.effect.spiritStone);
    }
    if (decision.effect.hp) npc.hp.current = Math.min(npc.hp.max, npc.hp.current + decision.effect.hp);
  }
}

// 获取NPC当前活动描述
function getNPCActivity(npc) {
  if (!npc.isAlive) return `${npc.name}·已故`;
  if (npc.actionTurns > 0) {
    return `${npc.name}·${npc.location}·${npc.action}（${npc.actionTurns}回合）`;
  }
  return `${npc.name}·${npc.location}·${npc.action}`;
}

// NPC对玩家的反应
function npcReaction(npc, player, interactionType) {
  const favor = npc.favorWithPlayer || 0;
  const personality = npc.personalityInfo;

  const reactions = {
    greet: favor >= 50 ? '热情问候' : favor >= 0 ? '礼貌回应' : '冷淡敷衍',
    gift: favor >= 0 ? '欣然接受' : '犹豫收下',
    request: favor >= 100 ? '爽快答应' : favor >= 50 ? '考虑一下' : '直接拒绝',
    duel: favor >= 0 ? '接受挑战' : '不屑一顾',
    trade: '正常交易',
  };

  return reactions[interactionType] || '无反应';
}

module.exports = { decideNPCAction, updateNPC, getNPCActivity, npcReaction };
