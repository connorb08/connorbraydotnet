import { WorkerEntrypoint } from "cloudflare:workers";
export declare class MainEntrypoint extends WorkerEntrypoint<Env> {
    /**
     * Default HTTP Handler
     */
    fetch(request: Request): Promise<Response>;
}
export default MainEntrypoint;
//# sourceMappingURL=index.d.ts.map