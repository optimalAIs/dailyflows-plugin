import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { dailyflowsPlugin } from "./src/channel.js";
import { registerDailyflowsCli } from "./src/cli.js";
import { resolveDailyflowsWebhookPath } from "./src/config.js";
import { createDailyflowsPairingRoute } from "./src/pairing-http.js";
import { setDailyflowsRuntime } from "./src/runtime.js";
import { createDailyflowsUnpairRoute } from "./src/unpair-http.js";
import { createDailyflowsWebhookHandler } from "./src/webhook.js";

const plugin = {
  id: "dailyflows",
  name: "Dailyflows",
  description: "Dailyflows webhook channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setDailyflowsRuntime(api.runtime);
    api.registerChannel({ plugin: dailyflowsPlugin });
    const cfg = api.runtime.config.loadConfig();
    api.registerHttpRoute({
      path: resolveDailyflowsWebhookPath(cfg),
      auth: "plugin",
      handler: createDailyflowsWebhookHandler(api),
    } as any);
    api.registerHttpRoute({
      path: "/dailyflows/pair",
      auth: "none",
      handler: createDailyflowsPairingRoute(api),
    } as any);
    api.registerHttpRoute({
      path: "/dailyflows/unpair",
      auth: "gateway",
      handler: createDailyflowsUnpairRoute(api),
    } as any);
    api.registerCli(({ program, config }) => registerDailyflowsCli({ program, config }), {
      commands: ["dailyflows"],
    });
  },
};

export default plugin;
