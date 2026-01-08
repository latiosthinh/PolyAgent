#!/usr/bin/env node

import { intro, select, multiselect, spinner, log, outro, cancel, isCancel } from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { PromptLoader } from './lib/prompt-loader.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Get the prompts directory
async function getPromptsDir(): Promise<string> {
    // Try multiple possible locations
    const possiblePaths = [
        path.join(process.cwd(), 'prompts'), // Local development
        path.join(process.cwd(), 'node_modules', 'poly-agent', 'prompts'), // Installed package
    ];
    
    // Try to resolve via require if available
    try {
        const packagePath = require.resolve('poly-agent/package.json');
        const packageDir = path.dirname(packagePath);
        possiblePaths.unshift(path.join(packageDir, 'prompts'));
    } catch {
        // Not installed as package, continue
    }
    
    // Check which path actually exists
    for (const promptsPath of possiblePaths) {
        try {
            await fs.access(promptsPath);
            return promptsPath;
        } catch {
            continue;
        }
    }
    
    // Fallback to first option
    return possiblePaths[0];
}

// Map IDE to target directory
const IDE_DIRECTORIES: Record<string, string> = {
    'Cursor': '.cursors/commands',
    'ClaudeCode': '.claude/skills',
    'Antigravity': '.agents/workflows'
};

async function main() {
    // Welcome message
    intro('Welcome to PolyAgent CLI');

    // Step 1: Select AI IDE
    const selectedIDE = await select({
        message: 'Choose the AI IDE you want to use:',
        options: [
            { value: 'Cursor', label: 'Cursor' },
            { value: 'ClaudeCode', label: 'ClaudeCode' },
            { value: 'Antigravity', label: 'Antigravity' }
        ]
    });

    if (isCancel(selectedIDE)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Step 2: Load available prompts
    const promptsDir = await getPromptsDir();
    const loader = new PromptLoader(promptsDir);
    const promptFiles = await loader.listPrompts();

    if (promptFiles.length === 0) {
        log.error('No prompts found in the prompts directory.');
        process.exit(1);
    }

    // Load prompt metadata for display
    const promptOptions = await Promise.all(
        promptFiles.map(async (filename: string) => {
            try {
                const prompt = await loader.loadPrompt(filename);
                return {
                    value: filename,
                    label: `${prompt.name} - ${prompt.description || 'No description'}`
                };
            } catch (error) {
                return {
                    value: filename,
                    label: filename.replace('.md', '')
                };
            }
        })
    );

    // Step 3: Multi-select prompts
    const selectedPrompts = await multiselect({
        message: 'Select prompts to install (use Space to select, Enter to continue):',
        options: promptOptions,
        required: true
    });

    if (isCancel(selectedPrompts)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    // Step 4: Copy files
    const targetDir = IDE_DIRECTORIES[selectedIDE as string];
    const fullTargetPath = path.join(process.cwd(), targetDir);

    const s = spinner();
    s.start(`Installing ${(selectedPrompts as string[]).length} prompt(s) to ${targetDir}...`);

    try {
        // Create target directory if it doesn't exist
        await fs.mkdir(fullTargetPath, { recursive: true });

        // Copy each selected prompt file
        const copyPromises = (selectedPrompts as string[]).map(async (filename) => {
            const sourcePath = path.join(promptsDir, filename);
            const targetPath = path.join(fullTargetPath, filename);
            await fs.copyFile(sourcePath, targetPath);
            return filename;
        });

        const copiedFiles = await Promise.all(copyPromises);
        s.stop(`✓ Installed ${copiedFiles.length} prompt(s) successfully`);

        // Success message
        log.success(`Prompts installed to: ${targetDir}`);
        log.info(`Installed files:`);
        copiedFiles.forEach(file => {
            log.info(`  - ${file}`);
        });

        outro('Installation complete! 🎉');

    } catch (error) {
        s.stop('✗ Installation failed');
        log.error(`Failed to install prompts: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

main().catch((error) => {
    log.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
