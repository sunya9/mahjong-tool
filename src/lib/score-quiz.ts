import type {
  ScoreQuizCategory,
  ScoreQuizProblem,
  WinType,
  Meld,
  Head,
  Tile,
  WaitType,
  Wind,
  TileNumber,
  SpecialConditions,
} from "./mahjong-types";
import { isNumberTile } from "./mahjong-types";
import { resolveYakuFromHand } from "./yaku-resolver";
import {
  createTilePool,
  numberTile,
  tilesMatch,
  getAllTileTypes,
} from "./tile-utils";
import type { NumberSuit } from "./mahjong-types";
import {
  randomChoice,
  shuffle,
  generateShuntsu,
  generateKoutsu,
  generateKantsu,
  generateHead,
  cloneMeld,
} from "./problem-generator";
import { scoreTable } from "@/data/scoreTable";

// 問題IDを生成
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// 待ち設定
interface WaitConfig {
  waitType: WaitType;
  winTile: Tile;
  modifiedMelds: Meld[];
  modifiedHead: Head;
  waitMeldIndex?: number;
  waitFromHead?: boolean;
}

function configureWait(
  melds: Meld[],
  head: Head,
  winType: WinType,
): WaitConfig | null {
  const waitTypes: WaitType[] = shuffle([
    "ryanmen",
    "kanchan",
    "penchan",
    "shanpon",
    "tanki",
  ]);

  for (const waitType of waitTypes) {
    const result = tryConfigureWait(melds, head, waitType, winType);
    if (result) return result;
  }
  return null;
}

function tryConfigureWait(
  melds: Meld[],
  head: Head,
  waitType: WaitType,
  winType: WinType,
): WaitConfig | null {
  const modifiedMelds = melds.map(cloneMeld);
  let modifiedHead: Head = { tiles: [...head.tiles] };

  switch (waitType) {
    case "ryanmen": {
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" ? i : -1))
        .filter((i) => i !== -1);
      if (shuntsuIndices.length === 0) return null;
      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      const firstTile = meld.tiles[0];
      if (!isNumberTile(firstTile)) return null;
      if (firstTile.value >= 2 && firstTile.value <= 6) {
        const isLow = Math.random() < 0.5;
        const winTile = isLow
          ? numberTile(firstTile.suit, firstTile.value)
          : numberTile(firstTile.suit, (firstTile.value + 3) as TileNumber);
        return {
          waitType,
          winTile,
          modifiedMelds,
          modifiedHead,
          waitMeldIndex: idx,
        };
      }
      return null;
    }
    case "kanchan": {
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" ? i : -1))
        .filter((i) => i !== -1);
      if (shuntsuIndices.length === 0) return null;
      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      const firstTile = meld.tiles[0];
      if (!isNumberTile(firstTile)) return null;
      const winTile = numberTile(
        firstTile.suit,
        (firstTile.value + 1) as TileNumber,
      );
      return {
        waitType,
        winTile,
        modifiedMelds,
        modifiedHead,
        waitMeldIndex: idx,
      };
    }
    case "penchan": {
      const shuntsuIndices = modifiedMelds
        .map((m, i) => {
          if (m.type !== "shuntsu") return -1;
          const firstTile = m.tiles[0];
          if (!isNumberTile(firstTile)) return -1;
          return firstTile.value === 1 || firstTile.value === 7 ? i : -1;
        })
        .filter((i) => i !== -1);
      if (shuntsuIndices.length === 0) return null;
      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      const firstTile = meld.tiles[0];
      if (!isNumberTile(firstTile)) return null;
      const winTile =
        firstTile.value === 1
          ? numberTile(firstTile.suit, 3)
          : numberTile(firstTile.suit, 7);
      return {
        waitType,
        winTile,
        modifiedMelds,
        modifiedHead,
        waitMeldIndex: idx,
      };
    }
    case "shanpon": {
      const koutsuIndices = modifiedMelds
        .map((m, i) => (m.type === "koutsu" && m.state === "closed" ? i : -1))
        .filter((i) => i !== -1);
      if (koutsuIndices.length === 0) return null;
      const idx = randomChoice(koutsuIndices);
      const meld = modifiedMelds[idx];
      const winTile = meld.tiles[0];
      if (winType === "ron") {
        modifiedMelds[idx] = { ...meld, state: "open" };
      }
      return {
        waitType,
        winTile,
        modifiedMelds,
        modifiedHead,
        waitMeldIndex: idx,
      };
    }
    case "tanki": {
      const winTile = head.tiles[0];
      modifiedHead = { tiles: [winTile, winTile] };
      return {
        waitType,
        winTile,
        modifiedMelds,
        modifiedHead,
        waitFromHead: true,
      };
    }
  }
}

