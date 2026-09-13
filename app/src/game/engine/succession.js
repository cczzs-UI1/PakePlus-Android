// 传代系统：NPC死亡遗产分配（⑥）+ 主控手动传代（⑦）
const { randChoice } = require('./utils');

// 需求⑥：NPC死亡后，遗产（银两/灵石/财物）随机传给在世子嗣；无子嗣则传给其他亲属（父母/配偶）
// 返回世界记事文本（无遗产或无继承人时返回 null）
function distributeInheritance(state, deadNpc) {
  const wealth = (deadNpc.silver || 0) + (deadNpc.spiritStone || 0);
  const hasItems = deadNpc.inventory && deadNpc.inventory.length > 0;
  if (wealth <= 0 && !hasItems) return null;

  const fam = deadNpc.family || {};
  const alive = (ids) => (ids || []).map(id => state.npcs.find(n => n.id === id)).filter(n => n && n.isAlive);
  const heirs = alive(fam.children);
  const otherRel = heirs.length === 0 ? alive([fam.father, fam.mother, fam.spouse]) : [];
  const heir = heirs.length > 0 ? randChoice(heirs) : (otherRel.length > 0 ? randChoice(otherRel) : null);
  if (!heir) return null;

  heir.silver = (heir.silver || 0) + (deadNpc.silver || 0);
  heir.spiritStone = (heir.spiritStone || 0) + (deadNpc.spiritStone || 0);
  if (hasItems) {
    if (!heir.inventory) heir.inventory = [];
    heir.inventory = heir.inventory.concat(deadNpc.inventory || []);
  }
  deadNpc.silver = 0;
  deadNpc.spiritStone = 0;
  deadNpc.inventory = [];
  const rel = heirs.length > 0 ? '子嗣' : '亲属';
  return `${deadNpc.name}去世后，遗产由${rel}${heir.name}继承。`;
}

// 需求⑦：主控手动传代——把主控之位交给一位亲属NPC
// 资源（银两/灵石/背包/仓库）随行；前任主控变为普通NPC（保留在npc列表）；宅子默认送出
function playerSuccession(state, npcId) {
  const p = state.player;
  const target = state.npcs.find(n => n.id === npcId);
  if (!target) return { error: '未找到该NPC（数据可能已被清理），请刷新后重试' };
  if (target.isAlive === false) return { error: '该亲属已不在人世，无法传代' };
  if (target.id === p.id) return { error: '不能传代给自己' };

  const fam = p.family || {};
  const isRel = fam.spouse === target.id || fam.father === target.id || fam.mother === target.id ||
    (fam.children || []).includes(target.id);
  if (!isRel) return { error: '只能传代给三代以内的亲属NPC（父母/配偶/子女）' };

  const oldName = p.name;
  const oldId = p.id;
  const formerJournal = p.journal || [];
  const formerAcq = p.acquaintances || [];

  // 资源转移 → 新主控
  target.silver = (target.silver || 0) + (p.silver || 0);
  target.spiritStone = (target.spiritStone || 0) + (p.spiritStone || 0);
  if (p.inventory && p.inventory.length > 0) {
    if (!target.inventory) target.inventory = [];
    target.inventory = target.inventory.concat(p.inventory);
  }
  if (p.warehouse && p.warehouse.items && p.warehouse.items.length > 0) {
    if (!target.warehouse) target.warehouse = { items: [] };
    target.warehouse.items = (target.warehouse.items || []).concat(p.warehouse.items);
  }

  // 宅子默认送给新主控
  if (state.mansion) {
    state.mansion.owner = target.id;
    state.mansion.ownerName = target.name;
  }

  // 前任主控变为普通NPC（保留数据并标记），加入npc列表使其可见
  const former = p;
  former.isFormerPlayer = true;
  former.knownByPlayer = true;
  former.favorWithPlayer = 0;
  if (!state.npcs.some(n => n.id === former.id)) {
    state.npcs.push(former);
  }

  // 补全新主控的玩家字段
  target.journal = target.journal || [];
  target.relations = target.relations || {};
  target.letters = target.letters || [];
  target.acquaintances = target.acquaintances || [];
  target.tags = target.tags || [];
  target.personalHistory = target.personalHistory || [];
  // ⑤ NPC变主控后补齐玩家专属字段，避免 getQuests/随机事件等访问 undefined 崩溃
  target.karma = target.karma || { merit: 0, sin: 0 };
  target.reputation = target.reputation || 0;
  target.spiritStone = target.spiritStone || 0;
  if (!target.attributes) target.attributes = {};
  if (target.attributes.fateLuck === undefined) target.attributes.fateLuck = 0;
  if (!target.quests) {
    const { initQuests } = require('./quest');
    initQuests(target);
  }
  // 相识名单合并（亲族与旧主控的相识）
  target.acquaintances = [...new Set([...target.acquaintances, ...formerAcq])];
  // 记事合并：新主控继承旧主控最近记事（家族传承视角）
  target.journal = [...formerJournal.slice(-60), ...target.journal];

  // ② 传代本身写入记事：新主控记事/个人记事/世界记事都有明确变更
  const timeText = state.gameDateText || '';
  if (!target.personalHistory) target.personalHistory = [];
  target.personalHistory.push(`${timeText}·继任为家族主控，前任主控${oldName}退居幕后。`);
  if (!former.personalHistory) former.personalHistory = [];
  former.personalHistory.push(`${timeText}·将主控之位传给${target.name}，退居幕后。`);
  target.journal.push({ time: timeText, msg: `继任主控：前任主控${oldName}将家族主控之位传于你。` });
  if (state.worldJournal) {
    state.worldJournal.unshift({
      time: timeText,
      npc: target.name,
      content: `${target.name}继任家族主控之位，前任主控${oldName}退居幕后。`,
      location: '',
    });
    if (state.worldJournal.length > 500) state.worldJournal.pop();
  }

  // 主控权交接
  state.player = target;

  // 第11条：传代后关系网重构 + hp/mp 结构归一化（防止新主控因数字hp崩溃）
  rebuildFamilyAfterSuccession(state, target, former);

  return {
    success: true,
    msg: `你已将主控之位传给${target.name}。${oldName}自此退居幕后，成为一介普通修士。`,
    state,
  };
}

