import type { Kysely } from "kysely";
import type { QueensSolution } from "types";
import { v7 } from "uuid";
import type { Database, Queens } from "../../models";
import { Err, Ok, type Result } from "../../utils";

export async function PutQueens(
	db: Kysely<Database>,
	solution: QueensSolution,
): Promise<Result<Queens>> {
	try {
		const solutionString = JSON.stringify(solution);
		const date = new Date().toISOString().split("T")[0] || "unknown-date";
		const [queens] = await db
			.insertInto("queens")
			.values({ id: v7(), date, solution: solutionString })
			.returning(["date", "solution"])
			.execute();
		if (!queens) {
			return Err("Failed to create queens");
		}
		return Ok(queens);
	} catch (error) {
		console.error("Error putting queens:", error);
		return Err(error instanceof Error ? error.message : "Unknown error");
	}
}

export async function GetCurrentQueens(
	db: Kysely<Database>,
): Promise<Result<Queens>> {
	try {
		const selectDate = new Date().toISOString().split("T")[0] || "unknown-date";
		const { date, solution } = await db
			.selectFrom("queens")
			.select(["date", "solution"])
			.where("date", "=", selectDate)
			.executeTakeFirstOrThrow();
		return Ok({ date, solution: JSON.parse(solution as unknown as string) });
	} catch (error) {
		console.error("Error fetching queens:", error);
		return Err(error instanceof Error ? error.message : "Unknown error");
	}
}
