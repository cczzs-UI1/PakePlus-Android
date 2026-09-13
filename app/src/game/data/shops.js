// 商店系统 - 各地点商店物品与价格
const { randInt, chance } = require('../engine/utils');

// 商店类型定义
const SHOP_TYPES = {
  grocery: { name: '杂货铺', desc: '日常用品与基础材料', locations: ['清风镇', '大夏皇都', '东海渔村', '自由坊市'] },
  elixir: { name: '丹药铺', desc: '各类丹药与药材', locations: ['大夏皇都', '自由坊市', '丹塔', '青云剑宗'] },
  talisman: { name: '符箓铺', desc: '符箓与阵法材料', locations: ['大夏皇都', '自由坊市', '天星阁'] },
  weapon: { name: '兵器铺', desc: '法器与兵刃', locations: ['大夏皇都', '自由坊市', '万剑冢'] },
  material: { name: '材料行', desc: '妖兽材料与天材地宝', locations: ['自由坊市', '万妖山脉', '兽灵山'] },
  luxury: { name: '珍宝阁', desc: '奇珍异宝与奢侈品', locations: ['大夏皇都', '珍宝阁'] },
  brothel: { name: '青楼', desc: '风花雪月之地', locations: ['明月台'] },
  market: { name: '坊市', desc: '自由交易的大市场', locations: ['自由坊市', '移动仙市'] },
};

// 商品池
const GOODS = {
  // 杂货
  grocery: [
    { name: '粗布衣', price: 20, type: '装备', desc: '普通布衣，防御+2' },
    { name: '精铁剑', price: 200, type: '装备', desc: '精铁打造的剑，攻击+10' },
    { name: '皮革甲', price: 150, type: '装备', desc: '皮革护甲，防御+8' },
  ],
  // 丹药
  elixir: [
    { name: '回灵丹', price: 100, type: '丹药', desc: '恢复灵力30%' },
    { name: '回血丹', price: 80, type: '丹药', desc: '恢复气血30%' },
    { name: '聚气丹', price: 300, type: '丹药', desc: '增加修为500' },
    { name: '筑基丹', price: 2000, type: '丹药', desc: '筑基期突破必备' },
    { name: '金丹', price: 10000, type: '丹药', desc: '结丹期突破必备' },
    { name: '元婴丹', price: 50000, type: '丹药', desc: '元婴期突破必备' },
    { name: '疗伤丹', price: 150, type: '丹药', desc: '治疗伤势，恢复50%气血' },
    { name: '清心丹', price: 200, type: '丹药', desc: '清除心魔，突破成功率+10%' },
    { name: '送子丹', price: 5000, type: '丹药', desc: '服用后必受孕' },
    { name: '顺产丹', price: 3000, type: '丹药', desc: '生产成功率+20%' },
    { name: '增寿丹', price: 20000, type: '丹药', desc: '增加寿元50年' },
    { name: '解毒丹', price: 120, type: '丹药', desc: '解除中毒状态' },
  ],
  // 符箓
  talisman: [
    { name: '火球符', price: 80, type: '符箓', desc: '释放火球攻击' },
    { name: '冰锥符', price: 80, type: '符箓', desc: '释放冰锥攻击' },
    { name: '护盾符', price: 100, type: '符箓', desc: '形成护盾防御' },
    { name: '困敌符', price: 200, type: '符箓', desc: '困住敌人3回合' },
    { name: '巨力符', price: 150, type: '符箓', desc: '攻击力翻倍3回合' },
    { name: '风行符', price: 120, type: '符箓', desc: '速度提升3回合' },
  ],
  // 兵器
  weapon: [
    { name: '精铁剑', price: 200, type: '装备', desc: '攻击+10' },
    { name: '青锋剑', price: 800, type: '装备', desc: '攻击+25，附带剑气' },
    { name: '紫电剑', price: 3000, type: '装备', desc: '攻击+50，雷属性' },
    { name: '玄铁重剑', price: 1500, type: '装备', desc: '攻击+40，攻速降低' },
    { name: '软猬甲', price: 2000, type: '装备', desc: '防御+30，反伤10%' },
    { name: '金丝软甲', price: 5000, type: '装备', desc: '防御+50' },
    { name: '玉佩', price: 600, type: '装备', desc: '灵力上限+100' },
    { name: '储物戒指', price: 3000, type: '特殊', desc: '大容量储物' },
    { name: '飞剑', price: 8000, type: '装备', desc: '可御剑飞行，攻击+80' },
    { name: '护身符', price: 400, type: '装备', desc: '抵挡一次致命伤害' },
  ],
  // 材料
  material: [
    { name: '妖丹', price: 300, type: '材料', desc: '妖兽内丹，炼丹材料' },
    { name: '妖兽皮', price: 150, type: '材料', desc: '制甲材料' },
    { name: '妖兽骨', price: 100, type: '材料', desc: '炼器材料' },
    { name: '灵草', price: 50, type: '材料', desc: '基础炼丹材料' },
    { name: '千年灵芝', price: 2000, type: '材料', desc: '珍贵药材' },
    { name: '万年人参', price: 5000, type: '材料', desc: '极品药材' },
    { name: '寒铁', price: 800, type: '材料', desc: '炼器材料，冰属性' },
    { name: '炎晶', price: 800, type: '材料', desc: '炼器材料，火属性' },
    { name: '雷石', price: 1000, type: '材料', desc: '炼器材料，雷属性' },
    { name: '灵木', price: 200, type: '材料', desc: '制符炼器材料' },
    { name: '朱砂', price: 80, type: '材料', desc: '画符材料' },
    { name: '兽血', price: 120, type: '材料', desc: '炼丹炼器材料' },
  ],
  // 珍宝
  luxury: [
    { name: '夜明珠', price: 5000, type: '珍宝', desc: '夜明珠，价值连城' },
    { name: '玉如意', price: 3000, type: '珍宝', desc: '吉祥如意' },
    { name: '紫金冠', price: 8000, type: '珍宝', desc: '紫金打造的冠冕' },
    { name: '霓裳羽衣', price: 10000, type: '珍宝', desc: '仙女所穿羽衣' },
    { name: '古琴', price: 6000, type: '珍宝', desc: '名琴，可安神' },
    { name: '古画', price: 4000, type: '珍宝', desc: '名家画作' },
    { name: '灵石矿脉', price: 50000, type: '产业', desc: '可产出灵石的矿脉' },
    { name: '灵田契约', price: 20000, type: '产业', desc: '一块灵田的所有权' },
    { name: '店铺地契', price: 30000, type: '产业', desc: '一间店铺的地契' },
    { name: '洞府钥匙', price: 100000, type: '产业', desc: '一座洞府的所有权' },
  ],
};

