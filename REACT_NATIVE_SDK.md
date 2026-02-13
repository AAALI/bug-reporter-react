# React Native SDK — `quick-bug-reporter-react-native`

> **Goal:** Port `quick-bug-reporter-react` to React Native with **shake-to-report** as the primary invocation. Same flow — capture → annotate → submit to Jira/Linear/Cloud — but adapted for native mobile constraints.

---

## Web SDK vs React Native SDK — Feature Mapping

| Feature | Web SDK (current) | React Native SDK (proposed) |
|---------|-------------------|----------------------------|
| **Trigger** | Floating button / programmatic | **Shake device** + floating button + programmatic |
| **Screenshot** | `html2canvas-pro` (DOM snapshot) | `react-native-view-shot` (native view rasterization) |
| **Video recording** | `getDisplayMedia` (browser share prompt) | `react-native-nitro-screen-recorder` (in-app + global) |
| **Annotation** | Canvas overlay (`ScreenshotAnnotator`) | `@shopify/react-native-skia` (GPU-accelerated drawing) |
| **Network logging** | `fetch`/`XMLHttpRequest` monkey-patch | Same monkey-patch (RN uses the same JS globals) |
| **Console capture** | `console.log/warn/error` intercept | Same intercept (identical JS runtime) |
| **Device metadata** | `navigator.userAgent` + `window.screen` | `react-native-device-info` (150+ native properties) |
| **UI (modal)** | Radix Dialog + Tailwind | `@gorhom/bottom-sheet` (native gesture-driven sheet) |
| **Region select** | DOM overlay with pointer events | Crop rectangle via gesture handler on Skia canvas |
| **Integrations** | Linear, Jira, Cloud | Identical — reuse core integration classes |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   React Native App                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           <BugReporterProvider>                    │   │
│  │                                                    │   │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │ShakeDetector│  │ Floating │  │ Programmatic │  │   │
│  │  │ (primary)   │  │  Button  │  │    API       │  │   │
│  │  └─────┬──────┘  └────┬─────┘  └──────┬───────┘  │   │
│  │        └───────────────┼───────────────┘           │   │
│  │                        ▼                           │   │
│  │              ┌─────────────────┐                   │   │
│  │              │   BugReporter   │  ← reused core    │   │
│  │              │   (headless)    │                    │   │
│  │              └────────┬────────┘                    │   │
│  │                       │                             │   │
│  │  ┌────────┬───────────┼───────────┬────────────┐   │   │
│  │  ▼        ▼           ▼           ▼            ▼   │   │
│  │ View   Screen     Network     Console      Device  │   │
│  │ Shot   Recorder   Logger      Capture      Info    │   │
│  │                                                    │   │
│  │              ┌─────────────────┐                   │   │
│  │              │  Bottom Sheet   │                   │   │
│  │              │  ┌───────────┐  │                   │   │
│  │              │  │ Skia      │  │                   │   │
│  │              │  │ Annotator │  │                   │   │
│  │              │  └───────────┘  │                   │   │
│  │              │  Title + Desc   │                   │   │
│  │              │  Submit button  │                   │   │
│  │              └─────────────────┘                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Core Dependencies

### Required Libraries

