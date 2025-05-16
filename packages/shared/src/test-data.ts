import type { Resume } from "#types";
import { ResumeData } from "./types/resume/test-data";
import { DeepCopy } from "./utils";

export const ValidResume = () => {
	return DeepCopy<Resume>(ResumeData);
};
