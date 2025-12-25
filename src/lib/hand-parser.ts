/**
 * 手牌解析・面子分解アルゴリズム
 *
 * 参照: https://ameblo.jp/principia-ca/entry-11581751786.html
 *
 * アルゴリズムの概要:
 * 1. 手牌を34要素の配列（各牌の枚数）で管理
 * 2. 雀頭候補を抽出し、各候補について面子分解を試行
 * 3. 刻子優先・順子優先の両フェーズで網羅的に分解
 * 4. 七対子・国士無双の特殊形を個別判定
 * 5. 重複パターンを除去して全ての和了形を返す
 */

import type {
  Tile,
  NumberTile,
  HonorTile,
  NumberSuit,
  HonorType,
  TileNumber,
  Meld,
  MeldType,
  Head,
  HandParseInput,
  ParseResult,
  WinningHand,
  RegularHand,
  ChiitoitsuHand,
  KokushiHand,
} from "./mahjong-types";
import { isNumberTile, tileNumberValues } from "./mahjong-types";

// ========================================
// 牌のインデックス変換
// ========================================

/**
 * 牌の内部インデックス
 * 0-8: 萬子 (1-9)
 * 9-17: 筒子 (1-9)
 * 18-26: 索子 (1-9)
 * 27-33: 字牌 (東南西北白發中)
 */
type TileIndex = number;

/**
 * 手牌の枚数配列（長さ34）
 */
type TileCount = number[];

const SUIT_OFFSET: Record<NumberSuit, number> = {
  man: 0,
  pin: 9,
  sou: 18,
};

const HONOR_OFFSET: Record<HonorType, number> = {
  east: 27,
  south: 28,
  west: 29,
  north: 30,
  white: 31,
  green: 32,
  red: 33,
};

const HONOR_TYPES: HonorType[] = [
  "east",
  "south",
  "west",
  "north",
  "white",
  "green",
  "red",
];

/**
 * Tile から内部インデックスへの変換
 */
export function tileToIndex(tile: Tile): TileIndex {
  if (isNumberTile(tile)) {
    return SUIT_OFFSET[tile.suit] + (tile.value - 1);
  } else {
    return HONOR_OFFSET[tile.value];
  }
}

/**
 * 内部インデックスから Tile への変換
 */
export function indexToTile(index: TileIndex): Tile {
  if (index < 27) {
    const suitIndex = Math.floor(index / 9);
    const suits: NumberSuit[] = ["man", "pin", "sou"];
    const suit = suits[suitIndex];
    const value = ((index % 9) + 1) as TileNumber;
    return { suit, value } as NumberTile;
  } else {
    const honorIndex = index - 27;
    return { suit: "honor", value: HONOR_TYPES[honorIndex] } as HonorTile;
  }
}

function indexToNumberTile(index: TileIndex): NumberTile {
  if (index < 27) {
    const suitIndex = Math.floor(index / 9);
    const suits: NumberSuit[] = ["man", "pin", "sou"];
    const suit = suits[suitIndex];
    const value = tileNumberValues[index % 9];
    return { suit, value } satisfies NumberTile;
  } else {
    throw new Error("Invalid index");
  }
}

/**
 * 牌リストを枚数配列に変換
 */
export function tilesToCount(tiles: Tile[]): TileCount {
  const count = new Array(34).fill(0);
  for (const tile of tiles) {
    count[tileToIndex(tile)]++;
  }
  return count;
}

/**
 * 枚数配列を牌リストに変換
 */
export function countToTiles(count: TileCount): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < 34; i++) {
    for (let j = 0; j < count[i]; j++) {
      tiles.push(indexToTile(i));
    }
  }
  return tiles;
}

/**
 * 2つの牌が同じかどうかを判定（赤ドラは無視）
 */
export function tilesEqual(a: Tile, b: Tile): boolean {
  return tileToIndex(a) === tileToIndex(b);
}

// ========================================
// 面子・雀頭の生成
// ========================================

/**
 * 閉じた面子を生成
 */
function createClosedMeld(type: MeldType, startIndex: TileIndex): Meld {
  if (type === "shuntsu") {
    // 順子は必ず数牌のインデックス（0-26）から生成される
    const t1 = indexToNumberTile(startIndex);
    const t2 = indexToNumberTile(startIndex + 1);
    const t3 = indexToNumberTile(startIndex + 2);
    return { type, tiles: [t1, t2, t3], state: "closed" };
  } else if (type === "koutsu") {
    const tile = indexToTile(startIndex);
    return { type, tiles: [tile, tile, tile], state: "closed" };
  } else {
    // kantsu
    const tile = indexToTile(startIndex);
    return { type, tiles: [tile, tile, tile, tile], state: "closed" };
  }
}

/**
 * 雀頭を生成
 */
