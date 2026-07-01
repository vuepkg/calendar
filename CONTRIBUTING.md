# Contributing to @vuepkg/calendar

`@vuepkg/calendar`는 단일 메인테이너가 이끄는 pnpm 모노레포입니다. 이 문서는 로컬 개발 환경 구성, 코드 변경을 제출하는 절차, 그리고 규모가 큰 기능 제안을 위한 RFC 절차를 설명합니다.

프로젝트의 방향성(어떤 기능을 왜 만드는지)은 [docs/dev/framework-roadmap.md](docs/dev/framework-roadmap.md)를 먼저 읽어보세요. "calendar가 실제로 쓰는 것만 추출한다", "범용 UI 프레임워크는 목표가 아니다" 같은 원칙이 PR 리뷰 기준이 됩니다.

---

## 1. 개발 환경 설정

**요구 사항**: Node 24+ (CI 기준), pnpm 9+

```bash
pnpm install                          # 의존성 설치 + Husky pre-push 훅 등록
pnpm --filter @vuepkg/calendar dev    # 개발 서버 (데모 앱)
```

### 모노레포 구조

```
packages/
├── core/       # @vuepkg/core   — 유틸·composable, 다른 @vuepkg 패키지에 의존하지 않음
├── theme/      # @vuepkg/theme  — CSS 변수(--vp-*)만, 런타임 JS 없음
├── ui/         # @vuepkg/ui     — calendar 내부 전용 primitive (Button/IconButton/…)
└── calendar/   # @vuepkg/calendar — 공개 패키지, ui+core를 소스 단위로 번들링
```

의존성 방향은 항상 `core ← ui ← calendar` 한 방향입니다. 역방향 참조는 금지됩니다. 자세한 내용은 [docs/dev/architecture.md](docs/dev/architecture.md) 참고.

---

## 2. 변경 사항 검증

푸시 전 아래 명령이 전부 통과해야 합니다 (Husky `pre-push` 훅이 자동 실행):

```bash
pnpm verify:push          # lint + typecheck + vitest (전 패키지)
pnpm test:e2e:ci          # 기능 E2E (Playwright, CI와 동일 스펙)
pnpm test:e2e:visual      # 시각 회귀 — UI/CSS를 건드렸을 때만
```

- **lint**: `eslint . --fix`로 자동 수정 가능한 경고는 미리 정리하세요. `warning`도 0을 목표로 합니다 (CRLF, 포맷 이슈는 `.gitattributes`로 방지됨).
- **typecheck**: `vue-tsc` 기준. 컴포넌트 prop에 `aria-*`/`data-*`를 바인딩할 때는 kebab-case가 아니라 camelCase(`:ariaLabel`)로 써야 타입 체크를 통과합니다 (Volar가 aria-*/data-*를 prop camelize 대상에서 제외하기 때문 — `packages/calendar/eslint.config.js`의 `vue/attribute-hyphenation` ignore 목록 참고).
- **vitest**: 새 로직에는 단위 테스트를 추가하세요. `describe`/`it` 네이밍은 기존 스펙 파일 스타일을 따릅니다.
- **E2E**: 사용자가 눈으로 확인하는 동작(뷰 전환, 드래그, 팝오버 등)을 바꿨다면 `packages/calendar/e2e/`에 케이스를 추가하거나 기존 케이스를 갱신하세요.

---

## 3. 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 스타일을 따릅니다:

```
<type>(<scope>): <summary>

<본문 — 무엇을 왜 바꿨는지, "어떻게"는 코드가 설명함>
```

- `type`: `feat` / `fix` / `refactor` / `docs` / `chore` / `style` / `test` / `ci`
- `scope`: 보통 패키지명(`calendar`/`core`/`ui`) 또는 생략
- 본문에 로드맵 ID가 있다면 명시 (`F4-2`, `IMP-05`, `SRV-P2-03` 등) — `docs/dev/*-backlog.md`·`roadmap.md`와 추적성을 유지하기 위함

