# Agentic IDE - Specification Document

## Project Overview

**Project Name:** Agentic IDE
**Type:** Desktop Application (Multi-OS)
**Core Feature Summary:** An AI-powered, extensible IDE with visual workflow automation, bringing your own model (BYOM) support, and autonomous agent capabilities through MCP.
**Target Users:** Developers seeking an intelligent, agentic coding environment with visual workflow capabilities.

---

## UI/UX Specification

### Layout Structure

#### Multi-Window Model
- **Main Window:** Primary IDE interface with dockable panels
- **Dialogs:** Settings modal, Plugin manager, Git approval dialog
- **Communication:** IPC bridge between Electron main process and React renderer

#### Major Layout Areas
```
┌─────────────────────────────────────────────────────────────┐
│ Title Bar (Custom with window controls)                    │
├──────────┬────────────────────────────┬─────────────────────┤
│          │                            │                     │
│ Explorer │      Editor / Canvas       │   AI Chat Panel    │
│ (Left)   │       (Center)             │      (Right)       │
│          │                            │                     │
│ 200px    │        flex-grow           │      350px         │
│          │                            │                     │
├──────────┴────────────────────────────┴─────────────────────┤
│                    Terminal / Output Panel                  │
│                          200px                               │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design

#### Color Palette
- **Background Primary:** `#1e1e1e` (VS Code dark)
- **Background Secondary:** `#252526`
- **Background Tertiary:** `#2d2d2d`
- **Surface:** `#333333`
- **Border:** `#3e3e3e`
- **Text Primary:** `#cccccc`
- **Text Secondary:** `#858585`
- **Accent Primary:** `#0e639c` (Blue)
- **Accent Success:** `#4ec9b0` (Teal)
- **Accent Warning:** `#dcdcaa` (Yellow)
- **Accent Error:** `#f14c4c` (Red)
- **Selection:** `#264f78`

#### Typography
- **Font Family:** `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`
- **UI Font:** `'Segoe UI', 'SF Pro', system-ui, sans-serif`
- **Headings:** 18px (H1), 16px (H2), 14px (H3)
- **Body:** 13px
- **Code:** 13px monospace

#### Spacing System
- **Base Unit:** 4px
- **Small:** 4px
- **Medium:** 8px
- **Large:** 16px
- **XLarge:** 24px

#### Visual Effects
- **Panel Shadows:** `0 2px 8px rgba(0,0,0,0.3)`
- **Button Hover:** `background: #3e3e3e`
- **Transitions:** `150ms ease-in-out`
- **Border Radius:** 4px (buttons), 6px (panels), 8px (modals)

### Components

#### Title Bar
- Custom title bar with app icon, title, window controls (minimize, maximize, close)
- Drag region for window movement

#### File Explorer (Left Panel)
- Tree view with folder/file icons
- Context menu (New File, New Folder, Rename, Delete)
- File filtering with search input
- States: normal, selected, hover, expanded, collapsed

#### Editor Panel (Center)
- Monaco editor with syntax highlighting
- Tab bar for open files
- Status bar with language, line/column
- Split view support

#### Chat Panel (Right)
- Message list with user/AI distinction
- Markdown rendering with code blocks
- Input area with send button
- Tool call display

#### Terminal Panel (Bottom)
- Tabbed terminal sessions
- Command input
- Output display with ANSI color support

#### Settings Modal
- Tabbed interface (General, AI, Editor, Plugins)
- Form inputs with validation
- Save/Cancel buttons

#### Workflow Canvas (React Flow)
- Draggable nodes with connection edges
- Node types: Trigger, LLM Prompt, MCP Tool, Output
- Minimap and controls
- Grid background

---

## Functionality Specification

### Core Features

#### 1. File System Operations
- Read/write files and directories
- Create, rename, delete files/folders
- Watch for file changes
- Handle large files efficiently

#### 2. Editor Features
- Syntax highlighting for 50+ languages
- IntelliSense autocomplete
- Code folding
- Find and replace
- Multi-cursor editing
- Minimap

