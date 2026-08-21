import { QuestionDetail } from "@/features/student/questions/question-detail";
export default async function Page({ params }: { params: Promise<{ questionId: string }> }) { const { questionId } = await params; return <QuestionDetail questionId={questionId} />; }
