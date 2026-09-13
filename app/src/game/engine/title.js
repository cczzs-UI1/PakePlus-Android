// 称号系统
const TITLES = [
  // 境界称号
  { id: 'title_qi', name: '炼气士', desc: '炼气境修士', condition: { type: 'realm', value: 1 }, atkBonus: 0, defBonus: 0, expBonus: 0 },
  { id: 'title_zhu', name: '筑基真人', desc: '筑基境修士', condition: { type: 'realm', value: 3 }, atkBonus: 5, defBonus: 5, expBonus: 0 },
  { id: 'title_jie', name: '金丹真君', desc: '结丹境修士', condition: { type: 'realm', value: 4 }, atkBonus: 10, defBonus: 10, expBonus: 0.05 },
  { id: 'title_yuan', name: '元婴天尊', desc: '元婴境修士', condition: { type: 'realm', value: 5 }, atkBonus: 20, defBonus: 20, expBonus: 0.1 },
  { id: 'title_hua', name: '化神大能', desc: '化神境修士', condition: { type: 'realm', value: 6 }, atkBonus: 35, defBonus: 35, expBonus: 0.15 },
  { id: 'title_du', name: '渡劫仙尊', desc: '渡劫境修士', condition: { type: 'realm', value: 10 }, atkBonus: 100, defBonus: 100, expBonus: 0.3 },
  // 财富称号
  { id: 'title_rich1', name: '小富翁', desc: '拥有1万灵石', condition: { type: 'spiritStone', value: 10000 }, atkBonus: 0, defBonus: 0, expBonus: 0 },
  { id: 'title_rich2', name: '大富翁', desc: '拥有10万灵石', condition: { type: 'spiritStone', value: 100000 }, atkBonus: 0, defBonus: 0, expBonus: 0.05 },
  { id: 'title_rich3', name: '富可敌国', desc: '拥有100万灵石', condition: { type: 'spiritStone', value: 1000000 }, atkBonus: 10, defBonus: 10, expBonus: 0.1 },
  // 战斗称号
  { id: 'title_war1', name: '百人斩', desc: '赢得100场战斗', condition: { type: 'combatWin', value: 100 }, atkBonus: 10, defBonus: 0, expBonus: 0 },
  { id: 'title_war2', name: '千人斩', desc: '赢得1000场战斗', condition: { type: 'combatWin', value: 1000 }, atkBonus: 30, defBonus: 10, expBonus: 0.1 },
  { id: 'title_war3', name: '战神', desc: '赢得5000场战斗', condition: { type: 'combatWin', value: 5000 }, atkBonus: 50, defBonus: 30, expBonus: 0.2 },
  // 社交称号
  { id: 'title_social1', name: '交友广泛', desc: '结识50人', condition: { type: 'acquaintances', value: 50 }, atkBonus: 0, defBonus: 0, expBonus: 0.05 },
  { id: 'title_social2', name: '四海之内皆兄弟', desc: '结识100人', condition: { type: 'acquaintances', value: 100 }, atkBonus: 5, defBonus: 5, expBonus: 0.1 },
  // 生活技能称号
  { id: 'title_alchemy', name: '丹道大师', desc: '炼丹等级5级', condition: { type: 'alchemy', value: 5 }, atkBonus: 0, defBonus: 0, expBonus: 0.1 },
  { id: 'title_forge', name: '炼器大师', desc: '炼器等级5级', condition: { type: 'forge', value: 5 }, atkBonus: 5, defBonus: 10, expBonus: 0 },
  { id: 'title_formation', name: '阵法大师', desc: '阵法等级5级', condition: { type: 'formation', value: 5 }, atkBonus: 10, defBonus: 5, expBonus: 0 },
  // 特殊称号
  { id: 'title_sect', name: '一宗之主', desc: '创建宗门', condition: { type: 'createSect', value: 1 }, atkBonus: 20, defBonus: 20, expBonus: 0.1 },
  { id: 'title_mansion', name: '豪门望族', desc: '府邸达到5级', condition: { type: 'residenceTier', value: 5 }, atkBonus: 10, defBonus: 10, expBonus: 0.05 },
  { id: 'title_child', name: '多子多福', desc: '拥有5个孩子', condition: { type: 'children', value: 5 }, atkBonus: 0, defBonus: 0, expBonus: 0.1 },
  { id: 'title_pet', name: '万兽之王', desc: '拥有10只宠物', condition: { type: 'pets', value: 10 }, atkBonus: 15, defBonus: 10, expBonus: 0 },
  { id: 'title_mount', name: '驭兽宗师', desc: '拥有5只坐骑', condition: { type: 'mounts', value: 5 }, atkBonus: 10, defBonus: 10, expBonus: 0.05 },
  { id: 'title_good', name: '大善人', desc: '功德达到100', condition: { type: 'merit', value: 100 }, atkBonus: 5, defBonus: 15, expBonus: 0.05 },
  { id: 'title_evil', name: '大魔头', desc: '罪孽达到100', condition: { type: 'sin', value: 100 }, atkBonus: 20, defBonus: 5, expBonus: 0.05 },
  { id: 'title_explorer', name: '旅行家', desc: '探索全部44个地点', condition: { type: 'locations', value: 44 }, atkBonus: 10, defBonus: 10, expBonus: 0.1 },
];

