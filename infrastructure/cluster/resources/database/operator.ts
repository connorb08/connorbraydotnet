import type { Namespace } from "@pulumi/kubernetes/core/v1";
import type { Resource } from "@pulumi/pulumi";
import { createNamespace } from "@connorbraydotnet/infrastructure/utils";
import { Chart } from "@pulumi/kubernetes/helm/v4/index.js";
import { ComponentResource, type ResourceOptions } from "@pulumi/pulumi";

const __name__ = "cnpg-operator";
const __namespace__ = "cnpg-system";

export interface PostgresqlOperatorProps {
	options?: ResourceOptions;
}

export interface PostgresqlOperatorResult {
	chart: Chart;
	namespace: Namespace;
	resource: Resource;
}

export const PostgresqlOperator = ({
	options: resourceOptions,
}: PostgresqlOperatorProps): PostgresqlOperatorResult => {
	const root = new ComponentResource(
		"connor-bray:infrastructure:cluster:resources:database:postgresql:Operator",
		__name__,
		{},
		resourceOptions,
	);
	const options = { parent: root };
	const namespace = createNamespace(__namespace__, {}, options);

	const chart = new Chart(
		__name__,
		{
			name: __name__,
			namespace: __namespace__,
			chart: "cloudnative-pg",
			version: "0.29.2",
			repositoryOpts: {
				repo: "https://cloudnative-pg.github.io/charts",
			},
			values: { monitoring: { podMonitorEnabled: false } },
		},
		{ dependsOn: [namespace], ...options },
	);

	return {
		chart,
		namespace,
		resource: root,
	};
};
