import { literal, object } from "zod";

const SectionTitle = literal(["Education", "Experience", "Projects"]);

export const Options = object({
	order: SectionTitle.array(),
});