| Library | Purpose | Stars | Maintained | Native? |
|---------|---------|:-----:|:----------:|:-------:|
| [`react-native-shake`](https://github.com/Doko-Demo-Doa/react-native-shake) | Shake event detection (iOS + Android) | 300+ | ✅ | ✅ |
| [`react-native-view-shot`](https://github.com/gre/react-native-view-shot) | Screenshot capture (view + full screen) | 5.8K+ | ✅ | ✅ |
| [`react-native-nitro-screen-recorder`](https://github.com/ChristopherGabba/react-native-nitro-screen-recorder) | In-app + global video recording | New | ✅ | ✅ |
| [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/) | GPU-accelerated annotation canvas | 7K+ | ✅ | ✅ |
| [`react-native-device-info`](https://github.com/react-native-device-info/react-native-device-info) | 150+ device properties | 6.5K+ | ✅ | ✅ |
| [`@gorhom/bottom-sheet`](https://github.com/gorhom/react-native-bottom-sheet) | Native bottom sheet modal | 6.5K+ | ✅ | ✅ |
| [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler) | Pan/pinch for annotation drawing | 6K+ | ✅ | ✅ |
| [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated) | 60fps animations (sheet + annotator) | 8.5K+ | ✅ | ✅ |

### Peer Dependencies (likely already in host app)

- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`

---

## Component-by-Component Conversion Plan

### 1. Shake Detection — Invocation Trigger

The web SDK uses a `FloatingBugButton`. The RN SDK adds **shake** as the primary trigger.

**Library:** `react-native-shake`

```tsx
// ShakeDetector.tsx
import RNShake from "react-native-shake";
import { useEffect } from "react";

export function useShakeDetector(onShake: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const subscription = RNShake.addListener(() => {
      onShake();
    });
    return () => subscription.remove();
  }, [onShake, enabled]);
}
```

**Integration in Provider:**
```tsx
function BugReporterProvider({ children, shakeEnabled = true, ...props }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShake = useCallback(async () => {
    // Auto-capture screenshot on shake
    const uri = await captureScreen({ format: "png", quality: 0.9 });
    setScreenshotUri(uri);
    setIsOpen(true); // opens bottom sheet
  }, []);

  useShakeDetector(handleShake, shakeEnabled && !isOpen);

  return (
    <BugReporterContext.Provider value={...}>
      {children}
      <BugReporterSheet />
    </BugReporterContext.Provider>
  );
}
```

**Behavior:** Shake → instant screenshot → bottom sheet opens with annotatable preview. Same UX as Instabug/Shake.

---

### 2. Screenshot Capture — Replacing `html2canvas-pro`

**Library:** `react-native-view-shot`

The web SDK uses `html2canvas-pro` to rasterize the DOM. React Native has no DOM — instead, `react-native-view-shot` uses native iOS/Android APIs to snapshot any view or the entire screen.

```tsx
import { captureScreen, captureRef } from "react-native-view-shot";

// Full screen capture (native hardware screenshot)
const uri = await captureScreen({ format: "png", quality: 0.9 });

// Specific view capture (for region selection)
const uri = await captureRef(viewRef, {
  format: "png",
  quality: 0.9,
  result: "tmpfile",
});
```

**Key differences from web:**
- **No scroll capture** — `captureScreen()` captures only visible content (native limitation)
- **No DOM exclusion** — cannot hide the bug reporter UI via `data-bug-reporter-ui` attribute; instead, capture before showing the sheet
- **File-based** — returns a `file://` URI, not a `Blob`. Convert to base64 or read as binary for upload
- **Much faster** — native rasterization vs DOM parsing, typically <100ms

**Strategy:** Capture screenshot **on shake** (before opening the sheet), so the reporter UI is never in the screenshot.

---

### 3. Video Recording — Replacing `getDisplayMedia`

**Library:** `react-native-nitro-screen-recorder`

The web SDK uses the browser's `getDisplayMedia` API. React Native has two native approaches:

#### In-App Recording (iOS only)
Records only the app's content. No system UI, no other apps. No user prompt required.

```tsx
import {
  startInAppRecording,
  stopInAppRecording,
} from "react-native-nitro-screen-recorder";

await startInAppRecording({
  enableMic: true,
  enableCamera: false,
  onRecordingFinished: (file) => {
    console.log("Saved:", file.path, file.duration, file.size);
  },
});

// Later...
const file = await stopInAppRecording();
```

#### Global Recording (iOS + Android)
System-wide capture. Requires user permission prompt (similar to web's share dialog).

```tsx
import {
  startGlobalRecording,
  stopGlobalRecording,
} from "react-native-nitro-screen-recorder";

startGlobalRecording({
  enableMic: true,
  onRecordingError: (error) => console.error(error),
});

const file = await stopGlobalRecording({ settledTimeMs: 700 });
```

**Key differences from web:**
- **In-app recording** (iOS only) has no user prompt — better UX than web's share dialog
- **Global recording** requires a system permission prompt on both platforms
- Returns a file path, not a `Blob`
- Duration/size metadata available from `ScreenRecordingFile`
- Android global recording requires `FOREGROUND_SERVICE_MEDIA_PROJECTION` permission

**Recommendation:** Default to **in-app recording** on iOS (seamless), fall back to **global recording** on Android. Let users opt into global recording on iOS if they need system-wide capture.

---

### 4. Annotation — Replacing Canvas Overlay

**Library:** `@shopify/react-native-skia` + `react-native-gesture-handler`

The web SDK uses an HTML `<canvas>` overlay for drawing highlight rectangles. React Native doesn't have HTML canvas — instead, Skia provides a GPU-accelerated 2D drawing surface.

```tsx
import { Canvas, Image, Rect, useImage } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

function ScreenshotAnnotator({ screenshotUri, onAnnotationChange }) {
  const image = useImage(screenshotUri);
  const [highlights, setHighlights] = useState([]);

  // Pan gesture for drawing rectangles
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const currentRect = useSharedValue({ x: 0, y: 0, w: 0, h: 0 });

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      startX.value = e.x;
      startY.value = e.y;
    })
    .onUpdate((e) => {
      currentRect.value = {
        x: Math.min(startX.value, e.x),
        y: Math.min(startY.value, e.y),
        w: Math.abs(e.x - startX.value),
        h: Math.abs(e.y - startY.value),
      };
    })
    .onEnd(() => {
      // Commit rectangle to highlights array
      const rect = currentRect.value;
      if (rect.w > 10 && rect.h > 10) {
        setHighlights((prev) => [...prev, { ...rect }]);
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Canvas style={{ flex: 1 }}>
        {image && (
          <Image image={image} fit="contain" x={0} y={0} width={W} height={H} />
        )}
        {highlights.map((rect, i) => (
          <Rect
            key={i}
            x={rect.x} y={rect.y}
            width={rect.w} height={rect.h}
            color="rgba(239, 68, 68, 0.18)"
            style="fill"
          />
        ))}
      </Canvas>
    </GestureDetector>
  );
}
```

**Exporting annotated image:**
```tsx
import { makeImageSnapshotAsync } from "@shopify/react-native-skia";

const canvasRef = useRef();
const annotatedImage = await canvasRef.current.makeImageSnapshotAsync();
const base64 = annotatedImage.encodeToBase64();
```

**Key differences from web:**
- **60fps** drawing via Skia GPU pipeline vs browser canvas
- Touch-native gesture handling (pan, pinch-to-zoom possible)
- `makeImageSnapshotAsync()` replaces `canvas.toBlob()`
- Can easily extend to freehand drawing, arrows, text (Skia has full path/text support)

---

### 5. Device Metadata — Replacing Browser APIs

**Library:** `react-native-device-info`

The web SDK collects metadata via `navigator`, `window.screen`, and `Navigator.connection`. React Native equivalents:

| Web SDK field | Web API | React Native equivalent |
|---------------|---------|------------------------|
| `locale` | `navigator.language` | `DeviceInfo.getDeviceLocale()` or `I18nManager` |
| `timezone` | `Intl.DateTimeFormat().resolvedOptions().timeZone` | Same (Hermes supports `Intl`) |
| `platform` | `navigator.platform` | `Platform.OS` + `DeviceInfo.getSystemName()` |
| `userAgent` | `navigator.userAgent` | `DeviceInfo.getUserAgent()` |
| `viewport` | `window.innerWidth/Height` | `Dimensions.get("window")` |
| `screen` | `window.screen` | `Dimensions.get("screen")` + `PixelRatio` |
| `deviceMemoryGb` | `navigator.deviceMemory` | `DeviceInfo.getTotalMemory()` |
| `online` | `navigator.onLine` | `NetInfo.fetch().isConnected` |
| `connectionType` | `navigator.connection.effectiveType` | `NetInfo.fetch().type` |
| `colorScheme` | `prefers-color-scheme` | `Appearance.getColorScheme()` |
| N/A (new) | — | `DeviceInfo.getModel()` — "iPhone 15 Pro" |
| N/A (new) | — | `DeviceInfo.getSystemVersion()` — "17.4" |
| N/A (new) | — | `DeviceInfo.getBatteryLevel()` |
| N/A (new) | — | `DeviceInfo.getFreeDiskStorage()` |
| N/A (new) | — | `DeviceInfo.isEmulator()` |
| N/A (new) | — | `DeviceInfo.getApplicationName()` + `getBuildNumber()` |

**New metadata type for RN:**

```tsx
export type MobileClientMetadata = {
  platform: "ios" | "android";
  osVersion: string;           // "17.4.1"
  deviceModel: string;         // "iPhone 15 Pro"
  deviceBrand: string;         // "Apple"
  appName: string;
  appVersion: string;          // from DeviceInfo or user-provided
  buildNumber: string;
  isEmulator: boolean;
  locale: string;
  timezone: string;
  colorScheme: "light" | "dark";
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    fontScale: number;
  };
  memory: {
    totalGb: number;
    usedGb: number | null;
  };
  storage: {
    freeMb: number;
  };
  battery: {
    level: number;
    charging: boolean;
  };
  connection: {
    type: string;              // "wifi" | "cellular" | "none"
    effectiveType: string;     // "4g" | "3g"
    isConnected: boolean;
  };
  captureMode: "screenshot" | "video";
  capture: {
    startedAt: string;
    stoppedAt: string;
    elapsedMs: number;
  };
  annotation?: {
    imageWidth: number;
    imageHeight: number;
    highlights: HighlightRegion[];
  };
};
```

---

### 6. Network Logging — Reusable As-Is

React Native uses the same `fetch` and `XMLHttpRequest` globals as the web. The existing `NetworkLogger` class from the web SDK can be **reused directly** with minimal changes.

```tsx
// NetworkLogger works in RN because RN polyfills fetch/XMLHttpRequest
import { NetworkLogger } from "../core/NetworkLogger";

const logger = new NetworkLogger();
logger.start();
// ... user performs actions ...
const logs = logger.stop();
```

**Minor consideration:** RN's `fetch` is a polyfill over `XMLHttpRequest`, so intercepting `XMLHttpRequest` alone may capture all requests. Test both code paths.

---

### 7. Console Capture — Reusable As-Is

Same `console.log/warn/error` interception. The existing `ConsoleCapture` class works identically in React Native's JavaScript runtime (Hermes or JSC).

```tsx
import { ConsoleCapture } from "../core/ConsoleCapture";
// Works unchanged in React Native
```

---

### 8. UI — Bottom Sheet Instead of Dialog

**Library:** `@gorhom/bottom-sheet`

The web SDK uses Radix `<Dialog>` + Tailwind. For React Native, a **bottom sheet** is the natural mobile UX (like Instabug, Shake, etc.).

```tsx
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

function BugReporterSheet() {
  const { isOpen, closeSheet } = useBugReporter();
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isOpen) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isOpen]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={closeSheet}
    >
      <BottomSheetScrollView>
        {/* Step 1: Screenshot preview + annotation */}
        <ScreenshotAnnotator ... />
        {/* Step 2: Title, description, provider selector */}
        <ReportForm ... />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
```

**UX flow:**
1. User shakes → screenshot captured → sheet slides up at 50%
2. User drags on screenshot to highlight → draws red rectangles
3. User swipes sheet up to 90% → fills in title + description
4. Tap "Submit" → report sent to Jira/Linear/Cloud

---

## Code Reuse Analysis

### Fully reusable (no changes)
- `NetworkLogger` — same `fetch`/`XMLHttpRequest` intercept
- `ConsoleCapture` — same `console` intercept
- `LinearIntegration` — pure HTTP, no DOM dependency
- `JiraIntegration` — pure HTTP, no DOM dependency
- `CloudIntegration` — pure HTTP, no DOM dependency
- `BugReporter` (core orchestrator) — minor adaptation for file-based artifacts
- Type definitions — extend, don't replace

### Needs native replacement
- `ScreenshotCapturer` → `react-native-view-shot`
- `ScreenRecorder` → `react-native-nitro-screen-recorder`
- `ScreenshotAnnotator` (UI) → Skia canvas + gesture handler
- `BugReporterModal` (UI) → Bottom sheet
- `BugReporterProvider` (UI) → Add shake detection, file-based screenshots
- `FloatingBugButton` (UI) → React Native `TouchableOpacity` + `Animated`
- `RegionSelector` (UI) → Not needed (annotation handles highlighting)
- `collectClientEnvironmentMetadata()` → `react-native-device-info` based

### Adaptation needed
- `BugSession` — change `Blob`-based artifacts to file URI-based
- `BugReportPayload` — add mobile-specific fields, file URIs instead of Blobs
- Form submission — use `FormData` with file URIs (RN supports this natively)

---

## Monorepo Strategy — Two Independent NPM Packages

> **Key decision:** Both SDKs are **independent NPM packages**. Consumers install ONE package for their platform. Shared logic lives in an **internal workspace package** (`@quick-bug-reporter/core`) that is bundled into each SDK at build time — never published to NPM.

### Why internal core (not published)?

| Approach | Consumer DX | Versioning | Bundle |
|----------|:-----------:|:----------:|:------:|
| Published `@quick-bug-reporter/core` | ❌ Must install 2 packages | Must coordinate 3 versions | Deduplication risk |
| **Internal workspace package** | ✅ Single `npm install` | Each SDK has its own semver | ✅ Bundled by tsup |

Consumers never see the core package. They install `quick-bug-reporter-react` (web) **or** `quick-bug-reporter-react-native` (mobile) and get everything — types, integrations, UI.

### pnpm Monorepo Structure

This is the **single source of truth** for the full project layout. It supersedes the repo structure in `SAAS_PLAN.md`.

```
quick-bug-reporter/
│
├── packages/
│   │
│   ├── core/                            # INTERNAL — never published to NPM
│   │   ├── src/
│   │   │   ├── types.ts                 # Shared types (base + extended for mobile)
│   │   │   ├── NetworkLogger.ts         # fetch/XHR intercept (works in both)
│   │   │   ├── ConsoleCapture.ts        # console intercept (works in both)
│   │   │   ├── BugReporter.ts           # Core orchestrator (artifact-agnostic)
│   │   │   ├── BugSession.ts            # Session lifecycle (Blob | file URI)
│   │   │   └── integrations/
│   │   │       ├── index.ts
│   │   │       ├── linear.ts            # Pure HTTP — no platform deps
│   │   │       ├── jira.ts              # Pure HTTP — no platform deps
│   │   │       └── cloud.ts             # CloudIntegration for SaaS proxy
│   │   ├── package.json                 # "@quick-bug-reporter/core" (private: true)
│   │   └── tsconfig.json
│   │
│   ├── react/                           # NPM: "quick-bug-reporter-react"
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── ScreenshotCapturer.ts    # html2canvas-pro (DOM snapshot)
│   │   │   │   ├── ScreenRecorder.ts        # getDisplayMedia (browser share)
│   │   │   │   └── WebMetadata.ts           # navigator + window.screen
│   │   │   ├── ui/
│   │   │   │   ├── BugReporterProvider.tsx   # Context + floating button trigger
│   │   │   │   ├── BugReporterModal.tsx      # Radix Dialog (2-step wizard)
│   │   │   │   ├── ScreenshotAnnotator.tsx   # Canvas overlay for highlights
│   │   │   │   ├── FloatingBugButton.tsx     # Positioned button
│   │   │   │   ├── RegionSelector.tsx        # Click-drag region capture
│   │   │   │   └── primitives/              # shadcn/ui components
│   │   │   └── index.ts                     # Re-exports core + web-specific
│   │   ├── package.json                     # depends on @quick-bug-reporter/core
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts                   # Bundles core into dist/
│   │
│   └── react-native/                       # NPM: "quick-bug-reporter-react-native"
│       ├── src/
│       │   ├── core/
│       │   │   ├── ShakeDetector.ts         # react-native-shake wrapper
│       │   │   ├── ScreenshotCapturer.ts    # react-native-view-shot wrapper
│       │   │   ├── ScreenRecorder.ts        # nitro-screen-recorder wrapper
│       │   │   ├── DeviceMetadata.ts        # react-native-device-info wrapper
│       │   │   └── types.ts                 # MobileClientMetadata extensions
│       │   ├── ui/
│       │   │   ├── BugReporterProvider.tsx   # Context + shake + bottom sheet
│       │   │   ├── BugReporterSheet.tsx      # @gorhom/bottom-sheet
│       │   │   ├── ScreenshotAnnotator.tsx   # Skia canvas + gesture handler
│       │   │   ├── FloatingBugButton.tsx     # Animated FAB
│       │   │   └── ReportForm.tsx            # Title, description, provider
│       │   └── index.ts                     # Re-exports core + RN-specific
│       ├── package.json                     # depends on @quick-bug-reporter/core
│       ├── tsconfig.json
│       ├── tsup.config.ts                   # Bundles core into dist/
│       ├── react-native.config.js
│       └── app.plugin.js                    # Expo config plugin
│
├── apps/
│   ├── dashboard/                           # Next.js on Cloudflare Pages (SaaS)
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx                 # Projects overview + sparklines
│   │   │   │   ├── projects/[id]/
│   │   │   │   │   ├── page.tsx             # Project settings
│   │   │   │   │   ├── analytics/           # Sentry-style analytics
│   │   │   │   │   ├── reports/             # Recent reports table
│   │   │   │   │   └── integrations/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── lib/supabase.ts
│   │   ├── components/ui/                   # shadcn/ui
│   │   └── package.json
│   │
│   ├── example-web/                         # Web example app (Vite + React)
│   │   └── ...
│   │
│   └── example-react-native/               # RN example app (Expo dev client)
│       └── ...
│
├── supabase/
│   ├── functions/
│   │   └── ingest/index.ts                  # Edge Function proxy
│   ├── migrations/
│   │   ├── 001_initial_schema.sql           # 5 tables + RLS + Vault
│   │   └── 002_mobile_columns.sql           # platform, device_model, etc.
│   └── config.toml
│
├── pnpm-workspace.yaml
├── turbo.json                               # Turborepo for build orchestration
├── .github/
│   └── workflows/
│       ├── publish-react.yml                # NPM publish for web SDK
│       └── publish-react-native.yml         # NPM publish for RN SDK
└── .env.example
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
```

```json
// turbo.json — parallel builds, respects dependency graph
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### How Core Gets Bundled

Each SDK's `tsup.config.ts` bundles `@quick-bug-reporter/core` into its own `dist/`:

```ts
// packages/react/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom"],
  // Core is NOT external — it gets bundled in
  noExternal: ["@quick-bug-reporter/core"],
});
```

```ts
// packages/react-native/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: [
    "react",
    "react-native",
    "react-native-view-shot",
    "react-native-shake",
    "react-native-nitro-screen-recorder",
    "react-native-device-info",
    "@shopify/react-native-skia",
    "@gorhom/bottom-sheet",
    "react-native-gesture-handler",
    "react-native-reanimated",
  ],
  noExternal: ["@quick-bug-reporter/core"],
});
```

**Result:** `npm install quick-bug-reporter-react` gives you everything — core logic, integrations, web UI. Same for the RN package. Zero coordination between versions.

### Dependency Graph

```
@quick-bug-reporter/core (private, internal)
  ├─→ quick-bug-reporter-react (NPM)
  │     imports: core types, NetworkLogger, ConsoleCapture, integrations
  │     adds: html2canvas-pro, Radix UI, Tailwind, DOM APIs
  │
  └─→ quick-bug-reporter-react-native (NPM)
        imports: core types, NetworkLogger, ConsoleCapture, integrations
        adds: view-shot, Skia, bottom-sheet, device-info, shake

