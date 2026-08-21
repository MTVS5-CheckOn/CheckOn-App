import { ParentPdfViewer } from "@/features/parent/reports/parent-reports";
export default async function Page({ params }: PageProps<"/parent/reports/[reportId]/pdf">) { const { reportId } = await params; return <ParentPdfViewer reportId={reportId} />; }
