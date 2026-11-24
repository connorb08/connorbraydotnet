import { ClusterApps } from "./apps/index";

const apps = new ClusterApps("cluster-apps");

export const createdApps = apps.apps;
export const vaultInternalCaCert = apps.vault.internalCaCert;
export const couchDbAdminPassword = apps.couchdb.adminPassword;
export const authentikUrl = `https://${apps.gateway.hostname}`;
export const postgresqlHost = apps.postgresql.host;
export const donetickUrl = apps.donetick.url;
export const donetickOidcClientId = apps.donetick.clientId;
export const donetickOidcClientSecret = apps.donetick.clientSecret;
export const netbirdUrl = `https://${apps.netbird.hostname}`;
export const vikunjaUrl = apps.vikunja.url;
export const vikunjaOidcClientId = apps.vikunja.clientId;
export const vikunjaOidcClientSecret = apps.vikunja.clientSecret;
