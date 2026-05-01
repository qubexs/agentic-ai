import { useState } from 'react';
import { useAppStore, FileEntry } from '../store';

interface FileTreeProps {
  entries: FileEntry[];
  depth?: number;
}

function FileTree({ entries, depth = 0 }: FileTreeProps) {
  const { activeFile, openFile } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleClick = async (entry: FileEntry) => {
    if (entry.isDirectory) {
      setExpanded(prev => ({ ...prev, [entry.path]: !prev[entry.path] }));
      if (!expanded[entry.path]) {
        const children = await window.api.invoke('fs:readDir', entry.path);
        if (!children.error) {
          entry.children = children;
        }
      }
    } else {
      openFile(entry);
    }
  };

  return (
    <div style={{ paddingLeft: depth > 0 ? 12 : 0 }}>
      {entries.map((entry) => (
        <div key={entry.path}>
          <div
            className="file-tree-item"
            onClick={() => handleClick(entry)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              cursor: 'pointer',
              color: activeFile?.path === entry.path ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: activeFile?.path === entry.path ? 'var(--bg-hover)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '2px'
            }}
          >
            <span style={{ marginRight: 6, fontSize: 14 }}>
              {entry.isDirectory ? (expanded[entry.path] ? '📂' : '📁') : '📄'}
            </span>
            <span style={{ fontSize: 13 }}>{entry.name}</span>
          </div>
          {entry.isDirectory && expanded[entry.path] && entry.children && (
            <FileTree entries={entry.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function FileExplorer() {
  const { currentWorkspace, files, setWorkspace, setFiles } = useAppStore();
  const [inputPath, setInputPath] = useState(currentWorkspace);

  const handleOpenFolder = async () => {
    if (inputPath) {
      const exists = await window.api.invoke('fs:exists', inputPath);
      if (exists) {
        setWorkspace(inputPath);
        await window.api.invoke('storage:set', 'workspace', inputPath);
        const files = await window.api.invoke('fs:readDir', inputPath);
        if (!files.error) {
          setFiles(files);
        }
      }
    }
  };

  return (
    <div className="file-explorer" style={{ padding: 8, height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: 12 }}>
        {currentWorkspace && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, wordBreak: 'break-all' }}>
            📁 {currentWorkspace}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            placeholder="Enter folder path..."
            style={{ flex: 1, fontSize: 11 }}
          />
          <button onClick={handleOpenFolder} style={{ fontSize: 11 }}>Open</button>
        </div>
      </div>
      {files.length > 0 ? (
        <FileTree entries={files} />
      ) : (
        <div style={{ color: 'var(--text-muted)', padding: 16, textAlign: 'center' }}>
          Open a folder to get started
        </div>
      )}
    </div>
  );
}