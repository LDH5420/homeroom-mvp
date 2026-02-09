/**
 * IndexedDB 스키마 정의
 * DB: homeroom_mvp
 * 버전: 1
 */

export const DB_NAME = 'homeroom_mvp';
export const DB_VERSION = 1;

/**
 * 데이터베이스 업그레이드 처리
 * @param {IDBDatabase} db
 * @param {IDBTransaction} transaction
 * @param {number} oldVersion
 */
export function upgradeDB(db, transaction, oldVersion) {
  // 버전 1: 초기 스키마
  if (oldVersion < 1) {
    // 1) classes - 학급
    const classesStore = db.createObjectStore('classes', { keyPath: 'id' });
    classesStore.createIndex('by_year_term_grade_class', ['schoolYear', 'term', 'grade', 'classNo'], { unique: true });
    classesStore.createIndex('by_updatedAt', 'updatedAt');

    // 2) students - 학생
    const studentsStore = db.createObjectStore('students', { keyPath: 'id' });
    studentsStore.createIndex('by_classId', 'classId');
    studentsStore.createIndex('by_classId_number', ['classId', 'number'], { unique: true });
    studentsStore.createIndex('by_classId_name', ['classId', 'name']);

    // 3) seating_plans - 자리배치
    const seatingStore = db.createObjectStore('seating_plans', { keyPath: 'id' });
    seatingStore.createIndex('by_classId', 'classId');
    seatingStore.createIndex('by_updatedAt', 'updatedAt');

    // 4) surveys - 기초조사서
    const surveysStore = db.createObjectStore('surveys', { keyPath: 'id' });
    surveysStore.createIndex('by_classId', 'classId');
    surveysStore.createIndex('by_grade', 'grade');

    // 5) votes - 학급투표
    const votesStore = db.createObjectStore('votes', { keyPath: 'id' });
    votesStore.createIndex('by_classId', 'classId');

    // 6) print_profiles - 인쇄 보정
    const printProfilesStore = db.createObjectStore('print_profiles', { keyPath: 'id' });
    printProfilesStore.createIndex('by_classId', 'classId');
    printProfilesStore.createIndex('by_templateId', 'templateId');

    // 7) app_settings - 전역 설정
    db.createObjectStore('app_settings', { keyPath: 'key' });
  }
}

/**
 * 스토어 이름 상수
 */
export const STORES = {
  CLASSES: 'classes',
  STUDENTS: 'students',
  SEATING_PLANS: 'seating_plans',
  SURVEYS: 'surveys',
  VOTES: 'votes',
  PRINT_PROFILES: 'print_profiles',
  APP_SETTINGS: 'app_settings',
};
