import { LinkButton } from "components/ui/button";
import style from "./gallery.module.scss";

export default function Gallery() {
	return (
		<div className={style.gallery}>
			<h1 className={style.title}>Gallery</h1>
			<p className={style.description}>Work in progress</p>
			<br />
			<LinkButton to="/" color="primary" variant="outline" className={style.homeButton}>
				Return home
			</LinkButton>
		</div>
	);
}
