/**
 * UUID 생성 유틸리티
 */

/**
 * 접두어가 붙은 UUID 생성
 * @param {string} prefix - 접두어 (cls_, stu_, seat_, srv_, vot_, pp_)
 * @returns {string}
 */
export function createId(prefix = '') {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}${uuid}` : uuid;
}

/**
 * 학급 ID 생성
 */
export function createClassId() {
  return createId('cls_');
}

/**
 * 학생 ID 생성
 */
export function createStudentId() {
  return createId('stu_');
}

/**
 * 자리배치 ID 생성
 */
export function createSeatingId() {
  return createId('seat_');
}

/**
 * 조사서 ID 생성
 */
export function createSurveyId() {
  return createId('srv_');
}

/**
 * 투표 ID 생성
 */
export function createVoteId() {
  return createId('vot_');
}

/**
 * 인쇄 프로필 ID 생성
 */
export function createPrintProfileId() {
  return createId('pp_');
}
