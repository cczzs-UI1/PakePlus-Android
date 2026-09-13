// ===== threeActStory.js =====
// 三段式交互剧情 + 称呼系统 + NPC关系剧情库 + 三代亲属判定与专属剧情
// 需求依据：交谈/欢好/春宵一度/谈情说爱 剧情格式重构（三段式）；NPC关系随机剧情库；
//           三代以内亲属判定、按钮与专属剧情；互相称呼按关系。

const { randInt, randChoice } = require('./utils');

// ============================================================
// 一、三代以内亲属判定与关系称呼（基于 family 树）
// ============================================================

// 收集某 NPC 的三代血亲 id 集合（以 me 为原点：上3代、下3代、同代与堂表）
function closeRelativesOf(me, npcs) {
  const set = new Set();
  const byId = new Map(npcs.map(n => [n.id, n]));
  const nameIndex = new Map();
  for (const n of npcs) nameIndex.set(n.name, n);

  const fam = (n) => (n && n.family) || {};

  // 直系上溯链（父母→祖辈→曾祖辈）
  const upChain = [];
  let cur = me;
  for (let d = 0; d < 3; d++) {
    const f = fam(cur);
    const next = [];
    for (const pid of [f.father, f.mother]) {
      if (pid && !set.has(pid)) {
        set.add(pid);
        next.push(byId.get(pid));
      }
    }
    // 普通NPC父母为 null 时，尝试按姓名反查（重名概率低，作为兜底）
    for (const nm of [f.fatherName, f.motherName]) {
      if (nm && !set.has(nm)) {
        const cand = nameIndex.get(nm);
        if (cand && cand !== me) {
          // 仅当确实存在同名同人且尚无 id 链接时记录
          const exists = [f.father, f.mother].some(pid => pid && byId.get(pid)?.name === nm);
          if (!exists) { set.add('name:' + nm); next.push(cand); }
        }
      }
    }
    upChain.push(next.filter(Boolean));
    cur = next[0]; // 沿父系继续上溯（简化）
  }

  // 直系下溯链（子女→孙辈→曾孙辈）
  let curDown = [me];
  for (let d = 0; d < 3; d++) {
    const kids = [];
    for (const n of curDown) {
      for (const cid of (fam(n).children || [])) {
        if (!set.has(cid)) { set.add(cid); kids.push(byId.get(cid)); }
      }
    }
    curDown = kids.filter(Boolean);
  }

  // 同代：兄弟姐妹（含同父/同母，经父母 children 推导）
  const meF = fam(me);
  for (const pid of [meF.father, meF.mother]) {
    const parent = byId.get(pid);
    for (const cid of (fam(parent).children || [])) {
      if (cid !== me.id && !set.has(cid)) set.add(cid);
    }
  }
  for (const sid of (meF.siblings || [])) if (!set.has(sid)) set.add(sid);

  // 堂表：祖辈的子女（叔伯姑舅姨）之子女（堂/表兄弟姐妹）
  const grandparents = [];
  for (const pid of [meF.father, meF.mother]) {
    const parent = byId.get(pid);
    if (!parent) continue;
    for (const gid of [fam(parent).father, fam(parent).mother]) {
      const gp = byId.get(gid);
      if (gp) grandparents.push(gp);
    }
  }
  for (const gp of grandparents) {
    const uncles = [];
    for (const uid of (fam(gp).children || [])) {
      if (uid !== meF.father && uid !== meF.mother && !set.has(uid)) {
        set.add(uid);
        uncles.push(byId.get(uid));
      }
    }
    for (const u of uncles) {
      for (const cid of (fam(u).children || [])) {
        if (!set.has(cid)) set.add(cid);
      }
    }
  }
  return set;
}

// 是否三代以内血亲
function isCloseRelative(me, them, npcs = []) {
  if (!me || !them || me.id === them.id) return false;
  const set = closeRelativesOf(me, npcs);
  return set.has(them.id) || set.has('name:' + them.name);
}

