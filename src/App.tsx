import { useEffect, useState, useCallback } from 'react';
import FlexLayout, { TabNode, Model, Actions, DockLocation } from 'flexlayout-react';
import { useAppStore } from './store';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import Chat from './components/Chat';
import Terminal from './components/Terminal';
import Settings from './components/Settings';
import TitleBar from './components/TitleBar';
import WorkflowEditor from './components/WorkflowEditor';
import Search from './components/Search';

declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
    };
  }
}

// 1. Interactive MCP Panel
function MCPPanel() {
  const [servers, setServers] = useState([
    { id: 1, name: 'Local File System', connected: true },
    { id: 2, name: 'GitHub Integration', connected: false }
  ]);

  const toggleConnection = (id: number) => {
    setServers(servers.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
  };

  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        MCP Servers
        <button style={{ padding: '2px 6px', fontSize: 11 }}>+ Add</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {servers.map(server => (
          <div key={server.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: 8, borderRadius: 4, border: '1px solid var(--border-color)' }}>
            <span>{server.name}</span>
            <button 
              onClick={() => toggleConnection(server.id)}
              style={{ 
                padding: '2px 8px', 
                fontSize: 11, 
                background: server.connected ? 'transparent' : 'var(--accent-primary)',
                border: server.connected ? '1px solid var(--error)' : 'none',
                color: server.connected ? 'var(--error)' : '#fff'
              }}>
              {server.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Interactive Providers Panel 
function ProvidersPanel() {
  const [providers, setProviders] = useState([
    { id: 'openrouter', name: 'OpenRouter (Free)', activeModel: 'meta-llama/llama-3-8b-instruct', status: 'active' },
    { id: 'local', name: 'Local Runtime', activeModel: 'gemma:7b', status: 'offline' }
  ]);

  const updateModel = (id: string, newModel: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, activeModel: newModel } : p));
  };

  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 12 }}>Model Providers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {providers.map(p => (
          <div key={p.id} style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{p.name}</strong>
              <span style={{ color: p.status === 'active' ? 'var(--success)' : 'var(--text-muted)', fontSize: 11 }}>
                ● {p.status}
              </span>
            </div>
            <select 
              value={p.activeModel} 
              onChange={(e) => updateModel(p.id, e.target.value)}
              style={{ width: '100%', padding: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 4 }}
            >
              <optgroup label="Llama">
                <option value="meta-llama/llama-3-8b-instruct">Llama 3 (8B)</option>
              </optgroup>
              <optgroup label="Gemma">
                <option value="gemma:7b">Gemma 7B</option>
                <option value="gemma:2b">Gemma 2B</option>
              </optgroup>
              <optgroup label="Nemotron">
                <option value="nvidia/nemotron-4-340b">Nemotron 4</option>
              </optgroup>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Interactive Session Panel
function SessionPanel() {
  const [sessions, setSessions] = useState([
    { id: 1, name: 'JustEzCoder Setup', timestamp: '10 mins ago' },
    { id: 2, name: 'Blockchain Node Config', timestamp: '2 hours ago' }
  ]);

  const removeSession = (id: number) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        Recent Sessions
        <button style={{ padding: '2px 6px', fontSize: 11 }}>New Session</button>
      </div>
      {sessions.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>No active sessions</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sessions.map(session => (
            <div key={session.id} className="session-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: 4, cursor: 'pointer' }}>
              <div>
                <div style={{ color: 'var(--text-primary)' }}>{session.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{session.timestamp}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeSession(session.id); }}
                style={{ background: 'transparent', padding: '0 4px', color: 'var(--text-muted)' }}
                title="Delete Session"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const factory = (node: TabNode): React.ReactNode => {
  switch (node.getComponent()) {
    case 'explorer': return <FileExplorer />;
    case 'editor': return <Editor />;
    case 'chat': return <Chat />;
    case 'terminal': return <Terminal />;
    case 'settings': return <Settings />;
    case 'workflow': return <WorkflowEditor />;
    case 'search': return <Search />;
    case 'mcp': return <MCPPanel />;
    case 'providers': return <ProvidersPanel />;
    case 'session': return <SessionPanel />;
    default: return <div>Unknown component</div>;
  }
};

const defaultModel: any = {
  global: {
    tabEnableFloat: true,
    tabEnableClose: true,
    tabEnableRename: false,
    tabEnableDrag: true,
    tabEnableOverflow: false,
    tabSetHeaderControls: ['float', 'maximize'],
    tabSetShowTabOverflow: false,
    tabSetEnableDrag: true,
    tabSetEnableDrop: true,
    splitterSize: 8,
    splitterResize: true
  },
  layout: {
    type: 'row',
    children: [
      {
        type: 'row',
        id: 'left-column',
        weight: 70,
        children: [
          {
            type: 'tabset',
            id: 'main-tabs',
            children: [
              { type: 'tab', id: 'explorer', name: 'Explorer', component: 'explorer' },
              { type: 'tab', id: 'search', name: 'Search', component: 'search' }
            ]
          },
          {
            type: 'tabset',
            id: 'bottom-tabs',
            height: 200,
            children: [
              { type: 'tab', id: 'terminal', name: 'Terminal', component: 'terminal', enableClose: false }
            ]
          }
        ]
      },
      {
        type: 'tabset',
        id: 'right-tabs',
        width: 284,
        children: [
          { type: 'tab', id: 'chat', name: 'Chat', component: 'chat' },
          { type: 'tab', id: 'session', name: 'Session', component: 'session' }
        ]
      }
    ]
  },
  borders: []
};

export default function App() {
  const [layout, setLayout] = useState<Model>(() => Model.fromJson(defaultModel));
  const [closedTabs, setClosedTabs] = useState<Set<string>>(new Set());
  const [terminalOpen, setTerminalOpen] = useState(true);
  

  const { setLayoutModel, setWorkspace, setFiles } = useAppStore();

  const allTabs = [
    { id: 'chat', name: 'Chat' },
    { id: 'session', name: 'Session' },
    { id: 'mcp', name: 'MCP' },
    { id: 'providers', name: 'Providers' },
    { id: 'settings', name: 'Settings' }
  ];

  const mainTabs = [
    { id: 'explorer', name: 'Explorer' },
    { id: 'search', name: 'Search' },
    { id: 'editor', name: 'Editor' },
    { id: 'workflow', name: 'Workflow' }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const workspace = await window.api.invoke('storage:get', 'workspace');
        if (workspace) {
          setWorkspace(workspace);
          const files = await window.api.invoke('fs:readDir', workspace);
          if (!files.error) {
            setFiles(files);
          }
        }
      } catch {
        // silent fail
      }
    };
    init();
  }, []);

  useEffect(() => {
    const bottomTabs = layout.getNodeById('bottom-tabs');
    if (bottomTabs) {
      if (terminalOpen) {
        layout.doAction(Actions.updateNodeAttributes('bottom-tabs', { height: 200 }));
      } else {
        layout.doAction(Actions.updateNodeAttributes('bottom-tabs', { height: 0 }));
      }
    }
  }, [terminalOpen]);

  

  const onLayoutChange = (newModel: Model) => {
    setLayout(newModel);
    setLayoutModel(newModel);

setLayoutModel(newModel);
  };

  const onAction = (action: any) => {
    if (action.type === 'CloseTab') {
      setClosedTabs(prev => new Set(prev).add(action.data.id));
    }
    return action;
  };

  const restoreTab = useCallback(
    (tabId: string) => {
      const tabMap: Record<string, any> = {
        chat: { type: 'tab', id: 'chat', name: 'Chat', component: 'chat' },
        session: { type: 'tab', id: 'session', name: 'Session', component: 'session' },
        mcp: { type: 'tab', id: 'mcp', name: 'MCP', component: 'mcp' },
        providers: { type: 'tab', id: 'providers', name: 'Providers', component: 'providers' },
        settings: { type: 'tab', id: 'settings', name: 'Settings', component: 'settings' }
      };

      const tabConfig = tabMap[tabId];
      if (!tabConfig) return;

      layout.doAction(Actions.addNode(tabConfig, 'right-tabs', DockLocation.CENTER, -1));

      setClosedTabs(prev => {
        const next = new Set(prev);
        next.delete(tabId);
        return next;
      });
    },
    [layout]
  );

  return (
    <div className="app">
      <TitleBar 
        tabs={[...mainTabs, ...allTabs]}
        onSelectTab={(tabId) => {
          if (!layout.getNodeById(tabId)) {
            const tabConfig = [...mainTabs, ...allTabs].find(t => t.id === tabId);
            if (tabConfig) {
              layout.doAction(Actions.addNode(
                { type: 'tab', id: tabConfig.id, name: tabConfig.name, component: tabConfig.id },
                'main-tabs', DockLocation.CENTER, -1
              ));
            }
          }
        }}
      />

      <div style={{ position: 'relative', height: 'calc(100% - 32px)' }}>
        <FlexLayout.Layout
          model={layout}
          factory={factory}
          onModelChange={onLayoutChange}
          onAction={onAction}
        />
      </div>

      <div style={{
        height: 32,
        background: '#1a1a1a',
        borderTop: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px'
      }}>
        <button 
          onClick={() => setTerminalOpen(!terminalOpen)}
          style={{ 
            background: 'transparent', 
            border: 'none',
            padding: '4px 12px',
            cursor: 'pointer',
            color: '#888',
            fontSize: 12,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Terminal
        </button>
        <span style={{ color: '#666', fontSize: 11 }}>v1.0.0</span>
      </div>

      {closedTabs.size > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 6,
            display: 'flex',
            gap: 4,
            zIndex: 100
          }}
        >
          {Array.from(closedTabs).map(tabId => (
            <button
              key={tabId}
              onClick={() => restoreTab(tabId)}
              style={{
                fontSize: 10,
                padding: '4px 8px',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              + Restore {tabId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}