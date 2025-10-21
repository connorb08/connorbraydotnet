import { Button, LinkButton } from "components/ui/new-button";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { useLocation } from "react-router";
import { Menu as MenuIcon } from "../icons";
import style from "./mobile.module.scss";
import { routes } from "./pages";

export default function MobileNavigation() {
	const location = useLocation();

	return (
		<div className={style.MobileNavigation}>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className={style.Button}
					variant="normal"
					color="primary"
					icon={<MenuIcon />}
					size="medium"
				/>
				<Popover>
					<Menu>
						{routes.map((route) => (
							<MenuItem key={route.id}>
								<LinkButton
									// key={route.id}
									to={route.href}
									icon={route.icon}
									viewTransition={location.pathname !== route.href}
									prefetch="viewport"
									variant="ghost"
									color="primary"
								/>
							</MenuItem>
						))}
						{/* <MenuItem onAction={() => alert("open")}>Open</MenuItem>
					<MenuItem onAction={() => alert("rename")}>Rename…</MenuItem>
					<MenuItem onAction={() => alert("duplicate")}>Duplicate</MenuItem>
					<MenuItem onAction={() => alert("share")}>Share…</MenuItem>
					<MenuItem onAction={() => alert("delete")}>Delete…</MenuItem> */}
					</Menu>
				</Popover>
			</MenuTrigger>
		</div>
	);
}
