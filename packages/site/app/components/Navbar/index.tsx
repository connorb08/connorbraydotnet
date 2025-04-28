import { Link } from "react-router";
import style from "./style.module.scss";

interface NavbarProps {
	isOpen: boolean;
	onToggle: (isOpen: boolean) => void;
}

export default function ({ isOpen, onToggle }: NavbarProps) {
	return (
		<nav className={`${style.navbar} ${isOpen ? style.open : ""}`}>
			<button
				type="button"
				className={style.navbar__button}
				onClick={() => onToggle(!isOpen)}
				aria-label={isOpen ? "Close navigation" : "Open navigation"}
			>
				{isOpen ? "<" : ">"}
			</button>
			<div className={style.navbar__content}>
				<Link to="/" className={style.navbar__item}>
					Home
				</Link>
				<Link to="/about" className={style.navbar__item}>
					About
				</Link>
				<Link to="/projects" className={style.navbar__item}>
					Projects
				</Link>
				<Link to="/photos" className={style.navbar__item}>
					Photos
				</Link>
			</div>
		</nav>
	);
}
