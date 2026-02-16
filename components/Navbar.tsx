
import React, { useMemo } from 'react';
import { Compass, Tv, Film, PlaySquare, UserCircle } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  activeTab: ViewState;
  onTabChange: (tab: ViewState) => void;
  isVisible?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, isVisible = true }) => {
  const navItems = [
    { id: 'home', icon: Compass, label: 'الرئيسية' },
    { id: 'live', icon: Tv, label: 'قنوات' },
    { id: 'movies', icon: Film, label: 'أفلام' },
    { id: 'series', icon: PlaySquare, label: 'مسلسلات' },
    { id: 'profile', icon: UserCircle, label: 'الملف' },
  ];

  const activeIndex = useMemo(() => 
    navItems.findIndex(item => item.id === activeTab), 
    [activeTab]
  );

  return (
    <div 
      className={`fixed bottom-6 pb-safe left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0'
      }`}
    >
      <div className="glass-nav pointer-events-auto relative flex items-center p-2 rounded-[32px] shadow-float w-[92%] max-w-[450px]">
        <div 
          className="absolute top-2 bottom-2 rounded-[24px] z-0 bg-primary/10 border border-primary/20"
          style={{
            width: 'calc((100% - 16px) / 5)',
            left: '8px',
            transform: `translateX(calc(100% * ${activeIndex}))`,
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />

        <div className="grid grid-cols-5 w-full relative z-10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as ViewState)}
                className={`flex flex-col items-center justify-center py-3 transition-all ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Navbar);
