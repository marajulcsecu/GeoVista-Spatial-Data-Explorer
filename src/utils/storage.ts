import type { SpatialDataset } from '../types/spatial';

const DB_NAME = 'geovista_db';
const DB_VERSION = 1;
const STORE_DATASETS = 'datasets';
const STORE_SETTINGS = 'settings';

function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DATASETS)) {
        db.createObjectStore(STORE_DATASETS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves the full list of SpatialDatasets to IndexedDB.
 */
export async function saveDatasetsToStorage(datasets: SpatialDataset[]): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_DATASETS, 'readwrite');
    const store = tx.objectStore(STORE_DATASETS);

    // Clear old records
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    // Add all current datasets
    for (const ds of datasets) {
      store.put(ds);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save spatial datasets to IndexedDB:', err);
  }
}

/**
 * Loads all saved SpatialDatasets from IndexedDB.
 */
export async function loadDatasetsFromStorage(): Promise<SpatialDataset[]> {
  if (!isIndexedDbAvailable()) return [];
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_DATASETS, 'readonly');
    const store = tx.objectStore(STORE_DATASETS);

    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load spatial datasets from IndexedDB:', err);
    return [];
  }
}

/**
 * Clears all spatial datasets from IndexedDB.
 */
export async function clearDatasetsFromStorage(): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_DATASETS, 'readwrite');
    const store = tx.objectStore(STORE_DATASETS);

    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB datasets:', err);
  }
}
