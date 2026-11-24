import type { UserConfig } from "vite-plus";

type OverrideConfig = {
	fmt: NonNullable<NonNullable<UserConfig["fmt"]>["overrides"]>[number];
	lint: NonNullable<NonNullable<UserConfig["lint"]>["overrides"]>[number];
};

export const infrastructureOverride: OverrideConfig = {
	lint: {
		files: ["infrastructure/**"],
		rules: {
			"no-new": "allow",
			"max-lines-per-function": "off",
		},
	},
	fmt: {
		files: ["infrastructure/**"],
		options: {},
	},
};
