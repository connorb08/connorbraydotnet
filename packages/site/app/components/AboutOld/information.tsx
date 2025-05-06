import { memo } from "react";
import style from "./style.module.scss";

const Information = memo(() => {
	return (
		<div className={style.information}>
			<h2 className={style.information__title}>Information</h2>
			<div className={style.information__content}>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>Location</div>
					<div className={style.information__content__item__value}>
						Portland, ME
					</div>
				</div>
				<div className={style.information__content__item}>
					<div className={style.information__content__item__key}>
						Experience
					</div>
					<div className={style.information__content__item__value}>
						4+ years
					</div>
				</div>
			</div>
		</div>
	);
});

export default Information;
