import { BugReporterIntegration } from "../types";

export { LinearIntegration, type LinearIntegrationOptions } from "./linear";
export { JiraIntegration, type JiraIntegrationOptions } from "./jira";
export { CloudIntegration, type CloudIntegrationOptions } from "./cloud";

export type BugReporterIntegrations = Partial<Record<"linear" | "jira" | "cloud", BugReporterIntegration>>;
