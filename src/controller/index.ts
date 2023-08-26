import Router from "@koa/router";
import type Koa from "koa";

import { config } from "../config";
import { catchAllRoutes } from "./provider/[...catchAll]";
import { prepareProviderRoutes } from "./provider/prepare";
import { wellKnownRoute } from "./provider/well-known";
import { healthcheckRoute } from "./root/healthcheck";
import { landingPage } from "./root/landing";
import { oauthCallbackRoute } from "./root/oauthCallback";
import { type ProviderRouterState } from "./type";

export const controller = (app: Koa) => {
  const providerRouter = new Router<ProviderRouterState>();
  providerRouter.use(prepareProviderRoutes);
  providerRouter.get("/.well-known/openid-configuration", wellKnownRoute);
  providerRouter.all("/(.+)", catchAllRoutes(["/.well-known/openid-configuration"]));

  const router = new Router();
  router.use((ctx, next) => {
    ctx.set("X-Powered-By", "Charon");
    ctx.set("X-Charon-Version", config.app.version);

    return next();
  });
  router.get("/oauth/callback", oauthCallbackRoute);
  router.get("/", landingPage);
  router.all(config.app.healthcheck.path, healthcheckRoute);

  router.use(
    config.providers.map(providerType => `/${providerType}`),
    providerRouter.routes(),
    providerRouter.allowedMethods(),
  );

  app.use(router.routes());
  app.use(router.allowedMethods());
};
