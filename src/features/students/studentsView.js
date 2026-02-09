/**
 * 학생명렬 입력 뷰
 */

import { navigateTo } from '../../main.js';
import { getClass } from '../../db/repositories/classesRepo.js';
import {
  getStudentsByClass,
  replaceStudentsForClass,
  updateStudentsBatch,
  createStudent,
  deleteStudent,
} from '../../db/repositories/studentsRepo.js';
import { getActiveClassId } from '../../db/repositories/settingsRepo.js';
import { parsePasteText } from '../../utils/parsePaste.js';

let currentClassId = null;
let students = [];

/**
 * 학생 수 업데이트
 */
function updateStudentCount() {
  const countEl = document.getElementById('student-count');
  countEl.textContent = `${students.length}명`;
}

/**
 * 학생 테이블 렌더링
 */
function renderStudentTable() {
  const tbody = document.getElementById('student-tbody');

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">학생이 없습니다</td>
      </tr>
    `;
    updateStudentCount();
    return;
  }

  const html = students.map((s, index) => `
    <tr data-student-id="${s.id}" data-index="${index}">
      <td>
        <input type="number" class="form-input form-input-sm" value="${s.number}" min="1" max="99" data-field="number">
      </td>
      <td>
        <input type="text" class="form-input form-input-sm" value="${s.name}" placeholder="이름" data-field="name">
      </td>
      <td>
        <select class="form-select form-input-sm" data-field="gender">
          <option value="">-</option>
          <option value="M" ${s.gender === 'M' ? 'selected' : ''}>남</option>
          <option value="F" ${s.gender === 'F' ? 'selected' : ''}>여</option>
        </select>
      </td>
      <td>
        <input type="text" class="form-input form-input-sm" value="${s.notes || ''}" placeholder="" data-field="notes">
      </td>
      <td>
        <button class="btn btn-ghost btn-icon btn-sm text-danger btn-delete-student" data-student-id="${s.id}">&times;</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = html;
  updateStudentCount();
}

/**
 * 붙여넣기 파싱 및 적용
 */
async function handleParsePaste() {
  const textarea = document.getElementById('paste-input');
  const text = textarea.value;

  if (!text.trim()) {
    alert('붙여넣을 내용을 입력하세요.');
    return;
  }

  const parsed = parsePasteText(text);

  if (parsed.length === 0) {
    alert('파싱된 학생이 없습니다. 형식을 확인해주세요.');
    return;
  }

  // 기존 학생과 병합할지 대체할지 확인
  let shouldReplace = true;
  if (students.length > 0) {
    shouldReplace = confirm(
      `${parsed.length}명의 학생을 파싱했습니다.\n` +
      `[확인] 기존 ${students.length}명을 대체\n` +
      `[취소] 기존 학생에 추가`
    );
  }

  if (shouldReplace) {
    students = await replaceStudentsForClass(currentClassId, parsed);
  } else {
    // 기존 학생에 추가 (번호 자동 조정)
    const maxNumber = Math.max(0, ...students.map(s => s.number));
    const newStudents = parsed.map((s, i) => ({
      ...s,
      number: maxNumber + i + 1,
    }));
    for (const s of newStudents) {
      const created = await createStudent(currentClassId, s);
      students.push(created);
    }
    students.sort((a, b) => a.number - b.number);
  }

  renderStudentTable();
  textarea.value = '';
}

/**
 * 학생 추가
 */
async function handleAddStudent() {
  const maxNumber = students.length > 0 ? Math.max(...students.map(s => s.number)) : 0;
  const newStudent = await createStudent(currentClassId, {
    number: maxNumber + 1,
    name: '',
    gender: '',
  });
  students.push(newStudent);
  renderStudentTable();

  // 새 행의 이름 input에 포커스
  const lastRow = document.querySelector('#student-tbody tr:last-child');
  if (lastRow) {
    const nameInput = lastRow.querySelector('input[data-field="name"]');
    if (nameInput) nameInput.focus();
  }
}

/**
 * 학생 삭제
 */
async function handleDeleteStudent(studentId) {
  await deleteStudent(studentId);
  students = students.filter(s => s.id !== studentId);
  renderStudentTable();
}

/**
 * 필드 변경 처리
 */
function handleFieldChange(studentId, field, value) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  if (field === 'number') {
    student.number = parseInt(value, 10) || 1;
  } else {
    student[field] = value;
  }

  // 디바운스된 저장
  scheduleAutoSave();
}

// 자동 저장 디바운스
let saveTimeout = null;
function scheduleAutoSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await updateStudentsBatch(students);
      console.log('자동 저장 완료');
    } catch (error) {
      console.error('자동 저장 실패:', error);
    }
  }, 1000);
}

/**
 * 데이터 로드
 */
async function loadStudents(classId) {
  currentClassId = classId;
  students = await getStudentsByClass(classId);
  renderStudentTable();
}

/**
 * 뷰 초기화
 */
export function initStudentsView() {
  // 붙여넣기 적용
  document.getElementById('btn-parse-paste').addEventListener('click', handleParsePaste);

  // 학생 추가
  document.getElementById('btn-add-student').addEventListener('click', handleAddStudent);

  // 출력 센터로 이동
  document.getElementById('btn-go-print').addEventListener('click', () => {
    if (students.length === 0) {
      alert('학생을 먼저 입력해주세요.');
      return;
    }
    navigateTo('print-center');
  });

  // 테이블 이벤트 위임
  document.getElementById('student-tbody').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete-student');
    if (deleteBtn) {
      handleDeleteStudent(deleteBtn.dataset.studentId);
    }
  });

  document.getElementById('student-tbody').addEventListener('change', (e) => {
    const input = e.target;
    const field = input.dataset.field;
    if (!field) return;

    const row = input.closest('tr');
    const studentId = row.dataset.studentId;
    handleFieldChange(studentId, field, input.value);
  });

  // 뷰 진입 시 데이터 로드
  window.addEventListener('viewenter', async (e) => {
    if (e.detail.view === 'students') {
      const classId = e.detail.params?.classId || await getActiveClassId();
      if (classId) {
        await loadStudents(classId);
      } else {
        navigateTo('class');
      }
    }
  });
}

/**
 * 현재 학생 목록 가져오기
 */
export function getCurrentStudents() {
  return students;
}

/**
 * 현재 학급 ID 가져오기
 */
export function getCurrentClassId() {
  return currentClassId;
}
