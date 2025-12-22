import type { HonorType, Tile, TileSuit } from "@/lib/mahjong-types";

// GL-MahjongTile font character mappings
// Based on: https://github.com/Gutenberg-Labo/DingbatFonts
export const TILE_CHARS = {
  // 風牌 (1-4)
  east: "1", // 東
  south: "2", // 南
  west: "3", // 西
  north: "4", // 北

  // 三元牌 (5-7)
  white: "5", // 白
  green: "6", // 發
  red: "7", // 中

  // 萬子 (q-o = 1-9)
  man: ["q", "w", "e", "r", "t", "y", "u", "i", "o"],

  // 索子 (a-l = 1-9、但し'i'は飛ばしてj,k,lまで)
  sou: ["a", "s", "d", "f", "g", "h", "j", "k", "l"],

  // 筒子 (z-m, comma, period = 1-9)
  pin: ["z", "x", "c", "v", "b", "n", "m", ",", "."],

  // 裏面
  back: "9",
} as const;

// 牌の文字を取得
export function getTileChar(tile: Tile): string {
  if (tile.suit === "honor") {
    return TILE_CHARS[tile.value as HonorType];
  }
  const suitArray = TILE_CHARS[tile.suit as Exclude<TileSuit, "honor">];
  return suitArray[(tile.value as number) - 1];
}

// 横向き字牌のマッピング（Shiftキーで入力される文字）
const ROTATED_HONOR_CHARS: Record<HonorType, string> = {
  east: "!", // Shift+1
  south: "@", // Shift+2
  west: "#", // Shift+3
  north: "$", // Shift+4
  white: "%", // Shift+5
  green: "^", // Shift+6
  red: "&", // Shift+7
};

// 横向き牌の文字を取得（Shiftキーで入力される文字）
export function getRotatedTileChar(tile: Tile): string {
  if (tile.suit === "honor") {
    return ROTATED_HONOR_CHARS[tile.value as HonorType];
  }
  const char = getTileChar(tile);
  // 数牌はアルファベットなので大文字に
  return char.toUpperCase();
}

// 裏牌の文字を取得
export function getBackTileChar(): string {
  return TILE_CHARS.back;
}

// 牌の名前を取得
export function getTileName(tile: Tile): string {
  if (tile.suit === "honor") {
    const names: Record<HonorType, string> = {
      east: "東",
      south: "南",
      west: "西",
      north: "北",
      white: "白",
      green: "發",
      red: "中",
    };
    return names[tile.value as HonorType];
  }

  const suitNames: Record<Exclude<TileSuit, "honor">, string> = {
    man: "萬",
    pin: "筒",
    sou: "索",
  };
  const numbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return `${numbers[(tile.value as number) - 1]}${suitNames[tile.suit]}`;
}

// ヘルパー関数：牌を簡単に作成
export function tile(suit: TileSuit, value: number | HonorType): Tile {
  return { suit, value };
}

// 数牌のショートハンド
export function man(value: number): Tile {
  return { suit: "man", value };
}

export function pin(value: number): Tile {
  return { suit: "pin", value };
}

export function sou(value: number): Tile {
  return { suit: "sou", value };
}

// 字牌のショートハンド
export function honor(type: HonorType): Tile {
  return { suit: "honor", value: type };
}

// 風牌
export const EAST = honor("east");
export const SOUTH = honor("south");
export const WEST = honor("west");
export const NORTH = honor("north");

// 三元牌
export const WHITE = honor("white");
export const GREEN = honor("green");
export const RED = honor("red");
