import { type CharonClient } from "./types";

// Récupération des clients de Charon
export function getCharonClients(): CharonClient[] {
  // TODO: récupérer les clients depuis un stockage externe
  return [
    {
      wildcards: ["http://localhost:3000", "https://egapro-*.dev.fabrique.social.gouv.fr"],
      provider: "github",
    },
    {
      wildcards: ["http://localhost:3000", "https://secretariat-*.dev.fabrique.social.gouv.fr"],
      provider: "github",
    },
  ];
}
