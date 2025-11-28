# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BEYOND-MCP** is a research and development project focused on transitioning from traditional MCP (Model Context Protocol) architecture to an advanced architecture based on **Code Execution**. The goal is to build efficient AI agents that autonomously manage MCP tools through code execution, without the need for installation as traditional MCP servers.

### Strategic Motivation

Based on Anthropic's article [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), the project addresses two critical limitations of the traditional MCP approach:

1. **Context window overload**: Tool definitions loaded upfront consume hundreds of thousands of tokens before request processing
2. **Token consumption for intermediate results**: Every tool call result passes through the model's context, causing massive inefficiencies (e.g., 50,000 token meeting transcription flowing through context twice)

### Benefits of Code Execution Architecture

- **98.7% reduction in token consumption** (from 150,000 to 2,000 tokens in complex scenarios)
- **Progressive Disclosure**: On-demand loading of tools as an explorable filesystem
- **Efficient data processing**: Local processing of large datasets without passing through context
- **Advanced control flow**: Native loops, conditionals, and error handling
- **Privacy-preserving**: Sensitive data confined to the execution environment
- **Persistence and Skills**: Saving reusable code in libraries that evolve over time

## System Architecture

### Code-First Paradigm

Instead of **directly calling** MCP tools, the agent:
1. **Explores** a filesystem structure (`servers/server-name/toolName.ts`)
2. **Reads** the required tool definitions
3. **Writes and executes** TypeScript code that interacts with MCP servers as APIs
4. **Saves** reusable patterns as "skills" in `.claude/skills/`

### Key Components

```
BEYOND-MCP/
├── servers/                    # TypeScript wrappers for MCP tools
│   └── supabase-self-hosted/   # ✅ IMPLEMENTED - PostgreSQL Database
│       ├── index.ts            # Entry point with exports
│       ├── getSchemas.ts       # List database schemas
│       ├── getTables.ts        # List tables
│       ├── getTableSchema.ts   # Table structure
│       ├── executePostgresql.ts # Execute SQL queries
│       ├── liveDangerously.ts  # Toggle safe/unsafe mode
│       └── ...                 # Other tools
├── .claude/
│   └── skills/                 # Reusable functions library
│       ├── supabase-code-exec/ # ✅ IMPLEMENTED - Supabase Skill
│       │   ├── SKILL.md
│       │   └── scripts/client-pg.ts
│       ├── magic-ui-code-exec/ # ✅ IMPLEMENTED - Magic UI Skill
│       │   ├── SKILL.md
│       │   └── scripts/client-magicui.ts
│       ├── shadcn-vue-code-exec/ # ⚡ HYBRID - shadcn-vue + MCP Skill
│       │   ├── SKILL.md
│       │   └── scripts/client-shadcn-vue.ts
│       ├── mcp-builder/        # MCP server creation guide
│       └── skill-creator/      # Skills creation guide
├── workspace/                  # Temporary working directory
├── client.ts                   # MCP Bridge (callMCPTool) ✅ IMPLEMENTED
└── Docs/                       # Strategic and visual documentation
```

### MCP Client Bridge

The heart of the system is the `callMCPTool` function that translates code calls into JSON-RPC 2.0 messages to MCP servers:

```typescript
// Usage example
import { callMCPTool } from './client.js';

// The agent's code calls:
const result = await callMCPTool('supabase__execute_query', {
  query: 'SELECT * FROM users WHERE active = true'
});
```

## Targeted MCP Servers

### Local Servers (STDIO Transport)
- `openai-gpt-image-mcp` - Image generation
- `supabase-self-hosted` - PostgreSQL Database ✅ **MIGRATED**
- `react-icons` - Icon library
- `context7` - Context management
- `magic-ui` - UI components ✅ **MIGRATED**
- `shadcn-vue-mcp` - Vue UI framework ⚡ **HYBRID** (Code Exec + MCP for AI)
- `playwright` - Browser automation
- `neon` - PostgreSQL cloud
- _Other servers under assessment_

### Remote/Plugin Servers (HTTP Transport)
- `plugin:neon-plugin:neon` - Database operations
- `sentry` - Error monitoring
- `netlify` - Deployment platform
- `stack-auth` - Authentication
- _Other servers under assessment_

> **Note**: The MCP server inventory is continuously expanding. During Phase 1 (Assessment and Inventory) additional servers to migrate will be cataloged and added.

## Migration Roadmap

The project follows a 7-phase roadmap (see [Docs/Migration Plan](Docs/Migration%20Plan:%20Transition%20from%20Traditional%20MCP%20to%20Code%20Execution%20Architecture)):

1. **Assessment and Inventory** (Week 1-2)
2. **Sandbox Configuration** (Week 2-3) - Priority: Claude Code built-in sandbox
3. **Filesystem Wrapper Generation** (Week 3-4)
4. **Client Bridge Implementation** (Week 4-5)
5. **Specialized Agents Configuration** (Week 5-6)
6. **Gradual Deployment** (Week 6-8)
7. **Optimization and Documentation** (Week 8+)

## Development Principles

### Code Patterns

**Specialized Agents must follow domain-specific best practices:**

- **Database Operations (Supabase/Neon)**:
  - The model must NEVER see raw data in bulk
  - Use batch operations
  - Wrap in try/catch
  - Save intermediate results in `workspace/`

- **Browser Automation (Playwright)**:
  - Implement retry logic
  - Use robust selectors (prefer `data-testid`)
  - Save screenshots on errors
  - Detailed progress logging

### Security

