import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const startup = new URL(
	"../../.devcontainer/lifecycle/postStartCommand.sh",
	import.meta.url,
);
const proxyConfig = new URL("../../.devcontainer/proxy-config.hcl", import.meta.url);

function fixture() {
	const directory = mkdtempSync(join(tmpdir(), "vault-proxy-test-"));
	const bin = join(directory, "bin");
	const config = join(directory, ".devcontainer/proxy-config.hcl");
	mkdirSync(bin);
	mkdirSync(join(directory, "runtime"));
	mkdirSync(join(directory, ".devcontainer"));
	copyFileSync(proxyConfig, config);
	const scripts = {
		vault: "#!/bin/sh\nexit 0\n",
		curl: '#!/bin/sh\ntest -f "$TEST_STATE/session"\n',
		tmux: `#!/bin/sh
case "$1" in
  has-session) test -f "$TEST_STATE/session" ;;
  new-session)
    test "\${TEST_START_FAIL:-0}" = 0 || exit 1
    printf '%s\\0' "$@" > "$TEST_STATE/tmux-args"
    if test "\${TEST_EXIT_EARLY:-0}" = 1; then
      printf 'Invalid proxy configuration\\n' > "$XDG_RUNTIME_DIR/vault-proxy/proxy.log"
      exit 0
    fi
    touch "$TEST_STATE/session"
    ;;
  *) exit 1 ;;
esac
`,
	};
	for (const [name, script] of Object.entries(scripts)) {
		writeFileSync(join(bin, name), script, { mode: 0o755 });
	}
	const env = {
		...process.env,
		PATH: `${bin}:${process.env.PATH}`,
		WORKSPACE_PATH: directory,
		XDG_RUNTIME_DIR: join(directory, "runtime"),
		TEST_STATE: directory,
		VAULT_UPSTREAM_ADDR: "https://vault.example.com",
		VAULT_ROLE_ID: "test-role-id",
		VAULT_SECRET_ID: "test-secret-id",
	};
	return {
		directory,
		config,
		env,
		run: (overrides: Record<string, string> = {}) =>
			spawnSync("bash", [startup.pathname], {
				env: { ...env, ...overrides },
				encoding: "utf8",
			}),
	};
}

test("proxy startup uses the new config and private credentials and is idempotent", () => {
	const setup = fixture();
	try {
		const result = setup.run();
		expect(result.status).toBe(0);
		expect(result.stdout).toContain("authenticated");
		const runtime = join(setup.env.XDG_RUNTIME_DIR, "vault-proxy");
		expect(statSync(runtime).mode & 0o777).toBe(0o700);
		for (const name of ["role-id", "secret-id"]) {
			expect(statSync(join(runtime, name)).mode & 0o777).toBe(0o600);
		}
		expect(statSync(join(runtime, "proxy.log")).mode & 0o777).toBe(0o600);
		const args = readFileSync(join(setup.directory, "tmux-args"), "utf8");
		expect(args).toContain(`VAULT_PROXY_CONFIG=${setup.config}`);
		expect(args).toContain(`VAULT_ADDR=${setup.env.VAULT_UPSTREAM_ADDR}`);
		expect(args).toContain(runtime);
		expect(args).toContain("VAULT_SKIP_VERIFY=false");
		expect(args).toContain("VAULT_PROXY_BIN=");
		expect(args).toContain("> proxy.log 2>&1");
		expect(args).not.toContain(setup.env.VAULT_SECRET_ID);
		expect(result.stdout + result.stderr).not.toContain(setup.env.VAULT_SECRET_ID);
		expect(setup.run({ VAULT_ROLE_ID: "", VAULT_SECRET_ID: "" }).status).toBe(0);
	} finally {
		rmSync(setup.directory, { recursive: true, force: true });
	}
});

test("proxy startup rejects the client proxy address as an upstream", () => {
	const setup = fixture();
	try {
		const result = setup.run({ VAULT_UPSTREAM_ADDR: "http://127.0.0.1:8100" });
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("requires an HTTPS upstream");
		expect(existsSync(join(setup.directory, "session"))).toBe(false);
	} finally {
		rmSync(setup.directory, { recursive: true, force: true });
	}
});

test("proxy startup reports launch failures rather than succeeding", () => {
	const setup = fixture();
	try {
		const result = setup.run({ TEST_START_FAIL: "1" });
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("Failed to launch Vault Proxy");
		expect(existsSync(join(setup.directory, "session"))).toBe(false);
	} finally {
		rmSync(setup.directory, { recursive: true, force: true });
	}
});

test("proxy startup preserves an early failure log and reports its location", () => {
	const setup = fixture();
	try {
		const result = setup.run({ TEST_EXIT_EARLY: "1" });
		const log = join(setup.env.XDG_RUNTIME_DIR, "vault-proxy/proxy.log");
		expect(result.status).toBe(1);
		expect(result.stderr).toContain(log);
		expect(readFileSync(log, "utf8")).toContain("Invalid proxy configuration");
	} finally {
		rmSync(setup.directory, { recursive: true, force: true });
	}
});

test("closing the tmux pane shell terminates a proxy that ignores hangup", async () => {
	const setup = fixture();
	let shell: ReturnType<typeof Bun.spawn> | undefined;
	let proxyPid: number | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		expect(setup.run().status).toBe(0);
		const command = readFileSync(join(setup.directory, "tmux-args"), "utf8")
			.split("\0")
			.findLast(Boolean);
		if (!command) {
			throw new Error("Missing tmux launch command.");
		}
		const binary = join(setup.directory, "bin/vault");
		writeFileSync(
			binary,
			`#!/usr/bin/env bun
import { writeFileSync } from "node:fs";
process.on("SIGHUP", () => {});
writeFileSync(process.env.TEST_STATE + "/proxy.pid", String(process.pid));
setInterval(() => {}, 1000);
`,
			{ mode: 0o755 },
		);
		shell = Bun.spawn(["bash", "-c", command], {
			cwd: join(setup.env.XDG_RUNTIME_DIR, "vault-proxy"),
			env: { ...setup.env, VAULT_PROXY_BIN: binary, VAULT_PROXY_CONFIG: setup.config },
			stdout: "ignore",
			stderr: "pipe",
		});
		const pidFile = join(setup.directory, "proxy.pid");
		const deadline = Date.now() + 5000;
		while (!existsSync(pidFile) && Date.now() < deadline) {
			await Bun.sleep(10);
		}
		if (!existsSync(pidFile)) {
			throw new Error("Mock proxy did not start.");
		}
		proxyPid = Number(readFileSync(pidFile, "utf8"));
		shell.kill("SIGHUP");
		await Promise.race([
			shell.exited,
			new Promise((_, reject) => {
				timer = setTimeout(
					() => reject(new Error("Proxy survived pane shutdown.")),
					5000,
				);
			}),
		]);
		expect(processAlive(proxyPid)).toBe(false);
	} finally {
		clearTimeout(timer);
		if (shell && shell.exitCode === null) {
			shell.kill("SIGTERM");
			await shell.exited;
		}
		if (proxyPid && processAlive(proxyPid)) {
			process.kill(proxyPid, "SIGTERM");
		}
		rmSync(setup.directory, { recursive: true, force: true });
	}
});

function processAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ESRCH") {
			return false;
		}
		throw error;
	}
}
