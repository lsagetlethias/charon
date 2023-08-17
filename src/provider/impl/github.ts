import { type Provider } from "../Provider";

export const github: Provider = {
  getIssuer(uri = "", params?: Record<string, string>): string {
    return `https://github.com/${uri.replace(/^\//, "")}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
  },
};
