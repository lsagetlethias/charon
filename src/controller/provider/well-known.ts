import { config } from "../../config";
import { rstrip } from "../../utils/string";
import { type WellKnown } from "../../utils/well-known";
import { type ProviderMiddleware } from "../type";

/**
 * Returns a hijacked .well-known oidc config object.
 *
 * Only "browser navigation base" urls are modified to be redirected to Charon.
 */
export const wellKnownRoute: ProviderMiddleware = async ctx => {
  try {
    const provider = ctx.state.provider;
    const providerType = ctx.state.providerType;

    const providerUrl = rstrip(provider.getIssuer(), "/");
    const charonUrl = rstrip(config.app.charonUrl(providerType), "/");
    const providerWellKnown = (await provider.getWellKnown?.()) || ({} as WellKnown);

    ctx.body = JSON.parse(JSON.stringify(providerWellKnown), (key, value: unknown) => {
      // Don't modify some urls that will be directly called by the client
      // (e.g. ajax call) because we will not have to handle it (and we will not have any cookie available)
      if (["issuer", "jwks_uri", "userinfo_endpoint"].includes(key)) {
        return value;
      }
      if (typeof value === "string") {
        return value.replace(providerUrl, charonUrl);
      }
      return value;
    }) as WellKnown;
  } catch (error) {
    console.error("Error handling .well-known endpoint:", error);
    ctx.throw(500, "Internal Server Error");
  }
};
