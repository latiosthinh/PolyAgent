"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const simple_git_1 = __importDefault(require("simple-git"));
const prompt_loader_js_1 = require("./lib/prompt-loader.js");
// Initialize Server
const server = new mcp_js_1.McpServer({
    name: "PolyAgent",
    version: "1.0.0",
});
const PROMPTS_DIR = path_1.default.join(process.cwd(), "prompts");
const loader = new prompt_loader_js_1.PromptLoader(PROMPTS_DIR);
const git = (0, simple_git_1.default)();
// --- Tool: Consult UI/UX Designer ---
server.tool("consult_ui_ux_designer", {
    query: zod_1.z.string().describe("The user's specific UI request"),
}, async ({ query }) => {
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
});
// --- Tool: Consult Git Manager ---
server.tool("consult_git_manager", {
    query: zod_1.z.string().describe("The user's Git-related question or request"),
}, async ({ query }) => {
    let statusSummary = "Unable to read git status.";
    try {
        const status = await git.status();
        statusSummary = JSON.stringify(status, null, 2);
    }
    catch (e) {
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
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("PolyAgent MCP Server running on Stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
