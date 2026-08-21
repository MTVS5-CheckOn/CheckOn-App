import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { ROUTES } from "@/config/routes";
import { parentHomeData } from "@/features/parent/home/model";

export function ParentHome() {
  const { student, metrics, report, recent } = parentHomeData;
  return <div className="space-y-4 p-5"><section className="rounded-lg bg-brand p-5 text-[#4C3024]"><p className="text-xs opacity-70">이번 달 학습 현황</p><h1 className="mt-1 text-xl font-bold">{student.name}</h1><p className="mt-1 text-xs opacity-70">{student.period}</p></section><section className="grid grid-cols-2 gap-3">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section><Link href={`${ROUTES.parent.reports}/${report.id}`} className="block"><Card className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Badge tone="danger">NEW</Badge><span className="text-xs text-muted">{report.month} 보고서</span></div><h2 className="mt-2 text-sm font-semibold">{report.title}</h2><p className="mt-1 text-xs text-subtle">{report.issuedAt} 발행</p></div><ChevronRight aria-hidden size={18} className="text-action" /></Card></Link><section><SectionHeading title="최근 학습" href={ROUTES.parent.records} /><Card className="mt-2 overflow-hidden">{recent.map((item, index) => <Link key={item.id} href={`${ROUTES.parent.records}/${item.id}`} className={`flex min-h-[76px] items-center px-4 py-3 ${index ? "border-t border-divider" : ""}`}><div className="min-w-0 flex-1"><p className="text-xs text-subtle">{item.date} · {item.area}</p><h3 className="mt-1 truncate text-sm font-semibold">{item.title}</h3></div><div className="text-right"><strong className="text-lg">{item.accuracy}%</strong><p className="text-[11px] text-subtle">정답률</p></div></Link>)}</Card></section></div>;
}
