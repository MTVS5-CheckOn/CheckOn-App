# CheckOn-App

학생·학부모용 Check-On 웹 앱입니다. 강사용 프론트엔드와 저장소를 분리하며, Figma 디자인 파일은 읽기 전용 구현 명세로 사용합니다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Pretendard Variable
- TanStack Query: 백엔드 서버 상태
- Zustand: 문제 풀이·타이머·답안 등 클라이언트 워크플로 상태
- React Hook Form + Zod: 입력 폼과 경계 데이터 검증
- Recharts: 학습·약점·백분위 차트

## 폴더 책임

```text
src/
├── app/          라우트, 레이아웃, 로딩·에러 경계
├── components/   도메인에 의존하지 않는 공통 UI와 레이아웃
├── config/       라우트와 내비게이션 원장
├── features/     학생·학부모 기능별 화면 조립과 모델
├── lib/api/      API Client, 에러 계약, Query Key
└── stores/       화면을 넘어 유지되는 클라이언트 상태
```

페이지는 직접 API URL, 인증 헤더, 라우트 문자열을 만들지 않습니다. 서버 데이터는 Query 계층, 문제 풀이 세션은 Zustand, 폼 입력은 React Hook Form으로 분리합니다.

## 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

학생 홈은 `/student`, 학부모 홈은 `/parent`에서 확인할 수 있습니다.
