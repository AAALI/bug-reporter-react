export { BugReporter } from "./core/BugReporter";
export { BugSession } from "./core/BugSession";
export { ScreenRecorder } from "./core/ScreenRecorder";
export { ScreenshotCapturer } from "./core/ScreenshotCapturer";
export type { CaptureRegion } from "./core/ScreenshotCapturer";
export { NetworkLogger } from "./core/NetworkLogger";
export { ConsoleCapture } from "./core/ConsoleCapture";
export type { ConsoleLogEntry, CapturedJsError } from "./core/ConsoleCapture";

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
} from "./core/types";
export {
  DEFAULT_MAX_RECORDING_MS,
  collectClientEnvironmentMetadata,
  formatConsoleLogs,
  formatJsErrors,
  formatNetworkLogs,
  toErrorMessage,
} from "./core/types";

export { LinearIntegration, type LinearIntegrationOptions } from "./integrations/linear";
export { JiraIntegration, type JiraIntegrationOptions } from "./integrations/jira";
export type { BugReporterIntegrations } from "./integrations";

export { BugReporterProvider, useBugReporter } from "./ui/BugReporterProvider";
export { FloatingBugButton } from "./ui/FloatingBugButton";
export { BugReporterModal } from "./ui/BugReporterModal";
