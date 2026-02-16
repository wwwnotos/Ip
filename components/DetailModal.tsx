
import React, { useState } from 'react';
import { X, Play, Heart, ChevronLeft, Loader2, ExternalLink, Users, Star, Tv } from 'lucide-react';
import { MediaItem } from '../types';

interface DetailModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (item: MediaItem) => void;
  isFavorite: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ item, isOpen, onClose, onToggleFavorite, isFavorite }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  if (!isOpen || !item) return null;

  return (
    <>
      {showPlayer && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
             <button onClick={() => setShowPlayer(false)} className="absolute top-8 right-8 text-white z-50 p-2 bg-white/10 rounded-full"><X size={32} /></button>
             <video src={item.streamUrl} controls autoPlay className="w-full h-full object-contain" poster={item.backdropUrl} />
        </div>
      )}

      {showTrailer && item.trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <button onClick={() => setShowTrailer(false)} className="absolute top-8 right-8 text-white z-50 p-2 bg-white/10 rounded-full"><X size={32} /></button>
            <iframe src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1`} className="w-full h-full" allowFullScreen />
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-end justify-center" dir="rtl">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full h-[95vh] bg-surface dark:bg-dark-surface rounded-t-[40px] overflow-hidden animate-spring-up flex flex-col md:max-w-2xl">
          <div className="relative h-[45%] w-full shrink-0">
            <img src={item.posterUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-surface dark:to-dark-surface" />
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <button onClick={onClose} className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-white"><ChevronLeft size={32} className="rotate-180" /></button>
              <button onClick={() => onToggleFavorite(item)} className={`glass-button w-12 h-12 rounded-full flex items-center justify-center ${isFavorite ? 'text-red-500' : 'text-white'}`}><Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} /></button>
            </div>
          </div>

          <div className="relative -mt-10 flex-1 bg-surface dark:bg-dark-surface rounded-t-[40px] px-8 pt-10 pb-10 overflow-y-auto no-scrollbar">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              
              <div className="text-center mb-8">
                  <h1 className="text-3xl font-extrabold text-black dark:text-white mb-2">{item.title}</h1>
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                      <span>{item.year}</span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      <span>{item.type === 'movie' ? 'فلم' : item.type === 'tv' ? 'مسلسل' : 'قناة'}</span>
                  </div>
              </div>

              <div className="flex gap-4 mb-8">
                  <button onClick={() => setShowPlayer(true)} className="flex-1 bg-primary text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 shadow-lg active:scale-95">
                      <Play size={20} fill="currentColor" /> مشاهدة الآن
                  </button>
                  {item.type !== 'live' && (
                    <button onClick={() => setShowTrailer(true)} className="flex-1 bg-secondary dark:bg-dark-secondary text-black dark:text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 active:scale-95">
                        <Tv size={20} /> الإعلان
                    </button>
                  )}
              </div>

              <div className="space-y-6">
                  <h3 className="text-xl font-bold">القصة</h3>
                  <p className="text-gray-500 leading-relaxed text-lg">{item.description}</p>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailModal;
