export default function Search() {
  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 12 }}>Search</div>
      <input
        type="text"
        placeholder="Search in workspace..."
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 4,
          boxSizing: 'border-box'
        }}
      />
      <div style={{ marginTop: 12, color: 'var(--text-muted)' }}>
        Type to search files and content
      </div>
    </div>
  );
}