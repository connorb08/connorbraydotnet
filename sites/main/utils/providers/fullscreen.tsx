import { type PropsWithChildren, useState } from "react";
import { useFetcher } from "react-router";
import { FullscreenContext } from "#context/fullscreen";

export const FullscreenProvider = ({
	fullscreen,
	children,
}: PropsWithChildren<{ fullscreen: boolean }>) => {
	const fetcher = useFetcher();
	const [isFullscreen, setFullscreen] = useState(fullscreen);

	const toggleFullscreen = () => {
		const nextFullscreen = !isFullscreen;
		fetcher.submit(
			{ fullscreen: String(nextFullscreen) },
			{ method: "post", action: "/_session" },
		);
		setFullscreen(nextFullscreen);
	};

	return (
		<FullscreenContext.Provider
			value={{
				fullscreen: isFullscreen,
				toggleFullscreen,
			}}
		>
			{children}
		</FullscreenContext.Provider>
	);
};
