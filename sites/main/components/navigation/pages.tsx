import type { ReactNode } from "react";
import { About, Camera, Folder, HomeIcon, Mail } from "#components/ui/icons/index";

export const routes = [
	{
		id: "home",
		title: "Home",
		icon: <HomeIcon />,
		href: "/",
	},
	{
		id: "about",
		title: "About",
		icon: <About />,
		href: "/about",
	},
	{
		id: "projects",
		title: "Projects",
		icon: <Folder />,
		href: "/projects",
	},
	{
		id: "gallery",
		title: "Gallery",
		icon: <Camera />,
		href: "/gallery",
	},
	{
		id: "contact",
		title: "Contact",
		icon: <Mail />,
		href: "/contact",
	},
] satisfies {
	id: string;
	title: string;
	icon: ReactNode;
	href: string;
}[];
