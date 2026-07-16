const sizes = ["sm", "md", "lg", "xl", "default"] as const;
type Size = (typeof sizes)[number];

const sizeMap: Record<Size, number> = {
	sm: 200,
	md: 400,
	lg: 800,
	xl: 1200,
	default: 600,
};

const getWidth = (size: Size) => sizeMap[size];

export { getWidth, type Size, sizes };
