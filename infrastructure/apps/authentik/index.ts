import { container } from "./src/container";

export const users = container.cradle.users.map((user) => ({
	id: user.userId,
	username: user.username,
}));

export const donetickApplication = container.cradle.donetick.slug;
export const netbirdApplication = container.cradle.netbird.application.slug;
export const netbirdOidcClientId = container.cradle.netbird.clientId;
export const netbirdOidcClientSecret = container.cradle.netbird.clientSecret;
export const netbirdOidcIssuer = container.cradle.netbird.issuer;
export const vikunjaApplication = container.cradle.vikunja.slug;