apps/dashboard (internal, deployed to Cloudflare Pages)
  └─→ reads report_events from Supabase (both web + mobile reports)

supabase/functions/ingest (deployed to Supabase)
  └─→ receives reports from BOTH SDKs via CloudIntegration
```

### What Each NPM Package Exports

**`quick-bug-reporter-react`** (web):
```ts
// Components
export { BugReporterProvider, useBugReporter } from "./ui/BugReporterProvider";
export { BugReporterModal } from "./ui/BugReporterModal";
export { FloatingBugButton } from "./ui/FloatingBugButton";

// Core (re-exported from @quick-bug-reporter/core)
export { BugReporter, BugSession, NetworkLogger, ConsoleCapture } from "@quick-bug-reporter/core";

// Integrations (re-exported from @quick-bug-reporter/core)
export { LinearIntegration, JiraIntegration, CloudIntegration } from "@quick-bug-reporter/core/integrations";

// Types
export type { BugReportPayload, BugSubmitResult, ... } from "@quick-bug-reporter/core";
```

**`quick-bug-reporter-react-native`** (mobile):
```ts
// Components
export { BugReporterProvider, useBugReporter } from "./ui/BugReporterProvider";
export { BugReporterSheet } from "./ui/BugReporterSheet";
export { FloatingBugButton } from "./ui/FloatingBugButton";

