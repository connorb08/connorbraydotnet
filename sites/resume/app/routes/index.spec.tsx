import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs } from "react-router";
import { type Resume, ValidateResume, ValidResume } from "shared";
import { describe, expect } from "vitest";
import type { Route } from "../../.react-router/types/app/routes/+types";
import Index, { loader } from "./index";

describe("Index route", () => {
	it("should not render empty education about", async () => {
		// Setup
		const resume = {
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
		} satisfies Resume;

		// Act
		const props = {
			loaderData: resume,
		} as unknown as Route.ComponentProps;
		render(<Index {...props} />);

		// Assert
		expect(screen.queryByTestId("education-about")).not.toBeInTheDocument();
	});

	it("should return loader data", async () => {
		// Act
		const data = loader({} as LoaderFunctionArgs);
		const { ok } = ValidateResume(data);

		// Assert
		expect(ok).toBe(true);
	});
});

describe("Resume page", () => {
	it("should display basic info", async () => {
		// Setup
		const resume = ValidResume();

		// Act
		const props = {
			loaderData: resume,
		} as Route.ComponentProps;
		render(<Index {...props} />);

		// Assert

		// Check if the name is displayed correctly
		const nameElement = await screen.findByTestId("resume.name");
		const nameText = nameElement.textContent;
		expect(nameElement).toBeInTheDocument();
		expect(nameText).toBe(resume.name);

		// Check if the contact information is displayed correctly
		const contactElement = await screen.findByTestId("resume.contact");
		const contactText = contactElement.textContent;
		expect(contactElement).toBeInTheDocument();
		expect(contactText).toContain(resume.about.phoneNumber);
		expect(contactText).toContain(resume.about.emailAddress);
	});

	it("should display work experience", async () => {
		// Setup
		const resume = ValidResume();

		// Act
		const props = {
			loaderData: resume,
		} as Route.ComponentProps;
		render(<Index {...props} />);

		// Assert
		resume.career.forEach((careerItem, index) => {
			// Check if the company name is displayed correctly
			const companyElement = screen.getByTestId(`resume.career[${index}].company`);
			const titleElement = screen.getByTestId(`resume.career[${index}].title`);
			expect(companyElement).toBeInTheDocument();
			expect(companyElement.textContent).toBe(careerItem.company);
			expect(titleElement).toBeInTheDocument();
			expect(titleElement.textContent).toBe(careerItem.title);

			careerItem.about.forEach((bullet, bulletIndex) => {
				const bulletElement = screen.getByTestId(`resume.career[${index}].about[${bulletIndex}]`);
				expect(bulletElement).toBeInTheDocument();
				expect(bulletElement.textContent).toBe(bullet);
			});
		});
	});

	it("should display education", async () => {
		// Setup
		const resume = ValidResume();

		// Act
		const props = {
			loaderData: resume,
		} as Route.ComponentProps;
		render(<Index {...props} />);

		// Assert
		resume.education.forEach((educationItem, index) => {
			const schoolElement = screen.getByTestId(`resume.education[${index}].school`);
			const degreeElement = screen.getByTestId(`resume.education[${index}].degree`);
			expect(schoolElement).toBeInTheDocument();
			expect(degreeElement).toBeInTheDocument();
			expect(schoolElement.textContent).toBe(educationItem.school);
			expect(degreeElement.textContent).toBe(educationItem.degree);

			educationItem.about.forEach((bullet, bulletIndex) => {
				const bulletElement = screen.getByTestId(
					`resume.education[${index}].about[${bulletIndex}]`,
				);
				expect(bulletElement).toBeInTheDocument();
				expect(bulletElement.textContent).toBe(bullet);
			});
		});
	});

	it("should display projects", async () => {
		// Setup
		const resume = ValidResume();

		// Act
		const props = {
			loaderData: resume,
		} as Route.ComponentProps;
		render(<Index {...props} />);

		// Assert
		resume.projects.forEach((projectItem, index) => {
			const projectElement = screen.getByTestId(`resume.projects[${index}].name`);
			expect(projectElement).toBeInTheDocument();
			expect(projectElement.textContent).toBe(projectItem.name);

			const descriptionElement = screen.getByTestId(`resume.projects[${index}].description`);
			expect(descriptionElement).toBeInTheDocument();
			expect(descriptionElement.textContent).toBe(projectItem.description);

			projectItem.about.forEach((bullet, bulletIndex) => {
				const bulletElement = screen.getByTestId(`resume.projects[${index}].about[${bulletIndex}]`);
				expect(bulletElement).toBeInTheDocument();
				expect(bulletElement.textContent).toBe(bullet);
			});
		});
	});

	it("should display skills", async () => {
		// Setup
		const resume = ValidResume();

		// Act
		const props = {
			loaderData: resume,
		} as Route.ComponentProps;
		render(<Index {...props} />);

		const languagesElement = screen.getByTestId("resume.about.languages");
		const technologiesElement = screen.getByTestId("resume.about.technologies");
		const interestsElement = screen.getByTestId("resume.about.interests");

		// Assert
		expect(languagesElement).toBeInTheDocument();
		expect(technologiesElement).toBeInTheDocument();
		expect(interestsElement).toBeInTheDocument();
		expect(languagesElement.textContent).toContain(resume.about.languages.join(", "));
		expect(technologiesElement.textContent).toContain(resume.about.technologies.join(", "));
		expect(interestsElement.textContent).toContain(resume.about.interests?.join(", "));
	});
});
