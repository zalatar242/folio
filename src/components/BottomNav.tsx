'use client';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'portfolio', label: 'Portfolio', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'spend', label: 'Send', icon: 'M12 2a10 10 0 110 20 10 10 0 010-20zm0 4v12m3-8.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5' },
  { id: 'notes', label: 'Notes', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8' },
];

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors"
          style={{
            color: activeTab === item.id ? 'var(--accent)' : 'var(--text-tertiary)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d={item.icon} />
          </svg>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
