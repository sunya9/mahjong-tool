/**
 * 牌に関する共通ユーティリティ
 */

import type {
  Tile,
  NumberTile,
  HonorTile,
  NumberSuit,
  TileNumber,
  TileSuit,
  HonorType,
} from "./mahjong-types";

// ========================================
// 牌生成
// ========================================

export function numberTile(
  suit: NumberSuit,
  value: TileNumber,
  isRedDora?: boolean,
): NumberTile {
  return { suit, value, isRedDora };
}

export function honorTile(value: HonorType): HonorTile {
  return { suit: "honor", value };
}

// ========================================
// 牌識別
// ========================================

export function tileKey(tile: Tile): string {
  return `${tile.suit}-${tile.value}`;
}

export function tilesMatch(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
}

// ========================================
// 牌プール管理
// ========================================

export interface TilePool {
  tiles: Map<string, number>; // "man-1" -> 残り枚数
}

export function createTilePool(): TilePool {
  const pool = new Map<string, number>();

  // 数牌（各4枚）
  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      pool.set(`${suit}-${i}`, 4);
    }
  }

  // 字牌（各4枚）
  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  for (const honor of honors) {
    pool.set(`honor-${honor}`, 4);
  }

  return { tiles: pool };
}

export function canTake(pool: TilePool, tile: Tile, count: number): boolean {
  const key = tileKey(tile);
  const available = pool.tiles.get(key) ?? 0;
  return available >= count;
}

export function takeTiles(pool: TilePool, tile: Tile, count: number): boolean {
  const key = tileKey(tile);
  const available = pool.tiles.get(key) ?? 0;
  if (available < count) return false;
  pool.tiles.set(key, available - count);
  return true;
}

// ========================================
// 全牌リスト生成
// ========================================

export function getAllTileTypes(): Tile[] {
  const tiles: Tile[] = [];

  // 数牌
  const suits: NumberSuit[] = ["man", "pin", "sou"];
  const numbers: TileNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const suit of suits) {
    for (const value of numbers) {
      tiles.push(numberTile(suit, value));
    }
  }

  // 字牌
  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  for (const honor of honors) {
    tiles.push(honorTile(honor));
  }

  return tiles;
}
