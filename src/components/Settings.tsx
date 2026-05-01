import { useState, useEffect } from 'react';
import { useAppStore } from '../store';

type TabId = 'desktop' | 'server';
type DesktopTabId = 'general' | 'shortcuts' | 'appearance' | 'notifications' | 'sound' | 'updates';

interface Model { id: string; name: string; }
interface Provider { id: string; name: string; baseURL?: string; needApiKey: boolean; models: Model[]; }

interface CustomModel { id: string; name: string; }
interface CustomHeader { key: string; value: string; }

const providers: Provider[] = [
  { id: 'zen', name: 'OpenCode Zen', needApiKey: true, baseURL: 'https://opencode.ai/zen/v1', models: [{ id: 'minimax-m2.5', name: 'MiniMax M2.5' }, { id: 'bigpickle', name: 'Big Pickle' }] },
  { id: 'openai', name: 'OpenAI', needApiKey: true, models: [{ id: 'gpt-4o', name: 'GPT-4o' }, { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }] },
  { id: 'anthropic', name: 'Anthropic', needApiKey: true, models: [{ id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' }] },
  { id: 'google', name: 'Google', needApiKey: true, models: [{ id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }] },
  { id: 'ollama', name: 'Ollama (Local)', needApiKey: false, baseURL: 'http://localhost:11434', models: [{ id: 'llama3', name: 'Llama 3' }] },
  { id: 'custom', name: 'Custom Provider', needApiKey: false, models: [] },
];

const shortcuts = [
  { action: 'Add selection to context', key: 'Ctrl+Shift+L' }, { action: 'Close tab', key: 'Ctrl+W' },
  { action: 'Command palette', key: 'Ctrl+Shift+P' }, { action: 'Cycle color scheme', key: 'Ctrl+Shift+S' },
  { action: 'Cycle theme', key: 'Ctrl+Shift+T' }, { action: 'Focus input', key: 'Ctrl+L' },
  { action: 'Navigate back', key: 'Ctrl+[' }, { action: 'Navigate forward', key: 'Ctrl+]' },
  { action: 'New workspace', key: 'Ctrl+Shift+W' }, { action: 'Open project', key: 'Ctrl+O' },
  { action: 'Open settings', key: 'Ctrl+,' }, { action: 'Toggle sidebar', key: 'Ctrl+B' },
  { action: 'Toggle file tree', key: 'Ctrl+\\' }, { action: 'Auto-accept permissions', key: 'Ctrl+Shift+A' },
  { action: 'New session', key: 'Ctrl+Shift+S' }, { action: 'Toggle review', key: 'Ctrl+Shift+R' },
  { action: 'Prompt', key: 'Ctrl+Shift+E' }, { action: 'Shell', key: 'Ctrl+Shift+X' },
  { action: 'New terminal', key: 'Ctrl+Alt+T' }, { action: 'Toggle terminal', key: 'Ctrl+`' },
  { action: 'Add files', key: 'Ctrl+U' }, { action: 'Open file', key: 'Ctrl+K' },
  { action: 'Choose model', key: "Ctrl+'" }, { action: 'Cycle agent', key: 'Ctrl+.' },
  { action: 'Toggle MCPs', key: 'Ctrl+;' }, { action: 'Next session', key: 'Alt+↓' }, { action: 'Previous session', key: 'Alt+↑' },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: checked ? 'var(--success)' : 'var(--bg-tertiary)', cursor: 'pointer', position: 'relative' }}>
    <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 2, left: checked ? 18 : 2, transition: 'left 0.2s' }} />
  </button>
);

const SettingItem = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
      <span style={{ fontSize: 12 }}>{label}</span>
      {children}
    </div>
    {description && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{description}</div>}
  </div>
);

const Input = ({ value, onChange, placeholder, style = {}, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties; type?: string }) => (
  <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ padding: 6, width: '100%', fontSize: 12, ...style }} />
);

