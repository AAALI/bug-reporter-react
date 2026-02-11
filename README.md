# quick-bug-reporter-react

Drop-in bug reporter for React apps — screenshot capture, video recording, annotation, and Linear/Jira integration.

## Features

- **Screenshot capture** — Full-page or region selection via `html2canvas-pro`
- **Video recording** — Screen + microphone via `MediaRecorder` API
- **Annotation** — Drag-to-highlight on captured screenshots
- **Network logging** — Automatic fetch interception during capture
- **Integrations** — Linear and Jira (direct API or backend proxy)
- **Zero config UI** — Floating bug button + modal wizard, ships its own styles

## Install

```bash
npm install quick-bug-reporter-react
# or
pnpm add quick-bug-reporter-react
```

## Requirements

- React 18+ or 19+

## Quick Start

### 1. Import styles

The library ships a **self-contained, pre-built CSS file** that works with any setup — Tailwind v3, Tailwind v4, or no Tailwind at all.

Import it once in your app entry point:

```ts
import "quick-bug-reporter-react/styles.css";
```

> **Tailwind v3 users:** The CSS file is already fully resolved — no Tailwind v4
> theme variables or `@layer` blocks that could conflict with your v3 pipeline.
> Just import as shown above and it works.
>
> **Tailwind v4 users:** The import above works out of the box. Alternatively you
> can add `@source "node_modules/quick-bug-reporter-react/dist";` to your main
> CSS file so Tailwind picks up the library's utility classes directly.
>
> **No Tailwind?** The import above is all you need. If your bundler doesn't
> handle CSS imports, add a `<link>` tag pointing to the file in `node_modules`:
> ```html
> <link rel="stylesheet" href="/node_modules/quick-bug-reporter-react/dist/styles.css" />
> ```

### 2. Add the provider and UI

```tsx
import {
  BugReporterProvider,
  FloatingBugButton,
  BugReporterModal,
  LinearIntegration,
} from "quick-bug-reporter-react";

const linear = new LinearIntegration({
  submitProxyEndpoint: "/api/bug-report",
});

export default function App({ children }) {
  return (
    <BugReporterProvider
      integrations={{ linear }}
      defaultProvider="linear"
    >
      {children}
      <FloatingBugButton />
      <BugReporterModal />
    </BugReporterProvider>
  );
}
```

That's it — a floating "Report Bug" button appears in the bottom-right corner.

## Integrations

Both integrations support two modes:

| Mode | When to use | How it works |
|------|------------|--------------|
| **Backend proxy** (recommended) | Production apps | Your server-side endpoint receives the report and calls Linear/Jira. API keys stay on the server. |
| **Direct API** | Server-side only (Next.js API routes, etc.) | The library calls Linear/Jira APIs directly. **Does NOT work from browser-only SPAs due to CORS.** |

### Linear

```ts
import { LinearIntegration } from "quick-bug-reporter-react";

// ✅ Recommended: Backend proxy (works everywhere)
const linear = new LinearIntegration({
  submitProxyEndpoint: "/api/bug-report",
});

// Or split proxy endpoints for finer control:
const linear = new LinearIntegration({
  createIssueProxyEndpoint: "/api/linear/create-issue",
  uploadProxyEndpoint: "/api/linear/upload",
});

// ⚠️ Direct API — server-side / Next.js API routes only
const linear = new LinearIntegration({
  apiKey: "lin_api_...",
  teamId: "TEAM_ID",
  projectId: "PROJECT_ID", // optional — assigns issues to a Linear project
});
```

| Option | Description |
|--------|-------------|
| `apiKey` | Linear API key (direct mode only) |
| `teamId` | Linear team ID |
| `projectId` | Linear project ID — optional, assigns every issue to this project |
| `submitProxyEndpoint` | Single endpoint that handles the entire submission |
| `createIssueProxyEndpoint` | Proxy for issue creation only |
| `uploadProxyEndpoint` | Proxy for file uploads only |
| `fetchImpl` | Custom fetch implementation |

### Jira

```ts
import { JiraIntegration } from "quick-bug-reporter-react";

// ✅ Recommended: Backend proxy
const jira = new JiraIntegration({
  submitProxyEndpoint: "/api/bug-report",
});

// Or split proxy endpoints:
const jira = new JiraIntegration({
  createIssueProxyEndpoint: "/api/jira/create-issue",
  uploadAttachmentProxyEndpoint: "/api/jira/upload-attachment",
  projectKey: "BUG",
});

// ⚠️ Direct API — server-side only (CORS + exposes credentials)
const jira = new JiraIntegration({
  baseUrl: "https://your-domain.atlassian.net",
  email: "you@example.com",
  apiToken: "...",
  projectKey: "BUG",
  issueType: "Bug", // optional, defaults to "Bug"
});
```

