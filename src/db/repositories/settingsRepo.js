/**
 * 앱 설정(app_settings) 리포지토리
 */

import { put, get, STORES } from '../idb.js';

/**
 * 설정값 저장
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setSetting(key, value) {
  await put(STORES.APP_SETTINGS, { key, value });
}

/**
 * 설정값 조회
 * @param {string} key
 * @param {any} defaultValue
 * @returns {Promise<any>}
 */
export async function getSetting(key, defaultValue = null) {
  const result = await get(STORES.APP_SETTINGS, key);
  return result ? result.value : defaultValue;
}

/**
 * 활성 학급 ID 저장
 * @param {string} classId
 */
export async function setActiveClassId(classId) {
  await setSetting('activeClassId', classId);
}

/**
 * 활성 학급 ID 조회
 * @returns {Promise<string|null>}
 */
export async function getActiveClassId() {
  return getSetting('activeClassId', null);
}

/**
 * 마지막 사용 템플릿 저장
 * @param {string} templateId
 */
export async function setLastTemplateId(templateId) {
  await setSetting('lastTemplateId', templateId);
}

/**
 * 마지막 사용 템플릿 조회
 * @returns {Promise<string|null>}
 */
export async function getLastTemplateId() {
  return getSetting('lastTemplateId', null);
}
