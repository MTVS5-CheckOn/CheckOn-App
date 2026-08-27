/**
 * 🔴 풀이 화면 타입과 결과 화면 타입을 **갈라둔다.**
 *
 * 백엔드 절대 규칙 4 — 미제출 attempt 응답에 `correctAnswer`·`explanation`·`correct` 를 넣지 않는다.
 * 프론트가 그 값을 가진 타입 하나로 두 화면을 그리면, 서버가 감춘 정답을 화면이 다시 들고 오게 된다.
 * 타입으로 갈라야 풀이 화면이 **없는 값을 읽을 수 없다.**
 */

export type QuizOption = { no: number; text: string };

/** 풀이 중 문항. 🔴 정답·해설 필드가 존재하지 않는다. */
export type QuizQuestion = {
  itemId: string;
  ordinal: number;
  stem: string;
  passage?: string | null;
  areaTag?: string | null;
  typeTag?: string | null;
  options: QuizOption[];
};

export type AttemptInProgress = {
  attemptId: string;
  assignmentId: string;
  status: "IN_PROGRESS";
  /** optimistic lock. progress 요청의 baseVersion 에 넣는다. */
  version: number;
  startedAt?: string | null;
  currentItemId?: string | null;
  totalActiveElapsedSeconds: number;
  /** 🔴 키는 itemId(UUID) 다. `q1` 같은 문자열이 아니다. */
  answers: Record<string, number>;
  activeElapsedSecondsByItem: Record<string, number>;
  items: QuizQuestion[];
};

/** 채점 결과 문항. 정답·해설은 **여기에만** 있다. */
export type AttemptItemResult = QuizQuestion & {
  /** 미응답이면 null */
  selectedNo: number | null;
  correctNo: number;
  correct: boolean;
  /** 🔴 정답 문항도 해설을 포함한다. */
  explanation: string;
  activeElapsedSeconds: number;
};

export type AttemptResult = {
  attemptId: string;
  assignmentId: string;
  status: "SCORED";
  submittedAt?: string | null;
  scoredAt?: string | null;
  itemCount: number;
  correctCount: number;
  /** 🔴 0~1 이다. ×100 은 표시 계층에서 한 번만. */
  accuracyRate: number;
  totalActiveElapsedSeconds: number;
  learningRecordId?: string | null;
  items: AttemptItemResult[];
};

export type AttemptProgressRequest = {
  baseVersion: number;
  /** 클라이언트 단조 증가 시퀀스. 같은 값 재전송은 서버가 멱등 처리한다. */
  clientSequence: number;
  currentItemId?: string | null;
  /** 변경된 항목만 보낸다. */
  answers?: Record<string, number>;
  activeElapsedSecondsDelta?: Record<string, number>;
};

export type AttemptProgressResult = {
  attemptId: string;
  version: number;
  totalActiveElapsedSeconds: number;
  savedAt?: string | null;
  /** 같은 clientSequence 재전송이라 무시했으면 true. */
  duplicated?: boolean | null;
};

export type AttemptSubmitRequest = {
  baseVersion: number;
  answers?: Record<string, number>;
  activeElapsedSecondsDelta?: Record<string, number>;
};

export type AttemptSubmitted = {
  attemptId: string;
  assignmentId: string;
  status: "SUBMITTED";
  version: number;
  submittedAt: string;
};

/** 🔴 단일 요청 항목당 상한 600초. 초과는 서버가 400 으로 거절한다. */
export const MAX_ELAPSED_DELTA_SECONDS = 600;