// 计算 me 对 them 的亲属称呼（三代以内）
function relLabel(me, them, npcs = []) {
  if (!me || !them || me.id === them.id) return null;
  const mf = me.family || {};
  const tf = them.family || {};
  const byId = new Map(npcs.map(n => [n.id, n]));

  // 直系称谓（含名字兜底）：a 为 family 中的 id/名字，b 为对象 → 比较 b.id / b.name
  const isName = (a, b) => a === b || (a && b && (a === b.id || a === b.name));
  if (isName(mf.father, them) || (mf.fatherName && mf.fatherName === them.name)) return '父亲';
  if (isName(mf.mother, them) || (mf.motherName && mf.motherName === them.name)) return '母亲';
  if (tf.father === me.id || tf.mother === me.id ||
      (tf.fatherName && tf.fatherName === me.name) || (tf.motherName && tf.motherName === me.name)) {
    return them.gender === '男' ? '儿子' : '女儿';
  }

  // 祖辈（me 的父母的父母）
  const gpNames = [];
  for (const pid of [mf.father, mf.mother]) {
    const parent = byId.get(pid);
    if (!parent) continue;
    for (const gid of [(parent.family || {}).father, (parent.family || {}).mother]) {
      const gp = byId.get(gid);
      if (gp && (gp.id === them.id || gp.name === them.name)) {
        const isPaternal = pid === mf.father;
        const isMale = gp.gender === '男';
        return isMale ? (isPaternal ? '祖父' : '外祖父') : (isPaternal ? '祖母' : '外祖母');
      }
    }
    // 父母仅名字时按名字兜底
    const pf = parent.family || {};
    if (pf.fatherName && pf.fatherName === them.name) return '祖父';
    if (pf.motherName && pf.motherName === them.name) return '祖母';
  }

  // 孙辈（子女的子女）
  for (const cid of (mf.children || [])) {
    const child = byId.get(cid);
    if (!child) continue;
    for (const gcid of ((child.family || {}).children || [])) {
      if (gcid === them.id) return them.gender === '男' ? '孙子' : '孙女';
    }
  }

  // 兄弟姐妹（同父/同母）
  const sameParent = (mf.father && (mf.father === tf.father || (byId.get(mf.father)?.family?.children || []).includes(them.id))) ||
                     (mf.mother && (mf.mother === tf.mother || (byId.get(mf.mother)?.family?.children || []).includes(them.id))) ||
                     (mf.fatherName && mf.fatherName === tf.fatherName && mf.fatherName) ||
                     (mf.motherName && mf.motherName === tf.motherName && mf.motherName);
  if (sameParent) {
    const meAge = me.age || 0;
    const thAge = them.age || 0;
    if (them.gender === '男') return thAge >= meAge ? '兄长' : '弟弟';
    return thAge >= meAge ? '姐姐' : '妹妹';
  }

  // 叔伯姑舅姨：me 父母的兄弟姐妹
  for (const pid of [mf.father, mf.mother]) {
    const parent = byId.get(pid);
    if (!parent) continue;
    for (const gp of [byId.get((parent.family || {}).father), byId.get((parent.family || {}).mother)]) {
      if (!gp) continue;
      for (const uid of (gp.family || {}).children || []) {
        if (uid === mf.father || uid === mf.mother) continue;
        const u = byId.get(uid);
        if (u && (u.id === them.id || u.name === them.name)) {
          if (u.gender === '男') return u.age > (me.age || 0) ? '伯父' : '叔父';
          return u.age > (me.age || 0) ? '姑母' : '姨母';
        }
      }
    }
  }

  // 堂表兄弟姐妹：叔伯姑舅姨的子女
  for (const pid of [mf.father, mf.mother]) {
    const parent = byId.get(pid);
    if (!parent) continue;
    for (const gp of [byId.get((parent.family || {}).father), byId.get((parent.family || {}).mother)]) {
      if (!gp) continue;
      for (const uid of (gp.family || {}).children || []) {
        if (uid === mf.father || uid === mf.mother) continue;
        const u = byId.get(uid);
        if (!u) continue;
        for (const cid of (u.family || {}).children || []) {
          if (cid === them.id) return them.gender === '男' ? '堂兄' : '堂姐';
        }
      }
    }
  }

  return null;
}

// 玩家短名（去姓留名，供亲属称呼：戚景行→景行）
function shortName(name) {
  if (!name) return '';
  return name.length >= 3 ? name.slice(1) : name;
}

// ============================================================
// 二、互相称呼（按关系/性别/亲疏）
//     kind: 'relative' 三代亲属 | 'spouse' 配偶/妾室 | 'none' 非亲属
//     需求：亲属类 NPC 对玩家的称呼改为玩家名字（去姓）；非亲属不加称呼
// ============================================================
function addressOf(me, them, rel) {
  const meGender = me.gender || '男';
  const thGender = them.gender || '男';

  // 三代以内亲属称呼（NPC 称呼玩家 = 玩家短名）
  if (rel) {
    return { meToThem: rel, themToMe: shortName(me.name), kind: 'relative' };
  }

  // 配偶 / 妾室（也属亲属：NPC 称呼玩家 = 玩家短名）
  const mf = me.family || {};
  const tf = them.family || {};
  if (mf.spouse === them.id || (mf.spouse && tf.spouse === me.id)) {
    if (meGender === '男') return { meToThem: thGender === '女' ? '娘子' : '夫人', themToMe: shortName(me.name), kind: 'spouse' };
    return { meToThem: thGender === '男' ? '夫君' : '姐姐', themToMe: shortName(me.name), kind: 'spouse' };
  }
  if ((mf.wives || []).includes(them.id)) {
    return { meToThem: '爱妾', themToMe: shortName(me.name), kind: 'spouse' };
  }

  // 非亲属：不加称呼（需求：对话内容不用加称呼）
  return { meToThem: '', themToMe: '', kind: 'none' };
}

