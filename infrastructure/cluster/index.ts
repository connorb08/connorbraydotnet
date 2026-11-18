import { ClusterApps } from "./apps/index.ts";

const apps = new ClusterApps("cluster-apps");

export const createdApps = apps.apps;
export const vaultInternalCaCert = apps.vault.internalCaCert;
export const couchDbAdminPassword = apps.couchdb.adminPassword;
export const authentikUrl = `https://${apps.gateway.hostname}`;
export const postgresqlHost = apps.postgresql.host;
