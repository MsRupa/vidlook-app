'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  User, 
  ArrowRightLeft, 
  Search, 
  Wallet,
  Play,
  Clock,
  Trophy,
  Gift,
  CheckCircle2,
  Circle,
  ChevronRight,
  Copy,
  ExternalLink,
  Coins,
  TrendingUp,
  Calendar,
  X,
  Loader2
} from 'lucide-react';

const LOGO_URL = '/logo.png';

// YouTube Player Component - Using YouTube IFrame API for accurate play/pause detection
function YouTubePlayer({ videoId, onTimeUpdate, onPlay, onPause, isActive }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const intervalRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const lastTickRef = useRef(null);
  
  // Store callbacks in refs to avoid re-creating the player when callbacks change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  
  // Keep refs up to date
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
  });

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Load the API script if not already loading
    if (!window.onYouTubeIframeAPIReady) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set up callback
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      setApiReady(true);
    };

    // Check if already ready (race condition)
    if (window.YT && window.YT.Player) {
      setApiReady(true);
    }
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!apiReady || !containerRef.current || playerRef.current) return;
    
    // Don't create player if videoId is invalid
    if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
      console.warn('Invalid videoId, skipping player creation');
      return;
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onStateChange: (event) => {
          // YouTube Player States:
          // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            lastTickRef.current = Date.now();
            if (onPlayRef.current) onPlayRef.current();
            
            // Start tracking time
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              const now = Date.now();
              const delta = (now - lastTickRef.current) / 1000;
              lastTickRef.current = now;
              accumulatedTimeRef.current += delta;
              const totalTime = Math.floor(accumulatedTimeRef.current);
              setWatchTime(totalTime);
              if (onTimeUpdateRef.current) onTimeUpdateRef.current(totalTime);
            }, 1000);
          } else if (event.data === window.YT.PlayerState.PAUSED || 
                     event.data === window.YT.PlayerState.ENDED ||
                     event.data === window.YT.PlayerState.BUFFERING) {
            setIsPlaying(false);
            if (onPauseRef.current) onPauseRef.current();
            
            // Stop tracking time
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        },
      },
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiReady, videoId]); // Only re-create player when videoId changes, not when callbacks change

  // Handle visibility change - pause tracking when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Pause the video when tab is hidden
        if (playerRef.current && playerRef.current.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
      {isPlaying && isActive && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 pointer-events-none">
          <div className="w-2 h-2 bg-white rounded-full" />
          Earning VIDEO
        </div>
      )}
    </div>
  );
}