// ============================================================
// 三、三段式剧情包装（交谈/切磋/赠礼/传书/欢好/春宵/谈情）
// ============================================================
const OPENERS = {
  chat: [
    '暮色渐沉，{loc}的街巷次第亮起灯火。你寻到{them}，{them}正倚窗而立。你{meAct}，唤道："{meToThem}。"{them}闻声回头，眉目间漾开一丝笑意："{themToMe}，你怎么来了。"',
    '{loc}的茶馆里人声鼎沸，茶香氤氲。你与{them}隔桌而坐，{them}抬手替你斟了一盏茶。你{meAct}，轻声问道："{meToThem}，近日可好？"{them}抬眼望来，目光温和："{themToMe}，我一切都好。"',
    '午后日头正好，{loc}的廊下光影斑驳。{them}负手立于阶前，见你走来，微微颔首。你{meAct}，拱手唤道："{meToThem}。"{them}语气里带着熟稔："{themToMe}，正说要去寻你。"',
    '入夜后{loc}安静下来，檐角挂着一弯新月。你与{them}在庭院石桌边坐下，{them}拢了拢衣袖。你{meAct}，开口唤道："{meToThem}。"{them}抬眼望你，轻声问道："{themToMe}，近来可有什么新鲜事？"',
  ],
  spar: [
    '{loc}的空地上尘土微扬。{them}已摆开架势，朝你抱拳一笑，眼中跃动着战意。你{meAct}，也亮出架势："{meToThem}，请指教！"{them}朗声笑道："{themToMe}，正手痒得很，来搭把手！"',
    '晨光熹微，{loc}的演武场冷冷清清。你寻到{them}时，{them}正收势调息。你{meAct}，上前一步："{meToThem}，可敢与我一战？"{them}眉梢一挑："{themToMe}，有何不敢！"',
    '酒至半酣，{them}忽然兴起，拍案而起，指着{loc}的空地。你{meAct}，放下酒盏："{meToThem}，走，比划比划！"{them}大笑："{themToMe}，正合我意！"',
  ],
  gift: [
    '{loc}的集市正热闹，你捧着备好的礼物寻到{them}。{them}见你手里拿着东西，先是一愣，目光柔了下来。你{meAct}，将礼物递上前："{meToThem}，一点心意，请收下。"{them}接过，声音带着暖意："{themToMe}，这是……？"',
    '你特地挑了{loc}一家老铺的物件，登门时{them}正在忙碌。见你递上礼物，{them}放下手中的活计。你{meAct}，笑道："{meToThem}，也不知道你喜不喜欢。"{them}眉眼弯弯："{themToMe}，你倒有心。"',
  ],
  letter: [
    '驿使捎来书信时，{loc}正值深秋，落叶满阶。你拆开信纸，{them}的字迹清秀端正，开篇写道："{themToMe}，见字如面。"你{meAct}，提笔在案头展纸，落款处郑重写下："{meToThem}亲启。"',
    '灯下展信，{them}在信中提起{loc}的近况，笔触间带着几分牵挂，末了落下一句："{themToMe}，盼君珍重。"你{meAct}，将信纸细细折好，回信时唤道："{meToThem}，勿念。"',
  ],
  intimacy: [
    '夜深人静，{loc}的庭院里月色如水。你与{them}并肩而坐，烛影摇红。你{meAct}，握住{them}的手，轻声唤道："{meToThem}。"{them}低垂着眼，声音轻得像叹息："{themToMe}，今晚……留下可好？"',
    '帘外雨声淅沥，室内灯火昏黄。{them}为你披上一件外衫，指尖微凉，目光却温软。你{meAct}，抬头望进{them}眼底："{meToThem}，有你在，真好。"{them}低声道："{themToMe}，夜深了。"',
  ],
  spring: [
    '红烛高烧，{loc}的厢房里弥漫着淡淡的熏香。{them}卸下钗环，青丝如瀑，回眸看你时眼波盈盈。你{meAct}，伸手拢过{them}的指尖："{meToThem}。"{them}低声道："{themToMe}，良宵苦短。"',
    '月色透窗而入，{them}倚在榻边，指尖绕着衣带。你{meAct}，在{them}身侧坐下，唤道："{meToThem}。"{them}声音又轻又软："{themToMe}，这一夜，只属于你我。"',
  ],
};

