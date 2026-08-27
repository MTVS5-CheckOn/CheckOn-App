import { z } from "zod";

export const studentLoginSchema = z.object({
  studentId: z.string().trim().min(1, "학생 ID를 입력해 주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상 입력해 주세요."),
});

export const STUDENT_GRADES = ["고1", "고2", "고3", "N수생"] as const;
export type StudentGradeLabel = (typeof STUDENT_GRADES)[number];

/**
 * 🔴 계약의 `grade` 는 **정수 1~3** 이다 (member-api.yaml StudentSignUpRequest:1678).
 * "N수생" 에 대응하는 계약 값이 **없다.** 임의로 3 에 밀어넣지 않는다 —
 * 잘못된 학년으로 가입되고 되돌릴 방법이 없다.
 */
export const GRADE_TO_CONTRACT_VALUE: Record<StudentGradeLabel, number | null> = {
  "고1": 1,
  "고2": 2,
  "고3": 3,
  "N수생": null,
};

export const studentSignupSchema = z.object({
  name: z.string().trim().min(2, "이름을 2자 이상 입력해 주세요."),
  // 🔴 계약이 요구하는 필수 입력이다. 화면이 수집하지 않으면 가입이 400 으로 실패한다.
  email: z.string().trim().email("이메일 형식을 확인해 주세요."),
  grade: z.enum(STUDENT_GRADES, { message: "학년을 선택해 주세요." }),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해 주세요."),
  passwordConfirm: z.string(),
}).refine((values) => values.password === values.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "비밀번호가 일치하지 않습니다.",
});

export type StudentLoginValues = z.infer<typeof studentLoginSchema>;
export type StudentSignupValues = z.infer<typeof studentSignupSchema>;
