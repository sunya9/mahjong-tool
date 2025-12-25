/**
 * 役判定統合モジュール
 *
 * 手牌解析結果から役判定・符計算・点数計算を行い、
 * 最高得点のパターンを返す
 */

import type {
  Tile,
  WinType,
  WaitType,
  Wind,
  YakuResolveInput,
  YakuResolveResult,
  WinningHand,
  RegularHand,
  ChiitoitsuHand,
  KokushiHand,
  SpecialConditions,
  Meld,
} from "./mahjong-types";
import { parseHand, tilesEqual } from "./hand-parser";
import { calculateFu } from "./fu-calculator";
import {
  calculateYakuWithConditions,
  calculateChiitoitsuYaku,
  calculateKokushiYaku,
} from "./yaku-calculator";
import { calculateScore, getTotalScore } from "./score-calculator";

// ========================================
// 待ち判定
// ========================================

/**
 * 通常形の待ちの種類を判定
 */
export function determineWaitType(hand: RegularHand, winTile: Tile): WaitType {
  // 雀頭での待ち（単騎）
  if (tilesEqual(hand.head.tiles[0], winTile)) {
    return "tanki";
  }

  // 面子での待ちを判定
  for (const meld of hand.melds) {
    // 刻子での待ち（双碰）
    if (meld.type === "koutsu" && tilesEqual(meld.tiles[0], winTile)) {
      return "shanpon";
    }

    // 順子での待ち
    if (meld.type === "shuntsu") {
      const waitInfo = analyzeShuntsuWait(meld.tiles, winTile);
      if (waitInfo) return waitInfo;
    }
  }

  // デフォルト（通常はここには来ない）
  return "ryanmen";
}

/**
 * 順子での待ちを分析
 */
function analyzeShuntsuWait(tiles: Tile[], winTile: Tile): WaitType | null {
  // 順子の牌を値でソート
  const values = tiles
    .filter((t) => t.suit !== "honor")
    .map((t) => t.value)
    .sort((a, b) => a - b);

  if (values.length !== 3) return null;

  // 和了牌がこの順子に含まれるか
  const winValue = winTile.suit !== "honor" ? winTile.value : null;
  if (winValue === null) return null;
  if (tiles[0].suit !== winTile.suit) return null;

  const [v1, v2, v3] = values;

  // 嵌張待ち（真ん中で待つ）
  if (winValue === v2) {
    return "kanchan";
  }

  // 辺張待ち（123の3待ち、または789の7待ち）
  if (v1 === 1 && v2 === 2 && v3 === 3 && winValue === 3) {
    return "penchan";
  }
  if (v1 === 7 && v2 === 8 && v3 === 9 && winValue === 7) {
    return "penchan";
  }

  // 両面待ち（両端で待つ）
  if (winValue === v1 || winValue === v3) {
    return "ryanmen";
  }

  return null;
}

// ========================================
// 役判定メイン
// ========================================

/**
 * 単一の和了形に対する役・符・点数を計算
 * @param originalTiles ドラ計算用の元の手牌（isRedDoraプロパティを保持）
 */
function calculateForHand(
  hand: WinningHand,
  winTile: Tile,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
  isDealer: boolean,
  conditions?: SpecialConditions,
  originalTiles?: Tile[],
): YakuResolveResult | null {
  switch (hand.pattern) {
    case "regular":
      return calculateRegularResult(
        hand,
        winTile,
        winType,
        roundWind,
        seatWind,
        isMenzen,
        isDealer,
        conditions,
        originalTiles,
      );
    case "chiitoitsu":
      return calculateChiitoitsuResult(
        hand,
        winTile,
        winType,
        roundWind,
        seatWind,
        isDealer,
        conditions,
        originalTiles,
      );
    case "kokushi":
      return calculateKokushiResult(
        hand,
        winTile,
        winType,
        isDealer,
        conditions,
      );
    default:
      return null;
  }
}

/**
 * 通常形の役判定
 */
function calculateRegularResult(
  hand: RegularHand,
  winTile: Tile,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
  isDealer: boolean,
  conditions?: SpecialConditions,
  originalTiles?: Tile[],
): YakuResolveResult {
  const waitType = determineWaitType(hand, winTile);

  // 役計算
  const yakuResult = calculateYakuWithConditions(
    hand.melds,
    hand.head,
    waitType,
    winType,
    roundWind,
    seatWind,
    isMenzen,
    conditions,
    originalTiles,
  );

  // 役なしの場合
  if (yakuResult.totalHan === 0) {
    return {
      hand,
      yaku: [],
      fu: 0,
      han: 0,
      score: 0,
      waitType,
    };
  }

  // 符計算
  const fuResult = calculateFu({
    melds: hand.melds,
    head: hand.head,
    waitType,
    winType,
    roundWind,
    seatWind,
    isMenzen,
  });

  // 点数計算
  const scoreResult = calculateScore(
    fuResult.total,
    yakuResult.totalHan,
    isDealer,
    winType,
  );

  return {
    hand,
    yaku: yakuResult.yaku.map((y) => ({ name: y.name, han: y.han })),
    fu: fuResult.total,
    han: yakuResult.totalHan,
    score: scoreResult.score,
    scoreDealer: scoreResult.scoreDealer,
    waitType,
    label: scoreResult.label,
  };
}

