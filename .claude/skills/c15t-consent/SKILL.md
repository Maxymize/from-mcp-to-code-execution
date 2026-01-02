---
name: c15t-consent
description: Implement GDPR/CCPA-compliant consent management with c15t. Use when implementing cookie banners, consent dialogs, analytics script loading based on consent, privacy preferences, or any consent-related UI. Covers React, Next.js, and vanilla JavaScript setups with integrations for Google Tag Manager, Meta Pixel, PostHog, TikTok, LinkedIn, and more. Supports both hosted (consent.io) and self-hosted backends.
---

# c15t Consent Management

## Overview

c15t is an open-source consent management system for building GDPR, CCPA, and other privacy regulation compliant applications. It provides cookie banners, consent dialogs, script loading based on consent, and backend storage for consent records.

## Workflow Decision Tree

```
User request received
        │
        ▼
┌───────────────────┐
│ 1. Analyze Design │  → [styling-theming.md]
│    System         │     Extract colors, fonts,
└───────────────────┘     radius, shadows
        │
        ▼
┌───────────────────┐
│ 2. What framework?│
└───────────────────┘
        │
   ┌────┴────┬──────────┐
   ▼         ▼          ▼
Next.js   React    Vanilla JS
   │         │          │
   ▼         ▼          ▼
[nextjs-   [react-   [javascript-
 setup.md]  setup.md]  setup.md]
        │
        ▼
┌───────────────────┐
│ 3. Need backend?  │
│    (audit trail)  │
└───────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
  Yes       No
   │         │
   │         ▼
   │      mode: 'offline'
   ▼
┌───────────────────┐
│ 4. Which database?│  ← ASK USER
└───────────────────┘
   │
   ├─→ Neon      → Use skill: neon-code-exec
   ├─→ Supabase  → Use skill: supabase-code-exec
   ├─→ Other SQL → [self-hosting.md]
   └─→ MongoDB   → [self-hosting.md]
        │
        ▼
┌───────────────────┐
│ 5. Need analytics?│
└───────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
  Yes       No
   │         │
   ▼         ▼
[integrations.md]  Done
```

## Design-First Implementation

**ALWAYS analyze the site's design system BEFORE implementing c15t components.**

### Design Analysis Checklist

1. **Find design tokens** in `tailwind.config.js`, `globals.css`, or `theme.ts`
2. **Extract**:
   - Primary/secondary colors
   - Border radius values
   - Font family and weights
   - Shadow styles
   - Button variants
3. **Apply to theme** using CSS variables or Tailwind classes

See [styling-theming.md](references/styling-theming.md) for complete theming guide.

### Quick Theme Example

```tsx
// After analyzing site: uses Indigo (#6366f1), rounded-xl, Inter font
<CookieBanner
  theme={{
    'banner.card': {
      className: 'bg-white rounded-xl shadow-lg',
      style: {
        '--banner-font-family': 'Inter, sans-serif',
      },
    },
    'banner.footer.accept-button': 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg',
    'banner.footer.reject-button': 'bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg',
  }}
/>
```

## Quick Start - React

```tsx
import {
  ConsentManagerProvider,
  CookieBanner,
  ConsentManagerDialog,
} from '@c15t/react';

export function App({ children }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'c15t',
        backendURL: 'https://your-instance.c15t.dev',
        consentCategories: ['necessary', 'measurement', 'marketing'],
      }}
    >
      <CookieBanner />
      <ConsentManagerDialog />
      {children}
    </ConsentManagerProvider>
  );
}
```

## Quick Start - Next.js App Router

```tsx
// app/consent-manager.tsx
'use client';

import {
  ConsentManagerProvider,
  CookieBanner,
  ConsentManagerDialog,
} from '@c15t/nextjs';

export default function ConsentManager({ children }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: 'c15t',
        backendURL: '/api/c15t',
        consentCategories: ['necessary', 'marketing'],
      }}
    >
      <CookieBanner />
      <ConsentManagerDialog />
      {children}
    </ConsentManagerProvider>
  );
}

// app/layout.tsx
import ConsentManager from './consent-manager';

export default function Layout({ children }) {
  return <ConsentManager>{children}</ConsentManager>;
}
```

## Consent Categories

| Category | Purpose | Required |
|----------|---------|----------|
| `necessary` | Essential site functionality | Always on |
| `functional` | Enhanced features, preferences | Optional |
| `measurement` | Analytics (GA4, PostHog, etc.) | Optional |
| `marketing` | Advertising (Meta, TikTok, etc.) | Optional |

## Script Loading

Load analytics/marketing scripts only when consent is granted:

```tsx
import { ConsentManagerProvider } from '@c15t/react';
import { googleTagManager } from '@c15t/scripts/google-tag-manager';
import { metaPixel } from '@c15t/scripts/meta-pixel';

<ConsentManagerProvider
  options={{
    scripts: [
      googleTagManager({ id: 'GTM-XXXXXXX' }),
      metaPixel({ pixelId: '123456789012345' }),
    ],
  }}
>
```

## Checking Consent

```tsx
import { useConsentManager } from '@c15t/react';

function MyComponent() {
  const { has, setConsent } = useConsentManager();

  // Simple check
  if (has('marketing')) {
    initializeAds();
  }

  // Complex check
  const canTrack = has({
    and: ['measurement', { or: ['functional', 'marketing'] }]
  });

  return (
    <button onClick={() => setConsent('marketing', true)}>
      Enable Personalized Ads
    </button>
  );
}
```

