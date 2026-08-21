import { FeaturePlaceholder } from "@/components/feedback/feature-placeholder";

export default async function Page({ params }: PageProps<"/parent/records/[recordId]">) {
  const { recordId } = await params;
  return <FeaturePlaceholder title="학습기록 상세" description={`${recordId} 학습의 정답률, 풀이 시간, 오답 유형과 관련 분석을 표시합니다.`} />;
}
