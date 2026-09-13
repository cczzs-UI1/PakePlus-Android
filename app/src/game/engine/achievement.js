// 成就系统
const ACHIEVEMENTS = [
  // 境界成就
  { id: 'ach_realm_1', name: '初入仙途', desc: '达到炼气境', condition: { type: 'realm', value: 1 }, reward: { spiritStone: 100 } },
  { id: 'ach_realm_2', name: '筑基成功', desc: '达到筑基境', condition: { type: 'realm', value: 3 }, reward: { spiritStone: 500, exp: 500 } },
  { id: 'ach_realm_3', name: '结丹大成', desc: '达到结丹境', condition: { type: 'realm', value: 4 }, reward: { spiritStone: 2000, exp: 2000 } },
  { id: 'ach_realm_4', name: '元婴出窍', desc: '达到元婴境', condition: { type: 'realm', value: 5 }, reward: { spiritStone: 10000, exp: 5000 } },
  { id: 'ach_realm_5', name: '化神飞升', desc: '达到化神境', condition: { type: 'realm', value: 6 }, reward: { spiritStone: 50000, exp: 20000 } },
  { id: 'ach_realm_6', name: '炼虚合道', desc: '达到炼虚境', condition: { type: 'realm', value: 7 }, reward: { spiritStone: 200000, exp: 50000 } },
  { id: 'ach_realm_7', name: '合体至尊', desc: '达到合体境', condition: { type: 'realm', value: 8 }, reward: { spiritStone: 500000, exp: 100000 } },
  { id: 'ach_realm_8', name: '大乘巅峰', desc: '达到大乘境', condition: { type: 'realm', value: 9 }, reward: { spiritStone: 1000000, exp: 500000 } },
  { id: 'ach_realm_9', name: '渡劫飞升', desc: '达到渡劫境', condition: { type: 'realm', value: 10 }, reward: { spiritStone: 10000000, exp: 1000000 } },
  // 战斗成就
  { id: 'ach_combat_1', name: '初战告捷', desc: '赢得第一场战斗', condition: { type: 'combatWin', value: 1 }, reward: { spiritStone: 50 } },
  { id: 'ach_combat_2', name: '百战百胜', desc: '赢得100场战斗', condition: { type: 'combatWin', value: 100 }, reward: { spiritStone: 5000, title: '百战将军' } },
  { id: 'ach_combat_3', name: '千胜王者', desc: '赢得1000场战斗', condition: { type: 'combatWin', value: 1000 }, reward: { spiritStone: 50000, title: '千胜王者' } },
  // 财富成就
  { id: 'ach_wealth_1', name: '小有积蓄', desc: '拥有1000灵石', condition: { type: 'spiritStone', value: 1000 }, reward: { exp: 100 } },
  { id: 'ach_wealth_2', name: '腰缠万贯', desc: '拥有10000灵石', condition: { type: 'spiritStone', value: 10000 }, reward: { exp: 500 } },
  { id: 'ach_wealth_3', name: '富甲一方', desc: '拥有100000灵石', condition: { type: 'spiritStone', value: 100000 }, reward: { exp: 2000, title: '富甲一方' } },
  { id: 'ach_wealth_4', name: '富可敌国', desc: '拥有1000000灵石', condition: { type: 'spiritStone', value: 1000000 }, reward: { exp: 10000, title: '富可敌国' } },
  // 社交成就
  { id: 'ach_social_1', name: '初交朋友', desc: '结识10位NPC', condition: { type: 'acquaintances', value: 10 }, reward: { spiritStone: 100 } },
  { id: 'ach_social_2', name: '交友广泛', desc: '结识50位NPC', condition: { type: 'acquaintances', value: 50 }, reward: { spiritStone: 500 } },
  { id: 'ach_social_3', name: '四海之内皆兄弟', desc: '结识100位NPC', condition: { type: 'acquaintances', value: 100 }, reward: { spiritStone: 2000, title: '交友满天下' } },
  // 探索成就
  { id: 'ach_explore_1', name: '初出茅庐', desc: '探索5个地点', condition: { type: 'locations', value: 5 }, reward: { spiritStone: 200 } },
  { id: 'ach_explore_2', name: '游历天下', desc: '探索20个地点', condition: { type: 'locations', value: 20 }, reward: { spiritStone: 1000 } },
  { id: 'ach_explore_3', name: '走遍天涯', desc: '探索全部地点', condition: { type: 'locations', value: 44 }, reward: { spiritStone: 10000, title: '旅行家' } },
  // 生活技能成就
  { id: 'ach_alchemy_1', name: '丹道入门', desc: '炼丹等级达到2级', condition: { type: 'alchemy', value: 2 }, reward: { spiritStone: 300 } },
  { id: 'ach_alchemy_2', name: '丹道大师', desc: '炼丹等级达到5级', condition: { type: 'alchemy', value: 5 }, reward: { spiritStone: 5000, title: '丹道大师' } },
  { id: 'ach_forge_1', name: '炼器入门', desc: '炼器等级达到2级', condition: { type: 'forge', value: 2 }, reward: { spiritStone: 300 } },
  { id: 'ach_forge_2', name: '炼器大师', desc: '炼器等级达到5级', condition: { type: 'forge', value: 5 }, reward: { spiritStone: 5000, title: '炼器大师' } },
  // 其他成就
  { id: 'ach_pet_1', name: '灵宠相伴', desc: '捕捉第一只宠物', condition: { type: 'pets', value: 1 }, reward: { spiritStone: 200 } },
  { id: 'ach_child_1', name: '初为人父', desc: '拥有第一个孩子', condition: { type: 'children', value: 1 }, reward: { spiritStone: 500 } },
  { id: 'ach_child_2', name: '儿孙满堂', desc: '拥有5个孩子', condition: { type: 'children', value: 5 }, reward: { spiritStone: 5000, title: '多子多福' } },
  { id: 'ach_sect_1', name: '门派弟子', desc: '加入一个宗门', condition: { type: 'sect', value: 1 }, reward: { spiritStone: 300 } },
  { id: 'ach_sect_2', name: '开山立派', desc: '创建自己的宗门', condition: { type: 'createSect', value: 1 }, reward: { spiritStone: 10000, title: '开山祖师' } },
  { id: 'ach_mansion_1', name: '安居乐业', desc: '拥有第一座府邸', condition: { type: 'residence', value: 1 }, reward: { spiritStone: 500 } },
  { id: 'ach_mansion_2', name: '豪门望族', desc: '府邸达到5级', condition: { type: 'residenceTier', value: 5 }, reward: { spiritStone: 10000, title: '豪门望族' } },
  { id: 'ach_karma_1', name: '大善人', desc: '功德达到100', condition: { type: 'merit', value: 100 }, reward: { spiritStone: 1000, title: '大善人' } },
  { id: 'ach_karma_2', name: '大魔头', desc: '罪孽达到100', condition: { type: 'sin', value: 100 }, reward: { spiritStone: 1000, title: '大魔头' } },
  // 图鉴成就
  { id: 'ach_collection_1', name: '初窥门径', desc: '收集10种物品', condition: { type: 'collection', value: 10 }, reward: { spiritStone: 200 } },
  { id: 'ach_collection_2', name: '博闻强识', desc: '收集50种物品', condition: { type: 'collection', value: 50 }, reward: { spiritStone: 1000, item: { name: '储物戒', count: 1, type: 'accessory' } } },
  { id: 'ach_collection_3', name: '全图鉴大师', desc: '收集全部物品', condition: { type: 'collection', value: 200 }, reward: { spiritStone: 50000, title: '全图鉴大师', item: { name: '混沌珠', count: 1, type: 'accessory' } } },
  // 捕鱼成就
  { id: 'ach_fishing_1', name: '初入渔道', desc: '捕获第一条鱼', condition: { type: 'fishing', value: 1 }, reward: { silver: 100 } },
  { id: 'ach_fishing_2', name: '渔翁得利', desc: '捕获50条鱼', condition: { type: 'fishing', value: 50 }, reward: { spiritStone: 500, title: '渔翁' } },
  { id: 'ach_fishing_3', name: '钓神', desc: '捕获神品鱼类', condition: { type: 'fishingTier', value: 4 }, reward: { spiritStone: 10000, title: '钓神' } },
  // 烹饪成就
  { id: 'ach_cooking_1', name: '厨艺入门', desc: '制作第一道菜', condition: { type: 'cooking', value: 1 }, reward: { silver: 100 } },
  { id: 'ach_cooking_2', name: '神厨', desc: '制作出神品菜品', condition: { type: 'cookingTier', value: '神品' }, reward: { spiritStone: 5000, title: '神厨' } },
  // 偷窃成就
  { id: 'ach_steal_1', name: '小偷小摸', desc: '偷窃成功10次', condition: { type: 'steal', value: 10 }, reward: { spiritStone: 200 } },
  { id: 'ach_steal_2', name: '盗圣', desc: '偷窃成功100次', condition: { type: 'steal', value: 100 }, reward: { spiritStone: 5000, title: '盗圣' } },
];

