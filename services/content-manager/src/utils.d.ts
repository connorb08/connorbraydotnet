export declare enum Quality {
    Low = 50,
    MediumLow = 60,
    Medium = 70,
    MediumHigh = 80,
    High = 90
}
export declare function calculateWidth(size: string | null): number;
export declare function forbiddenReferer(request: Request): boolean;
export declare function getOutputType(request: Request): ImageOutputOptions["format"];
export declare function getImages(env: Env): Promise<Response>;
export declare function isImage(contentType: string): boolean;
//# sourceMappingURL=utils.d.ts.map