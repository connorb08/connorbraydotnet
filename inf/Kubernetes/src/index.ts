import { createTailscale } from "./tailscale.ts";
import { createVault } from "./vault.ts";

const tailscale = createTailscale();
export const vaultInternalCaCert = createVault(tailscale);
