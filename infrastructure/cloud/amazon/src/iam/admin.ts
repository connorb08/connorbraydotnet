import type { ComponentResourceOptions, Output, Input } from "@pulumi/pulumi";
import { iam } from "@pulumi/aws";
import { ComponentResource } from "@pulumi/pulumi";

export interface AdminRoleArgs {
	vaultUserArn: Input<string>;
	rolePrefix: string;
	policyArn?: Input<string>;
}

export class AdminRole extends ComponentResource {
	public readonly roleArn: Output<string>;
	public readonly roleName: Output<string>;

	constructor(name: string, args: AdminRoleArgs, options?: ComponentResourceOptions) {
		super("connor-bray:infrastructure:aws:iam:AdminRole", name, {}, options);

		const rolePrefix = args.rolePrefix;
		const vaultUserArn = args.vaultUserArn;
		const policyArn = "arn:aws:iam::aws:policy/AdministratorAccess";

		const adminRole = new iam.Role(
			`${name}-admin-role`,
			{
				name: `${rolePrefix}-admin`,
				description: "Admin role",
				assumeRolePolicy: {
					Version: "2012-10-17",
					Statement: [
						{
							Effect: "Allow",
							Principal: { AWS: vaultUserArn },
							Action: "sts:AssumeRole",
						},
					],
				},
			},
			{ parent: this },
		);

		const _ = new iam.RolePolicyAttachment(
			`${name}-admin-role-attachment`,
			{
				role: adminRole.name,
				policyArn: policyArn,
			},
			{ parent: this },
		);
		this.roleArn = adminRole.arn;
		this.roleName = adminRole.name;

		this.registerOutputs({
			roleArn: this.roleArn,
			roleName: this.roleName,
		});
	}
}
