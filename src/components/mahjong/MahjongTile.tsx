import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/mahjong-types";
import {
  getTileChar,
  getRotatedTileChar,
  getBackTileChar,
  getTileName,
} from "@/data/tiles";

interface MahjongTileProps {
  tile: Tile;
  rotated?: boolean;
  faceDown?: boolean;
  className?: string;
}

export function MahjongTile({
  tile,
  rotated = false,
  faceDown = false,
  className,
}: MahjongTileProps) {
  // フォントの大文字で横向き表示（CSS回転不要）
  let char: string;
  if (faceDown) {
    char = getBackTileChar();
  } else if (rotated) {
    char = getRotatedTileChar(tile);
  } else {
    char = getTileChar(tile);
  }

  const label = faceDown ? "裏" : getTileName(tile);

  return (
    <span
      className={cn(
        "inline-block font-mahjong leading-none select-none",
        className,
      )}
      aria-label={label}
      role="img"
    >
      {char}
    </span>
  );
}
