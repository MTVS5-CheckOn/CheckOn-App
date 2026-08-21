"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Info, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  return <div className="px-5 py-4">{years.length ? <select aria-label="보고서 연도" value={selectedYear ?? ""} onChange={(event) => setYear(Number(event.target.value))} className="mb-4 h-10 rounded-lg bg-transparent text-base font-bold outline-none">{years.map((item) => <option key={item} value={item}>{item}년</option>)}</select> : null}{reports.length ? <section className="overflow-hidden rounded-card border border-border bg-surface">{reports.map((report) => <Link key={report.id} href={routeBuilders.parent.report(report.id)} className={`flex min-h-[76px] items-center gap-3 border-b border-divider px-4 py-3 last:border-0 ${report.isNew ? "bg-[#FFFDF0]" : ""}`}><div className="min-w-0 flex-1"><div className="flex items-center gap-2">{report.isNew ? <span className="rounded-md bg-brand px-2 py-1 text-[11px] font-bold text-[#7D452C]">NEW</span> : null}<h2 className="font-bold">{report.year}년 {report.month}월</h2></div><p className="mt-1 text-xs text-subtle">{report.teacher} · {report.pages}페이지 · {report.issuedAt} 발행</p></div>{!report.isNew ? <span className="text-xs text-subtle">확인</span> : null}<ChevronRight size={17} className="text-subtle" /></Link>)}</section> : <EmptyReport />}</div>;
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
  return <div className="flex min-h-[calc(100dvh-76px)] flex-col"><div className="space-y-4 p-5"><div className="flex justify-end"><button onClick={share} className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-action"><Share2 size={17} />공유</button></div>{shared ? <div className="flex items-center gap-2 rounded-xl bg-[#E8F6F1] p-3 text-sm font-semibold text-[#26856B]"><CheckCircle2 size={18} />보고서 링크를 공유했습니다.</div> : null}<section className="rounded-card border border-border bg-surface p-5"><dl className="space-y-3 text-sm"><Row label="보고서" value={`${report.year}년 ${report.month}월`} /><Row label="자녀명" value={report.studentName} /><Row label="담당 강사" value={report.teacher} /><Row label="발행일" value={report.issuedAt} /><Row label="학습 기간" value={report.studyPeriod} /><Row label="페이지 수" value={`${report.pages}페이지`} /></dl></section><section className="rounded-card border border-border bg-surface p-5"><h2 className="text-sm font-bold text-muted">이번 달 핵심</h2><dl className="mt-4 grid grid-cols-3 text-center"><Summary value={`${summary.accuracy}%`} label="정답률" /><Summary value={`${summary.percentile}위`} label="전국 백분위" action /><Summary value={summary.priorityArea} label="우선 보완" danger /></dl><p className="mt-4 text-center text-[11px] text-subtle">전국 동일 학년 표본 · {summary.sampleAsOf} 기준</p></section><Link href={routeBuilders.parent.newConsultation({ type: "report", id: report.id, label: `${report.year}년 ${report.month}월 월별 보고서`, detail: `정답률 ${summary.accuracy}% · 전국 백분위 ${summary.percentile}위 · 우선 보완 ${summary.priorityArea}` })} className="flex h-[52px] items-center justify-center rounded-xl border border-[#A9D4F2] bg-surface text-sm font-bold text-[#2F6FA7]">이 보고서로 상담 요청</Link><div className="flex gap-2 rounded-xl border border-[#A9D4F2] bg-[#EEF7FF] p-3 text-xs leading-5 text-muted"><Info size={17} className="mt-0.5 shrink-0 text-action" />강사가 검토·승인·발행한 확정 보고서입니다.</div></div><div className="sticky bottom-0 mt-auto border-t border-divider bg-surface p-5"><Link href={routeBuilders.parent.reportPdf(report.id)} className="flex h-[52px] items-center justify-center rounded-xl bg-brand text-sm font-bold text-[#4C3024]">PDF 보고서 보기</Link></div></div>;
}

export function ParentPdfViewer({ reportId }: { reportId: string }) {
  const child = useSelectedChild();
  const { data: report, isLoading, isError, refetch } = useParentReportQuery(child?.studentId ?? "", reportId);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  function move(next: number) { setLoading(true); setPage(next); }
  if (isLoading) return <div className="grid min-h-[calc(100dvh-76px)] place-items-center bg-[#1F2937]"><span className="size-8 animate-spin rounded-full border-4 border-white/25 border-t-brand" /></div>;
  if (isError || !report) return <div className="p-8 text-center"><p className="text-sm font-bold">PDF 보고서를 불러오지 못했어요.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-brand px-5 py-2 text-sm font-bold">다시 시도</button></div>;
  const { url, pageImageBasePath, pageLabels } = report.pdf;
  return <div className="flex min-h-[calc(100dvh-76px)] flex-col bg-[#1F2937]"><div className="flex h-10 items-center justify-between bg-app px-5 text-sm font-bold"><span>페이지 {page} / {report.pages}</span><a href={url} download className="grid size-9 place-items-center" aria-label="PDF 다운로드"><Download size={19} /></a></div><div className="relative flex min-h-[470px] flex-1 items-center justify-center p-4">{loading ? <div className="absolute inset-0 z-10 grid place-items-center"><span className="size-8 animate-spin rounded-full border-4 border-white/25 border-t-brand" aria-label="PDF 로딩 중" /></div> : null}<Image key={page} src={`${pageImageBasePath}${page}.png`} alt={`PDF 보고서 ${page}페이지`} width={910} height={1287} priority={page === 1} onLoad={() => setLoading(false)} className="max-h-[570px] w-auto max-w-full bg-white object-contain shadow-lg" /></div><div className="bg-surface"><div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-3">{pageLabels.map((label, index) => <button key={label} onClick={() => move(index + 1)} aria-pressed={page === index + 1} className={`flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-lg border p-2 ${page === index + 1 ? "border-brand bg-brand-soft" : "border-border"}`}><FileText size={22} className={page === index + 1 ? "text-[#D96534]" : "text-subtle"} /><span className="line-clamp-2 text-[10px] leading-3">{label}</span></button>)}</div><div className="flex h-12 items-center justify-between border-t border-divider px-4"><button disabled={page === 1} onClick={() => move(page - 1)} className="flex items-center text-sm disabled:text-subtle"><ChevronLeft size={18} />이전</button><span className="text-sm text-muted">{page} / {report.pages}</span><button disabled={page === report.pages} onClick={() => move(page + 1)} className="flex items-center text-sm disabled:text-subtle">다음<ChevronRight size={18} /></button></div></div></div>;
}

function EmptyReport() { return <section className="rounded-card border border-border bg-surface px-5 py-12 text-center"><FileText className="mx-auto text-subtle" /><p className="mt-3 text-sm font-bold">발행된 월별 보고서가 없어요</p><p className="mt-1 text-xs text-muted">강사가 보고서를 발행하면 이곳에서 확인할 수 있습니다.</p></section>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex gap-3"><dt className="text-muted">{label}</dt><dd className="ml-auto text-right font-semibold">{value}</dd></div>; }
function Summary({ value, label, action, danger }: { value: string; label: string; action?: boolean; danger?: boolean }) { return <div><dd className={`text-2xl font-bold ${action ? "text-action" : danger ? "text-[#E85A4F]" : ""}`}>{value}</dd><dt className="mt-1 text-xs text-muted">{label}</dt></div>; }
