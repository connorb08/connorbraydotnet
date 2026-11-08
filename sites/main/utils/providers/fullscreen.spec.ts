import type { PropsWithChildren } from "react";
import type { SubmitFunction } from "react-router";
import { FullscreenContext } from "../context/fullscreen";
import { FullscreenProvider } from "./fullscreen";
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
	return createElement(FullscreenProvider, { fullscreen: false }, children);
}

describe("FullscreenProvider", () => {
	it("preserves context identity across unrelated renders", () => {
		const { result, rerender } = renderHook(() => useContext(FullscreenContext), {
			wrapper,
		});
		const initialValue = result.current;

		rerender();

		expect(result.current).toBe(initialValue);
	});

	it("toggles and persists fullscreen in both directions", () => {
		const { result } = renderHook(() => useContext(FullscreenContext), { wrapper });

		act(() => result.current.toggleFullscreen());

		expect(result.current.fullscreen).toBe(true);
		expect(submit).toHaveBeenLastCalledWith(
			{ fullscreen: "true" },
			{ method: "post", action: "/_session" },
		);

		act(() => result.current.toggleFullscreen());

		expect(result.current.fullscreen).toBe(false);
		expect(submit).toHaveBeenLastCalledWith(
			{ fullscreen: "false" },
			{ method: "post", action: "/_session" },
		);
	});
});
