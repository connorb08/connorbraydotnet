import { usePromise } from "./index";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

function createDeferred<T>() {
	let resolve!: (value: T | PromiseLike<T>) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

describe("usePromise", () => {
	it("returns direct values without an effect-driven render", () => {
		let renders = 0;
		const { result, rerender } = renderHook(
			({ value }) => {
				renders += 1;
				return usePromise(value, "default");
			},
			{ initialProps: { value: "cached" } },
		);

		expect(result.current).toEqual({
			data: "cached",
			error: undefined,
			loading: false,
		});
		expect(renders).toBe(1);

		rerender({ value: "updated" });

		expect(result.current.data).toBe("updated");
		expect(renders).toBe(2);
	});

	it("returns the default while loading, then the resolved data", async () => {
		const { promise, resolve } = createDeferred<string>();
		const { result } = renderHook(() => usePromise(promise, "default"));

		expect(result.current).toEqual({
			data: "default",
			error: undefined,
			loading: true,
		});

		await act(async () => {
			resolve("loaded");
			await promise;
		});

		expect(result.current).toEqual({
			data: "loaded",
			error: undefined,
			loading: false,
		});
	});

	it("returns the default and error when the promise rejects", async () => {
		const { promise, reject } = createDeferred<string>();
		const error = new Error("Failed to load");
		const { result } = renderHook(() => usePromise(promise, "default"));

		await act(async () => {
			reject(error);
			await promise.catch(() => undefined);
		});

		expect(result.current).toEqual({
			data: "default",
			error,
			loading: false,
		});
	});

	it("ignores results from a replaced promise", async () => {
		const first = createDeferred<string>();
		const second = createDeferred<string>();
		const { result, rerender } = renderHook(({ value }) => usePromise(value, "default"), {
			initialProps: { value: first.promise },
		});

		rerender({ value: second.promise });

		await act(async () => {
			second.resolve("new");
			await second.promise;
		});
		await act(async () => {
			first.resolve("old");
			await first.promise;
		});

		expect(result.current.data).toBe("new");
	});

	it("returns cached data immediately when replacing a promise", async () => {
		const { promise, resolve } = createDeferred<string>();
		const initialProps: { value: Promise<string> | string } = { value: promise };
		const { result, rerender } = renderHook(
			({ value }: { value: Promise<string> | string }) => usePromise(value, "default"),
			{ initialProps },
		);

		rerender({ value: "cached" });
		expect(result.current).toEqual({
			data: "cached",
			error: undefined,
			loading: false,
		});

		await act(async () => {
			resolve("outdated");
			await promise;
		});

		expect(result.current.data).toBe("cached");
	});
});