// 初始化称号
function initTitles(player) {
  if (!player.titles) {
    player.titles = {
      unlocked: [],
      active: null,
    };
  }
  return player.titles;
}

// 检查称号解锁
function checkTitles(player) {
  initTitles(player);
  const newlyUnlocked = [];

  for (const title of TITLES) {
    if (player.titles.unlocked.includes(title.id)) continue;

    let unlocked = false;
    const cond = title.condition;

    switch (cond.type) {
      case 'realm':
        unlocked = player.realmLevel >= cond.value;
        break;
      case 'spiritStone':
        unlocked = player.spiritStone >= cond.value;
        break;
      case 'combatWin':
        unlocked = (player.achievements?.stats?.combatWin || 0) >= cond.value;
        break;
      case 'acquaintances':
        unlocked = (player.acquaintances || []).length >= cond.value;
        break;
      case 'alchemy':
        unlocked = (player.alchemy?.level || 1) >= cond.value;
        break;
      case 'forge':
        unlocked = (player.forge?.level || 1) >= cond.value;
        break;
      case 'formation':
        unlocked = (player.formation?.level || 1) >= cond.value;
        break;
      case 'createSect':
        unlocked = player.sect?.id?.startsWith('custom_');
        break;
      case 'residenceTier':
        unlocked = (player.residence?.tier || 0) >= cond.value;
        break;
      case 'children':
        unlocked = (player.achievements?.stats?.children || 0) >= cond.value;
        break;
      case 'pets':
        unlocked = (player.pets || []).length >= cond.value;
        break;
      case 'mounts':
        unlocked = (player.mounts || []).length >= cond.value;
        break;
      case 'merit':
        unlocked = (player.karma?.merit || 0) >= cond.value;
        break;
      case 'sin':
        unlocked = (player.karma?.sin || 0) >= cond.value;
        break;
      case 'locations':
        unlocked = (player.achievements?.stats?.locationsVisited || []).length >= cond.value;
        break;
    }

    if (unlocked) {
      player.titles.unlocked.push(title.id);
      newlyUnlocked.push(title);
    }
  }

  return newlyUnlocked;
}

// 装备称号
function equipTitle(player, titleId) {
  initTitles(player);
  if (!player.titles.unlocked.includes(titleId)) {
    return { success: false, msg: '未解锁该称号' };
  }
  if (player.titles.active === titleId) {
    player.titles.active = null;
    return { success: true, msg: '卸下称号' };
  }
  player.titles.active = titleId;
  const title = TITLES.find(t => t.id === titleId);
  return { success: true, msg: `装备称号：${title.name}` };
}

// 获取当前称号加成
function getTitleBonus(player) {
  initTitles(player);
  if (!player.titles.active) {
    return { atkBonus: 0, defBonus: 0, expBonus: 0, name: null };
  }
  const title = TITLES.find(t => t.id === player.titles.active);
  return {
    atkBonus: title.atkBonus,
    defBonus: title.defBonus,
    expBonus: title.expBonus,
    name: title.name,
  };
}

// 获取称号列表
function getTitleList(player) {
  initTitles(player);
  return {
    unlocked: TITLES.filter(t => player.titles.unlocked.includes(t.id)),
    locked: TITLES.filter(t => !player.titles.unlocked.includes(t.id)),
    active: player.titles.active,
    count: player.titles.unlocked.length,
    total: TITLES.length,
  };
}

module.exports = {
  TITLES, initTitles, checkTitles, equipTitle, getTitleBonus, getTitleList,
};
