/**
 * 서식/출력 센터 뷰
 */

import { navigateTo } from '../../main.js';
import { setLastTemplateId } from '../../db/repositories/settingsRepo.js';

/**
 * 템플릿 선택 처리
 */
async function handleTemplateSelect(templateId) {
  await setLastTemplateId(templateId);
  navigateTo('preview', { templateId });
}

/**
 * 뷰 초기화
 */
export function initPrintCenter() {
  // 뒤로 버튼
  document.getElementById('btn-back-to-students').addEventListener('click', () => {
    navigateTo('students');
  });

  // 템플릿 메뉴 클릭
  document.querySelectorAll('.print-menu-item, [data-template]').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.template;
      if (templateId) {
        handleTemplateSelect(templateId);
      }
    });
  });
}
