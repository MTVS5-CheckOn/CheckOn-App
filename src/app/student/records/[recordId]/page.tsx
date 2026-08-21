import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default async function Page({ params }: PageProps<"/student/records/[recordId]">) {
  const { recordId } = await params;
  return <FeaturePlaceholder title="학습기록 상세" description={`${recordId} 학습의 문항별 결과와 접힌 해설을 표시합니다.`} />;
}