// Core (re-exported from @quick-bug-reporter/core)
export { BugReporter, BugSession, NetworkLogger, ConsoleCapture } from "@quick-bug-reporter/core";

// Integrations (re-exported from @quick-bug-reporter/core)
export { LinearIntegration, JiraIntegration, CloudIntegration } from "@quick-bug-reporter/core/integrations";

// RN-specific
export { useShakeDetector } from "./core/ShakeDetector";
export type { MobileClientMetadata } from "./core/types";
```

**Consumer experience — identical pattern, different packages:**

```tsx
// Web app
import { BugReporterProvider, FloatingBugButton } from "quick-bug-reporter-react";
import { CloudIntegration } from "quick-bug-reporter-react";

// React Native app
import { BugReporterProvider, FloatingBugButton } from "quick-bug-reporter-react-native";
import { CloudIntegration } from "quick-bug-reporter-react-native";
```

### SaaS Integration — Both SDKs → Same Backend

Both SDKs use the **same `CloudIntegration`** class (from `@quick-bug-reporter/core`) to submit reports to the Supabase Edge Function. The Edge Function receives reports from web and mobile, parses the metadata, and logs to `report_events`.

```
Web SDK ──→ CloudIntegration ──→ POST /functions/v1/ingest ──→ Jira/Linear
                                       │
