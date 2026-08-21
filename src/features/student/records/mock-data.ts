import type { LearningRecord } from "@/features/student/records/types";

const createQuestions = (correctCount: number): LearningRecord["questions"] =>
  Array.from({ length: 10 }, (_, index) => {
    const correct = index < correctCount;
    const correctAnswer = [2, 2, 4, 2, 4, 3, 1, 5, 4, 2][index];
    return {
      id: `record-q${index + 1}`,
      number: index + 1,
      stem: index === 0 ? "윗글을 바탕으로 보기의 내용을 이해한 것으로 가장 적절한 것은?" : `${index + 1}번 문항에서 제시한 내용을 이해한 것으로 가장 적절한 것은?`,
      answer: correct ? correctAnswer : correctAnswer === 5 ? 1 : correctAnswer + 1,
      correctAnswer,
      elapsedSeconds: [102, 130, 80, 185, 58, 77, 93, 114, 68, 121][index],
      explanation: "지문의 핵심 근거와 선택지의 서술 범위를 대조하면 정답을 판단할 수 있습니다. 정답 선택지는 지문의 공통 전제를 정확하게 반영합니다.",
    };
  });

export const learningRecordFixtures: LearningRecord[] = [
  {
    id: "r1", worksheetId: "l3", title: "화법과작문 실전 모의", date: "2026.08.18", month: "2026-08", area: "화법과작문",
    questionCount: 10, correctCount: 9, elapsedSeconds: 1028, weakness: "문학·표현",
    weaknessDescription: "위 유형에서 1문항 오답이 발생했습니다. 해당 유형 문제를 추가 풀이하면 약점을 보완할 수 있습니다.",
    trend: [{ label: "7/28", accuracy: 52 }, { label: "8/4", accuracy: 60 }, { label: "8/11", accuracy: 67 }, { label: "8/18", accuracy: 73 }],
    questions: createQuestions(9),
  },
  {
    id: "r2", worksheetId: "l4", title: "언어와 매체 핵심유형", date: "2026.08.15", month: "2026-08", area: "언어·매체",
    questionCount: 12, correctCount: 7, elapsedSeconds: 1480, weakness: "언어·문법",
    weaknessDescription: "문장 성분과 서술어 기능을 구분하는 연습이 필요합니다.",
    trend: [{ label: "7/25", accuracy: 48 }, { label: "8/1", accuracy: 52 }, { label: "8/8", accuracy: 55 }, { label: "8/15", accuracy: 58 }],
    questions: createQuestions(7),
  },
  {
    id: "r3", worksheetId: "l2", title: "독서 비문학 빠른 독해", date: "2026.08.12", month: "2026-08", area: "독서",
    questionCount: 10, correctCount: 8, elapsedSeconds: 1162, weakness: "독서·추론",
    weaknessDescription: "근거가 여러 문단에 흩어진 추론 문항을 한 번 더 확인해 보세요.",
    trend: [{ label: "7/22", accuracy: 59 }, { label: "7/29", accuracy: 65 }, { label: "8/5", accuracy: 72 }, { label: "8/12", accuracy: 80 }],
    questions: createQuestions(8),
  },
];
