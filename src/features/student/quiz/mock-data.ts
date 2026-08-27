import type { AttemptItemResult, QuizQuestion } from "@/features/student/quiz/types";

const BASE_OPTIONS = [
  "개념의 적용 범위를 축소한다.",
  "두 관점의 공통 전제를 비교한다.",
  "사례의 시간 순서를 재구성한다.",
  "필자의 태도 변화를 중심으로 읽는다.",
  "자료의 신뢰성을 우선 검증한다.",
];

const CORRECT_NOS = [2, 2, 4, 2, 4, 3, 1, 2, 4, 3];

/**
 * 🔴 풀이용 픽스처에는 정답·해설이 없다 — 계약의 `AttemptItem` 과 같은 모양이다.
 * 정답은 아래 `mockAnswerKey` 에만 있고, mock gateway 의 **채점 시점**에만 쓴다.
 * 화면은 서버(=mock gateway)가 채점한 결과만 본다.
 */
export const quizQuestionFixtures: QuizQuestion[] = Array.from({ length: 10 }, (_, index) => ({
  itemId: `item-${index + 1}`,
  ordinal: index + 1,
  areaTag: index < 5 ? "reading" : "literature",
  typeTag: index < 5 ? "concept" : "infer",
  stem: index === 0
    ? "윗글을 바탕으로 보기의 내용을 이해한 것으로 가장 적절한 것은?"
    : `${index + 1}번 문항에서 제시한 내용을 이해한 것으로 가장 적절한 것은?`,
  passage: index === 0
    ? "청산리 벽계수야 수이 감을 자랑 마라\n일도 창해하면 다시 오기 어려워라\n명월이 만공산하니 쉬어 간들 어떠리"
    : null,
  options: BASE_OPTIONS.map((text, optionIndex) => ({ no: optionIndex + 1, text })),
}));

/** 🔴 mock gateway 내부 전용. 화면이 import 하면 로컬 채점이 되살아난다. */
const mockAnswerKey = new Map(quizQuestionFixtures.map((question, index) => [question.itemId, CORRECT_NOS[index]]));

const explanationFor = (ordinal: number) => ordinal === 1
  ? "두 관점이 공유하는 전제를 먼저 확인하면 보기의 판단 근거를 찾을 수 있습니다."
  : "지문의 핵심 근거와 선택지의 서술 범위를 대조하면 정답을 판단할 수 있습니다.";

/** mock gateway 가 서버처럼 채점한다. 화면은 이 결과만 본다. */
export function scoreMockAttempt(
  questions: QuizQuestion[],
  answers: Record<string, number>,
  elapsedByItem: Record<string, number>,
): AttemptItemResult[] {
  return questions.map((question) => {
    const correctNo = mockAnswerKey.get(question.itemId) ?? 1;
    const selectedNo = answers[question.itemId] ?? null;
    return {
      ...question,
      selectedNo,
      correctNo,
      correct: selectedNo === correctNo,
      explanation: explanationFor(question.ordinal),
      activeElapsedSeconds: elapsedByItem[question.itemId] ?? 0,
    };
  });
}
