import type { Kysely } from "kysely";
import { type QueensSolution, RPCErr, RPCOk, type RPCResult } from "types";
import { v7 } from "uuid";
import type { Database, Queens } from "../../models";

export async function PutQueens(
	db: Kysely<Database>,
	solution: QueensSolution,
): Promise<RPCResult<Queens>> {
	try {
		const solutionString = JSON.stringify(solution);
		const date = new Date().toISOString().split("T")[0] || "unknown-date";
		const [queens] = await db
			.insertInto("queens")
			.values({ id: v7(), date, solution: solutionString })
			.returning(["date", "solution"])
			.execute();
		if (!queens) {
			return RPCErr("Failed to create queens");
		}
		return RPCOk(queens);
	} catch (error) {
		console.error("Error putting queens:", error);
		return RPCErr(
			error instanceof Error ? error.message : "Unknown error inserting queens",
		);
	}
}

export async function GetCurrentQueens(
	db: Kysely<Database>,
): Promise<RPCResult<Queens>> {
	try {
		// const selectDate = new Date().toISOString().split("T")[0] || "unknown-date";
		const { date, solution } = await db
			.selectFrom("queens")
			.select(["date", "solution"])
			// .where("date", "=", selectDate)
			.orderBy("id", "desc")
			.executeTakeFirstOrThrow();
		return RPCOk({ date, solution: JSON.parse(solution as unknown as string) });
	} catch (error) {
		console.error("Error fetching queens:", error);
		return RPCErr(
			error instanceof Error ? error.message : "Unknown error getting queens",
		);
	}
}