// 第1段中玩家的动作神态（与称呼搭配）
const PLAYER_ACTS = [
  '放缓脚步',
  '整理了一下衣襟',
  '露出一个温和的笑',
  '微微欠身',
  '目光落在那张熟悉的脸上',
];

// 非亲属模板（无称呼版，需求：对话内容不用加称呼）
const OPENERS_N = {
  chat: [
    '暮色渐沉，{loc}的街巷次第亮起灯火。你寻到{them}，{them}正倚窗而立。你{meAct}，打了声招呼。{them}闻声回头，眉目间漾开一丝笑意："今日怎么得空来了。"',
    '{loc}的茶馆里人声鼎沸，茶香氤氲。你与{them}隔桌而坐，{them}抬手替你斟了一盏茶。你{meAct}，轻声问道："近日可好？"{them}抬眼望来，目光温和："一切都好。"',
    '午后日头正好，{loc}的廊下光影斑驳。{them}负手立于阶前，见你走来，微微颔首。你{meAct}，拱手道："冒昧打扰。"{them}语气里带着熟稔："正说要去寻你。"',
  ],
  spar: [
    '{loc}的空地上尘土微扬。{them}已摆开架势，朝你抱拳一笑，眼中跃动着战意。你{meAct}，也亮出架势："请指教！"{them}朗声笑道："正手痒得很，来搭把手！"',
    '晨光熹微，{loc}的演武场冷冷清清。你寻到{them}时，{them}正收势调息。你{meAct}，上前一步："可敢与我一战？"{them}眉梢一挑："有何不敢！"',
    '酒至半酣，{them}忽然兴起，拍案而起，指着{loc}的空地。你{meAct}，放下酒盏："走，比划比划！"{them}大笑："正合我意！"',
  ],
  gift: [
    '{loc}的集市正热闹，你捧着备好的礼物寻到{them}。{them}见你手里拿着东西，先是一愣，目光柔了下来。你{meAct}，将礼物递上前："一点心意，请收下。"{them}接过，声音带着暖意："这是……？"',
    '你特地挑了{loc}一家老铺的物件，登门时{them}正在忙碌。见你递上礼物，{them}放下手中的活计。你{meAct}，笑道："也不知道你喜不喜欢。"{them}眉眼弯弯："你倒有心。"',
  ],
  letter: [
    '驿使捎来书信时，{loc}正值深秋，落叶满阶。你拆开信纸，{them}的字迹清秀端正，开篇写道："见字如面。"你{meAct}，提笔在案头展纸，落款处郑重写下自己的名字。',
    '灯下展信，{them}在信中提起{loc}的近况，笔触间带着几分牵挂，末了落下一句："盼君珍重。"你{meAct}，将信纸细细折好，回信时道："勿念。"',
  ],
  intimacy: [
    '夜深人静，{loc}的庭院里月色如水。你与{them}并肩而坐，烛影摇红。你{meAct}，握住{them}的手。{them}低垂着眼，声音轻得像叹息："今晚……留下可好？"',
    '帘外雨声淅沥，室内灯火昏黄。{them}为你披上一件外衫，指尖微凉，目光却温软。你{meAct}，抬头望进{them}眼底："有你在，真好。"{them}低声道："夜深了。"',
  ],
  spring: [
    '红烛高烧，{loc}的厢房里弥漫着淡淡的熏香。{them}卸下钗环，青丝如瀑，回眸看你时眼波盈盈。你{meAct}，伸手拢过{them}的指尖。{them}低声道："良宵苦短。"',
    '月色透窗而入，{them}倚在榻边，指尖绕着衣带。你{meAct}，在{them}身侧坐下。{them}声音又轻又软："这一夜，只属于你我。"',
  ],
};

