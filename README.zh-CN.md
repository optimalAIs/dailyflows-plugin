# Dailyflows Plugin for OpenClaw

英文版文档请见 [README.md](./README.md)。

这个目录可以直接独立成一个开源仓库（例如 `dailyflows-openclaw-plugin`），只维护插件，不需要维护整份 OpenClaw fork。

## 1) 用户侧：安装 OpenClaw（官方）

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

或：

```bash
npm install -g openclaw@latest
```

首次初始化：

```bash
openclaw onboard --install-daemon
openclaw gateway status
```

看到 `Runtime: running` + `RPC probe: ok`，说明 Gateway 正常。

## 2) 用户侧：安装 Dailyflows 插件

### 方式 A：npm 安装（推荐）

```bash
openclaw plugins install @dailyflows-openclaw/dailyflows
openclaw gateway restart
```

### 方式 B：本地源码安装（开发调试）

```bash
openclaw plugins install -l ./dailyflows-plugin
openclaw gateway restart
```

> 插件一般只安装一次。除非换机器、清理配置、切 profile，平时不需要重复安装。

## 3) 用户侧：最小配置

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

建议用环境变量配置 webhook secret：

```bash
export DAILYFLOWS_WEBHOOK_SECRET="replace-with-random"
# 可选，按 accountId 覆盖
export DAILYFLOWS_WEBHOOK_SECRET_DEFAULT="replace-with-random"
```

## 4) 用户侧：扫码绑定（Dailyflows App -> OpenClaw）

Dailyflows 云端需要回调你的 Gateway，所以要有公网 HTTPS 地址（常见方案：Tailscale Funnel）。

示例：

```bash
openclaw config set gateway.mode local
openclaw config set gateway.bind loopback
openclaw config set gateway.auth.mode password
openclaw config set gateway.auth.password "<strong-password>"
openclaw config set gateway.tailscale.mode funnel
openclaw gateway restart
```

绑定流程：

1. 打开 `https://<gateway-host>/dailyflows/pair`
2. Dailyflows App 进入 `Voice Assistant -> OpenClaw`
3. 扫码完成绑定

也可以在终端生成二维码：

```bash
openclaw dailyflows pair --gateway-url https://<your-funnel-url>
```

## 5) 用户侧：发送消息

绑定后，直接在 Dailyflows 聊天中给 OpenClaw 发文字/附件即可。

链路：

1. Dailyflows -> `POST /dailyflows/webhook`
2. OpenClaw Agent 处理
3. Gateway -> `outboundUrl` 回发 Dailyflows

手动验证（从 OpenClaw 主动发消息）：

```bash
openclaw message send --channel dailyflows --target <conversationId> --message "hello from openclaw"
```

## 6) 排查命令

```bash
openclaw gateway status
openclaw health
openclaw status --deep
openclaw plugins list
```

重点检查：

- 模型认证是否完成（onboard）
- Gateway 是否可公网 HTTPS 访问
- `plugins.entries.dailyflows.enabled` 是否为 `true`
- `channels.dailyflows.accounts.default` 的 `outboundUrl/outboundToken/webhookSecret` 是否有效

---

## 7) 维护者侧：把本目录作为独立仓库

建议结构（本目录已包含）：

- `src/` 插件源码
- `openclaw.plugin.json` 插件声明
- `package.json` 发布配置（npm + OpenClaw 元信息）
- `.github/workflows/ci.yml` 持续集成
- `scripts/release.sh` 一键发布脚本

安装依赖与测试：

```bash
pnpm install
pnpm check
```

发布到 npm：

```bash
npm login
pnpm release
```

如果你已经在 CI 里跑过测试，想跳过本地测试：

```bash
SKIP_TESTS=1 pnpm release
```

## 8) 一键导出为独立 Git 仓库

本目录已内置两个脚本：

```bash
# 仅本地初始化（git init + 首次 commit）
./scripts/init-standalone-local.sh

# 初始化并绑定 GitHub 远端（可选 --push 直接推送）
./scripts/init-standalone-with-remote.sh git@github.com:<you>/<repo>.git main
./scripts/init-standalone-with-remote.sh git@github.com:<you>/<repo>.git main --push
```

如果你已经在别处 `git init` 过，第二个脚本会复用已有仓库，只更新 `origin`。
