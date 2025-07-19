interface Logger {
	log(...args: unknown[]): void;
}

type decorator = (
	target: Logger,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) => void;

export type { Logger, decorator };
