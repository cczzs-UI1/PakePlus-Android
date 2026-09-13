// 所有地点数据 - 33固定 + 4动态 + 7内宫 + 5青楼
const LOCATIONS = {
  // 凡人界 7处
  '大夏皇都': { id: 'F-01', zone: '凡人界', danger: 1, bg: '大夏皇都.jpg', desc: '大夏皇朝都城，繁华鼎盛，官府、拍卖行、赌坊云集。', functions: ['官府悬赏','拍卖行','赌坊'] },
  '清风镇': { id: 'F-02', zone: '凡人界', danger: 1, bg: '清风镇.jpg', desc: '宁静小镇，铁匠铺、药铺、茶馆、种子铺、肉铺、牙人所一应俱全。', functions: ['铁匠铺','药铺','茶馆','种子铺','肉铺','牙人所'] },
  '落日森林': { id: 'F-03', zone: '凡人界', danger: 2, bg: '落日森林.jpg', desc: '广袤森林，采集区遍布，妖兽出没。', functions: ['采集区'] },
  '东海渔村': { id: 'F-04', zone: '凡人界', danger: 2, bg: '东海渔村.jpg', desc: '海边渔村，码头可出海，鱼市热闹。', functions: ['码头出海','鱼市','送铁器'] },
  '大夏皇陵': { id: 'F-06', zone: '凡人界', danger: 4, bg: '大夏皇陵.jpg', desc: '皇家陵寝，迷宫重重，龙脉汇聚，碑文可参悟。', functions: ['迷宫探索','龙脉吸收','碑文参悟'], require: { realm: 3, item: '皇家手令' } },
  '万毒沼泽': { id: 'F-07', zone: '凡人界', danger: 3, bg: '万毒沼泽.jpg', desc: '毒瘴弥漫的沼泽，毒草遍地，蛊师隐居于此。', functions: ['毒草采集','蛊师小屋'], debuff: '中毒' },
  '黑风寨': { id: 'F-05', zone: '凡人界', danger: 3, bg: '黑风寨.jpg', desc: '占山为王的匪寨，共三层戒备森严，山贼盘踞，可进寨剿匪历练。', functions: ['剿匪副本一层','剿匪副本二层','剿匪副本三层'] },

  // 修仙界 8处
  '青云剑宗': { id: 'X-01', zone: '修仙界', danger: 2, bg: '青云剑宗.jpg', desc: '正道大宗，功法阁、试炼塔、灵田矿脉、洗剑池、镇魔塔。', functions: ['功法阁','试炼塔','灵田矿脉','洗剑池','镇魔塔'], require: { qingyun: true } },
  '万妖山脉': { id: 'X-02', zone: '修仙界', danger: 3, bg: '万妖山脉.jpg', desc: '妖族领地，内丹交易所、灵泉、万妖殿、古树祭坛。', functions: ['内丹交易所','灵泉','万妖殿','古树祭坛'], require: { item: '化形符' } },
  '自由坊市': { id: 'X-03', zone: '修仙界', danger: 2, bg: '自由坊市.jpg', desc: '三教九流汇聚之地，器炉坊、阵法师协会、器方阁、拍卖行，风花雪月之地。', functions: ['器炉坊', '阵法师协会', '器方阁', '拍卖行', '风花雪月'] },
  '上古遗迹': { id: 'X-04', zone: '修仙界', danger: 4, bg: '上古遗迹.jpg', desc: '随机开启的上古遗迹，残阵、古修骸骨、镇碑可参悟。', functions: ['残阵推演','古修骸骨','镇碑参悟'], require: { realmMax: 5 } },
  '丹塔': { id: 'X-05', zone: '修仙界', danger: 2, bg: '丹塔.jpg', desc: '炼丹师圣地，丹方藏经阁、丹炉市场、丹道论战、药王园。', functions: ['丹方藏经阁','丹炉市场','丹道论战','药王园'], require: { profession: '炼丹师', level: 1 } },
  '裂风峡谷': { id: 'X-06', zone: '修仙界', danger: 4, bg: '裂风峡谷.jpg', desc: '罡风肆虐的峡谷，可淬体悟道，翼人族部落聚居。', functions: ['罡风淬体','风眼悟道','翼人族部落'], require: { realm: 4, root: '风' } },
  '天星阁': { id: 'X-07', zone: '修仙界', danger: 1, bg: '天星阁.jpg', desc: '观星占卜之地，星盘推演、命格占卜、星辰灌体。', functions: ['星盘推演','命格占卜','星辰灌体'], require: { profession: '阵法师', level: 2, cost: 1000 } },
  '兽灵山': { id: 'X-08', zone: '修仙界', danger: 2, bg: '兽灵山.jpg', desc: '灵宠圣地，灵宠蛋交易市场、灵兽用品区。', functions: ['灵宠蛋交易市场','灵兽用品区'], require: { hasPet: true } },

  // 魔界/冥界 6处

  // 特殊空间 6处
  '洞天福地': { id: 'S-01', zone: '特殊空间', danger: 1, bg: '洞天福地.jpg', desc: '独立空间，时间加速、灵泉、独立灵田、傀儡守卫。', functions: ['时间加速','灵泉','独立灵田','傀儡守卫'], require: { item: '空间坐标' } },
  '混沌海': { id: 'S-02', zone: '特殊空间', danger: 5, bg: '混沌海.jpg', desc: '虚空之海，虚空采矿、虚空兽猎杀、空间风暴。', functions: ['虚空采矿','虚空兽猎杀','空间风暴'], require: { realm: 7, physique: 300 } },
  '龙渊': { id: 'S-03', zone: '特殊空间', danger: 5, bg: '龙渊.jpg', desc: '龙族禁地，龙威试炼、祖龙骸骨、龙蛋孵化。', functions: ['龙威试炼','祖龙骸骨','龙蛋孵化'], require: { item: '龙鳞信物', realm: 6 } },
  '归墟海眼': { id: 'S-04', zone: '特殊空间', danger: 5, bg: '归墟海眼.jpg', desc: '天下水脉汇聚之地，封印维护、海底矿脉、水族交易。', functions: ['封印维护','海底矿脉','水族交易'], require: { realm: 9, item: '定海神针' } },
  '太虚梦境': { id: 'S-05', zone: '特殊空间', danger: 4, bg: '太虚梦境.jpg', desc: '意识空间，心魔挑战、幻境坊市、意识穿梭。', functions: ['心魔挑战','幻境坊市','意识穿梭'], require: { spirit: 200, item: '入梦丹' } },
  '通天古路': { id: 'S-06', zone: '特殊空间', danger: 5, bg: '通天古路.jpg', desc: '飞升之路，九重天梯、化劫池、升仙碑。', functions: ['九重天梯','化劫池','升仙碑'], require: { realm: 9, karma: 3000 } },

  // 动态游走 4处
  '移动仙市': { id: 'E-01', zone: '动态', danger: 1, bg: '移动仙市.jpg', desc: '游走的青铜马车仙市，可购买时间、情报、古宝。', functions: ['购买时间','购买情报','购买古宝'], dynamic: true },
  '沉没仙宫': { id: 'E-02', zone: '动态', danger: 3, bg: '沉没仙宫.jpg', desc: '东海之下的沉没仙宫，水系功法、藏宝图。', functions: ['水系功法','藏宝图'], dynamic: true },
  '星辰裂缝': { id: 'E-03', zone: '动态', danger: 4, bg: '星辰裂缝.jpg', desc: '天星阁占卜可寻，圣物碎片、大量修为。', functions: ['圣物碎片','大量修为'], dynamic: true },
  '万剑冢': { id: 'E-04', zone: '动态', danger: 4, bg: '万剑冢.jpg', desc: '剑系功法全满可入，本命剑升级、剑意觉醒。', functions: ['本命剑升级','剑意觉醒'], dynamic: true },

  // 皇朝内宫 7处
  '御花园': { id: 'P-03', zone: '凡人界', danger: 1, bg: '御花园.jpg', desc: '皇家花园，皇后、妃嫔、赏花、偶遇皇族。', functions: ['皇后','妃嫔','赏花','偶遇皇族'], require: { item: '腰牌' } },
  '珍宝阁': { id: 'P-06', zone: '凡人界', danger: 2, bg: '珍宝阁.jpg', desc: '皇家宝库，贡献兑换秘宝、盗取珍宝。', functions: ['兑换秘宝','盗取'], require: { official: 2 } },
};

