# Dailyflows Plugin for OpenClaw

英文版文档请见 [README.md](./README.md)。

这个目录可以直接独立成一个开源仓库（例如 `dailyflows-plugin`），只维护插件，不需要维护整份 OpenClaw fork。

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
openclaw plugins install @dailyflows/openclaw-dailyflows@latest
openclaw gateway restart
```

### 方式 B：本地源码安装（开发调试）

```bash
openclaw plugins install -l ./dailyflows-plugin
openclaw gateway restart
```

> 插件一般只安装一次。除非换机器、清理配置、切 profile，平时不需要重复安装。


## 3) 用户侧：扫码绑定（Dailyflows App -> OpenClaw）

Dailyflows 云端需要回调你的 Gateway，所以要有公网 HTTPS 地址（常见方案：Tailscale Funnel）。

### 4.1 Tailscale 环境准备

```bash
brew install tailscale                    # 安装
sudo tailscaled                          # 启动守护进程
tailscale up                             # 登录 tailnet
tailscale status                         # 确认在线，记下 Tailscale IP
```

### 4.2 OpenClaw Gateway 基础配置

```bash
# 本地安全模式 + 密码保护
openclaw config set gateway.mode local
openclaw config set gateway.bind loopback
openclaw config set gateway.auth.mode password
openclaw config set gateway.auth.password "你的强密码"

# Tailscale Funnel 模式
openclaw config set gateway.tailscale.mode funnel
```

### 4.3 关键安全配置（解决远程访问问题）

```bash
# 解决 CORS 错误：允许 Tailscale 域名
openclaw config set gateway.controlUi.allowedOrigins '["https://你的机器名.ts.net"]'

# 解决设备配对：允许不安全认证（推荐）或手动 approve
openclaw config set gateway.controlUi.allowInsecureAuth true
```

### 4.4 设备配对管理（新增）

```bash
# 查看待批准设备和已配对设备
openclaw devices list

# 批准特定设备（用上面命令获取的 request ID）
openclaw devices approve <request-id>

# 或者批准最新请求
openclaw devices approve --latest

# 查看已批准设备列表
openclaw devices list
```

### 4.5 启动生效

```bash
openclaw gateway restart
openclaw status                         # 确认 Gateway: online
```

### 4.6 常见问题 & 解决方案

| 问题 | 原因 | 解决命令 |
|------|------|----------|
| **Gateway offline** | 网关进程问题 | `openclaw gateway restart` |
| **origin not allowed** | CORS 白名单缺失 | `gateway.controlUi.allowedOrigins` 加 Tailscale 域名 |
| **pairing required** | 设备未配对 | `openclaw devices list` → `openclaw devices approve <id>`<br>或 `gateway.controlUi.allowInsecureAuth true` |
| **Tailscale URL 能开但 offline** | WebSocket 转发问题 | 用 Tailscale IP 直连：`mode=off + bind=tailnet` |

### 4.7 验证与访问

**访问方式**：

| 方式 | 地址 | 状态 |
|------|------|------|
| **本地** | `http://127.0.0.1:18789/` | ✅ online |
| **Tailnet 内网** | `http://<tailscale-ip>:18789/` | ✅ online |
| **Tailscale Funnel** | `https://xxx.ts.net/` | ✅ online（配置后） |

**验证命令清单**：

```bash
openclaw status                          # Gateway 状态
openclaw config get gateway.*            # 配置确认
tailscale status                         # Tailscale 连接
openclaw devices list                    # 已授权设备列表
```

### 4.8 降级方案（最稳定）

如果 Funnel 有问题，用这个纯 Tailnet 方案：

```bash
openclaw config set gateway.tailscale.mode off
openclaw config set gateway.bind tailnet
openclaw gateway restart
```
访问：`http://<tailscale-ip>:18789/`

### 4.9 绑定流程（最后一步）

配置完成后：

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