function createHead(index: TileIndex): Head {
  const tile = indexToTile(index);
  return { tiles: [tile, tile] };
}

// ========================================
// 面子分解アルゴリズム
// ========================================

/**
 * 順子が形成可能か判定
 */
function canFormShuntsu(index: TileIndex, count: TileCount): boolean {
  // 字牌は順子を作れない
  if (index >= 27) return false;
  // 8, 9 は順子の先頭になれない
  if (index % 9 >= 7) return false;
  // 異なるスートをまたがない
  if (Math.floor(index / 9) !== Math.floor((index + 2) / 9)) return false;
  // 3枚とも存在するか
  return count[index] >= 1 && count[index + 1] >= 1 && count[index + 2] >= 1;
}

/**
 * 再帰的な面子取得
 * @param count 現在の枚数配列（破壊的に変更）
 * @param remaining 残りの面子数
 * @param priority 優先順位（刻子優先 or 順子優先）
 * @returns 可能な面子組み合わせの配列
 */
function extractMelds(
  count: TileCount,
  remaining: number,
  priority: "koutsu" | "shuntsu",
): Meld[][] {
  if (remaining === 0) {
    // 残り牌が0なら成功
    const hasRemaining = count.some((c) => c > 0);
    return hasRemaining ? [] : [[]];
  }

  // 最初の残り牌のインデックスを見つける
  const firstIndex = count.findIndex((c) => c > 0);
  if (firstIndex === -1) return [];

  const results: Meld[][] = [];

  if (priority === "koutsu") {
    // 刻子を先に試す
    if (count[firstIndex] >= 3) {
      count[firstIndex] -= 3;
      const sub = extractMelds(count, remaining - 1, priority);
      for (const melds of sub) {
        results.push([createClosedMeld("koutsu", firstIndex), ...melds]);
      }
      count[firstIndex] += 3;
    }

    // 順子を試す
    if (canFormShuntsu(firstIndex, count)) {
      count[firstIndex]--;
      count[firstIndex + 1]--;
      count[firstIndex + 2]--;
      const sub = extractMelds(count, remaining - 1, priority);
      for (const melds of sub) {
        results.push([createClosedMeld("shuntsu", firstIndex), ...melds]);
      }
      count[firstIndex]++;
      count[firstIndex + 1]++;
      count[firstIndex + 2]++;
    }
  } else {
    // 順子を先に試す
    if (canFormShuntsu(firstIndex, count)) {
      count[firstIndex]--;
      count[firstIndex + 1]--;
      count[firstIndex + 2]--;
      const sub = extractMelds(count, remaining - 1, priority);
      for (const melds of sub) {
        results.push([createClosedMeld("shuntsu", firstIndex), ...melds]);
      }
      count[firstIndex]++;
      count[firstIndex + 1]++;
      count[firstIndex + 2]++;
    }

    // 刻子を試す
    if (count[firstIndex] >= 3) {
      count[firstIndex] -= 3;
      const sub = extractMelds(count, remaining - 1, priority);
      for (const melds of sub) {
        results.push([createClosedMeld("koutsu", firstIndex), ...melds]);
      }
      count[firstIndex] += 3;
    }
  }

  return results;
}

/**
 * 和了形パターンのユニークキーを生成
 */
function generateHandKey(hand: RegularHand): string {
  const headKey = tileToIndex(hand.head.tiles[0]);
  const meldKeys = hand.melds
    .map((m) => `${m.type}:${tileToIndex(m.tiles[0])}:${m.state}`)
    .sort()
    .join("|");
  return `${headKey}:${meldKeys}`;
}

/**
 * 重複する和了形パターンを除去
 */
function deduplicateHands(hands: RegularHand[]): RegularHand[] {
  const seen = new Set<string>();
  const result: RegularHand[] = [];

  for (const hand of hands) {
    const key = generateHandKey(hand);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(hand);
    }
  }

  return result;
}

/**
 * 通常形の面子分解（刻子優先 + 順子優先）
 */
function parseRegularHand(tiles: Tile[], openMelds: Meld[]): RegularHand[] {
  const count = tilesToCount(tiles);
  const results: RegularHand[] = [];
  const requiredMelds = 4 - openMelds.length;

  // 雀頭候補を探索
  for (let i = 0; i < 34; i++) {
    if (count[i] >= 2) {
      const head = createHead(i);

      // 雀頭を取り除く
      count[i] -= 2;

      // 刻子優先フェーズ
      const koutsuFirst = extractMelds([...count], requiredMelds, "koutsu");
      for (const melds of koutsuFirst) {
        results.push({
          pattern: "regular",
          head,
          melds: [...openMelds, ...melds],
        });
      }

      // 順子優先フェーズ
      const shuntsuFirst = extractMelds([...count], requiredMelds, "shuntsu");
      for (const melds of shuntsuFirst) {
        results.push({
          pattern: "regular",
          head,
          melds: [...openMelds, ...melds],
        });
      }

      // 雀頭を戻す
      count[i] += 2;
    }
  }

  return deduplicateHands(results);
}