예시는 `git log`의 기존 커밋들을 참고하세요.

---

## 4. PR 제출 절차

1. `main`에서 브랜치 생성
2. 변경 + 테스트 추가/갱신
3. `pnpm verify:push` 통과 확인
4. 공개 API(props/emits/타입)를 바꿨다면:
   - `CHANGELOG.md`의 `[Unreleased]` 섹션에 항목 추가
   - breaking change라면 PR 설명에 마이그레이션 방법 명시
   - `pnpm changeset`으로 버전 범프 의도 기록 (patch/minor/major)
5. 로드맵 항목(F4-*, IMP-*, CMP-* 등)을 완료했다면 해당 백로그 문서의 상태도 같은 PR에서 갱신 — 문서가 코드보다 뒤처지는 걸 방지

---

## 5. 큰 기능을 제안할 때 (RFC)

버그 수정이나 작은 개선은 이슈/PR로 바로 진행하면 됩니다. 다음에 해당하면 먼저 RFC(이슈로 작성)를 올려 논의하세요:

- 공개 API(새 prop, 새 emit, 타입 변경)를 추가/변경하는 경우
- `@vuepkg/ui`에 새 primitive를 추가하려는 경우 (원칙: **calendar의 실제 기능 요구가 먼저 있어야 함** — 범용 컴포넌트를 먼저 만들고 나중에 쓰는 순서는 금지)
- 아키텍처 결정(의존성 추가, 빌드 파이프라인 변경, 새 패키지 분리)이 필요한 경우
- `docs/dev/framework-roadmap.md` Phase 4의 🔴 높음 난이도 항목(F4-5 반복 일정, F4-6 Timeline 등)처럼 설계 여지가 큰 기능

### RFC 템플릿

이슈를 열 때 아래 형식을 사용하세요:

```md
## 배경
왜 이 기능/변경이 필요한가? 어떤 문제를 푸는가?

## 제안
API 초안 (props/emits/타입), 또는 아키텍처 변경 내용

## 대안
고려했지만 채택하지 않은 다른 접근 방식과 그 이유

## 영향 범위
- 공개 API 변경 여부 (breaking 여부)
- 번들 사이즈 영향 (F4-9 size-limit 예산 참고)
- 영향받는 패키지/파일

## 로드맵 연결
관련 백로그 ID (예: F4-5) 또는 신규 ID 제안
```

RFC가 합의되면 `docs/dev/framework-roadmap.md`(또는 해당 백로그 문서)에 항목을 등록한 뒤 구현을 시작합니다.

---

## 6. 기능 추가 체크리스트

새 기능 PR을 열기 전 스스로 점검하세요:

- [ ] `vue-tsc` 타입 체크 통과 (`pnpm turbo run typecheck`)
- [ ] `eslint` 경고 0건 (`pnpm turbo run lint`)
- [ ] 단위 테스트 추가/갱신 (Vitest)
- [ ] 사용자 동작을 바꿨다면 E2E 추가/갱신 (Playwright)
- [ ] 공개 API 변경 시 `CHANGELOG.md` + `pnpm changeset` 기록
- [ ] a11y: 키보드 조작 가능? `aria-*` 속성 필요한가? (`aria-*`/`data-*`는 camelCase로 바인딩 — §2 참고)
- [ ] CSS를 추가했다면 하드코딩 색상/치수 대신 `--vp-*` 토큰 사용 (없으면 `packages/theme`에 추가)
- [ ] 관련 로드맵/백로그 문서(`docs/dev/*.md`) 상태 갱신

---

## 참고 문서

- [docs/dev/architecture.md](docs/dev/architecture.md) — 컴포넌트 구조·API·테스트 계층
- [docs/dev/framework-roadmap.md](docs/dev/framework-roadmap.md) — 비전·Phase별 로드맵·기술 부채
- [docs/dev/roadmap.md](docs/dev/roadmap.md) — 기능 개선 백로그(IMP-*)
- [docs/guide/theming.md](docs/guide/theming.md) — 테마 토큰 레퍼런스
