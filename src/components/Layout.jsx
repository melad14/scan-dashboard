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
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 20,
        }}
      >
        <div>
          {/* Logo */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--brand-primary)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '14px',
                color: '#fff',
              }}
            >
              SG
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                ScanGo
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Admin Dashboard
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease',
                    backgroundColor: isActive ? 'rgba(29, 158, 117, 0.1)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              <User size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {adminUser.name || 'Admin User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
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
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-sidebar)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
