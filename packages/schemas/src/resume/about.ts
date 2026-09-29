import type { infer as inferType } from "zod";
import { object, string } from "zod";

export const About = object({
	name: string(),
	phoneNumber: string(),
	emailAddress: string(),
	location: string(),
	summary: string().optional(),
});

export type ResumeAbout = inferType<typeof About>;
