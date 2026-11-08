import type { ComponentResourceOptions, Output } from "@pulumi/pulumi";
import { ComponentResource, secret } from "@pulumi/pulumi";
import { PrivateKey } from "@pulumi/tls";

export class TlsKeyPair extends ComponentResource {
	readonly publicKeyValue: Output<string>;
	readonly privateKeyValue: Output<string>;

	constructor(name: string, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:aws:vps:TlsKeyPair", name, {}, options);

		const key = new PrivateKey(name, { algorithm: "ED25519" }, { parent: this });
		this.publicKeyValue = key.publicKeyOpenssh;
		this.privateKeyValue = secret(key.privateKeyOpenssh);

		this.registerOutputs({
			privateKey: this.privateKeyValue,
			publicKey: this.publicKeyValue,
		});
	}
}
