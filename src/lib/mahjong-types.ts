// 数牌のスート
export type NumberSuit = "man" | "pin" | "sou";

// 牌の種類（スート）
export type TileSuit = NumberSuit | "honor";

export const tileNumberValues = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
// 数牌の値
export type TileNumber = (typeof tileNumberValues)[number];

// 字牌の種類
export type HonorType = WindType | DragonType;

// 風牌
export type WindType = "east" | "south" | "west" | "north";

// 三元牌
export type DragonType = "white" | "green" | "red";

// 風（場風・自風用）
export type Wind = WindType;

// 数牌
export interface NumberTile {
  readonly suit: NumberSuit;
  readonly value: TileNumber;
  readonly isRedDora?: boolean;
}

// 字牌
export interface HonorTile {
  readonly suit: "honor";
  readonly value: HonorType;
}

// 牌（discriminated union）
export type Tile = NumberTile | HonorTile;

// 面子の種類
export type MeldType = "shuntsu" | "koutsu" | "kantsu";

// 面子の状態（暗/明）
export type MeldState = "closed" | "open";

// 順子（3枚の連続した数牌）
export interface ShuntsuMeld {
  type: "shuntsu";
  tiles: [NumberTile, NumberTile, NumberTile];
  state: MeldState;
}

// 刻子（3枚の同じ牌）
export interface KoutsuMeld {
  type: "koutsu";
  tiles: [Tile, Tile, Tile];
  state: MeldState;
}

// 槓子（4枚の同じ牌）
export interface KantsuMeld {
  type: "kantsu";
  tiles: [Tile, Tile, Tile, Tile];
  state: MeldState;
}

// 面子（discriminated union）
export type Meld = ShuntsuMeld | KoutsuMeld | KantsuMeld;

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
  isRiichi?: boolean; // リーチ
  isDoubleRiichi?: boolean; // ダブルリーチ
  // ドラ情報
  doraIndicators?: Tile[]; // ドラ表示牌
  uraDoraIndicators?: Tile[]; // 裏ドラ表示牌（リーチ時のみ）
  // 計算結果
  fu: number;
  han: number;
  yaku: YakuItem[];
  correctScore: number; // ロン時は合計、ツモ時は子の支払い（親ツモはオール）
  correctScoreDealer?: number; // 子ツモ時の親の支払い
  category: ScoreQuizCategory;
  label?: string; // 満貫、跳満など
}

// 型ガード

export function isNumberTile(tile: Tile): tile is NumberTile {
  return tile.suit !== "honor";
}

export function isHonorTile(tile: Tile): tile is HonorTile {
  return tile.suit === "honor";
}

export function isWindTile(
  tile: Tile,
): tile is HonorTile & { value: WindType } {
  return (
    tile.suit === "honor" &&
    (tile.value === "east" ||
      tile.value === "south" ||
      tile.value === "west" ||
      tile.value === "north")
  );
}

export function isDragonTile(
  tile: Tile,
): tile is HonorTile & { value: DragonType } {
  return (
    tile.suit === "honor" &&
    (tile.value === "white" || tile.value === "green" || tile.value === "red")
  );
}

// 面子の型ガード

export function isShuntsu(meld: Meld): meld is ShuntsuMeld {
  return meld.type === "shuntsu";
}

export function isKoutsu(meld: Meld): meld is KoutsuMeld {
  return meld.type === "koutsu";
}

export function isKantsu(meld: Meld): meld is KantsuMeld {
  return meld.type === "kantsu";
}

// 面子作成ヘルパー

export function shuntsu(
  t1: NumberTile,
  t2: NumberTile,
  t3: NumberTile,
  state: MeldState = "closed",
): ShuntsuMeld {
  return { type: "shuntsu", tiles: [t1, t2, t3], state };
}

export function koutsu(
  t1: Tile,
  t2: Tile,
  t3: Tile,
  state: MeldState = "closed",
): KoutsuMeld {
  return { type: "koutsu", tiles: [t1, t2, t3], state };
}

export function kantsu(
  t1: Tile,
  t2: Tile,
  t3: Tile,
  t4: Tile,
  state: MeldState = "closed",
): KantsuMeld {
  return { type: "kantsu", tiles: [t1, t2, t3, t4], state };
}

// ヘルパー関数

