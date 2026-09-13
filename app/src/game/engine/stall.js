// 摊位系统 - 随机NPC摆摊
// v2：摊位物品全部与游戏世界真实物品挂钩（商店物价/坊市物价/锻造配方/灵田作物），不凭空捏造
const { randInt, chance, randChoice, clamp } = require('./utils');
const { generateNPC } = require('./npcGenerator');
const { GOODS, getSellPrice } = require('../data/shops');
const { BASE_PRICES } = require('./priceSystem');
const { LEARN_FORGE_RECIPES } = require('./learning');
const { CROPS } = require('./farming');

// 世界物品来源标注（与游戏内获取途径一一对应）
const ITEM_SOURCES = {
  // 商店/坊市可直接购买
  '粗布衣': '商店有售', '精铁剑': '商店/锻造有售', '皮革甲': '商店/锻造有售',
    '回灵丹': '丹药铺/炼丹产出', '回血丹': '丹药铺/炼丹产出', '聚气丹': '丹药铺/炼丹产出', '疗伤丹': '丹药铺/炼丹产出',
  '清心丹': '丹药铺/炼丹产出', '解毒丹': '丹药铺/炼丹产出',
  '火球符': '符箓铺/符师绘制', '冰锥符': '符箓铺/符师绘制', '护盾符': '符箓铺/符师绘制',
  '困敌符': '符箓铺/符师绘制', '巨力符': '符箓铺/符师绘制', '风行符': '符箓铺/符师绘制',
  '青锋剑': '锻造产出', '紫电剑': '锻造产出', '玄铁重剑': '锻造产出', '软猬甲': '锻造产出', '金丝软甲': '锻造产出',
  '玄铁刀': '锻造产出', '破甲枪': '锻造产出', '灵宝弓': '锻造产出', '玉骨扇': '锻造产出',
  '玉佩': '商店有售', '玉如意': '商店/锻造产出', '飞剑': '锻造产出', '护身符': '商店有售',
  '妖丹': '猎杀妖兽可得', '妖兽皮': '猎杀妖兽可得', '妖兽骨': '猎杀妖兽可得', '兽骨': '猎杀妖兽/采集可得',
  '鹿角': '采集可得', '灵草': '采集/灵田可得', '千年灵芝': '采集可得', '万年人参': '采集可得',
  '寒铁': '采集可得', '炎晶': '采集可得', '雷石': '采集可得', '灵木': '采集可得', '朱砂': '采集可得', '兽血': '猎杀妖兽可得',
  '夜明珠': '商店有售', '古琴': '商店有售', '古画': '商店有售', '紫金冠': '商店有售', '霓裳羽衣': '商店有售',
  '灵石矿脉': '商店有售', '灵田契约': '商店有售', '店铺地契': '商店有售', '洞府钥匙': '商店有售',
  '聚灵草': '采集区可得', '灵谷': '灵田种植', '野山参': '采集可得', '铁矿石': '采集可得',
  '珍珠': '采集可得', '玛瑙': '采集可得', '翡翠': '采集可得', '珊瑚': '采集可得', '龙涎香': '采集可得',
  '灵兽蛋': '灵宠店/驯兽可得', '驯兽鞭': '商店有售', '灵兽粮': '商店有售', '灵兽项圈': '商店有售',
  '功法残卷': '坊市有售', '玉简': '坊市有售', '心得笔记': '坊市有售',
};

// 获取物品的世界真实价格（来源优先级：商店物价 → 坊市物价 → 锻造配方材料成本×1.5 → 灵田作物）
function getWorldBasePrice(name) {
  // 1) 商店物价（shops.js GOODS）
  for (const list of Object.values(GOODS)) {
    const g = list.find(x => x.name === name);
    if (g) return { price: g.price, source: ITEM_SOURCES[name] || '商店有售' };
  }
  // 2) 坊市物价（priceSystem BASE_PRICES，值为 {price,type,desc} 或数字）
  const priceVal = BASE_PRICES[name];
  if (priceVal !== undefined) {
    const price = typeof priceVal === 'number' ? priceVal : (priceVal && typeof priceVal.price === 'number' ? priceVal.price : null);
    if (price !== null) return { price, source: ITEM_SOURCES[name] || '坊市物价' };
  }
  // 3) 锻造产物：按配方材料总成本×1.5 推导（与游戏内锻造成本一致）
  const forge = LEARN_FORGE_RECIPES.find(r => r.name === name);
  if (forge) {
    let cost = 0;
    for (const m of forge.materials) {
      const mp = getWorldBasePrice(m);
      cost += (mp && mp.price) ? mp.price : 100;
    }
    return { price: Math.max(50, Math.floor(cost * 1.5)), source: '锻造产出' };
  }
  // 4) 灵田作物（farming CROPS，价格仍以坊市物价为准，无物价则不售）
  const crop = CROPS.find(c => c.name === name);
  if (crop) {
    const cp = BASE_PRICES[name];
    if (cp !== undefined) {
      const price = typeof cp === 'number' ? cp : (cp && typeof cp.price === 'number' ? cp.price : null);
      if (price !== null) return { price, source: '灵田种植' };
    }
    return null;
  }
  return null; // 无世界数据源 → 该物品不得出现在摊位
}

