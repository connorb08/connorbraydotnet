import { GoGear } from "react-icons/go";
import type { IconType } from "react-icons/lib";
import { LuHouse } from "react-icons/lu";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

import { RxChevronRight } from "react-icons/rx";
import { VscAccount } from "react-icons/vsc";

type IconName = "home" | "about" | "chevron" | "gear" | "fullscreen" | "exitFullscreen";

const iconObject: Record<IconName, IconType> = {
	home: LuHouse,
	about: VscAccount,
	chevron: RxChevronRight,
	gear: GoGear,
	fullscreen: MdFullscreen,
	exitFullscreen: MdFullscreenExit,
};

type IconGetter = (iconName: IconName, className?: string) => React.ReactNode;

const icons: IconGetter = (iconName, className) => {
	const Icon = iconObject[iconName];
	return <Icon className={className} />;
};

export { icons };
export type { IconName };
