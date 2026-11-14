import { ClusterApps } from "./apps/index.ts";

const apps = new ClusterApps("cluster-apps");

export const createdApps = apps.apps;
export const vaultInternalCaCert = apps.vault.internalCaCert;