export function isTerminal(tile: Tile): boolean {
  return isNumberTile(tile) && (tile.value === 1 || tile.value === 9);
}

export function isTerminalOrHonor(tile: Tile): boolean {
  return isHonorTile(tile) || isTerminal(tile);
}

export function isSimple(tile: Tile): boolean {
  return isNumberTile(tile) && tile.value >= 2 && tile.value <= 8;
}

export function isYakuhai(
  tile: Tile,
  roundWind: Wind,
  seatWind: Wind,
): boolean {
  if (!isHonorTile(tile)) return false;
  // 三元牌
  if (isDragonTile(tile)) return true;
  // 場風
  if (tile.value === roundWind) return true;
  // 自風
  if (tile.value === seatWind) return true;
  return false;
}

export function isDoubleYakuhai(
  tile: Tile,
  roundWind: Wind,
  seatWind: Wind,
): boolean {
  if (!isWindTile(tile)) return false;
  // 場風かつ自風（例：東場の東家）
  return tile.value === roundWind && tile.value === seatWind;
}

// ========================================
// 役判定アルゴリズム用の型定義
// ========================================

/**
 * 和了形パターンの種別
 */
export type HandPattern = "regular" | "chiitoitsu" | "kokushi";

/**
 * 通常形の和了
 */
export interface RegularHand {
  pattern: "regular";
  head: Head;
  melds: Meld[];
}

/**
 * 七対子形の和了
 */
export interface ChiitoitsuHand {
  pattern: "chiitoitsu";
  pairs: [Tile, Tile][];
}

/**
 * 国士無双形の和了
 */
export interface KokushiHand {
  pattern: "kokushi";
  tiles: Tile[];
  waitTile: Tile;
  isThirteenWait: boolean;
}

/**
 * 和了形の統合型
 */
export type WinningHand = RegularHand | ChiitoitsuHand | KokushiHand;

/**
 * 特殊条件（リーチ、一発、嶺上開花など）
 */
export interface SpecialConditions {
  isRiichi?: boolean;
  isDoubleRiichi?: boolean;
  isIppatsu?: boolean;
  isRinshan?: boolean;
  isChankan?: boolean;
  isHaitei?: boolean;
  isHoutei?: boolean;
  isTenhou?: boolean;
  isChiihou?: boolean;
  /** ドラ表示牌（表ドラ） */
  doraIndicators?: Tile[];
  /** 裏ドラ表示牌 */
  uraDoraIndicators?: Tile[];
}

/**
 * 手牌解析の入力
 */
export interface HandParseInput {
  /** 閉じた手牌（副露していない牌） */
  closedTiles: Tile[];
  /** 副露した面子（暗槓含む） */
  openMelds: Meld[];
  /** 和了牌（ツモ/ロンで得た牌） */
  winTile: Tile;
}

/**
 * 手牌解析の結果
 */
export interface ParseResult {
  /** 可能な全ての和了形パターン */
  hands: WinningHand[];
  /** 和了形が存在するか */
  isWinning: boolean;
}

/**
 * 役判定の入力
 */
export interface YakuResolveInput {
  /** 解析結果 */
  parseResult: ParseResult;
  /** 和了牌 */
  winTile: Tile;
  /** 和了タイプ（ツモ/ロン） */
  winType: WinType;
  /** 場風 */
  roundWind: Wind;
  /** 自風 */
  seatWind: Wind;
  /** 門前かどうか */
  isMenzen: boolean;
  /** 親かどうか */
  isDealer: boolean;
  /** 特殊条件 */
  specialConditions?: SpecialConditions;
  /** ドラ計算用の元の手牌（isRedDoraプロパティを保持） */
  originalTiles?: Tile[];
}

/**
 * 役判定の結果
 */
export interface YakuResolveResult {
  /** 最高得点の和了形 */
  hand: WinningHand;
  /** 成立した役一覧 */
  yaku: YakuItem[];
  /** 符 */
  fu: number;
  /** 翻数 */
  han: number;
  /** 点数（ロン時は合計、ツモ時は子の支払い） */
  score: number;
  /** 待ちの種類 */
  waitType: WaitType;
  /** 点数ラベル（満貫、跳満など） */
  label?: string;
  /** ツモ時の親の支払い（子ツモ時のみ） */
  scoreDealer?: number;
}
