import { Sun, Moon, Settings } from 'lucide-react';

export default function Header({ entryCount, tagCount, onOpenSettings, theme, onToggleTheme }) {
  return (
    <header>
      <div className="logo">
        <h1>The Biological<br /><span className="logo-accent">Sandbox</span></h1>
      </div>
      <div className="header-actions">
        <button 
          className="icon-btn-minimal" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
        </button>
        <button className="icon-btn-minimal" onClick={onOpenSettings} title="Settings">
          <Settings size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
