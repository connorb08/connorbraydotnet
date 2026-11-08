import type { PropsWithChildren } from "react";
import type { SubmitFunction } from "react-router";
import { ThemeContext } from "../context/theme";
import { ThemeProvider } from "./theme";
import { act, cleanup, renderHook } from "@testing-library/react";
import { createElement, useContext } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { submit } = vi.hoisted(() => ({ submit: vi.fn<SubmitFunction>() }));

vi.mock("react-router", () => ({
	useFetcher: () => ({ submit }),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

function wrapper({ children }: PropsWithChildren) {
	return createElement(ThemeProvider, { theme: "light" }, children);
}

describe("ThemeProvider", () => {
	it("preserves context identity across unrelated renders", () => {
		const { result, rerender } = renderHook(() => useContext(ThemeContext), { wrapper });
		const initialValue = result.current;

		rerender();

		expect(result.current).toBe(initialValue);
	});

	it("updates and persists the theme through setTheme and toggleTheme", () => {
		const { result } = renderHook(() => useContext(ThemeContext), { wrapper });
		const initialSetTheme = result.current.setTheme;

		act(() => result.current.setTheme("dark"));

		expect(result.current.theme).toBe("dark");
		expect(result.current.setTheme).toBe(initialSetTheme);
		expect(submit).toHaveBeenLastCalledWith(
			{ theme: "dark" },
			{ method: "post", action: "/_session" },
		);

		act(() => result.current.toggleTheme());

		expect(result.current.theme).toBe("light");
		expect(submit).toHaveBeenLastCalledWith(
			{ theme: "light" },
			{ method: "post", action: "/_session" },
		);
	});
});