// 区域邻接关系（移动用）
const ZONE_ADJACENCY = {
  '凡人界': ['修仙界'],
  '修仙界': ['凡人界', '魔界', '冥界', '特殊空间'],
  '魔界': ['修仙界', '冥界'],
  '冥界': ['修仙界', '魔界'],
  '特殊空间': ['修仙界'],
  '动态': ['凡人界', '修仙界'],
};

// 玩家地图可见地点（第九批大地图：凡人界+修仙界固定地点；
// 已删除/未开放的地点（特殊空间/动态游走/魔界/冥界等）不在其中，NPC 随机活动与出生地也只允许这些地点）
const PLAYER_VISIBLE_LOCATIONS = [
  '清风镇', '大夏皇都', '落日森林', '东海渔村', '大夏皇陵', '万毒沼泽', '黑风寨', '御花园', '珍宝阁',
  '青云剑宗', '万妖山脉', '自由坊市', '上古遗迹', '丹塔', '裂风峡谷', '天星阁', '兽灵山', '万剑冢',
];

// 副本秘境地点（NPC 可随机活动，副本中概率采集/偶遇妖兽）
const DUNGEON_LOCATIONS = ['黑风寨·一层（山门）', '黑风寨·二层（聚义厅）', '黑风寨·三层（总坛）', '清风洞'];

module.exports = { LOCATIONS, ZONE_ADJACENCY, PLAYER_VISIBLE_LOCATIONS, DUNGEON_LOCATIONS };