RN SDK  ──→ CloudIntegration ──→ POST /functions/v1/ingest ──→ Jira/Linear
                                       │
                                       ▼
                                report_events table
                                (platform: 'web' | 'ios' | 'android')
                                       │
                                       ▼
                              Dashboard Analytics
                              (unified web + mobile view)
```

The Edge Function detects the platform from metadata and populates `platform`, `device_model`, `device_brand`, etc. Dashboard analytics work across both platforms out of the box.

### Independent Release Cycles

Each package has its **own semver** and release workflow:

| Package | Version | Published when |
|---------|---------|----------------|
| `quick-bug-reporter-react` | `1.x.x` | Web SDK changes |
| `quick-bug-reporter-react-native` | `0.x.x` | RN SDK changes |
| `@quick-bug-reporter/core` | N/A | Never published — bundled into each SDK |

When shared core changes, both SDKs get a patch/minor bump and re-publish. GitHub Actions handles this:

```yaml
# .github/workflows/publish-react.yml
on:
  push:
    paths: ["packages/core/**", "packages/react/**"]
    tags: ["react-v*"]
```

```yaml
# .github/workflows/publish-react-native.yml
on:
  push:
    paths: ["packages/core/**", "packages/react-native/**"]
    tags: ["react-native-v*"]
```

---

## API Design

### Basic Usage (shake-to-report)

```tsx
import {
  BugReporterProvider,
  FloatingBugButton,
} from "quick-bug-reporter-react-native";
import { LinearIntegration } from "quick-bug-reporter-react-native/integrations";

