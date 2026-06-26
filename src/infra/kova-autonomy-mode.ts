// KOVA autonomy mode — controls how aggressively the agent acts without user confirmation.
import fs from "node:fs/promises";
import path from "node:path";
import { kovaDir, ensureKovaDirs } from "./kova-local-storage.js";

export type KovaAutonomyMode = "safe" | "autonomous" | "unlimited";

export const AUTONOMY_MODES: KovaAutonomyMode[] = ["safe", "autonomous", "unlimited"];

export const AUTONOMY_MODE_LABELS: Record<KovaAutonomyMode, string> = {
  safe: "Seguro — te pido permiso antes de actuar",
  autonomous: "Autónomo — actúo solo y te aviso qué hice",
  unlimited: "Sin límites — control total, sin interrupciones",
};

/** Maps KOVA autonomy mode to the corresponding tools.exec.mode config value. */
export const MODE_TO_EXEC_POLICY: Record<KovaAutonomyMode, "ask" | "auto" | "full"> = {
  safe: "ask",
  autonomous: "auto",
  unlimited: "full",
};

const DEFAULT_MODE: KovaAutonomyMode = "safe";

function autonomyModeFilePath(): string {
  return path.join(kovaDir(), "autonomy-mode");
}

function isValidMode(value: string): value is KovaAutonomyMode {
  return AUTONOMY_MODES.includes(value as KovaAutonomyMode);
}

/** Returns the current KOVA autonomy mode. Defaults to "safe" if not set. */
export async function readKovaMode(): Promise<KovaAutonomyMode> {
  try {
    const raw = (await fs.readFile(autonomyModeFilePath(), "utf8")).trim();
    return isValidMode(raw) ? raw : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

/** Persist the autonomy mode and update tools.exec.mode in kova.json accordingly. */
export async function writeKovaMode(mode: KovaAutonomyMode): Promise<void> {
  await ensureKovaDirs();
  await fs.writeFile(autonomyModeFilePath(), mode, "utf8");
  await applyModeToKovaConfig(mode);
}

async function applyModeToKovaConfig(mode: KovaAutonomyMode): Promise<void> {
  const configPath = path.join(kovaDir(), "kova.json");
  let existing: Record<string, unknown> = {};
  try {
    const raw = await fs.readFile(configPath, "utf8");
    existing = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Config doesn't exist yet or is invalid — start fresh.
  }

  const existingTools = (existing.tools as Record<string, unknown>) ?? {};
  const existingExec = (existingTools.exec as Record<string, unknown>) ?? {};

  const updated = {
    ...existing,
    tools: {
      ...existingTools,
      exec: {
        ...existingExec,
        mode: MODE_TO_EXEC_POLICY[mode],
      },
    },
  };

  await fs.writeFile(configPath, JSON.stringify(updated, null, 2) + "\n", "utf8");
}