const CLOSERS_N = {
  chat: [
    '话至深处，两人相视一笑，心头各自一暖。临别时{them}目送你远去，低声说了句："改日再会。"你回身摆了摆手，道："珍重。"',
    '夜色渐深，你们就此别过。{them}站在灯下目送，声音带着笑意："慢走。"走出老远，你还能想起{them}说话时眼里的笑意。',
  ],
  spar: [
    '你收招而立，{them}也顺势停手，抱拳一笑："身手见长，改日再战！"你喘着气笑道："奉陪到底。"两人相视而笑，尽兴而归。',
    '一番切磋下来，彼此都气喘吁吁。{them}拍了拍你的肩，点头赞道："有几分火候了。"你拱手应道："还差得远。"',
  ],
  gift: [
    '{them}郑重收下礼物，抬眼望你，目光里带着暖意："这份心意，我记下了。"你弯了弯嘴角，轻声道："喜欢就好。"',
    '{them}把礼物仔细收好，又替你理了理衣襟，声音轻柔："多谢你。"你摇头笑道："客气什么。"',
  ],
  letter: [
    '信纸摩挲在指尖，你读罢良久，轻轻折好收进怀中，提笔回信时，灯花恰好爆了一声。落款处，你写下那句："望自珍重。"',
    '你合上信笺，望着窗外{loc}的夜色，心中不觉柔软了几分。回信开头，你唤了一声："见信安好。"',
  ],
  intimacy: [
    '一夜安眠，翌日天明，{them}替你掖了掖被角，声音带着晨起的慵懒："再歇会儿吧。"你含笑应道："好。"',
    '晨光初透，{them}已起身梳妆，回眸看你一眼，脸颊微红，却什么也没说。你倚在枕上，轻声唤道："早。"',
  ],
  spring: [
    '云收雨歇，{them}依偎在你身侧，指尖在你掌心画着圈，声音慵懒餍足："你待我真好。"你环住{them}，低声道："往后还有长夜。"',
    '烛火将尽，{them}蜷在你怀里，呼吸渐渐平缓，一夜好眠。临睡前，你听见{them}迷迷糊糊地呢喃了一句："真好。"',
  ],
};

const CLOSERS = {
  chat: [
    '话至深处，两人相视一笑，心头各自一暖。临别时{them}目送你远去，低声说了句："{themToMe}，改日再会。"你回身摆了摆手，也道："{meToThem}，珍重。"',
    '夜色渐深，你们就此别过。{them}站在灯下目送，声音带着笑意："{themToMe}，慢走。"走出老远，你还能想起{them}说话时眼里的笑意。',
  ],
  spar: [
    '你收招而立，{them}也顺势停手，抱拳一笑："{themToMe}，身手见长，改日再战！"你喘着气笑道："{meToThem}，奉陪到底。"两人相视而笑，尽兴而归。',
    '一番切磋下来，彼此都气喘吁吁。{them}拍了拍你的肩，点头赞道："{themToMe}，有几分火候了。"你拱手应道："{meToThem}，还差得远。"',
  ],
  gift: [
    '{them}郑重收下礼物，抬眼望你，目光里带着暖意："{themToMe}，这份心意，我记下了。"你弯了弯嘴角，轻声道："{meToThem}，喜欢就好。"',
    '{them}把礼物仔细收好，又替你理了理衣襟，声音轻柔："{themToMe}，多谢你。"你摇头笑道："{meToThem}，一家人不说两家话。"',
  ],
  letter: [
    '信纸摩挲在指尖，你读罢良久，轻轻折好收进怀中，提笔回信时，灯花恰好爆了一声。落款处，你写下了那句："{meToThem}，望自珍重。"',
    '你合上信笺，望着窗外{loc}的夜色，心中不觉柔软了几分。回信开头，你唤了一声："{meToThem}，见信安好。"',
  ],
  intimacy: [
    '一夜安眠，翌日天明，{them}替你掖了掖被角，声音带着晨起的慵懒："{themToMe}，再歇会儿吧。"你含笑应道："{meToThem}，好。"',
    '晨光初透，{them}已起身梳妆，回眸看你一眼，脸颊微红，却什么也没说。你倚在枕上，轻声唤道："{meToThem}，早。"',
  ],
  spring: [
    '云收雨歇，{them}依偎在你身侧，指尖在你掌心画着圈，声音慵懒餍足："{themToMe}，你待我真好。"你环住{them}，低声道："{meToThem}，往后还有长夜。"',
    '烛火将尽，{them}蜷在你怀里，呼吸渐渐平缓，一夜好眠。临睡前，你听见{them}迷迷糊糊地呢喃了一句："{themToMe}，真好。"',
  ],
};

// 把核心剧情文本包装成三段式（第1段 引入 + 第2段 核心 + 第3段 收束）
function buildThreeAct({ core, action, me, them, location, rel }) {
  const addr = addressOf(me, them, rel);
  const noAddr = addr.kind === 'none'; // 非亲属：不加称呼
  const openerPool = noAddr ? (OPENERS_N[action] || OPENERS_N.chat) : (OPENERS[action] || OPENERS.chat);
  const closerPool = noAddr ? (CLOSERS_N[action] || CLOSERS_N.chat) : (CLOSERS[action] || CLOSERS.chat);
  const fill = (t) => t
    .replace(/\{them\}/g, them.name)
    .replace(/\{loc\}/g, location || '某地')
    .replace(/\{meToThem\}/g, addr.meToThem)
    .replace(/\{themToMe\}/g, addr.themToMe)
    .replace(/\{meAct\}/g, randChoice(PLAYER_ACTS));
  const s1 = fill(randChoice(openerPool));
  const s3 = fill(randChoice(closerPool));
  return `${s1}\n${core}\n${s3}`;
}

