import { cn } from "@/lib/utils";
import type { Meld, Head } from "@/lib/mahjong-types";
import { MahjongTile } from "./MahjongTile";

interface TileGroupProps {
  meld?: Meld;
  head?: Head;
  tileSize?: "sm" | "md" | "lg";
  highlightIndex?: number; // 強調する牌のインデックス
  className?: string;
}

export function TileGroup({
  meld,
  head,
  tileSize = "md",
  highlightIndex,
  className,
}: TileGroupProps) {
  const tiles = meld?.tiles ?? head?.tiles ?? [];
  const isOpen = meld?.state === "open";
  const isKantsu = meld?.type === "kantsu";
  const isAnkan = isKantsu && !isOpen;

  // 副露の場合、上家からの鳴き牌（左端）を横向きに
  // 暗槓の場合、両端を裏向きに
  const getTileProps = (index: number) => {
    if (isAnkan) {
      // 暗槓: 両端（0と3）を裏向き
      return { faceDown: index === 0 || index === 3 };
    }
    if (isOpen) {
      // 副露: 左端を横向き（上家からの鳴き）
      return { rotated: index === 0 };
    }
    return {};
  };

  return (
    <div className={cn("inline-flex items-end gap-px", className)}>
      {tiles.map((tile, index) => (
        <MahjongTile
          key={index}
          tile={tile}
          size={tileSize}
          className={cn(
            highlightIndex === index &&
              "rounded-sm ring-2 ring-primary ring-offset-1",
          )}
          {...getTileProps(index)}
        />
      ))}
    </div>
  );
}
