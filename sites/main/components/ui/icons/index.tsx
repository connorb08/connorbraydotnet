import { GoGear } from "react-icons/go";
import type { IconType } from "react-icons/lib";

import { RxChevronRight } from "react-icons/rx";
import { VscAccount } from "react-icons/vsc";

const fullscreen = () => <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
const exitFullscreen = () => <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
const home = () => <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>

type IconName = "home" | "about" | "chevron" | "gear" | "fullscreen" | "exitFullscreen";

const iconObject: Record<IconName, IconType> = {
	home,
	about: VscAccount,
	chevron: RxChevronRight,
	gear: GoGear,
	fullscreen,
	exitFullscreen
};

type IconGetter = (iconName: IconName, className?: string) => React.ReactNode;

const icons: IconGetter = (iconName, className) => {
	const Icon = iconObject[iconName];
	return <Icon className={className} />;
};

export { icons };
export type { IconName };
