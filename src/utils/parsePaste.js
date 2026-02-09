/**
 * 붙여넣기 텍스트 파싱 유틸리티
 * 엑셀/한글에서 복사한 명렬을 파싱
 */

/**
 * 붙여넣기 텍스트를 학생 배열로 파싱
 * 지원 형식:
 * - "번호\t이름" (탭 구분, 엑셀)
 * - "번호 이름" (공백 구분)
 * - "이름" (번호 자동 부여)
 * - 번호와 이름이 줄바꿈으로 분리된 경우 (한글 표)
 *   1
 *   김민수
 *   2
 *   이서연
 *
 * @param {string} text - 붙여넣기 텍스트
 * @returns {Array<{number: number, name: string, gender: string}>}
 */
export function parsePasteText(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 패턴 감지: 홀수 줄이 숫자, 짝수 줄이 이름인 경우 (한글 표)
  if (isAlternatingNumberNamePattern(lines)) {
    return parseAlternatingLines(lines);
  }

  // 기존 파싱 로직
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
      // 한 단어만 있는 경우
      const firstNum = parseInt(parts[0], 10);
      if (!isNaN(firstNum) && firstNum > 0 && firstNum <= 99) {
        // 숫자만 있으면 건너뛰기
        continue;
      }
      // 이름만 있는 경우
      number = autoNumber++;
      name = parts[0];
    }

    if (name && !isOnlyNumber(name)) {
      students.push({ number, name, gender });
    }
  }

  // 번호순 정렬
  students.sort((a, b) => a.number - b.number);

  return students;
}

/**
 * 줄이 번호-이름 교대 패턴인지 확인
 * @param {string[]} lines
 * @returns {boolean}
 */
function isAlternatingNumberNamePattern(lines) {
  if (lines.length < 4) return false;

  // 처음 6줄 확인 (3쌍)
  const checkCount = Math.min(6, lines.length);
  let matchCount = 0;

  for (let i = 0; i < checkCount - 1; i += 2) {
    const first = lines[i];
    const second = lines[i + 1];

    // 첫 줄이 숫자이고, 두 번째 줄이 이름(한글 포함)인지
    const isFirstNumber = /^\d+$/.test(first);
    const isSecondName = /[가-힣a-zA-Z]/.test(second) && !/^\d+$/.test(second);

    if (isFirstNumber && isSecondName) {
      matchCount++;
    }
  }

  // 최소 2쌍 이상 매칭되면 이 패턴으로 판단
  return matchCount >= 2;
}

/**
 * 번호-이름 교대 패턴 파싱
 * @param {string[]} lines
 * @returns {Array}
 */
function parseAlternatingLines(lines) {
  const students = [];

  for (let i = 0; i < lines.length - 1; i += 2) {
    const numberLine = lines[i];
    const nameLine = lines[i + 1];

    const number = parseInt(numberLine, 10);
    const name = nameLine.trim();

    if (!isNaN(number) && name && !isOnlyNumber(name)) {
      students.push({
        number,
        name,
        gender: ''
      });
    }
  }

  return students.sort((a, b) => a.number - b.number);
}

/**
 * 문자열이 숫자로만 이루어져 있는지 확인
 * @param {string} str
 * @returns {boolean}
 */
function isOnlyNumber(str) {
  return /^\d+$/.test(str.trim());
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
