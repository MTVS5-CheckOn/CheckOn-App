import { ConsultationDetail } from "@/features/parent/consultations/consultation-detail";
export default async function Page({ params }: PageProps<"/parent/consultations/[consultationId]">) { const { consultationId } = await params; return <ConsultationDetail consultationId={consultationId} />; }
