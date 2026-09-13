// 职业系统 - 成为方式与晋升途径
// 包含：凡人界职业 + 修仙界职业

const PROFESSION_PATHS = {
  // ===== 凡人界职业 =====
  '农夫': {
    category: '凡人',
    become: '在清风镇/大夏皇都的农田帮工，积累农事经验后可成为农夫。',
    levels: ['佃农', '自耕农', '富农', '地主'],
    promoteConditions: [
      { level: '佃农→自耕农', req: '银两500，农事经验100' },
      { level: '自耕农→富农', req: '银两3000，农事经验500，田产10亩' },
      { level: '富农→地主', req: '银两10000，农事经验2000，田产50亩' },
    ],
    effects: { income: '每月银两收入', bonus: '体质+5/级' },
  },
  '渔夫': {
    category: '凡人',
    become: '在东海渔村购买渔船渔具，出海捕鱼后可成为渔夫。',
    levels: ['渔童', '渔夫', '船老大', '渔霸'],
    promoteConditions: [
      { level: '渔童→渔夫', req: '银两300，渔船一艘' },
      { level: '渔夫→船老大', req: '银两2000，航海经验500' },
      { level: '船老大→渔霸', req: '银两8000，船队3艘' },
    ],
    effects: { income: '每月海产收入', bonus: '敏捷+5/级' },
  },
  '猎人': {
    category: '凡人',
    become: '在落日森林/万妖山脉狩猎，积累猎物后可成为猎人。',
    levels: ['猎户', '猎手', '神射手', '猎王'],
    promoteConditions: [
      { level: '猎户→猎手', req: '弓箭一把，狩猎经验100' },
      { level: '猎手→神射手', req: '狩猎经验500，击杀妖兽10只' },
      { level: '神射手→猎王', req: '狩猎经验2000，击杀妖兽50只' },
    ],
    effects: { income: '每月兽皮兽肉收入', bonus: '敏捷+8/级，力量+3/级' },
  },
  '铁匠': {
    category: '凡人',
    become: '在清风镇/大夏皇都的铁匠铺学徒，掌握锻造术后可成为铁匠。',
    levels: ['学徒', '铁匠', '大匠', '铸剑大师'],
    promoteConditions: [
      { level: '学徒→铁匠', req: '锻造经验100，精铁10块' },
      { level: '铁匠→大匠', req: '锻造经验500，打造兵器20件' },
      { level: '大匠→铸剑大师', req: '锻造经验2000，打造名器3件' },
    ],
    effects: { income: '每月锻造收入', bonus: '力量+8/级' },
  },
  '木匠': {
    category: '凡人',
    become: '在木匠铺学徒，掌握木工技艺后可成为木匠。',
    levels: ['学徒', '木匠', '大匠', '鲁班传人'],
    promoteConditions: [
      { level: '学徒→木匠', req: '木工经验100' },
      { level: '木匠→大匠', req: '木工经验500，建造房屋10间' },
      { level: '大匠→鲁班传人', req: '木工经验2000，建造宫殿1座' },
    ],
    effects: { income: '每月木工收入', bonus: '敏捷+5/级，悟性+3/级' },
  },
  '裁缝': {
    category: '凡人',
    become: '在裁缝铺学徒，掌握女红技艺后可成为裁缝。',
    levels: ['学徒', '裁缝', '绣娘', '织造大师'],
    promoteConditions: [
      { level: '学徒→裁缝', req: '女红经验100，丝绸10匹' },
      { level: '裁缝→绣娘', req: '女红经验500，制作衣物50件' },
      { level: '绣娘→织造大师', req: '女红经验2000，制作龙袍1件' },
    ],
    effects: { income: '每月裁缝收入', bonus: '魅力+5/级，敏捷+3/级' },
  },
  '厨师': {
    category: '凡人',
    become: '在酒楼后厨帮工，掌握烹饪技艺后可成为厨师。',
    levels: ['帮厨', '厨师', '大厨', '御厨'],
    promoteConditions: [
      { level: '帮厨→厨师', req: '烹饪经验100' },
      { level: '厨师→大厨', req: '烹饪经验500，独创菜品3道' },
      { level: '大厨→御厨', req: '烹饪经验2000，进入皇宫御膳房' },
    ],
    effects: { income: '每月烹饪收入', bonus: '体质+5/级' },
  },
  '商人': {
    category: '凡人',
    become: '积累一定本金后，在自由坊市/大夏皇都开设商铺可成为商人。',
    levels: ['小贩', '商人', '富商', '富甲一方'],
    promoteConditions: [
      { level: '小贩→商人', req: '银两1000，商铺一间' },
      { level: '商人→富商', req: '银两10000，商队3支' },
      { level: '富商→富甲一方', req: '银两100000，商号遍布3城' },
    ],
    effects: { income: '每月商业收入', bonus: '魅力+5/级，悟性+3/级' },
  },
  '书生': {
    category: '凡人',
    become: '在私塾/书院读书，通过科举考试后可成为书生。',
    levels: ['童生', '秀才', '举人', '进士'],
    promoteConditions: [
      { level: '童生→秀才', req: '学识100，通过县试' },
      { level: '秀才→举人', req: '学识500，通过乡试' },
      { level: '举人→进士', req: '学识2000，通过殿试' },
    ],
    effects: { income: '俸禄', bonus: '悟性+8/级，魅力+3/级' },
  },
  '医生': {
    category: '凡人',
    become: '在医馆学徒，掌握医术通过考核后可成为医生。',
    levels: ['药童', '郎中', '大夫', '神医'],
    promoteConditions: [
      { level: '药童→郎中', req: '医术经验100' },
      { level: '郎中→大夫', req: '医术经验500，治愈病人100人' },
      { level: '大夫→神医', req: '医术经验2000，治愈疑难杂症10例' },
    ],
    effects: { income: '每月诊金收入', bonus: '悟性+5/级，体质+3/级' },
  },
  '捕快': {
    category: '凡人',
    become: '在县衙应募，通过考核后可成为捕快。',
    levels: ['捕快', '捕头', '都头', '神捕'],
    promoteConditions: [
      { level: '捕快→捕头', req: '武功经验100，破案10起' },
      { level: '捕头→都头', req: '武功经验500，破案50起' },
      { level: '都头→神捕', req: '武功经验2000，破案200起' },
    ],
    effects: { income: '俸禄', bonus: '力量+5/级，敏捷+5/级' },
  },
  '士兵': {
    category: '凡人',
    become: '在禁军大营/边关应募入伍可成为士兵。',
    levels: ['小兵', '什长', '队正', '校尉'],
    promoteConditions: [
      { level: '小兵→什长', req: '军功100，服役1年' },
      { level: '什长→队正', req: '军功500，服役3年' },
      { level: '队正→校尉', req: '军功2000，服役5年' },
    ],
    effects: { income: '军饷', bonus: '力量+8/级，体质+5/级' },
  },
  '将领': {
    category: '凡人',
    become: '军功卓著，由校尉晋升或武举及第可成为将领。',
    levels: ['偏将', '副将', '大将军', '兵马大元帅'],
    promoteConditions: [
      { level: '偏将→副将', req: '军功5000，统领千人' },
      { level: '副将→大将军', req: '军功20000，统领万人' },
      { level: '大将军→兵马大元帅', req: '军功100000，开疆拓土' },
    ],
    effects: { income: '厚禄', bonus: '力量+10/级，体质+8/级，威慑+5/级' },
  },
  '官员': {
    category: '凡人',
    become: '科举进士及第，或吏员考核优秀可成为官员。',
    levels: ['县丞', '县令', '知府', '巡抚', '尚书', '丞相'],
    promoteConditions: [
      { level: '县丞→县令', req: '政绩100，进士出身' },
      { level: '县令→知府', req: '政绩500，任职3年' },
      { level: '知府→巡抚', req: '政绩2000，任职5年' },
      { level: '巡抚→尚书', req: '政绩8000，入阁' },
      { level: '尚书→丞相', req: '政绩20000，皇帝信任' },
    ],
    effects: { income: '俸禄', bonus: '魅力+8/级，悟性+5/级，威慑+3/级' },
  },
  '地主': {
    category: '凡人',
    become: '购置大量田产，雇佣佃农耕种可成为地主。',
    levels: ['小地主', '地主', '大地主', '乡绅'],
    promoteConditions: [
      { level: '小地主→地主', req: '田产50亩，银两5000' },
      { level: '地主→大地主', req: '田产200亩，银两20000' },
      { level: '大地主→乡绅', req: '田产1000亩，银两100000' },
    ],
    effects: { income: '田租收入', bonus: '魅力+5/级' },
  },
  '掌柜': {
    category: '凡人',
    become: '受雇于商铺，经营有方可成为掌柜。',
    levels: ['伙计', '二掌柜', '大掌柜', '东家'],
    promoteConditions: [
      { level: '伙计→二掌柜', req: '经营经验100' },
      { level: '二掌柜→大掌柜', req: '经营经验500，年盈利5000两' },
      { level: '大掌柜→东家', req: '经营经验2000，拥有商铺' },
    ],
    effects: { income: '分红', bonus: '悟性+5/级，魅力+3/级' },
  },
  '镖师': {
    category: '凡人',
    become: '在镖局应募，通过武功考核可成为镖师。',
    levels: ['趟子手', '镖师', '镖头', '总镖头'],
    promoteConditions: [
      { level: '趟子手→镖师', req: '武功经验100' },
      { level: '镖师→镖头', req: '武功经验500，走镖50次无失' },
      { level: '镖头→总镖头', req: '武功经验2000，走镖500次无失' },
    ],
    effects: { income: '镖银', bonus: '力量+5/级，敏捷+5/级' },
  },
  '戏子': {
    category: '凡人',
    become: '在戏班学艺，登台演出后可成为戏子。',
    levels: ['学徒', '配角', '台柱子', '名角'],
    promoteConditions: [
      { level: '学徒→配角', req: '演艺经验100' },
      { level: '配角→台柱子', req: '演艺经验500，演出100场' },
      { level: '台柱子→名角', req: '演艺经验2000，名动京城' },
    ],
    effects: { income: '出场费', bonus: '魅力+10/级' },
  },
  '歌姬': {
    category: '凡人',
    become: '在青楼/教坊学艺，精通歌舞后可成为歌姬。',
    levels: ['清倌人', '歌姬', '花魁', '传奇名妓'],
    promoteConditions: [
      { level: '清倌人→歌姬', req: '歌舞经验100' },
      { level: '歌姬→花魁', req: '歌舞经验500，客人追捧' },
      { level: '花魁→传奇名妓', req: '歌舞经验2000，名动天下' },
    ],
    effects: { income: '缠头', bonus: '魅力+12/级，悟性+3/级' },
  },
  '丫鬟': {
    category: '凡人',
    become: '卖身为奴，进入大户人家为婢可成为丫鬟。',
    levels: ['粗使丫鬟', '贴身丫鬟', '管事嬷嬷', '管家'],
    promoteConditions: [
      { level: '粗使丫鬟→贴身丫鬟', req: '服侍经验100，主家信任' },
      { level: '贴身丫鬟→管事嬷嬷', req: '服侍经验500，管理能力' },
      { level: '管事嬷嬷→管家', req: '服侍经验2000，主家倚重' },
    ],
    effects: { income: '月钱', bonus: '敏捷+5/级，魅力+3/级' },
  },
  '管家': {
    category: '凡人',
    become: '受雇于大户人家，管理家事可成为管家。',
    levels: ['外院管家', '内院管家', '大管家', '家宰'],
    promoteConditions: [
      { level: '外院管家→内院管家', req: '管理经验500' },
      { level: '内院管家→大管家', req: '管理经验2000' },
      { level: '大管家→家宰', req: '管理经验10000，主家完全信任' },
    ],
    effects: { income: '厚俸', bonus: '悟性+8/级，魅力+5/级' },
  },
  '私塾先生': {
    category: '凡人',
    become: '秀才以上功名，开馆授徒可成为私塾先生。',
    levels: ['蒙师', '塾师', '大儒', '名士'],
    promoteConditions: [
      { level: '蒙师→塾师', req: '学识500，秀才功名' },
      { level: '塾师→大儒', req: '学识2000，举人功名' },
      { level: '大儒→名士', req: '学识10000，进士功名，弟子千人' },
    ],
    effects: { income: '束脩', bonus: '悟性+10/级' },
  },
  '算命先生': {
    category: '凡人',
    become: '学习占卜相术，摆摊算命可成为算命先生。',
    levels: ['江湖术士', '算命先生', '半仙', '活神仙'],
    promoteConditions: [
      { level: '江湖术士→算命先生', req: '占卜经验100' },
      { level: '算命先生→半仙', req: '占卜经验500，预言应验10次' },
      { level: '半仙→活神仙', req: '占卜经验2000，预言应验50次' },
    ],
    effects: { income: '卦金', bonus: '悟性+8/级，神秘+5/级' },
  },
  '和尚': {
    category: '凡人',
    become: '在寺庙剃度出家，受戒后可成为和尚。',
    levels: ['沙弥', '和尚', '住持', '方丈'],
    promoteConditions: [
      { level: '沙弥→和尚', req: '受具足戒，佛法经验100' },
      { level: '和尚→住持', req: '佛法经验500，管理寺庙' },
      { level: '住持→方丈', req: '佛法经验2000，名刹方丈' },
    ],
    effects: { income: '香火钱', bonus: '悟性+8/级，意志+5/级' },
  },
  '道士': {
    category: '凡人',
    become: '在道观出家，拜师后可成为道士。',
    levels: ['道童', '道士', '道长', '真人'],
    promoteConditions: [
      { level: '道童→道士', req: '道法经验100' },
      { level: '道士→道长', req: '道法经验500' },
      { level: '道长→真人', req: '道法经验2000，皇帝敕封' },
    ],
    effects: { income: '法事收入', bonus: '悟性+8/级，灵力+5/级' },
  },
  '山贼': {
    category: '凡人',
    become: '走投无路落草为寇，可成为山贼。',
    levels: ['小喽啰', '山贼', '头目', '山大王'],
    promoteConditions: [
      { level: '小喽啰→山贼', req: '抢劫经验100' },
      { level: '山贼→头目', req: '抢劫经验500，手下10人' },
      { level: '头目→山大王', req: '抢劫经验2000，手下百人' },
    ],
    effects: { income: '劫掠所得', bonus: '力量+8/级，敏捷+5/级' },
  },
  '海盗': {
    category: '凡人',
    become: '在海上劫掠，加入海盗团伙可成为海盗。',
    levels: ['水手', '海盗', '船长', '海盗王'],
    promoteConditions: [
      { level: '水手→海盗', req: '劫掠经验100' },
      { level: '海盗→船长', req: '劫掠经验500，海盗船一艘' },
      { level: '船长→海盗王', req: '劫掠经验2000，舰队3艘' },
    ],
    effects: { income: '劫掠所得', bonus: '力量+5/级，敏捷+8/级' },
  },
  '乞丐': {
    category: '凡人',
    become: '一无所有，沿街乞讨可成为乞丐。',
    levels: ['小乞丐', '乞丐', '丐头', '丐帮帮主'],
    promoteConditions: [
      { level: '小乞丐→乞丐', req: '乞讨经验100' },
      { level: '乞丐→丐头', req: '乞讨经验500，手下乞丐10人' },
      { level: '丐头→丐帮帮主', req: '乞讨经验2000，帮众千人' },
    ],
    effects: { income: '乞讨所得', bonus: '敏捷+5/级，意志+8/级' },
  },
  '小偷': {
    category: '凡人',
    become: '学习偷窃技巧，以偷盗为生可成为小偷。',
    levels: ['扒手', '小偷', '大盗', '盗圣'],
    promoteConditions: [
      { level: '扒手→小偷', req: '偷窃经验100' },
      { level: '小偷→大盗', req: '偷窃经验500，偷窃成功50次' },
      { level: '大盗→盗圣', req: '偷窃经验2000，偷窃成功500次' },
    ],
    effects: { income: '偷窃所得', bonus: '敏捷+10/级，神秘+5/级' },
  },
  '仵作': {
    category: '凡人',
    become: '在县衙应募，学习验尸之术可成为仵作。',
    levels: ['学徒', '仵作', '老仵作', '验尸圣手'],
    promoteConditions: [
      { level: '学徒→仵作', req: '验尸经验100' },
      { level: '仵作→老仵作', req: '验尸经验500，验尸100具' },
      { level: '老仵作→验尸圣手', req: '验尸经验2000，破奇案10起' },
    ],
    effects: { income: '工食银', bonus: '悟性+8/级，意志+5/级' },
  },
  '媒婆': {
    category: '凡人',
    become: '善于说合婚姻，以此为业可成为媒婆。',
    levels: ['媒婆', '官媒', '大红娘', '天下第一媒'],
    promoteConditions: [
      { level: '媒婆→官媒', req: '说媒经验100，撮合10对' },
      { level: '官媒→大红娘', req: '说媒经验500，撮合100对' },
      { level: '大红娘→天下第一媒', req: '说媒经验2000，撮合500对' },
    ],
    effects: { income: '谢媒钱', bonus: '魅力+8/级，悟性+5/级' },
  },
  '稳婆': {
    category: '凡人',
    become: '学习接生之术，以此为业可成为稳婆。',
    levels: ['稳婆', '老稳婆', '接生圣手', '送子观音'],
    promoteConditions: [
      { level: '稳婆→老稳婆', req: '接生经验100，接生50人' },
      { level: '老稳婆→接生圣手', req: '接生经验500，接生500人' },
      { level: '接生圣手→送子观音', req: '接生经验2000，接生2000人无失' },
    ],
    effects: { income: '接生钱', bonus: '悟性+5/级，体质+5/级' },
  },
  '绣娘': {
    category: '凡人',
    become: '精通刺绣技艺，以此为业可成为绣娘。',
    levels: ['绣娘', '绣师', '绣宗', '针神'],
    promoteConditions: [
      { level: '绣娘→绣师', req: '刺绣经验100' },
      { level: '绣师→绣宗', req: '刺绣经验500，绣品入贡' },
      { level: '绣宗→针神', req: '刺绣经验2000，绣品传世' },
    ],
    effects: { income: '绣品收入', bonus: '魅力+8/级，敏捷+5/级' },
  },

  // ===== 修仙界职业 =====
  '炼丹师': {
    category: '修仙',
    become: '在丹塔拜师，学习丹方并成功炼制丹药后可成为炼丹师。',
    levels: ['学徒', '初级炼丹师', '中级炼丹师', '高级炼丹师', '炼丹大师', '丹道宗师'],
    promoteConditions: [
      { level: '学徒→初级', req: '炼丹经验100，成功炼制凡丹10炉' },
      { level: '初级→中级', req: '炼丹经验500，成功炼制灵丹10炉' },
      { level: '中级→高级', req: '炼丹经验2000，成功炼制宝丹10炉' },
      { level: '高级→大师', req: '炼丹经验5000，成功炼制古丹5炉' },
      { level: '大师→宗师', req: '炼丹经验15000，自创丹方，炼制圣丹' },
    ],
    effects: { income: '丹药售卖', bonus: '悟性+10/级，灵力+5/级，炼丹成功率+5%/级' },
  },
  '炼器师': {
    category: '修仙',
    become: '在炼器阁拜师，学习炼器并成功炼制法器后可成为炼器师。',
    levels: ['学徒', '初级炼器师', '中级炼器师', '高级炼器师', '炼器大师', '器道宗师'],
    promoteConditions: [
      { level: '学徒→初级', req: '炼器经验100，成功炼制凡器10件' },
      { level: '初级→中级', req: '炼器经验500，成功炼制灵器10件' },
      { level: '中级→高级', req: '炼器经验2000，成功炼制宝器10件' },
      { level: '高级→大师', req: '炼器经验5000，成功炼制古器5件' },
      { level: '大师→宗师', req: '炼器经验15000，自创器胚，炼制圣器' },
    ],
    effects: { income: '法器售卖', bonus: '力量+8/级，悟性+5/级，炼器成功率+5%/级' },
  },
  '阵法师': {
    category: '修仙',
    become: '在天星阁拜师，学习阵法并成功布阵后可成为阵法师。',
    levels: ['学徒', '初级阵法师', '中级阵法师', '高级阵法师', '阵法大师', '阵道宗师'],
    promoteConditions: [
      { level: '学徒→初级', req: '阵法经验100，成功布置基础阵10次' },
      { level: '初级→中级', req: '阵法经验500，成功布置聚灵阵10次' },
      { level: '中级→高级', req: '阵法经验2000，成功布置困敌阵10次' },
      { level: '高级→大师', req: '阵法经验5000，成功布置护山阵5次' },
      { level: '大师→宗师', req: '阵法经验15000，自创阵法，布置跨界阵' },
    ],
    effects: { income: '布阵酬劳', bonus: '悟性+10/级，灵力+8/级，阵法威力+10%/级' },
  },
  '符师': {
    category: '修仙',
    become: '在天星阁学习制符，成功绘制符箓后可成为符师。',
    levels: ['学徒', '初级符师', '中级符师', '高级符师', '符道大师', '符圣'],
    promoteConditions: [
      { level: '学徒→初级', req: '制符经验100，成功绘制凡符50张' },
      { level: '初级→中级', req: '制符经验500，成功绘制灵符30张' },
      { level: '中级→高级', req: '制符经验2000，成功绘制宝符20张' },
      { level: '高级→大师', req: '制符经验5000，成功绘制古符10张' },
      { level: '大师→符圣', req: '制符经验15000，自创符箓' },
    ],
    effects: { income: '符箓售卖', bonus: '悟性+8/级，灵力+5/级' },
  },
  '剑修': {
    category: '修仙',
    become: '在青云剑宗/万剑冢拜师，修炼剑诀后可成为剑修。',
    levels: ['剑童', '剑客', '剑师', '大剑师', '剑圣', '剑神'],
    promoteConditions: [
      { level: '剑童→剑客', req: '剑意经验100，筑基期' },
      { level: '剑客→剑师', req: '剑意经验500，金丹期' },
      { level: '剑师→大剑师', req: '剑意经验2000，元婴期' },
      { level: '大剑师→剑圣', req: '剑意经验5000，化神期，领悟剑意' },
      { level: '剑圣→剑神', req: '剑意经验15000，炼虚期，万剑归宗' },
    ],
    effects: { income: '宗门俸禄', bonus: '攻击+15/级，敏捷+8/级，暴击率+2%/级' },
  },
  '体修': {
    category: '修仙',
    become: '修炼体修功法，锤炼肉身至铜皮铁骨后可成为体修。',
    levels: ['炼体者', '铁骨', '铜皮', '金身', '圣体', '不灭金身'],
    promoteConditions: [
      { level: '炼体者→铁骨', req: '炼体经验100，体质50' },
      { level: '铁骨→铜皮', req: '炼体经验500，体质100' },
      { level: '铜皮→金身', req: '炼体经验2000，体质200' },
      { level: '金身→圣体', req: '炼体经验5000，体质400' },
      { level: '圣体→不灭金身', req: '炼体经验15000，体质800' },
    ],
    effects: { income: '无固定收入', bonus: '气血+50/级，防御+10/级，力量+8/级' },
  },
  '御兽师': {
    category: '修仙',
    become: '在兽灵山拜师，成功契约妖兽后可成为御兽师。',
    levels: ['驯兽者', '御兽师', '大御兽师', '兽王', '兽神', '万兽之主'],
    promoteConditions: [
      { level: '驯兽者→御兽师', req: '御兽经验100，契约妖兽1只' },
      { level: '御兽师→大御兽师', req: '御兽经验500，契约妖兽3只' },
      { level: '大御兽师→兽王', req: '御兽经验2000，契约妖兽5只，含妖王1只' },
      { level: '兽王→兽神', req: '御兽经验5000，契约妖兽10只，含妖皇1只' },
      { level: '兽神→万兽之主', req: '御兽经验15000，万兽臣服' },
    ],
    effects: { income: '妖兽材料售卖', bonus: '魅力+5/级，可带妖兽数量+1/级' },
  },
  '丹塔长老': {
    category: '修仙',
    become: '炼丹师达到大师级别，被丹塔聘为长老。',
    levels: ['外门长老', '内门长老', '大长老', '丹塔之主'],
    promoteConditions: [
      { level: '外门→内门', req: '炼丹大师，贡献1000' },
      { level: '内门→大长老', req: '炼丹宗师，贡献5000' },
      { level: '大长老→丹塔之主', req: '炼丹宗师，全塔拥戴' },
    ],
    effects: { income: '丹塔俸禄', bonus: '炼丹成功率+10%，可使用丹塔资源' },
  },
  '宗门弟子': {
    category: '修仙',
    become: '通过宗门考核，拜入青云剑宗等宗门。',
    levels: ['外门弟子', '内门弟子', '核心弟子', '亲传弟子', '圣子/圣女', '宗门掌门'],
    promoteConditions: [
      { level: '外门→内门', req: '修为筑基，贡献100' },
      { level: '内门→核心', req: '修为金丹，贡献500' },
      { level: '核心→亲传', req: '修为元婴，被长老收为弟子' },
      { level: '亲传→圣子', req: '修为化神，宗门大比第一' },
      { level: '圣子→掌门', req: '修为炼虚以上，全宗拥戴' },
    ],
    effects: { income: '宗门俸禄', bonus: '修炼速度+10%/级，可使用宗门资源' },
  },
  '散修': {
    category: '修仙',
    become: '未加入任何宗门，独自修炼的修士。',
    levels: ['散修', '独行侠', '逍遥仙', '世外高人'],
    promoteConditions: [
      { level: '散修→独行侠', req: '修为金丹，独自闯荡10年' },
      { level: '独行侠→逍遥仙', req: '修为元婴，名动一方' },
      { level: '逍遥仙→世外高人', req: '修为化神以上，不问世事' },
    ],
    effects: { income: '无固定收入', bonus: '自由无约束，奇遇概率+5%/级' },
  },
  '魔修': {
    category: '修仙',
    become: '修炼魔道功法，或堕入魔道。',
    levels: ['魔徒', '魔修', '魔师', '魔君', '魔尊', '魔帝'],
    promoteConditions: [
      { level: '魔徒→魔修', req: '魔功经验100，筑基期' },
      { level: '魔修→魔师', req: '魔功经验500，金丹期' },
      { level: '魔师→魔君', req: '魔功经验2000，元婴期' },
      { level: '魔君→魔尊', req: '魔功经验5000，化神期' },
      { level: '魔尊→魔帝', req: '魔功经验15000，炼虚期以上' },
    ],
    effects: { income: '劫掠所得', bonus: '攻击+12/级，罪孽+10/级，修炼速度+15%/级' },
  },
};

// 获取职业信息
function getProfessionInfo(professionName) {
  return PROFESSION_PATHS[professionName] || null;
}

// 获取所有职业路径
function getAllProfessionPaths() {
  return PROFESSION_PATHS;
}

// 获取某类别的职业
function getProfessionsByCategory(category) {
  const result = {};
  for (const [name, info] of Object.entries(PROFESSION_PATHS)) {
    if (info.category === category) result[name] = info;
  }
  return result;
}

module.exports = { PROFESSION_PATHS, getProfessionInfo, getAllProfessionPaths, getProfessionsByCategory };
