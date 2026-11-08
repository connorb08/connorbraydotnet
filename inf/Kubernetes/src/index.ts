import { createMonitoring } from "./apps/monitoring.ts";
import { createTailscale } from "./apps/tailscale.ts";
import { createVault } from "./apps/vault.ts";

const tailscale = createTailscale();
const _monitoring = createMonitoring(tailscale);
export const vaultInternalCaCert = createVault(tailscale);
