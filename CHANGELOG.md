# Changelog

All notable changes to the BEYOND-MCP project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.13] - 2026-02-04

### Added
- **Railway Code Execution Skill** - Complete Direct Connection implementation
  - Full TypeScript client for Railway GraphQL API (`client-railway.ts`)
  - Covers all 14 MCP tools from official Railway MCP server
  - 99%+ token reduction vs traditional MCP approach
  - 50+ API operations (40+ beyond MCP capabilities):
    - Projects (list, get, create, update, delete, transfer)
    - Services (list, get, create, update, delete, connect/disconnect)
    - Service Instances (get config, update build/deploy settings)
    - Deployments (list, deploy, redeploy, rollback, stop, cancel, restart)
    - Environments (list, get, create, rename, delete)
    - Variables (get, set single/batch, delete)
    - Logs (build logs, runtime logs, HTTP logs, environment logs)
    - Domains (generate Railway domain, add custom domain)
    - Volumes (create, backup)
    - TCP Proxies (list)
    - Regions (list available)
    - Templates (deploy from template)
  - Comprehensive SKILL.md documentation with 30+ examples
  - Support for all three token types (Personal, Team, Project)
  - Full TypeScript type definitions

### Updated
- Project version to 1.0.13

## [1.0.12] - 2026-01-09

### Changed
- **PostHog Code Execution Skill** - Updated to cover all 45 MCP tools
  - Added `getExperimentResults()` for experiment metrics and exposure data
  - Added `getSurveyStats()` for individual survey statistics
  - Added `getSurveysGlobalStats()` for aggregated survey statistics
  - Added `getOrganizationDetails()` for organization details
  - Added `queryInsight()` for executing queries on existing insights
  - Added `getLLMCosts()` for LLM analytics and cost tracking
  - Updated SKILL.md with complete API coverage table
  - Added examples for all new methods
  - Marked `query-generate-hogql-from-question` as HYBRID (requires AI)

### Updated
- Project version to 1.0.12

## [1.0.11] - 2026-01-05

### Changed
- **Convex Code Execution Skill** - Added Production Data Seeding documentation
  - ConvexHttpClient approach for seeding production data
  - Why CLI doesn't work for production (env limitations)
  - Complete workflow with script examples
  - Best practices for idempotent mutations
  - Verification patterns for seeded data

### Updated
- Project version to 1.0.11

## [1.0.10] - 2026-01-03

### Changed
- **c15t Consent Skill** - Simplified and improved documentation
  - Condensed critical patterns into quick reference table
  - Clearer Server/Client separation guidance
  - Fixed database adapter recommendation (kyselyAdapter instead of drizzleAdapter)
  - Improved i18n routing guidance
  - Backend URL pattern clarification (no query params)
  - Migration script requirements highlighted

### Updated
- Project version to 1.0.10

## [1.0.09] - 2026-01-02

### Added
- **Sentry Code Execution Skill** - Complete Direct Connection implementation
  - Full TypeScript client for Sentry API (`client-sentry.ts`)
  - Covers all major Sentry REST API operations
  - 99%+ token reduction vs traditional MCP approach
  - Support for all core Sentry features:
    - Organizations (list, get details)
    - Projects (list, get, create, update, delete)
    - Teams (list, get, create, delete)
    - Issues & Error Tracking (list, get, update, bulk operations, search queries)
    - Events (list for issues/projects, get specific events)
    - Releases (list, get, create, update, delete, commits)
    - Client Keys/DSN Management (list, create, delete)
    - Statistics (organization and project stats)
  - Comprehensive SKILL.md documentation with 50+ examples
  - Test script (`test-sentry-skill.ts`) with 10 comprehensive tests
  - Environment variable configuration support
  - Full TypeScript type definitions
  - Advanced search query support
  - Bulk operations for efficiency
  - Error handling and validation

### Changed
- Updated project version to 1.0.09

### Notes
- **Hybrid Approach**: AI-powered search tools (`search_events`, `search_issues`) and Seer integration require the MCP server (OpenAI API key). This skill covers all standard REST API operations for maximum token efficiency.

## [1.0.08] - 2026-01-02

### Added
- **PostHog Code Execution Skill** - Complete Direct Connection implementation
  - Full TypeScript client for PostHog API (`client-posthog.ts`)
  - Covers all 42 MCP tools from official PostHog MCP server
  - 99%+ token reduction vs traditional MCP approach
  - Support for all PostHog features:
    - Feature Flags (create, update, delete, list, get by key)
    - Insights & Analytics (create, query, HogQL support)
    - Dashboards (create, update, add insights)
    - Error Tracking (list errors, get details)
    - Experiments (A/B testing management)
    - Surveys (create, manage, get stats)
    - Organization & Project management
    - Event and Property definitions
  - Comprehensive SKILL.md documentation with examples
  - Test script (`test-posthog-skill.ts`) for validation
  - Environment variable configuration support
  - Full TypeScript type definitions
  - Error handling and rate limit awareness

### Changed
- Updated project version to 1.0.08

## [1.0.07] - 2025-12-XX

### Added
- c15t Consent Management skill for GDPR/CCPA compliance

## [1.0.06] - 2025-12-XX

### Added
- Infrastructure Analyzer skill

## [1.0.05] - 2025-12-XX

### Added
- Convex Code Execution skill (HYBRID approach)

## [1.0.04] - 2025-12-XX

### Added
- Neon Code Execution skill for serverless Postgres

## [1.0.03] - 2025-12-XX

### Added
- shadcn-vue Code Execution skill (HYBRID: Code Exec + MCP for AI)

## [1.0.02] - 2025-12-XX

### Added
- Magic UI Code Execution skill

## [1.0.01] - 2025-12-XX

### Added
- Supabase Code Execution skill

## [1.0.0] - 2025-12-XX

### Added
- Initial project structure
- Base MCP client bridge implementation
- Project documentation (CLAUDE.md, Migration Plan, Workflow guides)
- TypeScript configuration
- Development environment setup
