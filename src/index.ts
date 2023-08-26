import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";
import Koa from "koa";
import proxy from "koa-better-http-proxy";
import session from "koa-session";
import { inspect } from "util";

import { type CharonClient } from "./client/types";
import { config } from "./config";
import { controller } from "./controller";
import { type ProviderType } from "./provider";
import { logServer } from "./utils/logger";

declare module "koa-session" {
  interface Session {
    client: CharonClient;
    originalRedirectUri: string;
    params: Record<string, string | string[]>;
    provider: ProviderType;
  }
}

// Configuration de l'application Koa
const app = new Koa();

// Proxy
if (config.security.proxy.enabled) {
  logServer("Proxy enabled", { proxyConfig: config.security.proxy });
  app.use(
    proxy(config.security.proxy.host, {
      port: config.security.proxy.port,
    }),
  );
}

app.keys = [config.security.cookie.secret];

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: unknown) {
    console.error("Error in middleware", err);
    if (err instanceof Koa.HttpError) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
  }
});
app.use(cors({ credentials: true, origin: config.app.host }));
app.use(bodyParser());

app.use((ctx, next) => {
  const middleware = session(
    {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" ? ctx.request.protocol === "https" : false,
      key: config.security.cookie.key,
    },
    app,
  );

  return middleware(ctx, next) as never;
});

controller(app);

app.listen(config.app.port, () => {
  console.info(`Charon boot on ${config.app.host}`);
  logServer(inspect({ config }, { depth: Infinity, colors: true }));
});
