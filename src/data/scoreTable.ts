import type { ScoreEntry } from "@/lib/mahjong-types";

// 点数表データ
// 注: ツモの場合、親は子×3を支払い、子ツモは親と子×2
export const scoreTable: ScoreEntry[] = [
  // 1翻
  {
    fu: 30,
    han: 1,
    dealer: { tsumo: 500, ron: 1500 },
    nonDealer: { tsumoDealer: 500, tsumoNonDealer: 300, ron: 1000 },
  },
  {
    fu: 40,
    han: 1,
    dealer: { tsumo: 700, ron: 2000 },
    nonDealer: { tsumoDealer: 700, tsumoNonDealer: 400, ron: 1300 },
  },
  {
    fu: 50,
    han: 1,
    dealer: { tsumo: 800, ron: 2400 },
    nonDealer: { tsumoDealer: 800, tsumoNonDealer: 400, ron: 1600 },
  },
  {
    fu: 60,
    han: 1,
    dealer: { tsumo: 1000, ron: 2900 },
    nonDealer: { tsumoDealer: 1000, tsumoNonDealer: 500, ron: 2000 },
  },
  {
    fu: 70,
    han: 1,
    dealer: { tsumo: 1200, ron: 3400 },
    nonDealer: { tsumoDealer: 1200, tsumoNonDealer: 600, ron: 2300 },
  },
  {
    fu: 80,
    han: 1,
    dealer: { tsumo: 1300, ron: 3900 },
    nonDealer: { tsumoDealer: 1300, tsumoNonDealer: 700, ron: 2600 },
  },
  {
    fu: 90,
    han: 1,
    dealer: { tsumo: 1500, ron: 4400 },
    nonDealer: { tsumoDealer: 1500, tsumoNonDealer: 800, ron: 2900 },
  },
  {
    fu: 100,
    han: 1,
    dealer: { tsumo: 1600, ron: 4800 },
    nonDealer: { tsumoDealer: 1600, tsumoNonDealer: 800, ron: 3200 },
  },
  {
    fu: 110,
    han: 1,
    dealer: { tsumo: 1800, ron: 5300 },
    nonDealer: { tsumoDealer: 1800, tsumoNonDealer: 900, ron: 3600 },
  },

  // 2翻
  {
    fu: 20,
    han: 2,
    dealer: { tsumo: 700, ron: 2000 },
    nonDealer: { tsumoDealer: 700, tsumoNonDealer: 400, ron: 1300 },
  },
  {
    fu: 25,
    han: 2,
    dealer: { tsumo: 800, ron: 2400 },
    nonDealer: { tsumoDealer: 800, tsumoNonDealer: 400, ron: 1600 },
  }, // 七対子
  {
    fu: 30,
    han: 2,
    dealer: { tsumo: 1000, ron: 2900 },
    nonDealer: { tsumoDealer: 1000, tsumoNonDealer: 500, ron: 2000 },
  },
  {
    fu: 40,
    han: 2,
    dealer: { tsumo: 1300, ron: 3900 },
    nonDealer: { tsumoDealer: 1300, tsumoNonDealer: 700, ron: 2600 },
  },
  {
    fu: 50,
    han: 2,
    dealer: { tsumo: 1600, ron: 4800 },
    nonDealer: { tsumoDealer: 1600, tsumoNonDealer: 800, ron: 3200 },
  },
  {
    fu: 60,
    han: 2,
    dealer: { tsumo: 2000, ron: 5800 },
    nonDealer: { tsumoDealer: 2000, tsumoNonDealer: 1000, ron: 3900 },
  },
  {
    fu: 70,
    han: 2,
    dealer: { tsumo: 2300, ron: 6800 },
    nonDealer: { tsumoDealer: 2300, tsumoNonDealer: 1200, ron: 4500 },
  },
  {
    fu: 80,
    han: 2,
    dealer: { tsumo: 2600, ron: 7700 },
    nonDealer: { tsumoDealer: 2600, tsumoNonDealer: 1300, ron: 5200 },
  },
  {
    fu: 90,
    han: 2,
    dealer: { tsumo: 2900, ron: 8700 },
    nonDealer: { tsumoDealer: 2900, tsumoNonDealer: 1500, ron: 5800 },
  },
  {
    fu: 100,
    han: 2,
    dealer: { tsumo: 3200, ron: 9600 },
    nonDealer: { tsumoDealer: 3200, tsumoNonDealer: 1600, ron: 6400 },
  },
  {
    fu: 110,
    han: 2,
    dealer: { tsumo: 3600, ron: 10600 },
    nonDealer: { tsumoDealer: 3600, tsumoNonDealer: 1800, ron: 7100 },
  },

  // 3翻
  {
    fu: 20,
    han: 3,
    dealer: { tsumo: 1300, ron: 3900 },
    nonDealer: { tsumoDealer: 1300, tsumoNonDealer: 700, ron: 2600 },
  },
  {
    fu: 25,
    han: 3,
    dealer: { tsumo: 1600, ron: 4800 },
    nonDealer: { tsumoDealer: 1600, tsumoNonDealer: 800, ron: 3200 },
  },
  {
    fu: 30,
    han: 3,
    dealer: { tsumo: 2000, ron: 5800 },
    nonDealer: { tsumoDealer: 2000, tsumoNonDealer: 1000, ron: 3900 },
  },
  {
    fu: 40,
    han: 3,
    dealer: { tsumo: 2600, ron: 7700 },
    nonDealer: { tsumoDealer: 2600, tsumoNonDealer: 1300, ron: 5200 },
  },
  {
    fu: 50,
    han: 3,
    dealer: { tsumo: 3200, ron: 9600 },
    nonDealer: { tsumoDealer: 3200, tsumoNonDealer: 1600, ron: 6400 },
  },
  {
    fu: 60,
    han: 3,
    dealer: { tsumo: 3900, ron: 11600 },
    nonDealer: { tsumoDealer: 3900, tsumoNonDealer: 2000, ron: 7700 },
  },
  {
    fu: 70,
    han: 3,
    dealer: { tsumo: 4000, ron: 12000 },
    nonDealer: { tsumoDealer: 4000, tsumoNonDealer: 2000, ron: 8000 },
    label: "満貫",
  },

  // 4翻
  {
    fu: 20,
    han: 4,
    dealer: { tsumo: 2600, ron: 7700 },
    nonDealer: { tsumoDealer: 2600, tsumoNonDealer: 1300, ron: 5200 },
  },
  {
    fu: 25,
    han: 4,
    dealer: { tsumo: 3200, ron: 9600 },
    nonDealer: { tsumoDealer: 3200, tsumoNonDealer: 1600, ron: 6400 },
  },
  {
    fu: 30,
    han: 4,
    dealer: { tsumo: 3900, ron: 11600 },
    nonDealer: { tsumoDealer: 3900, tsumoNonDealer: 2000, ron: 7700 },
  },
  {
    fu: 40,
    han: 4,
    dealer: { tsumo: 4000, ron: 12000 },
    nonDealer: { tsumoDealer: 4000, tsumoNonDealer: 2000, ron: 8000 },
    label: "満貫",
  },

  // 満貫以上
  {
    fu: 0,
    han: 5,
    dealer: { tsumo: 4000, ron: 12000 },
    nonDealer: { tsumoDealer: 4000, tsumoNonDealer: 2000, ron: 8000 },
    label: "満貫",
  },
  {
    fu: 0,
    han: 6,
    dealer: { tsumo: 6000, ron: 18000 },
    nonDealer: { tsumoDealer: 6000, tsumoNonDealer: 3000, ron: 12000 },
    label: "跳満",
  },
  {
    fu: 0,
    han: 7,
    dealer: { tsumo: 6000, ron: 18000 },
    nonDealer: { tsumoDealer: 6000, tsumoNonDealer: 3000, ron: 12000 },
    label: "跳満",
  },
  {
    fu: 0,
    han: 8,
    dealer: { tsumo: 8000, ron: 24000 },
    nonDealer: { tsumoDealer: 8000, tsumoNonDealer: 4000, ron: 16000 },
    label: "倍満",
  },
  {
    fu: 0,
    han: 9,
    dealer: { tsumo: 8000, ron: 24000 },
    nonDealer: { tsumoDealer: 8000, tsumoNonDealer: 4000, ron: 16000 },
    label: "倍満",
  },
  {
    fu: 0,
    han: 10,
    dealer: { tsumo: 8000, ron: 24000 },
    nonDealer: { tsumoDealer: 8000, tsumoNonDealer: 4000, ron: 16000 },
    label: "倍満",
  },
  {
    fu: 0,
    han: 11,
    dealer: { tsumo: 12000, ron: 36000 },
    nonDealer: { tsumoDealer: 12000, tsumoNonDealer: 6000, ron: 24000 },
    label: "三倍満",
  },
  {
    fu: 0,
    han: 12,
    dealer: { tsumo: 12000, ron: 36000 },
    nonDealer: { tsumoDealer: 12000, tsumoNonDealer: 6000, ron: 24000 },
    label: "三倍満",
  },
  {
    fu: 0,
    han: 13,
    dealer: { tsumo: 16000, ron: 48000 },
    nonDealer: { tsumoDealer: 16000, tsumoNonDealer: 8000, ron: 32000 },
    label: "役満",
  },
];

// 翻数ごとの点数を取得
export function getScoresForHan(han: number): ScoreEntry[] {
  return scoreTable.filter((entry) => entry.han === han);
}

// 符と翻から点数を取得
export function getScoreForFuHan(
  fu: number,
  han: number,
): ScoreEntry | undefined {
  // 満貫以上は符に関係なく同じ点数
  if (han >= 5) {
    return scoreTable.find((entry) => entry.han === han);
  }
  return scoreTable.find((entry) => entry.fu === fu && entry.han === han);
}

// 限定役の判定用
export function getLimitLabel(han: number): string | undefined {
  if (han >= 13) return "役満";
  if (han >= 11) return "三倍満";
  if (han >= 8) return "倍満";
  if (han >= 6) return "跳満";
  if (han >= 5) return "満貫";
  return undefined;
}