// 初始化成就
function initAchievements(player) {
  if (!player.achievements) {
    player.achievements = { unlocked: [], claimed: [], stats: { combatWin: 0, locationsVisited: [], children: 0 } };
  }
  if (!player.achievements.claimed) player.achievements.claimed = [];
  return player.achievements;
}

// 检查成就
function checkAchievements(player) {
  initAchievements(player);
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (player.achievements.unlocked.includes(ach.id)) continue;

    let unlocked = false;
    const cond = ach.condition;

    switch (cond.type) {
      case 'realm':
        unlocked = player.realmLevel >= cond.value;
        break;
      case 'combatWin':
        unlocked = (player.achievements.stats.combatWin || 0) >= cond.value;
        break;
      case 'spiritStone':
        unlocked = player.spiritStone >= cond.value;
        break;
      case 'acquaintances':
        unlocked = (player.acquaintances || []).length >= cond.value;
        break;
      case 'locations':
        unlocked = (player.achievements.stats.locationsVisited || []).length >= cond.value;
        break;
      case 'alchemy':
        unlocked = (player.alchemy?.level || 1) >= cond.value;
        break;
      case 'forge':
        unlocked = (player.forge?.level || 1) >= cond.value;
        break;
      case 'pets':
        unlocked = (player.pets || []).length >= cond.value;
        break;
      case 'children':
        unlocked = (player.achievements.stats.children || 0) >= cond.value;
        break;
      case 'sect':
        unlocked = !!player.sect?.id;
        break;
      case 'createSect':
        unlocked = player.sect?.id?.startsWith('custom_');
        break;
      case 'residence':
        unlocked = !!player.residence;
        break;
      case 'residenceTier':
        unlocked = (player.residence?.tier || 0) >= cond.value;
        break;
      case 'merit':
        unlocked = (player.karma?.merit || 0) >= cond.value;
        break;
      case 'sin':
        unlocked = (player.karma?.sin || 0) >= cond.value;
        break;
      case 'collection':
        unlocked = (player.achievements.stats.collectionCount || 0) >= cond.value;
        break;
      case 'fishing':
        unlocked = (player.achievements.stats.fishingCount || 0) >= cond.value;
        break;
      case 'fishingTier':
        unlocked = (player.achievements.stats.maxFishTier || 0) >= cond.value;
        break;
      case 'cooking':
        unlocked = (player.achievements.stats.cookingCount || 0) >= cond.value;
        break;
      case 'cookingTier':
        unlocked = (player.achievements.stats.maxCookingTier || '') === cond.value;
        break;
      case 'steal':
        unlocked = (player.achievements.stats.stealCount || 0) >= cond.value;
        break;
    }

    if (unlocked) {
      player.achievements.unlocked.push(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

// 领取成就奖励
function claimAchievement(player, achId) {
  initAchievements(player);
  const ach = ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach) return { success: false, msg: '成就不存在' };
  if (!player.achievements.unlocked.includes(achId)) return { success: false, msg: '成就未达成' };
  if (player.achievements.claimed.includes(achId)) return { success: false, msg: '奖励已领取' };

  player.achievements.claimed.push(achId);

  // 发放奖励
  const rewardMsgs = [];
  if (ach.reward) {
    if (ach.reward.spiritStone) {
      player.spiritStone += ach.reward.spiritStone;
      rewardMsgs.push(`灵石+${ach.reward.spiritStone}`);
    }
    if (ach.reward.silver) {
      player.silver += ach.reward.silver;
      rewardMsgs.push(`银两+${ach.reward.silver}`);
    }
    if (ach.reward.exp) {
      player.cultivationExp += ach.reward.exp;
      rewardMsgs.push(`修为+${ach.reward.exp}`);
    }
    if (ach.reward.title) {
      if (!player.titles) player.titles = [];
      if (!player.titles.includes(ach.reward.title)) player.titles.push(ach.reward.title);
      rewardMsgs.push(`获得称号：${ach.reward.title}`);
    }
    if (ach.reward.item) {
      const existing = player.inventory.find(i => i.name === ach.reward.item.name);
      if (existing) existing.count += ach.reward.item.count;
      else player.inventory.push({ ...ach.reward.item });
      rewardMsgs.push(`获得物品：${ach.reward.item.name}×${ach.reward.item.count}`);
    }
  }

  return { success: true, msg: `领取成就【${ach.name}】奖励：${rewardMsgs.join('、')}`, reward: ach.reward };
}

// 更新统计
function updateStat(player, stat, value = 1) {
  initAchievements(player);
  if (stat === 'locationsVisited') {
    if (!player.achievements.stats.locationsVisited.includes(value)) {
      player.achievements.stats.locationsVisited.push(value);
    }
  } else {
    player.achievements.stats[stat] = (player.achievements.stats[stat] || 0) + value;
  }
  return checkAchievements(player);
}

// 获取成就列表
function getAchievements(player) {
  initAchievements(player);
  return {
    unlocked: ACHIEVEMENTS.filter(a => player.achievements.unlocked.includes(a.id)).map(a => ({
      ...a,
      claimed: player.achievements.claimed.includes(a.id),
    })),
    locked: ACHIEVEMENTS.filter(a => !player.achievements.unlocked.includes(a.id)),
    stats: player.achievements.stats,
    count: player.achievements.unlocked.length,
    total: ACHIEVEMENTS.length,
  };
}

module.exports = { ACHIEVEMENTS, initAchievements, checkAchievements, updateStat, getAchievements, claimAchievement };
