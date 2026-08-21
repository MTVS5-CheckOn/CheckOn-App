import { WorksheetDetail } from "@/features/student/worksheets/worksheet-detail";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]">) { const { worksheetId } = await params; return <WorksheetDetail worksheetId={worksheetId} />; }
