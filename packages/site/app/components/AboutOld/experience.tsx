import { memo } from "react";
import Education from "./education";

// import type { AboutProps, EducationProps, JobProps } from "./types";

interface ResumeProps {
	jobs: AboutProps["jobs"];
	education: EducationProps[];
	hidden: boolean;
}

const Resume = memo((props: ResumeProps) => {
	const bottomBorder = <div className="border-b border-gray-8 mb-5" />;
	const len = props.jobs.length;

	return (
		<>
			<div className="p-7 block-section">
				<h2 className="block-title">Education</h2>
				{props.education.map((data, index) => {
					return <Education {...data} key={index} />;
				})}
			</div>
			<div className="p-7 block-section">
				<h2 className="block-title">Experience</h2>

				{props.jobs.map((job, index) => {
					return (
						<div key={index}>
							<Job {...job} key={index} />
							{index !== len - 1 ? bottomBorder : ""}
						</div>
					);
				})}
			</div>
		</>
	);
});

const Job = memo((props: JobProps) => {
	return (
		<div className="mb-5 item-section">
			<div
				className="flex-shrink-0 w-12 h-12 rounded-xl bg-cover"
				style={{
					backgroundPosition: "center",
					backgroundSize: "cover",
					backgroundImage: `url('https://connorbray.net/cdn-cgi/image/format=auto/${props.icon_url}')`,
				}}
			/>

			<div className="w-full space-y-5">
				<div className="item-header">
					<div className="space-y-1.5">
						<div className="font-medium">{props.position}</div>
						<div className="flex space-x-5">
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
										d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<span>{props.company}</span>
							</div>
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
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<span>{props.location}</span>
							</div>
						</div>
					</div>
					<div className="space-y-2 sm:text-right">
						<div className="job-item-badge">{}</div>
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
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span>
								{props.start_date} &ndash; {props.end_date}
							</span>
						</div>
					</div>
				</div>
				<p className="text-gray-600">{props.description}</p>
			</div>
		</div>
	);
});

export default Resume;
