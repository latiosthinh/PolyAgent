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
    'Cursor': '.cursor/commands',
    'Antigravity': '.agent/workflows',
    'Claude': '.claude/skills',
};

async function runInit() {
    // Welcome message
    intro('Welcome to PolyAgent CLI');

    // Step 1: Select AI IDE
    const selectedIDE = await select({
        message: 'Choose the AI IDE you want to use:',
        options: [
            { value: 'Cursor', label: 'Cursor' },
            { value: 'Claude', label: 'Claude' },
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

    // Step 4: Install prompts with shared instructions
    const targetDir = IDE_DIRECTORIES[selectedIDE as string];
    const fullTargetPath = path.join(process.cwd(), targetDir);

    const s = spinner();
    s.start(`Installing ${(selectedPrompts as string[]).length} prompt(s) to ${targetDir}...`);

    try {
        // Create target directory if it doesn't exist
        await fs.mkdir(fullTargetPath, { recursive: true });

        // Install each selected prompt with shared instructions injected
        const installPromises = (selectedPrompts as string[]).map(async (filename) => {
            // Load prompt with shared instructions injected
            const prompt = await loader.loadPrompt(filename);
            
            // Reconstruct the full file content with frontmatter
            const fullContent = `---
name: ${prompt.name}
description: ${prompt.description}
---
${prompt.content}`;
            
            if (selectedIDE === 'Claude') {
                // For Claude, create a folder with the prompt name and SKILL.md inside
                const promptName = path.basename(filename, '.md');
                const skillFolderPath = path.join(fullTargetPath, promptName);
                const skillFilePath = path.join(skillFolderPath, 'SKILL.md');
                
                // Create the skill folder
                await fs.mkdir(skillFolderPath, { recursive: true });
                
                // Write the processed content to SKILL.md
                await fs.writeFile(skillFilePath, fullContent, 'utf-8');
                return `${promptName}/SKILL.md`;
            } else {
                // For other IDEs, write directly
                const targetPath = path.join(fullTargetPath, filename);
                await fs.writeFile(targetPath, fullContent, 'utf-8');
                return filename;
            }
        });

        const installedFiles = await Promise.all(installPromises);
        s.stop(`✓ Installed ${installedFiles.length} prompt(s) successfully`);

        // Success message
        log.success(`Prompts installed to: ${targetDir}`);
        log.info(`Installed files:`);
        installedFiles.forEach(file => {
            log.info(`  - ${file}`);
        });

        outro('Installation complete! 🎉');

    } catch (error) {
        s.stop('✗ Installation failed');
        log.error(`Failed to install prompts: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
PolyAgent CLI - Install AI IDE prompts

Usage:
  poly-agent init          Initialize and install prompts
  poly-agent --help        Show this help message
  poly-agent --version     Show version

Examples:
  npx poly-agent init      Install prompts for your AI IDE
`);
}

function showVersion() {
    try {
        // Try to get version from installed package first
        const packagePath = require.resolve('poly-agent/package.json');
        const packageJson = require(packagePath);
        console.log(`poly-agent v${packageJson.version}`);
    } catch {
        try {
            // Fallback to local package.json for development
            const packageJson = require('../package.json');
            console.log(`poly-agent v${packageJson.version}`);
        } catch {
            console.log('poly-agent (version unknown)');
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'init':
            await runInit();
            break;
        case '--help':
        case '-h':
        case 'help':
            showHelp();
            break;
        case '--version':
        case '-v':
        case 'version':
            showVersion();
            break;
        case undefined:
            // No command provided, default to init for backward compatibility
            await runInit();
            break;
        default:
            log.error(`Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}

main().catch((error) => {
    console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