function App() {
  return (
    <BugReporterProvider
      integrations={{
        linear: new LinearIntegration({ apiKey: "...", teamId: "..." }),
      }}
      shakeEnabled={true}           // default: true
      captureOnShake="screenshot"   // "screenshot" | "video" | "prompt"
      appVersion="1.2.3"
      environment="production"
    >
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
      <FloatingBugButton />         {/* optional visible button */}
    </BugReporterProvider>
  );
}
```

### Programmatic API

```tsx
import { useBugReporter } from "quick-bug-reporter-react-native";

function SettingsScreen() {
  const { captureScreenshot, startRecording, openSheet } = useBugReporter();

  return (
    <Button
      title="Report a Bug"
      onPress={async () => {
        await captureScreenshot();
        openSheet();
      }}
    />
  );
}
```

### Cloud Integration (SaaS mode)

```tsx
import { CloudIntegration } from "quick-bug-reporter-react-native/integrations";

<BugReporterProvider
  integrations={{
    cloud: new CloudIntegration({
      projectKey: "qbr_proj_xxxxx",
      appVersion: "1.2.3",
      environment: "production",
    }),
  }}
/>
```

---

## Expo Compatibility

The SDK should support both **bare React Native** and **Expo** (with dev client).

| Library | Expo Go | Expo Dev Client | Bare RN |
|---------|:-------:|:---------------:|:-------:|
| `react-native-view-shot` | ✅ (built-in) | ✅ | ✅ |
| `react-native-shake` | ❌ | ✅ | ✅ |
| `react-native-nitro-screen-recorder` | ❌ | ✅ (config plugin) | ✅ |
| `@shopify/react-native-skia` | ❌ | ✅ | ✅ |
| `react-native-device-info` | ❌ | ✅ | ✅ |
| `@gorhom/bottom-sheet` | ✅ | ✅ | ✅ |

**Expo Go limitation:** Several native modules require a custom dev client. The SDK will document this clearly and provide an Expo config plugin for automatic native configuration.

```json
// app.json (Expo)
{
  "expo": {
    "plugins": [
      "quick-bug-reporter-react-native"
    ]
  }
}
```

---

## Mobile-Specific Considerations

### Permissions

| Permission | Platform | When | Required for |
|------------|----------|------|-------------|
| None | Both | Screenshot | View rasterization is in-process |
| Microphone | Both | Video + audio | `react-native-nitro-screen-recorder` |
| Screen recording | Android | Global video | `FOREGROUND_SERVICE_MEDIA_PROJECTION` |
| Camera | Both | Optional face-cam overlay | In-app recording with camera |

### File Handling

The web SDK uses in-memory `Blob` objects. React Native works with **file URIs**:

```tsx
// Web: Blob
const screenshotBlob: Blob = await capturer.capture();

