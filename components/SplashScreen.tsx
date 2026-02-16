import React from 'react';
import { APP_LOGO } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center animate-out fade-out duration-700 delay-[2500ms] fill-mode-forwards">
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Pulse Effect */}
        <div className="relative w-32 h-32 mb-6">
           <div className="absolute inset-0 bg-[#007AFF] blur-[40px] opacity-30 animate-pulse rounded-full" />
           <img 
             src={APP_LOGO} 
             alt="MOVOS Logo" 
             className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-[springUp_1s_ease-out_forwards]"
           />
        </div>

        {/* Text Animation */}
        <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] animate-[fadeIn_0.8s_ease-out_0.5s_both]">
          MOVOS
        </h1>
        <p className="mt-2 text-gray-400 text-xs font-medium tracking-[0.2em] uppercase animate-[fadeIn_0.8s_ease-out_0.8s_both]">
          Cinematic Experience
        </p>
      </div>

      {/* Loading Indicator at Bottom */}
      <div className="absolute bottom-12 w-12 h-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;