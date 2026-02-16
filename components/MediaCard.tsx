import React, { useState, useEffect, useMemo } from 'react';
import { Star } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  variant?: 'poster' | 'featured' | 'landscape' | 'list';
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, variant = 'poster', className = '' }) => {
  
  const [imgSrc, setImgSrc] = useState(variant === 'landscape' ? item.backdropUrl : item.posterUrl);

  useEffect(() => {
     setImgSrc(variant === 'landscape' ? item.backdropUrl : item.posterUrl);
  }, [item.posterUrl, item.backdropUrl, variant]);

  const handleImgError = () => {
      setImgSrc('https://placehold.co/400x600/1a1a1a/ffffff?text=No+Image');
  };

  // Determine Badge (New Release / New Episode)
  const badge = useMemo(() => {
    if (!item.releaseDate) return null;
    const release = new Date(item.releaseDate);
    const now = new Date();
    const diffTime = now.getTime() - release.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Show badge if released within the last 45 days
    if (diffDays >= 0 && diffDays <= 45) {
        return item.type === 'movie' ? 'New Release' : 'New Episode';
    }
    return null;
  }, [item.releaseDate, item.type]);
  
  // Featured Card (Smooth edges, realistic shadow, white bottom container)
  if (variant === 'featured') {
    return (
      <div 
        className={`group relative flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-95 active:brightness-90 ${className}`}
        onClick={() => onClick(item)}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-card h-full flex flex-col border border-transparent dark:border-white/10">
          {/* Badge */}
          {badge && (
             <div className="absolute top-3 left-3 z-20 bg-[#007AFF] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wide border border-white/10 backdrop-blur-md">
                 {badge}
             </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-[3/4] w-full overflow-hidden">
             <img 
              src={imgSrc} 
              alt={item.title} 
              onError={handleImgError}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Info Container */}
          <div className="p-4 flex flex-col justify-center flex-1 relative">
             <h3 className="text-base font-bold text-black dark:text-white leading-tight mb-1.5 truncate">{item.title}</h3>
             
             <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.year} • {item.genre[0]}</p>
                
                {/* Rating Badge */}
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                    <Star size={10} className="text-yellow-600 dark:text-yellow-500 fill-yellow-600 dark:fill-yellow-500" />
                    <span className="text-xs font-bold text-yellow-800 dark:text-yellow-400">{item.rating.toFixed(1)}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // List View Variant (Horizontal)
  if (variant === 'list') {
    return (
      <div 
        className={`group relative w-full cursor-pointer transition-all duration-300 active:scale-[0.98] ${className}`}
        onClick={() => onClick(item)}
      >
        <div className="flex bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-white/50 dark:border-white/10 items-center gap-4">
           {/* Small Poster */}
           <div className="relative w-16 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-800">
              <img 
                src={imgSrc} 
                alt={item.title} 
                onError={handleImgError}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {badge && (
                <div className="absolute top-0 left-0 w-full bg-[#007AFF]/90 text-white text-[8px] font-bold text-center py-0.5">
                   NEW
                </div>
              )}
           </div>

           {/* Info */}
           <div className="flex-1 min-w-0 flex flex-col gap-1">
              <h3 className="text-base font-bold text-black dark:text-white truncate">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                 <span>{item.year}</span>
                 <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                 <span>{item.genre[0]}</span>
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.rating.toFixed(1)}</span>
                  {item.appRating && (
                    <>
                       <span className="text-gray-300 dark:text-gray-600 mx-1">|</span>
                       <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.appRating} User</span>
                    </>
                  )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Standard Poster (Grid View) - Clean rounded corners
  return (
    <div 
      className={`group relative flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-90 active:brightness-75 rounded-2xl ${className}`}
      onClick={() => onClick(item)}
    >
      <div className={`relative overflow-hidden rounded-2xl shadow-md bg-gray-200 dark:bg-gray-800 ${variant === 'landscape' ? 'aspect-[16/9]' : 'aspect-[2/3]'}`}>
        
        {/* Badge */}
        {badge && (
            <div className="absolute top-2 left-2 z-10 bg-[#007AFF] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md uppercase tracking-wide border border-white/10 backdrop-blur-md">
                {badge}
            </div>
        )}

        <img 
          src={imgSrc} 
          alt={item.title} 
          onError={handleImgError}
          className="h-full w-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>
      
      {variant === 'landscape' && (
         <div className="mt-2">
            <h3 className="text-black dark:text-white font-bold text-sm truncate">{item.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">{item.year}</p>
         </div>
      )}
    </div>
  );
};

export default React.memo(MediaCard);