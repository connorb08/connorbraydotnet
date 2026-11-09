# connorbraydotnet

Monorepo for `connorbray.net` and related apps/services.

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
