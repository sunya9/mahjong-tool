import { cn } from "@/lib/utils";

interface ContentsProps {
  children: React.ReactNode;
  className?: string;
}

export function Contents({ children, className }: ContentsProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </div>
  );
}
