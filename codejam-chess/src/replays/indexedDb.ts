import { ReplayRecord, URLS } from '../constants';
import defaultReplaysDB from './defaultReplayDb';

function idbOK() {
  return 'indexedDB' in window && !/iPad|iPhone|iPod/.test(navigator.platform);
}

export default class IndexedDB {
  static instance: IndexedDB;

  status: string;

  constructor() {
    if (IndexedDB.instance) return IndexedDB.instance;
    IndexedDB.instance = this;
  }

  async add(replay: ReplayRecord) {
    const db: IDBDatabase = await this.openRequestToDB();
    const transaction = db.transaction([URLS.indexedStoreURl], 'readwrite');
    const store = transaction.objectStore(URLS.indexedStoreURl);
    const request: IDBRequest<IDBValidKey> = store.put(replay);
    this.requestErrorListener(request);
  }

  async createDB() {
    if (!idbOK()) {
      throw new Error("Error: Your device doesn't support IndexedBD");
    }
    const database: IDBDatabase = await this.openRequestToDB();
    const dbContainsUsers = database.objectStoreNames.contains('replays');
    if (!dbContainsUsers) {
      database.createObjectStore('replays', { keyPath: 'id', autoIncrement: true });
      this.createDefaultDB();
    }
  }

  async getReplaysDB() {
    const db: IDBDatabase = await this.openRequestToDB();
    const dbPromise = new Promise<Array<ReplayRecord>>((resolve) => {
      const data: Array<ReplayRecord> = [];
      const transaction = db.transaction([URLS.indexedStoreURl], 'readonly');
      const store = transaction.objectStore(URLS.indexedStoreURl);
      const cursor = store.openCursor();
      cursor.onsuccess = function onsuccess() {
        const currentCursor = cursor.result;
        if (currentCursor) {
          data.push(currentCursor.value);
          currentCursor.continue();
        }
      };
      transaction.oncomplete = () => {
        this.status = 'success';
        resolve(data);
      };
    });
    return dbPromise;
  }

  async createDefaultDB() {
    defaultReplaysDB.forEach(async (replay) => this.add(replay));
  }

  openRequestToDB() {
    const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const openRequest = indexedDB.open(URLS.indexedDBUrl);
      this.status = 'pending';
      let database: IDBDatabase;
      openRequest.onupgradeneeded = () => {
        database = openRequest.result;
        resolve(database);
      };
      openRequest.onsuccess = () => {
        database = openRequest.result;
        resolve(database);
      };
      openRequest.onerror = (e) => {
        this.status = 'error';
        reject(new Error(`'Error: ${e}`));
      };
    });
    return dbPromise;
  }

  requestErrorListener(request: IDBRequest<IDBValidKey>) {
    request.addEventListener('error', () => {
      this.status = 'error';
      throw new Error(`'Error: ${request.error.name}`);
    });
    request.addEventListener('success', () => {
      this.status = 'success';
    });
  }
}