/**
 * 七対子の役判定
 */
function calculateChiitoitsuResult(
  hand: ChiitoitsuHand,
  _winTile: Tile,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isDealer: boolean,
  conditions?: SpecialConditions,
  originalTiles?: Tile[],
): YakuResolveResult {
  // 役計算
  const yakuResult = calculateChiitoitsuYaku(
    hand,
    winType,
    roundWind,
    seatWind,
    conditions,
    originalTiles,
  );

  // 七対子は固定25符
  const fu = 25;

  // 点数計算
  const scoreResult = calculateScore(
    fu,
    yakuResult.totalHan,
    isDealer,
    winType,
  );

  return {
    hand,
    yaku: yakuResult.yaku.map((y) => ({ name: y.name, han: y.han })),
    fu,
    han: yakuResult.totalHan,
    score: scoreResult.score,
    scoreDealer: scoreResult.scoreDealer,
    waitType: "tanki",
    label: scoreResult.label,
  };
}

/**
 * 国士無双の役判定
 */
function calculateKokushiResult(
  hand: KokushiHand,
  _winTile: Tile,
  winType: WinType,
  isDealer: boolean,
  conditions?: SpecialConditions,
): YakuResolveResult {
  // 役計算
  const yakuResult = calculateKokushiYaku(hand, winType, conditions);

  // 役満は符計算なし
  const fu = 0;

  // 点数計算
  const scoreResult = calculateScore(
    fu,
    yakuResult.totalHan,
    isDealer,
    winType,
  );

  return {
    hand,
    yaku: yakuResult.yaku.map((y) => ({ name: y.name, han: y.han })),
    fu,
    han: yakuResult.totalHan,
    score: scoreResult.score,
    scoreDealer: scoreResult.scoreDealer,
    waitType: "tanki",
    label: scoreResult.label,
  };
}

// ========================================
// 公開API
// ========================================

/**
 * 全パターンから最高得点を選択して役判定結果を返す
 */
function resolveYaku(input: YakuResolveInput): YakuResolveResult | null {
  const {
    parseResult,
    winTile,
    winType,
    roundWind,
    seatWind,
    isMenzen,
    isDealer,
    specialConditions,
    originalTiles,
  } = input;

  if (!parseResult.isWinning) {
    return null;
  }

  const results: YakuResolveResult[] = [];

  // ドラは役ではないので、ドラ以外の役がない場合は和了不成立
  const doraNames = ["ドラ", "裏ドラ", "赤ドラ"];

  for (const hand of parseResult.hands) {
    const result = calculateForHand(
      hand,
      winTile,
      winType,
      roundWind,
      seatWind,
      isMenzen,
      isDealer,
      specialConditions,
      originalTiles,
    );
    if (result && result.han > 0) {
      // ドラ以外の役があるかチェック
      const hasNonDoraYaku = result.yaku.some(
        (y) => !doraNames.includes(y.name),
      );
      if (hasNonDoraYaku) {
        results.push(result);
      }
    }
  }

  if (results.length === 0) {
    return null;
  }

  // 最高得点のパターンを選択
  // 同点の場合は翻数が高い方、さらに同じなら符が高い方を優先
  return results.reduce((best, current) => {
    const bestTotal = getTotalScore(
      { score: best.score, scoreDealer: best.scoreDealer },
      isDealer,
      winType,
    );
    const currentTotal = getTotalScore(
      { score: current.score, scoreDealer: current.scoreDealer },
      isDealer,
      winType,
    );

    if (currentTotal > bestTotal) return current;
    if (currentTotal < bestTotal) return best;
    if (current.han > best.han) return current;
    if (current.han < best.han) return best;
    if (current.fu > best.fu) return current;
    return best;
  });
}

/**
 * 生の手牌から役判定を行う便利関数
 */
export function resolveYakuFromHand(
  closedTiles: Tile[],
  openMelds: Meld[],
  winTile: Tile,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  specialConditions?: SpecialConditions,
): YakuResolveResult | null {
  // 手牌解析
  const parseResult = parseHand({
    closedTiles,
    openMelds,
    winTile,
  });

  // 門前判定
  const isMenzen = openMelds.every((m) => m.state === "closed");

  // 親判定
  const isDealer = seatWind === "east";

  // ドラ計算用の元の手牌を構築（isRedDoraプロパティを保持）
  const originalTiles: Tile[] = [
    ...closedTiles,
    ...openMelds.flatMap((m) => m.tiles),
    winTile,
  ];

  // 役判定
  return resolveYaku({
    parseResult,
    winTile,
    winType,
    roundWind,
    seatWind,
    isMenzen,
    isDealer,
    specialConditions,
    originalTiles,
  });
}
