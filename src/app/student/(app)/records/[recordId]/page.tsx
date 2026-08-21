import { LearningRecordDetail } from "@/features/student/records/learning-record-detail";

export default async function Page({ params }: PageProps<"/student/records/[recordId]">) {
  const { recordId } = await params;
  return <LearningRecordDetail recordId={recordId} />;
}