// 获取某地点的商店列表
function getShopsAtLocation(locationName) {
  const shops = [];
  for (const [type, info] of Object.entries(SHOP_TYPES)) {
    if (info.locations.includes(locationName)) {
      shops.push({ type, name: info.name, desc: info.desc });
    }
  }
  // 自由坊市和移动仙市有所有商店
  if (locationName === '自由坊市' || locationName === '移动仙市') {
    for (const [type, info] of Object.entries(SHOP_TYPES)) {
      if (!shops.find(s => s.type === type)) {
        shops.push({ type, name: info.name, desc: info.desc });
      }
    }
  }
  return shops;
}

// 获取商店商品（带随机价格波动）
function getShopGoods(shopType) {
  const goods = GOODS[shopType] || [];
  return goods.map(g => {
    // 价格波动 ±20%
    const fluctuation = 0.8 + Math.random() * 0.4;
    return {
      ...g,
      currentPrice: Math.floor(g.price * fluctuation),
      stock: randInt(1, 10),
    };
  });
}

// 收购价格（卖出价为买入价的50-70%）
function getSellPrice(itemName) {
  for (const goods of Object.values(GOODS)) {
    const item = goods.find(g => g.name === itemName);
    if (item) {
      return Math.floor(item.price * (0.5 + Math.random() * 0.2));
    }
  }
  // 未知物品按固定价
  return randInt(10, 100);
}

module.exports = { SHOP_TYPES, GOODS, getShopsAtLocation, getShopGoods, getSellPrice };
