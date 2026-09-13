// 蛊术体系：万毒沼泽蛊师小屋专属
// 蛊术（被动功法，学习后永久生效）+ 蛊虫（各品级灵宠，可放入灵宠栏查看）
const { randInt } = require('./utils');

// 蛊术列表
const GU_ARTS = [
  {
    id: 'yu_gu', name: '驭蛊术', price: 500,
    desc: '以心神驭使蛊虫，与蛊虫心意相通。学习后根骨+2，所有灵宠好感提升。',
    effect: { willpower: 2, gu_power: 5 },
  },
  {
    id: 'gu_du', name: '蛊毒术', price: 800,
    desc: '精研蛊毒之道，举手投足间暗含毒性。学习后悟性+2，攻击附带蛊毒之力。',
    effect: { enlightenment: 2, gu_power: 10 },
  },
  {
    id: 'lian_gu', name: '炼蛊术', price: 1200,
    desc: '精通养蛊炼毒之法，可培育更强的蛊虫。学习后丹术+3，蛊虫品质提升一档。',
    effect: { alchemy: 3, gu_power: 15 },
  },
];

// 蛊虫品级（可作灵宠放入 player.pets）
const GU_WORMS = [
  {
    id: 'worm_1', name: '噬血蛊', rank: '凡蛊', tier: 1, price: 100, poisonHerb: 1,
    desc: '低阶蛊虫，嗜血噬肉，攻击凶猛。',
    stats: { atk: 10, def: 4, spd: 6, hp: 60 },
    skill: '噬血：攻击时吸取敌人少量气血',
  },
  {
    id: 'worm_2', name: '金蚕蛊', rank: '良蛊', tier: 2, price: 250, poisonHerb: 2,
    desc: '通体金黄，刀枪难伤，是炼制护身蛊的良材。',
    stats: { atk: 18, def: 10, spd: 8, hp: 90 },
    skill: '金蚕甲：防御时减少更多伤害',
  },
  {
    id: 'worm_3', name: '情蛊', rank: '珍蛊', tier: 3, price: 500, poisonHerb: 3,
    desc: '以情丝为引炼制的珍稀蛊虫，中蛊者心神被摄。',
    stats: { atk: 26, def: 12, spd: 12, hp: 120 },
    skill: '情丝缚：战斗中有几率令敌人短暂失神',
  },
  {
    id: 'worm_4', name: '蚀骨蛊', rank: '灵蛊', tier: 4, price: 1000, poisonHerb: 5,
    desc: '剧毒无比，触之蚀骨，修士闻之色变。',
    stats: { atk: 36, def: 16, spd: 16, hp: 160 },
    skill: '蚀骨毒：攻击附带腐蚀，削减敌人防御',
  },
  {
    id: 'worm_5', name: '万毒蛊', rank: '神蛊', tier: 5, price: 2000, poisonHerb: 8,
    desc: '以万种毒物相互吞噬后诞生的蛊王，天下至毒。',
    stats: { atk: 50, def: 22, spd: 20, hp: 220 },
    skill: '万毒噬心：攻击有几率令敌人中毒三回合',
  },
];

// 初始化蛊师状态
function initGu(player) {
  if (!player.gu) {
    player.gu = { arts: [], worms: [] };
  }
  return player.gu;
}

// 蛊师信息
function getGuInfo(player) {
  const gu = initGu(player);
  return {
    arts: GU_ARTS.map(a => ({ ...a, learned: gu.arts.includes(a.id) })),
    worms: GU_WORMS.map(w => ({
      ...w,
      owned: (player.pets || []).some(p => p.guWorm === w.id),
    })),
    learned: gu.arts,
  };
}

// 学习蛊术
function learnGuArt(player, artId) {
  const gu = initGu(player);
  const art = GU_ARTS.find(a => a.id === artId);
  if (!art) return { success: false, msg: '没有这种蛊术' };
  if (gu.arts.includes(artId)) return { success: false, msg: '你已经学会这门蛊术了' };
  if ((player.spiritStone || 0) < art.price) {
    return { success: false, msg: `灵石不足，学习${art.name}需要${art.price}灵石` };
  }
  player.spiritStone -= art.price;
  gu.arts.push(artId);

  // 属性加成
  if (art.effect) {
    for (const [key, val] of Object.entries(art.effect)) {
      if (key === 'willpower') player.attributes.willpower = (player.attributes.willpower || 0) + val;
      else if (key === 'enlightenment') player.attributes.enlightenment = (player.attributes.enlightenment || 0) + val;
      else if (key === 'alchemy') player.attributes.alchemy = (player.attributes.alchemy || 0) + val;
      else if (key === 'gu_power') player.attributes.guPower = (player.attributes.guPower || 0) + val;
    }
  }
  return { success: true, msg: `你学会了「${art.name}」！${art.desc}`, art };
}

// 购买蛊虫（蛊虫作为灵宠加入 player.pets）
function buyGuWorm(player, wormId) {
  const gu = initGu(player);
  const worm = GU_WORMS.find(w => w.id === wormId);
  if (!worm) return { success: false, msg: '没有这种蛊虫' };
  if ((player.pets || []).some(p => p.guWorm === worm.id)) {
    return { success: false, msg: `你已经拥有${worm.name}了` };
  }
  if ((player.spiritStone || 0) < worm.price) {
    return { success: false, msg: `灵石不足，${worm.name}需要${worm.price}灵石` };
  }
  if (!player.inventory) player.inventory = [];
  const herb = player.inventory.find(i => i.name === '毒草');
  const herbCount = herb ? herb.count : 0;
  if (herbCount < worm.poisonHerb) {
    return { success: false, msg: `毒草不足，需要${worm.poisonHerb}株毒草（可在万毒沼泽采集）` };
  }

  player.spiritStone -= worm.price;
  herb.count -= worm.poisonHerb;
  if (herb.count <= 0) player.inventory = player.inventory.filter(i => i.name !== '毒草' || i.count > 0);

  if (!player.pets) player.pets = [];
  player.pets.push({
    name: worm.name,
    quality: worm.rank === '凡蛊' ? '普通' : worm.rank === '良蛊' ? '优秀' : worm.rank === '珍蛊' ? '稀有' : worm.rank === '灵蛊' ? '传说' : '神话',
    tier: worm.tier,
    stats: { ...worm.stats },
    skill: worm.skill,
    level: 1,
    exp: 0,
    guWorm: worm.id,
    desc: worm.desc,
  });
  gu.worms.push(wormId);

  return {
    success: true,
    msg: `你从蛊师手中购得${worm.name}（${worm.rank}）！已放入灵宠栏，可在灵宠中查看。`,
    pet: { name: worm.name, rank: worm.rank, tier: worm.tier, stats: worm.stats },
  };
}

module.exports = { GU_ARTS, GU_WORMS, initGu, getGuInfo, learnGuArt, buyGuWorm };
