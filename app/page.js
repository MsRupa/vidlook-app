'use client';

import { useState, useEffect, useRef } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@/components/MiniKitProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { translations, LANGUAGES, getLanguageFromCountry, t } from '@/lib/translations';
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
  ChevronDown,
  Copy,
  ExternalLink,
  Coins,
  TrendingUp,
  Calendar,
  X,
  Loader2,
  LogOut,
  HelpCircle,
  Mail,
  Globe,
  AlertTriangle
} from 'lucide-react';

// Country code to name mapping
const COUNTRY_NAMES = {
  'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AD': 'Andorra', 'AO': 'Angola',
  'AR': 'Argentina', 'AM': 'Armenia', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan',
  'BH': 'Bahrain', 'BD': 'Bangladesh', 'BY': 'Belarus', 'BE': 'Belgium', 'BZ': 'Belize',
  'BJ': 'Benin', 'BT': 'Bhutan', 'BO': 'Bolivia', 'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana',
  'BR': 'Brazil', 'BN': 'Brunei', 'BG': 'Bulgaria', 'BF': 'Burkina Faso', 'BI': 'Burundi',
  'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada', 'CV': 'Cape Verde', 'CF': 'Central African Republic',
  'TD': 'Chad', 'CL': 'Chile', 'CN': 'China', 'CO': 'Colombia', 'KM': 'Comoros',
  'CG': 'Congo', 'CD': 'DR Congo', 'CR': 'Costa Rica', 'CI': 'Ivory Coast', 'HR': 'Croatia',
  'CU': 'Cuba', 'CY': 'Cyprus', 'CZ': 'Czech Republic', 'DK': 'Denmark', 'DJ': 'Djibouti',
  'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt', 'SV': 'El Salvador', 'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea', 'EE': 'Estonia', 'SZ': 'Eswatini', 'ET': 'Ethiopia', 'FJ': 'Fiji',
  'FI': 'Finland', 'FR': 'France', 'GA': 'Gabon', 'GM': 'Gambia', 'GE': 'Georgia',
  'DE': 'Germany', 'GH': 'Ghana', 'GR': 'Greece', 'GT': 'Guatemala', 'GN': 'Guinea',
  'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti', 'HN': 'Honduras', 'HK': 'Hong Kong',
  'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia', 'IR': 'Iran',
  'IQ': 'Iraq', 'IE': 'Ireland', 'IL': 'Israel', 'IT': 'Italy', 'JM': 'Jamaica',
  'JP': 'Japan', 'JO': 'Jordan', 'KZ': 'Kazakhstan', 'KE': 'Kenya', 'KW': 'Kuwait',
  'KG': 'Kyrgyzstan', 'LA': 'Laos', 'LV': 'Latvia', 'LB': 'Lebanon', 'LS': 'Lesotho',
  'LR': 'Liberia', 'LY': 'Libya', 'LI': 'Liechtenstein', 'LT': 'Lithuania', 'LU': 'Luxembourg',
  'MO': 'Macau', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives',
  'ML': 'Mali', 'MT': 'Malta', 'MR': 'Mauritania', 'MU': 'Mauritius', 'MX': 'Mexico',
  'MD': 'Moldova', 'MC': 'Monaco', 'MN': 'Mongolia', 'ME': 'Montenegro', 'MA': 'Morocco',
  'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia', 'NP': 'Nepal', 'NL': 'Netherlands',
  'NZ': 'New Zealand', 'NI': 'Nicaragua', 'NE': 'Niger', 'NG': 'Nigeria', 'KP': 'North Korea',
  'MK': 'North Macedonia', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan', 'PA': 'Panama',
  'PG': 'Papua New Guinea', 'PY': 'Paraguay', 'PE': 'Peru', 'PH': 'Philippines', 'PL': 'Poland',
  'PT': 'Portugal', 'PR': 'Puerto Rico', 'QA': 'Qatar', 'RO': 'Romania', 'RU': 'Russia',
  'RW': 'Rwanda', 'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SG': 'Singapore',
  'SK': 'Slovakia', 'SI': 'Slovenia', 'SO': 'Somalia', 'ZA': 'South Africa', 'KR': 'South Korea',
  'SS': 'South Sudan', 'ES': 'Spain', 'LK': 'Sri Lanka', 'SD': 'Sudan', 'SR': 'Suriname',
  'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syria', 'TW': 'Taiwan', 'TJ': 'Tajikistan',
  'TZ': 'Tanzania', 'TH': 'Thailand', 'TL': 'Timor-Leste', 'TG': 'Togo', 'TT': 'Trinidad and Tobago',
  'TN': 'Tunisia', 'TR': 'Turkey', 'TM': 'Turkmenistan', 'UG': 'Uganda', 'UA': 'Ukraine',
  'AE': 'United Arab Emirates', 'GB': 'United Kingdom', 'US': 'United States', 'UY': 'Uruguay',
  'UZ': 'Uzbekistan', 'VE': 'Venezuela', 'VN': 'Vietnam', 'YE': 'Yemen', 'ZM': 'Zambia', 'ZW': 'Zimbabwe'
};