// カテゴリに基づいて条件を決定
function getConditionsForCategory(category: ScoreQuizCategory | "all"): {
  isDealer: boolean;
  winType: WinType;
} {
  switch (category) {
    case "dealer":
      return { isDealer: true, winType: randomChoice(["tsumo", "ron"]) };
    case "non-dealer":
      return { isDealer: false, winType: randomChoice(["tsumo", "ron"]) };
    case "tsumo":
      return { isDealer: randomChoice([true, false]), winType: "tsumo" };
    case "ron":
      return { isDealer: randomChoice([true, false]), winType: "ron" };
    case "mixed":
    case "all":
    default:
      return {
        isDealer: randomChoice([true, false]),
        winType: randomChoice(["tsumo", "ron"]),
      };
  }
}

// melds/head から closedTiles/openMelds への変換
function convertToResolverInput(
  melds: Meld[],
  head: Head,
  winTile: Tile,
): { closedTiles: Tile[]; openMelds: Meld[] } {
  const closedTiles: Tile[] = [];
  const openMelds: Meld[] = [];

  for (const meld of melds) {
    if (meld.state === "open") {
      // 明刻・明槓・チー
      openMelds.push(meld);
    } else if (meld.type === "kantsu") {
      // 暗槓は公開されるので openMelds に追加
      openMelds.push(meld);
    } else {
      // 暗刻・暗順
      closedTiles.push(...meld.tiles);
    }
  }

  // 雀頭を追加
  closedTiles.push(...head.tiles);

  // parseHand は closedTiles + winTile として解析するので、
  // winTile を1枚取り除く必要がある
  const winTileIndex = closedTiles.findIndex((t) => tilesMatch(t, winTile));
  if (winTileIndex >= 0) {
    closedTiles.splice(winTileIndex, 1);
  }

  return { closedTiles, openMelds };
}

// ========================================
// ドラ生成
// ========================================

/**
 * ドラ表示牌を生成
 * @param kantsuCount 槓子の数（槓ドラ用）
 */
function generateDoraIndicators(kantsuCount: number): Tile[] {
  const allTileTypes = getAllTileTypes();
  const indicators: Tile[] = [];

  // 基本ドラ1枚 + 槓ドラ（槓子の数だけ）
  const doraCount = 1 + kantsuCount;

  for (let i = 0; i < doraCount; i++) {
    const shuffled = shuffle([...allTileTypes]);
    indicators.push(shuffled[0]);
  }

  return indicators;
}

/**
 * 裏ドラ表示牌を生成（リーチ時のみ）
 * @param doraCount 表ドラの数と同数
 */
function generateUraDoraIndicators(doraCount: number): Tile[] {
  const allTileTypes = getAllTileTypes();
  const indicators: Tile[] = [];

  for (let i = 0; i < doraCount; i++) {
    const shuffled = shuffle([...allTileTypes]);
    indicators.push(shuffled[0]);
  }

  return indicators;
}

