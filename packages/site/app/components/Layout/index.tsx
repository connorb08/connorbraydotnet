import { Outlet } from "react-router";
import Header from "./header";
import style from "./style.module.scss";
import Terminal from "./terminal";

function Layout() {
	return (
		<div className={style.layout}>
			<Header />
			<main className={style.main}>
				<Outlet />
			</main>
			<Terminal />
		</div>
	);
}

export default Layout;
