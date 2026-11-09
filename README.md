# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

## Devcontainer tools

The [OCI CLI layer](.devcontainer/build/layers/oci.sh) installs Oracle Cloud
Infrastructure CLI 3.96.0 with isolated Python dependencies. The
[image build](.devcontainer/bake.sh) discovers it automatically alongside the other
tool layers. Run `bash .devcontainer/bake.sh --load` from the repository root, then
recreate the devcontainer to use the updated image.

Verify with `oci --version` and run `oci setup config` to configure your account.
OCI credentials are not included in the image.

The [fzf layer](.devcontainer/build/layers/fzf.sh) installs fzf 0.75.0 for x86_64
and ARM64, including Bash completion and key bindings. It is also discovered
automatically by the image build. Verify with `fzf --version` after rebuilding.

The image also includes the `gettext-base` apt package, providing `envsubst` for
environment-variable substitution in templates.

## Persistent Bash history

The devcontainer mounts a workspace-specific Docker volume at `/commandhistory`.
[Bash history settings](.devcontainer/.bashrc.d/history.sh) write to
`/commandhistory/.bash_history` and flush history at each prompt so terminal
sessions share it. The creation hook sets directory/file permissions to 700/600.

Recreate the devcontainer to enable the mount; no image rebuild is required.
History survives later container recreations on the same Docker host, but deleting
the volume deletes its history. Existing history from before this mount is not
automatically migrated. Avoid entering secrets in shell commands; commands
prefixed with a space are excluded from history.

## Development Vault proxy

Set `VAULT_ENDPOINT` to the upstream Vault server URL (including `https://`),
and provide `VAULT_ROLE_ID` and `VAULT_SECRET_ID` in `.devcontainer/.env`.
The container startup script gives only the `vault-proxy` tmux session an
upstream `VAULT_ADDR`. CLI commands keep `VAULT_ADDR=http://127.0.0.1:8100`
and authenticate through the proxy.

Do not point `VAULT_ENDPOINT` at the local proxy listener: that creates a
forwarding loop and causes authentication and CLI commands to hang.
After changing the proxy configuration, stop the existing session with
`tmux kill-session -t vault-proxy`, then run
`bash .devcontainer/lifecycle/postStartCommand.sh` to recreate the AppRole
files and restart it. Keep a valid SecretID in `.devcontainer/.env`; the
proxy removes its temporary SecretID file after reading it.
Verify with `VAULT_CLIENT_TIMEOUT=10s vault status` and
`VAULT_CLIENT_TIMEOUT=10s vault kv list secret/prod`.

## Obsidian notes sync

[CouchDB infrastructure](inf/Kubernetes/src/apps/couchdb.ts) installs Apache CouchDB
3.5.1 using chart 4.6.3 in the `couchdb` namespace. It runs one node with a retained
5Gi ReadWriteOnce volume, requests 100m CPU / 256Mi memory, and is limited to
500m CPU / 512Mi memory. A default storage class supporting filesystem group
ownership is required. Retained storage is not a backup; back up your notes.

The database requires authentication and enables credentialed CORS for Obsidian's
desktop and mobile origins. It uses single-node shards and LiveSync-compatible
document/request size settings. The only external endpoint is a private Tailscale
HTTPS ingress named `couchdb`, tagged `tag:couchdb`; there is no public ingress or
LoadBalancer.

Before deploying, merge this entry into your existing Tailscale policy's
`tagOwners` (do not replace the rest of the policy):

```json
{
  "tagOwners": {
    "tag:couchdb": ["tag:k8s-operator"]
  }
}
```

Authorize the operator's OAuth client to issue `tag:couchdb`, and allow your
intended devices/users to reach `tag:couchdb` on TCP 443 in your tailnet's
ACLs/grants. Tailnet policy is managed outside this repository. Tailscale HTTPS
certificates must also be enabled.

Set three independent, strong secrets in the Kubernetes Pulumi stack. Omitting
values prompts securely; do not put plaintext credentials in source control:

```bash
cd inf/Kubernetes
pulumi config set --secret couchdbAdminPassword
pulumi config set --secret couchdbCookieAuthSecret
pulumi config set --secret couchdbErlangCookie
pulumi preview
pulumi up
```

