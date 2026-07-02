# @vuepkg/calendar playground

`npm`으로 배포된 `@vuepkg/calendar`를 그대로 설치하는 최소 예제입니다. 모노레포 workspace와 무관한 독립 프로젝트라 StackBlitz에서 바로 열립니다.

**[⚡️ StackBlitz에서 열기](https://stackblitz.com/github/vuepkg/calendar/tree/main/examples/stackblitz-demo)**

## 로컬 실행

```bash
cd examples/stackblitz-demo
npm install
npm run dev
```

## 구성

- `Booking / Reservation` 시나리오 — Week/Day 뷰에서 빈 시간대를 드래그하면 예약 생성 모달이, 기존 예약을 클릭하면 수정 모달이 열립니다.
- 이 폴더는 pnpm workspace(`pnpm-workspace.yaml`) 대상에서 제외되어 있습니다 — `@vuepkg/calendar`는 로컬 소스가 아니라 npm 레지스트리의 배포본을 설치합니다.
