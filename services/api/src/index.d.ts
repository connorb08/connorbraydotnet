import { WorkerEntrypoint } from "cloudflare:workers";
import type { GameData } from "shared";
export declare class MainEntrypoint extends WorkerEntrypoint<Env> {
    fetch(_request: Request): Promise<Response>;
    updateQueens(): Promise<GameData>;
    queensResult(): Promise<GameData>;
}
export default MainEntrypoint;
//# sourceMappingURL=index.d.ts.map