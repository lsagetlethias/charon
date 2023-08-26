import type Router from "@koa/router";

import { logServer } from "../../utils/logger";

/**
 * Handle callback for OAuth provider. Depends on cookie as it
 * should be the end of the "browser redirection" flow handled by Charon
 */
export const oauthCallbackRoute: Router.Middleware = ctx => {
  if (!ctx.session?.client) {
    ctx.throw(400, "Session not found");
    return;
  }
  try {
    const client = ctx.session.client;
    const originalRedirectUri = ctx.session.originalRedirectUri;
    const params = { ...ctx.query } as Record<string, string>;

    logServer("CALLBACK FROM OAuth provider", {
      cookie: ctx.request.headers.cookie,
      autorization: ctx.request.headers.authorization,
      url: ctx.request.url,
      method: ctx.request.method,
      client,
      originalRedirectUri,
      params,
    });

    // TODO forward headers?

    // Redirect to original client
    ctx.redirect(`${originalRedirectUri}?${new URLSearchParams(params).toString()}`);
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    ctx.throw(500, "Internal Server Error");
  }
};
