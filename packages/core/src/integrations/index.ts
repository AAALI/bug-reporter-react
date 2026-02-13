import { BugReporterIntegration } from "../types";

export { LinearIntegration, type LinearIntegrationOptions } from "./linear";
export { JiraIntegration, type JiraIntegrationOptions } from "./jira";

export type BugReporterIntegrations = Partial<Record<"linear" | "jira", BugReporterIntegration>>;