// Simple Sponsored Video Card - Uses direct iframe embed (test component)
function SponsoredVideoCard({ videoId, onWatch, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const intervalRef = useRef(null);
  const lastRecordedMinuteRef = useRef(0);

  // Start timer when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const currentMinute = Math.floor(newTime / 60);
          
          // Award 5 tokens per minute for sponsored videos
          if (currentMinute > lastRecordedMinuteRef.current) {
            const newTokens = (currentMinute - lastRecordedMinuteRef.current) * 5;
            setSessionTokens(prev => prev + newTokens);
            lastRecordedMinuteRef.current = currentMinute;
            
            if (onWatch) {
              onWatch(videoId, newTime, newTokens);
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, videoId, onWatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4 ring-2 ring-yellow-500/50">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span>SPONSORED</span>
        </div>
        <span>Earn 5 $VIDEO per minute</span>
      </div>
      
      <div className="relative w-full aspect-video bg-gray-900">
        {!isPlaying ? (
          // Thumbnail with play button
          <div className="relative w-full h-full">
            <img 
              src={thumbnailUrl} 
              alt={title || 'Sponsored Video'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault fails
                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </button>
          </div>
        ) : (
          // Direct iframe embed
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || 'Sponsored Video'}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 pointer-events-none">
            <div className="w-2 h-2 bg-white rounded-full" />
            Earning $VIDEO
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        {title && (
          <p className="text-white text-sm font-medium mb-2 line-clamp-2">{title}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(watchTime)}</span>
          </div>
          {sessionTokens > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              +{sessionTokens} $VIDEO
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Video Card Component - Uses simple thumbnail + iframe approach
function VideoCard({ videoId, onWatch, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [sessionTokens, setSessionTokens] = useState(0);
  const intervalRef = useRef(null);
  const lastRecordedMinuteRef = useRef(0);

  // Start timer when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          const currentMinute = Math.floor(newTime / 60);
          
          // Award 2 tokens per minute for regular videos
          if (currentMinute > lastRecordedMinuteRef.current) {
            const newTokens = (currentMinute - lastRecordedMinuteRef.current) * 2;
            setSessionTokens(prev => prev + newTokens);
            lastRecordedMinuteRef.current = currentMinute;
            
            if (onWatch) {
              onWatch(videoId, newTime, newTokens);
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, videoId, onWatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4">
      <div className="relative w-full aspect-video bg-gray-900">
        {!isPlaying ? (
          // Thumbnail with play button
          <div className="relative w-full h-full">
            <img 
              src={thumbnailUrl} 
              alt={title || 'Video'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault fails
                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </button>
          </div>
        ) : (
          // Direct iframe embed
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || 'Video'}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse z-10 pointer-events-none">
            <div className="w-2 h-2 bg-white rounded-full" />
            Earning $VIDEO
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        {title && (
          <p className="text-white text-sm font-medium mb-2 line-clamp-2">{title}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(watchTime)}</span>
          </div>
          {sessionTokens > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              +{sessionTokens} $VIDEO
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Video Card Skeleton for loading state
function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-4">
      {/* Video thumbnail skeleton */}
      <div className="relative w-full aspect-video bg-gray-800">
        <Skeleton className="absolute inset-0 bg-gray-700" />
        {/* Play button overlay skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-600/50 flex items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full bg-gray-500" />
          </div>
        </div>
      </div>
      <CardContent className="p-3 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-700" />
        </div>
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-gray-700" />
            <Skeleton className="h-3 w-12 bg-gray-700" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );
}

// Welcome Screen
function WelcomeScreen({ onConnect, language, onLanguageChange }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { isInstalled, isChecking } = useMiniKit();

  const txt = translations[language]?.welcome || translations['en'].welcome;
  const errorTxt = translations[language]?.error || translations['en'].error;

  // Pre-detect country while user is viewing the welcome screen
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://api.country.is');
        const data = await res.json();
        if (data.country) {
          setDetectedCountry(data.country);
          console.log('Pre-detected country:', data.country);
          
          // Auto-set language based on country
          const detectedLang = getLanguageFromCountry(data.country);
          if (detectedLang !== 'en') {
            onLanguageChange(detectedLang);
          }
        }
      } catch (e) {
        console.log('Country pre-detection failed');
      }
    };
    detectCountry();
  }, []);

  const handleConnect = async () => {
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit is not installed');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Use MiniKit wallet auth
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: crypto.randomUUID().replace(/-/g, ''),
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to VidLook to watch videos and earn $VIDEO tokens',
      });

      if (finalPayload.status === 'error') {
        console.error('Wallet auth failed:', finalPayload);
        setIsConnecting(false);
        return;
      }

      // Get wallet address from MiniKit user
      const walletAddress = MiniKit.user?.walletAddress;
      const username = MiniKit.user?.username;
      
      if (walletAddress) {
        // Pass to parent with username if available
        onConnect(walletAddress, detectedCountry, username);
      }
    } catch (error) {
      console.error('Wallet auth error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Show loading while checking MiniKit
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  // Show error if not inside World App
  if (!isInstalled) {
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
                className="w-24 h-24 relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {errorTxt.title}
            </h1>
            <p className="text-gray-400">
              {errorTxt.message}
            </p>
          </div>

          {/* Download Link */}
          <div className="pt-6 space-y-3">
            <p className="text-gray-500 text-sm">{errorTxt.downloadTitle}</p>
            <Button
              onClick={() => window.open('https://world.org/download', '_blank')}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {errorTxt.downloadButton}
            </Button>
          </div>

          {/* Language Selector */}
          <div className="relative pt-4">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition text-gray-300"
            >
              <Globe className="w-4 h-4" />
              <span className="text-lg">{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLanguageDropdown && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLanguageDropdown(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition ${
                      language === lang.code ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-white">{lang.name}</span>
                    {language === lang.code && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            {txt.tagline}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature1Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature2Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{txt.feature3Title}</p>
              <p className="text-gray-400 text-sm">{txt.feature3Desc}</p>
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
              {txt.connecting}
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              {txt.connectWallet}
            </>
          )}
        </Button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition text-gray-300"
          >
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLanguageDropdown && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setShowLanguageDropdown(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition ${
                    language === lang.code ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-white">{lang.name}</span>
                  {language === lang.code && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Home Screen (Video Feed)
function HomeScreen({ user, onTokensEarned, language }) {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const txt = translations[language]?.home || translations['en'].home;

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
            {user?.totalTokens?.toLocaleString() || 0} $VIDEO
          </Badge>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={txt.searchPlaceholder}
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
            {txt.resultsFor.replace('{count}', searchResults.length).replace('{query}', searchQuery)}
          </p>
          <Button variant="ghost" size="sm" onClick={clearSearch} className="text-red-500">
            {txt.clear}
          </Button>
        </div>
      )}

      {/* Trending Header */}
      {searchResults.length === 0 && !isSearching && (
        <div className="px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="text-white font-bold">
            {isLoading ? (
              <Skeleton className="h-5 w-40 bg-gray-700 inline-block" />
            ) : (
              txt.trendingIn.replace('{country}', COUNTRY_NAMES[user?.country] || user?.country || txt.yourRegion)
            )}
          </h2>
        </div>
      )}

      {/* Video Feed */}
      <div className="px-4 py-4 space-y-4">
        {isLoading && videos.length === 0 ? (
          // Skeleton UI for initial loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : isSearching ? (
          // Skeleton UI for search loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <VideoCardSkeleton key={`search-skeleton-${i}`} />
            ))}
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
                  title={video.snippet?.title}
                  onWatch={handleWatch}
                />
              ))
            ) : (
              // Feed Videos (Trending + Sponsored)
              displayVideos
                .filter(video => video.videoId)
                .map((video, index) => (
                video.isSponsored ? (
                  <SponsoredVideoCard
                    key={video.videoId + '-' + index}
                    videoId={video.videoId}
                    title={video.title}
                    onWatch={handleWatch}
                  />
                ) : (
                  <VideoCard 
                    key={video.videoId + '-' + index}
                    videoId={video.videoId}
                    title={video.title}
                    isSponsored={false}
                    onWatch={handleWatch}
                  />
                )
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
function ProfileScreen({ user, onTokensEarned, onLogout, language }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const txt = translations[language]?.profile || translations['en'].profile;
  const taskTxt = translations[language]?.tasks || translations['en'].tasks;

  // Map task IDs to translation keys
  const getTaskName = (taskId, fallbackName) => {
    const taskMap = {
      'daily_login': taskTxt.dailyLogin,
      'follow_x': taskTxt.followX,
      'post_x': taskTxt.postX,
      'watch_1hour': taskTxt.watch1Hour
    };
    return taskMap[taskId] || fallbackName;
  };

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
      <div className="pb-24">
        {/* Profile Header Skeleton */}
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg bg-gray-700" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-black/30 border-gray-700">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-20 bg-gray-700" />
                  <Skeleton className="h-7 w-16 bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tasks Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-32 bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 bg-gray-700" />
                      <Skeleton className="h-3 w-20 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-16 bg-gray-700" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full bg-gray-700" />
            <Skeleton className="h-5 w-28 bg-gray-700" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-3 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                    <Skeleton className="h-3 w-32 bg-gray-700" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">@{user?.username}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span className="truncate">{user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}</span>
              <button onClick={copyAddress} className="flex-shrink-0">
                <Copy className="w-4 h-4 hover:text-white transition" />
              </button>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 px-3 py-2 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{txt.logout}</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs">{txt.videoBalance}</span>
              </div>
              <p className="text-2xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{txt.watchTime}</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(stats?.totalWatchTimeSeconds || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{txt.totalEarned}</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats?.totalTokensEarned?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">{txt.joined}</span>
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
          <h3 className="text-lg font-bold text-white">{txt.tasksRewards}</h3>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={`bg-gray-900 border-gray-800 ${task.completed ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{getTaskName(task.id, task.name)}</p>
                    <p className="text-sm text-gray-400">+{task.reward} $VIDEO</p>
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
                        txt.claim
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">{txt.faq}</h3>
        </div>

        <div className="space-y-3">
          {/* FAQ 1 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq1Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 1 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 1 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {txt.faq1Answer} <a href="mailto:help@vidlookapp.com" className="text-red-500 hover:underline">help@vidlookapp.com</a>
                </p>
              </div>
            )}
          </Card>

          {/* FAQ 2 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq2Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 2 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 2 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm">
                  {txt.faq2Answer}
                </p>
              </div>
            )}
          </Card>

          {/* FAQ 3 */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <button 
              onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <p className="text-white font-medium">{txt.faq3Question}</p>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedFaq === 3 ? 'rotate-180' : ''}`} />
            </button>
            {expandedFaq === 3 && (
              <div className="px-4 pb-4">
                <p className="text-gray-400 text-sm whitespace-pre-line">
                  {txt.faq3Answer}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Watch History */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white">{txt.recentActivity}</h3>
        </div>

        {history.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{txt.noHistory}</p>
              <p className="text-gray-500 text-sm">{txt.startWatching}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((item, index) => (
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
function ConvertScreen({ user, onTokensUpdate, language }) {
  const [amount, setAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversions, setConversions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationWld, setConfirmationWld] = useState(null);

  const txt = translations[language]?.convert || translations['en'].convert;

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
      setError('Minimum conversion is 5000 $VIDEO tokens');
      return;
    }
    
    if (videoTokens > (user?.totalTokens || 0)) {
      setError('Insufficient $VIDEO tokens');
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
        setSuccess(`Successfully converted ${videoTokens} $VIDEO to ${data.wldAmount} WLD!`);
        setConfirmationWld(data.wldAmount);
        setAmount('');
        if (onTokensUpdate) {
          onTokensUpdate(data.remainingTokens);
        }
        loadConversions();
        
        // Clear confirmation after 1 minute
        setTimeout(() => {
          setConfirmationWld(null);
          setSuccess('');
        }, 60000);
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{txt.title}</h1>
          <p className="text-gray-400 text-sm">{txt.rate}</p>
        </div>
      </div>

      {/* Confirmation Message */}
      {confirmationWld && (
        <Card className="bg-green-500/10 border-green-500/30 mb-6">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-500 font-medium">
              {txt.confirmationMsg.replace('{amount}', confirmationWld)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">{txt.availableBalance}</p>
          <p className="text-4xl font-bold text-white">{user?.totalTokens?.toLocaleString() || 0}</p>
          <p className="text-red-500 font-medium">{txt.videoTokens}</p>
        </CardContent>
      </Card>

      {/* Conversion Form */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">{txt.amountToConvert}</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={txt.enterAmount}
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
              {txt.max}
            </Button>
          </div>

          <Separator className="bg-gray-800" />

          {/* Conversion Preview */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400">{txt.youWillReceive}</span>
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
                {txt.converting}
              </>
            ) : (
              txt.convertButton
            )}
          </Button>

          <p className="text-center text-gray-500 text-xs">
            {txt.minimum}
          </p>
        </CardContent>
      </Card>

      {/* Conversion History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" />
          {txt.history}
        </h3>

        {conversions.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">{txt.noConversions}</p>
              <p className="text-gray-500 text-sm">{txt.convertFirst}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversions.map((conv, index) => (
              <Card key={conv.id || index} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{conv.videoTokens?.toLocaleString()} $VIDEO</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(conv.timestamp).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
function BottomNav({ activeTab, onTabChange, language }) {
  const txt = translations[language]?.nav || translations['en'].nav;
  
  const tabs = [
    { id: 'home', icon: Home, label: txt.home },
    { id: 'convert', icon: ArrowRightLeft, label: txt.convert },
    { id: 'profile', icon: User, label: txt.profile }
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
  const [language, setLanguage] = useState('en');

  const handleConnect = async (walletAddress, preDetectedCountry, username) => {
    setIsLoading(true);
    try {
      // Use pre-detected country or detect now
      let country = preDetectedCountry || 'US';
      if (!preDetectedCountry) {
        try {
          const countryRes = await fetch('https://api.country.is');
          const countryData = await countryRes.json();
          country = countryData.country || 'US';
        } catch (e) {
          console.log('Country detection failed, using default');
        }
      }

      // Connect wallet - use MiniKit username if available
      const res = await fetch('/api/users/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          username: username || `User_${walletAddress.slice(2, 8)}`,
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
    return (
      <WelcomeScreen 
        onConnect={handleConnect} 
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {activeTab === 'home' && (
        <HomeScreen 
          user={user} 
          onTokensEarned={handleTokensUpdate}
          language={language}
        />
      )}
      
      {activeTab === 'convert' && (
        <ConvertScreen 
          user={user}
          onTokensUpdate={handleTokensUpdate}
          language={language}
        />
      )}
      
      {activeTab === 'profile' && (
        <ProfileScreen 
          user={user}
          onTokensEarned={handleTokensUpdate}
          onLogout={() => setUser(null)}
          language={language}
        />
      )}

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        language={language}
      />
    </div>
  );
}
