import type { Kysely } from "kysely";
import { type QueensSolution, type QueensStep, RPCErr, RPCOk, type RPCResult } from "types";
import { v7 } from "uuid";
import type { Database, Queens } from "../../models";

export async function PutQueens(
	db: Kysely<Database>,
	solution: QueensSolution,
	steps: QueensStep[],
): Promise<RPCResult<Queens>> {
	try {
		const solutionString = JSON.stringify(solution);
		const stepsString = JSON.stringify(steps);
		const date = new Date().toUTCString();
		const [queens] = await db
			.insertInto("queens")
			.values({ id: v7(), date, solution: solutionString, steps: stepsString })
			.returning(["date", "solution", "steps"])
			.execute();
		if (!queens) {
			return RPCErr("Failed to create queens");
		}
		return RPCOk(queens);
	} catch (error) {
		console.error("Error putting queens:", error);
		return RPCErr(error instanceof Error ? error.message : "Unknown error inserting queens");
	}
}

export async function GetCurrentQueens(db: Kysely<Database>): Promise<RPCResult<Queens>> {
	try {
		// const selectDate = new Date().toISOString().split("T")[0] || "unknown-date";
		const { date, solution, steps } = await db
			.selectFrom("queens")
			.select(["date", "solution", "steps"])
			// .where("date", "=", selectDate)
			.orderBy("id", "desc")
			.executeTakeFirstOrThrow();
		return RPCOk({
			date,
			solution: JSON.parse(solution as unknown as string),
			steps: JSON.parse(steps as unknown as string),
		});
	} catch (error) {
		console.error("Error fetching queens:", error);
		return RPCErr(error instanceof Error ? error.message : "Unknown error getting queens");
	}
}
