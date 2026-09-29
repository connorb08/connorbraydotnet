import type { infer as inferType } from "zod";
import { literal, object } from "zod";

const SectionTitle = literal(["Education", "Experience", "Projects"]);

export const Options = object({
	order: SectionTitle.array(),
});

export type ResumeOptions = inferType<typeof Options>;
