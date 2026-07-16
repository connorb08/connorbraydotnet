import { Hono } from "hono";
import img from "./img";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
	return c.text("Hello Hono!");
});

// app.post("/upload", async (_c) => {
// 	// const formData = await c.req.formData();
// 	// const file = formData.get("file") as File | null;
// });

app.route("/img", img);

export default app;