// ============================================================
// 四、NPC 关系剧情库（需求：父母/夫妻/妻妾/好友/仇敌/师徒/其他亲属，各≥5条）
//    记事格式：时间+地点+A+B（关系+姓名）+事件
// ============================================================
const RELATION_STORIES = {
  parent: [
    (a, b, l) => `${a.name}在${l}的院中为${b.name}斟茶捶背，听其讲述当年旧事，${b.name}眉眼舒展，神色欣慰。`,
    (a, b, l) => `${a.name}与${b.name}在${l}院中对弈，落子间闲话家常，${b.name}赢了半目，捋须笑道："还是你差些火候。"`,
    (a, b, l) => `${a.name}在${l}为${b.name}梳发添衣，说起邻里长短，${b.name}叮嘱道："出门在外，照顾好自己。"`,
    (a, b, l) => `${a.name}与${b.name}在${l}因家事争执了几句，${b.name}板着脸训斥，${a.name}低头听着，末了又和好如初。`,
    (a, b, l) => `${a.name}陪${b.name}去${l}的庙里上香，一路搀扶，${b.name}念叨着家中琐事，${a.name}耐心听着，频频点头。`,
    (a, b, l) => `${a.name}在${l}买了一件新衣送给${b.name}，${b.name}嘴上嫌贵，眉眼间却藏着笑意。`,
  ],
  child: [
    (a, b, l) => `${a.name}在${l}的堂前教导${b.name}读书识字，${b.name}歪头苦思，${a.name}耐心讲解，声音温和。`,
    (a, b, l) => `${a.name}在${l}的集市给${b.name}买了一串糖人，${b.name}举着糖人笑逐颜开，${a.name}看着也弯了嘴角。`,
    (a, b, l) => `${a.name}见${b.name}在${l}练武擦破了皮，一边上药一边数落，手上动作却轻了又轻。`,
    (a, b, l) => `${a.name}与${b.name}在${l}商量家中大事，${b.name}如今已能独当一面，${a.name}欣慰地拍了拍其肩头。`,
    (a, b, l) => `${a.name}在${l}为远行的${b.name}收拾行囊，反复叮嘱路上小心，${b.name}郑重应下，转身时眼含不舍。`,
  ],
  spouse: [
    (a, b, l) => `${a.name}与${b.name}在${l}的灯下共话家常，说起往事，${b.name}忍不住掩口而笑，${a.name}也跟着笑出声来。`,
    (a, b, l) => `${a.name}在${l}为${b.name}温了一壶酒，两人对酌，话虽不多，眉眼间皆是默契。`,
    (a, b, l) => `${a.name}与${b.name}在${l}因琐事拌了几句嘴，夜里${b.name}又悄悄替${a.name}掖好被角，两人重归于好。`,
    (a, b, l) => `${a.name}与${b.name}在${l}携手赏月，${b.name}靠在${a.name}肩头，感叹岁月安稳，只愿长伴左右。`,
    (a, b, l) => `${a.name}远行归来，${b.name}早早等在${l}门口，见其身影，眼眶微红，快步迎了上去。`,
  ],
  concubine: [
    (a, b, l) => `${a.name}与${b.name}在${l}的园中赏花，${a.name}折下一枝替${b.name}簪在鬓边，${b.name}脸颊微红，垂下眼去。`,
    (a, b, l) => `${a.name}在${l}陪${b.name}说了许久体己话，${b.name}心里那点委屈渐渐散了，重又露出笑颜。`,
    (a, b, l) => `${a.name}与${b.name}在${l}因争宠置气，${a.name}好言安抚，${b.name}转嗔为喜，缠着${a.name}许下承诺。`,
    (a, b, l) => `${a.name}在${l}为${b.name}添了几件新衣裳，${b.name}喜滋滋地比划着，直说${a.name}最疼自己。`,
    (a, b, l) => `${a.name}与${b.name}在${l}月下散步，${b.name}挽着${a.name}的手臂，絮絮说着家常，${a.name}含笑听着。`,
  ],
  friend: [
    (a, b, l) => `${a.name}与好友${b.name}在${l}对饮，聊到兴起，${b.name}拍着${a.name}的肩膀大笑，两人约好改日再聚。`,
    (a, b, l) => `${a.name}与好友${b.name}结伴在${l}游历，途中相互照应，${b.name}感慨道："有你同行，路都短了几分。"`,
    (a, b, l) => `${a.name}与好友${b.name}在${l}因一件小事红了脸，隔日${b.name}又提着一壶酒登门，两人一笑泯恩仇。`,
    (a, b, l) => `${a.name}在${l}遇上麻烦，好友${b.name}二话不说挺身相助，事后${a.name}郑重道谢，${b.name}摆手笑道："客气什么。"`,
    (a, b, l) => `${a.name}收到好友${b.name}从${l}捎来的信，读罢会心一笑，当即提笔回了一封长信。`,
  ],
  enemy: [
    (a, b, l) => `${a.name}在${l}与仇敌${b.name}狭路相逢，双方剑拔弩张，各自冷笑一声，终究没有动手，擦肩而过。`,
    (a, b, l) => `${a.name}在${l}撞见仇敌${b.name}，两人恶语相向，围观众人纷纷避让，最后被旁人劝开。`,
    (a, b, l) => `${a.name}暗地里给仇敌${b.name}使了个绊子，${b.name}吃了个哑巴亏，气得在${l}直跺脚。`,
    (a, b, l) => `${a.name}与仇敌${b.name}在${l}大打出手，打得难解难分，各自带伤离去，约定来日再分高下。`,
    (a, b, l) => `${a.name}听说仇敌${b.name}在${l}落难，犹豫再三，终究没有落井下石，只是冷眼旁观。`,
  ],
  master: [
    (a, b, l) => `${a.name}在${l}的静室中指点徒弟${b.name}修炼，见其渐渐开窍，欣慰地点头："根基既稳，往后便是水磨工夫。"`,
    (a, b, l) => `${a.name}见徒弟${b.name}在${l}偷懒，板着脸罚其抄写经义，末了又悄悄让厨房加了菜。`,
    (a, b, l) => `${a.name}在${l}为徒弟${b.name}护法突破，一连守了三天三夜，待${b.name}功成出关，才露出笑容。`,
    (a, b, l) => `${a.name}与徒弟${b.name}在${l}论道至深夜，${b.name}偶有妙悟，${a.name}大为赞赏，连说后生可畏。`,
    (a, b, l) => `${a.name}在${l}送别出师远行的徒弟${b.name}，临行前细细叮嘱，${b.name}郑重叩首，再抬头时眼眶微红。`,
  ],
  disciple: [
    (a, b, l) => `${a.name}在${l}为师尊${b.name}奉上一盏新茶，${b.name}接过啜了一口，点头道："有心了。"`,
    (a, b, l) => `${a.name}在${l}向师尊${b.name}请教功法疑难，${b.name}耐心讲解，${a.name}茅塞顿开，连声道谢。`,
    (a, b, l) => `${a.name}在${l}替师尊${b.name}跑腿办事，一路妥当，${b.name}满意地捋了捋须，夸其办事牢靠。`,
    (a, b, l) => `${a.name}与师尊${b.name}在${l}坐而论道，${a.name}将近日所悟一一禀报，${b.name}听得频频点头。`,
    (a, b, l) => `${a.name}在${l}念及师尊${b.name}多年栽培，亲手做了一件小物相赠，${b.name}收下后神色动容。`,
  ],
  relative: [
    (a, b, l) => `${a.name}在${l}探望亲属${b.name}，带去一包土产，${b.name}一边说"来就来，带什么东西"，一边笑着收下。`,
    (a, b, l) => `${a.name}与亲属${b.name}在${l}叙旧，说起族中旧事，两人都感慨不已。`,
    (a, b, l) => `${a.name}在${l}向亲属${b.name}借一件物什，${b.name}二话不说便应下，还叮嘱不够再来取。`,
    (a, b, l) => `${a.name}与亲属${b.name}在${l}一同祭祖扫墓，焚香叩拜，起身后相顾无言，只余追思。`,
    (a, b, l) => `${a.name}与亲属${b.name}在${l}因一场喜事的份子钱闹了点别扭，隔日又说说笑笑，一笔带过。`,
  ],
};

