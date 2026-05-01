import { useState, useEffect } from 'react';

interface TabItem {
  id: string;
  name: string;
}

interface TitleBarProps {
  tabs: TabItem[];
  onSelectTab: (tabId: string) => void;
}

export default function TitleBar({ tabs, onSelectTab }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.api.invoke('window:isMaximized');
      setIsMaximized(maximized);
    };
    checkMaximized();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tab-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMinimize = () => {
    window.api.invoke('window:minimize');
  };

  const handleMaximize = async () => {
    await window.api.invoke('window:maximize');
    const maximized = await window.api.invoke('window:isMaximized');
    setIsMaximized(maximized);
  };

  const handleClose = () => {
    window.api.invoke('window:close');
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setShowMenu(false);
  };

  return (
    <div style={{
      height: 28,
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      userSelect: 'none',
      borderBottom: '1px solid #333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, WebkitAppRegion: 'drag' } as any}>
        <span style={{ fontSize: 12, color: '#888' }}>Agentic IDE</span>
        
        <div style={{ position: 'relative', WebkitAppRegion: 'no-drag' } as any}>
          <button 
            onClick={handleMenuClick}
            style={{ 
              background: 'transparent', 
              border: 'none',
              padding: '2px 6px',
              cursor: 'pointer',
              color: showMenu ? '#fff' : '#666',
              fontSize: 14
            }}
            title="All tabs"
          >
            ☰
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: 24,
              left: 0,
              background: '#252526',
              border: '1px solid #404040',
              borderRadius: 4,
              minWidth: 140,
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }} className="tab-menu">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: '#cccccc',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', WebkitAppRegion: 'no-drag' } as any}>
        <button 
          onClick={handleMinimize}
          style={{ 
            padding: '0 10px', 
            background: 'transparent', 
            border: 'none',
            borderRadius: 0,
            height: 28,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12
          }}
          title="Minimize"
        >
          ─
        </button>
        <button 
          onClick={handleMaximize}
          style={{ 
            padding: '0 10px', 
            background: 'transparent', 
            border: 'none',
            borderRadius: 0,
            height: 28,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12
          }}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button 
          onClick={handleClose}
          style={{ 
            padding: '0 10px', 
            background: 'transparent', 
            border: 'none',
            borderRadius: 0,
            height: 28,
            color: '#888',
            cursor: 'pointer',
            fontSize: 12
          }}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}