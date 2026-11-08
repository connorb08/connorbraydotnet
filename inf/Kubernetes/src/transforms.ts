export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireRecord(value: unknown, message: string): Record<string, unknown> {
	if (!isRecord(value)) {
		throw new Error(message);
	}
	return value;
}

export function requireArray(value: unknown, message: string): unknown[] {
	if (!Array.isArray(value)) {
		throw new Error(message);
	}
	return value;
}
