import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MediaCard from './components/MediaCard';
import DetailModal from './components/DetailModal';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import { MediaItem, ViewState, User, Category } from './types';
import { xtreamService } from './services/xtreamService';
import { Search, Loader2, Heart, History, RefreshCw, Database } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'auth' | 'app'>('splash');
  const [activeTab, setActiveTab] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [history, setHistory] = useState<MediaItem[]>([]);
  
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
    <div className="fixed inset-0 bg-black text-white flex flex-col app-container overflow-hidden select-none" dir="rtl">
      {/* Native Header with Safe Area Top */}
      <header className="pt-[env(safe-area-inset-top)] px-6 pb-4 shrink-0 glass-morphism z-50">
        <div className="flex justify-between items-center h-14">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tighter">MOVOS</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] uppercase font-bold text-gray-400">Pro Connected</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <RefreshCw size={18} className="text-primary" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-32">
        {(activeTab === 'live' || activeTab === 'movies' || activeTab === 'series') && (
          <div className="px-5 space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={`بحث سريع...`} 
                className="w-full bg-white/5 border border-white/10 p-4 pr-12 rounded-2xl outline-none text-sm font-bold focus:border-primary/50 transition-colors" 
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button 
                onClick={() => setSelectedCat(null)}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-xs transition-all ${!selectedCat ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
              >
                الكل
              </button>
              {(activeTab === 'live' ? liveCats : activeTab === 'movies' ? movieCats : seriesCats).map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-bold text-xs transition-all ${selectedCat === cat.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loadingStreams ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-xs text-gray-500 font-bold">جاري تحميل القائمة...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-10">
                {filteredStreams.map(item => <MediaCard key={item.id} item={item} onClick={handleMediaClick} variant="poster" />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'home' && (
          <div className="px-5 space-y-8">
            <section>
              <h2 className="text-lg font-black mb-4 flex items-center gap-2"><History className="text-primary" size={20} /> واصل المشاهدة</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {history.length > 0 ? history.map(item => (
                  <div key={`hist-${item.id}`} className="w-32 shrink-0">
                    <MediaCard item={item} onClick={handleMediaClick} variant="poster" />
                  </div>
                )) : <div className="bg-white/5 p-4 rounded-2xl text-gray-500 text-xs text-center w-full">لا يوجد سجل حالياً</div>}
              </div>
            </section>
            
            <section>
              <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Heart className="text-red-500" size={20} /> قائمتي المفضلة</h2>
              <div className="grid grid-cols-2 gap-3">
                {favorites.length > 0 ? favorites.map(item => <MediaCard key={`fav-${item.id}`} item={item} onClick={handleMediaClick} variant="poster" />) : <div className="col-span-2 bg-white/5 p-4 rounded-2xl text-gray-500 text-xs text-center">أضف أفلامك المفضلة لتظهر هنا</div>}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="px-5">
             <div className="bg-gradient-to-br from-primary/20 to-transparent p-8 rounded-[32px] border border-white/10 text-center mb-6">
                <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black shadow-glow">{user?.name.charAt(0)}</div>
                <h2 className="text-xl font-black">{user?.name}</h2>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-500 text-[10px] rounded-full font-bold mt-2 uppercase tracking-widest">{user?.account?.status}</span>
             </div>
             <div className="space-y-3">
                <button onClick={() => { localStorage.removeItem('MOVOS_USER'); setAppState('auth'); }} className="w-full bg-red-500/10 text-red-500 p-5 rounded-3xl font-bold active:scale-95 transition-transform">تسجيل الخروج</button>
             </div>
          </div>
        )}
      </main>

      {/* Native Bottom Navbar */}
      <Navbar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedCat(null); setSearchQuery(''); }} isVisible={!isModalOpen} />

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