// 摊位类型（物品均须通过 getWorldBasePrice 校验，无来源的物品不进摊位）
const STALL_TYPES = [
  { type: '杂货摊', name: '杂货摊', items: ['粗布衣', '精铁剑', '皮革甲'] },
  { type: '丹药摊', name: '丹药摊', items: ['回灵丹', '回血丹', '聚气丹', '疗伤丹', '清心丹', '解毒丹'] },
  { type: '符箓摊', name: '符箓摊', items: ['火球符', '冰锥符', '护盾符', '困敌符', '巨力符', '风行符'] },
  { type: '兵器摊', name: '兵器摊', items: ['精铁剑', '玄铁刀', '青锋剑', '破甲枪', '灵宝弓', '玉骨扇'] },
  { type: '材料摊', name: '材料摊', items: ['聚灵草', '灵谷', '野山参', '铁矿石', '妖兽皮', '妖丹', '兽骨', '鹿角'] },
  { type: '珍宝摊', name: '珍宝摊', items: ['玉佩', '珍珠', '玛瑙', '翡翠', '夜明珠', '珊瑚', '龙涎香'] },
  { type: '灵宠摊', name: '灵宠摊', items: ['灵兽蛋', '驯兽鞭', '灵兽粮', '灵兽项圈'] },
  { type: '功法摊', name: '功法摊', items: ['功法残卷', '玉简', '心得笔记'] },
];

// 生成随机摊位
function generateStall(location, vendor = null) {
  const stallType = randChoice(STALL_TYPES);
  if (!vendor) {
    vendor = generateNPC({ location, realmLevel: randInt(1, 5) });
    vendor.isVirtualVendor = true;
  }
  vendor.isStallVendor = true;
  vendor.stallType = stallType.type;

  // 生成商品（3-6件），全部物品须在世界数据源有真实价格
  const itemCount = randInt(3, 6);
  const goods = [];
  const availableItems = [...stallType.items].filter(n => getWorldBasePrice(n));
  for (let i = 0; i < itemCount && availableItems.length > 0; i++) {
    const idx = randInt(0, availableItems.length - 1);
    const itemName = availableItems.splice(idx, 1)[0];
    // 世界真实价格（商店/坊市/锻造材料成本/灵田）
    const wp = getWorldBasePrice(itemName);
    if (!wp) continue; // 防御：无来源物品不进摊位
    const basePrice = wp.price;
    // 浮动价格 ±30%
    const fluctuation = 0.7 + Math.random() * 0.6;
    const price = Math.floor(basePrice * fluctuation);
    const desc = getItemDesc(itemName);
    goods.push({
      name: itemName,
      price,
      basePrice,
      stock: randInt(1, 5),
      desc,
      source: wp.source, // 与世界的联系：来源标注
    });
  }

  return {
    id: 'stall_' + Date.now() + '_' + randInt(1000, 9999),
    vendor,
    location,
    type: stallType.type,
    name: stallType.name,
    goods,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24小时后消失
  };
}

// 获取物品描述
function getItemDesc(itemName) {
  for (const goodsList of Object.values(GOODS)) {
    const found = goodsList.find(g => g.name === itemName);
    if (found) return found.desc;
  }
  return '';
}

