import { 
  TripSettings, 
  Member, 
  ScheduleItem, 
  DayWeather, 
  FlightBooking, 
  HotelBooking, 
  CarRentalBooking, 
  VoucherBooking, 
  ExpenseItem, 
  JournalEntry, 
  PlanningItem 
} from '../types';

export const initialTripSettings: TripSettings = {
  id: 'trip_kyoto_autumn_2026',
  title: '🍁 京都・嵐山初秋手帳之旅',
  destination: '日本・京都 & 大阪',
  startDate: '2026-10-15',
  endDate: '2026-10-19',
  baseCurrency: 'TWD',
  foreignCurrency: 'JPY',
  exchangeRate: 0.215, // 1 JPY = 0.215 TWD
  autoUpdateRate: true,
  lastRateUpdate: '自動每日同步中',
  coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
  pinCode: '007',
  firestoreConnected: false
};

export const initialMembers: Member[] = [
  {
    id: 'm1',
    name: 'Alice (狸克團長)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AliceTanuki&backgroundColor=b6e3f4',
    role: '行程長 / 領航員',
    color: '#5C8984',
    email: 'alice@travel.local'
  },
  {
    id: 'm2',
    name: 'Bob (西惠秘書)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BobSecretary&backgroundColor=ffd5dc',
    role: '總務大臣 / 記帳官',
    color: '#E59866',
    email: 'bob@travel.local'
  },
  {
    id: 'm3',
    name: 'Cindy (豆狸吃貨)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CindyGourmet&backgroundColor=d1d4f9',
    role: '美食嚮導 / 甜點獵人',
    color: '#7FB069',
    email: 'cindy@travel.local'
  },
  {
    id: 'm4',
    name: 'David (攝影大師)',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DavidCamera&backgroundColor=c0aede',
    role: '專屬攝影師 / 司機',
    color: '#70A9A1',
    email: 'david@travel.local'
  }
];

export const initialWeatherForecast: Record<number, DayWeather> = {
  0: {
    condition: 'sunny',
    tempHigh: 23,
    tempLow: 14,
    desc: '秋高氣爽，陽光溫和',
    icon: 'Sun'
  },
  1: {
    condition: 'cloudy',
    tempHigh: 21,
    tempLow: 13,
    desc: '微涼舒適，偶有多雲',
    icon: 'Cloud'
  },
  2: {
    condition: 'sunny',
    tempHigh: 24,
    tempLow: 15,
    desc: '晴空萬里，適合戶外漫步',
    icon: 'Sun'
  },
  3: {
    condition: 'rainy',
    tempHigh: 19,
    tempLow: 12,
    desc: '午後短暫細雨，建議攜帶折傘',
    icon: 'CloudRain'
  },
  4: {
    condition: 'sunny',
    tempHigh: 22,
    tempLow: 14,
    desc: '涼爽微風，購物好天氣',
    icon: 'Sun'
  }
};

