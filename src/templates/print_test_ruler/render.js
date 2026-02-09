/**
 * 프린터 보정 테스트 페이지 렌더러
 * 10cm 기준선/눈금/모서리 마크
 */

export function renderPrintTestRuler(ctx) {
  const { profile } = ctx;

  const offsetX = profile?.offsetMm?.x || 0;
  const offsetY = profile?.offsetMm?.y || 0;

  return `
    <div class="sheet print-test-sheet">
      <style>
        .print-test-sheet {
          font-family: 'Malgun Gothic', sans-serif;
          font-size: 9pt;
        }

        /* 제목 */
        .test-title {
          position: absolute;
          top: 10mm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
        }

        /* 설명 */
        .test-info {
          position: absolute;
          top: 20mm;
          left: 20mm;
          right: 20mm;
          font-size: 10pt;
          line-height: 1.6;
        }

        /* 가로 10cm 기준선 */
        .ruler-h-100mm {
          position: absolute;
          top: 60mm;
          left: 20mm;
          width: 100mm;
          height: 0.5mm;
          background: #000;
        }
        .ruler-h-100mm::before {
          content: '← 100mm (10cm) →';
          position: absolute;
          top: -5mm;
          left: 0;
          width: 100mm;
          text-align: center;
          font-size: 8pt;
        }

        /* 세로 10cm 기준선 */
        .ruler-v-100mm {
          position: absolute;
          top: 80mm;
          left: 20mm;
          width: 0.5mm;
          height: 100mm;
          background: #000;
        }
        .ruler-v-100mm::before {
          content: '100mm';
          position: absolute;
          top: 50mm;
          left: 3mm;
          font-size: 8pt;
          transform: rotate(-90deg);
          transform-origin: left center;
        }

        /* mm 눈금 (가로) */
        .ruler-ticks-h {
          position: absolute;
          top: 60mm;
          left: 20mm;
        }
        .tick-h {
          position: absolute;
          width: 0.3mm;
          background: #000;
        }
        .tick-h.cm { height: 5mm; }
        .tick-h.mm5 { height: 3mm; }
        .tick-h.mm { height: 2mm; }

        /* mm 눈금 (세로) */
        .ruler-ticks-v {
          position: absolute;
          top: 80mm;
          left: 20mm;
        }
        .tick-v {
          position: absolute;
          height: 0.3mm;
          background: #000;
        }
        .tick-v.cm { width: 5mm; }
        .tick-v.mm5 { width: 3mm; }
        .tick-v.mm { width: 2mm; }

        /* 모서리 마크 */
        .corner-mark {
          position: absolute;
          width: 10mm;
          height: 10mm;
        }
        .corner-mark::before,
        .corner-mark::after {
          content: '';
          position: absolute;
          background: #000;
        }
        .corner-mark::before {
          width: 10mm;
          height: 0.5mm;
        }
        .corner-mark::after {
          width: 0.5mm;
          height: 10mm;
        }
        .corner-tl { top: 5mm; left: 5mm; }
        .corner-tr { top: 5mm; right: 5mm; }
        .corner-tr::before { right: 0; }
        .corner-tr::after { right: 0; }
        .corner-bl { bottom: 5mm; left: 5mm; }
        .corner-bl::before { bottom: 0; }
        .corner-bl::after { bottom: 0; }
        .corner-br { bottom: 5mm; right: 5mm; }
        .corner-br::before { right: 0; bottom: 0; }
        .corner-br::after { right: 0; bottom: 0; }

        /* 현재 오프셋 표시 */
        .offset-display {
          position: absolute;
          bottom: 30mm;
          left: 20mm;
          right: 20mm;
          padding: 5mm;
          border: 0.5pt solid #000;
          font-size: 10pt;
        }

        /* 보정 안내 */
        .calibration-guide {
          position: absolute;
          bottom: 60mm;
          left: 20mm;
          right: 20mm;
          font-size: 9pt;
          line-height: 1.6;
        }
      </style>

      <!-- 제목 -->
      <div class="test-title">프린터 보정 테스트</div>

      <!-- 설명 -->
      <div class="test-info">
        이 페이지를 인쇄하고 자로 측정하세요.<br>
        가로/세로 기준선이 정확히 10cm인지 확인합니다.<br>
        틀리면 오프셋 값을 조절하세요.
      </div>

      <!-- 가로 기준선 -->
      <div class="ruler-h-100mm"></div>

      <!-- 가로 눈금 -->
      <div class="ruler-ticks-h">
        ${generateHTicks()}
      </div>

      <!-- 세로 기준선 -->
      <div class="ruler-v-100mm"></div>

      <!-- 세로 눈금 -->
      <div class="ruler-ticks-v">
        ${generateVTicks()}
      </div>

      <!-- 모서리 마크 -->
      <div class="corner-mark corner-tl"></div>
      <div class="corner-mark corner-tr"></div>
      <div class="corner-mark corner-bl"></div>
      <div class="corner-mark corner-br"></div>

      <!-- 현재 오프셋 -->
      <div class="offset-display">
        <strong>현재 오프셋:</strong> X = ${offsetX}mm, Y = ${offsetY}mm
      </div>

      <!-- 보정 안내 -->
      <div class="calibration-guide">
        <strong>보정 방법:</strong><br>
        • 기준선이 10cm보다 길면: 브라우저 인쇄 배율이 100%인지 확인<br>
        • 인쇄 위치가 왼쪽/오른쪽으로 밀리면: X 오프셋 조절<br>
        • 인쇄 위치가 위/아래로 밀리면: Y 오프셋 조절<br>
        • (+) 값: 오른쪽/아래로 이동, (-) 값: 왼쪽/위로 이동
      </div>
    </div>
  `;
}

/**
 * 가로 눈금 생성
 */
function generateHTicks() {
  let html = '';
  for (let i = 0; i <= 100; i++) {
    let cls = 'tick-h mm';
    if (i % 10 === 0) cls = 'tick-h cm';
    else if (i % 5 === 0) cls = 'tick-h mm5';

    html += `<div class="${cls}" style="left: ${i}mm;"></div>`;
  }
  return html;
}

/**
 * 세로 눈금 생성
 */
function generateVTicks() {
  let html = '';
  for (let i = 0; i <= 100; i++) {
    let cls = 'tick-v mm';
    if (i % 10 === 0) cls = 'tick-v cm';
    else if (i % 5 === 0) cls = 'tick-v mm5';

    html += `<div class="${cls}" style="top: ${i}mm;"></div>`;
  }
  return html;
}
