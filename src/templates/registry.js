/**
 * 템플릿 레지스트리
 * 모든 인쇄 템플릿을 등록하고 관리
 */

import { renderAttendanceLabel } from './attendance_label_v1/render.js';
import { renderPrintTestRuler } from './print_test_ruler/render.js';

/**
 * 템플릿 정의
 */
export const templates = [
  {
    id: 'attendance_label_v1',
    name: '출석부 부착 명렬표',
    description: 'A4 세로, 출석부에 붙이는 명렬표',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 0, right: 0, bottom: 0, left: 0 },
    render: renderAttendanceLabel,
    options: [
      { id: 'columns', label: '열 수', type: 'select', values: [2, 3, 4], default: 2 },
    ],
  },
  {
    id: 'roster_table_v1',
    name: '명렬표 (표)',
    description: 'A4 세로, 번호/이름/성별 표 형식',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    render: (ctx) => '<div class="sheet"><p>명렬표 템플릿 (준비 중)</p></div>',
    options: [],
  },
  {
    id: 'locker_label_v1',
    name: '사물함 명렬표',
    description: 'A4, 사물함 격자에 맞춘 라벨',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 0, right: 0, bottom: 0, left: 0 },
    render: (ctx) => '<div class="sheet"><p>사물함 템플릿 (준비 중)</p></div>',
    options: [
      { id: 'cols', label: '가로 칸', type: 'number', default: 6 },
      { id: 'rows', label: '세로 칸', type: 'number', default: 5 },
    ],
  },
  {
    id: 'seating_chart_v1',
    name: '자리배치표',
    description: 'A4, 교실 자리 배치도',
    paper: 'A4',
    orientation: 'landscape',
    defaultMarginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    render: (ctx) => '<div class="sheet landscape"><p>자리배치표 템플릿 (준비 중)</p></div>',
    options: [],
  },
  {
    id: 'survey_form_v1',
    name: '기초조사서',
    description: 'A4 세로, 학생별 조사서',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 15, right: 15, bottom: 15, left: 15 },
    render: (ctx) => '<div class="sheet"><p>기초조사서 템플릿 (준비 중)</p></div>',
    options: [],
  },
  {
    id: 'vote_ballot_v1',
    name: '투표용지',
    description: 'A4, 절취선 포함 투표용지',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 0, right: 0, bottom: 0, left: 0 },
    render: (ctx) => '<div class="sheet"><p>투표용지 템플릿 (준비 중)</p></div>',
    options: [],
  },
  {
    id: 'vote_tally_v1',
    name: '개표 집계표',
    description: 'A4, 후보별 득표 집계용',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 10, right: 10, bottom: 10, left: 10 },
    render: (ctx) => '<div class="sheet"><p>개표 집계표 템플릿 (준비 중)</p></div>',
    options: [],
  },
  {
    id: 'print_test_ruler',
    name: '프린터 보정 테스트',
    description: '10cm 기준선/눈금으로 프린터 정확도 확인',
    paper: 'A4',
    orientation: 'portrait',
    defaultMarginMm: { top: 0, right: 0, bottom: 0, left: 0 },
    render: renderPrintTestRuler,
    options: [],
  },
];

/**
 * ID로 템플릿 조회
 * @param {string} templateId
 * @returns {object|undefined}
 */
export function getTemplate(templateId) {
  return templates.find(t => t.id === templateId);
}

/**
 * 모든 템플릿 목록
 * @returns {Array}
 */
export function getAllTemplates() {
  return templates;
}
