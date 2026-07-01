# 릴리즈 가이드

`@vuepkg/calendar` 배포는 [Changesets](https://github.com/changesets/changesets) + GitHub Actions로 자동화돼 있습니다.

## 릴리즈 흐름

```
기능 개발 → changeset 추가 → main 머지
  → CI가 "Version Packages" PR 자동 생성
    → PR 머지 → CI가 npm publish 자동 실행
```

## 1. changeset 추가

기능/버그픽스 작업 후, 반드시 changeset 파일을 추가합니다.

```bash
pnpm changeset
```

대화형 프롬프트에서:
1. 패키지 선택: `@vuepkg/calendar`
2. 변경 유형 선택: `major` / `minor` / `patch`
   - `patch` — 버그픽스, 내부 리팩터
   - `minor` — 하위 호환 신규 기능 (새 prop, 새 emit, 새 export)
   - `major` — Breaking change
3. 변경 내용 요약 입력 (영문 권장)

생성된 `.changeset/xxxx.md` 파일을 커밋과 함께 PR에 포함시킵니다.

## 2. Version Packages PR

`main`에 changeset이 머지되면 `release.yml` workflow가 자동으로 **"Version Packages"** PR을 생성합니다.

이 PR이 하는 일:
- `.changeset/*.md` 파일을 읽어 버전 범프 계산
- `package.json`의 `version` 필드 업데이트
- `CHANGELOG.md` 자동 갱신
- `.changeset/*.md` 파일 삭제

::: tip
PR 내용을 검토한 뒤 머지하면 배포가 시작됩니다. 배포 전 추가 기능을 쌓으려면 PR을 열어 둔 채로 계속 개발하면 됩니다 — 새 changeset이 main에 머지될 때마다 PR이 자동 업데이트됩니다.
:::

## 3. npm Publish

Version Packages PR이 머지되면 `release.yml`이 자동으로:
1. 라이브러리 빌드 (`pnpm turbo run build:lib`)
2. `npm publish --access public` 실행

## 사전 설정 (1회)

### NPM_TOKEN 등록

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| 이름 | 값 |
|------|----|
| `NPM_TOKEN` | npm Automation token (npmjs.com → Access Tokens → Generate) |

npm token 생성 시 **Automation** 타입을 선택해야 2FA 우회가 가능합니다.

## 수동 릴리즈

자동화 없이 수동으로 배포할 때:

```bash
# 버전 범프 (changeset 기반)
pnpm changeset version

# 빌드 + 배포
pnpm --filter @vuepkg/calendar run release
```

## 버전 전략

| 변경 유형 | 버전 범프 | 예시 |
|-----------|-----------|------|
| 버그픽스, 성능 개선 | `patch` (0.1.x) | overflow 수정, E2E 수정 |
| 새 prop / emit / export | `minor` (0.x.0) | `monthWeekCount`, DnD, 반복 일정 |
| API 제거 / 타입 변경 | `major` (x.0.0) | 현재 해당 없음 |
