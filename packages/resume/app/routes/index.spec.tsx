import { render, screen } from "@testing-library/react";
import { createRoutesStub, useLoaderData } from "react-router";
import { ValidateResume } from "shared";
import { ValidResume } from "shared/test-data";
import Index, { loader } from "./index";

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
					return ValidResume();
				},
				HydrateFallback: () => {
					return <div>Loading...</div>;
				},
			},
		]);

		// Act
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(await screen.findByText("Ronald McDonald")).toBeInTheDocument();
		expect(await screen.findByText("Joke of a School")).toBeInTheDocument();
		expect(await screen.findByText("Burger Clown")).toBeInTheDocument();
		expect(
			await screen.findByText("Scare children with my clown costume"),
		).toBeInTheDocument();
		expect(
			await screen.findByText("Chicken Nuggets", {
				exact: false,
			}),
		).toBeInTheDocument();
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
					return ValidResume;
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
			...ValidResume(),
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
			...ValidResume(),
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
		const { ok } = await ValidateResume(data);

		// Assert
		assert.isTrue(ok);
	});
});
