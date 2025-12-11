import fs from 'fs/promises';
import path from 'path';

export interface AgentPrompt {
    name: string;
    description: string;
    content: string;
}

export class PromptLoader {
    private promptsDir: string;

    constructor(promptsDir: string) {
        this.promptsDir = promptsDir;
    }

    async loadPrompt(filename: string, variables: Record<string, string> = {}): Promise<AgentPrompt> {
        const filePath = path.join(this.promptsDir, filename);

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');

            // Basic Frontmatter parsing
            const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
            const match = fileContent.match(frontmatterRegex);

            if (!match) {
                // Fallback if no frontmatter
                return {
                    name: path.basename(filename, '.md'),
                    description: 'No description provided.',
                    content: this.injectVariables(fileContent, variables)
                };
            }

            const rawFrontmatter = match[1];
            const content = match[2];

            const metadata = this.parseFrontmatter(rawFrontmatter);

            return {
                name: metadata.name || path.basename(filename, '.md'),
                description: metadata.description || '',
                content: this.injectVariables(content, variables)
            };

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
            return files.filter(f => f.endsWith('.md'));
        } catch (error) {
            return [];
        }
    }
}
