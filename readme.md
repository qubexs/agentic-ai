# Agentic AI

Welcome to the **Agentic AI** repository! This project serves as a comprehensive resource for understanding, building, and deploying autonomous AI agents that go beyond simple chat interfaces to reason, plan, and execute actions.

## Overview

Traditional AI responds to prompts; **Agentic AI** takes it a step further by operating with:
- **Autonomy:** Deciding which tools to use to solve problems.
- **Reasoning:** Breaking down complex tasks into manageable sub-tasks.
- **Persistence:** Maintaining state and memory over long interactions.
- **Action:** Interacting with real-world environments (APIs, databases, file systems).

## Core Tech Stack

This repository utilizes modern tools and frameworks to build robust agentic systems:
- **Orchestration:** LangChain, LangGraph
- **Protocols:** Model Context Protocol (MCP)
- **Models:** OpenAI (GPT-4o), Google Gemini (2.0 Flash), and local LLMs via Ollama
- **Storage/Vector DB:** Chroma, FAISS
- **Embeddings:** Sentence Transformers (HuggingFace)

## Project Structure

```text
├── agents/          # Agent definitions and logic
├── tools/           # Custom tool implementations for agents
├── memory/          # Memory management and vector store scripts
├── tutorials/       # Step-by-step guides and Jupyter notebooks
├── requirements.txt # Python dependencies
└── main.py          # Entry point for the application
```

## Quick Start

### Prerequisites
- Python 3.8+
- API Keys for OpenAI / Google (Optional if using local models)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/qubexs/agentic-ai.git
   cd agentic-ai
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables:
   ```bash
   export OPENAI_API_KEY='your-key-here'
   # or create a .env file
   ```

## Learning Roadmap
- [ ] **Fundamentals:** Understanding LLM orchestration.
- [ ] **Tools & Chains:** Building custom toolkits for agent use.
- [ ] **Memory Systems:** Implementing short-term and long-term memory.
- [ ] **Advanced Patterns:** Multi-agent swarms and MCP server integration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue if you have suggestions for improvement, encounter a bug, or want to add a new tutorial.

## License

This project is licensed under the MIT License.

## Resources
- [LangChain Documentation](https://python.langchain.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Agentic AI Learning Resources](https://github.com/topics/agentic-ai)