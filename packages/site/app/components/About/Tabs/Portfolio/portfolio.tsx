import type { ResumeProject } from "shared";

const Portfolio = ({
	projects,
}: {
	projects?: ResumeProject[] | undefined;
}) => {
	const bottomBorder = <div className="border-b border-gray-8 mb-5" />;

	return (
		<>
			<div className="p-7 block-section">
				<h2 className="block-title">Projects</h2>

				{projects?.map((project, index, arr) => {
					return (
						<div key={index}>
							<Project {...project} />
							{index !== arr.length - 1 ? bottomBorder : ""}
						</div>
					);
				})}
			</div>
		</>
	);
};

const Project = (props: ResumeProject) => {
	return (
		<div className="mb-5 item-section">
			{/* <div className="company-logo bg-blue-500">
				<span className="text-2xl">S</span>
			</div> */}

			<div className="w-full space-y-2">
				<div className="item-header">
					<div className="space-y-1.5">
						<div className="font-medium">{props.name}</div>
						{/* <div className="flex space-x-5">
							<div className="item-header-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
									/>
								</svg>
								<span>Web Application</span>
							</div>
						</div> */}
					</div>
				</div>
				<div style={{ marginBottom: "0.875rem" }}>
					<p className="text-gray-600">{props.description}</p>
				</div>
				<span>
					{/* <Link to={`/project/${props._id}`}>
						<button
							className="flex items-center space-x-3 px-3.5 py-1.5 rounded-lg group border border-third bg-white text-third text-sm font-medium transition duration-200 hover:border-third-10 hover:text-white hover:bg-third"
							type="button"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
							<span>More Info</span>
						</button>
					</Link> */}
				</span>
			</div>
		</div>
	);
};

export default Portfolio;
