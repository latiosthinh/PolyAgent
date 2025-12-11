"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptLoader = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class PromptLoader {
    promptsDir;
    constructor(promptsDir) {
        this.promptsDir = promptsDir;
    }
    async loadPrompt(filename, variables = {}) {
        const filePath = path_1.default.join(this.promptsDir, filename);
        try {
            const fileContent = await promises_1.default.readFile(filePath, 'utf-8');
            // Basic Frontmatter parsing
            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
            const match = fileContent.match(frontmatterRegex);
            if (!match) {
                // Fallback if no frontmatter
                return {
                    name: path_1.default.basename(filename, '.md'),
                    description: 'No description provided.',
                    content: this.injectVariables(fileContent, variables)
                };
            }
            const rawFrontmatter = match[1];
            const content = match[2];
            const metadata = this.parseFrontmatter(rawFrontmatter);
            return {
                name: metadata.name || path_1.default.basename(filename, '.md'),
                description: metadata.description || '',
                content: this.injectVariables(content, variables)
            };
        }
        catch (error) {
            throw new Error(`Failed to load prompt ${filename}: ${error}`);
        }
    }
    parseFrontmatter(frontmatter) {
        const lines = frontmatter.split('\n');
        const metadata = {};
        for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        }
        return metadata;
    }
    injectVariables(content, variables) {
        let result = content;
        for (const [key, value] of Object.entries(variables)) {
            // Replace {{KEY}}
            result = result.replaceAll(`{{${key}}}`, value);
        }
        return result;
    }
    async listPrompts() {
        try {
            const files = await promises_1.default.readdir(this.promptsDir);
            return files.filter(f => f.endsWith('.md'));
        }
        catch (error) {
            return [];
        }
    }
}
exports.PromptLoader = PromptLoader;
