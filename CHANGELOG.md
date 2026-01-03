# Changelog

All notable changes to the BEYOND-MCP project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
