import type {
	Output,
	Resource,
	ResourceTransformArgs,
	ResourceTransformationArgs,
} from "@pulumi/pulumi";
import { ClusterApps } from "../cluster/apps/index";
import {
	createTailscaleIngress,
	tailscaleIngress,
} from "../cluster/network/tailscale-ingress";
import { waitForPostgresql } from "../cluster/resources/database/cluster";
import { requireRecord } from "../shared/transforms";
import { isSecret, output, runtime } from "@pulumi/pulumi";
import { beforeAll, expect, test } from "bun:test";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const resources: { type: string; name: string; inputs: Record<string, unknown> }[] = [];
const registrations: ResourceTransformationArgs[] = [];
let apps: ClusterApps;

function resolveOutput<T>(value: Output<T>): Promise<T> {
	return new Promise((resolve) => {
		value.apply((resolved) => {
			resolve(resolved);
			return resolved;
		});
	});
}

function registration(name: string, type?: string) {
	const found = registrations.find(
		(args) => args.name === name && (type === undefined || args.type === type),
	);
	if (!found) {
		throw new Error(`Missing registration: ${name} (${type})`);
	}
	return found;
}

beforeAll(async () => {
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(args.inputs, "Mock inputs must be a mapping.");
				resources.push({ type: args.type, name: args.name, inputs });
				const state = { ...inputs };
				if (args.type === "tls:index/privateKey:PrivateKey") {
					state.privateKeyPem = "test-private-pem";
				}
				if (args.type === "tls:index/selfSignedCert:SelfSignedCert") {
					state.certPem = "test-certificate";
				}
				if (args.type === "random:index/randomPassword:RandomPassword") {
					state.result = `test-${args.name}`;
				}
				if (args.type === "random:index/randomBytes:RandomBytes") {
					state.base64 = Buffer.alloc(32, 2).toString("base64");
				}
				if (args.type === "pulumi:pulumi:StackReference") {
					expect(inputs.name).toBe("organization/Cloudflare/dev");
					state.outputs = {
						certManagerToken: "test-generated-cloudflare-token",
						brayDomainName: "bray.sh",
					};
					state.secretOutputNames = ["certManagerToken"];
				}
				return { id: args.name, state };
			},
			call: (args) => args.inputs,
		},
		"cluster",
		"test",
		false,
	);
	runtime.setAllConfig(
		{
			"cluster:tailscaleClientId": "test-client-id",
			"cluster:tailscaleClientSecret": "test-client-secret",
			"cluster:couchdbAdminPassword": "test-couchdb-password",
			"cluster:couchdbCookieAuthSecret": "test-couchdb-cookie-secret",
			"cluster:couchdbErlangCookie": "test-couchdb-erlang-cookie",
			"cluster:grafanaAdminPassword": "test-grafana-password",
			"cluster:netbirdHostname": "netbird.example-tailnet.ts.net",
			"cluster:donetickHostname": "donetick.example-tailnet.ts.net",
			"cluster:vikunjaHostname": "todo.example-tailnet.ts.net",
			"cluster:netbirdAuthSecret": "test-netbird-auth-secret",
			"cluster:netbirdEncryptionKey": Buffer.alloc(32, 1).toString("base64"),
			"cluster:netbirdDatabasePassword": "test-netbird-database-password",
			"cluster:netbirdPostgresPassword": "test-netbird-postgres-password",
			"cluster:authentikBootstrapPassword": "test-authentik-bootstrap-password",
			"cluster:cloudflareStack": "organization/Cloudflare/dev",
			"cluster:acmeEmail": "acme@example.com",
		},
		[
			"cluster:tailscaleClientId",
			"cluster:tailscaleClientSecret",
			"cluster:couchdbAdminPassword",
			"cluster:couchdbCookieAuthSecret",
			"cluster:couchdbErlangCookie",
			"cluster:grafanaAdminPassword",
			"cluster:netbirdAuthSecret",
			"cluster:netbirdEncryptionKey",
			"cluster:netbirdDatabasePassword",
			"cluster:netbirdPostgresPassword",
			"cluster:authentikBootstrapPassword",
		],
	);
	await runtime.runInPulumiStack(async () => {
		runtime.registerStackTransformation((args) => {
			registrations.push(args);
		});
		apps = new ClusterApps("cluster-apps");
		createTailscaleIngress(
			"named-port-ingress",
			{
				hostname: "example",
				tags: ["tag:apps", "tag:shared"],
				metadata: {
					namespace: apps.vault.namespaceName,
					annotations: output({
						"example.com/annotation": "retained",
						"tailscale.com/http-redirect": "false",
					}),
				},
				service: { name: output("example-service"), port: { name: "https" } },
			},
			apps.tailscale.chart,
			{ parent: apps, protect: true, dependsOn: output(apps.vault.chart) },
		);
		return { vaultInternalCaCert: apps.vault.internalCaCert };
	});
	await runtime.disconnect();
});

test("switches NetBird to shared PostgreSQL while preserving its identity volume and secrets", async () => {
	const chart = registration("netbird", "kubernetes:helm.sh/v4:Chart");
	expect(chart.opts.parent).toBe(apps.netbird);
	expect(chart.opts.dependsOn).toEqual([
		registration("netbird", "kubernetes:core/v1:Namespace").resource,
		apps.storage.chart,
		apps.postgresql.chart,
	]);
	const values = await resolveOutput(output(chart.props.values));
	expect(values).toMatchObject({
		server: {
			publicUrl: "https://netbird.example-tailnet.ts.net:443",
			auth: { issuer: "https://netbird.example-tailnet.ts.net/oauth2" },
		},
		database: {
			mode: "external",
			external: {
				engine: "postgres",
				host: apps.postgresql.host,
				port: 5432,
				name: "netbird",
				username: "netbird",
				password: "test-netbird-database-password",
				sslMode: "require",
			},
		},
		postgresql: { enabled: false },
		persistence: { enabled: true, storageClass: "local-path" },
		ingress: { enabled: false },
	});
	const credentials = [
		chart.props.values.server.authSecret,
		chart.props.values.server.store.encryptionKey,
		chart.props.values.database.external.password,
	];
	expect(
		await Promise.all(credentials.map((credential) => isSecret(credential))),
	).toEqual([true, true, true]);
	const transform = chart.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing NetBird single-writer deployment strategy.");
	}
	const args: ResourceTransformArgs = {
		type: "kubernetes:apps/v1:Deployment",
		name: "netbird:netbird/netbird-server",
		custom: true,
		props: {
			metadata: { name: "netbird-server" },
			spec: { replicas: 1, strategy: { type: "RollingUpdate" } },
		},
		opts: { protect: true },
	};
	expect(await transform(args)).toMatchObject({
		props: { spec: { replicas: 1, strategy: { type: "Recreate" } } },
		opts: { protect: true },
	});
	expect(
		await transform({ ...args, type: "kubernetes:core/v1:Service" }),
	).toBeUndefined();
	expect(apps.apps.includes("netbird")).toBe(true);
});