// 按关系生成剧情 → { text, effect }
function generateRelationStory(a, b, relation) {
  const pool = RELATION_STORIES[relation] || RELATION_STORIES.relative;
  const story = randChoice(pool);
  return { text: story(a, b, a.location || b.location || '某地') };
}

// ============================================================
// 五、三代亲属专属交互剧情（需求：交谈/切磋/赠礼/偷窃/战斗/欢好/传书）
// ============================================================
const RELATIVE_STORIES = {
  chat: [
    '{them}在{loc}的院里晒着太阳，见你来了，招招手示意你坐过去，压低声音说起家中近况，末了叮嘱道："{addr}，这些话可别往外说。"',
    '你陪{them}在{loc}收拾旧物，翻出一件旧衣裳，{them}摩挲着布料，目光悠远："{addr}，这料子，还是你小时候攒钱买的。"',
    '{them}在{loc}的灶台前忙活，见你进门，头也不回地招呼道："{addr}，来得巧，正炖着你爱吃的。"你挽起袖子去帮忙，{them}嘴上赶你，眼里的笑意却藏不住。',
    '你与{them}在{loc}的廊下闲坐，{them}说起族里谁家又添了丁，谁家儿郎考中了功名，絮絮叨叨，你却听得认真。',
    '{them}在{loc}拉着你比了比身高，感慨道："{addr}，一晃眼都长这么大了。"你鼻子一酸，笑着应了声。',
  ],
  spar: [
    '{them}在{loc}的空地上摆开架势，朝你招了招手，眼里带着几分考校的意味："{addr}，让我看看你这些年有没有长进。"你深吸一口气，认真应战。',
    '你与{them}在{loc}切磋了几招，{them}处处留手，点到即止，末了替你理了理衣领，温声道："{addr}，根基不错，往后还要多下苦功。"',
    '{them}见你招式有模有样，忍不住出言指点，你依言改了一处运劲，果然顺畅许多。{them}满意地点点头："{addr}，这悟性随我。"',
  ],
  gift: [
    '你在{loc}挑了一件合心意的物件送给{them}，{them}接过去翻来覆去看了几遍，嘴上说"又乱花钱"，手却小心地收进怀里。',
    '你把攒了许久的补品送到{loc}，{them}望着你，半晌才道："{addr}，你有这份心，我比什么都高兴。"',
    '你送{them}一件小物，{them}拿在手里爱不释手，末了从箱底翻出一件旧物回赠给你："{addr}，这个你收着，是我的一点念想。"',
  ],
  steal: [
    '你鬼使神差地摸向{them}放在{loc}的钱袋，{them}忽然回身，目光如炬，你讪讪缩回手。{them}叹了口气，什么也没说，只把钱袋往你手里一塞。',
    '你偷拿{them}的东西被撞个正着，{them}气得抄起笤帚作势要打，追了两步又放下，恨铁不成钢地瞪着你："{addr}，你这孩子！"',
  ],
  fight: [
    '你与{them}在{loc}起了争执，话赶话顶了几句，{them}气得脸色发白，抬手却又放下，转身走了几步，到底还是回头劝道："{addr}，一家人，莫要伤了和气。"',
    '{them}在{loc}教训了你一顿，你梗着脖子不服，{them}气得直哆嗦，最后却只重重叹了口气，把热饭往你面前一推。',
  ],
  intimacy: [
    '夜深人静，你与{them}在{loc}的灯下交缠。{them}亲吻着你的全身，烛火映着你们起伏的身影，{them}不停的浮动着："{addr}，能与你欢好真是爽极了。"',
    '月色入户，你与{them}互插着，你们的淫水还在流淌，直到累极了睡去。',
  ],
  letter: [
    '你托人给远在{loc}的{them}捎去一封信，问起居、道冷暖。不久收到回信，{them}在信里唠叨了许多琐事，末了写了一句："{addr}，有空回家看看。"你读着信，眼眶有些发热。',
    '灯下展信，{them}的字迹一如从前。信里说家里一切都好，让你不必挂念，又说{loc}的桂花开了，等你回去酿一坛酒。你合上信，久久没有言语。',
  ],
};

// 亲属专属剧情（三代以内）→ { text }
function pickRelativeStory(action, player, npc, location) {
  const pool = RELATIVE_STORIES[action] || RELATIVE_STORIES.chat;
  const rel = relLabel(player, npc, [player, npc]) || '长辈';
  const addr = addressOf(player, npc, rel);
  let t = randChoice(pool);
  // 模板中 {them} 统一替换为名字更稳妥
  const thName = npc.name;
  t = t
    .replace(/\{them\}/g, thName)
    .replace(/\{loc\}/g, location || '某地')
    // {addr} 是 NPC 台词中对玩家的称呼（亲属 = 玩家名字）
    .replace(/\{addr\}/g, addr.themToMe);
  // 亲属剧情同样三段式：第1段 引入（含互相称呼）+ 第2段 核心 + 第3段 收束
  return buildThreeAct({ core: t, action, me: player, them: npc, location, rel });
}

module.exports = {
  isCloseRelative,
  relLabel,
  addressOf,
  shortName,
  buildThreeAct,
  RELATION_STORIES,
  generateRelationStory,
  RELATIVE_STORIES,
  pickRelativeStory,
};
