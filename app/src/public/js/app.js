// 游戏状态
let gameState = null;
let currentSlot = null;
let allTagsCache = null;

// 加载所有标签信息
async function loadAllTags() {
  if (allTagsCache) return allTagsCache;
  try {
    allTagsCache = await apiGet('/api/tags');
  } catch (e) {
    allTagsCache = {};
  }
  return allTagsCache;
}

// 获取标签显示名称
function getTagDisplayName(tagId) {
  if (allTagsCache && allTagsCache[tagId]) {
    return allTagsCache[tagId].name || tagId;
  }
  return tagId;
}

// 获取标签获取条件描述
function getTagConditionDesc(tagId) {
  if (allTagsCache && allTagsCache[tagId]) {
    return allTagsCache[tagId].condition || '无特殊条件';
  }
  return '无特殊条件';
}
let currentMapTab = 'mortal';
let currentJournalFilter = 'all';
let currentPeopleFilter = 'all';
let currentJournalMode = 'world';
let currentPersonJournalId = null;

// API调用（单机版：直接调用本地引擎，替代原服务器 fetch）
async function api(url, data) {
  if (window.ClientAPI && window.ClientAPI.post) return window.ClientAPI.post(url, data || {});
  return { error: '游戏引擎未初始化' };
}

async function apiGet(url) {
  if (window.ClientAPI && window.ClientAPI.get) return window.ClientAPI.get(url);
  return { error: '游戏引擎未初始化' };
}

// ===== 立绘辅助 =====
// 物品立绘（images/ziyuan/item_名称.jpg），无立绘时自动隐藏
// 妖兽/灵宠立绘映射（images/yaoshou、images/lingchong 英文名目录）
const ZIYUAN_ALIAS = {
  '野狼': 'yaoshou/wind_wolf.jpg', '野猪': 'yaoshou/boar.jpg', '毒蛇': 'yaoshou/snake.jpg',
  '黑熊': 'yaoshou/bear.jpg', '灵狐': 'yaoshou/spirit_fox.jpg', '赤焰虎': 'yaoshou/flame_tiger.jpg',
  '烈焰狮': 'yaoshou/flame_lion.jpg', '寒冰蟒': 'yaoshou/ice_python.jpg', '雷鹰': 'yaoshou/thunder_eagle.jpg',
  '毒蝎王': 'yaoshou/poison_scorpion.jpg', '石巨人': 'yaoshou/stone_golem.jpg', '九尾天狐': 'yaoshou/nine_tail_fox.jpg',
  '蛟龙': 'yaoshou/flood_dragon.jpg', '凤凰': 'yaoshou/phoenix.jpg', '玄武': 'yaoshou/black_tortoise.jpg',
  '白虎': 'yaoshou/white_tiger.jpg', '应龙': 'yaoshou/ying_dragon.jpg', '麒麟': 'yaoshou/qilin.jpg',
  '饕餮': 'yaoshou/taotie.jpg', '穷奇': 'yaoshou/qiongqi.jpg', '梼杌': 'yaoshou/taowu.jpg',
  '祖龙': 'yaoshou/ancestor_dragon.jpg', '元凤': 'yaoshou/yuan_phoenix.jpg', '始麒麟': 'yaoshou/first_qilin.jpg',
  '混沌': 'yaoshou/chaos.jpg',
  '灵猫': 'lingchong/cat.jpg', '灵雀': 'lingchong/bird.jpg', '彩蝶': 'lingchong/butterfly.jpg',
  '玉兔': 'lingchong/rabbit.jpg', '苍狼': 'lingchong/silverwolf.jpg', '哮天犬': 'lingchong/dog.jpg',
  '青鳞蛇': 'lingchong/snake.jpg', '灵猴': 'lingchong/monkey.jpg', '玄龟': 'lingchong/turtle.jpg',
  '黑熊': 'lingchong/bear.jpg', '仙鹤': 'lingchong/crane.jpg', '金蟾': 'lingchong/toad.jpg',
  '冰蛛': 'lingchong/spider.jpg', '白虎': 'lingchong/tiger.jpg', '火麒麟': 'lingchong/qilin.jpg',
  '雷豹': 'lingchong/leopard.jpg', '金翅大鹏': 'lingchong/eagle.jpg', '九尾狐': 'lingchong/fox.jpg',
  '朱雀': 'lingchong/phoenix.jpg', '青龙': 'lingchong/dragon.jpg', '玄武': 'lingchong/turtle.jpg',
  '混沌兽': 'lingchong/chaos.jpg',
};
function ziyuanImg(name, size = 40) {
  if (!name) return '';
  const alias = ZIYUAN_ALIAS[name];
  const src = alias ? `images/${alias}` : `images/ziyuan/item_${encodeURIComponent(name)}.jpg`;
  return `<img src="${src}" alt="${name}" onerror="this.style.display='none'" style="width:${size}px;height:${size}px;border-radius:4px;object-fit:cover;vertical-align:middle;flex-shrink:0;">`;
}
// 鱼立绘（images/ziyuan/fish_X_Y.jpg）
function fishImg(name, size = 60) {
  return `<img src="images/ziyuan/${name}" alt="${name}" style="width:${size}px;height:${size}px;border-radius:6px;object-fit:cover;">`;
}
// 简易品级推断（用于库房/商店展示）
function itemTier(name) {
  if (!name) return '凡';
  if (/神/.test(name)) return '仙';
  if (/仙/.test(name)) return '仙';
  if (/宝|珍|极/.test(name)) return '宝';
  if (/灵|上品/.test(name)) return '灵';
  return '凡';
}
function tierColor(tier) {
  return tier === '凡' ? '#8b6914' : tier === '灵' ? '#228b22' : tier === '宝' ? '#4169e1' : '#9932cc';
}
// 库房物品条目：立绘 + 名称 + 品级 + 图鉴信息（需求④：与世界物品系统建立链接）
function warehouseItemHtml(item, onclick) {
  const info = item.itemInfo;
  const priceTxt = info && info.price ? ` · 价${info.price}` : '';
  const typeTxt = info && info.type ? ` · ${info.type}` : '';
  const descTxt = info && info.desc ? `<span style="display:block;font-size:10px;color:#8b6914;">${info.desc}</span>` : '';
  return `<span class="warehouse-item" title="${onclick.title}" onclick="${onclick.fn}">
    ${ziyuanImg(item.name, 26)}
    <span>${item.name}<small style="color:${tierColor(itemTier(item.name))};display:block;font-size:10px;">${itemTier(item.name)}品 ×${item.count || 1}${priceTxt}${typeTxt}</small>${descTxt}</span>
  </span>`;
}
// 送货上门：交付铁器（季度任务 q_easy_02）
async function deliverGoods() {
  const result = await api('/api/quests/deliver', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg || '送货完成');
  renderAll();
}


// 初始化
window.onload = async function() {
  const locations = await apiGet('/api/locations');
  const locSelect = document.getElementById('player-location');
  for (const loc of locations) {
    const opt = document.createElement('option');
    opt.value = loc.name;
    opt.textContent = loc.name;
    locSelect.appendChild(opt);
  }
  const personalities = await apiGet('/api/personalities');
  const perSelect = document.getElementById('player-personality');
  for (const p of personalities) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    perSelect.appendChild(opt);
  }
  // 默认随机姓名
  randomName();
  // 加载标签缓存
  loadAllTags();
};

// 随机函数
function randomName() {
  const surnames = ['赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨','朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜','戚','谢','邹','喻','柏','水','窦','章','云','苏','潘','葛','奚','范','彭','郎','鲁','韦','昌','马','苗','凤','花','方','俞','任','袁','柳','酆','鲍','史','唐','费','廉','岑','薛','雷','贺','倪','汤','滕','殷','罗','毕','郝','邬','安','常','乐','于','时','傅','皮','卞','齐','康','伍','余','元','卜','顾','孟','平','黄','和','穆','萧','尹','欧阳','司马','诸葛','上官','南宫','东方','独孤','慕容','长孙','宇文'];
  const maleNames = ['浩然','子轩','云飞','天行','无忌','逍遥','长风','惊鸿','凌风','星辰','苍穹','破晓','绝尘','问天','踏雪','寻梅','听风','观月','知秋','怀瑾','握瑜','修远','求索','知行','守一','明远','清和','景行','高山','景行','凌云','壮志','豪情','逸飞','翰墨','书剑','琴心','剑胆','铁骨','柔情'];
  const femaleNames = ['婉儿','若雪','语嫣','清照','如梦','如烟','若曦','诗涵','雅琴','秀兰','翠花','春梅','秋菊','冬梅','夏荷','明月','清风','细雨','微云','疏影','暗香','紫嫣','青萝','白露','初雪','晓月','星澜','芷若','语汐','梦瑶','雨薇','静姝','文君','采薇','云裳','秋霜','素心','听雨','观澜','清荷','含烟','若彤','冰卿','雁回','灵犀','琼华','婉清','疏桐','竹喧','玉簪','兰若','湘灵','宓妃'];
  const gender = document.getElementById('player-gender').value;
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const namePool = gender === '女' ? femaleNames : (gender === '男' ? maleNames : [...maleNames, ...femaleNames]);
  const given = namePool[Math.floor(Math.random() * namePool.length)];
  document.getElementById('player-surname').value = surname;
  document.getElementById('player-given-name').value = given;
}
function randomGender() {
  document.getElementById('player-gender').value = Math.random() > 0.5 ? '男' : '女';
  randomName();
}
function randomRace() {
  const races = ['人族','人族','人族','妖族','魔族','灵体'];
  document.getElementById('player-race').value = races[Math.floor(Math.random() * races.length)];
}
function randomPersonality() {
  const sel = document.getElementById('player-personality');
  const options = Array.from(sel.options).filter(o => o.value !== 'random');
  sel.value = options[Math.floor(Math.random() * options.length)].value;
}
function randomLocation() {
  const sel = document.getElementById('player-location');
  const options = Array.from(sel.options);
  sel.value = options[Math.floor(Math.random() * options.length)].value;
}

// 创建角色
async function createPlayer() {
  currentSlot = null;
  const surname = document.getElementById('player-surname').value.trim();
  const given = document.getElementById('player-given-name').value.trim();
  let name = (surname || '') + (given || '');
  if (!name) name = '';
  let gender = document.getElementById('player-gender').value;
  if (gender === 'random') gender = Math.random() > 0.5 ? '男' : '女';
  let race = document.getElementById('player-race').value;
  if (race === 'random') race = ['人族','妖族','魔族'][Math.floor(Math.random()*3)];
  let personality = document.getElementById('player-personality').value;
  if (personality === 'random') personality = '';
  const location = document.getElementById('player-location').value;

  const customRanges = JSON.parse(localStorage.getItem('portraitCustomRanges') || '{}');
  gameState = await api('/api/newgame', { name, gender, race, personality, location, customRanges });
  if (gameState.error) { gameNotify(gameState.error); return; }

  document.getElementById('create-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  switchPage('map');
  renderAll();
}

// 重新开局
function restartGame() {
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('create-screen').style.display = 'flex';
  gameState = null;
  currentSlot = null;
}

// 页面切换
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  if (page === 'map') renderMap();
  if (page === 'character') renderCharacter();
  if (page === 'journal') renderJournalPage();
  if (page === 'people') renderPeoplePage();
  if (page === 'local') renderLocalPeople();
  if (page === 'mansion') renderMansionPage();
  if (page === 'dungeon') updateDungeonStats();
  if (page === 'windflower') renderWindFlowerMap();
  if (page === 'work') renderWorkPage();
  if (page === 'pet') renderPetMap();
}

// 地图标签切换（凡人界 / 修仙界 / 副本空间）
const WORLD_MAP_BGS = {
  mortal: 'images/worldmap/mortal.jpg',
  cultivation: 'images/worldmap/cultivation.jpg',
  special: 'images/worldmap/special.jpg', // 副本空间背景（原特殊空间）
};
// 应用当前区域的大地图背景
function applyMapBackground(tab) {
  const bg = document.getElementById('map-bg');
  if (!bg) return;
  const url = WORLD_MAP_BGS[tab];
  if (url) {
    bg.style.backgroundImage = `url('${url}')`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';
    bg.classList.add('has-world-bg');
  } else {
    bg.style.backgroundImage = '';
    bg.classList.remove('has-world-bg');
  }
}

function switchMapTab(tab) {
  currentMapTab = tab;
  document.querySelectorAll('.map-tab').forEach(t => {
    const label = (t.textContent || '').trim();
    const hit = label === tab || (tab === 'mortal' && label.includes('凡人界')) || (tab === 'cultivation' && label.includes('修仙界')) || (tab === 'special' && label.includes('副本空间'));
    t.classList.toggle('active', hit);
  });
  applyMapBackground(tab);
  renderMap();
}

// 渲染所有
function renderAll() {
  if (!gameState) return;
  checkPendingEvents();
  renderTopBar();
  if (document.getElementById('page-map').classList.contains('active')) renderMap();
  if (document.getElementById('page-character').classList.contains('active')) renderCharacter();
  if (document.getElementById('page-journal').classList.contains('active')) renderJournalPage();
  if (document.getElementById('page-people').classList.contains('active')) renderPeoplePage();
  if (document.getElementById('page-local').classList.contains('active')) renderLocalPeople();
}

// 顶部栏
function renderTopBar() {
  const p = gameState.player;
  document.getElementById('top-avatar').src = resolvePortrait(p.portrait) || '';
  document.getElementById('top-name').textContent = p.name;
  document.getElementById('top-realm').textContent = p.realm + (p.subStage || '');
  document.getElementById('hud-time').textContent = gameState.gameDateText || '';
  document.getElementById('hud-silver').textContent = p.silver || 0;
  document.getElementById('hud-spirit').textContent = p.spiritStone || 0;
  if (gameState.weather) {
    const w = gameState.weather;
    document.getElementById('hud-weather').textContent = `${w.season}季·${w.weather?.name || '晴'}`;
  }
}

// ===== 地图页面 =====
function renderMap() {
  const container = document.getElementById('location-grid');
  if (!container) return;
  // 防御：gameState 未就绪或地图数据缺失时避免渲染异常导致地图不显示
  if (!gameState || !gameState.locations || !gameState.player) return;
  applyMapBackground(currentMapTab);
  container.innerHTML = '';
  const locations = gameState.locations || [];

  // 按界域分类（第九批：最终大地图为 凡人界/修仙界/副本空间，删除黑风寨/御书房/御花园/珍宝阁/魔界冥界）
  const realmMap = {
    mortal: ['清风镇','大夏皇都','落日森林','东海渔村','大夏皇陵','万毒沼泽','黑风寨','御花园','珍宝阁'],
    cultivation: ['青云剑宗','万妖山脉','自由坊市','上古遗迹','丹塔','裂风峡谷','天星阁','兽灵山','万剑冢'],
    special: [],
  };

  const filterLocs = realmMap[currentMapTab] || locations.map(l => l.name);
  const filtered = locations.filter(l => filterLocs.includes(l.name));

  if (filtered.length === 0 && currentMapTab !== 'special') {
    container.innerHTML = '<div style="padding:30px;text-align:center;color:#8b7a5a;font-size:14px;">该界域暂无地点</div>';
    document.getElementById('current-location-name').textContent = gameState.player.location;
    return;
  }

  for (const loc of filtered) {
    const isCurrent = loc.name === gameState.player.location;
    const card = document.createElement('div');
    card.className = 'location-card' + (isCurrent ? ' current' : '');
    card.innerHTML = `
      <div class="loc-icon">🏯</div>
      <div class="loc-name">${loc.name}</div>
      <div class="loc-desc">${loc.desc?.substring(0, 15) || '神秘之地'}</div>
    `;
    card.onclick = () => moveTo(loc.name);
    container.appendChild(card);
  }

  // 副本空间：在下方排列副本秘境（原角色页副本入口挪入此处）
  if (currentMapTab === 'special') {
    const section = document.createElement('div');
    section.style.cssText = 'grid-column:1/-1;margin-top:18px;';
    section.innerHTML = '<div style="font-size:15px;color:#f5e6d3;font-weight:bold;padding:6px 0;border-bottom:1px solid rgba(245,230,211,0.25);margin-bottom:10px;">🗡 副本秘境</div>';
    container.appendChild(section);
    apiGet('/api/dungeons').then(list => {
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;';
      for (const d of (list || [])) {
        const item = document.createElement('div');
        item.className = 'location-card';
        item.style.cssText = 'background:rgba(20,12,6,0.72);border:1px solid rgba(245,230,211,0.25);';
        item.innerHTML = `
          <div class="loc-name">${d.name} ${'★'.repeat(d.tier || 1)}</div>
          <div class="loc-desc">${d.desc?.substring(0, 22) || ''}</div>
          <div style="font-size:10px;color:#c9a97a;margin:4px 0;">地点: ${d.location} | 要求: ${d.minRealm || 1}阶</div>
          ${d.available ? '<button class="btn btn-small" onclick="enterDungeon(\'' + d.id + '\')">进入</button>' : '<span style="color:#cd5c5c;font-size:11px;">境界不足</span>'}
        `;
        grid.appendChild(item);
      }
      section.appendChild(grid);
    }).catch(() => {});
  }

  // 产业地点卡（店铺/洞府/灵田）
  renderEstateCards();

  document.getElementById('current-location-name').textContent = gameState.player.location;
}

// 渲染产业地点卡（第九批：店铺/洞府/灵田）
function renderEstateCards() {
  const es = gameState.player.estates || {};
  if (currentMapTab === 'mortal' && es.shop) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.style.cssText = 'background:rgba(20,12,6,0.72);border:1px solid rgba(245,230,211,0.3);cursor:pointer;';
    card.innerHTML = '<div class="loc-icon">🏮</div><div class="loc-name">我的店铺</div><div class="loc-desc">上架售货，NPC每月购买</div>';
    card.onclick = () => showMansionShopPanel();
    document.getElementById('location-grid').appendChild(card);
  }
  if (currentMapTab === 'cultivation') {
    if (es.cave) {
      const card = document.createElement('div');
      card.className = 'location-card';
      card.style.cssText = 'background:rgba(20,12,6,0.72);border:1px solid rgba(245,230,211,0.3);cursor:pointer;';
      card.innerHTML = '<div class="loc-icon">🏔</div><div class="loc-name">我的洞府</div><div class="loc-desc">对标顶级宅邸的仙家洞府</div>';
      card.onclick = () => showCavePanel();
      document.getElementById('location-grid').appendChild(card);
    }
    // 需求：灵田只在宅子中（修仙界地图不再显示"我的灵田"入口，宅子-灵田区域可进入）
  }
}

// 店铺面板
async function showMansionShopPanel() {
  const es = gameState.player.estates || {};
  const shop = es.shop;
  if (!shop) { gameNotify('你还没有店铺，可在背包中使用【店铺地契】获得'); return; }
  const income = shop.income || 0;
  let html = `<div style="max-height:440px;overflow-y:auto;text-align:left;padding:4px;">
    <img src="images/estates/shop.jpg" style="width:100%;height:130px;object-fit:cover;border-radius:8px;border:1px solid rgba(139,90,43,0.4);margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <b style="font-size:15px;">🏮 我的店铺</b>
      <div>待领取收益：<b style="color:#b8860b;">${income}</b> 灵石
        ${income > 0 ? `<button class="btn btn-small" style="margin-left:8px;" onclick="shopTake()">领取</button>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">`;
  for (let i = 0; i < 20; i++) {
    const s = shop.shelves[i] || null;
    html += `<div style="padding:8px;border-radius:6px;border:1px solid rgba(139,90,43,0.35);background:${s ? 'rgba(139,90,43,0.18)' : 'rgba(0,0,0,0.12)'};cursor:pointer;font-size:11px;text-align:center;" onclick="${s ? `shopUnShelve(${i + 1})` : `shopShelvePrompt(${i + 1})`}">
      ${s ? `<b>${s.name}</b><br><span style="color:#b8860b;">${s.price}灵石</span><br><span style="font-size:10px;color:#8b8b8b;">点击下架</span>` : '<span style="color:#8b8b8b;">空位<br>点击上架</span>'}
    </div>`;
  }
  html += '</div><div style="margin-top:10px;font-size:12px;color:#c9a97a;">📜 店铺记事：</div>';
  const sales = shop.sales || [];
  if (sales.length === 0) html += '<div style="font-size:12px;color:#8b8b8b;margin-top:4px;">暂无成交记录</div>';
  else {
    for (const s of sales.slice(-10).reverse()) {
      html += `<div style="font-size:11px;color:#c9a97a;padding:3px 0;border-bottom:1px dashed rgba(139,90,43,0.2);">${s.date} · ${s.buyer} 购得【${s.item}】×${s.count}，${s.price}灵石</div>`;
    }
  }
  html += '</div>';
  showAncientModal('🏮 我的店铺', html);
}

async function shopShelvePrompt(slot) {
  const p = gameState.player;
  const inv = (p.inventory || []).filter(i => i.count > 0);
  if (inv.length === 0) { gameNotify('背包中没有可上架的物品'); return; }
  const names = inv.map(i => `${i.name}×${i.count}`).join('\n');
  gamePrompt(`选择要上架的物品：\n${names}`, inv[0].name, (name) => {
    if (!name) return;
    gamePrompt(`【${name}】定价多少灵石？`, '50', async (price) => {
      if (!price) return;
      const r = await api('/api/shop/shelve', { slot, itemName: name, price: Number(price) });
      if (r.error) { gameNotify(r.error); return; }
      if (r.state) gameState = r.state;
      gameNotify(r.msg || '上架成功', '提示', () => { showMansionShopPanel(); });
    }, '上架定价');
  }, '上架物品');
}

async function shopUnShelve(slot) {
  const r = await api('/api/shop/unshelve', { slot });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  gameNotify(r.msg || '已下架', '提示', () => { showMansionShopPanel(); });
}

async function shopTake() {
  const r = await api('/api/shop/take');
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  gameNotify(r.msg || '收益已领取', '提示', () => { showMansionShopPanel(); });
  renderAll();
}

// 洞府面板
async function showCavePanel() {
  const es = gameState.player.estates || {};
  if (!es.cave) { gameNotify('你还没有洞府，可在背包中使用【洞府钥匙】获得'); return; }
  let html = `<div style="max-height:440px;overflow-y:auto;text-align:left;padding:4px;">
    <img src="images/estates/dongfu.jpg" style="width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid rgba(139,90,43,0.4);margin-bottom:10px;">
    <h4 style="color:#8b5a2b;margin:0 0 8px;">🏔 我的洞府</h4>
    <div style="font-size:13px;color:#c9a97a;line-height:1.8;">
      <p>这是你以【洞府钥匙】开辟的仙家洞府，对标顶级宅邸，灵气充沛、隔绝尘嚣。</p>
      <p>· 洞府内修炼效率更高（灵气浓郁）</p>
      <p>· 可安心休憩，恢复气血与灵力</p>
      <p>· 珍藏你的法器与机缘，作为大本营使用</p>
    </div>
    <button class="btn btn-small" style="width:100%;margin-top:8px;" onclick="restAtCave()">🛌 在洞府中休憩（恢复气血灵力）</button>
  </div>`;
  showAncientModal('🏔 我的洞府', html);
}

async function restAtCave() {
  const p = gameState.player;
  const hpMax = p.hp?.max || 100, mpMax = p.mp?.max || 100;
  p.hp.current = hpMax; p.mp.current = mpMax;
  renderAll();
  showCavePanel();
  gameNotify('你在洞府中打坐休憩，气血与灵力恢复至全满。');
}

// 灵田面板（需求：灵田=手动种植、成熟采摘入背包，与商铺自动收益无关）
async function showFarmPanel() {
  const es = gameState.player.estates || {};
  const farmland = es.farmland || gameState.player.farm;
  if (!farmland) { gameNotify('你还没有灵田，可在背包中使用【灵田契约】获得'); return; }
  // 复用宅子-灵田区域的完整种植面板（品级效益/地块/种植/采摘/升级）
  visitMansionArea('spirit_field');
}

// 移动到地点
async function moveTo(location) {
  gameState = await api('/api/move', { location });
  if (gameState.error) { gameNotify(gameState.error); return; }
  renderAll();
  showLocationDetail(location);
}

// 显示地点详情
function showLocationDetail(locationName) {
  const loc = (gameState.locations || []).find(l => l.name === locationName);
  if (!loc) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-location').classList.add('active');

  // 背景图（ditu 目录缺图时回退到界域大地图背景，保证背景完整显示）
  const bgEl = document.getElementById('location-detail-bg');
  const zoneFallback = { '凡人界': 'images/worldmap/mortal.jpg', '修仙界': 'images/worldmap/cultivation.jpg' };
  const fb = zoneFallback[loc.zone] || 'images/worldmap/special.jpg';
  function applyBg(url) {
    bgEl.style.background = '';
    bgEl.style.backgroundImage = `url('${url}')`;
    bgEl.style.backgroundSize = 'cover';
    bgEl.style.backgroundPosition = 'center';
  }
  if (loc.bg) {
    const probe = new Image();
    probe.onload = () => applyBg(`images/ditu/${loc.bg}`);
    probe.onerror = () => applyBg(fb);
    probe.src = `images/ditu/${loc.bg}`;
  } else {
    applyBg(fb);
  }

  document.getElementById('location-detail-title').textContent = loc.name;
  document.getElementById('location-detail-desc').textContent = loc.desc || '';

  // 功能按钮
  const funcDiv = document.getElementById('location-functions');
  funcDiv.innerHTML = '';
  if (loc.functions && loc.functions.length > 0) {
    for (const func of loc.functions) {
      const btn = document.createElement('button');
      btn.className = 'location-function-btn';
      btn.textContent = func;
      btn.onclick = () => doLocationFunction(loc.name, func);
      funcDiv.appendChild(btn);
    }
  }
  // 需求：各地点不再添加"我的宅子"按钮（底部栏已有宅子入口）

  // 当地人物预览
  const peopleDiv = document.getElementById('location-local-people');
  const localNpcs = (gameState.npcs || []).filter(n => n.location === locationName && n.isAlive);
  if (localNpcs.length > 0) {
    let html = '<h3>当地人物（' + localNpcs.length + '人）</h3>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    for (const npc of localNpcs.slice(0, 8)) {
      html += `<div style="background:rgba(26,15,10,0.7);border:1px solid rgba(201,169,97,0.3);border-radius:8px;padding:6px 12px;cursor:pointer;" onclick="showNPCDetail('${npc.id}')">
        <span style="color:#f5e6d3;font-size:13px;">${npc.name}</span>
        <span style="color:#c9a961;font-size:11px;margin-left:6px;">${npc.realm}</span>
      </div>`;
    }
    html += '</div>';
    peopleDiv.innerHTML = html;
  } else {
    peopleDiv.innerHTML = '<h3>当地人物</h3><p style="color:#8b6914;">此处空无一人</p>';
  }
}

// 地点功能交互
async function doLocationFunction(locationName, funcName) {
  // 通用功能映射
  const funcMap = {
    '铁匠铺': () => showBlacksmith(),
    '药铺': () => showPharmacyPanel(),
    '茶馆': () => doTeahouse(),
    '驿站': () => showAncientModal('驿站', '<p>驿站可以休息恢复，也可以打听消息。</p><button class="btn" style="margin-top:10px;" onclick="doRest()">休息</button>'),
    '种子铺': () => showShopPanel('seedShop', '种子铺'),
    '肉铺': () => showShopPanel('butcher', '肉铺'),
    '民居区': () => showAncientModal('民居区', '<p>普通百姓居住之地，可探访民情。</p>'),
    '采集区': () => enterGathering(),
    '猎场': () => doGather('狩猎'),
    '码头出海': () => showFishingZones(),
    '鱼市': () => showFishMarket(),
    '送铁器': () => deliverGoods(),
    '剿匪副本一层': () => enterDungeon('heifeng_zhai_1'),
    '剿匪副本二层': () => enterDungeon('heifeng_zhai_2'),
    '剿匪副本三层': () => enterDungeon('heifeng_zhai_3'),
    '迷宫探索': () => doGather('探索皇陵'),
    '龙脉吸收': () => doCultivateSpecial('龙脉'),
    '碑文参悟': () => doCultivateSpecial('参悟碑文'),
    '毒草采集': () => doGather('采集毒草'),
    '蛊师小屋': () => showGuShrine(),
    '功法阁': () => showSkillLibrary(),
    '试炼塔': () => enterDungeon('trial_tower'),
    '灵田矿脉': () => doGather('采矿'),
    '洗剑池': () => doCultivateSpecial('洗剑'),
    '镇魔塔': () => enterDungeon('town_demon'),
    '内丹交易所': () => showAncientModal('内丹交易所', '<p>交易妖兽内丹的场所。</p><button class="btn" style="margin-top:10px;" onclick="showShops()">前往商店</button>'),
    '灵泉': () => doCultivateSpecial('灵泉修炼'),
    '万妖殿': () => showAncientModal('万妖殿', '<p>妖族圣殿，妖族在此集会。</p>'),
    '古树祭坛': () => doCultivateSpecial('祭坛祈福'),
    '玩家摊位': () => showAncientModal('玩家摊位', '<p>自由坊市的玩家摊位区。</p>'),
    '黑市': () => showAncientModal('黑市', '<p>地下交易市场，出售违禁物品。</p><button class="btn" style="margin-top:10px;" onclick="showShops()">前往商店</button>'),
    '阵法师协会': () => showFormationAssociation(),
    '鉴宝阁': () => doAppraisal(),
    '器炉坊': () => showToolMarket('forge', 3, 6),
    '器方阁': () => showPaidLearning('forge'),
    '风花雪月': () => openWindFlowerMap(),
    '拍卖行': () => openAuction(),
    '残阵推演': () => doCultivateSpecial('推演残阵'),
    '古修骸骨': () => doGather('探索骸骨'),
    '镇碑参悟': () => doCultivateSpecial('参悟镇碑'),
    '丹方藏经阁': () => showAlchemy(),
    '丹炉市场': () => showToolMarket('furnace', 1, 6),
    '丹道论战': () => doCultivateSpecial('丹道论战'),
    '药王园': () => doGather('采药'),
    '罡风淬体': () => doCultivateSpecial('罡风淬体'),
    '风眼悟道': () => doCultivateSpecial('风眼悟道'),
    '翼人族部落': () => showAncientModal('翼人族部落', '<p>翼人族聚居之地，可交易或结盟。</p>'),
    '星盘推演': () => doDivination('星盘推演'),
    '命格占卜': () => doDivination('命格占卜'),
    '星辰灌体': () => doCultivateSpecial('星辰灌体'),
    '灵宠蛋交易市场': () => showPetEggMarket(),
    '灵兽用品区': () => showPetSupplyShop(),
    '官府悬赏': () => showQuarterlyQuests(),
    '牙人所': () => showServantMarket(),
    '天机阁': () => doBuyIntel(),
    '拍卖行': () => doAuction(),
    '赌坊': () => doGamble(),
    '御花园': () => showAncientModal('御花园', '<p>皇家花园，风景秀丽。</p>'),
    '内宫': () => showAncientModal('内宫', '<p>皇朝内宫，非请勿入。</p>'),
    // 魔界冥界功能
    '血池': () => doCultivateSpecial('血池修炼'),
    '魔魂殿': () => doCultivateSpecial('魔魂殿参悟'),
    '深渊裂隙采矿': () => doGather('深渊采矿'),
    '寿元黑市': () => showAncientModal('寿元黑市', '<p>交易寿元的神秘市场。</p><button class="btn" style="margin-top:10px;" onclick="showShops()">前往商店</button>'),
    '鬼宠巢穴': () => doGather('探索鬼宠巢穴'),
    '孟婆摊': () => doCultivateSpecial('孟婆汤'),
    '战场拾荒': () => doGather('战场拾荒'),
    '煞气风暴': () => doCultivateSpecial('煞气淬体'),
    '英魂碑': () => doCultivateSpecial('英魂碑参悟'),
    '骷髅兵营': () => enterDungeon('skeleton_camp'),
    '死亡祭坛': () => doCultivateSpecial('死亡祭坛'),
    '死灵法师塔': () => enterDungeon('necromancer_tower'),
    '摆渡人': () => doGather('乘坐摆渡'),
    '彼岸花海': () => doGather('采摘彼岸花'),
    '三生石': () => doDivination('三生石'),
    '鬼差任务': () => showQuests(),
    '万宝楼': () => showShops(),
    '阎罗殿': () => showAncientModal('阎罗殿', '<p>冥界阎罗殿，审判亡魂之所。</p>'),
    // 特殊空间功能
    '时间加速': () => doCultivateSpecial('时间加速修炼'),
    '傀儡守卫': () => enterDungeon('puppet_guard'),
    '虚空采矿': () => doGather('虚空采矿'),
    '虚空兽猎杀': () => enterDungeon('void_beast'),
    '空间风暴': () => doCultivateSpecial('空间风暴悟道'),
    '龙威试炼': () => enterDungeon('dragon_trial'),
    '祖龙骸骨': () => doCultivateSpecial('祖龙骸骨参悟'),
    '龙蛋孵化': () => showAncientModal('龙蛋孵化', '<p>孵化龙蛋需要特定条件和大量资源。</p>'),
    '封印维护': () => doCultivateSpecial('封印维护'),
    '海底矿脉': () => doGather('海底采矿'),
    '水族交易': () => showShops(),
    '心魔挑战': () => enterDungeon('heart_demon'),
    '幻境坊市': () => showShops(),
    '意识穿梭': () => doCultivateSpecial('意识穿梭'),
    '九重天梯': () => enterDungeon('nine_heaven'),
    '化劫池': () => doCultivateSpecial('化劫池'),
    '升仙碑': () => doCultivateSpecial('升仙碑参悟'),
    // 动态地点功能
    '购买时间': () => doBuyIntel(),
    '购买情报': () => doBuyIntel(),
    '购买古宝': () => showShops(),
    '水系功法': () => showSkillLibrary(),
    '藏宝图': () => doGather('寻宝'),
    '圣物碎片': () => doGather('寻找圣物碎片'),
    '大量修为': () => doCultivateSpecial('吸收修为'),
    '本命剑升级': () => doCultivateSpecial('本命剑升级'),
    '剑意觉醒': () => doCultivateSpecial('剑意觉醒'),
    // 内宫功能
    '面圣': () => showAncientModal('面圣', '<p>朝见皇帝，需达到一定官职。</p>'),
    '早朝': () => showAncientModal('早朝', '<p>参与早朝，商议国事。</p>'),
    '献宝': () => showAncientModal('献宝', '<p>向皇帝进献宝物。</p>'),
    '皇帝': () => showAncientModal('皇帝', '<p>大夏皇帝，九五之尊。</p>'),
    '司礼太监': () => showAncientModal('司礼太监', '<p>司礼监掌印太监。</p>'),
    '奏章': () => showAncientModal('奏章', '<p>批阅奏章。</p>'),
    '偷听': () => doGather('偷听'),
    '皇后': () => showAncientModal('皇后', '<p>大夏皇后，母仪天下。</p>'),
    '妃嫔': () => showAncientModal('妃嫔', '<p>后宫妃嫔。</p>'),
    '赏花': () => doCultivateSpecial('赏花'),
    '偶遇皇族': () => doGather('偶遇皇族'),
    '狱卒长': () => showAncientModal('狱卒长', '<p>天牢狱卒长。</p>'),
    '提审囚犯': () => showAncientModal('提审囚犯', '<p>提审天牢囚犯。</p>'),
    '劫狱': () => enterDungeon('prison_break'),
    '禁军统领': () => showAncientModal('禁军统领', '<p>禁军统领，手握兵权。</p>'),
    '领兵务': () => showQuests(),
    '调兵': () => showAncientModal('调兵', '<p>调动禁军，需虎符。</p>'),
    '兑换秘宝': () => showTreasureExchange(),
    '盗取': () => showTreasureSteal(),
    '国师': () => showAncientModal('国师', '<p>大夏国师，道法高深。</p>'),
    '星官': () => showAncientModal('星官', '<p>钦天监星官。</p>'),
    '推演国运': () => doDivination('推演国运'),
    '占卜': () => doDivination('占卜'),
  };

  const handler = funcMap[funcName];
  if (handler) {
    handler();
  } else {
    // 默认：探索类功能
    showAncientModal(funcName, `<p>你在${locationName}使用了【${funcName}】功能。</p><p style="color:#8b6914;font-size:13px;margin-top:10px;">该功能正在完善中...</p>`);
  }
}

// 茶馆闲聊
async function doTeahouse() {
  const result = await api('/api/explore', { type: 'teahouse' });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  showAncientModal('茶馆', `<p>你在茶馆中听人闲聊，获得了一些情报。</p>${result.event ? `<p style="margin-top:10px;color:#5c3a1e;">${result.event.text || result.event.msg || ''}</p>` : ''}`);
}

// 采集/狩猎等
async function doGather(type) {
  const result = await api('/api/explore', { type });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  const text = result.event?.text || result.event?.msg || `你进行了${type}，有所收获。`;
  showAncientModal(type, `<p>${text}</p>`);
}

// 特殊修炼
async function doCultivateSpecial(type) {
  const result = await api('/api/cultivate', { type });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  const text = result.event?.text || result.event?.msg || `你通过${type}提升了修为。`;
  showAncientModal(type, `<p>${text}</p>`);
}

// 功法阁 - 技能学习
async function showSkillLibrary() {
  const skills = gameState.player.skills || [];
  // 青云剑宗功法阁：只陈列剑宗独有功法
  if (gameState.locationName === '青云剑宗') {
    const data = await apiGet('/api/qingyun/arts');
    if (!data || data.error) { gameNotify(data?.error || '功法阁暂未开放'); return; }
    let html = '<p style="margin-bottom:10px;">青云剑宗功法阁，收录剑宗历代绝学，可用灵石参悟。</p>';
    const b = data.buffs || {};
    html += `<p style="font-size:12px;color:#8b5a2b;margin-bottom:10px;">已学剑法加成：攻击+${Math.round((b.attack || 0) * 100)}%、防御+${Math.round((b.defense || 0) * 100)}%、修炼速度+${Math.round((b.cultivate || 0) * 100)}%、悟性+${b.enlightenment || 0}</p>`;
    for (const art of data.arts) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${art.name}（${art.type}）</div>
          <div class="shop-item-desc">${art.desc}</div>
        </div>
        <button class="btn btn-small" ${art.learned ? 'disabled style="opacity:0.5;"' : ''} onclick="learnQingyunArt('${art.id}')">${art.learned ? '已参悟' : `参悟(${art.price}灵石)`}</button>
      </div>`;
    }
    showAncientModal('青云剑宗·功法阁', html);
    return;
  }
  const allSkills = [
    { name: '基础剑法', desc: '基础剑术，攻击+10', type: '攻击' },
    { name: '基础刀法', desc: '基础刀术，攻击+12', type: '攻击' },
    { name: '基础拳法', desc: '基础拳术，攻击+8', type: '攻击' },
    { name: '基础身法', desc: '基础身法，速度+10', type: '辅助' },
    { name: '基础心法', desc: '基础心法，灵力+20', type: '辅助' },
    { name: '御剑术', desc: '御剑飞行，移动速度大幅提升', type: '特殊' },
    { name: '隐身术', desc: '隐匿身形，不易被发现', type: '特殊' },
    { name: '炼丹术', desc: '炼制丹药的基础', type: '生活' },
    { name: '炼器术', desc: '炼制法宝的基础', type: '生活' },
    { name: '阵法基础', desc: '布置阵法的基础', type: '生活' },
  ];
  let html = '<p style="margin-bottom:10px;">功法阁收藏各派功法秘籍，可消耗灵石学习。</p>';
  for (const skill of allSkills) {
    const learned = skills.includes(skill.name);
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${skill.name}（${skill.type}）</div>
        <div class="shop-item-desc">${skill.desc}</div>
      </div>
      <button class="btn btn-small" ${learned ? 'disabled style="opacity:0.5;"' : ''} onclick="learnSkill('${skill.name}')">${learned ? '已学会' : '学习(500灵石)'}</button>
    </div>`;
  }
  showAncientModal('功法阁', html);
}

async function learnQingyunArt(artId) {
  const result = await api('/api/qingyun/learn', { artId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showSkillLibrary(); });
}

async function learnSkill(skillName) {
  const p = gameState.player;
  if (p.spiritStones < 500) { gameNotify('灵石不足！'); return; }
  if (!p.skills) p.skills = [];
  if (p.skills.includes(skillName)) { gameNotify('已学会该功法！'); return; }
  p.spiritStones -= 500;
  p.skills.push(skillName);
  gameState = await api('/api/save-state', {});
  renderAll();
  showAncientModal('学习成功', `<p style="text-align:center;padding:20px;">学会了【${skillName}】！</p>`);
}

// 占卜
async function doDivination(type) {
  const cost = type === '星盘推演' ? 200 : 500;
  const p = gameState.player;
  if (p.spiritStones < cost) { gameNotify(`灵石不足，需要${cost}灵石！`); return; }
  p.spiritStones -= cost;
  const fortunes = [
    '大吉：今日诸事顺遂，修炼效率提升。',
    '中吉：今日运气不错，可能有意外收获。',
    '小吉：今日平平淡淡，无惊无险。',
    '平：今日运势平常，按部就班即可。',
    '小凶：今日需谨慎行事，避免冲突。',
    '中凶：今日运势不佳，不宜远行。',
    '大凶：今日恐有血光之灾，务必小心！',
  ];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  gameState = await api('/api/save-state', {});
  renderAll();
  showAncientModal(type, `<p style="text-align:center;padding:20px;font-size:16px;">${fortune}</p>`);
}

// 鉴宝
async function doAppraisal() {
  const p = gameState.player;
  const valuables = (p.inventory || []).filter(i => i.rarity && i.rarity !== '普通');
  if (valuables.length === 0) {
    showAncientModal('鉴宝阁', '<p style="text-align:center;padding:20px;">你没有需要鉴定的宝物。</p>');
    return;
  }
  let html = '<p style="margin-bottom:10px;">选择要鉴定的宝物（每件100灵石）：</p>';
  for (const item of valuables) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}（${item.rarity}）</div>
        <div class="shop-item-desc">数量: ${item.count}</div>
      </div>
      <button class="btn btn-small" onclick="appraiseItem('${item.name}')">鉴定</button>
    </div>`;
  }
  showAncientModal('鉴宝阁', html);
}

async function appraiseItem(itemName) {
  const p = gameState.player;
  if (p.spiritStones < 100) { gameNotify('灵石不足！'); return; }
  p.spiritStones -= 100;
  const values = ['此乃无价之宝！', '此物颇为珍贵。', '此物还算不错。', '此物平平无奇。', '此物竟是赝品！'];
  const result = values[Math.floor(Math.random() * values.length)];
  gameState = await api('/api/save-state', {});
  renderAll();
  showAncientModal('鉴定结果', `<p style="text-align:center;padding:20px;">【${itemName}】：${result}</p>`);
}

// 拍卖行
async function doAuction() { openAuction(); }

// 天机阁 - 购买情报
async function doBuyIntel() {
  const intelTypes = [
    { name: 'NPC行踪', desc: '查询指定NPC当前位置', price: 100 },
    { name: '秘境情报', desc: '获取随机秘境开启信息', price: 500 },
    { name: '宝物线索', desc: '获取随机宝物位置线索', price: 1000 },
    { name: '修炼心得', desc: '获得修为经验加成', price: 300 },
  ];
  let html = '<p style="margin-bottom:10px;">天机阁无所不知，购买情报：</p>';
  for (const intel of intelTypes) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${intel.name}</div>
        <div class="shop-item-desc">${intel.desc}</div>
      </div>
      <button class="btn btn-small" onclick="buyIntel('${intel.name}',${intel.price})">购买(${intel.price}灵石)</button>
    </div>`;
  }
  showAncientModal('天机阁', html);
}

async function buyIntel(intelName, price) {
  const p = gameState.player;
  if (p.spiritStones < price) { gameNotify('灵石不足！'); return; }
  p.spiritStones -= price;
  let result = '';
  if (intelName === '修炼心得') {
    p.cultivationExp = (p.cultivationExp || 0) + 500;
    result = '研读修炼心得，修为经验+500！';
  } else if (intelName === '秘境情报') {
    result = '据闻近日有秘境即将开启，可留意动态地点。';
  } else if (intelName === '宝物线索') {
    result = '传说在某处藏有宝物，需自行探索。';
  } else {
    const npcs = (gameState.npcs || []).filter(n => n.isAlive);
    if (npcs.length > 0) {
      const npc = npcs[Math.floor(Math.random() * npcs.length)];
      result = `${npc.name}当前在${npc.location}。`;
    } else {
      result = '暂无情报。';
    }
  }
  gameState = await api('/api/save-state', {});
  renderAll();
  showAncientModal('情报', `<p style="text-align:center;padding:20px;">${result}</p>`);
}

// 赌坊（下注改为游戏内输入弹窗）
async function doGamble() {
  gamePrompt('下注多少银两？（10-1000）', '100', async (amount) => {
    if (!amount) return;
    const result = await api('/api/explore', { type: 'gamble', amount: parseInt(amount) });
    if (result.error) { gameNotify(result.error); return; }
    if (result.state) gameState = result.state;
    renderAll();
    const text = result.event?.text || result.event?.msg || '赌局结束。';
    showAncientModal('赌坊', `<p>${text}</p>`);
  }, '赌坊下注');
}

// 查看任务
async function showQuests() {
  const data = await apiGet('/api/quests');
  let html = '<h4 style="color:#5c3a1e;margin-bottom:10px;">当前任务</h4>';
  if (data.active && data.active.length > 0) {
    for (const q of data.active) {
      html += `<div class="shop-item" style="margin-bottom:6px;">
        <div class="shop-item-info">
          <div class="shop-item-name">${q.title || q.name || '任务'}</div>
          <div class="shop-item-desc">${q.desc || ''}</div>`;
      // 需求⑥：显示每个目标的进度（collect类含"背包已有"）
      if (q.objectives && q.objectives.length > 0) {
        for (const obj of q.objectives) {
          const cur = obj.current || 0;
          const need = obj.count || 1;
          const done = obj.completed || cur >= need;
          const color = done ? '#228b22' : '#8b6914';
          const have = (() => {
            if (obj.type === 'collect' && obj.item) {
              const it = (gameState.player.inventory || []).find(x => x.name === obj.item);
              return it ? (it.count || 1) : 0;
            }
            return cur;
          })();
          const shown = Math.min(have, need);
          html += `<div style="font-size:12px;color:${color};margin-top:2px;">${done ? '✅' : '⏳'} ${obj.desc || ''} <span style="color:${color};">${shown}/${need}</span>${obj.type === 'collect' ? ` <small style="color:#999;">（背包已有 ${have}）</small>` : ''}</div>`;
        }
      }
      if (q.rewards) {
        const rw = [];
        if (q.rewards.exp) rw.push(`修为+${q.rewards.exp}`);
        if (q.rewards.spiritStone) rw.push(`灵石+${q.rewards.spiritStone}`);
        if (q.rewards.silver) rw.push(`银两+${q.rewards.silver}`);
        if (q.rewards.reputation) rw.push(`声望+${q.rewards.reputation}`);
        if (q.rewards.contribution) rw.push(`贡献+${q.rewards.contribution}`);
        if (q.rewards.item) rw.push(q.rewards.item);
        if (rw.length > 0) html += `<div style="font-size:11px;color:#228b22;">奖励: ${rw.join('、')}</div>`;
      }
      // 需求：收集类任务背包有足够物品可直接提交完成
      const hasCollect = (q.objectives || []).some(o => o.type === 'collect');
      if (hasCollect) {
        const collectAllReady = (q.objectives || []).every(o => {
          if (o.type !== 'collect') return o.completed || (o.current || 0) >= (o.count || 1);
          const it = (gameState.player.inventory || []).find(x => x.name === o.item);
          const have = it ? (it.count || 1) : 0;
          return have >= (o.count || 1);
        });
        html += `<div style="margin-top:8px;text-align:right;">
          <button class="btn btn-small ${collectAllReady ? 'btn-primary' : ''}" onclick="submitQuest('${q.id}')" ${collectAllReady ? '' : 'disabled'}>${collectAllReady ? '提交物品完成' : '背包物品不足'}</button>
        </div>`;
      }
      html += `</div></div>`;
    }
  } else {
    html += '<p style="color:#8b6914;">暂无进行中的任务</p>';
  }
  showAncientModal('任务', html);
}

// 提交普通任务物品（背包直交）
async function submitQuest(questId) {
  const result = await api('/api/quests/submit', { questId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg || '任务提交成功！', '提示', () => { showQuests(); renderTopBar(); });
}

// 属性面板定义（需求6/7：顶部"属性"按钮弹出，三列：属性名|数值|说明）
function buildAttrDefs(p) {
  return [
    { key: 'physique', name: '根骨', desc: '影响气血上限和物理防御', value: p.attributes?.physique || 0 },
    { key: 'spirit', name: '神识', desc: '影响灵力上限和法术攻击', value: p.attributes?.spirit || 0 },
    { key: 'enlightenment', name: '悟性', desc: '影响修炼速度和突破成功率', value: p.attributes?.enlightenment || 0 },
    { key: 'agility', name: '身法', desc: '影响闪避率和暴击率', value: p.attributes?.agility || 0 },
    { key: 'fateLuck', name: '气运', desc: '影响奇遇概率和掉落品质', value: p.attributes?.fateLuck || 0 },
    { key: 'age', name: '年龄', desc: '当前年龄，影响寿元和外观', value: p.age },
    { key: 'strength', name: '力量', desc: '影响物理攻击力', value: p.attributes?.strength || 0 },
    { key: 'constitution', name: '体质', desc: '影响气血恢复和抗毒能力', value: p.attributes?.constitution || 0 },
    { key: 'perception', name: '感知', desc: '影响探索发现和预警能力', value: p.attributes?.perception || 0 },
    { key: 'willpower', name: '意志', desc: '影响心魔抗性和定力', value: p.attributes?.willpower || 0 },
    { key: 'charm', name: '魅力', desc: '影响NPC好感和交际成功率', value: p.attributes?.charm || 0 },
    { key: 'reputation', name: '声望', desc: '影响世人评价和特殊待遇', value: p.reputation || p.attributes?.reputation || 0 },
    { key: 'fertility', name: '孕率', desc: '决定怀孕判定概率（参与统一公式）', value: p.fertility ?? 40 },
  ];
}

// 需求6：顶部"📊 属性"按钮 → 弹出主控所有数值属性面板（三列布局）
function showPlayerAttrPanel() {
  const p = gameState.player;
  if (!p) { gameNotify('游戏状态未就绪'); return; }
  const attrDefs = buildAttrDefs(p);
  let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-height:70vh;overflow-y:auto;">';
  for (const attr of attrDefs) {
    html += `<div class="attr-item-large" style="padding:10px;text-align:left;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#000;font-size:13px;">${attr.name}</span>
        <b style="color:#000;font-size:18px;">${attr.value}</b>
      </div>
      <div style="font-size:11px;color:#333;margin-top:3px;">${attr.desc}</div>
    </div>`;
  }
  html += '</div>';
  showAncientModal('📊 属性面板', html);
}

// ===== 角色页面 =====
function renderCharacter() {
  const p = gameState.player;
  document.getElementById('char-portrait').src = resolvePortrait(p.portrait) || '';
  document.getElementById('char-name').textContent = p.name;
  document.getElementById('char-title').textContent = p.daoTitle || '散修';
  const idEl = document.getElementById('char-identity');
  if (idEl) idEl.textContent = p.identity || (p.realmLevel >= 2 ? '修仙者' : '平民');
  document.getElementById('char-race').textContent = `${p.race}·${p.gender}·${p.personality || ''}`;
  document.getElementById('char-age').textContent = p.age;
  // 灵根显示
  const rootEl = document.getElementById('char-spirit-root');
  if (p.spiritRoot) {
    const rootNames = { '金': '金灵根', '木': '木灵根', '水': '水灵根', '火': '火灵根', '土': '土灵根', '风': '风灵根', '雷': '雷灵根', '冰': '冰灵根', '魔': '魔灵根' };
    const purityNames = [
      { min: 0, max: 30, name: '杂灵根' }, { min: 31, max: 50, name: '下品' },
      { min: 51, max: 70, name: '中品' }, { min: 71, max: 85, name: '上品' },
      { min: 86, max: 95, name: '极品' }, { min: 96, max: 100, name: '天灵根' },
    ];
    const purityLevel = purityNames.find(l => p.spiritRoot.purity >= l.min && p.spiritRoot.purity <= l.max);
    rootEl.textContent = `${rootNames[p.spiritRoot.type] || p.spiritRoot.type}·${purityLevel?.name || ''}(${p.spiritRoot.purity}%)`;
  } else {
    rootEl.textContent = '';
  }

  // hp/mp 渲染兜底：兼容数字/NaN（旧档/NPC转主控后可能为数字，避免显示 undefined/undefined 或崩溃）
  const hpV = p.hp && typeof p.hp === 'object' && !isNaN(p.hp.current) ? p.hp : { current: (typeof p.hp === 'number' && !isNaN(p.hp)) ? p.hp : 0, max: (typeof p.hp === 'number' && !isNaN(p.hp)) ? p.hp : 0 };
  const mpV = p.mp && typeof p.mp === 'object' && !isNaN(p.mp.current) ? p.mp : { current: (typeof p.mp === 'number' && !isNaN(p.mp)) ? p.mp : 0, max: (typeof p.mp === 'number' && !isNaN(p.mp)) ? p.mp : 0 };
  const hpPct = hpV.max > 0 ? hpV.current / hpV.max * 100 : 0;
  document.getElementById('hp-bar').style.width = hpPct + '%';
  document.getElementById('hp-text').textContent = `${hpV.current}/${hpV.max}`;
  const mpPct = mpV.max > 0 ? mpV.current / mpV.max * 100 : 0;
  document.getElementById('mp-bar').style.width = mpPct + '%';
  document.getElementById('mp-text').textContent = `${mpV.current}/${mpV.max}`;
  const expPct = p.cultivationExp / (p.breakthroughExp || 1000) * 100;
  document.getElementById('exp-bar').style.width = Math.min(expPct, 100) + '%';
  document.getElementById('exp-text').textContent = `${p.cultivationExp}/${p.breakthroughExp || 1000}`;

  // 属性显示（3列×4行布局，名称：数值+描述）
  const attrDefs = [
    { key: 'physique', name: '根骨', desc: '影响气血上限和物理防御', value: p.attributes?.physique || 0 },
    { key: 'spirit', name: '神识', desc: '影响灵力上限和法术攻击', value: p.attributes?.spirit || 0 },
    { key: 'enlightenment', name: '悟性', desc: '影响修炼速度和突破成功率', value: p.attributes?.enlightenment || 0 },
    { key: 'agility', name: '身法', desc: '影响闪避率和暴击率', value: p.attributes?.agility || 0 },
    { key: 'fateLuck', name: '气运', desc: '影响奇遇概率和掉落品质', value: p.attributes?.fateLuck || 0 },
    { key: 'age', name: '年龄', desc: '当前年龄，影响寿元和外观', value: p.age },
    { key: 'strength', name: '力量', desc: '影响物理攻击力', value: p.attributes?.strength || 0 },
    { key: 'constitution', name: '体质', desc: '影响气血恢复和抗毒能力', value: p.attributes?.constitution || 0 },
    { key: 'perception', name: '感知', desc: '影响探索发现和预警能力', value: p.attributes?.perception || 0 },
    { key: 'willpower', name: '意志', desc: '影响心魔抗性和定力', value: p.attributes?.willpower || 0 },
    { key: 'charm', name: '魅力', desc: '影响NPC好感和交际成功率', value: p.attributes?.charm || 0 },
    { key: 'reputation', name: '声望', desc: '影响世人评价和特殊待遇', value: p.reputation || p.attributes?.reputation || 0 },
    { key: 'fertility', name: '孕率', desc: '决定怀孕判定概率（参与统一公式）', value: p.fertility ?? 40 },
  ];

  // 属性显示已移入顶部"📊 属性"按钮弹窗（需求7：角色页面不再显示属性数值栏）
  const attrContainer = document.getElementById('char-attrs-container');
  if (attrContainer) attrContainer.innerHTML = '';

  // 孕期显示（仅女性，显示孕月与孩子父亲）
  const pregEl = document.getElementById('char-pregnancy');
  if (pregEl) {
    if (p.gender === '女' && p.isPregnant) {
      const fatherNpc = p.pregnancyFather ? (gameState.npcs || []).find(n => n.id === p.pregnancyFather) : null;
      const fatherName = fatherNpc ? fatherNpc.name : (p.pregnancyFatherName || '未知');
      pregEl.textContent = ` · 已有身孕${p.pregnancyMonths || 0}月（孩子父亲：${fatherName}）`;
    } else {
      pregEl.textContent = '';
    }
  }

  const tagsDiv = document.getElementById('char-tags');
  tagsDiv.innerHTML = '';
  if (p.tags && p.tags.length > 0) {
    for (const tagId of p.tags) {
      const span = document.createElement('span');
      span.className = 'char-tag';
      span.textContent = getTagDisplayName(tagId);
      span.onclick = () => showTagDetail(tagId);
      tagsDiv.appendChild(span);
    }
  }

  const cs = p.combatStats || {};
  const eqBonus = p.equipmentBonus || {};
  document.getElementById('combat-stats-content').innerHTML = `
    攻击: ${cs.attackPhys || 0}${eqBonus.attack ? ` <span style="color:#228b22;">(+${eqBonus.attack})</span>` : ''} | 
    防御: ${cs.defensePhys || 0}${eqBonus.defense ? ` <span style="color:#228b22;">(+${eqBonus.defense})</span>` : ''}<br>
    法攻: ${cs.attackMagic || 0}${eqBonus.magicAttack ? ` <span style="color:#228b22;">(+${eqBonus.magicAttack})</span>` : ''} | 
    法防: ${cs.defenseMagic || 0}${eqBonus.magicDefense ? ` <span style="color:#228b22;">(+${eqBonus.magicDefense})</span>` : ''}<br>
    暴击: ${(cs.critRate || 0).toFixed(1)}%${eqBonus.critRate ? ` <span style="color:#228b22;">(+${eqBonus.critRate}%)</span>` : ''} | 
    闪避: ${(cs.dodgeRate || 0).toFixed(1)}%${eqBonus.dodgeRate ? ` <span style="color:#228b22;">(+${eqBonus.dodgeRate}%)</span>` : ''}<br>
    气血: ${hpV.max}${eqBonus.hpMax ? ` <span style="color:#228b22;">(+${eqBonus.hpMax})</span>` : ''} | 
    灵力: ${mpV.max}${eqBonus.mpMax ? ` <span style="color:#228b22;">(+${eqBonus.mpMax})</span>` : ''}
  `;

  // 渲染装备栏
  const equipment = p.equipment || { weapon: null, armor: null, accessory: null };
  const slotNames = { weapon: '⚔ 武器', armor: '🛡 防具', accessory: '💍 饰品' };
  let eqHtml = '';
  for (const [slot, name] of Object.entries(slotNames)) {
    const item = equipment[slot];
    eqHtml += `<div style="padding:6px;margin-bottom:6px;background:rgba(139,90,43,0.1);border-radius:4px;font-size:12px;">
      <div style="color:#8b6914;">${name}</div>
      <div style="color:#5c3a1e;font-weight:bold;">${item || '空'}</div>
    </div>`;
  }
  document.getElementById('equipment-slots').innerHTML = eqHtml;

  // 渲染记事板
  renderPlayerJournal();
}

// ===== 子嗣面板（需求：主控角色板子嗣按钮 + 子嗣记事合集）=====
// ===== 子嗣交互（需求：交谈/赠礼/切磋/偷窃/战斗/欢好(成年)/接回府）=====
async function childInteractUI(childId, action) {
  if (action === 'gift') { childGiftUI(childId); return; }
  if (action === 'love') {
    gameConfirm('确定要与对方欢好？', () => {
      childApi('/api/child/act', { childId, action: 'love' }, '');
    }, '欢好确认');
    return;
  }
  if (action === 'steal') {
    gameConfirm('偷窃可能被识破，确定？', () => childApi('/api/child/act', { childId, action: 'steal' }));
    return;
  }
  if (action === 'fight') {
    gameConfirm('要与对方战斗？可能受伤。', () => childApi('/api/child/act', { childId, action: 'fight' }));
    return;
  }
  const r = await childApi('/api/child/act', { childId, action });
  if (r && r.msg) gameNotify(r.msg, '子嗣', () => showMyChildren());
}
// 赠礼：选择物品
function childGiftUI(childId) {
  const inv = (gameState.player.inventory || []).filter(i => i.count > 0);
  if (!inv.length) { gameNotify('背包中没有可赠送的物品'); return; }
  let html = '<div style="color:#5c3a1e;font-size:13px;margin-bottom:10px;">选择要赠送的物品：</div>';
  let n = 0;
  for (const it of inv) {
    if (n >= 40) break;
    const safeName = escapeHtml(it.name).replace(/'/g, "\\'");
    html += '<div onclick="doChildGift(\'' + childId + '\',\'' + safeName + '\')" style="padding:8px;margin:4px 0;background:rgba(139,90,43,0.08);border-radius:6px;cursor:pointer;">' + escapeHtml(it.name) + ' ×' + it.count + '</div>';
    n++;
  }
  showAncientModal('赠礼', html);
}
async function doChildGift(childId, itemName) {
  const r = await childApi('/api/child/act', { childId, action: 'gift', itemName });
  if (r && r.msg) gameNotify(r.msg, '子嗣', () => showMyChildren());
}
// 我的子嗣面板（表格布局：头像|姓名|年龄|生父|生母|抚养人，可上下滑动，姓名/头像可点击打开面板）
function showMyChildren() {
  const p = gameState.player;
  const npcs = gameState.npcs || [];
  const byId = (id) => npcs.find(n => n.id === id);
  // 子嗣：生父或生母是主控的所有NPC（含私生子、未接回府）
  const kids = npcs.filter(n => n.family && (n.family.father === p.id || n.family.mother === p.id));
  kids.sort((a, b) => a.age - b.age);
  const m = p.mansion || {};
  const inHouse = (k) => (m.children || []).includes(k.id) || ((m.leftWing || []).includes(k.id)) || ((m.rightWing || []).includes(k.id));
  let html = '<h3 style="color:#5c3a1e;margin-bottom:10px;">👨‍👩‍👧‍👦 我的子嗣（' + kids.length + '）</h3>';
  html += '<div style="color:#8b6914;font-size:12px;margin-bottom:10px;">点击姓名或头像可打开子嗣面板查看详情；未接回府的子嗣可用"接回府"带回。</div>';
  if (!kids.length) {
    html += '<p style="color:#999;text-align:center;padding:15px;">暂无子嗣。与异性双修或孕育后代后可在此查看子嗣详情与记事。</p>';
  } else {
    // 姓名解析：主控优先显示姓名，其次NPC、其次family姓名、其次出生记录(personalHistory)兜底
    const nameById = (kid, id, fk, role) => {
      if (!id) return (kid.family && kid.family[fk]) ? kid.family[fk] : '<span style="color:#cd5c5c;">未知</span>';
      if (id === p.id) return p.name;
      const f = byId(id);
      if (f) return f.name;
      if (kid.family && kid.family[fk]) return kid.family[fk];
      // 出生记录兜底："出生于X，父亲XX，母亲XX"
      const ph0 = (kid.personalHistory || [])[0] || '';
      const m = role === 'father' ? ph0.match(/父亲([^，。]{2,6})/) : ph0.match(/母亲([^，。]{2,6})/);
      if (m) return m[1];
      return '<span style="color:#cd5c5c;">未知</span>';
    };
    html += '<div style="max-height:420px;overflow-y:auto;border:1px solid rgba(139,90,43,0.3);border-radius:6px;background:rgba(255,248,231,0.55);">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;color:#5c3a1e;">';
    html += '<thead><tr style="background:rgba(139,90,43,0.16);">'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">头像</th>'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">姓名</th>'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">年龄</th>'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">生父</th>'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">生母</th>'
      + '<th style="padding:8px 4px;border-bottom:1px solid rgba(139,90,43,0.35);text-align:center;white-space:nowrap;">抚养人</th>'
      + '</tr></thead><tbody>';
    for (const k of kids) {
      const guardian = k.guardian === p.id ? p : byId(k.guardian);
      const guardianText = k.guardian === p.id ? p.name : (guardian ? guardian.name : (k.guardianName ? k.guardianName : '<span style="color:#cd5c5c;">无</span>'));
      const fatherName = nameById(k, k.family.father, 'fatherName', 'father');
      const motherName = nameById(k, k.family.mother, 'motherName', 'mother');
      const portraitHtml = '<div style="width:40px;height:52px;margin:0 auto;border-radius:4px;border:1px solid rgba(139,90,43,0.3);display:flex;align-items:center;justify-content:center;background:rgba(139,90,43,0.08);font-size:20px;cursor:pointer;overflow:hidden;" onclick="showNPCDetail(\'' + k.id + '\')" title="点击查看' + escapeHtml(k.name) + '">' + (k.portrait ? '<img src="' + resolvePortrait(k.portrait) + '" style="width:100%;height:100%;object-fit:cover;">' : '👶') + '</div>';
      const nameHtml = '<span style="font-weight:bold;color:#8b6914;cursor:pointer;" onclick="showNPCDetail(\'' + k.id + '\')">' + escapeHtml(k.name) + '</span>'
        + (k.isAlive === false ? ' <span style="color:#cd5c5c;font-size:11px;">已故</span>' : '')
        + (!inHouse(k) && k.guardian !== p.id && k.isAlive !== false
          ? ' <button class="btn btn-primary" style="font-size:11px;padding:1px 6px;margin-left:4px;" onclick="childInteractUI(\'' + k.id + '\',\'returnHome\')">接回府</button>'
          : (inHouse(k) ? ' <span style="color:#228b22;font-size:11px;">🏠</span>' : ''));
      html += '<tr style="border-bottom:1px solid rgba(139,90,43,0.12);">'
        + '<td style="padding:6px 4px;text-align:center;">' + portraitHtml + '</td>'
        + '<td style="padding:6px 4px;text-align:center;">' + nameHtml + '</td>'
        + '<td style="padding:6px 4px;text-align:center;">' + k.age + '岁</td>'
        + '<td style="padding:6px 4px;text-align:center;">' + fatherName + '</td>'
        + '<td style="padding:6px 4px;text-align:center;">' + motherName + '</td>'
        + '<td style="padding:6px 4px;text-align:center;">' + guardianText + '</td>'
        + '</tr>';
    }
    html += '</tbody></table></div>';
  }
  html += '<div style="text-align:center;margin-top:16px;"><button class="btn btn-primary" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal('子嗣', html);
}

// ===== 角色页背景图（需求：15张风格各异背景 + 切换按钮随机）=====
let charBgIndex = 1;
function randomCharBg() {
  const total = 15;
  let next;
  do { next = Math.floor(Math.random() * total) + 1; } while (total > 1 && next === charBgIndex);
  charBgIndex = next;
  applyCharBg();
  try { localStorage.setItem('charBgIndex', charBgIndex); } catch (e) {}
}
function applyCharBg() {
  const layer = document.getElementById('char-bg-layer');
  if (layer) layer.style.backgroundImage = `url('images/char_bg/bg${charBgIndex}.jpg')`;
}
(function initCharBg() {
  try { const saved = localStorage.getItem('charBgIndex'); if (saved) charBgIndex = Number(saved) || 1; } catch (e) {}
  applyCharBg();
})();

// ===== 主控传代（需求⑦）：将主控之位传给亲属NPC =====
function showSuccessionModal() {
  const p = gameState.player;
  const fam = p.family || {};
  const byId = (id) => (gameState.npcs || []).find(n => n.id === id);
  const rels = [];
  const father = byId(fam.father);
  const mother = byId(fam.mother);
  const spouse = byId(fam.spouse);
  const children = (fam.children || []).map(byId).filter(Boolean);
  // 需求⑦：可传代列表展示全部三代亲属（含已故，已故标记后点击提示不可传）
  if (father) rels.push({ id: father.id, name: father.name, rel: '父亲', icon: '👴', dead: father.isAlive === false });
  if (mother) rels.push({ id: mother.id, name: mother.name, rel: '母亲', icon: '👵', dead: mother.isAlive === false });
  if (spouse) rels.push({ id: spouse.id, name: spouse.name, rel: '配偶', icon: spouse.gender === '女' ? '👰' : '🤵', dead: spouse.isAlive === false });
  for (const c of children) {
    rels.push({ id: c.id, name: c.name, rel: c.gender === '女' ? '女儿' : '儿子', icon: c.gender === '女' ? '👧' : '👦', dead: c.isAlive === false });
  }
  let html = '<h3 style="color:#5c3a1e;margin-bottom:10px;">👑 主控传代</h3>';
  html += '<p style="color:#8b6914;font-size:13px;margin-bottom:10px;">将主控之位传给一位亲属NPC：<br>· 银两/灵石/背包/仓库资源随行 · 宅子默认送出 · 前任主控变为普通NPC<br>· 家族、关系网、后宅、背包等实时变更<br>· <span style="color:#cd5c5c;">已故亲属不可传代（点击仅查看）</span></p>';
  if (rels.length === 0) {
    html += '<p style="color:#999;text-align:center;padding:15px;">暂无亲属可传代。先成婚或育有子嗣后再来吧。</p>';
    html += '<div style="text-align:center;margin-top:10px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  } else {
    for (const r of rels) {
      const npc = byId(r.id);
      const click = r.dead
        ? `gameNotify('${r.name}已不在人世，无法传代。可打开其面板查看生前信息。')`
        : `doPlayerSuccession('${r.id}')`;
      html += `<div onclick="${click}" style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;background:${r.dead ? 'rgba(100,100,100,0.08)' : 'rgba(139,90,43,0.08)'};border:1px solid ${r.dead ? 'rgba(120,120,120,0.3)' : 'rgba(139,90,43,0.3)'};border-radius:8px;cursor:pointer;" title="${r.dead ? '已故，不可传代' : '点击传代'}">
        <img src="${npc ? (resolvePortrait(npc.portrait) || '') : ''}" style="width:44px;height:56px;object-fit:cover;border-radius:6px;${r.dead ? 'filter:grayscale(1);opacity:0.6;' : ''}" onerror="this.style.display='none'">
        <div>
          <div style="font-weight:bold;color:#5c3a1e;">${r.icon} ${r.name} <span style="font-weight:normal;color:#8b6914;font-size:12px;">（${r.rel}）</span>${r.dead ? '<span style="color:#cd5c5c;font-size:12px;"> · 已故</span>' : ''}</div>
          <div style="font-size:12px;color:#8b6914;">${npc ? (npc.professionName || npc.profession || '散修') : ''} · ${npc ? (npc.realm || '') : ''}</div>
        </div>
      </div>`;
    }
    html += '<div style="text-align:center;margin-top:10px;color:#999;font-size:12px;">点击在世亲属即可传代（需二次确认）</div>';
  }
  showAncientModal('👑 主控传代', html);
}

async function doPlayerSuccession(npcId) {
  const npc = (gameState.npcs || []).find(n => n.id === npcId);
  if (npc && npc.isAlive === false) {
    gameNotify(`${npc.name}已不在人世，无法传代。可打开其面板查看生前信息。`);
    return;
  }
  // 传代二次确认改为游戏内确认弹窗
  gameConfirm(`确定将主控之位传给【${npc ? npc.name : ''}】？\n\n传代后：资源随行、宅子送出、前任主控变为普通NPC，且不可撤销。`, async () => {
    const r = await api('/api/player/succession', { npcId });
    if (r.error) { gameNotify(r.error); return; }
    // 需求⑩：传代后全量刷新（姓名/立绘/属性/顶部栏等实时变更）
    gameState = r.state;
    currentWF = null;
    closeModal('generic-modal');
    renderAll();
    renderCharacter();
    gameNotify(r.msg);
  }, '主控传代确认');
}

// ===== 世界记事页面 =====
function switchJournalMode(mode) {
  currentJournalMode = mode;
  document.getElementById('tab-world-journal').classList.toggle('active', mode === 'world');
  document.getElementById('tab-person-journal').classList.toggle('active', mode === 'person');
  document.getElementById('world-journal-section').style.display = mode === 'world' ? 'block' : 'none';
  document.getElementById('person-journal-section').style.display = mode === 'person' ? 'block' : 'none';
  renderJournalPage();
}

function renderJournalPage() {
  if (currentJournalMode === 'world') {
    renderWorldJournal();
  } else {
    renderPersonJournal();
  }
}

// 需求①：把记事文本中出现的NPC姓名包成可点击链接（覆盖玩家记事/世界记事/NPC记事中嵌名）
function fixLegacyJournal(msg) {
  // 历史存档中的斜杠称呼兼容：按主控性别替换家长称呼；亲女/亲儿按记事中的子嗣姓名性别
  if (!msg) return msg;
  let t = msg;
  // 历史偷情记事中的"你"→偷情方姓名（"X与Y暗中相会。你趁着…"——X为男方/主动方）
  if (/暗中相会/.test(t) && t.includes('你')) {
    const m0 = t.match(/([^，。\s]{2,4})与[^，。]{2,4}暗中相会/);
    if (m0) t = t.replace(/你/g, m0[1]);
  }
  if (t.indexOf('/') === -1) return t;
  const pg = gameState.player && gameState.player.gender;
  if (pg === '女') {
    t = t.replace(/父亲\/母亲/g, '母亲').replace(/爹爹\/娘亲/g, '娘亲').replace(/爹\/娘/g, '娘').replace(/父\/母/g, '母').replace(/丈夫\/妻子/g, '丈夫');
  } else {
    t = t.replace(/父亲\/母亲/g, '父亲').replace(/爹爹\/娘亲/g, '爹爹').replace(/爹\/娘/g, '爹').replace(/父\/母/g, '父').replace(/丈夫\/妻子/g, '妻子');
  }
  if (/亲女\/亲儿|亲儿\/亲女/.test(t)) {
    const m2 = t.match(/将([^，。]{2,4})接入府中/);
    const kid = m2 ? (gameState.npcs || []).find(n => n.name === m2[1]) : null;
    if (kid) {
      t = t.replace(/亲女\/亲儿/g, kid.gender === '女' ? '亲女' : '亲儿').replace(/亲儿\/亲女/g, kid.gender === '女' ? '亲女' : '亲儿');
    }
  }
  return t;
}
function linkifyNpcNames(msg, npcList) {
  if (!msg) return msg;
  const names = (npcList || []).map(n => n && n.name).filter(nm => nm && nm.length >= 2)
    .sort((a, b) => b.length - a.length);
  if (names.length === 0) return msg;
  let out = '';
  let rest = msg;
  let guard = 0;
  while (rest && guard++ < 600) {
    let hit = null;
    for (const nm of names) {
      const idx = rest.indexOf(nm);
      if (idx >= 0 && (hit === null || idx < hit.idx)) hit = { nm, idx };
    }
    if (!hit) { out += rest; break; }
    const npcHit = (npcList || []).find(n => n && n.name === hit.nm);
    const onclickAttr = npcHit
      ? `showNPCDetail('${npcHit.id}')`
      : `showNPCDetailByName('${hit.nm.replace(/'/g, "\\'")}')`;
    out += rest.slice(0, hit.idx) + `<span class="npc-link" onclick="${onclickAttr}">${hit.nm}</span>`;
    rest = rest.slice(hit.idx + hit.nm.length);
  }
  return out;
}

function renderWorldJournal() {
  // 筛选标签
  const filtersDiv = document.getElementById('journal-filters');
  const categories = [
    { id: 'all', name: '全部' },
    { id: '修炼', name: '修炼' },
    { id: '战斗', name: '战斗' },
    { id: '社交', name: '社交' },
    { id: '探索', name: '探索' },
    { id: '成就', name: '成就' },
    { id: '爱恨纠葛', name: '爱恨纠葛' },
    { id: '凡人', name: '凡人界' },
    { id: '修仙', name: '修仙界' },
    { id: '存活', name: '存活NPC' },
    { id: '死亡', name: '死亡NPC' },
  ];
  filtersDiv.innerHTML = '';
  for (const cat of categories) {
    const btn = document.createElement('button');
    btn.className = 'filter-tag' + (currentJournalFilter === cat.id ? ' active' : '');
    btn.textContent = cat.name;
    btn.onclick = () => { currentJournalFilter = cat.id; renderWorldJournal(); };
    filtersDiv.appendChild(btn);
  }

  // 收集所有NPC的记事（世界记事 = 所有NPC发生的事情）
  let allJournals = [];

  // 玩家记事
  if (gameState.player?.journal) {
    for (const j of gameState.player.journal) {
      allJournals.push({ time: j.time || '', msg: j.msg || j, npcName: gameState.player.name, isPlayer: true, isAlive: true });
    }
  }

  // 世界记事（月度事件、标签剧情等）
  if (gameState.worldJournal && gameState.worldJournal.length > 0) {
    for (const j of gameState.worldJournal) {
      allJournals.push({ time: j.time || '', msg: j.content || j.msg || '', npcName: j.npc || '', isPlayer: false, isAlive: true, isWorldEvent: true });
    }
  }

  // 所有NPC记事（已认识/同地点/死亡的NPC在 npcs 列表中）
  for (const npc of (gameState.npcs || [])) {
    if (npc.personalHistory && npc.personalHistory.length > 0) {
      for (const h of npc.personalHistory) {
        allJournals.push({ time: '', msg: h, npcName: npc.name, isPlayer: false, isAlive: npc.isAlive !== false });
      }
    }
    if (npc.journal && npc.journal.length > 0) {
      for (const j of npc.journal) {
        allJournals.push({ time: j.time || '', msg: j.content || j.msg || '', npcName: npc.name, isPlayer: false, isAlive: npc.isAlive !== false });
      }
    }
  }

  // 世界记事补全：未认识且不同地点的存活NPC记事（后端 allNpcJournals），确保全世界动态同步显示
  if (gameState.allNpcJournals && gameState.allNpcJournals.length > 0) {
    for (const rec of gameState.allNpcJournals) {
      for (const h of rec.msgs) {
        allJournals.push({ time: '', msg: h, npcName: rec.npc, isPlayer: false, isAlive: rec.isAlive });
      }
    }
  }

  // 筛选
  if (currentJournalFilter === '存活') {
    allJournals = allJournals.filter(j => j.isAlive);
  } else if (currentJournalFilter === '死亡') {
    allJournals = allJournals.filter(j => !j.isAlive);
  } else if (currentJournalFilter === '爱恨纠葛') {
    // 需求：爱恨纠葛——欢好/情杀/偷情/一夜情/出轨/迷晕/强迫等情爱事件关键词匹配
    const LOVE_KEYWORDS = [
      '欢好', '情杀', '偷情', '一夜', '出轨', '迷晕', '强迫', '偷奸', '私通', '通奸',
      '暗通款曲', '暗中相会', '勾引', '勾搭', '偷欢', '红杏', '翻云覆雨', '巫山', '云雨',
      '春宵', '颠鸾倒凤', '以身相许', '春风一度', '肌肤之亲', '露水情缘', '苟且', '相好',
      '情郎', '情妇', '余香', '红颜知己', '强行', '霸王硬上弓', '鱼水之欢',
    ];
    allJournals = allJournals.filter(j => LOVE_KEYWORDS.some(k => (j.msg || '').includes(k)));
  } else if (currentJournalFilter !== 'all') {
    allJournals = allJournals.filter(j => j.msg.includes(currentJournalFilter));
  }

  // 按时间排序（数字解析：年×36+月×3+旬，避免字符串比较导致"3年"排在"14年"前）
  function journalTimeNum(s) {
    const m = String(s || '').match(/(\d+)年(\d+)月([上中下])?旬/);
    if (!m) return 0;
    const xun = { '上': 0, '中': 1, '下': 2 }[m[3]] ?? 0;
    return (+m[1]) * 36 + (+m[2] - 1) * 3 + xun;
  }
  allJournals.sort((a, b) => journalTimeNum(b.time || b.msg) - journalTimeNum(a.time || a.msg));

  const listDiv = document.getElementById('journal-list');
  listDiv.innerHTML = '';
  if (allJournals.length === 0) {
    listDiv.innerHTML = '<div style="text-align:center;color:#8b6914;padding:40px;">暂无记事</div>';
    return;
  }

  for (const j of allJournals.slice(0, 100)) {
    const card = document.createElement('div');
    card.className = 'journal-card';
    let category = '杂记';
    if (j.msg.includes('修炼') || j.msg.includes('修为')) category = '修炼';
    else if (j.msg.includes('战斗') || j.msg.includes('击败') || j.msg.includes('杀死')) category = '战斗';
    else if (j.msg.includes('交谈') || j.msg.includes('结识') || j.msg.includes('赠送') || j.msg.includes('成婚')) category = '社交';
    else if (j.msg.includes('探索') || j.msg.includes('发现') || j.msg.includes('采集')) category = '探索';
    else if (j.msg.includes('成就') || j.msg.includes('解锁')) category = '成就';

    const displayTime = j.time || (j.msg.match(/^\d+年\d+月[上中下]旬/) ? j.msg.match(/^\d+年\d+月[上中下]旬/)[0] : '') || j.msg.substring(0, 10);
    // 查找记事中提到的NPC，让名字可点击（找不到时按名字向后端兜底查询，死亡/已清理NPC也能友好处理）
    let npcClickable = '';
    if (!j.isPlayer && j.npcName) {
      const npcFound = (gameState.npcs || []).find(n => n.name === j.npcName);
      if (npcFound) {
        npcClickable = `onclick="showNPCDetail('${npcFound.id}')" style="cursor:pointer;color:#8b4513;text-decoration:underline;"`;
      } else {
        npcClickable = `onclick="showNPCDetailByName('${(j.npcName || '').replace(/'/g, "\\'")}')" style="cursor:pointer;color:#8b4513;text-decoration:underline;"`;
      }
    }
    card.innerHTML = `
      <div class="journal-time">
        <span>${displayTime || '——'}</span>
        <span class="journal-category" ${npcClickable}>${j.isPlayer ? '主控' : j.npcName}</span>
        <span class="journal-category" style="background:${j.isAlive ? 'rgba(34,139,34,0.2)' : 'rgba(139,0,0,0.2)'}">${j.isAlive ? '存活' : '已故'}</span>
      </div>
      <div class="journal-content">${linkifyNpcNames(fixLegacyJournal(j.msg), gameState.npcs)}</div>
    `;
    listDiv.appendChild(card);
  }
}

function renderPersonJournal() {
  // 已结识的NPC选择器
  const selectorDiv = document.getElementById('person-journal-selector');
  const knownNpcs = (gameState.npcs || []).filter(n => n.knownByPlayer);
  // 已结识的灵姬/灵郎（风花雪月）也加入已结识面板（记事取 notes）
  const wfGen = gameState.windFlower?.generated || {};
  for (const loc of Object.keys(wfGen)) {
    for (const p of wfGen[loc]) {
      if (p.known) {
        knownNpcs.push({ id: p.id, name: p.name, gender: p.gender, age: p.age, knownByPlayer: true, personalHistory: p.notes || [], isWindFlower: true, location: loc });
      }
    }
  }

  selectorDiv.innerHTML = '';
  if (knownNpcs.length === 0) {
    selectorDiv.innerHTML = '<span style="color:#8b6914;">暂无已结识的人物</span>';
    document.getElementById('person-journal-list').innerHTML = '';
    return;
  }

  if (!currentPersonJournalId || !knownNpcs.find(n => n.id === currentPersonJournalId)) {
    currentPersonJournalId = knownNpcs[0].id;
  }

  for (const npc of knownNpcs) {
    const btn = document.createElement('button');
    btn.className = 'person-journal-btn' + (currentPersonJournalId === npc.id ? ' active' : '');
    btn.textContent = npc.name + (npc.personalHistory?.length ? `(${npc.personalHistory.length})` : '');
    btn.onclick = () => { currentPersonJournalId = npc.id; renderPersonJournal(); };
    selectorDiv.appendChild(btn);
  }

  // 显示选中NPC的个人记事
  const npc = knownNpcs.find(n => n.id === currentPersonJournalId);
  const listDiv = document.getElementById('person-journal-list');
  listDiv.innerHTML = '';

  if (!npc.personalHistory || npc.personalHistory.length === 0) {
    listDiv.innerHTML = `<div style="text-align:center;color:#8b6914;padding:40px;">${npc.name} 暂无个人记事</div>`;
    return;
  }

  for (const h of npc.personalHistory.slice(-30).reverse()) {
    const card = document.createElement('div');
    card.className = 'journal-card';
    card.innerHTML = `
      <div class="journal-time">
        <span>${npc.name}的记事</span>
        <span class="journal-category">个人</span>
      </div>
      <div class="journal-content">${h}</div>
    `;
    listDiv.appendChild(card);
  }
}

// ===== 世界人物页面 =====
function renderPeoplePage() {
  // 筛选标签
  const filtersDiv = document.getElementById('people-filters');
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'alive', name: '存活' },
    { id: 'dead', name: '已死亡' },
    { id: '凡人', name: '凡人' },
    { id: '修仙', name: '修仙' },
    { id: '男', name: '男' },
    { id: '女', name: '女' },
  ];
  filtersDiv.innerHTML = '';
  for (const cat of categories) {
    const btn = document.createElement('button');
    btn.className = 'filter-tag' + (currentPeopleFilter === cat.id ? ' active' : '');
    btn.textContent = cat.name;
    btn.onclick = () => { currentPeopleFilter = cat.id; renderPeoplePage(); };
    filtersDiv.appendChild(btn);
  }

  // 清理死亡NPC按钮
  const deadCount = (gameState.npcs || []).filter(n => !n.isAlive).length;
  if (deadCount > 0) {
    const cleanBtn = document.createElement('button');
    cleanBtn.className = 'filter-tag';
    cleanBtn.style.cssText = 'background:rgba(139,0,0,0.3);border-color:#8b0000;color:#8b0000;';
    cleanBtn.textContent = `🗑 清理死亡NPC(${deadCount})`;
    cleanBtn.onclick = () => cleanDeadNpcs();
    filtersDiv.appendChild(cleanBtn);
  }

  // 师徒面板
  const md = gameState.player.masterDisciple || { master: null, disciples: [] };
  let mdHtml = '<div style="margin:10px 0;padding:10px;background:rgba(139,90,43,0.08);border-radius:6px;border:1px solid rgba(139,90,43,0.3);">';
  mdHtml += '<div style="display:flex;gap:20px;flex-wrap:wrap;">';
  // 师尊
  mdHtml += '<div style="flex:1;min-width:200px;">';
  mdHtml += '<h4 style="color:#8b6914;margin-bottom:8px;">👨‍🏫 我的师尊</h4>';
  if (md.master) {
    mdHtml += `<div style="padding:8px;background:rgba(75,0,130,0.1);border-radius:4px;cursor:pointer;" onclick="showNPCDetail('${md.master.id}')">
      <b style="color:#5c3a1e;">${md.master.name}</b>
      <span style="color:#8b6914;font-size:12px;margin-left:8px;">${md.master.realm || ''}</span>
    </div>`;
  } else {
    mdHtml += '<p style="color:#555;font-size:13px;">尚未拜师</p>';
  }
  mdHtml += '</div>';
  // 徒弟
  mdHtml += '<div style="flex:1;min-width:200px;">';
  mdHtml += `<h4 style="color:#8b6914;margin-bottom:8px;">🎓 我的弟子(${md.disciples?.length || 0})</h4>`;
  if (md.disciples && md.disciples.length > 0) {
    for (const d of md.disciples) {
      mdHtml += `<div style="padding:6px 8px;margin-bottom:4px;background:rgba(0,100,0,0.1);border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;" onclick="showNPCDetail('${d.id}')">
        <span><b style="color:#5c3a1e;">${d.name}</b></span>
        <span style="color:#8b6914;font-size:12px;">${d.realm || ''}</span>
      </div>`;
    }
  } else {
    mdHtml += '<p style="color:#555;font-size:13px;">尚未收徒</p>';
  }
  mdHtml += '</div>';
  mdHtml += '</div></div>';
  const mdPanel = document.getElementById('people-md-panel');
  if (mdPanel) mdPanel.innerHTML = mdHtml;

  // 人物列表（相识：排除非主控子女的0岁新生儿，避免"不认识的新生儿"出现在相识列表）
  const gridDiv = document.getElementById('people-grid');
  const isPlayerKid = (n) => n.family && (n.family.father === gameState.player.id || n.family.mother === gameState.player.id);
  let npcs = (gameState.npcs || []).filter(n => n.knownByPlayer && (n.age >= 1 || isPlayerKid(n)));
  if (currentPeopleFilter === 'alive') npcs = npcs.filter(n => n.isAlive !== false);
  if (currentPeopleFilter === 'dead') npcs = npcs.filter(n => n.isAlive === false);
  if (currentPeopleFilter === '凡人') npcs = npcs.filter(n => n.realmLevel <= 1);
  if (currentPeopleFilter === '修仙') npcs = npcs.filter(n => n.realmLevel >= 2);
  if (currentPeopleFilter === '男') npcs = npcs.filter(n => n.gender === '男');
  if (currentPeopleFilter === '女') npcs = npcs.filter(n => n.gender === '女');

  gridDiv.innerHTML = '';
  if (npcs.length === 0) {
    gridDiv.innerHTML = '<div style="text-align:center;color:#8b6914;padding:40px;grid-column:1/-1;">暂无认识的人物</div>';
    return;
  }

  for (const npc of npcs) {
    const card = document.createElement('div');
    card.className = 'person-card-large';
    if (npc.isAlive === false) card.style.opacity = '0.5';
    card.innerHTML = `
      <img src="${resolvePortrait(npc.portrait) || ''}" onerror="this.style.display='none'">
      <div class="person-name">${npc.name}${npc.isAlive === false ? '·已故' : ''}</div>
      <div class="person-realm">${npc.professionName || npc.profession || '散修'}</div>
      <div class="person-loc">${npc.location}${npc.deathCause ? '·' + npc.deathCause : ''}</div>
      ${npc.isAlive === false ? `<div style="text-align:center;margin-top:4px;"><button class="btn btn-small" style="padding:2px 10px;font-size:11px;background:#8b0000;color:#fff;border-color:#8b0000;" onclick="event.stopPropagation();cleanOneNpc('${npc.id}')">🗑 清理</button></div>` : ''}
    `;
    card.onclick = () => showNPCDetail(npc.id);
    gridDiv.appendChild(card);
  }
}

// 清理死亡NPC数据
async function cleanDeadNpcs() {
  const result = await api('/api/clean-dead-npcs', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(`已清理${result.removed || 0}个死亡NPC及其记事`);
  renderAll();
}

// 清理单个死亡NPC（需求：每个死亡NPC单独清理按钮，清理后立即刷新不再显示）
async function cleanOneNpc(npcId) {
  gameConfirm('确定清理该死亡NPC及其相关记事？此操作不可恢复。', async () => {
    const result = await api('/api/clean-npc', { npcId });
    if (result.error) { gameNotify(result.error); return; }
    if (result.state) gameState = result.state;
    gameNotify('已清理该NPC及其记事。', '提示', () => renderPeople());
  });
}

// ===== 子嗣/私生子/妻妾 交互弹窗（新需求批次）=====
async function childApi(path, body, afterMsg) {
  const r = await api(path, body);
  if (r.error) { gameNotify(r.error); return null; }
  if (r.state) gameState = r.state;
  const cleared = await api('/api/clear-pending-events', {});
  if (cleared && cleared.state) gameState = cleared.state;
  renderAll();
  // 若还有带按钮的事件弹窗在等待处理，则不显示 afterMsg（避免覆盖事件弹窗）
  const stillPending = gameState.pendingPlayerEvents && gameState.pendingPlayerEvents.some(ev => ev && ev.withActions);
  if (afterMsg && !stillPending) gameNotify(afterMsg, '事件', () => renderAll());
  return r;
}
async function clearPendingAndRender() {
  const cleared = await api('/api/clear-pending-events', {});
  if (cleared && cleared.state) gameState = cleared.state;
  renderAll();
}
// 生产弹窗按钮：命名/安排住所/遗弃
function birthActionUI(babyId, action) {
  if (action === 'house') {
    // 需求9：入府安置 → 先弹取名框，取名后方可安置
    gamePrompt('为孩子取一个名字（入府安置）：', '', v => {
      if (!v || !v.trim()) { gameNotify('名字不能为空'); return; }
      childApi('/api/birth/action', { babyId, action: 'house', name: v.trim() }, '已为孩子命名并安置入府。');
    }, '命名');
  } else if (action === 'abandon') {
    // 需求9：不予抚养 → 保持随机名，流落在外
    gameConfirm('确定不予抚养吗？孩子将流落在外，名字保持随机。', () => {
      childApi('/api/birth/action', { babyId, action: 'abandon' }, '你未抚养孩子，他/她流落在外。');
    }, '不予抚养确认');
  } else if (action === 'name') {
    // 兼容旧入口：直接改名
    gamePrompt('为孩子取一个新名字：', '', v => {
      if (!v || !v.trim()) { gameNotify('名字不能为空'); return; }
      childApi('/api/birth/action', { babyId, action: 'name', name: v.trim() }, '已为孩子命名。');
    }, '命名');
  }
}
// 私生子收留/拒绝
function bastardAdoptUI(childId, adopt) {
  gameConfirm(adopt ? '收留为庶子女，接入府中抚养？' : '置之不理？', () => {
    childApi('/api/child/adopt', { childId, adopt }, adopt ? '已收留为庶子女。' : '你选择了置之不理。');
  }, adopt ? '收留确认' : '拒绝确认');
}
// 未接回府子嗣弹窗按钮：接入府/置之不理/驱逐
function outcastActUI(childId, action) {
  if (action === 'adopt') {
    gameConfirm('确定将孩子接入府中安置？', () => childApi('/api/child/outcast', { childId, action: 'adopt' }, '已接入府。'));
  } else if (action === 'ignore') {
    childApi('/api/child/outcast', { childId, action: 'ignore' }, '你未予回应。');
  } else if (action === 'drive') {
    gameConfirm('确定驱逐？好感将大幅下降！', () => childApi('/api/child/outcast', { childId, action: 'drive' }, '你驱逐了对方。'), '驱逐确认');
  }
}
// 妻妾弹窗按钮
function concubineActUI(concubineId, action) {
  childApi('/api/concubine/act', { concubineId, action });
}
// 带按钮事件弹窗（需求：立绘左侧 + 剧情右侧 + 选项按钮下方）
function showActionEvent(ev) {
  if (!ev) return;
  const portrait = ev.motherPortrait || ev.childPortrait || ev.concubinePortrait || ev.playerPortrait || '';
  let html = '<div style="display:flex;gap:14px;align-items:flex-start;">';
  if (portrait) {
    html += '<div style="flex:0 0 132px;text-align:center;">'
      + '<img src="' + portrait + '" style="width:124px;height:176px;object-fit:cover;border-radius:8px;border:2px solid rgba(139,90,43,0.45);box-shadow:0 2px 10px rgba(0,0,0,0.25);" onerror="this.style.display=\'none\'">'
      + '</div>';
  }
  html += '<div style="flex:1;min-width:0;">';
  html += '<div style="color:#5c3a1e;font-size:14px;line-height:1.9;">' + escapeHtml(ev.desc || '') + '</div>';
  if (ev.lines && ev.lines.length) {
    html += '<div style="color:#8b6914;font-size:13px;line-height:1.8;margin-top:8px;">' + ev.lines.map(l => '· ' + escapeHtml(l)).join('<br>') + '</div>';
  }
  html += '</div></div>';
  if (ev.type === 'birth' && ev.babyIds && ev.babyIds.length) {
    // 需求9：主控产子先选入府安置（可取名字）/不予抚养（自动随机名）
    const b = ev.babyIds[0];
    html += '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">'
      + '<button class="btn btn-primary" onclick="birthActionUI(\'' + b + '\',\'house\')">入府安置（取名）</button>'
      + '<button class="btn" onclick="birthActionUI(\'' + b + '\',\'abandon\')">不予抚养（随机名）</button>'
      + '</div>';
  } else if (ev.type === 'bastard') {
    html += '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">'
      + '<button class="btn btn-primary" onclick="bastardAdoptUI(\'' + ev.childId + '\',true)">收留</button>'
      + '<button class="btn" onclick="bastardAdoptUI(\'' + ev.childId + '\',false)">置之不理</button>'
      + '</div>';
  } else if (ev.type === 'child_outcast') {
    html += '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">'
      + '<button class="btn btn-primary" onclick="outcastActUI(\'' + ev.childId + '\',\'adopt\')">接入府</button>'
      + '<button class="btn" onclick="outcastActUI(\'' + ev.childId + '\',\'ignore\')">置之不理</button>'
      + '<button class="btn" onclick="outcastActUI(\'' + ev.childId + '\',\'drive\')">驱逐</button>'
      + '</div>';
  } else if (ev.type === 'concubine') {
    let btns = '';
    for (const opt of (ev.options || [])) {
      btns += '<button class="btn" style="margin:4px;" onclick="concubineActUI(\'' + ev.concubineId + '\',\'' + opt.key + '\')">' + escapeHtml(opt.label) + '</button>';
    }
    if (!btns) btns = '<button class="btn btn-primary" onclick="closeModal(\'generic-modal\');clearPendingAndRender();">确定</button>';
    html += '<div style="text-align:center;margin-top:16px;">' + btns + '</div>';
  }
  showAncientModal(ev.name || '事件', html);
}
// 检查并展示待处理事件（带按钮事件单独弹窗；普通事件汇总展示）
async function checkPendingEvents() {
  if (!gameState || !gameState.pendingPlayerEvents || gameState.pendingPlayerEvents.length === 0) return;
  const pending = gameState.pendingPlayerEvents.slice();
  const actionEv = pending.find(ev => ev && ev.withActions);
  if (actionEv) { showActionEvent(actionEv); return; }
  // 先清空（避免重复弹窗），再展示
  const cleared = await api('/api/clear-pending-events', {});
  if (cleared && cleared.state) gameState = cleared.state;
  let html = '';
  for (const ev of pending) {
    if (!ev || (!ev.name && !ev.desc)) continue;
    html += '🎉 ' + ev.name + '\n' + ev.desc + '\n';
    if (ev.lines && ev.lines.length) html += ev.lines.map(l => '· ' + l).join('\n') + '\n';
    if (ev.options && ev.options.length) html += '【可抉择】' + ev.options.join('　/　') + '\n';
    html += '\n';
  }
  if (html.trim()) gameNotify(html.trim(), '事件', () => renderAll());
}

// ===== 当地人物页面 =====
function renderLocalPeople() {
  const gridDiv = document.getElementById('local-people-grid');
  const npcs = (gameState.npcs || []).filter(n => n.location === gameState.player.location && n.isAlive);

  gridDiv.innerHTML = '';
  if (npcs.length === 0) {
    gridDiv.innerHTML = '<div style="text-align:center;color:#8b6914;padding:40px;grid-column:1/-1;">此处空无一人</div>';
    return;
  }

  for (const npc of npcs) {
    const card = document.createElement('div');
    card.className = 'person-card-large';
    card.innerHTML = `
      <img src="${resolvePortrait(npc.portrait) || ''}" onerror="this.style.display='none'">
      <div class="person-name">${npc.name}</div>
      <div class="person-realm">${npc.realm}·${npc.professionName || npc.profession || '散修'}</div>
      <div class="person-loc">好感: ${npc.favorWithPlayer || 0}</div>
    `;
    card.onclick = () => showNPCDetail(npc.id);
    gridDiv.appendChild(card);
  }
}

// 关闭弹窗
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'npc-detail-modal' && gameState) {
    gameState.viewingNpcId = null;
  }
}

// 显示通用弹窗
function showAncientModal(title, content) {
  document.getElementById('ancient-modal-title').textContent = title;
  document.getElementById('ancient-modal-body').innerHTML = content;
  document.getElementById('generic-modal').classList.add('active');
}

// ===== 游戏内提示系统（替代浏览器原生 alert/confirm/prompt，全部改为游戏内弹窗）=====
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 游戏内信息弹窗（原 alert 统一转到这里）
function gameNotify(msg, title = '提示', onOk) {
  showAncientModal(title, `<div style="color:#5c3a1e;font-size:14px;line-height:1.8;max-height:320px;overflow-y:auto;white-space:pre-wrap;">${escapeHtml(msg)}</div>
  <div style="text-align:center;margin-top:16px;"><button class="btn btn-primary" onclick="closeModal('generic-modal');${onOk ? 'gameNotifyOk();' : ''}">确定</button></div>`);
  window.__gameNotifyOk = onOk || null;
}
function gameNotifyOk() {
  const f = window.__gameNotifyOk;
  window.__gameNotifyOk = null;
  if (typeof f === 'function') f();
}

// 游戏内确认弹窗（替代 confirm，回调式：onOk 在点击确定后执行）
function gameConfirm(msg, onOk, title = '确认', onCancel) {
  showAncientModal(title, `<div style="color:#5c3a1e;font-size:14px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(msg)}</div>
  <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;">
    <button class="btn btn-primary" id="game-confirm-ok">确定</button>
    <button class="btn" id="game-confirm-cancel">取消</button>
  </div>`);
  document.getElementById('game-confirm-ok').onclick = () => {
    closeModal('generic-modal');
    if (typeof onOk === 'function') onOk();
  };
  document.getElementById('game-confirm-cancel').onclick = () => {
    closeModal('generic-modal');
    if (typeof onCancel === 'function') onCancel();
  };
}

// 游戏内输入弹窗（替代 prompt，回调式：onOk 在点击确定后收到输入值）
function gamePrompt(msg, defVal, onOk, title = '输入') {
  const safeDef = escapeHtml(defVal == null ? '' : defVal);
  showAncientModal(title, `<div style="color:#5c3a1e;font-size:14px;line-height:1.8;margin-bottom:12px;">${escapeHtml(msg)}</div>
  <input id="game-prompt-input" value="${safeDef}" style="width:100%;padding:8px 10px;border:1px solid #c9a961;border-radius:6px;background:#fff8ec;color:#5c3a1e;font-size:14px;box-sizing:border-box;">
  <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
    <button class="btn btn-primary" id="game-prompt-ok">确定</button>
    <button class="btn" id="game-prompt-cancel">取消</button>
  </div>`);
  const input = document.getElementById('game-prompt-input');
  document.getElementById('game-prompt-ok').onclick = () => {
    const v = input.value;
    closeModal('generic-modal');
    if (typeof onOk === 'function') onOk(v);
  };
  document.getElementById('game-prompt-cancel').onclick = () => closeModal('generic-modal');
  input.focus();
  input.select();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('game-prompt-ok').click();
    if (e.key === 'Escape') document.getElementById('game-prompt-cancel').click();
  });
}

// 全局重定义：浏览器原生 alert → 游戏内弹窗（保留原生引用供调试）
window.__nativeAlert = window.alert;
window.alert = function (msg) {
  gameNotify(msg == null ? '' : String(msg));
};

// ===== 行动 =====
async function doCultivate() {
  const result = await api('/api/cultivate');
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  renderCultivateModal(result.event?.text || '你闭关修炼了一回。', result.event?.cultivationExp || 0);
}

// 修炼弹窗（含功法栏）：展示修为进度与功法加成，放置/卸下功法
async function renderCultivateModal(text, expGain) {
  const p = gameState.player;
  const ts = await apiGet('/api/technique/state');
  let techHtml = '<div style="margin-top:12px;padding:10px;background:rgba(139,90,43,0.06);border-radius:8px;border:1px dashed #8b5a2b;">';
  techHtml += '<div style="font-size:13px;color:#5c3a1e;font-weight:bold;margin-bottom:6px;">⚔ 功法栏 <span style="font-weight:normal;font-size:11px;color:#8b6914;">（已装功法加成生效，最多5个，点击已装功法可卸下）</span></div>';
  if (ts) {
    const b = ts.buffs || {};
    const buffParts = [];
    if (b.cultivate) buffParts.push(`修炼速度+${Math.round(b.cultivate * 100)}%`);
    if (b.attack) buffParts.push(`攻击+${Math.round(b.attack * 100)}%`);
    if (b.defense) buffParts.push(`防御+${Math.round(b.defense * 100)}%`);
    if (b.mpMax) buffParts.push(`灵力上限+${Math.round(b.mpMax * 100)}%`);
    if (b.breakthrough) buffParts.push(`突破成功率+${b.breakthrough}%`);
    const attrParts = Object.entries(b.attr || {}).map(([k, v]) => `${k}+${v}`);
    techHtml += `<div style="font-size:12px;color:#8b6914;margin-bottom:8px;">当前加成：${buffParts.concat(attrParts).join('、') || '无'}</div>`;
    techHtml += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px;">';
    const slots = ts.equipped || [];
    for (let i = 0; i < (ts.slots || 5); i++) {
      const eq = slots[i];
      techHtml += eq
        ? `<div style="padding:6px 2px;text-align:center;background:rgba(34,139,34,0.15);border:1px solid #228b22;border-radius:4px;font-size:12px;color:#228b22;cursor:pointer;" title="点击卸下" onclick="unequipTechnique('${eq.id}')">${eq.name}</div>`
        : `<div style="padding:6px 2px;text-align:center;background:rgba(139,90,43,0.05);border:1px dashed #c8a97e;border-radius:4px;font-size:11px;color:#a08868;">空</div>`;
    }
    techHtml += '</div>';
    techHtml += '<div style="text-align:center;"><button class="btn btn-small" onclick="showTechniqueEquipPanel()">放置已学功法</button></div>';
  } else {
    techHtml += '<div style="font-size:12px;color:#cd5c5c;">功法栏加载失败</div>';
  }
  techHtml += '</div>';

  let html = '<div style="line-height:1.8;font-size:14px;color:#3d2817;">';
  if (text) html += `<div style="padding:15px;background:rgba(139,90,43,0.1);border-radius:8px;margin-bottom:15px;">${text}</div>`;
  html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
    <div style="padding:8px;background:rgba(0,100,0,0.1);border-radius:4px;">修为：<b style="color:#228b22;">+${expGain}</b></div>
    <div style="padding:8px;background:rgba(0,100,0,0.1);border-radius:4px;">当前修为：<b>${p.cultivationExp}/${p.breakthroughExp}</b></div>
    <div style="padding:8px;background:rgba(139,90,43,0.1);border-radius:4px;">境界：<b>${p.realm}${p.subStage || ''}</b></div>
    <div style="padding:8px;background:rgba(139,90,43,0.1);border-radius:4px;">地点：<b>${p.location}</b></div>
  </div>`;
  html += techHtml;
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('🧘 修炼', html);
}

// 放置功法面板（已学会且未装备的）
async function showTechniqueEquipPanel() {
  const ts = await apiGet('/api/technique/state');
  if (!ts) { gameNotify('功法栏加载失败'); return; }
  const equippedIds = (ts.equipped || []).map(e => e.id);
  const candidates = (ts.learned || []).filter(t => !equippedIds.includes(t.id));
  let html = '<div style="max-height:400px;overflow-y:auto;">';
  html += '<p style="color:#8b6914;margin-bottom:10px;">选择要放入功法栏的已学功法（点击放置）：</p>';
  if (candidates.length === 0) {
    html += '<p style="color:#cd5c5c;text-align:center;padding:20px;">没有可放置的功法（需先通过学习获得功法）</p>';
  } else {
    for (const t of candidates) {
      const parts = [];
      const b = t.buff || {};
      if (b.cultivate) parts.push(`修炼+${Math.round(b.cultivate * 100)}%`);
      if (b.attack) parts.push(`攻击+${Math.round(b.attack * 100)}%`);
      if (b.defense) parts.push(`防御+${Math.round(b.defense * 100)}%`);
      if (b.mpMax) parts.push(`灵力+${Math.round(b.mpMax * 100)}%`);
      if (b.breakthrough) parts.push(`突破+${b.breakthrough}%`);
      if (b.attr) parts.push(Object.entries(b.attr).map(([k, v]) => `${k}+${v}`).join(','));
      html += `<div style="padding:10px;margin-bottom:6px;background:rgba(139,90,43,0.08);border-radius:6px;border:1px solid #8b5a2b;cursor:pointer;" onclick="equipTechnique('${t.id}')">
        <div style="display:flex;justify-content:space-between;"><b style="color:#5c3a1e;">${t.name}</b><span style="font-size:11px;color:#228b22;">${parts.join('、')}</span></div>
        <div style="font-size:12px;color:#8b6914;margin-top:2px;">${t.desc}</div>
      </div>`;
    }
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:10px;"><button class="btn btn-small" onclick="renderCultivateModal(\'\', 0)">返回修炼面板</button></div>';
  showAncientModal('放置功法', html);
}

async function equipTechnique(techId) {
  const result = await api('/api/technique/equip', { techId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  closeModal('generic-modal');
  renderCultivateModal('', 0);
}

async function unequipTechnique(techId) {
  const result = await api('/api/technique/unequip', { techId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  closeModal('generic-modal');
  renderCultivateModal('', 0);
}
// ===== 探索（随机剧情）=====
async function doExplore() {
  const result = await api('/api/explore');
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;

  // 显示探索结果弹窗
  let html = '<div style="max-height:400px;overflow-y:auto;">';
  if (result.event) {
    html += `<div style="padding:15px;background:rgba(139,90,43,0.1);border-radius:8px;margin-bottom:15px;">
      <div style="font-size:15px;color:#5c3a1e;line-height:1.8;">${result.event.text || result.event}</div>
    </div>`;
  }
  if (result.rewards) {
    html += '<h4 style="color:#228b22;margin-bottom:10px;">获得：</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">';
    for (const r of result.rewards) {
      html += `<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name" style="font-size:13px;">${r.name}</div><div class="shop-item-desc">×${r.count || 1}</div></div></div>`;
    }
    html += '</div>';
  }
  if (result.effects) {
    html += '<h4 style="color:#8b6914;margin:15px 0 10px;">效果：</h4>';
    for (const [key, val] of Object.entries(result.effects)) {
      const keyMap = { hp: '气血', mp: '灵力', cultivationExp: '修为', silver: '银两', spiritStone: '灵石', reputation: '声望' };
      html += `<p style="font-size:13px;color:#5c3a1e;">${keyMap[key] || key}: ${val > 0 ? '+' : ''}${val}</p>`;
    }
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';

  showAncientModal('探索结果', html);
  renderAll();
}
async function doRest() {
  const result = await api('/api/rest');
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const p = gameState.player;
  const hpV2 = p.hp && typeof p.hp === 'object' ? p.hp : { current: p.hp || 0, max: p.hp || 0 };
  const mpV2 = p.mp && typeof p.mp === 'object' ? p.mp : { current: p.mp || 0, max: p.mp || 0 };
  let html = '<div style="line-height:1.8;font-size:14px;color:#3d2817;">';
  html += `<div style="padding:15px;background:rgba(139,90,43,0.1);border-radius:8px;margin-bottom:15px;">你找了一处安静的地方休息，恢复了气血和灵力。</div>`;
  html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
    <div style="padding:8px;background:rgba(0,100,0,0.1);border-radius:4px;">气血：<b style="color:#228b22;">${hpV2.current}/${hpV2.max}</b></div>
    <div style="padding:8px;background:rgba(0,100,0,0.1);border-radius:4px;">灵力：<b style="color:#228b22;">${mpV2.current}/${mpV2.max}</b></div>
  </div>`;
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('😴 休息', html);
  renderAll();
}
async function doBreakthrough() {
  const result = await api('/api/breakthrough');
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const p = gameState.player;
  let html = '<div style="line-height:1.8;font-size:14px;color:#3d2817;">';
  html += `<div style="padding:10px;background:rgba(139,90,43,0.12);border-radius:8px;margin-bottom:12px;color:#8b6914;font-weight:bold;">本次突破率：${result.chance != null ? result.chance + '%' : '未知'}</div>`;
  if (result.success) {
    html += `<div style="padding:15px;background:rgba(0,100,0,0.1);border-radius:8px;margin-bottom:15px;color:#228b22;font-weight:bold;">突破成功！你已晋升至${p.realm}${p.subStage || ''}！</div>`;
  } else {
    html += `<div style="padding:15px;background:rgba(139,0,0,0.1);border-radius:8px;margin-bottom:15px;color:#8b0000;">突破失败，修为有所损耗。</div>`;
  }
  html += `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
    <div style="padding:8px;background:rgba(139,90,43,0.1);border-radius:4px;">境界：<b>${p.realm}${p.subStage || ''}</b></div>
    <div style="padding:8px;background:rgba(139,90,43,0.1);border-radius:4px;">修为：<b>${p.cultivationExp}/${p.breakthroughExp}</b></div>
  </div>`;
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('⚡ 突破', html);
  renderAll();
}

// ===== 转月转年 =====
// 显示转月/转年遮罩（期间锁定所有操作）
function showTimeTransitionOverlay(text) {
  let overlay = document.getElementById('time-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'time-transition-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,6,2,0.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;';
    overlay.innerHTML = `<div style="width:52px;height:52px;border:4px solid rgba(201,169,97,0.3);border-top-color:#c9a961;border-radius:50%;animation:tmSpin 0.9s linear infinite;"></div>
      <div id="time-transition-text" style="color:#f5e6c8;font-size:18px;letter-spacing:4px;"></div>
      <style>@keyframes tmSpin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(overlay);
  }
  document.getElementById('time-transition-text').textContent = text;
  overlay.style.display = 'flex';
}

function hideTimeTransitionOverlay() {
  const overlay = document.getElementById('time-transition-overlay');
  if (overlay) overlay.style.display = 'none';
}

async function advanceMonth() {
  showTimeTransitionOverlay('⏳ 正在转月...');
  let ok = false;
  try {
    gameState = await api('/api/time/advance-month', { viewingNpcId: gameState?.viewingNpcId });
    ok = true;
  } catch (e) {
    gameNotify('转月失败，请稍后重试');
  }
  // 遮罩最短显示 600ms，保证进度弹窗可见
  await new Promise(r => setTimeout(r, 600));
  hideTimeTransitionOverlay();
  if (ok) renderAll();
}

async function advanceYear() {
  showTimeTransitionOverlay('⏳ 正在转年...');
  let ok = false;
  const oldYear = gameState?.gameDate?.year ?? null;
  try {
    gameState = await api('/api/time/advance-year', { viewingNpcId: gameState?.viewingNpcId });
    ok = true;
  } catch (e) {
    gameNotify('转年失败，请稍后重试');
  }
  // 遮罩最短显示 1200ms（转年耗时较长，让进度弹窗可见）
  await new Promise(r => setTimeout(r, 1200));
  hideTimeTransitionOverlay();
  if (ok) {
    renderAll();
    const newYear = gameState?.gameDate?.year;
    const newText = gameState?.gameDateText || '';
    // 弹出转年结果：新日期 + 简要提示
    showAncientModal('🌄 转年完成', `<div style="text-align:center;padding:10px 0;color:#3d2817;line-height:2;">
      <div style="font-size:26px;color:#8b6914;letter-spacing:3px;">${newText}</div>
      <div style="font-size:13px;color:#8b6914;margin-top:6px;">${oldYear && newYear && newYear > oldYear ? `时光流转，从${oldYear}年进入${newYear}年，江湖又添新故事。` : '岁月如梭，江湖风云变幻。'}</div>
    </div>`);
  }
}

// ===== 背包（分门别类）=====
async function showInventory() {
  const p = gameState.player;
  const items = p.inventory || [];

  // 分类
  const categories = {
    '丹药': items.filter(i => i.name.includes('丹') || i.name.includes('药') || i.name.includes('丸') || i.name.includes('散')),
    '膳食': items.filter(i => !i.name.includes('丹') && !i.name.includes('药') && !i.name.includes('丸') && !i.name.includes('散') &&
      (i.name.includes('菜') || i.name.includes('鱼') || i.name.includes('肉') || i.name.includes('饭') || i.name.includes('汤') || i.name.includes('羹') ||
       i.name.includes('粥') || i.name.includes('面') || i.name.includes('蛋') || i.name.includes('虾') || i.name.includes('蟹') || i.name.includes('豆腐') ||
       i.name.includes('拼盘') || i.name.includes('宴') || i.name.includes('肘') || i.name.includes('鸡') || i.name.includes('鸭') || i.name.includes('牛') ||
       i.name.includes('羊') || i.name.includes('菇') || i.name.includes('笋') || i.name.includes('蔬') || i.name.includes('饼'))),
    '武器': items.filter(i => i.name.includes('剑') || i.name.includes('刀') || i.name.includes('枪') || i.name.includes('弓') || i.name.includes('杖') || i.name.includes('扇')),
    '护甲': items.filter(i => i.name.includes('甲') || i.name.includes('袍') || i.name.includes('衣') || i.name.includes('盔') || i.name.includes('靴')),
    '饰品': items.filter(i => i.name.includes('戒') || i.name.includes('珠') || i.name.includes('佩') || i.name.includes('链') || i.name.includes('镯')),
    '材料': items.filter(i => i.name.includes('草') || i.name.includes('铁') || i.name.includes('矿') || i.name.includes('晶') || i.name.includes('骨') || i.name.includes('皮') || i.name.includes('角')),
    '符箓': items.filter(i => i.name.includes('符') || i.name.includes('篆')),
    '其他': items.filter(i => !i.name.includes('丹') && !i.name.includes('药') && !i.name.includes('丸') && !i.name.includes('散') &&
      !i.name.includes('菜') && !i.name.includes('鱼') && !i.name.includes('肉') && !i.name.includes('饭') && !i.name.includes('汤') && !i.name.includes('羹') &&
      !i.name.includes('粥') && !i.name.includes('面') && !i.name.includes('蛋') && !i.name.includes('虾') && !i.name.includes('蟹') && !i.name.includes('豆腐') &&
      !i.name.includes('拼盘') && !i.name.includes('宴') && !i.name.includes('肘') && !i.name.includes('鸡') && !i.name.includes('鸭') && !i.name.includes('牛') &&
      !i.name.includes('羊') && !i.name.includes('菇') && !i.name.includes('笋') && !i.name.includes('蔬') && !i.name.includes('饼') &&
      !i.name.includes('剑') && !i.name.includes('刀') && !i.name.includes('枪') && !i.name.includes('弓') && !i.name.includes('杖') && !i.name.includes('扇') &&
      !i.name.includes('甲') && !i.name.includes('袍') && !i.name.includes('衣') && !i.name.includes('盔') && !i.name.includes('靴') &&
      !i.name.includes('戒') && !i.name.includes('珠') && !i.name.includes('佩') && !i.name.includes('链') && !i.name.includes('镯') &&
      !i.name.includes('草') && !i.name.includes('铁') && !i.name.includes('矿') && !i.name.includes('晶') && !i.name.includes('骨') && !i.name.includes('皮') && !i.name.includes('角') &&
      !i.name.includes('符') && !i.name.includes('篆')),
  };

  let html = `<p style="margin-bottom:10px;">银两: <b style="color:#b8860b;">${p.silver||0}</b> | 灵石: <b style="color:#00ced1;">${p.spiritStone||0}</b></p>`;

  for (const [cat, catItems] of Object.entries(categories)) {
    if (catItems.length > 0) {
      html += `<h4 style="color:#5c3a1e;margin:12px 0 6px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:4px;">${cat}（${catItems.length}）</h4>`;
      html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
      for (const item of catItems) {
        const isEstateItem = ['灵石矿脉', '灵田契约', '店铺地契', '洞府钥匙'].includes(item.name);
        const useBtn = (cat === '丹药' || cat === '膳食' || isEstateItem)
          ? `<button class="btn btn-small" style="margin-top:4px;font-size:11px;padding:2px 8px;" onclick="useInventoryItem('${item.name}')">${isEstateItem ? '🏠 使用' : (cat === '膳食' ? '🍽 食用' : '💊 使用')}</button>` : '';
        html += `<div class="shop-item"><div style="display:flex;align-items:center;gap:6px;flex:1;">
          ${ziyuanImg(item.name, 36)}
          <div class="shop-item-info">
            <div class="shop-item-name" style="font-size:12px;">${item.name}</div>
            <div class="shop-item-desc">×${item.count || 1}</div>
          </div>
        </div>${useBtn}</div>`;
      }
      html += '</div>';
    }
  }

  if (items.length === 0) {
    html += '<p style="text-align:center;color:#8b6914;padding:30px;">背包空空如也</p>';
  }

  // 装备栏
  const equip = p.equipment || {};
  html += '<h4 style="color:#5c3a1e;margin:12px 0 6px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:4px;">已装备</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
  html += `<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name" style="font-size:12px;">武器</div><div class="shop-item-desc">${equip.weapon || '无'}</div></div></div>`;
  html += `<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name" style="font-size:12px;">护甲</div><div class="shop-item-desc">${equip.armor || '无'}</div></div></div>`;
  html += `<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name" style="font-size:12px;">饰品</div><div class="shop-item-desc">${equip.accessory || '无'}</div></div></div>`;
  html += '</div>';

  showAncientModal('背包', html);
}

// 使用背包物品（丹药/菜品），使用后实时刷新背包与状态
async function useInventoryItem(itemName) {
  const result = await api('/api/items/use', { itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderTopBar();
  await showInventory();
  if (result.msg) gameNotify(result.msg);
}

// ===== 商店（分类显示）=====
let currentShopView = 'list';
let currentShopsData = [];
let currentShopGoods = [];

async function showShops() {
  currentShopsData = await apiGet('/api/shops');
  renderShopView('list');
}

async function renderShopView(view, shopType = null) {
  let html = '';
  if (view === 'list') {
    html = '<p style="color:#8b6914;margin-bottom:10px;">选择要进入的商店：</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">';
    for (const shop of currentShopsData) {
      html += `<div class="shop-item" style="cursor:pointer;" onclick="renderShopView('detail','${shop.type}')">
        <div class="shop-item-info">
          <div class="shop-item-name" style="font-size:15px;">${shop.name}</div>
          <div class="shop-item-desc">${shop.desc || ''}</div>
        </div>
        <span style="color:#8b5a2b;">进入 ›</span>
      </div>`;
    }
    html += '</div>';
    showAncientModal('商店', html);
  } else if (view === 'detail') {
    const shop = currentShopsData.find(s => s.type === shopType);
    if (!shop) { renderShopView('list'); return; }
    // 获取商品
    currentShopGoods = await apiGet(`/api/shop/goods?type=${shopType}`);
    html = `<button class="btn btn-small btn-back" style="margin-bottom:10px;" onclick="renderShopView('list')">‹ 返回商店列表</button>`;
    html += `<h4 style="color:#5c3a1e;margin:10px 0;">${shop.name}</h4>`;
    for (const item of currentShopGoods) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.desc || ''}（库存:${item.stock}）</div>
        </div>
        <span class="shop-item-price price-spirit">${item.currentPrice}灵石</span>
        <button class="btn btn-small" onclick="buyItem('${shopType}','${item.name}')">购买</button>
      </div>`;
    }
    if (currentShopGoods.length === 0) {
      html += '<p style="text-align:center;color:#8b6914;padding:20px;">暂无商品</p>';
    }
    showAncientModal(shop.name, html);
  }
}

async function buyItem(shopType, itemName) {
  const result = await api('/api/shop/buy', { shopType, itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderShopView('detail', shopType);
  renderAll();
}

// ===== NPC详情 =====
async function showNPCDetail(npcId) {
  const npc = await apiGet(`/api/npc/${npcId}`);
  if (npc.error) {
    // 不打断用户：在面板内友好提示（如死亡NPC已被清理）
    const modal = document.getElementById('npc-detail-modal');
    if (modal) {
      document.getElementById('npc-detail-name').textContent = npc.npcName || '未知';
      document.getElementById('npc-detail-content').innerHTML =
        `<div style="padding:40px 20px;text-align:center;color:#9c8a62;font-size:14px;">${npc.error}<br><br>` +
        `<button class="btn" onclick="closeModal('npc-detail-modal')">关闭</button></div>`;
      modal.classList.add('active');
    } else {
      gameNotify(npc.error);
    }
    return;
  }

  document.getElementById('npc-detail-name').textContent = npc.name + (npc.daoTitle ? '·' + npc.daoTitle : '');
  // 主控ID（全函数使用；历史代码曾在其后的声明点引用导致TDZ错误）
  const playerId = gameState.player && gameState.player.id;

  // 灵姬/灵郎（未赎身）专属面板：与其他NPC面板区别（无修为/属性/战斗，显示身价/赎身价/好感，操作为风月+花钱求娶赎身）
  if (npc.isWindFlower && !npc.freed) {
    renderWindFlowerDetail(npc);
    return;
  }

  let tagsHtml = '';
  if (npc.tags && npc.tags.length > 0) {
    tagsHtml = '<div class="npc-tags">';
    for (const tag of npc.tags) {
      const tagId = tag.id || tag;
      if (tagId) tagsHtml += `<span class="npc-tag" onclick="showTagDetail('${tagId}')">${getTagDisplayName(tagId)}</span>`;
    }
    tagsHtml += '</div>';
  }

  let attrsHtml = '<div class="npc-detail-attrs">';
  attrsHtml += `<div class="npc-attr-item">修为 <span>${npc.cultivationExp || 0}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">根骨 <span>${npc.attributes?.physique || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">神识 <span>${npc.attributes?.spirit || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">悟性 <span>${npc.attributes?.enlightenment || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">身法 <span>${npc.attributes?.agility || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">气运 <span>${npc.attributes?.fateLuck || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">力量 <span>${npc.attributes?.strength || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">体质 <span>${npc.attributes?.constitution || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">感知 <span>${npc.attributes?.perception || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">意志 <span>${npc.attributes?.willpower || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">魅力 <span>${npc.attributes?.charm || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">声望 <span>${npc.reputation || npc.attributes?.reputation || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">功德 <span>${npc.karma?.merit || npc.attributes?.merit || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">罪孽 <span>${npc.karma?.sin || npc.attributes?.sin || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">攻击 <span>${npc.attributes?.aggression || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">神秘 <span>${npc.attributes?.mystery || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">情欲 <span>${npc.attributes?.lust || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">纯净 <span>${npc.attributes?.purity || '-'}</span></div>`;
  attrsHtml += `<div class="npc-attr-item">性格 <span>${npc.personality || '-'}</span></div>`;
  attrsHtml += '</div>';

  // 关系网 - 默认隐藏，显示当前NPC自己的关系网
  let relationsHtml = '<div id="npc-section-relations" class="npc-section" style="display:none;">';
  relationsHtml += '<h4>👥 关系网</h4>';
  // 玩家面板：优先显示父母（血缘至亲）
  if (npc.isPlayer) {
    const fam = npc.family || {};
    const pFather = fam.father ? (gameState.npcs || []).find(n => n.id === fam.father) : null;
    const pMother = fam.mother ? (gameState.npcs || []).find(n => n.id === fam.mother) : null;
    if (pFather) relationsHtml += `<span class="relation-person" onclick="showNPCDetail('${pFather.id}')" title="血脉至亲">父亲·血脉至亲: ${pFather.name}</span>`;
    else if (fam.fatherName) relationsHtml += `<span class="relation-person" title="血脉至亲">父亲·血脉至亲: ${fam.fatherName}</span>`;
    if (pMother) relationsHtml += `<span class="relation-person" onclick="showNPCDetail('${pMother.id}')" title="血脉至亲">母亲·血脉至亲: ${pMother.name}</span>`;
    else if (fam.motherName) relationsHtml += `<span class="relation-person" title="血脉至亲">母亲·血脉至亲: ${fam.motherName}</span>`;
  }
  const npcRelations = npc.relations || {};
  const relationEntries = Object.entries(npcRelations);
  // 需求[7]：血缘至亲未在relations中时补入（任意NPC：子嗣显示父母、父母显示子女），修复"关系网显示错误/缺血缘至亲"
  {
    const famNpc = npc.family || {};
    const hasRel = rid => !!rid && relationEntries.some(([r]) => r === rid);
    const findNpc = id => (gameState.npcs || []).find(n => n.id === id);
    // 1) 父/母：优先按id，其次按name（后端family含fatherName/motherName）
    const addParent = (pid, pname, isMother) => {
      if (hasRel(pid)) return;
      const nm = pname || (pid ? (findNpc(pid) || {}).name : '') || (isMother ? '母亲' : '父亲');
      if (!pid && !pname) return;
      relationEntries.unshift([pid || ('name:' + nm), { type: isMother ? '母亲' : '父亲', favor: 50, name: nm }]);
    };
    addParent(famNpc.father, famNpc.fatherName, false);
    addParent(famNpc.mother, famNpc.motherName, true);
    // 2) 子女：遍历 children，用后端childrenInfo或前端npcs解析姓名/性别
    if (famNpc.children && famNpc.children.length > 0) {
      const infos = famNpc.childrenInfo || [];
      for (const cid of famNpc.children) {
        if (hasRel(cid)) continue;
        const ci = infos.find(x => x && x.id === cid);
        const cN = findNpc(cid);
        const nm = ci ? ci.name : (cN ? cN.name : null);
        if (!nm) continue;
        const gd = ci ? ci.gender : (cN ? cN.gender : null);
        relationEntries.unshift([cid, { type: gd === '男' ? '儿子' : '女儿', favor: 50, name: nm }]);
      }
    }
  }
  if (relationEntries.length > 0) {
    for (const [relId, relInfo] of relationEntries.slice(0, 20)) {
      // 需求[7]：关系对象可能为主控（主控不在 npcs 列表中），需解析主控
      let relNpc = gameState.npcs?.find(n => n.id === relId) || gameState.allNpcs?.find(n => n.id === relId);
      const isPlayerRel = !relNpc && gameState.player && relId === gameState.player.id;
      if (isPlayerRel) relNpc = gameState.player;
      // 兼容两种关系格式：对象 {type,favor,name} 或数字（好感值）
      let relType = (typeof relInfo === 'object' && relInfo !== null && relInfo.type) ? relInfo.type : '相识';
      // 需求[1]：称呼按性别具体化（"父/母"按主控性别；"丈夫/妻子""亲女/亲儿"按关系对象性别）
      if (isPlayerRel) {
        relType = relType.replace(/父\/母/g, gameState.player.gender === '女' ? '母' : '父').replace(/母\/父/g, gameState.player.gender === '女' ? '母' : '父');
      } else if (relNpc) {
        relType = relType.replace(/父\/母/g, relNpc.gender === '女' ? '母' : '父').replace(/母\/父/g, relNpc.gender === '女' ? '母' : '父')
          .replace(/丈夫\/妻子/g, relNpc.gender === '女' ? '丈夫' : '妻子').replace(/妻子\/丈夫/g, relNpc.gender === '女' ? '丈夫' : '妻子')
          .replace(/亲女\/亲儿/g, relNpc.gender === '女' ? '亲女' : '亲儿').replace(/亲儿\/亲女/g, relNpc.gender === '女' ? '亲女' : '亲儿');
      }
      const relName = (typeof relInfo === 'object' && relInfo !== null && relInfo.name) ? relInfo.name : (relNpc ? relNpc.name : '未知');
      const favor = (typeof relInfo === 'object' && relInfo !== null && relInfo.favor !== undefined) ? relInfo.favor : (typeof relInfo === 'number' ? relInfo : (relNpc?.favorWithPlayer || 0));
      let favorDesc = '';
      if (favor >= 80) favorDesc = '莫逆';
      else if (favor >= 60) favorDesc = '知己';
      else if (favor >= 40) favorDesc = '好友';
      else if (favor >= 20) favorDesc = '熟人';
      else if (favor >= 0) favorDesc = '泛泛';
      else favorDesc = '交恶';
      const clickable = relNpc ? `onclick="showNPCDetail('${relNpc.id}')" style="cursor:pointer;"` : '';
      relationsHtml += `<span class="relation-person" ${clickable} title="好感度: ${favor}">${relType}·${favorDesc}: ${relName}</span>`;
    }
    if (relationEntries.length > 20) {
      relationsHtml += `<span style="color:#8b6914;font-size:12px;">...等${relationEntries.length}人</span>`;
    }
  } else {
    // 如果没有relations，显示玩家已结识的NPC（仅玩家面板）
    const knownNpcs = (gameState.npcs || []).filter(n => n.knownByPlayer && n.id !== npc.id && n.isAlive);
    if (knownNpcs.length > 0) {
      for (const relNpc of knownNpcs.slice(0, 15)) {
        const favor = relNpc.favorWithPlayer || 0;
        let relDesc = '泛泛之交';
        if (favor >= 80) relDesc = '莫逆之交';
        else if (favor >= 60) relDesc = '知己好友';
        else if (favor >= 40) relDesc = '朋友';
        else if (favor >= 20) relDesc = '熟人';
        else if (favor >= 0) relDesc = '刚认识';
        else relDesc = '交恶';
        relationsHtml += `<span class="relation-person" onclick="showNPCDetail('${relNpc.id}')" title="好感度: ${favor}">${relDesc}: ${relNpc.name}</span>`;
      }
    } else {
      relationsHtml += '<p style="color:#8b6914;font-size:13px;">暂无关系记录</p>';
    }
  }
  relationsHtml += '</div>';

  // 家族 - 默认隐藏，增加子嗣/其他分类
  let familyHtml = '<div id="npc-section-family" class="npc-section" style="display:none;">';
  familyHtml += '<h4>👨‍👩‍👧‍👦 家族</h4>';
  const family = npc.family || {};
  const familyMembers = [];
  const childrenMembers = [];

  const resolveMember = (id, name) => {
    if (id) {
      const f = (gameState.npcs || []).find(n => n.id === id);
      if (f) return { npc: f };
      // 需求[7]：主控不在 npcs 列表中（如子嗣的父/母为主控时），用主控对象兜底
      if (gameState.player && id === gameState.player.id) {
        return { npc: { id: gameState.player.id, name: gameState.player.name, gender: gameState.player.gender, realm: gameState.player.realm || '凡人境', portrait: gameState.player.portrait || '', isAlive: true } };
      }
      if (name) return { nameOnly: name };
      return null;
    }
    if (name) return { nameOnly: name };
    return null;
  };
  const fmFather = resolveMember(family.father, family.fatherName);
  if (fmFather) {
    // 需求[7]：称呼按性别具体化（父亲/母亲），同人双槽去重
    familyMembers.push({ ...fmFather, relation: (fmFather.npc && fmFather.npc.gender === '女') ? '母亲' : '父亲' });
  }
  const fmMother = resolveMember(family.mother, family.motherName);
  if (fmMother) {
    const dup = fmMother.npc && fmFather && fmFather.npc && fmMother.npc.id === fmFather.npc.id;
    if (!dup) familyMembers.push({ ...fmMother, relation: (fmMother.npc && fmMother.npc.gender === '男') ? '父亲' : '母亲' });
  }
  if (family.spouse) {
    // ③ 优先用后端补全的 spouseName（spouse 可能不在当前 npcs 列表中，如不同地/已清理）
    const s = gameState.npcs?.find(n => n.id === family.spouse);
    if (s) familyMembers.push({ npc: s, relation: '配偶' });
    else if (family.spouseName) familyMembers.push({ npc: { id: family.spouse, name: family.spouseName, realm: '凡人境', isAlive: true, portrait: null }, relation: '配偶' });
  }
  if (family.children && family.children.length > 0) {
    for (const cid of family.children) {
      const c = gameState.npcs?.find(n => n.id === cid);
      // 只显示亲缘子女（父或母是本NPC），修复"非亲缘却显示为女儿/儿子"
      if (c && c.family && (c.family.father === npc.id || c.family.mother === npc.id)) {
        childrenMembers.push({ npc: c, relation: c.gender === '男' ? '儿子' : '女儿' });
      } else {
        // 需求：子嗣不在前端可见列表（异地/未认识/已故）时，用后端返回的 childrenInfo 兜底显示
        const info = (family.childrenInfo || []).find(x => x && x.id === cid);
        if (info) childrenMembers.push({ npc: info, relation: info.gender === '男' ? '儿子' : '女儿', fromInfo: true });
      }
    }
  }
  // 兄弟姐妹
  if (family.father || family.mother) {
    const siblings = (gameState.npcs || []).filter(n =>
      n.id !== npc.id && n.isAlive &&
      ((n.family?.father && n.family.father === family.father) ||
       (n.family?.mother && n.family.mother === family.mother))
    );
    for (const sib of siblings) {
      if (!familyMembers.find(fm => fm.npc && fm.npc.id === sib.id)) {
        familyMembers.push({ npc: sib, relation: sib.gender === '男' ? '兄弟' : '姐妹' });
      }
    }
  }

  // 子嗣分类
  if (childrenMembers.length > 0) {
    familyHtml += '<div style="margin-bottom:10px;"><b style="color:#8b5a2b;">子嗣</b>';
    for (const fm of childrenMembers) {
      familyHtml += `<div class="family-member" onclick="showNPCDetail('${fm.npc.id}')">
        <img src="${resolvePortrait(fm.npc.portrait) ||''}" onerror="this.style.display='none'">
        <div class="family-member-info">
          <div class="family-member-name">${fm.npc.name}</div>
          <div class="family-member-relation">${fm.relation} · ${fm.npc.realm || '凡人境'} · 扶养人：${fm.npc.guardian === (gameState.player||{}).id ? (gameState.player||{}).name : (fm.npc.guardianName || '无')}${fm.npc.isAlive ? '' : '·已故'}</div>
        </div>
      </div>`;
    }
    familyHtml += '</div>';
  }

  // 本NPC的扶养人显示（需求：扶养人属性）
  if (npc.guardian) {
    const gName = npc.guardian === (gameState.player || {}).id ? (gameState.player || {}).name : (npc.guardianName || '未知');
    familyHtml += '<div style="margin-bottom:8px;padding:6px 10px;background:rgba(139,90,43,0.06);border-radius:4px;font-size:13px;color:#5c3a1e;"><b style="color:#8b5a2b;">扶养人：</b>' + gName + '</div>';
  }

  // 其他亲属分类
  if (familyMembers.length > 0) {
    familyHtml += '<div><b style="color:#8b5a2b;">其他亲属</b>';
    for (const fm of familyMembers) {
      if (fm.npc) {
        familyHtml += `<div class="family-member" onclick="showNPCDetail('${fm.npc.id}')">
          <img src="${resolvePortrait(fm.npc.portrait) ||''}" onerror="this.style.display='none'">
          <div class="family-member-info">
            <div class="family-member-name">${fm.npc.name}</div>
            <div class="family-member-relation">${fm.relation} · ${fm.npc.realm || '凡人境'}${fm.npc.isAlive ? '' : '·已故'}</div>
          </div>
        </div>`;
      } else if (fm.nameOnly) {
        familyHtml += `<div class="family-member">
          <div class="family-member-info">
            <div class="family-member-name">${fm.nameOnly}</div>
            <div class="family-member-relation">${fm.relation}</div>
          </div>
        </div>`;
      }
    }
    familyHtml += '</div>';
  }

  if (familyMembers.length === 0 && childrenMembers.length === 0) {
    familyHtml += '<p style="color:#8b6914;font-size:13px;">暂无家族记录</p>';
  }
  familyHtml += '</div>';

  // 记事 - 默认隐藏，按日期倒序，可滑动
  let journalHtml = '<div id="npc-section-journal" class="npc-section" style="display:none;">';
  journalHtml += '<h4>📜 记事</h4>';
  journalHtml += '<div class="npc-journal-list" style="max-height:300px;overflow-y:auto;">';
  if (npc.personalHistory && npc.personalHistory.length > 0) {
    const sorted = [...npc.personalHistory].reverse();
    for (const h of sorted) {
      journalHtml += `<p style="font-size:13px;color:#5c3a1e;padding:5px 0;border-bottom:1px solid rgba(139,90,43,0.1);">· ${fixLegacyJournal(h)}</p>`;
    }
  } else {
    journalHtml += '<p style="color:#8b6914;font-size:13px;">暂无记事</p>';
  }
  journalHtml += '</div></div>';

  let warehouseHtml = '<div id="npc-section-warehouse" class="npc-section" style="display:none;"><h4>📦 库房</h4><div class="warehouse-compare">';
  warehouseHtml += '<div class="warehouse-box"><h5>我的库房（点击赠送）</h5><div class="warehouse-items">';
  for (const item of (gameState.player.inventory || [])) {
    warehouseHtml += warehouseItemHtml(item, { title: '点击赠送给对方', fn: `giftItem('${npc.id}','${item.name}')` });
  }
  warehouseHtml += '</div></div>';
  warehouseHtml += '<div class="warehouse-box"><h5>对方库房（点击索要）</h5><div class="warehouse-items">';
  if (npc.warehouse && npc.warehouse.items) {
    for (const item of npc.warehouse.items) {
      warehouseHtml += warehouseItemHtml(item, { title: '点击向对方索要', fn: `requestItem('${npc.id}','${item.name}')` });
    }
  }
  warehouseHtml += '</div></div></div></div>';
  warehouseHtml += '<p style="font-size:11px;color:#8b6914;margin-top:5px;">点击我的物品可赠送，点击对方物品可索要</p>';

  // 左侧交互按钮（竖排）
  let leftBtnsHtml = '<div class="npc-left-buttons">';

  // 判断是否是主控的妻妾
  const isSpouse = gameState.player.family?.spouse === npc.id ||
    (gameState.player.family?.wives || []).includes(npc.id);
  const hasMainSpouse = !!gameState.player.family?.spouse;
  // 需求：NPC是否已有配偶（正室/妾室/夫侍）——决定显示"偷情"还是"欢好/求娶/纳妾"
  const npcHasSpouse = !!(npc.family && (
    (npc.family.spouse && npc.family.spouse !== gameState.player.id) ||
    (npc.family.wives || []).length > 0 ||
    (npc.family.concubines || []).length > 0 ||
    npc.isConsort
  ));
  const isAdult = npc.age >= 16 && gameState.player.age >= 16;
  // 三代以内亲属：交互按钮限定为 交谈/切磋/赠礼/偷窃/战斗/欢好/传书，称呼按亲属关系
  const isCloseRel = (gameState.closeRelatives || gameState.player.closeRelatives || []).includes(npc.id);

  // 需求⑨：已亡故NPC不显示交互按钮，仅保留查看类（关系网/家族/后宅/师徒/记事/库房）
  if (npc.isAlive === false) {
    leftBtnsHtml += '<div style="color:#cd5c5c;font-size:12px;padding:8px;text-align:center;">此人已不在人世<br>仅可查看生前信息</div>';
  } else if (npc.isSameLocation) {
    leftBtnsHtml += `<button class="npc-left-btn" onclick="triggerInteractionInline('${npc.id}','chat')">💬 交谈</button>`;
    leftBtnsHtml += `<button class="npc-left-btn" onclick="triggerInteractionInline('${npc.id}','spar')">⚔ 切磋</button>`;
    leftBtnsHtml += `<button class="npc-left-btn" onclick="showGiftPanel('${npc.id}')">🎁 赠礼</button>`;
    leftBtnsHtml += `<button class="npc-left-btn" onclick="doStealFromNpc('${npc.id}')">🗡 偷窃</button>`;
    leftBtnsHtml += `<button class="npc-left-btn npc-btn-danger" onclick="startCombat('${npc.id}')">⚔ 战斗</button>`;

    // 拜师收徒按钮（三代以内亲属不显示，亲属仅保留固定七项交互）
    if (!isCloseRel) {
      const playerRealm = gameState.player.realmLevel || 0;
      const npcRealm = npc.realmLevel || 0;
      const hasMaster = !!gameState.player.masterDisciple?.master;
      const isMyDisciple = gameState.player.masterDisciple?.disciples?.some(d => d.id === npc.id);
      const isMyMaster = gameState.player.masterDisciple?.master?.id === npc.id;

      if (npcRealm > playerRealm && !hasMaster && !isMyMaster) {
        leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(75,0,130,0.1);" onclick="doRequestMaster('${npc.id}')">🙏 拜师</button>`;
      }
      if (npcRealm < playerRealm && !isMyDisciple) {
        leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(0,100,0,0.1);" onclick="doTakeDisciple('${npc.id}')">📜 收徒</button>`;
      }
      if (isMyMaster) {
        leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(75,0,130,0.15);" onclick="masterDiscipleInteract('${npc.id}','master')">👨‍🏫 请教师尊</button>`;
      }
      if (isMyDisciple) {
        leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(0,100,0,0.15);" onclick="masterDiscipleInteract('${npc.id}','disciple')">🎓 指点弟子</button>`;
      }
    }

    // 后宅相关按钮（三代以内亲属：仅保留欢好，隐藏惩罚/求娶/纳妾）
    if (isAdult) {
      if (isSpouse) {
        // 已是妻妾：欢好（不会拒绝）、惩罚（亲属不显示惩罚）
        leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(139,0,0,0.15);" onclick="doIntimacy('${npc.id}')">💕 欢好</button>`;
        if (!isCloseRel) {
          leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(139,69,19,0.15);" onclick="showPunishPanel('${npc.id}')">⛓ 惩罚</button>`;
        }
      } else {
        // 不是妻妾：已有配偶→偷情按钮（不显示求娶/纳妾）；无配偶→欢好+求娶/纳妾
        if (npcHasSpouse) {
          leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(139,0,0,0.15);" onclick="doStealLove('${npc.id}')">🔞 偷情</button>`;
        } else {
          leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(139,0,0,0.1);" onclick="doIntimacy('${npc.id}')">💕 欢好</button>`;
          if (!isCloseRel) {
            if (!hasMainSpouse) {
              leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(220,20,60,0.1);" onclick="doMarry('${npc.id}')">💍 求娶</button>`;
            }
            leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(220,20,60,0.08);" onclick="showConcubinePanel('${npc.id}')">🏮 纳妾</button>`;
          }
        }
      }
    }
  } else {
    leftBtnsHtml += `<div style="color:#cd5c5c;font-size:12px;padding:8px;text-align:center;">此人在${npc.location}<br>不在此地</div>`;
  }
  // 召回：配偶/妾室/宾客可召回至主控所在宅子（亡故者不可）
  const isGuest = npc.invitedByPlayer === (gameState.player && gameState.player.id);
  if (npc.isAlive !== false && (isSpouse || isGuest)) {
    leftBtnsHtml += `<button class="npc-left-btn" style="background:rgba(34,139,34,0.15);" onclick="doRecallNpc('${npc.id}')">🏠 召回</button>`;
  }
  if (npc.isAlive !== false) {
    leftBtnsHtml += `<button class="npc-left-btn" onclick="showLetterModal('${npc.id}')">✉ 传书</button>`;
  }
  leftBtnsHtml += '<div style="height:1px;background:rgba(139,90,43,0.2);margin:8px 0;"></div>';
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="toggleNpcSection('relations')">👥 关系网</button>`;
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="toggleNpcSection('family')">👨‍👩‍👧‍👦 家族</button>`;
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="showHarem('${npc.id}')">🏯 后宅</button>`;
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="showNpcMasterDisciple('${npc.id}')">🎓 师徒</button>`;
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="toggleNpcSection('journal')">📜 记事</button>`;
  leftBtnsHtml += `<button class="npc-left-btn npc-btn-sub" onclick="toggleNpcSection('warehouse')">📦 库房</button>`;
  leftBtnsHtml += '</div>';

  // 右侧立绘+属性
  let rightHtml = '<div class="npc-right-panel">';
  rightHtml += `<div class="npc-right-portrait"><img src="${resolvePortrait(npc.portrait) || ''}" onerror="this.style.display='none'"></div>`;
  rightHtml += `<button class="btn btn-small" style="margin:5px auto;display:block;" onclick="randomizePortrait('${npc.id}')">🎲 随机立绘</button>`;
  rightHtml += `<div class="npc-right-name">${npc.name}${npc.daoTitle ? '·' + npc.daoTitle : ''}</div>`;
  rightHtml += `<div class="npc-right-meta">${npc.gender} · ${npc.race} · ${npc.age}岁<br>${npc.realm}${npc.subStage || ''}</div>`;
  // 与玩家的关系：血缘推断优先（更准确，且按主控性别显示儿子/女儿），其次读 relations
  let relTypeStr = '';
  if (playerId && npc.family) {
    if (npc.family.father === playerId || npc.family.mother === playerId) {
      // NPC是主控的子嗣 → 显示"父/母"（按主控性别）
      relTypeStr = gameState.player.gender === '女' ? '母' : '父';
    } else if (gameState.player.family && (gameState.player.family.father === npc.id || gameState.player.family.mother === npc.id)) {
      // NPC是主控的父母 → 显示"儿子/女儿"（按主控性别，不能用NPC性别）
      relTypeStr = gameState.player.gender === '男' ? '儿子' : '女儿';
    }
  }
  if (!relTypeStr) {
    const relToPlayer = npc.relations && playerId ? npc.relations[playerId] : null;
    relTypeStr = relToPlayer && typeof relToPlayer === 'object' ? (relToPlayer.type || '') : '';
  }
  // 需求[1]：称呼按性别具体化（子嗣对主控的"父/母"按主控性别显示）
  if (relTypeStr && relTypeStr.includes('父/母') && gameState.player) {
    relTypeStr = gameState.player.gender === '女' ? '母' : '父';
  }
  if (relTypeStr) {
    rightHtml += `<div style="color:#c0392b;font-size:13px;margin-top:4px;">与你：<b>${relTypeStr}</b></div>`;
  }
  if (npc.relToPlayer) {
    rightHtml += `<div style="color:#b8860b;font-size:13px;margin-top:4px;">亲属称呼：<b>${npc.relToPlayer}</b></div>`;
  }
  rightHtml += `<div class="npc-right-info">身份: ${npc.identity || (npc.realmLevel >= 2 ? '修仙者' : '平民')}<br>职业: ${npc.professionName || npc.profession || '无'}<br>所属势力: ${npc.faction || '无'}<br>所在地: ${npc.location}<br>好感度: <b id="npc-detail-favor" style="color:${npc.favorWithPlayer >= 50 ? '#228b22' : npc.favorWithPlayer >= 0 ? '#b8860b' : '#cd5c5c'}">${npc.favorWithPlayer}</b>${npc.gender === '女' ? `<br>孕期: <b style="color:${npc.isPregnant ? '#cd5c5c' : '#888'}">${npc.isPregnant ? `已有身孕${npc.pregnancyMonths || 0}月` : '未孕'}</b>` : ''}</div>`;
  rightHtml += tagsHtml;
  rightHtml += attrsHtml;
  rightHtml += '</div>';

  // 中间内容区
  let centerHtml = '<div class="npc-center-panel">';
  centerHtml += '<div id="interaction-result-area"></div>';
  centerHtml += relationsHtml;
  centerHtml += familyHtml;
  centerHtml += journalHtml;
  centerHtml += warehouseHtml;
  centerHtml += '</div>';

  document.getElementById('npc-detail-content').innerHTML = `
    <div class="npc-detail-layout">
      ${leftBtnsHtml}
      ${centerHtml}
      ${rightHtml}
    </div>
  `;

  document.getElementById('npc-detail-modal').classList.add('active');
  // 设置正在查看的NPC ID，转月时该NPC不移动
  if (gameState) gameState.viewingNpcId = npcId;
}

// 灵姬/灵郎专属面板（与其他NPC面板区别：不显示修为/属性/战斗，显示容貌/身价/赎身价/好感，操作为风月互动+花钱求娶/赎身）
function renderWindFlowerDetail(npc) {
  const content = document.getElementById('npc-detail-content');
  let html = '<div style="display:flex;gap:14px;margin-bottom:12px;">';
  html += `<div style="flex:0 0 104px;"><img src="${resolvePortrait(npc.portrait) || ''}" onerror="this.style.display='none'" style="width:100%;border-radius:8px;border:1px solid rgba(201,169,97,0.4);"></div>`;
  html += `<div style="flex:1;font-size:13px;line-height:1.9;color:#5c3a1e;">`;
  html += `<div style="font-size:16px;font-weight:bold;color:#8b5a2b;">${npc.gender === '女' ? '🌸 灵姬' : '💮 灵郎'} · ${npc.name}</div>`;
  html += `<div>容貌：<b>${npc.appearanceLabel || '清丽脱俗'}</b> ${'★'.repeat(Math.max(1, npc.popularity || 1))}</div>`;
  html += `<div>年龄：${npc.age}岁 · ${npc.location}</div>`;
  html += `<div>身价：<b style="color:#8b5a2b;">${npc.cost} 银两/次</b>　赎身价：<b style="color:#8b5a2b;">${npc.redeemPrice} 银两</b></div>`;
  html += `<div>好感：<b style="color:${npc.favor >= 50 ? '#228b22' : '#c0a060'};">${npc.favor}/100</b>（≥50方可求娶/赎身）</div>`;
  html += `<div style="color:#8b6914;font-size:12px;margin-top:4px;">风月场中见惯世面之人，谈吐风情、手段娴熟，比寻常人家更懂温存。</div>`;
  html += '</div></div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;">';
  html += `<button class="btn btn-small" onclick="closeModal('npc-detail-modal');windFlowerAction('${npc.id}','chat')">💬 谈情说爱</button>`;
  html += `<button class="btn btn-small" onclick="closeModal('npc-detail-modal');windFlowerAction('${npc.id}','spring')">🌙 春宵一度</button>`;
  html += `<button class="btn btn-small" onclick="closeModal('npc-detail-modal');windFlowerGift('${npc.id}')">🎁 赠礼</button>`;
  html += `<button class="btn btn-small" onclick="closeModal('npc-detail-modal');windFlowerNotes('${npc.id}')">📜 记事</button>`;
  html += `<button class="btn btn-small" onclick="closeModal('npc-detail-modal');windFlowerAction('${npc.id}','children')">👶 子嗣</button>`;
  html += `<button class="btn btn-small" style="background:rgba(255,138,158,0.22);border-color:#e07a8a;color:#b05466;" onclick="closeModal('npc-detail-modal');windFlowerMarry('${npc.id}')">💍 求娶纳妾（${npc.redeemPrice}两）</button>`;
  html += `<button class="btn btn-small" style="background:rgba(126,200,255,0.22);border-color:#6aa8d8;color:#3d6a92;" onclick="closeModal('npc-detail-modal');windFlowerFree('${npc.id}')">🕊 赎身（${npc.redeemPrice}两）</button>`;
  html += '</div>';
  const notes = (npc.personalHistory || []).slice(-5).reverse();
  if (notes.length > 0) {
    html += '<div style="border-top:1px solid rgba(139,90,43,0.2);padding-top:10px;font-size:12px;color:#8b6914;max-height:130px;overflow-y:auto;">';
    html += '<b style="color:#5c3a1e;">近事：</b>';
    for (const nt of notes) html += `<div style="margin:3px 0;">· ${nt}</div>`;
    html += '</div>';
  }
  html += `<div style="text-align:center;margin-top:12px;"><button class="btn" onclick="closeModal('npc-detail-modal')">关闭</button></div>`;
  content.innerHTML = html;
  document.getElementById('npc-detail-modal').classList.add('active');
  if (gameState) gameState.viewingNpcId = npc.id;
}

// 记事中点击NPC姓名（前端列表找不到时，按名字向后端兜底查询，死亡/已清理NPC也能显示友好面板）
async function showNPCDetailByName(npcName) {
  if (!npcName) return;
  const npc = await apiGet(`/api/npc/__by_name__?name=${encodeURIComponent(npcName)}`);
  if (npc.error || !npc.id) {
    const modal = document.getElementById('npc-detail-modal');
    if (modal) {
      document.getElementById('npc-detail-name').textContent = npcName;
      document.getElementById('npc-detail-content').innerHTML =
        `<div style="padding:40px 20px;text-align:center;color:#9c8a62;font-size:14px;">${npc.error || '该NPC不存在'}<br><br>` +
        `<button class="btn" onclick="closeModal('npc-detail-modal')">关闭</button></div>`;
      modal.classList.add('active');
    }
    return;
  }
  showNPCDetail(npc.id);
}

// 赠礼面板 - 显示可赠送物品和NPC喜恶
function showGiftPanel(npcId) {
  const npc = gameState.npcs?.find(n => n.id === npcId);
  if (!npc) return;
  const player = gameState.player;

  let html = '<div style="max-height:400px;overflow-y:auto;">';

  // NPC喜恶
  html += '<div style="margin-bottom:15px;padding:10px;background:rgba(139,90,43,0.05);border-radius:6px;">';
  html += '<b style="color:#8b5a2b;">喜好：</b>';
  if (npc.likes && npc.likes.length > 0) {
    html += npc.likes.map(l => `<span style="color:#228b22;margin:0 5px;">${l}</span>`).join('');
  } else {
    html += '<span style="color:#555;">未知</span>';
  }
  html += '<br><b style="color:#8b5a2b;">厌恶：</b>';
  if (npc.dislikes && npc.dislikes.length > 0) {
    html += npc.dislikes.map(d => `<span style="color:#cd5c5c;margin:0 5px;">${d}</span>`).join('');
  } else {
    html += '<span style="color:#555;">未知</span>';
  }
  html += '</div>';

  // 可赠送物品
  html += '<h4 style="color:#8b5a2b;margin-bottom:10px;">选择要赠送的物品：</h4>';
  if (player.inventory && player.inventory.length > 0) {
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    for (const item of player.inventory) {
      let itemClass = 'gift-item-neutral';
      let hint = '无感';
      if (npc.likes && npc.likes.includes(item.name)) {
        itemClass = 'gift-item-like';
        hint = '喜欢';
      } else if (npc.dislikes && npc.dislikes.includes(item.name)) {
        itemClass = 'gift-item-dislike';
        hint = '厌恶';
      }
      html += `<div class="${itemClass}" onclick="giftItem('${npcId}','${item.name}')" style="padding:8px;border:1px solid #8b5a2b;border-radius:4px;cursor:pointer;text-align:center;font-size:12px;">
        ${item.name}×${item.count || 1}<br><span style="font-size:10px;">${hint}</span>
      </div>`;
    }
    html += '</div>';
  } else {
    html += '<p style="color:#555;">你没有可赠送的物品</p>';
  }
  html += '</div>';

  document.getElementById('ancient-modal-title').textContent = `🎁 赠礼给${npc.name}`;
  document.getElementById('ancient-modal-body').innerHTML = html;
  document.getElementById('generic-modal').classList.add('active');
}

// 索要/赠送物品
async function requestItem(npcId, itemName) {
  gameState = await api('/api/interact', { npcId, action: 'request_item', itemName });
  if (gameState.error) gameNotify(gameState.error);
  else gameNotify('索要请求已发送');
  renderAll();
  showNPCDetail(npcId);
}

async function giftItem(npcId, itemName) {
  const result = await api('/api/interact', { npcId, action: 'gift_item', itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  gameNotify(`赠送成功！${result.reaction || ''}，好感度${result.favorChange >= 0 ? '+' : ''}${result.favorChange || 0}`, '提示', () => { showNPCDetail(npcId); });
  renderAll();
}

// ===== 师徒系统前端 =====
function showNpcMasterDisciple(npcId) {
  const npc = gameState.npcs?.find(n => n.id === npcId);
  if (!npc) return;
  const md = npc.masterDisciple || { master: null, disciples: [] };
  let html = '<div style="max-height:400px;overflow-y:auto;">';
  // 师尊
  html += '<h4 style="color:#8b6914;margin-bottom:10px;">👨‍🏫 师尊</h4>';
  if (md.master) {
    html += `<div style="padding:10px;margin-bottom:10px;background:rgba(75,0,130,0.1);border-radius:6px;cursor:pointer;" onclick="closeModal('generic-modal');showNPCDetail('${md.master.id}')">
      <b style="color:#5c3a1e;">${md.master.name}</b>
      <span style="color:#8b6914;font-size:12px;margin-left:8px;">${md.master.realm || ''}</span>
    </div>`;
  } else {
    html += '<p style="color:#555;font-size:13px;padding:10px;">无</p>';
  }
  // 徒弟
  html += `<h4 style="color:#8b6914;margin:15px 0 10px;">🎓 弟子(${md.disciples?.length || 0})</h4>`;
  if (md.disciples && md.disciples.length > 0) {
    for (const d of md.disciples) {
      html += `<div style="padding:8px 10px;margin-bottom:6px;background:rgba(0,100,0,0.1);border-radius:6px;cursor:pointer;display:flex;justify-content:space-between;" onclick="closeModal('generic-modal');showNPCDetail('${d.id}')">
        <span><b style="color:#5c3a1e;">${d.name}</b></span>
        <span style="color:#8b6914;font-size:12px;">${d.realm || ''}</span>
      </div>`;
    }
  } else {
    html += '<p style="color:#555;font-size:13px;padding:10px;">无</p>';
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal('🎓 师徒关系', html);
}

async function doRequestMaster(npcId) {
  const result = await api('/api/master-disciple/request', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const npc = gameState.npcs?.find(n => n.id === npcId);
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;white-space:pre-line;">${result.text}</div>`;
  if (result.success) {
    html += '<div style="margin-top:10px;color:#228b22;font-weight:bold;">拜师成功！</div>';
  } else {
    html += '<div style="margin-top:10px;color:#cd5c5c;font-weight:bold;">拜师失败</div>';
  }
  if (result.effects) {
    html += '<div style="margin-top:10px;"><b>效果：</b>';
    const effectNames = { favor: '好感', cultivationExp: '修为', reputation: '声望', enlightenment: '悟性', spirit: '神识', silver: '银两', willpower: '意志' };
    for (const [k, v] of Object.entries(result.effects)) {
      html += `<span style="margin-right:10px;color:${v >= 0 ? '#228b22' : '#cd5c5c'};">${effectNames[k] || k}: ${v > 0 ? '+' : ''}${v}</span>`;
    }
    html += '</div>';
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('🙏 拜师', html);
  renderAll();
}

async function doTakeDisciple(npcId) {
  const result = await api('/api/master-disciple/take', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const npc = gameState.npcs?.find(n => n.id === npcId);
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.success) {
    html += '<div style="margin-top:10px;color:#228b22;font-weight:bold;">收徒成功！</div>';
  } else {
    html += '<div style="margin-top:10px;color:#cd5c5c;font-weight:bold;">收徒失败</div>';
  }
  if (result.effects) {
    html += '<div style="margin-top:10px;"><b>效果：</b>';
    const effectNames = { favor: '好感', cultivationExp: '修为', reputation: '声望', enlightenment: '悟性', spirit: '神识', silver: '银两', willpower: '意志' };
    for (const [k, v] of Object.entries(result.effects)) {
      html += `<span style="margin-right:10px;color:${v >= 0 ? '#228b22' : '#cd5c5c'};">${effectNames[k] || k}: ${v > 0 ? '+' : ''}${v}</span>`;
    }
    html += '</div>';
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('📜 收徒', html);
  renderAll();
}

async function masterDiscipleInteract(npcId, type) {
  const result = await api('/api/master-disciple/interact', { npcId, type });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.effects) {
    html += '<div style="margin-top:10px;"><b>效果：</b>';
    const effectNames = { favor: '好感', cultivationExp: '修为', reputation: '声望', enlightenment: '悟性', spirit: '神识', silver: '银两', willpower: '意志', spiritStone: '灵石' };
    for (const [k, v] of Object.entries(result.effects)) {
      html += `<span style="margin-right:10px;color:${v >= 0 ? '#228b22' : '#cd5c5c'};">${effectNames[k] || k}: ${v > 0 ? '+' : ''}${v}</span>`;
    }
    html += '</div>';
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal(type === 'master' ? '👨‍🏫 请教师尊' : '🎓 指点弟子', html);
  renderAll();
}

// ===== 后宅系统前端 =====
async function doIntimacy(npcId) {
  const result = await api('/api/harem/intimacy', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const npc = gameState.npcs?.find(n => n.id === npcId);
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.pregnancy) {
    html += `<div style="margin-top:10px;padding:8px;background:rgba(220,20,60,0.1);border-radius:4px;color:#dc143c;">🌸 ${npc?.name || '对方'}有了身孕！</div>`;
  }
  html += `<div style="margin-top:10px;color:#8b6914;">好感度变化：${result.favorChange >= 0 ? '+' : ''}${result.favorChange || 0}</div>`;
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\');showNPCDetail(\''+npcId+'\')">确定</button></div>';
  showAncientModal('💕 欢好', html);
  renderAll();
}

// 偷情（对已有配偶的NPC）：按好感/修为生成同意/半推半就/被强迫/被迷晕/被拒剧情
async function doStealLove(npcId) {
  const npcNow = (gameState.npcs || []).find(n => n.id === npcId);
  gameConfirm(`与已有配偶的${npcNow?.name || '对方'}暗中相会，一旦败露后患无穷，确定要偷情吗？`, async () => {
    const result = await api('/api/harem/steal-love', { npcId });
    if (result.error) { gameNotify(result.error); return; }
    if (result.state) gameState = result.state;
    let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
    if (result.pregnancy) {
      html += `<div style="margin-top:10px;padding:8px;background:rgba(220,20,60,0.1);border-radius:4px;color:#dc143c;">🌸 ${npcNow?.name || '对方'}有了身孕！</div>`;
    }
    if (result.exposed) {
      html += `<div style="margin-top:10px;padding:8px;background:rgba(178,34,34,0.1);border-radius:4px;color:#b22222;">⚠️ 事情败露了！${result.husbandName || '对方配偶'}撞破了此事，闹得人尽皆知。</div>`;
    }
    html += `<div style="margin-top:10px;color:#8b6914;">好感度变化：${result.favorChange >= 0 ? '+' : ''}${result.favorChange || 0}</div>`;
    html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\');showNPCDetail(\''+npcId+'\')">确定</button></div>';
    showAncientModal('🔞 偷情', html);
    renderAll();
  }, '偷情确认');
}

async function doMarry(npcId) {
  const result = await api('/api/harem/marry', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.success) {
    html += `<div style="margin-top:10px;color:#228b22;">求娶成功！好感度+${result.favorChange}</div>`;
  } else {
    html += `<div style="margin-top:10px;color:#cd5c5c;">求娶失败，好感度${result.favorChange}</div>`;
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\');showNPCDetail(\''+npcId+'\')">确定</button></div>';
  showAncientModal('💍 求娶', html);
  renderAll();
}

async function showConcubinePanel(npcId) {
  const ranks = await apiGet('/api/harem/ranks');
  const npc = gameState.npcs?.find(n => n.id === npcId);
  let html = `<div style="max-height:400px;overflow-y:auto;">`;
  html += `<p style="color:#5c3a1e;margin-bottom:10px;">选择要将${npc?.name}纳为何等位分：</p>`;
  for (const rank of ranks) {
    if (rank.rank === 1) continue; // 正妻不能通过纳妾获得
    html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b5a2b;" onclick="doTakeConcubine('${npcId}',${rank.rank})">
      <b style="color:#8b5a2b;">${rank.name}</b>（上限${rank.limit}人）<br>
      <span style="font-size:12px;color:#8b6914;">${rank.desc}</span>
    </div>`;
  }
  html += '</div>';
  showAncientModal('🏮 选择位分', html);
}

async function doTakeConcubine(npcId, rank) {
  const result = await api('/api/harem/concubine', { npcId, rank });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.success) {
    html += `<div style="margin-top:10px;color:#228b22;">纳妾成功！好感度+${result.favorChange}</div>`;
  } else {
    html += `<div style="margin-top:10px;color:#cd5c5c;">纳妾失败，好感度${result.favorChange}</div>`;
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\');showNPCDetail(\''+npcId+'\')">确定</button></div>';
  showAncientModal('🏮 纳妾', html);
  renderAll();
}

async function showPunishPanel(npcId) {
  const ranks = await apiGet('/api/harem/ranks');
  const npc = gameState.npcs?.find(n => n.id === npcId);
  const currentRank = npc?.concubineRank || 1;
  let html = `<div style="max-height:400px;overflow-y:auto;">`;
  html += `<p style="color:#5c3a1e;margin-bottom:10px;">选择对${npc?.name}的惩罚方式：</p>`;

  // 降位分
  html += '<h4 style="color:#8b5a2b;margin:10px 0;">降位分</h4>';
  for (const rank of ranks) {
    if (rank.rank <= currentRank) continue; // 只能降到更低的位分
    html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,0,0,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b0000;" onclick="doPunish('${npcId}','demote',${rank.rank})">
      降为<b style="color:#8b0000;">${rank.name}</b>
    </div>`;
  }

  // 其他惩罚
  html += '<h4 style="color:#8b5a2b;margin:10px 0;">其他惩罚</h4>';
  html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,69,19,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b4513;" onclick="doPunish('${npcId}','kneel')">
    罚跪
  </div>`;
  html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,69,19,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b4513;" onclick="doPunish('${npcId}','scold')">
    训斥
  </div>`;
  html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,69,19,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b4513;" onclick="doPunish('${npcId}','forbid')">
    禁足
  </div>`;
  html += '</div>';
  showAncientModal('⛓ 惩罚', html);
}

async function doPunish(npcId, punishType, newRank = null) {
  const result = await api('/api/harem/punish', { npcId, punishType, newRank });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  html += `<div style="margin-top:10px;color:#cd5c5c;">好感度${result.favorChange}</div>`;
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\');showNPCDetail(\''+npcId+'\')">确定</button></div>';
  showAncientModal('⛓ 惩罚结果', html);
  renderAll();
}

// ===== 打工系统 =====
async function buildWorkHtml() {
  const professions = await apiGet('/api/work/professions');
  const state = await apiGet('/api/work/state');
  let html = '<div style="max-height:560px;">';

  // 当前职业状态
  if (state) {
    const cur = state.current;
    html += '<div style="padding:12px;margin-bottom:12px;background:rgba(34,139,34,0.08);border-radius:8px;border:1px solid #228b22;">';
    html += '<div style="font-size:14px;font-weight:bold;color:#1a1a1a;margin-bottom:4px;">当前凡人职业：';
    html += cur ? `<b style="color:#228b22;">${cur.name}</b>`
      : '<b style="color:#555;">未选择（凡人职业同一时间只能选一种）</b>';
    html += '</div>';
    if (cur) {
      const info = state.mortalProfessions[cur.id];
      if (info) {
        html += `<div style="font-size:12px;color:#4a3a00;">阶段：${info.stageName}（${info.stage}/5）｜职业经验：${info.exp}${info.nextExp ? ` / 下一阶段需${info.nextExp}` : '（已满级）'}｜收益倍率：×${info.stageMult}</div>`;
      }
      html += `<div style="margin-top:6px;"><button class="btn btn-small" onclick="quitProfession()">离职（经验保留）</button></div>`;
    }
    if (state.cultivation && state.cultivation.length > 0) {
      html += `<div style="font-size:12px;color:#4a3a00;margin-top:6px;">已获得的修仙职业（可多职业，不冲突）：<b style="color:#228b22;">${state.cultivation.join('、')}</b></div>`;
    }
    html += `<details style="margin-top:8px;font-size:12px;color:#1a1a1a;background:rgba(255,255,255,0.92);border-radius:6px;padding:6px 8px;">
      <summary style="cursor:pointer;color:#4a3a00;font-weight:bold;">📖 其他修仙职业的获得方式（满足条件自动获得）</summary>
      <div style="margin-top:6px;line-height:1.9;">
        炼丹学徒｜开始学习炼丹<br>
        炼丹师｜学会任一炼丹配方<br>
        丹修｜炼丹成功累计10次<br>
        炼器学徒｜开始学习炼器<br>
        炼器师｜学会任一炼器配方<br>
        阵法师｜学会任一阵法<br>
        符师｜学会任意符箓绘制<br>
        符修｜制符成功累计5次<br>
        剑修｜学会剑诀<br>
        体修｜根骨达到80<br>
        兽修｜拥有1只灵宠<br>
        冒险者｜探索累计10次<br>
        赏金猎人｜完成任务累计5个<br>
        宗门弟子｜加入任一宗门<br>
        宗门长老｜宗门职位达长老（贡献≥15000）<br>
        坊市掌柜｜背包持有店铺地契<br>
        魔修｜身处魔域深渊/血煞平原/枯骨荒原，或持有魔功秘籍
      </div>
    </details>`;
    html += '</div>';
  }

  html += '<p style="color:#4a3a00;font-weight:bold;margin-bottom:10px;">选择要从事的工作（打工消耗1回合行动点）：</p>';

  if (!professions || professions.length === 0) {
    html += '<p style="color:#cd5c5c;text-align:center;padding:20px;">当前没有可从事的职业，请提升属性或前往其他地点</p>';
  } else {
    const mortal = professions.filter(p => p.category === '凡人界');
    const cult = professions.filter(p => p.category === '修仙界');
    // 当前选择的职业置顶显示
    if (state?.current?.id) {
      mortal.sort((a, b) => (a.id === state.current.id ? -1 : (b.id === state.current.id ? 1 : 0)));
    }
    html += '<div class="work-two-col">';
    // 左栏：凡人界工作区
    html += '<div class="work-col"><div class="work-col-title">🧱 凡人界工作区</div>';
    if (mortal.length > 0) {
      for (const prof of mortal) {
        const st = state?.mortalProfessions?.[prof.id];
        const isCurrent = state?.current?.id === prof.id;
        html += `<div style="padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.92);border-radius:6px;border:1px solid ${isCurrent ? '#228b22' : '#8b5a2b'};">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#1a1a1a;font-size:14px;">${prof.name}${isCurrent ? ' <span style="color:#228b22;font-size:12px;">（当前）</span>' : ''}</b>
            <span style="font-size:11px;color:#4a3a00;font-weight:bold;background:rgba(255,255,255,0.95);padding:2px 8px;border-radius:10px;">${prof.category}</span>
          </div>
          <div style="color:#4a3a00;font-size:12px;margin-top:4px;">${prof.desc}</div>
          <div style="color:#555555;font-size:11px;margin-top:2px;">${st ? `职业经验 ${st.exp}｜阶段 ${st.stageName}｜收益×${st.stageMult}` : '尚未从事过（选择后每次工作获得职业经验，阶段越高收获越多）'}</div>
          <div style="margin-top:6px;display:flex;gap:6px;">
            ${isCurrent
              ? `<button class="btn btn-small" onclick="doWork('${prof.id}')">工作</button><button class="btn btn-small" onclick="quitProfession()">离职</button>`
              : `<button class="btn btn-small" onclick="selectProfession('${prof.id}')">选择职业</button>`}
          </div>
        </div>`;
      }
    } else {
      html += '<div class="work-col-empty">当前没有可从事的凡人界职业</div>';
    }
    html += '</div>';
    // 右栏：修仙界工作区
    html += '<div class="work-col"><div class="work-col-title">✨ 修仙界工作区</div>';
    // 需求：已获得的修仙职业显示在下方工作栏中（作为工作项，可直接工作）
    if (state?.cultivation && state.cultivation.length > 0) {
      html += '<div style="font-size:12px;color:#228b22;font-weight:bold;margin:2px 0 6px;">🎖️ 已获得的修仙职业（可直接工作）</div>';
      for (const c of state.cultivation) {
        html += `<div style="padding:10px;margin-bottom:8px;background:rgba(34,139,34,0.08);border-radius:6px;border:1px solid rgba(34,139,34,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#228b22;font-size:14px;">${c} ✓</b>
            <span style="font-size:11px;color:#228b22;background:rgba(34,139,34,0.12);padding:2px 8px;border-radius:10px;">已获得修仙职业</span>
          </div>
          <div style="color:#4a3a00;font-size:12px;margin-top:4px;">以此身份接取修仙界事务，赚取灵石与职业经验。</div>
          <div style="margin-top:6px;"><button class="btn btn-small" onclick="doCultivationWork('${c}')">工作</button></div>
        </div>`;
      }
    }
    if (cult.length > 0) {
      for (const prof of cult) {
        html += `<div style="padding:10px;margin-bottom:8px;background:rgba(255,255,255,0.92);border-radius:6px;border:1px solid #999999;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <b style="color:#1a1a1a;font-size:14px;">${prof.name}</b>
            <span style="font-size:11px;color:#4a3a00;font-weight:bold;background:rgba(255,255,255,0.95);padding:2px 8px;border-radius:10px;">${prof.category}</span>
          </div>
          <div style="color:#4a3a00;font-size:12px;margin-top:4px;">${prof.desc}</div>
          <div style="margin-top:6px;"><button class="btn btn-small" onclick="doWork('${prof.id}')">工作</button></div>
        </div>`;
      }
    } else {
      html += '<div class="work-col-empty">当前没有可从事的修仙界工作</div>';
    }
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// 工作与职业弹窗（保留入口）
async function showWorkPanel() {
  const html = await buildWorkHtml();
  showAncientModal('💼 工作与职业', html);
}

// 工作地图页面（需求：角色页工作按钮 → 新地图界面，工作与职业内容搬入）
function openWorkMap() { switchPage('work'); }

async function renderWorkPage() {
  const el = document.getElementById('work-map-content');
  if (!el) return;
  el.innerHTML = '<p style="text-align:center;color:#4a3a00;padding:30px;">加载中…</p>';
  try {
    const html = await buildWorkHtml();
    el.innerHTML = html.replace('<div style="max-height:560px;">', '<div>');
  } catch (e) { el.innerHTML = '<p style="color:#cd5c5c;text-align:center;padding:30px;">工作面板加载失败，请刷新重试</p>'; }
}

async function selectProfession(professionId) {
  const result = await api('/api/work/select', { professionId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { renderWorkPage(); renderAll(); });
}

async function quitProfession() {
  const result = await api('/api/work/quit', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { renderWorkPage(); renderAll(); });
}

async function doWork(professionId) {
  const result = await api('/api/work/do', { professionId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.category === '凡人界' && result.stage) {
    html += `<div style="margin-top:8px;padding:8px;background:rgba(34,139,34,0.08);border-radius:6px;font-size:13px;color:#228b22;">当前阶段：${result.stage}</div>`;
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('💼 打工结果', html);
  renderAll();
}

// 修仙界已获得职业的工作（需求8：点击直接工作，不弹确认框）
async function doCultivationWork(professionName) {
  const result = await api('/api/work/cultivation', { profession: professionName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.rewards && result.rewards.length) {
    html += `<div style="margin-top:8px;color:#228b22;font-size:13px;">获得：${result.rewards.join('、')}</div>`;
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('💼 工作结果', html);
  renderAll();
}

// ===== 宅子邀请系统 =====
async function showInvitePanel() {
  const p = gameState.player;
  const knownNpcs = (gameState.npcs || []).filter(n =>
    p.acquaintances?.includes(n.id) && n.isAlive !== false
  );

  let html = '<div style="max-height:450px;overflow-y:auto;">';
  html += '<p style="color:#8b6914;margin-bottom:10px;">选择要邀请来宅子做客的NPC：</p>';

  if (knownNpcs.length === 0) {
    html += '<p style="color:#cd5c5c;text-align:center;padding:20px;">还没有认识的NPC，先去结识一些朋友吧</p>';
  } else {
    for (const npc of knownNpcs) {
      const favor = npc.favorWithPlayer || 0;
      const isSameLoc = npc.location === p.location;
      html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.08);border-radius:6px;border:1px solid #8b5a2b;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <b style="color:#5c3a1e;">${npc.name}</b>
          <span style="color:#8b6914;font-size:12px;margin-left:8px;">${npc.gender} · ${npc.age}岁 · ${npc.location}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:12px;color:${favor >= 0 ? '#228b22' : '#cd5c5c'};">好感${favor}</span>
          ${isSameLoc
            ? '<span style="font-size:12px;color:#555;">已在身边</span>'
            : `<button class="btn btn-small" onclick="doInvite('${npc.id}')" style="padding:4px 10px;font-size:12px;">邀请</button>`
          }
        </div>
      </div>`;
    }
  }
  html += '</div>';
  showAncientModal('📩 邀请做客', html);
}

async function doRecallNpc(npcId) {
  const result = await api('/api/npc/recall', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  renderAll();
}

async function doInvite(npcId) {
  const result = await api('/api/mansion/invite', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  let html = `<div style="line-height:1.8;font-size:14px;color:#3d2817;">${result.text}</div>`;
  if (result.success) {
    html += '<div style="margin-top:10px;color:#228b22;">邀请成功！对方已来到你的宅子，可以进行交互。</div>';
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">确定</button></div>';
  showAncientModal('📩 邀请结果', html);
  renderAll();
}

// ===== 标签详情 =====
function showTagDetail(tagId) {
  // 从缓存的标签数据中获取完整信息
  let name = tagId;
  let desc = '这是一个特殊的标签，拥有独特的效果。';
  let effects = {};
  let category = '';

  if (allTagsCache && allTagsCache[tagId]) {
    const tag = allTagsCache[tagId];
    name = tag.name || tagId;
    desc = tag.desc || desc;
    effects = tag.effects || {};
    category = tag.category || '';
  }

  // 效果文本
  const effectNames = {
    charm: '魅力', reputation: '声望', strength: '力量', constitution: '体质',
    willpower: '意志', intimidation: '威慑', agility: '敏捷', dodge: '闪避',
    mystery: '神秘', intelligence: '悟性', wisdom: '智慧', luck: '运气',
    enlightenment: '感悟', perception: '感知', charisma: '魅力',
    hpMax: '气血上限', mpMax: '灵力上限', cultivationSpeed: '修炼速度',
    combatBonus: '战斗加成', purity: '纯净度', aggression: '攻击性',
    hearing: '听力', sight: '视力', speed: '速度', yin: '阴属性',
    lust: '情欲', ambition: '野心', fateLuck: '气运', karma: '功德',
    attack: '攻击', defense: '防御', hp: '气血', mp: '灵力',
    soul: '神识', body: '肉身', sword: '剑道', pill: '丹道',
    forge: '器道', formation: '阵道', beast: '兽道',
  };
  let effectsHtml = '';
  if (effects && Object.keys(effects).length > 0) {
    effectsHtml = '<div style="margin-top:10px;"><strong>属性效果：</strong><br>';
    for (const [key, value] of Object.entries(effects)) {
      const displayName = effectNames[key] || key;
      const sign = value > 0 ? '+' : '';
      effectsHtml += `<span style="color:${value > 0 ? '#228b22' : '#8b0000'};">${displayName} ${sign}${value}</span> `;
    }
    effectsHtml += '</div>';
  }

  const categoryNames = {
    body: '身体特征', personality: '性格特质', background: '身份背景',
    destiny: '特殊际遇', emotion: '情感状态', cultivation: '修为特质',
    lust: '情欲特质', special: '特殊标签',
  };

  // 获取标签条件
  let conditionDesc = '';
  if (typeof getTagConditionDesc === 'function') {
    conditionDesc = getTagConditionDesc(tagId);
  }

  document.getElementById('tag-detail-title').textContent = '标签详情';
  document.getElementById('tag-detail-content').innerHTML = `
    <div class="tag-detail-name">${name}</div>
    ${category ? `<div style="font-size:12px;color:#8b6914;margin-bottom:8px;">分类：${categoryNames[category] || category}</div>` : ''}
    <div class="tag-detail-desc">${desc}</div>
    ${conditionDesc ? `<div style="margin-top:8px;font-size:13px;color:#5c3a1e;"><b>获取条件：</b>${conditionDesc}</div>` : ''}
    ${effectsHtml}
    <div class="tag-detail-effects">
      <h4>效果影响</h4>
      <p style="font-size:13px;color:#5c3a1e;">该标签会影响人物的属性成长、交互剧情触发概率、以及特殊事件的出现。每月有概率触发与该标签相关的随机剧情。</p>
    </div>
  `;
  document.getElementById('tag-detail-modal').classList.add('active');
}

// 立绘定制
let portraitData = null;
let portraitCustomRanges = JSON.parse(localStorage.getItem('portraitCustomRanges') || '{}');

async function showPortraitCustomizer() {
  if (!portraitData) {
    portraitData = await apiGet('/api/portraits');
  }

  const categories = [
    { key: 'baby', name: '婴儿', count: portraitData.baby?.length || 0 },
    { key: 'youngMale', name: '幼男', count: portraitData.youngMale?.length || 0 },
    { key: 'youngFemale', name: '幼女', count: portraitData.youngFemale?.length || 0 },
    { key: 'adultMale', name: '成男', count: portraitData.adultMale?.length || 0 },
    { key: 'adultFemale', name: '成女', count: portraitData.adultFemale?.length || 0 },
  ];

  let html = '<p style="margin-bottom:15px;color:#5c3a1e;">选择各类立绘的随机范围，勾选的立绘才会在游戏中随机出现。</p>';

  for (const cat of categories) {
    const selected = portraitCustomRanges[cat.key] || [];
    html += `<div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <b style="color:#8b5a2b;">${cat.name}（${selected.length}/${cat.count}）</b>
        <div>
          <button class="btn btn-small" onclick="selectAllPortraits('${cat.key}',true)">全选</button>
          <button class="btn btn-small" onclick="selectAllPortraits('${cat.key}',false)">全不选</button>
        </div>
      </div>
      <div id="portrait-grid-${cat.key}" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-height:200px;overflow-y:auto;padding:5px;">
        ${(portraitData[cat.key] || []).map((url, i) => `
          <label style="cursor:pointer;position:relative;">
            <input type="checkbox" ${selected.includes(url) ? 'checked' : ''} onchange="togglePortrait('${cat.key}','${url}',this.checked)" style="position:absolute;top:2px;left:2px;z-index:1;">
            <img src="${url}" style="width:100%;height:80px;object-fit:cover;border:1px solid #8b5a2b;border-radius:4px;opacity:${selected.includes(url) ? '1' : '0.4'};">
          </label>
        `).join('')}
      </div>
    </div>`;
  }

  html += '<div style="text-align:center;margin-top:20px;"><button class="btn" onclick="savePortraitCustomization()">保存定制</button> <button class="btn" onclick="showPortraitManager()">🗂 自定义立绘</button></div>';
  html += '<div style="text-align:center;margin-top:10px;font-size:12px;color:#8b7a5a;">手机导入的自定义立绘会自动优先用于新生成的角色，随时可增删，无需重新打包APK</div>';

  document.getElementById('portrait-customizer-content').innerHTML = html;
  document.getElementById('portrait-customizer-modal').classList.add('active');
}

function togglePortrait(category, url, checked) {
  if (!portraitCustomRanges[category]) portraitCustomRanges[category] = [];
  if (checked) {
    if (!portraitCustomRanges[category].includes(url)) {
      portraitCustomRanges[category].push(url);
    }
  } else {
    portraitCustomRanges[category] = portraitCustomRanges[category].filter(u => u !== url);
  }
  // 更新图片透明度
  const img = event.target.nextElementSibling;
  if (img) img.style.opacity = checked ? '1' : '0.4';
}

function selectAllPortraits(category, selectAll) {
  const urls = portraitData[category] || [];
  portraitCustomRanges[category] = selectAll ? [...urls] : [];
  // 更新界面
  const grid = document.getElementById('portrait-grid-' + category);
  if (grid) {
    const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = selectAll;
      const img = cb.nextElementSibling;
      if (img) img.style.opacity = selectAll ? '1' : '0.4';
    });
  }
}

function savePortraitCustomization() {
  localStorage.setItem('portraitCustomRanges', JSON.stringify(portraitCustomRanges));
  api('/api/portraits/customize', { customRanges: portraitCustomRanges });
  closeModal('portrait-customizer-modal');
  gameNotify('立绘定制已保存！新生成的NPC将使用定制范围内的立绘。');
}

// ===== 妖兽战斗系统 =====
let currentBeast = null;
let currentPendingPet = null;
let beastCombatLog = [];

function startBeastBattle(beast) {
  currentBeast = {
    ...beast,
    hp: { current: beast.hp, max: beast.hp },
    mp: { current: beast.mp, max: beast.mp },
    realm: beast.tierName,
    equipment: {},
    cultivationExp: 0,
    realmLevel: beast.tier,
  };
  beastCombatLog = [`遭遇【${beast.name}】（${beast.tierName}）！战斗开始！`];
  closeModal('generic-modal');
  renderBeastCombat();
  document.getElementById('combat-modal').classList.add('active');
}

function renderBeastCombat() {
  const p = gameState.player;
  const e = currentBeast;

  // 玩家
  document.getElementById('combat-player-name').textContent = p.name;
  document.getElementById('combat-player-portrait').innerHTML = p.portrait ? `<img src="${resolvePortrait(p.portrait)}">` : '';
  document.getElementById('combat-player-realm').textContent = p.realm || '炼气一层';
  document.getElementById('combat-player-hp-fill').style.width = (p.hp.current / p.hp.max * 100) + '%';
  document.getElementById('combat-player-hp-text').textContent = `气血 ${p.hp.current}/${p.hp.max}`;
  document.getElementById('combat-player-mp-fill').style.width = (p.mp.current / p.mp.max * 100) + '%';
  document.getElementById('combat-player-mp-text').textContent = `灵力 ${p.mp.current}/${p.mp.max}`;
  const pExp = p.cultivationExp || 0;
  const pExpMax = p.realmLevel ? (p.realmLevel * 500 + 500) : 1000;
  document.getElementById('combat-player-exp-fill').style.width = Math.min(100, pExp / pExpMax * 100) + '%';
  document.getElementById('combat-player-exp-text').textContent = `修为 ${pExp}`;
  const pEquip = p.equipment || {};
  document.getElementById('combat-player-equipment').innerHTML =
    `武器: ${pEquip.weapon || '无'}<br>护甲: ${pEquip.armor || '无'}<br>饰品: ${pEquip.accessory || '无'}`;

  // 妖兽
  document.getElementById('combat-enemy-name').textContent = e.name;
  let beastPortrait = e.portrait ? `images/yaoshou/${resolvePortrait(e.portrait)}` : '';
  if (!beastPortrait) {
    const en = e.name || '';
    if (en.includes('大当家') || en.includes('二当家')) beastPortrait = 'images/lihui/boss_heifeng.png';
    else if (en.includes('山贼') || en.includes('寨主') || en.includes('统领')) beastPortrait = 'images/lihui/bandit.png';
  }
  document.getElementById('combat-enemy-portrait').innerHTML = beastPortrait ? `<img src="${beastPortrait}" onerror="this.style.display='none'">` : '';
  document.getElementById('combat-enemy-realm').textContent = e.tierName;
  document.getElementById('combat-enemy-hp-fill').style.width = (e.hp.current / e.hp.max * 100) + '%';
  document.getElementById('combat-enemy-hp-text').textContent = `气血 ${e.hp.current}/${e.hp.max}`;
  document.getElementById('combat-enemy-mp-fill').style.width = (e.mp.current / e.mp.max * 100) + '%';
  document.getElementById('combat-enemy-mp-text').textContent = `灵力 ${e.mp.current}/${e.mp.max}`;
  document.getElementById('combat-enemy-exp-fill').style.width = '0%';
  document.getElementById('combat-enemy-exp-text').textContent = `等级 ${e.tier}`;
  document.getElementById('combat-enemy-equipment').innerHTML = '妖兽无装备';

  // 战斗日志
  const logEl = document.getElementById('combat-log');
  logEl.innerHTML = beastCombatLog.map(l => `<p>${l}</p>`).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function beastCombatAction(type) {
  const p = gameState.player;
  const e = currentBeast;

  if (type === 'attack') {
    // 玩家攻击
    if (p.mp.current < 10) {
      beastCombatLog.push('你的灵力不足，无法攻击！');
      renderBeastCombat();
      checkBeastCombatEnd();
      return;
    }
    p.mp.current = Math.max(0, p.mp.current - 10);
    // 统一攻击计算方式：与NPC战斗一致
    const playerAtk = calcTotalAttack(p);
    const beastDef = e.def || 5;
    let baseDamage = Math.max(5, playerAtk - beastDef * 0.4) * (0.85 + Math.random() * 0.3);
    // 修为差距加成
    const realmDiff = (p.realmLevel || 1) - (e.tier || 1);
    if (realmDiff > 0) baseDamage *= (1 + realmDiff * 0.05);
    else if (realmDiff < 0) baseDamage *= Math.max(0.5, 1 + realmDiff * 0.05);
    const isCrit = Math.random() < 0.15;
    if (isCrit) baseDamage *= 1.5;
    const damage = Math.floor(baseDamage);
    e.hp.current = Math.max(0, e.hp.current - damage);
    beastCombatLog.push(isCrit ? `【暴击】你全力一击，对${e.name}造成${damage}点伤害！` : `你攻击${e.name}，造成${damage}点伤害。`);
  } else if (type === 'flee') {
    // 逃跑
    const fleeChance = 40 + (p.speed || 5) - e.tier * 5;
    if (Math.random() * 100 < fleeChance) {
      beastCombatLog.push('你成功逃离了战斗！');
      renderBeastCombat();
      setTimeout(() => {
        document.getElementById('combat-modal').classList.remove('active');
        gameNotify('你成功逃离了妖兽的追击！');
      }, 500);
      return;
    } else {
      beastCombatLog.push('逃跑失败！妖兽拦住了你的去路。');
    }
  } else if (type === 'pill') {
    // 使用丹药
    const pills = (p.inventory || []).filter(i => (i.type === 'pill' || i.type === '丹药') && i.count > 0);
    if (pills.length === 0) {
      beastCombatLog.push('你没有可用的丹药！');
      renderBeastCombat();
      return;
    }
    const pill = pills[0];
    const eff = pill.effect || {};
    if (eff.hpPct) {
      const heal = Math.min(Math.floor(p.hp.max * eff.hpPct / 100), p.hp.max - p.hp.current);
      p.hp.current += heal;
      beastCombatLog.push(`你服用了${pill.name}，恢复${heal}点气血（${eff.hpPct}%）。`);
    } else if (eff.hp) {
      const heal = Math.min(eff.hp, p.hp.max - p.hp.current);
      p.hp.current += heal;
      beastCombatLog.push(`你服用了${pill.name}，恢复${heal}点气血。`);
    } else if (eff.mpPct) {
      const restore = Math.min(Math.floor(p.mp.max * eff.mpPct / 100), p.mp.max - p.mp.current);
      p.mp.current += restore;
      beastCombatLog.push(`你服用了${pill.name}，恢复${restore}点灵力（${eff.mpPct}%）。`);
    } else if (eff.mp) {
      const restore = Math.min(eff.mp, p.mp.max - p.mp.current);
      p.mp.current += restore;
      beastCombatLog.push(`你服用了${pill.name}，恢复${restore}点灵力。`);
    } else {
      beastCombatLog.push(`你服用了${pill.name}，但似乎没有立即生效。`);
    }
    pill.count--;
    if (pill.count <= 0) {
      p.inventory = p.inventory.filter(i => i !== pill);
    }
    renderBeastCombat();
    return; // 使用丹药不消耗回合
  }

  // 妖兽反击
  if (e.hp.current > 0) {
    if (e.mp.current < 5) {
      beastCombatLog.push(`${e.name}灵力耗尽，无法攻击！`);
    } else {
      e.mp.current = Math.max(0, e.mp.current - 5);
      const beastAtk = e.atk || 10;
      const playerDef = calcTotalDefense(p);
      let baseDamage = Math.max(5, beastAtk - playerDef * 0.4) * (0.85 + Math.random() * 0.3);
      const isCrit = Math.random() < 0.1;
      if (isCrit) baseDamage *= 1.5;
      const damage = Math.floor(baseDamage);
      p.hp.current = Math.max(0, p.hp.current - damage);
      beastCombatLog.push(isCrit ? `【暴击】${e.name}狂暴一击，对你造成${damage}点伤害！` : `${e.name}攻击你，造成${damage}点伤害。`);
    }
  }

  renderBeastCombat();
  checkBeastCombatEnd();
}

// 统一计算总攻击力（与后端combat.js一致）
function calcTotalAttack(npc) {
  const physique = npc.attributes?.physique || npc.physique || 50;
  const realmLevel = npc.realmLevel || 1;
  const base = Math.floor(physique * 0.5) + realmLevel * 3;
  // 装备加成
  let equipAtk = 0;
  if (npc.equipment) {
    const EQUIPMENT_STATS = window.EQUIPMENT_STATS || {};
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const itemName = npc.equipment[slot];
      if (itemName && EQUIPMENT_STATS[itemName]) {
        equipAtk += EQUIPMENT_STATS[itemName].attack || 0;
      }
    }
  }
  return base + equipAtk;
}

// 统一计算总防御力（与后端combat.js一致）
function calcTotalDefense(npc) {
  const physique = npc.attributes?.physique || npc.physique || 50;
  const realmLevel = npc.realmLevel || 1;
  const base = Math.floor(physique * 0.3) + realmLevel * 2;
  // 装备加成
  let equipDef = 0;
  if (npc.equipment) {
    const EQUIPMENT_STATS = window.EQUIPMENT_STATS || {};
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const itemName = npc.equipment[slot];
      if (itemName && EQUIPMENT_STATS[itemName]) {
        equipDef += EQUIPMENT_STATS[itemName].defense || 0;
      }
    }
  }
  return base + equipDef;
}

function checkBeastCombatEnd() {
  const p = gameState.player;
  const e = currentBeast;

  if (e.hp.current <= 0) {
    // 胜利
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      showBeastVictory();
    }, 500);
  } else if (p.hp.current <= 0) {
    // 失败
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      const hpLoss = Math.floor(p.hp.max * 0.3);
      const expLoss = Math.floor((p.cultivationExp || 0) * 0.1);
      p.hp.current = Math.floor(p.hp.max * 0.3);
      p.cultivationExp = Math.max(0, (p.cultivationExp || 0) - expLoss);
      currentBeast = null;
      document.getElementById('combat-end-title').textContent = '战斗失败';
      document.getElementById('combat-end-content').innerHTML = `
        <p style="color:#8b0000;font-size:16px;margin-bottom:15px;">你被${e.name}击败了！</p>
        <p>损失气血: ${hpLoss}</p>
        <p>损失修为: ${expLoss}</p>
        <p>你拼尽全力才得以脱身。</p>
        <div style="text-align:center;margin-top:20px;">
          <button class="btn" onclick="closeModal('combat-end-modal');refreshGatheringPage();">确定</button>
        </div>
      `;
      document.getElementById('combat-end-modal').classList.add('active');
      renderTopBar();
    }, 500);
  } else if (p.mp.current <= 0 && e.mp.current <= 0) {
    // 平局
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      currentBeast = null;
      document.getElementById('combat-end-title').textContent = '战斗平局';
      document.getElementById('combat-end-content').innerHTML = `
        <p style="color:#8b6914;font-size:16px;margin-bottom:15px;">双方灵力耗尽，战斗以平局结束！</p>
        <p>${e.name}退走了，你也精疲力竭。</p>
        <div style="text-align:center;margin-top:20px;">
          <button class="btn" onclick="closeModal('combat-end-modal');refreshGatheringPage();">确定</button>
        </div>
      `;
      document.getElementById('combat-end-modal').classList.add('active');
      renderTopBar();
    }, 500);
  }
}

function showBeastVictory() {
  const e = currentBeast;

  // 如果是灵宠战斗，显示捕捉/杀死选项
  if (e.isPet && e.petData) {
    const pet = e.petData;
    currentBeast = null;
    document.getElementById('combat-end-title').textContent = '战斗胜利';
    document.getElementById('combat-end-content').innerHTML = `
      <p style="color:#228b22;font-size:16px;margin-bottom:15px;">你击败了【${pet.name}】！</p>
      <p>品质：${pet.quality}</p>
      <p>品级：${['凡品','良品','珍品','神品','仙品','神品'][pet.tier-1] || '凡品'}</p>
      <p>攻击：${pet.stats.atk} | 防御：${pet.stats.def} | 速度：${pet.stats.spd} | 气血：${pet.stats.hp}</p>
      <p>技能：${pet.skill}</p>
      <div style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center;">
        <button class="btn" onclick="captureDefeatedPet()">捕捉</button>
        <button class="btn" onclick="killDefeatedPet()">杀死（获得掉落物）</button>
      </div>
    `;
    document.getElementById('combat-end-modal').classList.add('active');
    renderTopBar();
    return;
  }

  // 灵兽（2阶，如灵狐/青蛇/赤焰虎/玄龟/风狼）胜利：可选择捕捉成为宠物，或杀死获得掉落物
  if (e.tier === 2) {
    const pet = {
      id: 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: e.name,
      tier: e.tier,
      quality: ['凡品', '良品', '珍品', '神品', '仙品', '神品'][e.tier - 1] || '良品',
      stats: { atk: e.atk || 20, def: e.def || 10, spd: e.agility || 10, hp: e.hp.max || 300, mp: e.mp.max || 100 },
      skill: (e.skills && e.skills[0]) || '灵性扑击',
      portrait: e.portrait || '',
      exp: 0,
      maxExp: 100,
      level: 1,
    };
    currentPendingPet = pet;
    currentBeast = null;
    document.getElementById('combat-end-title').textContent = '战斗胜利';
    document.getElementById('combat-end-content').innerHTML = `
      <p style="color:#228b22;font-size:16px;margin-bottom:15px;">你击败了灵兽【${pet.name}】！</p>
      <p>品级：${pet.quality} | 攻击：${pet.stats.atk} | 防御：${pet.stats.def} | 速度：${pet.stats.spd} | 气血：${pet.stats.hp}</p>
      <p>灵兽颇有灵性，你可以选择将其收为宠物，或取其材料。</p>
      <div style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center;">
        <button class="btn" onclick="captureDefeatedPet()">🐾 捕捉为灵宠</button>
        <button class="btn" onclick="killDefeatedPet()">⚔ 杀死（获得掉落物）</button>
      </div>
    `;
    document.getElementById('combat-end-modal').classList.add('active');
    renderTopBar();
    return;
  }

  const drops = [];
  for (const dropName of e.drops || []) {
    if (Math.random() < (e.dropRate || 0.3)) {
      const count = Math.floor(Math.random() * 3) + 1;
      drops.push({ name: dropName, count });
    }
  }
  // 妖王以上必掉妖丹
  if (e.tier >= 3 && Math.random() < 0.8) {
    drops.push({ name: '妖丹', count: 1 });
  }

  // 获得修为
  const expGain = e.expReward || 50;

  // 同步掉落物和修为到后端（保证掉落物进入背包并即时刷新）
  if (drops.length > 0 || expGain > 0) {
    api('/api/beast/drops', { drops, expGain }).then(result => {
      if (result.state) gameState = result.state;
      renderTopBar();
    });
  }

  currentBeast = null;

  document.getElementById('combat-end-title').textContent = '战斗胜利';
  document.getElementById('combat-end-content').innerHTML = `
    <p style="color:#228b22;font-size:16px;margin-bottom:15px;">你击败了${e.name}！</p>
    <p>获得修为：${expGain}</p>
    ${drops.length > 0 ? `<p>获得物品：${drops.map(d => `${d.name}×${d.count}`).join('、')}</p>` : '<p>没有获得物品</p>'}
    <div style="text-align:center;margin-top:20px;">
      <button class="btn" onclick="closeModal('combat-end-modal');refreshGatheringPage();">确定</button>
    </div>
  `;
  document.getElementById('combat-end-modal').classList.add('active');
  renderTopBar();
}

// 捕捉被击败的灵宠
async function captureDefeatedPet() {
  const pet = currentPendingPet;
  if (!pet) { closeModal('combat-end-modal'); return; }
  const result = await api('/api/pet/capture', { pet });
  if (result.error) { gameNotify(result.error); }
  else {
    if (result.state) gameState = result.state;
    gameNotify(`捕捉成功！获得了【${pet.name}】！`);
  }
  currentPendingPet = null;
  closeModal('combat-end-modal');
  refreshGatheringPage();
}

// 杀死被击败的灵宠
async function killDefeatedPet() {
  const pet = currentPendingPet;
  if (!pet) { closeModal('combat-end-modal'); return; }
  // 按品级掉落：灵宠皮 + 妖丹 + 高品质灵宠的精魄
  const drops = [
    { name: '灵宠皮', count: 1 },
    { name: '妖丹', count: pet.tier >= 2 ? 1 : 0 },
    { name: '灵宠精魄', count: pet.tier >= 4 ? 1 : 0 },
  ].filter(d => d.count > 0);
  const result = await api('/api/beast/drops', { drops });
  if (result.error) { gameNotify(result.error); }
  else {
    if (result.state) gameState = result.state;
    gameNotify(`杀死了【${pet.name}】，获得：${drops.map(d => `${d.name}×${d.count}`).join('、')}`);
  }
  currentPendingPet = null;
  closeModal('combat-end-modal');
  refreshGatheringPage();
}

function refreshGatheringPage() {
  // 如果在采集页面，刷新结果显示
  if (document.getElementById('page-gathering').classList.contains('active')) {
    document.getElementById('gathering-result').innerHTML = '<div style="background:rgba(245,230,200,0.95);padding:15px;border-radius:8px;"><p style="color:#228b22;font-weight:bold;">战斗结束，你可以继续采集。</p></div>';
  }
  renderAll();
}

// ===== 战斗系统 =====
let currentCombatEnemy = null;

function doCombatAction(type) {
  if (type === 'talisman') { showCombatTalismans('player'); return; }
  if (currentBeast) {
    beastCombatAction(type);
  } else {
    combatDoAction(type);
  }
}

async function startCombat(npcId) {
  const result = await api('/api/combat/start', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  currentCombatEnemy = result.enemy;
  renderCombat(result);
  document.getElementById('combat-modal').classList.add('active');
}

function renderCombat(data) {
  const p = data.player || gameState.player;
  const e = data.enemy || currentCombatEnemy;
  const combat = data.combat;

  // 玩家
  document.getElementById('combat-player-name').textContent = p.name;
  document.getElementById('combat-player-portrait').innerHTML = p.portrait ? `<img src="${resolvePortrait(p.portrait)}">` : '';
  document.getElementById('combat-player-realm').textContent = p.realm || '炼气一层';
  document.getElementById('combat-player-hp-fill').style.width = (p.hp.current / p.hp.max * 100) + '%';
  document.getElementById('combat-player-hp-text').textContent = `气血 ${p.hp.current}/${p.hp.max}`;
  document.getElementById('combat-player-mp-fill').style.width = (p.mp.current / p.mp.max * 100) + '%';
  document.getElementById('combat-player-mp-text').textContent = `灵力 ${p.mp.current}/${p.mp.max}`;
  const pExp = p.cultivationExp || 0;
  const pExpMax = p.realmLevel ? (p.realmLevel * 500 + 500) : 1000;
  document.getElementById('combat-player-exp-fill').style.width = Math.min(100, pExp / pExpMax * 100) + '%';
  document.getElementById('combat-player-exp-text').textContent = `修为 ${pExp}`;
  const pEquip = p.equipment || {};
  document.getElementById('combat-player-equipment').innerHTML =
    `武器: ${pEquip.weapon || '无'}<br>护甲: ${pEquip.armor || '无'}<br>饰品: ${pEquip.accessory || '无'}`;

  // 敌人
  document.getElementById('combat-enemy-name').textContent = e.name;
  document.getElementById('combat-enemy-portrait').innerHTML = e.portrait ? `<img src="${resolvePortrait(e.portrait)}">` : '';
  document.getElementById('combat-enemy-realm').textContent = e.realm || '炼气一层';
  document.getElementById('combat-enemy-hp-fill').style.width = (e.hp.current / e.hp.max * 100) + '%';
  document.getElementById('combat-enemy-hp-text').textContent = `气血 ${e.hp.current}/${e.hp.max}`;
  document.getElementById('combat-enemy-mp-fill').style.width = (e.mp.current / e.mp.max * 100) + '%';
  document.getElementById('combat-enemy-mp-text').textContent = `灵力 ${e.mp.current}/${e.mp.max}`;
  const eExp = e.cultivationExp || 0;
  const eExpMax = e.realmLevel ? (e.realmLevel * 500 + 500) : 1000;
  document.getElementById('combat-enemy-exp-fill').style.width = Math.min(100, eExp / eExpMax * 100) + '%';
  document.getElementById('combat-enemy-exp-text').textContent = `修为 ${eExp}`;
  const eEquip = e.equipment || {};
  document.getElementById('combat-enemy-equipment').innerHTML =
    `武器: ${eEquip.weapon || '无'}<br>护甲: ${eEquip.armor || '无'}<br>饰品: ${eEquip.accessory || '无'}`;

  // 战斗日志
  if (combat && combat.log) {
    const logEl = document.getElementById('combat-log');
    logEl.innerHTML = combat.log.map(l => `<p>${l}</p>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }
}

async function combatDoAction(type) {
  const action = { type };
  const result = await api('/api/combat/action', action);
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  if (result.enemy) currentCombatEnemy = result.enemy;
  renderCombat(result);

  // 检查战斗结果
  if (result.fled) {
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      gameNotify('你成功逃离了战斗！');
    }, 500);
  } else if (result.victory) {
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      renderTopBar(); // 战斗结束立即刷新顶栏（气血/灵力/修为等）
      showCombatEnd(result.enemyId);
    }, 500);
  } else if (result.defeat) {
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      document.getElementById('combat-end-title').textContent = '战斗失败';
      document.getElementById('combat-end-content').innerHTML = `
        <p style="color:#8b0000;font-size:16px;margin-bottom:15px;">你被击败了！</p>
        <p>损失气血: ${result.penalty.hpLoss}</p>
        <p>损失修为: ${result.penalty.expLoss}</p>
        <p>陷入虚弱状态（3回合）</p>
        <div style="text-align:center;margin-top:20px;">
          <button class="btn" onclick="closeModal('combat-end-modal')">确定</button>
        </div>
      `;
      document.getElementById('combat-end-modal').classList.add('active');
      renderTopBar();
    }, 500);
  } else if (result.draw) {
    setTimeout(() => {
      document.getElementById('combat-modal').classList.remove('active');
      document.getElementById('combat-end-title').textContent = '战斗平局';
      document.getElementById('combat-end-content').innerHTML = `
        <p style="color:#8b6914;font-size:16px;margin-bottom:15px;">双方灵力耗尽，战斗以平局结束！</p>
        <p>双方都已精疲力竭，各自退去休养。</p>
        <div style="text-align:center;margin-top:20px;">
          <button class="btn" onclick="closeModal('combat-end-modal')">确定</button>
        </div>
      `;
      document.getElementById('combat-end-modal').classList.add('active');
      renderTopBar();
    }, 500);
  }
}

function showCombatEnd(enemyId) {
  const enemy = gameState.npcs?.find(n => n.id === enemyId);
  document.getElementById('combat-end-title').textContent = '战斗胜利';
  document.getElementById('combat-end-content').innerHTML = `
    <p style="color:#228b22;font-size:16px;margin-bottom:15px;">你击败了${enemy?.name || '敌人'}！</p>
    <p style="margin-bottom:15px;">是否杀死对方？杀死后可获得其全部库房财物和宠物。</p>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button class="btn btn-danger" onclick="killEnemy('${enemyId}')">杀死对方</button>
      <button class="btn" onclick="spareEnemy('${enemyId}')">放走对方</button>
    </div>
  `;
  document.getElementById('combat-end-modal').classList.add('active');
}

async function killEnemy(enemyId) {
  const result = await api('/api/combat/kill', { enemyId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('combat-end-modal');
  let msg = `你杀死了对方！获得：\n`;
  if (result.loot.items.length > 0) {
    msg += `物品: ${result.loot.items.map(i => `${i.name}×${i.count}`).join(', ')}\n`;
  }
  if (result.loot.pets.length > 0) {
    msg += `宠物: ${result.loot.pets.map(p => p.name).join(', ')}\n`;
  }
  if (result.loot.silver > 0) msg += `银两: ${result.loot.silver}\n`;
  if (result.loot.spiritStone > 0) msg += `灵石: ${result.loot.spiritStone}\n`;
  if (result.wifeResults.length > 0) {
    msg += `\n妻妾去向:\n`;
    result.wifeResults.forEach(w => msg += `${w.wife}: ${w.action}\n`);
  }
  gameNotify(msg);
  renderTopBar();
  renderAll();
}

async function spareEnemy(enemyId) {
  const result = await api('/api/combat/spare', { enemyId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('combat-end-modal');
  gameNotify('你放走了对方，但对方对你的好感度大幅下降。');
  renderTopBar();
  renderAll();
}

function showCombatEquipment(side) {
  const npc = side === 'player' ? gameState.player : currentCombatEnemy;
  if (!npc?.warehouse?.items) { gameNotify('没有物品'); return; }
  const equippable = npc.warehouse.items.filter(i => {
    const types = ['weapon', 'armor', 'accessory'];
    // 简单判断
    return i.count > 0;
  });
  if (equippable.length === 0) { gameNotify('没有可装备的物品'); return; }
  // 战斗装备选择改为游戏内输入弹窗（替代原生 prompt）
  gamePrompt('选择装备槽位（weapon/armor/accessory）：', 'weapon', (slot) => {
    if (!slot) return;
    const list = equippable.map(i => i.name).join('\n');
    gamePrompt(`选择要装备的物品：\n${list}`, equippable[0].name, (itemName) => {
      if (!itemName) return;
      combatDoActionEquip(slot, itemName);
    }, '装备物品');
  }, '装备槽位');
}

async function combatDoActionEquip(slot, itemName) {
  const result = await api('/api/combat/action', { type: 'equip', slot, item: itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  if (result.enemy) currentCombatEnemy = result.enemy;
  renderCombat(result);
}

function showCombatPills(side) {
  const npc = side === 'player' ? gameState.player : currentCombatEnemy;
  // 玩家使用背包物品，NPC使用库房物品
  const items = side === 'player' ? (npc.inventory || []) : (npc.warehouse?.items || []);
  const pills = items.filter(i => i.count > 0 && (i.name.includes('丹') || i.name.includes('药') || i.name.includes('汤') || i.name.includes('散')));
  if (pills.length === 0) { gameNotify(side === 'player' ? '背包中没有丹药' : '对方没有丹药'); return; }
  // 服用丹药选择改为游戏内输入弹窗
  const pillList = pills.map(i => `${i.name}×${i.count}`).join('\n');
  gamePrompt(`选择要服用的丹药：\n${pillList}`, pills[0].name, (pillName) => {
    if (!pillName) return;
    combatDoActionPill(pillName);
  }, '服用丹药');
}

async function combatDoActionPill(itemName) {
  const result = await api('/api/combat/action', { type: 'pill', item: itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  if (result.enemy) currentCombatEnemy = result.enemy;
  renderCombat(result);
}

// 战斗中使用符箓（第九批：符箓战斗中可用，效果见 TALISMANS）
const COMBAT_TALISMAN_NAMES = ['火球符', '冰锥符', '护盾符', '困敌符', '巨力符', '风行符', '天雷符'];
function showCombatTalismans(side) {
  const npc = side === 'player' ? gameState.player : currentCombatEnemy;
  const items = side === 'player' ? (npc.inventory || []) : (npc.warehouse?.items || []);
  const talismans = items.filter(i => i.count > 0 && COMBAT_TALISMAN_NAMES.includes(i.name));
  if (talismans.length === 0) { gameNotify(side === 'player' ? '背包中没有可用符箓' : '对方没有符箓'); return; }
  const list = talismans.map(i => `${i.name}×${i.count}`).join('\n');
  gamePrompt(`选择要使用的符箓：\n${list}`, talismans[0].name, (name) => {
    if (!name) return;
    combatDoActionTalisman(name);
  }, '使用符箓');
}

async function combatDoActionTalisman(itemName) {
  const result = await api('/api/combat/action', { type: 'talisman', item: itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  if (result.enemy) currentCombatEnemy = result.enemy;
  renderCombat(result);
}

// ===== 后宅系统 =====
async function showHarem(npcId) {
  // 需求：点后宅弹出主控的修复——始终实时拉取目标NPC数据（NPC面板数据来自 /api/npc/:id，
  // 而 gameState.npcs 只含当前可见NPC；异地/未认识/已亡故NPC不在其中，原逻辑会fallback到主控后宅）
  let npc = gameState.npcs?.find(n => n.id === npcId);
  const res = await apiGet(`/api/npc/${npcId}`);
  if (res && !res.error && res.id) npc = res;
  if (!npc) npc = gameState.player;
  if (!npc) return;

  const family = npc.family || {};
  let html = '<div style="max-height:400px;overflow-y:auto;">';

  // 配偶
  html += '<h4 style="color:#8b5a2b;margin-bottom:10px;">💑 配偶</h4>';
  if (family.spouse) {
    const spouse = gameState.npcs?.find(n => n.id === family.spouse);
    if (spouse) {
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="showNPCDetail('${spouse.id}')">
        <img src="${resolvePortrait(spouse.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
        <div><b>${spouse.name}</b> · ${spouse.gender} · ${spouse.age}岁 · ${spouse.realm || '凡人境'}</div>
      </div>`;
    } else if (family.spouseName) {
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;"><div><b>${family.spouseName}</b> · ${family.spouseName === '（已故或下落不明）' ? '<span style="color:#8b0000;">下落不明</span>' : '（不在当前所在地）'}</div></div>`;
    } else {
      html += '<p style="color:#555;font-size:13px;">暂无配偶</p>';
    }
  } else {
    html += '<p style="color:#555;font-size:13px;">暂无配偶</p>';
  }

  // 妾室
  if (family.wives && family.wives.length > 0) {
    html += '<h4 style="color:#8b5a2b;margin:15px 0 10px;">🌸 妾室</h4>';
    for (const wifeId of family.wives) {
      const wife = gameState.npcs?.find(n => n.id === wifeId);
      if (wife) {
        html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="showNPCDetail('${wife.id}')">
          <img src="${resolvePortrait(wife.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
          <div><b>${wife.name}</b> · ${wife.gender} · ${wife.age}岁 · ${wife.realm || '凡人境'}</div>
        </div>`;
      }
    }
  }

  // 父母
  html += '<h4 style="color:#8b5a2b;margin:15px 0 10px;">👨‍👩 父母</h4>';
  let hasParent = false;
  if (family.father) {
    const father = gameState.npcs?.find(n => n.id === family.father);
    if (father) {
      hasParent = true;
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="showNPCDetail('${father.id}')">
        <img src="${resolvePortrait(father.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
        <div><b>${father.name}</b> · 父亲 · ${father.age}岁 · ${father.realm || '凡人境'}</div>
      </div>`;
    }
  } else if (family.fatherName) {
    hasParent = true;
    html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;"><div><b>${family.fatherName}</b> · 父亲 · （不在当前所在地）</div></div>`;
  }
  if (family.mother) {
    const mother = gameState.npcs?.find(n => n.id === family.mother);
    if (mother) {
      hasParent = true;
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="showNPCDetail('${mother.id}')">
        <img src="${resolvePortrait(mother.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
        <div><b>${mother.name}</b> · 母亲 · ${mother.age}岁 · ${mother.realm || '凡人境'}</div>
      </div>`;
    }
  } else if (family.motherName) {
    hasParent = true;
    html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;"><div><b>${family.motherName}</b> · 母亲 · （不在当前所在地）</div></div>`;
  }
  if (!hasParent) html += '<p style="color:#555;font-size:13px;">父母信息不详</p>';

  // 子嗣
  html += '<h4 style="color:#8b5a2b;margin:15px 0 10px;">👶 子嗣</h4>';
  if (family.children && family.children.length > 0) {
    for (const childId of family.children) {
      const child = gameState.npcs?.find(n => n.id === childId);
      if (child) {
        html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;cursor:pointer;" onclick="showNPCDetail('${child.id}')">
          <img src="${resolvePortrait(child.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
          <div><b>${child.name}</b> · ${child.gender} · ${child.age}岁 · ${child.realm || '凡人境'}</div>
        </div>`;
      } else {
        // 需求：子嗣不在前端可见列表时用后端 childrenInfo 兜底显示
        const info = (family.childrenInfo || []).find(x => x && x.id === childId);
        if (info) {
          html += `<div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;margin-bottom:8px;${info.isAlive ? 'cursor:pointer;' : ''}" ${info.isAlive ? `onclick="showNPCDetail('${info.id}')"` : ''}>
            <img src="${resolvePortrait(info.portrait) || ''}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'">
            <div><b>${info.name}</b> · ${info.gender} · ${info.realm || '凡人境'}${info.isAlive ? '' : ' · <span style="color:#8b0000;">已故</span>'}</div>
          </div>`;
        }
      }
    }
  } else {
    html += '<p style="color:#555;font-size:13px;">暂无子嗣</p>';
  }

  html += '</div>';

  // 显示在generic-modal中
  document.getElementById('ancient-modal-title').textContent = `🏯 ${npc.name}的后宅`;
  document.getElementById('ancient-modal-body').innerHTML = html;
  document.getElementById('npc-detail-modal').classList.remove('active');
  document.getElementById('generic-modal').classList.add('active');
}

// ===== 交互剧情（内嵌显示在NPC面板顶部） =====
async function triggerInteractionInline(npcId, action) {
  const result = await api('/api/events/interaction', { npcId, action });
  if (result.error) { gameNotify(result.error); return; }

  const event = result.event;
  const npc = result.npc;

  let effectsHtml = '';
  if (event.effects) {
    const effectNames = {
      favor: '好感度', cultivationExp: '修为', hp: '气血', mp: '灵力',
      silver: '银两', spiritStone: '灵石', reputation: '声望',
      enlightenment: '悟性', combatExp: '战斗经验', physique: '根骨',
      spirit: '神识', agility: '身法', fateLuck: '气运',
    };
    for (const key in event.effects) {
      const val = event.effects[key];
      if (typeof val === 'number' && val !== 0) {
        const name = effectNames[key] || key;
        const color = val >= 0 ? '#228b22' : '#cd5c5c';
        const sign = val >= 0 ? '+' : '';
        effectsHtml += `<span style="margin-right:15px;color:${color};font-weight:bold;">${name}: ${sign}${val}</span>`;
      }
    }
  }

  const resultHtml = `
    <div class="interaction-result">
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <img src="${resolvePortrait(npc.portrait) || ''}" style="width:60px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #8b5a2b;" onerror="this.style.display='none'">
        <div style="flex:1;">
          <div style="color:#5c3a1e;font-weight:bold;font-size:14px;margin-bottom:5px;">${npc.name}${event.rel ? '（' + event.rel + '）' : ''} · ${action === 'chat' ? '交谈' : action === 'spar' ? '切磋' : '赠礼'}</div>
          <div class="interaction-result-text" style="white-space:pre-line;">${event.text}</div>
          <div class="interaction-result-effects">${effectsHtml || '（无属性变化）'}</div>
        </div>
      </div>
    </div>
  `;

  const area = document.getElementById('interaction-result-area');
  if (area) {
    area.innerHTML = resultHtml;
  }

  if (result.state) {
    gameState = result.state;
    // 不调用renderAll()，避免关闭NPC面板
    // 只更新顶部状态栏
    renderTopBar();
    // 实时刷新好感显示
    const curNpc = gameState.npcs?.find(n => n.id === npcId);
    if (curNpc) {
      const favorEl = document.getElementById('npc-detail-favor');
      if (favorEl) {
        favorEl.textContent = curNpc.favorWithPlayer;
        favorEl.style.color = curNpc.favorWithPlayer >= 50 ? '#228b22' : curNpc.favorWithPlayer >= 0 ? '#b8860b' : '#cd5c5c';
      }
      // 刷新个人记事（含新增互动记录）
      if (curNpc.personalHistory) {
        const journalList = document.querySelector('.npc-journal-list');
        if (journalList) {
          const sorted = [...curNpc.personalHistory].reverse();
          journalList.innerHTML = sorted.map(h =>
            `<p style="font-size:13px;color:#5c3a1e;padding:5px 0;border-bottom:1px solid rgba(139,90,43,0.1);">· ${h}</p>`
          ).join('');
        }
      }
      // 刷新关系网（如新结成的关系）
      const relSection = document.getElementById('npc-section-relations');
      if (relSection && relSection.style.display === 'block' && curNpc.relations) {
        showNPCDetail(npcId);
      }
    }
  }
  // 交互完成后好感与记事已在上方同步刷新
}

// ===== 传书 =====
// 切换NPC面板的关系网/家族/记事/库房显示
function toggleNpcSection(section) {
  const sections = ['relations', 'family', 'journal', 'warehouse'];
  for (const s of sections) {
    const el = document.getElementById('npc-section-' + s);
    if (el) {
      if (s === section) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
      } else {
        el.style.display = 'none';
      }
    }
  }
}

// 偷窃NPC
async function doStealFromNpc(npcId) {
  const result = await api('/api/steal/from-npc', { npcId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderTopBar();

  // 显示偷窃结果
  const area = document.getElementById('interaction-result-area');
  if (area) {
    const npc = gameState.npcs?.find(n => n.id === npcId);
    area.innerHTML = `
      <div class="interaction-result">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <img src="${resolvePortrait(npc?.portrait) || ''}" style="width:60px;height:80px;object-fit:cover;border-radius:4px;border:1px solid #8b5a2b;" onerror="this.style.display='none'">
          <div style="flex:1;">
            <div style="color:#5c3a1e;font-weight:bold;font-size:14px;margin-bottom:5px;">🗡 偷窃 · ${npc?.name || ''}</div>
            <div class="interaction-result-text">${result.msg || result.event?.text || ''}</div>
            <div class="interaction-result-effects">
              成功率: ${result.successRate || 0}% · ${result.success ? '<span style="color:#228b22;">成功</span>' : '<span style="color:#cd5c5c;">失败</span>'}
              ${result.item ? `· 偷得: ${result.item.name}×${result.item.count}` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 刷新记事
  setTimeout(() => {
    const npc = gameState.npcs?.find(n => n.id === npcId);
    if (npc && npc.personalHistory) {
      const journalList = document.querySelector('.npc-journal-list');
      if (journalList) {
        const sorted = [...npc.personalHistory].reverse();
        journalList.innerHTML = sorted.map(h =>
          `<p style="font-size:13px;color:#5c3a1e;padding:5px 0;border-bottom:1px solid rgba(139,90,43,0.1);">· ${h}</p>`
        ).join('');
      }
    }
  }, 100);
}

async function showLetterModal(npcId) {
  const npc = gameState.npcs?.find(n => n.id === npcId);
  if (!npc) return;

  const letters = await apiGet('/api/letters');
  const templates = await apiGet('/api/letters/templates');
  const myLetters = (letters || []).filter(l => l.toId === npcId || l.fromId === npcId);

  let html = `<h4 style="color:#5c3a1e;margin-bottom:10px;">与${npc.name}的书信</h4>`;

  // 固定话语与输入框置顶
  html += '<div style="padding:10px;background:rgba(139,90,43,0.08);border-radius:6px;margin-bottom:10px;border:1px solid rgba(139,90,43,0.25);">';
  html += '<b style="color:#8b5a2b;">固定话语：</b><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">';
  for (const t of (templates || [])) {
    html += `<button class="btn btn-small" style="font-size:12px;" onclick="sendLetterTemplate('${npcId}','${t.id}')">${t.text}</button>`;
  }
  html += '</div>';
  html += `<div style="margin-top:10px;">
    <textarea id="letter-input" style="width:100%;height:54px;background:rgba(255,255,255,0.6);border:1px solid #8b5a2b;border-radius:4px;color:#3d2817;padding:8px;resize:none;font-family:inherit;" placeholder="或输入自定义书信内容...（传书需10灵石）"></textarea>
    <button class="btn" style="margin-top:6px;" onclick="sendLetterCustom('${npcId}')">发送自定义传书</button>
  </div>`;
  html += '</div>';

  // 下方显示书信往来内容与结果
  html += '<div style="max-height:260px;overflow-y:auto;">';
  if (myLetters.length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:15px;">还没有书信往来，使用上方按钮或输入内容发一封信吧</p>';
  } else {
    for (const l of myLetters.slice(-10).reverse()) {
      const isSent = l.type === 'sent' || l.from === '你';
      const bgColor = isSent ? 'rgba(139,90,43,0.08)' : 'rgba(34,139,34,0.08)';
      html += `<div style="padding:8px;background:${bgColor};border-radius:4px;margin-bottom:6px;">
        <div style="color:#5c3a1e;font-size:12px;">${l.timestampText || ''} · ${isSent ? '已发送' : '收到'}</div>
        <div style="color:#3d2817;font-size:13px;margin-top:4px;line-height:1.7;">${l.content}</div>
      </div>`;
    }
  }
  html += '</div>';

  showAncientModal('✉ 传书', html);
}

async function sendLetterTemplate(npcId, templateId) {
  const result = await api('/api/letters/send', { npcId, templateId, content: '' });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  showLetterModal(npcId); // 刷新书信面板显示回信
}

async function sendLetterCustom(npcId) {
  const content = document.getElementById('letter-input').value.trim();
  if (!content) { gameNotify('请输入书信内容'); return; }
  const result = await api('/api/letters/send', { npcId, content });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  showLetterModal(npcId);
}

// ===== 存档读档 =====
async function saveGame() {
  // 已从存档读入：直接覆盖该档（优先，避免覆盖后当前档时间不更新）
  if (currentSlot) {
    const result = await api('/api/save', { slot: currentSlot });
    if (result.success) gameNotify('存档成功（已覆盖当前存档）！');
    else gameNotify('存档失败：' + (result.error || '未知错误'));
    return;
  }
  // 开局绑定唯一存档码：直接覆盖该码对应的档（每次开局码唯一，存档永不重复）
  if (gameState && gameState.saveCode) {
    const result = await api('/api/save', { slot: gameState.saveCode });
    if (result.success) gameNotify('存档成功（已覆盖本局存档）！');
    else gameNotify('存档失败：' + (result.error || '未知错误'));
    return;
  }
  // 新建角色首次存档：弹输入框命名（取消则不保存）
  gamePrompt('请输入存档名称（留空则自动命名）：', `存档_${new Date().toLocaleString('zh-CN').replace(/[/:]/g, '-')}`, async (slotName) => {
    const result = await api('/api/save', { slot: slotName || undefined });
    if (result.success) { currentSlot = result.slot || slotName; gameNotify('存档成功！'); }
    else gameNotify('存档失败：' + (result.error || '未知错误'));
  }, '存档');
}

async function loadGame() {
  const saves = await apiGet('/api/saves');
  if (!saves || saves.length === 0) { gameNotify('没有存档'); return; }

  let html = '<div style="max-height:400px;overflow-y:auto;">';
  for (const s of saves) {
    html += `<div class="shop-item" style="margin-bottom:8px;">
      <div class="shop-item-info">
        <div class="shop-item-name">${s.playerName} · ${s.playerRealm}</div>
        <div class="shop-item-desc">${s.gameDate} | 保存于 ${s.saveTime}</div>
      </div>
      <button class="btn btn-small" onclick="doLoad('${s.slot}')">读取</button>
      <button class="btn btn-small btn-danger" onclick="deleteSave('${s.slot}')">删除</button>
    </div>`;
  }
  html += '</div>';
  showAncientModal('选择存档', html);
}

// 从开局界面读档
async function showLoadGameFromStart() {
  const saves = await apiGet('/api/saves');
  if (!saves || saves.length === 0) { gameNotify('没有存档'); return; }

  let html = '<div style="max-height:400px;overflow-y:auto;">';
  for (const s of saves) {
    html += `<div class="shop-item" style="margin-bottom:8px;">
      <div class="shop-item-info">
        <div class="shop-item-name">${s.playerName} · ${s.playerRealm}</div>
        <div class="shop-item-desc">${s.gameDate} | 保存于 ${s.saveTime}</div>
      </div>
      <button class="btn btn-small" onclick="doLoad('${s.slot}')">读取</button>
      <button class="btn btn-small btn-danger" onclick="deleteSave('${s.slot}')">删除</button>
    </div>`;
  }
  html += '</div>';
  document.getElementById('ancient-modal-title').textContent = '选择存档';
  document.getElementById('ancient-modal-body').innerHTML = html;
  document.getElementById('generic-modal').classList.add('active');
}

async function doLoad(slot) {
  gameState = await api('/api/load', { slot });
  if (gameState.error) { gameNotify(gameState.error); return; }
  currentSlot = slot;
  closeModal('generic-modal');
  document.getElementById('create-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  switchPage('map');
  renderAll();
  // 有待处理事件（withActions）时事件弹窗优先，不显示"读档成功"避免覆盖
  const hasActionEv = gameState.pendingPlayerEvents && gameState.pendingPlayerEvents.some(ev => ev && ev.withActions);
  if (!hasActionEv) gameNotify('读档成功！');
}

async function deleteSave(slot) {
  await api('/api/save/delete', { slot });
  loadGame();
}

// ===== 其他系统（简化版） =====
async function showAlchemy() {
  const info = await apiGet('/api/alchemy');
  const paidList = await apiGet('/api/learn/paid/alchemy');
  const p = gameState.player;

  let html = `<p style="margin-bottom:10px;">炼丹等级: <b>${info.level?.name || '丹徒'}</b> · 经验: ${info.exp || 0} · 所在：丹塔</p>`;

  // 丹方藏经阁 - 可学习所有品级丹方（交钱研读）
  const notLearned = (paidList || []).filter(r => !r.learned);
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">📜 丹方藏经阁（可研读所有品级丹方，每次需交钱）</h4>';
  if (notLearned.length > 0) {
    for (const recipe of notLearned) {
      const costText = recipe.cost.type === 'silver' ? `${recipe.cost.amount}银两` : `${recipe.cost.amount}灵石`;
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${recipe.name}（${recipe.tier}阶）</div>
          <div class="shop-item-desc">${recipe.desc || ''}</div>
          <div style="font-size:11px;color:#228b22;">研读进度: ${recipe.progress || 0}%</div>
          <div style="width:100%;height:6px;background:#3a2a1a;border-radius:3px;margin-top:3px;">
            <div style="width:${recipe.progress || 0}%;height:100%;background:linear-gradient(90deg,#cd853f,#daa520);border-radius:3px;"></div>
          </div>
        </div>
        <button class="btn btn-small" onclick="studyPaid('alchemy','${recipe.id}')">研读(${costText})</button>
      </div>`;
    }
  } else {
    html += '<p style="color:#8b6914;font-size:13px;">所有丹方均已学会，去炼丹房炼制吧！</p>';
  }

  // 已学会丹方 - 可炼制（在私宅炼丹房使用丹炉）
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">⚗ 已学会丹方（需在私宅炼丹房用丹炉炼制）</h4>';
  const learned = info.recipes || [];
  if (learned.length === 0) {
    html += '<p style="color:#8b6914;font-size:13px;">还没有学会丹方，先研读丹方吧。</p>';
  }
  for (const recipe of learned) {
    const mats = (recipe.materials || []).map(m => {
      const have = p.inventory?.find(i => i.name === m.name)?.count || 0;
      const enough = have >= m.count;
      return `<span style="color:${enough ? '#228b22' : '#cd5c5c'};">${m.name}×${m.count}(${have})</span>`;
    }).join('，');
    const allEnough = (recipe.materials || []).every(m => (p.inventory?.find(i => i.name === m.name)?.count || 0) >= m.count);
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${recipe.name}（${recipe.tier}阶）</div>
        <div class="shop-item-desc">${recipe.desc || ''}</div>
        <div style="font-size:11px;">材料: ${mats}</div>
      </div>
      <button class="btn btn-small" ${allEnough ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'} onclick="refinePill('${recipe.id}')">炼制</button>
    </div>`;
  }
  html += '<p style="font-size:12px;color:#8b6914;margin-top:10px;">提示：在丹塔研读丹方后，回到私宅的炼丹房中即可用丹炉炼制。</p>';
  showAncientModal('丹塔·丹方藏经阁', html);
}

// 付费研读（藏经阁/器方阁/阵法师协会通用）
async function studyPaid(category, itemId) {
  const result = await api('/api/learn/paid', { category, itemId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  showAncientModal('研读结果', `<p style="text-align:center;padding:20px;">${result.msg}</p>`);
}

async function refinePill(recipeId) {
  gameState = await api('/api/alchemy/refine', { recipeId });
  if (gameState.error) gameNotify(gameState.error);
  renderAll();
  showAncientModal('炼丹结果', '<p style="text-align:center;padding:20px;">炼制完成！</p>');
}

async function forgeCreate(recipeId) {
  gameState = await api('/api/forge/create', { recipeId });
  if (gameState.error) gameNotify(gameState.error);
  renderAll();
  showAncientModal('炼器结果', '<p style="text-align:center;padding:20px;">锻造完成！</p>');
}

async function joinSect(sectId) {
  gameState = await api('/api/sect/join', { sectId });
  if (gameState.error) gameNotify(gameState.error);
  renderAll();
  closeModal('generic-modal');
}

async function showAchievements() {
  const data = await apiGet('/api/achievements');
  let html = `<p style="margin-bottom:10px;">已解锁: <b>${data.count || 0}/${data.total || 0}</b></p>`;
  html += '<div style="max-height:400px;overflow-y:auto;">';
  for (const ach of (data.unlocked || [])) {
    const rewardText = formatRewardText(ach.reward);
    html += `<div class="shop-item"><div class="shop-item-info">
      <div class="shop-item-name">🏆 ${ach.name}</div>
      <div class="shop-item-desc">${ach.desc || ''}</div>
      <div style="font-size:12px;color:#8b6914;margin-top:3px;">奖励：${rewardText}</div>
    </div>`;
    if (ach.claimed) {
      html += '<span style="color:#228b22;font-size:12px;">已领取</span>';
    } else {
      html += `<button class="btn btn-small" onclick="claimAchievement('${ach.id}')">领取</button>`;
    }
    html += '</div>';
  }
  for (const ach of (data.locked || [])) {
    const rewardText = formatRewardText(ach.reward);
    html += `<div class="shop-item" style="opacity:0.5;"><div class="shop-item-info">
      <div class="shop-item-name">🔒 ${ach.name}</div>
      <div class="shop-item-desc">${ach.desc || ''}</div>
      <div style="font-size:12px;color:#8b6914;margin-top:3px;">奖励：${rewardText}</div>
    </div></div>`;
  }
  html += '</div>';
  showAncientModal('成就', html);
}

function formatRewardText(reward) {
  if (!reward) return '无';
  const parts = [];
  if (reward.spiritStone) parts.push(`灵石×${reward.spiritStone}`);
  if (reward.silver) parts.push(`银两×${reward.silver}`);
  if (reward.exp) parts.push(`修为×${reward.exp}`);
  if (reward.title) parts.push(`称号：${reward.title}`);
  if (reward.item) parts.push(`${reward.item.name}×${reward.item.count}`);
  return parts.join('、') || '无';
}

async function claimAchievement(achId) {
  const result = await api('/api/achievements/claim', { achId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showAchievements(); renderTopBar(); });
}

async function showFormation() {
  const info = await apiGet('/api/formation');
  let html = `<p style="margin-bottom:10px;">阵法等级: <b>${info.level?.name || '阵徒'}</b></p>`;
  for (const f of (info.learned || [])) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${f.name}（${f.tier}阶）</div>
        <div class="shop-item-desc">${f.desc || ''}</div>
      </div>
      <button class="btn btn-small" onclick="activateFormation('${f.id}')">${info.active === f.id ? '撤阵' : '布阵'}</button>
    </div>`;
  }
  showAncientModal('阵法', html);
}

async function activateFormation(formationId) {
  gameState = await api('/api/formation/activate', { formationId });
  renderAll();
  showFormation();
}

async function showPets() {
  const info = await apiGet('/api/pets');
  let html = '<p style="color:#8b6914;margin-bottom:10px;font-size:13px;">灵宠可在秘境中捕捉，或购买灵兽蛋孵化；出战后可在战斗中提供辅助。投喂不同食物可获得晋升经验，满值晋升品级。</p>';
  // 灵兽蛋区（第九批）
  const eggs = info.eggs || [];
  html += '<h4 style="color:#5c3a1e;margin:10px 0 6px;">🐣 灵兽蛋（可孵化）</h4>';
  if (eggs.length === 0) {
    html += '<p style="color:#8b6914;font-size:12px;margin-bottom:8px;">暂无灵兽蛋，可前往兽灵山·灵宠蛋交易市场购买。</p>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;">';
    for (const egg of eggs) {
      const art = eggArtImg(egg.name);
      html += `<div class="shop-item" style="text-align:center;">
        <div style="text-align:center;min-height:52px;display:flex;align-items:center;justify-content:center;">${art}</div>
        <div class="shop-item-info">
          <div class="shop-item-name" style="font-size:12px;">${egg.name}</div>
          <div class="shop-item-desc">×${egg.count}</div>
        </div>
        <button class="btn btn-small" style="margin-top:4px;font-size:11px;padding:2px 8px;" onclick="hatchPet('${egg.name}')">孵化</button>
      </div>`;
    }
    html += '</div>';
  }
  if ((info.pets || []).length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:20px;">你还没有灵宠，去秘境中捕捉或孵化灵兽蛋吧！</p>';
  } else {
    html += '<h4 style="color:#5c3a1e;margin:10px 0;">我的灵宠</h4>';
    for (const pet of info.pets) {
      const tierColors = ['#8b6914', '#228b22', '#4169e1', '#9932cc', '#ff4500', '#ffd700'];
      const tierColor = tierColors[pet.tier - 1] || '#5c3a1e';
      const promotePct = pet.promoteExp ? Math.min(100, Math.round((pet.promoteCur || 0) / pet.promoteExp * 100)) : 0;
      html += `<div class="shop-item">
        <img src="images/lingchong/${pet.typeId}.jpg" onerror="this.style.display='none'" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0;">
        <div class="shop-item-info">
          <div class="shop-item-name" style="color:${tierColor};">${pet.name}（${pet.quality}）Lv.${pet.level}</div>
          <div class="shop-item-desc">攻击:${pet.stats.atk} 防御:${pet.stats.def} 速度:${pet.stats.spd} 气血:${pet.stats.hp}</div>
          <div style="font-size:12px;color:#8b6914;">技能:${pet.skill} | 忠诚:${pet.loyalty} | 饥饿:${pet.hunger}</div>
          <div style="font-size:11px;color:#c9a97a;margin-top:3px;">晋升经验: ${pet.promoteCur || 0}/${pet.promoteExp}</div>
          <div style="height:5px;background:rgba(139,90,43,0.2);border-radius:3px;margin-top:3px;"><div style="height:100%;width:${promotePct}%;background:linear-gradient(90deg,#b8860b,#ffd700);border-radius:3px;"></div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          <button class="btn btn-small" onclick="setActivePet('${pet.id}')">${pet.isActive ? '休息' : '出战'}</button>
          <button class="btn btn-small" onclick="feedPet('${pet.id}')">喂养(20灵石)</button>
          <button class="btn btn-small" onclick="feedPetItem('${pet.id}')">🍖 投喂晋升</button>
        </div>
      </div>`;
    }
  }
  showAncientModal('灵宠', html);
}

// ===== 灵宠地图页面（需求：角色页灵宠按钮 → 新地图界面，三栏布局）=====
function openPetMap() { switchPage('pet'); }

// ===== 灵宠地图页（需求：顶部5按钮[返回/灵宠列表/灵宠蛋列表/总记事/刷新] + 下方列表区，亮色大字）=====
let petTab = 'pets'; // pets | eggs | journal
async function renderPetMap() {
  const el = document.getElementById('pet-map-content');
  if (!el) return;
  el.innerHTML = '<p style="text-align:center;color:#333;padding:30px;">加载中…</p>';
  let info;
  try { info = await apiGet('/api/pets'); } catch (e) { el.innerHTML = '<p style="color:#cd5c5c;text-align:center;padding:30px;">灵宠数据加载失败</p>'; return; }
  const pets = info.pets || [];
  const eggs = info.eggs || [];
  const p = gameState.player;
  const followCount = pets.filter(x => x.following).length;

  // 顶部按钮区
  const btnBar = `<div style="display:flex;gap:8px;justify-content:center;align-items:center;padding:10px 0;flex-wrap:wrap;">
    <button class="btn btn-small" style="font-size:13px;background:#5c3a1e;color:#fff;" onclick="switchPage('character')">⬅ 返回</button>
    <button class="btn btn-small" style="font-size:13px;${petTab==='pets'?'background:#8b4513;color:#fff;':''}" onclick="switchPetTab('pets')">🐾 灵宠列表（${pets.length}）</button>
    <button class="btn btn-small" style="font-size:13px;${petTab==='eggs'?'background:#8b4513;color:#fff;':''}" onclick="switchPetTab('eggs')">🥚 灵宠蛋列表（${eggs.length}）</button>
    <button class="btn btn-small" style="font-size:13px;${petTab==='journal'?'background:#8b4513;color:#fff;':''}" onclick="switchPetTab('journal')">📜 总记事</button>
    <button class="btn btn-small" style="font-size:13px;" onclick="renderPetMap()">🔄 刷新</button>
    <span style="font-size:12px;color:#228b22;font-weight:bold;">跟随中：${followCount}/3</span>
  </div>`;

  // 灵宠列表（亮色、大字、白改黑）
  let listHtml = '';
  if (pets.length === 0) {
    listHtml = '<div style="text-align:center;color:#444;padding:30px;font-size:14px;">你还没有灵宠<br>可去秘境捕捉，或孵化灵兽蛋</div>';
  } else {
    listHtml = '<table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;">';
    listHtml += '<tr style="background:#f5e6c8;color:#1a1a1a;font-weight:bold;"><th style="padding:8px;text-align:left;">姓名</th><th>性别</th><th>性格</th><th>品级</th><th>成长期</th><th>状态</th></tr>';
    for (const pet of pets) {
      const stageColor = pet.growthStage === '幼年期' ? '#b8860b' : pet.growthStage === '少年期' ? '#228b22' : '#1e40af';
      listHtml += `<tr style="border-bottom:1px solid #ddd;color:#222;">
        <td style="padding:8px 6px;"><a href="javascript:void(0)" onclick="showPetPanel('${pet.id}')" style="color:#8b4513;font-weight:bold;text-decoration:underline;cursor:pointer;font-size:14px;">${pet.name}</a>${pet.following ? ' <span style="color:#228b22;font-weight:bold;">⚔️跟随中</span>' : ''}${pet.isPregnant ? ' <span style="color:#cd5c5c;">🤰</span>' : ''}</td>
        <td style="text-align:center;color:#333;">${pet.gender || '—'}</td>
        <td style="text-align:center;color:#333;">${pet.personality || '—'}</td>
        <td style="text-align:center;color:#333;">${pet.quality || '—'} Lv.${pet.level || 1}</td>
        <td style="text-align:center;color:${stageColor};">${pet.growthStage || '幼年期'}</td>
        <td style="text-align:center;color:#333;">${pet.status || ''}</td>
      </tr>`;
    }
    listHtml += '</table>';
  }

  // 灵宠蛋列表（亮色）
  let eggHtml = '';
  if (eggs.length === 0) {
    eggHtml = '<div style="text-align:center;color:#444;padding:30px;font-size:14px;">暂无灵宠蛋<br>可去兽灵山购买，或等灵宠交配产蛋</div>';
  } else {
    eggHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:6px;">';
    for (const egg of eggs) {
      const art = eggArtImg(egg.name);
      eggHtml += `<div style="text-align:center;padding:10px;background:#fff;border-radius:8px;border:1px solid #bbb;">
        <div style="min-height:56px;display:flex;align-items:center;justify-content:center;">${art}</div>
        <div style="font-size:14px;color:#222;margin-top:4px;">${egg.name} ×${egg.count}</div>
        <button class="btn btn-small" style="margin-top:4px;font-size:12px;" onclick="hatchPet('${egg.name}')">孵化</button>
      </div>`;
    }
    eggHtml += '</div>';
  }

  // 总记事（亮色、倒序、滚动）
  let journalHtml = '';
  const allJ = [];
  for (const pet of pets) {
    for (const j of (pet.journal || [])) {
      allJ.push({ pet: pet.name, time: j.time, msg: j.msg, type: j.type });
    }
  }
  allJ.sort((a, b) => (b.time || '').localeCompare(a.time || '') || 0);
  if (allJ.length === 0) {
    journalHtml = '<div style="text-align:center;color:#444;padding:30px;font-size:14px;">暂无灵宠记事</div>';
  } else {
    journalHtml = `<div style="max-height:480px;overflow-y:auto;padding:4px;background:#fff;border-radius:8px;border:1px solid #ddd;">${allJ.map(j => `<div style="padding:8px 6px;border-bottom:1px solid #eee;font-size:14px;">
      <span style="color:#8b6914;font-size:12px;">${j.time || ''}·${j.pet}：</span><span style="color:#1a1a1a;">${j.msg}</span>
    </div>`).join('')}</div>`;
  }

  const tabHtml = petTab === 'pets' ? listHtml : petTab === 'eggs' ? eggHtml : journalHtml;
  const tabTitle = petTab === 'pets' ? `🐾 灵宠列表（${pets.length}）` : petTab === 'eggs' ? `🥚 灵宠蛋列表（${eggs.length}）` : '📜 灵宠总记事';
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;">
    ${btnBar}
    <div style="background:rgba(255,255,255,0.92);border-radius:10px;border:1px solid #8b5a2b;padding:12px;">
      <div style="text-align:center;font-weight:bold;color:#1a1a1a;padding:6px;border-bottom:2px solid #8b5a2b;margin-bottom:8px;font-size:15px;">${tabTitle}</div>
      ${tabHtml}
    </div>
  </div>`;
}

// 切换灵宠地图列表页签
function switchPetTab(tab) {
  petTab = tab;
  renderPetMap();
}

// ===== 灵宠面板（需求：左立绘+属性、中效果区、右交互按钮区）=====
let currentPetPanelId = null;
async function showPetPanel(petId) {
  const result = await api('/api/pet/panel', { petId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  currentPetPanelId = petId;
  const pet = result.pet;
  const tierColor = ['#8b6914', '#228b22', '#4169e1', '#9932cc', '#ff4500', '#ffd700'][(pet.tier || 1) - 1] || '#5c3a1e';
  const img = `<img src="images/lingchong/${pet.typeId}.jpg" onerror="this.style.display='none'" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:2px solid ${tierColor};box-shadow:0 2px 8px rgba(0,0,0,0.3);">`;

  // 属性面板
  const attrs = [
    ['品级', `${pet.quality} Lv.${pet.level || 1}`], ['性别', pet.gender], ['性格', pet.personality],
    ['成长期', pet.growthStage], ['攻击', pet.stats.atk], ['防御', pet.stats.def],
    ['速度', pet.stats.spd], ['气血', `${pet.stats.hp}/${pet.stats.maxHp}`], ['技能', pet.skill],
    ['忠诚', pet.loyalty], ['饥饿', pet.hunger], ['状态', pet.status],
  ];
  let attrHtml = '';
  for (const [k, v] of attrs) attrHtml += `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dashed rgba(139,90,43,0.2);"><span style="color:#8b6914;">${k}</span><b style="color:#3d2817;">${v}</b></div>`;

  const html = `<div style="display:grid;grid-template-columns:230px 1fr 150px;gap:12px;min-height:420px;">
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="text-align:center;padding:12px;background:rgba(139,90,43,0.1);border-radius:10px;border:1px solid rgba(139,90,43,0.3);">
        ${img}
        <div style="margin-top:6px;font-weight:bold;color:${tierColor};font-size:15px;">${pet.name}</div>
        <div style="color:#8b6914;font-size:11px;">${pet.desc || ''}</div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:6px;">
          <button class="btn btn-small" onclick="renamePetUI('${pet.id}')">✏️ 改名</button>
          <button class="btn btn-small" style="${pet.following ? 'background:#c0392b;color:#fff;' : ''}" onclick="petFollowToggle('${pet.id}')">${pet.following ? '🚫 取消跟随' : '⚔️ 跟随'}</button>
        </div>
        <div style="font-size:11px;color:#228b22;margin-top:4px;">${pet.following ? '跟随中：参与战斗，属性+20%' : '跟随：参与战斗并获得加成'}</div>
      </div>
      <div style="padding:10px;background:rgba(139,90,43,0.1);border-radius:10px;border:1px solid rgba(139,90,43,0.3);flex:1;overflow-y:auto;">${attrHtml}</div>
    </div>
    <div style="padding:12px;background:rgba(139,90,43,0.06);border-radius:10px;border:1px solid rgba(139,90,43,0.3);">
      <div style="text-align:center;font-weight:bold;color:#5c3a1e;border-bottom:1px solid #8b5a2b;padding-bottom:5px;margin-bottom:8px;">效果显示区</div>
      <div id="pet-effect-area" style="font-size:13px;color:#3d2817;line-height:1.8;max-height:360px;overflow-y:auto;">点击右侧按钮与${pet.name}互动</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;padding-top:40px;">
      <button class="btn" onclick="petFeedUI('${pet.id}')">🍖 投喂</button>
      <button class="btn" onclick="petStroke('${pet.id}')">🤲 抚摸</button>
      <button class="btn" onclick="showPetFamilyEffect('${pet.id}')">🌳 家族网</button>
      <button class="btn" onclick="showPetJournalEffect('${pet.id}')">📜 记事</button>
    </div>
  </div>`;
  showAncientModal('🐾 灵宠面板', html);
}

// 跟随/取消跟随
async function petFollowToggle(petId) {
  const r = await api('/api/pet/follow', { petId });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  // 重开面板刷新按钮状态并在效果区显示结果
  closeModal('generic-modal');
  await showPetPanel(petId);
  setPetEffect(`⚔️ ${r.msg}`);
}

// 投喂（表格弹窗：名称|效果|库存|投喂数量|操作|刷新；选择数量后投喂，成功回到灵宠面板）
async function petFeedUI(petId) {
  const result = await api('/api/pet/panel', { petId });
  if (result.error) { gameNotify(result.error); return; }
  const feedable = result.feedable || [];
  if (feedable.length === 0) { gameNotify('背包中没有该灵宠可食用的食物或菜品'); return; }
  const pet = result.pet;
  let rows = '';
  for (const f of feedable) {
    const effect = f.dish
      ? `经验${f.gain >= 0 ? '+' : ''}${f.gain}，好感${f.favor >= 0 ? '+' : ''}${f.favor}`
      : `经验+${f.gain}`;
    const qColor = f.quality === '神品' ? '#ff4500' : f.quality === '珍品' ? '#4169e1' : f.quality === '良品' ? '#228b22' : '#8b6914';
    rows += `<tr style="border-bottom:1px solid #ddd;background:#fff;">
      <td style="padding:6px 4px;color:#222;font-size:13px;">${f.name}</td>
      <td style="padding:6px 4px;color:${qColor};font-size:13px;text-align:center;">${f.quality || '—'}</td>
      <td style="padding:6px 4px;color:${f.favor < 0 ? '#cd5c5c' : '#228b22'};font-size:13px;">${effect}</td>
      <td style="padding:6px 4px;color:#333;font-size:13px;text-align:center;">${f.count}</td>
      <td style="padding:6px 4px;text-align:center;"><input type="number" id="feed-count-${f.name}" value="1" min="1" max="${f.count}" style="width:58px;padding:4px;border:1px solid #c9a961;border-radius:4px;background:#fff8ec;color:#222;font-size:13px;text-align:center;"></td>
      <td style="padding:6px 4px;text-align:center;"><button class="btn btn-small" style="font-size:12px;" onclick="doFeedItem('${petId}', '${f.name}', ${f.count})">投喂</button></td>
      <td style="padding:6px 4px;text-align:center;"><button class="btn btn-small" style="font-size:12px;" onclick="petFeedUI('${petId}')">刷新</button></td>
    </tr>`;
  }
  const html = `<div style="max-height:430px;overflow-y:auto;">
    <div style="text-align:center;color:#5c3a1e;font-size:13px;margin-bottom:8px;">可投喂给【<b style="color:#8b4513;">${pet.name}</b>】的物品（菜品对灵宠有增/减效益，投喂数量不能超过库存）</div>
    <table style="width:100%;border-collapse:collapse;background:#fff;">
      <tr style="background:#f5e6c8;color:#1a1a1a;font-weight:bold;">
        <th style="padding:6px;">名称</th><th>品级</th><th>效果</th><th>库存</th><th>投喂数量</th><th>操作</th><th>刷新</th>
      </tr>
      ${rows}
    </table>
  </div>`;
  showAncientModal('🍖 投喂', html);
}

// 执行投喂（读输入数量→调API→成功关闭弹窗回灵宠面板）
async function doFeedItem(petId, foodName, maxCount) {
  const inp = document.getElementById(`feed-count-${foodName}`);
  let count = inp ? parseInt(inp.value, 10) : 1;
  if (!count || count < 1) count = 1;
  if (count > maxCount) count = maxCount;
  const r = await api('/api/pet/feeditem', { petId, foodName, count });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  // 界面消失，回到灵宠面板（效果区显示投喂结果）
  closeModal('generic-modal');
  await showPetPanel(petId);
  setPetEffect(`🍖 ${r.msg}`);
}

// 抚摸（随机抚摸事件显示在效果区）
async function petStroke(petId) {
  const r = await api('/api/pet/stroke', { petId });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  setPetEffect(`🤲 ${r.msg}（好感度↑）`);
}

// 家族关系网（显示在效果区，不弹窗）
async function showPetFamilyEffect(petId) {
  const result = await api('/api/pet/panel', { petId });
  if (result.error) { gameNotify(result.error); return; }
  const family = result.family || [];
  const rels = result.relations || [];
  let html = '<div style="max-height:360px;overflow-y:auto;font-size:12px;">';
  html += '<div style="font-weight:bold;color:#5c3a1e;margin-bottom:6px;">🌳 血缘家族</div>';
  if (family.length === 0) html += '<div style="color:#8b6914;padding:6px;">暂无血缘亲属（交配产蛋孵化后产生）</div>';
  else {
    for (const f of family) {
      html += `<div style="padding:5px 4px;border-bottom:1px solid rgba(139,90,43,0.15);"><a href="javascript:void(0)" onclick="showPetPanel('${f.id}')" style="color:#8b4513;text-decoration:underline;">${f.name}</a> <span style="color:#8b6914;">（${f.rel}）</span> <span style="color:#5c3a1e;">好感：${f.favor !== undefined ? f.favor : '—'}</span></div>`;
    }
  }
  html += '<div style="font-weight:bold;color:#5c3a1e;margin:10px 0 6px;">🤝 与其他灵宠关系</div>';
  if (rels.length === 0) html += '<div style="color:#8b6914;padding:6px;">暂无关系记录</div>';
  else {
    for (const r of rels) {
      html += `<div style="padding:5px 4px;border-bottom:1px solid rgba(139,90,43,0.15);"><a href="javascript:void(0)" onclick="showPetPanel('${r.id}')" style="color:#8b4513;text-decoration:underline;">${r.name}</a>（${r.gender}·${r.growthStage}） <span style="color:#8b6914;">${r.type}</span> <span style="color:#5c3a1e;">好感：${r.favor}</span></div>`;
    }
  }
  html += '</div>';
  setPetEffect(html);
}

// 灵宠记事（显示在效果区，不弹窗）
async function showPetJournalEffect(petId) {
  const result = await api('/api/pet/panel', { petId });
  if (result.error) { gameNotify(result.error); return; }
  const pet = result.pet;
  const js = (pet.journal || []).slice().reverse();
  let html = `<div style="max-height:360px;overflow-y:auto;font-size:12px;"><div style="text-align:center;font-weight:bold;color:#5c3a1e;padding-bottom:6px;margin-bottom:6px;border-bottom:1px solid #8b5a2b;">${pet.name}的记事（${js.length}）</div>`;
  if (js.length === 0) html += '<div style="color:#8b6914;padding:10px;text-align:center;">暂无记事</div>';
  else {
    for (const j of js) {
      html += `<div style="padding:6px 4px;border-bottom:1px dashed rgba(139,90,43,0.2);"><span style="color:#8b6914;">${j.time || ''}：</span><span style="color:#3d2817;">${j.msg}</span></div>`;
    }
  }
  html += '</div>';
  setPetEffect(html);
}

// 改名
async function renamePetUI(petId) {
  gamePrompt('输入新的灵宠名字（最多8字）：', '', async (newName) => {
    if (!newName) return;
    const r = await api('/api/pet/rename', { petId, newName });
    if (r.error) { gameNotify(r.error); return; }
    if (r.state) gameState = r.state;
    gameNotify(r.msg, '提示', () => { closeModal('generic-modal'); showPetPanel(petId); });
  }, '改名');
}

// 效果区写入
function setPetEffect(html) {
  const el = document.getElementById('pet-effect-area');
  if (!el) return;
  el.innerHTML += `<div style="margin-bottom:6px;">${html}</div>`;
  el.scrollTop = el.scrollHeight;
}

// 灵兽蛋立绘（images/pet/eggs/ 下，按名称映射）
function eggArtImg(eggName) {
  // 血脉蛋：血脉·XXX蛋 → 取XXX匹配类型立绘
  let petName = eggName.replace(/蛋$/, '');
  if (petName.startsWith('血脉·')) petName = petName.replace('血脉·', '');
  const map = {
    '灵鼠': 'egg_fan_1.png', '灵猫': 'egg_fan_1.png', '灵貂': 'egg_fan_1.png', '灵雀': 'egg_fan_2.png', '彩蝶': 'egg_fan_2.png',
    '玉兔': 'egg_fan_3.png', '苍狼': 'egg_fan_3.png', '哮天犬': 'egg_fan_3.png', '灵猴': 'egg_fan_3.png', '山魈': 'egg_fan_3.png',
    '青鳞蛇': 'egg_fan_4.png', '锦鲤': 'egg_fan_4.png',
    '黑熊': 'egg_good_1.png', '独角犀': 'egg_good_1.png', '银狼王': 'egg_good_1.png',
    '仙鹤': 'egg_good_2.png', '玄龟': 'egg_good_4.png', '金蟾': 'egg_good_4.png', '冰蛛': 'egg_good_4.png',
    '白虎': 'egg_rare_1.png', '雷豹': 'egg_rare_1.png', '赤炎狮': 'egg_rare_1.png', '紫电貂': 'egg_rare_1.png',
    '金翅大鹏': 'egg_rare_2.png', '火麒麟': 'egg_rare_3.png', '九色鹿': 'egg_rare_3.png',
    '朱雀': 'egg_god_2.png', '九尾狐': 'egg_god_3.png', '白泽': 'egg_god_3.png', '青龙': 'egg_god_3.png',
    '玄武': 'egg_god_4.png', '混沌兽': 'egg_god_4.png',
  };
  const file = map[petName] || 'egg_fan_1.png';
  return `<img src="images/pet/eggs/${file}" style="width:34px;height:34px;object-fit:cover;border-radius:50%;border:1px solid rgba(139,90,43,0.4);display:inline-block;" onerror="this.style.display='none'">`;
}

async function hatchPet(eggName) {
  const result = await api('/api/pet/hatch', { eggName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  if (result.pet) {
    const pet = result.pet;
    showAncientModal('孵化结果', `<div style="text-align:center;padding:12px 16px;">
      <img src="images/lingchong/${pet.typeId}.jpg" onerror="this.style.display='none'" alt="${escapeHtml(pet.name || '')}" style="width:150px;height:150px;object-fit:cover;border-radius:10px;margin:0 auto 12px;display:block;box-shadow:0 2px 10px rgba(0,0,0,0.3);">
      <p style="color:#5c3a1e;font-size:14px;line-height:1.8;">${escapeHtml(result.msg || '孵化完成')}</p>
      <div style="text-align:center;margin-top:16px;"><button class="btn btn-primary" onclick="closeModal('generic-modal'); showPets(); renderTopBar();">确认</button></div>
    </div>`);
  } else {
    gameNotify(result.msg || '孵化完成', '提示', () => { showPets(); renderTopBar(); });
  }
}

async function feedPetItem(petId) {
  const p = gameState.player;
  const pet = (p.pets || []).find(pt => pt.id === petId);
  if (!pet) return;
  const foods = Object.keys(pet.feedValues || {});
  const owned = foods.filter(f => (p.inventory || []).some(i => i.name === f && i.count > 0));
  if (owned.length === 0) { gameNotify('背包中没有可投喂的食物（灵草/灵谷/妖兽肉/灵兽口粮/灵果/洗髓丹），可在兽灵山·灵兽用品区购买'); return; }
  gamePrompt(`选择投喂给【${pet.name}】的食物：\n${owned.map(f => `${f}（+${pet.feedValues[f]}经验）`).join('\n')}`, owned[0], async (foodName) => {
    if (!foodName) return;
    const r = await api('/api/pet/feeditem', { petId, foodName });
    if (r.error) { gameNotify(r.error); return; }
    if (r.state) gameState = r.state;
    gameNotify(r.msg, '提示', () => { showPets(); renderTopBar(); });
  }, '投喂晋升');
}

// 灵宠蛋交易市场（兽灵山，第九批）
async function showPetEggMarket() {
  const info = await apiGet('/api/pet/eggshop');
  const p = gameState.player;
  let html = '<p style="color:#8b6914;font-size:13px;margin-bottom:10px;">此处出售各品级灵兽蛋，购买后可在背包或灵宠页孵化。孵化有概率得到死蛋，也可能孵化出稀有品级！</p>';
  html += `<div style="margin-bottom:10px;">灵石: <b style="color:#00ced1;">${p.spiritStone || 0}</b></div>`;
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-height:400px;overflow-y:auto;">';
  for (const egg of (info.eggs || [])) {
    const tierColors = ['#8b6914', '#228b22', '#4169e1', '#9932cc', '#ff4500', '#ffd700'];
    const tc = tierColors[egg.tier - 1] || '#5c3a1e';
    html += `<div class="shop-item" style="text-align:center;">
      ${eggArtImg(egg.name)}
      <div class="shop-item-info">
        <div class="shop-item-name" style="font-size:12px;color:${tc};">${egg.name}</div>
        <div class="shop-item-desc" style="color:#b8860b;">${egg.price} 灵石</div>
      </div>
      <button class="btn btn-small" style="margin-top:4px;font-size:11px;padding:2px 8px;" onclick="buyPetEgg('${egg.name}')">购买</button>
    </div>`;
  }
  html += '</div>';
  showAncientModal('🥚 灵宠蛋交易市场', html);
}

async function buyPetEgg(eggName) {
  const r = await api('/api/pet/buyegg', { eggName });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  gameNotify(r.msg || '购买成功', '提示', () => { showPetEggMarket(); renderTopBar(); });
}

// 灵兽用品区（兽灵山，第九批）
async function showPetSupplyShop() {
  const info = await apiGet('/api/pet/eggshop');
  const p = gameState.player;
  let html = `<p style="color:#8b6914;font-size:13px;margin-bottom:10px;">灵兽用品：投喂食物可提升晋升经验，捕兽网与灵兽袋可提高捕捉成功率。</p>
  <div style="margin-bottom:10px;">灵石: <b style="color:#00ced1;">${p.spiritStone || 0}</b></div>`;
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:400px;overflow-y:auto;">';
  for (const s of (info.supplies || [])) {
    html += `<div class="shop-item" style="text-align:center;">
      <div class="shop-item-info">
        <div class="shop-item-name" style="font-size:12px;">${s.name}</div>
        <div class="shop-item-desc" style="font-size:11px;">${s.desc}</div>
        <div style="color:#b8860b;font-size:12px;">${s.price} 灵石</div>
      </div>
      <button class="btn btn-small" style="margin-top:4px;font-size:11px;padding:2px 8px;" onclick="buyPetSupply('${s.name}')">购买</button>
    </div>`;
  }
  html += '</div>';
  showAncientModal('🎒 灵兽用品区', html);
}

async function buyPetSupply(supplyName) {
  const r = await api('/api/pet/buysupply', { supplyName });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  gameNotify(r.msg || '购买成功', '提示', () => { showPetSupplyShop(); renderTopBar(); });
}

async function setActivePet(petId) {
  const result = await api('/api/pet/active', { petId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  showPets();
  renderTopBar();
}

async function feedPet(petId) {
  const result = await api('/api/pet/feed', { petId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showPets(); renderTopBar(); });
}

async function captureMount() {
  const result = await api('/api/mounts/capture', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  // 重新显示坐骑界面并带上结果
  const info = await apiGet('/api/mounts');
  let html = '<button class="btn" style="margin-bottom:10px;" onclick="captureMount()">捕捉坐骑</button>';
  // 捕捉结果显示区
  html += '<div id="mount-capture-result" style="margin-bottom:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;border-left:3px solid #8b5a2b;">';
  if (result.success) {
    html += `
      <div style="color:#228b22;font-weight:bold;margin-bottom:5px;">捕捉成功！</div>
      <div style="font-size:13px;color:#5c3a1e;">${result.text || '你成功捕捉了一只坐骑！'}</div>
      ${result.mount ? `<div style="margin-top:8px;padding:8px;background:rgba(34,139,34,0.1);border-radius:4px;">
        <b>${result.mount.name}</b>（${result.mount.quality}）<br>
        速度×${(result.mount.speed||1).toFixed(1)} 攻击+${result.mount.atkBonus||0} 防御+${result.mount.defBonus||0}
      </div>` : ''}
    `;
  } else {
    html += `
      <div style="color:#cd5c5c;font-weight:bold;margin-bottom:5px;">捕捉失败</div>
      <div style="font-size:13px;color:#5c3a1e;">${result.text || '坐骑逃跑了，下次再试试吧。'}</div>
    `;
  }
  html += '</div>';

  if ((info.mounts || []).length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:20px;">你还没有坐骑</p>';
  } else {
    html += '<h4 style="color:#5c3a1e;margin:10px 0;">我的坐骑</h4>';
    for (const m of info.mounts) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${m.name}（${m.quality}）Lv.${m.level}</div>
          <div class="shop-item-desc">速度×${(m.speed||1).toFixed(1)} 攻击+${m.atkBonus||0} 防御+${m.defBonus||0}</div>
        </div>
        <button class="btn btn-small" onclick="setActiveMount('${m.id}')">${m.isActive ? '下骑' : '骑乘'}</button>
      </div>`;
    }
  }
  showAncientModal('坐骑', html);
}

async function setActiveMount(mountId) {
  gameState = await api('/api/mounts/activate', { mountId });
  renderAll();
  showMounts();
}

async function showTitles() {
  const info = await apiGet('/api/titles');
  let html = `<p style="margin-bottom:10px;">已解锁: <b>${info.count || 0}/${info.total || 0}</b></p>`;
  for (const t of (info.unlocked || [])) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${t.name}</div>
        <div class="shop-item-desc">${t.desc || ''}</div>
      </div>
      <button class="btn btn-small" onclick="equipTitle('${t.id}')">${info.active === t.id ? '卸下' : '装备'}</button>
    </div>`;
  }
  showAncientModal('称号', html);
}

async function equipTitle(titleId) {
  gameState = await api('/api/titles/equip', { titleId });
  renderAll();
  showTitles();
}

let currentDungeon = null;
let currentDungeonFloor = 1;

async function enterDungeon(dungeonId) {
  const result = await api('/api/dungeons/enter', { dungeonId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  currentDungeon = result.dungeon || dungeonId;
  currentDungeonFloor = (result.state && result.state.player && result.state.player.dungeonState && result.state.player.dungeonState.floor) || 0;
  currentDungeonFloor = currentDungeonFloor + 1; // 下一层即起始层
  closeModal('generic-modal');

  // 设置副本地图背景（ditu 缺图时回退副本空间背景）
  const bgEl = document.getElementById('dungeon-map-bg');
  const dungeonData = (await apiGet('/api/dungeons')).find(d => d.id === dungeonId);
  if (dungeonData) {
    const probe = new Image();
    probe.onload = () => { bgEl.style.backgroundImage = `url('images/ditu/${dungeonData.location}.jpg')`; };
    probe.onerror = () => { bgEl.style.backgroundImage = "url('images/worldmap/special.jpg')"; };
    probe.src = `images/ditu/${dungeonData.location}.jpg`;
    document.getElementById('dungeon-map-title').textContent = dungeonData.name;
  }
  document.getElementById('dungeon-floor-info').textContent = `第${currentDungeonFloor}层`;
  document.getElementById('dungeon-event-log').innerHTML = '<p>你进入了秘境，四周一片寂静...</p>';
  updateDungeonStats();
  switchPage('dungeon');
}

function updateDungeonStats() {
  const p = gameState.player;
  document.getElementById('dungeon-player-hp').textContent = `${p.hp.current}/${p.hp.max}`;
  document.getElementById('dungeon-player-mp').textContent = `${p.mp.current}/${p.mp.max}`;
  document.getElementById('dungeon-player-exp').textContent = p.cultivationExp;
}

function addDungeonLog(msg) {
  const logEl = document.getElementById('dungeon-event-log');
  const p = document.createElement('p');
  p.textContent = msg;
  logEl.appendChild(p);
  logEl.scrollTop = logEl.scrollHeight;
}

async function dungeonExplore() {
  const result = await api('/api/dungeons/explore', { dungeonId: currentDungeon, floor: currentDungeonFloor });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  updateDungeonStats();

  if (result.event) {
    addDungeonLog(result.event.text || result.event);
  }
  if (result.rewards) {
    const rewardText = result.rewards.map(r => `${r.name}×${r.count || 1}`).join('、');
    addDungeonLog(`获得：${rewardText}`);
  }
  if (result.effects) {
    for (const [key, val] of Object.entries(result.effects)) {
      const keyMap = { hp: '气血', mp: '灵力', cultivationExp: '修为', silver: '银两', spiritStone: '灵石' };
      addDungeonLog(`${keyMap[key] || key} ${val > 0 ? '+' : ''}${val}`);
    }
  }
  if (result.encounter) {
    showDungeonEncounter(result.encounter);
  }
  if (result.combat) {
    addDungeonLog('遭遇敌人！进入战斗...');
    setTimeout(() => startCombat(result.enemyId || null), 1000);
  }
  if (result.nextFloor) {
    currentDungeonFloor++;
    document.getElementById('dungeon-floor-info').textContent = `第${currentDungeonFloor}层`;
    addDungeonLog(`你发现了通往下一层的通道，进入第${currentDungeonFloor}层。`);
  }
}

// 副本奇遇三选一弹窗
function showDungeonEncounter(enc) {
  let html = `<h3 style="color:#5c3a1e;margin-bottom:8px;">✨ 奇遇·${enc.title}</h3>`;
  html += `<p style="color:#3d2817;font-size:14px;margin-bottom:14px;line-height:1.7;">${enc.desc}</p>`;
  for (let i = 0; i < (enc.options || []).length; i++) {
    const o = enc.options[i];
    html += `<div class="shop-item" style="cursor:pointer;margin-bottom:8px;" onclick="resolveDungeonEncounter('${enc.id}', ${i})">
      <div class="shop-item-info">
        <div class="shop-item-name">${o.text}</div>
        <div class="shop-item-desc">${o.desc || ''}</div>
      </div>
    </div>`;
  }
  showAncientModal('✨ 奇遇', html);
}

async function resolveDungeonEncounter(encounterId, optionIndex) {
  const result = await api('/api/dungeons/encounter', { dungeonId: currentDungeon, encounterId, optionIndex });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  updateDungeonStats();
  addDungeonLog(result.msg || '');
  renderAll();
}

async function dungeonGather() {
  // 禁用按钮
  const actions = document.getElementById('dungeon-actions');
  if (actions) actions.style.pointerEvents = 'none';

  const result = await api('/api/gather', { gatherType: '秘境采集' });
  if (result.error) {
    if (actions) actions.style.pointerEvents = 'auto';
    gameNotify(result.error);
    return;
  }
  if (result.state) gameState = result.state;

  addDungeonLog(result.msg);

  // 检查气血是否归零
  if (gameState.player.hp.current <= 0) {
    addDungeonLog('气血归零，自动离开秘境！');
    setTimeout(() => exitDungeon(), 1000);
    return;
  }

  if (result.encounteredBeast) {
    const beast = result.encounteredBeast;
    // 弹出弹窗选择战斗还是逃跑
    gameConfirm(`遭遇【${beast.name}】（${beast.tierName}）！\n气血：${beast.hp} | 灵力：${beast.mp} | 攻击：${beast.atk} | 防御：${beast.def}\n\n是否战斗？`, () => {
      startBeastBattle(beast);
    }, '遭遇妖兽', () => {
      // 逃跑概率计算：根据双方身法和修为
      const playerAgility = gameState.player.attributes?.agility || gameState.player.agility || 10;
      const playerRealm = gameState.player.realmLevel || 1;
      const beastAgility = beast.agility || 10;
      const beastTier = beast.tier || 1;
      const fleeChance = Math.min(90, Math.max(10, 50 + (playerAgility - beastAgility) * 2 + (playerRealm - beastTier) * 10));
      const fleeSuccess = Math.random() * 100 < fleeChance;
      if (fleeSuccess) {
        addDungeonLog(`你成功逃脱了【${beast.name}】的追击！（逃跑概率${fleeChance}%）`);
      } else {
        addDungeonLog(`逃跑失败！【${beast.name}】追上了你，被迫战斗！（逃跑概率${fleeChance}%）`);
        startBeastBattle(beast);
      }
    });
  } else if (result.encounteredPet) {
    const pet = result.encounteredPet;
    // 弹出弹窗选择捕捉还是放弃
    gameConfirm(`发现灵宠【${pet.name}】（${pet.quality}）！\n攻击：${pet.stats.atk} | 防御：${pet.stats.def} | 速度：${pet.stats.spd} | 气血：${pet.stats.hp}\n技能：${pet.skill}\n\n是否捕捉？`, () => {
      currentPendingPet = pet;
      // 捕捉战斗：将灵宠转换为妖兽战斗格式
      const petBeast = {
        name: pet.name,
        tier: pet.tier,
        tierName: ['凡品', '良品', '珍品', '神品', '仙品', '神品'][pet.tier - 1] || '凡品',
        hp: pet.stats.hp,
        maxHp: pet.stats.hp,
        mp: 50,
        maxMp: 50,
        atk: pet.stats.atk,
        def: pet.stats.def,
        agility: pet.stats.spd,
        exp: 0,
        isPet: true,
        petData: pet,
      };
      startBeastBattle(petBeast);
    }, '发现灵宠', () => {
      addDungeonLog(`你放弃了捕捉【${pet.name}】。`);
    });
  }

  // 刷新数值
  updateDungeonStats();
  if (actions) actions.style.pointerEvents = 'auto';
}

function updateDungeonStats() {
  const p = gameState.player;
  const hpEl = document.getElementById('dungeon-player-hp');
  const mpEl = document.getElementById('dungeon-player-mp');
  const expEl = document.getElementById('dungeon-player-exp');
  if (hpEl) hpEl.textContent = `${p.hp.current}/${p.hp.max}`;
  if (mpEl) mpEl.textContent = `${p.mp.current}/${p.mp.max}`;
  if (expEl) expEl.textContent = p.cultivationExp;
}

async function exitDungeon() {
  const result = await api('/api/dungeons/exit', { dungeonId: currentDungeon });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  currentDungeon = null;
  currentDungeonFloor = 1;
  switchPage('map');
  renderAll();
  renderTopBar();
}

// ===== 宅子系统 =====
async function renderMansionPage() {
  const info = await apiGet('/api/mansion');
  document.getElementById('mansion-title').textContent = info.name || '我的宅子';
  // 按宅子等级切换背景图
  const bgKey = info.levelInfo?.bg || 'cottage';
  const bgEl = document.getElementById('mansion-bg');
  if (bgEl) bgEl.style.backgroundImage = `url('images/mansions/${bgKey}.jpg')`;

  let html = `<h3>${info.name}（Lv.${info.level}）</h3>`;
  html += `<p>${info.levelInfo?.desc || ''}</p>`;
  html += `<p>容纳人数：${info.mansion?.servants?.length || 0}/${info.maxServants} | 容量：${info.maxCapacity}人</p>`;
  if (info.nextUpgradeCost) {
    const cost = info.nextUpgradeCost;
    html += `<p>升级到【${info.nextLevelInfo?.name || ''}】费用：${cost.silver ? cost.silver + '银两 ' : ''}${cost.spiritStone ? cost.spiritStone + '灵石' : ''}</p>`;
  } else {
    html += `<p style="color:#228b22;">已达最高等级</p>`;
  }
  document.getElementById('mansion-info').innerHTML = html;



  // 显示区域按钮（需求：灵田有灵田才可点开；无灵田置灰）
  let areasHtml = '';
  const p2 = gameState ? gameState.player : null;
  const hasFarm = !!(p2 && (p2.farm || (p2.estates && p2.estates.farmland)));
  for (const area of info.availableAreas || []) {
    if (area.id === 'spirit_field') {
      if (hasFarm) {
        areasHtml += `<div class="mansion-area-btn" onclick="visitMansionArea('spirit_field')">
          ${area.name}
          <div class="area-desc">${area.desc}</div>
        </div>`;
      } else {
        areasHtml += `<div class="mansion-area-btn" style="opacity:0.45;cursor:not-allowed;pointer-events:none;" title="暂无灵田，获得【灵田契约】后可解锁">
          ${area.name}
          <div class="area-desc">${area.desc}</div>
        </div>`;
      }
    } else {
      areasHtml += `<div class="mansion-area-btn" onclick="visitMansionArea('${area.id}')">
        ${area.name}
        <div class="area-desc">${area.desc}</div>
      </div>`;
    }
  }
  document.getElementById('mansion-areas').innerHTML = areasHtml;

  // 宅中家人（含父母）
  const fm = info.familyMembers || {};
  let famHtml = '';
  const rows = [
    { key: 'father', label: '父亲' },
    { key: 'mother', label: '母亲' },
    { key: 'spouse', label: '配偶' },
    ...(fm.wives || []).map(w => ({ npc: w, label: '妾室' })),
  ];
  for (const r of rows) {
    const npc = r.npc || fm[r.key];
    if (npc) {
      famHtml += `<div class="family-member" onclick="showNPCDetail('${npc.id}')">
        <img src="${resolvePortrait(npc.portrait) ||''}" onerror="this.style.display='none'">
        <div class="family-member-info">
          <div class="family-member-name">${npc.name}</div>
          <div class="family-member-relation">${r.label} · ${npc.realm}${npc.isAlive === false ? '·已故' : ''}</div>
        </div>
      </div>`;
    }
  }
  if (!famHtml) famHtml = '<p style="color:#d4b896;font-size:13px;">暂无家人（可结识并迎娶/邀请NPC）</p>';
  document.getElementById('mansion-family').innerHTML = '<div><b style="color:#c9a961;">宅中家人</b>' + famHtml + '</div>';
}

async function visitMansionArea(areaId) {
  const result = await api('/api/mansion/visit', { areaId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;

  let html = `<h3 style="color:#5c3a1e;margin-bottom:10px;">${result.name}</h3>`;
  html += `<p style="color:#8b6914;margin-bottom:15px;">${result.desc || ''}</p>`;

  if (result.people && result.people.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin-bottom:8px;">此处人物：</h4>';
    for (const person of result.people) {
      html += `<div class="shop-item" style="cursor:pointer;" onclick="showNPCDetail('${person.id}')">
        <div class="shop-item-info">
          <div class="shop-item-name">${person.name}</div>
          <div class="shop-item-desc">${person.type || person.profession || ''}</div>
        </div>
      </div>`;
    }
  }

  if (result.event) {
    html += '<div style="margin-top:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;">';
    html += `<p style="color:#5c3a1e;">${result.event.text}</p>`;
    html += '</div>';
  }

  // 厨房显示做菜和吃饭功能
  if (areaId === 'kitchen' && result.cooking) {
    const c = result.cooking;
    html += `<div style="margin-top:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;">
      <p style="color:#5c3a1e;">厨艺等级：<b>${c.level}</b> | 经验：${c.exp}/${c.level * 100}</p>`;
    if (c.currentDish) {
      html += `<p style="color:#228b22;">正在制作：<b>${c.currentDish}</b>（进度：${c.cookProgress}旬）</p>`;
    }
    html += '</div>';

    // 可制作的菜品
    html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">可制作的菜品</h4>';
    html += '<div style="max-height:200px;overflow-y:auto;">';
    for (const dish of c.availableDishes) {
      const materials = dish.materials.map(m => `${m.name}×${m.count}`).join('、');
      const qualityColor = dish.baseQuality === '凡品' ? '#8b6914' : dish.baseQuality === '良品' ? '#228b22' : dish.baseQuality === '珍品' ? '#4169e1' : '#9932cc';
      html += `<div class="shop-item">
        <div style="display:flex;align-items:center;gap:8px;flex:1;">
          ${ziyuanImg(dish.name, 40)}
          <div class="shop-item-info">
            <div class="shop-item-name">${dish.name} <span style="color:${qualityColor};font-size:12px;">[${dish.baseQuality}]</span></div>
            <div class="shop-item-desc">${dish.desc}<br>材料：${materials} | 耗时：${dish.cookTime}旬</div>
          </div>
        </div>
        <button class="btn btn-small" onclick="startCooking('${dish.name}')">制作</button>
      </div>`;
    }
    html += '</div>';

    // 背包中的菜品（可食用）
    const foods = (gameState.player.inventory || []).filter(i => i.type === 'food');
    if (foods.length > 0) {
      html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">背包中的菜品（可食用）</h4>';
      for (const food of foods) {
        const qualityColor = food.quality === '废菜' ? '#666' :
          food.quality?.includes('凡品') ? '#8b6914' :
          food.quality?.includes('良品') ? '#228b22' :
          food.quality?.includes('珍品') ? '#4169e1' :
          food.quality?.includes('神品') ? '#9932cc' : '#5c3a1e';
        html += `<div class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name" style="color:${qualityColor};">${food.name}×${food.count}</div>
            ${food.quality ? `<div class="shop-item-desc">品级：${food.quality}</div>` : ''}
          </div>
          <button class="btn btn-small" onclick="eatDish('${food.name}')">食用</button>
        </div>`;
      }
    }
  }

  // 炼丹房/炼器房/制阵房
  if (areaId === 'alchemy_room' || areaId === 'forge_room' || areaId === 'formation_room') {
    const craftType = areaId === 'alchemy_room' ? 'alchemy' : areaId === 'forge_room' ? 'forge' : 'formation';
    const craftName = areaId === 'alchemy_room' ? '炼丹' : areaId === 'forge_room' ? '炼器' : '制阵';
    const toolType = craftType === 'alchemy' ? 'furnace' : craftType === 'forge' ? 'forge' : 'formation';
    const toolName = toolType === 'furnace' ? '丹炉' : toolType === 'forge' ? '器炉' : '阵盘';

    html += `<div style="margin-top:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;">
      <p style="color:#5c3a1e;font-weight:bold;">当前${toolName}：<span id="current-tool-name">加载中...</span></p>
      <button class="btn btn-small" onclick="showToolSelect('${toolType}')">选择${toolName}</button>
      <button class="btn btn-small" onclick="showToolMarket('${toolType}')">${toolName}市场</button>
    </div>`;

    html += `<h4 style="color:#5c3a1e;margin:15px 0 8px;">可${craftName}的配方</h4>`;
    html += '<div id="craftable-list" style="max-height:250px;overflow-y:auto;">加载中...</div>';

    // 异步加载可炼制列表
    setTimeout(async () => {
      const data = await apiGet(`/api/craftable/${craftType}`);
      const toolEl = document.getElementById('current-tool-name');
      if (toolEl) toolEl.textContent = data.currentTool ? `${data.currentTool.name}（剩余${data.currentTool.usesLeft}次）` : '未装备';

      const listEl = document.getElementById('craftable-list');
      if (!listEl) return;
      if (data.recipes.length === 0) {
        listEl.innerHTML = '<p style="color:#8b6914;text-align:center;padding:20px;">暂无可炼制配方，请先学习配方</p>';
        return;
      }
      let listHtml = '';
      for (const recipe of data.recipes) {
        const materials = recipe.materials.map(m => `${m.name}×${m.count}`).join('、');
        const tierColor = recipe.tier <= 1 ? '#8b6914' : recipe.tier <= 2 ? '#228b22' : recipe.tier <= 3 ? '#4169e1' : '#9932cc';
        listHtml += `<div class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">${recipe.name} <span style="color:${tierColor};font-size:12px;">[${recipe.tier}阶]</span></div>
            <div class="shop-item-desc">${recipe.desc}<br>材料：${materials}</div>
          </div>
          <button class="btn btn-small" onclick="doCraft('${craftType}','${recipe.id}')">炼制</button>
        </div>`;
      }
      listEl.innerHTML = listHtml;
    }, 100);
  }

  // 灵田显示种植功能
  if (areaId === 'spirit_field' && result.farm) {
    const f = result.farm;
    html += `<div style="margin-top:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;">
      <p style="color:#5c3a1e;font-weight:bold;">灵田等级：<span style="color:#228b22;">${f.name}</span>（${f.tier}级）</p>
      <p style="color:#8b6914;font-size:13px;margin-top:5px;">${f.effect || ''}</p>
      <p style="color:#5c3a1e;margin-top:5px;">地块数：${f.slots} | 生长速度：×${f.speedBonus} | 品质加成：+${f.qualityBonus || 0}%</p>
      ${f.upgradePrice ? `<p style="color:#8b6914;margin-top:5px;">升级到【${f.nextTierName}】需要：${f.upgradePrice}灵石</p>` : '<p style="color:#228b22;margin-top:5px;">已达最高等级</p>'}
    </div>`;

    // 灵田地块
    html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">灵田地块</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
    for (const plot of f.plots) {
      if (plot.empty) {
        html += `<div style="padding:10px;background:rgba(0,0,0,0.1);border-radius:6px;text-align:center;cursor:pointer;" onclick="showSeedShop(${plot.index})">
          <div style="color:#8b6914;font-size:12px;">空地</div>
          <div style="color:#5c3a1e;font-size:11px;">点击种植</div>
        </div>`;
      } else {
        const readyColor = plot.ready ? '#228b22' : '#8b6914';
        html += `<div style="padding:10px;background:rgba(0,0,0,0.1);border-radius:6px;text-align:center;cursor:pointer;" onclick="${plot.ready ? `harvestPlot(${plot.index})` : ''}">
          <div style="color:${readyColor};font-size:12px;font-weight:bold;">${plot.name}</div>
          <div style="color:#5c3a1e;font-size:11px;">${plot.ready ? '已成熟！点击采摘' : `${plot.growth}/${plot.growTime}旬`}</div>
          <div style="width:100%;height:4px;background:#333;border-radius:2px;margin-top:4px;">
            <div style="width:${plot.progress}%;height:100%;background:${readyColor};border-radius:2px;"></div>
          </div>
        </div>`;
      }
    }
    html += '</div>';

    // 一键采摘和升级按钮
    html += `<div style="text-align:center;margin-top:10px;">
      <button class="btn btn-small" onclick="harvestAllPlots()">一键采摘</button>
      <button class="btn btn-small" onclick="upgradeFarm()">升级灵田</button>
    </div>`;

    // 种子商店
    if (result.seeds && result.seeds.length > 0) {
      html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">种子商店（点击空地后选择种子种植）</h4>';
      html += '<div style="max-height:150px;overflow-y:auto;">';
      for (const seed of result.seeds) {
        const currency = seed.seedCurrency === 'silver' ? '银两' : '灵石';
        html += `<div class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">${seed.name}种子</div>
            <div class="shop-item-desc">${seed.desc} | 成熟：${seed.growTime}旬 | 售价：${seed.price}${currency}</div>
          </div>
          <div style="color:#8b6914;font-size:12px;">${seed.seedPrice}${currency}</div>
        </div>`;
      }
      html += '</div>';
    }
  }

  // 仆役所显示仆役列表和交互
  if (areaId === 'servant_quarter') {
    const servants = await apiGet('/api/servants/mine');
    html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">我的仆役</h4>';
    if (servants.length === 0) {
      html += '<p style="color:#8b6914;">暂无仆役，可去牙人所购买</p>';
    } else {
      for (const s of servants) {
        html += `<div class="shop-item">
          <div class="shop-item-info">
            <div class="shop-item-name">${s.name}（${s.type}）</div>
            <div class="shop-item-desc">${s.gender} | ${s.age}岁 | 性格:${s.personality} | 忠诚:${s.loyalty} | 满意:${s.satisfaction}</div>
          </div>
          <button class="btn btn-small" onclick="showServantPanel('${s.id}')">查看</button>
        </div>`;
      }
    }
  }

  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal(result.name, html);
  renderAll();
}

// ===== 炼制系统 =====
async function showToolSelect(toolType) {
  const tools = await apiGet('/api/crafting-tools');
  const ownedKey = toolType === 'furnace' ? 'ownedFurnaces' : toolType === 'forge' ? 'ownedForges' : 'ownedFormations';
  const owned = tools[ownedKey] || [];
  const toolName = toolType === 'furnace' ? '丹炉' : toolType === 'forge' ? '器炉' : '阵盘';

  let html = `<p style="color:#8b6914;margin-bottom:10px;">选择要使用的${toolName}</p>`;
  if (owned.length === 0) {
    html += `<p style="color:#c0392b;text-align:center;padding:20px;">你还没有${toolName}，请先去${toolName}市场购买</p>`;
  } else {
    owned.forEach((tool, idx) => {
      const isActive = tools[toolType] && tools[toolType].name === tool.name;
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${tool.name} ${isActive ? '<span style="color:#228b22;">[使用中]</span>' : ''}</div>
          <div class="shop-item-desc">剩余使用次数：${tool.usesLeft}/${tool.maxUses}</div>
        </div>
        <button class="btn btn-small" onclick="selectTool('${toolType}',${idx})">选择</button>
      </div>`;
    });
  }
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal(`选择${toolName}`, html);
}

async function selectTool(toolType, index) {
  const result = await api('/api/select-tool', { toolType, index });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  gameNotify(result.msg);
  renderAll();
}

async function showToolMarket(toolType, minTier, maxTier) {
  const query = minTier ? `?minTier=${minTier}&maxTier=${maxTier || 6}` : '';
  const items = await apiGet(`/api/tool-market/${toolType}${query}`);
  const toolName = toolType === 'furnace' ? '丹炉' : toolType === 'forge' ? '器炉' : '阵盘';

  let html = `<p style="color:#8b6914;margin-bottom:10px;">${toolName}市场（价格每月浮动，购买后放入背包）</p>`;
  items.forEach(item => {
    const currency = item.tier <= 2 ? '银两' : '灵石';
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name} <span style="color:#4169e1;font-size:12px;">[${item.tier}阶]</span></div>
        <div class="shop-item-desc">${item.desc}<br>可炼制：${item.maxRecipeLevel}阶及以下 | 使用次数：${item.uses}</div>
      </div>
      <div style="text-align:right;">
        <div style="color:#c0392b;font-weight:bold;">${item.currentPrice}${currency}</div>
        <div style="font-size:11px;color:#8b6914;">库存：${item.stock}</div>
        <button class="btn btn-small" onclick="buyTool('${toolType}',${item.tier})">购买</button>
      </div>
    </div>`;
  });
  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal(`${toolName}市场`, html);
}

async function buyTool(toolType, tier) {
  const result = await api('/api/buy-tool', { toolType, tier });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  renderAll();
}

async function doCraft(craftType, recipeId) {
  const result = await api('/api/craft', { craftType, recipeId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let msg = result.msg;
  if (result.toolBroken) msg += '\n\n工具已损坏！';
  gameNotify(msg);
  // 刷新当前区域
  const areaId = craftType === 'alchemy' ? 'alchemy_room' : craftType === 'forge' ? 'forge_room' : 'formation_room';
  visitMansionArea(areaId);
  renderAll();
}

async function upgradeMansion() {
  const result = await api('/api/mansion/upgrade', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.text, '提示', () => { renderMansionPage(); renderAll(); });
}

// ===== 商铺系统（肉铺/种子铺）=====
let currentShopType = '';
let shopBuyCounts = {};

async function showShopPanel(shopType, shopName) {
  currentShopType = shopType || 'seedShop';
  shopBuyCounts = {};
  const items = await apiGet(`/api/shop/${currentShopType === 'butcher' ? 'butcher' : 'seed'}`);

  let html = `<h3 style="color:#5c3a1e;margin-bottom:10px;">${shopName}</h3>`;
  html += `<p style="color:#8b6914;margin-bottom:10px;">每月刷新商品，价格浮动。当前银两：${gameState.player.silver} | 灵石：${gameState.player.spiritStone}</p>`;

  // 商品列表
  html += '<div style="max-height:300px;overflow-y:auto;margin-bottom:15px;">';
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
  html += '<thead><tr style="background:rgba(139,90,43,0.2);">';
  html += '<th style="padding:8px;text-align:left;color:#5c3a1e;">名称</th>';
  html += '<th style="padding:8px;text-align:center;color:#5c3a1e;">品级</th>';
  html += '<th style="padding:8px;text-align:center;color:#5c3a1e;">价格</th>';
  html += '<th style="padding:8px;text-align:center;color:#5c3a1e;">库存</th>';
  html += '<th style="padding:8px;text-align:center;color:#5c3a1e;">数量</th>';
  html += '<th style="padding:8px;text-align:center;color:#5c3a1e;">操作</th>';
  html += '</tr></thead><tbody>';

  for (const item of items) {
    const currency = item.currency === 'silver' ? '银两' : '灵石';
    const tierColor = item.tier === '凡' ? '#8b6914' : item.tier === '灵' ? '#228b22' : item.tier === '宝' ? '#4169e1' : '#9932cc';
    shopBuyCounts[item.name] = 1;

    // 立绘URL（ziyuan目录下立绘为 item_名称.jpg 格式）
    let portraitUrl = '';
    if (shopType === 'seedShop') {
      portraitUrl = `images/ziyuan/item_${encodeURIComponent(item.name)}.jpg`;
    } else if (shopType === 'butcher') {
      portraitUrl = `images/ziyuan/item_${encodeURIComponent(item.name)}.jpg`;
    }

    html += `<tr style="border-bottom:1px solid rgba(139,90,43,0.2);">`;
    html += `<td style="padding:8px;color:#3d2817;">
      <div style="display:flex;align-items:center;gap:8px;">
        ${portraitUrl ? `<img src="${portraitUrl}" onerror="this.style.display='none'" style="width:32px;height:32px;border-radius:4px;object-fit:cover;">` : ''}
        <div>${item.name}<br><span style="font-size:11px;color:#8b6914;">${item.desc || ''}</span></div>
      </div>
    </td>`;
    html += `<td style="padding:8px;text-align:center;color:${tierColor};font-weight:bold;">${item.tier}</td>`;
    html += `<td style="padding:8px;text-align:center;color:#5c3a1e;">${item.price}${currency}</td>`;
    html += `<td style="padding:8px;text-align:center;color:#5c3a1e;">${item.stock}</td>`;
    html += `<td style="padding:8px;text-align:center;">
      <input type="number" id="buy-count-${item.name}" value="1" min="1" max="${item.stock}" style="width:50px;padding:4px;text-align:center;" onchange="updateBuyCount('${item.name}', this.value)">
    </td>`;
    html += `<td style="padding:8px;text-align:center;">
      <button class="btn btn-small" onclick="buyFromShop('${item.name}')">购买</button>
    </td>`;
    html += '</tr>';
  }
  html += '</tbody></table></div>';

  // 出售区域
  html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">出售背包物品</h4>';
  const sellableItems = (gameState.player.inventory || []).filter(i =>
    shopType === 'butcher' ? i.type === 'food_material' || i.type === '食材' : i.type === 'seed'
  );
  if (sellableItems.length === 0) {
    html += '<p style="color:#8b6914;">背包中没有可出售的物品</p>';
  } else {
    html += '<div style="max-height:150px;overflow-y:auto;">';
    for (const item of sellableItems) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}×${item.count}</div>
        </div>
        <button class="btn btn-small" onclick="sellToShop('${item.name}', 1)">出售1个</button>
        <button class="btn btn-small" onclick="sellToShop('${item.name}', ${item.count})">全部出售</button>
      </div>`;
    }
    html += '</div>';
  }

  html += '<div style="text-align:center;margin-top:15px;"><button class="btn" onclick="closeModal(\'generic-modal\')">关闭</button></div>';
  showAncientModal(shopName, html);
}

function updateBuyCount(itemName, value) {
  shopBuyCounts[itemName] = parseInt(value) || 1;
}

async function buyFromShop(itemName) {
  const count = shopBuyCounts[itemName] || 1;
  const result = await api('/api/shop/buy', { shopType: currentShopType, itemName, count });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  renderAll();
  const shopName = currentShopType === 'butcher' ? '肉铺' : '种子铺';
  showShopPanel(currentShopType, shopName);
}

async function sellToShop(itemName, count) {
  const result = await api('/api/shop/sell', { shopType: currentShopType, itemName, count });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  // 按当前铺子类型刷新对应面板（修复：出售后跳转到其他铺子/显示错乱）
  if (currentShopType === 'pharmacy') {
    showPharmacyPanel(pharmacyFilter || 'all');
  } else if (currentShopType === 'fishMarket') {
    showFishMarket();
  } else {
    const shopName = currentShopType === 'butcher' ? '肉铺' : '种子铺';
    showShopPanel(currentShopType, shopName);
  }
}

// ===== 季度任务系统 =====
async function showQuarterlyQuests() {
  const quests = await apiGet('/api/quests/quarterly');

  let html = `<div style="margin-bottom:15px;">
    <span style="font-size:16px;color:#5c3a1e;">季度任务</span>
    <span style="margin-left:20px;color:#8b6914;font-size:13px;">每季度随机8个任务，完成可获得丰厚奖励</span>
  </div>`;

  // 已接任务
  const activeQuests = quests.filter(q => q.accepted);
  if (activeQuests.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin:15px 0 10px;">进行中的任务</h4>';
    for (const q of activeQuests) {
      const diffColor = ['#8b6914', '#228b22', '#4169e1', '#9932cc', '#ff4500'][q.difficulty - 1] || '#5c3a1e';
      // 物品类任务（有 item 目标）→ 提交完成；纯动作类 → 完成领奖
      const hasItemObj = (q.objectives || []).some(o => o.item);
      const itemReady = (q.objectives || []).every(o => {
        if (!o.item) return o.completed || (o.current || 0) >= (o.count || 1);
        const it = (gameState.player.inventory || []).find(x => x.name === o.item);
        const have = it ? (it.count || 1) : 0;
        return have >= (o.count || 1);
      });
      const btnHtml = hasItemObj
        ? `<button class="btn btn-small ${itemReady ? 'btn-primary' : ''}" onclick="submitQuarterlyQuest('${q.id}')" ${itemReady ? '' : 'disabled'}>${itemReady ? '提交物品完成' : '物品不足'}</button>`
        : `<button class="btn btn-small btn-primary" onclick="completeQuarterlyQuest('${q.id}')">完成领奖</button>`;
      html += `<div style="background:#f5e6c8;padding:12px;border-radius:5px;margin-bottom:10px;border-left:4px solid ${diffColor};">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:bold;color:#5c3a1e;">${q.title} <span style="color:${diffColor};font-size:12px;">[${['简单','普通','困难','精英','传说'][q.difficulty-1]}]</span></div>
          ${btnHtml}
        </div>
        <div style="color:#8b6914;font-size:13px;margin:5px 0;">${q.desc}</div>
        <div style="font-size:12px;color:#5c3a1e;">`;
      for (const obj of q.objectives || []) {
        const progress = obj.current || 0;
        const total = obj.count || 1;
        const done = progress >= total;
        html += `<span style="color:${done ? '#228b22' : '#8b6914'};">${obj.desc} (${progress}/${total})${done ? ' ✓' : ''}</span> `;
      }
      html += `</div>
        <div style="font-size:12px;color:#8b6914;margin-top:5px;">奖励：`;
      if (q.rewards.silver) html += `银两${q.rewards.silver} `;
      if (q.rewards.spiritStone) html += `灵石${q.rewards.spiritStone} `;
      if (q.rewards.exp) html += `修为${q.rewards.exp} `;
      if (q.rewards.items) html += q.rewards.items.map(i => `${i.name}×${i.count}`).join(' ');
      html += `</div>
      </div>`;
    }
  }

  // 可接任务
  const availableQuests = quests.filter(q => !q.accepted);
  if (availableQuests.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin:15px 0 10px;">可接任务</h4>';
    for (const q of availableQuests) {
      const diffColor = ['#8b6914', '#228b22', '#4169e1', '#9932cc', '#ff4500'][q.difficulty - 1] || '#5c3a1e';
      html += `<div style="background:#fff;padding:12px;border-radius:5px;margin-bottom:10px;border:1px solid #d4a574;border-left:4px solid ${diffColor};">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-weight:bold;color:#5c3a1e;">${q.title} <span style="color:${diffColor};font-size:12px;">[${['简单','普通','困难','精英','传说'][q.difficulty-1]}]</span></div>
          <button class="btn btn-small" onclick="acceptQuarterlyQuest('${q.id}')">接受</button>
        </div>
        <div style="color:#8b6914;font-size:13px;margin:5px 0;">${q.desc}</div>
        <div style="font-size:12px;color:#5c3a1e;">`;
      for (const obj of q.objectives || []) {
        html += `<span>${obj.desc}</span> `;
      }
      html += `</div>
        <div style="font-size:12px;color:#8b6914;margin-top:5px;">奖励：`;
      if (q.rewards.silver) html += `银两${q.rewards.silver} `;
      if (q.rewards.spiritStone) html += `灵石${q.rewards.spiritStone} `;
      if (q.rewards.exp) html += `修为${q.rewards.exp} `;
      if (q.rewards.items) html += q.rewards.items.map(i => `${i.name}×${i.count}`).join(' ');
      html += `</div>
      </div>`;
    }
  }

  if (quests.length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:20px;">当前暂无可用任务</p>';
  }

  showAncientModal('季度任务', html);
}

async function acceptQuarterlyQuest(questId) {
  const result = await api('/api/quests/quarterly/accept', { questId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg || '任务接受成功！', '提示', () => { showQuarterlyQuests(); });
}

async function completeQuarterlyQuest(questId) {
  const result = await api('/api/quests/quarterly/complete', { questId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let msg = result.msg || '任务完成！';
  if (result.rewards) {
    msg += '\n获得奖励：';
    if (result.rewards.silver) msg += `\n银两：${result.rewards.silver}`;
    if (result.rewards.spiritStone) msg += `\n灵石：${result.rewards.spiritStone}`;
    if (result.rewards.exp) msg += `\n修为：${result.rewards.exp}`;
  }
  gameNotify(msg, '提示', () => { showQuarterlyQuests(); renderTopBar(); });
}

// 提交季度任务物品（背包直交）
async function submitQuarterlyQuest(questId) {
  const result = await api('/api/quests/quarterly/submit', { questId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  let msg = result.msg || '任务完成！';
  if (result.rewards) {
    msg += '\n获得奖励：';
    if (result.rewards.silver) msg += `\n银两：${result.rewards.silver}`;
    if (result.rewards.spiritStone) msg += `\n灵石：${result.rewards.spiritStone}`;
    if (result.rewards.exp) msg += `\n修为：${result.rewards.exp}`;
  }
  gameNotify(msg, '提示', () => { showQuarterlyQuests(); renderTopBar(); });
}

// ===== 图鉴系统 =====
let currentCollectionFilter = 'all';
function showCollection() {
  const player = gameState.player;
  // 记录获得过的物品（从背包和历史记录中）
  const obtainedItems = new Set();
  if (player.inventory) {
    for (const item of player.inventory) {
      obtainedItems.add(item.name);
    }
  }
  // 灵宠图鉴联动：拥有即点亮
  if (player.pets) {
    for (const p of player.pets) obtainedItems.add(p.name);
  }
  // 从记事中获取获得过的物品
  if (player.journal) {
    for (const j of player.journal) {
      const msg = typeof j === 'string' ? j : j.msg || '';
      const matches = msg.match(/获得[：:]\s*(.+?)(?:[。\n]|$)/g);
      if (matches) {
        for (const m of matches) {
          const items = m.replace(/获得[：:]\s*/, '').split(/[、,，]/);
          for (const item of items) {
            const name = item.replace(/×\d+/, '').trim();
            if (name) obtainedItems.add(name);
          }
        }
      }
    }
  }

  // 收集所有图鉴条目
  const itemTypes = [
    { category: '丹药', items: ['金疮药', '安神汤', '解毒散', '回灵丹', '回春丹', '清心丹', '解毒丹', '筑基丹', '金丹破障丹', '元婴丹', '化神丹', '聚气丹', '送子丹', '顺产丹', '安胎丸', '化形丹', '融雪丹', '血煞丹'] },
    { category: '药材', items: ['人参', '鹿茸', '阿胶', '聚灵草', '灵草', '百年茯苓', '玄铁', '妖丹', '寒铁', '雷石', '妖兽皮', '灵稻', '妖兽内丹', '魔晶', '魂火', '阴魂珠'] },
    { category: '肉类', items: ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鱼肉', '鸡蛋', '鲍鱼', '海参', '鱼翅', '妖兽肉'] },
    { category: '鱼类', items: ['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '青鱼', '鳊鱼', '鲶鱼', '黄鳝', '泥鳅', '鲈鱼', '桂鱼', '黑鱼', '鳜鱼', '石斑鱼', '真鲷', '黑鲷', '带鱼', '黄鱼', '墨鱼', '三文鱼', '金枪鱼', '鳕鱼', '龙虾', '扇贝', '生蚝', '帝王蟹', '象拔蚌', '龙鱼', '凤凰鱼', '鲲鹏', '鲛人', '玄武龟', '灵鳌', '螭吻', '蜃龙', '横公鱼', '鲲'] },
    { category: '武器', items: ['铁剑', '钢刀', '长枪', '弓箭', '青锋剑', '飞剑', '桃木剑', '朱砂笔', '拂尘', '玉如意', '芭蕉扇', '紫金葫芦', '碎星锤', '轩辕剑', '诛仙剑'] },
    { category: '防具', items: ['皮甲', '铁甲', '法袍', '道袍', '袈裟', '战甲', '玄武甲', '天蚕衣', '五行混天绫', '九龙袍'] },
    { category: '饰品', items: ['玉佩', '玉簪', '戒指', '储物戒', '纳戒', '灵兽袋', '传讯玉符', '护身符', '避水珠', '避火珠', '聚灵珠', '定魂珠', '混沌珠'] },
    { category: '妖兽', items: ['野狼', '野猪', '毒蛇', '黑熊', '灵狐', '赤焰虎', '烈焰狮', '寒冰蟒', '雷鹰', '毒蝎王', '石巨人', '九尾天狐', '蛟龙', '凤凰', '玄武', '白虎', '应龙', '麒麟', '饕餮', '穷奇', '梼杌', '祖龙', '元凤', '始麒麟', '混沌'] },
    { category: '灵宠', items: ['灵猫', '灵雀', '彩蝶', '玉兔', '苍狼', '哮天犬', '青鳞蛇', '灵猴', '玄龟', '黑熊', '仙鹤', '金蟾', '冰蛛', '白虎', '火麒麟', '雷豹', '金翅大鹏', '九尾狐', '朱雀', '青龙', '玄武', '混沌兽'] },
    { category: '菜品', items: ['红烧肉', '清蒸鱼', '糖醋排骨', '宫保鸡丁', '麻婆豆腐', '鱼香肉丝', '回锅肉', '水煮鱼', '烤鱼', '酸菜鱼', '红烧狮子头', '北京烤鸭', '白切鸡', '东坡肉', '佛跳墙', '满汉全席'] },
  ];

  const totalCount = itemTypes.reduce((sum, t) => sum + t.items.length, 0);
  const obtainedCount = itemTypes.reduce((sum, t) => sum + t.items.filter(i => obtainedItems.has(i)).length, 0);

  let html = `<div style="margin-bottom:15px;">
    <span style="font-size:16px;color:#5c3a1e;">图鉴</span>
    <span style="margin-left:20px;color:#8b6914;font-size:13px;">已收集：${obtainedCount} / ${totalCount}</span>
  </div>`;

  // 筛选按钮
  html += '<div style="margin-bottom:15px;display:flex;flex-wrap:wrap;gap:5px;">';
  html += `<button class="btn btn-small ${currentCollectionFilter === 'all' ? 'btn-active' : ''}" onclick="filterCollection('all')">全部</button>`;
  for (const type of itemTypes) {
    html += `<button class="btn btn-small ${currentCollectionFilter === type.category ? 'btn-active' : ''}" onclick="filterCollection('${type.category}')">${type.category}</button>`;
  }
  html += '</div>';

  html += '<div style="max-height:450px;overflow-y:auto;">';

  for (const type of itemTypes) {
    if (currentCollectionFilter !== 'all' && currentCollectionFilter !== type.category) continue;
    html += `<h4 style="color:#5c3a1e;margin:15px 0 10px;border-bottom:1px solid #d4a574;padding-bottom:5px;">${type.category}（${type.items.filter(i => obtainedItems.has(i)).length}/${type.items.length}）</h4>`;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
    for (const itemName of type.items) {
      const obtained = obtainedItems.has(itemName);
      // 已获得：显示真实物品立绘（images/ziyuan/item_名称.jpg），未获得显示问号
      const visual = obtained
        ? ziyuanImg(itemName, 36)
        : '<div style="font-size:24px;margin-bottom:4px;">❓</div>';
      html += `<div style="padding:8px;border-radius:5px;text-align:center;${obtained ? 'background:#f5e6c8;' : 'background:#ddd;opacity:0.5;'}">
        <div style="height:36px;display:flex;align-items:center;justify-content:center;margin-bottom:4px;">${visual}</div>
        <div style="font-size:12px;color:${obtained ? '#5c3a1e' : '#999'};font-weight:${obtained ? 'bold' : 'normal'};">${obtained ? itemName : '???'}</div>
      </div>`;
    }
    html += '</div>';
  }

  html += '</div>';

  showAncientModal('图鉴', html);
}

function filterCollection(category) {
  currentCollectionFilter = category;
  showCollection();
}

// ===== 捕鱼系统 =====
let fishingCursorInterval = null;
let fishingCursorPos = 0;
let fishingCursorDir = 1;
let fishingSpeed = 2;
let currentFishingZone = null;

async function showFishingZones() {
  const zones = await apiGet('/api/fishing/zones');
  const tierColors = ['#8b6914', '#228b22', '#4169e1', '#9932cc'];
  let html = '';
  for (const zone of zones) {
    const color = tierColors[zone.tier - 1] || '#5c3a1e';
    html += `<div style="background:rgba(245,230,200,0.9);padding:15px;border-radius:8px;border-left:4px solid ${color};cursor:pointer;" onclick="enterFishingZone('${zone.id}')">
      <div style="font-weight:bold;color:#5c3a1e;font-size:16px;">${zone.name} <span style="color:${color};font-size:12px;">[${['凡品','良品','珍品','神品'][zone.tier-1]}区]</span></div>
      <div style="color:#8b6914;font-size:13px;margin:5px 0;">${zone.desc}</div>
      <div style="color:#5c3a1e;font-size:13px;">费用：${zone.cost}${zone.costType === 'silver' ? '银两' : '灵石'} | 可捕鱼：${zone.maxCatches}次</div>
    </div>`;
  }
  document.getElementById('fishing-zones-list').innerHTML = html;
  document.getElementById('fishing-zone-select').style.display = 'block';
  document.getElementById('fishing-game').style.display = 'none';
  switchPage('fishing');
}

async function enterFishingZone(zoneId) {
  const result = await api('/api/fishing/enter', { zoneId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  currentFishingZone = result.zone;
  document.getElementById('fishing-zone-name').textContent = result.zone.name;
  document.getElementById('fishing-catches-left').textContent = result.zone.maxCatches;
  document.getElementById('fishing-zone-select').style.display = 'none';
  // 设置该钓鱼区的背景图
  const zoneBg = document.getElementById('fishing-game');
  zoneBg.style.backgroundImage = `url('images/ditu/fishing_zone_${result.zone.tier}.jpg')`;
  zoneBg.style.backgroundSize = 'cover';
  zoneBg.style.backgroundPosition = 'center';
  zoneBg.style.display = 'block';
  document.getElementById('fishing-start-area').style.display = 'block';
  document.getElementById('fishing-game-area').style.display = 'none';
  document.getElementById('fish-display').style.display = 'none';
  document.getElementById('fishing-result').innerHTML = '';
  fishingSpeed = 5 + (result.zone.tier - 1) * 3;
  renderTopBar();
}

function startFishing() {
  // 隐藏钓鱼按钮，显示游戏区域
  document.getElementById('fishing-start-area').style.display = 'none';
  document.getElementById('fishing-game-area').style.display = 'block';
  document.getElementById('fish-display').style.display = 'none';
  document.getElementById('fishing-result').innerHTML = '';

  // 等游戏区完成布局后再读取轨道宽度（避免 display 切换瞬间 offsetWidth=0 导致目标区定位到轨道外）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 设置目标区域位置
      const track = document.getElementById('fishing-track');
      const target = document.getElementById('fishing-target');
      const targetWidth = 60;
      const trackWidth = track.offsetWidth || track.clientWidth || 300;
      if (trackWidth <= 0) return;
      const targetLeft = Math.max(0, Math.min(trackWidth - targetWidth, Math.random() * (trackWidth - targetWidth)));
      target.style.left = targetLeft + 'px';

      // 启动移动色块
      fishingCursorPos = 0;
      fishingCursorDir = 1;
      const cursor = document.getElementById('fishing-cursor');
      cursor.style.left = '0px';
      fishingCursorInterval = setInterval(() => {
        fishingCursorPos += fishingSpeed * fishingCursorDir;
        if (fishingCursorPos >= trackWidth - 30) {
          fishingCursorPos = trackWidth - 30;
          fishingCursorDir = -1;
        } else if (fishingCursorPos <= 0) {
          fishingCursorPos = 0;
          fishingCursorDir = 1;
        }
        cursor.style.left = fishingCursorPos + 'px';
      }, 16);
    });
  });
}

async function catchFishAction() {
  // 停止移动
  clearInterval(fishingCursorInterval);

  // 判断色块是否与目标区域实际相交（严格判定：色块任意部分进入目标区才算命中）
  const track = document.getElementById('fishing-track');
  const target = document.getElementById('fishing-target');
  const cursor = document.getElementById('fishing-cursor');
  const cursorLeft = parseFloat(cursor.style.left) || 0;
  const targetLeft = parseFloat(target.style.left) || 0;
  const targetWidth = 60;
  const cursorWidth = 30;

  const inTarget = (cursorLeft + cursorWidth) > targetLeft && cursorLeft < (targetLeft + targetWidth);

  // 无论成功失败都调用后端API扣除次数
  const result = await api('/api/fishing/catch', { success: inTarget });
  if (result.error && !result.zoneEnd) {
    gameNotify(result.error);
    return;
  }
  if (result.state) gameState = result.state;

  if (inTarget && result.fish) {
    // 捕鱼成功
    const fish = result.fish;
    const tierColors = ['#8b6914', '#228b22', '#4169e1', '#9932cc'];
    // 显示鱼立绘
    const portraitBox = document.getElementById('fish-portrait');
    if (portraitBox && fish.portrait) {
      portraitBox.innerHTML = fishImg(fish.portrait, 140);
    }
    document.getElementById('fish-name').textContent = fish.name;
    document.getElementById('fish-name').style.color = tierColors[fish.tier - 1] || '#f5e6c8';
    document.getElementById('fish-tier').textContent = `${fish.tierName} | 价值：${fish.price}${fish.tier <= 2 ? '银两' : '灵石'}`;
    document.getElementById('fish-display').style.display = 'block';

    document.getElementById('fishing-result').innerHTML = `<div style="background:rgba(34,139,34,0.2);padding:15px;border-radius:8px;border:1px solid #228b22;"><p style="color:#228b22;font-weight:bold;text-align:center;">${result.msg}</p></div>`;
  } else {
    // 捕鱼失败
    document.getElementById('fishing-result').innerHTML = `<div style="background:rgba(139,0,0,0.2);padding:15px;border-radius:8px;border:1px solid #8b0000;"><p style="color:#cd5c5c;font-weight:bold;text-align:center;">${result.msg || '捕鱼失败！鱼跑了...'}</p></div>`;
  }

  document.getElementById('fishing-catches-left').textContent = result.catchesLeft;

  if (result.zoneEnd) {
    setTimeout(() => {
      gameNotify('本区域捕鱼次数已用完！');
      exitFishingPage();
    }, 1500);
    return;
  }

  // 隐藏游戏区域，重新显示钓鱼按钮
  document.getElementById('fishing-game-area').style.display = 'none';
  document.getElementById('fishing-start-area').style.display = 'block';
  renderTopBar();
}

async function exitFishingZone() {
  await api('/api/fishing/exit', {});
  exitFishingPage();
}

function exitFishingPage() {
  clearInterval(fishingCursorInterval);
  currentFishingZone = null;
  switchPage('map');
  renderAll();
}

// 鱼市面板
async function showFishMarket() {
  const items = await apiGet('/api/fishing/market');
  currentShopType = 'fishMarket';

  const tierColors = ['#8b6914', '#228b22', '#4169e1', '#9932cc'];
  let html = `<div style="margin-bottom:15px;">
    <span style="font-size:16px;color:#5c3a1e;">鱼市</span>
    <span style="margin-left:20px;color:#8b6914;">每月刷新商品，价格浮动。当前银两：${gameState.player.silver} | 灵石：${gameState.player.spiritStone}</span>
  </div>`;

  html += `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead><tr style="background:#f5e6c8;color:#5c3a1e;">
      <th style="padding:8px;border:1px solid #d4a574;text-align:left;">名称</th>
      <th style="padding:8px;border:1px solid #d4a574;">品级</th>
      <th style="padding:8px;border:1px solid #d4a574;">价格</th>
      <th style="padding:8px;border:1px solid #d4a574;">库存</th>
      <th style="padding:8px;border:1px solid #d4a574;">数量</th>
      <th style="padding:8px;border:1px solid #d4a574;">操作</th>
    </tr></thead><tbody>`;

  for (const item of items) {
    const tierColor = tierColors[item.tier - 1] || '#5c3a1e';
    html += `<tr style="border-bottom:1px solid #e8d5b0;">
      <td style="padding:8px;border:1px solid #d4a574;">
        <div style="font-weight:bold;color:#5c3a1e;">${item.name}</div>
        <div style="font-size:12px;color:#8b6914;">${item.desc || ''}</div>
      </td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;color:${tierColor};">${item.tierName}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">${item.price}${item.currency === 'silver' ? '银两' : '灵石'}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">${item.stock}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">
        <input type="number" id="buy-count-${item.name}" value="1" min="1" max="${item.stock}" style="width:50px;padding:4px;text-align:center;">
      </td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">
        <button class="btn btn-small" onclick="buyFromShop('${item.name}')">购买</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';

  // 出售区域
  const sellableItems = (gameState.player.inventory || []).filter(i => i.type === 'fish');
  if (sellableItems.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin:20px 0 10px;">可出售的鱼类（收购价为售价的60%）</h4>';
    html += '<div style="max-height:150px;overflow-y:auto;">';
    for (const item of sellableItems) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}×${item.count}</div>
        </div>
        <button class="btn btn-small" onclick="sellToShop('${item.name}', 1)">出售1个</button>
        <button class="btn btn-small" style="margin-left:5px;" onclick="sellToShop('${item.name}', ${item.count})">全部出售</button>
      </div>`;
    }
    html += '</div>';
  }

  showAncientModal('鱼市', html);
}

// ===== 采集系统 =====
function refreshGatherRemain() {
  const el = document.getElementById('gather-remain');
  if (!el || !gameState || !gameState.player) return;
  const p = gameState.player;
  const used = (p.gatherCount || 0);
  el.textContent = '本月落日森林已采集 ' + used + '/10 次';
}
function enterGathering() {
  document.getElementById('gathering-result').innerHTML = '';
  switchPage('gathering');
  refreshGatherRemain();
}

function exitGathering() {
  switchPage('map');
}

async function doGathering() {
  const result = await api('/api/gather', { gatherType: '采集区' });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  refreshGatherRemain();

  let resultHtml = `<div style="background:rgba(245,230,200,0.95);padding:15px;border-radius:8px;margin-top:15px;">`;
  resultHtml += `<p style="color:#5c3a1e;font-weight:bold;font-size:16px;">${result.msg}</p>`;

  if (result.items && result.items.length > 0) {
    resultHtml += `<p style="color:#228b22;font-size:14px;">获得：${result.items.map(i => `${i.name}×${i.count}`).join('、')}</p>`;
  }

  resultHtml += `</div>`;
  document.getElementById('gathering-result').innerHTML = resultHtml;
  renderTopBar();

  // ⑥ 遭遇妖兽/灵兽改为弹窗样式，且不止"战斗/逃跑"两个选择
  if (result.encounteredBeast) {
    showBeastEncounterModal(result.encounteredBeast, result);
  } else if (result.encounteredPet) {
    showPetEncounterModal(result.encounteredPet);
  }
}

// 妖兽遭遇弹窗：战斗 / 逃跑 / 绕开 / 投喂灵草安抚
function showBeastEncounterModal(beast, gatherResult) {
  const hasHerb = (gameState.player.inventory || []).find(i => i.name === '灵草' && i.count > 0);
  const feedBtn = hasHerb
    ? `<button class="btn" style="background:rgba(34,139,34,0.15);border-color:#228b22;" onclick="feedBeastAndFlee(${JSON.stringify(beast)})">🍖 投喂灵草安抚（消耗灵草×1）</button>`
    : `<button class="btn" disabled style="opacity:0.5;" title="需要背包中有灵草">🍖 投喂灵草安抚（需要灵草）</button>`;
  const html = `<div style="text-align:center;">
    <div style="font-size:22px;color:#8b0000;font-weight:bold;margin-bottom:8px;">⚠ 遭遇【${beast.name}】</div>
    <div style="color:#8b6914;font-size:14px;margin-bottom:6px;">${beast.tierName} · 气血${beast.hp} 灵力${beast.mp} 攻击${beast.atk} 防御${beast.def}</div>
    <div style="color:#5c3a1e;font-size:13px;margin-bottom:16px;">${beast.desc || '它拦住了你的去路，目光不善。'}</div>
    <div style="display:flex;flex-direction:column;gap:8px;align-items:stretch;">
      <button class="btn btn-primary" onclick='startBeastBattle(${JSON.stringify(beast)})'>⚔ 与它战斗</button>
      <button class="btn" onclick="fleeFromBeast()">🏃 转身逃跑</button>
      <button class="btn" onclick="bypassBeast()">🍀 小心绕开（不惊动它）</button>
      ${feedBtn}
    </div>
  </div>`;
  showAncientModal('遭遇妖兽', html);
}

// 灵兽（灵宠）遭遇弹窗：尝试驯服 / 放它离开
function showPetEncounterModal(pet) {
  const html = `<div style="text-align:center;">
    <div style="font-size:22px;color:#8b6914;font-weight:bold;margin-bottom:8px;">✨ 发现灵兽【${pet.name}】</div>
    <div style="color:#8b6914;font-size:14px;margin-bottom:6px;">${pet.quality} · ${pet.race || ''}</div>
    <div style="color:#5c3a1e;font-size:13px;margin-bottom:16px;">它似乎对你有些好奇，并未逃走。</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <button class="btn btn-primary" onclick="tryCapturePet('${encodeURIComponent(JSON.stringify(pet))}')">🐾 尝试驯服收为灵宠</button>
      <button class="btn" onclick="fleeFromBeast()">🌿 放它离开，继续采集</button>
    </div>
  </div>`;
  showAncientModal('发现灵兽', html);
}

function bypassBeast() {
  gameNotify('你屏息凝神，轻手轻脚地绕开了它，没有惊动。');
  closeModal('generic-modal');
  document.getElementById('gathering-result').innerHTML = '';
}

// 投喂灵草安抚妖兽：消耗灵草×1，成功则免战离开，失败仍可再选择
async function feedBeastAndFlee(beast) {
  const r = await api('/api/gather/feed-beast', { beastId: beast.id });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  closeModal('generic-modal');
  renderTopBar();
  if (r.success) {
    document.getElementById('gathering-result').innerHTML = '';
    gameNotify(r.msg || '灵草香气令它放下戒备，它转身离去了。');
  } else {
    showBeastEncounterModal({ ...beast, hp: r.beastHp || beast.hp }, null);
    gameNotify(r.msg || '它不为所动，依旧拦在路前。');
  }
}

// 尝试驯服灵兽（传整个 pet 对象，后端 /api/pet/capture 接收 pet 对象）
async function tryCapturePet(petJson) {
  const pet = typeof petJson === 'string' ? JSON.parse(petJson) : petJson;
  const r = await api('/api/pet/capture', { pet });
  if (r.error) { gameNotify(r.error); return; }
  if (r.state) gameState = r.state;
  closeModal('generic-modal');
  renderAll();
  gameNotify(r.msg || (r.success ? '驯服成功！' : '驯服失败'));
  if (r.success) document.getElementById('gathering-result').innerHTML = '';
}

function fleeFromBeast() {
  gameNotify('你成功逃离了野兽的追击。');
  closeModal('generic-modal');
  document.getElementById('gathering-result').innerHTML = '';
}

// ===== 药铺系统 =====
let pharmacyFilter = 'all';
async function showPharmacyPanel(filter = 'all') {
  pharmacyFilter = filter;
  const items = await apiGet(`/api/shop/pharmacy?category=${filter === 'all' ? '' : filter}`);
  currentShopType = 'pharmacy';

  const tierColors = { '凡': '#8b6914', '灵': '#228b22', '宝': '#4169e1', '古': '#9932cc', '圣': '#ff4500', '仙': '#ffd700' };
  let html = `<div style="margin-bottom:15px;">
    <span style="font-size:16px;color:#5c3a1e;">药铺</span>
    <span style="margin-left:20px;color:#8b6914;">每月刷新商品，价格浮动。当前银两：${gameState.player.silver} | 灵石：${gameState.player.spiritStone}</span>
  </div>`;

  // 筛选按钮
  html += `<div style="margin-bottom:15px;">
    <button class="btn btn-small ${filter === 'all' ? 'btn-primary' : ''}" onclick="showPharmacyPanel('all')">全部</button>
    <button class="btn btn-small ${filter === 'pill' ? 'btn-primary' : ''}" onclick="showPharmacyPanel('pill')">丹药</button>
    <button class="btn btn-small ${filter === 'material' ? 'btn-primary' : ''}" onclick="showPharmacyPanel('material')">药材</button>
  </div>`;

  html += `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead><tr style="background:#f5e6c8;color:#5c3a1e;">
      <th style="padding:8px;border:1px solid #d4a574;text-align:left;">名称</th>
      <th style="padding:8px;border:1px solid #d4a574;">品级</th>
      <th style="padding:8px;border:1px solid #d4a574;">价格</th>
      <th style="padding:8px;border:1px solid #d4a574;">库存</th>
      <th style="padding:8px;border:1px solid #d4a574;">数量</th>
      <th style="padding:8px;border:1px solid #d4a574;">操作</th>
    </tr></thead><tbody>`;

  for (const item of items) {
    const tierColor = tierColors[item.tier] || '#5c3a1e';
    html += `<tr style="border-bottom:1px solid #e8d5b0;">
      <td style="padding:8px;border:1px solid #d4a574;">
        <div style="font-weight:bold;color:#5c3a1e;">${item.name}</div>
        <div style="font-size:12px;color:#8b6914;">${item.desc || ''}</div>
      </td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;color:${tierColor};">${item.tier}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">${item.price}${item.currency === 'silver' ? '银两' : '灵石'}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">${item.stock}</td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">
        <input type="number" id="buy-count-${item.name}" value="1" min="1" max="${item.stock}" style="width:50px;padding:4px;text-align:center;">
      </td>
      <td style="padding:8px;border:1px solid #d4a574;text-align:center;">
        <button class="btn btn-small" onclick="buyFromShop('${item.name}')">购买</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';

  // 出售区域
  const sellableItems = (gameState.player.inventory || []).filter(i =>
    i.type === 'pill' || i.type === 'material'
  );
  if (sellableItems.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin:20px 0 10px;">可出售的物品（收购价为售价的60%）</h4>';
    html += '<div style="max-height:150px;overflow-y:auto;">';
    for (const item of sellableItems) {
      html += `<div class="shop-item">
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}×${item.count}</div>
        </div>
        <button class="btn btn-small" onclick="sellToShop('${item.name}', 1)">出售1个</button>
        <button class="btn btn-small" style="margin-left:5px;" onclick="sellToShop('${item.name}', ${item.count})">全部出售</button>
      </div>`;
    }
    html += '</div>';
  }

  showAncientModal('药铺', html);
}

// ===== 做菜系统 =====
async function startCooking(dishName) {
  const result = await api('/api/cooking/start', { dishName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  closeModal('generic-modal');
  visitMansionArea('kitchen');
}

async function eatDish(dishName) {
  const result = await api('/api/cooking/eat', { dishName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  closeModal('generic-modal');
  visitMansionArea('kitchen');
}

// ===== 灵田系统 =====
let selectedPlotIndex = -1;

async function showSeedShop(plotIndex) {
  selectedPlotIndex = plotIndex;
  const seeds = await apiGet('/api/farm/seeds');
  let html = '<h3 style="color:#5c3a1e;margin-bottom:10px;">选择种子</h3>';
  html += '<div style="max-height:300px;overflow-y:auto;">';
  for (const seed of seeds) {
    const currency = seed.seedCurrency === 'silver' ? '银两' : '灵石';
    html += `<div class="shop-item">
      <div style="display:flex;align-items:center;gap:8px;flex:1;">
        ${ziyuanImg(seed.name + '种子', 40)}
        <div class="shop-item-info">
          <div class="shop-item-name">${seed.name}种子</div>
          <div class="shop-item-desc">${seed.desc}<br>成熟：${seed.growTime}旬 | 售价：${seed.price}${currency}</div>
        </div>
      </div>
      <button class="btn btn-small" onclick="plantCrop('${seed.id}')">${seed.seedPrice}${currency}</button>
    </div>`;
  }
  html += '</div>';
  html += '<div style="text-align:center;margin-top:10px;"><button class="btn" onclick="closeModal(\'generic-modal\')">取消</button></div>';
  showAncientModal('种子商店', html);
}

async function plantCrop(cropId) {
  if (selectedPlotIndex < 0) return;
  const result = await api('/api/farm/plant', { plotIndex: selectedPlotIndex, cropId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('generic-modal');
  selectedPlotIndex = -1;
  visitMansionArea('spirit_field');
}

async function harvestPlot(plotIndex) {
  const result = await api('/api/farm/harvest', { plotIndex });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg || '采摘成功！');
  visitMansionArea('spirit_field');
}

async function harvestAllPlots() {
  const result = await api('/api/farm/harvestAll', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg || '一键采摘成功！');
  visitMansionArea('spirit_field');
}

async function upgradeFarm() {
  const result = await api('/api/farm/upgrade', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify('灵田升级成功！');
  visitMansionArea('spirit_field');
}

// ===== 仆役系统 =====
async function showServantPanel(servantId) {
  const servants = await apiGet('/api/servants/mine');
  const servant = servants.find(s => s.id === servantId);
  if (!servant) { gameNotify('没有这个仆役'); return; }

  let html = '<div style="display:flex;gap:15px;">';
  // 左侧立绘
  html += '<div style="width:120px;">';
  html += `<div style="width:100px;height:130px;background:linear-gradient(135deg,#8b5a2b,#5c3a1e);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#f5e6d3;font-size:40px;">${servant.gender === '男' ? '👨' : '👩'}</div>`;
  html += '</div>';
  // 中间信息
  html += '<div style="flex:1;">';
  html += `<h3 style="color:#5c3a1e;margin-bottom:8px;">${servant.name}</h3>`;
  html += `<p style="font-size:13px;color:#8b6914;">${servant.type} | ${servant.gender} | ${servant.age}岁</p>`;
  html += `<p style="font-size:13px;color:#8b6914;">性格：${servant.personality}</p>`;
  html += `<p style="font-size:13px;color:#8b6914;">技能：${servant.skills?.join('、') || '无'}</p>`;
  html += `<p style="font-size:13px;color:#8b6914;">忠诚度：${servant.loyalty}/100 | 满意度：${servant.satisfaction}/100</p>`;
  html += `<p style="font-size:13px;color:#8b6914;">健康：${servant.health}/100</p>`;
  html += '</div></div>';

  // 交互按钮
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px;">';
  html += `<button class="btn btn-small" onclick="interactServant('${servantId}','talk')">交谈</button>`;
  html += `<button class="btn btn-small" onclick="interactServant('${servantId}','reward')">赏赐</button>`;
  html += `<button class="btn btn-small" onclick="interactServant('${servantId}','punish')">惩罚</button>`;
  html += `<button class="btn btn-small" onclick="interactServant('${servantId}','sleep')">宠幸</button>`;
  html += `<button class="btn btn-small" style="background:#8b0000;" onclick="interactServant('${servantId}','dismiss')">驱逐</button>`;
  html += '</div>';

  // 交互剧情区
  html += '<div id="servant-interaction-result" style="margin-top:15px;padding:10px;background:rgba(139,90,43,0.1);border-radius:6px;min-height:50px;"></div>';

  showAncientModal('仆役详情', html);
}

async function interactServant(servantId, action) {
  const result = await api('/api/servants/interact', { servantId, action });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;

  const resultDiv = document.getElementById('servant-interaction-result');
  if (resultDiv) {
    resultDiv.innerHTML = `<p style="color:#5c3a1e;font-size:13px;line-height:1.8;">${result.text}</p>`;
    if (result.effects) {
      let effectText = '';
      if (result.effects.loyalty) effectText += `忠诚${result.effects.loyalty > 0 ? '+' : ''}${result.effects.loyalty} `;
      if (result.effects.satisfaction) effectText += `满意${result.effects.satisfaction > 0 ? '+' : ''}${result.effects.satisfaction} `;
      if (effectText) resultDiv.innerHTML += `<p style="color:#228b22;font-size:12px;margin-top:5px;">${effectText}</p>`;
    }
  }
  renderAll();
}

// 牙人所
async function showServantMarket() {
  const servants = await apiGet('/api/servants/for-sale');
  let html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
  html += '<span style="color:#8b6914;">牙人所 - 每月刷新</span>';
  html += '<button class="btn btn-small" onclick="refreshServantMarket()">刷新仆役</button>';
  html += '</div>';

  for (const s of servants) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${s.name}（${s.type}）</div>
        <div class="shop-item-desc">${s.gender} | ${s.age}岁 | 性格:${s.personality} | 技能:${s.skills?.join('、')}</div>
      </div>
      <span class="shop-item-price price-silver">${s.price}银两</span>
      <button class="btn btn-small" onclick="buyServant('${s.id}')">购买</button>
    </div>`;
  }
  if (servants.length === 0) html += '<p style="text-align:center;color:#8b6914;">暂无仆役出售</p>';
  showAncientModal('牙人所', html);
}

async function refreshServantMarket() {
  await api('/api/servants/refresh', {});
  showServantMarket();
}

async function buyServant(servantId) {
  const result = await api('/api/servants/buy', { servantId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.text, '提示', () => { showServantMarket(); renderAll(); });
}

// ===== 摊位系统 =====
async function showStalls() {
  const location = gameState.player.location;
  const stalls = await apiGet(`/api/stalls?location=${encodeURIComponent(location)}`);
  if (stalls.length === 0) {
    gameNotify('此处暂无摊位');
    return;
  }
  let html = '<p style="color:#8b6914;margin-bottom:10px;">此处有以下摊位：</p>';
  for (const stall of stalls) {
    html += `<div class="shop-item" style="cursor:pointer;" onclick="showStallPanel('${stall.id}')">
      <div class="shop-item-info">
        <div class="shop-item-name">${stall.name}</div>
        <div class="shop-item-desc">摊主：${stall.vendor.name} | ${stall.goods?.length || 0}件商品</div>
      </div>
      <span style="color:#8b5a2b;">查看 ›</span>
    </div>`;
  }
  showAncientModal('集市摊位', html);
}

async function showStallPanel(stallId) {
  const stall = await apiGet(`/api/stall/${stallId}`);
  if (!stall) { gameNotify('没有这个摊位'); return; }

  let html = '<div style="display:flex;gap:15px;">';
  // 左侧立绘+交互剧情
  html += '<div style="width:140px;">';
  html += `<div style="width:100px;height:130px;background:linear-gradient(135deg,#8b5a2b,#5c3a1e);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#f5e6d3;font-size:40px;margin:0 auto;">${stall.vendor.gender === '女' ? '👩' : '👨'}</div>`;
  html += `<p style="text-align:center;font-size:12px;color:#8b6914;margin-top:5px;">${stall.vendor.name}</p>`;
  // 立绘下方交互剧情
  html += '<div id="stall-interaction-result" style="margin-top:10px;padding:8px;background:rgba(139,90,43,0.1);border-radius:6px;min-height:80px;max-height:200px;overflow-y:auto;font-size:11px;line-height:1.6;color:#5c3a1e;">';
  html += '<p>你走到摊位前，摊主热情地招呼你。</p>';
  html += '</div>';
  html += '</div>';
  // 中间商品
  html += '<div style="flex:1;">';
  html += `<h4 style="color:#5c3a1e;margin-bottom:8px;">${stall.name}商品</h4>`;
  for (const item of stall.goods) {
    if (item.stock <= 0) continue;
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name" style="font-size:13px;">${item.name}${item.bargained ? '（已讲价）' : ''}</div>
        <div class="shop-item-desc">${item.desc || ''}${item.source ? ` <span style="color:#228b22;">｜来源：${item.source}</span>` : ''} 库存:${item.stock}</div>
      </div>
      <span class="shop-item-price price-spirit">${item.price}灵石</span>
      <div style="display:flex;gap:4px;">
        <button class="btn btn-small" onclick="stallBargain('${stall.id}','${item.name}')">讲价</button>
        <button class="btn btn-small" onclick="stallBuy('${stall.id}','${item.name}')">购买</button>
      </div>
    </div>`;
  }
  html += '</div>';
  // 右侧功能按钮
  html += '<div style="width:80px;">';
  html += '<h4 style="color:#5c3a1e;margin-bottom:8px;font-size:13px;">操作</h4>';
  html += `<button class="btn btn-small" style="width:100%;margin-bottom:5px;" onclick="stallSteal('${stall.id}')">偷窃</button>`;
  html += `<button class="btn btn-small" style="width:100%;" onclick="closeModal('generic-modal')">离开</button>`;
  html += '</div></div>';

  showAncientModal(stall.name, html);
}

function showStallResult(text) {
  const resultDiv = document.getElementById('stall-interaction-result');
  if (resultDiv) {
    resultDiv.innerHTML = `<p style="color:#5c3a1e;font-size:13px;line-height:1.8;">${text}</p>`;
  }
}

async function stallBargain(stallId, itemName) {
  const result = await api('/api/stall/bargain', { stallId, itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  // 重新加载摊位面板，让讲价后的新价格与（已讲价）标记实时显示
  await showStallPanel(stallId);
  setTimeout(() => showStallResult(result.text), 60);
}

async function stallBuy(stallId, itemName) {
  const result = await api('/api/stall/buy', { stallId, itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  showStallResult(result.text);
  renderAll();
}

async function stallSteal(stallId) {
  const stall = await apiGet(`/api/stall/${stallId}`);
  const availableItems = stall.goods.filter(g => g.stock > 0);
  if (availableItems.length === 0) { gameNotify('没有可偷的东西'); return; }
  const item = availableItems[Math.floor(Math.random() * availableItems.length)];
  const result = await api('/api/stall/steal', { stallId, itemName: item.name });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  showStallResult(result.text);
  renderAll();
}

// ===== 学习系统 =====
async function showLearning(category) {
  const list = await apiGet(`/api/learning/${category}`);
  const categoryNames = { alchemy: '丹方学习', forge: '炼器学习', formation: '阵法学习', technique: '功法学习' };
  let html = `<p style="color:#8b6914;margin-bottom:10px;">${categoryNames[category] || '学习'}（此处仅可学习低品级内容，高品级请前往对应藏经阁）</p>`;

  for (const item of list) {
    if (item.level > 3) continue; // 只显示低品级
    const progressPercent = item.progressPercent || 0;
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name} ${item.learned ? '✓已学会' : ''}</div>
        <div class="shop-item-desc">${item.desc} | 等级:${item.level}</div>
        <div style="width:100%;height:8px;background:#ddd;border-radius:4px;margin-top:5px;">
          <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#8b5a2b,#c9a961);border-radius:4px;"></div>
        </div>
        <div style="font-size:11px;color:#8b6914;">进度: ${item.progress}/${item.exp}（${progressPercent}%）</div>
      </div>
      ${!item.learned ? `<button class="btn btn-small" onclick="studyItem('${category}','${item.id}')">研读</button>` : '<span style="color:#228b22;">已掌握</span>'}
    </div>`;
  }
  showAncientModal(categoryNames[category] || '学习', html);
}

async function studyItem(category, itemId) {
  const result = await api('/api/learning/study', { category, itemId });
  if (result.error) { showAncientModal('提示', `<p style="text-align:center;padding:20px;color:#c0392b;">${result.error}</p>`); return; }
  if (result.state) gameState = result.state;
  let msg = `<p style="margin-bottom:10px;">${result.eventText || ''}</p>`;
  msg += `<p style="color:#8b6914;">本次增加进度：+${result.totalGain || 0}</p>`;
  if (result.learned) msg += '<p style="color:#228b22;font-weight:bold;margin-top:10px;">恭喜！你成功学会了！</p>';
  else msg += `<p style="color:#8b6914;margin-top:5px;">当前进度：${result.progress || 0}/${result.max || 0}（${Math.floor((result.progress || 0) / (result.max || 1) * 100)}%）</p>`;
  showAncientModal('研读结果', msg);
  // 立即刷新学习列表（进度即时更新）
  renderAll();
  const listData = await apiGet(`/api/learning/${category}`);
  showLearningList(category, listData);
}

// 渲染学习列表（供研读后立即刷新）
function showLearningList(category, list) {
  const categoryNames = { alchemy: '学丹', forge: '学器', formation: '学阵' };
  const items = list || [];
  let html = `<p style="color:#8b6914;margin-bottom:10px;">此处仅可学习低品级（1-3阶）内容，高品级请前往丹塔藏经阁、坊市器方阁或阵法师协会交钱学习。</p>`;
  html += '<div style="max-height:320px;overflow-y:auto;">';
  if (items.length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:20px;">没有可学习的内容</p>';
  }
  for (const item of items) {
    const progress = item.learned ? 100 : (item.progress || 0);
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc || ''}</div>
        <div style="font-size:11px;color:#228b22;">研读进度: ${progress}%</div>
        <div style="width:100%;height:6px;background:#3a2a1a;border-radius:3px;margin-top:3px;">
          <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#cd853f,#daa520);border-radius:3px;"></div>
        </div>
      </div>
      <button class="btn btn-small" ${item.learned ? 'disabled' : ''} onclick="studyItem('${category}','${item.id}')">${item.learned ? '已学会' : '研读'}</button>
    </div>`;
  }
  html += '</div>';
  showAncientModal(categoryNames[category] || '学习', html);
}

// 付费学习面板（器方阁/阵法师协会通用）
async function showPaidLearning(category) {
  const list = await apiGet(`/api/learn/paid/${category}`);
  const titles = { alchemy: '丹方藏经阁', forge: '器方阁', formation: '阵法师协会' };
  const hints = {
    alchemy: '丹塔藏经阁可研读所有品级丹方，每次研读需交钱。',
    forge: '器方阁收录所有品级的器方，交钱即可研读。',
    formation: '阵法师协会可研读高级阵法（含高阶），交钱即可研读。',
  };
  let html = `<p style="color:#8b6914;margin-bottom:10px;">${hints[category] || ''}</p>`;
  const unlearned = (list || []).filter(r => !r.learned);
  if (unlearned.length === 0) {
    html += '<p style="color:#8b6914;text-align:center;padding:20px;">该分类的内容已全部学会</p>';
  }
  for (const item of unlearned) {
    const costText = item.cost.type === 'silver' ? `${item.cost.amount}银两` : `${item.cost.amount}灵石`;
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}（${item.tier}阶）</div>
        <div class="shop-item-desc">${item.desc || ''}</div>
        <div style="font-size:11px;color:#228b22;">研读进度: ${item.learned ? 100 : (item.progress || 0)}%</div>
        <div style="width:100%;height:6px;background:#3a2a1a;border-radius:3px;margin-top:3px;">
          <div style="width:${item.learned ? 100 : (item.progress || 0)}%;height:100%;background:linear-gradient(90deg,#cd853f,#daa520);border-radius:3px;"></div>
        </div>
      </div>
      <button class="btn btn-small" onclick="studyPaid('${category}','${item.id}')">研读(${costText})</button>
    </div>`;
  }
  showAncientModal(titles[category] || '付费学习', html);
}

// 阵法师协会：已学阵法（布阵/撤阵）+ 高级阵法付费学习
async function showFormationAssociation() {
  const info = await apiGet('/api/formation');
  let html = `<p style="margin-bottom:10px;">阵法等级: <b>${info.level?.name || '阵徒'}</b></p>`;
  html += '<h4 style="color:#8b6914;margin:12px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">已学阵法（可在私宅制阵房布阵）</h4>';
  const learned = info.learned || [];
  if (learned.length === 0) html += '<p style="color:#8b6914;font-size:13px;">还没有学会阵法</p>';
  for (const f of learned) {
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${f.name}（${f.tier}阶）</div>
        <div class="shop-item-desc">${f.desc || ''}</div>
      </div>
      <button class="btn btn-small" onclick="activateFormation('${f.id}')">${info.active === f.id ? '撤阵' : '布阵'}</button>
    </div>`;
  }
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">📜 高级阵法研读（交钱学习）</h4>';
  html += '<div style="text-align:center;margin:8px 0;"><button class="btn" onclick="showPaidLearning(\'formation\')">前往研读高级阵法</button></div>';
  // ===== 符箓系统 =====
  const tal = await apiGet('/api/talisman');
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">🪄 制符熟练度：' + (tal.level?.name || '制徒') + '（exp ' + (tal.exp || 0) + '）</h4>';
  // 符箓商店（每月随机20种）
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">🏪 符箓商店（每月随机，浮动价格）</h4>';
  for (const g of (tal.shop || [])) {
    html += '<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name">' + g.name + '（' + g.tier + '品·' + g.type + '）</div><div class="shop-item-desc">' + g.desc + '</div><div style="font-size:11px;color:#8b6914;">现价 ' + g.price + ' 灵石</div></div><button class="btn btn-small" onclick="buyTalisman(\'' + g.id + '\')">购买</button></div>';
  }
  // 符箓学习（按品级）
  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">📖 符箓研习（学习后可制作）</h4>';
  const learnedIds = tal.learned || [];
  for (const t of talismansAll) {
    const learned = learnedIds.includes(t.id);
    html += '<div class="shop-item"><div class="shop-item-info"><div class="shop-item-name">' + t.name + '（' + t.tier + '品·' + t.type + '）' + (learned ? ' ✅已学' : '') + '</div><div class="shop-item-desc">' + t.desc + '<br>材料：' + (t.materials || []).map(m => m.name + '×' + m.count).join('、') + ' | 学习费 ' + t.learnCost + ' 灵石</div></div>' + (learned ? '<button class="btn btn-small" onclick="craftTalisman(\'' + t.id + '\')">制作</button>' : '<button class="btn btn-small" onclick="learnTalisman(\'' + t.id + '\')">学习</button>') + '</div>';
  }
  showAncientModal('阵法师协会', html);
}

// ===== 符箓前端 =====
const talismansAll = [
  { id: 'huoqiu', name: '火球符', tier: '凡', type: '攻击', learnCost: 100, materials: [{ name: '朱砂', count: 1 }, { name: '灵草', count: 1 }], desc: '掷出火球，造成火焰伤害' },
  { id: 'bingzhui', name: '冰锥符', tier: '凡', type: '攻击', learnCost: 100, materials: [{ name: '朱砂', count: 1 }, { name: '月华露', count: 1 }], desc: '射出冰锥，造成冰霜伤害' },
  { id: 'juli', name: '巨力符', tier: '凡', type: '增益', learnCost: 120, materials: [{ name: '朱砂', count: 1 }, { name: '妖兽骨', count: 1 }], desc: '贴符后攻击+30%（3回合）' },
  { id: 'fengxing', name: '风行符', tier: '凡', type: '增益', learnCost: 120, materials: [{ name: '朱砂', count: 1 }, { name: '灵木', count: 1 }], desc: '身轻如燕，移动消耗减半' },
  { id: 'hudun', name: '护盾符', tier: '灵', type: '防御', learnCost: 300, materials: [{ name: '朱砂', count: 2 }, { name: '灵木', count: 2 }], desc: '展开灵力护盾' },
  { id: 'yinshen', name: '隐身符', tier: '灵', type: '特殊', learnCost: 300, materials: [{ name: '朱砂', count: 2 }, { name: '月华露', count: 2 }], desc: '隐去身形3回合' },
  { id: 'kundi', name: '困敌符', tier: '灵', type: '控制', learnCost: 350, materials: [{ name: '朱砂', count: 2 }, { name: '妖兽骨', count: 2 }], desc: '束缚敌人3回合' },
  { id: 'pihuo', name: '辟火符', tier: '灵', type: '防御', learnCost: 350, materials: [{ name: '朱砂', count: 2 }, { name: '雷石', count: 1 }], desc: '免疫火焰伤害5回合' },
  { id: 'zhenshi', name: '镇尸符', tier: '灵', type: '攻击', learnCost: 400, materials: [{ name: '朱砂', count: 3 }, { name: '阴魂珠', count: 1 }], desc: '对阴物造成大量伤害' },
  { id: 'chuansong', name: '传送符', tier: '宝', type: '特殊', learnCost: 2000, materials: [{ name: '朱砂', count: 3 }, { name: '月华露', count: 3 }, { name: '妖丹', count: 1 }], desc: '传送至任意已探索地点' },
  { id: 'huaxing2', name: '化形符', tier: '宝', type: '特殊', learnCost: 5000, materials: [{ name: '朱砂', count: 3 }, { name: '妖丹', count: 3 }, { name: '紫霞参', count: 1 }], desc: '妖族化为人形，进入人族城镇' },
  { id: 'tianlei', name: '天雷符', tier: '仙', type: '攻击', learnCost: 20000, materials: [{ name: '雷竹', count: 2 }, { name: '朱砂', count: 5 }, { name: '妖丹', count: 3 }], desc: '引动天雷，毁灭性伤害' },
];

async function learnTalisman(id) {
  const result = await api('/api/talisman/learn', { talismanId: id });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showFormationAssociation(); });
}

async function craftTalisman(id) {
  const result = await api('/api/talisman/craft', { talismanId: id });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showFormationAssociation(); });
}

async function buyTalisman(id) {
  const result = await api('/api/talisman/buy', { talismanId: id });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showFormationAssociation(); });
}

// ===== 铁匠铺（清风镇）：购买低品级器炉 + 交费炼制低品级武器饰品 =====
async function showBlacksmith() {
  const forgeList = await apiGet('/api/learn/paid/forge');
  const learned = (forgeList || []).filter(r => r.learned && r.tier <= 2);
  const p = gameState.player;

  let html = '<p style="color:#8b6914;margin-bottom:10px;">铁匠铺可购买低品级（1-2阶）器炉，也可使用铺内器炉交费炼制低品级武器饰品。</p>';
  html += '<div style="text-align:center;margin:8px 0;"><button class="btn" onclick="showToolMarket(\'forge\',1,2)">购买器炉（低品级）</button></div>';

  html += '<h4 style="color:#8b6914;margin:15px 0 8px;border-bottom:1px solid rgba(139,90,43,0.3);padding-bottom:5px;">🔨 低品级炼制（交费使用铺内器炉）</h4>';
  if (learned.length === 0) {
    html += '<p style="color:#8b6914;font-size:13px;">你还没有学会低品级器方。先到「学器」或坊市「器方阁」研读器方吧。</p>';
  }
  for (const recipe of learned) {
    const fee = recipe.tier === 1 ? 50 : 150;
    const mats = (recipe.materials || []).map(m => {
      const have = p.inventory?.find(i => i.name === m)?.count || 0;
      return `<span style="color:${have >= 1 ? '#228b22' : '#cd5c5c'};">${m}×1(${have})</span>`;
    }).join('，');
    html += `<div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${recipe.name}（${recipe.tier}阶）</div>
        <div class="shop-item-desc">${recipe.desc || ''}<br>材料: ${mats}</div>
      </div>
      <button class="btn btn-small" onclick="blacksmithCraft('${recipe.id}')">炼制(${fee}银两)</button>
    </div>`;
  }
  showAncientModal('铁匠铺', html);
}

async function blacksmithCraft(recipeId) {
  const result = await api('/api/blacksmith/craft', { recipeId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  showAncientModal('炼制结果', `<p style="text-align:center;padding:20px;">${result.msg}</p>`);
}

// ===== 蛊术体系（万毒沼泽蛊师小屋）=====
// ===== 珍宝阁：兑换秘宝 / 盗取 =====
async function showTreasureExchange() {
  const data = await apiGet('/api/treasure/goods');
  const contrib = data.contribution || 0;
  let html = `<div style="margin-bottom:12px;padding:10px;background:rgba(201,169,97,0.12);border:1px solid rgba(201,169,97,0.4);border-radius:6px;color:#5c3a1e;font-size:14px;">
    <b>你的贡献：${contrib} 点</b>（完成任务可获得贡献，主线任务贡献最多）</div>`;
  html += `<table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr style="background:rgba(139,90,43,0.15);">
      <th style="padding:6px;border:1px solid #c9a961;">名称</th>
      <th style="padding:6px;border:1px solid #c9a961;">品级</th>
      <th style="padding:6px;border:1px solid #c9a961;">功能</th>
      <th style="padding:6px;border:1px solid #c9a961;">贡献</th>
      <th style="padding:6px;border:1px solid #c9a961;"></th>
    </tr>`;
  const tierName = { special: '特殊', weapon: '武器', pill: '丹药', furnace: '器具' };
  for (const g of data.goods) {
    html += `<tr>
      <td style="padding:6px;border:1px solid rgba(201,169,97,0.4);">${g.name}</td>
      <td style="padding:6px;border:1px solid rgba(201,169,97,0.4);">${tierName[g.category] || g.category}</td>
      <td style="padding:6px;border:1px solid rgba(201,169,97,0.4);">${g.desc}</td>
      <td style="padding:6px;border:1px solid rgba(201,169,97,0.4);">${g.cost}</td>
      <td style="padding:6px;border:1px solid rgba(201,169,97,0.4);"><button class="btn btn-small" onclick="doExchangeTreasure('${g.id}')">兑换</button></td>
    </tr>`;
  }
  html += `</table><p style="color:#8b6914;font-size:12px;margin-top:8px;">秘宝每月随机刷新20件，兑换物品将放入背包。</p>`;
  showAncientModal('✨ 兑换秘宝', html);
}

async function doExchangeTreasure(goodsId) {
  const result = await api('/api/treasure/exchange', { goodsId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showTreasureExchange(); });
}

async function showTreasureSteal() {
  const data = await apiGet('/api/treasure/goods');
  const contrib = data.contribution || 0;
  const p = gameState.player;
  const stealLevel = (p.steal && p.steal.level) || 1;
  const dexterity = p.attributes && p.attributes.dexterity || 0;
  const luck = p.attributes && p.attributes.luck || 0;
  const rate = Math.max(10, Math.min(85, Math.round(15 + stealLevel * 5 + dexterity * 0.3 + luck * 0.3)));
  let html = `<div style="padding:10px;background:rgba(205,92,92,0.08);border:1px solid rgba(205,92,92,0.4);border-radius:6px;margin-bottom:12px;font-size:13px;color:#5c3a1e;">
    <b>盗取藏宝阁</b><br>
    依你当前的偷窃技艺（等级${stealLevel}、身法${dexterity}、气运${luck}），成功率约 <b>${rate}%</b>。<br>
    <span style="color:#a0522d;">失败将损失声望并被罚款。</span>
  </div>
  <div style="display:flex;gap:10px;">
    <button class="btn" style="flex:1;background:rgba(139,69,19,0.25);border-color:#8b4513;color:#f5deb3;" onclick="doTreasureSteal()">🗡 盗取</button>
    <button class="btn" style="flex:1;" onclick="closeModal('generic-modal')">取消</button>
  </div>`;
  showAncientModal('🗡 盗取藏宝阁', html);
}

async function doTreasureSteal() {
  const result = await api('/api/treasure/steal', {});
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  const color = result.success ? '#228b22' : '#cd5c5c';
  showAncientModal(result.success ? '🎉 盗取成功' : '⚠️ 盗取失败',
    `<div style="padding:20px;text-align:center;color:${color};font-size:15px;line-height:1.9;">${result.msg}</div>`);
  renderAll();
}

async function showGuShrine() {
  const info = await apiGet('/api/gushou');
  if (!info || info.error) { gameNotify(info?.error || '蛊师暂不接待'); return; }

  let html = `<h3 style="color:#3d2817;margin-bottom:8px;">🦂 蛊师小屋</h3>`;
  html += `<p style="color:#6b4f2a;font-size:13px;margin-bottom:14px;">一位黑袍老者佝偻着坐在竹椅上，抬头看了你一眼："想学蛊术，还是买蛊虫？蛊虫只在老朽这里有的卖。"</p>`;

  // 蛊术
  html += '<h4 style="color:#5c3a1e;margin-bottom:8px;">📜 蛊术（永久生效）</h4>';
  for (const art of info.arts || []) {
    if (art.learned) {
      html += `<div style="padding:10px;margin-bottom:8px;background:rgba(34,139,34,0.1);border-radius:6px;border:1px solid #228b22;">
        <b style="color:#228b22;">✓ ${art.name}</b>（已学会）<br>
        <span style="font-size:12px;color:#6b4f2a;">${art.desc}</span>
      </div>`;
    } else {
      html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.06);border-radius:6px;border:1px solid #8b5a2b;">
        <b style="color:#5c3a1e;">${art.name}</b> <span style="font-size:12px;color:#8b5a2b;">${art.price}灵石</span><br>
        <span style="font-size:12px;color:#6b4f2a;">${art.desc}</span>
        <div style="text-align:right;margin-top:6px;"><button class="btn btn-small" onclick="learnGuArt('${art.id}')">学习</button></div>
      </div>`;
    }
  }

  // 蛊虫
  html += '<h4 style="color:#5c3a1e;margin:16px 0 8px;">🐛 蛊虫（各品级，需灵石+毒草）</h4>';
  for (const w of info.worms || []) {
    const rankColor = { '凡蛊': '#7f8c8d', '良蛊': '#27ae60', '珍蛊': '#2980b9', '灵蛊': '#8e44ad', '神蛊': '#c0392b' }[w.rank] || '#7f8c8d';
    if (w.owned) {
      html += `<div style="padding:10px;margin-bottom:8px;background:rgba(34,139,34,0.1);border-radius:6px;border:1px solid #228b22;">
        <b style="color:#228b22;">✓ ${w.name}</b> <span style="color:${rankColor};font-size:12px;">${w.rank}</span>（已拥有，在灵宠中可查看）<br>
        <span style="font-size:12px;color:#6b4f2a;">${w.desc}</span>
      </div>`;
    } else {
      html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.06);border-radius:6px;border:1px solid #8b5a2b;">
        <b style="color:#5c3a1e;">${w.name}</b> <span style="color:${rankColor};font-size:12px;">${w.rank}</span> <span style="font-size:12px;color:#8b5a2b;">${w.price}灵石 + ${w.poisonHerb}毒草</span><br>
        <span style="font-size:12px;color:#6b4f2a;">攻${w.stats.atk} 防${w.stats.def} 速${w.stats.spd} 血${w.stats.hp} | ${w.skill}</span>
        <div style="text-align:right;margin-top:6px;"><button class="btn btn-small" onclick="buyGuWorm('${w.id}')">购买</button></div>
      </div>`;
    }
  }

  html += '<p style="color:#8b6914;font-size:12px;margin-top:10px;">毒草可在万毒沼泽「毒草采集」获得；蛊虫购买后自动放入灵宠栏。</p>';
  showAncientModal('🦂 蛊师小屋', html);
}

async function learnGuArt(artId) {
  const result = await api('/api/gushou/learn', { artId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg, '提示', () => { showGuShrine(); });
}

async function buyGuWorm(wormId) {
  const result = await api('/api/gushou/buy', { wormId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  gameNotify(result.msg);
  renderTopBar();
  showGuShrine();
}

// ===== 风花雪月系统（温柔乡·灵姬灵郎）=====
let currentWF = null; // 当前选中的灵姬/灵郎
let wfPersonsCache = []; // 风花雪月人物最新缓存（来自 /api/windflower）

// 打开风花雪月独立地图（从自由坊市进入）
function openWindFlowerMap() {
  switchPage('windflower');
  renderWindFlowerMap();
}

// 渲染风花雪月地图内容（按新版设计：灵姬/灵郎按钮 -> 选人弹窗 -> 交互界面）
async function renderWindFlowerMap() {
  const container = document.getElementById('windflower-map-content');
  if (!container) return;
  const data = await apiGet('/api/windflower');
  const venue = data.venue || { name: '温柔乡' };
  const persons = data.persons || [];
  wfPersonsCache = persons;
  // 此地普通NPC（非灵姬灵郎）：点击弹NPC面板
  const localNpcs = (gameState.npcs || []).filter(n =>
    n.location === (gameState.player && gameState.player.location) && !n.isWindFlower
  );

  if (data.hint) {
    container.innerHTML = `<p style="color:#e8d5a8;font-size:14px;padding:20px;text-align:center;">${data.hint}</p>`;
    return;
  }

  const girls = persons.filter(p => p.gender === '女' && !p.freed);
  const boys = persons.filter(p => p.gender === '男' && !p.freed);

  const hasWF = !!currentWF;
  let html = `<div style="position:relative;min-height:${hasWF ? 470 : 300}px;padding:15px;">`;
  // 顶部：离开 + 标题 + 人物数
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <button class="btn btn-small" onclick="switchPage('map')">‹ 离开</button>
    <h3 style="color:#f5e6c8;margin:0;">${venue.name || '温柔乡'}</h3>
    <span style="color:#e8d5a8;font-size:12px;">此处人物（${localNpcs.length}人）</span>
  </div>`;

  // 灵姬/灵郎选择按钮
  html += `<div style="display:flex;gap:10px;margin-bottom:10px;">
    <button class="btn" style="background:rgba(255,138,158,0.25);border-color:#ff8a9e;color:#ffd7dd;flex:1;padding:8px;" onclick="showWFSelect('女')">🌸 灵姬（${girls.length}位）</button>
    <button class="btn" style="background:rgba(126,200,255,0.25);border-color:#7ec8ff;color:#d6ecff;flex:1;padding:8px;" onclick="showWFSelect('男')">💮 灵郎（${boys.length}位）</button>
  </div>`;

  // 选中人物区：立绘 + 信息 + 交互按钮 + 剧情框（紧贴上方，中间无空缺）
  html += '<div style="display:flex;gap:12px;align-items:stretch;">';
  html += '<div style="flex:0 0 150px;text-align:center;">';
  html += `<div id="wf-portrait" style="height:${hasWF ? 170 : 110}px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(201,169,97,0.35);border-radius:8px;background:rgba(20,10,8,0.6);overflow:hidden;">`;
  html += currentWF ? `<img src="${resolvePortrait(currentWF.portrait)}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;">` : '<span style="color:#8b7a5a;font-size:13px;">未选择人物</span>';
  html += '</div>';
  html += `<div id="wf-person-info" style="margin-top:6px;color:#f5e6c8;font-size:12px;line-height:1.6;">${currentWF ? `${currentWF.name}<br>身价${currentWF.cost}银两/次 | 好感${currentWF.favor}` : ''}</div>`;
  html += '</div>';
  html += '<div style="flex:1;display:flex;flex-direction:column;gap:8px;">';
  html += '<div id="wf-actions" style="display:flex;flex-wrap:wrap;gap:8px;padding:8px;background:rgba(20,10,8,0.6);border-radius:8px;border:1px solid rgba(201,169,97,0.3);min-height:44px;align-items:center;">';
  if (currentWF) {
    html += actionBtn('谈情说爱', `windFlowerAction('${currentWF.id}','chat')`);
    html += actionBtn('春宵一度', `windFlowerAction('${currentWF.id}','spring')`);
    html += actionBtn('赎身', `windFlowerRedeem('${currentWF.id}')`);
    html += actionBtn('记事', `windFlowerNotes('${currentWF.id}')`);
    html += actionBtn('赠送', `windFlowerGift('${currentWF.id}')`);
    html += actionBtn('子嗣', `windFlowerAction('${currentWF.id}','children')`);
  } else {
    html += '<span style="color:#8b7a5a;font-size:13px;">请先选择一位灵姬/灵郎</span>';
  }
  html += '</div>';
  html += `<div id="wf-story" style="flex:1;padding:10px;background:rgba(20,10,8,0.7);border-radius:8px;border:1px solid rgba(201,169,97,0.3);color:#e8d5a8;font-size:13px;line-height:1.7;overflow-y:auto;white-space:pre-line;min-height:${hasWF ? 130 : 60}px;">${currentWF ? (currentWF.lastMsg || '向她/他打个招呼吧。') : '选择人物后，可谈情说爱、赠礼、赎身、记事，好感达到后可更进一步。'}</div>`;
  html += '</div>';
  html += '</div>';

  // 此处人物区域：显示在此地的普通NPC（非灵姬灵郎，横向卡片，点击弹NPC面板，置底紧凑）
  html += '<div style="margin-top:10px;">';
  html += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;">';
  if (localNpcs.length === 0) {
    html += '<span style="color:#8b7a5a;font-size:13px;">此处暂无其他人物</span>';
  }
  for (const n of localNpcs) {
    const alive = n.isAlive !== false;
    html += `<div onclick="showNPCDetail('${n.id}')" style="flex:0 0 auto;width:100px;text-align:center;padding:6px;cursor:pointer;border-radius:8px;border:1px solid rgba(201,169,97,0.3);background:rgba(0,0,0,0.25);" title="点击查看详情">`;
    html += `<img src="${resolvePortrait(n.portrait) || ''}" style="width:48px;height:60px;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'">`;
    html += `<div style="font-size:12px;color:${alive ? '#e8d5a8' : '#9c8a62'};margin-top:3px;">${n.name}${alive ? '' : '（已故）'}</div>`;
    html += `<div style="font-size:10px;color:#8b7a5a;">${n.professionName || n.profession || '散修'}</div>`;
    html += '</div>';
  }
  html += '</div></div>';
  html += '</div>';
  container.innerHTML = html;
}

function actionBtn(label, onclick) {
  return `<button class="btn btn-small" style="font-size:12px;" onclick="${onclick}">${label}</button>`;
}

// ===== 拍卖行 =====
async function openAuction() {
  const data = await apiGet('/api/auction');
  const items = data.items || [];
  let html = '<h3 style="color:#5c3a1e;margin-bottom:10px;">🏛 拍卖行 · 起拍价=材料成本×2</h3>';
  if (items.length === 0) html += '<p style="color:#8b6914;text-align:center;padding:20px;">当前没有在拍物品</p>';
  for (const it of items) {
    html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.06);border-radius:6px;border:1px solid rgba(139,90,43,0.25);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <b style="color:#5c3a1e;">${it.itemName}</b> <span style="font-size:11px;color:#8b6914;">[${it.type}]</span><br>
          <span style="font-size:12px;color:#8b6914;">起拍价 ${it.startPrice} | 当前 ${it.currentPrice} | 材料成本 ${it.cost} | 剩${it.roundsLeft}月结标</span>
        </div>
        <button class="btn btn-small" onclick="bidAuction('${it.id}')" style="font-size:12px;">出价</button>
      </div>
    </div>`;
  }
  html += '<p style="font-size:11px;color:#8b6914;margin-top:8px;">出价需高于当前价至少10；有人出价则顺延3月；无人出价到期流拍。随机NPC会按银钱/灵石参与竞拍。</p>';
  // 竞拍记事：显示竞拍记录及得主记录
  const history = data.history || [];
  if (history.length > 0) {
    html += '<h4 style="color:#5c3a1e;margin:14px 0 8px;">📜 竞拍记事</h4>';
    html += '<div style="max-height:220px;overflow-y:auto;border:1px solid rgba(139,90,43,0.2);border-radius:6px;padding:8px;">';
    for (const h of history.slice(-12).reverse()) {
      html += `<div style="padding:6px 4px;border-bottom:1px dashed rgba(139,90,43,0.15);font-size:12px;color:#5c3a1e;">`;
      html += `<div style="display:flex;justify-content:space-between;"><b>${h.itemName}</b><span style="color:#8b6914;">${h.time || ''}</span></div>`;
      html += `<div style="color:#8b6914;margin-top:2px;">${h.note || `以${h.price}成交（${h.bidder}）`}</div>`;
      html += `</div>`;
    }
    html += '</div>';
  }
  showAncientModal('🏛 拍卖行', html);
}

async function bidAuction(auctionId) {
  const cur = await apiGet('/api/auction');
  const item = (cur.items || []).find(i => i.id === auctionId);
  if (!item) { gameNotify('拍卖品已结标'); return; }
  // 拍卖出价改为游戏内输入弹窗
  gamePrompt(`【${item.itemName}】当前价 ${item.currentPrice}\n输入你的出价（至少 ${item.currentPrice + 10}）：`, item.currentPrice + 10, async (price) => {
    if (!price) return;
    const result = await api('/api/auction/bid', { auctionId, price: parseInt(price, 10) });
    if (result.error) { gameNotify(result.error); return; }
    if (result.state) gameState = result.state;
    gameNotify(result.msg || '出价成功', '提示', () => { openAuction(); });
    renderAll();
  }, '拍卖出价');
}


// 弹出选择人物列表（灵姬/灵郎）
function showWFSelect(gender) {
  const allWf = (gameState.windFlower && gameState.windFlower.generated) || {};
  const persons = (wfPersonsCache.length > 0 ? wfPersonsCache : Object.values(allWf).flat()).filter(p => p.gender === gender && !p.freed);
  let html = `<h3 style="color:#5c3a1e;margin-bottom:10px;">选择${gender === '女' ? '灵姬' : '灵郎'}</h3>`;
  if (persons.length === 0) { html += '<p style="color:#8b6914;text-align:center;padding:20px;">暂无可用人物</p>'; }
  for (const p of persons) {
    html += `<div class="shop-item" style="cursor:pointer;" onclick="windFlowerSelect('${p.id}')">
      <div class="shop-item-info">
        <div class="shop-item-name">${p.name} <span style="font-size:12px;color:#b8860b;">${'★'.repeat(p.popularity)}</span></div>
        <div class="shop-item-desc">${p.appearanceLabel} · ${p.age}岁 | 费用 ${p.cost} 银两 | 好感${p.favor}</div>
      </div>
    </div>`;
  }
  showAncientModal(`${gender === '女' ? '🌸 灵姬' : '💮 灵郎'}`, html);
}

// 选择人物：自动扣费并关闭弹窗，进入交互界面
async function windFlowerSelect(personId) {
  const result = await api('/api/windflower/select', { personId });
  // ⑩ 银两不足/已赎身等失败场景：后端返回 success:false + msg（非 error），前端必须拦截，不能继续进入交互
  if (result.success === false || result.error) { gameNotify(result.msg || result.error || '选择失败'); return; }
  if (result.state) gameState = result.state;
  const person = result.person;
  currentWF = { ...person, lastMsg: result.msg };
  closeModal('generic-modal');
  renderAll();
  if (document.getElementById('page-windflower') && document.getElementById('page-windflower').classList.contains('active')) renderWindFlowerMap();
}

// 风花雪月交互：结果输出到剧情框
async function windFlowerAction(personId, action, itemName, mode, rank) {
  const result = await api('/api/windflower/interact', { personId, action, itemName, mode, rank });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  // 刷新选中人物的最新信息
  const allWf = (gameState.windFlower && gameState.windFlower.generated) || {};
  const person = (wfPersonsCache.length > 0 ? wfPersonsCache : Object.values(allWf).flat()).find(p => p.id === personId) || null;
  if (person && currentWF && currentWF.id === personId) {
    currentWF.favor = person.favor;
    currentWF.cost = person.cost;
    currentWF.redeemPrice = person.redeemPrice;
    if (result.msg) currentWF.lastMsg = result.msg;
  }
  if (action === 'children') {
    let html = `<h3 style="color:#5c3a1e;margin-bottom:10px;">${result.name}的子嗣</h3>`;
    if ((result.children || []).length === 0) html += '<p style="color:#8b6914;">暂无子嗣</p>';
    for (const c of result.children || []) {
      html += `<div style="padding:8px;border-bottom:1px solid rgba(139,90,43,0.15);">${c.name} · ${c.age}岁 · ${c.realm} · ${c.gender}</div>`;
    }
    showAncientModal('子嗣', html);
    return;
  }
  if (action === 'notes') {
    windFlowerNotes(personId);
    return;
  }
  if (action === 'redeem' && result.success) {
    currentWF = null;
    renderWindFlowerMap();
    if (result.msg) showAncientModal('赎身', `<p style="color:#5c3a1e;text-align:center;padding:20px;">${result.msg}</p>`);
    return;
  }
  // 其他交互：显示剧情弹窗 + 刷新剧情框（修复：点击后没有剧情）
  if (result.msg && (action === 'chat' || action === 'spring' || action === 'gift')) {
    const pName = (currentWF && currentWF.id === personId && currentWF.name) ||
      ((gameState.npcs || []).find(n => n.id === personId) || {}).name ||
      result.name || '灵姬/灵郎';
    showAncientModal(pName, `<div style="color:#3d2817;white-space:pre-line;line-height:1.8;font-size:14px;padding:6px;">${result.msg}</div><div style="text-align:center;margin-top:12px;"><button class="btn btn-primary" onclick="closeModal('generic-modal')">确定</button></div>`);
  }
  renderWindFlowerMap();
}

// 风花雪月赎身：可选择收入宅中为妻妾（手动选位分）或只赎身
async function windFlowerRedeem(personId) {
  const allWf = (gameState.windFlower && gameState.windFlower.generated) || {};
  const person = (wfPersonsCache.length > 0 ? wfPersonsCache : Object.values(allWf).flat()).find(p => p.id === personId);
  if (!person) { gameNotify('没有找到这个人'); return; }
  if (person.favor < 50) { gameNotify(`好感不足（${person.favor}/100），${person.name}还不愿随你离开，好感≥50方可赎身`); return; }
  const ranks = await apiGet('/api/harem/ranks');
  let html = `<p style="color:#5c3a1e;margin-bottom:12px;">为${person.name}赎身需 ${person.redeemPrice} 银两，你打算如何安置他/她？</p>`;
  html += '<div style="max-height:320px;overflow-y:auto;">';
  html += `<div style="padding:10px;margin-bottom:8px;background:rgba(34,139,34,0.08);border-radius:4px;cursor:pointer;border:1px solid #228b22;" onclick="windFlowerAction('${personId}','redeem','','free')">
    <b style="color:#228b22;">🕊 只赎身</b><br>
    <span style="font-size:12px;color:#8b6914;">对方重获自由，从此在大世界中生活，之后可按普通NPC交互。</span>
  </div>`;
  for (const rank of ranks) {
    html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b5a2b;" onclick="windFlowerAction('${personId}','redeem','','mansion',${rank.rank})">
      <b style="color:#8b5a2b;">🏯 收入宅中 · ${rank.name}</b>（上限${rank.limit}人）<br>
      <span style="font-size:12px;color:#8b6914;">${rank.desc}</span>
    </div>`;
  }
  html += '</div>';
  showAncientModal('赎身', html);
}

// 灵姬/灵郎面板"求娶纳妾"：花赎身价收入宅中为妻妾（选位分）
async function windFlowerMarry(personId) {
  const allWf = (gameState.windFlower && gameState.windFlower.generated) || {};
  const person = (wfPersonsCache.length > 0 ? wfPersonsCache : Object.values(allWf).flat()).find(p => p.id === personId);
  if (!person) { gameNotify('没有找到这个人'); return; }
  if (person.favor < 50) { gameNotify(`好感不足（${person.favor}/100），${person.name}还不愿随你离开，好感≥50方可求娶纳妾`); return; }
  const ranks = await apiGet('/api/harem/ranks');
  let html = `<p style="color:#5c3a1e;margin-bottom:12px;">求娶${person.name}入宅需花费 <b style="color:#8b5a2b;">${person.redeemPrice} 银两</b>（与其他NPC不同，灵姬/灵郎用银两即可纳娶），请选择位分：</p>`;
  html += '<div style="max-height:320px;overflow-y:auto;">';
  for (const rank of ranks) {
    html += `<div style="padding:10px;margin-bottom:8px;background:rgba(139,90,43,0.05);border-radius:4px;cursor:pointer;border:1px solid #8b5a2b;" onclick="windFlowerAction('${personId}','redeem','','mansion',${rank.rank})">
      <b style="color:#8b5a2b;">🏯 收入宅中 · ${rank.name}</b>（上限${rank.limit}人）<br>
      <span style="font-size:12px;color:#8b6914;">${rank.desc}</span>
    </div>`;
  }
  html += '</div>';
  showAncientModal('💍 求娶纳妾', html);
}

// 灵姬/灵郎面板"赎身"：花赎身价使其重获自由（与大世界NPC同等待遇）
async function windFlowerFree(personId) {
  const allWf = (gameState.windFlower && gameState.windFlower.generated) || {};
  const person = (wfPersonsCache.length > 0 ? wfPersonsCache : Object.values(allWf).flat()).find(p => p.id === personId);
  if (!person) { gameNotify('没有找到这个人'); return; }
  if (person.favor < 50) { gameNotify(`好感不足（${person.favor}/100），${person.name}还不愿随你离开，好感≥50方可赎身`); return; }
  gameConfirm(`为${person.name}赎身需花费 ${person.redeemPrice} 银两，使其重获自由、从此在大世界中生活。是否继续？`, () => {
    windFlowerAction(personId, 'redeem', '', 'free');
  }, '赎身确认');
}

async function windFlowerGift(personId) {
  const p = gameState.player;
  const items = (p.inventory || []).filter(i => i.count > 0);
  let html = '<h3 style="color:#5c3a1e;margin-bottom:10px;">选择要赠送的物品</h3>';
  if (items.length === 0) html += '<p style="color:#8b6914;text-align:center;padding:20px;">背包空空如也</p>';
  for (const item of items.slice(0, 40)) {
    html += `<div class="shop-item" style="cursor:pointer;" onclick="windFlowerAction('${personId}','gift','${item.name}')">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">数量: ${item.count}</div>
      </div>
    </div>`;
  }
  showAncientModal('赠礼', html);
}

async function windFlowerNotes(personId) {
  const result = await api('/api/windflower/interact', { personId, action: 'notes' });
  if (result.error || result.success === false) { gameNotify(result.msg || result.error || '记事读取失败'); return; }
  if (result.state) gameState = result.state;
  const notes = result.notes || [];
  let html = `<h3 style="color:#5c3a1e;margin-bottom:10px;">${result.name || '灵姬/灵郎'}的记事</h3>`;
  html += '<div style="max-height:300px;overflow-y:auto;">';
  if (notes.length === 0) html += '<p style="color:#8b6914;">暂无记事</p>';
  for (const n of notes.slice(-20).reverse()) {
    html += `<div style="padding:6px 0;border-bottom:1px solid rgba(139,90,43,0.15);font-size:13px;color:#3d2817;">${n}</div>`;
  }
  html += '</div>';
  showAncientModal('记事', html);
}

// 主控记事板
function showPlayerJournal() {
  const p = gameState.player;
  const journal = p.journal || [];
  let html = '<div style="max-height:400px;overflow-y:auto;">';
  if (journal.length === 0) {
    html += '<p style="text-align:center;color:#8b6914;padding:30px;">暂无记事</p>';
  } else {
    // 按时间倒序
    const sorted = [...journal].reverse();
    for (const entry of sorted) {
      const msg = typeof entry === 'object' ? entry.msg || entry.text : entry;
      const time = typeof entry === 'object' ? (entry.time || entry.date || '') : '';
      html += `<div style="padding:8px 0;border-bottom:1px solid rgba(139,90,43,0.2);">
        ${time ? `<span style="color:#8b6914;font-size:11px;">${time}</span><br>` : ''}
        <span style="color:#5c3a1e;font-size:13px;line-height:1.8;">${msg}</span>
      </div>`;
    }
  }
  html += '</div>';
  showAncientModal('我的记事', html);
}

// 主控书信系统
async function showPlayerLetters() {
  const letters = await apiGet('/api/letters');
  let html = '<div style="max-height:450px;overflow-y:auto;">';
  if (!letters || letters.length === 0) {
    html += '<p style="text-align:center;color:#8b6914;padding:30px;">暂无书信</p>';
  } else {
    for (const letter of letters) {
      const isSent = letter.type === 'sent' || letter.from === '你';
      const bgColor = isSent ? 'rgba(139,90,43,0.08)' : 'rgba(34,139,34,0.08)';
      const borderColor = isSent ? '#8b5a2b' : '#228b22';
      html += `<div style="padding:10px;margin-bottom:8px;background:${bgColor};border-left:3px solid ${borderColor};border-radius:4px;">
        <div style="font-size:11px;color:#8b6914;margin-bottom:4px;">
          ${isSent ? '✉ 已发送' : '✉ 收到'} · ${letter.timestampText || letter.timestamp || ''}
        </div>
        <div style="font-size:12px;color:#5c3a1e;margin-bottom:4px;">
          <b>${isSent ? '致' : '来自'}：${isSent ? letter.to : letter.from}</b>
        </div>
        <div style="font-size:13px;color:#3d2817;line-height:1.6;">${letter.content || ''}</div>
      </div>`;
    }
  }
  html += '</div>';
  showAncientModal('书信系统', html);
}

// 装备管理面板
async function showEquipmentPanel() {
  const info = await apiGet('/api/equipment');
  let html = '<div style="max-height:450px;overflow-y:auto;">';

  // 当前装备
  html += '<h4 style="color:#5c3a1e;margin-bottom:10px;">当前装备</h4>';
  const slotNames = { weapon: '⚔ 武器', armor: '🛡 防具', accessory: '💍 饰品' };
  for (const [slot, name] of Object.entries(slotNames)) {
    const item = info.equipment?.[slot];
    html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,90,43,0.1);border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
      <div><b>${name}：</b>${item || '空'}</div>
      ${item ? `<button class="btn btn-small" onclick="doUnequip('${slot}')">卸下</button>` : ''}
    </div>`;
  }

  // 装备加成
  const bonus = info.bonus || {};
  html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">装备加成</h4>';
  let bonusText = [];
  if (bonus.attack) bonusText.push(`攻击+${bonus.attack}`);
  if (bonus.defense) bonusText.push(`防御+${bonus.defense}`);
  if (bonus.magicAttack) bonusText.push(`法攻+${bonus.magicAttack}`);
  if (bonus.magicDefense) bonusText.push(`法防+${bonus.magicDefense}`);
  if (bonus.hpMax) bonusText.push(`气血+${bonus.hpMax}`);
  if (bonus.mpMax) bonusText.push(`灵力+${bonus.mpMax}`);
  if (bonus.critRate) bonusText.push(`暴击+${bonus.critRate}%`);
  if (bonus.agility) bonusText.push(`身法+${bonus.agility}`);
  if (bonus.strength) bonusText.push(`力量+${bonus.strength}`);
  if (bonus.spirit) bonusText.push(`神识+${bonus.spirit}`);
  if (bonus.charm) bonusText.push(`魅力+${bonus.charm}`);
  if (bonus.enlightenment) bonusText.push(`悟性+${bonus.enlightenment}`);
  html += `<div style="padding:8px;background:rgba(34,139,34,0.1);border-radius:4px;color:#228b22;font-size:13px;">${bonusText.length > 0 ? bonusText.join(' | ') : '无加成'}</div>`;

  // 可装备物品
  html += '<h4 style="color:#5c3a1e;margin:15px 0 8px;">背包中可装备物品</h4>';
  if (!info.equippable || info.equippable.length === 0) {
    html += '<p style="color:#8b6914;">背包中没有可装备的物品</p>';
  } else {
    for (const item of info.equippable) {
      html += `<div style="padding:8px;margin-bottom:6px;background:rgba(139,90,43,0.05);border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
        <div><b>${item.name}</b> ×${item.count}</div>
        <button class="btn btn-small" onclick="doEquip('${item.name}')">装备</button>
      </div>`;
    }
  }
  html += '</div>';
  showAncientModal('装备管理', html);
}

async function doEquip(itemName) {
  const result = await api('/api/equipment/equip', { itemName });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('ancient-modal');
  renderAll();
}

async function doUnequip(slot) {
  const result = await api('/api/equipment/unequip', { slot });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  closeModal('ancient-modal');
  renderAll();
}

// 渲染角色页面记事板
function renderPlayerJournal() {
  const p = gameState.player;
  const journal = p.journal || [];
  const listEl = document.getElementById('player-journal-list');
  if (!listEl) return;

  if (journal.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#8b6914;padding:10px;">暂无记事</p>';
    return;
  }

  const sorted = [...journal].reverse().slice(0, 10);
  let html = '';
  for (const entry of sorted) {
    const msg = typeof entry === 'object' ? entry.msg || entry.text : entry;
    html += `<p>${msg}</p>`;
  }
  listEl.innerHTML = html;
}

// 随机立绘
async function randomizePortrait(targetId = null) {
  const result = await api('/api/portrait/random', { targetId });
  if (result.error) { gameNotify(result.error); return; }
  if (result.state) gameState = result.state;
  renderAll();
  // 如果正在查看NPC详情，刷新面板
  if (targetId && targetId !== 'player' && document.getElementById('npc-detail-modal').classList.contains('active')) {
    showNPCDetail(targetId);
  }
}

async function showMasterDisciple() {
  const info = await apiGet('/api/master-disciple');
  let html = '';
  html += '<h4 style="color:#5c3a1e;margin-bottom:8px;">我的师父</h4>';
  html += info.master ? `<p>${info.master.name} - ${info.master.realm}</p>` : '<p style="color:#8b6914;">暂无师父</p>';
  html += '<h4 style="color:#5c3a1e;margin:12px 0 8px;">我的弟子</h4>';
  if ((info.disciples || []).length > 0) {
    for (const d of info.disciples) html += `<p>${d.name} - ${d.realm}</p>`;
  } else html += '<p style="color:#8b6914;">暂无弟子</p>';
  html += '<h4 style="color:#5c3a1e;margin:12px 0 8px;">结义兄弟</h4>';
  if ((info.swornBrothers || []).length > 0) {
    for (const b of info.swornBrothers) html += `<p>${b.rank}弟: ${b.name} - ${b.realm}</p>`;
  } else html += '<p style="color:#8b6914;">暂无结义兄弟</p>';
  showAncientModal('师徒与结义', html);
}