test("provisions persistent shared PostgreSQL with non-superuser roles and retained databases", async () => {
	const chart = registration("postgresql", "kubernetes:helm.sh/v4:Chart");
	const values = await resolveOutput(output(chart.props.values));
	expect(values).toMatchObject({
		fullnameOverride: "postgresql",
		version: { postgresql: "18" },
		cluster: {
			instances: 1,
			enableSuperuserAccess: false,
			storage: { size: "8Gi", storageClass: "local-path" },
			roles: ["authentik", "donetick", "netbird", "vikunja"].map((name) => ({
				name,
				login: true,
				superuser: false,
				createdb: false,
				createrole: false,
				passwordSecret: { name: `postgresql-${name}` },
			})),
		},
		databases: ["authentik", "donetick", "netbird", "vikunja"].map((name) => ({
			name,
			owner: name,
			databaseReclaimPolicy: "retain",
		})),
	});
	expect(chart.opts.dependsOn).toContain(apps.storage.chart);
	expect(chart.opts.dependsOn).toContain(
		registration("cnpg-operator", "kubernetes:helm.sh/v4:Chart").resource,
	);
	const netbirdSecret = registration("postgresql-netbird", "kubernetes:core/v1:Secret");
	expect(netbirdSecret.props.type).toBe("kubernetes.io/basic-auth");
	expect(await isSecret(netbirdSecret.props.stringData.password)).toBe(true);
	expect(await resolveOutput(apps.postgresql.database("authentik").password)).not.toBe(
		await resolveOutput(apps.postgresql.database("netbird").password),
	);
	expect(() => apps.postgresql.database("missing")).toThrow("has not been provisioned");
	const args: ResourceTransformArgs = {
		type: "kubernetes:postgresql.cnpg.io/v1:Database",
		name: "authentik",
		custom: true,
		props: { metadata: { annotations: { retained: "yes" } } },
		opts: {},
	};
	expect(waitForPostgresql(args)?.props.metadata.annotations).toEqual({
		retained: "yes",
		"pulumi.com/waitFor": "jsonpath={.status.applied}=true",
	});
	expect(
		waitForPostgresql({ ...args, type: "kubernetes:postgresql.cnpg.io/v1:Cluster" })
			?.props.metadata.annotations["pulumi.com/waitFor"],
	).toBe("condition=Ready");
	expect(
		waitForPostgresql({ ...args, type: "kubernetes:core/v1:Secret" }),
	).toBeUndefined();
});

test("deploys Donetick with persistent uploads, shared PostgreSQL over TLS and Authentik-only login", async () => {
	const deployment = registration("donetick", "kubernetes:apps/v1:Deployment");
	expect(deployment.opts.dependsOn).toContain(apps.postgresql.chart);
	expect(deployment.props.spec.replicas).toBe(1);
	expect(deployment.props.spec.strategy).toEqual({ type: "Recreate" });
	const containers = deployment.props.spec.template.spec.containers;
	expect(containers[0]).toMatchObject({
		image: "donetick/donetick:v0.1.86",
		env: [{ name: "DT_ENV", value: "selfhosted" }],
		readinessProbe: { httpGet: { path: "/api/v1/health", port: "http" } },
	});
	expect(containers[1]).toMatchObject({
		name: "pgbouncer",
		image: "edoburu/pgbouncer:v1.26.1-p0",
		command: ["/usr/bin/pgbouncer"],
	});
	const credentials = registration("donetick-config", "kubernetes:core/v1:Secret");
	const serialized = credentials.props.stringData["selfhosted.yaml"];
	expect(await isSecret(serialized)).toBe(true);
	const config = requireRecord(
		JSON.parse(await resolveOutput<string>(serialized)),
		"Donetick config must be a mapping.",
	);
	expect(config).toMatchObject({
		database: {
			type: "postgres",
			host: "127.0.0.1",
			name: "donetick",
			user: "donetick",
			password: "test-postgresql-donetick-password",
			migration: true,
		},
		disable_password_auth: true,
		is_user_creation_disabled: false,
		server: { public_host: "https://donetick.example-tailnet.ts.net" },
		storage: { base_path: "/donetick-data/uploads" },
		oauth2: {
			client_id: "donetick",
			client_secret: await resolveOutput(apps.donetick.clientSecret),
			redirect_url: "https://donetick.example-tailnet.ts.net/auth/oauth2",
			scopes: ["openid", "profile", "email"],
			auth_url: "https://identity.connorbray.net/application/o/authorize/",
			token_url: "https://identity.connorbray.net/application/o/token/",
			user_info_url: "https://identity.connorbray.net/application/o/userinfo/",
		},
	});
	expect(await isSecret(apps.donetick.clientSecret)).toBe(true);
	const pgbouncer = await resolveOutput(
		output<string>(credentials.props.stringData["pgbouncer.ini"]),
	);
	expect(pgbouncer).toContain("listen_addr = 127.0.0.1");
	expect(pgbouncer).toContain("server_tls_sslmode = require");
	expect(pgbouncer).toContain(
		"donetick = host=postgresql-rw.postgresql.svc.cluster.local. port=5432 dbname=donetick",
	);
	const data = await resolveOutput(
		output<Record<string, string>>(credentials.props.stringData),
	);
	const checksum = deployment.props.spec.template.metadata.annotations["checksum/config"];
	expect(await isSecret(checksum)).toBe(false);
	expect(await resolveOutput<string>(checksum)).toBe(
		createHash("sha256").update(JSON.stringify(data)).digest("hex"),
	);
	expect(await isSecret(credentials.props.stringData["userlist.txt"])).toBe(true);
	expect(
		registration("donetick-data", "kubernetes:core/v1:PersistentVolumeClaim").opts
			.protect,
	).toBe(true);
	const ingress = registration("donetick", "kubernetes:networking.k8s.io/v1:Ingress");
	expect(ingress.props.spec.tls).toEqual([{ hosts: ["donetick"] }]);
	expect(apps.apps).toContain("donetick");
});

