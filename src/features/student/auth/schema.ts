import { z } from "zod";

export const studentLoginSchema = z.object({
  studentId: z.string().trim().min(1, "학생 ID를 입력해 주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상 입력해 주세요."),
});

export const studentSignupSchema = z.object({
  name: z.string().trim().min(2, "이름을 2자 이상 입력해 주세요."),
  grade: z.enum(["고1", "고2", "고3", "N수생"], { message: "학년을 선택해 주세요." }),
  password: z.string().min(6, "비밀번호는 6자 이상 입력해 주세요."),
  passwordConfirm: z.string(),
}).refine((values) => values.password === values.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "비밀번호가 일치하지 않습니다.",
});

export type StudentLoginValues = z.infer<typeof studentLoginSchema>;
export type StudentSignupValues = z.infer<typeof studentSignupSchema>;