#### 3. AI Integration
- **Providers:** OpenAI, Anthropic, Google, Ollama, LM Studio, Custom (OpenAI-compatible)
- **Context Injection:** Current file content, selection, project context
- **Streaming:** Real-time response streaming
- **Tools:** MCP tool integration, custom tools

#### 4. MCP (Model Context Protocol)
- Client implementation for MCP servers
- Dynamic tool registration
- Server spawning and lifecycle management
- Tool schema parsing and execution

#### 5. Visual Workflow Builder
- Drag-and-drop node editor
- Graph serialization/deserialization
- Sequential execution engine
- Node type plugins

#### 6. Terminal Integration
- PTY spawning with xterm.js
- Multiple terminal sessions
- Command history

#### 7. Git Integration (From OpenCode)
- Git worktree for sandboxing
- Diff viewer
- Commit status
- Branch management

#### 8. Plugin System
- Dynamic plugin loading
- Web Worker isolation
- UI injection API
- Tool registration API

### User Interactions and Flows

#### Opening a Project
1. User clicks "Open Folder" or drags folder
2. Backend scans directory structure
3. File explorer populates tree
4. First file auto-opens in editor

#### AI Chat Flow
1. User types message in chat
2. Message sent to backend via IPC
3. Backend routes to selected AI provider
4. Response streams back to UI
5. Tools executed if needed
6. Final response rendered in chat

#### Workflow Execution
1. User designs graph in canvas
2. Clicks "Run" button
3. Backend parses graph to execution array
4. Nodes execute sequentially
5. Output piped to next node
6. Results displayed in output panel

### Data Handling

#### Local Storage
- **Settings:** Electron safeStorage (encrypted)
- **Session State:** Zustand persist to localStorage
- **Cache:** File-based cache in app data directory

#### State Management
- **Zustand Store:** Global app state (panels, files, settings)
- **Event Bus:** Backend-to-frontend event communication
- **Derived State:** Memoized selectors for UI

### Edge Cases

- Large file handling (>10MB warning)
- Network failures (retry with backoff)
- Invalid API keys (clear error message)
- Permission denied (request elevated access)
- Concurrent file edits (conflict resolution)
- MCP server crashes (auto-restart)

---

## Technical Architecture

### Stack
- **Runtime:** Bun
- **Desktop:** Electron
- **Frontend:** React 18 + TypeScript
- **State:** Zustand
- **UI Components:** Radix UI + TailwindCSS
- **Editor:** Monaco Editor
- **AI:** Vercel AI SDK
- **MCP:** @modelcontextprotocol/sdk
- **Workflow:** React Flow
- **Terminal:** xterm.js + node-pty

### Directory Structure
```
agentic-ide/
├── electron/
│   ├── main/           # Electron main process
│   └── preload/        # Preload scripts
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand stores
│   ├── services/       # Backend service wrappers
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── scripts/            # Build scripts
└── resources/          # App icons, assets
```

---

## Acceptance Criteria

### Phase 1 (Foundation)
- [ ] Project initializes without errors
- [ ] Window opens with correct dimensions
- [ ] IPC bridge functional (ping-pong test)
- [ ] Settings save/load works
- [ ] File system read/write functional

### Phase 2 (IDE Features)
- [ ] FlexLayout renders all panels
- [ ] File explorer shows folder structure
- [ ] Monaco editor loads and saves files
- [ ] Tabs work for multiple open files

### Phase 3 (AI Layer)
- [ ] Settings panel saves API keys securely
- [ ] Chat UI renders messages
- [ ] AI responds to messages
- [ ] Context injection works (current file)

### Phase 4 (MCP)
- [ ] MCP client initializes
- [ ] Tools registered from MCP servers
- [ ] Tool calls execute and return results
- [ ] Tools passed to AI correctly

### Phase 5 (Workflow)
- [ ] React Flow renders in center panel
- [ ] Nodes can be dragged and connected
- [ ] Graph execution produces results

### Phase 6 (Extensibility)
- [ ] Plugin directory scanned
- [ ] Plugins load in Web Workers
- [ ] UI elements injected from plugins

### Phase 7 (Distribution)
- [ ] Builds for Windows (.exe)
- [ ] Builds for macOS (.dmg)
- [ ] Builds for Linux (.AppImage)
- [ ] Auto-updater configured