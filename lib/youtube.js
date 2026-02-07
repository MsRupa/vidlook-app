// ============================================
// SPONSORED VIDEO ID - Update this for promotions
// This video will always appear at the top of the feed
// ============================================
export const SPONSORED_VIDEO_ID = '9WEQts7b8Pw'; // Replace with your sponsored video ID

// Search YouTube videos
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

// Get trending videos for a region using YouTube Data API
// Uses videos.list with chart=mostPopular
export async function getTrendingVideos(regionCode = 'US', maxResults = 40) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('key', process.env.YOUTUBE_API_KEY || '');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error response:', errorText);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform and filter to ensure valid video IDs
    const videos = (data.items || [])
      .filter(item => item.id && typeof item.id === 'string' && item.id.length > 0)
      .map(item => ({
        videoId: item.id,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
        viewCount: item.statistics?.viewCount || '0',
        duration: item.contentDetails?.duration || ''
      }));
    
    return { videos, total: videos.length };
  } catch (error) {
    console.error('YouTube trending fetch error:', error);
    throw error;
  }
}

// Fallback curated video IDs by region (used if API fails)
export const curatedVideosByRegion = {
  US: [
    'e-ORhEE9VVg', 'CevxZvSJLk8', 'kJQP7kiw5Fk', 'RgKAFK5djSk', 'JGwWNGJdvx8',
    'fRh_vgS2dFE', 'OPf0YbXqDm0', 'hTWKbfoikeg', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'YQHsXMglC9A', 'PT2_F-1esPk', 'LsoLEjrDogU', 'bo_efYhYU2A', 'SlPhMPnQ58k',
    '7PCkvCPvDXk', 'hp8XYHL7Pr8', 'DyDfgMOUjCI', 'Lq_r06_vvBo', 'lWA2pjMjpBs',
    'JkaxUblCGz0', 'pSUydWEqKwE', '0KSOMA3QBU0', 'NZKXkD6EgBk', 'l_MyUGq7pgs'
  ],
  IN: [
    'vTIIMJ9tUc8', 'l_MyUGq7pgs', 'YR12Z8f1Dh8', 'BddP6PYo2gs', 'aJOTlE1K90k',
    'lWA2pjMjpBs', 'cNw8A5pwbVI', 'DnJqoYY4tDY', '5V430M59Yn8', 'wDjeBNv6ip0',
    '7JJfJgyHYwU', 'pAgnJDJN4VA', 'OUMQ9J3nKQw', 'vGJTaP6anOU', 'LfWZz04-8FI',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  BR: [
    'kXYiU_JCYtU', 'dE9nItQbHmI', 'yzTuBuRdAyA', 'zEf423kYPrA', 'hHW1oY26kxQ',
    'oRdxUFDoQe0', 'vYCVq3h3PkY', 'DHp9SnxYO6k', 'niqrrmev4mA', 'uG2yzY4MiYQ',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  GB: [
    'fRh_vgS2dFE', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'RgKAFK5djSk', 'e-ORhEE9VVg',
    'hT_nvWreIhg', 'lp-EO5I60KA', 'CevxZvSJLk8', 'pRpeEdMmmQ0', '60ItHLz5WEA',
    'OPf0YbXqDm0', 'YQHsXMglC9A', 'PT2_F-1esPk', 'LsoLEjrDogU', 'bo_efYhYU2A'
  ],
  JP: [
    'MRIuJYk7xII', '65BAeDpwzGY', 'FvOpPeKSf_4', 'Lq_r06_vvBo', 'bYR7rLM1AhM',
    'K_xTet06SUo', 'rOU4YiuaxAM', 'LIlZCmETvsY', 'OdaGLvKhTwQ', 'DQdV7N9pWAw',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg'
  ],
  KR: [
    'gdZLi9oWNZg', 'XQSse3b2ge4', 'gQlMMD8auMs', 'wIgXX0PRKYU', '3HqEPkE-k4w',
    'CjRbTzj3jZk', 'HYWocPF2TA0', 'rygIYlPMazo', 'QwJ9gMXKTXw', 'kJQP7kiw5Fk',
    'RgKAFK5djSk', 'fRh_vgS2dFE', 'JGwWNGJdvx8', 'e-ORhEE9VVg', 'CevxZvSJLk8'
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
