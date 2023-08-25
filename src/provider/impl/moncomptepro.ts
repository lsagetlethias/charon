import axios from "axios";

import { type Provider } from "../Provider";

const base = (test = false): Provider => ({
  getIssuer(uri = "", params?: Record<string, string>): string {
    const baseUrl = test ? "https://app-test.moncomptepro.beta.gouv.fr" : "https://app.moncomptepro.beta.gouv.fr";
    return `${baseUrl}/${uri.replace(/^\//, "")}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
  },

  async getWellKnown(): Promise<object> {
    const providerWellKnown = await axios.get<object>(this.getIssuer(".well-known/openid-configuration"));

    return providerWellKnown.data;
  },
});

export const moncomptepro = base();
export const moncompteprotest = base(true);
