import type { Resume } from "#types";
import { DeepCopy } from "../test/utils";
import { ResumeData } from "./types/resume/test-data";

export const ValidResume = () => {
	return DeepCopy<Resume>(ResumeData);
};
