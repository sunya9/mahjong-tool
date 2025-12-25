/**
 * 点数計算モジュール
 *
 * 符と翻数から点数を算出する
 */

import type { WinType } from "./mahjong-types";
import { scoreTable } from "@/data/scoreTable";

/**
 * 点数計算の結果
 */
export interface ScoreCalculationResult {
  /** 点数（ロン時は合計、ツモ時は子の支払い） */
  score: number;
  /** ツモ時の親の支払い（子ツモ時のみ） */
  scoreDealer?: number;
  /** 点数ラベル（満貫、跳満など） */
  label?: string;
}

/**
 * 符と翻数から点数を計算
 */
export function calculateScore(
  fu: number,
  han: number,
  isDealer: boolean,
  winType: WinType,
): ScoreCalculationResult {
  // 役満
  if (han >= 13) {
    const yakumanCount = Math.floor(han / 13);
    return calculateYakumanScore(isDealer, winType, yakumanCount);
  }

  // 三倍満（11-12翻）
  if (han >= 11) {
    return calculateLimitScore(isDealer, winType, "三倍満");
  }

  // 倍満（8-10翻）
  if (han >= 8) {
    return calculateLimitScore(isDealer, winType, "倍満");
  }

  // 跳満（6-7翻）
  if (han >= 6) {
    return calculateLimitScore(isDealer, winType, "跳満");
  }

  // 満貫（5翻、または符と翻の組み合わせで満貫に達する場合）
  if (han >= 5) {
    return calculateLimitScore(isDealer, winType, "満貫");
  }

  // 4翻で30符以上、または3翻で60符以上は満貫
  if ((han === 4 && fu >= 30) || (han === 3 && fu >= 60)) {
    return calculateLimitScore(isDealer, winType, "満貫");
  }

  // 点数表から検索
  const entry = scoreTable.find((e) => e.fu === fu && e.han === han);
  if (entry) {
    if (isDealer) {
      if (winType === "tsumo") {
        return {
          score: entry.dealer.tsumo,
          label: entry.label,
        };
      } else {
        return {
          score: entry.dealer.ron,
          label: entry.label,
        };
      }
    } else {
      if (winType === "tsumo") {
        return {
          score: entry.nonDealer.tsumoNonDealer,
          scoreDealer: entry.nonDealer.tsumoDealer,
          label: entry.label,
        };
      } else {
        return {
          score: entry.nonDealer.ron,
          label: entry.label,
        };
      }
    }
  }

  // 点数表にない場合は計算で求める（通常はありえない）
  return calculateBaseScore(fu, han, isDealer, winType);
}

/**
 * 役満の点数を計算
 */
function calculateYakumanScore(
  isDealer: boolean,
  winType: WinType,
  count: number,
): ScoreCalculationResult {
  const labelPrefix = count > 1 ? `${count}倍` : "";
  const label = `${labelPrefix}役満`;

  if (isDealer) {
    if (winType === "tsumo") {
      return {
        score: 16000 * count,
        label,
      };
    } else {
      return {
        score: 48000 * count,
        label,
      };
    }
  } else {
    if (winType === "tsumo") {
      return {
        score: 8000 * count,
        scoreDealer: 16000 * count,
        label,
      };
    } else {
      return {
        score: 32000 * count,
        label,
      };
    }
  }
}

/**
 * 満貫以上の点数を計算
 */
function calculateLimitScore(
  isDealer: boolean,
  winType: WinType,
  label: string,
): ScoreCalculationResult {
  const scores: Record<
    string,
    {
      dealer: { tsumo: number; ron: number };
      nonDealer: { tsumo: number; tsumoDealer: number; ron: number };
    }
  > = {
    満貫: {
      dealer: { tsumo: 4000, ron: 12000 },
      nonDealer: { tsumo: 2000, tsumoDealer: 4000, ron: 8000 },
    },
    跳満: {
      dealer: { tsumo: 6000, ron: 18000 },
      nonDealer: { tsumo: 3000, tsumoDealer: 6000, ron: 12000 },
    },
    倍満: {
      dealer: { tsumo: 8000, ron: 24000 },
      nonDealer: { tsumo: 4000, tsumoDealer: 8000, ron: 16000 },
    },
    三倍満: {
      dealer: { tsumo: 12000, ron: 36000 },
      nonDealer: { tsumo: 6000, tsumoDealer: 12000, ron: 24000 },
    },
  };

  const data = scores[label];
  if (!data) {
    throw new Error(`Unknown limit label: ${label}`);
  }

  if (isDealer) {
    if (winType === "tsumo") {
      return { score: data.dealer.tsumo, label };
    } else {
      return { score: data.dealer.ron, label };
    }
  } else {
    if (winType === "tsumo") {
      return {
        score: data.nonDealer.tsumo,
        scoreDealer: data.nonDealer.tsumoDealer,
        label,
      };
    } else {
      return { score: data.nonDealer.ron, label };
    }
  }
}

/**
 * 基本点から点数を計算（点数表にない場合のフォールバック）
 */
function calculateBaseScore(
  fu: number,
  han: number,
  isDealer: boolean,
  winType: WinType,
): ScoreCalculationResult {
  // 基本点 = 符 × 2^(翻+2)
  const baseScore = fu * Math.pow(2, han + 2);

  // 満貫を超える場合
  if (baseScore >= 2000) {
    return calculateLimitScore(isDealer, winType, "満貫");
  }

  if (isDealer) {
    if (winType === "tsumo") {
      // 親ツモ: 子が基本点×2を支払い
      const score = roundUp100(baseScore * 2);
      return { score };
    } else {
      // 親ロン: 基本点×6
      const score = roundUp100(baseScore * 6);
      return { score };
    }
  } else {
    if (winType === "tsumo") {
      // 子ツモ: 子が基本点、親が基本点×2
      const scoreNonDealer = roundUp100(baseScore);
      const scoreDealer = roundUp100(baseScore * 2);
      return { score: scoreNonDealer, scoreDealer };
    } else {
      // 子ロン: 基本点×4
      const score = roundUp100(baseScore * 4);
      return { score };
    }
  }
}

/**
 * 100点単位で切り上げ
 */
function roundUp100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

/**
 * 点数から合計点を計算
 * ツモの場合は支払いの合計、ロンの場合はそのまま
 */
export function getTotalScore(
  result: ScoreCalculationResult,
  isDealer: boolean,
  winType: WinType,
): number {
  if (winType === "ron") {
    return result.score;
  }

  // ツモの場合
  if (isDealer) {
    // 親ツモ: 子3人から支払い
    return result.score * 3;
  } else {
    // 子ツモ: 子2人 + 親1人から支払い
    return result.score * 2 + (result.scoreDealer ?? result.score);
  }
}
