/**
 * 담임도구 MVP - 메인 진입점
 */

import { initDB } from './db/idb.js';
import { initClassView } from './features/class/classView.js';
import { initStudentsView } from './features/students/studentsView.js';
import { initPrintCenter } from './features/print/printCenter.js';
import { initPreview } from './features/print/previewView.js';

// 현재 활성 뷰
let currentView = 'class';

// 뷰 전환
export function navigateTo(viewName, params = {}) {
  // 모든 뷰 숨기기
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

  // 대상 뷰 표시
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    currentView = viewName;

    // 사이드바 활성 상태 업데이트
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // 뷰별 진입 처리
    window.dispatchEvent(new CustomEvent('viewenter', {
      detail: { view: viewName, params }
    }));
  }
}

// 반 정보 표시 업데이트
export function updateClassIndicator(classInfo) {
  const indicator = document.getElementById('class-indicator');
  if (classInfo) {
    indicator.textContent = `${classInfo.schoolYear} · ${classInfo.term}학기 · ${classInfo.grade}-${classInfo.classNo}`;
    indicator.style.display = 'flex';
  } else {
    indicator.textContent = '';
    indicator.style.display = 'none';
  }
}

// 사이드바 네비게이션 초기화
function initSidebar() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.dataset.view;
      if (viewName) {
        navigateTo(viewName);
      }
    });
  });
}

// 앱 초기화
async function init() {
  try {
    // IndexedDB 초기화
    await initDB();

    // 사이드바 초기화
    initSidebar();

    // 각 뷰 초기화
    initClassView();
    initStudentsView();
    initPrintCenter();
    initPreview();

    // 초기 화면 표시
    navigateTo('class');

    console.log('담임도구 MVP 초기화 완료');
  } catch (error) {
    console.error('초기화 실패:', error);
    alert('앱 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
  }
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', init);
