import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';

export default function Terminal() {
  const { terminalOutput, addTerminalOutput, clearTerminal } = useAppStore();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleCommand = async () => {
    if (!input.trim()) return;
    
    const cmd = input.trim();
    setInput('');
    addTerminalOutput(`$ ${cmd}`);
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const [command, ...args] = cmd.split(' ');
    
    try {
      const result = await window.api.invoke('shell:spawn', command, args);
      if (result.stdout) {
        addTerminalOutput(result.stdout);
      }
      if (result.stderr) {
        addTerminalOutput(result.stderr);
      }
    } catch (error: any) {
      addTerminalOutput(`Error: ${error.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '4px 8px', 
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <span style={{ fontSize: 12 }}>Terminal</span>
        <button onClick={clearTerminal} style={{ padding: '2px 8px', fontSize: 11 }}>Clear</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 8, fontFamily: 'monospace', fontSize: 13 }}>
        {terminalOutput.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: 2 }}>{line}</div>
        ))}
        <div ref={outputRef} />
      </div>
      <div style={{ padding: 8, borderTop: '1px solid var(--border-color)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          style={{ width: '100%', fontFamily: 'monospace' }}
          autoFocus
        />
      </div>
    </div>
  );
}