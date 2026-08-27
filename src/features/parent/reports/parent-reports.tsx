"use client";

import { CheckCircle2, ChevronRight, Download, FileText, Info, MessageSquareText, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { isAccessExpired, reportFileGateway } from "@/features/parent/api/file-gateway";
import { routeBuilders } from "@/config/routes";
import { useParentReportQuery, useParentReportsQuery } from "@/features/parent/api/queries";
import { useSelectedChild } from "@/features/parent/shared/parent.store";

export function ParentReportList() {
  const [year, setYear] = useState<number | null>(null);
  const child = useSelectedChild();
  const { data = [], isLoading, isError, refetch } = useParentReportsQuery(child?.studentId ?? "");
  const years = useMemo(() => [...new Set(data.map((item) => item.year))].sort((a, b) => b - a), [data]);
  const selectedYear = year && years.includes(year) ? year : years[0] ?? null;
  const reports = data.filter((item) => item.year === selectedYear);
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-10 w-24 animate-pulse rounded-lg bg-[#E9EDF2]" /><div className="h-56 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">보고서를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  return <div className="px-5 py-4">{years.length ? <select aria-label="보고서 연도" value={selectedYear ?? ""} onChange={(event) => setYear(Number(event.target.value))} className="mb-4 h-10 rounded-lg bg-transparent text-base font-bold outline-none">{years.map((item) => <option key={item} value={item}>{item}년</option>)}</select> : null}{reports.length ? <section className="overflow-hidden rounded-card border border-border bg-surface">{reports.map((report) => <Link key={report.id} href={routeBuilders.parent.report(report.id)} className={`flex min-h-[76px] items-center gap-3 border-b border-divider px-4 py-3 last:border-0 ${report.isNew ? "bg-[#FFFDF0]" : ""}`}><div className="min-w-0 flex-1"><div className="flex items-center gap-2">{report.isNew ? <span className="rounded-md bg-brand px-2 py-1 text-[11px] font-bold text-[#7D452C]">NEW</span> : null}<h2 className="font-bold">{report.year}년 {report.month}월</h2></div><p className="mt-1 text-xs text-subtle">{report.teacher} · {report.issuedAt} 발행</p></div>{!report.isNew ? <span className="text-xs text-subtle">확인</span> : null}<ChevronRight size={17} className="text-subtle" /></Link>)}</section> : <EmptyReport />}</div>;
}

export function ParentReportDetail({ reportId }: { reportId: string }) {
  const child = useSelectedChild();
  const { data: report, isLoading, isError, refetch } = useParentReportQuery(child?.studentId ?? "", reportId);
  const [shared, setShared] = useState(false);
  if (isLoading) return <div className="space-y-3 p-5"><div className="h-56 animate-pulse rounded-card bg-[#E9EDF2]" /><div className="h-40 animate-pulse rounded-card bg-[#E9EDF2]" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">보고서를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!report) return <div className="p-8 text-center text-sm text-muted">보고서를 찾을 수 없습니다.</div>;
  async function share() {
    const data = { title: `Check-On ${report!.year}년 ${report!.month}월 보고서`, text: `${report!.studentName} 학생의 월별 학습 보고서입니다.`, url: window.location.href };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(window.location.href); setShared(true); } catch { return; }
  }
  const { summary } = report;
  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col">
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs text-subtle">{report.studyPeriod}</p><p className="mt-1 text-sm font-bold">{report.studentName} 학생 · {report.teacher}</p></div><button onClick={share} className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-action"><Share2 size={17} />공유</button></div>
        {shared ? <div className="flex items-center gap-2 rounded-xl bg-[#E8F6F1] p-3 text-sm font-semibold text-[#26856B]"><CheckCircle2 size={18} />보고서 링크를 공유했습니다.</div> : null}

        <section className="rounded-card border border-border bg-surface p-5 shadow-[var(--checkon-shadow-card)]">
          <div className="flex items-center justify-between"><div><p className="text-xs text-muted">월별 학습 보고서</p><h2 className="mt-1 text-xl font-bold">{report.year}년 {report.month}월</h2></div><span className="rounded-lg bg-brand-soft px-3 py-2 text-xs font-bold text-[#7D452C]">발행 완료</span></div>
          <dl className="mt-5 grid grid-cols-3 text-center"><Summary value={`${summary.accuracy}%`} label="정답률" /><Summary value={`+${summary.weaknessImprovement}%p`} label="약점 개선도" action /><Summary value={summary.priorityArea} label="우선 보완" danger /></dl>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#F7F8FA] p-3 text-center"><div><strong className="text-sm">{summary.gradedQuestionCount}문항</strong><p className="mt-1 text-[10px] text-subtle">판정에 사용한 기록</p></div><div className="border-l border-divider"><strong className="text-sm text-[#E85A4F]">{summary.repeatedMistakeCount}건</strong><p className="mt-1 text-[10px] text-subtle">최근 반복 실수</p></div></div>
          <p className="mt-3 text-center text-[11px] text-subtle">우선 보완 영역 정답률 · {summary.comparisonMonth} 대비</p>
        </section>

        <section className="rounded-card border border-[#FFD2B8] bg-[#FFF8F3] p-4">
          <div className="flex items-center gap-2"><MessageSquareText size={18} className="text-[#C9572B]" /><h2 className="text-sm font-bold">선생님 의견</h2></div>
          <p className="mt-3 text-sm leading-6 text-muted">{report.teacherComment}</p>
        </section>

        <section className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold">보고서에 포함된 분석</h2><span className="text-[11px] text-subtle">{report.sections.length}개 항목</span></div>
          {report.sections.length === 0 ? <p className="mt-3 rounded-xl bg-[#F7F8FA] p-4 text-center text-xs text-muted">이 보고서에는 아직 표시할 분석 항목이 없습니다.</p> : null}<div className="mt-3 divide-y divide-divider">{report.sections.map((section) => <div key={section.title} className="flex items-center gap-3 py-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${section.status === "available" ? "bg-[#E8F6F1] text-[#26856B]" : "bg-[#F0F2F5] text-subtle"}`}>{section.status === "available" ? <CheckCircle2 size={16} /> : <Info size={16} />}</span><div className="min-w-0"><p className="text-sm font-semibold">{section.title}</p><p className="mt-0.5 text-[11px] text-subtle">{section.description}</p></div></div>)}</div>
        </section>

        <Link href={routeBuilders.parent.newConsultation({ type: "report", id: report.id, label: `${report.year}년 ${report.month}월 월별 보고서`, detail: `정답률 ${summary.accuracy}% · 약점 개선도 +${summary.weaknessImprovement}%p · 우선 보완 ${summary.priorityArea}` })} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">이 보고서로 상담 요청</Link>
        <div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#EEF7FF] p-3 text-xs leading-5 text-muted"><Info size={17} className="mt-0.5 shrink-0 text-action" />강사가 실제 학습 기록과 판정 근거를 확인한 뒤 발행한 보고서입니다.</div>
      </div>
      <div className="sticky bottom-0 mt-auto border-t border-divider bg-surface p-5">{report.hasPdf
        ? <Link href={routeBuilders.parent.reportPdf(report.id)} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">PDF 보고서 전체 보기</Link>
        // 🔴 hasPdf:false 는 오류가 아니라 계약이 허용하는 정상 상태다. 버튼을 숨기지 말고 이유를 밝힌다.
        : <div className="flex h-[52px] items-center justify-center rounded-xl bg-[#F0F2F5] text-sm font-semibold text-subtle" role="status">PDF 파일은 아직 준비되지 않았어요</div>}</div>
    </div>
  );
}

export function ParentPdfViewer({ reportId }: { reportId: string }) {
  const child = useSelectedChild();
  const { data: report, isLoading, isError, refetch } = useParentReportQuery(child?.studentId ?? "", reportId);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  /**
   * 🔴 signed URL 은 수명이 짧다. 상태에 담아두지 않고 열 때마다 새로 발급받는다.
   * 그래서 useQuery 로 캐시하지 않는다.
   */
  async function openPdf() {
    if (!child?.studentId) return;
    setPending(true);
    setFailed(false);
    try {
      const access = await reportFileGateway.requestAccess(child.studentId, reportId);
      if (isAccessExpired(access)) throw new Error("발급된 링크가 이미 만료되었습니다.");
      window.open(access.url, "_blank", "noopener,noreferrer");
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  if (isLoading) return <div className="grid min-h-[calc(100dvh-76px)] place-items-center bg-app"><span className="size-8 animate-spin rounded-full border-4 border-[#E9EDF2] border-t-brand" aria-label="보고서 불러오는 중" /></div>;
  if (isError) return <div className="p-8 text-center"><p className="text-sm font-bold">PDF 보고서를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  if (!report) return <div className="p-8 text-center text-sm text-muted">보고서를 찾을 수 없습니다.</div>;

  // 🔴 hasPdf:false 는 계약이 허용하는 정상 상태다. 오류 화면이 아니라 빈 상태로 그린다.
  if (!report.hasPdf) {
    return (
      <div className="grid min-h-[calc(100dvh-76px)] place-items-center px-5">
        <section className="w-full rounded-card border border-border bg-surface px-5 py-12 text-center" role="status">
          <FileText className="mx-auto text-subtle" size={28} />
          <p className="mt-3 text-sm font-bold">PDF 파일이 아직 준비되지 않았어요</p>
          <p className="mt-1 text-xs leading-5 text-muted">보고서 내용은 상세 화면에서 지금 바로 확인할 수 있어요.<br />PDF 는 준비되는 대로 이곳에서 열 수 있습니다.</p>
          <Link href={routeBuilders.parent.report(report.id)} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-[#A9D4F2] px-5 text-sm font-bold text-[#2F6FA7]">보고서 상세로 돌아가기</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100dvh-76px)] place-items-center px-5">
      <section className="w-full rounded-card border border-border bg-surface px-5 py-12 text-center">
        <FileText className="mx-auto text-[#D96534]" size={28} />
        <p className="mt-3 text-sm font-bold">{report.year}년 {report.month}월 보고서</p>
        <p className="mt-1 text-xs leading-5 text-muted">보안을 위해 열람 링크는 열 때마다 새로 발급되고<br />짧은 시간이 지나면 만료됩니다.</p>
        {failed ? <p className="mt-3 text-xs font-semibold text-[#D64545]">열람 링크를 발급하지 못했어요. 다시 시도해 주세요.</p> : null}
        <button onClick={openPdf} disabled={pending} className="mt-5 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-[#4C3024] disabled:opacity-60">
          <Download size={18} />{pending ? "링크 발급 중..." : "PDF 보고서 열기"}
        </button>
      </section>
    </div>
  );
}

function EmptyReport() { return <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><FileText className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">발행된 월별 보고서가 없어요</p><p className="mt-1 text-xs text-muted">강사가 보고서를 발행하면 이곳에서 확인할 수 있습니다.</p></section>; }
function Summary({ value, label, action, danger }: { value: string; label: string; action?: boolean; danger?: boolean }) { return <div><dd className={`text-2xl font-bold ${action ? "text-action" : danger ? "text-[#E85A4F]" : ""}`}>{value}</dd><dt className="mt-1 text-xs text-muted">{label}</dt></div>; }
