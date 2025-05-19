import { useState } from "react";
import { Outlet } from "react-router";
import Terminal from "#components/Terminal";
import Navbar from "../Navbar";
import Header from "./header";
import style from "./style.module.scss";

function Layout() {
	const [isNavOpen, setIsNavOpen] = useState(false);

	return (
		<>
			<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
				<div className={style.layout}>
					<Navbar isOpen={isNavOpen} onToggle={setIsNavOpen} />
					<div
						className={`${style.layout__content} ${isNavOpen ? style["layout__content--shifted"] : style["layout__content--normal"]}`}
					>
						<Header />
						<main className={style.main}>
							<Outlet />
						</main>
					</div>
				</div>
				<Terminal />
			</div>
		</>
	);
}

export default Layout;
