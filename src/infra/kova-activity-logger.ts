// Logs agent activity (tool calls, messages, errors) to ~/.kova/logs/YYYY-MM-DD.jsonl.
// Subscribes to the process-global diagnostic event bus. Call once at process start.
import { onDiagnosticEvent } from "./diagnostic-events.js";
import { appendActionLog } from "./kova-local-storage.js";

const LOGGED_EVENT_TYPES = new Set([
  "tool.execution.completed",
  "tool.execution.error",
  "tool.execution.blocked",
  "agent.run.completed",
  "agent.run.failed",
]);

/** Start capturing agent activity into the daily KOVA log file. Returns an unsubscribe function. */
export function startKovaActivityLogger(): () => void {
  return onDiagnosticEvent((evt) => {
    if (!LOGGED_EVENT_TYPES.has(evt.type)) {
      return;
    }
    // Build a compact, readable log entry with only the useful fields.
    const entry: Record<string, unknown> = { ts: Date.now(), type: evt.type };

    if ("toolName" in evt) {
      entry.tool = evt.toolName;
    }
    if ("toolOwner" in evt && evt.toolOwner) {
      entry.owner = evt.toolOwner;
    }
    if ("sessionKey" in evt && evt.sessionKey) {
      entry.session = evt.sessionKey;
    }
    if ("agentId" in evt && (evt as Record<string, unknown>).agentId) {
      entry.agent = (evt as Record<string, unknown>).agentId;
    }
    if ("durationMs" in evt) {
      entry.ms = (evt as { durationMs: number }).durationMs;
    }
    if ("errorCategory" in evt) {
      entry.error = (evt as { errorCategory: string }).errorCategory;
    }
    if ("deniedReason" in evt) {
      entry.denied = (evt as { deniedReason: string }).deniedReason;
    }

    void appendActionLog(entry as Parameters<typeof appendActionLog>[0]);
  });
}
