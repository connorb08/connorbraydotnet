Yes, you can turn off local password (email/password) login on self-hosted NetBird instances. [1] (https://docs.netbird.io/selfhosted/identity-providers/disable-local-authentication)

How to Disable Local Authentication

If you have already configured an external Identity Provider (IdP) like Authentik, Keycloak, or Google/Microsoft SSO, you can disable built-in password authentication by updating your server configuration: [1] (https://docs.netbird.io/manage/settings/multi-factor-authentication), [2] (https://docs.netbird.io/selfhosted/identity-providers/disable-local-authentication)

1. Prerequisite: Make sure you have logged in via your external IdP and promoted at least one external IdP user to Owner/Admin status. NetBird will block the change if no external IdP connector is active or if you risk locking yourself out.
2. Edit your NetBird configuration file (config.yaml or environment setup).
3. Under the server.auth section, set localAuthDisabled: true: [1] (https://www.reddit.com/r/netbird/comments/1r8fqum/disable_local_authentication/), [2] (https://docs.netbird.io/selfhosted/identity-providers/disable-local-authentication)
   yaml
   server:
   auth:
   issuer: "https://netbird.example.com/oauth2"
   localAuthDisabled: true
   signKeyRefreshEnabled: true
   dashboardRedirectURIs:
   - "https://netbird.example.com/nb-auth"
   - "https://netbird.example.com/nb-silent-auth"
     cliRedirectURIs:
   - "http://localhost:53000/"
     Use code with caution.
4. Restart your NetBird management/server container or service for the changes to take effect.
   (Note: If you are using NetBird's combined setup with its built-in embedded IdP, the embedded IdP cannot be completely turned off, meaning local authentication remains tied to that setup.) [1] (https://docs.netbird.io/selfhosted/identity-providers/local)
   Are you using a self-hosted instance or NetBird's cloud platform, and which Identity Provider (IdP) are you connecting?
