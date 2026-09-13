// 游戏主引擎
const { generateNPC, generateBaby } = require('./npcGenerator');
const { createGameDate, advanceAP, isNewMonth, monthlyTick, tryBreakthrough, AP_COSTS } = require('./timeSystem');
const { updateNPC, getNPCActivity, decideNPCAction } = require('./npcAI');
const { executeCombatRound, calcCombatRewards, usePill } = require('./combat');
const { tryConceive, giveBirth, pregnancyEvent } = require('./family');
const { pickAnyRandomEvent, pickRandomEvent, filterEvents, EVENT_CATEGORIES } = require('../data/events');
const { LOCATIONS, ZONE_ADJACENCY } = require('../data/locations');
const { REALMS, SUB_STAGES, calcBreakthroughChance, calcStageExpNeed } = require('../data/realms');
const { SPIRIT_ROOTS, ROOT_PURITY_LEVELS, RACES } = require('../data/races');
const { randInt, chance, randChoice, clamp, genId, deepClone, formatGameTime, extractSurname, genderize } = require('./utils');
const { isCloseRelative, relLabel } = require('./threeActStory');
const { getShopsAtLocation, getShopGoods, getSellPrice } = require('../data/shops');
const { BROTHELS, RANKS, initBrothelGirls, getBrothel, getGirls, interactWithGirl, brothelRandomEvent } = require('./brothel');
const { RESIDENCE_TYPES, MEMBER_RANKS, buyResidence, upgradeResidence, recruitMember, dismissMember, monthlySettlement, mansionEvent, visitResidence } = require('./mansion');
const { PET_TYPES, generatePet, tryCapture, feedPet, petAssistInCombat, setActivePet, renamePet, DISH_FEED } = require('./pet');
const { CROPS, FIELD_TIERS, initField, upgradeField, plant, growCrops, harvest, harvestAll, getFieldStatus, getSeedShop } = require('./farming');
const { MAIN_QUESTS, SIDE_QUESTS, DAILY_QUESTS, initQuests, acceptQuest, updateQuestProgress, checkQuestCompletion, getDailyQuests, getAvailableSideQuests, getQuestList } = require('./quest');
const { RECIPES, ALCHEMY_LEVELS, initAlchemy, getAlchemyLevel, getAvailableRecipes, getAllRecipes, learnRecipe, checkMaterials, refinePill, refineBatch, refreshTowerRecipes, studyRecipe } = require('./alchemy');
const { getAuction, bidAuction, settleAuctions } = require('./auctionSystem');
const { initTalisman, getTalismanLevel, learnTalisman, craftTalisman, getTalismanShop, buyTalisman } = require('./talismanSystem');
const { FORGE_RECIPES, ENHANCE_LEVELS, ELEMENTS, FORGE_LEVELS, initForge, getForgeLevel, getAvailableForgeRecipes, learnForgeRecipe, forgeItem, enhanceItem, enchantItem, equipItem, getEquipBonus } = require('./forge');
const { initSteal, getStealLevel, doSteal, npcAutoSteal, STEAL_LEVELS } = require('./steal');
const { triggerExtendedEvent } = require('./npcExtendedEvents');
const { triggerTagEvents } = require('../data/tagEvents');
const { SECTS, SECT_POSITIONS, SECT_QUESTS, initSect, joinSect, leaveSect, getSectInfo, getAllSects, getDailySectQuests, completeSectQuest, exchangeContribution, createSect } = require('./sect');
const { ACHIEVEMENTS, initAchievements, checkAchievements, updateStat, getAchievements, claimAchievement } = require('./achievement');
const { SEASONS, WEATHER_TYPES, getSeason, generateWeather, getWeatherExpBonus, getWeatherCombatBonus, weatherEvent, seasonEvent, getWeatherInfo } = require('./weather');
const { FORMATIONS, FORMATION_LEVELS, initFormation, getFormationLevel, getLearnedFormations, getAvailableFormations, learnFormation, activateFormation, getFormationBonus } = require('./formation');
const { MOUNT_TYPES, generateMount, tryCaptureMount, feedMount, setActiveMount, getMountBonus, renameMount } = require('./mount');
const { initMasterDisciple, requestMaster, takeDisciple, transmitPower, masterDailyReward, swearBrotherhood, breakBrotherhood, getBrotherhoodBonus, getAvailableMasters, getAvailableDisciples, getAvailableBrothers, masterDiscipleInteract } = require('./masterDisciple');
const { TITLES, initTitles, checkTitles, equipTitle, getTitleBonus, getTitleList } = require('./title');
const { GU_ARTS, GU_WORMS, initGu, getGuInfo, learnGuArt, buyGuWorm } = require('./guSystem');
const { getTreasureGoods, exchangeTreasure, stealTreasure } = require('./treasureSystem');
const { getQingyunArts, learnQingyunArt, getQingyunBuffs } = require('./qingyunArts');
const { DUNGEONS, DUNGEON_ENCOUNTERS, initDungeonState, enterDungeon, exploreDungeonFloor, defeatBoss, completeDungeon, exitDungeon, getDungeonList } = require('./dungeon');
const { getTagInfo } = require('../data/tags');
const { getInteractionEvent, fillEventText } = require('../data/interactionEvents');
const { getAttributeEvent } = require('../data/attributeEvents');
const { generateStall, getWorldBasePrice, bargain, buyFromStall, stealFromStall, getStallInteraction } = require('./stall');
const { initMarketFactors, refreshMarket, getCurrentPrice, getShopGoodsForLocation, getSellPrice: getDynamicSellPrice, getPriceTrendText } = require('./priceSystem');
const { LEARN_ALCHEMY_RECIPES, LEARN_FORGE_RECIPES, LEARN_FORMATIONS, CULTIVATION_TECHNIQUES, initLearning, study, getLearningList, hasLearned, getRandomLearningEvent, getAllItems, addLearningProgress, getTechniqueBuffs, equipTechnique, unequipTechnique, getTechniqueState } = require('./learning');
const { FURNACE_TIERS, FORGE_TIERS, FORMATION_TIERS, initCraftingTools, buyTool, selectTool, canCraft, consumeToolUse, getToolMarketItems } = require('./craftingTools');
const { getCraftableList, craft } = require('./craftingRoom');
const { MANSION_LEVELS, MANSION_AREAS, initMansion, getMansionInfo, upgradeMansion, getAreaInfo, getMansionEvent } = require('./mansionSystem');
const { SERVANT_TYPES, generateServantForSale, refreshServantsForSale, buyServant, interactWithServant, triggerServantMonthlyEvent } = require('./servant');
const { generateNpcServantEvent } = require('./npcServantEvents');
const { DISHES, initCooking, getAvailableDishes, checkMaterials: checkCookingMaterials, startCooking: startCookingDish, tickCooking: tickCookingDish, eatDish: eatCookedDish, learnRecipe: learnCookingRecipe } = require('./cookingSystem');
const { ITEMS, getItemInfo } = require('../data/items');
const { initShops, getButcherItems, getSeedShopItems, getPharmacyItems, buyItem, sellItem, refreshButcher, refreshSeedShop } = require('./shopSystem');
const { generateBeast, generateBoss, getBeastBattleEvent, getBeastDrops } = require('./beastSystem');
const { FISHING_ZONES, initFishingState, enterFishingZone, catchFish, exitFishingZone, getFishMarketItems } = require('./fishingSystem');
const { initQuarterlyQuests, getAvailableQuests, acceptQuest: acceptQuarterlyQuest, updateQuestProgress: updateQuarterlyProgress, completeQuest: completeQuarterlyQuest, refreshQuarterlyQuests, submitQuestItems: submitQuarterlyQuestItems } = require('./quarterlyQuests');
const { VENUES: WF_VENUES, initWindFlower, getWindFlower, interact: windFlowerInteract, selectPerson, generateWindFlowerVisits, generateWindFlowerJournals } = require('./windFlower');

// 需求16：NPC互生子嗣姓氏——非私生子跟父母中修为高的一方姓；私生子跟扶养人姓；均无则保持随机姓
function applyNpcChildSurname(b, state) {
  if (!b || !b.family || !state) return;
  const p = state.player;
  if (b.family.father === p.id || b.family.mother === p.id) return; // 主控子嗣（产前已定主控姓）
  const mother = b.family.mother ? state.npcs.find(n => n.id === b.family.mother) : null;
  const father = b.family.father ? state.npcs.find(n => n.id === b.family.father) : null;
  let surname = null;
  if (b.legitimacy !== '私生子女') {
    const mLevel = mother?.realmLevel || 0;
    const fLevel = father?.realmLevel || 0;
    if (mother && mLevel >= fLevel) surname = extractSurname(mother.name);
    else if (father) surname = extractSurname(father.name);
  } else if (b.guardian) {
    const g = state.npcs.find(n => n.id === b.guardian);
    surname = g ? extractSurname(g.name) : null;
  }
  if (surname) {
    const oldSur = extractSurname(b.name);
    b.name = surname + b.name.slice(oldSur.length);
  }
}

class GameEngine {
  constructor() {
    this.state = null;
    this.currentSlot = null;
  }

  // 初始化新游戏
  newGame(playerConfig = {}) {
    this.currentSlot = null;
    const gameDate = createGameDate(1);
    const customRanges = playerConfig.customRanges || this.state?.portraitCustomRanges || null;

    // 创建玩家
    const { genName } = require('./utils');
    const player = generateNPC({
      name: playerConfig.name || genName(playerConfig.gender || '男'),
      gender: playerConfig.gender || '男',
      race: playerConfig.race || '人族',
      age: playerConfig.age || 16,
      realmLevel: playerConfig.realmLevel || 2,
      subStage: '前期', // 新档从每境前期开始，逐层突破
      location: playerConfig.location || '清风镇',
      personality: playerConfig.personality,
      customRanges,
    });
    player.isPlayer = true;
    player.favorWithPlayer = 100;
    player.knownByPlayer = true;
    player.spiritStone = 500;
    player.silver = 1000; // 银两（凡人界货币）
    player.contribution = 0;
    player.karma = { merit: 0, sin: 0 };
    player.reputation = 0;
    player.journal = [];
    player.statusEffects = [];
    player.quests = null;
    player.acquaintances = [];
    player.pets = [];
    initField(player, 1); // 初始拥有普通灵田
    player.residence = null;
    player.alchemy = null;
    player.forge = null;
    player.sect = null;
    player.achievements = null;
    player.formation = null;
    player.mounts = [];
    player.masterDisciple = null;
    player.titles = null;
    player.dungeonState = null;
    // 怀孕系统
    player.isPregnant = false;
    player.pregnancyMonths = 0;
    player.pregnancyFather = null;
    player.pregnancyData = null; // 孕期特殊数据

    // 标签系统
    const { getRandomTags, applyAllTagEffects } = require('../data/tags');
    player.tags = playerConfig.tags || getRandomTags(randInt(2, 4), player);
    applyAllTagEffects(player);

    // 装备系统
    const { initEquipment } = require('./equipment');
    initEquipment(player);

    // 初始化任务系统
    initQuests(player);
    // 初始化青楼姑娘
    initBrothelGirls();
    // 初始化生活技能
    initAlchemy(player);
    initForge(player);
    initSect(player);
    initAchievements(player);
    initFormation(player);
    initTitles(player);
    initMasterDisciple(player);
    initTalisman(player);
    // 初始化新系统
    initLearning(player);
    player.equippedTechs = []; // 功法栏（最多5个）
    player.professions = { current: null, list: {}, cultivation: [] }; // 职业系统
    // 默认修仙职业：散修（无门无派默认身份）
    const { addCultivationProfession } = require('./workSystem');
    addCultivationProfession(player, '散修');
    initMansion(player);
    initMarketFactors();

    // 生成初始NPC - 确保每个职业至少2个（只生成在玩家可见地点，不包含已删除地点；
    // 需求：凡人职业→凡人界出生，修仙职业→修仙界出生）
    const npcs = [];
    const { PLAYER_VISIBLE_LOCATIONS, LOCATIONS } = require('../data/locations');
    const locationNames = PLAYER_VISIBLE_LOCATIONS;
    const { PROFESSIONS } = require('../data/races');
    const professionKeys = Object.keys(PROFESSIONS);
    const mortalLocs = locationNames.filter(l => LOCATIONS[l] && LOCATIONS[l].zone === '凡人界' && !LOCATIONS[l].require);
    const cultLocs = locationNames.filter(l => LOCATIONS[l] && LOCATIONS[l].zone === '修仙界' && !LOCATIONS[l].require);

    // 先为每个职业生成2个NPC（职业界域匹配出生地点）
    for (const prof of professionKeys) {
      const profDef = PROFESSIONS[prof];
      const isCult = profDef && profDef.realm === 'cultivation';
      const pool = isCult ? cultLocs : mortalLocs;
      for (let i = 0; i < 2; i++) {
        const loc = pool.length ? randChoice(pool) : randChoice(locationNames);
        const npc = generateNPC({ location: loc, profession: prof, customRanges });
        npcs.push(npc);
      }
    }

    // 再随机生成一些NPC（身份优先：凡人→凡人界地点，修仙者→修仙界地点）
    for (let i = 0; i < 30; i++) {
      const isCult = Math.random() < 0.25;
      const pool = isCult ? cultLocs : mortalLocs;
      const loc = pool.length ? randChoice(pool) : randChoice(locationNames);
      const npc = generateNPC({ location: loc, customRanges });
      npcs.push(npc);
    }

    // 确保玩家所在地点有NPC
    const localNPCs = npcs.filter(n => n.location === player.location);
    if (localNPCs.length < 5) {
      for (let i = 0; i < 5; i++) {
        npcs.push(generateNPC({ location: player.location, customRanges }));
      }
    }

    // 为玩家生成真实父母NPC（凡人，常驻玩家出生地，供关系网/家族显示）
    const fatherNpc = generateNPC({ name: player.family.fatherName, gender: '男', age: Math.max(player.age + 18, 34), race: player.race, location: player.location, realmLevel: 1, customRanges });
    const motherNpc = generateNPC({ name: player.family.motherName, gender: '女', age: Math.max(player.age + 16, 30), race: player.race, location: player.location, realmLevel: 1, customRanges });
    fatherNpc.family.spouse = motherNpc.id;
    motherNpc.family.spouse = fatherNpc.id;
    fatherNpc.family.children = [player.id];
    motherNpc.family.children = [player.id];
    fatherNpc.knownByPlayer = true;
    motherNpc.knownByPlayer = true;
    player.family.father = fatherNpc.id;
    player.family.mother = motherNpc.id;
    // 父母天然已结识（入好友名单，供传书等入口判定）
    if (!player.acquaintances.includes(fatherNpc.id)) player.acquaintances.push(fatherNpc.id);
    if (!player.acquaintances.includes(motherNpc.id)) player.acquaintances.push(motherNpc.id);
    npcs.push(fatherNpc, motherNpc);

    this.state = {
      saveCode: 'save_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 9000 + 1000),
      gameDate,
      gameDateText: formatGameTime(gameDate),
      player,
      npcs,
      worldState: {
        monthCount: 0,
        yearCount: 0,
        events: [],
        activeEvents: [],
        prices: {},
        weather: null,
      },
      combatState: null,
      eventState: null,
      log: [],
      worldJournal: [],
      stalls: [],
      servantsForSale: [],
    };
    initWindFlower(this.state);

    // 初始化牙人所仆役
    this.state.servantsForSale = refreshServantsForSale();
    // 为每个地点生成1-2个摊位
    for (const loc of locationNames.slice(0, 15)) {
      if (Math.random() < 0.6) {
        // 80%使用现有NPC，20%生成新NPC
        const useExisting = Math.random() < 0.8;
        let vendor = null;
        if (useExisting) {
          const candidates = npcs.filter(n => n.location === loc && n.age >= 16);
          if (candidates.length > 0) {
            vendor = randChoice(candidates);
          }
        }
        if (!vendor) {
          vendor = generateNPC({ location: loc, realmLevel: randInt(1, 5) });
          vendor.isVirtualVendor = true; // 虚拟身份，不增加认识
          npcs.push(vendor);
        }
        const stall = generateStall(loc, vendor);
        this.state.stalls.push(stall);
      }
    }

    // 生成NPC之间的关系网
    this.generateNpcRelations(npcs);

    // 生成帝王和帝国系统
    this.generateEmpire(npcs);

    this.addLog(`【${formatGameTime(gameDate)}】你来到了${player.location}，开始你的修仙之旅。`);
    this.addJournal(`初入${player.location}，开始修仙之路。`);

    return this.getPublicState();
  }

  // 获取公开状态（前端用）
  getPublicState() {
    if (!this.state) return null;
    const { player, npcs, gameDate, worldState, combatState, eventState, log, worldJournal, saveCode } = this.state;
    // 已认识的灵姬/灵郎（未赎身）并入 npcs：供人物页"已认识"列表与详情面板使用
    const wfList = [];
    const wfGen = this.state.windFlower?.generated || {};
    const knownIds = player.acquaintances || [];
    for (const loc of Object.keys(wfGen)) {
      for (const wf of wfGen[loc]) {
        if (wf.freed) continue; // 已赎身者已转入 npcs
        if (!wf.knownByPlayer && !knownIds.includes(wf.id)) continue;
        wfList.push({
          id: wf.id, name: wf.name, gender: wf.gender, age: wf.age,
          portrait: (() => { try { const { getPortrait } = require('./utils'); if (!wf.portrait) wf.portrait = getPortrait(wf.age, wf.gender); return wf.portrait; } catch (e) { return ''; } })(),
          daoTitle: null, realm: '凡人境', realmLevel: 0, subStage: null,
          professionName: wf.gender === '女' ? '灵姬' : '灵郎',
          location: loc, action: null, actionTurns: 0,
          favorWithPlayer: wf.favor, knownByPlayer: true, isAlive: true,
          isWindFlower: true, freed: false,
          personalHistory: wf.notes || [],
          appearanceLabel: wf.appearanceLabel, popularity: wf.popularity,
          cost: wf.cost, redeemPrice: wf.redeemPrice, favor: wf.favor,
          isSameLocation: loc === player.location,
          relToPlayer: null,
        });
      }
    }
    return {
      saveCode: saveCode || null,
      gameDate,
      gameDateText: formatGameTime(gameDate),
      player: this.sanitizePlayer(player),
      npcs: [...npcs.filter(n => n.id !== player.id && (n.knownByPlayer || n.location === player.location || n.isAlive === false)).map(n => {
        const sn = this.sanitizeNPC(n);
        // 三代以内亲属关系标注（供前端按钮裁剪与亲属称呼显示）
        sn.relToPlayer = relLabel(player, n, npcs) || null;
        // 补全生父/生母姓名：生父母NPC可能因不认识主控而被过滤，前端子嗣表格需显示姓名
        if (sn.family && (sn.family.father || sn.family.mother)) {
          if (sn.family.father && !sn.family.fatherName) {
            const f = npcs.find(x => x.id === sn.family.father);
            if (f) sn.family.fatherName = f.name;
          }
          if (sn.family.mother && !sn.family.motherName) {
            const m = npcs.find(x => x.id === sn.family.mother);
            if (m) sn.family.motherName = m.name;
          }
        }
        return sn;
      }), ...wfList],
      allNPCCount: npcs.length,
      location: LOCATIONS[player.location],
      locationName: player.location,
      locations: Object.entries(LOCATIONS).map(([name, data]) => ({ name, ...data })),
      worldState,
      combatState,
      eventState,
      windFlower: this.state.windFlower,
      log: log.slice(-50),
      journal: player.journal?.slice(-100) || [],
      // 世界记事取最新200条；玩家相关事件（欢好/交互/传代等）置顶，避免被每月NPC事件淹没
      worldJournal: (() => {
        const wj = worldJournal || [];
        const pName = player.name;
        const isMine = e => e.npc === pName || String(e.content || '').includes(pName);
        const mine = wj.filter(isMine);
        const rest = wj.filter(e => !isMine(e));
        return [...mine, ...rest].slice(0, 200);
      })(),
      // 世界记事补全：未在 npcs 列表（不认识且不同地点且存活）的NPC记事，供世界记事页展示全世界动态
      allNpcJournals: npcs
        .filter(n => n.id !== player.id && !(n.knownByPlayer || n.location === player.location || n.isAlive === false))
        .map(n => ({ npc: n.name, isAlive: n.isAlive !== false, msgs: (n.personalHistory || []).slice(-80) }))
        .filter(r => r.msgs.length > 0),
      weather: getWeatherInfo(gameDate, worldState?.weather),
      // 三代以内血亲 id 列表（前端据此裁剪交互按钮：交谈/切磋/赠礼/偷窃/战斗/欢好/传书）
      closeRelatives: npcs.filter(n => n.id !== player.id && isCloseRelative(player, n, npcs)).map(n => n.id),
      // 待展示事件（怀孕/孕期事件/生产，前端弹窗展示后调用 /api/clear-pending-events 清空）
      pendingPlayerEvents: this.state.pendingPlayerEvents || [],
    };
  }

  sanitizePlayer(p) {
    return {
      id: p.id, name: p.name, gender: p.gender, race: p.race, age: p.age,
      portrait: p.portrait, daoTitle: p.daoTitle, spiritRoot: p.spiritRoot,
      lustTrait: p.lustTrait, lustTraitInfo: p.lustTraitInfo,
      fertility: p.fertility,
      personality: p.personality, personalityInfo: p.personalityInfo,
      realm: p.realm, realmLevel: p.realmLevel, subStage: p.subStage,
      identity: p.identity || (p.realmLevel >= 2 ? '修仙者' : '平民'),
      cultivationExp: p.cultivationExp, breakthroughExp: p.breakthroughExp,
      attributes: p.attributes, combatStats: p.combatStats,
      hp: p.hp, mp: p.mp,
      faction: p.faction, profession: p.profession, professionLevel: p.professionLevel,
      professionName: p.professionName,
      location: p.location, spiritStone: p.spiritStone, silver: p.silver, contribution: p.contribution,
      karma: p.karma, reputation: p.reputation,
      statusEffects: p.statusEffects, skills: p.skills, inventory: p.inventory,
      family: p.family, residence: p.residence,
      acquaintances: p.acquaintances,
      pets: p.pets, farm: p.farm,
      alchemy: p.alchemy, forge: p.forge,
      sect: p.sect, achievements: p.achievements,
      formation: p.formation, mounts: p.mounts,
      masterDisciple: p.masterDisciple, titles: p.titles,
      equippedTechs: p.equippedTechs || [],
      professions: p.professions ? { current: p.professions.current, list: p.professions.list, cultivation: p.professions.cultivation || [] } : { current: null, list: {}, cultivation: [] },
      dungeonState: p.dungeonState ? {
        active: p.dungeonState.active ? { id: p.dungeonState.active.id, name: p.dungeonState.active.name } : null,
        floor: p.dungeonState.floor,
        maxFloors: p.dungeonState.maxFloors,
        bossDefeated: p.dungeonState.bossDefeated,
        rewards: p.dungeonState.rewards,
      } : null,
      // 怀孕系统
      isPregnant: p.isPregnant || false,
      pregnancyMonths: p.pregnancyMonths || 0,
      pregnancyFather: p.pregnancyFather || null,
      // 标签和关系网
      tags: p.tags || [],
      relations: p.relations || {},
      mansion: p.mansion || null,
      estates: p.estates || {},
      letters: p.letters || [],
      journal: p.journal?.slice(-100) || [],
      personalHistory: p.personalHistory || [],
      family: p.family || {},
      // 装备系统
      equipment: p.equipment || { weapon: null, armor: null, accessory: null },
      equipmentBonus: (() => {
        const { calcEquipmentBonus } = require('./equipment');
        return calcEquipmentBonus(p.equipment);
      })(),
    };
  }

  sanitizeNPC(n) {
    const isSameLocation = n.location === this.state.player.location;
    const canSeeDetail = n.knownByPlayer || isSameLocation;
    // 补全喜恶属性
    if (!n.likes || !n.dislikes) {
      const { generateLikesDislikes } = require('./npcGenerator');
      if (!n.likes) n.likes = generateLikesDislikes('like', n.personality, n.gender, n.profession);
      if (!n.dislikes) n.dislikes = generateLikesDislikes('dislike', n.personality, n.gender, n.profession);
    }
    return {
      id: n.id, name: n.name, gender: n.gender, race: n.race, age: n.age,
      portrait: n.portrait, daoTitle: n.daoTitle, realm: n.realm, realmLevel: n.realmLevel,
      identity: n.identity || (n.realmLevel >= 2 ? '修仙者' : '平民'),
      subStage: n.subStage, faction: n.faction, profession: n.profession,
      professionName: n.professionName, location: n.invitedByPlayer ? '宅子中' : n.location, action: n.action,
      actionTurns: n.actionTurns, favorWithPlayer: n.favorWithPlayer,
      knownByPlayer: n.knownByPlayer, isAlive: n.isAlive,
      fertility: n.fertility,
      personality: canSeeDetail ? n.personality : null,
      attributes: canSeeDetail ? n.attributes : null,
      hp: canSeeDetail ? n.hp : null,
      mp: canSeeDetail ? n.mp : null,
      cultivationExp: canSeeDetail ? (n.cultivationExp || 0) : 0,
      isPregnant: n.isPregnant,
      pregnancyMonths: n.pregnancyMonths || 0,
      concubineRank: n.concubineRank || null,
      isConsort: !!n.isConsort,
      isEmpress: !!n.isEmpress,
      isEmperor: !!n.isEmperor,
      isDowager: !!n.isDowager,
      isRoyal: !!n.isRoyal,
      consortRank: n.consortRank || null,
      isFormerPlayer: !!n.isFormerPlayer,
      tags: canSeeDetail ? (n.tags || []) : [],
      warehouse: canSeeDetail ? (n.warehouse || { items: [] }) : { items: [] },
      relations: canSeeDetail ? (n.relations || {}) : {},
      family: canSeeDetail ? (n.family || {}) : {},
      personalHistory: canSeeDetail ? (n.personalHistory || []) : [],
      likes: canSeeDetail ? (n.likes || []) : [],
      dislikes: canSeeDetail ? (n.dislikes || []) : [],
      masterDisciple: canSeeDetail ? (n.masterDisciple || { master: null, disciples: [] }) : { master: null, disciples: [] },
      guardian: n.guardian ?? null,
      guardianName: n.guardianName ?? null,
      journal: canSeeDetail ? (n.journal || []).slice(-50) : [],
      isSameLocation,
    };
  }

  // 添加日志
  addLog(msg) {
    this.state.log.push({ time: formatGameTime(this.state.gameDate), msg });
    if (this.state.log.length > 500) this.state.log.shift();
  }

  // 添加记事
  addJournal(msg) {
    if (!this.state.player.journal) this.state.player.journal = [];
    this.state.player.journal.push({ time: formatGameTime(this.state.gameDate), msg });
  }

  // 添加世界记事（NPC相关事件）
  addWorldJournal(npcName, eventText) {
    if (!this.state.worldJournal) this.state.worldJournal = [];
    this.state.worldJournal.unshift({
      time: formatGameTime(this.state.gameDate),
      npc: npcName,
      content: eventText,
      location: this.state.gameDateText ? '' : '',
    });
    if (this.state.worldJournal.length > 500) this.state.worldJournal.pop();
  }