/**
 * 手牌に赤ドラを適用
 * - 各色の5が含まれている場合、1枚を赤ドラに変換
 * - 同じ牌が5枚以上にならないよう注意
 */
function applyRedDora(
  melds: Meld[],
  head: Head,
  winTile: Tile,
): { melds: Meld[]; head: Head; winTile: Tile } {
  const suits: NumberSuit[] = ["man", "pin", "sou"];

  // 各色の5の使用枚数をカウント
  const fiveCount: Record<NumberSuit, number> = { man: 0, pin: 0, sou: 0 };
  const hasRedDora: Record<NumberSuit, boolean> = {
    man: false,
    pin: false,
    sou: false,
  };

  const countFives = (tile: Tile) => {
    if (isNumberTile(tile) && tile.value === 5) {
      fiveCount[tile.suit]++;
      if (tile.isRedDora) {
        hasRedDora[tile.suit] = true;
      }
    }
  };

  for (const meld of melds) {
    for (const tile of meld.tiles) {
      countFives(tile);
    }
  }
  for (const tile of head.tiles) {
    countFives(tile);
  }
  countFives(winTile);

  // 各色について、5が含まれていて、まだ赤ドラがなく、4枚以下なら1枚を赤ドラに
  const suitsToConvert = suits.filter(
    (suit) => fiveCount[suit] > 0 && !hasRedDora[suit] && fiveCount[suit] <= 4,
  );

  if (suitsToConvert.length === 0) {
    return { melds, head, winTile };
  }

  // 変換対象の色をランダムに選択（手牌に含まれる5のうち1色を赤ドラに）
  const shuffledSuits = shuffle([...suitsToConvert]);
  const convertedSuits = new Set<NumberSuit>();

  const convertTile = (tile: Tile): Tile => {
    if (
      isNumberTile(tile) &&
      tile.value === 5 &&
      shuffledSuits.includes(tile.suit) &&
      !convertedSuits.has(tile.suit) &&
      !tile.isRedDora
    ) {
      convertedSuits.add(tile.suit);
      return numberTile(tile.suit, 5, true);
    }
    return tile;
  };

  const newMelds = melds.map((meld) => {
    const newTiles = meld.tiles.map(convertTile);
    if (meld.type === "shuntsu") {
      return { ...meld, tiles: newTiles as [Tile, Tile, Tile] };
    } else if (meld.type === "koutsu") {
      return { ...meld, tiles: newTiles as [Tile, Tile, Tile] };
    } else {
      return { ...meld, tiles: newTiles as [Tile, Tile, Tile, Tile] };
    }
  }) as Meld[];

  const newHead: Head = {
    tiles: head.tiles.map(convertTile) as [Tile, Tile],
  };

  const newWinTile = convertTile(winTile);

  return { melds: newMelds, head: newHead, winTile: newWinTile };
}

