import Koa from 'koa';
import Router from 'koa-router';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import axios from 'axios';
import dotenv from 'dotenv';
import debug from 'debug';

dotenv.config();
const log = debug('charon:server');

// Définition de l'interface du Provider
interface Provider {
    getIssuer(uri?: string, params?: Record<string, string>): string;
    getWellKnown?(): Promise<object>;
}

const providers = {
    github: {
        getIssuer(uri = "", params?: Record<string, string>): string {
            return `https://github.com/${uri.replace(/^\//, "")}${params ? `?${new URLSearchParams(params as any)}` : ''}`;
        }
      },
    moncompteprotest: {
        getIssuer(uri = "", params?: Record<string, string>): string {
            return `https://app-test.moncomptepro.beta.gouv.fr/${uri}${params ? `?${new URLSearchParams(params as any)}` : ''}`;
        },

        async getWellKnown(): Promise<object> {
          const providerWellKnown = await axios.get(this.getIssuer(".well-known/openid-configuration"));

          return providerWellKnown.data;
        }
    }
} as const satisfies Record<string, Provider> ;

declare module 'koa-session' {
    interface Session {
      client: CharonClient;
      originalRedirectUri: string;
      params: Record<string, string | string[]>;
      provider: keyof typeof providers;
    }
}

// Conversion de wildcard en Regex
function wildcardToRegex(wildcard: string): RegExp {
    const escapedWildcard = wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regexString = escapedWildcard.replace(/\*/g, '.*');
    return new RegExp(`^${regexString}`);
}

interface CharonClient {
    wildcards: string[];
    mode: keyof typeof providers;
}
// Récupération des clients de Charon
function getCharonClients(): CharonClient[] {
    // TODO: récupérer les clients depuis un stockage externe
    return [{
        wildcards: ["http://localhost:3000", "https://egapro-*.dev.fabrique.social.gouv.fr"],
        mode: "github"
    }];
}

// Récupération du Provider
function getProvider(mode: CharonClient["mode"]): Provider {
    const provider = providers[mode];
    if (!provider) {
        throw new Error(`Provider not found for mode "${mode}"`);
    }
    return provider;
}

function buildCharonUrl(uri = "", params?: Record<string, string>): string {
    return `${process.env.CHARON_PUBLIC_HOST}/${uri.replace(/^\//, "")}${params ? `?${new URLSearchParams(params as any)}` : ''}`;
}

// Configuration de l'application Koa
const app = new Koa();
const router = new Router();

app.keys = [process.env.CHARON_COOKIE_SECRET as string];    // Mettre ici une clé secrète pour la session

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    console.error('Error in middleware', err);
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
});
app.use(bodyParser());

app.use(session({
    sameSite: 'none',                       // important for POST requests with redirect
    secure: process.env.CHARON_PUBLIC_HOST?.startsWith('https'),       // important for POST requests with redirect
    key: "charon:sess",
}, app));

// Gestion du point de terminaison .well-known
router.get('/.well-known/openid-configuration', async ctx => {
    try {
        const mode = ctx.request.query.mode as keyof typeof providers ?? ctx.session!.provider;
        const provider: Provider = getProvider(mode);

        const providerUrl = provider.getIssuer().replace(/\/$/, '');
        const charonUrl = buildCharonUrl().replace(/\/$/, '');
        const providerWellKnown = await provider.getWellKnown?.() || {};
    
        ctx.body = JSON.parse(JSON.stringify(providerWellKnown), (key, value) => {
            if (typeof value === 'string') {
                return value.replace(providerUrl, charonUrl);
            }
            return value;
        });
    } catch (error) {
        console.error('Error handling .well-known endpoint:', error);
        ctx.throw(500, 'Internal Server Error');
    }
});

const excludedPaths = [
  "/oauth/callback",
  "/.well-known/openid-configuration",
  "/healthz",
];


// Middleware pour gérer les requêtes entrantes
app.use(async (ctx, next) => {
    try {
        const uri = ctx.request.url
        if (excludedPaths.some(path => uri.startsWith(path))) {
            log("pass excluded path", uri, ctx.request.method);
            await next();
            return;
        }
        const method = ctx.request.method;
        const { redirect_uri, ...others } = (method === 'GET' ? ctx.request.query : ctx.request.body) as Record<string, string>;
        const clients = getCharonClients();

        log("=====", ctx.request.url, ctx.request.method, "=====", ctx.session, { cookies: ctx.headers.cookie, authorization: ctx.header.authorization, redirect_uri, clients, ...others })

        for (const client of clients) {
            const shouldPass = client.wildcards.some(wildcard => {
              const regex = wildcardToRegex(wildcard);
              return regex.test(redirect_uri);
            });
            log({shouldPass, redirect_uri});
            if (shouldPass) {
                const provider = getProvider(client.mode);
    
                const params = {
                    ...others,
                    redirect_uri: buildCharonUrl('/oauth/callback'),
                };
                
                ctx.session!.provider = client.mode;
                ctx.session!.client = client;
                ctx.session!.originalRedirectUri = redirect_uri
                ctx.session!.params = others;
                const headers: Record<string, string | string[]> = {};
                if (ctx.headers.authorization) {
                  headers['Authorization'] = ctx.headers.authorization;
                }
                if (ctx.headers["accept"]) {
                  headers['Accept'] = ctx.headers["accept"];
                }
                
                if (method === 'POST') {
                  const redirectURL = provider.getIssuer(uri);
                    log("POST REDIRECT", {redirectURL, ctxsession: ctx.session, params});
                    const response = await axios.post(redirectURL, params, {
                      headers,
                    });
                    log("POST REDIRECT RESPONSE", response.status, response.statusText, response.data);
                    ctx.status = response.status;
                    ctx.body = response.data;
                } else if (method === 'GET') {
                    const redirectURL = provider.getIssuer(uri, params);

                    log("GET REDIRECT", {redirectURL, ctxsession: ctx.session, params});

                    Object.entries(headers).forEach(([key, value]) => {
                      ctx.set(key, value);
                    });
                    ctx.redirect(redirectURL);
                }
            }
        }
    
        await next();
    } catch (error) {
        console.error('Error handling incoming requests:', error);
        ctx.throw(500, 'Internal Server Error');
    }
});

// Middleware pour gérer le callback
router.get('/oauth/callback', async ctx => {
    if (!ctx.session) {
      ctx.throw(400, 'Session not found');
      return;
    }
    try {
        const client = ctx.session.client;
        const originalRedirectUri = ctx.session.originalRedirectUri;
        const params = {...ctx.query};
        ctx.session = ctx.session;

        log("CALLBACK FROM OIDC", {cookie: ctx.request.headers.cookie, autorization: ctx.request.headers.authorization, url: ctx.request.url, method: ctx.request.method, client, originalRedirectUri, params});

        // Utiliser le "redirect_uri" original pour la redirection
        ctx.redirect(`${originalRedirectUri}?${new URLSearchParams(params as any)}`);
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        ctx.throw(500, 'Internal Server Error');
    }
});

router.get('/healthz', ctx => {
    ctx.body = 'Hello World';
});


app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.CHARON_PORT, () => {
    log(`Server is running at ${process.env.CHARON_PUBLIC_HOST}`);
});