export const initialScheduleItems: ScheduleItem[] = [
  // Day 1
  {
    id: 's101',
    dayIndex: 0,
    time: '08:30',
    title: '✈️ 出發航班：長榮航空 BR132 (TPE 🛫 KIX)',
    category: 'transport',
    location: '桃園國際機場 T1 長榮航空櫃台 (Gate C7)',
    notes: '起飛 08:30 ➜ 預計 12:10 抵達關西機場 | 訂位代號：EVA-8899JP | 座位：24A~24D',
    estimatedCost: 0,
    currency: 'TWD',
    linkedFlightId: 'f1',
    isCompleted: false
  },
  {
    id: 's102',
    dayIndex: 0,
    time: '13:00',
    title: '抵達關西空港 領取 HARUKA 列車',
    category: 'transport',
    location: 'KIX 關西機場 JR 閘口',
    mapUrl: 'https://maps.google.com/?q=Kansai+Airport+Station',
    notes: '使用西瓜卡或實體車票快速搭乘直達京都站。',
    estimatedCost: 2200,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's103',
    dayIndex: 0,
    time: '15:00',
    title: '🏨 飯店入住 Check-in：京都四條河原町 溫泉町屋風飯店',
    category: 'lodging',
    location: '京都府京都市下京區河原町通四條下ル',
    mapUrl: 'https://maps.google.com/?q=Kawaramachi+Station+Kyoto',
    notes: '訂房確認號：AGODA-KYOTO-9921，電話：+81 75-123-4567 | 寄放行李，稍微梳洗準備出發錦市場',
    linkedHotelId: 'h1',
    isCompleted: false
  },
  {
    id: 's104',
    dayIndex: 0,
    time: '17:00',
    title: '錦市場 邊走邊吃美食巡禮',
    category: 'food',
    location: '錦市場商店街',
    mapUrl: 'https://maps.google.com/?q=Nishiki+Market',
    notes: '必吃：章魚鵪鶉蛋、豆乳甜甜圈、三木雞卵玉子燒！',
    estimatedCost: 3500,
    currency: 'JPY',
    photos: ['https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop'],
    isCompleted: false
  },
  {
    id: 's105',
    dayIndex: 0,
    time: '19:30',
    title: '鴨川散步 & 納涼床居酒屋晚餐',
    category: 'food',
    location: '鴨川先斗町 居酒屋',
    notes: '吹著秋天涼風享用京都地酒與京野菜串燒。',
    estimatedCost: 4000,
    currency: 'JPY',
    isCompleted: false
  },

  // Day 2
  {
    id: 's201',
    dayIndex: 1,
    time: '08:00',
    title: '伏見稻荷大社 千本鳥居清晨漫步',
    category: 'spot',
    location: '伏見稻荷大社',
    mapUrl: 'https://maps.google.com/?q=Fushimi+Inari+Taisha',
    notes: '清晨人潮較少，光影穿透鳥居超級夢幻！',
    photos: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop'],
    isCompleted: false
  },
  {
    id: 's202',
    dayIndex: 1,
    time: '11:30',
    title: '祇園和服體驗 & 清水坂漫步',
    category: 'spot',
    location: '京都 清水寺 & 二年坂三年坂',
    mapUrl: 'https://maps.google.com/?q=Kiyomizu-dera',
    notes: '已預約 11:30 和服穿戴，在八坂之塔前拍照。',
    estimatedCost: 5500,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's203',
    dayIndex: 1,
    time: '14:00',
    title: '午餐：奧丹清水 湯豆腐百年老店',
    category: 'food',
    location: '奧丹清水 (OKUTAN)',
    notes: '經典豆腐懷石料理，庭院日式造景極美。',
    estimatedCost: 4500,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's204',
    dayIndex: 1,
    time: '18:00',
    title: '清水寺 夜間特別拜觀（夜楓點燈）',
    category: 'spot',
    location: '清水寺 舞台',
    notes: '秋季限定夜楓！記得穿厚外套保暖。',
    estimatedCost: 400,
    currency: 'JPY',
    isCompleted: false
  },

  // Day 3
  {
    id: 's301',
    dayIndex: 2,
    time: '09:00',
    title: '嵐山小火車 & 竹林小徑幽靜漫步',
    category: 'spot',
    location: '嵯峨野觀光鐵道 嵐山站',
    mapUrl: 'https://maps.google.com/?q=Arashiyama+Bamboo+Grove',
    notes: '搭乘第5節露天車廂保津峽賞楓景。',
    estimatedCost: 880,
    currency: 'JPY',
    photos: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop'],
    isCompleted: false
  },
  {
    id: 's302',
    dayIndex: 2,
    time: '12:00',
    title: '% ARABICA Kyoto Arashiyama 咖啡時光',
    category: 'food',
    location: '% Arabica Kyoto 渡月橋畔',
    notes: '坐在桂川邊喝拿鐵看渡月橋與倒影。',
    estimatedCost: 650,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's303',
    dayIndex: 2,
    time: '15:00',
    title: '金閣寺 舍利殿夕陽金色倒影',
    category: 'spot',
    location: '金閣寺 (鹿苑寺)',
    mapUrl: 'https://maps.google.com/?q=Kinkaku-ji',
    notes: '門票即是御守符咒，下午陽光灑在金箔上最耀眼。',
    estimatedCost: 500,
    currency: 'JPY',
    isCompleted: false
  },

  // Day 4
  {
    id: 's400',
    dayIndex: 3,
    time: '10:00',
    title: '🚪 飯店退房 Check-out：京都四條河原町 溫泉町屋風飯店',
    category: 'lodging',
    location: '京都府京都市下京區河原町通四條下ル',
    mapUrl: 'https://maps.google.com/?q=Kawaramachi+Station+Kyoto',
    notes: '辦理退房並攜帶行李搭乘 JR 前往宇治與大阪。',
    linkedHotelId: 'h1',
    isCompleted: false
  },
  {
    id: 's401',
    dayIndex: 3,
    time: '11:00',
    title: '宇治散策：平等院鳳凰堂 & 抹茶手作體驗',
    category: 'spot',
    location: '京都 宇治 平等院',
    notes: '十圓日幣背面的建築原型！品嚐中村藤吉總店生茶凍。',
    estimatedCost: 2000,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's402',
    dayIndex: 3,
    time: '16:00',
    title: '移動至大阪 心齋橋 & 道頓堀 購物探險',
    category: 'shopping',
    location: '大阪 心齋橋筋商店街',
    notes: '大丸百貨、Loft 手帳文具、Bic Camera 電器掃貨！',
    isCompleted: false
  },
  {
    id: 's403',
    dayIndex: 3,
    time: '19:00',
    title: '🏨 飯店入住 Check-in：大阪難波東急 STAY 景觀公寓',
    category: 'lodging',
    location: '大阪府大阪市中央區難波千日前',
    mapUrl: 'https://maps.google.com/?q=Namba+Station+Osaka',
    notes: '訂房確認號：BOOKING-OSA-4410，電話：+81 6-6633-0109 | 房內備有獨立洗烘衣機與微波爐',
    linkedHotelId: 'h2',
    isCompleted: false
  },

  // Day 5
  {
    id: 's500',
    dayIndex: 4,
    time: '10:00',
    title: '🚪 飯店退房 Check-out：大阪難波東急 STAY 景觀公寓',
    category: 'lodging',
    location: '大阪府大阪市中央區難波千日前',
    mapUrl: 'https://maps.google.com/?q=Namba+Station+Osaka',
    notes: '退房手續，行李可先寄放櫃台或帶往黑門市場置物櫃。',
    linkedHotelId: 'h2',
    isCompleted: false
  },
  {
    id: 's501',
    dayIndex: 4,
    time: '10:30',
    title: '黑門市場 早午餐 海鮮和牛巡禮',
    category: 'food',
    location: '大阪 黑門市場',
    notes: '烤扇貝、海膽、炙燒黑毛和牛串燒！',
    estimatedCost: 4500,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's502',
    dayIndex: 4,
    time: '14:30',
    title: '搭乘南海電鐵前往關西空港 & 免稅店伴手禮',
    category: 'transport',
    location: '關西國際機場 T1 出境大廳',
    notes: '買生八橋、白色戀人、ROYCE 生巧克力。',
    estimatedCost: 1450,
    currency: 'JPY',
    isCompleted: false
  },
  {
    id: 's503',
    dayIndex: 4,
    time: '17:45',
    title: '✈️ 回程航班：長榮航空 BR131 (KIX 🛫 TPE)',
    category: 'transport',
    location: '關西國際機場 T1 (Gate 14)',
    notes: '起飛 17:45 ➜ 預計 19:50 抵達台北桃園 | 訂位代號：EVA-8899JP | 座位：22A~22D',
    estimatedCost: 0,
    currency: 'TWD',
    linkedFlightId: 'f2',
    isCompleted: false
  }
];

