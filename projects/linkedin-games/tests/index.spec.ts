import { expect, test } from "bun:test";
import { Cell } from "../src/queens/variables/cell";

test("Set intersection of objects returns common objects", () => {
	const commonSet = new Set(
		Array.from({ length: 10 }, (_, i) => new Cell(i ** 2)),
	);
	const set1 = new Set(Array.from({ length: 10 }, (_, i) => new Cell(i))).union(
		commonSet,
	);
	const set2 = new Set(Array.from({ length: 10 }, (_, i) => new Cell(i))).union(
		commonSet,
	);

	const intersection = set1.intersection(set2);

	expect(
		intersection.isSubsetOf(commonSet) && intersection.isSupersetOf(commonSet),
	).toBe(true);
	expect(intersection.size).toBe(10);
});

test("Set intersection of objects returns empty set", () => {
	const set1 = new Set(Array.from({ length: 10 }, (_, i) => new Cell(i)));
	const set2 = new Set(Array.from({ length: 10 }, (_, i) => new Cell(i)));

	const intersection = set1.intersection(set2);

	expect(intersection.size).toBe(0);
});
