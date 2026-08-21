import { QuizQuestionForm } from "@/features/student/quiz/quiz-question-form";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]/solve/question">) { const { worksheetId } = await params; return <QuizQuestionForm worksheetId={worksheetId} />; }
