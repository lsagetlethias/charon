import Router from "@koa/router";
import axios from "axios";
import type Koa from "koa";

import { getCharonClients } from "./client/client";
import { config } from "./config";
import { getProvider, type ProviderType } from "./provider";
import { logServer } from "./utils/logger";
import { rstrip } from "./utils/string";
import { wildcardToRegex } from "./utils/wildcard";

export const controllers = (app: Koa) => {
  const router = new Router();
  // Gestion du point de terminaison .well-known
  router.get("/.well-known/openid-configuration", async ctx => {
    try {
      const mode = (ctx.request.query.mode as ProviderType) ?? ctx.session!.provider;
      const provider = getProvider(mode);

      const providerUrl = rstrip(provider.getIssuer(), "/");
      const charonUrl = rstrip(config.app.charonUrl(), "/");
      const providerWellKnown = (await provider.getWellKnown?.()) || {};

      ctx.body = JSON.parse(JSON.stringify(providerWellKnown), (_, value: unknown) => {
        if (typeof value === "string") {
          return value.replace(providerUrl, charonUrl);
        }
        return value;
      }) as object;
    } catch (error) {
      console.error("Error handling .well-known endpoint:", error);
      ctx.throw(500, "Internal Server Error");
    }
  });

  const excludedPaths = ["/oauth/callback", "/.well-known/openid-configuration", "/healthz"];

  // Middleware pour gérer les requêtes entrantes
  app.use(async (ctx, next) => {
    try {
      const uri = ctx.request.url;
      if (excludedPaths.some(path => uri.startsWith(path))) {
        logServer("Middleware passthrough for excluded path", uri, ctx.request.method);
        await next();
        return;
      }
      const method = ctx.request.method;
      const { redirect_uri, ...others } = (method === "GET" ? ctx.request.query : ctx.request.body) as Record<
        string,
        string
      >;
      const clients = getCharonClients();

      logServer("Middleware incoming request", uri, method, ctx.session, {
        cookies: ctx.headers.cookie,
        authorization: ctx.header.authorization,
        redirect_uri,
        clients,
        ...others,
      });

      for (const client of clients) {
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
          if (ctx.headers["accept"]) {
            headers["Accept"] = ctx.headers["accept"];
          }

          if (method === "POST") {
            const redirectURL = provider.getIssuer(uri);
            logServer("POST REDIRECT", { redirectURL, ctxsession: ctx.session, params });
            const response = await axios.post<unknown>(redirectURL, params, {
              headers,
            });
            logServer("POST REDIRECT RESPONSE", response.status, response.statusText, response.data);
            ctx.status = response.status;
            ctx.body = response.data;
          } else if (method === "GET") {
            const redirectURL = provider.getIssuer(uri, params);

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
  });

  // Middleware pour gérer le callback
  router.get("/oauth/callback", ctx => {
    if (!ctx.session?.client) {
      ctx.throw(400, "Session not found");
      return;
    }
    try {
      const client = ctx.session.client;
      const originalRedirectUri = ctx.session.originalRedirectUri;
      const params = { ...ctx.query } as Record<string, string>;

      logServer("CALLBACK FROM OIDC", {
        cookie: ctx.request.headers.cookie,
        autorization: ctx.request.headers.authorization,
        url: ctx.request.url,
        method: ctx.request.method,
        client,
        originalRedirectUri,
        params,
      });

      // Utiliser le "redirect_uri" original pour la redirection
      ctx.redirect(`${originalRedirectUri}?${new URLSearchParams(params).toString()}`);
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      ctx.throw(500, "Internal Server Error");
    }
  });

  router.get("/healthz", ctx => {
    ctx.body = "ok";
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
};
