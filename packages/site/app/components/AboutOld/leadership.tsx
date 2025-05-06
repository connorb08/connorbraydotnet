import type { LeadershipRoleProps } from './types';

const Leadership = ({ roles }: { roles: LeadershipRoleProps[] }) => {
	const bottomBorder = <div className="border-b border-gray-8 mb-5" />;
	const len = roles.length;

	return (
		<>
			<div className="p-7 block-section">
				<h2 className="block-title">Leadership Positions</h2>

				{roles.map((role, index) => {
					return (
						<div key={index}>
							<Role {...role} />
							{index !== len - 1 ? bottomBorder : null}
						</div>
					);
				})}
			</div>
			{/* <div className="p-7 block-section">
				<h2 className="block-title">Awards</h2>

				{roles.map((role, index) => {
					return (
						<div key={index * 10}>
							<Award />
							{index !== len - 1 ? bottomBorder : null}
						</div>
					);
				})}
			</div> */}
		</>
	);
};

const Role = (props: LeadershipRoleProps) => {
	return (
		<div className="mb-5 item-section">
			<div className="company-logo bg-blue-500">
				<span className="text-2xl">S</span>
			</div>

			<div className="w-full space-y-5">
				<div className="item-header">
					<div className="space-y-1.5">
						<div className="font-medium">{props.name}</div>
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
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>{props.position}</span>
							</div>
						</div>
					</div>
				</div>
				<div style={{ marginBottom: '0.875rem' }}>
					<p className="text-gray-600">{''}</p>
				</div>
			</div>
		</div>
	);
};

const Award = () => {
	return (
		<div className="mb-5 item-section">
			<div className="w-full space-y-5">
				<div className="item-header">
					<div className="space-y-1.5">
						<div className="font-medium">Award Name</div>
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
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>{'award info'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Leadership;
