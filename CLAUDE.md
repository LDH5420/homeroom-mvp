# homeroom-mvp

선생님용 명렬표 출력 도구. 학생명렬 1번 입력 → 모든 서식 즉시 프린트.

## 기술 스택

- **프레임워크**: 없음 (Vanilla JS + Vite 빌드)
- **저장소**: IndexedDB (브라우저 로컬, 서버 저장 없음)
- **배포**: GitHub Pages (정적)
- **인쇄**: mm 단위 CSS (@page, @media print)

## 주요 기능 (6종)

1. **명렬표** - 반 생성, 학생 입력 (복붙/자동번호/성별), 자동 저장
2. **출석부 부착용** - A4 프린트, 열 수 선택, 오프셋 보정
3. **사물함 명렬표** - 격자 선택 (5×6, 6×6 등)
4. **자리바꾸기** - 랜덤/남녀교차, 자리배치표 출력
5. **학급투표** - 투표용지 + 개표집계표 출력
6. **기초조사서** - 학년별 문항, 학생별/공용 출력

## 폴더 구조

```
src/
├── main.js              # 앱 진입점
├── styles/              # CSS
├── db/                  # IndexedDB
│   ├── schema.js        # 7개 스토어 정의
│   ├── idb.js           # 연결 래퍼
│   └── repositories/    # CRUD
├── features/            # 기능별 모듈
│   ├── class/
│   ├── students/
│   ├── print/
│   ├── seating/
│   ├── surveys/
│   └── votes/
├── templates/           # 인쇄 템플릿
│   ├── registry.js
│   ├── attendance_label_v1/
│   ├── locker_label_v1/
│   ├── seating_chart_v1/
│   ├── survey_form_v1/
│   ├── vote_ballot_v1/
│   ├── vote_tally_v1/
│   └── print_test_ruler/
└── utils/               # 유틸
    ├── uuid.js
    ├── parsePaste.js
    └── mm.js
```

## IndexedDB 스토어 (7개)

| 스토어 | 용도 |
|--------|------|
| `classes` | 학급 (학년/반/학기) |
| `students` | 학생 (번호/이름/성별) |
| `seating_plans` | 자리배치 결과 |
| `surveys` | 기초조사서 문항 |
| `votes` | 투표 주제/후보 |
| `print_profiles` | 인쇄 보정값 (오프셋 X/Y mm) |
| `app_settings` | 전역 설정 |

## 인쇄 템플릿 시스템

```javascript
// 템플릿 구조
{
  id: "attendance_label_v1",
  name: "출석부 부착 명렬표",
  paper: "A4",
  orientation: "portrait",
  render: (ctx) => { /* HTML 반환 */ },
  cssPath: "./templates/attendance_label_v1/print.css"
}

// 렌더 컨텍스트
ctx = {
  classInfo,   // 반 정보
  students,    // 학생 배열
  profile,     // 인쇄 보정값
  options      // 템플릿 옵션
}
```

## 화면 구조 (4개)

1. **반 선택/관리** - 학년/반/학기 생성, 전환
2. **학생명렬 입력** - 복붙, 직접입력, 저장
3. **서식/출력 센터** - 6개 기능 버튼
4. **프린트 미리보기** - 템플릿 선택, 보정, 인쇄

## 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (dist/)
```

## GitHub Pages 배포

- `vite.config.js`에서 `base: "/homeroom-mvp/"` 설정
- GitHub Actions로 `dist/` 폴더 배포

## 코딩 컨벤션

- ES Modules 사용 (`import`/`export`)
- 클래스보다 함수 선호
- IndexedDB 작업은 항상 async/await
- 인쇄 CSS는 mm/pt 단위만 사용
- UUID 접두어: `cls_`, `stu_`, `seat_`, `srv_`, `vot_`, `pp_`

## 핵심 파일 (MVP 최소)

1. `db/schema.js` - IndexedDB 생성
2. `db/repositories/studentsRepo.js` - 학생 bulk CRUD
3. `features/print/print.js` - 인쇄 파이프라인
4. `templates/attendance_label_v1/` - 첫 템플릿
