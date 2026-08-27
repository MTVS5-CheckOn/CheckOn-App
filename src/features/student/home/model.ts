import type { Worksheet } from "@/features/student/worksheets/types";

/**
 * 🔴 화면 domain 타입은 계약에서 온다. mock 픽스처(`typeof studentHomeData`)가 아니다.
 * 픽스처가 타입의 원본이면 픽스처를 고칠 때마다 "타입"이 따라 바뀌어 계약 위반을 잡지 못한다.
 */
export type StudentHomeResponse = {
  studentName: string;
  /** 진행 중 attempt 가 있는 학습지. 없으면 null. */
  continuing: Worksheet | null;
  todayWorksheets: Worksheet[];
  /** 🔴 약점이 확정되지 않았으면 null 이다. 지어내지 않는다. */
  weakness: { area: string; accuracy: number | null } | null;
};

/** mock 모드 픽스처. 계약과 같은 모양이어야 한다. */
export const studentHomeData: StudentHomeResponse = {
  studentName: "김민준",
  continuing: {
    id: "l2", title: "독서 추론·전개 유형", description: "추론·전개 유형 집중",
    area: "독서", questionCount: 8, estimatedMinutes: 18, status: "in_progress", reviewedByTeacher: true,
  },
  todayWorksheets: [
    { id: "l1", title: "현대시 독해 집중훈련", description: "현대시 독해", area: "문학", questionCount: 10, estimatedMinutes: 20, status: "new", reviewedByTeacher: true },
    { id: "l2", title: "독서 추론·전개 유형", description: "추론·전개 유형 집중", area: "독서", questionCount: 8, estimatedMinutes: 18, status: "in_progress", reviewedByTeacher: true },
  ],
  weakness: { area: "독서", accuracy: 43 },
};
