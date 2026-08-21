import { SubmitConfirmation } from "@/features/student/quiz/submit-confirmation";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]/submit">) { const { worksheetId } = await params; return <SubmitConfirmation worksheetId={worksheetId} />; }
