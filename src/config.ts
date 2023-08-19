import dotenv from "dotenv";

dotenv.config();

import { ensureEnvVar } from "./utils/os";
import { isTruthy, lstrip } from "./utils/string";

export const config = {
  app: {
    port: ensureEnvVar("CHARON_PORT", Number, 4500),
    host: ensureEnvVar("CHARON_PUBLIC_HOST", "http://localhost:4500"),
    charonUrl(uri = "", params?: Record<string, string>): string {
      return `${this.host}/${lstrip(uri, "/")}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
    },
  },
  security: {
    cookie: {
      secret: ensureEnvVar("CHARON_COOKIE_SECRET"),
      key: "charon.sess",
    },
    proxy: {
      enabled: ensureEnvVar("CHARON_PROXY", isTruthy, false),
      host: ensureEnvVar("CHARON_PROXY_HOST", "localhost"),
      port: ensureEnvVar("CHARON_PROXY_PORT", Number, 4501),
    },
  },
  providers: ["github", "moncomptepro", "moncompteprotest"] as const,
} as const;
