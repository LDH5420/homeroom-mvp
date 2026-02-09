/**
 * 프린트 미리보기 뷰
 */

import { navigateTo } from '../../main.js';
import { getClass } from '../../db/repositories/classesRepo.js';
import { getStudentsByClass } from '../../db/repositories/studentsRepo.js';
import { getActiveClassId } from '../../db/repositories/settingsRepo.js';
import { getOrCreateProfile, saveProfile } from '../../db/repositories/printProfilesRepo.js';
import { getTemplate } from '../../templates/registry.js';

let currentTemplateId = null;
let currentProfile = null;
let currentContext = null;

/**
 * 미리보기 렌더링
 */
async function renderPreview() {
  const template = getTemplate(currentTemplateId);
  if (!template) {
    console.error('템플릿을 찾을 수 없음:', currentTemplateId);
    return;
  }

  // 제목 업데이트
  document.getElementById('preview-title').textContent = template.name;

  // 오프셋 값 표시
  document.getElementById('offset-x').value = currentProfile.offsetMm.x;
  document.getElementById('offset-y').value = currentProfile.offsetMm.y;

  // 컨텍스트 구성
  const classId = await getActiveClassId();
  const classInfo = classId ? await getClass(classId) : null;
  const students = classId ? await getStudentsByClass(classId, true) : [];

  currentContext = {
    classInfo,
    students,
    profile: currentProfile,
    options: {}, // 템플릿별 옵션 (추후 확장)
  };

  // 템플릿별 옵션 UI 렌더링
  renderTemplateOptions(template);

  // 인쇄 영역 렌더링
  const printArea = document.getElementById('print-area');
  const html = template.render(currentContext);
  printArea.innerHTML = html;

  // 오프셋 CSS 변수 적용
  applyOffset();
}

/**
 * 템플릿별 옵션 UI 렌더링
 */
function renderTemplateOptions(template) {
  const container = document.getElementById('template-options');

  // 기본: 옵션 없음
  if (!template.options || template.options.length === 0) {
    container.innerHTML = '<p class="text-muted">이 템플릿에는 추가 옵션이 없습니다.</p>';
    return;
  }

  // 옵션 UI 생성 (추후 구현)
  container.innerHTML = '';
}

/**
 * 오프셋 CSS 변수 적용
 */
function applyOffset() {
  const sheets = document.querySelectorAll('#print-area .sheet');
  sheets.forEach(sheet => {
    sheet.style.setProperty('--offset-x', `${currentProfile.offsetMm.x}mm`);
    sheet.style.setProperty('--offset-y', `${currentProfile.offsetMm.y}mm`);
  });
}

/**
 * 오프셋 저장
 */
async function handleSaveOffset() {
  const offsetX = parseFloat(document.getElementById('offset-x').value) || 0;
  const offsetY = parseFloat(document.getElementById('offset-y').value) || 0;

  currentProfile = await saveProfile({
    ...currentProfile,
    offsetMm: { x: offsetX, y: offsetY },
  });

  applyOffset();
  alert('보정값이 저장되었습니다.');
}

/**
 * 인쇄 실행
 */
function handlePrint() {
  // 인쇄 전 오프셋 적용 확인
  applyOffset();

  // 인쇄 출력 영역에 복사
  const printOutput = document.getElementById('print-output');
  const printArea = document.getElementById('print-area');
  printOutput.innerHTML = printArea.innerHTML;

  // 인쇄 다이얼로그 열기
  window.print();
}

/**
 * 뷰 초기화
 */
export function initPreview() {
  // 뒤로 버튼
  document.getElementById('btn-back-to-print-center').addEventListener('click', () => {
    navigateTo('print-center');
  });

  // 오프셋 변경 시 실시간 적용
  document.getElementById('offset-x').addEventListener('input', (e) => {
    currentProfile.offsetMm.x = parseFloat(e.target.value) || 0;
    applyOffset();
  });

  document.getElementById('offset-y').addEventListener('input', (e) => {
    currentProfile.offsetMm.y = parseFloat(e.target.value) || 0;
    applyOffset();
  });

  // 보정값 저장
  document.getElementById('btn-save-offset').addEventListener('click', handleSaveOffset);

  // 인쇄 버튼
  document.getElementById('btn-print').addEventListener('click', handlePrint);

  // 뷰 진입 시 데이터 로드
  window.addEventListener('viewenter', async (e) => {
    if (e.detail.view === 'preview') {
      currentTemplateId = e.detail.params?.templateId;
      if (!currentTemplateId) {
        navigateTo('print-center');
        return;
      }

      // 인쇄 프로필 로드
      const classId = await getActiveClassId();
      currentProfile = await getOrCreateProfile(currentTemplateId, classId);

      await renderPreview();
    }
  });
}
