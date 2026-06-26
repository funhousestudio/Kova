// KOVA env bridge — maps KOVA_* vars to OPENCLAW_* so the runtime reads them transparently.
// Call this before any config/state/path resolution runs.
//
// Pattern: KOVA_STATE_DIR → OPENCLAW_STATE_DIR (only when OPENCLAW_* is not already set).
// This lets users set KOVA_* vars without needing to know internal OPENCLAW_* names.

/** Copies every KOVA_<SUFFIX> env var into OPENCLAW_<SUFFIX> unless OPENCLAW_<SUFFIX> is set. */
export function applyKovaEnvBridge(env: NodeJS.ProcessEnv = process.env): void {
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("KOVA_") || value === undefined) {
      continue;
    }
    const mapped = `OPENCLAW_${key.slice(5)}`; // strip "KOVA_", prepend "OPENCLAW_"
    if (!env[mapped]) {
      env[mapped] = value;
    }
  }
}
