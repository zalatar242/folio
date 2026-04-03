'use client';

interface SidebarProps {
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'portfolio', label: 'Portfolio', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'spend', label: 'Send', icon: 'M12 2a10 10 0 110 20 10 10 0 010-20zm0 4v12m3-8.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5' },
  { id: 'notes', label: 'Notes', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
];

export default function Sidebar({ activeTab, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-[220px] border-r px-4 py-8 gap-1"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-8 px-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--accent)', color: '#000' }}>F</div>
        <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Folio</span>
      </div>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: activeTab === item.id ? 'var(--accent-muted)' : 'transparent',
            color: activeTab === item.id ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d={item.icon} />
          </svg>
          {item.label}
        </button>
      ))}

      <div className="mt-auto px-3">
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            S
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Demo User</div>
            <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Testnet</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
