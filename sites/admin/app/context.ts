import { createContext } from "react-router";

export interface AppContext {
	cloudflare: {
		env: Env;
		ctx: ExecutionContext;
	};
}

export const cfContext = createContext<AppContext["cloudflare"]>();
