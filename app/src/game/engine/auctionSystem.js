// 拍卖行系统 - 起拍价 = 配方材料成本之和 × 2
const { randInt, randChoice, clamp } = require('./utils');
const { ITEMS } = require('../data/items');
const { RECIPES } = require('./alchemy');
const { FORGE_RECIPES } = require('./forge');

// 基础价（物品数据库）
function getItemBasePrice(name) {
  const it = ITEMS[name];
  if (it && it.price) return it.price;
  // 兜底价格
  const tiers = { '凡': 50, '灵': 300, '宝': 1500, '仙': 20000 };
  return tiers[name] || 100;
}

// 材料成本：从丹方/锻造配方反查该物品的材料总价（无配方则用基础价）
function getMaterialCost(name) {
  const rec = RECIPES.find(r => r.result === name) || FORGE_RECIPES.find(r => r.name === name);
  if (!rec) return getItemBasePrice(name);
  let total = 0;
  for (const m of rec.materials) {
    total += m.count * getItemBasePrice(m.name);
  }
  return Math.max(10, total);
}

// 起拍价：材料成本之和 × 2（需求7）
function startingBid(name) {
  return Math.max(50, Math.floor(getMaterialCost(name) * 2));
}

// 可拍卖物品种类（武器/防具/饰品/丹药/符箓/材料）
const AUCTION_POOLS = {
  '武器': () => FORGE_RECIPES.filter(r => r.type === '武器').map(r => r.name).filter(n => !['精铁剑', '青锋剑', '紫电剑', '玄铁重剑', '飞剑'].includes(n)).concat(['铁剑', '钢刀', '长枪', '弓箭', '青锋剑']),
  '防具': () => FORGE_RECIPES.filter(r => r.type === '防具').map(r => r.name),
  '饰品': () => FORGE_RECIPES.filter(r => r.type === '饰品').map(r => r.name),
  '丹药': () => RECIPES.map(r => r.result),
  '符箓': () => ['火球符', '冰锥符', '护盾符', '困敌符', '巨力符', '风行符', '化形符'],
  '材料': () => Object.entries(ITEMS).filter(([, v]) => v.type === 'material').map(([k]) => k),
};

// 生成一批拍卖品
function genAuctionItems(state, count = 5) {
  const types = Object.keys(AUCTION_POOLS);
  const items = [];
  const used = new Set();
  let guard = 0;
  while (items.length < count && guard < 200) {
    guard++;
    const type = randChoice(types);
    const pool = AUCTION_POOLS[type]();
    if (!pool.length) continue;
    const name = randChoice(pool);
    if (used.has(name)) continue;
    used.add(name);
    const cost = getMaterialCost(name);
    items.push({
      id: 'au_' + Date.now() + '_' + items.length + '_' + randInt(1, 9999),
      itemName: name,
      type,
      tier: (ITEMS[name]?.tier) || 1,
      startPrice: startingBid(name),
      currentPrice: startingBid(name),
      highestBidder: null,
      bids: 0,
      roundsLeft: 3, // 3次转月后结标
      cost, // 材料成本（展示用）
      bidLog: [], // 竞拍记录：{who, price, currency}
    });
  }
  return items;
}

// 获取拍卖行状态（首次或全部结束后刷新）
function getAuction(state) {
  if (!state.auction) state.auction = { items: [], history: [] };
  // 补足
  if (state.auction.items.length === 0) {
    state.auction.items = genAuctionItems(state, 5);
  }
  return state.auction;
}

// 出价
function bidAuction(state, player, auctionId, price) {
  getAuction(state);
  const item = state.auction.items.find(i => i.id === auctionId);
  if (!item) return { success: false, msg: '拍卖品不存在或已结标' };
  const p = Number(price);
  if (!p || p < item.currentPrice + 10) return { success: false, msg: `出价需高于当前价（${item.currentPrice}），至少+10` };
  // 货币：按物品 realm 决定（mortal 银两，其余灵石）
  const it = ITEMS[item.itemName];
  const useSilver = it ? it.currency === 'silver' || it.realm === 'mortal' : item.type === '材料' && (item.tier === '凡' || item.tier === 1);
  const currency = useSilver ? 'silver' : 'spiritStone';
  if ((player[currency] || 0) < p) return { success: false, msg: `${currency === 'silver' ? '银两' : '灵石'}不足` };
  // 退还上一最高出价者（简化：直接扣新价，退旧价）
  if (item.highestBidder) {
    const prev = state.npcs.find(n => n.id === item.highestBidder) || (state.player.id === item.highestBidder ? state.player : null);
    if (prev && prev[currency] !== undefined) prev[currency] = (prev[currency] || 0) + item.currentPrice;
  }
  player[currency] -= p;
  item.currentPrice = p;
  item.highestBidder = player.id;
  item.bids++;
  item.roundsLeft = 3; // 有人出价则顺延
  item.bidLog.push({ who: player.name || '玩家', price: p, currency });
  return { success: true, msg: `你对【${item.itemName}】出价${p}${currency === 'silver' ? '银两' : '灵石'}，当前领先。`, auction: state.auction };
}

