import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
export default async function Page({ params }: PageProps<"/parent/reports/[reportId]">) { const { reportId } = await params; return <FeaturePlaceholder title="보고서 상세" description={`${reportId} 보고서와 PDF 뷰어로 연결됩니다.`} />; }
