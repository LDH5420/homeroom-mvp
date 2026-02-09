/**
 * 학급(classes) 리포지토리
 */

import { put, get, getAll, remove, STORES } from '../idb.js';
import { createClassId } from '../../utils/uuid.js';

/**
 * 새 학급 생성
 * @param {object} classData
 * @returns {Promise<object>}
 */
export async function createClass(classData) {
  const now = Date.now();
  const newClass = {
    id: createClassId(),
    schoolYear: classData.schoolYear || new Date().getFullYear(),
    term: classData.term || 1,
    grade: classData.grade || 1,
    classNo: classData.classNo || 1,
    teacherName: classData.teacherName || '',
    nickname: classData.nickname || `${classData.grade}-${classData.classNo}`,
    createdAt: now,
    updatedAt: now,
  };

  await put(STORES.CLASSES, newClass);
  return newClass;
}

/**
 * 학급 조회
 * @param {string} id
 * @returns {Promise<object|undefined>}
 */
export async function getClass(id) {
  return get(STORES.CLASSES, id);
}

/**
 * 모든 학급 조회
 * @returns {Promise<Array>}
 */
export async function getAllClasses() {
  const classes = await getAll(STORES.CLASSES);
  // 최신순 정렬
  return classes.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * 학급 수정
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateClass(id, updates) {
  const existing = await getClass(id);
  if (!existing) {
    throw new Error(`학급을 찾을 수 없습니다: ${id}`);
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await put(STORES.CLASSES, updated);
  return updated;
}

/**
 * 학급 삭제
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteClass(id) {
  await remove(STORES.CLASSES, id);
}

/**
 * 학급 표시 이름 생성
 * @param {object} classInfo
 * @returns {string}
 */
export function getClassDisplayName(classInfo) {
  if (!classInfo) return '';
  return classInfo.nickname || `${classInfo.grade}학년 ${classInfo.classNo}반`;
}
