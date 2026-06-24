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
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/orders', label: 'Orders', icon: Activity },
    { path: '/technicians', label: 'Technicians', icon: UserCheck },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/services', label: 'Services & Pricing', icon: Settings },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <div className="sidebar-logo-container">
            <div className="sidebar-logo">
              SG
            </div>
            <div>
              <div className="sidebar-brand-name">
                ScanGo
              </div>
              <div className="sidebar-brand-sub">
                Admin Dashboard
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar-wrapper">
              <div className="sidebar-avatar">
                <User size={16} />
              </div>
              <span className="sidebar-avatar-status" />
            </div>
            <div>
              <div className="sidebar-user-name">
                {adminUser.name || 'Admin User'}
              </div>
              <div className="sidebar-user-role">
                {adminUser.role === 'super_admin' ? 'Super Admin' : 'Support'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-danger"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '8px',
              fontSize: '13px',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="main-content">
        {/* Header */}
        <header className="header-bar">
          <h2 className="header-title">
            {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
