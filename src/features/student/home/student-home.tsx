"use client";

import { ArrowRight, BookOpenCheck, ChevronRight, Clock3, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ROUTES, routeBuilders } from "@/config/routes";
import { ActivationRequiredNotice, isActivationRequired } from "@/features/student/auth/activation-required-notice";
import { useStudentHomeQuery } from "@/features/student/home/queries";
import type { Worksheet } from "@/features/student/worksheets/types";

const HOME_WORKSHEET_LIMIT = 3;

function worksheetStatus(item: Worksheet) {
  if (item.status === "new") return { label: "신규", tone: "warning" as const };
  if (item.status === "in_progress") return { label: "진행 중", tone: "info" as const };
  return { label: "완료", tone: "neutral" as const };
}

function WorksheetCard({ item }: { item: Worksheet }) {
  const status = worksheetStatus(item);

  return (
    <Link href={routeBuilders.student.solveWorksheet(item.id)} className="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action">
      <Card className={`flex min-h-[118px] items-center gap-3 p-4 transition-transform group-active:scale-[0.99] ${item.status === "new" ? "border-[#F1D8C8]" : item.status === "in_progress" ? "border-[#D6E5F0]" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><Badge>{item.area}</Badge><Badge tone={status.tone}>{status.label}</Badge></div>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-6">{item.title}</h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-subtle">
            <span className="flex items-center gap-1"><BookOpenCheck aria-hidden size={14} />{item.questionCount}문항</span>
            {item.estimatedMinutes ? <span className="flex items-center gap-1"><Clock3 aria-hidden size={14} />약 {item.estimatedMinutes}분</span> : null}
          </div>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[#A45B39]"><ChevronRight aria-hidden size={18} /></span>
      </Card>
    </Link>
  );
}

function EmptyLearningCard() {
  return (
    <Card className="border-[#F1D8C8] bg-[#FFFCF8] px-6 py-9 text-center" role="status">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand text-[#6B402C]"><BookOpenCheck aria-hidden size={22} /></span>
      <p className="mt-4 text-[15px] font-bold">오늘은 배정된 학습지가 없어요</p>
      <p className="mt-1.5 text-xs leading-5 text-muted">새 학습지가 도착하면 가장 먼저 여기에서 알려드릴게요.</p>
    </Card>
  );
}

export function StudentHome() {
  const { data, isLoading, isError, error, refetch } = useStudentHomeQuery();
  if (isLoading) return <div className="space-y-4 p-5"><div className="h-56 animate-pulse rounded-lg bg-[#F3D7C4]" /><div className="h-32 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-28 animate-pulse rounded-card bg-[#F1F3F6]" /></div>;
  if (isActivationRequired(error)) return <ActivationRequiredNotice what="오늘의 학습" />;
  if (isError || !data) return <div className="p-8 text-center"><p className="text-sm font-bold">오늘의 학습을 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;

  const { studentName, weakness, todayWorksheets, continuing } = data;
  const primaryWorksheet = continuing ?? todayWorksheets[0] ?? null;
  const queuedWorksheets = continuing ? todayWorksheets.filter((item) => item.id !== continuing.id) : todayWorksheets;
  const visibleWorksheets = queuedWorksheets.slice(0, HOME_WORKSHEET_LIMIT);
  const hiddenWorksheetCount = Math.max(0, queuedWorksheets.length - visibleWorksheets.length);
  const hasLearning = Boolean(primaryWorksheet);

  return (
    <div className="space-y-6 p-5">
      <section className="relative overflow-hidden rounded-[22px] bg-brand p-5 text-[#4C3024] shadow-[0_8px_24px_rgb(197_111_64/14%)]">
        <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/25" />
        <div className="absolute -bottom-12 right-16 size-24 rounded-full bg-[#FFF9D2]/45" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-xs font-bold text-[#8A5035]"><Sparkles aria-hidden size={15} />{weakness ? "내 약점 보완 학습" : "오늘의 체크온"}</p>
          {weakness ? (
            <>
              <h1 className="mt-2 text-[24px] font-extrabold leading-8">{weakness.area} 영역을<br />집중 보완해요</h1>
              {weakness.accuracy != null ? <div className="mt-4 flex items-center gap-3"><div className="min-w-0 flex-1"><ProgressBar value={weakness.accuracy} tone="ink" /></div><strong className="text-xs">정답률 {weakness.accuracy}%</strong></div> : null}
            </>
          ) : (
            <>
              <h1 className="mt-2 text-[24px] font-extrabold leading-8">{studentName ? `${studentName} 학생,` : ""}<br />{hasLearning ? "오늘 학습을 시작해볼까요?" : "새 학습을 준비하고 있어요"}</h1>
              <p className="mt-2 max-w-[270px] text-xs font-medium leading-5 text-[#79513D]">문제를 풀수록 나에게 꼭 필요한 약점 보완 학습이 더 정확해져요.</p>
            </>
          )}

          {primaryWorksheet ? (
            <Link href={routeBuilders.student.solveWorksheet(primaryWorksheet.id)} className="mt-5 flex min-h-12 items-center justify-between rounded-xl bg-white/80 px-4 text-sm font-bold shadow-sm backdrop-blur-sm">
              <span className="flex min-w-0 items-center gap-2"><Play aria-hidden size={16} fill="currentColor" /><span className="truncate">{continuing ? "이어서 풀기" : "오늘 학습 시작"}</span></span>
              <ArrowRight aria-hidden size={18} />
            </Link>
          ) : (
            <div className="mt-5 flex min-h-12 items-center rounded-xl bg-white/55 px-4 text-xs font-semibold text-[#79513D]">학습지가 배정되면 바로 시작할 수 있어요.</div>
          )}
        </div>
      </section>

      {continuing ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between"><div><p className="text-xs font-semibold text-subtle">이어 풀기</p><p className="mt-1 text-[17px] font-bold">하던 학습을 마저 끝내요</p></div><Badge tone="info">진행 중</Badge></div>
          <WorksheetCard item={continuing} />
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex min-h-9 items-end justify-between">
          <div><p className="text-xs font-semibold text-subtle">오늘의 학습</p><p className="mt-1 text-[17px] font-bold">{queuedWorksheets.length ? `${queuedWorksheets.length}개의 학습이 기다리고 있어요` : "오늘 학습 현황"}</p></div>
          {queuedWorksheets.length ? <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-[#9A5736]">총 {queuedWorksheets.reduce((sum, item) => sum + item.questionCount, 0)}문항</span> : null}
        </div>

        {visibleWorksheets.length ? visibleWorksheets.map((item) => <WorksheetCard key={item.id} item={item} />) : continuing ? null : <EmptyLearningCard />}

        {hiddenWorksheetCount > 0 ? (
          <Link href={ROUTES.student.worksheets} className="flex min-h-12 items-center justify-center gap-1 rounded-xl border border-border bg-surface text-sm font-semibold text-action">나머지 {hiddenWorksheetCount}개 학습 보기<ChevronRight aria-hidden size={17} /></Link>
        ) : queuedWorksheets.length ? (
          <Link href={ROUTES.student.worksheets} className="flex min-h-11 items-center justify-center gap-1 text-sm font-semibold text-action">전체 학습지 보기<ChevronRight aria-hidden size={17} /></Link>
        ) : null}
      </section>
    </div>
  );
}
