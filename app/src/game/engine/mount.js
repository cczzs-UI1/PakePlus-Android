// 坐骑系统 - 捕捉、培养、骑乘
const { randInt, chance, randChoice, clamp, genId } = require('./utils');

// 坐骑种类
const MOUNT_TYPES = [
  // 普通坐骑
  { id: 'horse', name: '骏马', tier: 1, desc: '普通的骏马，可代步', speed: 1.2, atkBonus: 0, defBonus: 0, locations: ['清风镇', '大夏皇都', '落日森林'] },
  { id: 'camel', name: '骆驼', tier: 1, desc: '沙漠之舟，耐力惊人', speed: 1.1, atkBonus: 0, defBonus: 5, locations: ['裂风峡谷', '万妖山脉'] },
  { id: 'deer', name: '灵鹿', tier: 2, desc: '通灵的仙鹿，速度极快', speed: 1.5, atkBonus: 0, defBonus: 0, locations: ['万妖山脉', '兽灵山', '洞天福地'] },
  { id: 'wolf', name: '苍狼坐骑', tier: 2, desc: '凶猛的苍狼，可助战', speed: 1.4, atkBonus: 10, defBonus: 0, locations: ['落日森林', '万妖山脉'] },
  { id: 'bear', name: '巨熊', tier: 2, desc: '力大无穷的巨熊', speed: 1.0, atkBonus: 15, defBonus: 10, locations: ['落日森林', '万妖山脉'] },
  { id: 'tiger', name: '白虎', tier: 3, desc: '四象之一的白虎', speed: 1.6, atkBonus: 25, defBonus: 15, locations: ['万妖山脉', '兽灵山'] },
  { id: 'crane', name: '仙鹤', tier: 3, desc: '仙风道骨的仙鹤，可飞行', speed: 2.0, atkBonus: 5, defBonus: 5, locations: ['青云剑宗', '洞天福地', '天星阁'] },
  { id: 'lion', name: '金毛吼', tier: 3, desc: '狮吼震天，万兽臣服', speed: 1.5, atkBonus: 20, defBonus: 10, locations: ['万妖山脉', '兽灵山'] },
  { id: 'elephant', name: '白象', tier: 3, desc: '普贤菩萨的坐骑，力大无穷', speed: 1.0, atkBonus: 20, defBonus: 25, locations: ['万妖山脉'] },
  { id: 'qilin', name: '麒麟', tier: 4, desc: '瑞兽麒麟，祥瑞之兆', speed: 1.8, atkBonus: 30, defBonus: 20, locations: ['洞天福地', '太虚梦境'] },
  { id: 'phoenix', name: '朱雀', tier: 4, desc: '四象之一的朱雀，浴火重生', speed: 2.2, atkBonus: 35, defBonus: 15, locations: ['裂风峡谷', '万妖山脉'] },
  { id: 'turtle', name: '玄武', tier: 4, desc: '四象之一的玄武，防御无双', speed: 0.8, atkBonus: 10, defBonus: 50, locations: ['归墟海眼', '东海渔村'] },
  { id: 'dragon', name: '青龙', tier: 5, desc: '四象之首的青龙，可腾云驾雾', speed: 2.5, atkBonus: 50, defBonus: 30, locations: ['龙渊', '混沌海'] },
  { id: 'fenghuang', name: '凤凰', tier: 5, desc: '百鸟之王，涅槃重生', speed: 2.3, atkBonus: 45, defBonus: 25, locations: ['混沌海', '太虚梦境'] },
  { id: 'shenniu', name: '五色神牛', tier: 5, desc: '通天教主的坐骑，五色神光', speed: 1.2, atkBonus: 40, defBonus: 40, locations: ['混沌海', '通天古路'] },
];

