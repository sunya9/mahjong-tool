import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { glossary } from "@/data/glossary";
import { cn } from "@/lib/utils";

interface MahjongTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  showRuby?: boolean;
}

// 読みが表示テキストと異なるかチェック（同じなら冗長なのでルビ不要）
function needsRuby(reading: string, displayText: string): boolean {
  // 読みと表示テキストが同じ場合はルビ不要
  return reading !== displayText;
}

export function MahjongTerm({
  term,
  children,
  className,
  showRuby = false,
}: MahjongTermProps) {
  const [open, setOpen] = useState(false);
  const entry = glossary[term];

  // 用語集にない場合はそのまま表示
  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }

  const displayContent = children ?? term;
  const displayText =
    typeof displayContent === "string" ? displayContent : term;

  // ルビを表示するかどうか（showRuby=trueかつ読みが表示テキストと異なる場合）
  const shouldShowRuby = showRuby && needsRuby(entry.reading, displayText);

  // ルビ付きの表示内容
  const rubyContent = shouldShowRuby ? (
    <ruby>
      {displayContent}
      <rt className="text-[0.6em] text-muted-foreground">{entry.reading}</rt>
    </ruby>
  ) : (
    displayContent
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "cursor-help underline decoration-muted-foreground/50 decoration-dotted underline-offset-2 transition-colors hover:text-primary hover:decoration-primary",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {rubyContent}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" side="top">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold">{entry.term}</span>
            <span className="text-sm text-muted-foreground">
              ({entry.reading})
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
