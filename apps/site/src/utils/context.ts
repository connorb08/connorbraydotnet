import { createContext } from "react";

type ProjectContext = {
	rootRef: React.RefObject<HTMLHtmlElement | null>;
};

export const ProjectContext = createContext<ProjectContext>({
	rootRef: { current: null },
});