test("deploys Vikunja at todo with TLS PostgreSQL, persistent files and Authentik-only login", async () => {
	const deployment = registration("vikunja", "kubernetes:apps/v1:Deployment");
	expect(deployment.opts.dependsOn).toContain(apps.postgresql.chart);
	expect(deployment.props.spec.strategy).toEqual({ type: "Recreate" });
	expect(deployment.props.spec.template.spec.containers).toHaveLength(1);
	expect(deployment.props.spec.template.spec.containers[0]).toMatchObject({
		image: "vikunja/vikunja:2.8.0",
		args: ["--config", "/etc/vikunja/config.yml"],
		readinessProbe: { httpGet: { path: "/health", port: "http" } },
		securityContext: { readOnlyRootFilesystem: true },
		volumeMounts: expect.arrayContaining([
			{ name: "files", mountPath: "/app/vikunja/files" },
		]),
	});
	const credentials = registration("vikunja-config", "kubernetes:core/v1:Secret");
	const serialized = credentials.props.stringData["config.yml"];
	expect(await isSecret(serialized)).toBe(true);
	const config = requireRecord(
		JSON.parse(await resolveOutput<string>(serialized)),
		"Vikunja config must be a mapping.",
	);
	expect(config).toMatchObject({
		service: {
			publicurl: "https://todo.example-tailnet.ts.net/",
			enableregistration: false,
		},
		database: {
			type: "postgres",
			host: "postgresql-rw.postgresql.svc.cluster.local.:5432",
			database: "vikunja",
			user: "vikunja",
			password: "test-postgresql-vikunja-password",
			sslmode: "require",
		},
		auth: {
			local: { enabled: false },
			openid: {
				enabled: true,
				providers: {
					authentik: {
						name: "Authentik",
						authurl: "https://identity.connorbray.net/application/o/vikunja/",
						clientid: "vikunja",
						clientsecret: await resolveOutput(apps.vikunja.clientSecret),
						scope: "openid profile email",
					},
				},
			},
		},
	});
	const checksum = deployment.props.spec.template.metadata.annotations["checksum/config"];
	expect(await resolveOutput<string>(checksum)).toBe(
		createHash("sha256")
			.update(await resolveOutput<string>(serialized))
			.digest("hex"),
	);
	expect(await isSecret(apps.vikunja.clientSecret)).toBe(true);
	expect(
		registration("vikunja-files", "kubernetes:core/v1:PersistentVolumeClaim").opts
			.protect,
	).toBe(true);
	const ingress = registration("vikunja", "kubernetes:networking.k8s.io/v1:Ingress");
	expect(ingress.props.spec.tls).toEqual([{ hosts: ["todo"] }]);
	expect(
		await resolveOutput<string>(ingress.props.metadata.annotations["tailscale.com/tags"]),
	).toBe("tag:todo");
	expect(apps.apps).toContain("vikunja");
});

test("exposes Authentik with a TLS Gateway and a direct node HTTPS hostPort, without a load balancer", async () => {
	const credentials = registration("gateway-cloudflare-dns", "kubernetes:core/v1:Secret");
	expect(await resolveOutput<string>(credentials.props.stringData["api-token"])).toBe(
		"test-generated-cloudflare-token",
	);
	expect(await isSecret(credentials.props.stringData["api-token"])).toBe(true);
	const controller = registration("envoy-gateway", "kubernetes:helm.sh/v3:Release");
	expect(controller.props.chart).toBe("oci://docker.io/envoyproxy/gateway-helm");
	expect(controller.props.skipAwait).not.toBe(true);
	const proxy = registration("public-envoy-proxy").props.spec.provider.kubernetes;
	expect(proxy.envoyService).toEqual({ type: "ClusterIP" });
	expect(proxy.envoyDaemonSet.patch.value.spec.template.spec.containers).toEqual([
		{ name: "envoy", ports: [{ containerPort: 10443, hostPort: 443, protocol: "TCP" }] },
	]);
	const gateway = registration(
		"public-gateway",
		"kubernetes:gateway.networking.k8s.io/v1:Gateway",
	);
	const listeners = await resolveOutput(output(gateway.props.spec.listeners));
	expect(listeners).toHaveLength(3);
	expect(listeners).toContainEqual(
		expect.objectContaining({
			hostname: "identity.connorbray.net",
			protocol: "HTTPS",
			port: 443,
			tls: {
				mode: "Terminate",
				certificateRefs: [{ kind: "Secret", name: "identity-tls" }],
			},
			allowedRoutes: {
				namespaces: {
					from: "Selector",
					selector: { matchLabels: { "kubernetes.io/metadata.name": "authentik" } },
				},
				kinds: [{ kind: "HTTPRoute" }],
			},
		}),
	);
	const certificate = registration("gateway-identity-certificate");
	expect(certificate.props.spec.dnsNames).toEqual(["identity.connorbray.net"]);
	expect(gateway.opts.dependsOn).toContain(certificate.resource);
	expect(
		await resolveOutput(
			output(registration("gateway-letsencrypt").props.spec.acme.solvers[0]),
		),
	).toEqual({
		dns01: {
			cloudflare: { apiTokenSecretRef: { name: "cloudflare-dns", key: "api-token" } },
		},
	});
});

test("prepares bray.sh apex and wildcard TLS listeners without attaching applications", async () => {
	const gateway = registration(
		"public-gateway",
		"kubernetes:gateway.networking.k8s.io/v1:Gateway",
	);
	const listeners = await resolveOutput(output(gateway.props.spec.listeners));
	for (const [name, hostname] of [
		["bray-https", "bray.sh"],
		["bray-wildcard-https", "*.bray.sh"],
	]) {
		expect(listeners).toContainEqual({
			name,
			hostname,
			protocol: "HTTPS",
			port: 443,
			tls: {
				mode: "Terminate",
				certificateRefs: [{ kind: "Secret", name: "bray-sh-tls" }],
			},
			allowedRoutes: {
				namespaces: {
					from: "Selector",
					selector: { matchLabels: { "gateway.bray.sh/access": "true" } },
				},
				kinds: [{ kind: "HTTPRoute" }],
			},
		});
	}
	const certificate = registration("gateway-bray-certificate");
	expect(await resolveOutput(output(certificate.props.spec))).toEqual({
		secretName: "bray-sh-tls",
		dnsNames: ["bray.sh", "*.bray.sh"],
		issuerRef: { name: "letsencrypt", kind: "Issuer" },
	});
	expect(gateway.opts.dependsOn).toContain(certificate.resource);
	expect(
		resources
			.filter(
				(resource) =>
					resource.type.endsWith(":HTTPRoute") || resource.type.endsWith(":Ingress"),
			)
			.some((resource) => JSON.stringify(resource.inputs).includes("bray.sh")),
	).toBe(false);
});

