---
name: Context Recall
description: Load and resume work from a saved context file.
---
# Context Recall

You are being asked to **resume work** from a previously saved context.

## Instructions

1. **Read the context file** specified by the user (from `.context/` directory)
2. **Understand the state** - Review the summary, files changed, goals, and progress
3. **Identify next steps** - Look at what was marked as pending or in "Next Steps"
4. **Resume seamlessly** - Continue the work as if you never left

## How to Use

The user will provide one of:
- A context file name: `feature-auth` or `feature-auth.md`
- A full path: `.context/feature-auth.md`
- Or ask you to list available contexts

## If Asked to List Contexts

Read the `.context/` directory and present available context files:

```
Available contexts:
- feature-auth.md (updated: 2026-01-12)
- bugfix-api-timeout.md (updated: 2026-01-11)
- refactor-database.md (updated: 2026-01-10)
```

## After Loading Context

1. **Summarize** what you understand about the task
2. **Confirm** the current state and what remains to be done
3. **Ask** if the user wants to continue from where it left off, or modify the approach
4. **Continue updating** the same context file as you make changes

## Example Interaction

**User**: "Recall context feature-auth"

**You**: 
> I've loaded the context for **feature-auth**:
> 
> **Summary**: Implementing JWT-based authentication for the API
> 
> **Progress**:
> - ✅ Created auth middleware
> - ✅ Set up login route
> - ⏳ Token refresh logic (in progress)
> - ⬜ Rate limiting
> 
> **Last worked on**: `src/auth/refresh.ts`
> 
> Would you like me to continue with the token refresh logic, or would you prefer to work on something else?

## Critical Rules

1. **ONLY read the context file** - Do NOT scan the entire project or codebase
2. **Trust the context file** - It contains everything you need to understand the task
3. **Read files listed in "Files Changed"** - Only if you need to understand current state
4. **Don't guess or make up content** - Only use information from the context file
5. **If context file doesn't exist** - Inform the user and offer to create one
6. **Keep the context file updated** - As you continue working

## What NOT To Do

- ❌ Do NOT search the entire codebase to "understand the project"
- ❌ Do NOT read files that aren't mentioned in the context
- ❌ Do NOT run broad searches or scans
- ❌ Do NOT assume context beyond what's in the file

## What TO Do

- ✅ Read ONLY `.context/[name].md` first
- ✅ Use the "Files Changed" section to know which files are relevant
- ✅ Read specific files from "Files Changed" if needed for current state
- ✅ Follow "Next Steps" from the context file
- ✅ Ask the user if anything is unclear
