import type {
  Tile,
  NumberTile,
  Meld,
  ShuntsuMeld,
  KoutsuMeld,
  KantsuMeld,
  Head,
  WaitType,
  WinType,
  Wind,
  QuizProblem,
  ScoreQuizProblem,
  ScoreQuizCategory,
  SpecialConditions,
  TileNumber,
  HonorType,
  TileSuit,
} from "./mahjong-types";
import { isNumberTile } from "./mahjong-types";
import { calculateFu } from "./fu-calculator";
import { resolveYakuFromHand } from "./yaku-resolver";

// 字牌の順序: 1z=東, 2z=南, 3z=西, 4z=北, 5z=白, 6z=發, 7z=中
const honorOrder: HonorType[] = [
  "east",
  "south",
  "west",
  "north",
  "white",
  "green",
  "red",
];

// 牌を文字列に変換 (例: 1m, 5p, 9s, 1z-7z)
// 赤ドラの5は0で表現 (0m, 0p, 0s)
function tileToString(tile: Tile): string {
  if (tile.suit === "honor") {
    const idx = honorOrder.indexOf(tile.value as HonorType);
    return `${idx + 1}z`;
  }
  // 赤ドラの5は0で表現
  const value =
    isNumberTile(tile) && tile.value === 5 && tile.isRedDora ? 0 : tile.value;
  if (tile.suit === "man") return `${value}m`;
  if (tile.suit === "pin") return `${value}p`;
  return `${value}s`;
}

function stringToTile(str: string): Tile | null {
  const match = str.match(/^(\d)([mpsz])$/i);
  if (!match) return null;
  const [, numStr, suit] = match;
  const num = parseInt(numStr, 10);
  const suitLower = suit.toLowerCase();

  // 0は赤ドラの5
  if (num === 0) {
    if (suitLower === "m") return { suit: "man", value: 5, isRedDora: true };
    if (suitLower === "p") return { suit: "pin", value: 5, isRedDora: true };
    if (suitLower === "s") return { suit: "sou", value: 5, isRedDora: true };
    return null;
  }

  if (suitLower === "m") return { suit: "man", value: num as TileNumber };
  if (suitLower === "p") return { suit: "pin", value: num as TileNumber };
  if (suitLower === "s") return { suit: "sou", value: num as TileNumber };
  if (suitLower === "z" && num >= 1 && num <= 7) {
    return { suit: "honor", value: honorOrder[num - 1] };
  }
  return null;
}

// 面子を文字列に変換
// 例: 123m (順子), 111p (刻子), 1111s (槓子)
// 副露は大文字: 123M, 111P
// 赤ドラを含む場合は各牌を個別に: 4m0m6m
function meldToString(meld: Meld): string {
  const firstTile = meld.tiles[0];
  let suitChar: string;

  if (firstTile.suit === "man") suitChar = "m";
  else if (firstTile.suit === "pin") suitChar = "p";
  else if (firstTile.suit === "sou") suitChar = "s";
  else suitChar = "z";

  // 副露は大文字
  if (meld.state === "open") suitChar = suitChar.toUpperCase();

  // 赤ドラを含むかチェック
  const hasRedDora = meld.tiles.some((t) => isNumberTile(t) && t.isRedDora);

  // 赤ドラを含む場合は各牌を個別にシリアライズ
  if (hasRedDora) {
    return meld.tiles
      .map((t) => {
        if (isNumberTile(t)) {
          const val = t.value === 5 && t.isRedDora ? 0 : t.value;
          return `${val}${suitChar}`;
        }
        const val = honorOrder.indexOf(t.value as HonorType) + 1;
        return `${val}${suitChar}`;
      })
      .join("");
  }

  if (meld.type === "shuntsu") {
    const start = firstTile.value as number;
    return `${start}${start + 1}${start + 2}${suitChar}`;
  } else if (meld.type === "koutsu") {
    const val =
      firstTile.suit === "honor"
        ? honorOrder.indexOf(firstTile.value as HonorType) + 1
        : firstTile.value;
    return `${val}${val}${val}${suitChar}`;
  } else {
    // kantsu
    const val =
      firstTile.suit === "honor"
        ? honorOrder.indexOf(firstTile.value as HonorType) + 1
        : firstTile.value;
    return `${val}${val}${val}${val}${suitChar}`;
  }
}

