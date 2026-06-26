# KOVA — Agente de IA Autónomo

<p align="center">
  <strong>Tu asistente de IA personal, corriendo en tu propia máquina.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/by-Nexova-blueviolet?style=for-the-badge" alt="by Nexova">
  <img src="https://img.shields.io/badge/privacidad-100%25%20local-green?style=for-the-badge" alt="100% local">
</p>

**KOVA** es un agente de IA que corre completamente en tu dispositivo. Nada sale de tu máquina sin que vos lo decidas. Podés conectarlo a cualquier modelo de IA — local (llama.cpp, Ollama) o en la nube (OpenAI, Anthropic, Gemini) — y hablarle desde los canales que ya usás: WhatsApp, Telegram, Discord, Slack, iMessage, y más.

Hecho por [Nexova](https://nexova.ai) — Guatemala 🇬🇹

---

## ¿Qué hace KOVA?

- **Responde en tus canales** — WhatsApp, Telegram, Discord, Slack, Signal, iMessage, y más de 20 canales.
- **Cerebro intercambiable** — conectá cualquier IA: local (llama.cpp, Ollama) o cloud (OpenAI, Anthropic, Gemini).
- **100% privado** — todo queda en `~/.kova/` en tu máquina. Cero telemetría.
- **Logs transparentes** — cada acción queda registrada en `~/.kova/logs/`.
- **Memoria persistente** — KOVA recuerda contexto entre conversaciones.
- **Siempre activo** — corre como servicio en background (macOS, Linux, Windows).

---

## Instalación rápida

Necesitás **Node.js 22.19 o superior** (recomendado: Node 24).

```bash
npm install -g kova@latest

kova setup
```

`kova setup` te guía paso a paso: elige tu IA, conecta tus canales, y listo.

---

## Inicio rápido

```bash
# Instalar y configurar
npm install -g kova@latest
kova setup

# Arrancar KOVA como servicio en background
kova gateway start --daemon

# Verificar que está corriendo
kova gateway status

# Hablarle directamente desde la terminal
kova agent --message "¿Qué podés hacer?"
```

---

## Tu IA (cerebro intercambiable)

Configuración mínima en `~/.kova/kova.json`:

```json5
{
  agent: {
    model: "anthropic/claude-sonnet-4-6",
    // o para IA local:
    // model: "openai/local",
    // baseUrl: "http://localhost:8090/v1",
  },
}
```

Modelos soportados:
- **Local**: llama.cpp (`llama-server`), Ollama, LM Studio, cualquier servidor compatible con OpenAI API
- **Cloud**: OpenAI, Anthropic, Google Gemini, Azure, Amazon Bedrock, y más

---

## Privacidad y datos

KOVA no envía datos fuera de tu máquina a menos que vos configures un canal externo.

- Configuración: `~/.kova/kova.json`
- Logs de acciones: `~/.kova/logs/`
- Memoria: `~/.kova/memory/`
- Workspace del agente: `~/.kova/workspace/`

Para revisar qué hace KOVA en cualquier momento:

```bash
kova logs          # Ver logs recientes
kova doctor        # Diagnóstico del sistema
```

---

## Canales soportados

WhatsApp · Telegram · Discord · Slack · Signal · iMessage · Google Chat · IRC · Microsoft Teams · Matrix · LINE · Mattermost · Nostr · Twitch · WeChat · QQ · y más.

---

## Plataformas

- **macOS** — app nativa con menú en la barra + voz
- **Linux** — servicio systemd
- **Windows** — app Hub nativa + servicio

---

## Desde el código fuente

```bash
git clone https://github.com/nexova/kova.git
cd kova
pnpm install
pnpm kova setup
pnpm gateway:watch
```

---

## Comandos útiles

```bash
kova setup                    # Configuración inicial
kova gateway start --daemon   # Arrancar en background
kova gateway stop             # Detener
kova gateway status           # Estado
kova agent --message "..."    # Hablar con el agente
kova logs                     # Ver logs
kova doctor                   # Diagnóstico
kova update                   # Actualizar
```

Comandos en el chat: `/status`, `/nuevo`, `/reset`, `/compact`, `/think alto`, `/usage`, `/restart`

---

## Contribuir

KOVA es un fork de [OpenClaw](https://github.com/openclaw/openclaw) (MIT), adaptado y extendido por Nexova.

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.

---

## Nexova

KOVA fue creado por **Ovaaniii** como parte de Nexova, empresa de IA fundada en Guatemala en 2026.

- Nexova está construida sobre la convicción de que la IA poderosa debe ser accesible, privada, y correr en el hardware del usuario.
- OVA es el modelo de lenguaje propio de Nexova, basado en llama.cpp.
