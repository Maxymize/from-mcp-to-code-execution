# Model Context Protocol (MCP) - Docs

The PostHog [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server enables your AI agents and tools to directly interact with PostHog's products.

## Quick install using the PostHog wizard

Besides being able to [quickly set up your project using AI](/docs/getting-started/install?tab=wizard.md), the [PostHog Wizard](https://github.com/PostHog/wizard) can also install the MCP server directly into **Cursor**, **Claude Code**, **Claude Desktop**, **VS Code** and **Zed**.

Terminal

PostHog AI

```bash
npx @posthog/wizard mcp add
```

We're working on adding more supported tools to the wizard. If you're using another option, you can manually install our MCP server with the instructions below.

## Manual install

Start by getting a personal API key using the MCP Server preset on the [user API keys settings page](https://app.posthog.com/settings/user-api-keys?preset=mcp_server).

This lets you add the MCP configuration to any desktop client you use, such as Cursor, Windsurf, or Claude Desktop.

**Don't forget to use your personal API key**

In all examples, make sure to replace the highlighted `POSTHOG_AUTH_HEADER` environment variable placeholder with the personal API key you obtained in the first step.

## Claude Code

Run the following command in your shell. The next time you run [Claude Code](https://www.anthropic.com/claude-code), it will have access to the PostHog MCP.

Terminal

PostHog AI

```bash
claude mcp add --transport http posthog https://mcp.posthog.com/mcp \
  --header "Authorization: Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}" -s user
```

## Claude Desktop

1.  Open [Claude Desktop](http://claude.ai/download) and navigate to **Settings > Developer**
2.  Click **Edit Config** to open the configuration file
3.  Update `claude_desktop_config.json` with the following configuration:

JSON

PostHog AI

```json
{
  "mcpServers": {
    "posthog": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://mcp.posthog.com/sse",
        "--header",
        "Authorization:${POSTHOG_AUTH_HEADER}"
      ],
      "env": {
        "POSTHOG_AUTH_HEADER": "Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}"
      }
    }
  }
}
```

4.  **Save** the configuration file and **restart Claude Desktop**
5.  The MCP server should show as **PostHog** in your list of Connectors found in **Settings > Connectors**

## Cursor

1.  Open [Cursor](https://cursor.com) and navigate to **Cursor Settings > Tools & Integrations**
2.  Click **New MCP Server**
3.  Update `mcp.json` with the following configuration:

JSON

PostHog AI

```json
{
  "mcpServers": {
    "posthog": {
      "url": "https://mcp.posthog.com/mcp",
      "headers": {
        "Authorization": "Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}"
      }
    }
  }
}
```

4.  **Save** the configuration file
5.  You should see **posthog** under **MCP Tools** with a green status

## Windsurf

1.  Open [Windsurf](https://windsurf.com/) and navigate to **Windsurf Settings > Cascade > MCP Servers**
2.  Click **Manage MCP Servers**
3.  Click **View raw config**
4.  Update `mcp_config.json` with the following configuration:

JSON

PostHog AI

```json
{
  "mcpServers": {
    "posthog": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://mcp.posthog.com/sse",
        "--header",
        "Authorization:${POSTHOG_AUTH_HEADER}"
      ],
      "env": {
        "POSTHOG_AUTH_HEADER": "Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}"
      }
    }
  }
}
```

## VS Code

1.  Open [Visual Studio Code](https://code.visualstudio.com/). In the command palette, run: `MCP: Open User Configuration` to open the configuration file
2.  Update `mcp.json` with the following configuration:

JSON

PostHog AI

```json
{
  "servers": {
    "posthog": {
      "type": "http",
      "url": "https://mcp.posthog.com/mcp",
      "headers": {
        "Authorization": "Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}"
      }
    }
  }
}
```

3.  **Save** the configuration file
4.  The MCP server will now be available the next time you chat with Copilot

## Zed

1.  Open [Zed](https://zed.dev) and update `settings.json` with the following configuration:

JSON

PostHog AI

```json
{
  "context_servers": {
    "posthog": {
      "enabled": true,
      "url": "https://mcp.posthog.com/mcp",
      "headers": {
        "Authorization": "Bearer {INSERT_YOUR_PERSONAL_API_KEY_HERE}"
      }
    }
  }
}
```

2.  **Save** the configuration file
3.  The PostHog MCP server will be available

Security considerations

We recommend the following best practices to mitigate security risks when using the PostHog MCP server:

-   **Use the right API key permissions:** Use the provided **MCP Server** preset in the personal API key creator. If you use the MCP in an agentic workflow on production data, scope down the API key's permissions to only the permissions you want it to use. This prevents the AI from making unintended changes to your PostHog configuration or data.

-   **Project scoping:** Scope your MCP server to a specific PostHog project, limiting access to only that project's resources. This prevents AI agents from accessing data from other projects in your PostHog account and helps maintain data isolation.

-   **Be mindful of prompt injection:** Keep in mind that LLMs can be tricked into following untrusted commands within user content. Always review and sanitize tool calls before executing them.

## Available Tools

Tools trigger actions on behalf of the user based on the goals and information already in the context of the LLM. PostHog tools are also available in our [agent toolkit](/docs/ai-engineering/agent-toolkit.md) which can be integrated with AI agent frameworks like Vercel's AI SDK and LangChain.

Here's a list of tools we provide:

### Dashboards

| Tool | Purpose |
| --- | --- |
| add-insight-to-dashboard | Add an existing insight to a dashboard. |
| dashboard-create | Create a new dashboard in the project. |
| dashboard-delete | Delete a dashboard by ID. |
| dashboard-get | Get a specific dashboard by ID, including insights that are on the dashboard. |
| dashboard-update | Update an existing dashboard by ID. |
| dashboards-get-all | Get all dashboards in the project with optional filtering. |

### Documentation

| Tool | Purpose |
| --- | --- |
| docs-search | Search the PostHog documentation for information. |

### Error tracking

| Tool | Purpose |
| --- | --- |
| error-details | Get the details of an error in the project. |
| list-errors | List errors in the project. |

### Events & properties

| Tool | Purpose |
| --- | --- |
| event-definitions-list | List all event definitions in the project with optional filtering. |
| properties-list | Get properties for events or persons. |

### Experiments

| Tool | Purpose |
| --- | --- |
| experiment-create | Create A/B test experiment with guided metric and feature flag setup |
| experiment-delete | Delete an experiment by ID. |
| experiment-get | Get details of a specific experiment. |
| experiment-get-all | Get all experiments in the project. |
| experiment-results-get | Get comprehensive experiment results including metrics and exposure data. |
| experiment-update | Update an existing experiment with lifecycle management and restart capability. |

### Feature flags

| Tool | Purpose |
| --- | --- |
| create-feature-flag | Creates a new feature flag in the project. |
| delete-feature-flag | Delete a feature flag in the project. |
| feature-flag-get-all | Get all feature flags in the project. |
| feature-flag-get-definition | Get the definition of a feature flag. |
| update-feature-flag | Update a feature flag in the project. |

### Insights & analytics

| Tool | Purpose |
| --- | --- |
| insight-create-from-query | Save a query as an insight. |
| insight-delete | Delete an insight by ID. |
| insight-get | Get a specific insight by ID. |
| insight-query | Execute a query on an existing insight to get its results/data. |
| insight-update | Update an existing insight by ID. |
| insights-get-all | Get all insights in the project with optional filtering. |
| query-generate-hogql-from-question | Queries project's PostHog data based on a provided natural language question. |
| query-run | Run a trend, funnel or HogQL query. |

### LLM analytics

| Tool | Purpose |
| --- | --- |
| get-llm-total-costs-for-project | Fetches the total LLM daily costs for each model for a project over a given number of days. |

### Organization & project management

| Tool | Purpose |
| --- | --- |
| organization-details-get | Get the details of the active organization. |
| organizations-get | Get the organizations the user has access to. |
| projects-get | Fetches projects that the user has access to in the current organization. |
| property-definitions | Get event and property definitions for the project. |
| switch-organization | Change the active organization from the default organization. |
| switch-project | Change the active project from the default project. |

### Surveys

| Tool | Purpose |
| --- | --- |
| survey-create | Creates a new survey in the project. |
| survey-delete | Delete a survey by ID. |
| survey-get | Get a specific survey by ID. |
| survey-stats | Get response statistics for a specific survey. |
| survey-update | Update an existing survey by ID. |
| surveys-get-all | Get all surveys in the project with optional filtering. |
| surveys-global-stats | Get aggregated response statistics across all surveys. |

## Prompts and resources

The MCP server provides **resources**, including framework-specific documentation and example code, to help agents build great PostHog integrations. You can try these yourself using the `posthog:posthog-setup` **prompt**, available via a slash command in your agent. Just hit the `/` key.

Currently we support Next.js, with more frameworks in progress.

## Next Steps

-   [PostHog MCP server](https://github.com/PostHog/posthog/tree/master/products/mcp): Check out GitHub repository for the MCP server
-   [Model Context Protocol](https://modelcontextprotocol.io/introduction): Learn more about the Model Context Protocol specification
-   [MCP: machine/copy paste](/blog/machine-copy-paste-mcp-intro.md): What exactly is MCP again?

### Community questions

Ask a question

### Was this page useful?

HelpfulCould be better