// 牌の種類（スート）
export type TileSuit = "man" | "pin" | "sou" | "honor";

// 字牌の種類
export type HonorType =
  | "east"
  | "south"
  | "west"
  | "north"
  | "white"
  | "green"
  | "red";

// 風
export type Wind = "east" | "south" | "west" | "north";

// 牌の定義
export interface Tile {
  suit: TileSuit;
  value: number | HonorType; // 数牌: 1-9, 字牌: HonorType
}

// 面子の種類
export type MeldType = "shuntsu" | "koutsu" | "kantsu";

// 面子の状態（暗/明）
export type MeldState = "closed" | "open";

// 面子
export interface Meld {
  type: MeldType;
  tiles: Tile[];
  state: MeldState;
}

// 雀頭
export interface Head {
  tiles: [Tile, Tile];
}

// 待ちの種類
export type WaitType =
  | "ryanmen" // 両面待ち
  | "kanchan" // 嵌張待ち
  | "penchan" // 辺張待ち
  | "shanpon" // 双碰待ち
  | "tanki"; // 単騎待ち

// 和了の種類
export type WinType = "tsumo" | "ron";

// 符の内訳項目
export interface FuItem {
  name: string;
  fu: number;
  description?: string;
  tiles?: Tile[]; // 該当する牌（面子・雀頭など）
  meld?: Meld; // 面子の場合、元の面子情報（横向き・裏向き表示用）
  head?: Head; // 雀頭の場合
}

// クイズ問題
export interface QuizProblem {
  id: string;
  melds: Meld[];
  head: Head;
  winTile: Tile;
  waitType: WaitType;
  winType: WinType;
  roundWind: Wind;
  seatWind: Wind;
  isMenzen: boolean;
  correctFu: number;
  fuBreakdown: FuItem[];
  category: QuizCategory;
  waitMeldIndex?: number; // 待ちの元になる面子のインデックス
  waitFromHead?: boolean; // 雀頭からの待ちか（単騎待ち）
}

// クイズカテゴリ
export type QuizCategory =
  | "wait" // 待ちの種類
  | "meld" // 面子の種類
  | "head" // 雀頭
  | "mixed"; // 複合問題

// 点数エントリ
export interface ScoreEntry {
  fu: number;
  han: number;
  dealer: {
    tsumo: number; // 親ツモ（子の支払い × 3）
    ron: number; // 親ロン
  };
  nonDealer: {
    tsumoDealer: number; // 子ツモ（親の支払い）
    tsumoNonDealer: number; // 子ツモ（子の支払い）
    ron: number; // 子ロン
  };
  label?: string; // 満貫、跳満など
}

// 点数クイズカテゴリ
export type ScoreQuizCategory =
  | "dealer" // 親の点数計算
  | "non-dealer" // 子の点数計算
  | "tsumo" // ツモの点数計算
  | "ron" // ロンの点数計算
  | "mixed"; // 複合条件

// 役の情報
export interface YakuItem {
  name: string;
  han: number;
}

// 点数クイズ問題
export interface ScoreQuizProblem {
  id: string;
  // 手牌情報
  melds: Meld[];
  head: Head;
  winTile: Tile;
  waitType: WaitType;
  waitMeldIndex?: number;
  waitFromHead?: boolean;
  // 条件
  winType: WinType;
  roundWind: Wind;
  seatWind: Wind;
  isDealer: boolean;
  isMenzen: boolean;
  // 計算結果
  fu: number;
  han: number;
  yaku: YakuItem[];
  correctScore: number; // ロン時は合計、ツモ時は子の支払い（親ツモはオール）
  correctScoreDealer?: number; // 子ツモ時の親の支払い
  category: ScoreQuizCategory;
  label?: string; // 満貫、跳満など
}

// ヘルパー関数

export function isHonor(tile: Tile): boolean {
  return tile.suit === "honor";
}

export function isTerminal(tile: Tile): boolean {
  if (tile.suit === "honor") return false;
  return tile.value === 1 || tile.value === 9;
}

export function isTerminalOrHonor(tile: Tile): boolean {
  return isHonor(tile) || isTerminal(tile);
}

export function isSimple(tile: Tile): boolean {
  if (tile.suit === "honor") return false;
  const v = tile.value as number;
  return v >= 2 && v <= 8;
}

export function isYakuhai(
  tile: Tile,
  roundWind: Wind,
  seatWind: Wind,
): boolean {
  if (tile.suit !== "honor") return false;
  const honor = tile.value as HonorType;
  // 三元牌
  if (honor === "white" || honor === "green" || honor === "red") return true;
  // 場風
  if (honor === roundWind) return true;
  // 自風
  if (honor === seatWind) return true;
  return false;
}

export function isDoubleYakuhai(
  tile: Tile,
  roundWind: Wind,
  seatWind: Wind,
): boolean {
  if (tile.suit !== "honor") return false;
  const honor = tile.value as HonorType;
  // 場風かつ自風（例：東場の東家）
  return honor === roundWind && honor === seatWind;
}
