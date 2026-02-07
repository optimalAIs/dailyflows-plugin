import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoPluginSdkPath = path.resolve(currentDir, "..", "src", "plugin-sdk", "index.ts");
const resolveAlias = fs.existsSync(monorepoPluginSdkPath)
  ? { "openclaw/plugin-sdk": monorepoPluginSdkPath }
  : {};

export default defineConfig({
  resolve: {
    alias: resolveAlias,
  },
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "dist/**"],
  },
});
