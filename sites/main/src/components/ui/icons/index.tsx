import type { IconType } from "react-icons/lib";
import { LuHouse } from "react-icons/lu";
import { RxChevronRight } from "react-icons/rx";
import { VscAccount } from "react-icons/vsc";

type IconName = "home" | "about" | "chevron";

const iconObject: Record<IconName, IconType> = {
	home: LuHouse,
	about: VscAccount,
	chevron: RxChevronRight,
};

type IconGetter = (iconName: IconName, className?: string) => React.ReactNode;

const icons: IconGetter = (iconName, className) => {
	const Icon = iconObject[iconName];
	return <Icon className={className} />;
};

export { icons };
export type { IconName };
