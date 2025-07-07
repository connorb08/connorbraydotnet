import PlayQueens from "./queens/index.ts";
import PageController from "./queens/page-controller.ts";
import http from "node:http";

const server = http.createServer(async (req, res) => {
	await using pageController = await PageController();
	const queenLocations = await PlayQueens({ pageController });
	res.statusCode = 200;
	res.setHeader("Content-Type", "application/json");
	res.end(JSON.stringify(queenLocations));
});

server.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