// ========================================
// 特殊形の判定
// ========================================

/**
 * 七対子判定
 * 条件: 7つの異なる対子（同じ牌4枚は2つの対子として認めない）
 */
function tryParseChiitoitsu(tiles: Tile[]): ChiitoitsuHand | null {
  if (tiles.length !== 14) return null;

  const count = tilesToCount(tiles);
  const pairs: [Tile, Tile][] = [];

  for (let i = 0; i < 34; i++) {
    if (count[i] === 0) continue;
    if (count[i] !== 2) return null; // 対子以外があれば失敗
    const tile = indexToTile(i);
    pairs.push([tile, tile]);
  }

  if (pairs.length !== 7) return null;

  return {
    pattern: "chiitoitsu",
    pairs,
  };
}

/**
 * 幺九牌のインデックス一覧
 */
const YAOCHU_INDICES = [
  0,
  8, // 1萬, 9萬
  9,
  17, // 1筒, 9筒
  18,
  26, // 1索, 9索
  27,
  28,
  29,
  30,
  31,
  32,
  33, // 東南西北白發中
];

/**
 * 国士無双判定
 * 条件: 13種類の幺九牌が全て1枚以上 + いずれか1種類が2枚
 */
function tryParseKokushi(tiles: Tile[], winTile: Tile): KokushiHand | null {
  if (tiles.length !== 14) return null;

  const count = tilesToCount(tiles);

  // 幺九牌以外があれば失敗
  for (let i = 0; i < 34; i++) {
    if (!YAOCHU_INDICES.includes(i) && count[i] > 0) {
      return null;
    }
  }

  // 13種全てが1枚以上あるか確認
  let pairIndex = -1;
  for (const idx of YAOCHU_INDICES) {
    if (count[idx] === 0) return null;
    if (count[idx] === 2) {
      if (pairIndex !== -1) return null; // 2対子以上は無効
      pairIndex = idx;
    }
    if (count[idx] > 2) return null;
  }

  if (pairIndex === -1) return null;

  // 十三面待ち判定
  // 待ち牌が対子になった牌（pairIndex）と異なる場合は十三面待ち
  const winTileIndex = tileToIndex(winTile);
  const isThirteenWait = winTileIndex !== pairIndex;

  return {
    pattern: "kokushi",
    tiles,
    waitTile: winTile,
    isThirteenWait,
  };
}

// ========================================
// メイン解析関数
// ========================================

/**
 * 手牌を解析し、全ての可能な和了形パターンを抽出
 */
export function parseHand(input: HandParseInput): ParseResult {
  const { closedTiles, openMelds, winTile } = input;
  const hands: WinningHand[] = [];

  // 和了牌を含めた手牌を作成
  const allClosedTiles = [...closedTiles, winTile];

  // 七対子判定（副露がない場合のみ）
  if (openMelds.length === 0) {
    const chiitoitsu = tryParseChiitoitsu(allClosedTiles);
    if (chiitoitsu) hands.push(chiitoitsu);
  }

  // 国士無双判定（副露がない場合のみ）
  if (openMelds.length === 0) {
    const kokushi = tryParseKokushi(allClosedTiles, winTile);
    if (kokushi) hands.push(kokushi);
  }

  // 通常形の面子分解
  const regularHands = parseRegularHand(allClosedTiles, openMelds);
  hands.push(...regularHands);

  return {
    hands,
    isWinning: hands.length > 0,
  };
}

/**
 * 手牌が和了形かどうかを判定
 */
export function isWinningHand(closedTiles: Tile[], openMelds: Meld[]): boolean {
  // テンパイ状態（13枚）から全ての待ち牌を試す
  if (closedTiles.length === 13 - openMelds.length * 3) {
    const waitingTiles = getWaitingTiles(closedTiles, openMelds);
    return waitingTiles.length > 0;
  }

  // 和了状態（14枚）
  // ダミーの和了牌として最後の牌を使用
  const winTile = closedTiles[closedTiles.length - 1];
  const result = parseHand({
    closedTiles: closedTiles.slice(0, -1),
    openMelds,
    winTile,
  });
  return result.isWinning;
}

/**
 * テンパイ形から待ち牌リストを返す
 */
export function getWaitingTiles(
  closedTiles: Tile[],
  openMelds: Meld[],
): Tile[] {
  const waitingTiles: Tile[] = [];

  // 全34種の牌を試す
  for (let i = 0; i < 34; i++) {
    const winTile = indexToTile(i);
    const result = parseHand({
      closedTiles,
      openMelds,
      winTile,
    });
    if (result.isWinning) {
      waitingTiles.push(winTile);
    }
  }

  return waitingTiles;
}