test("deploys Authentik server and worker using their own shared database and an HTTPRoute", async () => {
	const chart = registration("authentik", "kubernetes:helm.sh/v4:Chart");
	const values = await resolveOutput(output(chart.props.values));
	expect(values).toMatchObject({
		authentik: {
			postgresql: {
				host: apps.postgresql.host,
				name: "authentik",
				user: "authentik",
				sslmode: "require",
			},
		},
		postgresql: { enabled: false },
		server: {
			replicas: 1,
			route: {
				main: {
					enabled: true,
					hostnames: ["identity.connorbray.net"],
					parentRefs: [
						{ name: "public", namespace: "envoy-gateway-system", sectionName: "https" },
					],
					https: false,
				},
			},
		},
		worker: { replicas: 1, envFrom: [{ secretRef: { name: "authentik-bootstrap" } }] },
	});
	expect(chart.opts.dependsOn).toContain(apps.postgresql.chart);
	expect(chart.opts.dependsOn).toContain(apps.gateway.gateway);
	expect(await isSecret(chart.props.values.authentik.secret_key)).toBe(true);
	expect(await isSecret(chart.props.values.authentik.postgresql.password)).toBe(true);
	expect(apps.apps.includes("authentik")).toBe(true);
});

test("replaces only NetBird's fixed-name config Secret before recreating it", async () => {
	const chart = registration("netbird", "kubernetes:helm.sh/v4:Chart");
	const transform = chart.opts.transforms?.[1];
	if (!transform) {
		throw new Error("Missing NetBird config Secret replacement ordering.");
	}
	const args: ResourceTransformArgs = {
		type: "kubernetes:core/v1:Secret",
		name: "netbird:netbird/netbird-config",
		custom: true,
		props: { metadata: output({ name: "netbird-config" }) },
		opts: { protect: true },
	};
	const result = await transform(args);
	expect(result?.props).toBe(args.props);
	expect(result?.opts).toHaveProperty("protect", true);
	expect(result?.opts).toHaveProperty("deleteBeforeReplace", true);
	expect(
		await transform({
			...args,
			name: "netbird:netbird/netbird-postgresql-auth",
		}),
	).toBeUndefined();
	expect(
		await transform({ ...args, type: "kubernetes:core/v1:ConfigMap" }),
	).toBeUndefined();
});

test("isolates NetBird Tailscale ingress and routes server protocols separately from the dashboard", () => {
	const ingress = registration(
		"netbird-ingress",
		"kubernetes:networking.k8s.io/v1:Ingress",
	);
	expect(ingress.opts.parent).toBe(apps.netbirdIngress);
	expect(ingress.opts.dependsOn).toEqual([apps.netbird.chart, apps.tailscale.chart]);
	const spec = ingress.props.spec;
	expect(spec).toMatchObject({
		ingressClassName: "tailscale",
		tls: [{ hosts: ["netbird.example-tailnet.ts.net"] }],
	});
	expect(ingress.props.metadata).toMatchObject({
		namespace: apps.netbird.namespaceName,
		annotations: { "tailscale.com/tags": "tag:netbird" },
	});
	const paths = spec.rules[0].http.paths;
	for (const path of [
		"/api",
		"/oauth2",
		"/relay",
		"/ws-proxy",
		"/management.ManagementService",
		"/management.ProxyService",
		"/signalexchange.SignalExchange",
	]) {
		expect(paths).toContainEqual({
			path,
			pathType: "Prefix",
			backend: { service: { name: "netbird-server", port: { number: 80 } } },
		});
	}
	expect(paths.at(-1)).toEqual({
		path: "/",
		pathType: "Prefix",
		backend: { service: { name: "netbird-dashboard", port: { number: 80 } } },
	});
});

test("shares Helm ingress values with chart-specific class keys and multiple tags", () => {
	const options = { hostname: "example", tags: ["tag:apps", "tag:shared"] };
	const values = tailscaleIngress(options);
	expect(values).toEqual({
		enabled: true,
		ingressClassName: "tailscale",
		annotations: {
			"tailscale.com/tags": "tag:apps,tag:shared",
			"tailscale.com/http-redirect": "true",
		},
		hosts: ["example"],
		paths: ["/"],
		path: "/",
		pathType: "Prefix",
		tls: [{ hosts: ["example"] }],
	});
	const couchdbValues = tailscaleIngress(options, "className");
	expect(couchdbValues.className).toBe("tailscale");
	expect(couchdbValues).not.toHaveProperty("ingressClassName");
});

test("creates standalone ingress with named ports while preserving options and dependencies", async () => {
	const ingress = registration("named-port-ingress");
	expect(ingress.opts.parent).toBe(apps);
	expect(ingress.opts).toHaveProperty("protect", true);
	expect(await resolveOutput(output(ingress.opts.dependsOn))).toEqual([
		apps.vault.chart,
		apps.tailscale.chart,
	]);
	expect(
		resources.find((resource) => resource.name === "named-port-ingress")?.inputs,
	).toEqual({
		apiVersion: "networking.k8s.io/v1",
		kind: "Ingress",
		metadata: {
			namespace: "vault",
			annotations: {
				"example.com/annotation": "retained",
				"tailscale.com/tags": "tag:apps,tag:shared",
				"tailscale.com/http-redirect": "true",
			},
		},
		spec: {
			ingressClassName: "tailscale",
			tls: [{ hosts: ["example"] }],
			rules: [
				{
					http: {
						paths: [
							{
								path: "/",
								pathType: "Prefix",
								backend: {
									service: { name: "example-service", port: { name: "https" } },
								},
							},
						],
					},
				},
			],
		},
	});
});

