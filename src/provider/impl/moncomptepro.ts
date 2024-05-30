import axios from "axios";

import { type WellKnown } from "../../utils/well-known";
import { type Provider } from "../Provider";

const base = (testServer = false): Provider => ({
  getIssuer(pathname = "", params?: Record<string, string>): string {
    const baseUrl = testServer
      ? "https://app-sandbox.moncomptepro.beta.gouv.fr"
      : "https://app.moncomptepro.beta.gouv.fr";
    return `${baseUrl}/${pathname.replace(/^\//, "")}${params ? `?${new URLSearchParams(params).toString()}` : ""}`;
  },

  async getWellKnown(): Promise<WellKnown> {
    const providerWellKnown = await axios.get<WellKnown>(this.getIssuer(".well-known/openid-configuration"));

    return providerWellKnown.data;
  },
});

export const moncomptepro = base();
export const moncompteprotest = base(true);
