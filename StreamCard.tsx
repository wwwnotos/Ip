import React from 'react';
import { Play, Tv, Film } from 'lucide-react';
import { StreamItem, ContentType } from './types';

interface StreamCardProps {
  stream: StreamItem;
  type: ContentType;
  onClick: () => void;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream, type, onClick }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div 
      onClick={onClick}
      className="group bg-brand-900 rounded-xl overflow-hidden cursor-pointer border border-brand-800 hover:border-brand-accent/50 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transform hover:-translate-y-1"
    >
      <div className="aspect-video relative bg-brand-950 overflow-hidden">
        {!imgError && stream.stream_icon ? (
          <img 
            src={stream.stream_icon} 
            alt={stream.name}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-brand-700 bg-brand-950">
             {type === ContentType.LIVE ? <Tv size={40} /> : <Film size={40} />}
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
          <div className="bg-brand-accent rounded-full p-3 shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} className="text-white fill-current ml-1" />
          </div>
        </div>
        
        {/* Rating Badge for Movies */}
        {stream.rating && stream.rating !== '0' && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-yellow-400 font-bold border border-white/10">
            ★ {stream.rating}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-200 truncate leading-tight" title={stream.name}>
          {stream.name}
        </h3>
        {type === ContentType.LIVE && (
             <p className="text-[10px] text-brand-500 mt-1">
               #{stream.num || stream.stream_id}
             </p>
        )}
      </div>
    </div>
  );
};

export const StreamCardSkeleton = () => (
    <div className="bg-brand-900 rounded-xl overflow-hidden border border-brand-800 animate-pulse">
        <div className="aspect-video bg-brand-800" />
        <div className="p-3 space-y-2">
            <div className="h-4 bg-brand-800 rounded w-3/4" />
            <div className="h-3 bg-brand-800 rounded w-1/4" />
        </div>
    </div>
);