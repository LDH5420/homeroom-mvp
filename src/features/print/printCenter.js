/**
 * 서식 선택 뷰
 */

import { navigateTo } from '../../main.js';
import { setLastTemplateId, getActiveClassId } from '../../db/repositories/settingsRepo.js';
import { getStudentsByClass } from '../../db/repositories/studentsRepo.js';

// 안내 모달 표시
function showGuideModal(title, message, actionText, actionCallback) {
  const modal = document.getElementById('modal-guide');
  document.getElementById('guide-title').textContent = title;
  document.getElementById('guide-message').textContent = message;
  document.getElementById('btn-guide-action').textContent = actionText;

  // 이벤트 리스너 정리 후 재설정
  const actionBtn = document.getElementById('btn-guide-action');
  const newActionBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);

  newActionBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    actionCallback();
  });

  modal.classList.add('active');
}

// 안내 모달 닫기
function closeGuideModal() {
  document.getElementById('modal-guide').classList.remove('active');
}

/**
 * 템플릿 선택 처리
 */
async function handleTemplateSelect(templateId) {
  const classId = await getActiveClassId();

  // 반이 선택되지 않은 경우
  if (!classId) {
    showGuideModal(
      '반 설정 필요',
      '먼저 반을 선택하거나 새로 만들어주세요.\n반을 설정하면 바로 서식을 사용할 수 있어요.',
      '반 설정하러 가기',
      () => navigateTo('class')
    );
    return;
  }

  // 학생 명렬 기반 서식인 경우 학생 확인
  const studentBasedTemplates = [
    'attendance_label_v1',
    'roster_table_v1',
    'locker_label_v1',
    'seating_chart_v1'
  ];

  if (studentBasedTemplates.includes(templateId)) {
    const students = await getStudentsByClass(classId, true);
    if (students.length === 0) {
      showGuideModal(
        '학생 명렬 필요',
        '아직 학생 명렬이 입력되지 않았어요.\n명렬을 먼저 입력하면 바로 출력할 수 있어요.',
        '학생 목록 입력하기',
        () => navigateTo('students')
      );
      return;
    }
  }

  // 정상 진행
  await setLastTemplateId(templateId);
  navigateTo('preview', { templateId });
}

/**
 * 뷰 초기화
 */
export function initPrintCenter() {
  // 템플릿 메뉴 클릭
  document.querySelectorAll('.chip[data-template], .btn[data-template]').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.template;
      if (templateId) {
        handleTemplateSelect(templateId);
      }
    });
  });

  // 안내 모달 닫기
  document.getElementById('btn-guide-close')?.addEventListener('click', closeGuideModal);
  document.getElementById('btn-guide-cancel')?.addEventListener('click', closeGuideModal);
  document.getElementById('modal-guide')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeGuideModal();
    }
  });
}
