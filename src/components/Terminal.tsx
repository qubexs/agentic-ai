import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

type ShellType = 'cmd' | 'powershell' | 'powershell7';

const SESSION_ID = 'main-terminal';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [shell, setShell] = useState<ShellType>('powershell');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      theme: {
        background: '#0c0c0c',
        foreground: '#cccccc',
        cursor: '#cccccc',
        cursorAccent: '#0c0c0c',
        selectionBackground: '#264f78',
        black: '#0c0c0c',
        red: '#c50f1f',
        green: '#13a10e',
        yellow: '#c19c00',
        blue: '#0037da',
        magenta: '#881798',
        cyan: '#3a96dd',
        white: '#cccccc',
        brightBlack: '#767676',
        brightRed: '#f38b27',
        brightGreen: '#16c60c',
        brightYellow: '#f9f1a5',
        brightBlue: '#3b78ff',
        brightMagenta: '#b4009e',
        brightCyan: '#61d6d6',
        brightWhite: '#f2f2f2'
      },
      fontFamily: 'Consolas, Courier New, monospace',
      fontSize: 13,
      lineHeight: 1,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'block',
      cursorWidth: 1,
      scrollback: 10000,
      allowTransparency: false,
      convertEol: false
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const initShell = async () => {
      try {
        await window.api.invoke('shell:create', shell, SESSION_ID);
        setIsConnected(true);
      } catch (error: any) {
        xterm.writeln(`\x1b[31mFailed to start shell: ${error.message}\x1b[0m`);
      }
    };
    initShell();

    const unsubData = window.api.on('shell:data', (_sessionId: string, data: string) => {
      if (_sessionId === SESSION_ID && xtermRef.current) {
        xtermRef.current.write(data);
      }
    });

    const unsubExit = window.api.on('shell:exit', (_sessionId: string, code: number) => {
      if (_sessionId === SESSION_ID && xtermRef.current) {
        xtermRef.current.writeln(`\r\n\x1b[33m[Process exited with code ${code}]\x1b[0m`);
        setIsConnected(false);
      }
    });

    xterm.onData((data) => {
      window.api.invoke('shell:write', SESSION_ID, data);
    });

    const handleResize = () => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit();
        window.api.invoke('shell:resize', SESSION_ID, xtermRef.current.cols, xtermRef.current.rows);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubData();
      unsubExit();
      window.api.invoke('shell:kill', SESSION_ID);
      xterm.dispose();
    };
  }, []);

  const handleShellChange = async (newShell: ShellType) => {
    await window.api.invoke('shell:kill', SESSION_ID);
    xtermRef.current?.clear();
    setShell(newShell);
    setIsConnected(false);

    setTimeout(async () => {
      try {
        await window.api.invoke('shell:create', newShell, SESSION_ID);
        setIsConnected(true);
      } catch (error: any) {
        xtermRef.current?.writeln(`\x1b[31mFailed to start shell: ${error.message}\x1b[0m`);
      }
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0c0c0c' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #1f1f1f', background: '#1f1f1f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={shell}
            onChange={(e) => handleShellChange(e.target.value as ShellType)}
            style={{
              padding: '2px 4px',
              fontSize: 12,
              background: '#0c0c0c',
              color: '#cccccc',
              border: '1px solid #333',
              borderRadius: 0
            }}
          >
            <option value="cmd">CMD</option>
            <option value="powershell">PowerShell</option>
            <option value="powershell7">PowerShell 7</option>
          </select>
          <span style={{ fontSize: 11, color: isConnected ? '#0dbc79' : '#cd3131' }}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
        <button 
          onClick={() => xtermRef.current?.clear()}
          style={{ padding: '2px 8px', fontSize: 11, background: '#3c3c3c', color: '#cccccc', border: 'none', borderRadius: 2 }}
        >
          Clear
        </button>
      </div>
      <div ref={terminalRef} style={{ flex: 1, padding: 8, fontFamily: 'Consolas, "Cascadia Code", "Cascadia Mono", monospace' }} />
    </div>
  );
}