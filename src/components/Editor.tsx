import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAppStore } from '../store';

export default function CodeEditor() {
  const { activeFile, fileContent, setFileContent, setDirty } = useAppStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const loadFile = async () => {
      if (activeFile && !activeFile.isDirectory) {
        const result = await window.api.invoke('fs:readFile', activeFile.path);
        if (result.content !== undefined) {
          setFileContent(result.content);
          setDirty(false);
        }
      }
    };
    loadFile();
  }, [activeFile?.path]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      setDirty(true);
    }
  };

  const handleSave = async () => {
    if (activeFile && useAppStore.getState().isDirty) {
      await window.api.invoke('fs:writeFile', activeFile.path, fileContent);
      setDirty(false);
      forceUpdate(n => n + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, fileContent]);

  if (!activeFile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⌨️</div>
          <div>Open a file to start editing</div>
        </div>
      </div>
    );
  }

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'sh': 'shell',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return langMap[ext || ''] || 'plaintext';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>{activeFile.name}</span>
        {useAppStore.getState().isDirty && <span style={{ color: 'var(--warning)' }}>●</span>}
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={fileContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
}