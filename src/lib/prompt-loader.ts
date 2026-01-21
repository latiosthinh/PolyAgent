import fs from 'fs/promises';
import path from 'path';

export interface AgentPrompt {
    name: string;
    description: string;
    content: string;
}

interface SharedInstruction {
    name: string;
    content: string;
}

export class PromptLoader {
    private promptsDir: string;
    private sharedInstructionsCache: SharedInstruction[] | null = null;

    constructor(promptsDir: string) {
        this.promptsDir = promptsDir;
    }

    /**
     * Load all shared instructions from the _shared directory.
     * These will be appended to every prompt.
     */
    async loadSharedInstructions(): Promise<SharedInstruction[]> {
        // Return cached instructions if available
        if (this.sharedInstructionsCache !== null) {
            return this.sharedInstructionsCache;
        }

        const sharedDir = path.join(this.promptsDir, '_shared');
        const instructions: SharedInstruction[] = [];

        try {
            const files = await fs.readdir(sharedDir);
            const mdFiles = files.filter(f => f.endsWith('.md'));

            for (const file of mdFiles) {
                const filePath = path.join(sharedDir, file);
                const fileContent = await fs.readFile(filePath, 'utf-8');

                // Parse frontmatter to get name, extract content
                const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
                const match = fileContent.match(frontmatterRegex);

                if (match) {
                    const metadata = this.parseFrontmatter(match[1]);
                    instructions.push({
                        name: metadata.name || path.basename(file, '.md'),
                        content: match[2].trim()
                    });
                } else {
                    // No frontmatter, use entire content
                    instructions.push({
                        name: path.basename(file, '.md'),
                        content: fileContent.trim()
                    });
                }
            }
        } catch (error) {
            // _shared directory doesn't exist or is empty - that's okay
            // Return empty array, shared instructions are optional
        }

        this.sharedInstructionsCache = instructions;
        return instructions;
    }

    /**
     * Clear the shared instructions cache.
     * Useful if shared instructions are modified at runtime.
     */
    clearCache(): void {
        this.sharedInstructionsCache = null;
    }

    async loadPrompt(filename: string, variables: Record<string, string> = {}): Promise<AgentPrompt> {
        const filePath = path.join(this.promptsDir, filename);

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');

            // Basic Frontmatter parsing
            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
            const match = fileContent.match(frontmatterRegex);

            let name: string;
            let description: string;
            let content: string;

            if (!match) {
                // Fallback if no frontmatter
                name = path.basename(filename, '.md');
                description = 'No description provided.';
                content = fileContent;
            } else {
            const rawFrontmatter = match[1];
            const metadata = this.parseFrontmatter(rawFrontmatter);

                name = metadata.name || path.basename(filename, '.md');
                description = metadata.description || '';
                content = match[2];
            }

            // Inject variables
            content = this.injectVariables(content, variables);

            // Append shared instructions
            // logic moved to CLI for global installation
            /*
            const sharedInstructions = await this.loadSharedInstructions();
            if (sharedInstructions.length > 0) {
                const sharedContent = sharedInstructions
                    .map(inst => `\n---\n\n${inst.content}`)
                    .join('\n');
                content = content + sharedContent;
            }
            */

            return { name, description, content };

        } catch (error) {
            throw new Error(`Failed to load prompt ${filename}: ${error}`);
        }
    }

    private parseFrontmatter(frontmatter: string): Record<string, string> {
        const lines = frontmatter.split('\n');
        const metadata: Record<string, string> = {};

        for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim();
            }
        }
        return metadata;
    }

    private injectVariables(content: string, variables: Record<string, string>): string {
        let result = content;
        for (const [key, value] of Object.entries(variables)) {
            // Replace {{KEY}}
            result = result.replaceAll(`{{${key}}}`, value);
        }
        return result;
    }

    async listPrompts(): Promise<string[]> {
        try {
            const files = await fs.readdir(this.promptsDir);
            // Filter out _shared directory and only return .md files
            return files.filter(f => f.endsWith('.md') && !f.startsWith('_'));
        } catch (error) {
            return [];
        }
    }
}
