import type { Command } from "commander";
import qrcode from "qrcode-terminal";
import type { OpenClawConfig } from "openclaw/plugin-sdk";

import { normalizeGatewayUrl } from "./pairing.js";

const DEFAULT_GATEWAY_PORT = 18789;

function resolveLocalGatewayUrl(config: OpenClawConfig, override?: string) {
  if (override?.trim()) {
    return override.trim();
  }
  const port = typeof config.gateway?.port === "number" ? config.gateway.port : DEFAULT_GATEWAY_PORT;
  return `http://127.0.0.1:${port}`;
}

function buildGatewayAuthHeaders(config: OpenClawConfig) {
  const mode = config.gateway?.auth?.mode;
  const token = config.gateway?.auth?.token;
  const password = config.gateway?.auth?.password;
  const headers = new Headers();
  const bearer = mode === "password" ? password : token;
  if (bearer) {
    headers.set("Authorization", `Bearer ${String(bearer)}`);
  }
  return headers;
}

export function registerDailyflowsCli(params: {
  program: Command;
  config: OpenClawConfig;
}) {
  const { program, config } = params;

  const root = program
    .command("dailyflows")
    .description("Dailyflows pairing helpers")
    .addHelpText("after", () => "\nDocs: https://docs.openclaw.ai/channels/dailyflows\n");

  root
    .command("pair")
    .description("Generate a Dailyflows pairing QR from the running gateway")
    .requiredOption("--gateway-url <url>", "Public HTTPS gateway URL (Tailscale Funnel)")
    .option("--account <id>", "Dailyflows account id", "default")
    .option("--gateway-http <url>", "Local gateway HTTP base URL")
    .option("--json", "Print JSON only")
    .action(async (options: { gatewayUrl: string; account: string; gatewayHttp?: string; json?: boolean }) => {
      const publicUrl = normalizeGatewayUrl(options.gatewayUrl);
      if (!publicUrl) {
        throw new Error("--gateway-url must be a public https:// URL (Tailscale Funnel)");
      }

      const localGateway = resolveLocalGatewayUrl(config, options.gatewayHttp);
      const pairingUrl = new URL("/dailyflows/pair", localGateway);
      pairingUrl.searchParams.set("gatewayUrl", publicUrl);
      pairingUrl.searchParams.set("accountId", options.account);
      pairingUrl.searchParams.set("format", "json");

      const res = await fetch(pairingUrl.toString(), {
        headers: buildGatewayAuthHeaders(config),
      });
      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(
          `Gateway pairing endpoint failed: ${res.status} ${res.statusText} ${bodyText}`,
        );
      }
      let payload: {
        ok?: boolean;
        error?: string;
        gatewayUrl?: string;
        accountId?: string;
        pairCode?: string;
        payload?: string;
        expiresAt?: number;
      };
      try {
        payload = JSON.parse(bodyText) as {
          ok?: boolean;
          error?: string;
          gatewayUrl?: string;
          accountId?: string;
          pairCode?: string;
          payload?: string;
          expiresAt?: number;
        };
      } catch {
        const compact = bodyText.replace(/\s+/g, " ").slice(0, 200);
        throw new Error(
          `Gateway pairing endpoint returned non-JSON response. URL=${pairingUrl.toString()} body=${compact}. Please ensure gateway is running and restart it to reload plugin routes.`,
        );
      }

      if (!payload.ok || !payload.payload) {
        throw new Error(payload.error || "Failed to generate pairing payload");
      }

      if (options.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(payload, null, 2));
        return;
      }

      qrcode.generate(payload.payload, { small: true });
      // eslint-disable-next-line no-console
      console.log("\nDailyflows pairing payload:");
      // eslint-disable-next-line no-console
      console.log(payload.payload);
      // eslint-disable-next-line no-console
      console.log(`\nGateway URL: ${payload.gatewayUrl}`);
      // eslint-disable-next-line no-console
      console.log(`Pair code: ${payload.pairCode}`);
    });
}
