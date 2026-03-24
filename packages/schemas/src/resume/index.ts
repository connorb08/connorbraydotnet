import { type infer as inferType, object } from "zod";
import { About } from "./about";
import { Options } from "./options";
import { Sections } from "./sections";
import { Skill } from "./skills";

export const Resume = object({
	about: About,
	options: Options,
	skills: Skill.array(),
	sections: Sections,
});

export type Resume = inferType<typeof Resume>;

export type * from "./sections";
