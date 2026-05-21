import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Upload', path: '/upload' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(9, 9, 11, 0.70)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="font-geist"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Spend Insight AI
        </button>
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="font-geist"
                style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5"
          style={{
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            width: '240px',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span
            className="font-geist"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Search transactions...
          </span>
        </div>
        <button
          className="flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <Bell size={16} />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center font-geist"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--surface-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          JD
        </button>
      </div>
    </nav>
  );
}
