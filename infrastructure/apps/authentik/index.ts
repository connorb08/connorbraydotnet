import { container } from "./src/container";

export const users = container.cradle.users.map((user) => ({
	id: user.userId,
	username: user.username,
}));