function stringToMeld(str: string): Meld | null {
  // パターン1: 赤ドラ含む個別形式 (4m0m6m, 0m5m5m5m など)
  // 各牌が {digit}{suit} 形式で連結されている
  const individualMatch = str.match(/^(\d[mpszMPSZ])+$/);
  if (individualMatch && str.length >= 6) {
    // 個別形式の場合
    const tileMatches = str.match(/\d[mpszMPSZ]/g);
    if (!tileMatches) return null;

    const firstSuitChar = tileMatches[0][1];
    const isOpen = firstSuitChar === firstSuitChar.toUpperCase();
    const suitLower = firstSuitChar.toLowerCase();

    let suit: TileSuit;
    if (suitLower === "m") suit = "man";
    else if (suitLower === "p") suit = "pin";
    else if (suitLower === "s") suit = "sou";
    else suit = "honor";

    const state = isOpen ? "open" : "closed";

    const tiles: Tile[] = tileMatches.map((tm) => {
      const digit = parseInt(tm[0], 10);
      if (digit === 0) {
        // 赤ドラの5
        return { suit, value: 5, isRedDora: true } as NumberTile;
      }
      if (suit === "honor") {
        return { suit: "honor", value: honorOrder[digit - 1] };
      }
      return { suit, value: digit as TileNumber };
    });

    if (tiles.length === 3) {
      // 順子か刻子を判定
      const values = tiles.map((t) => (t.suit === "honor" ? 0 : t.value));
      if (values[0] === values[1] && values[1] === values[2]) {
        return { type: "koutsu", tiles, state } as KoutsuMeld;
      }
      return { type: "shuntsu", tiles, state } as ShuntsuMeld;
    } else if (tiles.length === 4) {
      return { type: "kantsu", tiles, state } as KantsuMeld;
    }
    return null;
  }

  // パターン2: 通常形式 123m, 111P, 1111z など
  const match = str.match(/^(\d+)([mpszMPSZ])$/);
  if (!match) return null;

  const [, nums, suitChar] = match;
  const isOpen = suitChar === suitChar.toUpperCase();
  const suitLower = suitChar.toLowerCase();

  let suit: TileSuit;
  if (suitLower === "m") suit = "man";
  else if (suitLower === "p") suit = "pin";
  else if (suitLower === "s") suit = "sou";
  else suit = "honor";

  const state = isOpen ? "open" : "closed";

  if (nums.length === 3) {
    const digits = nums.split("").map(Number);
    // 同じ数字なら刻子、連続なら順子
    if (digits[0] === digits[1] && digits[1] === digits[2]) {
      // 刻子
      const tile: Tile =
        suit === "honor"
          ? { suit: "honor", value: honorOrder[digits[0] - 1] }
          : { suit, value: digits[0] as TileNumber };
      const meld: KoutsuMeld = {
        type: "koutsu",
        tiles: [tile, tile, tile],
        state,
      };
      return meld;
    } else {
      // 順子
      if (suit === "honor") return null; // 字牌に順子はない
      const t1: NumberTile = { suit, value: digits[0] as TileNumber };
      const t2: NumberTile = { suit, value: digits[1] as TileNumber };
      const t3: NumberTile = { suit, value: digits[2] as TileNumber };
      const meld: ShuntsuMeld = { type: "shuntsu", tiles: [t1, t2, t3], state };
      return meld;
    }
  } else if (nums.length === 4) {
    // 槓子
    const digit = parseInt(nums[0], 10);
    const tile: Tile =
      suit === "honor"
        ? { suit: "honor", value: honorOrder[digit - 1] }
        : { suit, value: digit as TileNumber };
    const meld: KantsuMeld = {
      type: "kantsu",
      tiles: [tile, tile, tile, tile],
      state,
    };
    return meld;
  }

  return null;
}

// 待ちタイプの文字列変換
const waitTypeMap: Record<WaitType, string> = {
  ryanmen: "r",
  kanchan: "k",
  penchan: "p",
  shanpon: "s",
  tanki: "t",
};
const waitTypeReverseMap: Record<string, WaitType> = {
  r: "ryanmen",
  k: "kanchan",
  p: "penchan",
  s: "shanpon",
  t: "tanki",
};

