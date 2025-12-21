export interface Resume {
	about: ResumeAbout;
	skills: ResumeSkills;
	summary?: string | undefined;
	education: EducationItem[];
	career: ExperienceItem[];
	projects: ProjectItem[];
	boardPositions: BoardPositionItem[];
	// sections: ResumeSection[];
	// order: (typeof ResumeSections)[keyof typeof ResumeSections][];
}

export interface ResumeAbout {
	name: string;
	phoneNumber: string;
	emailAddress: string;
	location: string;
	summary?: string | undefined;
}

export type ResumeSkills = {
	languages: string[];
	technologies: string[];
	interests: string[];
};

export type ResumeOptions = {
	order: (keyof Resume)[];
};

/**
 * Resume Sections
 */

export const ResumeSections = {
	Education: "education",
	Experience: "experience",
	Projects: "projects",
	BoardPositions: "boardPositions",
};

export interface ResumeSection {
	title: string;
	items: (EducationItem | ExperienceItem | ProjectItem | BoardPositionItem)[];
}

export interface EducationItem {
	school: string;
	degree: string;
	about: string[];
	location?: string;
	startDate?: string;
	endDate?: string;
}

export interface ExperienceItem {
	company: string;
	title: string;
	location: string;
	startDate: string;
	about: string[];
	endDate?: string;
}

export interface ProjectItem {
	name: string;
	description: string;
	about: string[];
}

export interface BoardPositionItem {
	name: string;
	role: string;
	location?: string;
	startDate?: string;
	endDate?: string;
	about: string[];
}
