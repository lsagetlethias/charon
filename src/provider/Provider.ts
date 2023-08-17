export interface Provider {
  getIssuer(uri?: string, params?: Record<string, string>): string;
  getWellKnown?(): Promise<object>;
}