export const initialFlightBookings: FlightBooking[] = [
  {
    id: 'f1',
    airline: '長榮航空 EVA AIR',
    flightNumber: 'BR132',
    departureCity: '台北 (桃園)',
    departureCode: 'TPE',
    departureTime: '08:30',
    arrivalCity: '大阪 (關西)',
    arrivalCode: 'KIX',
    arrivalTime: '12:10',
    date: '2026-10-15',
    seat: '24A, 24B, 24C, 24D',
    gate: 'C7',
    terminal: 'T1',
    bookingRef: 'EVA-8899JP',
    passengerNames: ['Alice Lin', 'Bob Wang', 'Cindy Chen', 'David Chang'],
    quantity: 4,
    unitPrice: 14500,
    totalPrice: 58000,
    currency: 'TWD',
    paidByMemberId: 'm1', // Alice
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '包含每人託運行李 23kg * 2 件 + 手提 7kg'
  },
  {
    id: 'f2',
    airline: '長榮航空 EVA AIR',
    flightNumber: 'BR131',
    departureCity: '大阪 (關西)',
    departureCode: 'KIX',
    departureTime: '17:45',
    arrivalCity: '台北 (桃園)',
    arrivalCode: 'TPE',
    arrivalTime: '19:50',
    date: '2026-10-19',
    seat: '22A, 22B, 22C, 22D',
    gate: 'Gate 14',
    terminal: 'T1',
    bookingRef: 'EVA-8899JP',
    passengerNames: ['Alice Lin', 'Bob Wang', 'Cindy Chen', 'David Chang'],
    quantity: 4,
    unitPrice: 0,
    totalPrice: 0,
    currency: 'TWD',
    paidByMemberId: 'm1',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '來回機票費用已合併於去程機票記錄 (回程起飛前 2 小時務必完成免稅品提領)'
  }
];

