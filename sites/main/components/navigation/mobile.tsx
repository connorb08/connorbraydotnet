import { Button, LinkButton } from "components/ui/new-button";
import { useState } from "react";
import { Dialog, DialogTrigger, OverlayArrow, Popover, Separator } from "react-aria-components";
import { useLocation } from "react-router";
import { ToggleThemeButton } from "#components/toolbar";
import { Menu as MenuIcon } from "../icons";
import style from "./mobile.module.scss";
import { routes } from "./pages";

export default function MobileNavigation() {
	const [navigationOpen, setNavigationOpen] = useState(false);
	const location = useLocation();

	return (
		<div className={style.MobileNavigation}>
			<DialogTrigger>
				<Button
					aria-label="Menu"
					className={style.Trigger}
					variant="normal"
					color="primary"
					icon={<MenuIcon />}
					size="medium"
					onClick={() => setNavigationOpen(true)}
				/>
				<Popover className={style.Popover} isOpen={navigationOpen} onOpenChange={setNavigationOpen}>
					<OverlayArrow className={style.Popover__Arrow} data-placement="top">
						<svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
							<path d="M0 0 L6 6 L12 0" />
						</svg>
					</OverlayArrow>
					<Dialog className={style.Dialog}>
						{routes.map((route) => (
							<LinkButton
								key={route.id}
								to={route.href}
								icon={route.icon}
								viewTransition={location.pathname !== route.href}
								prefetch="viewport"
								variant="ghost"
								color="primary"
								onClick={() => setNavigationOpen(false)}
							/>
						))}
						<Separator className={style.Separator} />
						<ToggleThemeButton />
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	);
}
