/**
 * Map link utility supporting Google Maps, Naver Map, Kakao Map, and general navigation links.
 */

export interface MapInfo {
  url: string;
  provider: 'naver' | 'google' | 'kakao' | 'custom' | 'none';
  label: string;
  badgeLabel: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
  isNaver: boolean;
  isGoogle: boolean;
}

/**
 * Clean and format any map URL pasted by the user.
 * Supports short links like naver.me/xxx or maps.app.goo.gl/xxx
 */
export function formatMapUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) return '';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Auto prepend https:// for naver.me, map.naver.com, etc.
  return `https://${trimmed}`;
}

/**
 * Detect map service provider from URL string
 */
export function detectMapProvider(url?: string): 'naver' | 'google' | 'kakao' | 'custom' | 'none' {
  if (!url || !url.trim()) return 'none';
  const lower = url.toLowerCase();
  if (lower.includes('naver.me') || lower.includes('naver.com') || lower.includes('map.naver')) {
    return 'naver';
  }
  if (lower.includes('google.com/maps') || lower.includes('maps.google') || lower.includes('goo.gl/maps') || lower.includes('maps.app.goo.gl')) {
    return 'google';
  }
  if (lower.includes('kakao.com') || lower.includes('kakaomap') || lower.includes('kko.to')) {
    return 'kakao';
  }
  return 'custom';
}

/**
 * Get comprehensive map navigation info for rendering buttons, badges, and links
 */
export function getMapInfo(location?: string, customMapUrl?: string): MapInfo {
  const formattedUrl = formatMapUrl(customMapUrl);
  const provider = detectMapProvider(formattedUrl);

  if (formattedUrl) {
    if (provider === 'naver') {
      return {
        url: formattedUrl,
        provider: 'naver',
        label: 'Naver Map',
        badgeLabel: 'Naver Map 地圖',
        badgeBg: '#E8F7ED',
        badgeColor: '#03C75A',
        borderColor: '#B6E8C8',
        isNaver: true,
        isGoogle: false,
      };
    }
    if (provider === 'google') {
      return {
        url: formattedUrl,
        provider: 'google',
        label: 'Google Maps',
        badgeLabel: 'Google Maps 地圖',
        badgeBg: '#E8F0FE',
        badgeColor: '#1A73E8',
        borderColor: '#C2D7FA',
        isNaver: false,
        isGoogle: true,
      };
    }
    if (provider === 'kakao') {
      return {
        url: formattedUrl,
        provider: 'kakao',
        label: 'Kakao Map',
        badgeLabel: 'Kakao Map 地圖',
        badgeBg: '#FFFDE6',
        badgeColor: '#3A1D1D',
        borderColor: '#FEE500',
        isNaver: false,
        isGoogle: false,
      };
    }
    return {
      url: formattedUrl,
      provider: 'custom',
      label: '地圖導航',
      badgeLabel: '自訂導航連結',
      badgeBg: '#F0F9FF',
      badgeColor: '#0284C7',
      borderColor: '#BAE6FD',
      isNaver: false,
      isGoogle: false,
    };
  }

  // Fallback if no custom URL is provided
  const query = encodeURIComponent(location || '地圖');
  const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  
  return {
    url: googleSearchUrl,
    provider: 'none',
    label: '導航',
    badgeLabel: '搜尋地點',
    badgeBg: '#E5F2D5',
    badgeColor: '#447A5C',
    borderColor: '#D0E5BC',
    isNaver: false,
    isGoogle: false,
  };
}

/**
 * Generate Naver Map and Google Maps quick links for a location keyword
 */
export function getAlternateMapLinks(location: string) {
  const query = encodeURIComponent(location);
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${query}`,
    naverMap: `https://map.naver.com/p/search/${query}`,
    kakaoMap: `https://map.kakao.com/?q=${query}`
  };
}
