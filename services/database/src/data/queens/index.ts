import type { Kysely } from "kysely";
import { type QueensSolution, type QueensStep, RPCErr, RPCOk, type RPCResult } from "types";
import { v7 } from "uuid";
import type { QueensGameDefinition } from "../../../../../packages/types/src/queens";
import type { Database, Queens } from "../../models";

export async function PutQueens(
	db: Kysely<Database>,
	definition: QueensGameDefinition,
	solution: QueensSolution,
	steps: QueensStep[],
): Promise<RPCResult<Queens>> {
	try {
		const definitionString = JSON.stringify(definition);
		const solutionString = JSON.stringify(solution);
		const stepsString = JSON.stringify(steps);
		const date = new Date().toUTCString();
		const [queens] = await db
			.insertInto("queens")
			.values({
				id: v7(),
				date,
				definition: definitionString,
				solution: solutionString,
				steps: stepsString,
			})
			.returning(["date", "definition", "solution", "steps"])
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
		const { date, definition, solution, steps } = await db
			.selectFrom("queens")
			.select(["date", "definition", "solution", "steps"])
			// .where("date", "=", selectDate)
			.orderBy("id", "desc")
			.executeTakeFirstOrThrow();
		return RPCOk({
			date,
			definition: JSON.parse(definition as unknown as string),
			solution: JSON.parse(solution as unknown as string),
			steps: JSON.parse(steps as unknown as string),
		});
	} catch (error) {
		console.error("Error fetching queens:", error);
		return RPCErr(error instanceof Error ? error.message : "Unknown error getting queens");
	}
}
