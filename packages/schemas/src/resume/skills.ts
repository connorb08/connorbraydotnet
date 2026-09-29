import type { infer as inferType } from "zod";
import { object, string } from "zod";

export const Skill = object({
	skillName: string(),
	skillList: string().array(),
});

export type ResumeSkill = inferType<typeof Skill>;
