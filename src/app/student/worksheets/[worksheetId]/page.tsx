import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]">) { const { worksheetId } = await params; return <FeaturePlaceholder title="학습지 상세" description={`${worksheetId} 학습지의 문제 풀이 세션으로 연결됩니다.`} />; }
