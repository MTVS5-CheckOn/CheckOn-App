import type { ZodType } from "zod";
import { ApiError } from "@/lib/api/errors";

/**
 * gateway 경계에서 응답을 계약과 대조한다.
 *
 * 🔴 계약과 실제 응답이 다르면 **여기서 터진다.** 조용히 undefined 로 흘려보내면
 * 화면이 빈칸으로 뜨고 원인을 찾을 수 없다.
 *
 * 🔴 스키마에 `.strict()` 를 쓰지 않는다. 백엔드가 필드를 추가하면 앱 전체가 502 가 된다.
 * zod 기본 동작(모르는 키 strip)을 그대로 쓴다.
 */
export function parseApiResponse<T>(schema: ZodType<T>, payload: unknown, context: string): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      `API 응답이 계약과 다릅니다 (${context}).`,
      502,
      // 🔴 envelope 모양 위반(INVALID_API_ENVELOPE)과는 다른 실패다.
      "INVALID_API_RESPONSE",
      parsed.error.issues,
    );
  }
  return parsed.data;
}
