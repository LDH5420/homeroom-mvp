/**
 * 붙여넣기 텍스트 파싱 유틸리티
 * 엑셀/한글에서 복사한 명렬을 파싱
 */

/**
 * 붙여넣기 텍스트를 학생 배열로 파싱
 * 지원 형식:
 * - "번호\t이름" (탭 구분)
 * - "번호 이름" (공백 구분)
 * - "이름" (번호 자동 부여)
 *
 * @param {string} text - 붙여넣기 텍스트
 * @returns {Array<{number: number, name: string, gender: string}>}
 */
export function parsePasteText(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.trim().split(/\r?\n/);
  const students = [];
  let autoNumber = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 탭 구분 시도
    let parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);

    // 탭이 없으면 공백 구분 시도
    if (parts.length === 1) {
      parts = trimmed.split(/\s+/).filter(Boolean);
    }

    let number, name, gender = '';

    if (parts.length >= 2) {
      // 첫 번째가 숫자인지 확인
      const firstNum = parseInt(parts[0], 10);
      if (!isNaN(firstNum) && firstNum > 0 && firstNum <= 99) {
        number = firstNum;
        name = parts[1];
        // 3번째가 있으면 성별로 처리
        if (parts.length >= 3) {
          const g = parts[2].toUpperCase();
          if (g === 'M' || g === '남' || g === '남자') gender = 'M';
          else if (g === 'F' || g === '여' || g === '여자') gender = 'F';
        }
      } else {
        // 첫 번째가 숫자가 아니면 이름으로 처리
        number = autoNumber++;
        name = parts[0];
        // 2번째가 성별인지 확인
        const g = parts[1].toUpperCase();
        if (g === 'M' || g === '남' || g === '남자') gender = 'M';
        else if (g === 'F' || g === '여' || g === '여자') gender = 'F';
        else {
          // 성별이 아니면 이름에 포함
          name = parts.join(' ');
        }
      }
    } else {
      // 이름만 있는 경우
      number = autoNumber++;
      name = parts[0];
    }

    if (name) {
      students.push({ number, name, gender });
    }
  }

  // 번호순 정렬
  students.sort((a, b) => a.number - b.number);

  return students;
}

/**
 * 학생 목록을 번호 기준으로 재정렬
 * @param {Array} students
 * @returns {Array}
 */
export function renumberStudents(students) {
  return students
    .filter(s => s.name && s.name.trim())
    .sort((a, b) => a.number - b.number)
    .map((s, i) => ({ ...s, number: i + 1 }));
}
