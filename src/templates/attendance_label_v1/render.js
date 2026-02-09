/**
 * 출석부 부착 명렬표 렌더러
 * A4 세로 (210mm × 297mm)
 */

/**
 * 명렬표 렌더링
 * @param {object} ctx - 렌더링 컨텍스트
 * @param {object} ctx.classInfo - 학급 정보
 * @param {Array} ctx.students - 학생 목록
 * @param {object} ctx.profile - 인쇄 프로필
 * @param {object} ctx.options - 템플릿 옵션
 * @returns {string} HTML 문자열
 */
export function renderAttendanceLabel(ctx) {
  const { classInfo, students, profile, options } = ctx;

  const columns = options.columns || 2;
  const totalStudents = students.length;

  // 열당 행 수 계산
  const rowsPerColumn = Math.ceil(totalStudents / columns);

  // 셀 크기 계산 (mm)
  const pageWidth = 210;
  const pageHeight = 297;
  const marginTop = 15;
  const marginBottom = 10;
  const marginLeft = 10;
  const marginRight = 10;

  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const cellWidth = contentWidth / columns;
  const cellHeight = contentHeight / Math.max(rowsPerColumn, 20); // 최소 20행

  // 학급 정보 문자열
  const classTitle = classInfo
    ? `${classInfo.grade}학년 ${classInfo.classNo}반`
    : '';

  // 열별로 학생 분배
  const columnsData = [];
  for (let col = 0; col < columns; col++) {
    const startIdx = col * rowsPerColumn;
    const endIdx = Math.min(startIdx + rowsPerColumn, totalStudents);
    columnsData.push(students.slice(startIdx, endIdx));
  }

  // HTML 생성
  let html = `
    <div class="sheet attendance-sheet">
      <style>
        .attendance-sheet {
          font-family: 'Malgun Gothic', sans-serif;
          font-size: 10pt;
        }
        .attendance-header {
          position: absolute;
          top: 5mm;
          left: ${marginLeft}mm;
          right: ${marginRight}mm;
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
        }
        .attendance-table {
          position: absolute;
          top: ${marginTop}mm;
          left: ${marginLeft}mm;
          display: flex;
          gap: 0;
        }
        .attendance-column {
          display: flex;
          flex-direction: column;
        }
        .attendance-cell {
          width: ${cellWidth}mm;
          height: ${cellHeight}mm;
          border: 0.3pt solid #000;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding: 0 2mm;
        }
        .attendance-cell .number {
          width: 8mm;
          font-weight: bold;
          text-align: right;
          margin-right: 2mm;
        }
        .attendance-cell .name {
          flex: 1;
        }
        .attendance-cell.empty {
          border-color: #ccc;
        }
      </style>

      <div class="attendance-header">${classTitle} 명렬표</div>

      <div class="attendance-table">
  `;

  // 각 열 렌더링
  for (let col = 0; col < columns; col++) {
    html += '<div class="attendance-column">';

    const columnStudents = columnsData[col];
    for (let row = 0; row < rowsPerColumn; row++) {
      const student = columnStudents[row];
      if (student) {
        html += `
          <div class="attendance-cell">
            <span class="number">${student.number}</span>
            <span class="name">${student.name}</span>
          </div>
        `;
      } else {
        html += `
          <div class="attendance-cell empty">
            <span class="number"></span>
            <span class="name"></span>
          </div>
        `;
      }
    }

    html += '</div>';
  }

  html += `
      </div>
    </div>
  `;

  return html;
}
