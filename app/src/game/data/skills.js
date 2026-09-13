// 功法技能系统
const SKILLS = {
  // 主动技能
  '青莲剑诀': { type: 'active', element: '木', require: { realm: 3, faction: '青云剑宗' }, cost: { mp: 80 }, damage: 1.2, target: 'single', effect: null, maxBonus: '无视20%防御', desc: '青云剑宗入门剑法，剑气如青莲绽放。' },
  '地火焚天': { type: 'active', element: '火', require: { realm: 4, root: '火' }, cost: { mp: 150 }, damage: 1.0, target: 'aoe', effect: { debuff: '灼烧', chance: 80 }, maxBonus: '灼烧翻倍+禁疗', desc: '引地火焚尽一切，灼烧敌人。' },
  '寒冰盾': { type: 'active', element: '冰', require: { realm: 3 }, cost: { mp: 60 }, damage: 0, target: 'self', effect: { buff: '护盾·玄冰', value: 2.5 }, maxBonus: '破碎时冰冻敌人', desc: '凝聚寒冰为盾，吸收伤害。' },
  '天雷正法': { type: 'active', element: '雷', require: { realm: 5, merit: 500 }, cost: { mp: 200 }, damage: 2.0, target: 'single', effect: null, maxBonus: '无视所有抗性', desc: '引天雷正法，对魔鬼有奇效。' },
  '噬魂魔手': { type: 'active', element: '魔', require: { realm: 4, race: '魔族' }, cost: { hp: 200 }, damage: 1.5, target: 'single', effect: { lifesteal: 0.3 }, maxBonus: '对正道+50%+恐惧', desc: '魔道邪功，噬魂噬血。' },
  '疾风步': { type: 'active', element: '风', require: { realm: 2 }, cost: { mp: 30 }, damage: 0, target: 'self', effect: { buff: '轻身术', value: 0.4 }, maxBonus: '闪避+60%', desc: '身法如风，闪避大增。' },
  '回春术': { type: 'active', element: '木', require: { realm: 2 }, cost: { mp: 50 }, damage: 0, target: 'self', effect: { heal: 0.2 }, maxBonus: '治疗+50%', desc: '木系治愈术，恢复气血。' },
  '御剑术': { type: 'active', element: '金', require: { realm: 2 }, cost: { mp: 40 }, damage: 1.0, target: 'single', effect: null, maxBonus: '可远程攻击', desc: '御剑飞行攻击，远程杀伤。' },
  '烈焰弹': { type: 'active', element: '火', require: { realm: 1 }, cost: { mp: 20 }, damage: 0.8, target: 'single', effect: { debuff: '灼烧', chance: 30 }, maxBonus: '灼烧概率+50%', desc: '基础火系法术。' },
  '水箭术': { type: 'active', element: '水', require: { realm: 1 }, cost: { mp: 20 }, damage: 0.8, target: 'single', effect: null, maxBonus: '减速30%', desc: '基础水系法术。' },

  // 被动技能
  '铁布衫': { type: 'passive', element: '金', require: { realm: 1 }, effect: { defense: 0.1 }, desc: '外功横练，防御提升。' },
  '吐纳术': { type: 'passive', element: '无', require: { realm: 1 }, effect: { mpRegen: 0.05 }, desc: '基础吐纳，灵力恢复提升。' },
  '长生诀': { type: 'passive', element: '木', require: { realm: 3 }, effect: { hpRegen: 0.03, lifespan: 50 }, desc: '养生功法，延年益寿。' },
  '剑心通明': { type: 'passive', element: '金', require: { realm: 4, faction: '青云剑宗' }, effect: { crit: 0.1, swordDamage: 0.2 }, desc: '剑心通明，暴击与剑伤提升。' },
  '魔体': { type: 'passive', element: '魔', require: { race: '魔族' }, effect: { lifesteal: 0.1, selfDamage: -0.1 }, desc: '魔族天生魔体，吸血但怕雷。' },
};

// 功法熟练度等级
const SKILL_STAGES = ['初窥', '熟练', '精通', '化境', '归一'];
const SKILL_STAGE_BONUS = [1.0, 1.15, 1.3, 1.5, 1.8];

// 五行克制
const ELEMENT_COUNTER = {
  '木': { strong: '土', weak: '金' },
  '火': { strong: '金', weak: '水' },
  '土': { strong: '水', weak: '木' },
  '金': { strong: '木', weak: '火' },
  '水': { strong: '火', weak: '土' },
  '风': { strong: null, weak: null, special: { flying: 1.3 } },
  '雷': { strong: '魔', weak: null, special: { demon: 1.4, ghost: 1.4 } },
  '冰': { strong: '火', weak: '火' },
  '魔': { strong: null, weak: '雷' },
};

module.exports = { SKILLS, SKILL_STAGES, SKILL_STAGE_BONUS, ELEMENT_COUNTER };