export const initialHotelBookings: HotelBooking[] = [
  {
    id: 'h1',
    name: '京都四條河原町 溫泉町屋風飯店 (Sora Hotel Kyoto)',
    photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    address: '京都府京都市下京區河原町通四條下ル',
    mapUrl: 'https://maps.google.com/?q=Kawaramachi+Station+Kyoto',
    checkInDate: '2026-10-15',
    checkInTime: '15:00',
    checkOutDate: '2026-10-18',
    checkOutTime: '11:00',
    totalPrice: 128000,
    currency: 'JPY',
    paidByMemberId: 'm2', // Bob
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    bookingRef: 'AGODA-KYOTO-9921',
    phone: '+81 75-123-4567',
    notes: '頂樓附設天然露天溫泉「白鷺之湯」，房間提供日式浴衣與木屐體驗。'
  },
  {
    id: 'h2',
    name: '大阪難波東急 STAY 景觀公寓 (Tokyu Stay Namba)',
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
    address: '大阪府大阪市中央區難波千日前 2-10',
    mapUrl: 'https://maps.google.com/?q=Namba+Station+Osaka',
    checkInDate: '2026-10-18',
    checkInTime: '15:00',
    checkOutDate: '2026-10-19',
    checkOutTime: '11:00',
    totalPrice: 42000,
    currency: 'JPY',
    paidByMemberId: 'm2', // Bob
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    bookingRef: 'BOOKING-OSA-4410',
    phone: '+81 6-987-6543',
    notes: '房內備有獨立洗烘衣機與微波爐，步行 3 分鐘抵達道頓堀！'
  }
];

export const initialCarRentalBookings: CarRentalBooking[] = [
  {
    id: 'c1',
    company: 'Toyota Rent a Car (京都站前店)',
    carModel: 'Toyota Sienta 7人座油電休旅車 (附中英文 GPS + ETC 卡)',
    pickupLocation: 'JR 京都站八條口 豐田租車中心',
    pickupTime: '08:30',
    pickupDate: '2026-10-17',
    returnLocation: 'JR 京都站八條口 豐田租車中心',
    returnTime: '20:30',
    returnDate: '2026-10-17',
    url: 'https://rent.toyota.co.jp/zh-tw/',
    confirmationNumber: 'TOYOTA-KYOTO-77218',
    totalPrice: 16500,
    currency: 'JPY',
    paidByMemberId: 'm4', // David
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    photoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    driverName: 'David (已備妥台灣駕照日文譯本)',
    notes: '包含全額免責補償險 (NOC 安心險)，取車需出示護照與譯本。'
  }
];

