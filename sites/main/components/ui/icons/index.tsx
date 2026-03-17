export const fullscreen = () => (
	<svg
		stroke="currentColor"
		fill="currentColor"
		strokeWidth="0"
		viewBox="0 0 24 24"
		height="1em"
		width="1em"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>Enter Fullscreen</title>
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
	</svg>
);

export const exitFullscreen = () => (
	<svg
		stroke="currentColor"
		fill="currentColor"
		strokeWidth="0"
		viewBox="0 0 24 24"
		height="1em"
		width="1em"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>Exit Fullscreen</title>
		<path fill="none" d="M0 0h24v24H0z" />
		<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
	</svg>
);

export const HomeIcon = () => (
	<svg
		stroke="currentColor"
		fill="none"
		strokeWidth="2"
		viewBox="0 0 24 24"
		strokeLinecap="round"
		strokeLinejoin="round"
		height="1em"
		width="1em"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>Home</title>
		<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
		<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
	</svg>
);

export {
	FaBars as Menu,
	FaGithub as Github,
	FaLinkedin as Linkedin,
	FaRegFolder as Folder,
} from "react-icons/fa";
export { GoGear as Gear, GoMail as Mail, GoMoon as Moon, GoSun as Sun } from "react-icons/go";
// export { GoGear as Gear, GoMail as Mail, GoMoon as Moon, GoSun as Sun } from "react-icons/go";
export { LuHouse as Home } from "react-icons/lu";
export {
	MdFullscreen as Fullscreen,
	MdFullscreenExit as ExitFullscreen,
	MdOutlinePhotoCamera as Camera,
} from "react-icons/md";

export { RxChevronRight as Chevron } from "react-icons/rx";
export { TbSitemap as Sitemap } from "react-icons/tb";
export { VscAccount as About } from "react-icons/vsc";
