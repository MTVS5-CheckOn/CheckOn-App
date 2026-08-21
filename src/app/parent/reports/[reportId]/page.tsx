import { ParentReportDetail } from "@/features/parent/reports/parent-reports";
export default async function Page({ params }: PageProps<"/parent/reports/[reportId]">) { const { reportId } = await params; return <ParentReportDetail reportId={reportId} />; }
