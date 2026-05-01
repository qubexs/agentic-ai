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

declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
    };
  }
}

function MCPPanel() {
  return (
    <div style={{ padding: 12, fontSize: 11 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>MCP Servers</div>
      <div style={{ color: 'var(--text-muted)' }}>No MCP servers configured</div>
    </div>
  );
}

function ProvidersPanel() {
  return (
    <div style={{ padding: 12, fontSize: 11 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Providers</div>
      <div style={{ color: 'var(--text-muted)' }}>No additional providers</div>
    </div>
  );
}

function SessionPanel() {
  return (
    <div style={{ padding: 12, fontSize: 11 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Sessions</div>
      <div style={{ color: 'var(--text-muted)' }}>No active sessions</div>
    </div>
  );
}

const factory = (node: TabNode): React.ReactNode => {
  switch (node.getComponent()) {
    case 'explorer':
      return <FileExplorer />;
    case 'editor':
      return <Editor />;
    case 'chat':
      return <Chat />;
    case 'terminal':
      return <Terminal />;
    case 'settings':
      return <Settings />;
    case 'workflow':
      return <WorkflowEditor />;
    case 'mcp':
      return <MCPPanel />;
    case 'providers':
      return <ProvidersPanel />;
    case 'session':
      return <SessionPanel />;
    default:
      return <div>Unknown component</div>;
  }
};

const defaultModel: any = {
  global: {
    tabEnableFloat: true,
    tabEnableClose: true,
    tabEnableRename: false,
    tabEnableDrag: true,
    tabEnableOverflow: true
  },
  layout: {
    type: 'row',
    children: [
      {
        type: 'tab',
        id: 'explorer',
        name: 'Explorer',
        component: 'explorer',
        enableClose: false
      },
      {
        type: 'tabset',
        id: 'main-tabs',
        children: [
          { type: 'tab', id: 'editor', name: 'Editor', component: 'editor' },
          { type: 'tab', id: 'workflow', name: 'Workflow', component: 'workflow' }
        ]
      },
      {
        type: 'tabset',
        id: 'right-tabs',
        width: 280,
        children: [
          { type: 'tab', id: 'chat', name: 'Chat', component: 'chat' },
          { type: 'tab', id: 'session', name: 'Session', component: 'session' },
          { type: 'tab', id: 'mcp', name: 'MCP', component: 'mcp' },
          { type: 'tab', id: 'providers', name: 'Providers', component: 'providers' },
          { type: 'tab', id: 'settings', name: 'Settings', component: 'settings' }
        ]
      }
    ]
  },
  borders: [
    {
      type: 'border',
      location: 'bottom',
      size: 200,
      children: [
        {
          type: 'tab',
          id: 'terminal',
          name: 'Terminal',
          component: 'terminal',
          enableClose: false
        }
      ]
    }
  ]
};

export default function App() {
  const [layout, setLayout] = useState<Model>(() =>
    Model.fromJson(defaultModel)
  );

  const [closedTabs, setClosedTabs] = useState<Set<string>>(new Set());

  const { setLayoutModel, setWorkspace, setFiles } = useAppStore();

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

  const onLayoutChange = (newModel: Model) => {
    setLayout(newModel);
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

      layout.doAction(
        Actions.addNode(tabConfig, 'right-tabs', DockLocation.CENTER, -1)
      );

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
      <TitleBar />

      <FlexLayout.Layout
        model={layout}
        factory={factory}
        onModelChange={onLayoutChange}
        onAction={onAction}
      />

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
                padding: '2px 6px',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                borderRadius: 3,
                cursor: 'pointer'
              }}
            >
              Restore {tabId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}