// React Native: file URI
const screenshotUri: string = await captureScreen({ format: "png" });
// "file:///tmp/ReactNative/screenshot-123.png"
```

For `FormData` upload, React Native supports file URIs directly:
```tsx
const formData = new FormData();
formData.append("screenshot", {
  uri: screenshotUri,
  type: "image/png",
  name: "screenshot.png",
} as any);
```

### Performance

- **Screenshot:** <100ms (native rasterization) vs web's 200-800ms (DOM parsing)
- **Annotation:** 60fps GPU-accelerated Skia vs web's 30-60fps canvas
- **Memory:** Screenshots saved to disk, not held in JS memory
- **Shake detection:** ~5ms latency (accelerometer threshold)

### Offline Support (future)

Mobile apps can be used offline. Future enhancement:
- Queue reports locally (SQLite/MMKV)
- Sync when connection returns
- Show pending report count in UI

---

## Report Events — Mobile Analytics Extensions

The existing `report_events` table (from SAAS_PLAN.md) needs new columns for mobile context:

```sql
ALTER TABLE report_events ADD COLUMN IF NOT EXISTS
  platform TEXT,                    -- 'ios' | 'android' | 'web'
  device_model TEXT,                -- 'iPhone 15 Pro' | 'Pixel 8'
  device_brand TEXT,                -- 'Apple' | 'Google' | 'Samsung'
  os_version TEXT,                  -- already exists, now also used for mobile
  is_emulator BOOLEAN DEFAULT false,
  battery_level REAL,
  free_storage_mb INT,
  app_build_number TEXT,
  invocation_method TEXT;           -- 'shake' | 'button' | 'programmatic'
