/**
 * 인쇄 프로필(print_profiles) 리포지토리
 */

import { put, get, getAllByIndex, STORES } from '../idb.js';
import { createPrintProfileId } from '../../utils/uuid.js';

/**
 * 기본 인쇄 프로필 생성
 * @param {string} templateId
 * @returns {object}
 */
function createDefaultProfile(templateId) {
  return {
    id: createPrintProfileId(),
    classId: null, // null = 전역 프로필
    templateId,
    paper: 'A4',
    orientation: 'portrait',
    marginMm: { top: 0, right: 0, bottom: 0, left: 0 },
    offsetMm: { x: 0, y: 0 },
    fontScale: 1.0,
    updatedAt: Date.now(),
  };
}

/**
 * 인쇄 프로필 조회 (없으면 기본값 생성)
 * @param {string} templateId
 * @param {string|null} classId
 * @returns {Promise<object>}
 */
export async function getOrCreateProfile(templateId, classId = null) {
  // 학급별 프로필 먼저 조회
  if (classId) {
    const classProfiles = await getAllByIndex(STORES.PRINT_PROFILES, 'by_classId', classId);
    const profile = classProfiles.find(p => p.templateId === templateId);
    if (profile) return profile;
  }

  // 전역 프로필 조회
  const globalProfiles = await getAllByIndex(STORES.PRINT_PROFILES, 'by_templateId', templateId);
  const globalProfile = globalProfiles.find(p => !p.classId);

  if (globalProfile) return globalProfile;

  // 없으면 기본 프로필 생성 및 저장
  const newProfile = createDefaultProfile(templateId);
  await put(STORES.PRINT_PROFILES, newProfile);
  return newProfile;
}

/**
 * 인쇄 프로필 저장
 * @param {object} profile
 * @returns {Promise<object>}
 */
export async function saveProfile(profile) {
  const updated = {
    ...profile,
    updatedAt: Date.now(),
  };
  await put(STORES.PRINT_PROFILES, updated);
  return updated;
}

/**
 * 오프셋 값만 업데이트
 * @param {string} profileId
 * @param {number} offsetX
 * @param {number} offsetY
 * @returns {Promise<object>}
 */
export async function updateOffset(profileId, offsetX, offsetY) {
  const profile = await get(STORES.PRINT_PROFILES, profileId);
  if (!profile) {
    throw new Error(`프로필을 찾을 수 없습니다: ${profileId}`);
  }

  return saveProfile({
    ...profile,
    offsetMm: { x: offsetX, y: offsetY },
  });
}