// 風の文字列変換
const windMap: Record<Wind, string> = {
  east: "E",
  south: "S",
  west: "W",
  north: "N",
};
const windReverseMap: Record<string, Wind> = {
  E: "east",
  S: "south",
  W: "west",
  N: "north",
};

// 問題をURLクエリパラメータにシリアライズ
// 形式: 面子1.面子2.面子3.面子4.雀頭.和了牌.待ち.ツモロン.場風.自風.門前.待ち面子.雀頭待ち
// 例: 123m.456p.789s.111z.55m.3m.r.T.E.S.1.0.0
export function serializeProblem(problem: QuizProblem): string {
  const parts: string[] = [];

  // 面子 (4つ)
  for (const meld of problem.melds) {
    parts.push(meldToString(meld));
  }

  // 雀頭 (牌2文字)
  const headTile = problem.head.tiles[0];
  parts.push(tileToString(headTile) + tileToString(headTile));

  // 和了牌
  parts.push(tileToString(problem.winTile));

  // 待ちタイプ
  parts.push(waitTypeMap[problem.waitType]);

  // 和了タイプ (T=ツモ, R=ロン)
  parts.push(problem.winType === "tsumo" ? "T" : "R");

  // 場風
  parts.push(windMap[problem.roundWind]);

  // 自風
  parts.push(windMap[problem.seatWind]);

  // 門前フラグ (1=門前, 0=副露あり)
  parts.push(problem.isMenzen ? "1" : "0");

  // waitMeldIndex (存在しない場合は"-")
  parts.push(
    problem.waitMeldIndex !== undefined
      ? problem.waitMeldIndex.toString()
      : "-",
  );

  // waitFromHead (1=雀頭待ち, 0=それ以外)
  parts.push(problem.waitFromHead ? "1" : "0");

  return parts.join(".");
}

// 牌をカウント用のキーに変換
function tileToKey(tile: Tile): string {
  if (tile.suit === "honor") {
    return `honor-${tile.value}`;
  }
  return `${tile.suit}-${tile.value}`;
}

// 手牌全体の牌カウントをバリデーション（同じ牌が5枚以上あればfalse）
function validateTileCount(melds: Meld[], head: Head, winTile: Tile): boolean {
  const counts = new Map<string, number>();

  const addTile = (tile: Tile) => {
    const key = tileToKey(tile);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };

  // 面子の牌をカウント
  for (const meld of melds) {
    for (const tile of meld.tiles) {
      addTile(tile);
    }
  }

  // 雀頭をカウント
  for (const tile of head.tiles) {
    addTile(tile);
  }

  // 和了牌をカウント
  addTile(winTile);

  // 5枚以上の牌があればfalse
  for (const count of counts.values()) {
    if (count > 4) return false;
  }

  return true;
}

// URLクエリパラメータから問題をデシリアライズ
export function deserializeProblem(encoded: string): QuizProblem | null {
  try {
    const parts = encoded.split(".");
    if (parts.length < 12) return null;

    // 面子を復元 (最初の4つ)
    const melds: Meld[] = [];
    for (let i = 0; i < 4; i++) {
      const meld = stringToMeld(parts[i]);
      if (!meld) return null;
      melds.push(meld);
    }

    // 雀頭 (5番目: "5m5m" のような形式)
    const headStr = parts[4];
    if (headStr.length !== 4) return null;
    const headTileStr = headStr.slice(0, 2);
    const headTile = stringToTile(headTileStr);
    if (!headTile) return null;
    const head: Head = { tiles: [headTile, headTile] };

    // 和了牌 (6番目)
    const winTile = stringToTile(parts[5]);
    if (!winTile) return null;

    // 待ちタイプ (7番目)
    const waitType = waitTypeReverseMap[parts[6]];
    if (!waitType) return null;

    // 和了タイプ (8番目)
    const winType: WinType = parts[7] === "T" ? "tsumo" : "ron";

    // 場風 (9番目)
    const roundWind = windReverseMap[parts[8]];
    if (!roundWind) return null;

    // 自風 (10番目)
    const seatWind = windReverseMap[parts[9]];
    if (!seatWind) return null;

    // 門前フラグ (11番目)
    const isMenzen = parts[10] === "1";

    // waitMeldIndex (12番目)
    const waitMeldIndex =
      parts[11] === "-" ? undefined : parseInt(parts[11], 10);

    // waitFromHead (13番目)
    const waitFromHead = parts.length > 12 ? parts[12] === "1" : false;

    // 牌枚数のバリデーション（同じ牌が5枚以上あればエラー）
    if (!validateTileCount(melds, head, winTile)) {
      return null;
    }

    // 符を計算
    const fuResult = calculateFu({
      melds,
      head,
      waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
    });

    return {
      id: `url-${encoded}`,
      melds,
      head,
      winTile,
      waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
      correctFu: fuResult.total,
      fuBreakdown: fuResult.breakdown,
      category: "mixed",
      waitMeldIndex,
      waitFromHead,
    };
  } catch {
    return null;
  }
}

