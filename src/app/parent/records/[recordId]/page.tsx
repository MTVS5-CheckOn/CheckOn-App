import { ParentRecordDetail } from "@/features/parent/records/parent-record-detail";

export default async function Page({ params }: PageProps<"/parent/records/[recordId]">) {
  const { recordId } = await params;
  return <ParentRecordDetail recordId={recordId} />;
}
