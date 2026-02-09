/**
 * IndexedDB 연결 래퍼
 */

import { DB_NAME, DB_VERSION, upgradeDB, STORES } from './schema.js';

let db = null;

/**
 * 데이터베이스 초기화/연결
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('IndexedDB 열기 실패: ' + request.error));
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB 연결 성공');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      const transaction = event.target.transaction;
      upgradeDB(database, transaction, event.oldVersion);
    };
  });
}

/**
 * 현재 DB 인스턴스 가져오기
 * @returns {IDBDatabase}
 */
export function getDB() {
  if (!db) {
    throw new Error('DB가 초기화되지 않았습니다. initDB()를 먼저 호출하세요.');
  }
  return db;
}

/**
 * 트랜잭션 생성
 * @param {string|string[]} storeNames
 * @param {IDBTransactionMode} mode
 * @returns {IDBTransaction}
 */
export function createTransaction(storeNames, mode = 'readonly') {
  return getDB().transaction(storeNames, mode);
}

/**
 * 레코드 추가/수정
 * @param {string} storeName
 * @param {object} data
 * @returns {Promise}
 */
export async function put(storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 레코드 조회
 * @param {string} storeName
 * @param {any} key
 * @returns {Promise}
 */
export async function get(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName);
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 모든 레코드 조회
 * @param {string} storeName
 * @returns {Promise<Array>}
 */
export async function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName);
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 인덱스로 조회
 * @param {string} storeName
 * @param {string} indexName
 * @param {any} key
 * @returns {Promise<Array>}
 */
export async function getAllByIndex(storeName, indexName, key) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName);
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 레코드 삭제
 * @param {string} storeName
 * @param {any} key
 * @returns {Promise}
 */
export async function remove(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 여러 레코드 일괄 추가/수정
 * @param {string} storeName
 * @param {Array} items
 * @returns {Promise}
 */
export async function putAll(storeName, items) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    for (const item of items) {
      store.put(item);
    }
  });
}

/**
 * 인덱스로 조회된 레코드 모두 삭제
 * @param {string} storeName
 * @param {string} indexName
 * @param {any} key
 * @returns {Promise}
 */
export async function removeAllByIndex(storeName, indexName, key) {
  return new Promise((resolve, reject) => {
    const tx = createTransaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.openCursor(key);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  });
}

export { STORES };
