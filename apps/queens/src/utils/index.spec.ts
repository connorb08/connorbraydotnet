import { combinations } from ".";

function hasValue(set1: Set<Set<number>>, set2: Set<number>) {
	return Array.from(set1).some((setInSet1) => {
		return (
			setInSet1.size === set2.size &&
			Array.from(setInSet1).every((value) => set2.has(value))
		);
	});
}

describe("Combinations", () => {
	it("4 pick 2", () => {
		let nCombinations = 0;

		const set = new Set([1, 2, 3, 4]);

		const expectedCombinations = new Set([
			new Set([1, 2]),
			new Set([1, 3]),
			new Set([1, 4]),
			new Set([2, 3]),
			new Set([2, 4]),
			new Set([3, 4]),
		]);

		const generator = combinations(set, 2);

		for (const combination of generator) {
			expect(hasValue(expectedCombinations, combination)).toBe(true);
			nCombinations++;
		}

		expect(generator.next().done).toBe(true);
		expect(nCombinations).toBe(expectedCombinations.size);
	});

	it("5 pick 3", () => {
		let nCombinations = 0;

		const set = new Set([1, 2, 3, 4, 5]);

		const expectedCombinations = new Set([
			new Set([1, 2, 3]),
			new Set([1, 2, 4]),
			new Set([1, 2, 5]),
			new Set([1, 3, 4]),
			new Set([1, 3, 5]),
			new Set([1, 4, 5]),
			new Set([2, 3, 4]),
			new Set([2, 3, 5]),
			new Set([2, 4, 5]),
			new Set([3, 4, 5]),
		]);

		const generator = combinations(set, 3);

		for (const combination of generator) {
			expect(hasValue(expectedCombinations, combination)).toBe(true);
			nCombinations++;
		}

		expect(generator.next().done).toBe(true);
		expect(nCombinations).toBe(expectedCombinations.size);
	});
});