// 传代后关系网重构：子嗣/妻妾与下一任主控的关系必须转换
function rebuildFamilyAfterSuccession(state, target, former) {
  const tf = (target.family = target.family || {});
  const ff = former.family || {};

  // 1. target 是旧主控的子女 → 旧主控成为其父/母，并补另一亲（旧主控配偶）
  if ((ff.children || []).includes(target.id)) {
    if (former.gender === '男') tf.father = former.id;
    else tf.mother = former.id;
    const other = ff.spouse;
    if (other && other !== target.id) {
      if (former.gender === '男' && !tf.mother) tf.mother = other;
      if (former.gender === '女' && !tf.father) tf.father = other;
    }
    // 旧主控的其他子女 → 与新主控互认兄弟/姐妹
    const sibs = (ff.children || []).filter(cid => cid !== target.id);
    for (const cid of sibs) {
      const sib = state.npcs.find(n => n.id === cid);
      if (sib && sib.isAlive !== false) {
        if (!sib.relations) sib.relations = {};
        if (!target.relations) target.relations = {};
        sib.relations[target.id] = { type: target.gender === '男' ? '兄弟' : '姐妹' };
        target.relations[sib.id] = { type: sib.gender === '男' ? '兄弟' : '姐妹' };
      }
    }
  }
  // 2. target 是旧主控的配偶 → 夫妻关系保持（tf.spouse 已是 former.id，无需改）
  // 3. target 是旧主控的父母 → 关系已存在，无需改
  // 4. 旧主控的妾室归属不变（仍随旧主控），不强制转换给新主控

  // hp/mp 结构归一化：新主控（原NPC）与旧主控（现NPC）都必须是 {current,max} 对象
  for (const x of [target, former]) {
    if (!x) continue;
    if (!x.hp || typeof x.hp === 'number' || isNaN(x.hp)) {
      const v = typeof x.hp === 'number' && !isNaN(x.hp) ? x.hp : 100;
      x.hp = { current: v, max: v };
    }
    if (x.hp.current === undefined) x.hp.current = x.hp.max || 100;
    if (x.hp.max === undefined) x.hp.max = x.hp.current || 100;
    if (!x.mp || typeof x.mp === 'number' || isNaN(x.mp)) {
      const v = typeof x.mp === 'number' && !isNaN(x.mp) ? x.mp : 50;
      x.mp = { current: v, max: v };
    }
    if (x.mp.current === undefined) x.mp.current = x.mp.max || 50;
    if (x.mp.max === undefined) x.mp.max = x.mp.current || 50;
  }
}

module.exports = { distributeInheritance, playerSuccession };
