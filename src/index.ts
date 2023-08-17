import { bodyParser } from "@koa/bodyparser";
import cors from "@koa/cors";
import Koa from "koa";
import session from "koa-session";

import { type CharonClient } from "./client/types";
import { config } from "./config";
import { controllers } from "./controllers";
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
app.keys = [config.security.cookieSecret];

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

app.use(
  session(
    {
      sameSite: "lax",
      secure: config.app.host.startsWith("https"), // important for POST requests with redirect
      key: config.security.cookieName,
    },
    app,
  ),
);

controllers(app);

app.listen(config.app.port, () => {
  console.info(`Charon boot on ${config.app.host}`);
  logServer({ config });
});
