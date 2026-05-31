import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "./card";

export function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "red"
          ? "text-rose-600"
          : "text-slate-900";
  return (
    <Card>
      <CardContent className="pt-4">
        <CardTitle>{label}</CardTitle>
        <div className={cn("mt-1 text-2xl font-bold tracking-tight", toneClass)}>{value}</div>
        {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}
