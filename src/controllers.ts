import Router from "@koa/router";
import axios from "axios";
import type Koa from "koa";

import { getCharonClients } from "./client/client";
import { config } from "./config";
import { getProvider, type ProviderType } from "./provider";
import { type Provider } from "./provider/Provider";
import { logServer } from "./utils/logger";
import { rstrip } from "./utils/string";
import { wildcardToRegex } from "./utils/wildcard";

const excludedPaths = ["/.well-known/openid-configuration"];

export const controllers = (app: Koa) => {
  const router = new Router();
  const providerRouter = new Router<{ path: string; provider: Provider; providerType: ProviderType }>();

  // Middleware pour gérer le provider
  providerRouter.use((ctx, next) => {
    const [, providerTypePath, ...restPath] = ctx.path.split("/");
    const providerType = providerTypePath.replace(/^\//, "") as ProviderType;
    const provider = getProvider(providerType);

    ctx.state.provider = provider;
    ctx.state.providerType = providerType;
    ctx.state.path = `/${restPath.join("/")}`;
    logServer("Preload provider state", ctx.path, ctx.state);
    return next();
  });

  // Gestion du point de terminaison .well-known par provider
  providerRouter.get("/.well-known/openid-configuration", async ctx => {
    try {
      const provider = ctx.state.provider;
      const providerType = ctx.state.providerType;

      const providerUrl = rstrip(provider.getIssuer(), "/");
      const charonUrl = rstrip(config.app.charonUrl(providerType), "/");
      const providerWellKnown = (await provider.getWellKnown?.()) || {};

      ctx.body = JSON.parse(JSON.stringify(providerWellKnown), (key, value: unknown) => {
        // Ne pas modifier certaines urls qui seront appelées directement par le client
        // TODO ajouter d'autres urls à ne pas modifier si besoin
        if (["issuer", "jwks_uri", "userinfo_endpoint"].includes(key)) {
          return value;
        }
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

  // Catch-all middleware pour gérer les requêtes entrantes
  providerRouter.all("/(.+)", async (ctx, next) => {
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
  });

  // Middleware sur le router principal pour gérer le callback OIDC
  router.get("/oauth/callback", ctx => {
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

      // Utilise le "redirect_uri" original pour la redirection
      ctx.redirect(`${originalRedirectUri}?${new URLSearchParams(params).toString()}`);
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      ctx.throw(500, "Internal Server Error");
    }
  });

  router.use((ctx, next) => {
    ctx.set("X-Powered-By", "Charon");
    ctx.set("X-Charon-Version", config.app.version);

    return next();
  });

  router.get("/", ctx => {
    ctx.body = `<h1>Charon</h1><h2>Version ${config.app.version}</h2><a target="_blank" href="https://github.com/lsagetlethias/charon">Github</a> | <a target="_blank" href="${config.app.healthcheck.path}">Healthcheck</a>`;
  });

  router.all(config.app.healthcheck.path, ctx => {
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
  });

  router.use(
    config.providers.map(providerType => `/${providerType}`),
    providerRouter.routes(),
    providerRouter.allowedMethods(),
  );

  app.use(router.routes());
  app.use(router.allowedMethods());
};
