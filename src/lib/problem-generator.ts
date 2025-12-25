/**
 * 問題生成用の共通ユーティリティ
 */

import type {
  Tile,
  NumberTile,
  Meld,
  ShuntsuMeld,
  KoutsuMeld,
  KantsuMeld,
  Head,
  NumberSuit,
  TileNumber,
} from "./mahjong-types";
import {
  type TilePool,
  numberTile,
  canTake,
  takeTiles,
  getAllTileTypes,
} from "./tile-utils";

// ========================================
// シード付き疑似乱数生成器 (LCG)
// ========================================

export class SeededRandom {
  #state: number;

  constructor(seed: number) {
    this.#state = seed >>> 0;
  }

  // 0-1の乱数を生成
  next(): number {
    // LCG: state = (a * state + c) mod m
    this.#state = (this.#state * 1664525 + 1013904223) >>> 0;
    return this.#state / 0x100000000;
  }

  // 0からmax-1の整数を生成
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// グローバルな乱数生成器（シードなしの場合に使用）
let globalRng: SeededRandom | null = null;

export function getRng(): SeededRandom {
  if (!globalRng) {
    globalRng = new SeededRandom(Date.now());
  }
  return globalRng;
}

export function setGlobalSeed(seed: number): void {
  globalRng = new SeededRandom(seed);
}

// ========================================
// ランダムユーティリティ
// ========================================

export function randomChoice<T>(arr: T[], rng?: SeededRandom): T {
  const r = rng ?? getRng();
  return arr[r.nextInt(arr.length)];
}

export function shuffle<T>(arr: T[], rng?: SeededRandom): T[] {
  const r = rng ?? getRng();
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = r.nextInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ========================================
// 面子生成
// ========================================

export function generateShuntsu(
  pool: TilePool,
  isOpen: boolean,
  rng?: SeededRandom,
): { meld: ShuntsuMeld; tiles: [NumberTile, NumberTile, NumberTile] } | null {
  const suits: NumberSuit[] = shuffle(["man", "pin", "sou"], rng);
  const startNumbers: TileNumber[] = shuffle([1, 2, 3, 4, 5, 6, 7], rng);

  for (const suit of suits) {
    for (const start of startNumbers) {
      const tiles: [NumberTile, NumberTile, NumberTile] = [
        numberTile(suit, start),
        numberTile(suit, (start + 1) as TileNumber),
        numberTile(suit, (start + 2) as TileNumber),
      ];

      if (tiles.every((t) => canTake(pool, t, 1))) {
        tiles.forEach((t) => takeTiles(pool, t, 1));
        return {
          meld: { type: "shuntsu", tiles, state: isOpen ? "open" : "closed" },
          tiles,
        };
      }
    }
  }
  return null;
}

export function generateKoutsu(
  pool: TilePool,
  isOpen: boolean,
  rng?: SeededRandom,
): { meld: KoutsuMeld; tiles: [Tile, Tile, Tile] } | null {
  const allTiles = getAllTileTypes();
  const shuffled = shuffle(allTiles, rng);

  for (const tile of shuffled) {
    if (canTake(pool, tile, 3)) {
      takeTiles(pool, tile, 3);
      const tiles: [Tile, Tile, Tile] = [tile, tile, tile];
      return {
        meld: { type: "koutsu", tiles, state: isOpen ? "open" : "closed" },
        tiles,
      };
    }
  }
  return null;
}

export function generateKantsu(
  pool: TilePool,
  isOpen: boolean,
  rng?: SeededRandom,
): { meld: KantsuMeld; tiles: [Tile, Tile, Tile, Tile] } | null {
  const allTiles = getAllTileTypes();
  const shuffled = shuffle(allTiles, rng);

  for (const tile of shuffled) {
    if (canTake(pool, tile, 4)) {
      takeTiles(pool, tile, 4);
      const tiles: [Tile, Tile, Tile, Tile] = [tile, tile, tile, tile];
      return {
        meld: { type: "kantsu", tiles, state: isOpen ? "open" : "closed" },
        tiles,
      };
    }
  }
  return null;
}

export function generateHead(
  pool: TilePool,
  rng?: SeededRandom,
): { head: Head; tile: Tile } | null {
  const allTiles = getAllTileTypes();
  const shuffled = shuffle(allTiles, rng);

  for (const tile of shuffled) {
    if (canTake(pool, tile, 2)) {
      takeTiles(pool, tile, 2);
      return {
        head: { tiles: [tile, tile] },
        tile,
      };
    }
  }
  return null;
}

// ========================================
// Meldクローン
// ========================================

export function cloneMeld(meld: Meld): Meld {
  switch (meld.type) {
    case "shuntsu":
      return { ...meld, tiles: [...meld.tiles] };
    case "koutsu":
      return { ...meld, tiles: [...meld.tiles] };
    case "kantsu":
      return { ...meld, tiles: [...meld.tiles] };
  }
}