// 生成坐骑
function generateMount(typeId = null) {
  const type = typeId ? MOUNT_TYPES.find(t => t.id === typeId) : randChoice(MOUNT_TYPES);
  if (!type) return null;

  const quality = randInt(1, 100);
  let qualityName, qualityMultiplier;
  if (quality <= 50) { qualityName = '普通'; qualityMultiplier = 1; }
  else if (quality <= 80) { qualityName = '优秀'; qualityMultiplier = 1.2; }
  else if (quality <= 95) { qualityName = '稀有'; qualityMultiplier = 1.5; }
  else if (quality <= 99) { qualityName = '史诗'; qualityMultiplier = 2; }
  else { qualityName = '传说'; qualityMultiplier = 3; }

  return {
    id: genId(),
    typeId: type.id,
    name: type.name,
    nickname: '',
    tier: type.tier,
    quality: qualityName,
    qualityMultiplier,
    desc: type.desc,
    level: 1,
    exp: 0,
    expToNext: 200,
    speed: type.speed * qualityMultiplier,
    atkBonus: Math.floor(type.atkBonus * qualityMultiplier),
    defBonus: Math.floor(type.defBonus * qualityMultiplier),
    isActive: false,
  };
}

// 捕捉坐骑
function tryCaptureMount(player, location) {
  const available = MOUNT_TYPES.filter(m => m.locations.includes(location));
  if (available.length === 0) {
    return { success: false, msg: '此处没有可捕捉的坐骑。' };
  }

  let captureRate = 10 + player.attributes.enlightenment * 0.2;
  if (player.inventory?.some(i => i.name === '驯兽鞭')) captureRate += 15;
  if (player.sect?.name === '万兽门') captureRate += 20;

  if (chance(captureRate)) {
    // 高级坐骑概率更低
    const weighted = [];
    for (const m of available) {
      const weight = m.tier <= 2 ? 40 : m.tier === 3 ? 15 : m.tier === 4 ? 5 : 1;
      for (let i = 0; i < weight; i++) weighted.push(m);
    }
    const mount = generateMount(randChoice(weighted).id);
    if (!player.mounts) player.mounts = [];
    player.mounts.push(mount);
    return { success: true, msg: `你成功捕捉了一只${mount.quality}${mount.name}！`, mount };
  }
  return { success: false, msg: '坐骑逃跑了...' };
}

// 坐骑升级
function levelUpMount(mount) {
  mount.level++;
  mount.expToNext = Math.floor(mount.expToNext * 1.5);
  mount.speed *= 1.05;
  mount.atkBonus = Math.floor(mount.atkBonus * 1.1);
  mount.defBonus = Math.floor(mount.defBonus * 1.1);
  return mount;
}

// 喂养坐骑
function feedMount(player, mount) {
  const cost = 50;
  if (player.spiritStone < cost) return { success: false, msg: '灵石不足' };
  player.spiritStone -= cost;
  mount.exp += 50;
  if (mount.exp >= mount.expToNext) {
    levelUpMount(mount);
    return { success: true, msg: `${mount.name}升级了！现在是Lv.${mount.level}` };
  }
  return { success: true, msg: `喂养了${mount.name}。` };
}

// 骑乘坐骑
function setActiveMount(player, mountId) {
  if (!player.mounts) return { success: false, msg: '你没有坐骑' };
  for (const m of player.mounts) {
    m.isActive = m.id === mountId;
  }
  const mount = player.mounts.find(m => m.id === mountId);
  return { success: true, msg: mount?.isActive ? `骑乘${mount.name}` : '下了坐骑' };
}

// 获取坐骑加成
function getMountBonus(player) {
  if (!player.mounts) return { speed: 1, atkBonus: 0, defBonus: 0, name: null };
  const active = player.mounts.find(m => m.isActive);
  if (!active) return { speed: 1, atkBonus: 0, defBonus: 0, name: null };
  return {
    speed: active.speed,
    atkBonus: active.atkBonus,
    defBonus: active.defBonus,
    name: active.name,
  };
}

// 坐骑改名
function renameMount(mount, nickname) {
  mount.nickname = nickname;
  return { success: true, msg: `坐骑已改名为${nickname}` };
}

module.exports = {
  MOUNT_TYPES, generateMount, tryCaptureMount, levelUpMount,
  feedMount, setActiveMount, getMountBonus, renameMount,
};
