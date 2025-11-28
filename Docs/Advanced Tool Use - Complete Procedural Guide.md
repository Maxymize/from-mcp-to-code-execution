# Advanced Tool Use - Complete Procedural Guide

> Based on Anthropic's article: https://www.anthropic.com/engineering/advanced-tool-use
> Release Date: November 24, 2025 (Beta)

---

## Table of Contents

1. [Overview and Problem](#1-overview-and-problem)
2. [The Three Main Features](#2-the-three-main-features)
3. [Feature 1: Tool Search Tool](#3-feature-1-tool-search-tool)
4. [Feature 2: Programmatic Tool Calling (PTC)](#4-feature-2-programmatic-tool-calling-ptc)
5. [Feature 3: Tool Use Examples](#5-feature-3-tool-use-examples)
6. [Integration Strategy](#6-integration-strategy)
7. [Best Practices](#7-best-practices)
8. [Practical Implementation](#8-practical-implementation)
9. [Metrics and Benchmarks](#9-metrics-and-benchmarks)
10. [References](#10-references)

---

## 1. Overview and Problem

### The Vision

> "The future of AI agents is one where models work seamlessly across hundreds or thousands of tools."

Future AI agents will need to manage hundreds or thousands of tools simultaneously. The traditional approach (loading all definitions upfront) creates three critical bottlenecks:

### The Three Fundamental Problems

| Problem | Description | Impact |
|---------|-------------|--------|
| **Token Consumption** | Definitions from 5 MCP servers (GitHub, Slack, Sentry, Grafana, Splunk) consume ~55K tokens | Context window saturated before even starting |
| **Accuracy Issues** | Similar tool names (e.g., `notification-send-user` vs `notification-send-channel`) | Tool selection errors |
| **Context Pollution** | Intermediate results from large datasets | Context window overflow |

### Concrete Problem Example

**Scenario**: Team expense analysis
- 20 team members
- 50-100 expense entries per member
- **Total**: 2,000+ elements in context (~50KB+)

With the traditional approach, Claude must see ALL 2,000+ records to then filter them. With the new features, it only sees the final aggregated result.

---

## 2. The Three Main Features

Anthropic introduced three complementary beta features:

| Feature | Problem Solved | Token Savings |
|---------|----------------|---------------|
| **Tool Search Tool** | Too many tool definitions loaded | 85% reduction |
| **Programmatic Tool Calling** | Intermediate results too large | 37% reduction |
| **Tool Use Examples** | Errors in complex parameters | N/A (quality) |

### When to Use What

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION TREE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Do you have >10K tokens in tool definitions?                   │
│  ├── YES → Tool Search Tool                                     │
│  └── NO ↓                                                       │
│                                                                  │
│  Are intermediate results large (>5KB)?                         │
│  ├── YES → Programmatic Tool Calling                            │
│  └── NO ↓                                                       │
│                                                                  │
│  Frequent parameter errors?                                     │
│  ├── YES → Tool Use Examples                                    │
│  └── NO → Traditional approach is fine                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature 1: Tool Search Tool

### Purpose

Eliminate upfront loading of all tool definitions. Claude searches for tools when needed.

### How It Works

1. **Initial State**: Tools are "deferred" - only name and description in context
2. **Search**: Claude uses `tool_search_tool_regex` to find relevant tools
3. **Loading**: Only necessary tools are fully loaded

### JSON Implementation

```json
{
  "tools": [
    {
      "type": "tool_search_tool_regex_20251119",
      "name": "tool_search_tool_regex"
    },
    {
      "name": "github.createPullRequest",
      "description": "Create a pull request in a GitHub repository",
      "input_schema": {
        "type": "object",
        "properties": {
          "repo": {"type": "string"},
          "title": {"type": "string"},
          "body": {"type": "string"},
          "base": {"type": "string"},
          "head": {"type": "string"}
        },
        "required": ["repo", "title", "base", "head"]
      },
      "defer_loading": true
    },
    {
      "name": "github.listIssues",
      "description": "List issues in a repository",
      "input_schema": {...},
      "defer_loading": true
    }
  ]
}
```

### For MCP Servers

```json
{
  "type": "mcp_toolset",
  "mcp_server_name": "google-drive",
  "default_config": {
    "defer_loading": true
  },
  "configs": {
    "search_files": {
      "defer_loading": false
    }
  }
}
```

**Note**: `search_files` is always loaded (frequent), others are deferred.

### Performance Metrics

| Model | Before | After | Improvement |
|-------|--------|-------|-------------|
| Opus 4 | 49% accuracy | 74% accuracy | +25 points |
| Opus 4.5 | 79.5% accuracy | 88.1% accuracy | +8.6 points |
| Context | 77K tokens | 8.7K tokens | **-85%** |

### When to Use

**YES:**
- >10K tokens in tool definitions
- Multiple MCP servers
- Accuracy issues in tool selection

**NO:**
- <10 total tools
- All tools used in every session

### Recommended System Prompt

```
You have access to tools for Slack, Google Drive, Jira, GitHub, and Sentry.
Use the tool search capability to find specific functionality when needed.
The most common operations (search, send message, create issue) are always available.
```

---

## 4. Feature 2: Programmatic Tool Calling (PTC)

### Purpose

Allow Claude to orchestrate tools via Python code instead of individual API calls. Intermediate results **never enter** Claude's context.

### The Complete Flow (4 Steps)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROGRAMMATIC TOOL CALLING FLOW                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: Tool Definition with allowed_callers                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                 │   │
│  │   "tools": [                                                      │   │
│  │     {"type": "code_execution_20250825", "name": "code_execution"},│   │
│  │     {                                                             │   │
│  │       "name": "get_expenses",                                     │   │
│  │       "allowed_callers": ["code_execution_20250825"]  ← OPT-IN   │   │
│  │     }                                                             │   │
│  │   ]                                                               │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              ↓                                           │
│  STEP 2: Claude generates orchestration code                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                 │   │
│  │   "type": "server_tool_use",                                      │   │
│  │   "id": "srvtoolu_abc",                                           │   │
│  │   "name": "code_execution",                                       │   │
│  │   "input": {                                                      │   │
│  │     "code": "team = get_team_members('eng')\n..."                 │   │
│  │   }                                                               │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              ↓                                           │
│  STEP 3: Tools executed WITH "caller" metadata                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                 │   │
│  │   "type": "tool_use",                                             │   │
│  │   "id": "toolu_xyz",                                              │   │
│  │   "name": "get_expenses",                                         │   │
│  │   "input": {"user_id": "emp_123", "quarter": "Q3"},               │   │
│  │   "caller": {                             ← NEW FIELD             │   │
│  │     "type": "code_execution_20250825",                            │   │
│  │     "tool_id": "srvtoolu_abc"                                     │   │
│  │   }                                                               │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              ↓                                           │
│  STEP 4: Only final output in context                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ {                                                                 │   │
│  │   "type": "code_execution_tool_result",                           │   │
│  │   "tool_use_id": "srvtoolu_abc",                                  │   │
│  │   "content": {                                                    │   │
│  │     "stdout": "[{\"name\": \"Alice\", \"spent\": 12500}...]"      │   │
│  │   }                                                               │   │
│  │ }                                                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Claude sees ONLY this ↑ not the 2000+ processed entries               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detailed Implementation

#### Step 1: Define Tools with `allowed_callers`

```json
{
  "tools": [
    {
      "type": "code_execution_20250825",
      "name": "code_execution"
    },
    {
      "name": "get_team_members",
      "description": "Get all members of a department. Returns list of {id, name, level, department}.",
      "input_schema": {
        "type": "object",
        "properties": {
          "department": {
            "type": "string",
            "description": "Department name (e.g., 'engineering', 'sales')"
          }
        },
        "required": ["department"]
      },
      "allowed_callers": ["code_execution_20250825"]
    },
    {
      "name": "get_expenses",
      "description": "Get expense records for an employee in a quarter. Returns list of {id, amount, category, date, description}.",
      "input_schema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "quarter": {"type": "string", "enum": ["Q1", "Q2", "Q3", "Q4"]}
        },
        "required": ["user_id", "quarter"]
      },
      "allowed_callers": ["code_execution_20250825"]
    },
    {
      "name": "get_budget_by_level",
      "description": "Get budget limits for an employee level. Returns {travel_limit, equipment_limit, training_limit}.",
      "input_schema": {
        "type": "object",
        "properties": {
          "level": {"type": "string"}
        },
        "required": ["level"]
      },
      "allowed_callers": ["code_execution_20250825"]
    }
  ]
}
```

**IMPORTANT**: The `allowed_callers` key is the **opt-in** that allows the tool to be called from code.

#### Step 2: Claude Generates the Code

When Claude receives a request like "Who exceeded the travel budget in Q3?", it generates:

```json
{
  "type": "server_tool_use",
  "id": "srvtoolu_abc123",
  "name": "code_execution",
  "input": {
    "code": "import asyncio\nimport json\n\n# Fetch team members\nteam = await get_team_members('engineering')\n\n# Get unique levels and fetch budgets in parallel\nlevels = list(set(m['level'] for m in team))\nbudget_results = await asyncio.gather(*[\n    get_budget_by_level(level) for level in levels\n])\nbudgets = {level: budget for level, budget in zip(levels, budget_results)}\n\n# Fetch all expenses in parallel\nexpenses = await asyncio.gather(*[\n    get_expenses(m['id'], 'Q3') for m in team\n])\n\n# Find employees who exceeded travel budget\nexceeded = []\nfor member, exp in zip(team, expenses):\n    budget = budgets[member['level']]\n    total = sum(e['amount'] for e in exp if e['category'] == 'travel')\n    if total > budget['travel_limit']:\n        exceeded.append({\n            'name': member['name'],\n            'spent': total,\n            'limit': budget['travel_limit']\n        })\n\nprint(json.dumps(exceeded, indent=2))"
  }
}
```

#### Step 3: Tool Execution with `caller` Field

For each tool call in the code, your system receives:

```json
{
  "type": "tool_use",
  "id": "toolu_xyz789",
  "name": "get_expenses",
  "input": {
    "user_id": "emp_123",
    "quarter": "Q3"
  },
  "caller": {
    "type": "code_execution_20250825",
    "tool_id": "srvtoolu_abc123"
  }
}
```

**The `caller` field indicates**:
- This request comes from the code execution environment
- The result must return to the execution environment, NOT to Claude

#### Step 4: Result Return

After ALL tool calls are completed and the code has finished execution:

```json
{
  "type": "code_execution_tool_result",
  "tool_use_id": "srvtoolu_abc123",
  "content": {
    "stdout": "[\n  {\"name\": \"Alice\", \"spent\": 12500, \"limit\": 10000},\n  {\"name\": \"Bob\", \"spent\": 8200, \"limit\": 5000}\n]",
    "stderr": "",
    "exit_code": 0
  }
}
```

**Claude sees ONLY this final output**, not the 2000+ expense entries processed.

### Complete Example of Generated Python Code

```python
import asyncio
import json

# Step 1: Fetch all team members
team = await get_team_members("engineering")

# Step 2: Get unique levels and fetch budgets in parallel
levels = list(set(m["level"] for m in team))
budget_results = await asyncio.gather(*[
    get_budget_by_level(level) for level in levels
])
budgets = {level: budget for level, budget in zip(levels, budget_results)}

# Step 3: Fetch ALL expenses in parallel (this is the big data operation)
expenses = await asyncio.gather(*[
    get_expenses(m["id"], "Q3") for m in team
])

# Step 4: Process locally - Claude never sees this data
exceeded = []
for member, exp in zip(team, expenses):
    budget = budgets[member["level"]]
    travel_total = sum(e["amount"] for e in exp if e["category"] == "travel")

    if travel_total > budget["travel_limit"]:
        exceeded.append({
            "name": member["name"],
            "spent": travel_total,
            "limit": budget["travel_limit"],
            "overage": travel_total - budget["travel_limit"]
        })

# Step 5: Output only the final result
print(json.dumps(exceeded, indent=2))
```

### Document Return Formats

**CRITICAL**: For PTC to work, tool descriptions must specify the return format:

```json
{
  "name": "get_orders",
  "description": "Fetch orders for a customer.\n\nReturns:\n  List of order objects, each containing:\n  - id (str): Order identifier (e.g., 'ORD-12345')\n  - total (float): Order total in USD\n  - status (str): One of 'pending', 'shipped', 'delivered'\n  - items (list): Array of {sku, quantity, price}\n  - created_at (str): ISO 8601 timestamp",
  "input_schema": {...},
  "allowed_callers": ["code_execution_20250825"]
}
```

### Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total tokens | 43,588 | 27,297 | **-37%** |
| Knowledge retrieval | 25.6% | 28.5% | +2.9 points |
| GIA benchmarks | 46.5% | 51.2% | +4.7 points |

### When to Use PTC

**YES:**
- Large datasets requiring aggregation
- 3+ dependent tool calls
- Need to filter/transform data
- Parallel operations on many elements

**NO:**
- Single tool invocations
- Tasks requiring Claude to see ALL intermediate data
- Quick lookups with small responses

### Real-World Use Case: Claude for Excel

Claude for Excel uses PTC to handle spreadsheets with thousands of rows. Instead of loading all cells into context, Claude writes code that:

1. Reads necessary data
2. Processes locally (sums, filters, pivots)
3. Returns only the final result

---

## 5. Feature 3: Tool Use Examples

### Purpose

JSON Schema defines **structure**, but cannot express **usage patterns**. Examples show conventions, optional parameter inclusion, and parameter correlations.

### Implementation

```json
{
  "name": "create_ticket",
  "description": "Create a support ticket in the system",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": {"type": "string"},
      "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
      "labels": {"type": "array", "items": {"type": "string"}},
      "reporter": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "contact": {
            "type": "object",
            "properties": {
              "email": {"type": "string"},
              "phone": {"type": "string"}
            }
          }
        }
      },
      "due_date": {"type": "string"},
      "escalation": {
        "type": "object",
        "properties": {
          "level": {"type": "integer"},
          "notify_manager": {"type": "boolean"},
          "sla_hours": {"type": "integer"}
        }
      }
    },
    "required": ["title"]
  },
  "input_examples": [
    {
      "title": "Login page returns 500 error",
      "priority": "critical",
      "labels": ["bug", "authentication", "production"],
      "reporter": {
        "id": "USR-12345",
        "name": "Jane Smith",
        "contact": {
          "email": "jane@acme.com",
          "phone": "+1-555-0123"
        }
      },
      "due_date": "2024-11-06",
      "escalation": {
        "level": 2,
        "notify_manager": true,
        "sla_hours": 4
      }
    },
    {
      "title": "Add dark mode support",
      "labels": ["feature-request", "ui"],
      "reporter": {
        "id": "USR-67890",
        "name": "Alex Chen"
      }
    },
    {
      "title": "Update API documentation"
    }
  ]
}
```

### What Claude Learns

From these 3 examples, Claude learns:

| Pattern | Learning |
|---------|----------|
| Date format | `YYYY-MM-DD` |
| ID convention | Pattern `USR-XXXXX` |
| Label format | kebab-case (`feature-request`, not `Feature Request`) |
| Nested structures | When to include `contact` (only for main reporters) |
| Parameter correlation | `critical` priority → complete `escalation` details |

### Best Practices for Examples

1. **Behavioral variety**: Show minimal, partial, and full specification
2. **Realistic data**: Use real city names, plausible prices
3. **Focus on ambiguity**: Don't duplicate constraints already in schema
4. **1-5 examples per tool**: More examples don't always = better

### Metrics

Accuracy on complex parameters: **72% → 90%** (+18 points)

### When to Use

**YES:**
- Complex nested structures
- Many optional parameters with inclusion patterns
- Domain-specific API conventions
- Similar tools requiring differentiation

**NO:**
- Simple tools with a single parameter
- Standard formats (URLs, emails already validated)

---

## 6. Integration Strategy

### Layered Approach

**DON'T** use all features simultaneously. Identify the main bottleneck:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION STRATEGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Identify the primary problem                          │
│  ├── Context bloat from definitions → Tool Search Tool          │
│  ├── Large intermediate results → Programmatic Tool Calling     │
│  └── Parameter errors → Tool Use Examples                       │
│                                                                  │
│  Layer 2: Implement the main feature                            │
│                                                                  │
│  Layer 3: Measure the impact                                    │
│                                                                  │
│  Layer 4: Add features incrementally if needed                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Setup by Scenario

#### Scenario A: Many MCP Servers

```json
{
  "tools": [
    {"type": "tool_search_tool_regex_20251119", "name": "tool_search_tool_regex"},
    {
      "type": "mcp_toolset",
      "mcp_server_name": "github",
      "default_config": {"defer_loading": true},
      "configs": {
        "createIssue": {"defer_loading": false},
        "createPullRequest": {"defer_loading": false}
      }
    },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "slack",
      "default_config": {"defer_loading": true},
      "configs": {
        "sendMessage": {"defer_loading": false}
      }
    }
  ]
}
```

#### Scenario B: Massive Data Processing

```json
{
  "tools": [
    {"type": "code_execution_20250825", "name": "code_execution"},
    {
      "name": "fetch_transactions",
      "description": "Fetch financial transactions.\n\nReturns:\n  List of transaction objects containing:\n  - id (str): Transaction ID\n  - amount (float): Amount in USD\n  - category (str): Expense category\n  - date (str): ISO 8601 date",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"]
    },
    {
      "name": "get_budget",
      "description": "Get budget for a category.\n\nReturns:\n  Object with:\n  - category (str): Budget category\n  - limit (float): Monthly limit in USD\n  - spent (float): Amount spent this month",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"]
    }
  ]
}
```

#### Scenario C: Complex API with Conventions

```json
{
  "tools": [
    {
      "name": "create_order",
      "description": "Create a new order in the system",
      "input_schema": {...},
      "input_examples": [
        {
          "customer_id": "CUST-001",
          "items": [{"sku": "PROD-ABC", "quantity": 2}],
          "shipping": {"method": "express", "address_id": "ADDR-123"}
        },
        {
          "customer_id": "CUST-002",
          "items": [{"sku": "PROD-XYZ", "quantity": 1}]
        }
      ]
    }
  ]
}
```

---

## 7. Best Practices

### For Tool Search Tool

1. **Write descriptive descriptions**: Enable accurate matching
2. **Keep 3-5 frequent tools always loaded**: `defer_loading: false`
3. **Defer the rest**: `defer_loading: true`
4. **Guide in system prompt**: Explain which capabilities are available

### For Programmatic Tool Calling

1. **Document return formats** in detail in descriptions
2. **Mark idempotent operations** with `allowed_callers`
3. **Specify return structure**:

```
Returns:
  List of order objects, each containing:
  - id (str): Order identifier
  - total (float): Order total in USD
  - status (str): One of 'pending', 'shipped', 'delivered'
  - items (list): Array of {sku, quantity, price}
  - created_at (str): ISO 8601 timestamp
```

4. **Don't enable tools that modify critical state** for PTC (evaluate case by case)

### For Tool Use Examples

1. **1-5 examples per tool**: Show variety, not volume
2. **Realistic data**: "New York", not "City1"
3. **Show inclusion patterns**: When to omit optional fields
4. **Don't duplicate schema**: Focus on behavior, not structure

---

## 8. Practical Implementation

### API Invocation

```python
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    betas=["advanced-tool-use-2025-11-20"],
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    system="You are a helpful assistant with access to company tools...",
    tools=[
        # Tool Search
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        # Code Execution
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        # Your tools with all features
        {
            "name": "get_employees",
            "description": "Get employees by department.\n\nReturns:\n  List of employee objects with id, name, level, department.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "department": {"type": "string"}
                },
                "required": ["department"]
            },
            "defer_loading": True,  # Tool Search
            "allowed_callers": ["code_execution_20250825"],  # PTC
            "input_examples": [  # Examples
                {"department": "engineering"},
                {"department": "sales"}
            ]
        }
    ],
    messages=[
        {"role": "user", "content": "Who exceeded their travel budget in Q3?"}
    ]
)
```

### PTC Response Handling

```python
import json

def handle_response(response):
    for block in response.content:
        if block.type == "tool_use":
            # Check if it's from code execution
            if hasattr(block, 'caller') and block.caller:
                # This is a PTC tool call
                result = execute_tool(block.name, block.input)
                # Return to code execution environment, NOT to Claude
                return {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result)
                }
            else:
                # Regular tool call - return to Claude
                result = execute_tool(block.name, block.input)
                return {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result)
                }

        elif block.type == "server_tool_use":
            # Code execution block
            # Execute the code and handle nested tool calls
            pass
```

### Complete Loop for PTC

```python
async def handle_ptc_execution(code_execution_block):
    """
    Handle a code_execution server_tool_use block.
    Execute the code, handle tool calls, return final output.
    """
    code = code_execution_block.input["code"]
    tool_use_id = code_execution_block.id

    # Create execution environment with tool functions
    exec_env = create_execution_environment()

    # Execute code - this will make tool calls
    try:
        result = await exec_env.execute(code)
        return {
            "type": "code_execution_tool_result",
            "tool_use_id": tool_use_id,
            "content": {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "exit_code": result.exit_code
            }
        }
    except Exception as e:
        return {
            "type": "code_execution_tool_result",
            "tool_use_id": tool_use_id,
            "content": {
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1
            }
        }
```

---

## 9. Metrics and Benchmarks

### Performance Summary

| Feature | Metric | Before | After | Delta |
|---------|--------|--------|-------|-------|
| Tool Search | Context tokens | 77K | 8.7K | **-85%** |
| Tool Search | Accuracy (Opus 4) | 49% | 74% | +25 pp |
| Tool Search | Accuracy (Opus 4.5) | 79.5% | 88.1% | +8.6 pp |
| PTC | Total tokens | 43,588 | 27,297 | **-37%** |
| PTC | Knowledge retrieval | 25.6% | 28.5% | +2.9 pp |
| PTC | GIA benchmark | 46.5% | 51.2% | +4.7 pp |
| Examples | Parameter accuracy | 72% | 90% | +18 pp |

### Context Window Preservation

With Tool Search Tool:
- **95% of context window** remains available for conversation
- Before: Consumed by tool definitions
- After: Only necessary tools loaded on-demand

---

## 10. References

- **Original Article**: https://www.anthropic.com/engineering/advanced-tool-use
- **API Documentation**: https://docs.anthropic.com/claude/docs/tool-use
- **Beta Features**: `advanced-tool-use-2025-11-20`
- **Supported Models**: Claude Sonnet 4.5, Claude Opus 4, Claude Opus 4.5

---

## Changelog

| Date | Version | Notes |
|------|---------|-------|
| 2025-11-27 | 1.0 | Initial document based on Anthropic article |

---

## Appendix: Relationship with BEYOND-MCP

This document is particularly relevant to the BEYOND-MCP project because:

1. **Programmatic Tool Calling** is exactly the pattern we're implementing with Code Execution skills
2. The **37-85%** token reduction confirms the benefits documented in our Migration Plan
3. The `allowed_callers` pattern could be adopted in future versions of our skills

### Key Differences

| Aspect | Anthropic PTC | BEYOND-MCP Code Exec |
|--------|---------------|----------------------|
| Execution environment | Anthropic Sandbox | Claude Code built-in |
| Tool discovery | `tool_search_tool_regex` | Filesystem exploration |
| Persistence | Per-request | Persistent skill library |
| Customization | Limited | Complete (TypeScript) |

Both approaches share the same goal: **drastically reduce token consumption while maintaining capabilities**.
