import dotenv from "dotenv";

dotenv.config();

import { ensureEnvVar } from "./utils/os";
import { lstrip } from "./utils/string";

export const config = {
  app: {
    port: ensureEnvVar("CHARON_PORT", Number, 4500),
    host: ensureEnvVar("CHARON_PUBLIC_HOST", "http://localhost:4500"),
    charonUrl(uri = "", params?: Record<string, string>): string {
      return `${this.host}/${lstrip(uri, "/")}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
    },
  },
  security: {
    cookieSecret: ensureEnvVar("CHARON_COOKIE_SECRET"),
    cookieName: "charon:sess",
  },
  providers: ["github", "moncomptepro", "moncompteprotest"] as const,
} as const;