```

**New dashboard views:**
- **Platform split** — pie chart: iOS vs Android vs Web
- **Device model ranking** — table: which devices produce the most bugs
- **Invocation method** — how users trigger reports (shake vs button)
- **Battery/storage correlation** — do low-resource devices bug more?

---

## Implementation Phases

> These phases integrate with the SaaS migration path in `SAAS_PLAN.md`. Phase 0 (monorepo setup) should happen **before** or **alongside** SaaS Phase 1.

### Phase 0 — Monorepo Setup (3-5 days)

This phase restructures the existing repo into the monorepo layout. The web SDK must continue working identically after the move — no breaking changes.

- [ ] Create `quick-bug-reporter/` monorepo root with `pnpm-workspace.yaml` + `turbo.json`
- [ ] Extract shared code into `packages/core/` (`private: true`):
  - `types.ts`, `NetworkLogger.ts`, `ConsoleCapture.ts`, `BugReporter.ts`, `BugSession.ts`
  - `integrations/linear.ts`, `integrations/jira.ts`
  - Add `CloudIntegration` here (from SaaS plan)
- [ ] Move existing web SDK into `packages/react/`
  - Update imports to use `@quick-bug-reporter/core`
  - Configure `tsup` with `noExternal: ["@quick-bug-reporter/core"]`
  - Verify `npm pack` output matches current package structure
- [ ] Adapt `BugSession` in core to support both `Blob` (web) and file URI (RN):
  - Change `BugSessionArtifacts.videoBlob` → `videoBlob: Blob | null` (web) with parallel `videoUri: string | null` (RN)
  - Or use a union type / generic: `Artifact<T extends Blob | string>`
- [ ] Scaffold `packages/react-native/` with `package.json` + `tsup.config.ts`
- [ ] Move `apps/dashboard/` + `supabase/` into monorepo (from SaaS plan)
- [ ] Create `apps/example-web/` (minimal Vite app using web SDK)
- [ ] Verify: `pnpm build` builds all packages, `pnpm --filter react typecheck` passes
- [ ] Verify: existing web SDK tests pass, `npm pack` output is identical

**Gate:** Web SDK works exactly as before. Monorepo CI passes. No consumer-facing changes.

### Phase 1 — React Native Core (1-2 weeks)

- [ ] Implement `ScreenshotCapturer` wrapper around `react-native-view-shot`
  - `captureScreen()` → returns file URI
  - `captureRef(viewRef)` → returns file URI (for specific view capture)
- [ ] Implement `DeviceMetadata` collector using `react-native-device-info`
  - Map all `MobileClientMetadata` fields
  - Fall back gracefully if permissions denied (battery, etc.)
- [ ] Implement `ShakeDetector` hook wrapping `react-native-shake`
  - Configurable enable/disable
  - Cooldown to prevent rapid-fire triggers
- [ ] Implement RN-specific `FormData` submission with file URIs
- [ ] Adapt `BugReporter` + `BugSession` for file-based artifacts
- [ ] Create `apps/example-react-native/` (Expo dev client app)
- [ ] Test: shake → screenshot captured → file URI stored correctly

### Phase 2 — React Native UI (1-2 weeks)

- [ ] Build `BugReporterSheet` with `@gorhom/bottom-sheet`
  - 50% snap (screenshot preview) → 90% snap (form)
  - Pan-down-to-close
- [ ] Build `ScreenshotAnnotator` with `@shopify/react-native-skia` + gesture handler
  - Pan gesture for drawing highlight rectangles
  - Undo/clear controls
  - `makeImageSnapshotAsync()` for exporting annotated image
- [ ] Build `FloatingBugButton` as animated FAB (`TouchableOpacity` + `Animated`)
- [ ] Build `ReportForm` (title, description, provider selector — React Native `TextInput` + `Picker`)
- [ ] Wire up `BugReporterProvider` with context + shake + bottom sheet
- [ ] Test: full flow — shake → annotate → fill form → submit to Linear/Jira

### Phase 3 — Video Recording (1 week)

- [ ] Integrate `react-native-nitro-screen-recorder` for in-app recording (iOS)
- [ ] Integrate global recording (iOS + Android)
- [ ] Add recording timer + stop button to the bottom sheet
- [ ] Test video upload via `FormData` with file URIs
- [ ] Graceful fallback: screenshot-only if recording permissions denied

### Phase 4 — SaaS + Mobile Analytics (1 week)

> Runs in parallel with or after SaaS Phase 2 from `SAAS_PLAN.md`.

- [ ] Add `002_mobile_columns.sql` migration (platform, device_model, invocation_method, etc.)
- [ ] Update `ingest` Edge Function to parse mobile metadata
- [ ] Both SDKs submit via `CloudIntegration` → same endpoint, same `report_events` table
- [ ] Dashboard: add platform filter, device model ranking, invocation method chart
- [ ] Test: web report + RN report both appear in unified analytics

### Phase 5 — Polish + Publish (1 week)

- [ ] Expo config plugin for automatic native setup (`app.plugin.js`)
- [ ] README for `quick-bug-reporter-react-native` with setup instructions
- [ ] Publish to npm as `quick-bug-reporter-react-native@0.1.0`
- [ ] GitHub Actions: `publish-react.yml` + `publish-react-native.yml`
- [ ] Update web SDK README to mention the RN package
- [ ] Landing page: "Works on Web and React Native"

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| `react-native-nitro-screen-recorder` is new/young | Medium | In-app recording is iOS-only; fall back to screenshot-only on Android initially |
| Skia adds ~3MB to bundle size | Low | Worth it for 60fps annotation; document size impact |
| Expo Go incompatibility | Low | Document dev client requirement; most production apps use dev client anyway |
| `react-native-shake` sensitivity varies by device | Low | Allow sensitivity config; provide manual trigger as fallback |
| File URI handling differs between platforms | Medium | Abstract behind `ScreenshotCapturer` wrapper; test thoroughly on both platforms |
| Android screen recording requires foreground service | Medium | Clear permission prompts; screenshot-only fallback |

---

## Summary

Two independent NPM packages, one monorepo, one SaaS backend.

| | Web SDK | React Native SDK |
|---|---------|------------------|
| **Package** | `quick-bug-reporter-react` | `quick-bug-reporter-react-native` |
| **Trigger** | Floating button | **Shake** + floating button |
| **Screenshot** | html2canvas-pro | react-native-view-shot |
| **Video** | getDisplayMedia | nitro-screen-recorder |
| **Annotation** | HTML Canvas | Skia + gesture handler |
| **UI** | Radix Dialog | Bottom sheet |
| **SaaS** | CloudIntegration → Supabase | Same CloudIntegration → same Supabase |

**Shared via `@quick-bug-reporter/core`** (internal, bundled): types, NetworkLogger, ConsoleCapture, BugReporter, BugSession, Linear/Jira/Cloud integrations — **~40% code reuse**.

**Monorepo:** pnpm workspaces + Turborepo. Core is `private: true`, bundled into each SDK by tsup. Consumers install one package and get everything.

**SaaS unification:** Both SDKs submit to the same `ingest` Edge Function. Dashboard analytics show web + mobile reports in a unified view with platform/device filters.

**Estimated effort:** Phase 0 (monorepo setup) 3-5 days + Phases 1-5 (RN SDK) 5-7 weeks.
**Key dependency risk:** `react-native-nitro-screen-recorder` (new but actively maintained).
**Biggest win:** In-app video recording on iOS requires no user prompt — far better UX than the web SDK's browser share dialog.