The administrator username is `admin`. Credentials are supplied through a
Kubernetes Secret rather than Helm values; changing them rolls the CouchDB pod.
Keep the configured server UUID stable after deployment.

On devices connected to your tailnet, open
`https://couchdb.<your-tailnet>.ts.net/_utils/` to verify access. Configure Obsidian's
**Self-hosted LiveSync** plugin with `https://couchdb.<your-tailnet>.ts.net`, the
administrator credentials, and a database name such as `obsidiannotes`. Use the
plugin's setup wizard to create/initialize that database and enable end-to-end
encryption. CouchDB alone does not provide Obsidian's paid Sync service.

## Kubernetes monitoring

[Monitoring infrastructure](inf/Kubernetes/src/apps/monitoring.ts) uses the
VictoriaMetrics Single Node Helm chart and a separate Grafana chart, rather than
`kube-prometheus-stack`. VictoriaMetrics scrapes itself, the Kubernetes API, and
kubelet/cAdvisor through the authenticated API-server proxy every 60 seconds.
There is no Prometheus server, operator, vmagent, Alertmanager, node-exporter,
kube-state-metrics, or Grafana sidecar.

| Component | CPU request / limit | Memory request / limit | Persistent storage |
| --- | --- | --- | --- |
| VictoriaMetrics | 100m / 500m | 128Mi / 384Mi | 5Gi |
| Grafana | 50m / 250m | 192Mi / 384Mi | 1Gi |

The two application containers reserve 320Mi and are capped at 768Mi combined
(excluding Tailscale ingress proxies and Kubernetes/storage overhead).
Grafana uses a 256MiB Go memory target and `GOGC=50`, leaving room below its
container limit for non-Go-heap memory. The Go target is not an RSS hard limit.
The previous 192Mi container limit caused OOM kills during Grafana startup.
VictoriaMetrics retains seven days of metrics, budgets 192MiB for internal
caches, limits queries to two concurrent requests with 32MiB per query and a
30-second timeout, and limits cardinality to 50,000 hourly / 100,000 daily series.
Scrapes are limited to 10,000 samples per target and 8MiB responses. These are
small-node starting limits, not a guarantee of actual RSS: excessive cardinality
or queries can still hit the container limit. Cardinality caps drop new series,
oversized scrapes fail, and ingestion stops below 256MiB of free storage. Check
VictoriaMetrics `/targets`, logs, `up`, container restarts, and disk usage after
deployment.

Grafana keeps Tailscale HTTPS access at `grafana`, reuses the
`grafanaAdminPassword` Pulumi secret, and provisions VictoriaMetrics as its
default Prometheus-compatible datasource. The metrics endpoint is now
`victoriametrics` on Tailscale; its built-in query UI is at `/vmui/`.
The existing `tag:monitoring` Tailscale policy still applies.

Deploy with `cd inf/Kubernetes && pulumi preview`, review the removals and new
PVCs, then `pulumi up`. A default Kubernetes storage class supporting filesystem
group ownership is required. Grafana uses `Recreate` to avoid overlapping pods
and ReadWriteOnce volume conflicts.

Grafana's chart ignores changes only to PVC `spec.volumeName`, which Kubernetes
assigns when binding storage. This prevents a false replacement diff for the
existing claim; storage size and other PVC settings remain managed by Pulumi.

VictoriaMetrics explicitly uses a regular ClusterIP Service: the chart's default
headless Service is not a valid Tailscale ingress backend and leaves Pulumi
waiting for ingress readiness before it can remove the old stack. An existing
headless Service must be recreated to change its immutable ClusterIP; this does
not require deleting the VictoriaMetrics pod or its persistent volume.

This replacement does **not** migrate historical Prometheus data or the old
Grafana database. Export any custom dashboards before applying. The previous
stack's bundled dashboards, recording/alert rules, and exporter-specific metrics
are not installed; import dashboards compatible with kubelet/cAdvisor metrics
or create them in Grafana. Verify the old workloads are gone with
`kubectl get pods -n monitoring` and inspect new resource usage with
`kubectl top pods -n monitoring`. Old operator CRDs and retained PVCs may remain;
inspect and remove only unused resources after any required backup.
