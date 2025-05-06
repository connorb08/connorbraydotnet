export const DeepCopy = <T>(obj: object | T) =>
	JSON.parse(JSON.stringify(obj)) as T;
