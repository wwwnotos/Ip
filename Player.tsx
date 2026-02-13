import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface PlayerProps {
  src: string;
  title: string;
  onClose: () => void;
}

export const Player: React.FC<PlayerProps> = ({ src, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setError(null);
    setLoading(true);

    const handleLoaded = () => setLoading(false);
    const handleError = (_: any, data: any) => {
        if (data.fatal) {
            setLoading(false);
            setError("تعذر تشغيل الفيديو. تحقق من المصدر.");
        }
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.FRAG_LOADED, handleLoaded); // Approximate loaded state
      hls.on(Hls.Events.ERROR, handleError);
      
      // Fallback if frag loaded doesn't fire immediately (audio only etc)
      video.addEventListener('playing', handleLoaded);
      video.addEventListener('waiting', () => setLoading(true));

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
      video.addEventListener('playing', handleLoaded);
      video.addEventListener('error', () => {
          setLoading(false);
          setError("مشغل المتصفح الافتراضي واجه خطأ.");
      });
    } else {
      setLoading(false);
      setError("المتصفح لا يدعم هذا التنسيق.");
    }

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('playing', handleLoaded);
      video.removeEventListener('waiting', () => setLoading(true));
    };
  }, [src]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
      {/* Custom Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
             <h2 className="text-white font-bold text-lg drop-shadow-md">{title}</h2>
        </div>
        <button 
          onClick={onClose}
          className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition-all hover:scale-110"
        >
          <X size={24} />
        </button>
      </div>

      {/* Loading State */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
             <Loader2 size={48} className="text-brand-accent animate-spin" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <p className="text-white text-lg font-bold">{error}</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-brand-700 rounded-lg text-white hover:bg-brand-600">
            إغلاق
          </button>
        </div>
      )}

      <video 
        ref={videoRef}
        controls 
        className="w-full h-full object-contain bg-black"
        playsInline
      />
    </div>
  );
};