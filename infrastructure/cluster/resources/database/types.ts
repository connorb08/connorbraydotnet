import type { Input, Output, Resource } from "@pulumi/pulumi";

export interface PostgresqlApplicationConfig {
	password?: Input<string>;
}

export interface PostgresqlConnection {
	host: string;
	port: number;
	name: string;
	username: string;
	password: Output<string>;
	resource: Resource;
}
