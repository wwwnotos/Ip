
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import MediaCard from './components/MediaCard';
import DetailModal from './components/DetailModal';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import { MediaItem, ViewState, User, Category } from './types';
import { xtreamService } from './services/xtreamService';
import { Search, Loader2, Heart, Settings, ChevronLeft, ChevronRight, X, User as UserIcon, LogOut, History, Shield, Info, RefreshCw, Database } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'app'>('splash');
  const [activeTab, setActiveTab] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<MediaItem[]>([]);
  
  // Data State
  const [liveCats, setLiveCats] = useState<Category[]>([]);
  const [movieCats, setMovieCats] = useState<Category[]>([]);
  const [seriesCats, setSeriesCats] = useState<Category[]>([]);
  const [currentStreams, setCurrentStreams] = useState<MediaItem[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  
  const [profileView, setProfileView] = useState<'main' | 'settings' | 'favorites'>('main');

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('MOVOS_USER');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setAppState('app');
        loadInitialData(u);
      } else {
        setAppState('auth');
      }
    }, 2800);
    
    const favs = localStorage.getItem('MOVOS_FAVS');
    if (favs) setFavorites(JSON.parse(favs));

    const hist = localStorage.getItem('MOVOS_HISTORY');
    if (hist) setHistory(JSON.parse(hist));

    return () => clearTimeout(timer);
  }, []);

  const loadInitialData = async (u: User) => {
    if (!u.account) return;
    try {
      const [lc, mc, sc] = await Promise.all([
        xtreamService.getCategories(u.account, 'get_live_categories'),
        xtreamService.getCategories(u.account, 'get_vod_categories'),
        xtreamService.getCategories(u.account, 'get_series_categories')
      ]);
      setLiveCats(lc);
      setMovieCats(mc);
      setSeriesCats(sc);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStreams = async (type: 'live' | 'movie' | 'tv', catId?: string) => {
    if (!user?.account) return;
    setLoadingStreams(true);
    try {
      const action = type === 'live' ? 'get_live_streams' : type === 'movie' ? 'get_vod_streams' : 'get_series';
      const data = await xtreamService.getStreams(user.account, action, catId);
      const mapped = data.map(item => xtreamService.mapToMediaItem(item, type, user.account!));
      setCurrentStreams(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStreams(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
       // Just clear streams for home to show static trending? Or fetch first cat?
       setCurrentStreams([]);
    } else if (activeTab === 'live') {
       loadStreams('live', selectedCat || undefined);
    } else if (activeTab === 'movies') {
       loadStreams('movie', selectedCat || undefined);
    } else if (activeTab === 'series') {
       loadStreams('tv', selectedCat || undefined);
    }
  }, [activeTab, selectedCat]);

  const toggleFavorite = (item: MediaItem) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      const updated = exists ? prev.filter(f => f.id !== item.id) : [...prev, item];
      localStorage.setItem('MOVOS_FAVS', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
    setIsModalOpen(true);
    setHistory(prev => {
      const updated = [item, ...prev.filter(i => i.id !== item.id)].slice(0, 20);
      localStorage.setItem('MOVOS_HISTORY', JSON.stringify(updated));
      return updated;
    });
  };

  if (appState === 'splash') return <SplashScreen />;
  if (appState === 'auth') return <AuthScreen onAuthSuccess={(u) => { setUser(u); setAppState('app'); loadInitialData(u); }} />;

  const filteredStreams = currentStreams.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen bg-background dark:bg-black text-black dark:text-white font-sans transition-colors ${isDarkMode ? 'dark' : ''}`} dir="rtl">
      <main className="max-w-4xl mx-auto h-screen flex flex-col">
        
        {/* Top Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-background/80 dark:bg-black/80 backdrop-blur-md z-40 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tighter">MOVOS</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">XSTREAM PLAYER</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-10 h-10 rounded-full bg-secondary dark:bg-dark-secondary flex items-center justify-center">
              {isDarkMode ? <RefreshCw size={18} /> : <Database size={18} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
          
          {(activeTab === 'live' || activeTab === 'movies' || activeTab === 'series') && (
            <div className="px-6 space-y-4 pt-2">
               {/* Search Bar - Per Category */}
               <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder={`بحث في ال${activeTab === 'live' ? 'قنوات' : activeTab === 'movies' ? 'أفلام' : 'مسلسلات'}...`} 
                    className="w-full bg-secondary dark:bg-dark-secondary p-4 pr-12 rounded-2xl outline-none text-sm font-bold" 
                  />
               </div>

               {/* Categories Scroll */}
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => setSelectedCat(null)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-xs border transition-all ${!selectedCat ? 'bg-primary border-primary text-white' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
                  >
                    الكل
                  </button>
                  {(activeTab === 'live' ? liveCats : activeTab === 'movies' ? movieCats : seriesCats).map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCat(cat.id)}
                      className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-xs border transition-all ${selectedCat === cat.id ? 'bg-primary border-primary text-white' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
               </div>

               {loadingStreams ? (
                 <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredStreams.map(item => <MediaCard key={item.id} item={item} onClick={handleMediaClick} variant="poster" />)}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'home' && (
            <div className="px-6 space-y-8 pt-4">
               <section>
                  <h2 className="text-xl font-black mb-4 flex items-center gap-2"><History className="text-primary" size={20} /> واصل المشاهدة</h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {history.length > 0 ? history.map(item => <MediaCard key={`hist-${item.id}`} item={item} onClick={handleMediaClick} variant="poster" className="w-[140px] shrink-0" />) : <div className="text-gray-500 text-xs italic">لا توجد سجلات مشاهدة حالياً</div>}
                  </div>
               </section>
               <section>
                  <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Heart className="text-red-500" size={20} /> المفضلة</h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {favorites.length > 0 ? favorites.map(item => <MediaCard key={`fav-${item.id}`} item={item} onClick={handleMediaClick} variant="poster" className="w-[140px] shrink-0" />) : <div className="text-gray-500 text-xs italic">قائمة المفضلة فارغة</div>}
                  </div>
               </section>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="px-6 pt-6">
              {profileView === 'main' && (
                <div className="space-y-6">
                   <div className="bg-primary/10 p-8 rounded-[40px] border border-primary/20 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -z-10 animate-pulse" />
                      <div className="w-24 h-24 bg-primary text-white text-4xl font-black flex items-center justify-center rounded-full mx-auto mb-4 border-4 border-white shadow-xl">{user?.name.charAt(0)}</div>
                      <h2 className="text-2xl font-black">{user?.name}</h2>
                      <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">{user?.account?.status}</p>
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                      <button onClick={() => setProfileView('favorites')} className="w-full bg-secondary dark:bg-dark-secondary p-5 rounded-3xl flex items-center justify-between font-bold">
                         <div className="flex items-center gap-3"><Heart className="text-red-500" size={20} /> المفضلة</div>
                         <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => setProfileView('settings')} className="w-full bg-secondary dark:bg-dark-secondary p-5 rounded-3xl flex items-center justify-between font-bold">
                         <div className="flex items-center gap-3"><Settings className="text-blue-500" size={20} /> إعدادات المشغل والحساب</div>
                         <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => { localStorage.removeItem('MOVOS_USER'); setAppState('auth'); }} className="w-full bg-red-500/10 text-red-500 p-5 rounded-3xl flex items-center justify-center gap-2 font-bold">
                         <LogOut size={20} /> تسجيل الخروج
                      </button>
                   </div>
                </div>
              )}

              {profileView === 'favorites' && (
                <div className="animate-in slide-in-from-right duration-300">
                   <header className="flex items-center gap-4 mb-6"><button onClick={() => setProfileView('main')} className="p-2 bg-secondary rounded-full"><ChevronRight size={20} /></button><h2 className="text-2xl font-black">قائمتي المفضلة</h2></header>
                   <div className="grid grid-cols-2 gap-4">
                      {favorites.map(item => <MediaCard key={item.id} item={item} onClick={handleMediaClick} variant="poster" />)}
                   </div>
                </div>
              )}

              {profileView === 'settings' && (
                <div className="animate-in slide-in-from-right duration-300">
                   <header className="flex items-center gap-4 mb-6"><button onClick={() => setProfileView('main')} className="p-2 bg-secondary rounded-full"><ChevronRight size={20} /></button><h2 className="text-2xl font-black">إعدادات IPTV</h2></header>
                   <div className="space-y-4">
                      <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-[32px] space-y-4">
                         <h3 className="font-black text-primary border-b border-gray-200 dark:border-gray-800 pb-2">تفاصيل الاشتراك</h3>
                         <div className="flex justify-between text-sm font-bold"><span>تاريخ الانتهاء</span><span className="text-primary">{user?.account?.exp_date}</span></div>
                         <div className="flex justify-between text-sm font-bold"><span>أقصى اتصالات</span><span className="text-primary">{user?.account?.max_connections}</span></div>
                         <div className="flex justify-between text-sm font-bold"><span>الاتصالات النشطة</span><span className="text-primary">{user?.account?.active_connections}</span></div>
                      </div>
                      
                      <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-[32px] space-y-4">
                         <h3 className="font-black text-primary border-b border-gray-200 dark:border-gray-800 pb-2">إعدادات المشغل</h3>
                         <div className="flex justify-between items-center font-bold"><span>التشغيل التلقائي</span><button className="w-12 h-6 bg-primary rounded-full relative"><div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" /></button></div>
                         <div className="flex justify-between items-center font-bold"><span>جودة الفيديو الافتراضية</span><span className="text-primary text-xs">تلقائي (Adaptive)</span></div>
                         <div className="flex justify-between items-center font-bold"><span>فك التشفير (Decoder)</span><span className="text-primary text-xs">HardWare</span></div>
                      </div>

                      <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-[32px] space-y-2">
                         <button className="w-full flex items-center gap-3 font-bold py-2"><Shield size={18} /> سياسة الخصوصية</button>
                         <button className="w-full flex items-center gap-3 font-bold py-2"><Info size={18} /> حول التطبيق</button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Navbar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setProfileView('main'); setSelectedCat(null); setSearchQuery(''); }} isVisible={!isModalOpen} />
      </main>

      <DetailModal 
        isOpen={isModalOpen} 
        item={selectedMedia} 
        onClose={() => setIsModalOpen(false)} 
        onToggleFavorite={toggleFavorite} 
        isFavorite={selectedMedia ? favorites.some(f => f.id === selectedMedia.id) : false} 
      />
    </div>
  );
};

export default App;
