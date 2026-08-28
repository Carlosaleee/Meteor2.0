type FrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function Frame({ children, className = "" }: FrameProps) {
  return (
    <div className={`border border-line bg-surface ${className}`}>{children}</div>
  );
}
