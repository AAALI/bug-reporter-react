# Project Plan — Quick Bug Reporter

> **Priority order:** SaaS backend + dashboard → React Native SDK → Growth features.

---

## Status Overview

| Phase | Status | ETA |
|-------|:------:|:---:|
| **0 — Monorepo Setup** | ✅ Complete | Done |
| **1 — SaaS Foundation** | 🔲 Next up | 1-2 weeks |
| **2 — Dashboard MVP** | 🔲 Queued | 2 weeks |
| **3 — Billing + Launch** | 🔲 Queued | 1 week |
| **4 — React Native SDK** | 🔲 Queued | 2-3 weeks |
| **5 — Growth** | 🔲 Ongoing | — |

---

## Phase 0 — Monorepo Setup ✅

Restructured the repo from a single package into a pnpm monorepo with Turborepo.

- [x] Root workspace: `pnpm-workspace.yaml`, `turbo.json`, root `package.json`
- [x] `packages/core/` — shared types, NetworkLogger, ConsoleCapture, Linear/Jira integrations (`private: true`)
- [x] `packages/react/` — full web SDK moved here, all imports rewired to `@quick-bug-reporter/core`
- [x] `packages/react-native/` — scaffold (re-exports core, placeholder for RN-specific code)
- [x] All 3 packages build + typecheck clean
- [x] Test apps (`test-app-tw3`, `test-app-tw4`, `test-app-html`) updated to use local workspace
- [x] README.md split: root = monorepo overview, `packages/react/README.md` = full web SDK docs

---

## Phase 1 — SaaS Foundation

> **Goal:** SDK can submit bug reports through our Supabase Edge Function proxy, which forwards to Jira/Linear and logs analytics metadata.

### 1.1 Supabase Setup

- [ ] Create Supabase project
- [ ] Run initial migration: 5 tables (`organizations`, `members`, `projects`, `integrations`, `report_events`)
- [ ] Configure RLS policies (org-scoped access)
- [ ] Set up Vault for encrypted credential storage

### 1.2 Ingest Edge Function

- [ ] Create `supabase/functions/ingest/index.ts`
- [ ] Validate `X-Project-Key` header → look up project + integration
- [ ] Rate limiting via `report_events` count
- [ ] Decrypt credentials from Vault
- [ ] Forward bug report to Jira/Linear API (create issue + upload attachments)
- [ ] Parse `User-Agent` for browser/OS fields
- [ ] Log `report_event` row (metadata only, no media stored)
- [ ] Return `{ issueId, issueKey, issueUrl }` to SDK

### 1.3 CloudIntegration (SDK)

- [ ] Create `packages/core/src/integrations/cloud.ts` — `CloudIntegration` class
- [ ] Accepts `projectKey`, `ingestUrl`, `appVersion`, `environment`
- [ ] Sends multipart POST to Edge Function with all report data
- [ ] Re-export from `packages/core/src/index.ts` and both SDK barrels
- [ ] Update `BugReporterIntegrations` type to include `cloud` provider

### 1.4 Verification

- [ ] End-to-end test: SDK → Edge Function → Jira issue created → `report_events` row logged
- [ ] Deploy: `supabase functions deploy ingest`

**Reference:** Full architecture, data model, and security details in [`SAAS_PLAN.md`](./SAAS_PLAN.md)

---

## Phase 2 — Dashboard MVP

> **Goal:** Web dashboard where users manage projects, configure integrations, and view Sentry-style analytics.

### 2.1 App Scaffold

- [ ] Create `apps/dashboard/` — Next.js app
- [ ] Supabase Auth (email + OAuth sign-in)
- [ ] Protected layout with sidebar navigation
- [ ] Add to `pnpm-workspace.yaml`

### 2.2 Project Management

- [ ] Organization + project CRUD
- [ ] Project key generation (`qbr_proj_xxxxx`)
- [ ] Integration config forms (Jira credentials, Linear API key → stored in Vault)
- [ ] Project settings (rate limit, active/inactive toggle)

