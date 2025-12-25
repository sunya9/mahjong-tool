import { MahjongTerm } from "./MahjongTerm";
import { glossary } from "@/data/glossary";

interface MarkupTextProps {
  text: string;
  className?: string;
  disablePopup?: boolean;
}

export function MarkupText({
  text,
  className,
  disablePopup = false,
}: MarkupTextProps) {
  // {xxx} パターンで分割
  const parts = text.split(/(\{[^}]+\})/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = part.match(/^\{(.+)\}$/);
        if (match) {
          const term = match[1];
          // 用語集に存在する場合のみリンク化
          if (glossary[term]) {
            return (
              <MahjongTerm key={i} term={term} disablePopup={disablePopup} />
            );
          }
          // 存在しない場合はそのまま表示
          return <span key={i}>{term}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
