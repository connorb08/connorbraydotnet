import type { PropsWithChildren } from "react";
import { FullscreenContext } from "#context/fullscreen";
import { useCallback, useMemo, useState } from "react";
import { useFetcher } from "react-router";

export const FullscreenProvider = ({
	fullscreen,
	children,
}: PropsWithChildren<{ fullscreen: boolean }>) => {
	const { submit } = useFetcher();
	const [isFullscreen, setFullscreen] = useState(fullscreen);

	const toggleFullscreen = useCallback(() => {
		const nextFullscreen = !isFullscreen;
		submit(
			{ fullscreen: String(nextFullscreen) },
			{ method: "post", action: "/_session" },
		);
		setFullscreen(nextFullscreen);
	}, [isFullscreen, submit]);

	const value = useMemo(
		() => ({ fullscreen: isFullscreen, toggleFullscreen }),
		[isFullscreen, toggleFullscreen],
	);

	return (
		<FullscreenContext.Provider value={value}>{children}</FullscreenContext.Provider>
	);
};
