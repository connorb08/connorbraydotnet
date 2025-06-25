import { NavLink } from "react-router";

export default function NotFound() {
	return (
		<div
			style={{
				height: "65vh",
				maxWidth: "100vw",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				textAlign: "center",
			}}
		>
			<h1>404: Not Found</h1>
			<p>Looking for something?</p>
			<NavLink to="/" viewTransition>
				{"<- Go back to home"}
			</NavLink>
		</div>
	);
}