// ========== 点数クイズ用シリアライズ ==========

// melds/head を closedTiles/openMelds に変換
function convertToResolverInput(
  melds: Meld[],
  head: Head,
  winTile: Tile,
): { closedTiles: Tile[]; openMelds: Meld[] } {
  const closedTiles: Tile[] = [];
  const openMelds: Meld[] = [];

  for (const meld of melds) {
    if (meld.state === "open") {
      openMelds.push(meld);
    } else if (meld.type === "kantsu") {
      openMelds.push(meld);
    } else {
      closedTiles.push(...meld.tiles);
    }
  }

  closedTiles.push(...head.tiles);

  const winTileIndex = closedTiles.findIndex((t) => tilesMatch(t, winTile));
  if (winTileIndex >= 0) {
    closedTiles.splice(winTileIndex, 1);
  }

  return { closedTiles, openMelds };
}

// 牌が一致するか比較
function tilesMatch(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
}

// ドラ表示牌をシリアライズ
// 複数牌は+で連結: 1m+5p+7z
// 空の場合は-
function serializeDoraIndicators(indicators?: Tile[]): string {
  if (!indicators || indicators.length === 0) return "-";
  return indicators.map(tileToString).join("+");
}

// ドラ表示牌をデシリアライズ
function deserializeDoraIndicators(str: string): Tile[] | undefined {
  if (str === "-") return undefined;
  const tiles = str
    .split("+")
    .map(stringToTile)
    .filter((t): t is Tile => t !== null);
  return tiles.length > 0 ? tiles : undefined;
}

// 点数クイズ問題をシリアライズ
// 形式: 面子1.面子2.面子3.面子4.雀頭.和了牌.待ち.ツモロン.場風.自風.門前.待ち面子.雀頭待ち.リーチ.ドラ表示牌.裏ドラ表示牌
// リーチ: N=なし, R=リーチ, D=ダブルリーチ
// ドラ表示牌: 1m+5p+7z形式（+で連結）、なしは-
export function serializeScoreQuizProblem(problem: ScoreQuizProblem): string {
  const parts: string[] = [];

  // 面子 (4つ)
  for (const meld of problem.melds) {
    parts.push(meldToString(meld));
  }

  // 雀頭 (牌2文字)
  const headTile = problem.head.tiles[0];
  parts.push(tileToString(headTile) + tileToString(headTile));

  // 和了牌
  parts.push(tileToString(problem.winTile));

  // 待ちタイプ
  parts.push(waitTypeMap[problem.waitType]);

  // 和了タイプ (T=ツモ, R=ロン)
  parts.push(problem.winType === "tsumo" ? "T" : "R");

  // 場風
  parts.push(windMap[problem.roundWind]);

  // 自風
  parts.push(windMap[problem.seatWind]);

  // 門前フラグ (1=門前, 0=副露あり)
  parts.push(problem.isMenzen ? "1" : "0");

  // waitMeldIndex (存在しない場合は"-")
  parts.push(
    problem.waitMeldIndex !== undefined
      ? problem.waitMeldIndex.toString()
      : "-",
  );

  // waitFromHead (1=雀頭待ち, 0=それ以外)
  parts.push(problem.waitFromHead ? "1" : "0");

  // リーチフラグ (N=なし, R=リーチ, D=ダブルリーチ)
  let riichiFlag = "N";
  if (problem.isDoubleRiichi) {
    riichiFlag = "D";
  } else if (problem.isRiichi) {
    riichiFlag = "R";
  }
  parts.push(riichiFlag);

  // ドラ表示牌
  parts.push(serializeDoraIndicators(problem.doraIndicators));

  // 裏ドラ表示牌
  parts.push(serializeDoraIndicators(problem.uraDoraIndicators));

  return parts.join(".");
}

