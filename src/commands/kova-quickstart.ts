// KOVA Quickstart — onboarding simplificado para usuarios no técnicos.
// Hace 5 preguntas y escribe la config mínima en ~/.kova/kova.json.
import fs from "node:fs/promises";
import path from "node:path";
import { cancel, intro, outro, select, text, confirm, isCancel } from "@clack/prompts";
import { theme } from "../../packages/terminal-core/src/theme.js";
import { formatCliCommand } from "../cli/command-format.js";
import {
  AUTONOMY_MODE_LABELS,
  AUTONOMY_MODES,
  MODE_TO_EXEC_POLICY,
  writeKovaMode,
  type KovaAutonomyMode,
} from "../infra/kova-autonomy-mode.js";
import { appendActionLog, ensureKovaDirs, kovaDir } from "../infra/kova-local-storage.js";

type QuickstartResult =
  | { ok: true; configPath: string }
  | { ok: false; reason: "cancelled" | "error"; message?: string };

const AI_PRESETS: Record<string, { model: string; baseUrl?: string; label: string }> = {
  local_llama: {
    model: "openai/local",
    baseUrl: "http://localhost:8090/v1",
    label: "IA local (llama.cpp en puerto 8090)",
  },
  local_ollama: {
    model: "openai/local",
    baseUrl: "http://localhost:11434/v1",
    label: "IA local (Ollama en puerto 11434)",
  },
  openai: {
    model: "openai/gpt-4o",
    label: "OpenAI (GPT-4o — necesitás API key)",
  },
  anthropic: {
    model: "anthropic/claude-sonnet-4-6",
    label: "Anthropic (Claude Sonnet 4.6 — necesitás API key)",
  },
  gemini: {
    model: "google/gemini-2.0-flash",
    label: "Google Gemini (Flash — necesitás API key)",
  },
};

const CHANNEL_HINTS: Record<string, string> = {
  terminal: `Listo. Hablale con: ${formatCliCommand("kova agent --message 'Hola'")}`,
  telegram: `Conectá Telegram con: ${formatCliCommand("kova channels setup telegram")}`,
  whatsapp: `Conectá WhatsApp con: ${formatCliCommand("kova channels setup whatsapp")}`,
  discord: `Conectá Discord con: ${formatCliCommand("kova channels setup discord")}`,
  slack: `Conectá Slack con: ${formatCliCommand("kova channels setup slack")}`,
};

