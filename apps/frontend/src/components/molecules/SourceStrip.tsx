import { StatusDot } from "@/components/atoms/StatusDot";

// Fallback type – replace with the real schema when it becomes available.
export type Forecast = {
  sources: Array<{
    id: string;
    status: 'error' | 'disabled' | 'ok';
  }>;
};

type SourceStripProps = {
  sources: Forecast["sources"];
};

export function SourceStrip({ sources }: SourceStripProps) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.1em] uppercase text-muted">
      {sources.map((source) => (
        <li key={source.id} className="flex items-center gap-2">
          <StatusDot status={source.status} />
          {source.id}
        </li>
      ))}
    </ul>
  );
}
