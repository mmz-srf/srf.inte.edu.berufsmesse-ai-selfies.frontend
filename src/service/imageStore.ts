// The generated image is too large for localStorage (~5 MB quota), so it is kept in IndexedDB instead

const DB_NAME = "berufsmesse-ai-selfies";
const STORE_NAME = "images";
const GENERATED_IMAGE_KEY = "generatedImage";

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function runRequest<T>(mode: IDBTransactionMode, createRequest: (store: IDBObjectStore) => IDBRequest): Promise<T> {
    const db = await openDb();
    try {
        return await new Promise<T>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, mode);
            const request = createRequest(transaction.objectStore(STORE_NAME));
            transaction.oncomplete = () => resolve(request.result as T);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    } finally {
        db.close();
    }
}

export function saveGeneratedImage(imageBase64: string): Promise<void> {
    return runRequest("readwrite", (store) => store.put(imageBase64, GENERATED_IMAGE_KEY));
}

export async function getGeneratedImage(): Promise<string | null> {
    const image = await runRequest<string | undefined>("readonly", (store) => store.get(GENERATED_IMAGE_KEY));
    return image ?? null;
}

export function clearGeneratedImage(): Promise<void> {
    return runRequest("readwrite", (store) => store.delete(GENERATED_IMAGE_KEY));
}
