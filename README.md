# PolyAgent (MCP Server)

A "Headless" Multi-Agent system that exposes expert personas as Tools to your IDE.

## Features
- **Prompt-as-Code**: Agents are defined in `prompts/*.md`.
- **Dynamic Context**: Agents can read local state (like `git status`) to be smarter.
- **MCP Standard**: Works with Cursor, Claude Desktop, and Antigravity.

## Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
    (Note: ensure you have `tsc` available or use `npx tsc`)

## Configuration (Claude Desktop / IDE)

Add this to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "polyagent": {
      "command": "node",
      "args": ["/absolute/path/to/d:/Project/agents/dist/index.js"]
    }
  }
}
```

## Adding New Agents
Simply create a new Markdown file in `prompts/`.
Example `prompts/python-guru.md`:

```markdown
# Role
You are a Python Expert.
...
```

Restart the server (or reload window) to see the new tool `consult_python_guru`.