### 2.3 Analytics Dashboard

- [ ] **Bug count over time** — line chart (reports per day/week/month)
- [ ] **Browser breakdown** — bar chart
- [ ] **OS breakdown** — bar chart
- [ ] **App versions impacted** — table with bug count, first/last seen
- [ ] **Top pages** — table ranked by report count
- [ ] **Device type split** — desktop / mobile / tablet
- [ ] **Capture mode breakdown** — screenshot vs video ratio
- [ ] **Recent reports** — table with title, browser, page, timestamp, ↗ Jira/Linear link
- [ ] **Success rate** — percentage of reports successfully forwarded
- [ ] Environment filter toggle (production / staging / all)

### 2.4 Deploy

- [ ] Deploy to Cloudflare Pages
- [ ] Custom domain setup

**Reference:** Dashboard views and SQL queries in [`SAAS_PLAN.md`](./SAAS_PLAN.md)

---

## Phase 3 — Billing + Launch

> **Goal:** Monetize with tiered plans and go live.

- [ ] Stripe Checkout integration (Pro $29/mo, Team $79/mo)
- [ ] Plan enforcement in Edge Function (report count limits)
- [ ] Data retention cleanup via pg_cron (Free: 30d, Pro: 90d, Team: 365d)
- [ ] Landing page (quickbugreporter.com)
- [ ] Documentation site or docs section
- [ ] Launch: Product Hunt, Hacker News, X/Twitter

**Reference:** Pricing tiers and cost breakdown in [`SAAS_PLAN.md`](./SAAS_PLAN.md)

---

## Phase 4 — React Native SDK

> **Goal:** Ship `quick-bug-reporter-react-native` — shake-to-report with screenshot, video, annotation.

### 4.1 Core Capture

- [ ] Shake detection (`react-native-shake` or accelerometer)
- [ ] Screenshot capture (`react-native-view-shot`)
- [ ] Screen recording (`react-native-nitro-screen-recorder`)
- [ ] Device metadata collection (`react-native-device-info`)
- [ ] `BugReporter` + `BugSession` adapted for RN

### 4.2 UI Components

- [ ] Bottom sheet report form (`@gorhom/bottom-sheet`)
- [ ] Screenshot annotator (`@shopify/react-native-skia`)
- [ ] Floating action button
- [ ] Recording indicator overlay

### 4.3 Integration

- [ ] Add mobile columns to `report_events` migration (`platform`, `device_model`, `os_version`, `app_build`)
- [ ] Update Edge Function to handle mobile-specific fields
- [ ] CloudIntegration works identically (already in core)

### 4.4 Ship

- [ ] Expo dev client example app
- [ ] README with setup guide
- [ ] Publish to npm

**Reference:** Full architecture and native module research in [`REACT_NATIVE_SDK.md`](./REACT_NATIVE_SDK.md)

---

## Phase 5 — Growth (ongoing)

- [ ] Team invites + role-based access
- [ ] Advanced analytics (trend comparisons, regression detection)
- [ ] Webhook/Slack notifications on new reports
- [ ] Custom ingestion domain (`ingest.quickbugreporter.com`)
- [ ] Cloudflare Workers migration if Edge Function limits hit
- [ ] GitHub Actions: CI + automated npm publish workflows
- [ ] Self-hosted / on-premise option for enterprise

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **SDK build** | pnpm workspaces + Turborepo + tsup |
| **Web SDK** | React 18+, Radix UI, Tailwind CSS v4, html2canvas-pro, MediaRecorder |
| **RN SDK** | React Native 0.72+, view-shot, Skia, bottom-sheet, nitro-recorder |
| **Backend** | Supabase (Postgres, Auth, Vault, Edge Functions) |
| **Dashboard** | Next.js on Cloudflare Pages |
| **Billing** | Stripe |
| **DNS/CDN** | Cloudflare (free) |

---

*Last updated: Feb 13, 2025*
