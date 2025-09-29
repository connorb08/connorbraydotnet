import { FaBriefcase } from "react-icons/fa";
import style from "./leadership.module.scss";

export interface LeadershipRole {
	id: number;
	name: string;
	position: string;
}

const Leadership = ({ roles }: { roles: LeadershipRole[] }) => {
	const bottomBorder = <div className={style.bottomBorder} />;
	const len = roles.length;

	return (
		<div className={style.section}>
			<h2 className={style.section__title}>Leadership Positions</h2>

			{roles.map((role, index) => {
				return (
					<div key={role.id}>
						<Role {...role} />
						{index !== len - 1 ? bottomBorder : null}
					</div>
				);
			})}
		</div>
	);
};

const Role = (role: LeadershipRole) => {
	return (
		<div className={style.listItem}>
			<div className={style.listItem__logo}>
				<span>S</span>
			</div>

			<div className={style.listItem__content}>
				<h3 className={style.listItem__content__heading}>{role.name}</h3>
				<div className={style.listItem__content__subheading}>
					<div className={style.listItem__content__subheading__company}>
						<FaBriefcase />
						<span>{role.position}</span>
					</div>
				</div>
				<div className={style.listItem__content__description}>
					{/* Description content can be added here if needed */}
				</div>
			</div>
		</div>
	);
};

export default Leadership;
