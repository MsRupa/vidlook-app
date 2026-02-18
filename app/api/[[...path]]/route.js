import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCachedData, setCachedData } from '@/lib/redis';
import { searchYoutubeVideos, getTrendingVideos, getRandomVideosForRegion, SPONSORED_VIDEO_ID } from '@/lib/youtube';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Route handler
export async function GET(request, { params }) {
  const pathSegments = params?.path || [];
  const path = '/' + pathSegments.join('/');
  
  try {
    // Health check
    if (path === '/' || path === '') {
      return NextResponse.json({ status: 'ok', message: 'VidLook API is running' }, { headers: corsHeaders });
    }
    
    // Get user by wallet address
    if (path.startsWith('/users/')) {
      const walletAddress = pathSegments[1];
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      
      // Transform to camelCase for frontend compatibility
      return NextResponse.json({
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        country: user.country,
        totalTokens: user.total_tokens,
        totalWatchedSeconds: user.total_watched_seconds,
        joinedAt: user.joined_at
      }, { headers: corsHeaders });
    }
    
    // Get videos for feed - uses YouTube Trending API with 24-hour caching
    if (path === '/videos/feed') {
      const url = new URL(request.url);
      const regionCode = url.searchParams.get('region') || 'US';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      // Cache key for trending videos - one per country, refreshes daily
      const cacheKey = `trending:${regionCode}`;
      const CACHE_TTL = 86400; // 24 hours in seconds
      
      let trendingVideos = [];
      
      try {
        // Try cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          console.log(`Cache hit for trending videos: ${regionCode}`);
          const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
          trendingVideos = parsed.videos || [];
        } else {
          // Cache miss - fetch from YouTube API
          console.log(`Cache miss for trending videos: ${regionCode}, fetching from API...`);
          const trendingData = await getTrendingVideos(regionCode, 40);
          trendingVideos = trendingData.videos || [];
          
          // Cache the results for 24 hours
          if (trendingVideos.length > 0) {
            await setCachedData(cacheKey, { videos: trendingVideos }, CACHE_TTL);
            console.log(`Cached ${trendingVideos.length} trending videos for ${regionCode}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trending videos, using fallback:', error.message);
        // Fallback to curated videos if API fails
        const fallbackIds = getRandomVideosForRegion(regionCode, 40);
        trendingVideos = fallbackIds.map(id => ({ videoId: id }));
      }
      
      // Add sponsored video at the top (only on first page)
      let allVideos = [...trendingVideos];
      if (page === 1 && SPONSORED_VIDEO_ID) {
        // Remove sponsored video if it exists in trending to avoid duplicates
        allVideos = allVideos.filter(v => v.videoId !== SPONSORED_VIDEO_ID);
        // Add sponsored video at the top with a flag
        allVideos.unshift({ videoId: SPONSORED_VIDEO_ID, isSponsored: true });
      }
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const paginatedVideos = allVideos.slice(startIndex, startIndex + limit);
      
      return NextResponse.json({
        videos: paginatedVideos,
        hasMore: startIndex + limit < allVideos.length,
        page,
        total: allVideos.length,
        region: regionCode
      }, { headers: corsHeaders });
    }
    
    // Search videos with caching
    if (path === '/videos/search') {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      const regionCode = url.searchParams.get('region') || 'US';
      
      if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400, headers: corsHeaders });
      }
      
      // Normalize query: lowercase, trim, collapse multiple spaces
      const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
      const cacheKey = `youtube:search:${normalizedQuery}:${regionCode}`;
      const SEARCH_CACHE_TTL = 86400; // 24 hours - same as trending
      
      // Try cache first
      let cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log('Search cache hit for:', normalizedQuery);
        const data = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return NextResponse.json(data, { headers: corsHeaders });
      }
      
      // Fetch from YouTube API
      console.log('Search cache miss for:', normalizedQuery);
      const youtubeData = await searchYoutubeVideos(query, 20, regionCode);
      
      // Cache the results for 24 hours
      await setCachedData(cacheKey, youtubeData, SEARCH_CACHE_TTL);
      
      return NextResponse.json(youtubeData, { headers: corsHeaders });
    }
    
    // Get watch history
    if (path.startsWith('/history/')) {
      const userId = pathSegments[1];
      const { data: history, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
      
      // Transform to camelCase for frontend compatibility
      return NextResponse.json(history.map(h => ({
        id: h.id,
        userId: h.user_id,
        videoId: h.video_id,
        watchedSeconds: h.watched_seconds,
        tokensEarned: h.tokens_earned,
        timestamp: h.timestamp
      })), { headers: corsHeaders });
    }
    
    // Get conversion history
    if (path.startsWith('/conversions/')) {
      const userId = pathSegments[1];
      const { data: conversions, error } = await supabase
        .from('conversions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
      
      // Transform to camelCase for frontend compatibility
      return NextResponse.json(conversions.map(c => ({
        id: c.id,
        userId: c.user_id,
        videoTokens: c.video_tokens,
        wldAmount: parseFloat(c.wld_amount),
        timestamp: c.timestamp
      })), { headers: corsHeaders });
    }
    
    // Get tasks
    if (path.startsWith('/tasks/')) {
      const userId = pathSegments[1];
      const { data: completedTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
      
      const allTasks = [
        { id: 'daily_login', name: 'Daily Login Bonus', reward: 50, icon: '📅', daily: true },
        { id: 'post_x', name: 'Post about VidLook on X', reward: 100, icon: '𝕏' },
        { id: 'follow_x', name: 'Follow VidLook on X', reward: 100, icon: '𝕏' },
        { id: 'watch_60', name: 'Watch 1 Hour Total', reward: 100, icon: '⏰' }
      ];
      
      const today = new Date().toDateString();
      
      return NextResponse.json(allTasks.map(task => {
        const completedTask = completedTasks.find(t => t.task_id === task.id);
        
        // For daily_login: only show as completed if claimed today
        if (task.id === 'daily_login' && completedTask) {
          const lastClaim = new Date(completedTask.completed_at).toDateString();
          return {
            ...task,
            completed: lastClaim === today,
            completedAt: completedTask.completed_at
          };
        }
        
        // For other tasks: show as completed if ever completed
        return {
          ...task,
          completed: !!completedTask,
          completedAt: completedTask?.completed_at
        };
      }), { headers: corsHeaders });
    }
    
    // Get user stats
    if (path.startsWith('/stats/')) {
      const userId = pathSegments[1];
      
      // Get total watch time and tokens earned
      const { data: watchStats, error: watchError } = await supabase
        .from('watch_history')
        .select('watched_seconds, tokens_earned')
        .eq('user_id', userId);
      
      if (watchError) {
        return NextResponse.json({ error: watchError.message }, { status: 500, headers: corsHeaders });
      }
      
      const totalWatchTimeSeconds = (watchStats || []).reduce((sum, h) => sum + (h.watched_seconds || 0), 0);
      const totalTokensEarned = (watchStats || []).reduce((sum, h) => sum + (h.tokens_earned || 0), 0);
      
      // Get conversion stats
      const { data: conversionStats, error: convError } = await supabase
        .from('conversions')
        .select('video_tokens, wld_amount')
        .eq('user_id', userId);
      
      if (convError) {
        return NextResponse.json({ error: convError.message }, { status: 500, headers: corsHeaders });
      }
      
      const totalVideoTokensConverted = (conversionStats || []).reduce((sum, c) => sum + (c.video_tokens || 0), 0);
      const totalWldEarned = (conversionStats || []).reduce((sum, c) => sum + parseFloat(c.wld_amount || 0), 0);
      
      return NextResponse.json({
        totalWatchTimeSeconds,
        totalTokensEarned,
        totalVideoTokensConverted,
        totalWldEarned
      }, { headers: corsHeaders });
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request, { params }) {
  const pathSegments = params?.path || [];
  const path = '/' + pathSegments.join('/');
  
  try {
    // Create or get user (wallet connect)
    if (path === '/users/connect') {
      const { walletAddress, username, country } = await request.json();
      
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (existingUser) {
        // Always update updated_at on login, and country if changed
        const updateData = { updated_at: new Date().toISOString() };
        if (country && country !== existingUser.country) {
          updateData.country = country;
          existingUser.country = country;
        }
        
        await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id);
        
        return NextResponse.json({
          id: existingUser.id,
          walletAddress: existingUser.wallet_address,
          username: existingUser.username,
          country: existingUser.country,
          totalTokens: existingUser.total_tokens,
          totalWatchedSeconds: existingUser.total_watched_seconds,
          joinedAt: existingUser.joined_at
        }, { headers: corsHeaders });
      }
      
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          username: username || `user_${walletAddress.slice(0, 6)}`,
          country: country || 'US',
          total_tokens: 0,
          total_watched_seconds: 0
        })
        .select()
        .single();
      
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({
        id: newUser.id,
        walletAddress: newUser.wallet_address,
        username: newUser.username,
        country: newUser.country,
        totalTokens: newUser.total_tokens,
        totalWatchedSeconds: newUser.total_watched_seconds,
        joinedAt: newUser.joined_at
      }, { headers: corsHeaders });
    }
    
    // Record watch time and award tokens
    if (path === '/watch/record') {
      const { userId, videoId, watchedSeconds, isSponsored } = await request.json();
      
      if (!userId || !videoId || watchedSeconds === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
      }
      
      // ===== STRICT SECURITY: Server-side validation =====
      
      // 1. Validate userId format (must be valid UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return NextResponse.json({ error: 'Invalid user' }, { status: 400, headers: corsHeaders });
      }
      
      // 2. Limit max watchedSeconds per request (max 65 seconds - slightly over 1 minute for network latency)
      const MAX_SECONDS_PER_REQUEST = 65;
      const validatedSeconds = Math.min(Math.max(0, Math.floor(watchedSeconds)), MAX_SECONDS_PER_REQUEST);
      
      // 3. Get user with last_watch_recorded to check rate limiting
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('total_tokens, total_watched_seconds, last_watch_recorded, joined_at')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      
      const now = new Date();
      
      // 4. ANTI-CHEAT: Total watch time can never exceed time since account creation
      const timeSinceJoined = (now - new Date(user.joined_at)) / 1000;
      if ((user.total_watched_seconds || 0) > timeSinceJoined) {
        console.warn(`FRAUD DETECTED: User ${userId} has more watch time than account age`);
        return NextResponse.json({ 
          tokensEarned: 0, 
          totalTokens: user.total_tokens,
          message: 'Account flagged for review'
        }, { headers: corsHeaders });
      }
      
      // 5. Rate limiting: Minimum 55 seconds between API calls (must actually watch ~1 minute)
      const MIN_INTERVAL_SECONDS = 55;
      if (user.last_watch_recorded) {
        const lastRecord = new Date(user.last_watch_recorded);
        const elapsedSeconds = (now - lastRecord) / 1000;
        
        if (elapsedSeconds < MIN_INTERVAL_SECONDS) {
          return NextResponse.json({ 
            tokensEarned: 0, 
            totalTokens: user.total_tokens,
            message: 'Please wait before recording again'
          }, { headers: corsHeaders });
        }
        
        // 6. STRICT: claimed watchedSeconds cannot exceed actual elapsed time + 5s buffer
        const maxPossibleSeconds = elapsedSeconds + 5;
        if (validatedSeconds > maxPossibleSeconds) {
          console.warn(`FRAUD: user ${userId} claimed ${validatedSeconds}s but only ${elapsedSeconds}s elapsed`);
          return NextResponse.json({ 
            tokensEarned: 0, 
            totalTokens: user.total_tokens,
            message: 'Invalid watch time'
          }, { headers: corsHeaders });
        }
      }
      
      // 7. Per-video limit: Max 30 minutes (1800 seconds) per video per day
      const MAX_SECONDS_PER_VIDEO_PER_DAY = 1800;
      const today = now.toISOString().split('T')[0];
      const { data: videoHistory } = await supabase
        .from('watch_history')
        .select('watched_seconds')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z');
      
      const videoTodaySeconds = (videoHistory || []).reduce((sum, h) => sum + (h.watched_seconds || 0), 0);
      if (videoTodaySeconds >= MAX_SECONDS_PER_VIDEO_PER_DAY) {
        return NextResponse.json({ 
          tokensEarned: 0, 
          totalTokens: user.total_tokens,
          message: 'Video limit reached. Watch a different video!'
        }, { headers: corsHeaders });
      }
      
      // 8. Daily limit: Max 6 hours (21600 seconds) of credited watch time per day
      const DAILY_LIMIT_SECONDS = 21600;
      const { data: todayHistory } = await supabase
        .from('watch_history')
        .select('watched_seconds')
        .eq('user_id', userId)
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z');
      
      const todayTotalSeconds = (todayHistory || []).reduce((sum, h) => sum + (h.watched_seconds || 0), 0);
      if (todayTotalSeconds >= DAILY_LIMIT_SECONDS) {
        return NextResponse.json({ 
          tokensEarned: 0, 
          totalTokens: user.total_tokens,
          message: 'Daily watch limit reached (6 hours). Come back tomorrow!'
        }, { headers: corsHeaders });
      }
      
      // 9. Hourly limit: Max 70 minutes per hour (allows some buffer but prevents extreme abuse)
      const HOURLY_LIMIT_SECONDS = 4200;
      const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
      const { data: hourHistory } = await supabase
        .from('watch_history')
        .select('watched_seconds')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo);
      
      const hourTotalSeconds = (hourHistory || []).reduce((sum, h) => sum + (h.watched_seconds || 0), 0);
      if (hourTotalSeconds >= HOURLY_LIMIT_SECONDS) {
        return NextResponse.json({ 
          tokensEarned: 0, 
          totalTokens: user.total_tokens,
          message: 'Hourly limit reached. Take a short break!'
        }, { headers: corsHeaders });
      }
      
      // Cap to remaining limits
      const remainingVideoSeconds = MAX_SECONDS_PER_VIDEO_PER_DAY - videoTodaySeconds;
      const remainingDailySeconds = DAILY_LIMIT_SECONDS - todayTotalSeconds;
      const remainingHourlySeconds = HOURLY_LIMIT_SECONDS - hourTotalSeconds;
      const finalWatchedSeconds = Math.min(validatedSeconds, remainingVideoSeconds, remainingDailySeconds, remainingHourlySeconds);
      
      // 10. SERVER-SIDE token calculation: 2 tokens per minute (regular), 5 for sponsored
      // Only award tokens for full minutes watched
      const minutesWatched = Math.floor(finalWatchedSeconds / 60);
      const tokensPerMinute = isSponsored ? 5 : 2;
      const tokensEarned = minutesWatched * tokensPerMinute;
      
      if (tokensEarned > 0 || finalWatchedSeconds >= 60) {
        // Record watch history
        const { error: historyError } = await supabase
          .from('watch_history')
          .insert({
            user_id: userId,
            video_id: videoId,
            watched_seconds: finalWatchedSeconds,
            tokens_earned: tokensEarned
          });
        
        if (historyError) {
          console.error('History insert error:', historyError);
        }
        
        // Update user tokens and last_watch_recorded
        const { error: updateError } = await supabase
          .from('users')
          .update({
            total_tokens: (user.total_tokens || 0) + tokensEarned,
            total_watched_seconds: (user.total_watched_seconds || 0) + finalWatchedSeconds,
            last_watch_recorded: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500, headers: corsHeaders });
        }
        
        return NextResponse.json({ 
          tokensEarned, 
          totalTokens: (user.total_tokens || 0) + tokensEarned,
          message: tokensEarned > 0 ? `Earned ${tokensEarned} VIDEO tokens!` : 'Keep watching to earn tokens!'
        }, { headers: corsHeaders });
      }
      
      // Update last_watch_recorded even if no tokens earned
      await supabase
        .from('users')
        .update({ last_watch_recorded: now.toISOString() })
        .eq('id', userId);
      
      return NextResponse.json({ 
        tokensEarned: 0, 
        totalTokens: user.total_tokens,
        message: 'Keep watching to earn tokens!'
      }, { headers: corsHeaders });
    }
    
    // Convert VIDEO tokens to WLD
    if (path === '/convert') {
      const { userId, videoTokens } = await request.json();
      
      if (!userId || !videoTokens) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
      }
      
      if (videoTokens < 5000) {
        return NextResponse.json({ error: 'Minimum conversion is 5000 VIDEO tokens' }, { status: 400, headers: corsHeaders });
      }
      
      // Get user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      
      if (user.total_tokens < videoTokens) {
        return NextResponse.json({ error: 'Insufficient VIDEO tokens' }, { status: 400, headers: corsHeaders });
      }
      
      // Calculate WLD: 1000 VIDEO = 1 WLD
      const wldAmount = videoTokens / 1000;
      
      // Record conversion
      const { error: conversionError } = await supabase
        .from('conversions')
        .insert({
          user_id: userId,
          video_tokens: videoTokens,
          wld_amount: wldAmount
        });
      
      if (conversionError) {
        return NextResponse.json({ error: conversionError.message }, { status: 500, headers: corsHeaders });
      }
      
      // Deduct tokens
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_tokens: user.total_tokens - videoTokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({
        success: true,
        videoTokensUsed: videoTokens,
        wldAmount,
        remainingTokens: user.total_tokens - videoTokens,
        message: `Successfully converted ${videoTokens} VIDEO to ${wldAmount} WLD!`
      }, { headers: corsHeaders });
    }
    
    // Complete task
    if (path === '/tasks/complete') {
      const { userId, taskId } = await request.json();
      
      const taskRewards = {
        'follow_x': 100,
        'post_x': 100,
        'first_video': 50,
        'watch_10': 100,
        'watch_60': 100,
        'first_convert': 100,
        'daily_login': 50
      };
      
      const reward = taskRewards[taskId];
      if (!reward) {
        return NextResponse.json({ error: 'Invalid task' }, { status: 400, headers: corsHeaders });
      }
      
      // For watch_60 task: verify user has watched at least 60 minutes (3600 seconds)
      if (taskId === 'watch_60') {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('total_watched_seconds')
          .eq('id', userId)
          .single();
        
        if (userError) {
          return NextResponse.json({ error: userError.message }, { status: 500, headers: corsHeaders });
        }
        
        if ((user?.total_watched_seconds || 0) < 3600) {
          return NextResponse.json({ error: 'Watch at least 1 hour of videos first' }, { status: 400, headers: corsHeaders });
        }
      }
      
      // Check if already completed
      const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .single();
      
      // For lifetime tasks (follow_x, post_x, watch_60): check if already completed ever
      if (existingTask && (taskId === 'follow_x' || taskId === 'post_x' || taskId === 'watch_60')) {
        return NextResponse.json({ error: 'Task already completed' }, { status: 400, headers: corsHeaders });
      }
      
      // For daily login, check if already claimed today
      if (taskId === 'daily_login' && existingTask) {
        const lastClaim = new Date(existingTask.completed_at);
        const today = new Date();
        if (lastClaim.toDateString() === today.toDateString()) {
          return NextResponse.json({ error: 'Daily bonus already claimed today' }, { status: 400, headers: corsHeaders });
        }
        // Update the existing record
        await supabase
          .from('tasks')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('task_id', taskId);
      } else {
        // Create new task completion (use upsert for daily tasks)
        const { error: taskError } = await supabase
          .from('tasks')
          .upsert({
            user_id: userId,
            task_id: taskId,
            reward,
            completed_at: new Date().toISOString()
          }, { onConflict: 'user_id,task_id' });
        
        if (taskError) {
          return NextResponse.json({ error: taskError.message }, { status: 500, headers: corsHeaders });
        }
      }
      
      // Award tokens - get current user tokens first
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('total_tokens')
        .eq('id', userId)
        .single();
      
      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500, headers: corsHeaders });
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          total_tokens: (user.total_tokens || 0) + reward,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({
        success: true,
        reward,
        totalTokens: (user.total_tokens || 0) + reward,
        message: `Earned ${reward} VIDEO tokens!`
      }, { headers: corsHeaders });
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request, { params }) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501, headers: corsHeaders });
}

export async function DELETE(request, { params }) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501, headers: corsHeaders });
}
