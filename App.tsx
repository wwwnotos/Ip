import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { Wifi, Film, Clapperboard, LogOut, Search, User, Filter, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ContentType, UserCredentials, StreamItem, Category } from './types';
import { Login } from './Login';
import { Player } from './Player';
import { StreamCard, StreamCardSkeleton } from './StreamCard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // --- Auth State ---
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- Content State ---
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.LIVE);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streams, setStreams] = useState<StreamItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // --- UI/Filter State ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500); // 500ms debounce
  const [playingStream, setPlayingStream] = useState<StreamItem | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const { ref: loadMoreRef, inView } = useInView();

  // Load creds
  useEffect(() => {
    const saved = localStorage.getItem('xtream_creds');
    if (saved) setCredentials(JSON.parse(saved));
  }, []);

  // --- Actions ---

  const handleLogin = async (creds: UserCredentials) => {
    setLoginLoading(true);
    setLoginError(null);
    let baseUrl = creds.url;
    if (!baseUrl.startsWith('http')) baseUrl = `http://${baseUrl}`;

    try {
      const { data } = await axios.get(`${baseUrl}/player_api.php`, {
        params: { username: creds.username, password: creds.password }
      });

      if (data.user_info?.auth === 0) {
        setLoginError("فشل تسجيل الدخول. تأكد من صحة البيانات.");
      } else {
        const validCreds = { ...creds, url: baseUrl };
        setCredentials(validCreds);
        localStorage.setItem('xtream_creds', JSON.stringify(validCreds));
      }
    } catch (e) {
      setLoginError("خطأ في الاتصال بالسيرفر. تأكد من العنوان.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('xtream_creds');
    setCredentials(null);
    setStreams([]);
    setCategories([]);
  };

  // Fetch Data logic
  const fetchData = useCallback(async () => {
    if (!credentials) return;
    setContentLoading(true);
    setStreams([]);
    setCategories([]);
    setPage(1);
    setSelectedCategory('all');

    // Demo Mode Logic
    if (credentials.username === 'demo') {
      setTimeout(() => {
        setCategories([
            { category_id: '1', category_name: 'News', parent_id: 0 },
            { category_id: '2', category_name: 'Sports', parent_id: 0 },
            { category_id: '3', category_name: 'Movies Action', parent_id: 0 }
        ]);
        const mockStreams = Array.from({ length: 300 }).map((_, i) => ({
            num: i,
            name: `${activeTab === 'live' ? 'Channel' : 'Movie'} ${i + 1} HD`,
            stream_type: activeTab,
            stream_id: 1000 + i,
            category_id: (i % 3 + 1).toString(),
            added: '123',
            stream_icon: `https://picsum.photos/300/200?random=${i}`,
            rating: (Math.random() * 5 + 5).toFixed(1)
        }));
        setStreams(mockStreams);
        setContentLoading(false);
      }, 1000);
      return;
    }

    try {
      const typeMap = {
        [ContentType.LIVE]: { stream: 'get_live_streams', cat: 'get_live_categories' },
        [ContentType.VOD]: { stream: 'get_vod_streams', cat: 'get_vod_categories' },
        [ContentType.SERIES]: { stream: 'get_series', cat: 'get_series_categories' }
      };
      
      const config = { 
          params: { 
              username: credentials.username, 
              password: credentials.password, 
          } 
      };

      const [catsRes, streamsRes] = await Promise.all([
          axios.get(`${credentials.url}/player_api.php`, { params: { ...config.params, action: typeMap[activeTab].cat } }),
          axios.get(`${credentials.url}/player_api.php`, { params: { ...config.params, action: typeMap[activeTab].stream } })
      ]);

      setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      setStreams(Array.isArray(streamsRes.data) ? streamsRes.data : []);
    } catch (err) {
      console.error(err);
      // Optional: Add toast error here
    } finally {
      setContentLoading(false);
    }
  }, [credentials, activeTab]);

  useEffect(() => {
    if (credentials) fetchData();
  }, [credentials, activeTab, fetchData]);

  // --- Filtering & Pagination Logic ---

  // 1. Filter ALL items based on search & category
  const filteredItems = useMemo(() => {
    if (!streams) return [];
    return streams.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [streams, selectedCategory, debouncedSearch]);

  // 2. Slice items for pagination (Infinite Scroll)
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page]);

  // 3. Handle Load More
  useEffect(() => {
    if (inView && visibleItems.length < filteredItems.length) {
      setPage(p => p + 1);
    }
  }, [inView, visibleItems.length, filteredItems.length]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, debouncedSearch]);

  const getStreamUrl = (item: StreamItem) => {
    if (credentials?.username === 'demo') return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    
    const ext = activeTab === ContentType.LIVE ? 'm3u8' : item.container_extension || 'mp4';
    const typePath = activeTab === ContentType.LIVE ? 'live' : activeTab === ContentType.VOD ? 'movie' : 'series';
    return `${credentials?.url}/${typePath}/${credentials?.username}/${credentials?.password}/${item.stream_id}.${ext}`;
  };

  if (!credentials) {
    return (
        <Login 
            onLogin={handleLogin} 
            loading={loginLoading} 
            error={loginError} 
            onDemo={() => handleLogin({ url: 'http://demo.xtream', username: 'demo', password: 'demo' })}
        />
    );
  }

  return (
    <div className="flex h-screen bg-brand-950 text-gray-100 overflow-hidden font-sans">
      
      {/* Player Modal */}
      {playingStream && (
        <Player 
          src={getStreamUrl(playingStream)}
          title={playingStream.name}
          onClose={() => setPlayingStream(null)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={cn("hidden md:flex flex-col bg-brand-900 border-l border-brand-800 transition-all duration-300", isSidebarOpen ? "w-64" : "w-20 items-center")}>
        <div className="p-6 flex items-center gap-3 border-b border-brand-800">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-blue-600 flex items-center justify-center shadow-lg shrink-0">
             <User className="text-white" size={20} />
           </div>
           {isSidebarOpen && (
               <div className="overflow-hidden animate-fade-in">
                 <h3 className="font-bold truncate text-sm">{credentials.username}</h3>
                 <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> متصل
                 </p>
               </div>
           )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
            {[
                { id: ContentType.LIVE, icon: Wifi, label: 'البث المباشر' },
                { id: ContentType.VOD, icon: Film, label: 'الأفلام' },
                { id: ContentType.SERIES, icon: Clapperboard, label: 'المسلسلات' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                        activeTab === item.id 
                            ? "bg-brand-accent text-white shadow-lg shadow-blue-900/20" 
                            : "text-gray-400 hover:bg-brand-800 hover:text-white"
                    )}
                >
                    <item.icon size={22} className={cn(!isSidebarOpen && "mx-auto")} />
                    {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-brand-800">
            <button 
                onClick={handleLogout}
                className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors", !isSidebarOpen && "justify-center")}
            >
                <LogOut size={22} />
                {isSidebarOpen && <span>تسجيل الخروج</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header */}
        <header className="bg-brand-900/80 backdrop-blur-md border-b border-brand-800 p-4 sticky top-0 z-30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="hidden md:block text-gray-400 hover:text-white">
                        <Filter size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-white">
                        {activeTab === ContentType.LIVE ? 'البث المباشر' : activeTab === ContentType.VOD ? 'مكتبة الأفلام' : 'المسلسلات'}
                    </h2>
                    <span className="bg-brand-800 text-xs px-2 py-1 rounded-md text-gray-400">
                        {filteredItems.length} عنصر
                    </span>
                </div>

                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="بحث عن قناة أو فيلم..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-950 border border-brand-700 text-white rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all text-sm"
                    />
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                </div>
            </div>

            {/* Category Pills (Horizontal Scroll) */}
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                        "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border",
                        selectedCategory === 'all'
                            ? "bg-brand-accent border-brand-accent text-white shadow-md"
                            : "bg-brand-900 border-brand-700 text-gray-400 hover:border-gray-500 hover:text-white"
                    )}
                >
                    الكل
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.category_id}
                        onClick={() => setSelectedCategory(cat.category_id)}
                        className={cn(
                            "whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border",
                            selectedCategory === cat.category_id
                                ? "bg-brand-accent border-brand-accent text-white shadow-md"
                                : "bg-brand-900 border-brand-700 text-gray-400 hover:border-gray-500 hover:text-white"
                        )}
                    >
                        {cat.category_name}
                    </button>
                ))}
            </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            {contentLoading && streams.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({length: 10}).map((_,i) => <StreamCardSkeleton key={i} />)}
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {visibleItems.map((stream) => (
                        <StreamCard 
                            key={stream.num} 
                            stream={stream} 
                            type={activeTab}
                            onClick={() => setPlayingStream(stream)}
                        />
                    ))}
                    
                    {/* Infinite Scroll Trigger */}
                    {visibleItems.length < filteredItems.length && (
                        <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center">
                             <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                    <div className="w-24 h-24 bg-brand-900 rounded-full flex items-center justify-center mb-4">
                         <Search size={40} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
                    <p className="text-sm">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
                    <button onClick={() => {setSearchTerm(''); setSelectedCategory('all');}} className="mt-6 px-6 py-2 bg-brand-800 rounded-lg text-white text-sm hover:bg-brand-700 transition-colors flex items-center gap-2">
                        <RefreshCw size={16} /> إعادة تعيين الفلاتر
                    </button>
                </div>
            )}
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden bg-brand-900 border-t border-brand-800 p-2 flex justify-around safe-area-bottom">
            {[
                { id: ContentType.LIVE, icon: Wifi, label: 'مباشر' },
                { id: ContentType.VOD, icon: Film, label: 'أفلام' },
                { id: ContentType.SERIES, icon: Clapperboard, label: 'مسلسلات' },
            ].map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                        "flex flex-col items-center p-2 rounded-lg w-16 transition-colors",
                        activeTab === item.id ? "text-brand-accent" : "text-gray-500"
                    )}
                >
                    <item.icon size={20} className={cn("mb-1", activeTab === item.id && "fill-current/20")} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
            <button onClick={handleLogout} className="flex flex-col items-center p-2 rounded-lg w-16 text-gray-500">
                <LogOut size={20} className="mb-1" />
                <span className="text-[10px] font-medium">خروج</span>
            </button>
        </div>

      </main>
    </div>
  );
}