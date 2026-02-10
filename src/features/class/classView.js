/**
 * 반 선택/관리 뷰
 */

import { navigateTo, updateClassIndicator } from '../../main.js';
import {
  createClass,
  getAllClasses,
  getClass,
  deleteClass,
} from '../../db/repositories/classesRepo.js';
import { getStudentCount } from '../../db/repositories/studentsRepo.js';
import { setActiveClassId, getActiveClassId } from '../../db/repositories/settingsRepo.js';

let activeClassId = null;

// 모달 열기/닫기
function toggleModal(show) {
  const modal = document.getElementById('modal-class');
  modal.classList.toggle('active', show);

  if (show) {
    document.getElementById('input-year').value = new Date().getFullYear();
    document.getElementById('input-term').value = '1';
    document.getElementById('input-grade').value = '1';
    document.getElementById('input-class-no').value = '1';
    document.getElementById('input-teacher').value = '';
  }
}

/**
 * 반 목록 렌더링
 */
async function renderClassList() {
  const container = document.getElementById('class-list');
  const classes = await getAllClasses();

  if (classes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📁</div>
        <p>등록된 반이 없습니다</p>
      </div>
    `;
    return;
  }

  const html = await Promise.all(classes.map(async (cls) => {
    const count = await getStudentCount(cls.id);
    const isActive = cls.id === activeClassId;

    return `
      <div class="class-item ${isActive ? 'active' : ''}" data-class-id="${cls.id}">
        <div>
          <div class="class-item-info">${cls.grade}학년 ${cls.classNo}반</div>
          <div class="class-item-meta">
            ${cls.schoolYear}년 ${cls.term}학기
            ${cls.teacherName ? `· ${cls.teacherName}` : ''}
            · ${count}명
          </div>
        </div>
        <button class="btn btn-ghost btn-sm btn-delete-class" data-class-id="${cls.id}">삭제</button>
      </div>
    `;
  }));

  container.innerHTML = html.join('');
}

/**
 * 새 반 저장
 */
async function saveNewClass() {
  const schoolYear = parseInt(document.getElementById('input-year').value, 10);
  const term = parseInt(document.getElementById('input-term').value, 10);
  const grade = parseInt(document.getElementById('input-grade').value, 10);
  const classNo = parseInt(document.getElementById('input-class-no').value, 10);
  const teacherName = document.getElementById('input-teacher').value.trim();

  try {
    const newClass = await createClass({
      schoolYear,
      term,
      grade,
      classNo,
      teacherName,
    });

    // 새로 만든 반을 활성화
    await selectClass(newClass.id);
    toggleModal(false);
    await renderClassList();
  } catch (error) {
    console.error('반 생성 실패:', error);
    alert('반 생성에 실패했습니다.');
  }
}

/**
 * 반 선택
 */
async function selectClass(classId) {
  activeClassId = classId;
  await setActiveClassId(classId);

  const classInfo = await getClass(classId);
  updateClassIndicator(classInfo);

  // 학생 입력 화면으로 이동
  navigateTo('students', { classId });
}

/**
 * 반 삭제
 */
async function handleDeleteClass(classId, e) {
  e.stopPropagation();

  if (!confirm('이 반을 삭제하시겠습니까?')) {
    return;
  }

  try {
    await deleteClass(classId);
    if (activeClassId === classId) {
      activeClassId = null;
      await setActiveClassId(null);
      updateClassIndicator(null);
    }
    await renderClassList();
  } catch (error) {
    console.error('반 삭제 실패:', error);
    alert('반 삭제에 실패했습니다.');
  }
}

/**
 * 뷰 초기화
 */
export function initClassView() {
  // 새 반 만들기 버튼 → 모달 열기
  document.getElementById('btn-add-class')?.addEventListener('click', () => {
    toggleModal(true);
  });

  // 모달 닫기
  document.getElementById('btn-modal-close')?.addEventListener('click', () => {
    toggleModal(false);
  });

  document.getElementById('btn-cancel-class')?.addEventListener('click', () => {
    toggleModal(false);
  });

  // 모달 외부 클릭 시 닫기
  document.getElementById('modal-class')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      toggleModal(false);
    }
  });

  // 저장 버튼
  document.getElementById('btn-save-class')?.addEventListener('click', saveNewClass);

  // 반 목록 클릭 (이벤트 위임)
  document.getElementById('class-list')?.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.btn-delete-class');
    if (deleteBtn) {
      await handleDeleteClass(deleteBtn.dataset.classId, e);
      return;
    }

    const classItem = e.target.closest('.class-item');
    if (classItem) {
      await selectClass(classItem.dataset.classId);
    }
  });

  // 뷰 진입 시 데이터 로드
  window.addEventListener('viewenter', async (e) => {
    if (e.detail.view === 'class') {
      // 저장된 활성 학급 복원
      const savedActiveId = await getActiveClassId();
      if (savedActiveId) {
        activeClassId = savedActiveId;
        const classInfo = await getClass(savedActiveId);
        updateClassIndicator(classInfo);
      }
      await renderClassList();
    }
  });
}

/**
 * 현재 활성 학급 ID 가져오기
 */
export function getActiveClass() {
  return activeClassId;
}
