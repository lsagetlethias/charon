import { type WellKnown } from "../utils/well-known";

export interface Provider {
  /**
   * Get an provider full issuer URL with optional pathname and params
   */
  getIssuer(pathname?: string, params?: Record<string, string>): string;
  /**
   * If the provider is OIDC compliant, get the `.well-known` descriptor object
   */
  getWellKnown?(): Promise<WellKnown>;
  /**
   * Check if the provider is available with ping or healthcheck route
   */
  isHealthy?(): Promise<boolean>;
}
