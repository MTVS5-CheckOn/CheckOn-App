# 학부모 앱 UI·상태 체크리스트

Figma `Parent / Main Screens`를 구현 원장으로 사용한다. 공통 기준은 Pretendard, 390px 모바일 캔버스, 76px AppBar, 흰색 카드, `#FFC7A2` 주요 CTA다.

## 구현 완료

- 인증: 학부모 로그인, 즉시 이용 가능한 회원가입, 입력/비활성 버튼 상태
- 홈: 자녀 선택 팝오버, 알림, 월간 지표, 최신 보고서, 최근 학습 연결
- 학습기록: 월/영역 필터, 요약, 빈 목록, 상세 지표, 실제 Recharts 추이 차트
- 고급 분석: 전국 백분위, 영역별 RadarChart, 정답률 LineChart, 취약 영역 BarChart
- 보고서: 연도 필터, 목록, 상세, 공유 완료, 실제 7페이지 PDF 미리보기/이동/다운로드
- 내 정보: 자녀/강사 목록, 알림 토글, 계정 안내
- 자녀 등록: ID 입력, 조회 오류, 타 학부모 등록 충돌, 확인, 최종 등록, 학생 활성화 완료
- 초대 코드: 유효, 오류, 만료, 중복, 여러 강사 등록
- 알림: 보고서 및 학습 완료 알림과 상세 화면 연결

## API 교체 지점

- `features/parent/shared/mock-data.ts`: 학습기록, 차트, 보고서 응답 DTO로 교체
- `features/parent/shared/parent.store.ts`: 선택 자녀, Dialog 상태 등 클라이언트 상태만 유지
- 인증, 자녀 등록, 초대 코드 등록은 서버 mutation 연결 후 성공/도메인 오류 코드를 현재 UI 상태에 매핑
- 전국 백분위의 기준일·표본 설명은 API 응답과 함께 표시하고 교사 전용 데이터는 포함하지 않음

## API 연결 준비 완료

- 학부모 조회 화면은 `features/parent/api` gateway와 TanStack Query를 통해 데이터 수신
- 자녀 등록·초대 코드는 mutation과 query cache invalidation 적용
- Mock/HTTP gateway는 `NEXT_PUBLIC_DATA_SOURCE`로 전환
- 공통 timeout, network error, 인증 헤더, credentials 처리 적용
- 실제 연동 endpoint와 오류 코드 초안은 `docs/api-integration-readiness.md`에서 관리
