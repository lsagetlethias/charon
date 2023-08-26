import type Router from "@koa/router";

import { config } from "../../config";

/**
 * Display main landing page.
 */
// TODO better landing
export const landingPage: Router.Middleware = ctx => {
  ctx.body = `<h1>Charon</h1><h2>Version ${config.app.version}</h2><a target="_blank" href="https://github.com/lsagetlethias/charon">Github</a> | <a target="_blank" href="${config.app.healthcheck.path}">Healthcheck</a>`;
};
