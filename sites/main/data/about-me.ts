export type AboutMeData = {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    github: string;
    linkedin: string;
    summary: string;
    personalInterests: string[];
};

export const aboutMe = {
    name: "Connor Bray",
    title: "Software Engineer",
    location: "Boston, MA",
    email: "connor@connorbray.net",
    phone: "(207) 272-6463",
    website: "https://connorbray.net",
    github: "https://github.com/connorbray",
    linkedin: "https://linkedin.com/in/connorbray",
    summary:
        `
        Software engineer with over 10 years of total programming experience.
        Having worked on everything from personal projects to enterprise-scale systems, 
        I've developed expertise across the full technical stack.
        I continually seek practical ways to improve both my skills and codebase quality by
            identifying developer pain points, challenging outdated assumptions, and streamlining workflows.
        I thrive on collaboration, readily sharing knowledge while learning from colleagues.`,
    personalInterests: ["Photography"],
} satisfies AboutMeData;

export default aboutMe;

