import { envClientConfig } from "../config";
import { type CharonClient } from "./types";

// Récupération des clients de Charon
export function getCharonClients(): CharonClient[] {
  // TODO: récupérer les clients depuis un stockage externe
  return envClientConfig as CharonClient[];
}