export async function kovaQuickstartCommand(): Promise<QuickstartResult> {
  console.log();
  intro(theme.heading("🤖 KOVA — Configuración inicial"));
  console.log(theme.muted("  Vamos a configurar KOVA en 5 pasos. Podés cambiarlo después.\n"));

  // Step 1: AI model
  const aiChoice = await select({
    message: "¿Qué IA querés que use KOVA como cerebro?",
    options: Object.entries(AI_PRESETS).map(([value, preset]) => ({
      value,
      label: preset.label,
    })),
  });
  if (isCancel(aiChoice)) {
    cancel("Configuración cancelada.");
    return { ok: false, reason: "cancelled" };
  }

  // Step 2: API key (only for cloud providers)
  let apiKey: string | undefined;
  const preset = AI_PRESETS[aiChoice as string];
  if (!preset) {
    return { ok: false, reason: "error", message: "Preset desconocido" };
  }
  const needsKey = !["local_llama", "local_ollama"].includes(aiChoice as string);
  if (needsKey) {
    const providerName =
      aiChoice === "openai" ? "OpenAI" : aiChoice === "anthropic" ? "Anthropic" : "Google";
    const keyResult = await text({
      message: `API key de ${providerName} (se guarda solo en tu máquina):`,
      placeholder: "sk-...",
      validate: (v) => {
        if (!(v ?? "").trim()) {
          return "Necesitás ingresar una API key para continuar.";
        }
        return undefined;
      },
    });
    if (isCancel(keyResult)) {
      cancel("Configuración cancelada.");
      return { ok: false, reason: "cancelled" };
    }
    apiKey = (keyResult as string).trim();
  }

  // Step 3: preferred channel
  const channelChoice = await select({
    message: "¿Por dónde querés hablarle a KOVA?",
    options: [
      { value: "terminal", label: "Terminal (lo uso desde la línea de comandos)" },
      { value: "telegram", label: "Telegram" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "discord", label: "Discord" },
      { value: "slack", label: "Slack" },
    ],
  });
  if (isCancel(channelChoice)) {
    cancel("Configuración cancelada.");
    return { ok: false, reason: "cancelled" };
  }

  // Step 4: autonomy mode
  const modeChoice = await select({
    message: "¿Cómo querés que actúe KOVA?",
    options: AUTONOMY_MODES.map((mode) => ({
      value: mode,
      label: AUTONOMY_MODE_LABELS[mode],
    })),
  });
  if (isCancel(modeChoice)) {
    cancel("Configuración cancelada.");
    return { ok: false, reason: "cancelled" };
  }
  const autonomyMode = modeChoice as KovaAutonomyMode;

  // Step 5: semantic memory (optional)
  const wantsMemory = await confirm({
    message: "¿Activar memoria semántica profunda? (LanceDB — recuerda todo entre sesiones)",
    initialValue: false,
  });
  if (isCancel(wantsMemory)) {
    cancel("Configuración cancelada.");
    return { ok: false, reason: "cancelled" };
  }

  // Write config
  await ensureKovaDirs();
  const configPath = path.join(kovaDir(), "kova.json");

  const existingRaw = await fs.readFile(configPath, "utf8").catch(() => "{}");
  let existingConfig: Record<string, unknown> = {};
  try {
    existingConfig = JSON.parse(existingRaw) as Record<string, unknown>;
  } catch {
    existingConfig = {};
  }

  const agentConfig: Record<string, unknown> = {
    model: preset.model,
    ...(preset.baseUrl ? { baseUrl: preset.baseUrl } : {}),
    ...(apiKey && aiChoice === "openai" ? { auth: { OPENAI_API_KEY: apiKey } } : {}),
    ...(apiKey && aiChoice === "anthropic" ? { auth: { ANTHROPIC_API_KEY: apiKey } } : {}),
    ...(apiKey && aiChoice === "gemini" ? { auth: { GOOGLE_API_KEY: apiKey } } : {}),
  };

  // LanceDB semantic memory config — uses the same embedding endpoint as the AI provider.
  const memoryPluginConfig = wantsMemory
    ? {
        enabled: true,
        config: {
          embedding: {
            provider: "openai",
            model: "text-embedding-3-small",
            ...(preset.baseUrl ? { baseUrl: preset.baseUrl } : {}),
            ...(apiKey && aiChoice === "openai" ? { apiKey } : {}),
          },
          autoCapture: true,
          autoRecall: true,
          dbPath: path.join(kovaDir(), "memory", "lancedb"),
        },
      }
    : undefined;

  const newConfig = {
    ...existingConfig,
    agent: agentConfig,
    tools: {
      ...((existingConfig.tools as Record<string, unknown>) ?? {}),
      exec: {
        ...(((existingConfig.tools as Record<string, unknown>)?.exec as Record<string, unknown>) ??
          {}),
        mode: MODE_TO_EXEC_POLICY[autonomyMode],
      },
    },
    ...(memoryPluginConfig
      ? {
          plugins: {
            ...((existingConfig.plugins as Record<string, unknown>) ?? {}),
            "memory-lancedb": memoryPluginConfig,
          },
        }
      : {}),
  };

  await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2) + "\n", "utf8");
  // Persist the human-readable mode name separately (not in schema-validated kova.json).
  await writeKovaMode(autonomyMode);

  await appendActionLog({
    ts: Date.now(),
    type: "quickstart",
    ai: aiChoice as string,
    channel: channelChoice as string,
    autonomyMode,
  });

  const channelHint = CHANNEL_HINTS[channelChoice as string] ?? "";
  const memoryNote = wantsMemory
    ? `  ${theme.muted("Memoria semántica:")} ${theme.info("LanceDB activado")} — ${theme.muted("necesitás")}: ${formatCliCommand("kova plugins install memory-lancedb")}\n`
    : "";
  outro(
    `${theme.success("✓ KOVA configurado")} — config en ${theme.info(configPath)}\n\n` +
      `  ${theme.muted("Modo:")}            ${theme.info(AUTONOMY_MODE_LABELS[autonomyMode])}\n` +
      `  ${theme.muted("Arrancar KOVA:")}  ${formatCliCommand("kova gateway start --daemon")}\n` +
      (channelHint ? `  ${theme.muted("Siguiente paso:")} ${channelHint}\n` : "") +
      memoryNote +
      `\n  ${theme.muted("Cambiar modo:")}   ${formatCliCommand("kova config mode")}` +
      `\n  ${theme.muted("Editar config:")}  ${theme.info(configPath)}`,
  );

  return { ok: true, configPath };
}
