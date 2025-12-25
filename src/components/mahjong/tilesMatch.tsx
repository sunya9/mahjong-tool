import type { Tile } from "@/lib/mahjong-types";

// 牌が一致するかチェック

export function tilesMatch(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
}
