import type Router from "@koa/router";

import { config } from "../../config";
import { logServer } from "../../utils/logger";

/**
 * Healthcheck/ping route
 */
export const healthcheckRoute: Router.Middleware = ctx => {
  logServer("Healthcheck", ctx.request.url, ctx.request.method);
  const healthz = {
    uptime: process.uptime(),
    responsetime: process.hrtime(),
    message: "OK",
    timestamp: Date.now(),
  };

  // TODO: ajouter des vérifications de santé
  // - vérifier que les clients sont bien configurés
  // - vérifier que les providers sont bien configurés
  // - vérifier que les providers sont bien accessibles
  ctx.body = config.app.healthcheck.simple ? "OK" : healthz;
};
