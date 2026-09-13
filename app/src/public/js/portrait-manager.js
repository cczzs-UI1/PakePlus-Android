// ============================================================
// 大世界修仙 - 自定义立绘管理（手机端导入/删除）
// 原理：通过系统文件选择器导入图片，存入浏览器 IndexedDB，
//       不占用 APK 内置资源，随时增删、立即生效、无需重新打包。
// 使用：游戏内「🎨 立绘」→「🗂 自定义立绘」→「📥 导入立绘」
// ============================================================
(function () {
  'use strict';

  var DB_NAME = 'dashijie_custom_portraits';
  var DB_STORE = 'portraits';
  var CATEGORIES = ['baby', 'youngMale', 'youngFemale', 'adultMale', 'adultFemale'];
  var CAT_NAMES = { baby: '婴儿', youngMale: '幼男', youngFemale: '幼女', adultMale: '成男', adultFemale: '成女' };

  // ---------------- IndexedDB ----------------
  var dbPromise = null;
  function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('indexedDB 不可用')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('立绘库打开失败')); };
    });
    return dbPromise;
  }
  function idbPut(rec) {
    return getDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(rec);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('写入失败')); };
      });
    });
  }
  function idbAll() {
    return getDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readonly');
        var r = tx.objectStore(DB_STORE).getAll();
        r.onsuccess = function () { resolve(r.result || []); };
        r.onerror = function () { reject(r.error || new Error('读取失败')); };
      });
    });
  }
  function idbDel(key) {
    return getDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('删除失败')); };
      });
    });
  }

  // ---------------- 内存映射 ----------------
  // 短引用 custom://分类/id  -> dataURL
  var lookup = {};
  var byCat = { baby: [], youngMale: [], youngFemale: [], adultMale: [], adultFemale: [] };
  var loaded = false;

  function shortRef(cat, id) { return 'custom://' + cat + '/' + id; }

  function loadAll() {
    if (loaded) return Promise.resolve();
    return idbAll().then(function (recs) {
      // 原地清空（保持 window.__CUSTOM_PORTRAITS 的引用始终有效，引擎才能读到）
      CATEGORIES.forEach(function (c) { byCat[c].length = 0; });
      Object.keys(lookup).forEach(function (k) { delete lookup[k]; });
      recs.forEach(function (r) {
        var sep = r.key.indexOf('|');
        if (sep < 0) return;
        var cat = r.key.slice(0, sep);
        var id = r.key.slice(sep + 1);
        if (!byCat[cat]) return;
        var ref = shortRef(cat, id);
        lookup[ref] = r.dataUrl;
        byCat[cat].push(ref);
      });
      loaded = true;
    });
  }

  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(fr.error || new Error('读取图片失败')); };
      fr.readAsDataURL(file);
    });
  }

  function addPortraits(cat, files) {
    var seq = Promise.resolve();
    var added = 0;
    files.forEach(function (file) {
      // 跳过非图片文件，避免坏数据入库
      if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
      added++;
      seq = seq.then(function () {
        var id = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        return readAsDataURL(file).then(function (dataUrl) {
          var rec = { key: cat + '|' + id, dataUrl: dataUrl };
          return idbPut(rec).then(function () {
            var ref = shortRef(cat, id);
            lookup[ref] = dataUrl;
            byCat[cat].push(ref);
          });
        });
      });
    });
    return seq.then(function () { return added; });
  }

  function removePortrait(ref) {
    var m = /^custom:\/\/(\w+)\/(.+)$/.exec(ref);
    if (!m) return Promise.resolve();
    var cat = m[1], id = m[2];
    return idbDel(cat + '|' + id).then(function () {
      delete lookup[ref];
      if (byCat[cat]) byCat[cat] = byCat[cat].filter(function (x) { return x !== ref; });
    });
  }

  // 渲染解析：custom:// 短引用 -> dataURL；内置路径原样返回
  function resolvePortrait(src) {
    if (typeof src === 'string' && src.indexOf('custom://') === 0) {
      return lookup[src] || '';
    }
    return src;
  }

  // ---------------- UI（复用游戏内弹窗） ----------------
  function showAncientModal(title, content) {
    if (window.showAncientModal) window.showAncientModal(title, content);
  }
  function closeModal(id) {
    if (window.closeModal) window.closeModal(id || 'generic-modal');
  }

  // 导入立绘：先选分类，再调系统文件选择器
  function startPortraitImport() {
    var btns = CATEGORIES.map(function (c) {
      return '<button class="btn" style="margin:4px;" onclick="pickPortraitFiles(\'' + c + '\')">' + CAT_NAMES[c] + '</button>';
    }).join('');
    showAncientModal('📥 导入立绘', '<div style="text-align:center;color:#5c3a1e;font-size:14px;">请选择导入到哪个分类：</div>' +
      '<div style="text-align:center;margin-top:14px;">' + btns + '</div>' +
      '<div style="text-align:center;color:#999;font-size:12px;margin-top:14px;">选择分类后会自动打开文件选择器，可多选图片</div>');
  }

  function pickPortraitFiles(cat) {
    closeModal('generic-modal');
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) return;
      showAncientModal('📥 导入立绘', '<div style="text-align:center;color:#5c3a1e;">正在导入 ' + files.length + ' 张图片…</div>');
      addPortraits(cat, files).then(function (added) {
        var tip = added > 0
          ? '<div style="text-align:center;color:#2e7d32;font-size:14px;">✅ 成功导入 ' + added + ' 张' + CAT_NAMES[cat] + '立绘！</div>'
          : '<div style="text-align:center;color:#b71c1c;font-size:14px;">未导入任何图片（请选择图片文件）</div>';
        if (files.length > added) {
          tip += '<div style="text-align:center;color:#e65100;font-size:12px;margin-top:6px;">已自动跳过 ' + (files.length - added) + ' 个非图片文件</div>';
        }
        tip += '<div style="text-align:center;color:#888;font-size:12px;margin-top:8px;">新生成的角色将优先使用自定义立绘</div>';
        showAncientModal('📥 导入立绘', tip);
      }).catch(function (e) {
        showAncientModal('📥 导入立绘', '<div style="text-align:center;color:#b71c1c;">❌ 导入失败：' + (e && e.message ? e.message : String(e)) + '</div>');
      });
    };
    input.click();
  }

  // 自定义立绘管理面板
  function showPortraitManager() {
    loadAll().then(function () {
      var html = '<div style="text-align:center;margin-bottom:10px;"><button class="btn" onclick="startPortraitImport()">📥 导入立绘</button></div>';
      var total = 0;
      CATEGORIES.forEach(function (c) {
        var arr = byCat[c] || [];
        total += arr.length;
        html += '<div style="margin:10px 0 6px;"><b style="color:#8b5a2b;">' + CAT_NAMES[c] + '（' + arr.length + '张）</b></div>';
        if (!arr.length) { html += '<div style="color:#aaa;font-size:12px;">暂无自定义立绘</div>'; return; }
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        arr.forEach(function (ref) {
          var url = resolvePortrait(ref);
          html += '<div style="position:relative;width:60px;height:80px;border-radius:6px;overflow:hidden;border:1px solid #c9a961;">' +
            '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;">' +
            '<button onclick="deleteCustomPortrait(\'' + ref + '\')" style="position:absolute;top:2px;right:2px;width:18px;height:18px;line-height:16px;padding:0;font-size:12px;background:rgba(180,40,40,0.85);color:#fff;border:none;border-radius:3px;cursor:pointer;" title="删除">×</button></div>';
        });
        html += '</div>';
      });
      html += '<div style="text-align:center;margin-top:14px;color:#8b7a5a;font-size:12px;">共 ' + total + ' 张自定义立绘 · 增删立即生效，无需重新打包APK</div>';
      showAncientModal('🗂 自定义立绘管理', html);
    });
  }

  function deleteCustomPortrait(ref) {
    removePortrait(ref).then(showPortraitManager);
  }

  // ---------------- 对外接口 ----------------
  window.__CUSTOM_PORTRAITS = byCat;           // 引擎 getPortrait 读取（自定义优先）
  window.__CUSTOM_PORTRAITS_LOOKUP = lookup;
  window.resolvePortrait = resolvePortrait;
  window.startPortraitImport = startPortraitImport;
  window.pickPortraitFiles = pickPortraitFiles;
  window.showPortraitManager = showPortraitManager;
  window.deleteCustomPortrait = deleteCustomPortrait;
  window.__PORTRAIT_MANAGER = {
    loadAll: loadAll,
    addPortraits: addPortraits,
    removePortrait: removePortrait,
    resolvePortrait: resolvePortrait,
    getByCat: function () { return byCat; },
    catNames: CAT_NAMES,
  };

  // 启动即加载已有自定义立绘
  loadAll().catch(function (e) { console.warn('[立绘管理] 加载失败：', e); });
})();
