import { QuizResults } from "@/features/student/quiz/quiz-results";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]/results">) { const { worksheetId } = await params; return <QuizResults worksheetId={worksheetId} />; }
