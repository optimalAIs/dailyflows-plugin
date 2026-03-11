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
openclaw plugins install @dailyflows/openclaw-dailyflows@latest
openclaw gateway restart
```

### Option B: Install from local source (development)

```bash
openclaw plugins install -l ./dailyflows-plugin
openclaw gateway restart
```

> You usually install the plugin only once. Reinstall only when you switch machines/profiles or reset config.


## 3) Pair Dailyflows App with OpenClaw

Dailyflows cloud needs to call back to your Gateway, so you need a public HTTPS URL (Tailscale Funnel is a common choice).

### 4.1 Tailscale Setup

```bash
brew install tailscale                    # Install
sudo tailscaled                          # Start daemon
tailscale up                             # Login to tailnet
tailscale status                         # Check online status and note Tailscale IP
```

### 4.2 OpenClaw Gateway Basic Configuration

```bash
# Local secure mode + password
openclaw config set gateway.mode local
openclaw config set gateway.bind loopback
openclaw config set gateway.auth.mode password
openclaw config set gateway.auth.password "<strong-password>"

# Tailscale Funnel mode
openclaw config set gateway.tailscale.mode funnel
```

### 4.3 Critical Security Configuration (Remote Access)

```bash
# Fix CORS error: Allow Tailscale domain
openclaw config set gateway.controlUi.allowedOrigins '["https://<your-machine-name>.ts.net"]'

# Fix device pairing: Allow insecure auth 
#openclaw config set gateway.controlUi.allowInsecureAuth true

# Or fix device pairing: manually approve(recommended)
# List pending and paired devices
openclaw devices list

# Approve a specific device (using request ID from above)
openclaw devices approve <request-id>

# Or approve the latest request
openclaw devices approve --latest

# Check approved devices list
openclaw devices list
```

### 4.4 Start and Verify

```bash
openclaw gateway restart
openclaw status                         # Confirm Gateway: online
```

### 4.5 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Gateway offline** | Gateway process issue | `openclaw gateway restart` |
| **origin not allowed** | Missing CORS whitelist | Add Tailscale domain to `gateway.controlUi.allowedOrigins` |
| **pairing required** | Device not paired | `openclaw devices list` → `openclaw devices approve <id>`<br>or `gateway.controlUi.allowInsecureAuth true` |
| **Tailscale URL valid but offline** | WebSocket forwarding issue | Use Tailscale IP directly: `mode=off + bind=tailnet` |

### 4.6 Verification & Access

**Access Methods**:

| Method | Address | Status |
|--------|---------|--------|
| **Local** | `http://127.0.0.1:18789/` | ✅ online |
| **Tailnet LAN** | `http://<tailscale-ip>:18789/` | ✅ online |
| **Tailscale Funnel** | `https://xxx.ts.net/` | ✅ online (after config) |

**Verification Commands**:

```bash
openclaw status                          # Gateway status
openclaw config get gateway.*            # Check config
tailscale status                         # Tailscale connection
openclaw devices list                    # List authorized devices
```

### 4.7 Fallback Plan (Most Stable)

If Funnel fails, use this pure Tailnet solution:

```bash
openclaw config set gateway.tailscale.mode off
openclaw config set gateway.bind tailnet
openclaw gateway restart
```
Access via: `http://<tailscale-ip>:18789/`

### 4.8 Pairing Flow (Final Step)

After configuration:

1. Open `https://<gateway-host>/dailyflows/pair`
2. In Dailyflows App, go to `Voice Assistant -> OpenClaw`
3. Scan the QR code

You can also generate the QR code in the terminal:

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



