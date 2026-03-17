import { object, string } from "zod";

export const Skill = object({
	skillName: string(),
	skillList: string().array(),
});
