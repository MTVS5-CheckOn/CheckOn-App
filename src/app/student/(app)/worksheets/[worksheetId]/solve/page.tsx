import { QuizSolver } from "@/features/student/quiz/quiz-solver";
export default async function Page({ params }: PageProps<"/student/worksheets/[worksheetId]/solve">) { const { worksheetId } = await params; return <QuizSolver worksheetId={worksheetId} />; }
