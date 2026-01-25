export async function searchYoutubeVideos(query, maxResults = 10, regionCode = 'US') {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('q', query);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('type', 'video');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('key', process.env.YOUTUBE_API_KEY || '');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('YouTube fetch error:', error);
    throw error;
  }
}

// Curated video IDs by region - popular content
export const curatedVideosByRegion = {
  US: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'JGwWNGJdvx8', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'CevxZvSJLk8', 'YQHsXMglC9A', 'PT2_F-1esPk', 'JRfuAukYTKg', 'LsoLEjrDogU',
    'e-ORhEE9VVg', 'bo_efYhYU2A', 'SlPhMPnQ58k', '7PCkvCPvDXk', 'hp8XYHL7Pr8'
  ],
  IN: [
    'vTIIMJ9tUc8', 'l_MyUGq7pgs', 'YR12Z8f1Dh8', 'BddP6PYo2gs', 'aJOTlE1K90k',
    'lWA2pjMjpBs', 'cNw8A5pwbVI', 'DnJqoYY4tDY', '5V430M59Yn8', 'wDjeBNv6ip0',
    '7JJfJgyHYwU', 'pAgnJDJN4VA', 'OUMQ9J3nKQw', 'vGJTaP6anOU', 'LfWZz04-8FI'
  ],
  BR: [
    'kXYiU_JCYtU', 'dE9nItQbHmI', 'yzTuBuRdAyA', 'zEf423kYPrA', 'hHW1oY26kxQ',
    'oRdxUFDoQe0', 'vYCVq3h3PkY', 'DHp9SnxYO6k', 'niqrrmev4mA', 'uG2yzY4MiYQ'
  ],
  GB: [
    '9bZkp7q19f0', 'dQw4w9WgXcQ', 'JGwWNGJdvx8', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
    'hT_nvWreIhg', 'lp-EO5I60KA', 'CevxZvSJLk8', 'fRh_vgS2dFE', 'pRpeEdMmmQ0'
  ],
  JP: [
    'MRIuJYk7xII', '65BAeDpwzGY', 'FvOpPeKSf_4', 'Lq_r06_vvBo', 'bYR7rLM1AhM',
    'K_xTet06SUo', 'rOU4YiuaxAM', 'LIlZCmETvsY', 'OdaGLvKhTwQ', 'DQdV7N9pWAw'
  ],
  KR: [
    '9bZkp7q19f0', 'gdZLi9oWNZg', 'XQSse3b2ge4', 'gQlMMD8auMs', 'wIgXX0PRKYU',
    '3HqEPkE-k4w', 'CjRbTzj3jZk', 'HYWocPF2TA0', 'rygIYlPMazo', 'QwJ9gMXKTXw'
  ],
  DE: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'CevxZvSJLk8', 'pRpeEdMmmQ0'
  ],
  FR: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk',
    'lWA2pjMjpBs', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'CevxZvSJLk8', 'fRh_vgS2dFE'
  ],
  MX: [
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'JGwWNGJdvx8', 'dQw4w9WgXcQ', '9bZkp7q19f0',
    'oRdxUFDoQe0', 'yzTuBuRdAyA', 'fRh_vgS2dFE', 'OPf0YbXqDm0', 'CevxZvSJLk8'
  ],
  DEFAULT: [
    'dQw4w9WgXcQ', '9bZkp7q19f0', 'JGwWNGJdvx8', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'CevxZvSJLk8', 'YQHsXMglC9A', 'PT2_F-1esPk', 'JRfuAukYTKg', 'LsoLEjrDogU',
    'e-ORhEE9VVg', 'bo_efYhYU2A', 'SlPhMPnQ58k', '7PCkvCPvDXk', 'hp8XYHL7Pr8'
  ]
};

export function getRandomVideosForRegion(regionCode, count = 20) {
  const videos = curatedVideosByRegion[regionCode] || curatedVideosByRegion.DEFAULT;
  // Shuffle and return random videos
  const shuffled = [...videos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
