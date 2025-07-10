import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller/playwright.ts";
import { createServer } from "node:http";

const PORT = 3000;

const server = createServer();

server.on('request', async (request, res) => {
	try {
		const pageController = await PageController();
		const queenLocations = await PlayQueens({ pageController });
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(queenLocations));
	} catch (error) {
		console.error('Error processing request:', error);
		res.writeHead(500, { 'Content-Type': 'application/json' });
		const { name, message, cause, stack } = (error instanceof Error) ? error : { message: 'Unknown error occurred' };
		res.end(JSON.stringify({ message: 'Server Error', info: { name, message, cause, stack } }));
	}
});

server.listen(3000, () => {
	console.log('Server started on port 3000');
});