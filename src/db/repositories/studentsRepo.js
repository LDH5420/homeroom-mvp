/**
 * 학생(students) 리포지토리
 */

import { put, get, getAllByIndex, remove, putAll, removeAllByIndex, STORES } from '../idb.js';
import { createStudentId } from '../../utils/uuid.js';

/**
 * 새 학생 생성
 * @param {string} classId
 * @param {object} studentData
 * @returns {Promise<object>}
 */
export async function createStudent(classId, studentData) {
  const now = Date.now();
  const newStudent = {
    id: createStudentId(),
    classId,
    number: studentData.number || 1,
    name: studentData.name || '',
    gender: studentData.gender || '',
    notes: studentData.notes || '',
    lockerNo: studentData.lockerNo || null,
    active: studentData.active !== false,
    createdAt: now,
    updatedAt: now,
  };

  await put(STORES.STUDENTS, newStudent);
  return newStudent;
}

/**
 * 학생 조회
 * @param {string} id
 * @returns {Promise<object|undefined>}
 */
export async function getStudent(id) {
  return get(STORES.STUDENTS, id);
}

/**
 * 학급의 모든 학생 조회
 * @param {string} classId
 * @param {boolean} activeOnly - 활성 학생만 조회
 * @returns {Promise<Array>}
 */
export async function getStudentsByClass(classId, activeOnly = false) {
  const students = await getAllByIndex(STORES.STUDENTS, 'by_classId', classId);

  let filtered = students;
  if (activeOnly) {
    filtered = students.filter(s => s.active);
  }

  // 번호순 정렬
  return filtered.sort((a, b) => a.number - b.number);
}

/**
 * 학생 수정
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateStudent(id, updates) {
  const existing = await getStudent(id);
  if (!existing) {
    throw new Error(`학생을 찾을 수 없습니다: ${id}`);
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await put(STORES.STUDENTS, updated);
  return updated;
}

/**
 * 학생 삭제
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteStudent(id) {
  await remove(STORES.STUDENTS, id);
}

/**
 * 학급의 학생 일괄 저장 (기존 데이터 교체)
 * @param {string} classId
 * @param {Array<{number: number, name: string, gender?: string}>} studentList
 * @returns {Promise<Array>}
 */
export async function replaceStudentsForClass(classId, studentList) {
  // 기존 학생 삭제
  await removeAllByIndex(STORES.STUDENTS, 'by_classId', classId);

  // 새 학생 목록 생성
  const now = Date.now();
  const newStudents = studentList.map((s, index) => ({
    id: createStudentId(),
    classId,
    number: s.number || index + 1,
    name: s.name || '',
    gender: s.gender || '',
    notes: s.notes || '',
    lockerNo: s.lockerNo || null,
    active: true,
    createdAt: now,
    updatedAt: now,
  }));

  await putAll(STORES.STUDENTS, newStudents);
  return newStudents;
}

/**
 * 학급의 학생 일괄 업데이트 (기존 ID 유지)
 * @param {Array} students
 * @returns {Promise<void>}
 */
export async function updateStudentsBatch(students) {
  const now = Date.now();
  const updated = students.map(s => ({
    ...s,
    updatedAt: now,
  }));
  await putAll(STORES.STUDENTS, updated);
}

/**
 * 학급 학생 수 조회
 * @param {string} classId
 * @returns {Promise<number>}
 */
export async function getStudentCount(classId) {
  const students = await getStudentsByClass(classId, true);
  return students.length;
}
