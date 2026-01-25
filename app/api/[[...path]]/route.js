import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/mongodb';
import { getCachedData, setCachedData } from '@/lib/redis';
import { searchYoutubeVideos, getRandomVideosForRegion } from '@/lib/youtube';

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
      const users = await getCollection('users');
      const user = await users.findOne({ walletAddress });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json(user, { headers: corsHeaders });
    }
    
    // Get videos for feed
    if (path === '/videos/feed') {
      const url = new URL(request.url);
      const regionCode = url.searchParams.get('region') || 'US';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const allVideos = getRandomVideosForRegion(regionCode, 50);
      const startIndex = (page - 1) * limit;
      const videoIds = allVideos.slice(startIndex, startIndex + limit);
      
      return NextResponse.json({
        videos: videoIds.map(id => ({ videoId: id })),
        hasMore: startIndex + limit < allVideos.length,
        page,
        total: allVideos.length
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
      const watchHistory = await getCollection('watchHistory');
      const history = await watchHistory.find({ userId }).sort({ timestamp: -1 }).limit(50).toArray();
      return NextResponse.json(history, { headers: corsHeaders });
    }
    
    // Get conversion history
    if (path.startsWith('/conversions/')) {
      const userId = pathSegments[1];
      const conversions = await getCollection('conversions');
      const history = await conversions.find({ userId }).sort({ timestamp: -1 }).toArray();
      return NextResponse.json(history, { headers: corsHeaders });
    }
    
    // Get tasks
    if (path.startsWith('/tasks/')) {
      const userId = pathSegments[1];
      const tasks = await getCollection('tasks');
      const completedTasks = await tasks.find({ userId }).toArray();
      
      const allTasks = [
        { id: 'follow_x', name: 'Follow us on X', reward: 100, icon: '🐦' },
        { id: 'post_x', name: 'Post about VidLook on X', reward: 200, icon: '📢' },
        { id: 'first_video', name: 'Watch your first video', reward: 50, icon: '🎬' },
        { id: 'watch_10', name: 'Watch 10 minutes total', reward: 100, icon: '⏱️' },
        { id: 'watch_60', name: 'Watch 60 minutes total', reward: 500, icon: '🏆' },
        { id: 'first_convert', name: 'Convert your first tokens', reward: 100, icon: '💱' },
        { id: 'daily_login', name: 'Daily login bonus', reward: 20, icon: '📅', daily: true }
      ];
      
      const completedTaskIds = completedTasks.map(t => t.taskId);
      
      return NextResponse.json(allTasks.map(task => ({
        ...task,
        completed: completedTaskIds.includes(task.id),
        completedAt: completedTasks.find(t => t.taskId === task.id)?.completedAt
      })), { headers: corsHeaders });
    }
    
    // Get user stats
    if (path.startsWith('/stats/')) {
      const userId = pathSegments[1];
      const watchHistory = await getCollection('watchHistory');
      const conversions = await getCollection('conversions');
      
      const totalWatchTime = await watchHistory.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$watchedSeconds' } } }
      ]).toArray();
      
      const totalTokensEarned = await watchHistory.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$tokensEarned' } } }
      ]).toArray();
      
      const totalConverted = await conversions.aggregate([
        { $match: { userId } },
        { $group: { _id: null, videoTokens: { $sum: '$videoTokens' }, wld: { $sum: '$wldAmount' } } }
      ]).toArray();
      
      return NextResponse.json({
        totalWatchTimeSeconds: totalWatchTime[0]?.total || 0,
        totalTokensEarned: totalTokensEarned[0]?.total || 0,
        totalVideoTokensConverted: totalConverted[0]?.videoTokens || 0,
        totalWldEarned: totalConverted[0]?.wld || 0
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
      
      const users = await getCollection('users');
      let user = await users.findOne({ walletAddress });
      
      if (!user) {
        user = {
          id: uuidv4(),
          walletAddress,
          username: username || `user_${walletAddress.slice(0, 6)}`,
          country: country || 'US',
          joinedAt: new Date().toISOString(),
          totalTokens: 0,
          totalWatchedSeconds: 0
        };
        await users.insertOne(user);
      } else {
        // Update country if changed
        if (country && country !== user.country) {
          await users.updateOne({ walletAddress }, { $set: { country } });
          user.country = country;
        }
      }
      
      return NextResponse.json(user, { headers: corsHeaders });
    }
    
    // Record watch time and award tokens
    if (path === '/watch/record') {
      const { userId, videoId, watchedSeconds } = await request.json();
      
      if (!userId || !videoId || watchedSeconds === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
      }
      
      // Calculate tokens: 2 VIDEO tokens per 60 seconds
      const tokensEarned = Math.floor(watchedSeconds / 60) * 2;
      
      if (tokensEarned > 0) {
        const watchHistory = await getCollection('watchHistory');
        const users = await getCollection('users');
        
        // Record watch history
        await watchHistory.insertOne({
          id: uuidv4(),
          userId,
          videoId,
          watchedSeconds,
          tokensEarned,
          timestamp: new Date().toISOString()
        });
        
        // Update user tokens
        await users.updateOne(
          { id: userId },
          { 
            $inc: { 
              totalTokens: tokensEarned,
              totalWatchedSeconds: watchedSeconds 
            } 
          }
        );
        
        const user = await users.findOne({ id: userId });
        
        return NextResponse.json({ 
          tokensEarned, 
          totalTokens: user?.totalTokens || 0,
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
      
      const users = await getCollection('users');
      const user = await users.findOne({ id: userId });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }
      
      if (user.totalTokens < videoTokens) {
        return NextResponse.json({ error: 'Insufficient VIDEO tokens' }, { status: 400, headers: corsHeaders });
      }
      
      // Calculate WLD: 1000 VIDEO = 1 WLD
      const wldAmount = videoTokens / 1000;
      
      // Record conversion
      const conversions = await getCollection('conversions');
      await conversions.insertOne({
        id: uuidv4(),
        userId,
        videoTokens,
        wldAmount,
        timestamp: new Date().toISOString()
      });
      
      // Deduct tokens
      await users.updateOne(
        { id: userId },
        { $inc: { totalTokens: -videoTokens } }
      );
      
      const updatedUser = await users.findOne({ id: userId });
      
      return NextResponse.json({
        success: true,
        videoTokensUsed: videoTokens,
        wldAmount,
        remainingTokens: updatedUser?.totalTokens || 0,
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
      
      const tasks = await getCollection('tasks');
      const existingTask = await tasks.findOne({ userId, taskId });
      
      // Check if already completed (except daily tasks)
      if (existingTask && taskId !== 'daily_login') {
        return NextResponse.json({ error: 'Task already completed' }, { status: 400, headers: corsHeaders });
      }
      
      // For daily login, check if already claimed today
      if (taskId === 'daily_login' && existingTask) {
        const lastClaim = new Date(existingTask.completedAt);
        const today = new Date();
        if (lastClaim.toDateString() === today.toDateString()) {
          return NextResponse.json({ error: 'Daily bonus already claimed today' }, { status: 400, headers: corsHeaders });
        }
        // Update the existing record
        await tasks.updateOne({ userId, taskId }, { $set: { completedAt: new Date().toISOString() } });
      } else {
        // Create new task completion
        await tasks.insertOne({
          id: uuidv4(),
          userId,
          taskId,
          reward,
          completedAt: new Date().toISOString()
        });
      }
      
      // Award tokens
      const users = await getCollection('users');
      await users.updateOne(
        { id: userId },
        { $inc: { totalTokens: reward } }
      );
      
      const user = await users.findOne({ id: userId });
      
      return NextResponse.json({
        success: true,
        reward,
        totalTokens: user?.totalTokens || 0,
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