// ランダムな問題を生成
export function generateScoreQuizProblem(
  category: ScoreQuizCategory | "all",
): ScoreQuizProblem | null {
  const maxAttempts = 100;
  const { isDealer, winType: categoryWinType } =
    getConditionsForCategory(category);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pool = createTilePool();
    const melds: Meld[] = [];

    // 鳴きの有無を決定
    const shouldHaveOpen = Math.random() < 0.25;
    const openMeldIndices = new Set<number>();
    if (shouldHaveOpen) {
      const numOpenMelds = Math.random() < 0.6 ? 1 : 2;
      while (openMeldIndices.size < numOpenMelds) {
        openMeldIndices.add(Math.floor(Math.random() * 4));
      }
    }

    // 面子を4つ生成
    let meldCount = 0;
    let hasKantsu = false;
    let hasActualOpen = false;

    while (meldCount < 4) {
      const meldType = Math.random();
      let result: { meld: Meld; tiles: Tile[] } | null = null;
      const shouldBeOpen = openMeldIndices.has(meldCount);

      if (meldType < 0.1 && !hasKantsu) {
        result = generateKantsu(pool, shouldBeOpen);
        if (result) hasKantsu = true;
      } else if (meldType < 0.4) {
        result = generateKoutsu(pool, shouldBeOpen);
      } else {
        result = generateShuntsu(pool, shouldBeOpen && Math.random() < 0.5);
      }

      if (result) {
        if (result.meld.state === "open") hasActualOpen = true;
        melds.push(result.meld);
        meldCount++;
      } else {
        break;
      }
    }

    if (meldCount < 4) continue;
    if (shouldHaveOpen && !hasActualOpen) continue;

    const isMenzen = !hasActualOpen;

    // リーチの有無を決定（門前の場合のみ）
    let isRiichi = false;
    let isDoubleRiichi = false;
    if (isMenzen) {
      const riichiRand = Math.random();
      if (riichiRand < 0.01) {
        // 1%でダブルリーチ
        isDoubleRiichi = true;
        isRiichi = true;
      } else if (riichiRand < 0.4) {
        // 39%でリーチ（合計40%）
        isRiichi = true;
      }
    }

    // 雀頭を生成
    const headResult = generateHead(pool);
    if (!headResult) continue;

    // 和了タイプを使用
    const winType = categoryWinType;

    // 待ちを設定
    const waitConfig = configureWait(melds, headResult.head, winType);
    if (!waitConfig) continue;

    // 赤ドラを適用
    const redDoraResult = applyRedDora(
      waitConfig.modifiedMelds,
      waitConfig.modifiedHead,
      waitConfig.winTile,
    );
    const finalMelds = redDoraResult.melds;
    const finalHead = redDoraResult.head;
    const finalWinTile = redDoraResult.winTile;

    // 槓子をカウント
    const kantsuCount = finalMelds.filter((m) => m.type === "kantsu").length;

    // ドラ表示牌を生成
    const doraIndicators = generateDoraIndicators(kantsuCount);

    // 裏ドラ（リーチ時のみ）
    const uraDoraIndicators = isRiichi
      ? generateUraDoraIndicators(doraIndicators.length)
      : undefined;

    // 場風・自風を決定
    const roundWinds: Wind[] = ["east", "south"];
    const seatWinds: Wind[] = ["east", "south", "west", "north"];
    const roundWind = randomChoice(roundWinds);
    // 親の場合は東家固定
    const seatWind = isDealer
      ? "east"
      : randomChoice(seatWinds.filter((w) => w !== "east"));

    // melds/head を closedTiles/openMelds に変換
    const { closedTiles, openMelds } = convertToResolverInput(
      finalMelds,
      finalHead,
      finalWinTile,
    );

    // 特殊条件を設定（ドラ情報を含む）
    const specialConditions: SpecialConditions = {
      isRiichi,
      isDoubleRiichi,
      doraIndicators,
      uraDoraIndicators,
    };

    // 役判定
    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      finalWinTile,
      winType,
      roundWind,
      seatWind,
      specialConditions,
    );

    // エラーまたは役無しは除外
    if (!result || result.han === 0) continue;

    // ドラ以外の役がない場合は除外（ドラだけでは和了できない）
    const doraNames = ["ドラ", "裏ドラ", "赤ドラ"];
    const nonDoraYaku = result.yaku.filter((y) => !doraNames.includes(y.name));
    if (nonDoraYaku.length === 0) continue;

    // 役満は除外
    if (result.han >= 13) continue;

    // 点数を取得
    let correctScore: number;
    let correctScoreDealer: number | undefined;

    if (isDealer) {
      // 親の場合、scoreはロン時の合計、ツモ時は子の支払い
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
      id: generateId(),
      melds: finalMelds,
      head: finalHead,
      winTile: finalWinTile,
      waitType: waitConfig.waitType,
      waitMeldIndex: waitConfig.waitMeldIndex,
      waitFromHead: waitConfig.waitFromHead,
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
      category: category === "all" ? "mixed" : category,
      label: result.label,
    };
  }

  return null;
}

