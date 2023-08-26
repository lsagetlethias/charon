import { getProvider, type ProviderType } from "../../provider";
import { logServer } from "../../utils/logger";
import { type ProviderMiddleware } from "../type";

/**
 * Makes sure that everytime a provider route is called, the provider configuration is preloaded in state.
 */
export const prepareProviderRoutes: ProviderMiddleware = (ctx, next) => {
  const [, providerTypePath, ...restPath] = ctx.path.split("/");
  const providerType = providerTypePath.replace(/^\//, "") as ProviderType;
  const provider = getProvider(providerType);

  ctx.state.provider = provider;
  ctx.state.providerType = providerType;
  ctx.state.path = `/${restPath.join("/")}`;
  logServer("Preload provider state", ctx.path, ctx.state);
  return next();
};
