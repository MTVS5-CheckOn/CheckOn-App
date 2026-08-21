import type { QuizQuestion } from "@/features/student/quiz/types";

const BASE_OPTIONS = [
  "개념의 적용 범위를 축소한다.",
  "두 관점의 공통 전제를 비교한다.",
  "사례의 시간 순서를 재구성한다.",
  "필자의 태도 변화를 중심으로 읽는다.",
  "자료의 신뢰성을 우선 검증한다.",
];

export const quizQuestionFixtures: QuizQuestion[] = Array.from({ length: 10 }, (_, index) => ({
  id: `q${index + 1}`,
  area: index < 5 ? "독서" : "문학",
  skill: index < 5 ? "개념/지식" : "추론",
  stem: index === 0 ? "윗글을 바탕으로 보기의 내용을 이해한 것으로 가장 적절한 것은?" : `${index + 1}번 문항에서 제시한 내용을 이해한 것으로 가장 적절한 것은?`,
  passage: index === 0 ? "청산리 벽계수야 수이 감을 자랑 마라\n일도 창해하면 다시 오기 어려워라\n명월이 만공산하니 쉬어 간들 어떠리" : undefined,
  options: BASE_OPTIONS,
  correctAnswer: [2, 2, 4, 2, 4, 3, 1, 2, 4, 3][index],
  explanation: index === 0 ? "두 관점이 공유하는 전제를 먼저 확인하면 보기의 판단 근거를 찾을 수 있습니다." : "지문의 핵심 근거와 선택지의 서술 범위를 대조하면 정답을 판단할 수 있습니다.",
}));