test("creates the Vault component with internal TLS and ordered Tailscale ingress", async () => {
	expect<Resource>(apps.vault).toBe(
		registration("vault", "connor-bray:infrastructure:cluster:apps:Vault").resource,
	);
	expect(
		registration("vault", "connor-bray:infrastructure:cluster:apps:Vault").opts.parent,
	).toBe(apps);
	for (const [name, type] of [
		["vault", "kubernetes:core/v1:Namespace"],
		["vault-internal-tls-key", "tls:index/privateKey:PrivateKey"],
		["vault-internal-tls-cert", "tls:index/selfSignedCert:SelfSignedCert"],
		["vault-internal-tls", "kubernetes:core/v1:Secret"],
		["vault", "kubernetes:helm.sh/v4:Chart"],
		["vault-ingress", "kubernetes:networking.k8s.io/v1:Ingress"],
	] as const) {
		expect(registration(name, type).opts.parent).toBe(apps.vault);
	}
	const tlsSecret = registration("vault-internal-tls", "kubernetes:core/v1:Secret");
	if (!("additionalSecretOutputs" in tlsSecret.opts)) {
		throw new Error("Missing TLS secret output protection.");
	}
	expect(tlsSecret.opts.additionalSecretOutputs).toEqual(
		expect.arrayContaining(["data", "stringData"]),
	);
	expect(await isSecret(tlsSecret.props.stringData["tls.key"])).toBe(true);
	const chart = registration("vault", "kubernetes:helm.sh/v4:Chart");
	expect(chart.opts.dependsOn).toEqual([tlsSecret.resource, apps.storage.chart]);
	expect(
		await resolveOutput(output(registration("vault-ingress").opts.dependsOn)),
	).toEqual([apps.vault.chart, apps.tailscale.chart]);
	expect(await resolveOutput(apps.vault.namespaceName)).toBe("vault");
	expect(await resolveOutput(apps.vault.internalCaCert)).toBe("test-certificate");
	expect(
		resources.find((resource) => resource.name === "vault-ingress")?.inputs,
	).toMatchObject({
		metadata: {
			name: "vault-secure-access",
			namespace: "vault",
			annotations: {
				"tailscale.com/tags": "tag:vault",
				"tailscale.com/http-redirect": "true",
			},
		},
		spec: {
			ingressClassName: "tailscale",
			tls: [{ hosts: ["vault"] }],
			rules: [
				{
					http: {
						paths: [
							{
								path: "/",
								pathType: "Prefix",
								backend: { service: { name: "vault-ui", port: { number: 443 } } },
							},
						],
					},
				},
			],
		},
	});
	expect(apps.apps.includes("vault")).toBe(true);
	const chartInputs = resources.find(
		(args) => args.name === "vault" && args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	expect(chartInputs).toMatchObject({
		namespace: "vault",
		values: {
			global: { tlsDisable: false },
			server: {
				dataStorage: { enabled: true, size: "10Gi" },
				ha: { enabled: true, replicas: 1, raft: { enabled: true } },
			},
			ui: { externalPort: 443, targetPort: 8200 },
		},
	});
	expect(chartInputs).not.toHaveProperty("values.server.dataStorage.storageClass");
	const transform = chart.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing Vault TLS checksum transform.");
	}
	const result = await transform({
		type: "kubernetes:apps/v1:StatefulSet",
		name: "vault",
		custom: true,
		props: { spec: { template: { metadata: {} } } },
		opts: {},
	});
	if (!result) {
		throw new Error("Vault StatefulSet was not transformed.");
	}
	expect(
		await resolveOutput<string>(
			result.props.spec.template.metadata.annotations["checksum/internal-tls"],
		),
	).toBe(
		createHash("sha256").update("test-certificate", "utf8").digest("hex").toUpperCase(),
	);
});

test("only annotates Vault StatefulSets and preserves existing pod annotations", async () => {
	const args: ResourceTransformArgs = {
		type: "kubernetes:apps/v1:StatefulSet",
		name: "vault",
		custom: true,
		props: { spec: { template: { metadata: { annotations: { existing: "kept" } } } } },
		opts: {},
	};
	const original = structuredClone(args.props);
	const transform = registration("vault", "kubernetes:helm.sh/v4:Chart").opts
		.transforms?.[0];
	if (!transform) {
		throw new Error("Missing Vault TLS checksum transform.");
	}
	const result = await transform(args);
	if (!result) {
		throw new Error("Vault StatefulSet was not transformed.");
	}
	expect(result.props.spec.template.metadata.annotations.existing).toBe("kept");
	expect(
		await resolveOutput<string>(
			result.props.spec.template.metadata.annotations["checksum/internal-tls"],
		),
	).toBe(
		createHash("sha256").update("test-certificate", "utf8").digest("hex").toUpperCase(),
	);
	expect(args.props).toEqual(original);
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("creates CouchDB with protected credentials, rollout checksum, and retained storage", async () => {
	const component = registration(
		"couchdb",
		"connor-bray:infrastructure:cluster:apps:Couchdb",
	);
	expect(component.resource).toBe(apps.couchdb);
	expect(component.opts.parent).toBe(apps);
	expect(apps.apps.includes("couchdb")).toBe(true);
	const credentials = registration("couchdb-admin", "kubernetes:core/v1:Secret");
	expect(credentials.opts.parent).toBe(apps.couchdb);
	expect(await isSecret(credentials.props.stringData.adminPassword)).toBe(true);
	expect(await isSecret(credentials.props.stringData.cookieAuthSecret)).toBe(true);
	expect(await isSecret(credentials.props.stringData.erlangCookie)).toBe(true);
	const chart = registration("couchdb", "kubernetes:helm.sh/v4:Chart");
	expect(chart.opts.parent).toBe(apps.couchdb);
	expect(chart.opts.dependsOn).toEqual([
		registration("couchdb", "kubernetes:core/v1:Namespace").resource,
		credentials.resource,
		apps.tailscale.chart,
		apps.storage.chart,
		apps.monitoring.chart,
	]);
	expect(chart.props.values).toMatchObject({
		clusterSize: 1,
		allowAdminParty: false,
		createAdminSecret: false,
		extraSecretName: "couchdb-admin",
		persistentVolume: { enabled: true, size: "5Gi" },
		persistentVolumeClaimRetentionPolicy: {
			enabled: true,
			whenScaled: "Retain",
			whenDeleted: "Retain",
		},
		ingress: { className: "tailscale", hosts: ["couchdb"] },
		couchdbConfig: {
			couchdb: { single_node: true },
			chttpd: { require_valid_user: true },
			cors: { credentials: true },
		},
	});
	const checksum = chart.props.values.annotations["checksum/credentials"];
	expect(await isSecret(checksum)).toBe(false);
	expect(await resolveOutput<string>(checksum)).toBe(
		createHash("sha256")
			.update(
				JSON.stringify([
					"test-couchdb-password",
					"test-couchdb-cookie-secret",
					"test-couchdb-erlang-cookie",
				]),
			)
			.digest("hex"),
	);
});

test("scrapes authenticated CouchDB metrics after monitoring CRDs exist and provisions its dashboard", () => {
	const chart = registration("couchdb", "kubernetes:helm.sh/v4:Chart");
	expect(chart.props.values.prometheusPort).toEqual({
		enabled: false,
	});
	const monitor = registration("couchdb-metrics");
	expect(monitor.resource).toBe(apps.couchdb.serviceMonitor);
	expect(monitor.opts.parent).toBe(apps.couchdb);
	expect(monitor.opts.dependsOn).toEqual([apps.couchdb.chart, apps.monitoring.chart]);
	expect(monitor.props).toMatchObject({
		apiVersion: "monitoring.coreos.com/v1",
		kind: "ServiceMonitor",
		metadata: { labels: { release: "kube-prometheus-stack" } },
		spec: {
			jobLabel: "app",
			selector: {
				matchLabels: {
					app: "couchdb",
					release: "couchdb",
					"couchdb-monitoring": "true",
				},
			},
			endpoints: [
				{
					port: "couchdb",
					path: "/_node/_local/_prometheus",
					interval: "60s",
					scrapeTimeout: "10s",
					basicAuth: {
						username: { name: "couchdb-admin", key: "adminUsername" },
						password: { name: "couchdb-admin", key: "adminPassword" },
					},
				},
			],
		},
	});
	expect(chart.props.values.service.labels).toEqual({ "couchdb-monitoring": "true" });
	const dashboard = registration("couchdb-dashboard", "kubernetes:core/v1:ConfigMap");
	expect(dashboard.props.metadata.labels).toEqual({ grafana_dashboard: "1" });
	const config = JSON.parse(dashboard.props.data["couchdb-overview.json"]);
	expect(config.panels).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				datasource: { type: "prometheus", uid: "prometheus" },
				targets: [
					{ refId: "A", expr: 'up{job="couchdb"}', legendFormat: "{{instance}}" },
				],
			}),
		]),
	);
});

