// 工具函数
const fs = require('fs');
const path = require('path');

// 随机整数 [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机浮点数 [min, max)
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// 从数组随机选取
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 从数组随机选取n个不重复
function randChoices(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 打乱数组
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 概率判定
function chance(percent) {
  return Math.random() * 100 < percent;
}

// 加权随机
function weightedChoice(items, weightKey = 'weight') {
  const total = items.reduce((sum, item) => sum + (item[weightKey] || 1), 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item[weightKey] || 1;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// 限制范围
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 生成唯一ID
let idCounter = 0;
function genId(prefix = 'id') {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// 中文名生成
// 单字姓氏（百家姓）
const SINGLE_SURNAMES = ['赵','钱','孙','李','周','吴','郑','王','冯','陈','褚','卫','蒋','沈','韩','杨','朱','秦','尤','许','何','吕','施','张','孔','曹','严','华','金','魏','陶','姜','戚','谢','邹','喻','柏','水','窦','章','云','苏','潘','葛','奚','范','彭','郎','鲁','韦','昌','马','苗','凤','花','方','俞','任','袁','柳','鲍','史','唐','费','廉','岑','薛','雷','贺','倪','汤','滕','殷','罗','毕','郝','邬','安','常','乐','于','时','傅','皮','卞','齐','康','伍','余','元','卜','顾','孟','平','黄','和','穆','萧','尹','姚','邵','湛','汪','祁','毛','禹','狄','米','贝','明','臧','计','伏','成','戴','谈','宋','茅','庞','熊','纪','舒','屈','项','祝','董','梁','杜','阮','蓝','闵','席','季','麻','强','贾','路','娄','危','江','童','颜','郭','梅','盛','林','刁','钟','徐','邱','骆','高','夏','蔡','田','樊','胡','凌','霍','虞','万','支','柯','管','卢','莫','经','房','裘','缪','干','解','应','宗','丁','宣','贲','邓','郁','单','杭','洪','包','诸','左','石','崔','吉','钮','龚','程','嵇','邢','滑','裴','陆','荣','翁','荀','羊','惠','甄','曲','家','封','芮','羿','储','靳','汲','邴','糜','松','井','段','富','巫','乌','焦','巴','弓','牧','隗','山','谷','车','侯','宓','蓬','全','郗','班','仰','秋','仲','伊','宫','宁','仇','栾','暴','甘','钭','厉','戎','祖','武','符','刘','景','詹','束','龙','叶','幸','司','韶','郜','黎','蓟','薄','印','宿','白','怀','蒲','邰','从','鄂','索','咸','籍','赖','卓','蔺','屠','蒙','池','乔','阴','鬱','胥','能','苍','双','闻','莘','党','翟','谭','贡','劳','逄','姬','申','扶','堵','冉','宰','郦','雍','却','璩','桑','桂','濮','牛','寿','通','边','扈','燕','冀','郏','浦','尚','农','温','别','庄','晏','柴','瞿','阎','充','慕','连','茹','习','宦','艾','鱼','容','向','古','易','慎','戈','廖','庾','终','暨','居','衡','步','都','耿','满','弘','匡','国','文','寇','广','禄','阙','东','欧','殳','沃','利','蔚','越','夔','隆','师','巩','厍','聂','晁','勾','敖','融','冷','訾','辛','阚','那','简','饶','空','曾','毋','沙','乜','养','鞠','须','丰','巢','关','蒯','相','查','后','荆','红','游','竺','权','逯','盖','益','桓','公','晋','楚','闫','法','汝','鄢','涂','钦','岳','帅','缑','亢','况','后','有','琴','商','牟','佘','佴','伯','赏','墨','哈','谯','笪','年','爱','阳','佟'];

// 双字姓氏（复姓）
const DOUBLE_SURNAMES = ['万俟','司马','上官','欧阳','夏侯','诸葛','闻人','东方','赫连','皇甫','尉迟','公羊','澹台','公冶','宗政','濮阳','淳于','单于','太叔','申屠','公孙','仲孙','轩辕','令狐','钟离','宇文','长孙','慕容','鲜于','闾丘','司徒','司空','亓官','司寇','子车','颛孙','端木','巫马','公西','漆雕','乐正','壤驷','公良','拓跋','夹谷','宰父','谷梁','段干','百里','东郭','南门','呼延','羊舌','微生','梁丘','左丘','东门','西门','南宫'];

// 名字A字库（第一个字，常用寓意字）
const NAME_A_CHARS = ['子','云','文','德','明','志','永','建','国','世','家','学','思','天','元','正','大','中','光','宗','庆','瑞','祥','福','寿','安','平','康','宁','静','清','雅','秀','俊','英','杰','豪','雄','伟','强','刚','毅','坚','卓','超','越','博','广','宏','弘','鸿','宏','远','长','高','升','兴','旺','盛','荣','华','富','贵','金','玉','宝','珍','珠','翠','碧','青','紫','红','白','黑','黄','蓝','风','雨','雪','霜','露','云','霞','虹','星','月','日','天','地','山','水','河','海','江','湖','林','森','木','花','草','兰','菊','梅','竹','松','柏','柳','桃','李','杏','枫','桐','楠','桂','荷','莲','萍','蓉','薇','茉','莉','萱','芷','芸','苑','若','茂','荣','蓓','蕾','蕊','蔓','藤','萝','茵','茗','茜','茵','茹','荷','莲','萍','蓉','薇','茉','莉','萱','芷','芸','苑','若','茂','荣','蓓','蕾','蕊','蔓','藤','萝','茵','茗','茜'];

// 名字B字库（第二个字，全部为单字）
const NAME_B_CHARS = ['龙','虎','豹','狼','鹰','燕','鹤','鹏','凤','凰','麟','龟','鱼','虫','鸟','兽','飞','翔','游','跑','跳','走','行','动','静','止','息','休','眠','睡','醒','觉','悟','知','识','慧','智','愚','蠢','笨','巧','灵','敏','捷','速','缓','慢','急','躁','稳','重','轻','浮','沉','深','浅','厚','薄','宽','窄','大','小','多','少','长','短','高','低','上','下','左','右','前','后','东','西','南','北','中','内','外','里','表','头','尾','首','末','始','终','先','后','新','旧','古','今','明','暗','昼','夜','晨','暮','早','晚','春','夏','秋','冬','寒','暑','冷','热','温','凉','干','湿','燥','润','硬','软','坚','脆','强','弱','刚','柔','美','丑','善','恶','好','坏','真','假','虚','实','空','满','贫','富','穷','达','通','阻','碍','顺','逆','吉','凶','祸','福','喜','怒','哀','乐','忧','愁','悲','欢','爱','恨','情','义','礼','智','信','仁','德','道','法','术','艺','文','武','诗','书','画','琴','棋','剑','刀','枪','弓','箭','甲','盾','旗','鼓','钟','磬','笛','箫','笙','瑟','琵','筝','阮','咸','卤','墨','砚','纸','笔','印','玺','章','符','令','节','权','势','位','爵','禄','俸','银','金','钱','财','宝','珠','玉','珍','奇','异','特','殊','常','凡','俗','雅','淡','浓','香','臭','腥','膻','甜','苦','酸','辣','咸'];

function genName(gender, surname) {
  // 80%单字姓氏，20%双字姓氏
  const useDouble = Math.random() < 0.2;
  const s = surname || (useDouble ? randChoice(DOUBLE_SURNAMES) : randChoice(SINGLE_SURNAMES));
  // 名字 = A + B
  const nameA = randChoice(NAME_A_CHARS);
  const nameB = randChoice(NAME_B_CHARS);
  return s + nameA + nameB;
}

// 从名字中提取姓氏（复姓优先，否则取首字）
function extractSurname(name) {
  if (!name) return '';
  if (name.length >= 2 && DOUBLE_SURNAMES.includes(name.slice(0, 2))) return name.slice(0, 2);
  return name.slice(0, 1);
}

// 立绘路径获取
const LIHUI_BASE = path.join(__dirname, '..', '..', 'images', 'lihui');

function getPortrait(age, gender, customRanges = null) {
  let dir, category;
  if (age <= 3) {
    dir = path.join(LIHUI_BASE, 'baby');
    category = 'baby';
  } else if (age <= 15) {
    dir = path.join(LIHUI_BASE, 'young', gender === '女' ? 'female' : 'male');
    category = gender === '女' ? 'youngFemale' : 'youngMale';
  } else {
    dir = path.join(LIHUI_BASE, 'adult', gender === '女' ? 'female' : 'male');
    category = gender === '女' ? 'adultFemale' : 'adultMale';
  }

  // 如果有定制范围，从定制范围内选择
  if (customRanges && customRanges[category] && customRanges[category].length > 0) {
    return randChoice(customRanges[category]);
  }

  try {
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    if (files.length === 0) return null;
    const file = randChoice(files);
    return path.join('images', 'lihui', path.relative(LIHUI_BASE, dir), file).replace(/\\/g, '/');
  } catch (e) {
    return null;
  }
}

// 深拷贝
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 格式化日期
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}年${m}月${d}日 ${h}:${min}`;
}

// 游戏内时间格式化
function formatGameTime(gameDate) {
  const xunNames = ['上旬', '中旬', '下旬'];
  return `${gameDate.year}年${gameDate.month}月${xunNames[gameDate.xun]}`;
}

// 物品名匹配（兼容灵田收获的品质前缀：'优秀灵谷'/'极品灵谷' 匹配 '灵谷'）
const ITEM_QUALITY_PREFIXES = ['优秀', '极品', '普通'];
function matchItemName(bagName, item) {
  if (bagName === item) return true;
  return ITEM_QUALITY_PREFIXES.some(p => bagName === p + item);
}

// 剧情文本性别指代修正：先判定NPC性别，男性用"他/父亲/父/亲儿/妻子"，女性用"她/母亲/母/亲女/丈夫"
// 覆盖"她/他""他/她""她（他）""母亲/父亲""父/母""亲女/亲儿""丈夫/妻子"等模糊双写写法
function genderize(text, npc) {
  if (!text || !npc) return text;
  const he = npc.gender === '女' ? '她' : '他';
  const parent = npc.gender === '女' ? '母亲' : '父亲';
  const shortParent = npc.gender === '女' ? '母' : '父';
  const daughterSon = npc.gender === '女' ? '亲女' : '亲儿';
  const spouse = npc.gender === '女' ? '丈夫' : '妻子';
  let t = String(text);
  t = t.replace(/她（他）/g, he).replace(/他（她）/g, he);
  t = t.replace(/她\(他\)/g, he).replace(/他\(她\)/g, he);
  t = t.replace(/她\/他/g, he).replace(/他\/她/g, he);
  t = t.replace(/她\s*\/\s*他/g, he).replace(/他\s*\/\s*她/g, he);
  t = t.replace(/母亲（父亲）/g, parent).replace(/父亲（母亲）/g, parent);
  t = t.replace(/母亲\/父亲/g, parent).replace(/父亲\/母亲/g, parent);
  t = t.replace(/母亲\s*\/\s*父亲/g, parent).replace(/父亲\s*\/\s*母亲/g, parent);
  t = t.replace(/父\/母/g, shortParent).replace(/母\/父/g, shortParent);
  t = t.replace(/亲女\/亲儿/g, daughterSon).replace(/亲儿\/亲女/g, daughterSon);
  t = t.replace(/丈夫\/妻子/g, spouse).replace(/妻子\/丈夫/g, spouse);
  return t;
}

module.exports = {
  randInt, randFloat, randChoice, randChoices, shuffle, chance, weightedChoice, clamp,
  genId, genName, extractSurname, getPortrait, deepClone, formatDate, formatGameTime,
  matchItemName, ITEM_QUALITY_PREFIXES, genderize,
  SINGLE_SURNAMES, DOUBLE_SURNAMES, NAME_A_CHARS, NAME_B_CHARS,
};
