import { type Provider } from "../Provider";

export const github: Provider = {
  getIssuer(pathname = "", params?: Record<string, string>): string {
    return `https://github.com/${pathname.replace(/^\//, "")}${
      params ? `?${new URLSearchParams(params).toString()}` : ""
    }`;
  },
};
