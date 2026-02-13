import React, { useState } from 'react';
import { Tv, AlertCircle, User, Lock, Globe } from 'lucide-react';
import { UserCredentials } from './types';

interface LoginProps {
  onLogin: (creds: UserCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
  onDemo: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, loading, error, onDemo }) => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ url, username, password });
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4 relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-brand-950/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md bg-brand-900/60 border border-brand-700/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Tv className="w-10 h-10 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Xtream Player</h1>
          <p className="text-brand-600 text-sm">بوابتك للترفيه اللامحدود</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold mr-1">رابط السيرفر (Host URL)</label>
            <div className="relative">
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                <Globe size={18} />
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://example.com:8080"
                className="w-full bg-brand-950/50 border border-brand-700 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all dir-ltr"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold mr-1">اسم المستخدم</label>
            <div className="relative">
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-brand-950/50 border border-brand-700 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-gray-300 text-xs font-bold mr-1">كلمة المرور</label>
            <div className="relative">
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-950/50 border border-brand-700 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm animate-pulse">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-accentHover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الاتصال...
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
           <button 
              onClick={onDemo}
              className="text-gray-500 text-sm hover:text-white transition-colors border-b border-transparent hover:border-gray-500"
            >
              تجربة النسخة التجريبية (Demo Mode)
            </button>
        </div>
      </div>
    </div>
  );
};