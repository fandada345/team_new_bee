import { User, Bell, Shield, Database, Palette, Moon, ToggleLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SettingItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  type: 'toggle' | 'link' | 'select';
  value?: boolean;
}

const settingSections = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: <User size={16} />, label: 'Profile', description: 'Manage your personal information', type: 'link' },
      { id: 'security', icon: <Shield size={16} />, label: 'Security', description: 'Password and authentication settings', type: 'link' },
    ] as SettingItem[],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', icon: <Bell size={16} />, label: 'Notifications', description: 'Email and push notification preferences', type: 'toggle', value: true },
      { id: 'darkmode', icon: <Moon size={16} />, label: 'Dark Mode', description: 'Always use dark theme', type: 'toggle', value: true },
      { id: 'theme', icon: <Palette size={16} />, label: 'Theme Color', description: 'Customize accent color', type: 'select' },
    ] as SettingItem[],
  },
  {
    title: 'Data',
    items: [
      { id: 'storage', icon: <Database size={16} />, label: 'Data Storage', description: 'Manage uploaded files and cache', type: 'link' },
      { id: 'export', icon: <ToggleLeft size={16} />, label: 'Auto Export', description: 'Automatically export monthly reports', type: 'toggle', value: false },
    ] as SettingItem[],
  },
];

export function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notifications: true,
    darkmode: true,
    export: false,
  });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>Settings</h1>
        <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your account and application preferences</p>
      </div>

      {/* User Profile Card */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', marginBottom: '24px', animationDelay: '60ms', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--surface-tertiary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, fontFamily: 'Geist', color: 'var(--text-primary)' }}>
          JD
        </div>
        <div>
          <p className="font-geist" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>John Doe</p>
          <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>john.doe@university.edu</p>
          <p className="font-geist" style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Free Plan &middot; 3 files uploaded</p>
        </div>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section, si) => (
        <div key={section.title} className="fade-up" style={{ marginBottom: '24px', animationDelay: `${120 + si * 60}ms` }}>
          <h2 className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '4px' }}>{section.title}</h2>
          <div style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            {section.items.map((item, ii) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 20px',
                  borderBottom: ii < section.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: item.type === 'link' ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (item.type === 'link') e.currentTarget.style.background = 'var(--surface-secondary)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <p className="font-geist" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{item.description}</p>
                </div>
                {item.type === 'toggle' && (
                  <button
                    onClick={() => setToggles(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    style={{
                      width: '40px',
                      height: '22px',
                      borderRadius: '11px',
                      border: 'none',
                      background: toggles[item.id] ? 'var(--chart-emerald)' : 'var(--surface-tertiary)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--text-primary)',
                      position: 'absolute',
                      top: '3px',
                      left: toggles[item.id] ? '20px' : '4px',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                )}
                {item.type === 'link' && <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
                {item.type === 'select' && (
                  <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--surface-secondary)', borderRadius: '4px', padding: '3px 10px' }}>Blue</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="fade-up" style={{ textAlign: 'center', padding: '24px', animationDelay: '400ms' }}>
        <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Spend Insight AI v1.0.0 &middot; University Project Demo</p>
      </div>
    </div>
  );
}
