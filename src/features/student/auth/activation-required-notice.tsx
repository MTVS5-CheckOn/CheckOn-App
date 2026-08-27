"use client";

import { Clock3 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";

/**
 * 🔴 대기 학생(PENDING_PARENT_LINK)이 학습 화면에 들어오면 서버가 403 과 함께
 * `STUDENT_ACTIVATION_REQUIRED` 를 준다 — **요청은 성공했고 이유까지 알려준 것**이다.
 * 이걸 「불러오지 못했어요」로 그리면 사용자에게 거짓말이 된다.
 * 무엇을 기다리는 중인지, 무엇을 하면 되는지 안내한다.
 */
export function isActivationRequired(error: unknown) {
  return error instanceof ApiError && error.code === "STUDENT_ACTIVATION_REQUIRED";
}

export function ActivationRequiredNotice({ what }: { what: string }) {
  return (
    <div className="px-5 py-10 text-center" role="status">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EEF4FF] text-action"><Clock3 size={28} /></span>
      <h2 className="mt-4 text-lg font-bold">계정 활성화 후 이용할 수 있어요</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        학부모님이 자녀 등록을 완료하면<br />{what}을 바로 확인할 수 있습니다.
      </p>
      <Link href={ROUTES.auth.studentActivationPending} className="mt-6 inline-flex h-[52px] items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-[#4C3024]">
        활성화 상태 확인하기
      </Link>
    </div>
  );
}
