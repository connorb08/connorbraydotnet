import { WorkerEntrypoint } from "cloudflare:workers";
export declare class MainEntrypoint extends WorkerEntrypoint<Env> {
    fetch(_request: Request): Promise<Response>;
}
export default MainEntrypoint;
//# sourceMappingURL=index.d.ts.map