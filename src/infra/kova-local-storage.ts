// KOVA local storage — everything stays on the user's machine.
// Manages ~/.kova/{logs,memory,workspace} directory structure and action logging.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type KovaActionLogEntry = {
  ts: number;
  type: string;
  [key: string]: unknown;
};

function resolveKovaBaseDir(): string {
  const override = process.env.KOVA_HOME?.trim() || process.env.OPENCLAW_STATE_DIR?.trim();
  if (override) {
    return override.replace(/^~/, os.homedir());
  }
  return path.join(os.homedir(), ".kova");
}

export function kovaDir(): string {
  return resolveKovaBaseDir();
}

export function kovaLogsDir(): string {
  return path.join(resolveKovaBaseDir(), "logs");
}

export function kovaMemoryDir(): string {
  return path.join(resolveKovaBaseDir(), "memory");
}

export function kovaWorkspaceDir(): string {
  return path.join(resolveKovaBaseDir(), "workspace");
}

/** Creates the full ~/.kova/ directory tree if it doesn't exist. */
export async function ensureKovaDirs(): Promise<void> {
  await Promise.all([
    fs.mkdir(kovaLogsDir(), { recursive: true }),
    fs.mkdir(kovaMemoryDir(), { recursive: true }),
    fs.mkdir(kovaWorkspaceDir(), { recursive: true }),
  ]);
}

function todayLogFile(): string {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return path.join(kovaLogsDir(), `${date}.jsonl`);
}

/** Appends a structured action entry to today's log file (~/.kova/logs/YYYY-MM-DD.jsonl). */
export async function appendActionLog(entry: KovaActionLogEntry): Promise<void> {
  try {
    await fs.mkdir(kovaLogsDir(), { recursive: true });
    const line = JSON.stringify({ ...entry, ts: entry.ts ?? Date.now() }) + "\n";
    await fs.appendFile(todayLogFile(), line, "utf8");
  } catch {
    // Logging must never crash the agent.
  }
}

/** Reads the last N lines from today's log file. Returns newest-first. */
export async function readRecentLogs(limit = 50): Promise<KovaActionLogEntry[]> {
  try {
    const raw = await fs.readFile(todayLogFile(), "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .reverse()
      .map((line) => JSON.parse(line) as KovaActionLogEntry);
  } catch {
    return [];
  }
}
