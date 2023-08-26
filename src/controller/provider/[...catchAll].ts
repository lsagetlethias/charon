import axios from "axios";

import { getCharonClients } from "../../client/client";
import { config } from "../../config";
import { getProvider } from "../../provider";
import { logServer } from "../../utils/logger";
import { wildcardToRegex } from "../../utils/wildcard";
import { type ProviderMiddleware } from "../type";

/**
 * Factory middleware to catch all routes called under a middleware path.
 *
 * This is the main logic of Charon.
 *
 * It will catch, validate, and forward request from a client to a provider depending of the config.
 */
export const catchAllRoutes =
  (excludedPaths: string[]): ProviderMiddleware =>
  async (ctx, next) => {
    try {
      const pathname = ctx.state.path;
      const providerType = ctx.state.providerType;
      if (excludedPaths.some(path => pathname.startsWith(path))) {
        logServer("Middleware passthrough for excluded path", pathname, ctx.request.method);
        await next();
        return;
      }
      const method = ctx.request.method;
      const { redirect_uri = ctx.session!.originalRedirectUri, ...others } = (
        method === "GET" ? ctx.request.query : ctx.request.body
      ) as Record<string, string>;
      const clients = getCharonClients();

      logServer("Middleware incoming request", pathname, method, ctx.session, {
        cookies: ctx.headers.cookie,
        authorization: ctx.header.authorization,
        redirect_uri,
        clients,
        ...others,
      });

      for (const client of clients) {
        if (client.provider !== providerType) {
          continue;
        }
        const shouldPass = client.wildcards.some(wildcard => {
          const regex = wildcardToRegex(wildcard);
          return regex.test(redirect_uri);
        });
        logServer({ shouldPass, redirect_uri });
        if (shouldPass) {
          const provider = getProvider(client.provider);

          const params = {
            ...others,
            redirect_uri: config.app.charonUrl("/oauth/callback"),
          };

          ctx.session!.provider = client.provider;
          ctx.session!.client = client;
          ctx.session!.originalRedirectUri = redirect_uri;
          ctx.session!.params = others;
          const headers: Record<string, string | string[]> = {};
          if (ctx.headers.authorization) {
            headers["Authorization"] = ctx.headers.authorization;
          }
          if (ctx.headers.accept) {
            headers["Accept"] = ctx.headers.accept;
          }
          if (ctx.headers["content-type"]) {
            headers["Content-Type"] = ctx.headers["content-type"];
          }

          if (method === "POST") {
            const redirectURL = provider.getIssuer(pathname);
            logServer("POST REDIRECT", { redirectURL, ctxsession: ctx.session, params });
            const response = await axios.post<unknown>(redirectURL, params, {
              headers,
            });
            logServer("POST REDIRECT RESPONSE", response.status, response.statusText, response.data);
            ctx.status = response.status;
            ctx.body = response.data;
          } else if (method === "GET") {
            const redirectURL = provider.getIssuer(pathname, params);

            logServer("GET REDIRECT", { redirectURL, ctxsession: ctx.session, params });

            Object.entries(headers).forEach(([key, value]) => {
              ctx.set(key, value);
            });
            ctx.redirect(redirectURL);
          }
        }
      }

      await next();
    } catch (error) {
      console.error("Error handling incoming requests:", error);
      ctx.throw(500, "Internal Server Error");
    }
  };
