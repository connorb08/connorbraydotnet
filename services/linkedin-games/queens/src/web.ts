import http from 'node:http';
import { SolutionFactory } from ".";
import { PageController } from "./page-controller/playwright";


const host = "0.0.0.0";
const port = 3000;

const server = http.createServer();

const findSolution = async () => {
    try {
        const solution = await SolutionFactory({
            pageController: await PageController(),
        });
        return solution;
    } catch (error) {
        console.error("Error finding solution:", error);
        throw error;
    }
}

server.on('request', async (_request, res) => {
    const solution = await findSolution();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(solution));
    server.close();
});

server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});

