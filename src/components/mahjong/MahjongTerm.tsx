import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { glossary, type GlossaryEntry } from "@/data/glossary";
import { cn } from "@/lib/utils";
import { MarkupText } from "./MarkupText";
import { useReading } from "@/context/useReading";

interface MahjongTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  disablePopup?: boolean;
}

// ルビが必要かチェック
function needsRuby(entry: GlossaryEntry, displayText: string): boolean {
  // skipRubyフラグがあればルビ不要
  if (entry.skipRuby) return false;
  // 読みと表示テキストが同じ場合もルビ不要
  return entry.reading !== displayText;
}

export function MahjongTerm({
  term,
  children,
  className,
  disablePopup = false,
}: MahjongTermProps) {
  const [open, setOpen] = useState(false);
  const { showReading } = useReading();
  const entry = glossary[term];

  // 用語集にない場合はそのまま表示
  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }

  const displayContent = children ?? term;
  const displayText =
    typeof displayContent === "string" ? displayContent : term;

  // ルビを表示するかどうか
  const shouldShowRuby = showReading && needsRuby(entry, displayText);

  // ルビ付きの表示内容
  const rubyContent = shouldShowRuby ? (
    <ruby>
      {displayContent}
      <rt className="text-[0.6em] text-muted-foreground">{entry.reading}</rt>
    </ruby>
  ) : (
    displayContent
  );

  // ポップアップ無効時は下線付きスタイルのみ
  if (disablePopup) {
    return (
      <span
        className={cn(
          "underline decoration-muted-foreground/50 decoration-dotted underline-offset-2",
          className,
        )}
      >
        {rubyContent}
      </span>
    );
  }

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
          <MarkupText
            text={entry.description}
            className="text-sm leading-relaxed text-muted-foreground"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
