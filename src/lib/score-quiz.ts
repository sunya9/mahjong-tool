import type {
  ScoreQuizCategory,
  ScoreQuizProblem,
  WinType,
  YakuItem,
  Meld,
  Head,
  Tile,
  WaitType,
  Wind,
  TileSuit,
  HonorType,
} from "./mahjong-types";
import { calculateFu } from "./fu-calculator";
import { calculateYaku, isYakuman } from "./yaku-calculator";
import { scoreTable, getScoreForFuHan } from "@/data/scoreTable";

// ランダムユーティリティ
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 問題IDを生成
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// 牌のプール管理
interface TilePool {
  tiles: Map<string, number>;
}

function tileKey(tile: Tile): string {
  return `${tile.suit}-${tile.value}`;
}

function createTilePool(): TilePool {
  const pool = new Map<string, number>();
  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      pool.set(`${suit}-${i}`, 4);
    }
  }
  const honors: HonorType[] = ["east", "south", "west", "north", "white", "green", "red"];
  for (const honor of honors) {
    pool.set(`honor-${honor}`, 4);
  }
  return { tiles: pool };
}

function canTake(pool: TilePool, tile: Tile, count: number): boolean {
  const key = tileKey(tile);
  const available = pool.tiles.get(key) ?? 0;
  return available >= count;
}

function takeTiles(pool: TilePool, tile: Tile, count: number): boolean {
  const key = tileKey(tile);
  const available = pool.tiles.get(key) ?? 0;
  if (available < count) return false;
  pool.tiles.set(key, available - count);
  return true;
}

// 面子生成
function generateShuntsu(pool: TilePool, isOpen: boolean): { meld: Meld; tiles: Tile[] } | null {
  const suits: TileSuit[] = shuffle(["man", "pin", "sou"]);
  const startNumbers = shuffle([1, 2, 3, 4, 5, 6, 7]);
  for (const suit of suits) {
    for (const start of startNumbers) {
      const tiles: Tile[] = [
        { suit, value: start },
        { suit, value: start + 1 },
        { suit, value: start + 2 },
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

function generateKoutsu(pool: TilePool, isOpen: boolean): { meld: Meld; tiles: Tile[] } | null {
  const allTiles: Tile[] = shuffle([
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "man" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "pin" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "sou" as TileSuit, value: i + 1 })),
    ...["east", "south", "west", "north", "white", "green", "red"].map((h) => ({
      suit: "honor" as TileSuit,
      value: h as HonorType,
    })),
  ]);
  for (const tile of allTiles) {
    if (canTake(pool, tile, 3)) {
      takeTiles(pool, tile, 3);
      const tiles = [tile, tile, tile];
      return {
        meld: { type: "koutsu", tiles, state: isOpen ? "open" : "closed" },
        tiles,
      };
    }
  }
  return null;
}

function generateKantsu(pool: TilePool, isOpen: boolean): { meld: Meld; tiles: Tile[] } | null {
  const allTiles: Tile[] = shuffle([
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "man" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "pin" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "sou" as TileSuit, value: i + 1 })),
    ...["east", "south", "west", "north", "white", "green", "red"].map((h) => ({
      suit: "honor" as TileSuit,
      value: h as HonorType,
    })),
  ]);
  for (const tile of allTiles) {
    if (canTake(pool, tile, 4)) {
      takeTiles(pool, tile, 4);
      const tiles = [tile, tile, tile, tile];
      return {
        meld: { type: "kantsu", tiles, state: isOpen ? "open" : "closed" },
        tiles,
      };
    }
  }
  return null;
}

function generateHead(pool: TilePool): { head: Head; tiles: Tile[] } | null {
  const allTiles: Tile[] = shuffle([
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "man" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "pin" as TileSuit, value: i + 1 })),
    ...Array.from({ length: 9 }, (_, i) => ({ suit: "sou" as TileSuit, value: i + 1 })),
    ...["east", "south", "west", "north", "white", "green", "red"].map((h) => ({
      suit: "honor" as TileSuit,
      value: h as HonorType,
    })),
  ]);
  for (const tile of allTiles) {
    if (canTake(pool, tile, 2)) {
      takeTiles(pool, tile, 2);
      return {
        head: { tiles: [tile, tile] },
        tiles: [tile, tile],
      };
    }
  }
  return null;
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