// 讲价系统
function bargain(stall, itemName, playerPersuasion = 50) {
  const item = stall.goods.find(g => g.name === itemName);
  if (!item) return { success: false, reason: '没有这件商品' };

  // 讲价成功率基于 persuasion 和 摊主性格
  const vendorPersonality = stall.vendor.personality || '普通';
  let successRate = 30 + playerPersuasion * 0.5;
  if (['吝啬', '精明', '贪婪'].includes(vendorPersonality)) successRate -= 20;
  if (['豪爽', '憨厚', '善良'].includes(vendorPersonality)) successRate += 15;
  successRate = clamp(successRate, 10, 80);

  if (Math.random() * 100 < successRate) {
    const discount = 0.7 + Math.random() * 0.2; // 7-9折
    const newPrice = Math.floor(item.price * discount);
    item.price = newPrice;
    item.bargained = true;
    return {
      success: true,
      text: `你与${stall.vendor.name}一番讨价还价，最终将【${itemName}】的价格从${item.basePrice}灵石讲到了${newPrice}灵石！`,
      newPrice,
    };
  } else {
    return {
      success: false,
      text: `${stall.vendor.name}摇了摇头："客官，这价格已经是最低价了，不能再少了。"`,
    };
  }
}

// 从摊位购买
function buyFromStall(stall, itemName, player) {
  const item = stall.goods.find(g => g.name === itemName);
  if (!item) return { error: '没有这件商品' };
  if (item.stock <= 0) return { error: '已售罄' };
  if (player.spiritStone < item.price) return { error: '灵石不足' };

  player.spiritStone -= item.price;
  item.stock--;

  const existing = player.inventory.find(i => i.name === itemName);
  if (existing) existing.count++;
  else player.inventory.push({ name: itemName, count: 1, desc: item.desc });

  return {
    success: true,
    text: `你花费${item.price}灵石从${stall.vendor.name}处购买了【${itemName}】。`,
    item: itemName,
    price: item.price,
  };
}

// 偷窃摊位物品
function stealFromStall(stall, itemName, player) {
  const item = stall.goods.find(g => g.name === itemName);
  if (!item) return { error: '没有这件商品' };
  if (item.stock <= 0) return { error: '已售罄' };

  const stealLevel = player.stealLevel || 1;
  const successRate = 20 + stealLevel * 8;
  const vendorAlertness = stall.vendor.attributes?.perception || 30;
  const finalRate = clamp(successRate - vendorAlertness * 0.3, 5, 90);

  if (Math.random() * 100 < finalRate) {
    item.stock--;
    const existing = player.inventory.find(i => i.name === itemName);
    if (existing) existing.count++;
    else player.inventory.push({ name: itemName, count: 1, desc: item.desc });

    return {
      success: true,
      text: `你趁${stall.vendor.name}不注意，悄悄顺走了【${itemName}】！`,
      item: itemName,
    };
  } else {
    // 被发现
    const consequences = [
      { text: `${stall.vendor.name}发现了你的偷窃行为，大声呵斥，你慌忙逃走，名声受损！`, reputation: -10 },
      { text: `${stall.vendor.name}一把抓住你的手腕，怒骂道："小贼！敢偷东西？"周围人纷纷侧目。`, reputation: -15 },
      { text: `偷窃被发现，${stall.vendor.name}扬言要报官，你只得灰溜溜地离开。`, reputation: -20 },
    ];
    const consequence = randChoice(consequences);
    player.reputation = (player.reputation || 0) + consequence.reputation;
    return {
      success: false,
      caught: true,
      text: consequence.text,
      reputation: consequence.reputation,
    };
  }
}

// 摊位交互剧情
const STALL_INTERACTIONS = [
  { trigger: 'greet', text: '你走到摊位前，摊主热情地招呼："客官，看看要点什么？都是好东西！"' },
  { trigger: 'greet', text: '摊主正在整理货物，见你过来，抬头笑了笑："随便看，随便看。"' },
  { trigger: 'greet', text: '摊位前有些冷清，摊主见你过来，连忙起身："客官里面请，我这可有不少好货。"' },
  { trigger: 'browse', text: '你仔细浏览着摊位上的货物，摊主在一旁殷勤介绍。' },
  { trigger: 'browse', text: '你拿起一件货物端详，摊主连忙说："客官好眼光，这可是上等货色！"' },
  { trigger: 'browse', text: '摊位上的货物琳琅满目，你一时看花了眼。' },
  { trigger: 'leave', text: '你转身离开，摊主在身后喊道："客官慢走，下次再来啊！"' },
  { trigger: 'leave', text: '你摆摆手表示不买，摊主有些失望地叹了口气。' },
];

function getStallInteraction(trigger) {
  const interactions = STALL_INTERACTIONS.filter(i => i.trigger === trigger);
  return randChoice(interactions);
}

module.exports = {
  STALL_TYPES,
  getWorldBasePrice,
  generateStall,
  bargain,
  buyFromStall,
  stealFromStall,
  getStallInteraction,
};