// 随机NPC竞拍体系：按NPC的银钱/灵石设计，钱够的才会参与，概率参与0-3次；
// 钱不够会放弃；钱够则概率放弃/竞拍（出价即扣钱，被超价时退回）。
function simulateNpcBids(state) {
  if (!state.auction || !state.auction.items) return;
  const npcs = (state.npcs || []).filter(n => n.isAlive);
  if (!npcs.length) return;
  for (const item of state.auction.items) {
    const it = ITEMS[item.itemName];
    const useSilver = it ? it.currency === 'silver' || it.realm === 'mortal' : item.type === '材料' && (item.tier === '凡' || item.tier === 1);
    const currency = useSilver ? 'silver' : 'spiritStone';
    // 概率参与 0-3 次（40% 无人，30% 1人，20% 2人，10% 3人）
    const round = Math.random();
    const times = round < 0.4 ? 0 : round < 0.7 ? 1 : round < 0.9 ? 2 : 3;
    let made = 0;
    let guard = 0;
    while (made < times && guard < 30) {
      guard++;
      const npc = randChoice(npcs);
      if (npc.id === item.highestBidder) continue;
      const wealth = npc[currency] || 0;
      // 钱不够 → 放弃
      if (wealth < item.currentPrice + 10) continue;
      // 钱够 → 概率放弃 / 竞拍
      if (Math.random() < 0.5) continue;
      const bidPrice = item.currentPrice + randInt(10, Math.max(10, Math.floor(wealth * 0.03)));
      if ((npc[currency] || 0) < bidPrice) continue;
      // 退回上一最高出价者
      if (item.highestBidder) {
        const prev = state.player.id === item.highestBidder ? state.player : npcs.find(n => n.id === item.highestBidder);
        if (prev && prev[currency] !== undefined) prev[currency] = (prev[currency] || 0) + item.currentPrice;
      }
      npc[currency] -= bidPrice;
      item.currentPrice = bidPrice;
      item.highestBidder = npc.id;
      item.bids++;
      item.bidLog.push({ who: npc.name, price: bidPrice, currency });
      made++;
    }
  }
}

// 转月结算：到期（roundsLeft<=0）的拍卖品成交给最高出价者
function settleAuctions(state) {
  if (!state.auction || !state.auction.items) return [];
  // 本轮随机NPC竞拍（0-3次参与，按银钱/灵石，钱不够放弃，钱够概率放弃/竞拍）
  simulateNpcBids(state);
  const results = [];
  const kept = [];
  for (const item of state.auction.items) {
    item.roundsLeft--;
    if (item.roundsLeft <= 0) {
      // 结标
      if (item.highestBidder) {
        // 最高出价者得标
        const bidder = state.player.id === item.highestBidder ? state.player : state.npcs.find(n => n.id === item.highestBidder);
        if (bidder) {
          if (!bidder.inventory) bidder.inventory = [];
          const existing = bidder.inventory.find(i => i.name === item.itemName);
          if (existing) existing.count++;
          else bidder.inventory.push({ name: item.itemName, count: 1, desc: ITEMS[item.itemName]?.desc || '' });
          const bidDetail = item.bidLog.length
            ? item.bidLog.map(b => `${b.who}出价${b.price}`).join('；')
            : '无人出价';
          const note = `【${item.itemName}】起拍${item.startPrice}，共${item.bids}次出价（${bidDetail}）。${bidder ? `最终由${bidder.name}以${item.currentPrice}${item.bidLog[0]?.currency === 'silver' ? '银两' : '灵石'}拍得` : '最终流拍'}`;
          results.push({ itemName: item.itemName, price: item.currentPrice, bidder: bidder.name || '玩家', note, log: item.bidLog });
          state.auction.history.push({ itemName: item.itemName, price: item.currentPrice, bidder: bidder.name || '流拍', note, time: state.gameDateText, log: item.bidLog });
        } else {
          const note = `【${item.itemName}】起拍${item.startPrice}，无人出价，最终流拍。`;
          state.auction.history.push({ itemName: item.itemName, price: item.currentPrice, bidder: '流拍', note, time: state.gameDateText, log: item.bidLog });
        }
      }
    } else {
      kept.push(item);
    }
  }
  state.auction.items = kept;
  return results;
}

module.exports = { getAuction, bidAuction, settleAuctions, genAuctionItems, getMaterialCost, startingBid, simulateNpcBids };
