import type Router from "@koa/router";

import { type ProviderType } from "../provider";
import { type Provider } from "../provider/Provider";

export interface ProviderRouterState {
  path: string;
  provider: Provider;
  providerType: ProviderType;
}

export type ProviderMiddleware = Router.Middleware<ProviderRouterState>;
