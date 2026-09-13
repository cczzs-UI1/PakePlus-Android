// 天气与季节系统
const { randInt, chance, randChoice } = require('./utils');

// 季节
const SEASONS = [
  { id: 'spring', name: '春', months: [2, 3, 4], desc: '万物复苏，修炼效率+10%', expBonus: 1.1, encounterRate: 1.0 },
  { id: 'summer', name: '夏', months: [5, 6, 7], desc: '炎炎夏日，修炼效率+5%，妖兽活跃', expBonus: 1.05, encounterRate: 1.3 },
  { id: 'autumn', name: '秋', months: [8, 9, 10], desc: '秋高气爽，修炼效率+15%', expBonus: 1.15, encounterRate: 1.0 },
  { id: 'winter', name: '冬', months: [11, 12, 1], desc: '寒冬腊月，修炼效率-10%，妖兽减少', expBonus: 0.9, encounterRate: 0.7 },
];

// 天气类型
const WEATHER_TYPES = [
  { id: 'sunny', name: '晴天', desc: '阳光明媚', expBonus: 1.0, combatBonus: 0, duration: [2, 5] },
  { id: 'cloudy', name: '阴天', desc: '乌云密布', expBonus: 1.0, combatBonus: 0, duration: [1, 3] },
  { id: 'rain', name: '雨天', desc: '大雨滂沱', expBonus: 0.95, combatBonus: -5, duration: [1, 3] },
  { id: 'snow', name: '雪天', desc: '大雪纷飞', expBonus: 0.9, combatBonus: -10, duration: [1, 4], onlySeason: ['winter'] },
  { id: 'fog', name: '大雾', desc: '浓雾弥漫', expBonus: 0.95, combatBonus: -5, duration: [1, 2] },
  { id: 'wind', name: '大风', desc: '狂风大作', expBonus: 0.95, combatBonus: -3, duration: [1, 2] },
  { id: 'thunder', name: '雷暴', desc: '电闪雷鸣', expBonus: 0.85, combatBonus: -15, duration: [1, 2], rare: true },
  { id: 'aurora', name: '灵气潮', desc: '天地灵气潮汐，修炼效率翻倍！', expBonus: 2.0, combatBonus: 10, duration: [1, 3], rare: true },
  { id: 'eclipse', name: '日月食', desc: '天象异变，妖邪出没', expBonus: 0.8, combatBonus: -10, duration: [1, 1], rare: true },
];

// 获取当前季节
function getSeason(month) {
  return SEASONS.find(s => s.months.includes(month)) || SEASONS[0];
}

// 生成天气
function generateWeather(currentMonth, currentWeather = null) {
  // 天气持续
  if (currentWeather && currentWeather.remaining > 0) {
    currentWeather.remaining--;
    return currentWeather;
  }

  const season = getSeason(currentMonth);
  let pool = WEATHER_TYPES.filter(w => {
    if (w.onlySeason && !w.onlySeason.includes(season.id)) return false;
    if (w.rare && !chance(5)) return false;
    return true;
  });

  // 晴天概率更高
  const weighted = [];
  for (const w of pool) {
    const weight = w.id === 'sunny' ? 40 : w.rare ? 2 : 10;
    for (let i = 0; i < weight; i++) weighted.push(w);
  }

  const weather = randChoice(weighted);
  return {
    id: weather.id,
    name: weather.name,
    desc: weather.desc,
    expBonus: weather.expBonus,
    combatBonus: weather.combatBonus,
    remaining: randInt(weather.duration[0], weather.duration[1]),
  };
}

// 获取天气对修炼的影响
function getWeatherExpBonus(weather) {
  if (!weather) return 1;
  return weather.expBonus || 1;
}

// 获取天气对战斗的影响
function getWeatherCombatBonus(weather) {
  if (!weather) return 0;
  return weather.combatBonus || 0;
}

// 天气事件
function weatherEvent(weather, player) {
  const events = [];
  if (weather.id === 'rain' && chance(10)) {
    events.push({ type: 'rain_bow', msg: '雨后出现了彩虹，你心情大好。', effect: { exp: 50 } });
  }
  if (weather.id === 'snow' && chance(10)) {
    events.push({ type: 'snow_scene', msg: '雪景如画，你触景生情，悟性大增。', effect: { enlightenment: 1 } });
  }
  if (weather.id === 'aurora' && chance(30)) {
    events.push({ type: 'spirit_tide', msg: '灵气潮汐中，你吸收了大量天地灵气！', effect: { exp: 500 } });
  }
  if (weather.id === 'thunder' && chance(20)) {
    events.push({ type: 'thunder_strike', msg: '一道天雷劈下，你险些被击中！', effect: { hp: -50 } });
  }
  if (weather.id === 'eclipse' && chance(40)) {
    events.push({ type: 'evil_energy', msg: '日月食导致邪气四溢，你感到一阵寒意。', effect: { karma: -5 } });
  }
  return events;
}

// 季节事件
function seasonEvent(season, player) {
  const events = [];
  if (season.id === 'spring' && chance(15)) {
    events.push({ type: 'spring_outing', msg: '春日踏青，你遇到了不少同道中人。', effect: { favor: 10 } });
  }
  if (season.id === 'summer' && chance(20)) {
    events.push({ type: 'summer_heat', msg: '酷暑难耐，你找了处阴凉之地避暑。', effect: {} });
  }
  if (season.id === 'autumn' && chance(15)) {
    events.push({ type: 'autumn_harvest', msg: '秋收时节，灵田产量增加！', effect: { spiritStone: 100 } });
  }
  if (season.id === 'winter' && chance(20)) {
    events.push({ type: 'winter_solstice', msg: '冬至来临，家家户户团聚。', effect: {} });
  }
  return events;
}

// 获取天气和季节信息
function getWeatherInfo(gameDate, weather) {
  const season = getSeason(gameDate.month);
  return {
    season: season.name,
    seasonDesc: season.desc,
    seasonExpBonus: season.expBonus,
    weather: weather,
    totalExpBonus: (weather?.expBonus || 1) * season.expBonus,
  };
}

module.exports = {
  SEASONS, WEATHER_TYPES,
  getSeason, generateWeather, getWeatherExpBonus, getWeatherCombatBonus,
  weatherEvent, seasonEvent, getWeatherInfo,
};
