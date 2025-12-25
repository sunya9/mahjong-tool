import type {
  Meld,
  Head,
  WaitType,
  WinType,
  Wind,
  FuItem,
} from "./mahjong-types";
import { isTerminalOrHonor, isYakuhai, isDoubleYakuhai } from "./mahjong-types";

interface FuCalculationInput {
  melds: Meld[];
  head: Head;
  waitType: WaitType;
  winType: WinType;
  roundWind: Wind;
  seatWind: Wind;
  isMenzen: boolean;
}

// 待ちの日本語名
function getWaitName(waitType: WaitType): string {
  const names: Record<WaitType, string> = {
    ryanmen: "両面",
    kanchan: "嵌張",
    penchan: "辺張",
    shanpon: "双碰",
    tanki: "単騎",
  };
  return names[waitType];
}

// 面子の日本語名
function getMeldName(meld: Meld): string {
  const tiles = meld.tiles;
  const firstTile = tiles[0];
  const isYaochu = isTerminalOrHonor(firstTile);
  const statePrefix = meld.state === "closed" ? "暗" : "明";

  switch (meld.type) {
    case "shuntsu":
      return `順子`;
    case "koutsu":
      return `${isYaochu ? "幺九牌" : "中張牌"}${statePrefix}刻`;
    case "kantsu":
      return `${isYaochu ? "幺九牌" : "中張牌"}${statePrefix}槓`;
  }
}

// 面子の符を計算
function calculateMeldFu(meld: Meld): number {
  if (meld.type === "shuntsu") return 0;

  const firstTile = meld.tiles[0];
  const isYaochu = isTerminalOrHonor(firstTile);
  const isClosed = meld.state === "closed";

  if (meld.type === "koutsu") {
    // 刻子: 中張牌(暗4/明2), 幺九牌(暗8/明4)
    if (isYaochu) {
      return isClosed ? 8 : 4;
    }
    return isClosed ? 4 : 2;
  }

  if (meld.type === "kantsu") {
    // 槓子: 刻子の2倍
    if (isYaochu) {
      return isClosed ? 32 : 16;
    }
    return isClosed ? 16 : 8;
  }

  return 0;
}

// 雀頭の符を計算
function calculateHeadFu(head: Head, roundWind: Wind, seatWind: Wind): number {
  const tile = head.tiles[0];

  // ダブル役牌（場風かつ自風）
  if (isDoubleYakuhai(tile, roundWind, seatWind)) {
    return 4;
  }

  // 役牌
  if (isYakuhai(tile, roundWind, seatWind)) {
    return 2;
  }

  return 0;
}

// ピンフ判定
function isPinfu(
  melds: Meld[],
  head: Head,
  waitType: WaitType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
): boolean {
  // 門前でない場合はピンフにならない
  if (!isMenzen) return false;

  // 全て順子でなければピンフにならない
  if (!melds.every((m) => m.type === "shuntsu")) return false;

  // 雀頭が役牌の場合はピンフにならない
  if (isYakuhai(head.tiles[0], roundWind, seatWind)) return false;

  // 両面待ちでなければピンフにならない
  if (waitType !== "ryanmen") return false;

  return true;
}

// 符を計算
export function calculateFu(input: FuCalculationInput): {
  total: number;
  breakdown: FuItem[];
} {
  const { melds, head, waitType, winType, roundWind, seatWind, isMenzen } =
    input;
  const breakdown: FuItem[] = [];

  // ピンフ判定
  const pinfu = isPinfu(melds, head, waitType, roundWind, seatWind, isMenzen);

  // 1. 副底（基本符）
  const baseFu = isMenzen && winType === "ron" ? 30 : 20;
  breakdown.push({
    name: "副底",
    fu: baseFu,
    description: isMenzen && winType === "ron" ? "門前ロン" : "基本符",
  });

  // 2. ツモ符（ピンフツモの場合は加算しない）
  if (winType === "tsumo" && !pinfu) {
    breakdown.push({
      name: "ツモ",
      fu: 2,
    });
  }

  // 3. 待ち符
  const waitFuMap: Record<WaitType, number> = {
    ryanmen: 0,
    kanchan: 2,
    penchan: 2,
    shanpon: 0,
    tanki: 2,
  };
  const waitFu = waitFuMap[waitType];
  if (waitFu > 0) {
    breakdown.push({
      name: `${getWaitName(waitType)}待ち`,
      fu: waitFu,
    });
  }

  // 4. 雀頭符
  const headFu = calculateHeadFu(head, roundWind, seatWind);
  if (headFu > 0) {
    breakdown.push({
      name: "雀頭",
      fu: headFu,
      description: headFu === 4 ? "ダブル役牌" : "役牌",
      tiles: head.tiles,
      head,
    });
  }

  // 5. 面子符
  for (const meld of melds) {
    const meldFu = calculateMeldFu(meld);
    if (meldFu > 0) {
      breakdown.push({
        name: getMeldName(meld),
        fu: meldFu,
        tiles: meld.tiles,
        meld,
      });
    }
  }

  // 合計（10符単位に切り上げ）
  const rawTotal = breakdown.reduce((sum, item) => sum + item.fu, 0);
  const total = Math.ceil(rawTotal / 10) * 10;

  return { total, breakdown };
}

// 有効な符の値（25符は七対子専用なので除外）
const VALID_FU_VALUES = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

// 符の選択肢を生成（クイズ用）
export function generateFuOptions(correctFu: number): number[] {
  const higherValues = VALID_FU_VALUES.filter((fu) => fu > correctFu);
  const lowerValues = VALID_FU_VALUES.filter((fu) => fu < correctFu);

  let distractors: number[];

  // ランダムに選択パターンを決定
  const pattern = Math.random();

  if (pattern < 0.25 && higherValues.length >= 3) {
    // 25%: 正解より大きい値から選択 (例: 40 → [50, 60, 70])
    distractors = higherValues.slice(0, 3);
  } else if (pattern < 0.5 && lowerValues.length >= 3) {
    // 25%: 正解より小さい値から選択 (例: 70 → [40, 50, 60])
    distractors = lowerValues.slice(-3);
  } else {
    // 50%: 正解に近い値から選択（従来の動作）
    const candidates = VALID_FU_VALUES.filter((fu) => fu !== correctFu).sort(
      (a, b) => Math.abs(a - correctFu) - Math.abs(b - correctFu),
    );
    distractors = candidates.slice(0, 3);
  }

  return [correctFu, ...distractors].sort((a, b) => a - b);
}
