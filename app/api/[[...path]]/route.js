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
      
      const cacheKey = `youtube:search:${query.toLowerCase()}:${regionCode}`;
      
      // Try cache first
      let cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        console.log('Cache hit for:', query);
        const data = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return NextResponse.json(data, { headers: corsHeaders });
      }
      
      // Fetch from YouTube API
      console.log('Cache miss for:', query);
      const youtubeData = await searchYoutubeVideos(query, 20, regionCode);
      
      // Cache the results for 1 hour
      await setCachedData(cacheKey, youtubeData, 3600);
      
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
        { id: 'follow_x', name: 'Follow us on X', reward: 100, icon: '🐦' },
        { id: 'post_x', name: 'Post about VidLook on X', reward: 200, icon: '📢' },
        { id: 'first_video', name: 'Watch your first video', reward: 50, icon: '🎬' },
        { id: 'watch_10', name: 'Watch 10 minutes total', reward: 100, icon: '⏱️' },
        { id: 'watch_60', name: 'Watch 60 minutes total', reward: 500, icon: '🏆' },
        { id: 'first_convert', name: 'Convert your first tokens', reward: 100, icon: '💱' },
        { id: 'daily_login', name: 'Daily login bonus', reward: 20, icon: '📅', daily: true }
      ];
      
      const completedTaskIds = completedTasks.map(t => t.task_id);
      
      return NextResponse.json(allTasks.map(task => ({
        ...task,
        completed: completedTaskIds.includes(task.id),
        completedAt: completedTasks.find(t => t.task_id === task.id)?.completed_at
      })), { headers: corsHeaders });
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
        // Update country if changed
        if (country && country !== existingUser.country) {
          await supabase
            .from('users')
            .update({ country, updated_at: new Date().toISOString() })
            .eq('id', existingUser.id);
          existingUser.country = country;
        }
        
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
      const { userId, videoId, watchedSeconds, tokensEarned } = await request.json();
      
      if (!userId || !videoId || watchedSeconds === undefined || !tokensEarned) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
      }
      
      // Use the tokens calculated by the client (incremental per minute)
      // tokensEarned is already validated client-side as 2 tokens per minute
      
      if (tokensEarned > 0) {
        // Record watch history
        const { error: historyError } = await supabase
          .from('watch_history')
          .insert({
            user_id: userId,
            video_id: videoId,
            watched_seconds: watchedSeconds,
            tokens_earned: tokensEarned
          });
        
        if (historyError) {
          return NextResponse.json({ error: historyError.message }, { status: 500, headers: corsHeaders });
        }
        
        // Get current user tokens
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('total_tokens, total_watched_seconds')
          .eq('id', userId)
          .single();
        
        if (userError) {
          return NextResponse.json({ error: userError.message }, { status: 500, headers: corsHeaders });
        }
        
        // Update user tokens
        const { error: updateError } = await supabase
          .from('users')
          .update({
            total_tokens: (user.total_tokens || 0) + tokensEarned,
            total_watched_seconds: (user.total_watched_seconds || 0) + watchedSeconds,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500, headers: corsHeaders });
        }
        
        return NextResponse.json({ 
          tokensEarned, 
          totalTokens: (user.total_tokens || 0) + tokensEarned,
          message: `Earned ${tokensEarned} VIDEO tokens!`
        }, { headers: corsHeaders });
      }
      
      return NextResponse.json({ 
        tokensEarned: 0, 
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
        'post_x': 200,
        'first_video': 50,
        'watch_10': 100,
        'watch_60': 500,
        'first_convert': 100,
        'daily_login': 20
      };
      
      const reward = taskRewards[taskId];
      if (!reward) {
        return NextResponse.json({ error: 'Invalid task' }, { status: 400, headers: corsHeaders });
      }
      
      // Check if already completed
      const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .single();
      
      // Check if already completed (except daily tasks)
      if (existingTask && taskId !== 'daily_login') {
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
