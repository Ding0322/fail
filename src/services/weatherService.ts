// Weather service with Open-Meteo live API and built-in location geocoding

import { DayWeather } from '../types';

export interface LocationGeo {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  country?: string;
}

// Built-in Geocoding dictionary for instant resolution & offline resilience
const FAMOUS_LOCATIONS: Record<string, { lat: number; lon: number; displayName: string }> = {
  // Kyoto & Kansai
  '京都': { lat: 35.0116, lon: 135.7681, displayName: '京都 Kyoto' },
  '清水寺': { lat: 34.9949, lon: 135.7850, displayName: '清水寺 (東山區)' },
  '嵐山': { lat: 35.0166, lon: 135.6713, displayName: '嵐山 (嵯峨野)' },
  '金閣寺': { lat: 35.0394, lon: 135.7292, displayName: '金閣寺 (北區)' },
  '伏見稻荷': { lat: 34.9671, lon: 135.7727, displayName: '伏見稻荷大社' },
  '宇治': { lat: 34.8893, lon: 135.8078, displayName: '宇治市 (京都府)' },
  '奈良': { lat: 34.6851, lon: 135.8048, displayName: '奈良市 (奈良公園)' },
  '大阪': { lat: 34.6937, lon: 135.5023, displayName: '大阪市 Osaka' },
  '心齋橋': { lat: 34.6711, lon: 135.5014, displayName: '心齋橋 / 難波' },
  '道頓堀': { lat: 34.6687, lon: 135.5013, displayName: '道頓堀 (中央區)' },
  '梅田': { lat: 34.7025, lon: 135.4959, displayName: '梅田 (北區)' },
  '關西機場': { lat: 34.4347, lon: 135.2441, displayName: '關西國際機場 (KIX)' },
  '神戶': { lat: 34.6901, lon: 135.1955, displayName: '神戶市 Kobe' },
  
  // Tokyo & Kanto
  '東京': { lat: 35.6762, lon: 139.6503, displayName: '東京都 Tokyo' },
  '新宿': { lat: 35.6938, lon: 139.7034, displayName: '新宿區' },
  '澀谷': { lat: 35.6580, lon: 139.7016, displayName: '澀谷區' },
  '淺草': { lat: 35.7148, lon: 139.7967, displayName: '淺草寺' },
  '秋葉原': { lat: 35.6997, lon: 139.7714, displayName: '秋葉原' },
  '成田機場': { lat: 35.7647, lon: 140.3863, displayName: '成田國際機場 (NRT)' },
  '羽田機場': { lat: 35.5494, lon: 139.7798, displayName: '羽田機場 (HND)' },
  '富士山': { lat: 35.3606, lon: 138.7274, displayName: '富士山 / 河口湖' },
  '河口湖': { lat: 35.5171, lon: 138.7518, displayName: '河口湖' },
  '箱根': { lat: 35.2323, lon: 139.1069, displayName: '箱根町' },

  // Hokkaido, Kyushu, Okinawa
  '札幌': { lat: 43.0618, lon: 141.3545, displayName: '札幌市 Sapporo' },
  '小樽': { lat: 43.1907, lon: 140.9947, displayName: '小樽市' },
  '福岡': { lat: 33.5904, lon: 130.4017, displayName: '福岡市 Fukuoka' },
  '沖繩': { lat: 26.2124, lon: 127.6809, displayName: '那霸市 Okinawa' },

  // Taiwan
  '台北': { lat: 25.0330, lon: 121.5654, displayName: '台北市 Taipei' },
  '桃園機場': { lat: 25.0797, lon: 121.2342, displayName: '桃園國際機場 (TPE)' },
  '新北': { lat: 25.0117, lon: 121.4658, displayName: '新北市' },
  '台中': { lat: 24.1477, lon: 120.6736, displayName: '台中市' },
  '台南': { lat: 22.9997, lon: 120.2270, displayName: '台南市' },
  '高雄': { lat: 22.6273, lon: 120.3014, displayName: '高雄市' },
  '花蓮': { lat: 23.9872, lon: 121.6016, displayName: '花蓮縣' },

  // Korea & International
  '首爾': { lat: 37.5665, lon: 126.9780, displayName: '首爾特別市 Seoul' },
  '釜山': { lat: 35.1796, lon: 129.0756, displayName: '釜山市 Busan' },
  '曼谷': { lat: 13.7563, lon: 100.5018, displayName: '曼谷 Bangkok' },
  '新加坡': { lat: 1.3521, lon: 103.8198, displayName: '新加坡 Singapore' },
  '倫敦': { lat: 51.5074, lon: -0.1278, displayName: '倫敦 London' },
  '巴黎': { lat: 48.8566, lon: 2.3522, displayName: '巴黎 Paris' }
};

