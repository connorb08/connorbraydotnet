import type { Cradle } from "./container";
import { User } from "@pulumi/authentik";
import { ComponentResource, type Unwrap } from "@pulumi/pulumi";
import { asFunction } from "awilix";

/**
 * Users
 */
const userList: UserList[] = [
	[
		{
			username: "connor.bray",
			email: "connor@connorbray.net",
			name: "Connor",
		},
	],
	[
		{
			username: "ryan.bray",
			name: "Ryan",
		},
	],
];

/**
 * Creates users based on the predefined user list.
 */

export const users = asFunction(({ root: parent, provider }: Cradle) => {
	const root = new ComponentResource(
		"connor-bray:infrastructure:cluster:apps:authentik:Users",
		"users",
		{},
		{ provider, parent },
	);

	const createdUsers: User[] = [];
	for (const user of userList) {
		createdUsers.push(
			new User(user[0].username, user[0], {
				...user[1],
				provider,
				parent: root,
			}),
		);
	}
	return createdUsers;
}).singleton();

/**
 * Types
 */
type DropFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type UserList = DropFirst<Unwrap<ConstructorParameters<typeof User>>>;
