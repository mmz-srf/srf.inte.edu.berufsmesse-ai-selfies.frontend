interface BackgroundResolution {
    width: number;
    height: number;
}

export const backgroundResolutions: Record<string, BackgroundResolution> = {
    "Arena": { width: 2303, height: 1535 },
    "Meteo": { width: 2048, height: 1368 },
    "Radio": { width: 4240, height: 2832 },
    "Sport": { width: 8076, height: 4542 },
    "Tagesschau": { width: 2303, height: 1535 }
};