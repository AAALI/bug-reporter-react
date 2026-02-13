export { BugReporter } from "./core/BugReporter";
export { BugSession } from "./core/BugSession";
export { ScreenRecorder } from "./core/ScreenRecorder";
export { ScreenshotCapturer } from "./core/ScreenshotCapturer";
export type { CaptureRegion } from "./core/ScreenshotCapturer";
export { collectClientEnvironmentMetadata } from "./core/WebMetadata";

// Re-exported from @quick-bug-reporter/core
export { NetworkLogger } from "@quick-bug-reporter/core";
export { ConsoleCapture } from "@quick-bug-reporter/core";
export type { ConsoleLogEntry, CapturedJsError } from "@quick-bug-reporter/core";

export type {
  BugClientMetadata,
  BugReportPayload,
  BugReporterIntegration,
  BugSessionArtifacts,
  BugSubmitResult,
  BugTrackerProvider,
  NetworkLogEntry,
  RecordingStopReason,
  ReportCaptureMode,
  ScreenshotHighlightRegion,
  SubmitProgressCallback,
} from "@quick-bug-reporter/core";
export {
  DEFAULT_MAX_RECORDING_MS,
  formatConsoleLogs,
  formatJsErrors,
  formatNetworkLogs,
  toErrorMessage,
} from "@quick-bug-reporter/core";

export { LinearIntegration, type LinearIntegrationOptions } from "@quick-bug-reporter/core";
export { JiraIntegration, type JiraIntegrationOptions } from "@quick-bug-reporter/core";
export { CloudIntegration, type CloudIntegrationOptions } from "@quick-bug-reporter/core";
export type { BugReporterIntegrations } from "@quick-bug-reporter/core";

export { BugReporterProvider, useBugReporter } from "./ui/BugReporterProvider";
export { FloatingBugButton } from "./ui/FloatingBugButton";
export { BugReporterModal } from "./ui/BugReporterModal";
