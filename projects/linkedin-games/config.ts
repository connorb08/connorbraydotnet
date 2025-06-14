interface Config {
    headless: boolean;
    Urls: {
        Queens: string;
    }
}

export default {
    headless: false,
    Urls: {
        Queens: "https://www.linkedin.com/games/view/queens/desktop",
    }
} satisfies Config;