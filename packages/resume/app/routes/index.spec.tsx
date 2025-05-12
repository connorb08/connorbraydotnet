import { render, screen } from "@testing-library/react";
import { createRoutesStub, useLoaderData } from "react-router";
import Index, { loader } from "./index";

const mockLoaderData = {
	name: "Connor Bray",
	about: {
		phoneNumber: "",
		emailAddress: "",
		location: "",
		languages: [],
		technologies: [],
	},
	education: [
		{
			school: "University of Burgers",
			degree: "Bachelor of Science in Burger Meat",
			location: "Salt Lake City, UT",
			startDate: "August 2018",
			endDate: "May 2022",
			about: ["I love burger meat"],
		},
	],
	career: [
		{
			company: "Burger King",
			title: "Burger Flipper",
			location: "Salt Lake City, UT",
			startDate: "June 2022",
			endDate: "Present",
			about: ["About bullet"],
		},
	],
	projects: [],
};

describe("Index route", () => {
	it("should render the resume", async () => {
		// Setup
		const Stub = createRoutesStub([
			{
				path: "/",
				index: true,
				Component: () => {
					const loaderData = useLoaderData<typeof loader>();
					return <Index loaderData={loaderData} />;
				},
				loader: () => {
					return mockLoaderData;
				},
				HydrateFallback: () => {
					return <div>Loading...</div>;
				},
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(await screen.findByText("Connor Bray")).toBeInTheDocument();
		expect(
			await screen.findByText("University of Burgers"),
		).toBeInTheDocument();

		expect(await screen.findByText("Burger Flipper")).toBeInTheDocument();
		expect(await screen.findByText("I love burger meat")).toBeInTheDocument();
		expect(await screen.findByTestId("education-about")).toBeInTheDocument();
	});

	it("should not render empty education about", async () => {
		// Setup
		const Stub = createRoutesStub([
			{
				path: "/",
				index: true,
				Component: () => {
					const loaderData = useLoaderData<typeof loader>();
					return <Index loaderData={loaderData} />;
				},
				loader: () => {
					const returnValue: ReturnType<typeof loader> = {
						name: "Connor Bray",
						about: {
							phoneNumber: "",
							emailAddress: "",
							location: "",
							languages: [],
							technologies: [],
						},
						education: [
							{
								school: "University of Burgers",
								degree: "Bachelor of Science in Burger Meat",
								location: "Salt Lake City, UT",
								startDate: "August 2018",
								endDate: "May 2022",
								about: [],
							},
						],
						career: [
							{
								company: "Burger King",
								title: "Burger Flipper",
								location: "Salt Lake City, UT",
								startDate: "June 2022",
								endDate: "Present",
								about: ["About bullet"],
							},
						],
						projects: [],
					};
					return returnValue;
				},
				HydrateFallback: () => {
					return <div>Loading...</div>;
				},
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(screen.queryByTestId("education-about")).not.toBeInTheDocument();
	});

	// Add this new test to improve coverage
	it("should conditionally render education about section based on content", () => {
		// With content
		const withContent = {
			...mockLoaderData,
			education: [
				{
					school: "Test School",
					degree: "Test Degree",
					location: "Test Location",
					startDate: "2020",
					endDate: "2024",
					about: ["Test bullet"],
				},
			],
		};

		const { getByTestId, rerender, queryByTestId } = render(
			<Index loaderData={withContent} />,
		);
		expect(getByTestId("education-about")).toBeInTheDocument();

		// Without content
		const withoutContent = {
			...mockLoaderData,
			education: [
				{
					school: "Test School",
					degree: "Test Degree",
					location: "Test Location",
					startDate: "2020",
					endDate: "2024",
					about: [],
				},
			],
		};

		rerender(<Index loaderData={withoutContent} />);
		expect(queryByTestId("education-about")).not.toBeInTheDocument();
	});

	it("should return loader data", async () => {
		// Act
		const data = loader({});

		// Assert
		assert.isObject(data);
		assert.isString(data.name);
		assert.isArray(data.education);
		assert.isArray(data.career);
		assert.isArray(data.projects);
		assert.isObject(data.about);
		assert.isString(data.about.phoneNumber);
		assert.isString(data.about.emailAddress);
		assert.isString(data.about.location);
	});
});
