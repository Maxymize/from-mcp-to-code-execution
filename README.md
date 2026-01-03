# From MCP to Code Execution

Transform your MCP (Model Context Protocol) servers into efficient Code Execution skills and achieve **99%+ token reduction** following [Anthropic's Code Execution pattern](https://www.anthropic.com/engineering/code-execution-with-mcp).

## The Problem with Traditional MCP

Traditional MCP architecture has two critical limitations:

1. **Context Overload**: All tool definitions are loaded upfront (~100,000+ tokens before processing even begins)
2. **Intermediate Token Waste**: Every tool result transits through the model's context (e.g., a 50,000 token transcript flows through context twice)

**Real-world impact**: A complex workflow can consume 150,000+ tokens with traditional MCP.

## The Solution: Code Execution

Instead of calling MCP tools directly, the agent:
1. **Writes code** that interacts with APIs/databases directly
2. **Executes locally** - data never enters the context
3. **Returns summaries** - only essential results go to context

**Result**: The same workflow now uses ~2,000 tokens. That's a **98.7% reduction**.

## Quick Start

### Option 1: Use the Skill

Invoke the `code-execution-creator` skill in Claude Code:

```
skill: code-execution-creator
```

Then specify which MCP server you want to convert:

```
Convert the magic-ui MCP server to a Code Execution skill
```

### Option 2: Use the Agent

For a more autonomous conversion, use the specialized agent:

```
agent: mcp-to-code-execution
```

The agent will:
1. Analyze all tools exposed by the MCP server
2. Determine the optimal strategy (Direct Connection, MCP Bridge, or Hybrid)
3. Implement a TypeScript client with full feature coverage
4. Create comprehensive SKILL.md documentation
5. Generate verifiable tests with HTML reports
6. Clearly communicate if the result is 100% MIGRATED or HYBRID

## Conversion Strategies

### Strategy 1: Direct Connection (Preferred)

Bypass MCP entirely by connecting directly to the underlying API or database.

```typescript
// Instead of calling MCP tools...
const result = await mcp__magic-ui__get_component({ name: 'marquee' });

// ...fetch directly from the API
const response = await fetch('https://magicui.design/r/marquee.json');
const component = await response.json();
```

**Best for**: REST APIs, databases with native drivers, services with public endpoints

**Result**: User CAN uninstall the MCP server

### Strategy 2: MCP Bridge

When the MCP server logic is required but you still want token savings.

```typescript
import { callMCPTool } from './client.js';

// Wrap MCP calls but process results locally
const data = await callMCPTool('server__complex_operation', params);
const summary = processLocally(data);
console.log(summary); // Only this enters context
```

**Best for**: Complex business logic, internal MCP servers

### Strategy 3: Hybrid

Some tools replicated via Code Execution, others delegated to MCP.

```typescript
// Use Code Exec for data fetching (99% token savings)
const components = await getComponents(['button', 'form', 'input']);

// Use MCP for AI-powered operations (requires LLM)
// Tool: mcp__shadcn-vue-mcp__requirement-structuring
```

**Best for**: MCP servers with AI-powered tools

**Result**: User MUST keep MCP server installed

## What You Can Convert

### Installed MCP Servers

Convert MCP servers already in your `claude_desktop_config.json`:

```
Convert my installed supabase-self-hosted MCP to Code Execution
```

Benefits:
- Free up context window
- Maintain all functionality
- Faster execution (no MCP overhead)

### Non-Installed MCP Servers

Provide any MCP server (npm package, GitHub repo) and the skill will:

1. Analyze the server's tool definitions
2. Reverse-engineer the underlying API
3. Create a standalone Code Execution skill

```
Create a Code Execution skill for @anthropic/mcp-server-github
```

## Project Structure

```
.claude/
├── agents/
│   └── mcp-to-code-execution     # Autonomous conversion agent
└── skills/
    ├── code-execution-creator/   # Skill creation guide & templates
    ├── supabase-code-exec/       # PostgreSQL direct connection
    ├── magic-ui-code-exec/       # REST API direct fetch
    ├── stack-auth-code-exec/     # Documentation API (110+ docs)
    ├── stripe-code-exec/         # Payments API with sandbox support
    ├── neon-code-exec/           # Serverless Postgres API
    ├── posthog-code-exec/        # Analytics & Feature Flags API (42 tools)
    ├── sentry-code-exec/         # Error Tracking & Monitoring API
    └── shadcn-vue-code-exec/     # Hybrid (Code Exec + MCP)
```

## Included Skills

| Skill | Strategy | Token Reduction | MCP Required |
|-------|----------|-----------------|--------------|
| [supabase-code-exec](#supabase-100-migrated) | Direct Connection | 99%+ | No |
| [magic-ui-code-exec](#magic-ui-100-migrated) | Direct Connection | 99%+ | No |
| [stack-auth-code-exec](#stack-auth-100-migrated) | Direct Connection | 99%+ | No |
| [stripe-code-exec](#stripe-100-migrated) | Direct Connection | 99%+ | No |
| [neon-code-exec](#neon-100-migrated) | Direct Connection | 99%+ | No |
| [posthog-code-exec](#posthog-100-migrated) | Direct Connection | 99%+ | No |
| [sentry-code-exec](#sentry-100-migrated) | Direct Connection | 99%+ | No* |
| [shadcn-vue-code-exec](#shadcn-vue-hybrid) | Hybrid | ~80% | Yes |

*Note: Sentry's AI-powered search and Seer features require the MCP server. All standard REST API operations are fully migrated.

### Supabase (100% Migrated)

Direct PostgreSQL connection without MCP overhead.

```typescript
import { executePostgresql, getSchemas, getTables } from './client-pg.js';

// Direct database queries
const schemas = await getSchemas();
const users = await executePostgresql('SELECT * FROM users LIMIT 10');
```

**Token reduction**: 99%+
**MCP required**: No

### Magic UI (100% Migrated)

Fetch animated UI components directly from the API.

```typescript
import { getComponent, getComponents, searchComponents } from './client-magicui.js';

// Fetch components directly
const marquee = await getComponent('marquee');
const buttons = searchComponents('button');
```

**Token reduction**: 99%+
**MCP required**: No

### Stack Auth (100% Migrated)

Access Stack Auth documentation with instant local search and on-demand fetching.

```typescript
import {
  listDocs, searchDocs, getDocById, getSetupInstructions,
  listCategories, listDocsByCategory, getQuickReference
} from './client-stack-auth.js';

// Instant local search (no network)
const results = searchDocs('oauth google');
const categories = listCategories();

// Fetch only what you need (network)
const doc = await getDocById('/docs/getting-started/setup');
const setup = await getSetupInstructions();
```

**Token reduction**: 99%+
**MCP required**: No
**Coverage**: 110+ documentation pages, 13 categories

### Stripe (100% Migrated)

Full Stripe API access with Test Mode (sandbox) and Live Mode support.

```typescript
import {
  createCustomer, createPaymentIntent, confirmPaymentIntent,
  createSubscription, listProducts, createRefund,
  isTestMode, getTestCard, getSandboxSetupGuide,
  TEST_CARDS, TEST_PAYMENT_METHODS
} from './client-stripe.js';

// Check mode before operations
if (isTestMode(process.env.STRIPE_API_KEY)) {
  console.log('Safe to test!');
}

// Use test cards in sandbox
const card = getTestCard('visa'); // 4242424242424242

// Full payment flow
const customer = await createCustomer({ email: 'test@example.com' });
const intent = await createPaymentIntent({ amount: 2000, currency: 'usd' });
await confirmPaymentIntent(intent.id, { payment_method: 'pm_card_visa' });
```

**Token reduction**: 99%+
**MCP required**: No
**Coverage**: 22+ MCP tools, 60+ API functions, 46 test card scenarios

### Neon (100% Migrated)

Full Neon Serverless Postgres API access for project management, branching, and SQL execution.

```typescript
import {
  listProjects, createProject, createBranch, deleteBranch,
  runSql, runSqlTransaction, explainSql,
  getTables, getTableSchema, listSlowQueries,
  getConnectionString, listRegions,
} from './client-neon.js';

// List your projects
const { projects } = await listProjects();
console.log('Projects:', projects.map(p => p.name));

// Create a new project
const result = await createProject({
  name: 'my-app',
  region_id: 'aws-us-east-1',
  pg_version: 16
});

// Execute SQL queries
const users = await runSql({
  projectId: result.project.id,
  sql: 'SELECT * FROM users LIMIT 10'
});

// Branch-based development (Neon's killer feature)
const devBranch = await createBranch(result.project.id, {
  name: 'feature/new-schema'
});
await runSql({
  projectId: result.project.id,
  branchId: devBranch.branch.id,
  sql: 'ALTER TABLE users ADD COLUMN preferences JSONB'
});
```

**Token reduction**: 99%+
**MCP required**: No
**Coverage**: 27 MCP tools, 50+ API functions, branch management, SQL execution

### PostHog (100% Migrated)

Full PostHog API access for analytics, feature flags, experiments, error tracking, and more.

```typescript
import {
  createPostHogClient,
  getPostHogConfigFromEnv
} from './client-posthog.js';

// Initialize client
const posthog = createPostHogClient(getPostHogConfigFromEnv());

// Feature Flags
const { results: flags } = await posthog.getFeatureFlags();
await posthog.createFeatureFlag({
  key: 'new-feature',
  name: 'New Feature',
  active: true,
  rollout_percentage: 50
});

// Analytics & Insights
const { results: insights } = await posthog.getInsights({ limit: 20 });
const result = await posthog.runQuery({
  query: {
    kind: 'HogQLQuery',
    query: 'SELECT properties.$current_url, count() FROM events GROUP BY properties.$current_url'
  }
});

// Error Tracking
const { results: errors } = await posthog.listErrors({ status: 'active' });
const errorDetails = await posthog.getErrorDetails(errorId);

// Experiments
await posthog.createExperiment({
  name: 'Button Color Test',
  feature_flag_key: 'button-color',
  metrics: [{ type: 'primary', query: { kind: 'TrendsQuery' } }]
});

// Surveys
await posthog.createSurvey({
  name: 'Product Feedback',
  type: 'popover',
  questions: [
    { type: 'rating', question: 'How satisfied are you?' },
    { type: 'open', question: 'What could we improve?' }
  ]
});
```

**Token reduction**: 99%+
**MCP required**: No
**Coverage**: 42 MCP tools covering all PostHog features (dashboards, feature flags, experiments, insights, error tracking, surveys, organization management)

### Sentry (100% Migrated*)

Full Sentry API access for error tracking, issue management, releases, and monitoring.

```typescript
import {
  createSentryClient,
  getSentryConfigFromEnv
} from './client-sentry.js';

// Initialize client
const sentry = createSentryClient(getSentryConfigFromEnv());

// List unresolved errors
const issues = await sentry.listIssues({
  query: 'is:unresolved level:error',
  statsPeriod: '24h',
  sort: 'freq'
});

issues.forEach(issue => {
  console.log(`${issue.title} - ${issue.count} occurrences`);
  console.log(`Users affected: ${issue.userCount}`);
  console.log(issue.permalink);
});

// Get issue details
const issue = await sentry.getIssue('12345');
console.log(`Culprit: ${issue.culprit}`);

// Update issue status
await sentry.updateIssue('12345', { status: 'resolved' });

// Bulk operations
await sentry.bulkUpdateIssues(
  ['12345', '12346', '12347'],
  { status: 'resolved' }
);

// Releases
const release = await sentry.createRelease({
  version: '1.2.3',
  projects: ['my-project'],
  commits: [
    { id: 'abc123', message: 'Fix critical bug' }
  ]
});

// Projects & Teams
const projects = await sentry.listProjects();
const teams = await sentry.listTeams();

// DSN Management
const keys = await sentry.listProjectKeys('my-project');
const newKey = await sentry.createProjectKey('my-project', {
  name: 'Production Key'
});

// Statistics
const stats = await sentry.getOrganizationStats({
  stat: 'received',
  since: Date.now() / 1000 - 86400,  // Last 24h
  resolution: '1h'
});
```

**Token reduction**: 99%+
**MCP required**: No* (AI search and Seer require MCP)
**Coverage**: Organizations, projects, teams, issues, events, releases, DSNs, statistics

*Note: AI-powered search (`search_events`, `search_issues`) and Seer integration require the MCP server with OpenAI API key. All standard REST API operations are fully migrated for maximum efficiency.

### shadcn-vue (Hybrid)

Code Execution for fetching, MCP for AI-powered analysis.

```typescript
// Code Exec: Fast component fetching
const components = await getComponents(['button', 'form']);

// MCP: AI-powered requirement analysis (still needs MCP)
// mcp__shadcn-vue-mcp__requirement-structuring
```

**Token reduction**: ~80% on fetch operations
**MCP required**: Yes (for AI tools)

## Skill Output Structure

Each generated skill follows a self-contained structure:

```
.claude/skills/<name>-code-exec/
├── SKILL.md                    # Documentation with setup & usage
└── scripts/
    └── client-<type>.ts        # TypeScript client
```

### SKILL.md Contents

- **Frontmatter**: Name and description for Claude Code discovery
- **Setup**: One-time installation steps
- **Usage**: Code examples for all operations
- **Functions Table**: Complete API reference
- **Recommended Patterns**: Token-efficient usage
- **Troubleshooting**: Common issues and solutions
- **Hybrid Warning** (if applicable): Which MCP tools are still required

## Verifiable Tests

Generated skills include tests that produce tangible output:

```
test/
├── test-<name>-skill.ts
└── output/
    ├── test-report.html      # Visual report (open in browser)
    ├── single-fetch.json     # Real API response
    ├── batch-fetch.json      # Batch results
    └── catalog.json          # Exported catalog
```

## When NOT to Use Code Execution

Some MCP servers cannot be fully migrated:

- **AI-powered tools**: Tools that use internal LLM processing
- **Stateful operations**: Tools that maintain session state
- **Complex authentication**: OAuth flows, refresh tokens
- **Proprietary protocols**: Non-HTTP communication

These result in **HYBRID** skills where some operations use Code Execution and others delegate to MCP.

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- Node.js 18+
- TypeScript

## References

- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) - The original pattern documentation
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) - Agent design principles
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification

## License

MIT

---

<p align="center">
  <strong>Created by <a href="https://www.maxymizebusiness.com">MAXYMIZE</a></strong>
</p>

<p align="center">
  <em>Maximize efficiency. Minimize tokens.</em>
</p>
