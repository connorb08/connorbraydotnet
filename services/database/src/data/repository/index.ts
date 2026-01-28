import type { Kysely } from "kysely";
import { RPCErr, RPCOk, type RPCResult } from "types";
import { v7 } from "uuid";
import type { Database } from "../../models";
import type { Repository } from "../../models/repository";

export async function PutRepository(
	db: Kysely<Database>,
	data: Repository,
): Promise<RPCResult<Repository>> {
	try {
		const [repository] = await db
			.insertInto("repositories")
			.values({ id: v7(), ...data })
			.returningAll()
			.execute();
		if (!repository) {
			return RPCErr("Failed to insert repository");
		}
		return RPCOk(repository);
	} catch (error) {
		console.error("Error putting repository:", error);
		return RPCErr(error instanceof Error ? error.message : "Unknown error inserting repository");
	}
}
