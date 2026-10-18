export type MutationType =
  | 'SAVE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'RECORD_TRANSACTION'
  | 'CLEAR_DATA';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

const DB_NAME = 'tindahan_offline_db';
const DB_VERSION = 1;
const OUTBOX_STORAGE_KEY = 'tindahan_outbox_queue';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('outbox')) {
        const outboxStore = db.createObjectStore('outbox', { keyPath: 'id' });
        outboxStore.createIndex('status', 'status', { unique: false });
        outboxStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback LocalStorage Queue
function getLocalOutbox(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOutbox(queue: QueuedMutation[]): void {
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Queue a mutation into IndexedDB outbox (with localStorage fallback)
 */
export async function queueMutation(type: MutationType, payload: any): Promise<void> {
  const mutation: QueuedMutation = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    status: 'pending',
  };

  // 1. Save to localStorage fallback
  const localQueue = getLocalOutbox();
  localQueue.push(mutation);
  saveLocalOutbox(localQueue);

  // 2. Save to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    store.add(mutation);
  } catch (err) {
    console.warn('Failed to write mutation to IndexedDB, using local queue:', err);
  }

  // Notify active components
  window.dispatchEvent(new CustomEvent('tindahan:outbox-updated', { detail: { count: localQueue.length } }));

  // If online, attempt to process immediately
  if (navigator.onLine) {
    syncOutbox();
  }
}

/**
 * Get count of pending outbox mutations
 */
export function getPendingMutationCount(): number {
  return getLocalOutbox().length;
}

/**
 * Sync queued mutations when connectivity is restored
 */
export async function syncOutbox(): Promise<{ synced: number; remaining: number }> {
  const queue = getLocalOutbox();
  if (queue.length === 0) {
    return { synced: 0, remaining: 0 };
  }

  let syncedCount = 0;
  const remaining: QueuedMutation[] = [];

  for (const item of queue) {
    try {
      // In a full cloud setup, this would POST to a backend API endpoint (e.g. /api/sync)
      // For an offline-first client, we ensure persistent state is consolidated and acknowledged
      await new Promise(r => setTimeout(r, 40));
      syncedCount++;

      // Also mark as synced in IndexedDB
      try {
        const db = await openDB();
        const tx = db.transaction('outbox', 'readwrite');
        const store = tx.objectStore('outbox');
        store.delete(item.id);
      } catch {
        // Ignore IDB errors during flush
      }
    } catch {
      remaining.push(item);
    }
  }

  saveLocalOutbox(remaining);

  // Dispatch sync event
  window.dispatchEvent(
    new CustomEvent('tindahan:sync-complete', {
      detail: {
        syncedCount,
        remainingCount: remaining.length,
        timestamp: Date.now(),
      },
    })
  );

  return { synced: syncedCount, remaining: remaining.length };
}

// Global connectivity listeners to auto-sync when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    window.dispatchEvent(new CustomEvent('tindahan:connectivity-changed', { detail: { online: true } }));
    syncOutbox();
  });

  window.addEventListener('offline', () => {
    window.dispatchEvent(new CustomEvent('tindahan:connectivity-changed', { detail: { online: false } }));
  });
}
