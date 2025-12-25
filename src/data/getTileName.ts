import {
  isHonorTile,
  type HonorType,
  type NumberSuit,
  type Tile,
} from "@/lib/mahjong-types";

const HONOR_NAMES: Record<HonorType, string> = {
  east: "東",
  south: "南",
  west: "西",
  north: "北",
  white: "白",
  green: "發",
  red: "中",
};

const SUIT_NAMES: Record<NumberSuit, string> = {
  man: "萬",
  pin: "筒",
  sou: "索",
};

const NUMBER_KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function getTileName(tile: Tile): string {
  if (isHonorTile(tile)) {
    return HONOR_NAMES[tile.value];
  }
  const prefix = tile.isRedDora ? "赤" : "";
  return `${prefix}${NUMBER_KANJI[tile.value - 1]}${SUIT_NAMES[tile.suit]}`;
}
