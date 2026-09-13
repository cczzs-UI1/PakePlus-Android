// 青云剑宗独有功法库
const QINGYUN_ARTS = [
  { id: 'qinglian', name: '青莲剑诀', price: 800, type: '攻击', desc: '剑出青莲，攻伐凌厉，攻击+15%', buff: { attack: 0.15 } },
  { id: 'taixu', name: '太虚剑诀', price: 1200, type: '攻击', desc: '太虚无形，剑意通玄，攻击+25%', buff: { attack: 0.25 } },
  { id: 'yujian', name: '御剑心经', price: 1000, type: '辅助', desc: '剑心通明，御剑千里，修炼速度+15%', buff: { cultivate: 0.15 } },
  { id: 'jiantong', name: '剑心通明', price: 1500, type: '辅助', desc: '心如剑明，悟性大涨，悟性+10、修炼速度+10%', buff: { enlightenment: 10, cultivate: 0.10 } },
  { id: 'wanjian', name: '万剑归宗', price: 3000, type: '奥义', desc: '万剑齐发，神鬼辟易，攻击+40%、灵力上限+20%', buff: { attack: 0.40, mpMax: 0.20 } },
  { id: 'jianxin', name: '剑心种魔', price: 2000, type: '奥义', desc: '正邪一念，攻守兼备，攻击+20%、防御+20%', buff: { attack: 0.20, defense: 0.20 } },
];

// 计算玩家已学青云剑宗功法的加成总和
function getQingyunBuffs(player) {
  const buffs = { attack: 0, defense: 0, cultivate: 0, enlightenment: 0, mpMax: 0 };
  const arts = player.qingyunArts || {};
  for (const art of QINGYUN_ARTS) {
    if (arts[art.id] && arts[art.id].learned && art.buff) {
      if (art.buff.attack) buffs.attack += art.buff.attack;
      if (art.buff.defense) buffs.defense += art.buff.defense;
      if (art.buff.cultivate) buffs.cultivate += art.buff.cultivate;
      if (art.buff.enlightenment) buffs.enlightenment += art.buff.enlightenment;
      if (art.buff.mpMax) buffs.mpMax += art.buff.mpMax;
    }
  }
  return buffs;
}

// 学习功法：消耗灵石
function learnQingyunArt(player, artId) {
  const art = QINGYUN_ARTS.find(a => a.id === artId);
  if (!art) return { error: '没有这部功法' };
  if (!player.qingyunArts) player.qingyunArts = {};
  if (player.qingyunArts[artId] && player.qingyunArts[artId].learned) return { error: '已学会这部功法' };
  if ((player.spiritStones || 0) < art.price) return { error: `灵石不足，需要${art.price}灵石` };
  player.spiritStones -= art.price;
  player.qingyunArts[artId] = { learned: true, learnedAt: Date.now() };
  if (!player.skills) player.skills = [];
  if (!player.skills.includes(art.name)) player.skills.push(art.name);
  return { success: true, msg: `你参悟了青云剑宗绝学【${art.name}】！${art.desc}`, art };
}

function getQingyunArts(player) {
  const arts = player.qingyunArts || {};
  return {
    location: '青云剑宗',
    arts: QINGYUN_ARTS.map(a => ({ ...a, learned: !!(arts[a.id] && arts[a.id].learned) })),
    buffs: getQingyunBuffs(player),
    spiritStones: player.spiritStones || 0,
  };
}

module.exports = { QINGYUN_ARTS, getQingyunBuffs, learnQingyunArt, getQingyunArts };
