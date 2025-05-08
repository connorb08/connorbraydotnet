import { render, screen } from "@testing-library/react";
import { isRouteErrorResponse } from "react-router";
import { default as App, ErrorBoundary, Layout } from "./root";

// Mock React Router components
vi.mock("react-router", () => ({
	Outlet: () => <div data-testid="outlet">Outlet Content</div>,
	isRouteErrorResponse: vi.fn(),
	Links: () => <link id="link-mock" />,
	Scripts: () => <script id="script-mock" />,
}));

describe("App Component", () => {
	it("renders the Outlet component", () => {
		render(<App />);
		expect(screen.getByTestId("outlet")).toBeInTheDocument();
	});
});

describe("Layout Component", () => {
	it("renders the children and html structure correctly", () => {
		render(
			<Layout>
				<div data-testid="child-content">Test Child Content</div>
			</Layout>,
			{
				container: document,
			},
		);

		// Check that children are rendered
		expect(screen.getByTestId("child-content")).toBeInTheDocument();
		expect(document.getElementById("link-mock")).toBeInTheDocument();
		expect(document.getElementById("script-mock")).toBeInTheDocument();
	});
});

describe("ErrorBoundary Component", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("renders route error response correctly", () => {
		const routeError = {
			status: 404,
			statusText: "Not Found",
			data: "Page not found",
		};

		vi.mocked(isRouteErrorResponse).mockReturnValue(true);

		render(<ErrorBoundary error={routeError} />);

		expect(screen.getByText("404: Not Found")).toBeInTheDocument();
		expect(screen.getByText("Page not found")).toBeInTheDocument();
	});

	it("renders standard error correctly", () => {
		vi.mocked(isRouteErrorResponse).mockReturnValue(false);

		const error = new Error("Test error");
		render(<ErrorBoundary error={error} />);

		expect(screen.getByText("500: Internal Server Error")).toBeInTheDocument();
	});

	it("renders unknown error correctly", () => {
		vi.mocked(isRouteErrorResponse).mockReturnValue(false);

		render(<ErrorBoundary error={{}} />);

		expect(screen.getByText("500: Internal Server Error")).toBeInTheDocument();
		expect(screen.getByText("Unknown Error")).toBeInTheDocument();
	});
});
