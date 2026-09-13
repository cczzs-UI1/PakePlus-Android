// 修仙境界 10境 × 3阶（每境分前期/中期/后期，逐层突破不可跳跃）
const REALMS = [
  { level: 1, name: '凡人境', lifespan: 100, expNeed: 0, coefficient: 1, ability: '凡躯，感知微弱', condition: null },
  { level: 2, name: '炼气境', lifespan: 150, expNeed: 1000, coefficient: 2, ability: '御物飞行，辟谷', condition: null },
  { level: 3, name: '筑基境', lifespan: 300, expNeed: 5000, coefficient: 5, ability: '道基，神识外放', condition: { pill: '筑基丹', bonus: 30 } },
  { level: 4, name: '金丹境', lifespan: 800, expNeed: 20000, coefficient: 15, ability: '领域雏形', condition: { pill: '金丹破障丹' } },
  { level: 5, name: '元婴境', lifespan: 2000, expNeed: 80000, coefficient: 50, ability: '元婴出窍，法则感悟', condition: { pill: '元婴丹', trial: '心魔试炼' } },
  { level: 6, name: '化神境', lifespan: 5000, expNeed: 300000, coefficient: 200, ability: '言出法随', condition: { pill: '化神丹', merit: 200 } },
  { level: 7, name: '炼虚境', lifespan: 20000, expNeed: 1000000, coefficient: 1000, ability: '空间法则', condition: { pill: '炼虚丹', physique: 300 } },
  { level: 8, name: '合体境', lifespan: 50000, expNeed: 5000000, coefficient: 5000, ability: '滴血重生', condition: { pill: '合体丹', spirit: 500 } },
  { level: 9, name: '大乘境', lifespan: 100000, expNeed: 20000000, coefficient: 30000, ability: '渡劫飞升', condition: { pill: '大乘丹', merit: 1000 } },
  { level: 10, name: '渡劫/真仙', lifespan: Infinity, expNeed: 100000000, coefficient: 100000, ability: '飞升上界', condition: { trial: '渡劫塔通关' } },
];

const SUB_STAGES = ['前期', '中期', '后期'];

// 计算某境界某小层（0前期/1中期/2后期）突破所需修为
// - 凡人境（level1）无修为需求（初始境，直接突破入炼气）
// - 前期→中期：需该境 expNeed 的 1/3；中期→后期：2/3；后期→下一境前期：需满 expNeed
function calcStageExpNeed(realmLevel, stageIdx) {
  const realm = REALMS[realmLevel - 1];
  if (!realm) return 0;
  if (realmLevel <= 1) return 0; // 凡人境无需修为即可突破至炼气前期
  if (stageIdx >= 2) return realm.expNeed; // 后期→升境需修为满
  if (stageIdx < 0) return 0;
  return Math.max(1, Math.ceil(realm.expNeed * (stageIdx + 1) / 3));
}

// 突破成功率公式
function calcBreakthroughChance(player, targetLevel) {
  const realm = REALMS[targetLevel - 1];
  // 各时期基础突破率：初始（炼气）100%，每突破成功一层降5%，下限15%
  const baseRate = Math.max(30, 105 - targetLevel * 5);
  // 悟性/灵根纯度加成：悟性存于 attributes.enlightenment，缺失字段按50处理（避免NaN）
  const enlightenment = (player.attributes && typeof player.attributes.enlightenment === 'number')
    ? player.attributes.enlightenment
    : (typeof player.enlightenment === 'number' ? player.enlightenment : 50);
  const purity = (player.spiritRoot && typeof player.spiritRoot.purity === 'number')
    ? player.spiritRoot.purity
    : (player.attributes && typeof player.attributes.purity === 'number' ? player.attributes.purity : 50);
  let chance = baseRate + (enlightenment - 50) * 0.5 + (purity - 50) * 0.2;
  // 丹药加成：背包中存在对应突破丹药（如筑基丹）时加成；服用丹药的临时状态也加成
  if (realm.condition && realm.condition.pill) {
    const hasPill = (player.inventory || []).some(i => i.name === realm.condition.pill && i.count > 0);
    if (hasPill) chance += realm.condition.bonus || 20;
  }
  // 服用突破类丹药的临时状态（筑基丹效/破境丹效等）
  for (const sf of player.statusEffects || []) {
    if (typeof sf.name === 'string' && sf.name.includes('丹效')) {
      chance += sf.bonus || 25;
    }
  }
  // 状态修正
  if (player.statusEffects?.some(s => s.name === '虚弱')) chance -= 20;
  if (player.statusEffects?.some(s => s.name === '心魔缠身')) chance -= 30;
  if (player.statusEffects?.some(s => s.name === '先祖庇佑')) chance += 15;
  if (player.statusEffects?.some(s => s.name === '天命加身')) return 100;
  // 父母境界加成
  if (player.family) {
    const father = player.family.father?.realmLevel || 1;
    const mother = player.family.mother?.realmLevel || 1;
    chance += Math.max(father, mother) * 5;
  }
  return Math.min(100, Math.max(5, Math.round(chance)));
}

module.exports = { REALMS, SUB_STAGES, calcBreakthroughChance, calcStageExpNeed };
