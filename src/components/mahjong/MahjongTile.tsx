import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/mahjong-types";
import { getTileName } from "@/data/getTileName";
import { TileSvg } from "./TileSvg";

interface MahjongTileProps {
  tile: Tile;
  rotated?: boolean;
  faceDown?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MahjongTile({
  tile,
  rotated = false,
  faceDown = false,
  className,
  size = "md",
}: MahjongTileProps) {
  const label = faceDown ? "裏" : getTileName(tile);

  return (
    <span
      className={cn(
        "[--radius:7px]",
        size === "sm" && [
          "[--shadow-bottom:3px]",
          "[--shadow-size-1:-3px]",
          "[--shadow-size-2:-1px]",
          "[--shadow-size-face-down-1:-1px]",
          "[--shadow-size-face-down-2:-3px]",
          "mt-1",
        ],
        size === "md" && [
          "[--shadow-bottom:5px]",
          "[--shadow-size-1:-6px]",
          "[--shadow-size-2:-4px]",
          "[--shadow-size-face-down-1:-3px]",
          "[--shadow-size-face-down-2:-7px]",
          "mt-3",
        ],
        size === "lg" && [
          "[--shadow-bottom:7px]",
          "[--shadow-size-1:-8px]",
          "[--shadow-size-2:-6px]",
          "[--shadow-size-face-down-1:-5px]",
          "[--shadow-size-face-down-2:-9px]",
          "mt-4",
        ],
        "box-border flex items-center justify-center rounded-sm px-1",
        !rotated && {
          "w-6": size === "sm",
          "w-10": size === "md",
          "w-12": size === "lg",
        },
        rotated && {
          "h-6": size === "sm",
          "h-10": size === "md",
          "h-12": size === "lg",
        },
        {
          "aspect-[19.5/26]": !rotated,
          "aspect-[26/19.5]": rotated,
        },
        !faceDown && [
          "border border-foreground/10 bg-linear-to-br from-white via-white to-stone-100",
          "drop-shadow-[0_var(--shadow-bottom)_var(--shadow-bottom)_rgba(0,0,0,0.05),0_var(--shadow-size-1)_0.5px_var(--mahjong-tile-shadow),0_var(--shadow-size-2)_0_var(--mahjong-tile)]",
        ],
        faceDown && [
          "border border-mahjong-tile/10 bg-linear-to-br from-mahjong-tile via-mahjong-tile to-mahjong-tile-shadow-face-down",
          "drop-shadow-[0_var(--shadow-bottom)_var(--shadow-bottom)_rgba(0,0,0,0.05),0_var(--shadow-size-face-down-1)_0.5px_var(--mahjong-tile-shadow-face-down),0_var(--shadow-size-face-down-2)_0_var(--mahjong-tile-shadow)]",
        ],
        className,
      )}
    >
      <TileSvg
        aria-label={label}
        tile={tile}
        rotated={rotated}
        faceDown={faceDown}
      />
    </span>
  );
}
