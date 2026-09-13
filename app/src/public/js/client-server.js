// ============================================================
// 大世界修仙页游 - 单机版 客户端 API 替代层
// 替代原 server.js：所有 /api/xxx 请求直接调用本地引擎
// 存档存于浏览器 IndexedDB（无文件系统依赖）
// ============================================================
(function () {
  'use strict';
  var GameEngine = window.GameEngine;
  var DATA = window.__GAME_DATA || {};
  if (!GameEngine) {
    throw new Error('game.bundle.js 未加载，请检查脚本顺序');
  }
  var engine = new GameEngine();

  // ---------------- 存档存储（IndexedDB，localStorage 兜底） ----------------
  var DB_NAME = 'dashijie_xiuxian_db';
  var DB_STORE = 'saves';
  var dbPromise = null;

  function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('indexedDB 不可用')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: 'slot' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('存档库打开失败')); };
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

  function idbGet(slot) {
    return getDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readonly');
        var r = tx.objectStore(DB_STORE).get(slot);
        r.onsuccess = function () { resolve(r.result || null); };
        r.onerror = function () { reject(r.error || new Error('读取失败')); };
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

  function idbDel(slot) {
    return getDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(slot);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error || new Error('删除失败')); };
      });
    });
  }

  // 存档记录格式：{slot, data, playerName, playerRealm, gameDate, saveTime}
  function parseMeta(data) {
    try {
      var p = JSON.parse(data);
      return {
        playerName: (p.player && p.player.name) || '未知',
        playerRealm: (p.player && p.player.realm) || '',
        gameDate: p.gameDateText || '',
      };
    } catch (e) {
      return { playerName: '未知', playerRealm: '', gameDate: '' };
    }
  }

  function storageSave(slot, data) {
    var meta = parseMeta(data);
    var rec = {
      slot: slot,
      data: data,
      playerName: meta.playerName,
      playerRealm: meta.playerRealm,
      gameDate: meta.gameDate,
      saveTime: new Date().toLocaleString('zh-CN'),
    };
    return idbPut(rec).catch(function () {
      // IndexedDB 失败时尝试 localStorage（存档较小才可能成功）
      try {
        localStorage.setItem('dsxx_save_' + slot, data);
        localStorage.setItem('dsxx_meta_' + slot, JSON.stringify(rec));
      } catch (e2) {
        return Promise.reject(new Error('浏览器存储空间不足，存档失败'));
      }
    });
  }

  function storageLoad(slot) {
    return idbGet(slot).then(function (rec) {
      if (rec && rec.data) return rec.data;
      try {
        return localStorage.getItem('dsxx_save_' + slot);
      } catch (e) { return null; }
    });
  }

  function storageList() {
    return idbAll().then(function (recs) {
      return recs.map(function (r) {
        return { slot: r.slot, playerName: r.playerName, playerRealm: r.playerRealm, gameDate: r.gameDate, saveTime: r.saveTime };
      });
    }).catch(function () {
      // localStorage 兜底扫描
      var out = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('dsxx_meta_') === 0) {
            var rec = JSON.parse(localStorage.getItem(k) || '{}');
            out.push({ slot: rec.slot, playerName: rec.playerName, playerRealm: rec.playerRealm, gameDate: rec.gameDate, saveTime: rec.saveTime });
          }
        }
      } catch (e) {}
      return out;
    });
  }

  function storageDelete(slot) {
    return idbDel(slot).catch(function () {
      try {
        localStorage.removeItem('dsxx_save_' + slot);
        localStorage.removeItem('dsxx_meta_' + slot);
      } catch (e) {}
    });
  }

  // 每月自动存档钩子（引擎 autoSave 调用）
  window.__AUTOSAVE = function (fname, data) {
    var slot = String(fname).replace(/\.json$/, '');
    // 静默写入，不打断游戏
    storageSave(slot, data).catch(function () {});
  };

  // ---------------- 工具 ----------------
  function withState(r) {
    if (r && typeof r === 'object') {
      try { r.state = engine.getPublicState(); } catch (e) {}
    }
    return r;
  }

  function safe(fn) {
    try {
      return Promise.resolve(fn());
    } catch (e) {
      console.error('[单机引擎] 调用出错：', e);
      return Promise.resolve({ error: '引擎内部错误：' + (e && e.message ? e.message : String(e)) });
    }
  }

  function getPath(url) {
    var q = url.indexOf('?');
    return q === -1 ? url : url.slice(0, q);
  }
  function getQuery(url) {
    var q = url.indexOf('?');
    var out = {};
    if (q !== -1) {
      url.slice(q + 1).split('&').forEach(function (kv) {
        var i = kv.indexOf('=');
        var k = i === -1 ? kv : kv.slice(0, i);
        var v = i === -1 ? '' : decodeURIComponent(kv.slice(i + 1));
        out[k] = v;
      });
    }
    return out;
  }
  function matchPath(url, prefix) {
    var p = getPath(url);
    if (p === prefix) return {};
    if (p.indexOf(prefix + '/') === 0) return { rest: p.slice(prefix.length + 1) };
    return null;
  }

  // ---------------- POST 路由（对应 server.js） ----------------
  var POST_ROUTES = [
    { pattern: '/api/newgame', fn: function (b) { return engine.newGame(b || {}); } },
    { pattern: '/api/state', fn: function () { return engine.getPublicState(); } },
    { pattern: '/api/move', fn: function (b) { return engine.moveTo(b && b.location); } },
    { pattern: '/api/cultivate', fn: function (b) { return engine.cultivate(b && b.type); } },
    { pattern: '/api/breakthrough', fn: function () { return engine.breakthrough(); } },
    { pattern: '/api/explore', fn: function (b) { return engine.explore(b && b.type, b && b.amount !== undefined ? { amount: b.amount } : {}); } },
    { pattern: '/api/rest', fn: function () { return engine.rest(); } },
    { pattern: '/api/interact', fn: function (b) {
        if (b && (b.action === 'gift_item' || b.action === 'request_item')) return engine.interact(b.npcId, b.action, b.itemName);
        return engine.interactWithNPC(b && b.npcId, b && b.action);
      } },
    { pattern: '/api/combat/action', fn: function (b) { return engine.combatAction(b || {}); } },
    { pattern: '/api/combat/start', fn: function (b) { return engine.startCombat(b && b.npcId); } },
    { pattern: '/api/combat/kill', fn: function (b) { return engine.killCombatEnemy(b && b.enemyId); } },
    { pattern: '/api/combat/spare', fn: function (b) { return engine.spareCombatEnemy(b && b.enemyId); } },
    { pattern: '/api/combat', fn: function (b) { return engine.combatRound((b && b.action) || 'attack', b && b.skill, b && b.item); } },
    { pattern: '/api/event/resolve', fn: function (b) { return engine.resolveEvent(b && b.optionIndex); } },
    { pattern: '/api/save', fn: function (b) {
        var slot = (b && b.slot) || null;
        var data = engine.save(slot || undefined);
        var useSlot = slot || engine.currentSlot || (engine.state && engine.state.saveCode) || ('slot_' + Date.now());
        return storageSave(useSlot, data).then(function () {
          return { success: true, slot: useSlot, path: '浏览器存档（IndexedDB）' };
        }).catch(function (e) {
          return { error: e && e.message ? e.message : '存档失败' };
        });
      } },
    { pattern: '/api/load', fn: function (b) {
        var slot = b && b.slot;
        if (!slot) return Promise.resolve({ error: '请指定存档槽位' });
        return storageLoad(slot).then(function (data) {
          if (data === null || data === undefined) return { error: '没有找到存档' };
          return engine.load(data, slot);
        });
      } },
    { pattern: '/api/save/delete', fn: function (b) {
        var slot = b && b.slot;
        if (!slot) return Promise.resolve({ error: '请指定存档槽位' });
        return storageDelete(slot).then(function () { return { success: true }; });
      } },
    { pattern: '/api/save-state', fn: function () { return engine.getPublicState(); } },
    { pattern: '/api/shop/buy', fn: function (b) {
        var st = b && b.shopType, name = b && b.itemName, cnt = (b && b.count) || 1;
        if (st === 'butcher' || st === 'seedShop' || st === 'fishMarket') return engine.buyFromShop(st, name, cnt);
        return engine.buyItem(st, name);
      } },
    { pattern: '/api/shop/sell', fn: function (b) {
        var st = b && b.shopType, name = b && b.itemName, cnt = (b && b.count) || 1;
        if (st === 'butcher' || st === 'seedShop' || st === 'fishMarket') return engine.sellToShop(st, name, cnt);
        return engine.sellItem(name);
      } },
    { pattern: '/api/shop/shelve', fn: function (b) { return engine.shopShelve(b && b.slot, b && b.itemName, b && b.price); } },
    { pattern: '/api/shop/unshelve', fn: function (b) { return engine.shopUnShelve(b && b.slot); } },
    { pattern: '/api/shop/take', fn: function () { return engine.shopTake(); } },
    { pattern: '/api/brothel/interact', fn: function (b) { return engine.brothelInteract(b && b.brothelName, b && b.girlId, b && b.action); } },
    { pattern: '/api/residence/buy', fn: function (b) { return engine.buyResidence(b && b.tier); } },
    { pattern: '/api/residence/upgrade', fn: function () { return engine.upgradeResidence(); } },
    { pattern: '/api/residence/recruit', fn: function (b) { return engine.recruitMember(b && b.npcId, b && b.rank); } },
    { pattern: '/api/pet/feed', fn: function (b) { return engine.feedPet(b && b.petId); } },
    { pattern: '/api/pet/active', fn: function (b) { return engine.setActivePet(b && b.petId); } },
    { pattern: '/api/pet/capture', fn: function (b) { return engine.capturePet(b && b.pet); } },
    { pattern: '/api/pet/hatch', fn: function (b) { return engine.hatchPet(b && b.eggName); } },
    { pattern: '/api/pet/feeditem', fn: function (b) { return engine.feedPetItem(b && b.petId, b && b.foodName, (b && b.count) || 1); } },
    { pattern: '/api/pet/buyegg', fn: function (b) { return engine.buyPetEgg(b && b.eggName); } },
    { pattern: '/api/pet/buysupply', fn: function (b) { return engine.buyPetSupply(b && b.supplyName); } },
    { pattern: '/api/pet/panel', fn: function (b) { return engine.petPanel(b && b.petId); } },
    { pattern: '/api/pet/stroke', fn: function (b) { return engine.petStroke(b && b.petId); } },
    { pattern: '/api/pet/rename', fn: function (b) { return engine.petRename(b && b.petId, b && b.newName); } },
    { pattern: '/api/pet/follow', fn: function (b) { return engine.petFollowToggle(b && b.petId); } },
    { pattern: '/api/farm/upgrade', fn: function () { return engine.upgradeFarm(); } },
    { pattern: '/api/farm/plant', fn: function (b) { return engine.plantCrop(b && b.plotIndex, b && b.cropId); } },
    { pattern: '/api/farm/harvest', fn: function (b) { return engine.harvestCrop(b && b.plotIndex); } },
    { pattern: '/api/farm/harvestAll', fn: function () { return engine.harvestAllCrops(); } },
    { pattern: '/api/cooking/start', fn: function (b) { return engine.startCooking(b && b.dishName); } },
    { pattern: '/api/cooking/eat', fn: function (b) { return engine.eatDish(b && b.dishName); } },
    { pattern: '/api/cooking/learn', fn: function (b) { return engine.learnRecipe(b && b.dishName); } },
    { pattern: '/api/items/use', fn: function (b) { return engine.useItem(b && b.itemName); } },
    { pattern: '/api/gather', fn: function (b) { return engine.doGather((b && b.gatherType) || '采集区'); } },
    { pattern: '/api/beast/drops', fn: function (b) { return engine.addBeastDrops((b && b.drops) || [], b && b.expGain); } },
    { pattern: '/api/gather/feed-beast', fn: function (b) { return engine.feedBeast(b && b.beastId); } },
    { pattern: '/api/fishing/enter', fn: function (b) { return engine.enterFishingZone(b && b.zoneId); } },
    { pattern: '/api/fishing/catch', fn: function () { return engine.catchFish(); } },
    { pattern: '/api/fishing/exit', fn: function () { return engine.exitFishingZone(); } },
    { pattern: '/api/quests/quarterly/accept', fn: function (b) { return engine.acceptQuarterlyQuest(b && b.questId); } },
    { pattern: '/api/quests/quarterly/complete', fn: function (b) { return engine.completeQuarterlyQuest(b && b.questId); } },
    { pattern: '/api/quests/quarterly/submit', fn: function (b) { return engine.submitQuarterlyQuestItems(b && b.questId); } },
    { pattern: '/api/quests/submit', fn: function (b) { return engine.submitQuestItems(b && b.questId); } },
    { pattern: '/api/quests/accept', fn: function (b) { return engine.acceptSideQuest(b && b.questId); } },
    { pattern: '/api/quests/deliver', fn: function () { return engine.deliverGoods(); } },
    { pattern: '/api/alchemy/refine', fn: function (b) { return engine.refinePill(b && b.recipeId); } },
    { pattern: '/api/alchemy/learn', fn: function (b) { return engine.learnAlchemyRecipe(b && b.recipeId); } },
    { pattern: '/api/alchemy/study', fn: function (b) { return engine.studyAlchemyRecipe(b && b.recipeId); } },
    { pattern: '/api/steal/from-npc', fn: function (b) { return engine.stealFromNpc(b && b.npcId); } },
    { pattern: '/api/forge/create', fn: function (b) { return engine.forgeItem(b && b.recipeId); } },
    { pattern: '/api/forge/enhance', fn: function (b) { return engine.enhanceItem(b && b.itemName); } },
    { pattern: '/api/forge/enchant', fn: function (b) { return engine.enchantItem(b && b.itemName, b && b.element); } },
    { pattern: '/api/forge/equip', fn: function (b) { return engine.equipItem(b && b.itemName); } },
    { pattern: '/api/blacksmith/craft', fn: function (b) { return engine.craftAtBlacksmith(b && b.recipeId); } },
    { pattern: '/api/sect/join', fn: function (b) { return engine.joinSect(b && b.sectId); } },
    { pattern: '/api/sect/leave', fn: function () { return engine.leaveSect(); } },
    { pattern: '/api/sect/complete', fn: function (b) { return engine.completeSectQuest(b && b.questId); } },
    { pattern: '/api/sect/exchange', fn: function (b) { return engine.exchangeContribution(b && b.itemName); } },
    { pattern: '/api/sect/create', fn: function (b) { return engine.createSect(b && b.name, b && b.type); } },
    { pattern: '/api/achievements/claim', fn: function (b) { return engine.claimAchievement(b && b.achId); } },
    { pattern: '/api/formation/learn', fn: function (b) { return engine.learnFormation(b && b.formationId); } },
    { pattern: '/api/formation/activate', fn: function (b) { return engine.activateFormation(b && b.formationId); } },
    { pattern: '/api/talisman/learn', fn: function (b) { return engine.learnTalisman(b && b.talismanId); } },
    { pattern: '/api/talisman/craft', fn: function (b) { return engine.craftTalisman(b && b.talismanId); } },
    { pattern: '/api/talisman/buy', fn: function (b) { return engine.buyTalisman(b && b.talismanId); } },
    { pattern: '/api/mounts/capture', fn: function () { return engine.captureMount(); } },
    { pattern: '/api/mounts/feed', fn: function (b) { return engine.feedMount(b && b.mountId); } },
    { pattern: '/api/mounts/activate', fn: function (b) { return engine.setActiveMount(b && b.mountId); } },
    { pattern: '/api/master-disciple/request', fn: function (b) { return engine.requestMaster(b && b.npcId); } },
    { pattern: '/api/master-disciple/take', fn: function (b) { return engine.takeDisciple(b && b.npcId); } },
    { pattern: '/api/master-disciple/transmit', fn: function (b) { return engine.transmitPower(b && b.discipleId); } },
    { pattern: '/api/master-disciple/swear', fn: function (b) { return engine.swearBrotherhood(b && b.npcId); } },
    { pattern: '/api/master-disciple/interact', fn: function (b) { return engine.masterDiscipleInteract(b && b.npcId, b && b.type); } },
    { pattern: '/api/titles/equip', fn: function (b) { return engine.equipTitle(b && b.titleId); } },
    { pattern: '/api/dungeons/enter', fn: function (b) { return engine.enterDungeon(b && b.dungeonId); } },
    { pattern: '/api/dungeons/explore', fn: function (b) { return engine.exploreDungeon(b && b.dungeonId, b && b.floor); } },
    { pattern: '/api/dungeons/encounter', fn: function (b) { return engine.resolveDungeonEncounter(b && b.dungeonId, b && b.encounterId, b && b.optionIndex); } },
    { pattern: '/api/dungeons/rest', fn: function (b) { return engine.restInDungeon(b && b.dungeonId); } },
    { pattern: '/api/dungeons/boss', fn: function (b) { return engine.challengeDungeonBoss(b && b.dungeonId); } },
    { pattern: '/api/dungeons/exit', fn: function () { return engine.exitDungeon(); } },
    { pattern: '/api/letters/send', fn: function (b) { return engine.sendLetter(b && b.npcId, b && b.content, b && b.templateId); } },
    { pattern: '/api/mansion/event', fn: function (b) { return engine.triggerMansionEvent(b && b.area); } },
    { pattern: '/api/mansion/event/choose', fn: function (b) { return engine.chooseMansionEventOption(b && b.choiceIndex); } },
    { pattern: '/api/mansion/upgrade', fn: function () { return engine.upgradeMansion(); } },
    { pattern: '/api/mansion/visit', fn: function (b) { return engine.visitMansionArea(b && b.areaId); } },
    { pattern: '/api/mansion/invite', fn: function (b) { return engine.inviteToMansion(b && b.npcId); } },
    { pattern: '/api/location/event', fn: function (b) { return engine.triggerLocationEvent(b && b.button); } },
    { pattern: '/api/location/event/choose', fn: function (b) { return engine.chooseLocationEventOption(b && b.choiceIndex); } },
    { pattern: '/api/equipment/equip', fn: function (b) { return engine.equipItem(b && b.itemName); } },
    { pattern: '/api/equipment/unequip', fn: function (b) { return engine.unequipItem(b && b.slot); } },
    { pattern: '/api/harem/intimacy', fn: function (b) { return engine.doIntimacy(b && b.npcId); } },
    { pattern: '/api/harem/marry', fn: function (b) { return engine.doMarry(b && b.npcId); } },
    { pattern: '/api/harem/steal-love', fn: function (b) { return engine.stealLove(b && b.npcId); } },
    { pattern: '/api/harem/concubine', fn: function (b) { return engine.doTakeConcubine(b && b.npcId, b && b.rank); } },
    { pattern: '/api/harem/punish', fn: function (b) { return engine.doPunish(b && b.npcId, b && b.punishType, b && b.newRank); } },
    { pattern: '/api/work/select', fn: function (b) { return engine.selectProfession(b && b.professionId); } },
    { pattern: '/api/work/quit', fn: function () { return engine.quitProfession(); } },
    { pattern: '/api/work/do', fn: function (b) { return engine.doWork(b && b.professionId); } },
    { pattern: '/api/work/cultivation', fn: function (b) { return engine.doCultivationWork(b && b.profession); } },
    { pattern: '/api/events/solo', fn: function (b) { return engine.triggerSoloEvent(b && b.attribute); } },
    { pattern: '/api/events/interaction', fn: function (b) { return engine.triggerInteractionEvent(b && b.npcId, b && b.action); } },
    { pattern: '/api/time/advance-month', fn: function (b) { return engine.advanceMonth(b && b.viewingNpcId); } },
    { pattern: '/api/time/advance-year', fn: function (b) { return engine.advanceYear(b && b.viewingNpcId); } },
    { pattern: '/api/clean-dead-npcs', fn: function () { return engine.cleanDeadNpcs(); } },
    { pattern: '/api/clean-npc', fn: function (b) { return engine.cleanNpc(b && b.npcId); } },
    { pattern: '/api/birth/action', fn: function (b) { return withState(engine.birthAction(engine.state && engine.state.player, b && b.babyId, b && b.action, b && b.name)); } },
    { pattern: '/api/child/act', fn: function (b) { return withState(engine.childInteract(engine.state && engine.state.player, b && b.childId, b && b.action, b && b.itemName)); } },
    { pattern: '/api/child/adopt', fn: function (b) { return withState(engine.childAdopt(engine.state && engine.state.player, b && b.childId, !!(b && b.adopt))); } },
    { pattern: '/api/child/outcast', fn: function (b) { return withState(engine.childOutcastAct(engine.state && engine.state.player, b && b.childId, b && b.action)); } },
    { pattern: '/api/concubine/act', fn: function (b) { return withState(engine.concubineAct(engine.state && engine.state.player, b && b.concubineId, b && b.action)); } },
    { pattern: '/api/clear-pending-events', fn: function () {
        if (engine.state && engine.state.pendingPlayerEvents) {
          engine.state.pendingPlayerEvents = engine.state.pendingPlayerEvents.filter(function (ev) { return ev && ev.withActions; });
        }
        return engine.getPublicState();
      } },
    { pattern: '/api/stall/bargain', fn: function (b) { return engine.bargainAtStall(b && b.stallId, b && b.itemName); } },
    { pattern: '/api/stall/buy', fn: function (b) { return engine.buyAtStall(b && b.stallId, b && b.itemName); } },
    { pattern: '/api/stall/steal', fn: function (b) { return engine.stealAtStall(b && b.stallId, b && b.itemName); } },
    { pattern: '/api/technique/equip', fn: function (b) { return engine.equipTechnique(b && b.techId); } },
    { pattern: '/api/technique/unequip', fn: function (b) { return engine.unequipTechnique(b && b.techId); } },
    { pattern: '/api/learning/study', fn: function (b) { return engine.studyItem(b && b.category, b && b.itemId); } },
    { pattern: '/api/learn/paid', fn: function (b) { return engine.studyPaid(b && b.category, b && b.itemId); } },
    { pattern: '/api/auction/bid', fn: function (b) { return engine.bidAuction(b && b.auctionId, b && b.price); } },
    { pattern: '/api/player/succession', fn: function (b) { return engine.playerSuccession(b && b.npcId); } },
    { pattern: '/api/gushou/learn', fn: function (b) { return engine.learnGuArt(b && b.artId); } },
    { pattern: '/api/gushou/buy', fn: function (b) { return engine.buyGuWorm(b && b.wormId); } },
    { pattern: '/api/treasure/exchange', fn: function (b) { return engine.exchangeTreasure(b && b.goodsId); } },
    { pattern: '/api/treasure/steal', fn: function () { return engine.treasureSteal(); } },
    { pattern: '/api/qingyun/learn', fn: function (b) { return engine.learnQingyunArt(b && b.artId); } },
    { pattern: '/api/servants/refresh', fn: function () { return engine.refreshServants(); } },
    { pattern: '/api/servants/buy', fn: function (b) { return engine.buyServant(b && b.servantId); } },
    { pattern: '/api/servants/interact', fn: function (b) { return engine.interactServant(b && b.servantId, b && b.action); } },
    { pattern: '/api/portrait/random', fn: function (b) { return engine.randomizePortrait(b && b.targetId); } },
    { pattern: '/api/portraits/customize', fn: function (b) {
        if (engine.state) engine.state.portraitCustomRanges = (b && b.customRanges) || null;
        return { success: true };
      } },
    { pattern: '/api/buy-tool', fn: function (b) { return engine.buyCraftingTool(b && b.toolType, b && b.tier); } },
    { pattern: '/api/select-tool', fn: function (b) { return engine.selectCraftingTool(b && b.toolType, b && b.index); } },
    { pattern: '/api/craft', fn: function (b) { return engine.craftItem(b && b.craftType, b && b.recipeId); } },
    { pattern: '/api/npc/recall', fn: function (b) { return engine.recallNpc(b && b.npcId); } },
    { pattern: '/api/windflower/interact', fn: function (b) { return engine.windFlowerInteract(b && b.personId, b && b.action, b && b.itemName, b && b.mode, b && b.rank); } },
    { pattern: '/api/windflower/select', fn: function (b) { return engine.windFlowerSelect(b && b.personId); } },
  ];

  function routePost(url, body) {
    var p = getPath(url);
    for (var i = 0; i < POST_ROUTES.length; i++) {
      if (POST_ROUTES[i].pattern === p) {
        return safe(function () { return POST_ROUTES[i].fn(body); });
      }
    }
    return Promise.resolve({ error: '未知接口: ' + url });
  }

  // ---------------- GET 路由 ----------------
  function routeGet(url) {
    var p = getPath(url);
    var q = getQuery(url);
    var m;

    if (p === '/api/state') return safe(function () {
      var s = engine.getPublicState();
      return s || { error: '游戏未初始化，请先创建角色' };
    });
    if (p === '/api/portraits') return Promise.resolve(window.__PORTRAITS || {});
    if (p === '/api/locations') return safe(function () {
      var birthZones = ['凡人界', '修仙界', '魔界', '冥界'];
      return Object.keys(DATA.LOCATIONS)
        .filter(function (name) { var d = DATA.LOCATIONS[name]; return d && d.zone && birthZones.indexOf(d.zone) !== -1; })
        .map(function (name) { var d = DATA.LOCATIONS[name]; return Object.assign({ name: name }, d); });
    });
    if (p === '/api/personalities') return Promise.resolve(DATA.PERSONALITY_NAMES || []);
    if (p === '/api/saves') return storageList().then(function (list) {
      list.sort(function (a, b) { return String(b.saveTime || '').localeCompare(String(a.saveTime || '')); });
      return list;
    });
    if (p === '/api/shops') return safe(function () { return engine.getShops(); });
    if (p === '/api/shop/goods') return safe(function () { return engine.getShopGoods(q.type); });
    if (p === '/api/shop/butcher') return safe(function () { return engine.getButcherItems(); });
    if (p === '/api/shop/seed') return safe(function () { return engine.getSeedShopItems(); });
    if (p === '/api/shop/pharmacy') return safe(function () { return engine.getPharmacyItems(q.category || null); });
    if (p === '/api/shop/panel') return safe(function () { return engine.getShopPanel(); });
    if (p === '/api/cave/info') return safe(function () { return engine.getCaveInfo(); });
    if (p === '/api/estate/panel') return safe(function () {
      var es = engine.initEstates(engine.state && engine.state.player);
      var out = {
        mine: (es && es.mine) || null,
        farmland: (es && es.farmland) || null,
      };
      try { Object.assign(out, engine.getShopPanel()); } catch (e) {}
      try { Object.assign(out, engine.getCaveInfo()); } catch (e) {}
      return out;
    });
    if (p === '/api/brothels') return safe(function () { return engine.getBrothels(); });
    if (p === '/api/brothel/girls') return safe(function () { return engine.getBrothelGirls(q.name); });
    if (p === '/api/residence/types') return safe(function () { return engine.getResidenceTypes(); });
    if (p === '/api/pets') return safe(function () { return engine.getPets(); });
    if (p === '/api/pet/eggshop') return safe(function () { return engine.getPetEggShop(); });
    if (p === '/api/farm' || p === '/api/farm/info') return safe(function () { return engine.getFarmInfo(); });
    if (p === '/api/farm/seeds') return safe(function () { return engine.getSeeds(); });
    if (p === '/api/cooking') return safe(function () { return engine.getCookingInfo(); });
    if (p === '/api/fishing/zones') return safe(function () { return engine.getFishingZones(); });
    if (p === '/api/fishing/market') return safe(function () { return engine.getFishMarketItems(); });
    if (p === '/api/quests/quarterly') return safe(function () { return engine.getQuarterlyQuests(); });
    if (p === '/api/quests') return safe(function () { return engine.getQuests(); });
    if (p === '/api/quests/daily') return safe(function () { return engine.getDailyQuests(); });
    if (p === '/api/quests/available') return safe(function () { return engine.getAvailableSideQuests(); });
    if (p === '/api/alchemy') return safe(function () { return engine.getAlchemyInfo(); });
    if (p === '/api/alchemy/tower') return safe(function () { return engine.getTowerRecipes(); });
    if (p === '/api/steal') return safe(function () { return engine.getStealInfo(); });
    if (p === '/api/forge') return safe(function () { return engine.getForgeInfo(); });
    if (p === '/api/sects') return safe(function () { return engine.getAllSects(); });
    if (p === '/api/sect') return safe(function () { return engine.getSectInfo(); });
    if (p === '/api/sect/quests') return safe(function () { return engine.getSectDailyQuests(); });
    if (p === '/api/achievements') return safe(function () { return engine.getAchievements(); });
    if (p === '/api/weather') return safe(function () { return engine.getWeatherInfo(); });
    if (p === '/api/formation') return safe(function () { return engine.getFormationInfo(); });
    if (p === '/api/talisman') return safe(function () { return engine.getTalismanInfo(); });
    if (p === '/api/mounts') return safe(function () { return engine.getMountInfo(); });
    if (p === '/api/master-disciple') return safe(function () { return engine.getMasterDiscipleInfo(); });
    if (p === '/api/titles') return safe(function () { return engine.getTitleInfo(); });
    if (p === '/api/dungeons') return safe(function () { return engine.getDungeonList(); });
    if (p === '/api/letters/templates') return safe(function () { return engine.getLetterTemplates(); });
    if (p === '/api/letters') return safe(function () { return engine.getLetters(); });
    if (p === '/api/empire') return safe(function () { return engine.getEmpireInfo(); });
    if (p === '/api/tags') return safe(function () { return DATA.getAllTags(); });
    if (p === '/api/professions') return safe(function () { return DATA.getAllProfessionPaths(); });
    if (p === '/api/equipment') return safe(function () { return engine.getEquipmentInfo(); });
    if (p === '/api/harem/ranks') return safe(function () { return engine.getHaremRanks(); });
    if (p === '/api/work/professions') return safe(function () { return engine.getAvailableProfessions(); });
    if (p === '/api/work/state') return safe(function () { return engine.getProfessionState(); });
    if (p === '/api/technique/state') return safe(function () { return engine.getTechniqueState(); });
    if (p === '/api/auction') return safe(function () { return engine.getAuction(); });
    if (p === '/api/crafting-tools') return safe(function () { return engine.getCraftingTools(); });
    if (p === '/api/mansion') return safe(function () { return engine.getMansion(); });
    if (p === '/api/gushou') return safe(function () { return engine.getGuInfo(); });
    if (p === '/api/treasure/goods') return safe(function () { return engine.getTreasureGoods(); });
    if (p === '/api/qingyun/arts') return safe(function () { return engine.getQingyunArts(); });
    if (p === '/api/servants/for-sale') return safe(function () { return engine.getServantsForSale(); });
    if (p === '/api/servants/mine') return safe(function () { return engine.getMyServants(); });
    if (p === '/api/windflower') return safe(function () { return engine.getWindFlower(); });

    // 动态路由
    if ((m = matchPath(url, '/api/items/location'))) return safe(function () { return DATA.getItemsAtLocation(m.rest); });
    if ((m = matchPath(url, '/api/items'))) {
      var rest = m.rest;
      if (rest && rest.indexOf('/sources') === rest.length - 8) {
        var itemName = decodeURIComponent(rest.slice(0, -8));
        return safe(function () { return DATA.getItemSources(itemName); });
      }
    }
    if ((m = matchPath(url, '/api/tags'))) return safe(function () { return DATA.getTagInfo(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/professions'))) return safe(function () { return DATA.getProfessionInfo(decodeURIComponent(m.rest)); });
    if (p === '/api/npc/__by_name__') return safe(function () {
      var name = q.name;
      var npc = engine.state && engine.state.npcs ? engine.state.npcs.filter(function (n) { return n.name === name; })[0] : null;
      if (!npc) return { error: '该NPC已不在人世（或数据已被清理）', npcName: name };
      return engine.getNPCDetail(npc.id, name);
    });
    if ((m = matchPath(url, '/api/npc'))) return safe(function () { return engine.getNPCDetail(decodeURIComponent(m.rest), q.name); });
    if ((m = matchPath(url, '/api/stalls'))) return safe(function () { return engine.getStallsAtLocation(q.location); });
    if ((m = matchPath(url, '/api/stall'))) return safe(function () { return engine.getStall(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/price'))) return safe(function () { return engine.getItemPrice(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/learning'))) return safe(function () { return engine.getLearningList(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/learn/paid'))) return safe(function () { return engine.getPaidLearningList(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/tool-market'))) return safe(function () {
      return engine.getToolMarket(decodeURIComponent(m.rest), q.minTier !== undefined ? parseInt(q.minTier, 10) : null, q.maxTier !== undefined ? parseInt(q.maxTier, 10) : null);
    });
    if ((m = matchPath(url, '/api/craftable'))) return safe(function () { return engine.getCraftableList(decodeURIComponent(m.rest)); });
    if ((m = matchPath(url, '/api/mansion/area'))) return safe(function () { return engine.getMansionArea(decodeURIComponent(m.rest)); });

    return Promise.resolve({ error: '未知接口: ' + url });
  }

  // ---------------- 对外接口 ----------------
  // 模拟服务器 JSON 往返：结果深拷贝，隔离前端对引擎状态的意外修改
  function clone(x) {
    if (x === null || x === undefined || typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') return x;
    try { return JSON.parse(JSON.stringify(x)); } catch (e) { return x; }
  }

  window.ClientAPI = {
    post: function (url, data) {
      return routePost(url, data || {}).then(clone);
    },
    get: function (url) {
      return routeGet(url).then(clone);
    },
    // 调试用
    _engine: engine,
  };
})();
