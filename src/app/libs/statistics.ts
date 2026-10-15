import fs from 'fs/promises';
import path from 'path';
import { backgroundResolutions } from './config';

export interface Statistics {
    totalResults: number;
    totalPrints: number;
    backgrounds: Record<string, number>;
}

const STATISTICS_FILE = process.env.STATISTICS_FILE || path.join(process.cwd(), 'data', 'statistics.json');

// All updates go through this chain so concurrent requests can't overwrite each other's increments
let writeQueue: Promise<unknown> = Promise.resolve();

function emptyStatistics(): Statistics {
    return {
        totalResults: 0,
        totalPrints: 0,
        backgrounds: Object.fromEntries(Object.keys(backgroundResolutions).map((background) => [background, 0])),
    };
}

export async function readStatistics(): Promise<Statistics> {
    const statistics = emptyStatistics();
    try {
        const stored = JSON.parse(await fs.readFile(STATISTICS_FILE, 'utf-8')) as Partial<Statistics>;
        statistics.totalResults = stored.totalResults ?? 0;
        statistics.totalPrints = stored.totalPrints ?? 0;
        Object.assign(statistics.backgrounds, stored.backgrounds);
    } catch (err: any) {
        if (err?.code !== 'ENOENT') {
            throw err;
        }
    }
    return statistics;
}

function updateStatistics(update: (statistics: Statistics) => void): Promise<Statistics> {
    const result = writeQueue.then(async () => {
        const statistics = await readStatistics();
        update(statistics);

        // Write to a temp file and rename, so a crash mid-write never leaves a corrupt JSON file
        await fs.mkdir(path.dirname(STATISTICS_FILE), { recursive: true });
        const tempFile = `${STATISTICS_FILE}.tmp`;
        await fs.writeFile(tempFile, JSON.stringify(statistics, null, 2));
        await fs.rename(tempFile, STATISTICS_FILE);
        return statistics;
    });
    writeQueue = result.catch(() => {});
    return result;
}

export function isKnownBackground(background: unknown): background is string {
    return typeof background === 'string' && background in backgroundResolutions;
}

export function recordResult(background: string): Promise<Statistics> {
    return updateStatistics((statistics) => {
        statistics.totalResults++;
        statistics.backgrounds[background] = (statistics.backgrounds[background] ?? 0) + 1;
    });
}

export function recordPrint(): Promise<Statistics> {
    return updateStatistics((statistics) => {
        statistics.totalPrints++;
    });
}
