import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';

const models = [
  { id: 'minimax-m2.5', name: 'MiniMax M2.5' },
  { id: 'bigpickle', name: 'Big Pickle' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'llama3', name: 'Llama 3' },
];

export default function Chat() {
  const { chatHistory, addChatMessage, activeFile, aiSettings, setAiSettings } = useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      let systemPrompt = 'You are an AI coding assistant. Help the user with their code.';
      
      if (activeFile) {
        const fileContent = useAppStore.getState().fileContent;
        systemPrompt = `You are an AI coding assistant. The user is currently working on ${activeFile.name}:\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nHelp with this code.`;
      }

      const response = await fetch(`${aiSettings.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey || 'sk-dummy'}`
        },
        body: JSON.stringify({
          model: aiSettings.model || 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const assistantReply = data.choices?.[0]?.message?.content || 'No response from AI';
      addChatMessage({ role: 'assistant', content: assistantReply });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      addChatMessage({ role: 'assistant', content: `_error: ${errMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Model:</span>
        <select 
          value={aiSettings.model || 'minimax-m2.5'} 
          onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
          style={{ fontSize: 11, padding: '2px 4px' }}
        >
          {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {chatHistory.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
            <div>AI Assistant</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>
              Configure your API key in Settings to get started
            </div>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: 4,
                color: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--success)'
              }}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <div style={{ 
                background: 'var(--bg-tertiary)', 
                padding: 12, 
                borderRadius: 8,
                whiteSpace: 'pre-wrap'
              }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ color: 'var(--text-muted)' }}>Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: 16, borderTop: '1px solid var(--border-color)' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI..."
          style={{ 
            width: '100%', 
            minHeight: 80, 
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          style={{ marginTop: 8, width: '100%' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}