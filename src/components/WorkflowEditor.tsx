import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
  trigger: ({ data }: { data: { label: string } }) => (
    <div style={{
      padding: 10,
      border: '2px solid #4ec9b0',
      borderRadius: 8,
      background: '#2d2d2d',
      minWidth: 120,
      textAlign: 'center'
    }}>
      <div style={{ color: '#4ec9b0', fontWeight: 'bold' }}>🔔 Trigger</div>
      <div style={{ fontSize: 12, color: '#858585' }}>{data.label}</div>
    </div>
  ),
  llm: ({ data }: { data: { label: string } }) => (
    <div style={{
      padding: 10,
      border: '2px solid #0e639c',
      borderRadius: 8,
      background: '#2d2d2d',
      minWidth: 120,
      textAlign: 'center'
    }}>
      <div style={{ color: '#0e639c', fontWeight: 'bold' }}>🤖 LLM</div>
      <div style={{ fontSize: 12, color: '#858585' }}>{data.label}</div>
    </div>
  ),
  tool: ({ data }: { data: { label: string } }) => (
    <div style={{
      padding: 10,
      border: '2px solid #dcdcaa',
      borderRadius: 8,
      background: '#2d2d2d',
      minWidth: 120,
      textAlign: 'center'
    }}>
      <div style={{ color: '#dcdcaa', fontWeight: 'bold' }}>🔧 Tool</div>
      <div style={{ fontSize: 12, color: '#858585' }}>{data.label}</div>
    </div>
  ),
  output: ({ data }: { data: { label: string } }) => (
    <div style={{
      padding: 10,
      border: '2px solid #f14c4c',
      borderRadius: 8,
      background: '#2d2d2d',
      minWidth: 120,
      textAlign: 'center'
    }}>
      <div style={{ color: '#f14c4c', fontWeight: 'bold' }}>📤 Output</div>
      <div style={{ fontSize: 12, color: '#858585' }}>{data.label}</div>
    </div>
  ),
};

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Start' } },
  { id: '2', type: 'llm', position: { x: 300, y: 100 }, data: { label: 'AI Prompt' } },
  { id: '3', type: 'tool', position: { x: 500, y: 100 }, data: { label: 'Write File' } },
  { id: '4', type: 'output', position: { x: 700, y: 100 }, data: { label: 'Done' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
];

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('llm');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const addNode = () => {
    const id = `${nodes.length + 1}`;
    const newNode: Node = {
      id,
      type: selectedNodeType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
      data: { label: `${selectedNodeType} Node` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflow = async () => {
    const results: Record<string, any> = {};

    for (const node of nodes) {
      const input = node.id === '1' ? null : results[nodes[nodes.indexOf(node) - 1]?.id];
      results[node.id] = { status: 'executed', input, output: `Result of ${node.data.label}` };
    }

    console.log('Workflow execution:', results);
    alert('Workflow executed! Check console for results.');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add Node:</span>
        <select
          value={selectedNodeType}
          onChange={(e) => setSelectedNodeType(e.target.value)}
          style={{ padding: '4px 8px' }}
        >
          <option value="trigger">Trigger</option>
          <option value="llm">LLM Prompt</option>
          <option value="tool">MCP Tool</option>
          <option value="output">Output</option>
        </select>
        <button onClick={addNode} style={{ marginLeft: 8 }}>+ Add</button>
        <button onClick={runWorkflow} style={{ marginLeft: 'auto', background: 'var(--success)' }}>
          ▶ Run Workflow
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background color="#404040" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}