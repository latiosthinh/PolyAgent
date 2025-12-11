import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "path";
import simpleGit from "simple-git";
import { PromptLoader } from "./lib/prompt-loader.js";

// Initialize Server
const server = new McpServer({
    name: "PolyAgent",
    version: "1.0.0",
});

const PROMPTS_DIR = path.join(process.cwd(), "prompts");
const loader = new PromptLoader(PROMPTS_DIR);
const git = simpleGit();

// --- Tool: Consult UI/UX Designer ---
server.tool(
    "consult_ui_ux_designer",
    {
        query: z.string().describe("The user's specific UI request"),
    },
    async ({ query }) => {
        // Load the generic UI/UX prompt
        const prompt = await loader.loadPrompt("ui-ux-designer.md");

        // We could inject live data here if needed, prompt doesn't have variables yet
        const fullResponse = `
${prompt.content}

# User Request
${query}
`;
        return {
            content: [{ type: "text", text: fullResponse }],
        };
    }
);

// --- Tool: Consult Git Manager ---
server.tool(
    "consult_git_manager",
    {
        query: z.string().describe("The user's Git-related question or request"),
    },
    async ({ query }) => {
        let statusSummary = "Unable to read git status.";
        try {
            const status = await git.status();
            statusSummary = JSON.stringify(status, null, 2);
        } catch (e) {
            statusSummary = `Error: ${e}`;
        }

        const prompt = await loader.loadPrompt("git-manager.md", {
            GIT_STATUS: statusSummary
        });

        const fullResponse = `
${prompt.content}

# User Request
${query}
`;
        return {
            content: [{ type: "text", text: fullResponse }],
        };
    }
);

// --- Tool: Consult Brainstormer ---
server.tool(
    "consult_brainstormer",
    { query: z.string().describe("The topic or problem to brainstorm about") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("brainstormer.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Docs Manager ---
server.tool(
    "consult_docs_manager",
    { query: z.string().describe("The documentation request") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("docs-manager.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult QA Automation ---
server.tool(
    "consult_qa_automation",
    { query: z.string().describe("The testing strategy or code request") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("qa-automation.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Fullstack Engineer ---
server.tool(
    "consult_fullstack_engineer",
    { query: z.string().describe("The engineering problem or architecture request") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("fullstack-engineer.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Project Manager ---
server.tool(
    "consult_project_manager",
    { query: z.string().describe("The project management or planning request") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("project-manager.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Researcher ---
server.tool(
    "consult_researcher",
    { query: z.string().describe("The research topic") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("researcher.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult MCP Manager ---
server.tool(
    "consult_mcp_manager",
    { query: z.string().describe("The MCP-related question") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("mcp-manager.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Debugger ---
server.tool(
    "consult_debugger",
    { query: z.string().describe("The error message and context") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("debugger.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

// --- Tool: Consult Code Reviewer ---
server.tool(
    "consult_code_reviewer",
    { query: z.string().describe("The code to review") },
    async ({ query }) => {
        const prompt = await loader.loadPrompt("code-reviewer.md");
        return { content: [{ type: "text", text: `${prompt.content}\n\n# User Request\n${query}` }] };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("PolyAgent MCP Server running on Stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
