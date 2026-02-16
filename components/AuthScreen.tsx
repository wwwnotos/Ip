
import React, { useState } from 'react';
import { APP_LOGO } from '../constants';
import { Link2, User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { xtreamService } from '../services/xtreamService';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    url: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await xtreamService.login(formData.url, formData.username, formData.password);
      const user: UserType = {
        name: data.user_info.username,
        email: formData.url,
        joined: new Date().getFullYear().toString(),
        account: {
          username: formData.username,
          password: formData.password,
          url: formData.url.endsWith('/') ? formData.url.slice(0, -1) : formData.url,
          status: data.user_info.status,
          exp_date: new Date(parseInt(data.user_info.exp_date) * 1000).toLocaleDateString(),
          max_connections: data.user_info.max_connections,
          active_connections: data.user_info.active_connections
        }
      };
      localStorage.setItem('MOVOS_USER', JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err: any) {
      setError('خطأ في البيانات أو السيرفر');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background dark:bg-black flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
           <img src={APP_LOGO} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
           <h1 className="text-3xl font-extrabold text-black dark:text-white">تسجيل الدخول Xtream</h1>
           <p className="text-gray-500 mt-2">أدخل بيانات اشتراكك للمتابعة</p>
        </div>

        <div className="glass-nav p-8 rounded-[40px] shadow-float">
           {error && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle size={18} /> {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 mr-4">رابط السيرفر (Host URL)</label>
                 <div className="relative">
                    <Link2 className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-secondary dark:bg-dark-secondary text-black dark:text-white p-4 pr-14 rounded-3xl outline-none" placeholder="http://example.com:8080" />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 mr-4">اسم المستخدم</label>
                 <div className="relative">
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-secondary dark:bg-dark-secondary text-black dark:text-white p-4 pr-14 rounded-3xl outline-none" placeholder="Username" />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-500 mr-4">كلمة المرور</label>
                 <div className="relative">
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-secondary dark:bg-dark-secondary text-black dark:text-white p-4 pr-14 rounded-3xl outline-none" placeholder="••••••••" />
                 </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-4 rounded-3xl shadow-lg flex items-center justify-center gap-2 mt-6">
                {isLoading ? <Loader2 className="animate-spin" /> : <>دخول <ArrowRight size={20} className="rotate-180" /></>}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
