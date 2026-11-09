import { createCouchdb } from "./apps/couchdb.ts";
import { createMonitoring } from "./apps/monitoring.ts";
import { createTailscale } from "./apps/tailscale.ts";
import { createVault } from "./apps/vault.ts";

const tailscale = createTailscale();
const _couchdb = createCouchdb(tailscale);
const _monitoring = createMonitoring(tailscale);
export const vaultInternalCaCert = createVault(tailscale);
