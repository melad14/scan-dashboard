import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Users,
  UserCheck,
  Settings,
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const menuItems = [
    { path: '/', label: 'الرئيسية', icon: LayoutDashboard },
    { path: '/orders', label: 'الطلبات الطبية', icon: Activity },
    { path: '/technicians', label: 'إدارة الفنيين', icon: UserCheck },
    { path: '/patients', label: 'سجل المرضى', icon: Users },
    { path: '/services', label: 'الخدمات والتسعير', icon: Settings },
    { path: '/analytics', label: 'التقارير والتحليلات', icon: TrendingUp }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div className="rtl min-h-screen flex bg-[#0b0f19] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1324] border-l border-white/5 flex flex-col justify-between fixed top-0 bottom-0 right-0 z-20">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/5 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
              أ
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-l from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              أشعتك لخدمات المنزل
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-l from-indigo-600/25 to-sky-600/25 border border-indigo-500/20 text-indigo-400 font-semibold'
                      : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#94a3b8] border border-white/5">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">{adminUser.name || 'مدير النظام'}</span>
              <span className="text-xs text-[#64748b]">
                {adminUser.role === 'super_admin' ? 'مدير عام' : 'دعم فني'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all font-semibold"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 mr-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-[#0d1324]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold bg-gradient-to-l from-white to-[#94a3b8] bg-clip-text text-transparent">
            {menuItems.find((item) => item.path === location.pathname)?.label || 'لوحة التحكم'}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#94a3b8] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              التاريخ المحلي: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1 flex flex-col gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