// 点数クイズ問題をデシリアライズ
export function deserializeScoreQuizProblem(
  encoded: string,
  category: ScoreQuizCategory = "mixed",
): ScoreQuizProblem | null {
  try {
    const parts = encoded.split(".");
    if (parts.length < 13) return null;

    // 面子を復元 (最初の4つ)
    const melds: Meld[] = [];
    for (let i = 0; i < 4; i++) {
      const meld = stringToMeld(parts[i]);
      if (!meld) return null;
      melds.push(meld);
    }

    // 雀頭 (5番目: "5m5m" のような形式)
    const headStr = parts[4];
    if (headStr.length !== 4) return null;
    const headTileStr = headStr.slice(0, 2);
    const headTile = stringToTile(headTileStr);
    if (!headTile) return null;
    const head: Head = { tiles: [headTile, headTile] };

    // 和了牌 (6番目)
    const winTile = stringToTile(parts[5]);
    if (!winTile) return null;

    // 待ちタイプ (7番目)
    const waitType = waitTypeReverseMap[parts[6]];
    if (!waitType) return null;

    // 和了タイプ (8番目)
    const winType: WinType = parts[7] === "T" ? "tsumo" : "ron";

    // 場風 (9番目)
    const roundWind = windReverseMap[parts[8]];
    if (!roundWind) return null;

    // 自風 (10番目)
    const seatWind = windReverseMap[parts[9]];
    if (!seatWind) return null;

    // 門前フラグ (11番目)
    const isMenzen = parts[10] === "1";

    // waitMeldIndex (12番目)
    const waitMeldIndex =
      parts[11] === "-" ? undefined : parseInt(parts[11], 10);

    // waitFromHead (13番目)
    const waitFromHead = parts.length > 12 ? parts[12] === "1" : false;

    // リーチフラグ (14番目)
    let isRiichi = false;
    let isDoubleRiichi = false;
    if (parts.length > 13) {
      if (parts[13] === "D") {
        isDoubleRiichi = true;
        isRiichi = true;
      } else if (parts[13] === "R") {
        isRiichi = true;
      }
    }

    // ドラ表示牌 (15番目)
    const doraIndicators =
      parts.length > 14 ? deserializeDoraIndicators(parts[14]) : undefined;

    // 裏ドラ表示牌 (16番目)
    const uraDoraIndicators =
      parts.length > 15 ? deserializeDoraIndicators(parts[15]) : undefined;

    // 牌枚数のバリデーション
    if (!validateTileCount(melds, head, winTile)) {
      return null;
    }

    // 親判定
    const isDealer = seatWind === "east";

    // 特殊条件を設定
    const specialConditions: SpecialConditions = {
      isRiichi,
      isDoubleRiichi,
      doraIndicators,
      uraDoraIndicators,
    };

    // melds/head を closedTiles/openMelds に変換
    const { closedTiles, openMelds } = convertToResolverInput(
      melds,
      head,
      winTile,
    );

    // 役判定
    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      winType,
      roundWind,
      seatWind,
      specialConditions,
    );

    if (!result || result.han === 0) return null;

    // 点数を取得
    let correctScore: number;
    let correctScoreDealer: number | undefined;

    if (isDealer) {
      correctScore = result.score;
    } else {
      if (winType === "tsumo") {
        correctScore = result.score;
        correctScoreDealer = result.scoreDealer;
      } else {
        correctScore = result.score;
      }
    }

    return {
      id: `url-${encoded}`,
      melds,
      head,
      winTile,
      waitType,
      waitMeldIndex,
      waitFromHead,
      winType,
      roundWind,
      seatWind,
      isDealer,
      isMenzen,
      isRiichi,
      isDoubleRiichi,
      doraIndicators,
      uraDoraIndicators,
      fu: result.fu,
      han: result.han,
      yaku: result.yaku,
      correctScore,
      correctScoreDealer,
      category,
      label: result.label,
    };
  } catch {
    return null;
  }
}
