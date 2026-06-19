import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Shield, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rtl min-h-screen flex items-center justify-center bg-[#0b0f19] relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 glass-panel shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 text-indigo-400">
            <Shield size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-l from-indigo-400 to-sky-400 bg-clip-text text-transparent">
            أشعتك | لوحة التحكم
          </h1>
          <p className="text-sm text-[#94a3b8]">المنصة الطبية المتكاملة للأشعة والتحاليل المنزلية</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm animate-shake">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-[#94a3b8] mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
              <input
                type="email"
                required
                className="w-full pr-12 pl-4 py-3 bg-[#0d1324] border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                placeholder="admin@scango.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-[#94a3b8] mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
              <input
                type="password"
                required
                className="w-full pr-12 pl-4 py-3 bg-[#0d1324] border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-l from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-55"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <span>دخول لوحة التحكم</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