export const initialVoucherBookings: VoucherBooking[] = [
  {
    id: 'v1',
    title: 'HARUKA 關西機場特快列車車票 (電子兌換券)',
    category: 'ticket',
    provider: 'Klook 客路',
    validDate: '2026-10-15',
    code: 'KLK-HARUKA-8829103',
    url: 'https://www.klook.com/zh-TW/activity/18400-jr-haruka-kansai-airport-express-ticket-osaka-kyoto/',
    paidByMemberId: 'm1', // Alice
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    quantity: 4,
    amount: 8800,
    currency: 'JPY',
    fileUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400&auto=format&fit=crop',
    notes: '至關西機場綠色售票機掃描 QR Code 領取指定席票卡（4人份）。'
  },
  {
    id: 'v2',
    title: '清水寺秋季夜間拜觀特別入場憑證',
    category: 'activity',
    provider: 'KKday 旅遊',
    validDate: '2026-10-16',
    code: 'KK-KIYOMIZU-40091',
    url: 'https://www.kkday.com/zh-tw/product/129202',
    paidByMemberId: 'm3', // Cindy
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    quantity: 4,
    amount: 2000,
    currency: 'JPY',
    notes: '入場時出示手機條碼直接進入快速通關閘門。'
  },
  {
    id: 'v3',
    title: 'Bic Camera 8%+7% 電器折價優惠券',
    category: 'coupon',
    provider: 'Bic Camera 日本官網',
    validDate: '2026-10-31',
    code: 'BIC-TAXFREE-2026FALL',
    url: 'https://www.biccamera.com.e.ur.hp.transer.com/bc/c/info/service/foreign_customer.jsp',
    paidByMemberId: 'm1',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    quantity: 1,
    amount: 0,
    currency: 'JPY',
    notes: '結帳時出示條碼給店員掃描，滿 5000 日圓享免稅再折 7%。'
  }
];

export const initialExpenses: ExpenseItem[] = [
  {
    id: 'e1',
    title: '住宿：京都四條河原町 溫泉町屋風飯店 (3晚)',
    amount: 128000,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'lodging',
    date: '2026-10-15',
    payerId: 'm2', // Bob
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '4 人平攤每人 32,000 JPY',
    linkedBookingId: 'h1',
    linkedBookingType: 'hotel'
  },
  {
    id: 'e2',
    title: '機票：長榮航空 BR132 (4人來回機票)',
    amount: 58000,
    currency: 'TWD',
    exchangeRate: 1.0,
    category: 'transport',
    date: '2026-09-10',
    payerId: 'm1', // Alice
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '每人 14,500 TWD (4張機票)',
    linkedBookingId: 'f1',
    linkedBookingType: 'flight'
  },
  {
    id: 'e3',
    title: '租車：Toyota Rent a Car (Toyota Sienta 7人座)',
    amount: 16500,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'transport',
    date: '2026-10-17',
    payerId: 'm4', // David
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    receiptUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop',
    notes: '包含全額免責補償險 (NOC 安心險)',
    linkedBookingId: 'c1',
    linkedBookingType: 'car'
  },
  {
    id: 'e_v1',
    title: '票券：HARUKA 關西機場特快列車 (4人份)',
    amount: 8800,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'transport',
    date: '2026-10-15',
    payerId: 'm1', // Alice
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    receiptUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400&auto=format&fit=crop',
    notes: 'Klook 預訂電子兌換券',
    linkedBookingId: 'v1',
    linkedBookingType: 'voucher'
  },
  {
    id: 'e_v2',
    title: '票券：清水寺秋季夜間拜觀憑證 (4人份)',
    amount: 2000,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'spot',
    date: '2026-10-16',
    payerId: 'm3', // Cindy
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: 'KKday 預訂入場憑證',
    linkedBookingId: 'v2',
    linkedBookingType: 'voucher'
  },
  {
    id: 'e4',
    title: '奧丹清水 湯豆腐懷石午餐',
    amount: 18000,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'food',
    date: '2026-10-16',
    payerId: 'm3', // Cindy
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '4 人份經典豆腐套餐'
  },
  {
    id: 'e5',
    title: '錦市場小吃採買公費',
    amount: 6000,
    currency: 'JPY',
    exchangeRate: 0.215,
    category: 'food',
    date: '2026-10-15',
    payerId: 'm1', // Alice
    splitMemberIds: ['m1', 'm2', 'm3', 'm4'],
    notes: '玉子燒、章魚燒、豆乳霜淇淋'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: 'j1',
    date: '2026-10-15',
    title: '初抵京都！鴨川微風與美味玉子燒 🍵',
    content: '搭乘 HARUKA 一到京都，撲面而來的就是古色古香的氣息。下午在錦市場吃到了熱騰騰剛出爐的三木雞卵玉子燒，蛋香濃郁又多汁！傍晚大家一起坐在鴨川階梯上吹著秋風，看著夕陽把河面染成金黃色，這就是旅行最幸福的時刻 ✨',
    authorId: 'm1',
    photos: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=800&auto=format&fit=crop'
    ],
    location: '京都・鴨川河畔',
    mood: 'happy',
    weather: '晴天 23°C',
    tags: ['京都漫步', '錦市場', '鴨川夕陽', '動森生活'],
    likes: 8
  },
  {
    id: 'j2',
    date: '2026-10-16',
    title: '穿和服走在清水坂，拍了 500 張照片！👘',
    content: '今天大家都換上了日式和服與羽織！走在石板路上木屐發出清脆的聲音。清水寺舞台眺望整片初紅的楓樹林，美到屏息。感謝 David 幫大家拍了好多奇蹟美照，晚上還要來看夜楓點燈！',
    authorId: 'm3',
    photos: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop'
    ],
    location: '京都・清水寺 二年坂',
    mood: 'excited',
    weather: '多雲微涼 21°C',
    tags: ['和服體驗', '清水寺舞台', '初秋紅葉', '手帳時光'],
    likes: 12
  }
];