// Video Card Component
function VideoCard({ videoId, onWatch, isWatching, tokensEarned }) {
  const [watchTime, setWatchTime] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const lastRecordedMinuteRef = useRef(0);

  const handleTimeUpdate = useCallback((time) => {
    setWatchTime(Math.floor(time));
    const currentMinute = Math.floor(time / 60);
    
    // Award 2 tokens per minute
    if (currentMinute > lastRecordedMinuteRef.current) {
      const newTokens = (currentMinute - lastRecordedMinuteRef.current) * 2;
      setSessionTokens(prev => prev + newTokens);
      lastRecordedMinuteRef.current = currentMinute;
      
      // Report to parent
      if (onWatch) {
        onWatch(videoId, Math.floor(time), newTokens);
      }
    }
  }, [videoId, onWatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4">
      <YouTubePlayer 
        videoId={videoId} 
        onTimeUpdate={handleTimeUpdate}
        isActive={true}
      />
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(watchTime)}</span>
          </div>
          {sessionTokens > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              +{sessionTokens} VIDEO
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Welcome Screen
function WelcomeScreen({ onConnect }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock wallet address
    const mockWallet = '0x' + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    onConnect(mockWallet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-3xl opacity-30 rounded-full" />
            <img 
              src={LOGO_URL} 
              alt="VidLook" 
              className="w-32 h-32 relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Vid<span className="text-red-500">Look</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Watch YouTube & Earn WLD
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Watch Videos</p>
              <p className="text-gray-400 text-sm">Discover trending content</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Earn VIDEO Tokens</p>
              <p className="text-gray-400 text-sm">2 VIDEO per minute watched</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Convert to WLD</p>
              <p className="text-gray-400 text-sm">1000 VIDEO = 1 WLD</p>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02]"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        <p className="text-gray-500 text-sm">
          Powered by Worldcoin
        </p>
      </div>
    </div>
  );
}

// Home Screen (Video Feed)
function HomeScreen({ user, onTokensEarned }) {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Load initial videos
  useEffect(() => {
    loadVideos();
  }, [user?.country]);

  const loadVideos = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/videos/feed?region=${user?.country || 'US'}&page=${pageNum}&limit=10`);
      const data = await res.json();
      
      if (pageNum === 1) {
        setVideos(data.videos || []);
      } else {
        setVideos(prev => [...prev, ...(data.videos || [])]);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadVideos(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}&region=${user?.country || 'US'}`);
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleWatch = useCallback(async (videoId, watchedSeconds, tokensEarned) => {
    try {
      const res = await fetch('/api/watch/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          videoId,
          watchedSeconds,
          tokensEarned // Send the incremental tokens calculated by client
        })
      });
      const data = await res.json();
      if (data.totalTokens !== undefined && onTokensEarned) {
        onTokensEarned(data.totalTokens);
      }
    } catch (error) {
      console.error('Failed to record watch:', error);
    }
  }, [user?.id, onTokensEarned]);

  const displayVideos = searchResults.length > 0 ? searchResults : videos;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <img src={LOGO_URL} alt="VidLook" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-white">VidLook</h1>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white">
            {user?.totalTokens?.toLocaleString() || 0} VIDEO
          </Badge>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSearching}
            className="bg-red-500 hover:bg-red-600 rounded-xl"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      {/* Search Results Header */}
      {searchResults.length > 0 && (
        <div className="px-4 py-3 bg-gray-900/50 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            {searchResults.length} results for "{searchQuery}"
          </p>
          <Button variant="ghost" size="sm" onClick={clearSearch} className="text-red-500">
            Clear
          </Button>
        </div>
      )}

      {/* Video Feed */}
      <div className="px-4 py-4 space-y-4">
        {isLoading && videos.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              // Search Results - filter out items without valid videoId
              searchResults
                .filter(video => video.id?.videoId)
                .map((video, index) => (
                <VideoCard 
                  key={video.id.videoId}
                  videoId={video.id.videoId}
                  onWatch={handleWatch}
                />
              ))
            ) : (
              // Feed Videos
              displayVideos.map((video, index) => (
                <VideoCard 
                  key={video.videoId + '-' + index}
                  videoId={video.videoId}
                  onWatch={handleWatch}
                />
              ))
            )}

            {/* Load More Trigger */}
            {hasMore && searchResults.length === 0 && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Profile Screen
function ProfileScreen({ user, onTokensEarned }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, tasksRes, historyRes] = await Promise.all([
        fetch(`/api/stats/${user.id}`),
        fetch(`/api/tasks/${user.id}`),
        fetch(`/api/history/${user.id}`)
      ]);

      const [statsData, tasksData, historyData] = await Promise.all([
        statsRes.json(),
        tasksRes.json(),
        historyRes.json()
      ]);

      setStats(statsData);
      setTasks(tasksData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    setCompletingTask(taskId);
    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId })
      });
      const data = await res.json();
      
      if (data.success) {
        // Update tasks
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
        ));
        if (onTokensEarned) {
          onTokensEarned(data.totalTokens);
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span className="truncate max-w-[150px]">{user?.walletAddress?.slice(0, 10)}...{user?.walletAddress?.slice(-6)}</span>
              <button onClick={copyAddress}>
                <Copy className="w-4 h-4 hover:text-white transition" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs">VIDEO Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Watch Time</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(stats?.totalWatchTimeSeconds || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Total Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats?.totalTokensEarned?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Joined</span>
              </div>
              <p className="text-sm font-bold text-white">
                {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Today'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">Tasks & Rewards</h3>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={`bg-gray-900 border-gray-800 ${task.completed ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{task.name}</p>
                    <p className="text-sm text-gray-400">+{task.reward} VIDEO</p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => completeTask(task.id)}
                      disabled={completingTask === task.id}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {completingTask === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Claim'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Watch History */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>

        {history.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No watch history yet</p>
              <p className="text-gray-500 text-sm">Start watching to earn tokens!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((item, index) => (
              <Card key={item.id || index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Play className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">Video watched</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(item.timestamp).toLocaleDateString()} • {formatTime(item.watchedSeconds)}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500">
                    +{item.tokensEarned}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Convert Screen
function ConvertScreen({ user, onTokensUpdate }) {
  const [amount, setAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversions, setConversions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadConversions();
    }
  }, [user?.id]);

  const loadConversions = async () => {
    try {
      const res = await fetch(`/api/conversions/${user.id}`);
      const data = await res.json();
      setConversions(data);
    } catch (error) {
      console.error('Failed to load conversions:', error);
    }
  };

  const handleConvert = async () => {
    const videoTokens = parseInt(amount);
    
    setError('');
    setSuccess('');
    
    if (!videoTokens || videoTokens < 5000) {
      setError('Minimum conversion is 5000 VIDEO tokens');
      return;
    }
    
    if (videoTokens > (user?.totalTokens || 0)) {
      setError('Insufficient VIDEO tokens');
      return;
    }

    setIsConverting(true);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, videoTokens })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Successfully converted ${videoTokens} VIDEO to ${data.wldAmount} WLD!`);
        setAmount('');
        if (onTokensUpdate) {
          onTokensUpdate(data.remainingTokens);
        }
        loadConversions();
      }
    } catch (error) {
      setError('Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const wldAmount = amount ? Math.floor(parseInt(amount) / 1000) : 0;
  const isValid = parseInt(amount) >= 5000 && parseInt(amount) <= (user?.totalTokens || 0);

  const presetAmounts = [5000, 10000, 25000, 50000];

  return (
    <div className="pb-24 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Convert Tokens</h1>
        <p className="text-gray-400 mt-1">1000 VIDEO = 1 WLD</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
          <p className="text-red-500 font-medium">VIDEO Tokens</p>
        </CardContent>
      </Card>

      {/* Conversion Form */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Amount to Convert</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter VIDEO amount"
              className="bg-gray-800 border-gray-700 text-white text-lg h-14"
            />
          </div>

          {/* Preset Amounts */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => setAmount(preset.toString())}
                disabled={preset > (user?.totalTokens || 0)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {preset.toLocaleString()}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount((user?.totalTokens || 0).toString())}
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Max
            </Button>
          </div>

          <Separator className="bg-gray-800" />

          {/* Conversion Preview */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400">You will receive</span>
            <span className="text-2xl font-bold text-green-500">{wldAmount} WLD</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-500 text-sm">
              {success}
            </div>
          )}

          <Button
            onClick={handleConvert}
            disabled={!isValid || isConverting}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to WLD'
            )}
          </Button>

          <p className="text-center text-gray-500 text-xs">
            Minimum conversion: 5000 VIDEO tokens
          </p>
        </CardContent>
      </Card>

      {/* Conversion History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" />
          Conversion History
        </h3>

        {conversions.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No conversions yet</p>
              <p className="text-gray-500 text-sm">Convert your first tokens above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversions.map((conv, index) => (
              <Card key={conv.id || index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{conv.videoTokens?.toLocaleString()} VIDEO</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-bold">{conv.wldAmount} WLD</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bottom Navigation
function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'convert', icon: ArrowRightLeft, label: 'Convert' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-800 px-6 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (walletAddress) => {
    setIsLoading(true);
    try {
      // Detect country
      let country = 'US';
      try {
        const countryRes = await fetch('https://api.country.is');
        const countryData = await countryRes.json();
        country = countryData.country || 'US';
      } catch (e) {
        console.log('Country detection failed, using default');
      }

      // Connect wallet
      const res = await fetch('/api/users/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          username: `User_${walletAddress.slice(2, 8)}`,
          country
        })
      });

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokensUpdate = (newTotal) => {
    setUser(prev => prev ? { ...prev, totalTokens: newTotal } : null);
  };

  // Not connected - show welcome
  if (!user) {
    return <WelcomeScreen onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {activeTab === 'home' && (
        <HomeScreen 
          user={user} 
          onTokensEarned={handleTokensUpdate}
        />
      )}
      
      {activeTab === 'convert' && (
        <ConvertScreen 
          user={user}
          onTokensUpdate={handleTokensUpdate}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileScreen 
          user={user}
          onTokensEarned={handleTokensUpdate}
        />
      )}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}
