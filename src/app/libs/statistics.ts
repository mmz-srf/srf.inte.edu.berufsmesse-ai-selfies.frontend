import fs from 'fs/promises';
import path from 'path';
import { backgroundResolutions } from './config';

export interface DailyStatistics {
    totalResults: number;
    totalPrints: number;
    backgrounds: Record<string, number>;
}

export interface Statistics {
    // Keyed by date in Swiss time (YYYY-MM-DD)
    days: Record<string, DailyStatistics>;
}

const STATISTICS_FILE = process.env.STATISTICS_FILE || path.join(process.cwd(), 'data', 'statistics.json');

// en-CA formats dates as YYYY-MM-DD
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

// All updates go through this chain so concurrent requests can't overwrite each other's increments
let writeQueue: Promise<unknown> = Promise.resolve();

function emptyDailyStatistics(): DailyStatistics {
    return {
        totalResults: 0,
        totalPrints: 0,
        backgrounds: Object.fromEntries(Object.keys(backgroundResolutions).map((background) => [background, 0])),
    };
}

export async function readStatistics(): Promise<Statistics> {
    const statistics: Statistics = { days: {} };
    try {
        const stored = JSON.parse(await fs.readFile(STATISTICS_FILE, 'utf-8')) as Partial<Statistics>;
        for (const [day, storedDay] of Object.entries(stored.days ?? {})) {
            const daily = emptyDailyStatistics();
            daily.totalResults = storedDay.totalResults ?? 0;
            daily.totalPrints = storedDay.totalPrints ?? 0;
            Object.assign(daily.backgrounds, storedDay.backgrounds);
            statistics.days[day] = daily;
        }
    } catch (err: any) {
        if (err?.code !== 'ENOENT') {
            throw err;
        }
    }
    return statistics;
}

function updateToday(update: (today: DailyStatistics) => void): Promise<Statistics> {
    const result = writeQueue.then(async () => {
        const statistics = await readStatistics();
        const day = dayFormatter.format(new Date());
        statistics.days[day] ??= emptyDailyStatistics();
        update(statistics.days[day]);

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
    return updateToday((today) => {
        today.totalResults++;
        today.backgrounds[background] = (today.backgrounds[background] ?? 0) + 1;
    });
}

export function recordPrint(): Promise<Statistics> {
    return updateToday((today) => {
        today.totalPrints++;
    });
}
