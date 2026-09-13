// 16种性格 + 情欲特质
const PERSONALITIES = {
  '温和宽厚': { category: '仁善型', trait: '待人宽容', weights: { social: 1.2, cultivate: 1.1, explore: 1.0, combat: 0.8 }, style: '语气平和，多用商量口吻', compatible: ['豪迈型','活泼型'], incompatible: ['阴鸷型','冷峻型'] },
  '古道热肠': { category: '仁善型', trait: '好管闲事', weights: { social: 1.3, explore: 1.2, cultivate: 0.9, combat: 0.9 }, style: '爽朗直接，常带"兄弟/妹子"', compatible: ['豪迈型','活泼型'], incompatible: ['阴鸷型','冷峻型'] },
  '爽朗洒脱': { category: '豪迈型', trait: '不拘小节', weights: { social: 1.2, explore: 1.3, cultivate: 0.9, combat: 1.0 }, style: '大声说话，爱笑，重义气', compatible: ['仁善型','随性型'], incompatible: ['冷峻型','精明型'] },
  '狂放不羁': { category: '豪迈型', trait: '行事张扬', weights: { combat: 1.3, explore: 1.2, social: 1.0, cultivate: 0.8 }, style: '话语锋利，自带三分傲气', compatible: ['仁善型','随性型'], incompatible: ['冷峻型','精明型'] },
  '精明细算': { category: '精明型', trait: '斤斤计较', weights: { trade: 1.3, cultivate: 1.1, social: 0.9, combat: 0.8 }, style: '说话滴水不漏', compatible: ['随性型','冷峻型'], incompatible: ['豪迈型','活泼型'] },
  '圆滑世故': { category: '精明型', trait: '善于周旋', weights: { trade: 1.2, social: 1.2, cultivate: 1.0, combat: 0.7 }, style: '语气亲和，话中有话', compatible: ['随性型','冷峻型'], incompatible: ['豪迈型','活泼型'] },
  '沉静寡言': { category: '冷峻型', trait: '话少内敛', weights: { cultivate: 1.3, explore: 1.1, social: 0.6, combat: 1.0 }, style: '惜字如金，多用单字或短句', compatible: ['精明型','执拗型'], incompatible: ['仁善型','活泼型'] },
  '冷厉决绝': { category: '冷峻型', trait: '心硬手狠', weights: { combat: 1.3, cultivate: 1.2, social: 0.5, explore: 1.0 }, style: '语气冷硬，不带感情', compatible: ['精明型','执拗型'], incompatible: ['仁善型','活泼型'] },
  '俏皮机灵': { category: '活泼型', trait: '反应快，爱开玩笑', weights: { social: 1.3, explore: 1.2, cultivate: 0.8, combat: 0.9 }, style: '语速快，善调侃，笑声不断', compatible: ['仁善型','豪迈型'], incompatible: ['冷峻型','阴鸷型'] },
  '天真烂漫': { category: '活泼型', trait: '心思单纯', weights: { explore: 1.2, social: 1.2, cultivate: 0.9, combat: 0.7 }, style: '语气稚气，常有"真的吗？"', compatible: ['仁善型','豪迈型'], incompatible: ['冷峻型','阴鸷型'] },
  '固执顽强': { category: '执拗型', trait: '认死理', weights: { cultivate: 1.3, combat: 1.2, social: 0.7, explore: 0.9 }, style: '斩钉截铁，不喜被质疑', compatible: ['冷峻型','阴鸷型'], incompatible: ['随性型','活泼型'] },
  '坚忍隐忍': { category: '执拗型', trait: '能熬能等', weights: { cultivate: 1.4, combat: 1.1, social: 0.6, explore: 0.9 }, style: '话少但字字有力', compatible: ['冷峻型','阴鸷型'], incompatible: ['随性型','活泼型'] },
  '多疑善妒': { category: '阴鸷型', trait: '疑心重', weights: { trade: 1.2, cultivate: 1.1, social: 0.5, combat: 1.0 }, style: '话里带刺，常阴阳怪气', compatible: ['执拗型','精明型'], incompatible: ['仁善型','活泼型'] },
  '阴沉深算': { category: '阴鸷型', trait: '城府极深', weights: { trade: 1.3, combat: 1.1, social: 0.5, cultivate: 1.1 }, style: '从不表态，只笑不语', compatible: ['执拗型','精明型'], incompatible: ['仁善型','活泼型'] },
  '懒散随和': { category: '随性型', trait: '不计较', weights: { social: 1.1, rest: 1.4, cultivate: 0.8, combat: 0.7 }, style: '语气懒洋洋，常用"随便"', compatible: ['豪迈型','精明型'], incompatible: ['执拗型','阴鸷型'] },
  '逍遥自在': { category: '随性型', trait: '无拘无束', weights: { explore: 1.4, social: 1.1, cultivate: 0.8, combat: 0.9 }, style: '语气超脱，常有"不过如此"', compatible: ['豪迈型','精明型'], incompatible: ['执拗型','阴鸷型'] },
  // ===== 情欲类性格（10种） =====
  '淫荡风骚': { category: '情欲型', trait: '水性杨花', weights: { social: 1.4, rest: 1.2, cultivate: 0.6, combat: 0.7 }, style: '语气娇媚，常带暗示，眼波流转', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '欲求不满': { category: '情欲型', trait: '饥渴难耐', weights: { social: 1.3, rest: 1.3, cultivate: 0.7, combat: 0.8 }, style: '话语中常带诱惑，主动挑逗', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '媚骨天生': { category: '情欲型', trait: '天生媚态', weights: { social: 1.5, trade: 1.1, cultivate: 0.7, combat: 0.6 }, style: '一颦一笑皆风情，声音酥软', compatible: ['豪迈型','精明型'], incompatible: ['冷峻型','执拗型'] },
  '浪荡不羁': { category: '情欲型', trait: '游戏人间', weights: { social: 1.4, explore: 1.2, cultivate: 0.6, combat: 0.9 }, style: '风流倜傥，处处留情', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '情欲旺盛': { category: '情欲型', trait: '欲火焚身', weights: { rest: 1.5, social: 1.2, cultivate: 0.5, combat: 0.8 }, style: '呼吸急促，眼神迷离，常主动求欢', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '人尽可夫': { category: '情欲型', trait: '来者不拒', weights: { social: 1.5, trade: 1.0, cultivate: 0.5, combat: 0.5 }, style: '对谁都热情似火，毫不避讳', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '暗骚闷浪': { category: '情欲型', trait: '表面正经内心淫荡', weights: { social: 1.2, cultivate: 0.9, combat: 0.8, trade: 1.0 }, style: '表面端庄，私下里却放荡不羁', compatible: ['精明型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '贪恋男色': { category: '情欲型', trait: '好男风', weights: { social: 1.3, rest: 1.2, cultivate: 0.7, combat: 0.8 }, style: '对男子格外热情，眼神暧昧', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '贪恋女色': { category: '情欲型', trait: '好女色', weights: { social: 1.3, rest: 1.2, cultivate: 0.7, combat: 0.8 }, style: '见到美女就挪不开眼，言语轻佻', compatible: ['豪迈型','随性型'], incompatible: ['冷峻型','执拗型'] },
  '双修伴侣': { category: '情欲型', trait: '以欲入道', weights: { cultivate: 1.2, social: 1.3, rest: 1.1, combat: 0.9 }, style: '将情爱视为修行，坦然而不避讳', compatible: ['豪迈型','精明型'], incompatible: ['冷峻型','执拗型'] },
};

const PERSONALITY_NAMES = Object.keys(PERSONALITIES);

// 情欲特质 5级
const LUST_TRAITS = {
  5: { name: '风流多情', desc: '享受情爱，主动撩拨', effect: { favorGain: 1.5, romanceChance: 1.5 } },
  4: { name: '热情奔放', desc: '情欲旺盛，较为主动', effect: { intimateChance: 1.2 } },
  3: { name: '正常通情', desc: '有正常欲望，但自持', effect: {} },
  2: { name: '清心寡欲', desc: '对情欲淡漠', effect: { intimateChance: 0.7 } },
  1: { name: '冰心守贞', desc: '完全抗拒', effect: { intimateChance: 0.1 } },
};

module.exports = { PERSONALITIES, PERSONALITY_NAMES, LUST_TRAITS };
