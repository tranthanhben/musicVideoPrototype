# UI Implementation Patterns: Code Examples & Architecture
**Date:** 2026-03-02 | **Focus:** Practical code patterns for agentic music video UI

---

## 1. Agent Graph Visualization Component

### Pattern: Reactflow for DAG Rendering

```typescript
// useAgentGraph.ts - Custom hook for LangGraph-style visualization

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';

interface AgentNode {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'blocked';
  duration?: number;
  error?: string;
}

const AgentNodeComponent = ({ data, selected }: any) => {
  const statusColors = {
    pending: 'bg-gray-200',
    running: 'bg-blue-200 animate-pulse',
    complete: 'bg-green-200',
    error: 'bg-red-200',
    blocked: 'bg-yellow-200',
  };

  return (
    <div className={`
      px-4 py-2 rounded-lg border-2 border-gray-300
      ${statusColors[data.status]}
      ${selected ? 'ring-2 ring-blue-500' : ''}
    `}>
      <div className="font-bold">{data.label}</div>
      {data.status === 'running' && <div className="text-xs">Processing...</div>}
      {data.status === 'complete' && data.duration && (
        <div className="text-xs text-gray-600">{data.duration}s</div>
      )}
      {data.status === 'error' && data.error && (
        <div className="text-xs text-red-600">{data.error}</div>
      )}
    </div>
  );
};

export const useAgentGraph = (initialAgents: AgentNode[]) => {
  const nodes = initialAgents.map((agent) => ({
    id: agent.id,
    data: agent,
    position: getNodePosition(agent.id), // Calculate grid layout
    component: AgentNodeComponent,
  }));

  const edges: Edge[] = [
    { id: 'e1-2', source: 'scene_comp', target: 'music_timing' },
    { id: 'e1-3', source: 'scene_comp', target: 'narrative' },
    { id: 'e2-4', source: 'music_timing', target: 'vfx' },
    { id: 'e3-4', source: 'narrative', target: 'vfx' },
    { id: 'e4-5', source: 'vfx', target: 'quality_gate' },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edges);

  const updateNodeStatus = useCallback((nodeId: string, status: AgentNode['status']) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node
      )
    );
  }, [setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    updateNodeStatus,
  };
};
```

### Render Component

```typescript
// AgentGraph.tsx

export const AgentGraph = ({ agents, onAgentClick }: Props) => {
  const { nodes, edges, onNodesChange, onEdgesChange, updateNodeStatus } =
    useAgentGraph(agents);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node.id);
    onAgentClick?.(node.id);
  }, [onAgentClick]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};
```

---

## 2. AG-UI Event Streaming Integration

### Pattern: Server-Sent Events with Agent Updates

```typescript
// useAgentStream.ts - Hook for consuming AG-UI events

import { useEffect, useCallback, useState } from 'react';

type AgentEventType =
  | 'agent_start'
  | 'agent_end'
  | 'tool_use'
  | 'tool_result'
  | 'agent_think'
  | 'error'
  | 'node_start'
  | 'node_end';

interface AgentEvent {
  type: AgentEventType;
  agent_id: string;
  timestamp: number;
  data: Record<string, any>;
}

export const useAgentStream = (runId: string) => {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource(`/api/agent-runs/${runId}/stream`);

    eventSource.addEventListener('open', () => {
      setStatus('streaming');
    });

    // Handle each AG-UI event type
    eventSource.addEventListener('agent_start', (e) => {
      const event = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, event]);

      // Update UI for agent start
      dispatch({
        type: 'AGENT_STARTED',
        payload: { agentId: event.agent_id },
      });
    });

    eventSource.addEventListener('tool_use', (e) => {
      const event = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, event]);

      // Stream tool info to chat
      appendChatMessage({
        role: 'system',
        content: `Tool: ${event.data.tool_name}`,
        metadata: { type: 'tool_start' },
      });
    });

    eventSource.addEventListener('agent_end', (e) => {
      const event = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, event]);

      // Update progress
      setProgress((prev) => Math.min(prev + 20, 100));

      // Render output
      appendChatMessage({
        role: 'assistant',
        content: event.data.output,
      });
    });

    eventSource.addEventListener('error', (e) => {
      const event = JSON.parse(e.data) as AgentEvent;
      setStatus('error');
      appendChatMessage({
        role: 'system',
        content: `Error: ${event.data.error_message}`,
        metadata: { type: 'error' },
      });
    });

    eventSource.addEventListener('stream_end', () => {
      setStatus('complete');
      setProgress(100);
      eventSource.close();
    });

    return () => eventSource.close();
  }, [runId]);

  return { events, status, progress };
};
```

