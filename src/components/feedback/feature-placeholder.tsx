import { Card } from "@/components/ui/card";

export function FeaturePlaceholder({ title, description }: { title: string; description: string }) {
  return <div className="p-5"><Card className="p-6"><h1 className="text-xl font-bold">{title}</h1><p className="mt-2 text-sm leading-6 text-muted">{description}</p></Card></div>;
}