**Mandatory checklist before deployment:**
- [ ] Sandbox limits (CPU, memory, timeout)
- [ ] Automatic PII tokenization
- [ ] Restricted filesystem access (`/app/workspace` only)
- [ ] Network whitelist for MCP endpoints
- [ ] Secure environment variables (no log exposure)
- [ ] Execution log monitoring

## Utility Scripts

### Tool Wrapper Generation

```bash
# Generate TypeScript wrapper for an MCP server
python scripts/generate_tool_wrappers.py <server_name> "<server_command>"

# Example:
python scripts/generate_tool_wrappers.py supabase "npx @modelcontextprotocol/server-supabase"
```

## Success Metrics

- **Token consumption reduction**: >95% compared to traditional MCP baseline
- **Latency improvement**: Single execution vs dozens of iterations
- **Error rate**: <5%
- **Capabilities evolution**: Constant growth of skills library

## Available Skills

### supabase-code-exec
Skill to interact with Supabase without an installed MCP server. See `.claude/skills/supabase-code-exec/SKILL.md` for complete documentation.

**Quick usage:**
```typescript
import { executePostgresql, getSchemas } from './servers/supabase-self-hosted';

// Read query
const schemas = await getSchemas();
const users = await executePostgresql('SELECT * FROM users LIMIT 10;');
```

### magic-ui-code-exec
Skill to get animated UI components from Magic UI via Direct Connection to the API. See `.claude/skills/magic-ui-code-exec/SKILL.md` for complete documentation.

**Quick usage:**
```typescript
import {
  getComponent,
  getComponents,
  searchComponents,
  getInstallCommand
} from './.claude/skills/magic-ui-code-exec/scripts/client-magicui.js';

// Get a single component
const marquee = await getComponent('marquee');
console.log(marquee.content);  // Source code
console.log(marquee.install);  // Installation command

// Get multiple components together
const components = await getComponents(['shimmer-button', 'bento-grid', 'globe']);

// Search components
const buttons = searchComponents('button');
// ['shimmer-button', 'rainbow-button', 'shiny-button', ...]

// Generate combined installation command
const cmd = getInstallCommand(['marquee', 'shimmer-button']);
// npx shadcn@latest add "https://magicui.design/r/marquee.json" ...
```

### shadcn-vue-code-exec (⚡ HYBRID)
**Hybrid** skill for shadcn-vue: uses Code Execution for fast fetches and delegates to MCP for AI functionality. See `.claude/skills/shadcn-vue-code-exec/SKILL.md` for complete documentation.

**When to use Code Exec vs MCP:**
| Operation | Method |
|-----------|--------|
| Fetch component code | Code Exec |
| List/search components | Code Exec |
| User requirements analysis | MCP `requirement-structuring` |
| Quality check | MCP `component-quality-check` |

**Quick Code Execution usage:**
```typescript
import {
  getComponent,
  getComponents,
  searchComponents,
  getInstallCommand,
  extractDependencies,
  getComponentDocUrl
} from './.claude/skills/shadcn-vue-code-exec/scripts/client-shadcn-vue.js';

// Fetch component (99% token savings vs MCP)
const button = await getComponent('button');
console.log(button.files[0].content);  // Source code

// Batch fetch + dependencies
const components = await getComponents(['button', 'input', 'card']);
const deps = extractDependencies(components);
console.log(getInstallCommand(['button', 'input', 'form']));

// Documentation URL
console.log(getComponentDocUrl('components', 'button'));
```

**When to delegate to MCP:**
```typescript
// User: "I need a login form"
// → Use MCP: mcp__shadcn-vue-mcp__requirement-structuring

// Validate quality of generated Vue component
// → Use MCP: mcp__shadcn-vue-mcp__component-quality-check
```

## Operational Instructions

> **IMPORTANT**: Before creating a new Code Execution skill, **ALWAYS READ** the document [Workflow: Creating Code Execution Skill from MCP Server](Docs/Workflow:%20Creating%20Code%20Execution%20Skill%20from%20MCP%20Server). It contains templates, best practices, and lessons learned from real implementation.

## Additional Documentation

### Operational Guides
- **[Workflow: Creating Code Execution Skill](Docs/Workflow:%20Creating%20Code%20Execution%20Skill%20from%20MCP%20Server)**: **STEP-BY-STEP GUIDE** to convert MCP servers to Code Execution skills (includes Direct Connection pattern, self-contained structure, ES Modules compatibility)

### Strategic Documents
- **[Migration Plan](Docs/Migration%20Plan:%20Transition%20from%20Traditional%20MCP%20to%20Code%20Execution%20Architecture)**: Complete strategic document with detailed roadmap
- **[Critical Analysis: Alternatives to MCP](Docs/Critical%20Analysis:%20Alternatives%20to%20MCP%20-%20Bash%20and%20Code%20Execution%20Approach)**: Comparison with Zechner's Pure Bash approach

### Visual Resources
- **[MCP: The Code Execution Revolution](Docs/MCP:%20The%20Code%20Execution%20Revolution.png)**: Infographic on benefits (98.7% token reduction)
- **[AI Agents: Migration to Code Execution](Docs/AI%20Agents:%20Migration%20to%20Code%20Execution.png)**: Comparative infographic and visual roadmap

### External References
- **Anthropic Engineering Blog**: https://www.anthropic.com/engineering/code-execution-with-mcp

## Technical References

- **Protocol**: JSON-RPC 2.0 for communication with MCP servers
- **Language**: TypeScript for wrappers and skills
- **Sandbox**: Claude Code built-in (priority) or Docker/VM container
- **Monitoring**: Sentry for error tracking and performance