## Storage Modes

### Offline (localStorage only)
```tsx
options={{
  mode: 'offline',
}}
```
No backend needed. Good for simple sites, portfolios, blogs.

### Self-Hosted (with database)

**ASK USER: "Which database do you want to use for consent storage?"**

| Database | Skill/Tool to Use | Free Tier |
|----------|-------------------|-----------|
| **Neon** | `neon-code-exec` skill | 0.5GB |
| **Supabase** | `supabase-code-exec` skill | 500MB |
| **Other PostgreSQL** | Drizzle/Kysely adapter | - |
| **MySQL** | Kysely adapter | - |
| **MongoDB** | MongoDB adapter | Atlas 512MB |

#### Neon (Recommended for Next.js)

1. **Use `neon-code-exec` skill** to create database and get connection string
2. Configure c15t with Drizzle adapter:

```tsx
// lib/c15t.ts
import { c15tInstance } from '@c15t/backend/v2';
import { drizzleAdapter } from '@c15t/backend/v2/db/adapters/drizzle';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const c15t = c15tInstance({
  appName: 'my-app',
  basePath: '/api/c15t',
  adapter: drizzleAdapter({ db, provider: 'postgresql' }),
  trustedOrigins: ['localhost', 'myapp.com'],
});
```

3. Run migrations: `npx @c15t/cli migrate`

#### Supabase

1. **Use `supabase-code-exec` skill** to execute SQL and manage schema
2. Configure with Drizzle or direct Supabase client

```tsx
import { drizzleAdapter } from '@c15t/backend/v2/db/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const c15t = c15tInstance({
  adapter: drizzleAdapter({ db, provider: 'postgresql' }),
});
```

#### Database NOT Supported

| Database | Status | Alternative |
|----------|--------|-------------|
| **Convex** | ❌ Not compatible | Use Neon alongside Convex |
| **Firebase** | ❌ Not compatible | Use offline mode |
| **PlanetScale** | ⚠️ Via MySQL adapter | Limited support |

See [self-hosting.md](references/self-hosting.md) for complete adapter documentation.

## Reference Files

| File | Contents |
|------|----------|
| [styling-theming.md](references/styling-theming.md) | **Design analysis workflow**, CSS variables, theme keys, Tailwind, dark mode |
| [nextjs-setup.md](references/nextjs-setup.md) | Next.js App/Pages Router setup, rewrites, ClientSideOptionsProvider |
| [react-setup.md](references/react-setup.md) | React setup, callbacks, headless mode |
| [javascript-setup.md](references/javascript-setup.md) | Vanilla JS setup, store API, DOM integration |
| [components.md](references/components.md) | All React components (CookieBanner, ConsentManagerDialog, Frame, etc.) |
| [hooks-store.md](references/hooks-store.md) | useConsentManager hook, store API, consent checking, location info |
| [integrations.md](references/integrations.md) | GTM, GA4, Meta Pixel, PostHog, TikTok, LinkedIn, Microsoft UET, X Pixel |
| [self-hosting.md](references/self-hosting.md) | Backend setup, database adapters, Cloudflare Workers |

## Common Patterns

### Conditional Content Based on Consent

```tsx
import { Frame } from '@c15t/react';

<Frame
  category="marketing"
  fallback={<p>Enable marketing cookies to view video</p>}
>
  <iframe src="https://youtube.com/embed/xxx" />
</Frame>
```

### Custom Banner Buttons

```tsx
<CookieBanner.Root>
  <CookieBanner.Card>
    <CookieBanner.Header>
      <CookieBanner.Title>We value your privacy</CookieBanner.Title>
    </CookieBanner.Header>
    <CookieBanner.Footer>
      <CookieBanner.RejectButton>Decline</CookieBanner.RejectButton>
      <CookieBanner.CustomizeButton>Settings</CookieBanner.CustomizeButton>
      <CookieBanner.AcceptButton>Accept All</CookieBanner.AcceptButton>
    </CookieBanner.Footer>
  </CookieBanner.Card>
</CookieBanner.Root>
```

### Callbacks for Analytics Initialization

```tsx
<ConsentManagerProvider
  options={{
    callbacks: {
      onConsentSet({ preferences }) {
        if (preferences.measurement) {
          posthog.opt_in_capturing();
        } else {
          posthog.opt_out_capturing();
        }
      },
    },
  }}
>
```

### Legal Links in Dialog

```tsx
<ConsentManagerProvider
  options={{
    legalLinks: {
      privacyPolicy: { href: '/privacy', label: 'Privacy Policy' },
      cookiePolicy: { href: '/cookies', label: 'Cookie Policy' },
    },
  }}
>
  <ConsentManagerDialog legalLinks={['privacyPolicy', 'cookiePolicy']} />
</ConsentManagerProvider>
```

## Packages

| Package | Purpose |
|---------|---------|
| `@c15t/react` | React components and hooks |
| `@c15t/react-headless` | Headless (no UI) for custom designs |
| `@c15t/nextjs` | Next.js-optimized components |
| `@c15t/scripts` | Prebuilt analytics integrations |
| `@c15t/backend` | Self-hosted backend |
| `@c15t/cli` | CLI for setup and migrations |
| `c15t` | Core vanilla JavaScript library |