test("creates bundled Kubernetes monitoring with dashboards and Talos-compatible exporters", () => {
	expect(
		registration("monitoring", "connor-bray:infrastructure:cluster:apps:Monitoring")
			.resource,
	).toBe(apps.monitoring);
	expect(apps.apps.includes("monitoring")).toBe(true);
	const chart = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart");
	expect(chart.resource).toBe(apps.monitoring.chart);
	expect(chart.opts.parent).toBe(apps.monitoring);
	expect(chart.opts.dependsOn).toEqual([
		registration("monitoring", "kubernetes:core/v1:Namespace").resource,
		registration("grafana-admin", "kubernetes:core/v1:Secret").resource,
		registration("monitoring-admission-tls", "kubernetes:core/v1:Secret").resource,
		apps.tailscale.chart,
		apps.storage.chart,
		apps.monitoring.logging.loki,
		apps.monitoring.logging.grafanaCertificate,
	]);
	expect(chart.props).toMatchObject({
		chart: "kube-prometheus-stack",
		values: {
			defaultRules: { create: true, rules: { etcd: false, kubeProxy: false } },
			kubeEtcd: { enabled: false },
			kubeControllerManager: { enabled: false },
			kubeScheduler: { enabled: false },
			kubeProxy: { enabled: false },
			nodeExporter: { enabled: true },
			kubeStateMetrics: { enabled: true },
			"prometheus-node-exporter": {
				hostRootFsMount: { enabled: true, mountPropagation: "None" },
			},
			prometheus: {
				enabled: true,
				ingress: { ingressClassName: "tailscale", hosts: ["prometheus"] },
				prometheusSpec: {
					retention: "7d",
					retentionSize: "4GB",
					scrapeInterval: "60s",
					storageSpec: {
						volumeClaimTemplate: {
							spec: { resources: { requests: { storage: "5Gi" } } },
						},
					},
				},
			},
			alertmanager: {
				enabled: true,
				alertmanagerSpec: {
					storage: {
						volumeClaimTemplate: {
							spec: { resources: { requests: { storage: "1Gi" } } },
						},
					},
				},
			},
			grafana: {
				defaultDashboardsEnabled: true,
				sidecar: {
					dashboards: { enabled: true },
					datasources: { enabled: true, defaultDatasourceEnabled: true },
				},
			},
		},
	});
	expect(
		registration("monitoring", "kubernetes:core/v1:Namespace").props.metadata.labels,
	).toEqual({ "pod-security.kubernetes.io/enforce": "privileged" });
	expect(
		chart.props.values.prometheusOperator.annotations[
			"config.kubernetes.io/depends-on"
		].split(","),
	).toEqual(
		expect.arrayContaining([
			"apiextensions.k8s.io/CustomResourceDefinition/prometheuses.monitoring.coreos.com",
			"apiextensions.k8s.io/CustomResourceDefinition/alertmanagers.monitoring.coreos.com",
			"apiextensions.k8s.io/CustomResourceDefinition/scrapeconfigs.monitoring.coreos.com",
		]),
	);
});

test("protects Grafana credentials and provisions admission TLS without Helm hooks", async () => {
	const chart = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart");
	const secret = registration("grafana-admin", "kubernetes:core/v1:Secret");
	expect(await isSecret(secret.props.stringData["admin-password"])).toBe(true);
	expect(chart.props.values.grafana).toMatchObject({
		admin: { existingSecret: "grafana-admin" },
		ingress: { ingressClassName: "tailscale", hosts: ["grafana"] },
		persistence: { enabled: true, size: "1Gi" },
	});
	const tlsSecret = registration("monitoring-admission-tls", "kubernetes:core/v1:Secret");
	expect(tlsSecret.opts.parent).toBe(apps.monitoring);
	expect(tlsSecret.props.metadata.name).toBe("kube-prometheus-stack-admission");
	expect(await isSecret(tlsSecret.props.stringData.key)).toBe(true);
	const operator = chart.props.values.prometheusOperator;
	expect(operator.admissionWebhooks).toMatchObject({
		enabled: true,
		failurePolicy: "Fail",
		patch: { enabled: false },
		certManager: { enabled: false },
		validatingWebhookConfiguration: {
			annotations: {
				"config.kubernetes.io/depends-on":
					"apps/namespaces/monitoring/Deployment/kube-prometheus-stack-operator",
			},
		},
	});
	expect(await resolveOutput<string>(operator.admissionWebhooks.caBundle)).toBe(
		Buffer.from("test-certificate", "utf8").toString("base64"),
	);
	expect(
		await resolveOutput<string>(operator.podAnnotations["checksum/admission-tls"]),
	).toBe(createHash("sha256").update("test-certificate", "utf8").digest("hex"));
});

