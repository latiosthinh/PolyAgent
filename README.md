# PolyAgent

A CLI installer for AI IDE prompts - easily install commands, skills, and workflows for Cursor, ClaudeCode, and Antigravity.

## Features

- **Interactive CLI**: Beautiful command-line interface using clack prompts
- **Multi-IDE Support**: Works with Cursor, ClaudeCode, and Antigravity
- **Selective Installation**: Choose which prompts to install
- **Prompt-as-Code**: All prompts are defined in Markdown files with frontmatter

## Installation

Install and run the CLI installer:

```bash
npx poly-agent init
```

## Usage

1. **Run the installer**:
   ```bash
   npx poly-agent init
   ```

2. **Choose your AI IDE**:
   - **Cursor** → Installs to `./.cursors/commands/`
   - **ClaudeCode** → Installs to `./.claude/skills/`
   - **Antigravity** → Installs to `./.agents/workflows/`

3. **Select prompts**: Navigate through the list of available prompts, press `Space` to select/unselect, and `Enter` to continue.

4. **Installation**: The selected prompts will be copied to the appropriate directory for your chosen IDE.

## Available Prompts

- **Senior QA Automation** - Expert in Playwright, Vitest, Jest, and testing strategies
- **Researcher** - Deep information gathering and synthesis
- **UI/UX Designer** - Expert in user interface and experience design
- **Fullstack Engineer** - Full-stack development expertise
- **Git Manager** - Git workflow and repository management
- **MCP Manager** - Model Context Protocol management
- **Project Manager** - Project planning and management
- **Brainstormer** - Creative problem solving and ideation
- **Code Reviewer** - Code review and quality assurance
- **Debugger** - Debugging and troubleshooting expertise
- **Docs Manager** - Documentation creation and management

## Target Directories

Depending on your chosen IDE, prompts are installed to:

- **Cursor**: `./.cursors/commands/`
- **ClaudeCode**: `./.claude/skills/`
- **Antigravity**: `./.agents/workflows/`

## Development

To build the project locally:

```bash
npm install
npm run build
```

## License

ISC
