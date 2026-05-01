import { useState } from 'react';
import { useAppStore } from '../store';

type ShellType = 'cmd' | 'powershell' | 'powershell7';

export default function Terminal() {
  const { terminalOutput, addTerminalOutput, clearTerminal } = useAppStore();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [shell, setShell] = useState<ShellType>('powershell');
  const [isRunning, setIsRunning] = useState(false);

  const handleCommand = async () => {
    if (!input.trim() || isRunning) return;
    
    const cmd = input.trim();
    setInput('');
    addTerminalOutput(`${shell}> ${cmd}`);
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setIsRunning(true);

    try {
      const result: any = await window.api.invoke('shell:spawn', shell, cmd);
      if (result.stdout) {
        addTerminalOutput(result.stdout);
      }
      if (result.stderr) {
        addTerminalOutput(`Error: ${result.stderr}`);
      }
    } catch (error: any) {
      addTerminalOutput(`Error: ${error.message}`);
    }
    setIsRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0c0c0c' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #1f1f1f', background: '#1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={shell}
            onChange={(e) => setShell(e.target.value as ShellType)}
            style={{ padding: '2px 4px', fontSize: 12, background: '#0c0c0c', color: '#cccccc', border: '1px solid #333', borderRadius: 0 }}
          >
            <option value="cmd">CMD</option>
            <option value="powershell">PowerShell</option>
            <option value="powershell7">PowerShell 7</option>
          </select>
          <span style={{ fontSize: 11, color: isRunning ? '#c19c00' : '#13a10e' }}>
            {isRunning ? '● Running' : '○ Ready'}
          </span>
        </div>
        <button onClick={clearTerminal} style={{ padding: '2px 8px', fontSize: 11, background: '#0c0c0c', color: '#cccccc', border: 'none', borderRadius: 0 }}>Clear</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 8, fontFamily: 'Consolas, Courier New, monospace', fontSize: 13, color: '#cccccc', whiteSpace: 'pre-wrap' }}>
        {terminalOutput.map((line, i) => (
          <div key={i} style={{ marginBottom: 2 }}>{line}</div>
        ))}
      </div>
      <div style={{ padding: 8, borderTop: '1px solid #1f1f1f' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          disabled={isRunning}
          style={{ width: '100%', padding: '4px 8px', fontFamily: 'Consolas, Courier New, monospace', fontSize: 13, background: '#0c0c0c', color: '#cccccc', border: '1px solid #333', borderRadius: 0, outline: 'none' }}
          autoFocus
        />
      </div>
    </div>
  );
}