  // 消耗AP并推进时间
  consumeAP(cost = 1) {
    if (!this.state.pendingPlayerEvents) this.state.pendingPlayerEvents = [];
    const oldDate = deepClone(this.state.gameDate);
    const oldXunTotal = oldDate.year * 36 + (oldDate.month - 1) * 3 + (oldDate.xun || 0);
    advanceAP(this.state.gameDate, cost);

    // 更新所有NPC
    for (const npc of this.state.npcs) {
      updateNPC(npc, this.state);
    }

    // 需求：NPC随机事件记事改为每月上中下三旬各概率触发0-3条/人（跨过几旬就触发几次）
    const newXunTotal = this.state.gameDate.year * 36 + (this.state.gameDate.month - 1) * 3 + (this.state.gameDate.xun || 0);
    const xunElapsed = newXunTotal - oldXunTotal;
    if (xunElapsed > 0) {
      const { generateWorldEvents } = require('./npcWorldEvents');
      const { formatGameTime } = require('./utils');
      const gameDateText = this.state.gameDateText || formatGameTime(this.state.gameDate);
      for (let k = 0; k < xunElapsed; k++) {
        const worldEvents = generateWorldEvents(this.state.npcs, gameDateText);
        for (const we of worldEvents) {
          if (we && we.text) {
            this.addLog(`${we.npc || ''}${we.other ? '与' + we.other : ''}：${we.text}`);
          }
        }
      }
      // 灵宠每旬更新：成长 + 0-3条记事 + 交配/怀孕/生产
      try {
        const { petXunUpdate } = require('./petLife');
        const petR = petXunUpdate(this.state, gameDateText);
        for (const l of (petR.logs || [])) this.addLog(l);
      } catch (e) { /* 灵宠更新失败不阻塞时间推进 */ }
    }

    // 月度Tick
    if (isNewMonth(oldDate, this.state.gameDate)) {
      const events = monthlyTick(this.state);
      for (const ev of events) {
        if (ev.type === 'npc_breakthrough') {
          this.addLog(`${ev.npc}突破至${ev.realm}！`);
        } else if (ev.type === 'npc_death') {
          this.addLog(`${ev.npc}去世了。`);
          this.checkRoyalSuccession();
        } else if (ev.type === 'royal_event') {
          this.addLog(`${ev.event}`);
          this.addWorldJournal(ev.npc, `${ev.event}`);
        } else if (ev.type === 'birth') {
          const mother = ev.mother;
          // 需求13：弹窗剧情先检测对应NPC存在（已故/不存在不触发）
          if (!mother || mother.isAlive === false) { this.addLog('（一处生产信息因当事人不在而无从记录）'); continue; }
          const father = this.state.npcs.find(n => n.id === mother.pregnancyFather) || this.state.player;
          const isPlayerFather = father && father.id === this.state.player.id;
          // 需求15：主控为父的子嗣跟主控姓
          const result = giveBirth(mother, father, this.state, isPlayerFather ? extractSurname(this.state.player.name) : undefined);
          if (result.success) {
            const babies = result.babies && result.babies.length > 1 ? result.babies : [result.baby];
            const m = this.state.player.mansion;
            const isConcubine = m && m.concubines && m.concubines.includes(mother.id);
            for (const b of babies) {
              if (isPlayerFather) {
                // 主控为父（妻妾/私通）：先生成宝宝，由出生弹窗选择入府安置/不予抚养（需求：妻妾生产与主控生产同功能）
                b.guardian = null;
                b.guardianName = null;
                b.legitimacy = '亲子女';
                b.knownByPlayer = true;
              } else {
                b.guardian = mother.id;
                b.guardianName = mother.name;
              }
            }
            // 需求16：NPC互生子嗣姓氏——非私生子跟父母修为高者姓；私生子跟扶养人姓
            if (!isPlayerFather) {
              for (const b of babies) applyNpcChildSurname(b, this.state);
            }
            if (babies.length > 1) {
              this.addLog(`${mother.name}生下了双胞胎！`);
              this.addWorldJournal(mother.name, `${mother.name}诞下双胞胎，分别取名${babies.map(b => b.name).join('、')}。`);
            } else {
              this.addLog(`${mother.name}生下了一个孩子！`);
              this.addWorldJournal(mother.name, `${mother.name}诞下一子，取名${result.baby.name}。`);
            }
            // 妻妾生产：弹出与主控生产相同的"入府安置（取名）/不予抚养（随机名）"弹窗，文案随妾室不同
            if (isPlayerFather && isConcubine) {
              const b0 = babies[0];
              this.state.pendingPlayerEvents.push({
                type: 'birth',
                name: babies.length > 1 ? '妾室诞下双胞胎！' : '妾室诞子！',
                desc: `${mother.name}为你诞下${babies.length > 1 ? '双胞胎' : (b0.gender === '男' ? '一子' : '一女')}，暂名${babies.map(b => b.name).join('、')}。请选择是否入府安置。`,
                lines: babies.map(b => `${b.gender === '男' ? '男' : '女'}孩：${b.name}，根骨 ${b.attributes?.physique ?? '未知'}，天赋 ${b.innateTrait || '未知'}`),
                babyIds: babies.map(b => b.id),
                concubineBirth: true,
                motherName: mother.name,
                withActions: true,
              });
            }
            // 需求13：私生子寻亲弹窗——先检测母亲存在；按母亲态度概率触发（想让你接回府才弹窗）
            // 需求：生下主控孩子的NPC只会进行一次想让主控接走孩子的剧情弹窗，被拒后不再触发（bastardAskDone 标记）
            if (isPlayerFather && !isConcubine) {
              const cs = require('./childSystem');
              const b0 = babies[0];
              if (b0 && !b0.bastardAskDone) {
                const roll = Math.random();
                if (roll < 0.6) {
                  // 母亲想让你接回府 → 触发寻亲弹窗（每个孩子只弹一次）
                  b0.bastardAskDone = true;
                  const text = cs.BASTARD_ASK[Math.floor(Math.random() * cs.BASTARD_ASK.length)].replace(/{name}/g, mother.name);
                  this.state.pendingPlayerEvents.push({
                    type: 'bastard',
                    name: '私生子寻亲',
                    desc: text,
                    lines: [
                      `${mother.name}为你生下一个${b0.gender === '男' ? '男孩' : '女孩'}，名叫${b0.name}。`,
                      '请选择：收留为庶子女，或置之不理。',
                    ],
                    childId: b0.id,
                    motherId: mother.id,
                    motherPortrait: mother.portrait || '',
                    childPortrait: b0.portrait || '',
                    withActions: true,
                  });
                } else if (roll < 0.75) {
                  // 母亲选择独自抚养 → 不弹窗，仅记事
                  this.addWorldJournal(mother.name, `${mother.name}诞下一子，取名${b0.name}，选择独自抚养。`);
                } else {
                  // 母亲选择遗弃 → 不弹窗，仅记事
                  b0.guardian = null;
                  b0.guardianName = null;
                  b0.legitimacy = '私生子女';
                  this.addWorldJournal(mother.name, `${mother.name}诞下一子，取名${b0.name}，因无力抚养将其遗弃。`);
                }
              }
            }
          } else {
            this.addLog(`${mother.name}生产${result.type}！`);
            this.addWorldJournal(mother.name, `${mother.name}生产${result.type}。`);
          }
        } else if (ev.type === 'player_birth') {
          const mother = this.state.player;
          const father = this.state.npcs.find(n => n.id === mother.pregnancyFather);
          // 需求15：主控的子嗣都跟主控姓（先生成临时名=主控姓+随机名）
          const result = giveBirth(mother, father || { id: 'unknown', name: '未知' }, this.state, extractSurname(this.state.player.name));
          if (result.success) {
            const babies = result.babies && result.babies.length > 1 ? result.babies : [result.baby];
            // 需求9：先弹"入府安置/不予抚养"，入府安置后才能取名，不抚养保持随机名
            for (const b of babies) {
              b.knownByPlayer = true;
              b.guardian = null;
              b.guardianName = null;
              b.legitimacy = '亲子女';
            }
            if (babies.length > 1) {
              this.addLog(`你生下了双胞胎！暂名${babies.map(b => b.name).join('、')}。`);
              this.addJournal(`诞下双胞胎，暂名${babies.map(b => b.name).join('、')}。`);
            } else {
              this.addLog(`你生下了一个孩子！暂名${result.baby.name}。`);
              this.addJournal(`诞下一子，暂名${result.baby.name}。`);
            }
            this.state.pendingPlayerEvents.push({
              type: 'birth',
              name: babies.length > 1 ? '喜得双胞胎！' : '喜得麟儿！',
              desc: babies.length > 1
                ? `你诞下双胞胎，暂名${babies.map(b => b.name + '（' + (b.gender === '男' ? '男' : '女') + '）').join('、')}。请选择是否入府安置。`
                : `你诞下一子，暂名${result.baby.name}。请选择是否入府安置。`,
              lines: babies.map(b => `${b.gender === '男' ? '男' : '女'}孩：${b.name}，根骨 ${b.attributes?.physique ?? '未知'}，天赋 ${b.innateTrait || '未知'}`),
              babyIds: babies.map(b => b.id),
              withActions: true, // 生产弹窗带：入府安置（可取名）/不予抚养（随机名）
            });
          } else {
            this.addLog(`生产${result.type}！`);
            this.addJournal(`生产${result.type}。`);
            this.state.pendingPlayerEvents.push({
              type: 'birth',
              name: '生产不顺',
              desc: `你生产${result.type}。`,
              lines: [],
            });
          }
        } else if (ev.type === 'player_pregnancy_event') {
          this.addLog(`孕期事件：${ev.event}`);
          this.addJournal(`孕期事件：${ev.event}。`);
          // 需求[12]：孕期事件以游戏内弹窗展示
          this.state.pendingPlayerEvents.push({
            type: 'pregnancy_event',
            name: '孕期事件',
            desc: (ev.evt && (ev.evt.desc || ev.evt.event)) || ev.event || '',
            lines: (ev.evt && ev.evt.lines) || [],
            options: (ev.evt && ev.evt.options) || [],
          });
        } else if (ev.type === 'player_tag_event' || ev.type === 'player_solo_event') {
          // 主控标签剧情、主控单人剧情记录到主控记事
          if (ev.event) {
            this.addLog(`${ev.event}`);
            this.addJournal(`${this.state.gameDateText}·${this.state.player.location}·${ev.event}`);
          }
        } else if (ev.type === 'player_interaction_event') {
          // 主控与NPC交互剧情记录到主控记事
          if (ev.event) {
            this.addLog(`${ev.event}`);
            this.addJournal(`${this.state.gameDateText}·${this.state.player.location}·与${ev.target}：${ev.event}`);
          }
        } else if (ev.type === 'tag_event' || ev.type === 'extended_event' || ev.type === 'emotion_event') {
          // 标签剧情、扩展剧情、情感剧情记录到世界记事
          if (ev.event) {
            this.addWorldJournal(ev.npc, ev.event);
          }
        } else if (ev.type === 'npc_steal') {
          if (ev.event) {
            this.addWorldJournal(ev.npc, ev.event);
          }
        } else if (ev.type === 'npc_move') {
          // NPC移动不记录
        } else {
          // 其他类型事件记录到日志
          if (ev.event) {
            this.addLog(`${ev.npc || ''}: ${ev.event}`);
          }
        }
      }
      this.monthlyChildEvents();
      // 花楼：普通NPC（非灵姬/灵郎）随机造访温柔乡，谈情/春宵并接入怀孕判定
      const wfVisits = generateWindFlowerVisits(this.state, this.state.gameDateText);
      for (const ev of wfVisits) {
        if (ev.pregnancy) {
          this.addLog(`${ev.wf}有了身孕（与${ev.npc}）。`);
          this.addWorldJournal(ev.wf, `${ev.wf}与${ev.npc}春宵一度后有了身孕。`);
        } else {
          this.addLog(ev.text);
        }
      }
      // 花楼：为灵姬/灵郎随机生成各式各样的记事剧情（写入记事库并进入世界记事）
      const wfJournals = generateWindFlowerJournals(this.state, this.state.gameDateText);
      for (const j of wfJournals) {
        this.addWorldJournal(j.name, j.text);
      }
      // 府邸月度结算
      if (this.state.player.residence) {
        const settlement = monthlySettlement(this.state.player);
        if (settlement.net !== 0) {
          this.addLog(`府邸月度结算：收入${settlement.income}，支出${settlement.cost}，净${settlement.net > 0 ? '+' : ''}${settlement.net}灵石。`);
        }
      }
      // 产业月度结算（第九批：矿脉产灵石/灵田产作物/店铺NPC购买）
      this.settleEstates();
      // 每月自动存档（第九批）
      this.autoSave();
    }

    // 灵田生长
    growCrops(this.state.player);

    // 做菜进度
    const cookResult = this.tickCooking();
    if (cookResult && cookResult.success) {
      this.addLog(`${cookResult.dish}制作完成！获得×${cookResult.count}`);
    }

    // 天气更新
    this.state.worldState.weather = generateWeather(this.state.gameDate.month, this.state.worldState.weather);
    const weatherInfo = getWeatherInfo(this.state.gameDate, this.state.worldState.weather);
    if (this.state.worldState.weather?.remaining === 0) {
      this.addLog(`天气变化：${this.state.worldState.weather.name} - ${this.state.worldState.weather.desc}`);
    }

    // 成就检查
    const newAchievements = checkAchievements(this.state.player);
    for (const ach of newAchievements) {
      this.addLog(`🏆 成就解锁：${ach.name}！`);
      this.addJournal(`解锁成就：${ach.name}`);
    }

    // 称号检查
    const newTitles = checkTitles(this.state.player);
    for (const title of newTitles) {
      this.addLog(`🎖️ 称号解锁：${title.name}！`);
      this.addJournal(`解锁称号：${title.name}`);
    }

    // 随机事件
    this.maybeTriggerEvent();

    // 更新时间文本
    const { formatGameTime } = require('./utils');
    this.state.gameDateText = formatGameTime(this.state.gameDate);
  }

  // 转月 - 推进到下一个月

