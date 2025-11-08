export interface Resume {
	name: string;
	about: ResumeAbout;
	education: ResumeEducation[];
	career: ResumeCareer[];
	projects: ResumeProject[];
}

export interface ResumeAbout {
	phoneNumber: string;
	emailAddress: string;
	location: string;
	languages: string[];
	technologies: string[];
	summary?: string | null | undefined;
	interests?: string[];
}

export interface ResumeEducation {
	school: string;
	degree: string;
	about: string[];
	location?: string;
	startDate?: string;
	endDate?: string;
}

export interface ResumeCareer {
	company: string;
	title: string;
	location: string;
	startDate: string;
	about: string[];
	endDate?: string;
}

export interface ResumeProject {
	name: string;
	description: string;
	about: string[];
}
