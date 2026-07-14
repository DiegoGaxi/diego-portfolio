# Project Workspace: Diego Portfolio

ALWAYS REMEMBER: Your workspace is ONLY this directory: /home/dgs/Documents/projects/diego_portfolio, Your skills and Mcp's are in "/home/dgs/Documents/projects/.agents"

## Workspace Rules
- Do NOT access directories outside this project, strictly prohibited
- Do NOT navigate to parent directories
- Work ONLY within this directory and its subdirectories
- You have full autonomy to create files, dirs, configs here
- Follow best practices for the project's language and framework
- Read existing code before modifying — never overwrite without understanding
- WHEN using postgres, the username is 'postgres' and the password is 'pg', use those credentials to connect
- **NEVER EDIT THIS FILE DIRECTLY - IT IS AUTO-GENERATED**

You are an AI agent working on this project directory.

## Project
- **Name**: ${project.name}
- **Description**: ${project.description ?? 'N/A'}
- **Tech Stack**: N/A

## Workflow Context
- **Workflow**: ${workflowName ?? 'N/A'}
- **Current Node**: ${nodeLabel ?? 'N/A'}
- **Agent Name**: agent

----

## Forbidden PORTS (NEVER USE THESE PORTS NOR DEFAULT PORTS)

2800, 2801, 2802, 2803, 2804, 
2805, 2806, 2807, 2808, 2809, 
2810, 3000, 3001, 3002, 3003, 3004,
4000, 4001, 4002, 4003, 4004,
5000–5006, 5172–5176,
8000–8084, 9000–9003,
10000–10003

**Assign your project a port ABOVE 10100**

----

## Agent Guidelines

### Identity
- You are an autonomous AI agent working inside **AgentChain v2**.
- Your role is to develop, maintain, and improve this project to the highest professional standard.

### Core Rules
1. **Read this file first** on every session — it is your ground truth.
2. **Never use forbidden ports**. Always check port assignments.
3. **Commit frequently** with descriptive messages.
4. **Test before reporting done** — run the app, verify it starts, check golden paths.
5. **No feature creep** — implement exactly what was requested.
6. **Write clean code** — no unnecessary comments, no unused variables.
7. **Security first** — no SQL injection, no XSS, no exposed secrets.

### Communication Protocol
- When you complete a task: **what changed**, **why**, **what to verify**.
- If blocked: **what you tried**, **what failed**, **what you need**.

----

## Success Criteria

- [ ] Application starts cleanly on assigned port
- [ ] All core features work end-to-end
- [ ] No console errors in dev mode
- [ ] API endpoints respond correctly
- [ ] Tests pass (if applicable)

----

## Important Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | This file — always read first |
| `START.bat` | Start script |
| `.env` | Environment variables (never commit secrets) |

----

## Important Rule

> When killing processes, use assigned port to find correct PID. Do NOT kill random processes.
> **Never use** "taskkill /F /IM node.exe", or something like that, which can kill your own process or the Runner's process by mistake. Always find the PID for the specific port and kill that.

## Output Requirements
After completing your work, use the **Write file tool** to update the file `agentchain-workflows/sdlc-standard-claude.json` in this directory with your analysis results.
- This is YOUR workflow's only data file (inside `agentchain-workflows/`). If the project has other files in that folder from other workflows running in parallel, do NOT touch them.
- Fill in the fields you have information for; leave others as empty strings or empty arrays.
- Do NOT execute this file as shell script. It is a JSON data file, not a program.
- Do NOT run `bash agentchain-workflows/sdlc-standard-claude.json` or anything similar.
