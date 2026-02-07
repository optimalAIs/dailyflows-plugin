# Dailyflows Plugin for OpenClaw

This directory is designed to be maintained as a standalone open-source repository (for example `dailyflows-plugin`). You can maintain only the plugin without maintaining a full OpenClaw fork.

For Chinese documentation, see [README.zh-CN.md](./README.zh-CN.md).

## 1) Install OpenClaw (official)

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Or:

```bash
npm install -g openclaw@latest
```

Initial setup:

```bash
openclaw onboard --install-daemon
openclaw gateway status
```

If you see `Runtime: running` + `RPC probe: ok`, your Gateway is healthy.

## 2) Install the Dailyflows plugin

### Option A: Install from npm (recommended)

```bash
openclaw plugins install @dailyflows/dailyflows
openclaw gateway restart
```

### Option B: Install from local source (development)

```bash
openclaw plugins install -l ./dailyflows-plugin
openclaw gateway restart
```

> You usually install the plugin only once. Reinstall only when you switch machines/profiles or reset config.

## 3) Minimal config

```json5
{
  channels: {
    dailyflows: {
      webhookPath: "/dailyflows/webhook",
      accounts: {
        default: {
          enabled: true,
          outboundUrl: "https://dailyflows.example.com/openclaw/outbound",
          outboundToken: "REPLACE_ME"
        }
      }
    }
  },
  plugins: {
    entries: {
      dailyflows: { enabled: true }
    }
  }
}
```

Use environment variables for webhook secrets:

```bash
export DAILYFLOWS_WEBHOOK_SECRET="replace-with-random"
# Optional: per-account override
export DAILYFLOWS_WEBHOOK_SECRET_DEFAULT="replace-with-random"
```

## 4) Pair Dailyflows App with OpenClaw

The Dailyflows cloud must call back into your Gateway, so you need a public HTTPS URL (Tailscale Funnel is a common choice).

Example:

```bash
openclaw config set gateway.mode local
openclaw config set gateway.bind loopback
openclaw config set gateway.auth.mode password
openclaw config set gateway.auth.password "<strong-password>"
openclaw config set gateway.tailscale.mode funnel
openclaw gateway restart
```

Pairing flow:

1. Open `https://<gateway-host>/dailyflows/pair`
2. In Dailyflows App, go to `Voice Assistant -> OpenClaw`
3. Scan the QR code

You can also print the QR in CLI:

```bash
openclaw dailyflows pair --gateway-url https://<your-funnel-url>
```

## 5) Send messages

After pairing, send text or attachments to OpenClaw in the Dailyflows chat.

Message path:

1. Dailyflows -> `POST /dailyflows/webhook`
2. OpenClaw agent processes the message
3. Gateway -> `outboundUrl` sends the reply back to Dailyflows

Manual outbound check from CLI:

```bash
openclaw message send --channel dailyflows --target <conversationId> --message "hello from openclaw"
```

## 6) Troubleshooting commands

```bash
openclaw gateway status
openclaw health
openclaw status --deep
openclaw plugins list
```

Focus checks:

- Model authentication is completed (`onboard`)
- Gateway is publicly reachable via HTTPS
- `plugins.entries.dailyflows.enabled` is `true`
- `channels.dailyflows.accounts.default` has valid `outboundUrl/outboundToken/webhookSecret`

---

## 7) Maintainer workflow (standalone repo)

Recommended structure (already included):

- `src/` plugin source
- `openclaw.plugin.json` plugin manifest
- `package.json` npm + OpenClaw plugin metadata
- `.github/workflows/ci.yml` CI workflow
- `scripts/release.sh` one-command publish script


```


```



