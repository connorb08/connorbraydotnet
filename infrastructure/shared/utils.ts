import type { NamespaceArgs } from "@pulumi/kubernetes/core/v1/namespace";
import type { CustomResourceOptions, Output, ResourceOptions } from "@pulumi/pulumi";
import type { RandomBytesArgs } from "@pulumi/random";
import { core } from "@pulumi/kubernetes";
import { secret, type ComponentResourceOptions, type Resource } from "@pulumi/pulumi";
import { RandomBytes, RandomPassword } from "@pulumi/random";

export const createNamespace = (
	name: string,
	args: NamespaceArgs = {},
	options: CustomResourceOptions = {},
) => {
	const namespace = new core.v1.Namespace(
		name,
		{
			...args,
			metadata: { ...args.metadata, name },
		},
		{ ...options },
	);
	return namespace;
};

export const generatePassword = (
	name: string,
	parent: Resource,
	length?: number,
	options?: ComponentResourceOptions | undefined,
) => {
	const password = new RandomPassword(
		name,
		{
			length: length ?? 32,
		},
		{ parent, ...options },
	);
	return [password, password.result, secret(password.result)];
};

export const generateSecret = (
	name: string,
	parent: Resource,
	args?: Partial<RandomBytesArgs>,
	options?: ResourceOptions | undefined,
): readonly [
	secretResource: RandomBytes,
	secretValue: Output<string>,
	secretOutput: Output<string>,
] => {
	const generatedSecret = new RandomBytes(
		name,
		{
			length: args?.length ?? 32,
			...args,
		},
		{ parent, ...options },
	);
	return [
		generatedSecret,
		generatedSecret.base64,
		secret(generatedSecret.base64),
	] as const;
};
