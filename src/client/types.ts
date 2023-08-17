import { type ProviderType } from "../provider";

export interface CharonClient {
  provider: ProviderType;
  wildcards: string[];
}
