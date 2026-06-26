// Setup command registration: baseline setup by default, onboarding wizard when wizard flags appear.
import type { Command } from "commander";
import { formatDocsLink } from "../../../packages/terminal-core/src/links.js";
import { theme } from "../../../packages/terminal-core/src/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { hasExplicitOptions } from "../command-options.js";

/** Register the `setup` command and route wizard-style invocations to onboarding. */
export function registerSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Configure KOVA interactively (choose your AI and channel)")
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Ejemplos:")}\n` +
        `  ${theme.command("kova setup")}\n` +
        `    ${theme.muted("Configuración guiada: elige tu IA y canal de chat.")}\n` +
        `  ${theme.command("kova setup --wizard")}\n` +
        `    ${theme.muted("Wizard completo: auth, modelos, Gateway y canales.")}\n` +
        `  ${theme.command("kova setup --advanced")}\n` +
        `    ${theme.muted("Setup silencioso para desarrolladores (sin prompts).")}\n\n`,
    )
    .option(
      "--workspace <dir>",
      "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)",
    )
    .option("--wizard", "Run interactive onboarding", false)
    .option("--non-interactive", "Run onboarding without prompts", false)
    .option(
      "--accept-risk",
      "Acknowledge that agents are powerful and full system access is risky (required for --non-interactive)",
      false,
    )
    .option("--mode <mode>", "Onboard mode: local|remote")
    .option("--import-from <provider>", "Migration provider to run during onboarding")
    .option("--import-source <path>", "Source agent home for --import-from")
    .option("--import-secrets", "Import supported secrets during onboarding migration", false)
    .option("--remote-url <url>", "Remote Gateway WebSocket URL")
    .option("--remote-token <token>", "Remote Gateway token (optional)")
    .option("--advanced", "Skip quickstart; run silent baseline setup (for developers)", false)
    .action(async (opts, command) => {
      const { defaultRuntime } = await import("../../runtime.js");
      await runCommandWithRuntime(defaultRuntime, async () => {
        const hasWizardFlags = hasExplicitOptions(command, [
          "wizard",
          "nonInteractive",
          "acceptRisk",
          "mode",
          "importFrom",
          "importSource",
          "importSecrets",
          "remoteUrl",
          "remoteToken",
        ]);
        // Any onboarding-only flag means the user intended the wizard path even without --wizard.
        if (opts.wizard || hasWizardFlags) {
          const { setupWizardCommand } = await import("../../commands/onboard.js");
          await setupWizardCommand(
            {
              workspace: opts.workspace as string | undefined,
              nonInteractive: Boolean(opts.nonInteractive),
              acceptRisk: Boolean(opts.acceptRisk),
              mode: opts.mode as "local" | "remote" | undefined,
              importFrom: opts.importFrom as string | undefined,
              importSource: opts.importSource as string | undefined,
              importSecrets: Boolean(opts.importSecrets),
              remoteUrl: opts.remoteUrl as string | undefined,
              remoteToken: opts.remoteToken as string | undefined,
            },
            defaultRuntime,
          );
          return;
        }
        // No flags: run the KOVA quickstart for non-technical users.
        // Pass --advanced to skip quickstart and run the baseline silent setup instead.
        if (!opts.advanced) {
          const { kovaQuickstartCommand } = await import("../../commands/kova-quickstart.js");
          const result = await kovaQuickstartCommand();
          if (!result.ok && result.reason === "error") {
            process.exitCode = 1;
          }
          return;
        }
        const { setupCommand } = await import("../../commands/setup.js");
        await setupCommand({ workspace: opts.workspace as string | undefined }, defaultRuntime);
      });
    });
}