test("orders certificate issuance and opts TLS consumers into automatic reloads", async () => {
	const namespace = registration("monitoring", "kubernetes:core/v1:Namespace").resource;
	const manager = registration("cert-manager", "kubernetes:helm.sh/v4:Chart");
	expect(manager.props.values).toMatchObject({
		crds: { enabled: true },
		startupapicheck: { enabled: false },
		webhook: {
			validatingWebhookConfigurationAnnotations: {
				"pulumi.com/waitFor": "jsonpath={.webhooks[0].clientConfig.caBundle}",
			},
			mutatingWebhookConfigurationAnnotations: {
				"pulumi.com/waitFor": "jsonpath={.webhooks[0].clientConfig.caBundle}",
			},
		},
	});
	expect(
		manager.props.values.cainjector.deploymentAnnotations[
			"config.kubernetes.io/depends-on"
		],
	).toContain("rbac.authorization.k8s.io/ClusterRoleBinding/cert-manager-cainjector");
	const reloader = registration("certificate-reloader", "kubernetes:helm.sh/v4:Chart");
	expect(reloader.opts.dependsOn).toEqual([namespace]);
	expect(reloader.props.values.reloader).toMatchObject({
		watchGlobally: false,
		autoReloadAll: false,
		reloadOnCreate: true,
		reloadStrategy: "annotations",
	});
	expect(registration("logging-selfsigned").opts.dependsOn).toEqual([
		namespace,
		apps.certificates.chart,
	]);
	expect(registration("logging-ca").opts.dependsOn).toEqual([
		registration("logging-selfsigned").resource,
	]);
	expect(registration("logging-ca").props.spec).toMatchObject({
		isCA: true,
		duration: "87600h",
		renewBefore: "17520h",
		privateKey: { rotationPolicy: "Never" },
	});
	for (const name of [
		"loki-server-tls",
		"alloy-loki-client-tls",
		"grafana-loki-client-tls",
	]) {
		const certificate = registration(name);
		expect(certificate.opts.dependsOn).toEqual([
			registration("logging-ca-issuer").resource,
		]);
		expect(certificate.props).toMatchObject({
			metadata: { annotations: { "pulumi.com/waitFor": "condition=Ready" } },
			spec: {
				duration: "8760h",
				renewBefore: "720h",
				privateKey: { rotationPolicy: "Always" },
			},
		});
	}
	const loki = registration("loki", "kubernetes:helm.sh/v4:Chart");
	expect(loki.opts.dependsOn).toContain(apps.certificates.reloader);
	expect(loki.opts.dependsOn).toContain(registration("loki-server-tls").resource);
	expect(loki.props.values.singleBinary.annotations).toEqual({
		"secret.reloader.stakater.com/reload": "loki-server-tls",
		"configmap.reloader.stakater.com/reload": "loki-health-proxy",
	});
	const alloy = registration("alloy", "kubernetes:helm.sh/v4:Chart");
	expect(alloy.opts.dependsOn).toEqual([
		apps.monitoring.logging.loki,
		registration("alloy-loki-client-tls").resource,
		registration(
			"alloy-logs",
			"kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding",
		).resource,
	]);
	expect(alloy.props.values.controller.extraAnnotations).toEqual({
		"secret.reloader.stakater.com/reload": "alloy-loki-client-tls",
	});
	const grafana = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart")
		.props.values.grafana;
	expect(grafana.annotations).toEqual({
		"secret.reloader.stakater.com/reload": "grafana-loki-client-tls",
		"configmap.reloader.stakater.com/reload": "grafana-loki-proxy",
	});
	expect(await resolveOutput(output(grafana.extraContainerVolumes))).toEqual(
		expect.arrayContaining([
			{ name: "loki-client-tls", secret: { secretName: "grafana-loki-client-tls" } },
		]),
	);
});

test("requires logging mTLS without exposing internal Loki or Grafana proxy endpoints", () => {
	const loki = registration("loki", "kubernetes:helm.sh/v4:Chart").props.values;
	expect(loki).toMatchObject({
		deploymentMode: "SingleBinary",
		gateway: { enabled: false },
		loki: {
			structuredConfig: {
				server: {
					grpc_listen_address: "127.0.0.1",
					http_tls_config: {
						cert_file: "/etc/loki/tls/tls.crt",
						key_file: "/etc/loki/tls/tls.key",
						client_ca_file: "/etc/loki/tls/ca.crt",
						client_auth_type: "RequireAndVerifyClientCert",
					},
				},
				internal_server: { http_listen_address: "127.0.0.1" },
				common: {
					instance_addr: "127.0.0.1",
					ring: { kvstore: { store: "inmemory" } },
				},
				memberlist: { bind_addr: ["127.0.0.1"], join_members: [] },
				limits_config: { retention_period: "168h", volume_enabled: true },
				compactor: { retention_enabled: true },
			},
			readinessProbe: { httpGet: { path: "/ready", port: 3102 } },
		},
		singleBinary: {
			persistence: { enabled: true, whenDeleted: "Retain", whenScaled: "Retain" },
		},
	});
	const health = registration("loki-health-proxy").props.data["nginx.conf"];
	expect(health).toContain("location = /ready");
	expect(health).toContain("location / { return 404; }");
	const proxy = registration("grafana-loki-proxy").props.data["nginx.conf"];
	expect(proxy).toContain("listen 127.0.0.1:13100;");
	expect(proxy).toContain("proxy_set_header X-Scope-OrgID fake;");
	expect(proxy).toContain("proxy_ssl_verify on;");
	expect(proxy).toContain("proxy_ssl_certificate_key /etc/loki-client/tls.key;");
	const grafana = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart")
		.props.values.grafana;
	expect(grafana.additionalDataSources).toContainEqual(
		expect.objectContaining({
			uid: "loki",
			type: "loki",
			url: "http://127.0.0.1:13100",
		}),
	);
});

test("collects node-local Kubernetes logs with restricted Alloy RBAC and verified TLS", () => {
	const values = registration("alloy", "kubernetes:helm.sh/v4:Chart").props.values;
	expect(values.rbac).toEqual({ create: false });
	expect(
		registration("alloy-logs", "kubernetes:rbac.authorization.k8s.io/v1:ClusterRole")
			.props,
	).toMatchObject({
		rules: [
			{
				apiGroups: [""],
				resources: ["pods", "pods/log", "namespaces"],
				verbs: ["get", "list", "watch"],
			},
		],
	});
	expect(values.alloy.extraEnv).toEqual([
		{
			name: "NODE_NAME",
			valueFrom: { fieldRef: { apiVersion: "v1", fieldPath: "spec.nodeName" } },
		},
	]);
	const config = values.alloy.configMap.content;
	expect(config).toContain('field = "spec.nodeName=" + sys.env("NODE_NAME")');
	expect(config).toContain('loki.source.kubernetes "pods"');
	expect(config).toContain('url = "https://loki.monitoring.svc:3100/loki/api/v1/push"');
	expect(config).toContain('ca_file = "/etc/alloy/tls/ca.crt"');
	expect(config).toContain('cert_file = "/etc/alloy/tls/tls.crt"');
	expect(config).toContain('key_file = "/etc/alloy/tls/tls.key"');
	expect(config).not.toContain("insecure_skip_verify");
});

