//#region RPC Result Types

type RPCResultErr = {
	error: string;
	data?: undefined;
};

type RPCResultOk<T> = {
	data: T;
	error?: undefined;
};

type RPCResult<T> = RPCResultOk<T> | RPCResultErr;

export type { RPCResult, RPCResultErr, RPCResultOk };

//#endregion RPC Result Types

//#region Result Utility Functions

function RPCErr<T>(error: string): RPCResult<T> {
	return { error };
}
function RPCOk<T>(data: T): RPCResult<T> {
	return { data };
}

export { RPCErr, RPCOk };

//#endregion Result Utility Functions
