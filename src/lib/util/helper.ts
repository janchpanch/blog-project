import parse from 'parse-duration';

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function parseDuration(durationStr: string): number {
    return parse(durationStr) as number;
}