export default function Settings() {
  const { setAiSettings, currentWorkspace } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('desktop');
  const [desktopTab, setDesktopTab] = useState<DesktopTabId>('general');
  const [selectedProvider, setSelectedProvider] = useState('zen');
  const [selectedModel, setSelectedModel] = useState('minimax-m2.5');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [customProvider, setCustomProvider] = useState({
    id: 'myprovider', displayName: 'My AI Provider', baseUrl: 'https://api.myprovider.com/v1', apiKey: '',
    models: [{ id: 'model-id', name: 'Display Name' }] as CustomModel[],
    headers: [{ key: 'Header-Name', value: '' }] as CustomHeader[],
  });

  const [settings, setSettings] = useState({
    language: 'en', autoAccept: false, shell: 'powershell', showReasoning: true,
    expandShellParts: true, expandEditParts: true, showProgressBar: true,
    theme: 'dark', uiFont: 'System Sans', codeFont: 'System Mono', terminalFont: 'JetBrains Mono',
    notifyAgent: true, notifyPermission: true, notifyError: true,
    soundAgent: false, soundPermission: false, soundError: false,
    checkUpdates: true, showReleaseNotes: true,
  });

  useEffect(() => {
    const load = async () => {
      const p = await window.api.invoke('storage:get', 'ai_provider');
      const m = await window.api.invoke('storage:get', 'ai_model');
      const k = await window.api.invoke('storage:get', 'ai_apikey');
      if (p) setSelectedProvider(p);
      if (m) setSelectedModel(m);
      if (k) setApiKey(k);
    };
    load();
  }, []);

  const handleSave = async () => {
    let baseURL = providers.find(p => p.id === selectedProvider)?.baseURL || '';
    let model = selectedModel;
    if (selectedProvider === 'custom') {
      baseURL = customProvider.baseUrl;
      model = customProvider.models[0]?.id || 'model-id';
    }
    await window.api.invoke('storage:set', 'ai_provider', selectedProvider);
    await window.api.invoke('storage:set', 'ai_model', model);
    await window.api.invoke('storage:set', 'ai_apikey', apiKey);
    await window.api.invoke('storage:set', 'ai_baseurl', baseURL);
    setAiSettings({ provider: selectedProvider as any, apiKey, baseUrl: baseURL, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleExport = async () => {
    const config = { provider: selectedProvider, model: selectedModel, apiKey: apiKey || undefined, custom: customProvider };
    if (currentWorkspace) {
      await window.api.invoke('fs:writeFile', currentWorkspace + '/opencode.json', JSON.stringify(config, null, 2));
      alert('Saved to opencode.json');
    }
  };

  const handleImport = async () => {
    const result = await window.api.invoke('dialog:openFile', { filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (result?.content) {
      try {
        const cfg = JSON.parse(result.content);
        if (cfg.provider) setSelectedProvider(cfg.provider);
        if (cfg.model) setSelectedModel(cfg.model);
        if (cfg.apiKey) setApiKey(cfg.apiKey);
        if (cfg.custom) setCustomProvider(cfg.custom);
        handleSave();
      } catch { alert('Invalid JSON'); }
    }
  };

  const renderSection = (title: string, items: React.ReactNode) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>{title}</div>
      {items}
    </div>
  );

  const addModel = () => setCustomProvider(p => ({ ...p, models: [...p.models, { id: '', name: '' }] }));
  const removeModel = (i: number) => setCustomProvider(p => ({ ...p, models: p.models.filter((_, idx) => idx !== i) }));
  const updateModel = (i: number, field: 'id' | 'name', value: string) => setCustomProvider(p => ({ ...p, models: p.models.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));

  const addHeader = () => setCustomProvider(p => ({ ...p, headers: [...p.headers, { key: '', value: '' }] }));
  const removeHeader = (i: number) => setCustomProvider(p => ({ ...p, headers: p.headers.filter((_, idx) => idx !== i) }));
  const updateHeader = (i: number, field: 'key' | 'value', value: string) => setCustomProvider(p => ({ ...p, headers: p.headers.map((h, idx) => idx === i ? { ...h, [field]: value } : h) }));

  const tabs = [{ id: 'desktop', label: 'Desktop' }, { id: 'server', label: 'Server' }] as const;
  const desktopTabs = [{ id: 'general', label: 'General' }, { id: 'shortcuts', label: 'Shortcuts' }, { id: 'appearance', label: 'Appearance' }, { id: 'notifications', label: 'Notif' }, { id: 'sound', label: 'Sound' }, { id: 'updates', label: 'Updates' }] as const;

  return (
    <div style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={handleSave} style={{ padding: '4px 8px' }}>{saved ? '✓' : '💾'}</button>
        <button onClick={handleImport} style={{ padding: '4px 8px' }}>📂</button>
        <span style={{ flex: 1 }} />
        <button onClick={handleExport} style={{ padding: '4px 8px', fontSize: 11 }}>Export</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '6px 12px', fontSize: 11, background: activeTab === t.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: activeTab === t.id ? '#fff' : 'var(--text-secondary)', borderRadius: 4 }}>{t.label}</button>)}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'desktop' && (
          <>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
              {desktopTabs.map(t => <button key={t.id} onClick={() => setDesktopTab(t.id)} style={{ padding: '4px 8px', fontSize: 10, background: desktopTab === t.id ? 'var(--bg-hover)' : 'transparent', color: desktopTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)', borderRadius: 4 }}>{t.label}</button>)}
            </div>
            {desktopTab === 'general' && (
              <>
                {renderSection('Language & Permissions', <><SettingItem label="Language"><select value={settings.language} onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="en">English</option><option value="zh">中文</option></select></SettingItem><SettingItem label="Auto-accept permissions"><Toggle checked={settings.autoAccept} onChange={(v) => setSettings(s => ({ ...s, autoAccept: v }))} /></SettingItem></>)}
                {renderSection('Terminal', <><SettingItem label="Shell"><select value={settings.shell} onChange={(e) => setSettings(s => ({ ...s, shell: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="powershell">PowerShell</option><option value="cmd">Command Prompt</option></select></SettingItem><SettingItem label="Show reasoning"><Toggle checked={settings.showReasoning} onChange={(v) => setSettings(s => ({ ...s, showReasoning: v }))} /></SettingItem><SettingItem label="Expand shell parts"><Toggle checked={settings.expandShellParts} onChange={(v) => setSettings(s => ({ ...s, expandShellParts: v }))} /></SettingItem><SettingItem label="Expand edit parts"><Toggle checked={settings.expandEditParts} onChange={(v) => setSettings(s => ({ ...s, expandEditParts: v }))} /></SettingItem><SettingItem label="Show progress bar"><Toggle checked={settings.showProgressBar} onChange={(v) => setSettings(s => ({ ...s, showProgressBar: v }))} /></SettingItem></>)}
              </>
            )}
            {desktopTab === 'shortcuts' && (
              <div style={{ fontSize: 11 }}><div style={{ marginBottom: 12, fontWeight: 'bold' }}>Keyboard Shortcuts</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 4 }}>{shortcuts.map((s) => (<><span style={{ padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>{s.action}</span><span style={{ padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: 4, fontFamily: 'monospace', textAlign: 'center' }}>{s.key}</span></>))}</div></div>
            )}
            {desktopTab === 'appearance' && (
              <>{renderSection('Appearance', <><SettingItem label="Theme"><select value={settings.theme} onChange={(e) => setSettings(s => ({ ...s, theme: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></SettingItem><SettingItem label="UI Font"><select value={settings.uiFont} onChange={(e) => setSettings(s => ({ ...s, uiFont: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="System Sans">System Sans</option></select></SettingItem><SettingItem label="Code Font"><select value={settings.codeFont} onChange={(e) => setSettings(s => ({ ...s, codeFont: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="System Mono">System Mono</option></select></SettingItem><SettingItem label="Terminal Font"><select value={settings.terminalFont} onChange={(e) => setSettings(s => ({ ...s, terminalFont: e.target.value }))} style={{ padding: 4, fontSize: 11 }}><option value="JetBrains Mono">JetBrains Mono</option></select></SettingItem></>)}</>
            )}
            {desktopTab === 'notifications' && (
              <>{renderSection('Notifications', <><SettingItem label="Agent complete"><Toggle checked={settings.notifyAgent} onChange={(v) => setSettings(s => ({ ...s, notifyAgent: v }))} /></SettingItem><SettingItem label="Permission required"><Toggle checked={settings.notifyPermission} onChange={(v) => setSettings(s => ({ ...s, notifyPermission: v }))} /></SettingItem><SettingItem label="Errors"><Toggle checked={settings.notifyError} onChange={(v) => setSettings(s => ({ ...s, notifyError: v }))} /></SettingItem></>)}</>
            )}
            {desktopTab === 'sound' && (
              <>{renderSection('Sound', <><SettingItem label="Agent complete"><Toggle checked={settings.soundAgent} onChange={(v) => setSettings(s => ({ ...s, soundAgent: v }))} /></SettingItem><SettingItem label="Permission required"><Toggle checked={settings.soundPermission} onChange={(v) => setSettings(s => ({ ...s, soundPermission: v }))} /></SettingItem><SettingItem label="Errors"><Toggle checked={settings.soundError} onChange={(v) => setSettings(s => ({ ...s, soundError: v }))} /></SettingItem></>)}</>
            )}
            {desktopTab === 'updates' && (
              <>{renderSection('Updates', <><SettingItem label="Check on startup"><Toggle checked={settings.checkUpdates} onChange={(v) => setSettings(s => ({ ...s, checkUpdates: v }))} /></SettingItem><SettingItem label="Show release notes"><Toggle checked={settings.showReleaseNotes} onChange={(v) => setSettings(s => ({ ...s, showReleaseNotes: v }))} /></SettingItem></>)}</>
            )}
          </>
        )}

        {activeTab === 'server' && (
          <>
            <SettingItem label="Provider"><select value={selectedProvider} onChange={(e) => { setSelectedProvider(e.target.value); const p = providers.find(p => p.id === e.target.value); setSelectedModel(p?.models[0]?.id || ''); }} style={{ padding: 6, width: 150 }}>{providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></SettingItem>
            
            {selectedProvider === 'custom' ? (
              <div style={{ marginTop: 12, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12 }}>Configure an OpenAI-compatible provider</div>
                
                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Provider ID</label><Input value={customProvider.id} onChange={(v) => setCustomProvider(p => ({ ...p, id: v }))} placeholder="myprovider" /><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Lowercase letters, numbers, hyphens, or underscores</div></div>
                
                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Display name</label><Input value={customProvider.displayName} onChange={(v) => setCustomProvider(p => ({ ...p, displayName: v }))} placeholder="My AI Provider" /></div>
                
                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Base URL</label><Input value={customProvider.baseUrl} onChange={(v) => setCustomProvider(p => ({ ...p, baseUrl: v }))} placeholder="https://api.myprovider.com/v1" /></div>
                
                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>API key</label><div style={{ display: 'flex', gap: 8 }}><Input value={customProvider.apiKey} onChange={(v) => setCustomProvider(p => ({ ...p, apiKey: v }))} placeholder="Optional" type={showApiKey ? 'text' : 'password'} /><button onClick={() => setShowApiKey(!showApiKey)} style={{ padding: '4px 8px' }}>{showApiKey ? '🙈' : '👁️'}</button></div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Optional. Leave empty if you manage auth via headers.</div></div>

                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Models</label>
                  {customProvider.models.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <Input value={m.id} onChange={(v) => updateModel(i, 'id', v)} placeholder="ID" style={{ flex: 1 }} />
                      <Input value={m.name} onChange={(v) => updateModel(i, 'name', v)} placeholder="Name" style={{ flex: 1 }} />
                      <button onClick={() => removeModel(i)} style={{ padding: '4px 8px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 4 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={addModel} style={{ padding: '4px 8px', fontSize: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 4 }}>+ Add Model</button>
                </div>

                <div style={{ marginBottom: 8 }}><label style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>Headers (optional)</label>
                  {customProvider.headers.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <Input value={h.key} onChange={(v) => updateHeader(i, 'key', v)} placeholder="Header-Name" style={{ flex: 1 }} />
                      <Input value={h.value} onChange={(v) => updateHeader(i, 'value', v)} placeholder="value" style={{ flex: 1 }} />
                      <button onClick={() => removeHeader(i)} style={{ padding: '4px 8px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 4 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={addHeader} style={{ padding: '4px 8px', fontSize: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 4 }}>+ Add Header</button>
                </div>
              </div>
            ) : (
              <>
                <SettingItem label="Model"><select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ padding: 6, width: 150 }}>{providers.find(p => p.id === selectedProvider)?.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></SettingItem>
                {providers.find(p => p.id === selectedProvider)?.needApiKey && (
                  <SettingItem label="API Key"><div style={{ display: 'flex', gap: 8 }}><input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={selectedProvider === 'zen' ? 'ZEN_API_KEY' : 'sk-...'} style={{ padding: 6, flex: 1 }} /><button onClick={() => setShowApiKey(!showApiKey)} style={{ padding: '4px 8px' }}>{showApiKey ? '🙈' : '👁️'}</button></div></SettingItem>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}