function configureWait(melds: Meld[], head: Head, winType: WinType): WaitConfig | null {
  const waitTypes: WaitType[] = shuffle(["ryanmen", "kanchan", "penchan", "shanpon", "tanki"]);

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
  const modifiedMelds = melds.map((m) => ({ ...m, tiles: [...m.tiles] }));
  let modifiedHead: Head = { tiles: [...head.tiles] };

  switch (waitType) {
    case "ryanmen": {
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" ? i : -1))
        .filter((i) => i !== -1);
      if (shuntsuIndices.length === 0) return null;
      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      const startValue = meld.tiles[0].value as number;
      if (startValue >= 2 && startValue <= 6) {
        const isLow = Math.random() < 0.5;
        const winTile = isLow
          ? { suit: meld.tiles[0].suit, value: startValue }
          : { suit: meld.tiles[0].suit, value: startValue + 3 };
        return { waitType, winTile, modifiedMelds, modifiedHead, waitMeldIndex: idx };
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
      const winTile = { suit: meld.tiles[0].suit, value: (meld.tiles[0].value as number) + 1 };
      return { waitType, winTile, modifiedMelds, modifiedHead, waitMeldIndex: idx };
    }
    case "penchan": {
      const shuntsuIndices = modifiedMelds
        .map((m, i) => {
          if (m.type !== "shuntsu") return -1;
          const start = m.tiles[0].value as number;
          return start === 1 || start === 7 ? i : -1;
        })
        .filter((i) => i !== -1);
      if (shuntsuIndices.length === 0) return null;
      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      const start = meld.tiles[0].value as number;
      const winTile = start === 1
        ? { suit: meld.tiles[0].suit, value: 3 }
        : { suit: meld.tiles[0].suit, value: 7 };
      return { waitType, winTile, modifiedMelds, modifiedHead, waitMeldIndex: idx };
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
      return { waitType, winTile, modifiedMelds, modifiedHead, waitMeldIndex: idx };
    }
    case "tanki": {
      const winTile = head.tiles[0];
      modifiedHead = { tiles: [winTile, winTile] };
      return { waitType, winTile, modifiedMelds, modifiedHead, waitFromHead: true };
    }
  }
  return null;
}

// カテゴリに基づいて条件を決定
function getConditionsForCategory(
  category: ScoreQuizCategory | "all",
): { isDealer: boolean; winType: WinType } {
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

// ランダムな問題を生成
export function generateScoreQuizProblem(
  category: ScoreQuizCategory | "all",
): ScoreQuizProblem | null {
  const maxAttempts = 100;
  const { isDealer, winType: categoryWinType } = getConditionsForCategory(category);

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

    // 雀頭を生成
    const headResult = generateHead(pool);
    if (!headResult) continue;

    // 和了タイプを使用
    const winType = categoryWinType;

    // 待ちを設定
    const waitConfig = configureWait(melds, headResult.head, winType);
    if (!waitConfig) continue;

    // 場風・自風を決定
    const roundWinds: Wind[] = ["east", "south"];
    const seatWinds: Wind[] = ["east", "south", "west", "north"];
    const roundWind = randomChoice(roundWinds);
    // 親の場合は東家固定
    const seatWind = isDealer ? "east" : randomChoice(seatWinds.filter((w) => w !== "east"));

    // 役満チェック（除外）
    if (isYakuman(waitConfig.modifiedMelds, waitConfig.modifiedHead, winType, isMenzen)) {
      continue;
    }

    // 役を計算
    const yakuResult = calculateYaku(
      waitConfig.modifiedMelds,
      waitConfig.modifiedHead,
      waitConfig.waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
    );

    // 役無しは除外
    if (yakuResult.totalHan === 0) continue;

    // 符を計算
    const fuResult = calculateFu({
      melds: waitConfig.modifiedMelds,
      head: waitConfig.modifiedHead,
      waitType: waitConfig.waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
    });

    // 点数を取得
    const scoreEntry = getScoreForFuHan(fuResult.total, yakuResult.totalHan);
    if (!scoreEntry) continue;

    let correctScore: number;
    let correctScoreDealer: number | undefined;

    if (isDealer) {
      correctScore = winType === "tsumo" ? scoreEntry.dealer.tsumo : scoreEntry.dealer.ron;
    } else {
      if (winType === "tsumo") {
        correctScore = scoreEntry.nonDealer.tsumoNonDealer;
        correctScoreDealer = scoreEntry.nonDealer.tsumoDealer;
      } else {
        correctScore = scoreEntry.nonDealer.ron;
      }
    }

    // 役をYakuItem形式に変換
    const yakuItems: YakuItem[] = yakuResult.yaku.map((y) => ({
      name: y.name,
      han: isMenzen ? y.han : (y.hanOpen ?? y.han),
    }));

    return {
      id: generateId(),
      melds: waitConfig.modifiedMelds,
      head: waitConfig.modifiedHead,
      winTile: waitConfig.winTile,
      waitType: waitConfig.waitType,
      waitMeldIndex: waitConfig.waitMeldIndex,
      waitFromHead: waitConfig.waitFromHead,
      winType,
      roundWind,
      seatWind,
      isDealer,
      isMenzen,
      fu: fuResult.total,
      han: yakuResult.totalHan,
      yaku: yakuItems,
      correctScore,
      correctScoreDealer,
      category: category === "all" ? "mixed" : category,
      label: scoreEntry.label,
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
      .sort((a, b) => Math.abs(a - correctNonDealer) - Math.abs(b - correctNonDealer));
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
    const filtered = uniquePairs.filter((p) => `${p.nonDealer}-${p.dealer}` !== correctKey);
    const sorted = filtered.sort(
      (a, b) => Math.abs(a.nonDealer - correctNonDealer) - Math.abs(b.nonDealer - correctNonDealer),
    );
    const options: TsumoOption[] = [
      { nonDealer: correctNonDealer, dealer: correctDealer },
      ...sorted.slice(0, 3),
    ];
    return options.sort((a, b) => a.nonDealer - b.nonDealer);
  }
}

// 統一された選択肢生成関数
export function generateScoreOptions(
  problem: ScoreQuizProblem,
): { ronOptions?: number[]; tsumoOptions?: TsumoOption[] } {
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
