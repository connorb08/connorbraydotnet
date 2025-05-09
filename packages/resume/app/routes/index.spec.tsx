import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, RouterProvider, useLoaderData } from "react-router";
import Index, { type loader } from "./index";

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
					const returnValue: ReturnType<typeof loader> = {
						name: "Connor Bray",
						about: {
							phoneNumber: "",
							emailAddress: "",
							location: "",
							languages: [],
							technologies: [],
						},
						education: [],
						career: [],
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
		// render(<RouterProvider router={{ routes: Stub }} />)
		render(<Stub initialEntries={["/"]} />);

		// Assert
		expect(await screen.findByText("Connor Bray")).toBeInTheDocument();
		// await waitFor(() => screen.findByText("Connor Bray"));
	});
});