// Map WMO weather codes to condition and description
function parseWmoCode(code: number): { condition: DayWeather['condition']; desc: string; icon: string; clothingTip: string } {
  if (code === 0) {
    return {
      condition: 'sunny',
      desc: '晴空萬里，陽光充足',
      icon: 'Sun',
      clothingTip: '天氣晴朗舒適，戶外活動請做好防曬與適度補充水分。'
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      condition: 'cloudy',
      desc: code === 1 ? '晴時多雲，氣候溫和' : '多雲舒適，適合戶外漫步',
      icon: 'Cloud',
      clothingTip: '多雲微涼，建議穿著舒適便服，早晚可加件輕便薄外套。'
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'cloudy',
      desc: '早晚有霧，能見度稍低',
      icon: 'Cloud',
      clothingTip: '清晨或山區偏涼且濕度高，行車及拍照請注意保暖與路況。'
    };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      condition: 'rainy',
      desc: code >= 61 ? '降雨機率高，偶有陣雨' : '有局部短暫毛毛雨',
      icon: 'CloudRain',
      clothingTip: '外出請隨身攜帶輕便折疊傘，鞋子建議選擇防水防滑款式。'
    };
  }
  if (code >= 71 && code <= 77 || code === 85 || code === 86) {
    return {
      condition: 'snowy',
      desc: '飄雪或局部積雪',
      icon: 'CloudRain',
      clothingTip: '低溫寒冷，請務必備齊羽絨外套、手套、發熱衣與防滑雪靴。'
    };
  }
  if (code >= 95) {
    return {
      condition: 'rainy',
      desc: '雷陣雨天氣，請注意安全',
      icon: 'CloudRain',
      clothingTip: '午後可能有較大雷陣雨，建議多規劃室內景點或購物商場。'
    };
  }

  return {
    condition: 'cloudy',
    desc: '天氣平穩，適合觀光',
    icon: 'Cloud',
    clothingTip: '舒適宜人，洋蔥式穿搭最為便利。'
  };
}

// Find coordinates from text or query Open-Meteo Geocoding
export async function geocodeLocation(locationQuery: string): Promise<LocationGeo> {
  const query = locationQuery.trim();
  if (!query) {
    return { name: '京都', displayName: '京都 Kyoto', lat: 35.0116, lon: 135.7681 };
  }

  // 1. Check local dictionary
  for (const [key, value] of Object.entries(FAMOUS_LOCATIONS)) {
    if (query.includes(key) || key.includes(query)) {
      return {
        name: key,
        displayName: value.displayName,
        lat: value.lat,
        lon: value.lon
      };
    }
  }

  // 2. Query Open-Meteo Geocoding API
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=1&language=zh&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const item = data.results[0];
        const displayName = [item.name, item.admin1, item.country].filter(Boolean).join(', ');
        return {
          name: item.name || query,
          displayName: displayName || query,
          lat: item.latitude,
          lon: item.longitude,
          country: item.country
        };
      }
    }
  } catch (err) {
    console.warn('Geocoding network fetch failed for:', query, err);
  }

  // Fallback default: Kyoto
  return { name: query, displayName: `${query} (預設地理坐標)`, lat: 35.0116, lon: 135.7681 };
}

// Fetch live weather from Open-Meteo API
export async function fetchLiveWeatherForLocation(
  locationName: string,
  targetDateStr?: string
): Promise<DayWeather> {
  const geo = await geocodeLocation(locationName);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.daily) {
        let dayIdx = 0;
        if (targetDateStr && data.daily.time) {
          const matchedIdx = data.daily.time.findIndex((t: string) => t === targetDateStr);
          if (matchedIdx >= 0) {
            dayIdx = matchedIdx;
          }
        }

        const weatherCode = data.daily.weather_code?.[dayIdx] ?? data.current?.weather_code ?? 0;
        const tempHigh = Math.round(data.daily.temperature_2m_max?.[dayIdx] ?? 22);
        const tempLow = Math.round(data.daily.temperature_2m_min?.[dayIdx] ?? 14);
        const rainProb = data.daily.precipitation_probability_max?.[dayIdx] ?? 15;
        const humidity = Math.round(data.current?.relative_humidity_2m ?? 60);

        const parsed = parseWmoCode(weatherCode);

        const formattedTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

        return {
          condition: parsed.condition,
          tempHigh,
          tempLow,
          desc: parsed.desc,
          icon: parsed.icon,
          locationName: geo.displayName,
          rainfallProb: rainProb,
          humidity,
          clothingTip: parsed.clothingTip,
          isLive: true,
          lastUpdated: `即時同步於 ${formattedTime}`
        };
      }
    }
  } catch (err) {
    console.warn('Weather fetch failed, generating realistic contextual weather:', err);
  }

  // Fallback: Location-based heuristic weather
  const isRainyLoc = locationName.includes('雨') || locationName.includes('瀑布') || Math.random() < 0.2;
  const isColdLoc = locationName.includes('山') || locationName.includes('雪') || locationName.includes('北海道');
  
  return {
    condition: isRainyLoc ? 'rainy' : 'sunny',
    tempHigh: isColdLoc ? 17 : 23,
    tempLow: isColdLoc ? 9 : 14,
    desc: isRainyLoc ? '偶有局部降雨，氣候涼爽' : '晴時多雲，體感舒適宜人',
    icon: isRainyLoc ? 'CloudRain' : 'Sun',
    locationName: geo.displayName,
    rainfallProb: isRainyLoc ? 65 : 15,
    humidity: isRainyLoc ? 78 : 55,
    clothingTip: isRainyLoc ? '外出請記得攜帶雨具，穿著防滑好走的鞋子。' : '早晚溫差稍大，建議採洋蔥式穿搭。',
    isLive: false,
    lastUpdated: '離線地理氣候估算'
  };
}