| Option | Description |
|--------|-------------|
| `baseUrl` | Jira instance URL (direct mode only) |
| `email` | Jira email (direct mode only) |
| `apiToken` | Jira API token (direct mode only) |
| `projectKey` | Jira project key (e.g. `"BUG"`) |
| `issueType` | Issue type name, defaults to `"Bug"` |
| `submitProxyEndpoint` | Single endpoint that handles the entire submission |
| `createIssueProxyEndpoint` | Proxy for issue creation only |
| `uploadAttachmentProxyEndpoint` | Proxy for attachment uploads only |
| `fetchImpl` | Custom fetch implementation |

---

### Proxy endpoint contract

When using `submitProxyEndpoint`, the library sends a single `FormData` POST with a **pre-formatted description** and all attachment files. Your proxy just needs to create the issue and upload the files — no custom formatting required.

#### FormData fields

| Field | Type | Always sent | Description |
|-------|------|:-----------:|-------------|
| `provider` | string | Yes | `"linear"` or `"jira"` |
| `title` | string | Yes | Issue title |
| `description` | string | Yes | **Pre-formatted** issue description (ready to use as-is) |
| `issueType` | string | Jira only | Issue type (e.g. `"Bug"`) |
| `projectKey` | string | Jira only | Jira project key (if configured) |
| `teamId` | string | Linear only | Linear team ID (if configured) |
| `projectId` | string | Linear only | Linear project ID (if configured) |
| `screenshotFile` | File | If screenshot | `bug-screenshot.png` |
| `screenRecordingFile` | File | If video | `bug-recording.webm` |
| `networkLogsFile` | File | Yes | `network-logs.txt` |
| `clientMetadataFile` | File | Yes | `client-metadata.json` |
| `consoleLogsFile` | File | If present | `console-logs.txt` (JS errors + console output) |

#### Expected response

**Jira proxy:**
```json
{
  "jira": { "id": "10001", "key": "BUG-42", "url": "https://you.atlassian.net/browse/BUG-42" },
  "warnings": []
}
```

**Linear proxy:**
```json
{
  "linear": { "id": "...", "identifier": "ENG-123", "url": "https://linear.app/..." },
  "warnings": []
}
```

#### Example Jira proxy (Node.js / Express)

```ts
app.post("/api/bug-report", upload.any(), async (req, res) => {
  const { title, description, issueType, projectKey } = req.body;

  // 1. Convert plain-text description to Jira ADF
  const adf = {
    type: "doc", version: 1,
    content: description.split(/\n{2,}/).filter(Boolean).map(chunk => ({
      type: "paragraph",
      content: [{ type: "text", text: chunk.trim() }],
    })),
  };

  // 2. Create the issue
  const issue = await fetch(`${JIRA_BASE}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: title,
        description: adf,
        issuetype: { name: issueType || "Bug" },
      },
    }),
  }).then(r => r.json());

  // 3. Upload all attachment files
  for (const file of req.files) {
    const form = new FormData();
    form.append("file", file.buffer, file.originalname);
    await fetch(`${JIRA_BASE}/rest/api/3/issue/${issue.key}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`)}`,
        "X-Atlassian-Token": "no-check",
      },
      body: form,
    });
  }

  res.json({ jira: { id: issue.id, key: issue.key, url: `${JIRA_BASE}/browse/${issue.key}` } });
});
```

### Advanced: Split proxy endpoints

Instead of a single `submitProxyEndpoint`, you can use separate endpoints for issue creation and file uploads. This gives the **library** full control over formatting while your proxy only handles auth:

- **`createIssueProxyEndpoint`** — receives `{ title, description, issueType, projectKey }` as JSON, returns `{ id, key, url }`
- **`uploadAttachmentProxyEndpoint`** (Jira) — receives `FormData` with `issueKey` + `file`, returns `{ ok: true }`
- **`uploadProxyEndpoint`** (Linear) — receives `FormData` with `file` + `filename` + `contentType`, returns `{ assetUrl }`

### Advanced: Custom fetch

Both integrations accept a `fetchImpl` option to customize how HTTP requests are made (useful for adding auth headers, logging, or proxying):

```ts
const linear = new LinearIntegration({
  apiKey: "...",
  teamId: "...",
  fetchImpl: (input, init) => {
    console.log("Request:", input);
    return fetch(input, init);
  },
});
```

## Exports

### UI Components

- `BugReporterProvider` — Context provider, wraps your app
- `FloatingBugButton` — Floating action button with capture menu
- `BugReporterModal` — Two-step wizard (review capture → add context & submit)
- `useBugReporter()` — Hook to build custom UI on top of the bug reporter

### Core Classes (headless usage)

- `BugReporter` — Orchestrates capture + submission (no UI)
- `BugSession` — Manages a single capture session
- `ScreenshotCapturer` — HTML-to-canvas screenshot engine
- `ScreenRecorder` — Screen + mic recording via MediaRecorder
- `NetworkLogger` — Fetch interception logger

### Integrations

- `LinearIntegration` — Linear issue creation + file upload
- `JiraIntegration` — Jira issue creation + attachment upload

## License

MIT
