import style from "./style.module.scss";

function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className={style.footer}>
			<div className={style.footer__content}>
				<div className={style.copyright}>&copy; {currentYear} Connor Bray</div>
				<div className={style.socialLinks}>
					<a
						href="https://github.com/connorb08"
						// target="_blank"
						// rel="noopener noreferrer"
						className={style.socialLink}
					>
						GitHub
					</a>
					<a
						href="https://linkedin.com/in/connor-bray"
						// target="_blank"
						// rel="noopener noreferrer"
						className={style.socialLink}
					>
						LinkedIn
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