### Integration with Agent Graph

```typescript
// AgentPipeline.tsx

export const AgentPipeline = ({ runId }: { runId: string }) => {
  const { events, status, progress } = useAgentStream(runId);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({});

  const agentIdToNode = {
    'scene_comp': 'Scene Composition',
    'music_timing': 'Music Timing',
    'narrative': 'Narrative Flow',
    'vfx': 'VFX Integration',
    'quality_gate': 'Quality Check',
  };

  useEffect(() => {
    // Process events and update agent states
    events.forEach((event) => {
      const agentId = event.agent_id;

      if (event.type === 'agent_start') {
        setAgentStates((prev) => ({
          ...prev,
          [agentId]: { status: 'running', startTime: event.timestamp },
        }));
      } else if (event.type === 'agent_end') {
        setAgentStates((prev) => ({
          ...prev,
          [agentId]: {
            status: 'complete',
            duration: (event.timestamp - prev[agentId].startTime) / 1000,
          },
        }));
      } else if (event.type === 'error') {
        setAgentStates((prev) => ({
          ...prev,
          [agentId]: { status: 'error', error: event.data.error_message },
        }));
      }
    });
  }, [events]);

  return (
    <div className="flex gap-4 h-screen">
      {/* Agent Graph */}
      <div className="w-2/5 border-r">
        <AgentGraph
          agents={Object.entries(agentStates).map(([id, state]) => ({
            id,
            label: agentIdToNode[id],
            status: state.status,
            duration: state.duration,
            error: state.error,
          }))}
        />
        <ProgressBar value={progress} />
      </div>

      {/* Chat & Preview */}
      <div className="w-3/5 flex flex-col">
        <PreviewViewer events={events} />
        <ChatInterface runId={runId} events={events} />
      </div>
    </div>
  );
};
```

---

## 3. Chat Integration with Agent Context

### Pattern: Context-Aware Chat Messages

```typescript
// useAgentChat.ts

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    agentId?: string;
    eventType?: AgentEventType;
    timestamp?: number;
  };
}

export const useAgentChat = (runId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Append chat messages from events
  const appendMessage = (message: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: `msg-${Date.now()}`,
      },
    ]);
  };

  // Filter messages by selected agent
  const filteredMessages = selectedAgent
    ? messages.filter((m) => !m.metadata?.agentId || m.metadata.agentId === selectedAgent)
    : messages;

  // Send user message with context
  const sendMessage = async (content: string) => {
    appendMessage({ role: 'user', content });

    const response = await fetch(`/api/agent-runs/${runId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        context: {
          selectedAgentId: selectedAgent,
          runHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      }),
    });

    const data = await response.json();
    appendMessage({
      role: 'assistant',
      content: data.response,
      metadata: { agentId: selectedAgent },
    });
  };

  return {
    messages: filteredMessages,
    sendMessage,
    appendMessage,
    setSelectedAgent,
  };
};
```

### Chat Component

```typescript
// ChatInterface.tsx

