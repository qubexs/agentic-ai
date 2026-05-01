import { useState, useEffect } from 'react';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.api.invoke('window:isMaximized');
      setIsMaximized(maximized);
    };
    checkMaximized();
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

  return (
    <div style={{
      height: 32,
      background: 'var(--bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Agentic IDE</span>
      </div>
      <div style={{ display: 'flex' }}>
        <button 
          onClick={handleMinimize}
          style={{ 
            padding: '4px 12px', 
            background: 'transparent', 
            borderRadius: 0,
            height: 32,
            color: 'var(--text-primary)'
          }}
          title="Minimize"
        >
          ─
        </button>
        <button 
          onClick={handleMaximize}
          style={{ 
            padding: '4px 12px', 
            background: 'transparent', 
            borderRadius: 0,
            height: 32,
            color: 'var(--text-primary)'
          }}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button 
          onClick={handleClose}
          style={{ 
            padding: '4px 12px', 
            background: 'transparent', 
            borderRadius: 0,
            height: 32,
            color: 'var(--text-primary)'
          }}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}