// 点数の選択肢を生成（ロン用）
function generateRonOptions(correctScore: number, isDealer: boolean): number[] {
  const allScores = scoreTable.map((entry) =>
    isDealer ? entry.dealer.ron : entry.nonDealer.ron,
  );
  const uniqueScores = [...new Set(allScores)].sort((a, b) => a - b);
  const sorted = uniqueScores
    .filter((s) => s !== correctScore)
    .sort((a, b) => Math.abs(a - correctScore) - Math.abs(b - correctScore));
  const options = [correctScore, ...sorted.slice(0, 3)];
  return options.sort((a, b) => a - b);
}

// ツモ選択肢の型
export interface TsumoOption {
  nonDealer: number;
  dealer?: number;
}

// 点数の選択肢を生成（ツモ用）
function generateTsumoOptions(
  correctNonDealer: number,
  correctDealer: number | undefined,
  isDealer: boolean,
): TsumoOption[] {
  if (isDealer) {
    const allScores = scoreTable.map((entry) => entry.dealer.tsumo);
    const uniqueScores = [...new Set(allScores)].sort((a, b) => a - b);
    const sorted = uniqueScores
      .filter((s) => s !== correctNonDealer)
      .sort(
        (a, b) =>
          Math.abs(a - correctNonDealer) - Math.abs(b - correctNonDealer),
      );
    const options: TsumoOption[] = [
      { nonDealer: correctNonDealer },
      ...sorted.slice(0, 3).map((s) => ({ nonDealer: s })),
    ];
    return options.sort((a, b) => a.nonDealer - b.nonDealer);
  } else {
    const allPairs = scoreTable.map((entry) => ({
      nonDealer: entry.nonDealer.tsumoNonDealer,
      dealer: entry.nonDealer.tsumoDealer,
    }));
    const uniquePairs: TsumoOption[] = [];
    const seen = new Set<string>();
    for (const pair of allPairs) {
      const key = `${pair.nonDealer}-${pair.dealer}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePairs.push(pair);
      }
    }
    const correctKey = `${correctNonDealer}-${correctDealer}`;
    const filtered = uniquePairs.filter(
      (p) => `${p.nonDealer}-${p.dealer}` !== correctKey,
    );
    const sorted = filtered.sort(
      (a, b) =>
        Math.abs(a.nonDealer - correctNonDealer) -
        Math.abs(b.nonDealer - correctNonDealer),
    );
    const options: TsumoOption[] = [
      { nonDealer: correctNonDealer, dealer: correctDealer },
      ...sorted.slice(0, 3),
    ];
    return options.sort((a, b) => a.nonDealer - b.nonDealer);
  }
}

// 統一された選択肢生成関数
export function generateScoreOptions(problem: ScoreQuizProblem): {
  ronOptions?: number[];
  tsumoOptions?: TsumoOption[];
} {
  if (problem.winType === "ron") {
    return {
      ronOptions: generateRonOptions(problem.correctScore, problem.isDealer),
    };
  } else {
    return {
      tsumoOptions: generateTsumoOptions(
        problem.correctScore,
        problem.correctScoreDealer,
        problem.isDealer,
      ),
    };
  }
}

// 点数表示用のフォーマット関数
export function formatScore(
  score: number,
  dealerScore?: number,
  isDealer?: boolean,
  winType?: WinType,
): string {
  if (winType === "tsumo") {
    if (isDealer) {
      return `${score}オール`;
    } else if (dealerScore !== undefined) {
      return `${score}/${dealerScore}`;
    }
  }
  return `${score}`;
}

// TsumoOptionを比較用キーに変換
export function tsumoOptionToKey(option: TsumoOption): string {
  return option.dealer !== undefined
    ? `${option.nonDealer}-${option.dealer}`
    : `${option.nonDealer}`;
}