export const ChatInterface = ({
  runId,
  onAgentSelected
}: Props) => {
  const { messages, sendMessage, setSelectedAgent } = useAgentChat(runId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to latest message
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-96 bg-white border rounded-lg">
      {/* Agent Filter */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <label className="text-sm font-medium">Filter by Agent:</label>
        <select
          onChange={(e) => setSelectedAgent(e.target.value || null)}
          className="ml-2 text-sm"
        >
          <option value="">All Agents</option>
          <option value="scene_comp">Scene Composition</option>
          <option value="music_timing">Music Timing</option>
          <option value="narrative">Narrative Flow</option>
          <option value="vfx">VFX Integration</option>
          <option value="quality_gate">Quality Check</option>
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the agents..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ChatMessage.tsx - Render individual messages with metadata

const ChatMessage = ({ message }: { message: ChatMessage }) => {
  const agentLabels: Record<string, string> = {
    scene_comp: '🎬 Scene Comp',
    music_timing: '🎵 Music Timing',
    narrative: '📖 Narrative',
    vfx: '✨ VFX',
    quality_gate: '✅ Quality',
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs px-3 py-2 rounded-lg
        ${message.role === 'user'
          ? 'bg-blue-600 text-white'
          : message.metadata?.agentId
          ? 'bg-gray-100 text-gray-900'
          : 'bg-green-100 text-green-900'
        }
      `}>
        {message.metadata?.agentId && (
          <div className="text-xs font-bold mb-1">
            {agentLabels[message.metadata.agentId]}
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        {message.metadata?.timestamp && (
          <div className="text-xs opacity-70 mt-1">
            {new Date(message.metadata.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 4. Timeline Preview Component

### Pattern: Frame-by-Frame Preview

```typescript
// useTimelinePreview.ts

interface TimelineFrame {
  timestamp: number; // seconds
  sceneId: string;
  thumbnail: string; // base64 or URL
  status: 'rendered' | 'rendering' | 'pending';
}

interface TimelineMarker {
  timestamp: number;
  type: 'beat' | 'scene_cut' | 'effect';
  label: string;
  agentId?: string;
}

export const useTimelinePreview = (runId: string) => {
  const [frames, setFrames] = useState<TimelineFrame[]>([]);
  const [markers, setMarkers] = useState<TimelineMarker[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onFrameGenerated = useCallback((frame: TimelineFrame) => {
    setFrames((prev) => {
      const index = prev.findIndex((f) => f.timestamp === frame.timestamp);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = frame;
        return updated;
      }
      return [...prev, frame].sort((a, b) => a.timestamp - b.timestamp);
    });
  }, []);

  const onMarkerAdded = useCallback((marker: TimelineMarker) => {
    setMarkers((prev) => [...prev, marker].sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  const seekToTime = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  return {
    frames,
    markers,
    currentTime,
    duration,
    setDuration,
    seekToTime,
    onFrameGenerated,
    onMarkerAdded,
  };
};
```

### Timeline Component

```typescript
// TimelinePreview.tsx

export const TimelinePreview = ({
  frames,
  markers,
  currentTime,
  duration,
  onSeek,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(100);

  const currentFrame = frames.find((f) => f.timestamp <= currentTime);
  const nextMarker = markers.find((m) => m.timestamp > currentTime);

  return (
    <div className="bg-black text-white p-4 rounded-lg space-y-4">
      {/* Current Frame Preview */}
      <div className="relative">
        {currentFrame ? (
          <img
            src={currentFrame.thumbnail}
            alt="Current frame"
            className="w-full h-48 object-cover rounded-lg bg-gray-800"
          />
        ) : (
          <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No frame at this time</span>
          </div>
        )}

        {/* Time Display */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-300">TIMELINE</label>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.016" // ~60fps
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Timeline Markers Track */}
      <div ref={containerRef} className="relative h-8 bg-gray-900 rounded-lg overflow-x-auto">
        {markers.map((marker) => {
          const pixelPos = (marker.timestamp / duration) * 100;
          return (
            <div
              key={`${marker.timestamp}-${marker.type}`}
              className="absolute w-0.5 bg-yellow-400 top-0 bottom-0"
              style={{ left: `${pixelPos}%` }}
              title={marker.label}
            />
          );
        })}
      </div>

      {/* Marker Info */}
      {nextMarker && (
        <div className="text-xs bg-gray-800 p-2 rounded">
          Next: {nextMarker.label} at {formatTime(nextMarker.timestamp)}
        </div>
      )}

      {/* Scene Labels */}
      <div className="flex gap-1 text-xs overflow-x-auto pb-2">
        {frames
          .filter((f) => f.sceneId)
          .map((frame, idx, arr) => {
            const nextDifferent = arr[idx + 1]?.sceneId !== frame.sceneId;
            return nextDifferent ? (
              <div
                key={frame.timestamp}
                className="px-2 py-1 bg-gray-700 rounded whitespace-nowrap"
              >
                {frame.sceneId} ({formatTime(frame.timestamp)})
              </div>
            ) : null;
          })}
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs}`;
};
```

---

## 5. Quality Gate Feedback Component

### Pattern: Structured Approval Workflow

```typescript
// useQualityGate.ts

interface QualityCheckResult {
  sceneId: string;
  checks: {
    id: string;
    name: string;
    status: 'pass' | 'flag' | 'fail';
    severity?: 'info' | 'warning' | 'error';
    message?: string;
    suggestedFix?: string;
  }[];
  overallStatus: 'approved' | 'flagged' | 'rejected';
  agentId: string;
  timestamp: number;
}

export const useQualityGate = () => {
  const [results, setResults] = useState<Record<string, QualityCheckResult>>({});
  const [overrides, setOverrides] = useState<Set<string>>(new Set());

  const addResult = useCallback((result: QualityCheckResult) => {
    setResults((prev) => ({
      ...prev,
      [result.sceneId]: result,
    }));
  }, []);

  const approveWithOverride = useCallback((sceneId: string) => {
    setOverrides((prev) => new Set([...prev, sceneId]));
  }, []);

  const getApprovalStatus = useCallback((sceneId: string) => {
    const result = results[sceneId];
    if (!result) return 'pending';
    if (overrides.has(sceneId)) return 'approved_override';
    return result.overallStatus;
  }, [results, overrides]);

  return {
    results,
    addResult,
    approveWithOverride,
    getApprovalStatus,
  };
};
```

### Quality Gate UI

```typescript
// QualityGateFeedback.tsx

export const QualityGateFeedback = ({
  result,
  onApprove,
  onReject,
  onRetry,
}: Props) => {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const statusIcon = {
    pass: '✓',
    flag: '⚠',
    fail: '✗',
  };

  const statusColor = {
    pass: 'text-green-600',
    flag: 'text-yellow-600',
    fail: 'text-red-600',
  };

  return (
    <div className="bg-white border-l-4 border-yellow-500 p-4 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Quality Check: {result.sceneId}</h3>
        <span className="text-xs text-gray-500">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Check Results */}
      <div className="space-y-2">
        {result.checks.map((check) => (
          <div key={check.id} className="border rounded-lg p-2">
            <button
              onClick={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
              className="w-full text-left flex items-center gap-2 hover:bg-gray-50 p-2 -m-2"
            >
              <span className={`font-bold ${statusColor[check.status]}`}>
                {statusIcon[check.status]}
              </span>
              <span className="flex-1 font-medium">{check.name}</span>
              {check.status === 'flag' && check.severity === 'error' && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  Blocking
                </span>
              )}
            </button>

            {/* Expanded Details */}
            {expandedCheck === check.id && (
              <div className="mt-2 p-2 bg-gray-50 rounded space-y-2 text-sm">
                {check.message && (
                  <p className="text-gray-700">{check.message}</p>
                )}
                {check.suggestedFix && (
                  <div className="bg-blue-50 border-l-2 border-blue-500 p-2">
                    <p className="text-xs font-bold text-blue-900">Suggested Fix:</p>
                    <p className="text-blue-800">{check.suggestedFix}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
        <span className="font-bold">Overall:</span>
        <span className={`font-bold ${
          result.overallStatus === 'approved' ? 'text-green-600' :
          result.overallStatus === 'flagged' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {result.overallStatus.toUpperCase()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {result.overallStatus === 'approved' && (
          <button
            onClick={onApprove}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✓ Approve & Continue
          </button>
        )}

        {result.overallStatus === 'flagged' && (
          <>
            <button
              onClick={() => setExpandedCheck(null)}
              className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              ⚠ Review Issues
            </button>
            <button
              onClick={onApprove}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Approve despite warnings"
            >
              Override & Approve
            </button>
          </>
        )}

        {result.overallStatus === 'rejected' && (
          <>
            <button
              onClick={onRetry}
              className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              🔄 Retry Scene
            </button>
            <button
              onClick={onApprove}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              title="Force approve (not recommended)"
            >
              Force Approve
            </button>
          </>
        )}

        <button
          onClick={onReject}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

---

## 6. Context Menu / Slash Commands

### Pattern: Inline Editing Commands

```typescript
// useTimelineContextMenu.ts

type TimelineCommand =
  | { type: 'extend'; duration: number }
  | { type: 'regenerate'; sceneId: string }
  | { type: 'approve'; sceneId: string }
  | { type: 'reject'; sceneId: string; reason: string }
  | { type: 'explain'; agentId: string };

export const useTimelineContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sceneId: string;
    timestamp: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, sceneId: string, timestamp: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sceneId,
      timestamp,
    });
  };

  const executeCommand = async (command: TimelineCommand) => {
    // Send command to backend
    await fetch('/api/timeline-commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    executeCommand,
    closeMenu: () => setContextMenu(null),
  };
};
```

### Context Menu Component

```typescript
// TimelineContextMenu.tsx

export const TimelineContextMenu = ({
  context,
  onCommand,
  onClose,
}: Props) => {
  if (!context) return null;

  const commands = [
    { label: 'Extend Clip', icon: '⏱️', action: () => onCommand({ type: 'extend', duration: 0.5 }) },
    { label: 'Reduce Duration', icon: '⏱️', action: () => onCommand({ type: 'extend', duration: -0.5 }) },
    { label: 'Regenerate Scene', icon: '🔄', action: () => onCommand({ type: 'regenerate', sceneId: context.sceneId }) },
    { label: 'Approve Scene', icon: '✓', action: () => onCommand({ type: 'approve', sceneId: context.sceneId }) },
    { label: 'Explain Timing', icon: '❓', action: () => onCommand({ type: 'explain', agentId: 'music_timing' }) },
  ];

  return (
    <div
      className="fixed bg-white border shadow-lg rounded-lg py-1 z-50"
      style={{
        left: `${context.x}px`,
        top: `${context.y}px`,
      }}
    >
      {commands.map((cmd) => (
        <button
          key={cmd.label}
          onClick={() => {
            cmd.action();
            onClose();
          }}
          className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 whitespace-nowrap"
        >
          <span>{cmd.icon}</span>
          <span>{cmd.label}</span>
        </button>
      ))}
      <div className="border-t my-1" />
      <button
        onClick={onClose}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-600 text-sm"
      >
        Close
      </button>
    </div>
  );
};
```

---

## 7. Backend Integration: FastAPI Streaming Endpoint

### Pattern: SSE Streaming with LangGraph

```python
# fastapi_streaming.py

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import json
from langchain_core.callbacks.base import BaseCallbackHandler
from typing import AsyncGenerator

app = FastAPI()

class StreamingCallbackHandler(BaseCallbackHandler):
    """Custom handler to emit AG-UI events"""

    def __init__(self, send_callback):
        self.send = send_callback
        self.step_count = 0

    async def on_agent_start(self, serialized, input_str, **kwargs):
        await self.send(json.dumps({
            "type": "agent_start",
            "agent_id": serialized.get("name"),
            "timestamp": time.time(),
            "data": {"input": input_str}
        }))

    async def on_tool_start(self, serialized, input_str, **kwargs):
        await self.send(json.dumps({
            "type": "tool_use",
            "agent_id": self._current_agent,
            "timestamp": time.time(),
            "data": {
                "tool_name": serialized.get("name"),
                "input": input_str
            }
        }))

    async def on_tool_end(self, output, **kwargs):
        await self.send(json.dumps({
            "type": "tool_result",
            "agent_id": self._current_agent,
            "timestamp": time.time(),
            "data": {"output": str(output)}
        }))

    async def on_agent_finish(self, finish, **kwargs):
        await self.send(json.dumps({
            "type": "agent_end",
            "agent_id": self._current_agent,
            "timestamp": time.time(),
            "data": {"output": finish.return_values}
        }))

async def event_generator(run_id: str) -> AsyncGenerator:
    """Generate AG-UI events from agent execution"""

    # Load agent run config
    run = await get_run(run_id)

    async def send_event(event_str):
        yield f"data: {event_str}\n\n"

    callback_handler = StreamingCallbackHandler(send_event)

    try:
        # Execute agent graph with streaming
        result = await run_agent_graph(
            run.config,
            callbacks=[callback_handler]
        )

        # Final completion event
        yield f"data: {json.dumps({
            'type': 'stream_end',
            'timestamp': time.time(),
            'data': {'result': result}
        })}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({
            'type': 'error',
            'timestamp': time.time(),
            'data': {'error_message': str(e)}
        })}\n\n"

@app.get("/api/agent-runs/{run_id}/stream")
async def stream_agent_run(run_id: str):
    """SSE endpoint for agent streaming"""
    return StreamingResponse(
        event_generator(run_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@app.post("/api/agent-runs/{run_id}/chat")
async def chat_with_agent(run_id: str, request: ChatRequest):
    """Chat endpoint with agent context"""
    run = await get_run(run_id)

    # Construct prompt with context
    system_prompt = f"""You are an AI assistant explaining agent decisions.
Context:
- Current Agent: {request.context.selectedAgentId}
- Run History: {json.dumps(request.context.runHistory)}

Answer questions about why agents made specific decisions."""

    response = await llm.agenerate([
        HumanMessage(content=system_prompt),
        HumanMessage(content=request.message)
    ])

    return {"response": response.content}
```

---

## Implementation Checklist

- [ ] **Phase 1: Core Architecture**
  - [ ] Reactflow graph component
  - [ ] SSE event streaming handler
  - [ ] Chat interface with message history
  - [ ] Basic timeline preview

- [ ] **Phase 2: Agent Integration**
  - [ ] AG-UI event parsing
  - [ ] Real-time node status updates
  - [ ] Progress bar from event stream
  - [ ] Agent-specific chat filtering

- [ ] **Phase 3: Interactive Features**
  - [ ] Quality gate feedback component
  - [ ] Context menu / slash commands
  - [ ] Frame-by-frame timeline
  - [ ] Timeline markers (beats, cuts)

- [ ] **Phase 4: Polish**
  - [ ] Animations & transitions
  - [ ] Keyboard shortcuts
  - [ ] Mobile responsiveness
  - [ ] Accessibility (WCAG AA)

---

## References & Resources

- Reactflow: https://reactflow.dev/
- AG-UI Protocol: https://www.marktechpost.com/2025/09/18/bringing-ai-agents-into-any-ui-the-ag-ui-protocol-for-real-time-structured-agent-frontend-streams/
- LangGraph: https://github.com/langchain-ai/langgraph
- FastAPI Streaming: https://fastapi.tiangolo.com/advanced/response-streaming/
- React Hooks: https://react.dev/reference/react
