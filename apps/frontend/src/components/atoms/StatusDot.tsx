type StatusDotProps = {
  status: "ok" | "error" | "disabled";
};

export function StatusDot({ status }: StatusDotProps) {
  const color =
    status === "ok" ? "bg-gold" : status === "error" ? "bg-hazard" : "bg-muted";
  return <span className={`inline-block h-1.5 w-1.5 ${color}`} aria-hidden />;
}