export const initialPlanningItems: PlanningItem[] = [
  // Todo
  {
    id: 'p1',
    type: 'todo',
    title: '填寫日本入境 Visit Japan Web (VJW)',
    isCompleted: true,
    assignedTo: 'all',
    categoryTag: '行前必辦',
    notes: '出發前 3 天填寫完成並截圖 QR Code'
  },
  {
    id: 'p2',
    type: 'todo',
    title: '確認實體護照效期大於 6 個月',
    isCompleted: true,
    assignedTo: 'all',
    categoryTag: '證件確認',
    notes: '所有人皆已核對完成'
  },
  {
    id: 'p3',
    type: 'todo',
    title: '辦理日本出國旅平險與不便險',
    isCompleted: true,
    assignedTo: 'm2', // Bob
    categoryTag: '行前必辦',
    notes: '已替全員投保富邦產險'
  },
  {
    id: 'p4',
    type: 'todo',
    title: '至監理站辦理台灣駕照日文譯本',
    isCompleted: true,
    assignedTo: 'm4', // David
    categoryTag: '租車準備',
    notes: '規費 100 元，需連同正本一起攜帶出國'
  },

  // Packing
  {
    id: 'p5',
    type: 'packing',
    title: '護照正本 + 影本 2 份',
    isCompleted: true,
    assignedTo: 'all',
    categoryTag: '重要證件'
  },
  {
    id: 'p6',
    type: 'packing',
    title: '日本 5G eSIM / 網卡安裝',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '通訊網路'
  },
  {
    id: 'p7',
    type: 'packing',
    title: '日幣現金 (每人預計換 50,000 円)',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '金錢貨幣'
  },
  {
    id: 'p8',
    type: 'packing',
    title: '行動電源 (注意需隨身行李攜帶)',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '3C 電子'
  },
  {
    id: 'p9',
    type: 'packing',
    title: '雙電壓快充頭與 Type-C 充電線',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '3C 電子'
  },
  {
    id: 'p10',
    type: 'packing',
    title: '常備隨身藥品 (止痛藥、胃藥、感冒藥)',
    isCompleted: false,
    assignedTo: 'm3',
    categoryTag: '醫藥用品'
  },
  {
    id: 'p11',
    type: 'packing',
    title: '好走的運動布鞋 (京都每天走 2 萬步必備)',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '衣物鞋包'
  },

  // Shopping
  {
    id: 'p12',
    type: 'shopping',
    title: '中村藤吉 宇治抹茶生茶凍禮盒',
    isCompleted: false,
    assignedTo: 'm3',
    categoryTag: '伴手禮',
    notes: '京都站專櫃購買，需冷藏'
  },
  {
    id: 'p13',
    type: 'shopping',
    title: '京都 SOU・SOU 日式質感口金包 & 襪子',
    isCompleted: false,
    assignedTo: 'all',
    categoryTag: '日系文創',
    notes: '四條新京極本店'
  },
  {
    id: 'p14',
    type: 'shopping',
    title: '合利他命 EX Plus 270 錠 (大國藥妝)',
    isCompleted: false,
    assignedTo: 'm2',
    categoryTag: '藥妝保健',
    notes: '比價退稅滿萬折扣'
  },
  {
    id: 'p15',
    type: 'shopping',
    title: '生八橋（夕子・抹茶與肉桂口味）',
    isCompleted: false,
    assignedTo: 'm1',
    categoryTag: '名產糕點'
  }
];