  // ===== 子嗣/私生子/妻妾 弹窗交互（新需求批次）=====
  // 生产弹窗按钮：命名/安排住所/遗弃
  birthAction(player, babyId, action, name) {
    const baby = this.state.npcs.find(n => n.id === babyId);
    if (!baby) return { error: '未找到该子嗣' };
    const { assignChildRoom } = require('./mansionSystem');
    const m = player.mansion;
    if (action === 'name' && name) {
      baby.name = name;
      this.addJournal(`为${baby.gender === '男' ? '儿子' : '女儿'}取名${name}。`);
      this.addLog(`你为孩子取名${name}。`);
    } else if (action === 'house') {
      // 需求9：入府安置前必须先取名（主控选择入府安置后才能选择取名）
      if (!name || !name.trim()) return { error: '请先为孩子取一个名字' };
      baby.name = name.trim();
      const room = assignChildRoom(player, baby);
      baby.guardian = player.id;
      baby.guardianName = player.name;
      this.addJournal(`孩子${baby.name}已安置在${room === 'left_wing' ? '左厢房' : '右厢房'}。`);
      this.addLog(`${baby.name}已入住${room === 'left_wing' ? '左厢房' : '右厢房'}。`);
    } else if (action === 'abandon') {
      // 需求9：不予抚养——保持随机名（不弹取名），流落在外
      if (m) {
        m.leftWing = (m.leftWing || []).filter(id => id !== baby.id);
        m.rightWing = (m.rightWing || []).filter(id => id !== baby.id);
        m.children = (m.children || []).filter(id => id !== baby.id);
      }
      baby.guardian = null;
      baby.guardianName = null;
      baby.location = randChoice(this.state.npcs.map(n => n.location).filter(Boolean)) || baby.location;
      this.addJournal(`你未抚养孩子${baby.name}，任其在外漂泊。`);
      this.addLog(`你未抚养${baby.name}。`);
    }
    this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.type === 'birth' && ev.babyIds && ev.babyIds.includes(baby.id)));
    return { success: true };
  }

  // 子嗣交互：交谈/赠礼/切磋/偷窃/战斗/欢好/接回府
  childInteract(player, childId, action, itemName) {
    const child = this.state.npcs.find(n => n.id === childId);
    if (!child) return { error: '未找到该子嗣' };
    const { childAct } = require('./childSystem');
    const result = childAct(player, child, action, { itemName });
    if (result.error) return { error: result.error };
    this.addJournal(result.journal);
    if (result.adopt) {
      // 接回府成功：入厢房
      const { assignChildRoom } = require('./mansionSystem');
      assignChildRoom(player, child);
      if (!child.knownByPlayer) child.knownByPlayer = true;
    }
    return { success: true, msg: result.msg, favor: result.favor };
  }

  // 私生子收留/拒绝
  childAdopt(player, childId, adopt) {
    const child = this.state.npcs.find(n => n.id === childId);
    if (!child) return { error: '未找到该子嗣' };
    const mother = this.state.npcs.find(n => n.id === child.family && child.family.mother === n.id) || null;
    const { adoptBastard } = require('./childSystem');
    const result = adoptBastard(player, child, mother, this.state, adopt);
    this.addJournal(result.msg);
    // 需求：寻亲弹窗每个孩子只弹一次（无论收留还是置之不理，都标记为已询问过）
    child.bastardAskDone = true;
    if (result.adopted) {
      child.knownByPlayer = true;
      const { assignChildRoom } = require('./mansionSystem');
      assignChildRoom(player, child);
    }
    this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.type === 'bastard' && ev.childId === child.id));
    return { success: true, msg: result.msg };
  }

  // 未接回府子嗣弹窗按钮：接入府/置之不理/驱逐
  childOutcastAct(player, childId, action) {
    const child = this.state.npcs.find(n => n.id === childId);
    if (!child) return { error: '未找到该子嗣' };
    if (!child.relations) child.relations = {};
    const rel = child.relations[player.id] || (child.relations[player.id] = { type: player.gender === '女' ? '母' : '父', favor: child.favorWithPlayer || 50 });
    // 判断本次弹窗是否为"子嗣归家（想被接回府）"——只有这种请求被拒才累计拒绝次数
    const pev = (this.state.pendingPlayerEvents || []).find(e => e && e.childId === childId);
    const isReturnHome = !!(pev && pev.type === 'returnHome');
    if (action === 'adopt') {
      child.guardian = player.id;
      child.guardianName = player.name;
      child.location = player.location;
      child.knownByPlayer = true;
      child.refusedReturnCount = 0; // 接回府后清零
      const { assignChildRoom } = require('./mansionSystem');
      assignChildRoom(player, child);
      rel.favor = Math.min(100, rel.favor + 15);
      this.addJournal(`将子嗣${child.name}接回府中安置。`);
      this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.childId === child.id && ['child_outcast', 'returnHome', 'peek', 'resent'].includes(ev.type)));
      return { success: true, msg: genderize(`你将${child.name}接回了府中，安排他/她住下。`, child) };
    } else if (action === 'ignore') {
      rel.favor = rel.favor - 5;
      if (isReturnHome) child.refusedReturnCount = (child.refusedReturnCount || 0) + 1; // 需求：拒绝回府计数
      this.addJournal(`对子嗣${child.name}的请求置之不理。`);
      this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.childId === child.id && ['child_outcast', 'returnHome', 'peek', 'resent'].includes(ev.type)));
      return { success: true, msg: `你未予回应。${child.name}失落地离开了。` };
    } else if (action === 'drive') {
      rel.favor = rel.favor - 20;
      if (isReturnHome) child.refusedReturnCount = (child.refusedReturnCount || 0) + 1; // 需求：驱逐也算拒绝回府
      this.addJournal(`狠心驱逐了子嗣${child.name}。`);
      this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.childId === child.id && ['child_outcast', 'returnHome', 'peek', 'resent'].includes(ev.type)));
      return { success: true, msg: `你冷声道："不许再来！"${child.name}眼中满是恨意，转身离去。` };
    }
    return { error: '未知操作' };
  }

  // 妻妾弹窗按钮
  concubineAct(player, concubineId, action) {
    const conc = this.state.npcs.find(n => n.id === concubineId);
    if (!conc) return { error: '未找到该妻妾' };
    const { PUNISH_OPTIONS, APPEASE_TEXT, REPRIMAND_TEXT } = require('./childSystem');
    const targetId = conc._tattleTargetId;
    const target = targetId ? this.state.npcs.find(n => n.id === targetId) : null;
    let msg = '', journal = '';
    if (action === 'enjoy') {
      // 享受 → 欢好玩法
      const cs = require('./childSystem');
      const dir = randChoice(['gentle', 'coax', 'halfpush']);
      const pool = cs.LOVE[dir];
      const pick = randChoice(pool);
      msg = (typeof pick === 'function' ? pick(player, conc) : pick).replace(/{name}/g, conc.name);
      journal = `与妾室${conc.name}共度良宵。`;
      // 怀孕判定（仅异性间且女性可怀孕：主控男×女妾→妾怀孕；主控女×男侍→主控怀孕）
      if (player.gender !== conc.gender) {
        const female = player.gender === '女' ? player : conc;
        const male = player.gender === '男' ? player : conc;
        if (female.gender === '女' && !female.isPregnant && female.age >= 16 && female.age <= 45) {
          const { tryConceive } = require('./family');
          const tr = tryConceive(male, female, this.state);
          if (tr.success) {
            msg += ` 事后${female === player ? '你' : conc.name}有了身孕！`;
            journal += ` ${female === player ? '你' : conc.name}怀有身孕！`;
          }
        }
      }
    } else if (action === 'indifferent') {
      msg = `你淡淡地看了${conc.name}一眼，不置可否。她悻悻地退下了。`;
      journal = `对妾室${conc.name}的暗示无动于衷。`;
    } else if (action.startsWith('punish_')) {
      const opt = PUNISH_OPTIONS.find(o => o.key === action.replace('punish_', 'rank') || o.key === action.replace('punish_', 'kneel') || o.key === action.replace('punish_', 'scold'));
      const key = action.replace('punish_', '');
      const opt2 = PUNISH_OPTIONS.find(o => o.key === key);
      msg = (opt2 ? opt2.text : '你处罚了' + target.name + '。').replace(/{target}/g, target ? target.name : '对方');
      journal = `因${conc.name}告状，处罚了${target ? target.name : '对方'}。`;
      if (target) {
        if (!target.journal) target.journal = [];
        target.journal.push({ time: formatGameTime(this.state.gameDate), msg });
        if (target.knownByPlayer) this.addLog(`【${target.name}】${msg}`);
      }
    } else if (action === 'appease') {
      msg = APPEASE_TEXT.replace(/{name}/g, conc.name).replace(/{target}/g, target ? target.name : '对方');
      journal = `调解安抚了${conc.name}与${target ? target.name : '对方'}。`;
      if (target) {
        if (!target.journal) target.journal = [];
        target.journal.push({ time: formatGameTime(this.state.gameDate), msg });
      }
    } else if (action === 'reprimand') {
      msg = REPRIMAND_TEXT.replace(/{name}/g, conc.name).replace(/{target}/g, target ? target.name : '对方');
      journal = `斥责了${conc.name}与${target ? target.name : '对方'}。`;
      if (target) {
        if (!target.journal) target.journal = [];
        target.journal.push({ time: formatGameTime(this.state.gameDate), msg });
      }
    }
    // 告状选项写入对应NPC记事
    if (action === 'enjoy' || action === 'indifferent') {
      if (!conc.journal) conc.journal = [];
      conc.journal.push({ time: formatGameTime(this.state.gameDate), msg });
    }
    if (journal) {
      this.addJournal(journal);
      if (!conc.journal) conc.journal = [];
      conc.journal.push({ time: formatGameTime(this.state.gameDate), msg: journal.replace(/^与妾室/, '与主君') });
    }
    this.state.pendingPlayerEvents = (this.state.pendingPlayerEvents || []).filter(ev => !(ev && ev.type === 'concubine' && ev.concubineId === concubineId));
    return { success: true, msg, journal };
  }

  // 转月子嗣记事/未接回府弹窗/妻妾弹窗/未成年活动地点
  monthlyChildEvents() {
    const key = (this.state.gameDate ? this.state.gameDate.year + '-' + this.state.gameDate.month : 'x');
    if (this.state._childEventsMonth === key) return;
    this.state._childEventsMonth = key;
    const player = this.state.player;
    if (!this.state.pendingPlayerEvents) this.state.pendingPlayerEvents = [];
    const m = player.mansion;
    const inHouse = (kid) => m && (m.children || []).includes(kid.id) || m && ((m.leftWing || []).includes(kid.id) || (m.rightWing || []).includes(kid.id));
    const myKids = this.state.npcs.filter(n => n.family && (n.family.father === player.id || n.family.mother === player.id));
    const locPool = [...new Set(this.state.npcs.map(n => n.location).filter(Boolean))];
    const cs = require('./childSystem');
    // 其他未成年NPC（非主控子嗣）：跟随扶养人；无扶养人则随机游荡
    for (const n of this.state.npcs) {
      if (!n || n.isAlive === false || n.age >= 16) continue;
      const isPlayerKid = n.family && (n.family.father === player.id || n.family.mother === player.id);
      if (isPlayerKid) continue;
      if (n.guardian) {
        const g = this.state.npcs.find(x => x.id === n.guardian);
        if (g && g.isAlive !== false) n.location = g.location;
      } else if (chance(40)) {
        n.location = randChoice(locPool) || n.location;
      }
    }
    for (const kid of myKids) {
      // 未成年活动地点：主控子嗣未成年→大概率宅子；其他→随扶养人；无扶养人→随机
      if (kid.age < 16) {
        if (kid.guardian === player.id || inHouse(kid)) {
          kid.location = player.location;
        } else if (kid.guardian) {
          const g = this.state.npcs.find(n => n.id === kid.guardian);
          if (g) kid.location = g.location;
        } else if (chance(40)) {
          kid.location = randChoice(locPool) || kid.location;
        }
      }
      // 子嗣随机记事
      if (chance(35)) {
        const adopted = kid.guardian === player.id || inHouse(kid);
        const txt = cs.randomChildJournal(kid, player, adopted);
        if (!kid.journal) kid.journal = [];
        kid.journal.push({ time: formatGameTime(this.state.gameDate), msg: txt });
        if (kid.knownByPlayer) this.addLog(`【${kid.name}】${txt}`);
      }
      // 未接回府子嗣 → 概率触发归家/张望/怨恨弹窗（需求13：先检测子嗣存在）
      if (kid.age >= 3 && kid.guardian !== player.id && !inHouse(kid) && chance(18)) {
        const evt = cs.triggerOutcastEvent(player, kid, this.state);
        if (evt) {
          evt.withActions = true;
          evt.childPortrait = kid.portrait || '';
          this.state.pendingPlayerEvents.push({ type: 'child_outcast', ...evt });
        }
      }
    }
    // 妻妾事件（概率触发）
    const concIds = m && m.concubines || [];
    for (const cid of concIds) {
      const conc = this.state.npcs.find(n => n.id === cid);
      if (!conc) continue;
      if (chance(12)) {
        const others = concIds.filter(x => x !== cid).map(x => this.state.npcs.find(n => n.id === x)).filter(Boolean);
        const other = others.length ? randChoice(others) : conc;
        const evt = cs.concubineEvent(player, conc, other, this.state);
        if (evt.type === 'tattle') {
          conc._tattleTargetId = other ? other.id : null;
        }
        evt.withActions = true;
        evt.concubinePortrait = conc.portrait || '';
        this.state.pendingPlayerEvents.push({ type: 'concubine', ...evt });
      }
    }

    // ===== 需求：所有NPC随机剧情库（NPC符合条件概率触发，写入世界记事；主控记事库不含需主动做的剧情）=====
    // ① 看望私生子/看望被遗弃子（NPC视角：有在外子嗣的NPC概率去看望；先判定子嗣NPC存在）
    let visitCount = 0;
    const inPlayerHouse = (k) => m && ((m.children || []).includes(k.id) || (m.leftWing || []).includes(k.id) || (m.rightWing || []).includes(k.id));
    for (const n of this.state.npcs) {
      if (!n || n.id === player.id || n.isAlive === false) continue;
      if (visitCount >= 2) break;
      // 该NPC的外在子嗣（guardian不是它本人、且未被主控接入府）
      const outerKids = this.state.npcs.filter(k => k && k.isAlive !== false && k.age >= 1 && k.family &&
        (k.family.father === n.id || k.family.mother === n.id) && k.guardian !== n.id && !inPlayerHouse(k));
      if (!outerKids.length) continue;
      if (chance(8)) {
        const kid = randChoice(outerKids);
        const abandoned = !kid.guardian;
        const pool = abandoned ? cs.VISIT_ABANDONED : cs.VISIT_BASTARD;
        const txt0 = randChoice(pool).replace(/\{name\}/g, kid.name);
        // 性别指代：爹/娘按看望者性别，他/她按孩子性别
        const txt = genderize(txt0.replace(/爹\/娘/g, n.gender === '女' ? '娘' : '爹'), kid);
        this.addWorldJournal(n.name, `${n.name}前往看望${kid.name}。${txt}`);
        visitCount++;
      }
    }
    // ② 偷奸剧情（NPC之间暗中相会，女性触发怀孕判定；先判定双方NPC存在且已婚、丈夫在世）
    // 分两个方向：男偷女（男方主动，女方为已婚女子）/ 女偷男（女方主动，男方为已婚男子）
    if (chance(15)) {
      const myFamily = player.family || {};
      const protectedIds = [player.id, myFamily.spouse, ...(myFamily.wives || [])].filter(Boolean);
      // 方向A：男偷女——女方已婚（配偶在世），男方为同地点成年男子
      const women = this.state.npcs.filter(w => w && w.isAlive !== false && w.gender === '女' && w.age >= 16 &&
        w.hp && w.hp.current !== undefined && w.family && w.family.spouse && !protectedIds.includes(w.id) &&
        (() => { const h = this.state.npcs.find(x => x && x.id === w.family.spouse); return h && h.isAlive !== false; })());
      if (women.length) {
        const female = randChoice(women);
        const husband = this.state.npcs.find(x => x && x.id === female.family.spouse);
        const men = this.state.npcs.filter(mc => mc && mc.isAlive !== false && mc.gender === '男' && mc.age >= 16 &&
          mc.id !== female.id && mc.id !== female.family.spouse && mc.location === female.location && !protectedIds.includes(mc.id));
        if (husband && men.length) {
          const male = randChoice(men);
          // 男偷女记事（男方视角文案，主控不参与）
          const txt = randChoice(cs.STEAL_LOVE).replace(/\{name\}/g, female.name).replace(/\{husband\}/g, husband.name).replace(/你/g, male.name);
          let pregnant = false;
          if (!female.isPregnant && female.age <= 45) {
            const { tryConceive } = require('./family');
            const tr = tryConceive(male, female, this.state);
            if (tr.success) pregnant = true;
          }
          const tail = pregnant ? ` 事后，${female.name}竟有了身孕！` : '';
          this.addWorldJournal(female.name, `${male.name}与${female.name}暗中相会。${txt}${tail}`);
          const ft = formatGameTime(this.state.gameDate);
          if (!female.personalHistory) female.personalHistory = [];
          female.personalHistory.push(`${ft}·与${male.name}暗中相会。`);
          if (!male.personalHistory) male.personalHistory = [];
          male.personalHistory.push(`${ft}·与${female.name}暗中相会。`);
        }
      }
      // 方向B：女偷男——男方已婚（配偶在世），女方为同地点成年女子
      const men2 = this.state.npcs.filter(m2 => m2 && m2.isAlive !== false && m2.gender === '男' && m2.age >= 16 &&
        m2.hp && m2.hp.current !== undefined && m2.family && m2.family.spouse && !protectedIds.includes(m2.id) &&
        (() => { const w2 = this.state.npcs.find(x => x && x.id === m2.family.spouse); return w2 && w2.isAlive !== false; })());
      if (men2.length) {
        const male2 = randChoice(men2);
        const wife = this.state.npcs.find(x => x && x.id === male2.family.spouse);
        const women2 = this.state.npcs.filter(w2 => w2 && w2.isAlive !== false && w2.gender === '女' && w2.age >= 16 &&
          w2.id !== male2.id && w2.id !== male2.family.spouse && w2.location === male2.location && !protectedIds.includes(w2.id));
        if (wife && women2.length) {
          const female2 = randChoice(women2);
          // 女偷男记事（女方视角文案，主控不参与）
          const txt2 = randChoice(cs.STEAL_LOVE_F).replace(/\{name\}/g, male2.name).replace(/\{husband\}/g, wife.name).replace(/你/g, female2.name);
          let pregnant2 = false;
          if (!female2.isPregnant && female2.age <= 45) {
            const { tryConceive } = require('./family');
            const tr2 = tryConceive(male2, female2, this.state);
            if (tr2.success) pregnant2 = true;
          }
          const tail2 = pregnant2 ? ` 事后，${female2.name}竟有了身孕！` : '';
          this.addWorldJournal(female2.name, `${female2.name}与${male2.name}暗中相会。${txt2}${tail2}`);
          const ft2 = formatGameTime(this.state.gameDate);
          if (!female2.personalHistory) female2.personalHistory = [];
          female2.personalHistory.push(`${ft2}·与${male2.name}暗中相会。`);
          if (!male2.personalHistory) male2.personalHistory = [];
          male2.personalHistory.push(`${ft2}·与${female2.name}暗中相会。`);
        }
      }
    }
  }

  advanceMonth(viewingNpcId) {
    if (viewingNpcId) this.state.viewingNpcId = viewingNpcId;
    const startMonth = this.state.gameDate.month;
    let safety = 100; // 安全限制
    while (this.state.gameDate.month === startMonth && safety > 0) {
      this.consumeAP(1);
      safety--;
    }
    this.addLog(`时间流转至${this.state.gameDate.year}年${this.state.gameDate.month}月。`);
    // 拍卖行结算（到期成交）：未开张则先初始化，保证世界拍卖持续运转
    if (!this.state.auction || !this.state.auction.items) getAuction(this.state);
    const settled = settleAuctions(this.state);
    for (const s2 of settled) {
      this.addLog(`拍卖行：${s2.note || `【${s2.itemName}】以${s2.price}成交（${s2.bidder}）。`}`);
      this.addWorldJournal('拍卖行', s2.note || `【${s2.itemName}】以${s2.price}成交（${s2.bidder}）。`);
    }
    this.notifyDeaths();
    this.monthlyChildEvents();
    this.state.viewingNpcId = null;
    return this.getPublicState();
  }

  // 转年 - 推进到下一年
  advanceYear(viewingNpcId) {
    if (viewingNpcId) this.state.viewingNpcId = viewingNpcId;
    const startYear = this.state.gameDate.year;
    let safety = 1200; // 安全限制（1年约108AP）
    while (this.state.gameDate.year === startYear && safety > 0) {
      this.consumeAP(1);
      safety--;
    }
    this.addLog(`时光荏苒，已是${this.state.gameDate.year}年。`);
    // 转年同样结算拍卖行（NPC竞拍 + 竞拍记事）
    if (!this.state.auction || !this.state.auction.items) getAuction(this.state);
    const settledY = settleAuctions(this.state);
    for (const s2 of settledY) {
      this.addLog(`拍卖行：${s2.note || `【${s2.itemName}】以${s2.price}成交（${s2.bidder}）。`}`);
      this.addWorldJournal('拍卖行', s2.note || `【${s2.itemName}】以${s2.price}成交（${s2.bidder}）。`);
    }
    this.notifyDeaths();
    this.state.viewingNpcId = null;
    return this.getPublicState();
  }

  // 随机事件触发
  maybeTriggerEvent() {
    const p = this.state.player;
    let probability = 15;
    probability += p.attributes.fateLuck * 0.2;
    if (p.karma.sin >= 50) probability += 3;
    const loc = LOCATIONS[p.location];
    if (loc?.zone === '魔界') probability += 15;
    if (loc?.zone === '凡人界' && ['大夏皇都', '清风镇'].includes(p.location)) probability -= 5;
    probability = clamp(probability, 5, 40);

    if (chance(probability)) {
      const context = {
        location: p.location, age: p.age, realmLevel: p.realmLevel,
        faction: p.faction, profession: p.profession,
        karma: p.karma.merit - p.karma.sin,
        reputation: p.reputation, spiritStone: p.spiritStone,
        fateLuck: p.attributes.fateLuck,
        hasResidence: !!p.residence, hasSpouse: !!p.family.spouse,
        hasPet: false, hasEnemy: false,
      };
      const event = pickAnyRandomEvent(context);
      if (event && event.options && event.options.length > 0) {
        // 支持事件文案按主控性别动态化（desc/options.result/options.text/journal 可为函数）
        // 用副本解析，避免污染模块级事件对象导致跨存档性别串版
        const pg = this.state.player;
        const ev = { ...event, options: (event.options || []).map(o => ({ ...o })) };
        if (typeof ev.desc === 'function') ev.desc = ev.desc(pg);
        for (const op of ev.options) {
          if (op.text && typeof op.text === 'function') op.text = op.text(pg);
          if (op.result && typeof op.result === 'function') op.result = op.result(pg);
        }
        if (ev.journal && typeof ev.journal === 'function') ev.journal = ev.journal(pg);
        this.state.eventState = { event: ev, context };
        this.addLog(`【随机事件·${EVENT_CATEGORIES[Object.keys(EVENT_CATEGORIES).find(k => require('../data/events').EVENTS[k]?.includes(event))] || '未知'}】${event.title}`);
      }
    }
  }

  // 处理事件选项
  resolveEvent(optionIndex) {
    if (!this.state.eventState) return { error: '没有待处理事件' };
    const { event } = this.state.eventState;
    const option = event.options[optionIndex];
    if (!option) return { error: '无效选项' };

    this.addLog(`你选择了：${option.text}`);
    if (option.result) this.addLog(option.result);

    // 应用效果
    if (option.effects) {
      this.applyEffects(option.effects);
    }

    // 记事
    if (event.journal) {
      this.addJournal(event.journal.replace('{name}', this.state.player.name));
    }

    this.state.eventState = null;
    return this.getPublicState();
  }

  applyEffects(effects) {
    const p = this.state.player;
    if (effects.spiritStone) p.spiritStone = Math.max(0, p.spiritStone + effects.spiritStone);
    if (effects.contribution) p.contribution += effects.contribution;
    if (effects.reputation) p.reputation += effects.reputation;
    if (effects.karma) {
      if (effects.karma > 0) p.karma.merit += effects.karma;
      else p.karma.sin -= effects.karma;
    }
    if (effects.exp) p.cultivationExp += effects.exp;
    if (effects.hp) p.hp.current = clamp(p.hp.current + effects.hp, 0, p.hp.max);
    if (effects.mp) p.mp.current = clamp(p.mp.current + effects.mp, 0, p.mp.max);
    if (effects.favor) {
      // 对当前交互NPC的好感变化
    }
    if (effects.item) {
      const existing = p.inventory.find(i => i.name === effects.item);
      if (existing) existing.count += 1;
      else p.inventory.push({ name: effects.item, count: 1 });
    }
    if (effects.buff) {
      if (!p.statusEffects) p.statusEffects = [];
      p.statusEffects.push({ name: effects.buff, turns: 10 });
    }
    if (effects.debuff) {
      if (!p.statusEffects) p.statusEffects = [];
      p.statusEffects.push({ name: effects.debuff, turns: 5 });
    }
  }

  // 移动到地点
  moveTo(locationName) {
    if (!LOCATIONS[locationName]) return { error: '地点不存在' };
    const p = this.state.player;
    const currentLoc = LOCATIONS[p.location];
    const targetLoc = LOCATIONS[locationName];

    // 检查准入条件
    if (targetLoc.require) {
      const req = targetLoc.require;
      if (req.realm && p.realmLevel < req.realm) return { error: `需要${REALMS[req.realm - 1].name}以上` };
      if (req.item && !p.inventory.some(i => i.name === req.item)) return { error: `需要${req.item}` };
      if (req.qingyun) {
        const isDisciple = p.sect && p.sect.name === '青云剑宗';
        if (!isDisciple && (p.reputation || 0) < 200) return { error: '青云剑宗山门紧闭：须为剑宗弟子，或声望达到200方可入内' };
      }
    }

    const cost = currentLoc.zone === targetLoc.zone ? AP_COSTS.move_same_zone : AP_COSTS.move_cross_zone;
    const fromLoc = p.location;
    p.location = locationName;
    updateStat(p, 'locationsVisited', locationName);
    // 需求[40]：大地图进入地点不消耗行动点（仅移动，不推进时间）
    this.addLog(`你来到了${locationName}。`);

    // 任务 travel 进度（普通任务 + 季度任务）
    updateQuestProgress(p, 'travel', { from: fromLoc, to: locationName });
    updateQuarterlyProgress(this.state, 'travel', { location: locationName });

    // 已认识NPC判定：只有交互过的NPC才算已认识，进入地点不自动结识
    return this.getPublicState();
  }

  // 修炼
  cultivate(type) {
    const p = this.state.player;
    const loc = LOCATIONS[p.location];
    let expGain = p.attributes.enlightenment * 2 + (p.spiritRoot?.purity || 50);

    // 灵根类型加成
    if (p.spiritRoot?.type && SPIRIT_ROOTS[p.spiritRoot.type]) {
      expGain *= SPIRIT_ROOTS[p.spiritRoot.type].cultivateBonus || 1;
    }
    // 灵根纯度加成
    const qyBuffs = getQingyunBuffs(p);
    if (qyBuffs.cultivate) expGain = Math.floor(expGain * (1 + qyBuffs.cultivate));
    if (qyBuffs.enlightenment) expGain += qyBuffs.enlightenment * 2;
    if (p.spiritRoot?.purity) {
      const purityLevel = ROOT_PURITY_LEVELS.find(l => p.spiritRoot.purity >= l.min && p.spiritRoot.purity <= l.max);
      if (purityLevel) expGain *= purityLevel.bonus;
    }

    // 季节加成
    if (this.state.weather?.season) {
      const { SEASONS } = require('./weather');
      const season = SEASONS.find(s => s.name === this.state.weather.season);
      if (season) expGain *= season.expBonus || 1;
    }
    // 天气加成
    if (this.state.weather?.weather?.expBonus) {
      expGain *= this.state.weather.weather.expBonus;
    }

    let msg = '你闭关修炼';

    // 特殊修炼地点加成
    const specialBonus = {
      '龙脉': { mult: 3, msg: '你吸收龙脉之气，修为大涨' },
      '参悟碑文': { mult: 2.5, msg: '你参悟古碑文字，悟性大开' },
      '灵泉修炼': { mult: 2, msg: '你在灵泉中修炼，灵气充沛' },
      '洗剑': { mult: 1.5, msg: '你在洗剑池中淬炼剑意' },
      '祭坛祈福': { mult: 1.8, msg: '你在古树祭坛下祈福，获得古树祝福' },
      '推演残阵': { mult: 2, msg: '你推演上古残阵，阵道修为提升' },
      '参悟镇碑': { mult: 2.5, msg: '你参悟镇碑，感悟天地法则' },
      '罡风淬体': { mult: 1.5, msg: '你以罡风淬体，肉身更加强健', physique: 5 },
      '风眼悟道': { mult: 2.5, msg: '你在风眼中悟道，风系感悟加深' },
      '星辰灌体': { mult: 3, msg: '你引星辰之力灌体，脱胎换骨', spirit: 5 },
    };

    if (type && specialBonus[type]) {
      expGain *= specialBonus[type].mult;
      msg = specialBonus[type].msg;
      if (specialBonus[type].physique) p.attributes.physique += specialBonus[type].physique;
      if (specialBonus[type].spirit) p.attributes.spirit += specialBonus[type].spirit;
    } else if (loc?.functions?.includes('灵田矿脉') || p.location === '洞天福地') {
      expGain *= 1.5;
    }
    if (p.statusEffects?.some(s => s.name === '聚灵·灵韵')) expGain *= 1.2;

    // 功法栏加成（已装备功法影响修炼速度）
    const techBuff = getTechniqueBuffs(p);
    if (techBuff.cultivate) expGain *= (1 + techBuff.cultivate);

    // 标签效果：修炼速度加成（如 天生道体 +5% 修炼速度）
    if (p.cultivationSpeed) expGain *= (1 + p.cultivationSpeed / 100);

    p.cultivationExp += Math.floor(expGain);
    this.consumeAP(AP_COSTS.cultivate);
    this.addLog(`${msg}，获得${Math.floor(expGain)}修为。`);
    this.addJournal(`${msg}，获得${Math.floor(expGain)}修为。`);
    updateQuestProgress(p, 'cultivate');
    updateQuarterlyProgress(this.state, 'cultivate');

    if (p.cultivationExp >= p.breakthroughExp) {
      const stageIdx = SUB_STAGES.indexOf(p.subStage || '前期');
      const chance = calcBreakthroughChance(p, stageIdx >= 2 ? p.realmLevel + 1 : p.realmLevel);
      this.addLog(`修为已满，突破成功率${chance}%。`);
    }

    return { state: this.getPublicState(), event: { text: `${msg}，获得${Math.floor(expGain)}修为。`, cultivationExp: Math.floor(expGain) } };
  }

  // ===== 拍卖行 =====
  getAuction() {
    return getAuction(this.state);
  }

  bidAuction(auctionId, price) {
    const result = bidAuction(this.state, this.state.player, auctionId, price);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·拍卖行·${result.msg}`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // ===== 符箓系统（阵法师协会）=====
  getTalismanInfo() {
    const p = this.state.player;
    initTalisman(p);
    return {
      level: getTalismanLevel(p),
      exp: p.talisman.exp,
      learned: p.talisman.learned,
      shop: getTalismanShop(this.state),
    };
  }

  learnTalisman(talismanId) {
    const p = this.state.player;
    const result = learnTalisman(p, talismanId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·阵法师协会·${result.msg}`);
      this.checkCultivationProfessions(); // 学会符箓 → 符师
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  craftTalisman(talismanId) {
    const p = this.state.player;
    const result = craftTalisman(p, talismanId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·制符·${result.msg}`);
      p.talisman.craftCount = (p.talisman.craftCount || 0) + 1; // 制符次数（符修职业条件）
      this.checkCultivationProfessions();
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  buyTalisman(talismanId) {
    const p = this.state.player;
    const result = buyTalisman(this.state, p, talismanId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·阵法师协会·${result.msg}`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // 送货上门：在东海渔村交付铁器（季度任务 q_easy_02）
  deliverGoods() {
    const p = this.state.player;
    if (p.location !== '东海渔村') return { error: '你不在东海渔村' };
    const active = (this.state.quarterlyQuests?.active || []).find(q => q.id === 'q_easy_02' && !q.completed);
    if (!active) return { error: '当前没有送货上门的任务' };
    const done = updateQuarterlyProgress(this.state, 'deliver', { location: '东海渔村' });
    const quest = (this.state.quarterlyQuests?.active || []).find(q => q.id === 'q_easy_02');
    if (quest && quest.completed) {
      this.addLog(`你到铁匠铺领取了铁器，送到了东海渔村，任务完成！`);
      this.addJournal(`完成季度任务：送货上门。`);
      return { success: true, msg: '你到铁匠铺领取了铁器，送到东海渔村，任务已完成！', state: this.getPublicState() };
    }
    return { error: '送货尚未完成（任务进度异常）' };
  }

  // 突破
  breakthrough() {
    const p = this.state.player;
    // hp/mp 结构防御：兼容数字/NaN（旧档/NPC转主控后可能为数字，防止在数字上建属性崩溃）
    if (!p.hp || typeof p.hp === 'number' || isNaN(p.hp)) { const v = typeof p.hp === 'number' && !isNaN(p.hp) ? p.hp : 100; p.hp = { current: v, max: v }; }
    if (!p.mp || typeof p.mp === 'number' || isNaN(p.mp)) { const v = typeof p.mp === 'number' && !isNaN(p.mp) ? p.mp : 50; p.mp = { current: v, max: v }; }
    if (p.realmLevel >= 10) return { error: '已达最高境界' };

    // 小层化：每境前期→中期→后期→下一境前期，各有修为要求，不可跳跃
    const stageIdx = SUB_STAGES.indexOf(p.subStage || '前期');
    const need = calcStageExpNeed(p.realmLevel, stageIdx);
    if (p.cultivationExp < need) return { error: `修为不足（当前${p.cultivationExp}/${need}），请先继续修炼` };

    const chance0 = calcBreakthroughChance(p, stageIdx >= 2 ? p.realmLevel + 1 : p.realmLevel);
    // 功法栏突破加成（如清心诀+15%）
    const chance = Math.min(100, chance0 + (getTechniqueBuffs(p).breakthrough || 0));
    this.consumeAP(1);
    let success = false;

    if (Math.random() * 100 < chance) {
      success = true;
      if (stageIdx < 2) {
        // 同境小层晋升
        p.subStage = SUB_STAGES[stageIdx + 1];
        p.breakthroughExp = calcStageExpNeed(p.realmLevel, stageIdx + 1);
        // 需求：气血/灵力上限随境界（含小层）提高而增加
        const growHp = Math.floor((p.attributes?.constitution || 50) * 0.6 + (p.realmLevel || 1) * 2 + 10);
        const growMp = Math.floor((p.attributes?.spirit || 50) * 0.5 + (p.realmLevel || 1) * 2 + 10);
        if (p.hp) { p.hp.max = (p.hp.max || 100) + growHp; p.hp.current = p.hp.max; }
        if (p.mp) { p.mp.max = (p.mp.max || 50) + growMp; p.mp.current = p.mp.max; }
        this.addLog(`恭喜！你突破至${p.realm}·${p.subStage}！气血上限+${growHp}，灵力上限+${growMp}。`);
        this.addJournal(`突破至${p.realm}·${p.subStage}。`);
      } else {
        // 境界突破：后期→下一境前期
        const oldRealm = p.realm;
        p.realmLevel++;
        p.realm = REALMS[p.realmLevel - 1].name;
        p.subStage = '前期';
        p.cultivationExp = 0;
        p.breakthroughExp = calcStageExpNeed(p.realmLevel, 0);
        p.lifespan = REALMS[p.realmLevel - 1].lifespan;
        // 更新战斗属性
        const newStats = require('./npcGenerator').calcCombatStats(p.attributes, p.realmLevel);
        p.combatStats = newStats;
        p.hp.max = newStats.hp;
        p.hp.current = newStats.hp;
        p.mp.max = newStats.mp;
        p.mp.current = newStats.mp;
        // 需求：修为突破至凡人境以上 → 身份自动变为修仙者并自动随机对应修仙职业
        if (p.realmLevel >= 2 && p.identity !== '修仙者') {
          const oldIdentity = p.identity || '凡人';
          p.identity = '修仙者';
          const { CULTIVATION_PROFESSIONS } = require('../data/races');
          const cultNames = Object.keys(CULTIVATION_PROFESSIONS);
          const newProf = cultNames.length ? cultNames[Math.floor(Math.random() * cultNames.length)] : '散修';
          const { addCultivationProfession } = require('./workSystem');
          addCultivationProfession(p, newProf);
          this.addLog(`你突破至${p.realm}，身份由${oldIdentity}变为修仙者，踏上修仙之途，自动获得【${newProf}】身份！`);
          this.addJournal(`突破至${p.realm}，身份由${oldIdentity}变为修仙者，获得【${newProf}】职业。`);
        }
        this.addLog(`恭喜！你突破至${p.realm}·${p.subStage}！`);
        this.addJournal(`突破至${p.realm}·${p.subStage}。`);
      }
      updateQuestProgress(p, 'reachRealm', { realm: p.realmLevel });
      updateQuarterlyProgress(this.state, 'reachRealm', { realm: p.realmLevel });
      // 突破成功后清除突破类丹药状态
      p.statusEffects = (p.statusEffects || []).filter(sf => !String(sf.name).includes('丹效'));
      this.checkCultivationProfessions(); // 属性/境界提升可能满足体修等职业条件
    } else {
      p.cultivationExp = Math.floor(p.cultivationExp * 0.7);
      if (!p.statusEffects) p.statusEffects = [];
      p.statusEffects.push({ name: '虚弱', turns: 3 });
      this.addLog(`突破失败，修为倒退，陷入虚弱。`);
      this.addJournal(`突破${p.realm}·${p.subStage || '前期'}失败。`);
    }

    return { success, chance, state: this.getPublicState() };
  }

  // 探索
  explore(type, extra) {
    const p = this.state.player;
    const loc = LOCATIONS[p.location];
    this.consumeAP(AP_COSTS.explore);
    updateStat(p, 'exploreCount', 1); // 探索次数（冒险者职业条件）
    this.checkCultivationProfessions();

    // 赌坊
    if (type === 'gamble') {
      const amount = Math.min(Math.max(extra?.amount || 100, 10), 1000);
      if (p.silver < amount) return { error: '银两不足' };
      p.silver -= amount;
      const win = Math.random() < 0.45;
      if (win) {
        const winAmount = Math.floor(amount * (1.5 + Math.random()));
        p.silver += winAmount;
        this.addLog(`你在赌坊下注${amount}银两，赢了${winAmount}银两！`);
        this.addJournal(`在赌坊下注${amount}银两，赢了${winAmount}银两。`);
        return { state: this.getPublicState(), event: { text: `你在赌坊下注${amount}银两，手气不错，赢了${winAmount}银两！净赚${winAmount - amount}银两。` } };
      } else {
        this.addLog(`你在赌坊下注${amount}银两，输了个精光。`);
        this.addJournal(`在赌坊下注${amount}银两，输了个精光。`);
        return { state: this.getPublicState(), event: { text: `你在赌坊下注${amount}银两，可惜手气不佳，输了${amount}银两。` } };
      }
    }

    // 采集类
    const gatherTypes = {
      '采集': { items: ['聚灵草', '灵谷', '野山参', '铁矿石'], msg: '你在采集区采集' },
      '狩猎': { items: ['兽皮', '野味', '妖兽内丹', '鹿角'], msg: '你在猎场狩猎' },
      '探索沼泽': { items: ['沼泽毒菇', '泥莲藕', '瘴气结晶'], msg: '你在迷瘴沼泽中探索', danger: true },
      '出海': { items: ['海灵珠', '珊瑚', '深海鱼', '贝壳'], msg: '你乘船出海', danger: true },
      '探索皇陵': { items: ['古墓明器', '残破玉简', '龙脉石'], msg: '你在皇陵迷宫中探索', danger: true },
      '采集毒草': { items: ['毒草', '断肠草', '蝎尾花', '毒蟾酥'], msg: '你在毒瘴中采集毒草', debuff: '中毒' },
      '采矿': { items: ['铁矿石', '铜矿石', '灵晶石', '玄铁'], msg: '你在矿脉中采矿' },
      '探索骸骨': { items: ['残破法器', '古修玉简'], msg: '你搜索古修骸骨', danger: true },
      '采药': { items: ['百年灵芝', '千年人参', '雪莲', '何首乌'], msg: '你在药王园采药' },
    };

    if (type && gatherTypes[type]) {
      const g = gatherTypes[type];
      const item = randChoice(g.items);
      const count = randInt(1, 3);
      const exp = randInt(15, 40);

      const existing = p.inventory.find(i => i.name === item);
      if (existing) existing.count += count;
      else p.inventory.push({ name: item, count });

      p.cultivationExp += exp;
      this.addLog(`${g.msg}，获得${item}×${count}，修为+${exp}。`);
      this.addJournal(`${g.msg}，获得${item}×${count}。`);
      updateQuestProgress(p, 'collect', { item });
      updateQuarterlyProgress(this.state, 'collect', { item });

      if (g.danger && Math.random() < 0.3) {
        return this.startCombat('妖兽');
      }
      if (g.debuff) {
        if (!p.statusEffects) p.statusEffects = [];
        p.statusEffects.push({ name: g.debuff, turns: 3 });
      }

      return { state: this.getPublicState(), event: { text: `${g.msg}，仔细搜寻后获得了【${item}】×${count}，同时积累了${exp}点修为经验。` } };
    }

    // 默认探索 - 从物品获取系统中根据地点获取
    const { getRandomItemAtLocation, getItemsAtLocation } = require('../data/itemSources');
    const locationItems = getItemsAtLocation(p.location);

    // 30%概率什么都没发现
    if (Math.random() < 0.3 || locationItems.length === 0) {
      const exp = randInt(10, 30);
      p.cultivationExp += exp;
      this.addLog(`你在${p.location}四处探索，没有发现什么特别的东西，只积累了一些经验。`);
      this.addJournal(`${this.state.gameDateText}·${p.location}·探索，未发现特殊物品，修为+${exp}。`);
      updateQuestProgress(p, 'explore', { location: p.location });
      updateQuarterlyProgress(this.state, 'explore', { location: p.location });
      return { state: this.getPublicState(), event: { text: `你在${p.location}四处探索了一番，没有发现什么特别的东西，但积累了${exp}点修为经验。` } };
    }

    // 从地点可获取物品中随机选择
    const randomResult = getRandomItemAtLocation(p.location);
    if (randomResult) {
      const { item, count, method } = randomResult;
      const exp = randInt(15, 50);

      const existing = p.inventory.find(i => i.name === item);
      if (existing) existing.count += count;
      else p.inventory.push({ name: item, count });

      p.cultivationExp += exp;
      this.addLog(`你在${p.location}${method}，获得${item}×${count}，修为+${exp}。`);
      this.addJournal(`${this.state.gameDateText}·${p.location}·${method}，获得${item}×${count}。`);
      updateQuestProgress(p, 'collect', { item });
      updateQuestProgress(p, 'explore', { location: p.location });
      updateQuarterlyProgress(this.state, 'collect', { item });
      updateQuarterlyProgress(this.state, 'explore', { location: p.location });

      // 危险地点有概率遇到妖兽
      if (loc?.danger >= 3 && Math.random() < 0.25) {
        return this.startCombat('妖兽');
      }

      return { state: this.getPublicState(), event: { text: `你在${p.location}进行${method}，仔细搜寻后获得了【${item}】×${count}，同时积累了${exp}点修为经验。` } };
    }

    // 兜底
    const exp = randInt(10, 30);
    p.cultivationExp += exp;
    this.addLog(`你在${p.location}四处探索，没有发现什么特别的东西。`);
    updateQuestProgress(p, 'explore', { location: p.location });
    updateQuarterlyProgress(this.state, 'explore', { location: p.location });
    return { state: this.getPublicState(), event: { text: `你在${p.location}四处探索了一番，没有发现什么特别的东西。` } };
  }

  // 休息
  rest() {
    const p = this.state.player;
    // hp/mp 结构防御：兼容数字/NaN（旧档/NPC转主控后可能为数字，防止在数字上建属性崩溃）
    if (!p.hp || typeof p.hp === 'number' || isNaN(p.hp)) { const v = typeof p.hp === 'number' && !isNaN(p.hp) ? p.hp : 100; p.hp = { current: v, max: v }; }
    if (!p.mp || typeof p.mp === 'number' || isNaN(p.mp)) { const v = typeof p.mp === 'number' && !isNaN(p.mp) ? p.mp : 50; p.mp = { current: v, max: v }; }
    p.hp.current = Math.min(p.hp.max, p.hp.current + Math.floor(p.hp.max * 0.2));
    p.mp.current = Math.min(p.mp.max, p.mp.current + Math.floor(p.mp.max * 0.2));
    this.consumeAP(AP_COSTS.rest);
    this.addLog('你休息了一会儿，恢复了状态。');
    return { state: this.getPublicState() };
  }

  // 与NPC交互
  interactWithNPC(npcId, action) {
    updateQuestProgress(this.state.player, 'interact');
    updateQuarterlyProgress(this.state, 'interact');

    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc || !npc.isAlive) return { error: 'NPC不存在或已死亡' };

    if (!npc.knownByPlayer) {
      npc.knownByPlayer = true;
      if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);
    }

    switch (action) {
      case 'chat': {
        const favorGain = randInt(2, 8);
        npc.favorWithPlayer += favorGain;
        this.consumeAP(0); // 普通对话不消耗AP
        this.addLog(`你与${npc.name}闲聊了一会儿，好感+${favorGain}。`);
        break;
      }
      case 'gift': {
        // 简化：消耗100灵石送礼
        if (p.spiritStone < 100) return { error: '灵石不足' };
        p.spiritStone -= 100;
        npc.favorWithPlayer += randInt(10, 30);
        this.consumeAP(AP_COSTS.interact_deep);
        this.addLog(`你赠送${npc.name}礼物，好感提升。`);
        break;
      }
      case 'duel': {
        this.consumeAP(AP_COSTS.interact_deep);
        return this.startCombat(npc);
      }
      case 'trade': {
        this.consumeAP(0);
        this.addLog(`你与${npc.name}交易。`);
        break;
      }
      case 'dualCultivate': {
        if (npc.favorWithPlayer < 400 || npc.age < 16) return { error: '好感不足或对方未成年' };
        p.cultivationExp += 500;
        npc.cultivationExp += 500;
        this.consumeAP(AP_COSTS.interact_deep);
        this.addLog(`你与${npc.name}双修，修为共同精进。`);
        // 弹窗剧情记录到涉及NPC记事
        if (!npc.personalHistory) npc.personalHistory = [];
        npc.personalHistory.push(`${this.state.gameDateText}·与${p.name}双修。`);
        // 受孕判定
        if (p.gender !== npc.gender) {
          const male = p.gender === '男' ? p : npc;
          const female = p.gender === '女' ? p : npc;
          const result = tryConceive(male, female, this.state);
          if (result.success) {
            this.addLog(`${female.name}怀孕了！`);
            if (female.id === p.id) {
              this.addJournal(`你怀孕了。`);
              // 需求[9]：主控怀孕弹窗提示
              this.state.pendingPlayerEvents.push({
                type: 'pregnant',
                name: '身怀六甲',
                desc: `你与${npc.name}双修后有了身孕，从此腹中多了一条小生命。`,
                lines: ['孕期约十个月，转月时会出现各种孕期事件，生产时请做好准备。'],
              });
            } else {
              this.addWorldJournal(female.name, `${female.name}怀孕。`);
            }
          }
        }
        break;
      }
      default:
        return { error: '未知交互' };
    }

    return this.getPublicState();
  }

  // 开始战斗
  startCombat(enemy) {
    let enemyNPC;
    if (typeof enemy === 'string') {
      // 生成妖兽
      enemyNPC = generateNPC({ race: '妖族', location: this.state.player.location, realmLevel: clamp(this.state.player.realmLevel + randInt(-1, 1), 1, 10) });
      enemyNPC.name = randChoice(['野狼', '黑熊', '毒蛇', '妖虎', '灵狐', '血蟒']);
    } else {
      enemyNPC = enemy;
    }

    this.state.combatState = {
      enemy: enemyNPC,
      round: 1,
      log: [`遭遇${enemyNPC.name}！战斗开始！`],
      playerTurn: true,
    };
    this.addLog(`遭遇${enemyNPC.name}，战斗开始！`);
    return this.getPublicState();
  }

  // 战斗回合
  combatRound(actionType, skillName = null, itemName = null) {
    if (!this.state.combatState) return { error: '没有进行中的战斗' };
    const { player } = this.state;
    const enemy = this.state.combatState.enemy;

    const playerAction = { type: actionType, skill: skillName, item: itemName };
    const result = executeCombatRound(player, enemy, playerAction, null);

    this.state.combatState.log.push(...result.log);
    this.state.combatState.round++;

    if (result.fled) {
      this.addLog('你逃离了战斗。');
      this.state.combatState = null;
      return this.getPublicState();
    }

    if (result.result === 'victory') {
      const rewards = calcCombatRewards(player, enemy);
      player.cultivationExp += rewards.exp;
      player.spiritStone += rewards.spiritStone;
      updateStat(player, 'combatWin', 1);
      for (const drop of rewards.drops) {
        const existing = player.inventory.find(i => i.name === drop.name);
        if (existing) existing.count += drop.count;
        else player.inventory.push(drop);
      }
      this.state.combatState.log.push(`战斗胜利！获得${rewards.exp}修为，${rewards.spiritStone}灵石。`);
      this.addLog(`战斗胜利！击败${enemy.name}，获得${rewards.exp}修为。`);
      this.addJournal(`击败${enemy.name}。`);
      this.state.combatState = null;
      this.checkCultivationProfessions();
    } else if (result.result === 'defeat') {
      this.state.combatState.log.push('你被击败了...');
      this.addLog(`你被${enemy.name}击败，重伤倒地。`);
      player.hp.current = 1;
      this.state.combatState = null;
    }

    return this.getPublicState();
  }

  // 获取地点列表
  getLocations() {
    return LOCATIONS;
  }

  // 获取当前地点的NPC
  getLocalNPCs() {
    return this.state.npcs.filter(n => n.location === this.state.player.location && n.isAlive);
  }

  // 保存游戏
  save(slot) {
    // 手动保存（带slot）：用指定档覆盖；自动保存（无slot）：saveCode > currentSlot
    if (slot) {
      this.currentSlot = slot;
    } else if (this.state && this.state.saveCode) {
      slot = this.state.saveCode;
      this.currentSlot = slot;
    } else if (this.currentSlot) {
      slot = this.currentSlot;
    }
    return JSON.stringify(this.state);
  }

  // 加载游戏
  load(data, slot) {
    this.state = JSON.parse(data);
    // 旧档迁移：补全 NPC 缺失字段，避免转月/世界事件读取空值崩溃
    if (this.state && Array.isArray(this.state.npcs)) {
      // 清洗历史记事中的重复日期前缀（旧bug："1年9月上旬：1年9月上旬·xxx" → "1年9月上旬·xxx"）
      const cleanDupPrefix = (m) => {
        const msg = (typeof m === 'string') ? m : (m && m.msg);
        if (typeof msg === 'string' && /^\d+年\d+月[上下中]旬：\d+年\d+月[上下中]旬·/.test(msg)) {
          const fixed = msg.replace(/^(\d+年\d+月[上下中]旬)：\1·/, '$1·');
          return typeof m === 'string' ? fixed : { ...m, msg: fixed };
        }
        return m;
      };
      for (const n of this.state.npcs) {
        if (!n) continue;
        if (!n.hp || typeof n.hp === 'number' || isNaN(n.hp)) { const v = typeof n.hp === 'number' && !isNaN(n.hp) ? n.hp : 50; n.hp = { current: v, max: v }; }
        if (!n.mp || typeof n.mp === 'number' || isNaN(n.mp)) { const v = typeof n.mp === 'number' && !isNaN(n.mp) ? n.mp : 50; n.mp = { current: v, max: v }; }
        if (!n.attributes) n.attributes = {};
        const ATTR_KEYS = ['enlightenment', 'spirit', 'physique', 'agility', 'fateLuck', 'charm', 'comprehension'];
        for (const k of ATTR_KEYS) if (typeof n.attributes[k] !== 'number') n.attributes[k] = 0;
        if (typeof n.cultivationExp !== 'number') n.cultivationExp = 0;
        if (!Array.isArray(n.history)) n.history = [];
        if (Array.isArray(n.personalHistory)) n.personalHistory = n.personalHistory.map(cleanDupPrefix);
        if (Array.isArray(n.journal)) n.journal = n.journal.map(cleanDupPrefix);
        // 男性 NPC 不应有怀孕状态（旧档脏数据清洗）
        if (n.gender !== '女') {
          delete n.isPregnant;
          delete n.pregnancyMonths;
          delete n.pregnancyFather;
        }
        // 新生儿（0岁）默认不认识主控：清除脏 knownByPlayer（主控亲子女除外）
        if (n.age === 0 && n.knownByPlayer) {
          const pId = this.state.player?.id;
          const isPlayerKid = n.family && (n.family.father === pId || n.family.mother === pId);
          if (!isPlayerKid) delete n.knownByPlayer;
        }
        // 扶养人迁移：主控子嗣默认主控抚养；其他子嗣默认生母（需求：扶养人属性）
        if (n.family && (n.family.father || n.family.mother) && n.guardian === undefined) {
          const pId2 = this.state.player?.id;
          const isPlayerKid = n.family && (n.family.father === pId2 || n.family.mother === pId2);
          if (isPlayerKid) {
            n.guardian = pId2;
            n.guardianName = this.state.player?.name;
          } else {
            n.guardian = n.family.mother || n.family.father || null;
            const g = n.guardian ? this.state.npcs.find(x => x.id === n.guardian) : null;
            n.guardianName = g ? g.name : null;
          }
        }
        // 小层化迁移：补齐 subStage（默认前期），breakthroughExp 重算为当前小层需求
        if (typeof n.realmLevel !== 'number' || n.realmLevel < 1 || n.realmLevel > 10) n.realmLevel = 1;
        if (!n.subStage || !SUB_STAGES.includes(n.subStage)) n.subStage = '前期';
        if (!n.realm) n.realm = REALMS[n.realmLevel - 1]?.name || '凡人境';
        n.breakthroughExp = calcStageExpNeed(n.realmLevel, SUB_STAGES.indexOf(n.subStage));
        // 身份迁移：旧档NPC无身份或身份非四类 → 按皇室/官职/修为/职业补身份（需求：统一身份库）
        if (!n.identity || !['皇族', '官员', '平民', '修仙者'].includes(n.identity)) {
          n.identity = (n.isRoyal || n.isEmperor || n.isEmpress || n.isConsort) ? '皇族'
            : (n.isOfficial ? '官员'
              : (n.realmLevel >= 2 ? '修仙者'
                : (['官员', '捕快', '将领', '士兵', '仵作'].includes(n.profession) ? '官员' : '平民')));
        }
        // 官员/平民身份修为归凡人境（需求：非修仙者身份→修为=凡人境；皇族血统豁免）
        if ((n.identity === '官员' || n.identity === '平民') && n.realmLevel > 1) {
          n.realmLevel = 1;
          n.realm = '凡人境';
          delete n.subStage;
          if (n.publicInfo) n.publicInfo.realm = '凡人境';
        }
        // 修仙者身份但仍是凡人职业 → 自动随机转修仙职业（需求：身份与职业匹配；朝廷官员/皇室豁免）
        if (n.identity === '修仙者' && n.profession && !n.isOfficial && !n.isRoyal && !n.isEmperor && !n.isEmpress && !n.isConsort) {
          const { MORTAL_PROFESSIONS: MP, getIdentityProfessionPool: GIPP } = require('../data/races');
          if (MP[n.profession]) {
            const pool = GIPP('修仙者', n.realmLevel, n.gender);
            const newProf = pool.length ? pool[Math.floor(Math.random() * pool.length)] : '散修';
            n.profession = newProf;
            const cdef = require('../data/races').CULTIVATION_PROFESSIONS[newProf];
            if (cdef && cdef.levels) {
              n.professionLevel = 0;
              n.professionName = cdef.levels[0];
            } else {
              n.professionName = newProf;
            }
            if (!n.personalHistory) n.personalHistory = [];
            n.personalHistory.push(`转修${newProf}之道。`);
          }
        }
        if (n.publicInfo) n.publicInfo.identity = n.identity;
      }
    }
    // 宅子迁移：左右厢房 + 主控子嗣未成年自动入住对应性别厢房
    const p = this.state.player;
    if (p) {
      // 主控记事清洗重复日期前缀
      if (Array.isArray(p.journal)) {
        p.journal = p.journal.map(m => {
          const msg = (typeof m === 'string') ? m : (m && m.msg);
          if (typeof msg === 'string' && /^\d+年\d+月[上下中]旬：\d+年\d+月[上下中]旬·/.test(msg)) {
            const fixed = msg.replace(/^(\d+年\d+月[上下中]旬)：\1·/, '$1·');
            return typeof m === 'string' ? fixed : { ...m, msg: fixed };
          }
          return m;
        });
      }
      // hp/mp 结构归一化：兼容数字/NaN（旧档/NPC转主控后可能为数字）
      if (!p.hp || typeof p.hp === 'number' || isNaN(p.hp)) { const v = typeof p.hp === 'number' && !isNaN(p.hp) ? p.hp : 100; p.hp = { current: v, max: v }; }
      if (!p.mp || typeof p.mp === 'number' || isNaN(p.mp)) { const v = typeof p.mp === 'number' && !isNaN(p.mp) ? p.mp : 50; p.mp = { current: v, max: v }; }
      // 灵宠生活系统字段迁移（性别/性格/成长期/记事等）
      try { require('./petLife').initPetLife(p); } catch (e) { /* 迁移失败不阻塞 */ }
      // 玩家小层化迁移
      if (typeof p.realmLevel !== 'number' || p.realmLevel < 1 || p.realmLevel > 10) p.realmLevel = 2;
      if (!p.subStage || !SUB_STAGES.includes(p.subStage)) p.subStage = '前期';
      if (!p.realm) p.realm = REALMS[p.realmLevel - 1]?.name || '炼气境';
      p.breakthroughExp = calcStageExpNeed(p.realmLevel, SUB_STAGES.indexOf(p.subStage));
      // 身份迁移：主控身份按修为补全（凡人境以上 → 修仙者）
      if (!p.identity || !['皇族', '官员', '平民', '修仙者'].includes(p.identity)) {
        p.identity = p.realmLevel >= 2 ? '修仙者' : '平民';
      }
      // 修仙者主控若无可修仙职业 → 补默认散修
      if (p.identity === '修仙者' && (!p.professions || !p.professions.cultivation || p.professions.cultivation.length === 0)) {
        try {
          const { addCultivationProfession } = require('./workSystem');
          addCultivationProfession(p, '散修');
        } catch (e) { /* 迁移失败不阻塞 */ }
      }
      try {
        const { initMansion, assignChildRoom } = require('./mansionSystem');
        initMansion(p);
        const m = p.mansion;
        const housed = [...(m.children || [])];
        for (const cid of housed) {
          const kid = this.state.npcs.find(n => n.id === cid);
          if (kid && kid.guardian === undefined) { kid.guardian = p.id; kid.guardianName = p.name; }
          if (kid) assignChildRoom(p, kid);
        }
        // 主控未成年子嗣自动入府（旧档修复）
        for (const n of this.state.npcs) {
          if (!n || n.isAlive === false || n.age >= 16) continue;
          if (n.family && (n.family.father === p.id || n.family.mother === p.id)) {
            assignChildRoom(p, n);
          }
        }
      } catch (e) { /* 迁移失败不阻塞加载 */ }
    }
    if (slot) this.currentSlot = slot;
    return this.getPublicState();
  }

  // ===== 商店系统 =====
  getShops() {
    return getShopsAtLocation(this.state.player.location);
  }

  getShopGoods(shopType) {
    return getShopGoods(shopType);
  }

  buyItem(shopType, itemName) {
    const p = this.state.player;
    const goods = getShopGoods(shopType);
    const item = goods.find(g => g.name === itemName);
    if (!item) return { error: '商品不存在' };
    if (item.stock <= 0) return { error: '已售罄' };
    if (p.spiritStone < item.currentPrice) return { error: '灵石不足' };

    p.spiritStone -= item.currentPrice;
    const existing = p.inventory.find(i => i.name === itemName);
    if (existing) existing.count++;
    else p.inventory.push({ name: itemName, count: 1, type: item.type, desc: item.desc });
    item.stock--;
    updateQuestProgress(p, 'trade');
    updateQuarterlyProgress(this.state, 'buy', { item: itemName });
    updateQuarterlyProgress(this.state, 'trade');
    this.addLog(`购买了${itemName}，花费${item.currentPrice}灵石。`);
    return this.getPublicState();
  }

  sellItem(itemName) {
    const p = this.state.player;
    const item = p.inventory.find(i => i.name === itemName);
    if (!item || item.count <= 0) return { error: '物品不存在' };
    const price = getSellPrice(itemName);
    item.count--;
    p.spiritStone += price;
    updateQuestProgress(p, 'trade');
    updateQuarterlyProgress(this.state, 'trade');
    this.addLog(`卖出了${itemName}，获得${price}灵石。`);
    return this.getPublicState();
  }

  // ===== 青楼系统 =====
  getBrothels() {
    return Object.values(BROTHELS).filter(b => b.location === this.state.player.location);
  }

  getBrothelGirls(brothelName) {
    return getGirls(brothelName, this.state.player.realmLevel);
  }

  brothelInteract(brothelName, girlId, action) {
    const p = this.state.player;
    const brothel = getBrothel(brothelName);
    if (!brothel) return { error: '青楼不存在' };
    if (p.realmLevel < brothel.minRealm) return { error: `需要${REALMS[brothel.minRealm - 1].name}以上` };
    if (p.spiritStone < brothel.entryFee) return { error: `入门费需要${brothel.entryFee}灵石` };

    const girl = brothel.girls.find(g => g.id === girlId);
    if (!girl) return { error: '姑娘不存在' };

    // 收取入门费
    if (action !== 'chat') {
      p.spiritStone -= brothel.entryFee;
    }

    const result = interactWithGirl(p, girl, action);
    if (result.success) {
      this.addLog(result.msg);
      if (result.effects?.exp) p.cultivationExp += result.effects.exp;
      this.addJournal(`在${brothelName}与${girl.name}${action === 'redeem' ? '赎身' : '相会'}。`);
    } else {
      // 退还入门费
      if (action !== 'chat') p.spiritStone += brothel.entryFee;
      return { error: result.msg };
    }
    return this.getPublicState();
  }

  // ===== 府邸系统 =====
  getResidenceTypes() {
    return RESIDENCE_TYPES;
  }

  buyResidence(tier) {
    const p = this.state.player;
    const result = buyResidence(p, tier);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`购置了${result.residence.name}。`);
    }
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  upgradeResidence() {
    const p = this.state.player;
    const result = upgradeResidence(p);
    if (result.success) {
      this.addLog(result.msg);
    }
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  recruitMember(npcId, rank) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: 'NPC不存在' };
    const result = recruitMember(p, npc, rank);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  // ===== 宠物系统 =====
  capturePet(pet) {
    const p = this.state.player;
    // 探索/采集遇到的灵兽：直接收服入包（与记事建立联系，第九批修复）
    if (pet && pet.id && pet.typeId) {
      if (!p.pets) p.pets = [];
      p.pets.push(pet);
      this.addLog(`你成功收服了一只${pet.quality}【${pet.name}】！`);
      this.addJournal(`${this.state.gameDateText}·成功收服${pet.quality}【${pet.name}】，收入灵宠。`);
      updateQuarterlyProgress(this.state, 'tame');
      return { success: true, msg: `成功收服${pet.quality}【${pet.name}】！它已成为你的灵宠。`, pet, state: this.getPublicState() };
    }
    const result = tryCapture(p, p.location);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`捕捉了一只${result.pet.quality}${result.pet.name}。`);
      updateQuarterlyProgress(this.state, 'tame');
    } else {
      this.addLog(result.msg);
    }
    return this.getPublicState();
  }

  feedPet(petId) {
    const p = this.state.player;
    const pet = p.pets.find(pt => pt.id === petId);
    if (!pet) return { error: '宠物不存在' };
    const result = feedPet(p, pet);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  setActivePet(petId) {
    const p = this.state.player;
    const result = setActivePet(p, petId);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  getPets() {
    if (!this.state || !this.state.player) return { pets: [], eggs: [] };
    const p = this.state.player;
    const { initPetLife, listPetEggs } = require('./petLife');
    initPetLife(p);
    const eggs = listPetEggs(p);
    return {
      pets: p.pets || [],
      eggs,
    };
  }
  // 第九批：孵化灵兽蛋（背包使用亦可，此处为灵宠页按钮）；血脉蛋走 petLife
  hatchPet(eggName) {
    const { hatchPetEgg } = require('./pet');
    const p = this.state.player;
    let r;
    if (/^血脉·/.test(eggName)) {
      r = require('./petLife').hatchBloodEgg(p, eggName, this.state, this.state.gameDateText);
    } else {
      r = hatchPetEgg(p, eggName);
    }
    if (r.success) {
      this.addLog(r.msg);
      this.addJournal(`${this.state.gameDateText}·${r.msg}`);
    } else {
      this.addLog(r.msg);
    }
    return r.success ? { ...r, state: this.getPublicState() } : { error: r.msg, state: this.getPublicState() };
  }
  // 第九批：投喂晋升（食物→经验→品级晋升，记录灵宠记事）——支持一次投喂多个
  feedPetItem(petId, foodName, count = 1) {
    const p = this.state.player;
    const pet = (p.pets || []).find(pt => pt.id === petId);
    if (!pet) return { error: '灵宠不存在' };
    // feedPetWithJournal 内部完成扣食物+经验+记事（避免双扣）
    const r = require('./petLife').feedPetWithJournal(p, pet, foodName, this.state.gameDateText, count);
    if (r.success) {
      this.addLog(r.msg);
      if (r.promoted) this.addJournal(`${this.state.gameDateText}·${r.msg}`);
    }
    return r.success ? { ...r, state: this.getPublicState() } : { error: r.msg };
  }
  // 灵宠面板数据（含家族网/可投喂食物/记事）
  petPanel(petId) {
    const { initPetLife } = require('./petLife');
    const p = this.state.player;
    initPetLife(p);
    const pet = (p.pets || []).find(pt => pt.id === petId);
    if (!pet) return { error: '灵宠不存在' };
    const all = p.pets || [];
    const rels = [];
    for (const oid of Object.keys(pet.petRelations || {})) {
      const o = all.find(x => x.id === oid);
      if (o) rels.push({ id: o.id, name: o.name, type: pet.petRelations[oid].type, favor: pet.petRelations[oid].favor, gender: o.gender, growthStage: o.growthStage });
    }
    // 血缘家族
    const family = [];
    if (pet.family && pet.family.father) { const f = all.find(x => x.id === pet.family.father); if (f) family.push({ id: f.id, name: f.name, rel: '父亲', favor: pet.petRelations && pet.petRelations[f.id] && pet.petRelations[f.id].favor }); }
    if (pet.family && pet.family.mother) { const m = all.find(x => x.id === pet.family.mother); if (m) family.push({ id: m.id, name: m.name, rel: '母亲', favor: pet.petRelations && pet.petRelations[m.id] && pet.petRelations[m.id].favor }); }
    for (const cid of (pet.family && pet.family.children) || []) {
      const c = all.find(x => x.id === cid);
      if (c) family.push({ id: c.id, name: c.name, rel: pet.gender === '雌' ? '孩子' : '孩子', favor: pet.petRelations && pet.petRelations[cid] && pet.petRelations[cid].favor });
    }
    // 可投喂食物（背包有且该宠可吃；feedValues 缺失时从 PET_TYPES 兜底）
    const feedValues = pet.feedValues || {};
    if (Object.keys(feedValues).length === 0) {
      const t = require('./pet').PET_TYPES.find(x => x.id === pet.typeId);
      if (t && t.feedValues) Object.assign(feedValues, t.feedValues);
    }
    const feedable = [];
    for (const f of Object.keys(feedValues)) {
      const inv = (p.inventory || []).find(i => i.name === f && i.count > 0);
      if (inv) feedable.push({ name: f, gain: feedValues[f], count: inv.count, quality: '—' });
    }
    // 背包中的菜品也可投喂（有增/减效益）
    const { DISHES } = require('./cookingSystem');
    for (const dish of Object.keys(DISH_FEED)) {
      const inv = (p.inventory || []).find(i => i.name === dish && i.count > 0);
      if (inv) {
        const eff = require('./pet').dishFeedEffect(pet, dish);
        const quality = (DISHES[dish] && DISHES[dish].baseQuality) || '凡品';
        feedable.push({ name: dish, gain: eff.gain, favor: eff.favor, count: inv.count, dish: true, quality });
      }
    }
    return { success: true, pet, relations: rels, family, feedable, state: this.getPublicState() };
  }
  // 抚摸灵宠
  petStroke(petId) {
    const p = this.state.player;
    const pet = (p.pets || []).find(pt => pt.id === petId);
    if (!pet) return { error: '灵宠不存在' };
    const r = require('./petLife').strokePet(p, pet, this.state.gameDateText);
    return { ...r, state: this.getPublicState() };
  }
  // 灵宠改名
  petRename(petId, newName) {
    const p = this.state.player;
    const pet = (p.pets || []).find(pt => pt.id === petId);
    if (!pet) return { error: '灵宠不存在' };
    if (!newName || !newName.trim()) return { error: '名字不能为空' };
    if (newName.trim().length > 8) return { error: '名字过长（最多8字）' };
    pet.name = newName.trim();
    return { success: true, msg: `灵宠已改名为【${newName.trim()}】`, state: this.getPublicState() };
  }
  // 灵宠跟随/取消跟随（最多3只跟随；跟随参与战斗并获得属性加成）
  petFollowToggle(petId) {
    const p = this.state.player;
    const pet = (p.pets || []).find(pt => pt.id === petId);
    if (!pet) return { error: '灵宠不存在' };
    if (pet.following) {
      pet.following = false;
      this.addLog(`【${pet.name}】已取消跟随。`);
      return { success: true, msg: `【${pet.name}】已取消跟随，不再参与战斗。`, following: false, state: this.getPublicState() };
    }
    const followingCount = (p.pets || []).filter(x => x.following).length;
    if (followingCount >= 3) return { error: '最多只能有3只灵宠跟随（请先取消其他灵宠的跟随）' };
    pet.following = true;
    this.addLog(`【${pet.name}】开始跟随你，将参与战斗。`);
    return { success: true, msg: `【${pet.name}】开始跟随你，战斗中会主动协助（属性加成）！`, following: true, state: this.getPublicState() };
  }
  // 灵宠蛋交易市场 + 灵兽用品区
  getPetEggShop() {
    const { PET_EGGS, PET_SUPPLIES } = require('./pet');
    return { eggs: Object.entries(PET_EGGS).map(([name, v]) => ({ name, tier: v.tier, price: v.price, eggArt: v.eggArt })), supplies: PET_SUPPLIES };
  }
  buyPetEgg(eggName) {
    const { PET_EGGS } = require('./pet');
    const def = PET_EGGS[eggName];
    if (!def) return { error: '未知的灵兽蛋' };
    const p = this.state.player;
    if ((p.spiritStone || 0) < def.price) return { error: `灵石不足，需要${def.price}灵石` };
    p.spiritStone -= def.price;
    if (!p.inventory) p.inventory = [];
    const existing = p.inventory.find(i => i.name === eggName);
    if (existing) existing.count++; else p.inventory.push({ name: eggName, count: 1, type: 'petEgg' });
    this.addLog(`在灵宠蛋交易市场购买了【${eggName}】（${def.price}灵石）。`);
    return { success: true, msg: `购买【${eggName}】成功！可在背包或灵宠页孵化。`, state: this.getPublicState() };
  }
  buyPetSupply(supplyName) {
    const { PET_SUPPLIES } = require('./pet');
    const def = PET_SUPPLIES.find(x => x.name === supplyName);
    if (!def) return { error: '未知的灵兽用品' };
    const p = this.state.player;
    if ((p.spiritStone || 0) < def.price) return { error: `灵石不足，需要${def.price}灵石` };
    p.spiritStone -= def.price;
    if (!p.inventory) p.inventory = [];
    const existing = p.inventory.find(i => i.name === supplyName);
    if (existing) existing.count++; else p.inventory.push({ name: supplyName, count: 1, type: 'material' });
    this.addLog(`在灵兽用品区购买了【${supplyName}】。`);
    return { success: true, msg: `购买【${supplyName}】成功！`, state: this.getPublicState() };
  }

  // ===== 种植系统 =====
  getFarmInfo() {
    return getFieldStatus(this.state.player);
  }

  getSeeds() {
    return getSeedShop();
  }

  upgradeFarm() {
    const p = this.state.player;
    const result = upgradeField(p);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  plantCrop(plotIndex, cropId) {
    const p = this.state.player;
    const result = plant(p, plotIndex, cropId);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  harvestCrop(plotIndex) {
    const p = this.state.player;
    const result = harvest(p, plotIndex);
    if (result.success) {
      this.addLog(result.msg);
      updateQuestProgress(p, 'collect', { item: result.quality + '灵药' });
      if (result.itemName) {
        updateQuarterlyProgress(this.state, 'harvest', { item: result.itemName });
        updateQuarterlyProgress(this.state, 'collect', { item: result.itemName });
      }
    }
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  harvestAllCrops() {
    const p = this.state.player;
    const result = harvestAll(p);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  // ===== 做菜系统 =====
  getCookingInfo() {
    const p = this.state.player;
    initCooking(p);
    return {
      level: p.cooking.level,
      exp: p.cooking.exp,
      currentDish: p.cooking.currentDish,
      cookProgress: p.cooking.cookProgress,
      learnedRecipes: p.cooking.learnedRecipes,
      availableDishes: getAvailableDishes(p),
    };
  }

  startCooking(dishName) {
    const p = this.state.player;
    const result = startCookingDish(p, dishName);
    if (result.success) this.addLog(result.msg);
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  tickCooking() {
    const p = this.state.player;
    const result = tickCookingDish(p);
    if (result && result.success) {
      this.addLog(`${result.dish}制作完成！获得×${result.count}`);
      this.addJournal(`制作了${result.dish}×${result.count}。`);
    }
    return result;
  }

  eatDish(dishName) {
    const p = this.state.player;
    const result = eatCookedDish(p, dishName);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`食用了${dishName}。`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // 使用背包物品（丹药/菜品通用）
  useItem(itemName) {
    const p = this.state.player;
    // 菜品：分流到吃菜系统
    if (DISHES[itemName] || (p.inventory || []).some(i => i.name === itemName && i.baseEffects)) {
      return this.eatDish(itemName);
    }
    const itemDef = ITEMS[itemName];
    if (!itemDef || !itemDef.effect) return { error: '这件物品无法使用' };
    const eff = itemDef.effect;
    // 突破类丹药：目标境界以下服用可提升突破概率（消耗1颗，获得"丹效"状态，突破成功后清除）
    const BT_PILLS = { '筑基丹': 3, '金丹破障丹': 4, '元婴丹': 5, '化神丹': 6, '炼虚丹': 7, '合体丹': 8, '大乘丹': 9 };
    if (BT_PILLS[itemName]) {
      const targetRealm = BT_PILLS[itemName];
      if (p.realmLevel >= targetRealm) return { error: `你已突破${REALMS[targetRealm - 1].name}，无需再服用${itemName}` };
      const slot0 = (p.inventory || []).find(i => i.name === itemName);
      if (!slot0 || slot0.count <= 0) return { error: '背包中没有这件物品' };
      slot0.count--;
      if (slot0.count <= 0) p.inventory = p.inventory.filter(i => i.name !== itemName);
      if (!p.statusEffects) p.statusEffects = [];
      p.statusEffects.push({ name: `${itemName}效`, bonus: 30, turns: 999, desc: `服用${itemName}，突破${REALMS[targetRealm - 1].name}成功率+30%` });
      this.addLog(`服用${itemName}，突破${REALMS[targetRealm - 1].name}成功率提升（+30%）！`);
      this.addJournal(`${this.state.gameDateText}·服用${itemName}，突破${REALMS[targetRealm - 1].name}成功率+30%。`);
      return { success: true, msg: `服用${itemName}，突破${REALMS[targetRealm - 1].name}成功率+30%（突破成功后状态消失）。`, state: this.getPublicState() };
    }
    // 场景类丹药（生育/化形等）：在对应场景自动生效，不手动消耗
    if (eff.birthBonus || eff.pregnancy || eff.transform || eff.miscarry || eff.antiDemon || eff.access || eff.teleport) {
      return { error: `【${itemName}】为场景类物品，在对应场景（生育/化形等）中自动生效，无需手动使用` };
    }
    // 产业类物品：直接建立产业（第九批）
    if (itemDef.effect && itemDef.effect.estate) {
      return this.useEstate(itemName);
    }
    // 灵兽蛋：孵化（第九批）
    if (itemDef.type === 'petEgg') {
      const { hatchPetEgg } = require('./pet');
      const r = hatchPetEgg(p, itemName);
      if (r.success) {
        this.addLog(r.msg);
        this.addJournal(`${this.state.gameDateText}·${r.msg}`);
      } else {
        this.addLog(r.msg);
      }
      return r.success ? { ...r, state: this.getPublicState() } : { error: r.msg, state: this.getPublicState() };
    }
    const slot = (p.inventory || []).find(i => i.name === itemName);
    if (!slot || slot.count <= 0) return { error: '背包中没有这件物品' };
    // 符箓效果：直接使用（状态类生效；攻击类提示在战斗中使用）
    if (itemDef.type === 'talisman') {
      if (eff.fireDamage || eff.iceDamage || eff.thunderDamage || eff.undeadDamage || eff.bind) {
        return { error: `【${itemName}】为战斗类符箓，请在战斗中施展` };
      }
      slot.count--;
      if (slot.count <= 0) p.inventory = p.inventory.filter(i => i.name !== itemName);
      if (!p.statusEffects) p.statusEffects = [];
      if (eff.shield) p.statusEffects.push({ name: '灵力护盾', bonus: eff.shield, turns: 5, desc: `护盾吸收${eff.shield}伤害` });
      if (eff.stealth) p.statusEffects.push({ name: '隐身', turns: 3, desc: '3回合内不易被攻击' });
      if (eff.atkBuff) p.statusEffects.push({ name: '巨力', bonus: eff.atkBuff, turns: 3, desc: '攻击+30%' });
      if (eff.moveBuff) p.statusEffects.push({ name: '风行', turns: 3, desc: '移动消耗减半' });
      if (eff.fireImmune) p.statusEffects.push({ name: '辟火', turns: 5, desc: '免疫火焰伤害' });
      if (eff.teleport) {
        this.addLog('当前版本已移除传送符物品。');
        return { success: false, msg: '传送符已被移除，请直接在世界地图中移动。', state: this.getPublicState() };
      }
      if (eff.transform) {
        p.form = 'human';
        this.addLog('使用化形符，你化作人形，可进入人族城镇。');
        this.addJournal(`${this.state.gameDateText}·使用化形符化为人形。`);
        return { success: true, msg: '化形符生效！你化为人形，可进入人族城镇。', state: this.getPublicState() };
      }
      this.addLog(`使用了${itemName}。`);
      this.addJournal(`${this.state.gameDateText}·使用了${itemName}。`);
      return { success: true, msg: `使用了【${itemName}】。`, state: this.getPublicState() };
    }
    // 通用丹药效果
    const result = usePill(p, itemName);
    if (result.success) {
      // 玩家额外效果：修为
      if (eff.cultivationExp) {
        p.cultivationExp = (p.cultivationExp || 0) + eff.cultivationExp;
        result.msg += `，修为+${eff.cultivationExp}`;
        // 修为溢出时尝试突破
        if (p.realmLevel && p.cultivationExp >= p.realmLevel * 500 + 500) {
          result.msg += '（修为充足，可在修炼中突破）';
        }
      }
      this.addLog(result.msg);
      this.addJournal(`使用了${itemName}。`);
      return { ...result, state: this.getPublicState() };
    }
    return { error: result.msg };
  }

  // ===== 产业系统（第九批：灵石矿脉/灵田契约/店铺地契/洞府钥匙）=====
  initEstates(p) {
    if (!p.estates) p.estates = {};
    return p.estates;
  }
  useEstate(itemName) {
    const p = this.state.player;
    const es = this.initEstates(p);
    const slot = (p.inventory || []).find(i => i.name === itemName);
    if (!slot || slot.count <= 0) return { error: '背包中没有这件物品' };
    let msg = '';
    switch (itemName) {
      case '灵石矿脉':
        if (es.mine) return { error: '你已拥有灵石矿脉' };
        es.mine = { tier: 1 }; msg = '【灵石矿脉】契书生效！每月将自动产出灵石。'; break;
      case '灵田契约':
        if (es.farmland) return { error: '你已拥有灵田' };
        es.farmland = { tier: 1, plants: [] }; msg = '【灵田契约】生效！获得一块一品灵田，每月自动收获灵植。'; break;
      case '店铺地契':
        if (es.shop) return { error: '你已拥有店铺' };
        es.shop = { name: '我的店铺', shelves: new Array(20).fill(null), sales: [], income: 0 };
        msg = '【店铺地契】生效！凡人界已生成“我的店铺”，可上架货物、NPC每月购买、手动领取收益。'; break;
      case '洞府钥匙':
        if (es.cave) return { error: '你已拥有洞府' };
        es.cave = { tier: '顶级', desc: '对标顶级宅邸的仙家洞府' }; msg = '【洞府钥匙】生效！修仙界已生成“我的洞府”。'; break;
      default: return { error: '未知产业物品' };
    }
    slot.count--;
    if (slot.count <= 0) p.inventory = p.inventory.filter(i => i.name !== itemName);
    this.addLog(msg);
    this.addJournal(`${this.state.gameDateText}·${msg}`);
    return { success: true, msg, state: this.getPublicState() };
  }
  // 每月产业结算
  settleEstates() {
    const p = this.state.player;
    if (!p.estates) return;
    const es = p.estates;
    const gains = [];
    if (es.mine) {
      const gain = 50 * (es.mine.tier || 1);
      p.spiritStone = (p.spiritStone || 0) + gain;
      gains.push(`灵石矿脉产出${gain}灵石`);
    }
    if (es.farmland) {
      const crops = ['灵谷', '聚灵草', '灵草', '野山参'];
      const item = crops[Math.floor(Math.random() * crops.length)];
      const n = 1 + Math.floor(Math.random() * 3);
      const existing = (p.inventory || []).find(i => i.name === item);
      if (existing) existing.count += n; else p.inventory.push({ name: item, count: n });
      gains.push(`灵田收获${item}×${n}`);
    }
    if (es.shop) {
      const r = this.settleShopMonth();
      if (r) gains.push(r);
    }
    if (gains.length) {
      this.addLog(`产业结算：${gains.join('，')}。`);
      this.addJournal(`${this.state.gameDateText}·产业结算：${gains.join('，')}。`);
    }
  }
  // 店铺月度：NPC 概率购买上架物品
  settleShopMonth() {
    const p = this.state.player;
    const shop = p.estates.shop;
    if (!shop || !shop.shelves) return null;
    const npcs = (this.state.npcs || []).filter(n => n.isAlive && n.knownByPlayer);
    let sold = 0, income = 0;
    for (let i = 0; i < shop.shelves.length; i++) {
      const s = shop.shelves[i];
      if (!s) continue;
      if (Math.random() < 0.35) {
        const price = s.price || 50;
        income += price;
        shop.income = (shop.income || 0) + price;
        const buyer = npcs.length ? npcs[Math.floor(Math.random() * npcs.length)].name : '过路客商';
        if (!shop.sales) shop.sales = [];
        shop.sales.push({ buyer, item: s.name, price, date: this.state.gameDateText, count: s.count });
        shop.shelves[i] = null;
        sold++;
      }
    }
    if (sold) return `店铺售出${sold}件货物，收益${income}灵石`;
    return null;
  }
  // 店铺面板
  getShopPanel() {
    const p = this.state.player;
    const es = this.initEstates(p);
    return { hasShop: !!es.shop, shop: es.shop || null };
  }
  // 上架（slot 1-20，物品来自背包）
  shopShelve(slot, itemName, price) {
    const p = this.state.player;
    const es = this.initEstates(p);
    if (!es.shop) return { error: '你还没有店铺' };
    const idx = slot - 1;
    if (idx < 0 || idx >= 20) return { error: '上架位无效' };
    if (es.shop.shelves[idx]) return { error: '该上架位已有货物，请先下架' };
    const item = (p.inventory || []).find(i => i.name === itemName && i.count > 0);
    if (!item) return { error: '背包中没有这件物品' };
    const priceVal = Number(price) || 10;
    item.count--;
    if (item.count <= 0) p.inventory = p.inventory.filter(i => i.name !== itemName);
    es.shop.shelves[idx] = { name: itemName, price: priceVal, count: 1 };
    this.addLog(`店铺上架：${itemName}（定价${priceVal}灵石）。`);
    return { success: true, msg: `已上架【${itemName}】，定价${priceVal}灵石。`, state: this.getPublicState() };
  }
  // 下架
  shopUnShelve(slot) {
    const p = this.state.player;
    const es = this.initEstates(p);
    if (!es.shop) return { error: '你还没有店铺' };
    const idx = slot - 1;
    const s = es.shop.shelves[idx];
    if (!s) return { error: '该上架位无货物' };
    const existing = (p.inventory || []).find(i => i.name === s.name);
    if (existing) existing.count += s.count; else p.inventory.push({ name: s.name, count: s.count });
    es.shop.shelves[idx] = null;
    this.addLog(`店铺下架：${s.name}。`);
    return { success: true, msg: `已下架【${s.name}】。`, state: this.getPublicState() };
  }
  // 领取收益
  shopTake() {
    const p = this.state.player;
    const es = this.initEstates(p);
    if (!es.shop) return { error: '你还没有店铺' };
    const income = es.shop.income || 0;
    if (income <= 0) return { error: '店铺暂无待领取收益' };
    es.shop.income = 0;
    p.spiritStone = (p.spiritStone || 0) + income;
    this.addLog(`领取店铺收益${income}灵石。`);
    this.addJournal(`${this.state.gameDateText}·领取店铺收益${income}灵石。`);
    return { success: true, msg: `领取店铺收益${income}灵石。`, state: this.getPublicState() };
  }
  // 洞府信息
  getCaveInfo() {
    const p = this.state.player;
    const es = this.initEstates(p);
    return { hasCave: !!es.cave, cave: es.cave || null };
  }
  // 每月自动存档（第九批）
  autoSave() {
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.join(__dirname, '..', '..', 'saves');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // 开局绑定唯一存档码：自动存档覆盖该码对应档，不另建新档
      let fname;
      if (this.state && this.state.saveCode) {
        fname = this.state.saveCode + '.json';
      } else if (this.currentSlot) {
        fname = this.currentSlot + '.json';
      } else {
        const d = this.state.gameDate;
        fname = `自动存档_${d.year}-${d.month}月.json`;
      }
      fs.writeFileSync(path.join(dir, fname), JSON.stringify(this.state), 'utf8');
    } catch (e) { /* 自动存档失败不影响游戏 */ }
  }

  learnRecipe(dishName) {
    const p = this.state.player;
    const result = learnCookingRecipe(p, dishName);
    if (result.success) this.addLog(result.msg);
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // ===== 商铺系统（肉铺/种子铺）=====
  getButcherItems() {
    return getButcherItems(this.state);
  }

  getSeedShopItems() {
    return getSeedShopItems(this.state);
  }

  buyFromShop(shopType, itemName, count) {
    // 鱼市特殊处理
    if (shopType === 'fishMarket') {
      const items = getFishMarketItems(this.state);
      const item = items.find(i => i.name === itemName);
      if (!item) return { error: '商品不存在' };
      if (item.stock < count) return { error: '库存不足' };
      const totalCost = item.price * count;
      const player = this.state.player;
      if (item.currency === 'silver') {
        if (player.silver < totalCost) return { error: '银两不足' };
        player.silver -= totalCost;
      } else {
        if (player.spiritStone < totalCost) return { error: '灵石不足' };
        player.spiritStone -= totalCost;
      }
      item.stock -= count;
      const existing = player.inventory.find(i => i.name === itemName);
      if (existing) existing.count += count;
      else player.inventory.push({ name: itemName, count, type: 'fish', tier: item.tier, price: item.price });
      const msg = `购买了${itemName}×${count}，花费${totalCost}${item.currency === 'silver' ? '银两' : '灵石'}。`;
      this.addLog(msg);
      return { success: true, msg, state: this.getPublicState() };
    }
    const result = buyItem(this.state, shopType, itemName, count);
    if (result.success) this.addLog(result.msg);
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  sellToShop(shopType, itemName, count) {
    // 鱼市特殊处理
    if (shopType === 'fishMarket') {
      const player = this.state.player;
      const invItem = player.inventory.find(i => i.name === itemName);
      if (!invItem || invItem.count < count) return { error: '物品不足' };
      const sellPrice = Math.floor((invItem.price || 10) * 0.6);
      const currency = invItem.tier <= 2 ? 'silver' : 'spirit';
      const totalEarn = sellPrice * count;
      invItem.count -= count;
      if (invItem.count <= 0) {
        player.inventory = player.inventory.filter(i => i !== invItem);
      }
      if (currency === 'silver') player.silver += totalEarn;
      else player.spiritStone += totalEarn;
      const msg = `出售了${itemName}×${count}，获得${totalEarn}${currency === 'silver' ? '银两' : '灵石'}。`;
      this.addLog(msg);
      return { success: true, msg, state: this.getPublicState() };
    }
    const result = sellItem(this.state, shopType, itemName, count);
    if (result.success) this.addLog(result.msg);
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // 药铺
  getPharmacyItems(category) {
    return getPharmacyItems(this.state, category);
  }

  // 采集系统
  doGather(gatherType) {
    if (!this.state) return { error: '游戏未开始' };
    const player = this.state.player;
    const location = player.location;

    // ⑦ 落日森林采集区：每月只能进入/采集一次（下月重置）
    if (gatherType === '采集区' && location === '落日森林') {
      const curMonth = this.state.gameDate.year * 12 + this.state.gameDate.month;
      if (player.lastGatherMonth !== curMonth) {
        player.lastGatherMonth = curMonth;
        player.gatherCount = 0;
      }
      if ((player.gatherCount || 0) >= 10) {
        return { error: '本月的落日森林采集机会已用完（10次），下个月再来吧' };
      }
      player.gatherCount = (player.gatherCount || 0) + 1;
    }

    // 秘境采集次数限制
    if (gatherType === '秘境采集') {
      if (!player.dungeonState) player.dungeonState = { gatherCount: 0, maxGather: 10 };
      if (player.dungeonState.gatherCount >= (player.dungeonState.maxGather || 10)) {
        return { error: '本秘境采集次数已用完（10次），请离开秘境' };
      }
      player.dungeonState.gatherCount++;
    }

    // 药王园采集：每次交钱，可采到高品质炼丹材料
    if (gatherType === '采药') {
      const entryFee = 50; // 银两
      if ((player.silver || 0) < entryFee) {
        return { error: `进入药王园采集需要${entryFee}银两，你的银两不足` };
      }
      player.silver -= entryFee;
    }

    const results = { items: [], encounteredBeast: null, msg: '', gatherCount: player.dungeonState?.gatherCount, maxGather: player.dungeonState?.maxGather || 10 };

    // 采集材料列表（根据地点）
    const gatherMaterials = {
      '采集区': ['聚灵草', '灵草', '人参', '百年茯苓', '鹿茸', '灵木'],
      '秘境采集': ['聚灵草', '灵草', '百年茯苓', '玄铁', '妖丹', '雷石', '灵晶石', '兽骨'],
      // 药王园：高品质炼丹材料
      '采药': ['紫霞参', '月华露', '回阳草', '玄阳果', '千年灵芝', '凤仙花', '龙须草', '雪莲', '万年人参', '妖丹'],
      '毒草采集': ['毒草', '断肠草', '腐骨花', '噬魂藤'],
      '采集毒草': ['毒草', '断肠草', '腐骨花', '噬魂藤'],
      '探索沼泽': ['毒草', '腐骨花', '沼泽泥', '阴魂珠'],
      '采矿': ['精铁', '玄铁', '寒铁', '雷石', '灵晶石'],
      '灵田矿脉': ['玄铁', '寒铁', '雷石', '灵晶石'],
      '深渊采矿': ['魔晶', '深渊铁', '魂火'],
      '海底采矿': ['深海铁', '珍珠', '珊瑚'],
      '虚空采矿': ['虚空石', '星陨铁', '混沌晶'],
    };

    const materials = gatherMaterials[gatherType] || ['灵草', '聚灵草'];
    const gatherCount = randInt(1, 3);

    for (let i = 0; i < gatherCount; i++) {
      const material = randChoice(materials);
      const count = randInt(1, 3);
      const existing = player.inventory.find(it => it.name === material);
      if (existing) existing.count += count;
      else player.inventory.push({ name: material, count, type: 'material' });
      results.items.push({ name: material, count });
      // ⑧ 采集与世界任务建立链接：每件采集物计入任务进度（与doExplore一致）
      updateQuestProgress(player, 'collect', { item: material });
      updateQuarterlyProgress(this.state, 'collect', { item: material });
    }

    // 概率遇到野兽（30%），秘境采集遇到妖兽概率更高（50%）
    const beastChance = gatherType === '秘境采集' ? 0.4 : 0.3;
    if (Math.random() < beastChance) {
      const danger = LOCATIONS[location]?.danger || 1;
      const beastTier = clamp(danger + randInt(0, 1), 1, 6);
      const beast = generateBeast(beastTier, location);
      beast.maxHp = beast.hp;
      beast.maxMp = beast.mp;
      results.encounteredBeast = beast;
      results.msg = `你在采集时遇到了${beast.tierName}【${beast.name}】！`;
    } else if (Math.random() < 0.2) {
      // ⑥ 采集区/秘境都有概率遇到灵兽（秘境20%，普通采集区15%），弹窗可驯服
      const { PET_TYPES, generatePet } = require('./pet');
      const dungeonLoc = player.dungeonState?.active?.location || '';
      let availablePets = PET_TYPES.filter(p => dungeonLoc && p.locations.includes(dungeonLoc));
      if (availablePets.length === 0) availablePets = PET_TYPES;
      if (availablePets.length > 0) {
        const petType = randChoice(availablePets);
        const pet = generatePet(petType.id);
        results.encounteredPet = pet;
        results.msg = `你在采集时发现了一只${pet.quality}【${pet.name}】！`;
      } else if (gatherType === '采集区') {
        // 普通采集区：任意灵宠池随机一只
        const petType = randChoice(PET_TYPES);
        const pet = generatePet(petType.id);
        results.encounteredPet = pet;
        results.msg = `你在采集时发现了一只${pet.quality}【${pet.name}】！`;
      } else {
        results.msg = `你成功采集到了${results.items.map(i => `${i.name}×${i.count}`).join('、')}。`;
      }
    } else {
      results.msg = `你成功采集到了${results.items.map(i => `${i.name}×${i.count}`).join('、')}。`;
    }

    this.addLog(results.msg);
    this.addJournal(`${formatGameTime(this.state.gameDate)} ${location}：${results.msg}`);

    return { ...results, state: this.getPublicState() };
  }

  // ⑥ 投喂灵草安抚妖兽：消耗灵草×1，60%成功免战离开
  feedBeast(beastId) {
    const p = this.state.player;
    const herbIdx = (p.inventory || []).findIndex(i => i.name === '灵草' && i.count > 0);
    if (herbIdx === -1) return { success: false, msg: '背包中没有灵草，无法投喂' };
    p.inventory[herbIdx].count--;
    if (p.inventory[herbIdx].count <= 0) p.inventory.splice(herbIdx, 1);
    this.addLog(`你向拦路的妖兽投喂了一株灵草。`);
    if (Math.random() < 0.6) {
      this.addJournal(`${this.state.gameDateText}·${p.location}·投喂灵草安抚了拦路妖兽。`);
      return { success: true, msg: '灵草的清香令妖兽放下了戒备，它低头嗅了嗅，转身离去。' };
    }
    return { success: false, msg: '妖兽对灵草不为所动，依旧拦在路前。', beastHp: null };
  }

  // 妖兽掉落物
  addBeastDrops(drops, expGain = 0) {
    const p = this.state.player;
    if (!p.inventory) p.inventory = [];
    for (const drop of drops || []) {
      const existing = p.inventory.find(it => it.name === drop.name);
      if (existing) existing.count += drop.count;
      else p.inventory.push({ name: drop.name, count: drop.count, type: 'material' });
    }
    if (expGain > 0) {
      p.cultivationExp = (p.cultivationExp || 0) + expGain;
    }
    this.addLog(`获得掉落物：${(drops || []).map(d => `${d.name}×${d.count}`).join('、')}${expGain > 0 ? `，修为+${expGain}` : ''}`);
    return { success: true, state: this.getPublicState() };
  }

  // 捕捉灵宠（补 id 与灵宠生活字段，避免无id宠物无法交互）
  capturePet(pet) {
    const p = this.state.player;
    if (!p.pets) p.pets = [];
    if (!pet) return { error: '灵宠数据缺失' };
    if (!pet.id) pet.id = 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    try { require('./petLife').initPetLife({ pets: [pet] }); } catch (e) {}
    p.pets.push(pet);
    this.addLog(`捕捉了灵宠【${pet.name}】！`);
    this.addJournal(`捕捉了灵宠【${pet.name}】（${pet.quality}）`);
    this.checkCultivationProfessions(); // 拥有灵宠 → 兽修
    return { success: true, pet, state: this.getPublicState() };
  }

  // 捕鱼系统
  getFishingZones() {
    return FISHING_ZONES;
  }

  enterFishingZone(zoneId) {
    const result = enterFishingZone(this.state, zoneId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${formatGameTime(this.state.gameDate)} 东海渔村：${result.msg}`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  catchFish(success = true) {
    // 钓鱼按概率失败：40%概率脱钩（仅在未强制成功时判定）
    const p = this.state.player;
    const fishing = this.state.fishing || {};
    const zoneId = fishing.currentZone;
    let failed = false;
    if (!success) failed = true;
    else if (zoneId) {
      const zone = FISHING_ZONES.find(z => z.id === zoneId);
      const missChance = Math.max(15, Math.min(60, 45 - (p.attributes?.luck || 0) * 0.2 - (zone ? (zone.fishChanceBonus || 0) : 0)));
      if (chance(missChance)) failed = true;
    }
    const result = catchFish(this.state, failed);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${formatGameTime(this.state.gameDate)} 东海渔村：${result.msg}`);
      updateQuarterlyProgress(this.state, 'fish');
    } else if (result.zoneEnd || result.msg.includes('失败')) {
      this.addLog(result.msg);
      this.addJournal(`${formatGameTime(this.state.gameDate)} 东海渔村：${result.msg}`);
    }
    return result.success || result.zoneEnd ? { ...result, state: this.getPublicState() } : { error: result.msg, zoneEnd: result.zoneEnd };
  }

  exitFishingZone() {
    const result = exitFishingZone(this.state);
    if (result.success) this.addLog(result.msg);
    return { ...result, state: this.getPublicState() };
  }

  getFishMarketItems() {
    return getFishMarketItems(this.state);
  }

  // ===== 季度任务系统 =====
  getQuarterlyQuests() {
    return getAvailableQuests(this.state);
  }

  acceptQuarterlyQuest(questId) {
    const result = acceptQuarterlyQuest(this.state, questId);
    if (result.success) this.addLog(result.msg);
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  completeQuarterlyQuest(questId) {
    const result = completeQuarterlyQuest(this.state, questId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`完成季度任务：${result.quest?.title || questId}。`);
      updateStat(this.state.player, 'questCompleted', 1); // 完成任务数（赏金猎人职业条件）
      this.checkCultivationProfessions();
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  updateQuestProgress(type, params) {
    return updateQuarterlyProgress(this.state, type, params);
  }

  // 提交普通任务物品（背包直交：背包有即可直接完成任务）
  submitQuestItems(questId) {
    const { submitQuestItems: submitItems } = require('./quest');
    const result = submitItems(this.state.player, questId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`完成任务：${String(result.msg).replace('任务完成：', '').split('，')[0]}。`);
      updateStat(this.state.player, 'questCompleted', 1); // 完成任务数（赏金猎人职业条件）
      this.checkCultivationProfessions();
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // 提交季度任务物品（背包直交）
  submitQuarterlyQuestItems(questId) {
    const result = submitQuarterlyQuestItems(this.state, questId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`完成季度任务：${String(result.msg).replace('完成任务：', '').split('，')[0]}。`);
      updateStat(this.state.player, 'questCompleted', 1); // 完成任务数（赏金猎人职业条件）
      this.checkCultivationProfessions();
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // ===== 任务系统 =====
  getQuests() {
    return getQuestList(this.state.player);
  }

  getDailyQuests() {
    return getDailyQuests(this.state.player);
  }

  getAvailableSideQuests() {
    return getAvailableSideQuests(this.state.player);
  }

  acceptSideQuest(questId) {
    const p = this.state.player;
    const result = acceptQuest(p, questId);
    if (result.success) this.addLog(`接取任务：${result.quest.title}`);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  // ===== 炼丹系统 =====
  getAlchemyInfo() {
    const p = this.state.player;
    return {
      level: getAlchemyLevel(p),
      recipes: getAvailableRecipes(p),
      allRecipes: getAllRecipes(),
    };
  }

  refinePill(recipeId) {
    const p = this.state.player;
    const result = refinePill(p, recipeId);
    this.addLog(result.msg);
    if (result.success) {
      this.addJournal(`炼制出${result.quality}${result.itemName}`);
      p.alchemy.refineCount = (p.alchemy.refineCount || 0) + 1; // 炼丹次数（丹修职业条件）
      if (result.itemName) {
        const baseName = String(result.itemName).replace(/^(普通|上品|极品|丹纹)/, '');
        updateQuarterlyProgress(this.state, 'alchemy', { item: baseName });
        updateQuarterlyProgress(this.state, 'collect', { item: baseName });
      }
      this.checkCultivationProfessions();
    }
    return this.getPublicState();
  }

  learnAlchemyRecipe(recipeId) {
    const p = this.state.player;
    const result = learnRecipe(p, recipeId);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  // 丹塔藏经阁 - 获取可学习丹方
  getTowerRecipes() {
    const p = this.state.player;
    const towerRecipes = refreshTowerRecipes(p, this.state.gameDateText || '');
    const recipes = towerRecipes.map(id => {
      const r = RECIPES.find(rec => rec.id === id);
      return r ? { ...r, progress: p.alchemy.learning[id] || 0 } : null;
    }).filter(Boolean);
    return { recipes, learned: p.alchemy.recipes, learning: p.alchemy.learning };
  }

  // 研读丹方
  studyAlchemyRecipe(recipeId) {
    const p = this.state.player;
    const result = studyRecipe(p, recipeId);
    this.addLog(result.msg);
    if (result.learned) {
      this.addJournal(`学会了${RECIPES.find(r => r.id === recipeId)?.name}的炼制方法。`);
    }
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 偷窃系统 =====
  getStealInfo() {
    const p = this.state.player;
    initSteal(p);
    return {
      level: getStealLevel(p),
      steal: p.steal,
      levels: STEAL_LEVELS,
    };
  }

  stealFromNpc(npcId) {
    const p = this.state.player;
    const target = this.state.npcs.find(n => n.id === npcId);
    if (!target) return { error: '没有这个NPC' };
    if (target.location !== p.location) return { error: '此人不在此地，无法偷窃' };
    // 相识判定
    if (!target.knownByPlayer) {
      target.knownByPlayer = true;
      if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);
    }

    initSteal(p);
    const result = doSteal(p, target, p.location);
    this.addLog(result.msg);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 战斗系统 =====
  startCombat(npcId) {
    const p = this.state.player;
    const enemy = this.state.npcs.find(n => n.id === npcId);
    if (!enemy) return { error: '没有这个NPC' };
    if (!enemy.isAlive) return { error: '此人已死' };
    if (enemy.location !== p.location) return { error: '此人不在此地' };

    // NPC自动装备
    const { npcAutoEquip } = require('./combat');
    npcAutoEquip(enemy);
    npcAutoEquip(p);

    // 保存战斗状态
    this.state.combat = {
      enemyId: npcId,
      turn: 'player',
      log: [`你向${enemy.name}发起了挑战！`],
      playerHp: p.hp.current,
      playerMp: p.mp.current,
      enemyHp: enemy.hp.current,
      enemyMp: enemy.mp.current,
    };

    return {
      success: true,
      combat: this.state.combat,
      player: { name: p.name, hp: p.hp, mp: p.mp, equipment: p.equipment, realm: p.realm, portrait: p.portrait },
      enemy: { id: enemy.id, name: enemy.name, hp: enemy.hp, mp: enemy.mp, equipment: enemy.equipment, realm: enemy.realm, portrait: enemy.portrait },
      state: this.getPublicState(),
    };
  }

  combatAction(action) {
    const p = this.state.player;
    const combat = this.state.combat;
    if (!combat) return { error: '没有进行中的战斗' };

    const enemy = this.state.npcs.find(n => n.id === combat.enemyId);
    if (!enemy) return { error: '对手不存在' };

    const { playerAction, enemyAction, applyDefeatPenalty, killEnemy, handleNpcDeathWives } = require('./combat');

    // 玩家行动
    const playerResult = playerAction(p, enemy, action);
    combat.log.push(...playerResult.log);

    // 如果是使用丹药或更换装备，不消耗回合，直接返回
    if (playerResult.type === 'pill' || playerResult.type === 'equip' || playerResult.type === 'talisman') {
      return {
        combat,
        player: { name: p.name, hp: p.hp, mp: p.mp, equipment: p.equipment, portrait: p.portrait },
        enemy: { id: enemy.id, name: enemy.name, hp: enemy.hp, mp: enemy.mp, equipment: enemy.equipment, portrait: enemy.portrait },
        state: this.getPublicState(),
      };
    }

    // 检查玩家行动结果
    if (playerResult.type === 'fled') {
      combat.log.push('你成功逃离了战斗。');
      this.state.combat = null;
      return { combat, fled: true, state: this.getPublicState() };
    }

    if (playerResult.type === 'victory') {
      combat.log.push('战斗胜利！');
      this.state.combat = null;
      updateQuestProgress(p, 'combat');
      updateQuarterlyProgress(this.state, 'combat');
      // 妖兽类敌人计入击杀进度
      const ename = enemy.name || '';
      if (ename.includes('妖兽') || ename.includes('妖')) {
        updateQuarterlyProgress(this.state, 'kill', { enemy: '妖兽' });
        updateQuestProgress(p, 'kill', { target: '妖兽' });
      }
      return { combat, victory: true, enemyId: enemy.id, state: this.getPublicState() };
    }

    if (playerResult.type === 'draw') {
      combat.log.push('双方灵力耗尽，战斗以平局结束。');
      this.state.combat = null;
      updateQuestProgress(p, 'combat');
      updateQuarterlyProgress(this.state, 'combat');
      return { combat, draw: true, state: this.getPublicState() };
    }

    // 跟随的灵宠协助战斗（最多3只，必定出战并获得加成）
    const { petAssistInCombat } = require('./pet');
    const followPets = (p.pets || []).filter(x => x.following);
    for (const fp of followPets) {
      if (enemy.hp.current <= 0) break;
      const assist = petAssistInCombat(fp, p, enemy);
      if (assist && assist.msg) combat.log.push(assist.msg);
      else if (assist === null) combat.log.push(`${fp.name}没有行动。`);
      else combat.log.push(`【${fp.name}】发起攻击，造成伤害！${assist && assist.skillEffect || ''}`);
      if (enemy.hp.current <= 0) {
        // 灵宠击杀
        combat.log.push(`【${fp.name}】击败了${enemy.name}！战斗胜利！`);
        this.state.combat = null;
        updateQuestProgress(p, 'combat');
        updateQuarterlyProgress(this.state, 'combat');
        const ename = enemy.name || '';
        if (ename.includes('妖兽') || ename.includes('妖')) {
          updateQuarterlyProgress(this.state, 'kill', { enemy: '妖兽' });
          updateQuestProgress(p, 'kill', { target: '妖兽' });
        }
        return { combat, victory: true, enemyId: enemy.id, petKill: true, state: this.getPublicState() };
      }
    }

    // 敌人回合
    const enemyResult = enemyAction(enemy, p);
    combat.log.push(...enemyResult.log);

    if (enemyResult.type === 'defeat') {
      const penalty = applyDefeatPenalty(p);
      combat.log.push(`你战败了！损失气血${penalty.hpLoss}，修为${penalty.expLoss}，陷入虚弱状态。`);
      this.state.combat = null;
      updateQuestProgress(p, 'combat');
      updateQuarterlyProgress(this.state, 'combat');
      return { combat, defeat: true, penalty, state: this.getPublicState() };
    }

    if (enemyResult.type === 'draw') {
      combat.log.push('双方灵力耗尽，战斗以平局结束。');
      this.state.combat = null;
      updateQuestProgress(p, 'combat');
      updateQuarterlyProgress(this.state, 'combat');
      return { combat, draw: true, state: this.getPublicState() };
    }

    return {
      combat,
      player: { name: p.name, hp: p.hp, mp: p.mp, equipment: p.equipment, portrait: p.portrait },
      enemy: { id: enemy.id, name: enemy.name, hp: enemy.hp, mp: enemy.mp, equipment: enemy.equipment, portrait: enemy.portrait },
      state: this.getPublicState(),
    };
  }

  killCombatEnemy(enemyId) {
    const p = this.state.player;
    const enemy = this.state.npcs.find(n => n.id === enemyId);
    if (!enemy) return { error: '没有这个NPC' };

    const { killEnemy, handleNpcDeathWives } = require('./combat');
    const loot = killEnemy(p, enemy);

    // 处理妻妾
    const wifeResults = handleNpcDeathWives(enemy, this.state.npcs);
    for (const wr of wifeResults) {
      this.addLog(`${enemy.name}的妻妾${wr.wife}${wr.action}。`);
    }

    // 剿匪任务联动：击杀山贼类敌人计入任务进度
    if (enemy.name && enemy.name.includes('山贼')) {
      updateQuestProgress(p, 'kill', { target: '山贼' });
      updateQuarterlyProgress(this.state, 'kill', { enemy: '山贼' });
    }

    // 记录记事
    if (!p.personalHistory) p.personalHistory = [];
    p.personalHistory.push(`${this.state.gameDateText}·${p.location}·杀死${enemy.name}，获得其全部财物。`);
    if (!enemy.personalHistory) enemy.personalHistory = [];
    enemy.personalHistory.push(`${this.state.gameDateText}·${enemy.location}·被${p.name}杀死。`);

    this.addLog(`你杀死了${enemy.name}，获得了其库房财物和宠物！`);

    return { success: true, loot, wifeResults, state: this.getPublicState() };
  }

  spareCombatEnemy(enemyId) {
    const p = this.state.player;
    const enemy = this.state.npcs.find(n => n.id === enemyId);
    if (!enemy) return { error: '没有这个NPC' };

    enemy.hp.current = Math.max(1, Math.floor(enemy.hp.max * 0.1));
    enemy.favorWithPlayer = Math.max(-100, (enemy.favorWithPlayer || 0) - 30);
    if (!enemy.statusEffects) enemy.statusEffects = [];
    enemy.statusEffects.push({ name: '虚弱', turns: 5 });

    if (!p.personalHistory) p.personalHistory = [];
    p.personalHistory.push(`${this.state.gameDateText}·${p.location}·击败${enemy.name}后将其放走。`);

    this.addLog(`你放过了${enemy.name}，但对方对你的好感度大幅下降。`);

    return { success: true, state: this.getPublicState() };
  }

  // ===== 炼器系统 =====
  getForgeInfo() {
    const p = this.state.player;
    return {
      level: getForgeLevel(p),
      recipes: getAvailableForgeRecipes(p),
      allRecipes: FORGE_RECIPES,
      elements: ELEMENTS,
    };
  }

  forgeItem(recipeId) {
    const p = this.state.player;
    const result = forgeItem(p, recipeId);
    this.addLog(result.msg);
    if (result.success) {
      updateQuarterlyProgress(this.state, 'forge');
      updateQuestProgress(p, 'forge');
    }
    return this.getPublicState();
  }

  enhanceItem(itemName) {
    const p = this.state.player;
    const result = enhanceItem(p, itemName);
    this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  enchantItem(itemName, element) {
    const p = this.state.player;
    const result = enchantItem(p, itemName, element);
    this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  equipItem(itemName) {
    const p = this.state.player;
    const result = equipItem(p, itemName);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  // ===== 宗门系统 =====
  getAllSects() {
    return getAllSects();
  }

  getSectInfo() {
    return getSectInfo(this.state.player);
  }

  joinSect(sectId) {
    const p = this.state.player;
    const result = joinSect(p, sectId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`加入${p.sect.name}`);
      updateQuestProgress(p, 'joinFaction');
      updateQuarterlyProgress(this.state, 'joinFaction');
      this.checkCultivationProfessions(); // 加入宗门 → 宗门弟子
    }
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  leaveSect() {
    const p = this.state.player;
    const result = leaveSect(p);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  getSectDailyQuests() {
    return getDailySectQuests(this.state.player);
  }

  completeSectQuest(questId) {
    const p = this.state.player;
    const result = completeSectQuest(p, questId);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  exchangeContribution(itemName) {
    const p = this.state.player;
    const result = exchangeContribution(p, itemName);
    if (result.success) this.addLog(result.msg);
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  createSect(name, type) {
    const p = this.state.player;
    const result = createSect(p, name, type);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`创建宗门${name}`);
    }
    return result.success ? this.getPublicState() : { error: result.msg };
  }

  // ===== 成就系统 =====
  getAchievements() {
    return getAchievements(this.state.player);
  }

  claimAchievement(achId) {
    const result = claimAchievement(this.state.player, achId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${formatGameTime(this.state.gameDate)} 成就：${result.msg}`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  // ===== 天气系统 =====
  getWeatherInfo() {
    return getWeatherInfo(this.state.gameDate, this.state.worldState.weather);
  }

  // ===== 阵法系统 =====
  getFormationInfo() {
    const p = this.state.player;
    initFormation(p);
    return {
      level: getFormationLevel(p),
      learned: getLearnedFormations(p),
      available: getAvailableFormations(p),
      active: p.formation.active,
      bonus: getFormationBonus(p),
    };
  }

  learnFormation(formationId) {
    const p = this.state.player;
    const result = learnFormation(p, formationId);
    if (result.success) {
      this.addLog(`学会了${FORMATIONS.find(f => f.id === formationId)?.name}！`);
      this.consumeAP(1);
    }
    return this.getPublicState();
  }

  activateFormation(formationId) {
    const p = this.state.player;
    const result = activateFormation(p, formationId);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  // ===== 坐骑系统 =====
  getMountInfo() {
    const p = this.state.player;
    return {
      mounts: p.mounts || [],
      active: (p.mounts || []).find(m => m.isActive),
      bonus: getMountBonus(p),
    };
  }

  captureMount() {
    const p = this.state.player;
    const result = tryCaptureMount(p, p.location);
    if (result.success) {
      this.addLog(result.msg);
      this.consumeAP(1);
      // 找到刚捕捉的坐骑
      const newMount = (p.mounts || []).find(m => m.name === result.mount?.name);
      return { success: true, text: result.msg, mount: newMount || result.mount, state: this.getPublicState() };
    } else {
      this.addLog(result.msg);
      return { success: false, text: result.msg, state: this.getPublicState() };
    }
  }

  feedMount(mountId) {
    const p = this.state.player;
    const mount = (p.mounts || []).find(m => m.id === mountId);
    if (!mount) return { error: '没有这只坐骑' };
    const result = feedMount(p, mount);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  setActiveMount(mountId) {
    const p = this.state.player;
    const result = setActiveMount(p, mountId);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  // ===== 师徒结义系统 =====
  getMasterDiscipleInfo() {
    const p = this.state.player;
    initMasterDisciple(p);
    return {
      master: p.masterDisciple.master,
      disciples: p.masterDisciple.disciples,
      swornBrothers: p.masterDisciple.swornBrothers,
      bonus: getBrotherhoodBonus(p),
    };
  }

  requestMaster(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    const result = requestMaster(p, npc, this.state.gameDateText);
    this.addLog(result.text);
    if (result.journal) this.addJournal(result.journal);
    // 双向记事（第3/4条）：NPC记事用NPC视角
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·${result.npcJournal || result.journal || result.text.substring(0, 50)}`);
    npc.knownByPlayer = true;
    if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  takeDisciple(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    const result = takeDisciple(p, npc, this.state.gameDateText);
    this.addLog(result.text);
    if (result.journal) this.addJournal(result.journal);
    // 双向记事（第3/4条）：NPC记事用NPC视角
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·${result.npcJournal || result.journal || result.text.substring(0, 50)}`);
    npc.knownByPlayer = true;
    if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  transmitPower(discipleId) {
    const p = this.state.player;
    const result = transmitPower(p, discipleId);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  // 师徒交互
  masterDiscipleInteract(npcId, type) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    const result = masterDiscipleInteract(p, npc, type, this.state.gameDateText);
    this.addLog(result.text);
    if (result.journal) this.addJournal(result.journal);
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}：${result.journal || result.text.substring(0, 50)}`);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  swearBrotherhood(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    const result = swearBrotherhood(p, npc);
    this.addLog(result.msg);
    if (result.success) this.consumeAP(1);
    return this.getPublicState();
  }

  // ===== 称号系统 =====
  getTitleInfo() {
    return getTitleList(this.state.player);
  }

  equipTitle(titleId) {
    const p = this.state.player;
    const result = equipTitle(p, titleId);
    this.addLog(result.msg);
    return this.getPublicState();
  }

  // ===== 副本系统 =====
  getDungeonList() {
    return getDungeonList(this.state.player);
  }

  enterDungeon(dungeonId) {
    const p = this.state.player;
    const dungeon = DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return { error: '没有这个秘境' };
    if (p.realmLevel < dungeon.minRealm) return { error: `境界不足，需要${dungeon.minRealm}阶以上` };

    // 使用dungeon.js中的enterDungeon函数
    const result = enterDungeon(p, dungeonId, this.state.gameDate);
    if (!result.success) return { error: result.msg };

    p.dungeonState = result.dungeonState;
    p.dungeonState.dungeonId = dungeonId;
    this.addLog(result.msg);
    this.addJournal(`进入${dungeon.name}。`);
    this.consumeAP(1);
    return { success: true, dungeon: dungeonId, fee: result.fee, state: this.getPublicState() };
  }

  exploreDungeon(dungeonId, floor) {
    const p = this.state.player;
    if (!p.dungeonState?.active) return { error: '没有进行中的副本' };

    const dungeon = DUNGEONS.find(d => d.id === p.dungeonState.dungeonId);
    if (!dungeon) return { error: '秘境不存在' };

    // 从秘境独特事件中随机选择
    const events = dungeon.events || [];
    if (events.length === 0) return { error: '此秘境暂无事件' };

    const event = randChoice(events);
    const result = { event: { text: event.desc }, rewards: [], effects: {} };

    // 应用事件效果
    if (event.rewards) {
      for (const itemName of event.rewards) {
        const count = randInt(1, 3);
        const existing = p.inventory.find(i => i.name === itemName);
        if (existing) existing.count += count;
        else p.inventory.push({ name: itemName, count });
        result.rewards.push({ name: itemName, count });
      }
    }
    if (event.effects) {
      for (const [key, val] of Object.entries(event.effects)) {
        if (key === 'hp') p.hp.current = Math.max(0, Math.min(p.hp.max, p.hp.current + val));
        else if (key === 'mp') p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + val));
        else if (key === 'cultivationExp') p.cultivationExp += val;
        else if (key === 'reputation') p.reputation = (p.reputation || 0) + val;
        else if (key === 'enlightenment') p.attributes.enlightenment += val;
        result.effects[key] = val;
      }
    }
    if (event.pet) {
      if (!p.pets) p.pets = [];
      p.pets.push({ ...event.pet, level: 1, exp: 0 });
      result.rewards.push({ name: event.pet.name + '（宠物）', count: 1 });
    }
    if (event.combat) {
      // 生成敌人
      const enemy = generateNPC({ location: p.location, realmLevel: dungeon.minRealm + floor });
      enemy.name = dungeon.enemies?.[0]?.name || '秘境守卫';
      enemy.isAlive = true;
      this.state.npcs.push(enemy);
      result.combat = true;
      result.enemyId = enemy.id;
    }

    // 记录记事
    this.addLog(`【${dungeon.name}第${floor}层】${event.desc}`);
    this.addJournal(`${dungeon.name}·${event.name}：${event.desc}`);

    // 探索进度
    p.dungeonState.explored++;
    if (p.dungeonState.explored >= 5 && floor < 3) {
      result.nextFloor = true;
      p.dungeonState.floor++;
      p.dungeonState.explored = 0;
    }


    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // 结算副本奇遇选择（三选一）
  resolveDungeonEncounter(dungeonId, encounterId, optionIndex) {
    const p = this.state.player;
    if (!p.dungeonState?.active) return { error: '没有进行中的副本' };
    const enc = DUNGEON_ENCOUNTERS.find(e => e.id === encounterId);
    if (!enc) return { error: '奇遇不存在' };
    const opt = enc.options[optionIndex];
    if (!opt) return { error: '无效的选择' };

    let texts = [];
    let success = true;
    // 70% 成功 / 30% 触发负面结果（若有）
    if (opt.bad && !chance(70)) {
      success = false;
      const b = opt.bad;
      if (b.hp) { p.hp.current = Math.max(1, Math.min(p.hp.max, p.hp.current + b.hp)); texts.push(`气血${b.hp > 0 ? '+' : ''}${b.hp}`); }
      if (b.mp) { p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + b.mp)); texts.push(`灵力${b.mp > 0 ? '+' : ''}${b.mp}`); }
      if (b.reputation) { p.reputation = Math.max(0, (p.reputation || 0) + b.reputation); texts.push(`声望${b.reputation}`); }
      if (b.karma) { p.karma.merit = Math.max(0, (p.karma?.merit || 0) + b.karma); texts.push(`功德${b.karma}`); }
    } else {
      // 正常结算
      if (opt.effects) {
        for (const [key, val] of Object.entries(opt.effects)) {
          if (key === 'hp') { p.hp.current = Math.max(0, Math.min(p.hp.max, p.hp.current + val)); texts.push(`气血${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'mp') { p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + val)); texts.push(`灵力${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'cultivationExp') { p.cultivationExp += val; texts.push(`修为${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'combatExp') { p.combatExp = (p.combatExp || 0) + val; texts.push(`战斗经验${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'reputation') { p.reputation = (p.reputation || 0) + val; texts.push(`声望${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'enlightenment') { p.attributes.enlightenment += val; texts.push(`悟性${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'silver') { p.silver = (p.silver || 0) + val; texts.push(`银两${val > 0 ? '+' : ''}${val}`); }
          else if (key === 'karma') { p.karma.merit = Math.max(0, (p.karma?.merit || 0) + val); texts.push(`功德${val > 0 ? '+' : ''}${val}`); }
        }
      }
      if (opt.item) {
        const existing = p.inventory.find(i => i.name === opt.item);
        if (existing) existing.count++;
        else p.inventory.push({ name: opt.item, count: 1 });
        texts.push(`获得${opt.item}`);
      }
      if (opt.pet) {
        if (!p.pets) p.pets = [];
        p.pets.push({ ...opt.pet, level: 1, exp: 0 });
        texts.push(`获得宠物：${opt.pet.name}`);
      }
    }

    const resultMsg = success
      ? `${enc.title}：你选择了「${opt.text}」，${texts.join('，') || '平安无事'}。`
      : `${enc.title}：你选择了「${opt.text}」，却遭遇了意外！${texts.join('，')}`;
    this.addLog(`【副本奇遇】${resultMsg}`);
    this.addJournal(`${this.state.gameDateText}·${p.location}·${resultMsg}`);
    return { success, msg: resultMsg, state: this.getPublicState() };
  }

  restInDungeon(dungeonId) {
    const p = this.state.player;
    if (!p.dungeonState?.active) return { error: '没有进行中的副本' };

    const hpRestore = Math.floor(p.hp.max * 0.3);
    const mpRestore = Math.floor(p.mp.max * 0.3);
    p.hp.current = Math.min(p.hp.max, p.hp.current + hpRestore);
    p.mp.current = Math.min(p.mp.max, p.mp.current + mpRestore);

    this.addLog(`你在秘境中休息，恢复气血${hpRestore}，灵力${mpRestore}。`);
    this.consumeAP(1);
    return { success: true, text: `你原地休息，恢复气血${hpRestore}，灵力${mpRestore}。`, state: this.getPublicState() };
  }

  challengeDungeonBoss(dungeonId) {
    const p = this.state.player;
    if (!p.dungeonState?.active) return { error: '没有进行中的副本' };

    const dungeon = DUNGEONS.find(d => d.id === p.dungeonState.dungeonId);
    if (!dungeon) return { error: '秘境不存在' };

    // 使用妖兽体系生成Boss
    const bossTier = Math.min(6, Math.max(1, (dungeon.boss?.realmLevel || dungeon.minRealm + 2) - 1));
    const boss = generateBoss(dungeonId, bossTier);
    boss.maxHp = boss.hp;
    boss.maxMp = boss.mp;

    this.addLog(`你挑战了${dungeon.name}的Boss：${boss.name}！`);
    this.addJournal(`挑战${dungeon.name}Boss：${boss.name}。`);

    return { success: true, beast: boss, state: this.getPublicState() };
  }

  exitDungeon() {
    const p = this.state.player;
    if (!p.dungeonState?.active) return { error: '没有进行中的副本' };
    const result = exitDungeon(p, p.dungeonState);
    this.addLog(result.msg);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 蛊术体系（万毒沼泽蛊师小屋） =====
  getGuInfo() {
    const p = this.state.player;
    return { ...getGuInfo(p), state: this.getPublicState() };
  }

  // ===== 珍宝阁：贡献兑换秘宝 / 盗取 =====
  getTreasureGoods() {
    return getTreasureGoods(this.state);
  }

  exchangeTreasure(goodsId) {
    const result = exchangeTreasure(this.state, goodsId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${result.msg}`);
    }
    return { ...result, state: this.getPublicState() };
  }

  treasureSteal() {
    const result = stealTreasure(this.state);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${result.msg}`);
    } else {
      this.addLog(result.msg);
    }
    return { ...result, state: this.getPublicState() };
  }

  // ===== 青云剑宗独有功法 =====
  getQingyunArts() {
    return getQingyunArts(this.state.player);
  }

  learnQingyunArt(artId) {
    const result = learnQingyunArt(this.state.player, artId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${result.msg}`);
    }
    return { ...result, state: this.getPublicState() };
  }

  learnGuArt(artId) {
    const p = this.state.player;
    const result = learnGuArt(p, artId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${p.location}·${result.msg}`);
    }
    return { ...result, state: this.getPublicState() };
  }

  buyGuWorm(wormId) {
    const p = this.state.player;
    const result = buyGuWorm(p, wormId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${p.location}·${result.msg}`);
    }
    return { ...result, state: this.getPublicState() };
  }

  // ===== 传书功能 =====
  // 固定话语选项
  getLetterTemplates() {
    return [
      { id: 'greeting', text: '问候安好', content: '许久未见，不知你近来可好？甚是挂念。' },
      { id: 'miss', text: '表达思念', content: '自别后，日夜思念，盼能早日相见。' },
      { id: 'gift', text: '约赠礼物', content: '近日得一好物，想赠予你，不知何时方便？' },
      { id: 'invite', text: '邀请相聚', content: '寒舍略备薄酒，望你能拨冗前来一聚。' },
      { id: 'business', text: '商谈事宜', content: '有一事想与你商议，盼能回信告知。' },
      { id: 'care', text: '关心近况', content: '听闻你那边近日不太平，务必保重身体。' },
      { id: 'thanks', text: '表达感谢', content: '前日承蒙关照，感激不尽，特致信感谢。' },
      { id: 'apology', text: '致歉', content: '前事多有得罪，望你海涵，特此致歉。' },
    ];
  }

  sendLetter(npcId, content, templateId = null) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    // 亲属（三代以内）天然已相识，允许传书
    const { isCloseRelative } = require('./threeActStory');
    if (!p.acquaintances.includes(npcId) && !isCloseRelative(p, npc, this.state.npcs)) return { error: '你还不认识这个人' };
    if (npc.location === p.location) return { error: '对方就在此地，直接交谈即可' };
    if (p.spiritStone < 10) return { error: '传书需要10灵石' };

    p.spiritStone -= 10;
    if (!p.letters) p.letters = [];
    if (!npc.letters) npc.letters = [];

    const letterContent = templateId ? (this.getLetterTemplates().find(t => t.id === templateId)?.content || content) : content;

    const letter = {
      id: genId('letter'),
      from: p.name,
      fromId: p.id,
      to: npc.name,
      toId: npc.id,
      content: letterContent,
      templateId,
      timestamp: this.state.gameDate,
      timestampText: this.state.gameDateText,
      read: false,
      type: 'sent',
    };
    npc.letters.push(letter);
    p.letters.push({ ...letter, from: '你', to: npc.name, type: 'sent' });

    // 根据好感、性格、模板生成不同回信
    const favor = npc.favorWithPlayer || 0;
    const personality = npc.personality || '普通';
    let replyPool = [];

    if (favor >= 200) {
      replyPool = [
        `${npc.name}回信说："收到你的信，心中欢喜，恨不得立刻飞到你身边。"`,
        `${npc.name}回信说："你我之间何须多礼，你的心意我都明白。"`,
        `${npc.name}回信说："日日思君不见君，共饮此水，盼重逢之日。"`,
        `${npc.name}回信说："收到你的信，我看了一遍又一遍，心中温暖。"`,
      ];
    } else if (favor >= 50) {
      replyPool = [
        `${npc.name}回信说："收到你的信了，一切安好，勿念。改日定当登门拜访。"`,
        `${npc.name}回信说："许久不见，甚是想念，有空定当相聚。"`,
        `${npc.name}回信说："你说的事我记下了，有消息会通知你。"`,
        `${npc.name}回信说："收到来信，心中甚慰，愿你一切顺利。"`,
      ];
    } else if (favor >= 0) {
      replyPool = [
        `${npc.name}回信说："信已收到，知道了。"`,
        `${npc.name}回信说："收到，有事再联系。"`,
        `${npc.name}回信说："多谢挂念，我这边一切都好。"`,
        `${npc.name}回信说："来信阅毕，勿念。"`,
      ];
    } else {
      replyPool = [
        `${npc.name}回信说："哼，你还有脸写信来？"`,
        `${npc.name}回信说："收到，但我不想多说什么。"`,
        `${npc.name}回信说："别来烦我。"`,
        `${npc.name}回信说："...知道了。"`,
      ];
    }

    // 性格影响
    if (personality === '热情' || personality === '开朗') {
      replyPool = replyPool.map(r => r.replace('。', '！'));
    } else if (personality === '冷漠' || personality === '孤傲') {
      replyPool = replyPool.map(r => r.substring(0, Math.floor(r.length * 0.6)) + '。"');
    }

    const reply = randChoice(replyPool);

    // 保存回信
    const replyLetter = {
      id: genId('letter'),
      from: npc.name,
      fromId: npc.id,
      to: '你',
      toId: p.id,
      content: reply.replace(`${npc.name}回信说："`, '').replace(/"$/, ''),
      timestamp: this.state.gameDate,
      timestampText: this.state.gameDateText,
      read: false,
      type: 'received',
    };
    p.letters.push(replyLetter);

    this.addLog(`你给${npc.name}传书，${reply}`);
    this.addJournal(`${this.state.gameDateText}·传书给${npc.name}：${letterContent.substring(0, 15)}...，收到回信。`);
    npc.favorWithPlayer = Math.min(1000, npc.favorWithPlayer + 2);

    return { success: true, msg: reply, letter: replyLetter, state: this.getPublicState() };
  }

  getLetters() {
    const p = this.state.player;
    return (p.letters || []).slice().reverse();
  }

  // ===== 获取NPC详细信息（含立绘和库房） =====
  getNPCDetail(npcId, name) {
    if (!this.state || !this.state.npcs) return { error: '当前无存档数据，请先创建角色', npcName: name || null };
    let npc = this.state.npcs.find(n => n.id === npcId);
    // 兜底：id找不到时按名字查找（含死亡NPC；被清理则确实查无此人）
    if (!npc && name) {
      npc = this.state.npcs.find(n => n.name === name);
    }
    if (!npc) {
      // 灵姬/灵郎（未赎身，不在 npcs）：按 id 或名字在风花雪月数据中查找
      const wfGen = this.state.windFlower?.generated || {};
      for (const loc of Object.keys(wfGen)) {
        const w = wfGen[loc].find(x => x.id === npcId || (name && x.name === name));
        if (w) {
          const { getPortrait } = require('./utils');
          return {
            id: w.id, name: w.name, gender: w.gender, age: w.age,
            portrait: getPortrait(w.age, w.gender),
            realm: '凡人境', realmLevel: 0, subStage: null,
            professionName: w.gender === '女' ? '灵姬' : '灵郎',
            location: loc, knownByPlayer: true, isAlive: true,
            isWindFlower: true, freed: !!w.freed,
            isSameLocation: loc === this.state.player.location,
            favorWithPlayer: w.favor, personalHistory: w.notes || [],
            appearanceLabel: w.appearanceLabel, popularity: w.popularity,
            cost: w.cost, redeemPrice: w.redeemPrice, favor: w.favor,
            tags: [], relations: {}, family: {},
          };
        }
      }
      return { error: '该NPC已不在人世（或数据已被清理）', npcName: name || null };
    }
    const detail = {
      ...npc,
      location: npc.invitedByPlayer ? '宅子中' : npc.location,
      tags: (npc.tags || []).map(tid => getTagInfo(tid)),
      isSameLocation: npc.location === this.state.player.location,
      // 三代以内亲属关系标注（前端显示亲属称呼）
      relToPlayer: relLabel(this.state.player, npc, this.state.npcs) || null,
    };
    // 需求④：库房物品与世界物品系统建立链接（价格/类型/描述，来源=物品价格表）
    if (detail.warehouse && detail.warehouse.items && detail.warehouse.items.length > 0) {
      try {
        const { BASE_PRICES } = require('./priceSystem');
        detail.warehouse.items = detail.warehouse.items.map(it => {
          const info = BASE_PRICES && BASE_PRICES[it.name];
          return {
            ...it,
            itemInfo: info ? { price: info.price, type: info.type, desc: info.desc } : { price: null, type: '未知', desc: '世间流通之物，暂无图鉴记载' },
          };
        });
      } catch (e) { /* 物品系统不可用时保持原样 */ }
    }
    // ③ 家族字段补名字：spouse 只有 id，前端可能因不在当前列表而查不到 → 补 spouseName（含已故）
    if (detail.family && detail.family.spouse) {
      const sp = this.state.npcs.find(x => x.id === detail.family.spouse);
      detail.family.spouseName = sp ? sp.name : '（已故或下落不明）';
    }
    // ③.5 家族字段补真实父/母姓名：父/母实体可能在 npcs 全集但不在前端可见列表，
    //     必须用实体真名覆盖 generateNPC 的初始幽灵名，否则前端 fallback 显示错误亲属
    if (detail.family && (detail.family.father || detail.family.mother)) {
      if (detail.family.father) {
        const fa = this.state.npcs.find(x => x.id === detail.family.father);
        if (fa) detail.family.fatherName = fa.name;
      }
      if (detail.family.mother) {
        const mo = this.state.npcs.find(x => x.id === detail.family.mother);
        if (mo) detail.family.motherName = mo.name;
      }
    }
    if (detail.family && detail.family.children && detail.family.children.length > 0) {
      // 需求：子嗣完整信息（含已亡故/异地/未认识的子嗣），前端家族/后宅据此兜底显示
      detail.family.childrenInfo = detail.family.children.map(id => {
        const c = this.state.npcs.find(x => x.id === id);
        return c ? { id: c.id, name: c.name, gender: c.gender, realm: c.realm, portrait: c.portrait || '', isAlive: c.isAlive !== false } : null;
      });
    }
    return detail;
  }

  // ===== 触发单人随机剧情（弹窗） =====
  triggerSoloEvent(attribute) {
    const p = this.state.player;
    const event = getAttributeEvent(attribute, {
      location: p.location,
      weather: this.state.worldState.weather,
      tags: p.tags,
      profession: p.profession,
      inventory: p.inventory,
    });
    if (!event) return { error: '没有可用的剧情' };

    // 应用效果
    if (event.effects) {
      for (const key in event.effects) {
        if (typeof event.effects[key] === 'number' && p[key] !== undefined) {
          p[key] += event.effects[key];
        }
      }
    }

    this.addLog(event.text);
    this.addJournal(event.journal);
    return { success: true, event, state: this.getPublicState() };
  }

  // ===== 触发交互随机剧情（弹窗） =====
  triggerInteractionEvent(npcId, action) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };

    const { pickInteractionEvent } = require('../data/interactionStory');
    let event = pickInteractionEvent(action, p, npc, p.location);

    // 需求5：interactionEvents 交互库同时启用随机（50%概率走该库，两个库共30+条混合）
    if (Math.random() < 0.5) {
      const { getInteractionEvent, fillEventText } = require('../data/interactionEvents');
      const ev2 = getInteractionEvent(action, {
        favor: npc.favorWithPlayer || 0,
        gender: p.gender === '男' ? 'male' : 'female',
        npcGender: npc.gender === '男' ? 'male' : 'female',
        npcProfession: npc.profession || npc.professionName || '',
        location: p.location,
        npcRealmLevel: npc.realmLevel || 1,
        playerRealmLevel: p.realmLevel || 1,
      });
      if (ev2) {
        const npcAct = action === 'chat' ? '交谈' : action === 'spar' ? '切磋' : action === 'gift' ? '互赠礼物' : '相处';
        event = {
          text: fillEventText(ev2.text, { npcName: npc.name, playerName: p.name, location: p.location, npcGender: npc.gender }),
          journal: fillEventText(ev2.journal, { npcName: npc.name, playerName: p.name, location: p.location, npcGender: npc.gender }),
          npcJournal: `${p.location}·${npc.name}与${p.name}${npcAct}。`,
          effects: { ...ev2.effects },
        };
      }
    }

    if (!event) return { error: '没有可用的剧情' };

    // 应用效果
    if (event.effects) {
      if (event.effects.favor) npc.favorWithPlayer = Math.max(-100, Math.min(100, npc.favorWithPlayer + event.effects.favor));
      if (event.effects.cultivationExp) p.cultivationExp += event.effects.cultivationExp;
      if (event.effects.hp) {
        // 兼容数字 hp（旧档/NPC结构可能为数字，防止在数字上建 current 崩溃）
        if (typeof p.hp === 'number') p.hp = { current: p.hp, max: p.hp };
        p.hp.current = Math.max(0, Math.min(p.hp.max, p.hp.current + event.effects.hp));
      }
      if (event.effects.mp) {
        if (typeof p.mp === 'number') p.mp = { current: p.mp, max: p.mp };
        p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + event.effects.mp));
      }
      if (event.effects.silver) p.silver = Math.max(0, p.silver + event.effects.silver);
      if (event.effects.spiritStone) p.spiritStone = Math.max(0, p.spiritStone + event.effects.spiritStone);
      if (event.effects.reputation) p.reputation = (p.reputation || 0) + event.effects.reputation;
      if (event.effects.enlightenment) p.attributes.enlightenment += event.effects.enlightenment;
      if (event.effects.combatExp) p.combatExp = (p.combatExp || 0) + event.effects.combatExp;
    }

    // 每次交互都判定双方已认识
    npc.knownByPlayer = true;
    if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);

    this.addLog(event.text);
    // 双向记事（第4条）：主控记事用主控视角（event.journal），NPC记事用NPC视角（event.npcJournal），世界记事用主控视角
    this.addJournal(event.journal);
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·${event.npcJournal || event.journal}`);
    // ① 玩家参与的交互剧情写入世界记事
    this.addWorldJournal(npc.name, `${p.name}在${p.location}${event.journal}`);

    this.consumeAP(1);

    return { success: true, event, npc, state: this.getPublicState() };
  }
  // ===== 交互（索要/赠送物品） =====
  interact(npcId, action, itemName) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };

    // 每次交互都判定双方已认识
    npc.knownByPlayer = true;
    if (!p.acquaintances.includes(npcId)) p.acquaintances.push(npcId);

    if (action === 'gift_item') {
      // 赠送物品给NPC
      const itemIdx = p.inventory.findIndex(i => i.name === itemName);
      if (itemIdx === -1) return { error: '你没有这个物品' };
      p.inventory[itemIdx].count--;
      if (p.inventory[itemIdx].count <= 0) p.inventory.splice(itemIdx, 1);

      // 根据喜恶调整好感度
      let favorChange = 2; // 默认无感：少量好感
      let reaction = '对方不以为意';
      if (npc.likes && npc.likes.includes(itemName)) {
        favorChange = randInt(8, 15);
        reaction = '对方十分喜欢，大喜过望';
      } else if (npc.dislikes && npc.dislikes.includes(itemName)) {
        favorChange = -randInt(5, 10);
        reaction = '对方面露厌恶，十分不喜';
      }
      npc.favorWithPlayer = Math.max(-100, Math.min(100, (npc.favorWithPlayer || 0) + favorChange));

      // 物品放入NPC库房
      if (!npc.warehouse) npc.warehouse = { items: [], valuables: [] };
      const existing = npc.warehouse.items.find(i => i.name === itemName);
      if (existing) existing.count++;
      else npc.warehouse.items.push({ name: itemName, count: 1 });

      const journalText = `${this.state.gameDateText}·${p.location}·赠送${itemName}给${npc.name}，${reaction}，好感度${favorChange >= 0 ? '+' : ''}${favorChange}`;
      this.addLog(`你赠送了${itemName}给${npc.name}，${reaction}，好感度${favorChange >= 0 ? '+' : ''}${favorChange}`);
      this.addJournal(journalText);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(journalText);

      return { success: true, favorChange, reaction, state: this.getPublicState() };
    } else if (action === 'request_item') {
      // 向NPC索要物品
      if (npc.favorWithPlayer < 30) return { error: '好感度不足30，对方不愿给你东西' };
      const itemIdx = npc.warehouse?.items?.findIndex(i => i.name === itemName);
      if (itemIdx === -1) return { error: '对方没有这个物品' };
      npc.warehouse.items[itemIdx].count--;
      if (npc.warehouse.items[itemIdx].count <= 0) npc.warehouse.items.splice(itemIdx, 1);
      const existing = p.inventory.find(i => i.name === itemName);
      if (existing) existing.count++;
      else p.inventory.push({ name: itemName, count: 1 });
      npc.favorWithPlayer -= 3;
      this.addLog(`${npc.name}送给你${itemName}，好感度-3`);
      this.addJournal(`从${npc.name}处获得${itemName}`);
      return { success: true, state: this.getPublicState() };
    }
    return { error: '未知操作' };
  }

  // 死亡记事：为本轮所有未记录的死亡NPC补写世界记事/个人记事，并通知玩家
  notifyDeaths() {
    const p = this.state.player;
    const dead = this.state.npcs.filter(n => n.isAlive === false && !n.deathNotified && n.deathCause);
    for (const npc of dead) {
      const cause = npc.deathCause || '去世';
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·${npc.location}·${cause}。`);
      this.addWorldJournal(npc.name, `${npc.name}${cause !== '去世' ? '（' + cause + '）' : ''}去世。`);
      const fam = p.family || {};
      const related = npc.knownByPlayer || (npc.favorWithPlayer || 0) > 30 ||
        fam.spouse === npc.id || fam.father === npc.id || fam.mother === npc.id ||
        (fam.children || []).includes(npc.id);
      if (related) this.addJournal(`听闻${npc.name}${cause !== '去世' ? '（' + cause + '）' : ''}去世，心中不免感慨。`);
      // 需求⑥：NPC死亡后遗产随机传给子嗣/亲属
      const { distributeInheritance } = require('./succession');
      const inheritNote = distributeInheritance(this.state, npc);
      if (inheritNote) this.addWorldJournal(npc.name, inheritNote);
      npc.deathNotified = true;
    }
    return dead.length;
  }

  // 皇帝驾崩检查：现任皇帝死亡时触发继承（月度tick已处理，战斗/其他死亡路径兜底）
  checkRoyalSuccession() {
    try {
      const { succeedEmperor } = require('./royalCourt');
      const emp = this.state.empire;
      if (!emp) return;
      const emperor = this.state.npcs.find(n => n.id === emp.emperorId);
      if (!emperor || emperor.isAlive !== false) return;
      const events = succeedEmperor(this.state);
      for (const ev of events) {
        this.addLog(ev);
        this.addWorldJournal('大夏皇室', ev);
      }
    } catch (e) {
      console.error('皇帝继承检查错误:', e.message);
    }
  }

  // 需求⑦：主控手动传代
  playerSuccession(npcId) {
    const { playerSuccession } = require('./succession');
    const result = playerSuccession(this.state, npcId);
    if (result.success) {
      this.addLog(result.msg);
      this.addWorldJournal(result.state.player.name, `${result.msg}`);
      return { success: true, msg: result.msg, state: this.getPublicState() };
    }
    return result;
  }

  // 清理死亡NPC及其记事
  cleanDeadNpcs() {
    const deadNpcs = this.state.npcs.filter(n => n.isAlive === false);
    const removed = deadNpcs.length;

    // 从NPC列表中移除
    this.state.npcs = this.state.npcs.filter(n => n.isAlive !== false);

    // 从玩家关系网中移除
    if (this.state.player.relations) {
      this.state.player.relations = this.state.player.relations.filter(r =>
        !deadNpcs.some(d => d.id === r.id)
      );
    }

    // 从玩家记事中移除涉及死亡NPC的记事
    if (this.state.player.journal) {
      this.state.player.journal = this.state.player.journal.filter(j => {
        const msg = typeof j === 'object' ? j.msg : j;
        return !deadNpcs.some(d => msg.includes(d.name));
      });
    }

    this.addLog(`清理了${removed}个死亡NPC的数据。`);
    return { success: true, removed, state: this.getPublicState() };
  }

  // 清理单个死亡NPC及其记事
  cleanNpc(npcId) {
    const dead = this.state.npcs.find(n => n.id === npcId && n.isAlive === false);
    if (!dead) return { error: '该NPC不存在或未死亡' };

    this.state.npcs = this.state.npcs.filter(n => n.id !== npcId);

    if (this.state.player.relations) {
      this.state.player.relations = this.state.player.relations.filter(r => r.id !== npcId);
    }
    if (this.state.player.acquaintances) {
      this.state.player.acquaintances = this.state.player.acquaintances.filter(id => id !== npcId);
    }
    if (this.state.player.journal) {
      this.state.player.journal = this.state.player.journal.filter(j => {
        const msg = typeof j === 'object' ? j.msg : j;
        return !msg.includes(dead.name);
      });
    }

    this.addLog(`清理了死亡NPC${dead.name}的数据。`);
    return { success: true, removed: 1, state: this.getPublicState() };
  }

  // ===== 摊位系统 =====
  // 旧档摊位数据补全来源标注（摊位物品与世界真实物品挂钩，旧格式无 source 时补齐）
  enrichStallSources(stall) {
    if (!stall || !Array.isArray(stall.goods)) return stall;
    for (const g of stall.goods) {
      if (!g.source || !g.basePrice) {
        const wp = getWorldBasePrice(g.name);
        if (wp) {
          if (!g.source) g.source = wp.source;
          if (!g.basePrice) g.basePrice = wp.price;
        }
      }
    }
    return stall;
  }

  getStallsAtLocation(location) {
    if (!this.state.stalls) this.state.stalls = [];
    return this.state.stalls
      .filter(s => s.location === location && s.expiresAt > Date.now())
      .map(s => this.enrichStallSources(s));
  }

  getStall(stallId) {
    const stall = this.state.stalls.find(s => s.id === stallId);
    return stall ? this.enrichStallSources(stall) : null;
  }

  bargainAtStall(stallId, itemName) {
    const stall = this.getStall(stallId);
    if (!stall) return { error: '没有这个摊位' };
    const p = this.state.player;
    const persuasion = p.attributes?.charisma || 50;
    const result = bargain(stall, itemName, persuasion);
    this.addLog(result.text);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  buyAtStall(stallId, itemName) {
    const stall = this.getStall(stallId);
    if (!stall) return { error: '没有这个摊位' };
    const p = this.state.player;
    const result = buyFromStall(stall, itemName, p);
    if (result.success) {
      this.addLog(result.text);
      this.addJournal(result.text);
      this.consumeAP(1);
    }
    return { ...result, state: this.getPublicState() };
  }

  stealAtStall(stallId, itemName) {
    const stall = this.getStall(stallId);
    if (!stall) return { error: '没有这个摊位' };
    const p = this.state.player;
    const result = stealFromStall(stall, itemName, p);
    this.addLog(result.text);
    this.addJournal(result.text);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 浮动价格系统 =====
  getItemPrice(itemName) {
    return getCurrentPrice(itemName);
  }

  // 按地点获取浮动价格商品（与 shopType 版 getShopGoods 区分，避免同名覆盖）
  getShopGoodsAtLocation(location) {
    return getShopGoodsForLocation(location);
  }
  // ===== 学习系统 =====
  getLearningList(category) {
    const p = this.state.player;
    return getLearningList(p, category);
  }

  // ===== 功法栏系统 =====
  getTechniqueState() {
    const p = this.state.player;
    return getTechniqueState(p);
  }

  equipTechnique(techId) {
    const p = this.state.player;
    const result = equipTechnique(p, techId);
    if (result.error) return { error: result.error };
    this.addLog(result.msg);
    this.addJournal(`${this.state.gameDateText}·放置功法${result.msg.replace('已将【', '').replace('】放入功法栏，加成生效', '')}`);
    return { ...result, state: this.getPublicState() };
  }

  unequipTechnique(techId) {
    const p = this.state.player;
    const result = unequipTechnique(p, techId);
    if (result.error) return { error: result.error };
    this.addLog(result.msg);
    return { ...result, state: this.getPublicState() };
  }

  // 学会特定内容 → 获得对应修仙职业（多职业并存）
  grantCultivationProfessionFromLearning(category, item) {
    if (!item) return;
    const p = this.state.player;
    let professionName = null;
    if (category === 'alchemy') professionName = '炼丹师';
    else if (category === 'forge') professionName = '炼器师';
    else if (category === 'formation') professionName = '阵法师';
    else if (category === 'technique') {
      // 学会剑诀→剑修、道法→符师外的道修不强制，功法只是加成；剑诀对应剑修
      if (item.id === 'jianjue') professionName = '剑修';
      else return;
    }
    if (!professionName) return;
    const { addCultivationProfession } = require('./workSystem');
    const before = (p.professions?.cultivation || []).slice();
    addCultivationProfession(p, professionName);
    if (!before.includes(professionName)) {
      this.addLog(`你获得了修仙职业【${professionName}】！`);
      this.addJournal(`${this.state.gameDateText}·获得修仙职业【${professionName}】`);
    }
  }

  // 全量检查修仙职业获取（多职业并存，满足条件即获得；动作点调用）
  checkCultivationProfessions() {
    const p = this.state.player;
    const { addCultivationProfession } = require('./workSystem');
    const cur = (p.professions?.cultivation) || [];
    const hasLearnedAny = (cat) => Object.values(p.learning?.[cat] || {}).some(x => x && x.learned);
    const conditions = [
      { name: '炼丹学徒', test: () => !!p.alchemy?.exp },
      { name: '炼丹师', test: () => hasLearnedAny('alchemy') },
      { name: '丹修', test: () => (p.alchemy?.refineCount || 0) >= 10 },
      { name: '炼器学徒', test: () => !!p.forge?.exp },
      { name: '炼器师', test: () => hasLearnedAny('forge') },
      { name: '阵法师', test: () => hasLearnedAny('formation') },
      { name: '符师', test: () => (p.talisman?.learned && p.talisman.learned.length > 0) || (p.talisman?.craftCount || 0) > 0 },
      { name: '符修', test: () => (p.talisman?.craftCount || 0) >= 5 },
      { name: '剑修', test: () => !!p.learning?.technique?.jianjue?.learned },
      { name: '体修', test: () => (p.attributes?.constitution || 0) >= 80 },
      { name: '兽修', test: () => (p.pets?.length || 0) >= 1 },
      { name: '冒险者', test: () => (p.achievements?.stats?.exploreCount || 0) >= 10 },
      { name: '赏金猎人', test: () => (p.achievements?.stats?.questCompleted || 0) >= 5 },
      { name: '宗门弟子', test: () => !!p.sect?.id },
      { name: '宗门长老', test: () => p.sect?.position === '长老' || (p.sect?.contribution || 0) >= 15000 },
      { name: '魔修', test: () => (p.inventory || []).some(i => i.name === '魔功秘籍') },
      { name: '坊市掌柜', test: () => (p.inventory || []).some(i => i.name === '店铺地契') },
    ];
    const newly = [];
    for (const c of conditions) {
      if (!cur.includes(c.name) && c.test()) {
        addCultivationProfession(p, c.name);
        newly.push(c.name);
      }
    }
    if (newly.length > 0) {
      this.addLog(`你获得了修仙职业：${newly.join('、')}！`);
      this.addJournal(`${this.state.gameDateText}·获得修仙职业：${newly.join('、')}`);
    }
    return newly;
  }

  studyItem(category, itemId) {
    const p = this.state.player;
    // 学习点只能学习低品级（level <= 3）的内容
    const allItems = getAllItems(category);
    const item = allItems.find(i => i.id === itemId);
    if (!item) return { error: '没有这个学习内容' };
    if (item.level > 3) return { error: '此处只能学习低品级内容，高品级请前往对应藏经阁学习' };

    const result = study(p, category, itemId);
    if (result.error) return result;
    const event = getRandomLearningEvent();
    let totalProgress = result.studyProgress;
    if (event.bonus) {
      const bonusResult = addLearningProgress(p, category, itemId, event.bonus);
      totalProgress += event.bonus;
      if (bonusResult.learned) result.learned = true;
    }
    // 获取最新进度
    const latestData = p.learning[category]?.[itemId] || { progress: 0, learned: false };
    this.addLog(`学习${result.itemName}：${event.text}（进度+${totalProgress}）`);
    if (result.learned || latestData.learned) {
      this.addJournal(`学会了${result.itemName}！`);
      // 学会特定内容 → 获得对应修仙职业（多职业并存）
      this.grantCultivationProfessionFromLearning(category, item);
    }
    this.consumeAP(1);
    this.checkCultivationProfessions(); // 学习开始/学成 → 炼丹学徒/炼器学徒等
    return { ...result, progress: latestData.progress, max: item.exp, learned: latestData.learned, eventText: event.text, totalGain: totalProgress, state: this.getPublicState() };
  }

  // ===== 付费学习（藏经阁/器方阁/阵法师协会，可学所有品级） =====
  // 学习费用按品级计算
  getPaidStudyCost(category, item) {
    const tier = item.tier || item.level || 1;
    const COSTS = {
      1: { type: 'silver', amount: 300 },
      2: { type: 'silver', amount: 1000 },
      3: { type: 'silver', amount: 3000 },
      4: { type: 'spirit', amount: 100 },
      5: { type: 'spirit', amount: 500 },
      6: { type: 'spirit', amount: 1500 },
      7: { type: 'spirit', amount: 3000 },
      8: { type: 'spirit', amount: 8000 },
    };
    const cost = COSTS[Math.min(tier, 8)] || COSTS[8];
    return cost;
  }

  // 获取付费学习列表（所有品级，未学会的）
  getPaidLearningList(category) {
    const p = this.state.player;
    const result = [];
    if (category === 'alchemy') {
      // 丹方藏经阁：使用炼丹系统的全部丹方
      initAlchemy(p);
      for (const r of RECIPES) {
        if (p.alchemy.recipes.includes(r.id)) continue;
        const progress = p.alchemy.learning[r.id] || 0;
        result.push({ id: r.id, name: r.name, tier: r.tier, desc: r.desc, progress, learned: false, type: 'alchemy', cost: this.getPaidStudyCost('alchemy', r) });
      }
    } else if (category === 'forge') {
      // 器方阁：使用学习系统的炼器配方
      initLearning(p);
      for (const r of LEARN_FORGE_RECIPES) {
        const data = p.learning.forge[r.id] || { progress: 0, learned: false };
        result.push({ id: r.id, name: r.name, tier: r.level, desc: r.desc, progress: data.progress, learned: data.learned, type: 'forge', cost: this.getPaidStudyCost('forge', r) });
      }
    } else if (category === 'formation') {
      // 阵法师协会：使用学习系统的阵法
      initLearning(p);
      for (const r of LEARN_FORMATIONS) {
        const data = p.learning.formation[r.id] || { progress: 0, learned: false };
        result.push({ id: r.id, name: r.name, tier: r.level, desc: r.desc, progress: data.progress, learned: data.learned, type: 'formation', cost: this.getPaidStudyCost('formation', r) });
      }
    }
    return result;
  }

  // 付费研读一次（每次交钱，进度大幅增加）
  studyPaid(category, itemId) {
    const p = this.state.player;
    const list = this.getPaidLearningList(category);
    const item = list.find(i => i.id === itemId);
    if (!item) return { error: '没有这个学习内容' };
    if (item.learned) return { error: '已经学会该内容' };

    const cost = item.cost;
    if (cost.type === 'silver') {
      if ((p.silver || 0) < cost.amount) return { error: `银两不足，学习需要${cost.amount}银两` };
      p.silver -= cost.amount;
    } else {
      if ((p.spiritStone || 0) < cost.amount) return { error: `灵石不足，学习需要${cost.amount}灵石` };
      p.spiritStone -= cost.amount;
    }

    // 每次研读增加 40%-70% 进度
    const gain = randInt(40, 70);
    let learnedNow = false;

    if (category === 'alchemy') {
      initAlchemy(p);
      if (!p.alchemy.learning[itemId]) p.alchemy.learning[itemId] = 0;
      p.alchemy.learning[itemId] += gain;
      if (p.alchemy.learning[itemId] >= 100) {
        p.alchemy.recipes.push(itemId);
        delete p.alchemy.learning[itemId];
        learnedNow = true;
      }
    } else if (category === 'forge') {
      initLearning(p);
      if (!p.learning.forge[itemId]) p.learning.forge[itemId] = { progress: 0, learned: false };
      const data = p.learning.forge[itemId];
      data.progress = Math.min(100, data.progress + gain);
      if (data.progress >= 100) {
        data.learned = true;
        learnedNow = true;
      }
    } else if (category === 'formation') {
      initLearning(p);
      if (!p.learning.formation[itemId]) p.learning.formation[itemId] = { progress: 0, learned: false };
      const data = p.learning.formation[itemId];
      data.progress = Math.min(100, data.progress + gain);
      if (data.progress >= 100) {
        data.learned = true;
        learnedNow = true;
      }
    }

    const costText = cost.type === 'silver' ? `${cost.amount}银两` : `${cost.amount}灵石`;
    let msg = `你花费${costText}研读【${item.name}】，进度+${gain}%。`;
    if (learnedNow) {
      msg += ` 你成功学会了【${item.name}】！`;
      this.addJournal(`在付费学习中学会了${item.name}。`);
      // 学会特定内容 → 获得对应修仙职业（多职业并存）
      this.grantCultivationProfessionFromLearning(category, { id: itemId, name: item.name });
    }
    this.addLog(msg);
    this.consumeAP(1);
    return { success: true, msg, learned: learnedNow, progress: Math.min(100, (item.progress || 0) + gain), cost: costText, state: this.getPublicState() };
  }

  // ===== 炼制工具系统 =====
  getCraftingTools() {
    const p = this.state.player;
    initCraftingTools(p);
    return p.craftingTools;
  }

  buyCraftingTool(toolType, tier) {
    const p = this.state.player;
    initCraftingTools(p);
    const result = buyTool(p, toolType, tier);
    if (result.success) {
      this.addLog(`购买了${result.tool.name}`);
      this.addJournal(`购买了${result.tool.name}`);
    }
    return { ...result, state: this.getPublicState() };
  }

  selectCraftingTool(toolType, index) {
    const p = this.state.player;
    initCraftingTools(p);
    const result = selectTool(p, toolType, index);
    return { ...result, state: this.getPublicState() };
  }

  getToolMarket(toolType, minTier, maxTier) {
    return getToolMarketItems(toolType, minTier || 1, maxTier || 4);
  }

  // ===== 炼制房间系统 =====
  getCraftableList(craftType) {
    const p = this.state.player;
    return getCraftableList(p, craftType);
  }

  craftItem(craftType, recipeId) {
    const p = this.state.player;
    const result = craft(p, craftType, recipeId);
    this.addLog(result.msg);
    if (result.success) {
      this.addJournal(`炼制出${result.item}`);
    }
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 风花雪月系统 =====
  getWindFlower() {
    const p = this.state.player;
    return getWindFlower(this.state, p.location);
  }

  windFlowerSelect(personId) {
    const p = this.state.player;
    const result = selectPerson(this.state, p, personId);
    if (result.success) {
      this.addLog(result.msg);
      this.consumeAP(1);
    }
    return { ...result, state: this.getPublicState() };
  }

  windFlowerInteract(personId, action, itemName, mode, rankParam) {
    const p = this.state.player;
    const result = windFlowerInteract(this.state, p, personId, action, itemName, mode, rankParam);
    if (result.success && (action === 'chat' || action === 'spring')) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${p.location}·${result.msg}`);
      // ① 风花雪月谈情/春宵也写入世界记事（此前只写日志不写记事）
      const wfNpc = (this.state.windFlower?.generated?.[p.location] || []).find(x => x.id === personId);
      this.addWorldJournal(wfNpc ? wfNpc.name : (result.name || personId), `${p.name}在${p.location}${result.msg}`);
    }
    if (result.success && action === 'redeem') {
      this.addJournal(`为${result.name || '一人'}赎身。`);
      this.addLog(result.msg);
    }
    if (result.success && action === 'gift') this.addLog(result.msg);
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 铁匠铺炼制（清风镇铁匠铺：购买低品级器炉 + 交费炼制低品级武器饰品） =====
  craftAtBlacksmith(recipeId) {
    const p = this.state.player;
    initCraftingTools(p);
    const recipe = LEARN_FORGE_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, msg: '配方不存在' };
    if (recipe.level > 2) return { success: false, msg: '铁匠铺只能炼制低品级（1-2阶）武器饰品，更高品级请前往炼器房或器炉坊' };

    const learned = p.learning?.forge?.[recipeId]?.learned;
    if (!learned) return { success: false, msg: '未学会该器方，请先学习' };

    // 交费使用铁匠铺的器炉
    const craftFee = recipe.level === 1 ? 50 : 150; // 银两
    if ((p.silver || 0) < craftFee) return { success: false, msg: `使用铁匠铺器炉需要${craftFee}银两` };
    p.silver -= craftFee;

    // 检查材料
    const mats = recipe.materials.map(m => ({ name: m, count: 1 }));
    for (const mat of mats) {
      const have = p.inventory?.find(i => i.name === mat.name)?.count || 0;
      if (have < mat.count) {
        p.silver += craftFee; // 退还费用
        return { success: false, msg: `材料不足：需要${mat.count}个${mat.name}，只有${have}个` };
      }
    }

    // 扣除材料
    for (const mat of mats) {
      p.inventory.find(i => i.name === mat.name).count -= mat.count;
      if (p.inventory.find(i => i.name === mat.name).count <= 0) {
        p.inventory = p.inventory.filter(i => i.name !== mat.name);
      }
    }

    // 成功率：铁匠铺器炉加成
    const forgeLevel = p.forge?.level || 1;
    const successRate = Math.min(95, 55 + forgeLevel * 5);
    if (chance(successRate)) {
      const itemName = recipe.name;
      p.inventory.push({ name: itemName, count: 1, type: '装备', desc: recipe.desc });
      if (!p.forge) p.forge = { level: 1, exp: 0 };
      p.forge.exp = (p.forge.exp || 0) + recipe.level * 20;
      const msg = `你在铁匠铺花费${craftFee}银两炼制成功！获得了【${itemName}】！`;
      this.addLog(msg);
      this.addJournal(`铁匠铺炼制出${itemName}。`);
      return { success: true, msg, item: itemName, fee: craftFee, state: this.getPublicState() };
    } else {
      const msg = `炼制失败，材料损毁了。（在铁匠铺花费了${craftFee}银两）`;
      this.addLog(msg);
      return { success: false, msg, fee: craftFee, state: this.getPublicState() };
    }
  }

  // ===== 宅子系统 =====
  // 关系网链接：给NPC/玩家写入一条关系
  linkRelation(target, otherId, type, name, favor) {
    if (!target || !otherId) return;
    if (!target.relations) target.relations = {};
    target.relations[otherId] = { type, favor: favor !== undefined ? favor : (target.favorWithPlayer || 0), name };
  }

  getMansion() {
    const p = this.state.player;
    const info = getMansionInfo(p);
    // 组装宅中家人（打通 player.family 与宅子显示）
    const npcs = this.state.npcs;
    const findNpc = id => (npcs || []).find(n => n.id === id);
    const family = p.family || {};
    const spouse = family.spouse ? findNpc(family.spouse) : null;
    const wives = (family.wives || []).map(findNpc).filter(Boolean);
    const guests = (npcs || []).filter(n => n.invitedByPlayer && n.isAlive !== false && n.location === p.location);
    info.familyMembers = { spouse, wives, guests, father: findNpc(family.father), mother: findNpc(family.mother) };
    return info;
  }

  upgradeMansion() {
    const p = this.state.player;
    const result = upgradeMansion(p);
    if (result.success) {
      this.addLog(result.text);
      this.addJournal(result.text);
    }
    return { ...result, state: this.getPublicState() };
  }

  getMansionArea(areaId) {
    const p = this.state.player;
    return getAreaInfo(p, areaId);
  }

  // 召回配偶/妾室/客人回主控所在宅子
  recallNpc(npcId) {
    const p = this.state.player;
    const npc = (this.state.npcs || []).find(n => n.id === npcId);
    if (!npc) return { error: '没有找到这个人' };
    const family = p.family || {};
    const isFamily = family.spouse === npcId || (family.wives || []).includes(npcId) || npc.invitedByPlayer === true || npc.invitedByPlayer === p.id;
    if (!isFamily) return { error: '对方与你并无婚约或宾客之谊，无法召回' };
    const from = npc.location;
    npc.location = p.location;
    this.addLog(genderize(`你召回${npc.name}，他/她已来到${p.location}与你团聚。`, npc));
    return { success: true, msg: `${npc.name}已从${from}赶到${p.location}与你团聚。`, state: this.getPublicState() };
  }

  visitMansionArea(areaId) {
    const p = this.state.player;
    const info = getAreaInfo(p, areaId);
    if (info.error) return info;

    // 打通 player.family 与宅子区域人物显示（婚姻数据在 family 中）
    const findNpc = id => (this.state.npcs || []).find(n => n.id === id);
    const family = p.family || {};
    if (areaId === 'master_room' && (!info.people || info.people.length === 0)) {
      const s = family.spouse ? findNpc(family.spouse) : null;
      if (s) { info.people = [s]; info.desc = `正妻/正夫${s.name}的住所`; }
    } else if (areaId === 'back_yard' && (!info.people || info.people.length === 0)) {
      const wives = (family.wives || []).map(findNpc).filter(Boolean);
      if (wives.length) { info.people = wives; info.desc = `妾室住所，共${wives.length}位妾室`; }
    } else if (areaId === 'left_wing' || areaId === 'right_wing') {
      // 左/右厢房：按厢房ID数组解析NPC（mansion.leftWing/rightWing 存的是子嗣ID）
      const ids = areaId === 'left_wing' ? (p.mansion.leftWing || []) : (p.mansion.rightWing || []);
      info.people = ids.map(findNpc).filter(Boolean);
      info.desc = `${areaId === 'left_wing' ? '女儿' : '男儿'}住所，共${info.people.length}位${areaId === 'left_wing' ? '女儿' : '男儿'}`;
    } else if (areaId === 'main_hall') {
      // 正厅：显示邀请来的客人（受邀且在主控所在宅子）
      const guests = (this.state.npcs || []).filter(n => (n.invitedByPlayer === true || n.invitedByPlayer === p.id) && n.location === p.location);
      info.people = guests;
      info.desc = guests.length > 0 ? `正厅中坐着${guests.length}位客人` : '正厅安静无人，可邀请相识之人前来做客';
    }

    // 厨房特殊处理：返回做菜系统信息
    if (areaId === 'kitchen') {
      const cookingInfo = this.getCookingInfo();
      this.consumeAP(1);
      return { ...info, cooking: cookingInfo, state: this.getPublicState() };
    }

    // 灵田特殊处理：返回灵田系统信息
    if (areaId === 'spirit_field') {
      const farmInfo = this.getFarmInfo();
      const seeds = this.getSeeds();
      this.consumeAP(1);
      return { ...info, farm: farmInfo, seeds, state: this.getPublicState() };
    }

    const event = getMansionEvent(areaId);
    if (event) {
      if (event.effects) {
        if (event.effects.cultivationExp) p.cultivationExp += event.effects.cultivationExp;
        if (event.effects.hp) p.hp.current = Math.min(p.hp.max, p.hp.current + event.effects.hp);
        if (event.effects.mp) p.mp.current = Math.min(p.mp.max, p.mp.current + event.effects.mp);
        if (event.effects.reputation) p.reputation += event.effects.reputation;
        if (event.effects.spiritStone) p.spiritStone += event.effects.spiritStone;
      }
      this.addLog(event.text);
    }
    this.consumeAP(1);
    return { ...info, event, state: this.getPublicState() };
  }

  // ===== 仆役系统 =====
  getServantsForSale() {
    if (!this.state.servantsForSale) {
      this.state.servantsForSale = refreshServantsForSale();
    }
    return this.state.servantsForSale;
  }

  refreshServants() {
    this.state.servantsForSale = refreshServantsForSale();
    this.addLog('牙人所刷新了一批新的仆役。');
    return this.state.servantsForSale;
  }

  buyServant(servantId) {
    const p = this.state.player;
    if (!this.state.servantsForSale) this.state.servantsForSale = refreshServantsForSale();
    const result = buyServant(p, servantId, this.state.servantsForSale);
    if (result.success) {
      this.addLog(result.text);
      this.addJournal(result.text);
    }
    return { ...result, state: this.getPublicState() };
  }

  interactServant(servantId, action) {
    const p = this.state.player;
    const result = interactWithServant(p, servantId, action);
    if (result.success) {
      this.addLog(result.text);
      this.addJournal(result.text);
      this.consumeAP(1);
    }
    return { ...result, state: this.getPublicState() };
  }

  getMyServants() {
    const p = this.state.player;
    initMansion(p);
    return p.mansion.servants || [];
  }

  // ===== 随机立绘 =====
  randomizePortrait(targetId = null) {
    const { getPortrait } = require('./utils');
    if (targetId === null || targetId === 'player') {
      const p = this.state.player;
      const customRanges = this.state?.portraitCustomRanges || null;
      p.portrait = getPortrait(p.age, p.gender, customRanges);
      this.addLog(`更换了立绘。`);
      return { success: true, portrait: p.portrait, state: this.getPublicState() };
    } else {
      const npc = this.state.npcs.find(n => n.id === targetId);
      if (!npc) return { error: '没有这个NPC' };
      const customRanges = this.state?.portraitCustomRanges || null;
      npc.portrait = getPortrait(npc.age, npc.gender, customRanges);
      return { success: true, portrait: npc.portrait, state: this.getPublicState() };
    }
  }

  // ===== 生成NPC关系网 =====
  generateNpcRelations(npcs) {
    const adultNpcs = npcs.filter(n => n.age >= 16 && n.isAlive);
    const relations = {};

    // 为每个NPC生成2-5个关系
    for (const npc of adultNpcs) {
      if (!npc.relations) npc.relations = {};
      const relationCount = randInt(2, 5);
      const candidates = adultNpcs.filter(n => n.id !== npc.id && n.location === npc.location);
      if (candidates.length === 0) continue;

      for (let i = 0; i < relationCount; i++) {
        const other = randChoice(candidates);
        if (!other) continue;
        if (npc.relations[other.id]) continue;

        const relType = randChoice(['朋友', '好友', '知己', '同门', '同乡', '生意伙伴', '酒友', '邻居']);
        const favor = randInt(20, 80);
        npc.relations[other.id] = { type: relType, favor, name: other.name };
        if (!other.relations) other.relations = {};
        other.relations[npc.id] = { type: relType, favor, name: npc.name };
      }
    }

    // 生成一些亲属关系（父母、兄弟姐妹、子女）
    const familyNpcs = adultNpcs.filter(n => n.age >= 30);
    for (const parent of familyNpcs) {
      if (chance(30)) {
        const childCandidates = npcs.filter(n => n.age < parent.age - 15 && n.age > 0);
        if (childCandidates.length > 0) {
          const child = randChoice(childCandidates);
          if (!parent.family) parent.family = { children: [], spouse: null };
          if (!parent.family.children) parent.family.children = [];
          if (!parent.family.children.includes(child.id)) {
            parent.family.children.push(child.id);
          }
          // 双向一致：子侧必须设置真实父/母引用（原逻辑只写 family.parents 死字段，
          // 前端与关系判定都读不到，导致"母侧有子嗣、子侧无父母"的单向矛盾）
          if (!child.family) child.family = { children: [], spouse: null, parents: [] };
          if (!child.family.father && !child.family.mother) {
            if (parent.gender === '男') child.family.father = parent.id;
            else child.family.mother = parent.id;
          } else if (child.family.father && !child.family.mother && parent.gender === '女') {
            child.family.mother = parent.id;
          } else if (child.family.mother && !child.family.father && parent.gender === '男') {
            child.family.father = parent.id;
          }
          if (!child.family.parents) child.family.parents = [];
          if (!child.family.parents.includes(parent.id)) {
            child.family.parents.push(parent.id);
          }
        }
      }
    }

    // 生成一些夫妻关系
    const marriedCandidates = adultNpcs.filter(n => n.age >= 18 && !n.family?.spouse);
    for (let i = 0; i < Math.floor(marriedCandidates.length / 4); i++) {
      if (marriedCandidates.length < 2) break;
      const male = marriedCandidates.find(n => n.gender === '男');
      const female = marriedCandidates.find(n => n.gender === '女');
      if (male && female && male.id !== female.id) {
        if (!male.family) male.family = { children: [], spouse: null };
        if (!female.family) female.family = { children: [], spouse: null };
        male.family.spouse = female.id;
        female.family.spouse = male.id;
        male.relations = male.relations || {};
        female.relations = female.relations || {};
        male.relations[female.id] = { type: '夫妻', favor: randInt(50, 90), name: female.name };
        female.relations[male.id] = { type: '夫妻', favor: randInt(50, 90), name: male.name };
      }
    }
  }

  // ===== 生成帝王和帝国系统 =====
  generateEmpire(npcs) {
    // 找一个合适的NPC作为帝王
    const emperorCandidates = npcs.filter(n =>
      n.age >= 25 && n.age <= 60 && n.gender === '男' && n.realmLevel >= 3
    );
    let emperor = emperorCandidates.length > 0 ? randChoice(emperorCandidates) : null;

    if (!emperor) {
      // 如果没有合适的，生成一个新的
      emperor = generateNPC({
        location: '大夏皇都',
        realmLevel: randInt(5, 8),
        age: randInt(30, 55),
        gender: '男',
      });
      emperor.profession = '皇帝';
      emperor.professionName = '大夏皇帝';
      emperor.faction = '大夏皇室';
      npcs.push(emperor);
    }

    emperor.profession = '皇帝';
    emperor.professionName = '大夏皇帝';
    emperor.faction = '大夏皇室';
    emperor.location = '大夏皇都';
    emperor.isEmperor = true;
    emperor.identity = '皇族';
    if (emperor.publicInfo) emperor.publicInfo.identity = '皇族';
    emperor.silver = 999999;
    emperor.spiritStone = 99999;

    // 帝国状态
    this.state.empire = {
      emperorId: emperor.id,
      dynasty: '大夏',
      era: '永兴',
      year: 1,
      court: {
        officials: [], // 官员
        heirs: [], // 继承人
      },
      harem: {
        empress: null, // 皇后
        consorts: [], // 妃嫔
      },
      treasury: {
        silver: 999999,
        spiritStone: 99999,
      },
    };

    // 生成皇后（只从未婚、非玩家亲属的女NPC中选；不足则新生成，保证配偶=皇帝）
    const player = this.state.player;
    const { isCloseRelative } = require('./threeActStory');
    const notMarriedToOthers = (n) => !n.family || !n.family.spouse;
    const notPlayerFamily = (n) => {
      if (!player || !player.family) return true;
      if (player.family.spouse === n.id) return false;
      if (player.family.father === n.id || player.family.mother === n.id) return false;
      if ((player.family.children || []).includes(n.id)) return false;
      if (isCloseRelative(player, n, this.state.npcs)) return false;
      return true;
    };
    const newConsortNpc = (ageMin, ageMax) => generateNPC({
      location: '大夏皇都',
      gender: '女',
      age: randInt(ageMin, ageMax),
      realmLevel: 1,
      race: '人族',
    });

    let empress = null;
    const empressCandidates = npcs.filter(n =>
      n.gender === '女' && n.age >= 16 && n.age <= 40 && n.id !== emperor.id &&
      notMarriedToOthers(n) && notPlayerFamily(n)
    );
    if (empressCandidates.length > 0) {
      empress = randChoice(empressCandidates);
    } else {
      empress = newConsortNpc(18, 32);
      npcs.push(empress);
    }
    empress.profession = '皇后';
    empress.professionName = '大夏皇后';
    empress.faction = '大夏皇室';
    empress.location = '大夏皇都';
    empress.isEmpress = true;
    empress.identity = '皇族';
    if (empress.publicInfo) empress.publicInfo.identity = '皇族';
    this.state.empire.harem.empress = empress.id;
    if (!emperor.family) emperor.family = { children: [], spouse: null };
    emperor.family.spouse = empress.id;
    if (!empress.family) empress.family = { children: [], spouse: null };
    empress.family.spouse = emperor.id;

    // 生成3-5个妃嫔（只从未婚、非玩家亲属的女NPC中选；不足则新生成，配偶一律=现任皇帝）
    const consortCount = randInt(3, 5);
    const consortCandidates = npcs.filter(n =>
      n.gender === '女' && n.age >= 16 && n.age <= 35 &&
      n.id !== emperor.id && n.id !== empress.id &&
      notMarriedToOthers(n) && notPlayerFamily(n)
    );
    const consortPool = [...consortCandidates];
    for (let i = 0; i < consortCount; i++) {
      let consort;
      if (consortPool.length > 0) {
        consort = consortPool.splice(Math.floor(Math.random() * consortPool.length), 1)[0];
      } else {
        consort = newConsortNpc(16, 30);
        npcs.push(consort);
      }
      const rank = randChoice(['贵妃', '妃', '嫔', '贵人', '常在']);
      consort.profession = rank;
      consort.professionName = `后宫${rank}`;
      consort.faction = '大夏皇室';
      consort.location = '大夏皇都';
      consort.isConsort = true;
      consort.identity = '皇族';
      if (consort.publicInfo) consort.publicInfo.identity = '皇族';
      consort.consortRank = rank;
      if (!consort.family) consort.family = { children: [], spouse: null };
      consort.family.spouse = emperor.id; // 妃嫔配偶=现任皇帝
      this.state.empire.harem.consorts.push(consort.id);
      if (!emperor.family.wives) emperor.family.wives = [];
      if (!emperor.family.wives.includes(consort.id)) {
        emperor.family.wives.push(consort.id);
      }
    }

    // 生成2-4个皇子/公主（由皇帝与任一后妃所生：母亲从皇后/妃嫔中随机，父母关系链随机绑定）
    const heirCount = randInt(2, 4);
    const { pickRoyalMother } = require('./royalCourt');
    for (let i = 0; i < heirCount; i++) {
      const child = generateNPC({
        location: '大夏皇都',
        age: randInt(5, 25),
        gender: chance(50) ? '男' : '女',
        realmLevel: randInt(1, 4),
      });
      child.faction = '大夏皇室';
      child.isRoyal = true;
      child.identity = '皇族';
      if (child.publicInfo) child.publicInfo.identity = '皇族';
      if (child.gender === '男') {
        child.profession = '皇子';
        child.professionName = '大夏皇子';
      } else {
        child.profession = '公主';
        child.professionName = '大夏公主';
      }
      npcs.push(child);
      if (!emperor.family.children) emperor.family.children = [];
      emperor.family.children.push(child.id);
      // 母亲从 [皇后, ...妃嫔] 中随机（皇后后妃的孩子都是皇室）
      const royalMother = pickRoyalMother(this.state, empress, this.state.empire.harem.consorts);
      if (!royalMother.family) royalMother.family = { children: [], spouse: null };
      if (!royalMother.family.children) royalMother.family.children = [];
      royalMother.family.children.push(child.id);
      if (!child.family) child.family = { children: [], spouse: null, parents: [] };
      child.family.father = emperor.id;
      child.family.mother = royalMother.id;
      child.family.parents = [emperor.id, royalMother.id];
      this.state.empire.court.heirs.push(child.id);
    }

    // 纠偏：已有存档/旧数据中，凡职业为后宫等级或皇后者，若配偶不是现任皇帝则修正
    for (const n of npcs) {
      const royalConsort = n.isConsort || n.isEmpress ||
        ['皇后', '贵妃', '妃', '嫔', '贵人', '常在'].includes(n.profession);
      if (!royalConsort) continue;
      if (!n.family) n.family = { children: [], spouse: null };
      if (n.family.spouse !== emperor.id) {
        n.family.spouse = emperor.id;
        n.faction = '大夏皇室';
        n.location = '大夏皇都';
        if (!n.isConsort && !n.isEmpress) n.isConsort = true;
      }
    }

    // 生成5-8个朝廷官员（排除玩家三代亲属，避免父母/配偶被改派皇都任职）
    const officialCount = randInt(5, 8);
    const officialPositions = ['丞相', '太尉', '御史大夫', '大将军', '吏部尚书', '户部尚书', '礼部尚书', '兵部尚书', '刑部尚书', '工部尚书'];
    const officialCandidates = npcs.filter(n =>
      n.age >= 25 && n.id !== emperor.id &&
      !this.state.empire.harem.consorts.includes(n.id) &&
      n.id !== this.state.empire.harem.empress &&
      notPlayerFamily(n)
    );
    for (let i = 0; i < officialCount && officialCandidates.length > 0; i++) {
      const official = randChoice(officialCandidates);
      const position = officialPositions[i % officialPositions.length];
      official.profession = position;
      official.professionName = `大夏${position}`;
      official.faction = '大夏朝廷';
      official.location = '大夏皇都';
      official.isOfficial = true;
      official.officialPosition = position;
      // 需求：朝廷高官身份统一为官员，修为按凡人境（非修仙者身份→修为=凡人境）
      official.identity = '官员';
      official.realmLevel = 1;
      official.realm = '凡人境';
      delete official.subStage;
      if (official.publicInfo) official.publicInfo.identity = '官员';
      this.state.empire.court.officials.push(official.id);
    }
  }

  // 获取帝国信息
  getEmpireInfo() {
    if (!this.state.empire) return null;
    const empire = this.state.empire;
    const emperor = this.state.npcs.find(n => n.id === empire.emperorId);
    const empress = this.state.npcs.find(n => n.id === empire.harem.empress);
    const consorts = empire.harem.consorts.map(id => this.state.npcs.find(n => n.id === id)).filter(Boolean);
    const heirs = empire.court.heirs.map(id => this.state.npcs.find(n => n.id === id)).filter(Boolean);
    const officials = empire.court.officials.map(id => this.state.npcs.find(n => n.id === id)).filter(Boolean);
    return {
      dynasty: empire.dynasty,
      era: empire.era,
      year: empire.year,
      emperor: emperor ? { id: emperor.id, name: emperor.name, age: emperor.age, portrait: emperor.portrait } : null,
      empress: empress ? { id: empress.id, name: empress.name, age: empress.age, portrait: empress.portrait } : null,
      consorts: consorts.map(c => ({ id: c.id, name: c.name, rank: c.consortRank, portrait: c.portrait })),
      heirs: heirs.map(h => ({ id: h.id, name: h.name, age: h.age, gender: h.gender, portrait: h.portrait })),
      officials: officials.map(o => ({ id: o.id, name: o.name, position: o.officialPosition, portrait: o.portrait })),
      treasury: empire.treasury,
    };
  }

  // ===== 宅子剧情系统 =====
  triggerMansionEvent(area = 'hall') {
    const p = this.state.player;
    const { triggerMansionEvent } = require('./mansionEvents');
    const event = triggerMansionEvent(p, area, this.state.npcs);
    if (!event) return { error: '当前没有可触发的剧情' };
    if (!this.state.mansionEvent) this.state.mansionEvent = {};
    this.state.mansionEvent.current = event;
    return { success: true, event, state: this.getPublicState() };
  }

  chooseMansionEventOption(choiceIndex) {
    const p = this.state.player;
    const event = this.state.mansionEvent?.current;
    if (!event) return { error: '没有进行中的剧情' };
    const { applyMansionEventEffect } = require('./mansionEvents');
    const result = applyMansionEventEffect(p, event, choiceIndex, this.state.npcs);
    this.addLog(result.resultText);
    this.addJournal(`${this.state.gameDateText}·${p.location}·${result.resultText}`);
    this.state.mansionEvent.current = null;
    this.consumeAP(1);
    return { success: true, ...result, state: this.getPublicState() };
  }

  // ===== 地点功能按钮剧情触发 =====
  triggerLocationEvent(button) {
    const p = this.state.player;
    const { getLocationEvent } = require('../data/locationEvents');
    const event = getLocationEvent(p.location, button);

    // 应用效果
    if (event.effects) {
      const e = event.effects;
      if (e.cultivationExp) p.cultivationExp += e.cultivationExp;
      if (e.hp) p.hp.current = Math.max(1, Math.min(p.hp.max, p.hp.current + e.hp));
      if (e.mp) p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + e.mp));
      if (e.spirit) p.mp.current = Math.max(0, Math.min(p.mp.max, p.mp.current + (e.spirit || 0)));
      if (e.silver) p.silver = Math.max(0, p.silver + e.silver);
      if (e.spiritStone) p.spiritStone = Math.max(0, p.spiritStone + e.spiritStone);
      if (e.reputation) p.reputation = (p.reputation || 0) + e.reputation;
      if (e.enlightenment) p.attributes.enlightenment = (p.attributes.enlightenment || 0) + e.enlightenment;
      if (e.charm) p.attributes.charm = (p.attributes.charm || 0) + e.charm;
      if (e.willpower) p.attributes.willpower = (p.attributes.willpower || 0) + e.willpower;
      if (e.constitution) p.attributes.constitution = (p.attributes.constitution || 0) + e.constitution;
      if (e.luck) p.attributes.fateLuck = (p.attributes.fateLuck || 0) + e.luck;
      if (e.karma) p.karma.merit = (p.karma.merit || 0) + (e.karma > 0 ? e.karma : 0);
      if (e.karma && e.karma < 0) p.karma.sin = (p.karma.sin || 0) + Math.abs(e.karma);
      if (e.age) p.age += e.age;
      if (e.alchemyExp) p.alchemy.exp = (p.alchemy?.exp || 0) + e.alchemyExp;
      if (e.forgeExp) p.forge.exp = (p.forge?.exp || 0) + e.forgeExp;
      if (e.formationExp) p.formation.exp = (p.formation?.exp || 0) + e.formationExp;

      // 物品获取
      if (e.item) {
        const count = e.count || 1;
        const existing = p.inventory.find(i => i.name === e.item);
        if (existing) existing.count += count;
        else p.inventory.push({ name: e.item, count });
      }
      if (e.item2) {
        const existing = p.inventory.find(i => i.name === e.item2);
        if (existing) existing.count += 1;
        else p.inventory.push({ name: e.item2, count: 1 });
      }
      if (e.randomItem) {
        const { getRandomItemAtLocation } = require('../data/itemSources');
        const ri = getRandomItemAtLocation(p.location);
        if (ri) {
          const existing = p.inventory.find(i => i.name === ri.item);
          if (existing) existing.count += ri.count;
          else p.inventory.push({ name: ri.item, count: ri.count });
        }
      }
    }

    this.addLog(event.text);
    this.addJournal(`${this.state.gameDateText}·${p.location}·${button}·${event.journal || event.text.substring(0, 30)}`);
    this.consumeAP(1);

    // 如果有战斗选项，返回事件让前端选择
    if (event.options && event.options.length > 0) {
      if (!this.state.locationEvent) this.state.locationEvent = {};
      this.state.locationEvent.current = { ...event, button };
      return { success: true, event: { ...event, button }, state: this.getPublicState() };
    }

    // 如果有combat效果，触发战斗
    if (event.effects?.combat) {
      return this.startCombat('妖兽');
    }

    return { success: true, event: { text: event.text, effects: event.effects }, state: this.getPublicState() };
  }

  // 选择地点事件选项
  chooseLocationEventOption(choiceIndex) {
    const p = this.state.player;
    const event = this.state.locationEvent?.current;
    if (!event) return { error: '没有进行中的事件' };
    const option = event.options[choiceIndex];
    if (!option) return { error: '无效选项' };

    const e = option.effect || {};
    if (e.cultivationExp) p.cultivationExp += e.cultivationExp;
    if (e.hp) p.hp.current = Math.max(1, Math.min(p.hp.max, p.hp.current + e.hp));
    if (e.silver) p.silver = Math.max(0, p.silver + e.silver);
    if (e.spiritStone) p.spiritStone = Math.max(0, p.spiritStone + e.spiritStone);
    if (e.reputation) p.reputation = (p.reputation || 0) + e.reputation;
    if (e.enlightenment) p.attributes.enlightenment = (p.attributes.enlightenment || 0) + e.enlightenment;
    if (e.randomItem) {
      const { getRandomItemAtLocation } = require('../data/itemSources');
      const ri = getRandomItemAtLocation(p.location);
      if (ri) {
        const existing = p.inventory.find(i => i.name === ri.item);
        if (existing) existing.count += ri.count;
        else p.inventory.push({ name: ri.item, count: ri.count });
      }
    }
    if (e.item) {
      const existing = p.inventory.find(i => i.name === e.item);
      if (existing) existing.count += 1;
      else p.inventory.push({ name: e.item, count: 1 });
    }

    const resultText = `你选择了「${option.text}」。`;
    this.addLog(resultText);
    this.addJournal(`${this.state.gameDateText}·${p.location}·${event.button}·${resultText}`);
    this.state.locationEvent.current = null;

    if (e.combat) {
      return this.startCombat('妖兽');
    }

    return { success: true, resultText, state: this.getPublicState() };
  }

  // ===== 装备系统 =====
  getEquipmentInfo() {
    const p = this.state.player;
    const { initEquipment, calcEquipmentBonus, getEquippableItems, EQUIPMENT_SLOTS } = require('./equipment');
    initEquipment(p);
    return {
      equipment: p.equipment,
      bonus: calcEquipmentBonus(p.equipment),
      equippable: getEquippableItems(p),
      slots: EQUIPMENT_SLOTS,
    };
  }

  equipItem(itemName) {
    const p = this.state.player;
    const { equipItem } = require('./equipment');
    const result = equipItem(p, itemName);
    if (result.error) return result;
    this.addLog(`装备了${itemName}。`);
    this.addJournal(`${this.state.gameDateText}·装备了${itemName}。`);
    return { ...result, state: this.getPublicState() };
  }

  unequipItem(slot) {
    const p = this.state.player;
    const { unequipItem } = require('./equipment');
    const result = unequipItem(p, slot);
    if (result.error) return result;
    this.addLog(`卸下了${result.item}。`);
    return { ...result, state: this.getPublicState() };
  }

  // ===== 后宅系统 =====
  doIntimacy(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    if (npc.location !== p.location) return { error: '对方不在此地' };
    // 需求：主控不认识对方时不得触发欢好剧情（必须先交谈结识）
    if (!npc.knownByPlayer && !p.acquaintances.includes(npcId)) {
      return { error: '你还不认识对方，无从亲近。请先与对方交谈结识。' };
    }

    const { triggerIntimacy } = require('./haremSystem');
    const result = triggerIntimacy(p, npc);

    // 需求⑤：被拒绝时不套三段式（避免"拒绝却显示已欢好"的矛盾文本），只报拒绝原文
    if (!result.success) {
      this.addLog(result.text);
      this.addJournal(`${this.state.gameDateText}·${p.location}·与${npc.name}亲近被拒。${result.text}`);
      // ① 拒绝事件也写入世界记事与NPC个人记事
      this.addWorldJournal(npc.name, `${p.name}在${p.location}欲与${npc.name}亲近，被${npc.name}拒绝。`);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·拒绝${p.name}的亲近。`);
      this.consumeAP(1);
      return { ...result, text: result.text, state: this.getPublicState() };
    }

    // 欢好剧情三段式包装（第1段 引入 + 第2段 核心 + 第3段 收束），称呼按关系
    const { buildThreeAct, relLabel } = require('./threeActStory');
    const rel = relLabel(p, npc, this.state.npcs) || null;
    const text3 = buildThreeAct({ core: result.text, action: 'intimacy', me: p, them: npc, location: p.location, rel });

    this.addLog(text3);
    this.addJournal(`${this.state.gameDateText}·${p.location}·与${npc.name}欢好。${text3}`);
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·与${p.name}欢好。`);
    // ① 玩家参与的欢好写入世界记事（此前只有NPC间事件进世界记事）
    this.addWorldJournal(npc.name, `${p.name}与${npc.name}在${p.location}一夜欢好，情意绵绵。`);

    this.consumeAP(1);
    return { ...result, text: text3, state: this.getPublicState() };
  }

  // 偷情（对已有配偶的NPC；按好感/修为生成同意/半推半就/被强迫/被迷晕/被拒剧情）
  stealLove(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    if (npc.location !== p.location) return { error: '对方不在此地' };
    // 需求：主控不认识对方时不得偷情（必须先交谈结识）
    if (!npc.knownByPlayer && !p.acquaintances.includes(npcId)) {
      return { error: '你还不认识对方。请先与对方交谈结识。' };
    }
    const husband = npc.family?.spouse ? this.state.npcs.find(n => n.id === npc.family.spouse) : null;

    const { triggerStealLove } = require('./haremSystem');
    const result = triggerStealLove(p, npc, husband);

    if (result.success) {
      this.addLog(result.text);
      this.addJournal(`${this.state.gameDateText}·${p.location}·与${npc.name}偷情。${result.text}`);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·与${p.name}暗通款曲。`);
      this.addWorldJournal(npc.name, `${p.name}与${npc.name}在${p.location}暗中相会。${result.exposed ? ' 此事竟被撞破，闹得人尽皆知。' : ''}`);
    } else {
      this.addLog(result.text);
      this.addJournal(`${this.state.gameDateText}·${p.location}·欲与${npc.name}偷情被拒。${result.text}`);
      this.addWorldJournal(npc.name, `${p.name}在${p.location}对${npc.name}意图不轨，被${npc.name}斥退。`);
      // 弹窗剧情记录到涉及NPC记事
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·拒绝${p.name}的逾矩之举。`);
    }
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  doMarry(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    if (npc.location !== p.location) return { error: '对方不在此地' };

    const { tryMarry } = require('./haremSystem');
    const result = tryMarry(p, npc);

    this.addLog(result.text || result.error);
    if (result.success) {
      this.addJournal(`${this.state.gameDateText}·${p.location}·求娶${npc.name}成功，纳为正室。`);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·嫁给${p.name}为正室。`);
    }
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  doTakeConcubine(npcId, rank = null) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    if (npc.location !== p.location) return { error: '对方不在此地' };

    const { tryTakeConcubine } = require('./haremSystem');
    const result = tryTakeConcubine(p, npc, rank);

    this.addLog(result.text || result.error);
    if (result.success) {
      this.addJournal(`${this.state.gameDateText}·${p.location}·纳${npc.name}为妾。`);
      if (!npc.personalHistory) npc.personalHistory = [];
      npc.personalHistory.push(`${this.state.gameDateText}·被${p.name}纳为妾室。`);
    }
    this.consumeAP(1);
    return { ...result, state: this.getPublicState() };
  }

  doPunish(npcId, punishType, newRank = null) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };

    const { punishConcubine } = require('./haremSystem');
    const result = punishConcubine(p, npc, punishType, newRank);
    if (result.error) return result;

    this.addLog(result.text);
    this.addJournal(`${this.state.gameDateText}·惩罚${npc.name}：${result.text.substring(0, 30)}`);
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·被${p.name}惩罚。`);

    return { ...result, state: this.getPublicState() };
  }

  // 获取后宅位分列表
  getHaremRanks() {
    const { getConcubineRanks } = require('./haremSystem');
    return getConcubineRanks(this.state.player.gender);
  }

  // ===== 打工系统 =====
  getAvailableProfessions() {
    const { getAvailableProfessions } = require('./workSystem');
    return getAvailableProfessions(this.state.player);
  }

  getProfessionState() {
    const { getProfessionState } = require('./workSystem');
    return getProfessionState(this.state.player);
  }

  selectProfession(professionId) {
    const { selectProfession } = require('./workSystem');
    const result = selectProfession(this.state.player, professionId);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·${result.profession?.name || professionId}·就职`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  quitProfession() {
    const { quitProfession } = require('./workSystem');
    const result = quitProfession(this.state.player);
    if (result.success) {
      this.addLog(result.msg);
      this.addJournal(`${this.state.gameDateText}·离职`);
    }
    return result.success ? { ...result, state: this.getPublicState() } : { error: result.msg };
  }

  doWork(professionId) {
    const p = this.state.player;
    const { doWork } = require('./workSystem');
    const result = doWork(p, professionId);
    if (result.error) return result;

    this.addLog(result.text);
    this.addJournal(`${this.state.gameDateText}·${p.location}·从事${result.profession}，${result.text.substring(0, 30)}`);
    this.consumeAP(1);
    if (result.success) {
      updateQuarterlyProgress(this.state, 'work');
      updateQuestProgress(p, 'work');
    }
    return { ...result, state: this.getPublicState() };
  }

  // 修仙界已获得职业的工作（需求：已获得的修仙职业可直接工作）
  doCultivationWork(professionName) {
    const p = this.state.player;
    const { doCultivationWork } = require('./workSystem');
    const result = doCultivationWork(p, professionName);
    if (result.error) return result;
    this.addLog(result.text);
    if (result.rewards && result.rewards.length) {
      this.addJournal(`${this.state.gameDateText}·以【${professionName}】身份工作。${result.text}（${result.rewards.join('、')}）`);
    } else {
      this.addJournal(`${this.state.gameDateText}·以【${professionName}】身份工作。${result.text}`);
    }
    this.consumeAP(1);
    if (result.success) {
      this.checkCultivationProfessions();
      updateQuarterlyProgress(this.state, 'work');
      updateQuestProgress(p, 'work');
    }
    return { ...result, state: this.getPublicState() };
  }

  // ===== 宅子邀请系统 =====
  inviteToMansion(npcId) {
    const p = this.state.player;
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) return { error: '没有这个NPC' };
    if (!p.acquaintances.includes(npcId)) return { error: '你还不认识这个人' };
    if (npc.location === p.location) return { error: '对方已经在此地' };
    if (!p.mansion) return { error: '你还没有宅子' };

    // 邀请判定
    const favor = npc.favorWithPlayer || 0;
    let acceptChance = Math.max(20, Math.min(90, 30 + favor * 0.5));
    if (npc.personality === '热情' || npc.personality === '开朗') acceptChance += 15;
    if (npc.personality === '冷漠' || npc.personality === '孤傲') acceptChance -= 15;

    if (!chance(acceptChance)) {
      const rejects = [
        `${npc.name}婉拒道："近日琐事缠身，改日再登门拜访。"`,
        `${npc.name}摇摇头："多谢邀请，只是我还有事在身。"`,
        `${npc.name}面露难色："这...怕是不太方便。"`,
      ];
      return { success: false, text: randChoice(rejects), state: this.getPublicState() };
    }

    // 邀请成功
    const oldLocation = npc.location;
    npc.location = p.location;
    npc.tempLocation = oldLocation; // 记录原位置，方便离开
    npc.invitedByPlayer = true;
    npc.inviteStayTurns = randInt(3, 6); // 在宅子做客 3-6 个月（需求：不立刻离开）

    // 建立关系网链接：双方互为"宾客/友人"
    this.linkRelation(npc, p.id, '宾客', p.name, npc.favorWithPlayer || 0);
    this.linkRelation(p, npc.id, '宾客', npc.name, npc.favorWithPlayer || 0);

    const texts = [
      `${npc.name}欣然应允："既然你盛情邀请，那我便叨扰了。"随你来到了宅子。`,
      `${npc.name}笑道："那就恭敬不如从命了。"与你一同回到宅子。`,
      `${npc.name}点点头："也好，正好去你那里坐坐。"`,
    ];

    this.addLog(randChoice(texts));
    this.addJournal(`${this.state.gameDateText}·邀请${npc.name}来宅子做客。`);
    if (!npc.personalHistory) npc.personalHistory = [];
    npc.personalHistory.push(`${this.state.gameDateText}·应${p.name}邀请前往其宅子做客。`);

    return {
      success: true,
      text: randChoice(texts),
      state: this.getPublicState(),
    };
  }
}

module.exports = GameEngine;
