import { object, string } from "zod";

export const About = object({
	name: string(),
	phoneNumber: string(),
	emailAddress: string(),
	location: string(),
	summary: string().optional(),
});