test("monitoring PVC transforms preserve options and ignore cluster-assigned volume bindings", async () => {
	const transform = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart")
		.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing monitoring PVC transform.");
	}
	const args: ResourceTransformArgs = {
		type: "kubernetes:core/v1:PersistentVolumeClaim",
		name: "grafana",
		custom: true,
		props: { spec: { resources: { requests: { storage: "1Gi" } } } },
		opts: { ignoreChanges: ["metadata.annotations"], protect: true },
	};
	const result = await transform(args);
	expect(result).toEqual({
		props: args.props,
		opts: { ignoreChanges: ["metadata.annotations", "spec.volumeName"], protect: true },
	});
	expect(args.opts.ignoreChanges).toEqual(["metadata.annotations"]);
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("migrates Grafana identities and replaces configuration without replacing its PVC", async () => {
	const transform = registration("kube-prometheus-stack", "kubernetes:helm.sh/v4:Chart")
		.opts.transforms?.[1];
	if (!transform) {
		throw new Error("Missing Grafana migration transform.");
	}
	const legacyParent =
		"urn:pulumi:test::cluster::connor-bray:infrastructure:cluster:apps:ClusterApps$" +
		"connor-bray:infrastructure:cluster:apps:Monitoring$kubernetes:helm.sh/v4:Chart::grafana";
	const cases = [
		["kubernetes:core/v1:ConfigMap", "monitoring/grafana"],
		["kubernetes:core/v1:PersistentVolumeClaim", "monitoring/grafana"],
		["kubernetes:apps/v1:Deployment", "monitoring/grafana"],
		["kubernetes:rbac.authorization.k8s.io/v1:ClusterRole", "grafana-clusterrole"],
		[
			"kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding",
			"grafana-clusterrolebinding",
		],
	] as const;
	await Promise.all(
		cases.map(async ([type, name]) => {
			const args: ResourceTransformArgs = {
				type,
				name: `kube-prometheus-stack:${name}`,
				custom: true,
				props: { metadata: { name: "preserved" } },
				opts: {
					aliases: ["urn:pulumi:test::cluster::example:type::previous"],
					protect: true,
				},
			};
			const result = await transform(args);
			if (!result) {
				throw new Error(`Grafana resource was not migrated: ${type}`);
			}
			expect(await resolveOutput(output(result.opts.aliases))).toEqual([
				"urn:pulumi:test::cluster::example:type::previous",
				{ name: `grafana:${name}`, parent: legacyParent },
			]);
			if (
				type === "kubernetes:apps/v1:Deployment" ||
				type === "kubernetes:core/v1:ConfigMap"
			) {
				expect(result.opts).toMatchObject({ deleteBeforeReplace: true });
			} else {
				expect(result.opts).not.toHaveProperty("deleteBeforeReplace");
			}
			expect(result.props).toBe(args.props);
			expect(result.opts.protect).toBe(true);
			expect(args.opts.aliases).toHaveLength(1);
		}),
	);
	expect(
		await transform({
			type: "kubernetes:core/v1:ConfigMap",
			name: "kube-prometheus-stack:monitoring/grafana-config-dashboards",
			custom: true,
			props: {},
			opts: {},
		}),
	).toBeUndefined();
});

test("provisions retained node-local storage on the Talos data mount", async () => {
	const storageChart = registration(
		"local-path-provisioner",
		"kubernetes:helm.sh/v4:Chart",
	);
	expect(storageChart.opts.parent).toBe(apps.storage);
	const namespace = registration("local-path-storage", "kubernetes:core/v1:Namespace");
	expect(namespace.props.metadata.labels["pod-security.kubernetes.io/enforce"]).toBe(
		"privileged",
	);
	expect(storageChart.opts.dependsOn).toEqual([namespace.resource]);
	const inputs = resources.find(
		(args) =>
			args.name === "local-path-provisioner" &&
			args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	expect(inputs).toMatchObject({
		values: {
			extraArgs: ["--allow-unsafe-helper-pod-template"],
			storageClass: {
				defaultClass: true,
				defaultVolumeType: "local",
				reclaimPolicy: "Retain",
				volumeBindingMode: "WaitForFirstConsumer",
			},
			nodePathMap: [
				{
					node: "DEFAULT_PATH_FOR_NON_LISTED_NODES",
					paths: ["/var/mnt/cluster-storage"],
				},
			],
		},
	});
	const transform = storageChart.opts.transforms?.[0];
	if (!transform) {
		throw new Error("Missing local storage helper transform.");
	}
	const props = { data: { setup: "preserved", "helperPod.yaml": "original" } };
	const args: ResourceTransformArgs = {
		type: "kubernetes:core/v1:ConfigMap",
		name: "local-path-config",
		custom: true,
		props,
		opts: {},
	};
	const transformed = await transform(args);
	if (!transformed) {
		throw new Error("Local storage ConfigMap was not transformed.");
	}
	expect(transformed.props.data.setup).toBe("preserved");
	expect(JSON.parse(transformed.props.data["helperPod.yaml"])).toMatchObject({
		spec: {
			volumes: [{ name: "boot-var", hostPath: { path: "/var", type: "Directory" } }],
			containers: [
				{
					volumeMounts: [{ name: "boot-var", mountPath: "/host-var", readOnly: true }],
				},
			],
		},
	});
	expect(props.data["helperPod.yaml"]).toBe("original");
	expect(
		await transform({ ...args, type: "kubernetes:apps/v1:Deployment" }),
	).toBeUndefined();
});

test("refuses boot-disk fallback and permits provisioning on a separate filesystem", async () => {
	const inputs = resources.find(
		(args) =>
			args.name === "local-path-provisioner" &&
			args.type === "kubernetes:helm.sh/v4:Chart",
	)?.inputs;
	const values = requireRecord(inputs?.values, "Missing storage chart values.");
	const configmap = requireRecord(
		values.configmap,
		"Missing storage setup configuration.",
	);
	const setup = configmap.setup;
	if (typeof setup !== "string") {
		throw new Error("Storage setup script must be a string.");
	}
	const directory = await mkdtemp(join(tmpdir(), "cluster-storage-test-"));
	const marker = join(directory, "provisioned");
	try {
		await writeFile(
			join(directory, "stat"),
			`#!/bin/sh
if [ "$3" = /host-var ]; then
  printf '%s\\n' "$BOOT_DEVICE"
else
  printf '%s\\n' "$DATA_DEVICE"
fi
`,
			{ mode: 0o700 },
		);
		await writeFile(
			join(directory, "mkdir"),
			'#!/bin/sh\nprintf "created" > "$MARKER"\n',
			{ mode: 0o700 },
		);
		const runSetup = async (dataDevice: string) => {
			const process = Bun.spawn(["/bin/sh", "-c", setup], {
				env: {
					PATH: directory,
					BOOT_DEVICE: "1",
					DATA_DEVICE: dataDevice,
					MARKER: marker,
					VOL_DIR: "/var/mnt/cluster-storage/test-pvc",
				},
				stdout: "pipe",
				stderr: "pipe",
			});
			return {
				exitCode: await process.exited,
				stderr: await new Response(process.stderr).text(),
			};
		};
		const blocked = await runSetup("1");
		expect(blocked.exitCode).toBe(1);
		expect(blocked.stderr).toContain("must be mounted on a separate data disk");
		expect(await Bun.file(marker).exists()).toBe(false);
		expect((await runSetup("2")).exitCode).toBe(0);
		expect(await readFile(marker, "utf8")).toBe("created");
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
