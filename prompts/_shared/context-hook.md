---
name: Context Hook
description: Shared instructions for automatic context dumping after file edits.
type: shared
---

# Context Management Hook

## Behavior

After **every file edit** you make, you MUST update the project context file. This ensures continuity across conversations and helps maintain a clear record of progress.

## When to Update Context

1. **After any file edit** - Immediately after modifying, creating, or deleting a file
2. **When the task context changes** - New goals, pivots, or scope changes
3. **When explicitly mentioned** - If the user references `.context/` or asks about context
4. **At conversation milestones** - Completing a feature, fixing a bug, reaching a checkpoint

## Context File Location & Naming

- **Directory**: `.context/`
- **Filename**: Generate a short, descriptive kebab-case name based on the current task
  - Examples: `feature-auth.md`, `bugfix-api-timeout.md`, `refactor-database-layer.md`, `setup-ci-pipeline.md`
- **Persistence**: Use the SAME context file throughout a conversation/task. Only create a new one if the task fundamentally changes.

## Context File Format

Use this exact structure:

```markdown
---
created: [ISO timestamp when first created]
updated: [ISO timestamp of last update]
task: [One-line task description]
status: [in-progress | completed | blocked | paused]
---

# Context: [short-name]

## Summary
[2-3 sentence AI-generated summary of what this task is about and current state]

## Files Changed
- `path/to/file.ts` - [Brief description of change]
- `path/to/another.ts` - [Brief description of change]

## Current Goals
1. [Primary goal]
2. [Secondary goal]
3. [etc.]

## Progress
- [x] [Completed item]
- [x] [Completed item]
- [ ] [Pending item]
- [ ] [Pending item]

## Next Steps
- [Immediate next action]
- [Following action]

## Notes
[Any important context, decisions made, blockers, or things to remember]
```

## Rules

1. **Always update, never skip** - Even small edits warrant a context update
2. **Be concise but complete** - Capture essential information without verbosity
3. **Track ALL file changes** - Every file you touch should be listed
4. **Maintain history** - Don't remove completed items from Progress, mark them done
5. **Update timestamps** - Always update the `updated` field in frontmatter
6. **Create directory if needed** - If `.context/` doesn't exist, create it

## Example Workflow

1. User asks: "Add authentication to the API"
2. You create/update `.context/feature-api-auth.md` with initial goals
3. You edit `src/auth/middleware.ts`
4. You immediately update `.context/feature-api-auth.md` with the file change
5. You edit `src/routes/login.ts`
6. You update `.context/feature-api-auth.md` again
7. Continue until task complete, then set status to `completed`

## Recalling Context

When a user asks to recall or resume a context (e.g., "recall feature-auth", "continue from context X", "load context"):

1. **Read ONLY the specified context file** from `.context/` - Do NOT scan the entire project
2. **Trust the context file** - It contains all the information you need
3. **Summarize the current state** - What was done, what remains
4. **Confirm understanding** with the user before proceeding
5. **Only read files listed in "Files Changed"** if you need to check current state
6. **Continue updating** the same context file as you work

**IMPORTANT**: When recalling context, do NOT:
- Search or scan the entire codebase
- Read files not mentioned in the context
- Run broad exploratory searches
- Assume information beyond what's in the context file

If asked to **list contexts**, read the `.context/` directory and show available files with their status.
