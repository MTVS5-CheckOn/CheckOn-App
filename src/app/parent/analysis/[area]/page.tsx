import { WeaknessDetail } from "@/features/parent/analysis/parent-analysis";
export default async function Page({ params }: { params: Promise<{ area: string }> }) { const { area } = await params; return <WeaknessDetail area={decodeURIComponent(area)} />; }
