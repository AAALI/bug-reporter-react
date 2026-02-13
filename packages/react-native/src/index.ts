// Re-export shared core for React Native consumers
export {
  ConsoleCapture,
  NetworkLogger,
  LinearIntegration,
  JiraIntegration,
  DEFAULT_MAX_RECORDING_MS,
  formatConsoleLogs,
  formatJsErrors,
  formatNetworkLogs,
  toErrorMessage,
  toBlobFile,
  toRecordingFile,
  toScreenshotFile,
} from "@quick-bug-reporter/core";

export type {
  BugClientMetadata,
  BugReportPayload,
  BugReporterIntegration,
  BugReporterIntegrations,
  BugSessionArtifacts,
  BugSubmitResult,
  BugTrackerProvider,
  CapturedJsError,
  ConsoleLogEntry,
  LinearIntegrationOptions,
  JiraIntegrationOptions,
  NetworkLogEntry,
  RecordingStopReason,
  ReportCaptureMode,
  ScreenshotHighlightRegion,
  SubmitProgressCallback,
} from "@quick-bug-reporter/core";

// TODO: React Native specific exports will be added here
// export { BugReporterProvider, useBugReporter } from "./ui/BugReporterProvider";
// export { BugReporterSheet } from "./ui/BugReporterSheet";
// export { FloatingBugButton } from "./ui/FloatingBugButton";
// export { useShakeDetector } from "./core/ShakeDetector";
