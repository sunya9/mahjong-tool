import type {
  Tile,
  TileSuit,
  Meld,
  Head,
  WaitType,
  WinType,
  Wind,
  QuizProblem,
  RegularHand,
  FuItem,
} from "./mahjong-types";
import { isNumberTile, isHonorTile } from "./mahjong-types";
import { calculateFu } from "./fu-calculator";
import { createTilePool, tilesMatch } from "./tile-utils";
import {
  randomChoice,
  shuffle,
  generateShuntsu,
  generateKoutsu,
  generateKantsu,
  generateHead,
  cloneMeld,
} from "./problem-generator";
import { parseHand } from "./hand-parser";
import { determineWaitType } from "./yaku-resolver";

// 待ちの種類を決定して手牌を調整
interface WaitConfig {
  waitType: WaitType;
  winTile: Tile;
  modifiedMelds: Meld[];
  modifiedHead: Head;
  waitMeldIndex?: number; // 待ちの元になる面子のインデックス
  waitFromHead?: boolean; // 雀頭からの待ちか
}

// 和了牌が副露した面子に含まれているかチェック
function winTileInOpenMelds(winTile: Tile, melds: Meld[]): boolean {
  for (const meld of melds) {
    if (meld.state === "open") {
      for (const tile of meld.tiles) {
        if (tilesMatch(tile, winTile)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 役満かどうかをチェック（符計算が無意味な手を除外）
function isYakuman(
  melds: Meld[],
  waitType: WaitType,
  winType: WinType,
): boolean {
  // 四暗刻チェック: 4つの暗刻/暗槓 + (ツモ or 単騎待ち)
  const closedTriplets = melds.filter(
    (m) => (m.type === "koutsu" || m.type === "kantsu") && m.state === "closed",
  );

  if (closedTriplets.length === 4) {
    // ツモなら四暗刻
    if (winType === "tsumo") return true;
    // 単騎待ちロンも四暗刻（和了牌で刻子を作らない）
    if (waitType === "tanki") return true;
  }

  return false;
}

// 役牌判定（雀頭用）
function isYakuhaiTile(tile: Tile, roundWind: Wind, seatWind: Wind): boolean {
  if (!isHonorTile(tile)) return false;
  // 三元牌
  if (
    tile.value === "white" ||
    tile.value === "green" ||
    tile.value === "red"
  ) {
    return true;
  }
  // 場風
  if (tile.value === roundWind) return true;
  // 自風
  if (tile.value === seatWind) return true;
  return false;
}

// 役があるかチェック（役無しを除外）
function hasYaku(
  melds: Meld[],
  head: Head,
  waitType: WaitType,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
): boolean {
  // 門前ツモ
  if (isMenzen && winType === "tsumo") return true;

  // ピンフ: 門前 + 全て順子 + 役牌でない雀頭 + 両面待ち
  if (
    isMenzen &&
    melds.every((m) => m.type === "shuntsu") &&
    !isYakuhaiTile(head.tiles[0], roundWind, seatWind) &&
    waitType === "ryanmen"
  ) {
    return true;
  }

  // 全ての牌を収集
  const allTiles: Tile[] = [...head.tiles];
  for (const meld of melds) {
    allTiles.push(...meld.tiles);
  }

  // 断幺九（タンヤオ）: 全て中張牌（2-8）
  const isTanyao = allTiles.every(
    (t) => isNumberTile(t) && t.value >= 2 && t.value <= 8,
  );
  if (isTanyao) return true;

  // 対々和（トイトイ）: 全て刻子/槓子
  const isToitoi = melds.every(
    (m) => m.type === "koutsu" || m.type === "kantsu",
  );
  if (isToitoi) return true;

  // 役牌チェック
  const hasYakuhai = melds.some((meld) => {
    if (meld.type !== "koutsu" && meld.type !== "kantsu") return false;
    const tile = meld.tiles[0];
    if (!isHonorTile(tile)) return false;
    // 三元牌
    if (
      tile.value === "white" ||
      tile.value === "green" ||
      tile.value === "red"
    ) {
      return true;
    }
    // 場風
    if (tile.value === roundWind) return true;
    // 自風
    if (tile.value === seatWind) return true;
    return false;
  });
  if (hasYakuhai) return true;

  // 三暗刻: 3つ以上の暗刻/暗槓
  const closedTriplets = melds.filter(
    (m) => (m.type === "koutsu" || m.type === "kantsu") && m.state === "closed",
  );
  if (closedTriplets.length >= 3) return true;

  // 三槓子: 3つ以上の槓子
  const kantsuCount = melds.filter((m) => m.type === "kantsu").length;
  if (kantsuCount >= 3) return true;

  // 混一色/清一色: 1種類の数牌（+字牌）
  const suits = new Set<TileSuit>();
  let hasHonor = false;
  for (const tile of allTiles) {
    if (tile.suit === "honor") {
      hasHonor = true;
    } else {
      suits.add(tile.suit);
    }
  }
  // 清一色: 1種類の数牌のみ
  if (suits.size === 1 && !hasHonor) return true;
  // 混一色: 1種類の数牌 + 字牌
  if (suits.size === 1 && hasHonor) return true;

  return false;
}

// ========================================
// 高点法: 最も符が高い解釈を選択
// ========================================

interface HighestFuResult {
  melds: Meld[];
  head: Head;
  waitType: WaitType;
  fu: number;
  fuBreakdown: FuItem[];
  waitMeldIndex?: number;
  waitFromHead?: boolean;
}

/**
 * 高点法を適用して最も符が高い解釈を返す
 * 複数の解釈が可能な場合、符が最も高いものを選択する
 */
function findHighestFuInterpretation(
  originalMelds: Meld[],
  originalHead: Head,
  winTile: Tile,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
  originalWaitMeldIndex?: number,
  originalWaitFromHead?: boolean,
): HighestFuResult | null {
  // 副露している面子を特定
  const openMelds = originalMelds.filter((m) => m.state === "open");
  const closedMelds = originalMelds.filter((m) => m.state === "closed");

  // 門前部分の全牌を抽出
  const closedTiles: Tile[] = [];
  for (const meld of closedMelds) {
    closedTiles.push(...meld.tiles);
  }
  closedTiles.push(...originalHead.tiles);

  // 手牌解析で全ての可能な解釈を取得
  const parseResult = parseHand({
    closedTiles,
    openMelds,
    winTile,
  });

  if (!parseResult.isWinning) {
    // 解析に失敗した場合は元の解釈を使用
    const originalWaitType = determineOriginalWaitType(
      originalMelds,
      originalHead,
      winTile,
      originalWaitMeldIndex,
      originalWaitFromHead,
    );
    const fuResult = calculateFu({
      melds: originalMelds,
      head: originalHead,
      waitType: originalWaitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
    });
    return {
      melds: originalMelds,
      head: originalHead,
      waitType: originalWaitType,
      fu: fuResult.total,
      fuBreakdown: fuResult.breakdown,
      waitMeldIndex: originalWaitMeldIndex,
      waitFromHead: originalWaitFromHead,
    };
  }

  let bestResult: HighestFuResult | null = null;

  for (const hand of parseResult.hands) {
    // 通常形のみ処理（七対子・国士は別処理）
    if (hand.pattern !== "regular") continue;

    const regularHand = hand as RegularHand;

    // 待ちの種類を判定
    const waitType = determineWaitType(regularHand, winTile);

    // 副露状態を復元（parseHandは全てclosedとして返すため）
    const restoredMelds = restoreOpenState(regularHand.melds, openMelds);

    // シャンポン待ちでロンの場合、和了牌を含む面子は明刻になる
    const adjustedMelds =
      winType === "ron" && waitType === "shanpon"
        ? adjustShanponForRon(restoredMelds, winTile)
        : restoredMelds;

    // 符を計算
    const fuResult = calculateFu({
      melds: adjustedMelds,
      head: regularHand.head,
      waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
    });

    // 待ちのインデックスを計算
    const { waitMeldIndex, waitFromHead } = findWaitPosition(
      adjustedMelds,
      regularHand.head,
      winTile,
      waitType,
    );

    // より高い符の解釈を選択
    if (!bestResult || fuResult.total > bestResult.fu) {
      bestResult = {
        melds: adjustedMelds,
        head: regularHand.head,
        waitType,
        fu: fuResult.total,
        fuBreakdown: fuResult.breakdown,
        waitMeldIndex,
        waitFromHead,
      };
    }
  }

  return bestResult;
}

/**
 * 元の手牌構成から待ちの種類を判定
 */
function determineOriginalWaitType(
  melds: Meld[],
  _head: Head,
  winTile: Tile,
  waitMeldIndex?: number,
  waitFromHead?: boolean,
): WaitType {
  // 雀頭からの待ち（単騎）
  if (waitFromHead) {
    return "tanki";
  }

  if (waitMeldIndex !== undefined) {
    const meld = melds[waitMeldIndex];
    if (meld.type === "koutsu") {
      return "shanpon";
    }
    if (meld.type === "shuntsu") {
      // 順子での待ちを判定
      const values = meld.tiles
        .filter((t) => isNumberTile(t))
        .map((t) => (t as { value: number }).value)
        .sort((a, b) => a - b);

      if (!isNumberTile(winTile)) return "ryanmen";
      const winValue = winTile.value;

      // 嵌張
      if (winValue === values[1]) return "kanchan";

      // 辺張
      if (values[0] === 1 && winValue === 3) return "penchan";
      if (values[0] === 7 && winValue === 7) return "penchan";

      // 両面
      return "ryanmen";
    }
  }

  return "ryanmen";
}

/**
 * 副露状態を復元する
 */
function restoreOpenState(parsedMelds: Meld[], openMelds: Meld[]): Meld[] {
  return parsedMelds.map((meld) => {
    // 副露した面子と一致するか確認
    const matchingOpen = openMelds.find((open) => {
      if (open.type !== meld.type) return false;
      // 先頭牌が同じかチェック
      return tilesMatch(open.tiles[0], meld.tiles[0]);
    });
    if (matchingOpen) {
      return { ...meld, state: "open" as const };
    }
    return meld;
  });
}

/**
 * シャンポン待ちでロンの場合、和了牌を含む刻子を明刻に変更
 */
function adjustShanponForRon(melds: Meld[], winTile: Tile): Meld[] {
  return melds.map((meld) => {
    if (meld.type === "koutsu" && tilesMatch(meld.tiles[0], winTile)) {
      return { ...meld, state: "open" as const };
    }
    return meld;
  });
}

/**
 * 待ちの位置を特定
 */
function findWaitPosition(
  melds: Meld[],
  head: Head,
  winTile: Tile,
  waitType: WaitType,
): { waitMeldIndex?: number; waitFromHead?: boolean } {
  // 単騎待ち
  if (waitType === "tanki") {
    if (tilesMatch(head.tiles[0], winTile)) {
      return { waitFromHead: true };
    }
  }

  // 面子からの待ち
  for (let i = 0; i < melds.length; i++) {
    const meld = melds[i];
    if (tilesMatch(meld.tiles[0], winTile)) {
      return { waitMeldIndex: i };
    }
    // 順子の場合、和了牌が含まれているかチェック
    if (meld.type === "shuntsu") {
      const hasTile = meld.tiles.some((t) => tilesMatch(t, winTile));
      if (hasTile) {
        return { waitMeldIndex: i };
      }
    }
  }

  return {};
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
    "tanki",
    "shanpon",
  ]);

  for (const waitType of waitTypes) {
    const config = tryConfigureWait(melds, head, waitType, winType);
    if (config) {
      // 和了牌が副露した面子に含まれている場合はスキップ
      if (winTileInOpenMelds(config.winTile, config.modifiedMelds)) {
        continue;
      }
      // 役満の場合はスキップ（符計算が意味を持たない）
      if (isYakuman(config.modifiedMelds, config.waitType, winType)) {
        continue;
      }
      return config;
    }
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
  const modifiedHead: Head = { tiles: [...head.tiles] };

  switch (waitType) {
    case "ryanmen": {
      // 門前の順子から両面待ちを作る（副露は除外）
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" && m.state === "closed" ? i : -1))
        .filter((i) => i >= 0);
      if (shuntsuIndices.length === 0) return null;

      // 両面待ちは2〜6始まりの順子のみ有効
      // 1始まり(123): 1で和了は両面だが、3で和了は辺張
      // 7始まり(789): 9で和了は両面だが、7で和了は辺張
      // → 両端どちらでも両面になるのは2〜6始まりのみ
      const validIndices = shuntsuIndices.filter((idx) => {
        const firstTile = modifiedMelds[idx].tiles[0];
        if (!isNumberTile(firstTile)) return false;
        return firstTile.value >= 2 && firstTile.value <= 6;
      });

      if (validIndices.length === 0) return null;

      const idx = randomChoice(validIndices);
      const meld = modifiedMelds[idx];

      // 両端のどちらかを和了牌にする
      if (Math.random() < 0.5) {
        // 左待ち: 34 -> 2待ち（23が待ち形、1か4で和了）
        return {
          waitType,
          winTile: meld.tiles[0],
          modifiedMelds,
          modifiedHead,
          waitMeldIndex: idx,
        };
      } else {
        // 右待ち: 23 -> 4待ち（34が待ち形、2か5で和了）
        return {
          waitType,
          winTile: meld.tiles[2],
          modifiedMelds,
          modifiedHead,
          waitMeldIndex: idx,
        };
      }
    }

    case "kanchan": {
      // 門前の順子から嵌張待ちを作る（副露は除外）
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" && m.state === "closed" ? i : -1))
        .filter((i) => i >= 0);
      if (shuntsuIndices.length === 0) return null;

      const idx = randomChoice(shuntsuIndices);
      const meld = modifiedMelds[idx];
      // 真ん中を和了牌にする
      return {
        waitType,
        winTile: meld.tiles[1],
        modifiedMelds,
        modifiedHead,
        waitMeldIndex: idx,
      };
    }

    case "penchan": {
      // 門前の順子から辺張待ちを作る (12->3待ち or 89->7待ち)（副露は除外）
      const shuntsuIndices = modifiedMelds
        .map((m, i) => (m.type === "shuntsu" && m.state === "closed" ? i : -1))
        .filter((i) => i >= 0);
      if (shuntsuIndices.length === 0) return null;

      for (const idx of shuffle(shuntsuIndices)) {
        const meld = modifiedMelds[idx];
        const firstTile = meld.tiles[0];
        if (!isNumberTile(firstTile)) continue;
        if (firstTile.value === 1) {
          // 123 -> 3待ち (辺張)
          return {
            waitType,
            winTile: meld.tiles[2],
            modifiedMelds,
            modifiedHead,
            waitMeldIndex: idx,
          };
        } else if (firstTile.value === 7) {
          // 789 -> 7待ち (辺張)
          return {
            waitType,
            winTile: meld.tiles[0],
            modifiedMelds,
            modifiedHead,
            waitMeldIndex: idx,
          };
        }
      }
      return null;
    }

    case "tanki": {
      // 雀頭を単騎待ちにする
      return {
        waitType,
        winTile: modifiedHead.tiles[0],
        modifiedMelds,
        modifiedHead,
        waitFromHead: true,
      };
    }

    case "shanpon": {
      // 門前の刻子からシャンポン待ちを作る（副露は除外）
      const koutsuIndices = modifiedMelds
        .map((m, i) => (m.type === "koutsu" && m.state === "closed" ? i : -1))
        .filter((i) => i >= 0);
      if (koutsuIndices.length === 0) return null;

      const idx = randomChoice(koutsuIndices);
      const meld = modifiedMelds[idx];

      // ロンの場合は明刻になる
      if (winType === "ron") {
        modifiedMelds[idx] = { ...meld, state: "open" };
      }

      return {
        waitType,
        winTile: meld.tiles[0],
        modifiedMelds,
        modifiedHead,
        waitMeldIndex: idx,
      };
    }
  }
}

// クイズ問題を生成
export function generateRandomProblem(category?: string): QuizProblem | null {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pool = createTilePool();
    const melds: Meld[] = [];

    // 鳴きの有無を決定（25%の確率で副露あり）
    const shouldHaveOpen = Math.random() < 0.25;

    // 面子を4つ生成
    let meldCount = 0;
    const targetMelds = 4;
    let hasActualOpen = false;

    // 副露ありの場合、どの面子を鳴くか決める（1〜2個）
    const openMeldIndices = new Set<number>();
    if (shouldHaveOpen) {
      const numOpenMelds = Math.random() < 0.6 ? 1 : 2;
      while (openMeldIndices.size < numOpenMelds) {
        openMeldIndices.add(Math.floor(Math.random() * 4));
      }
    }

    while (meldCount < targetMelds) {
      const meldType = Math.random();
      let result: { meld: Meld; tiles: Tile[] } | null = null;
      const shouldBeOpen = openMeldIndices.has(meldCount);

      // 槓子（確率低め）
      if (meldType < 0.1) {
        result = generateKantsu(pool, shouldBeOpen);
      } else if (meldType < 0.4) {
        result = generateKoutsu(pool, shouldBeOpen);
      } else {
        // チーは刻子・槓子より少なめ（順子は鳴きにくい）
        result = generateShuntsu(pool, shouldBeOpen && Math.random() < 0.5);
      }

      if (result) {
        if (result.meld.state === "open") {
          hasActualOpen = true;
        }
        melds.push(result.meld);
        meldCount++;
      } else {
        // 生成できなければリトライ
        break;
      }
    }

    if (meldCount < targetMelds) continue;

    // 副露ありの設定なのに鳴きがない場合はリトライ
    if (shouldHaveOpen && !hasActualOpen) continue;

    const isMenzen = !hasActualOpen;

    // 雀頭を生成
    const headResult = generateHead(pool);
    if (!headResult) continue;

    // 和了タイプを決定
    const winType: WinType = Math.random() < 0.5 ? "tsumo" : "ron";

    // 待ちを設定
    const waitConfig = configureWait(melds, headResult.head, winType);
    if (!waitConfig) continue;

    // 場風・自風を決定（東南戦基準）
    const roundWinds: Wind[] = ["east", "south"]; // 東南戦では東場・南場のみ
    const seatWinds: Wind[] = ["east", "south", "west", "north"];
    const roundWind = randomChoice(roundWinds);
    const seatWind = randomChoice(seatWinds);

    // 役無しチェック
    if (
      !hasYaku(
        waitConfig.modifiedMelds,
        waitConfig.modifiedHead,
        waitConfig.waitType,
        winType,
        roundWind,
        seatWind,
        isMenzen,
      )
    ) {
      continue;
    }

    // 高点法を適用して最も符が高い解釈を選択
    const highestFu = findHighestFuInterpretation(
      waitConfig.modifiedMelds,
      waitConfig.modifiedHead,
      waitConfig.winTile,
      winType,
      roundWind,
      seatWind,
      isMenzen,
      waitConfig.waitMeldIndex,
      waitConfig.waitFromHead,
    );

    if (!highestFu) continue;

    // カテゴリを決定
    let problemCategory: "wait" | "meld" | "head" | "mixed";
    if (category && category !== "all") {
      problemCategory = category as "wait" | "meld" | "head" | "mixed";
    } else {
      // 符の構成からカテゴリを推定
      const hasWaitFu = ["kanchan", "penchan", "tanki"].includes(
        highestFu.waitType,
      );
      const hasMeldFu = highestFu.melds.some(
        (m) => m.type === "koutsu" || m.type === "kantsu",
      );
      const hasHeadFu = highestFu.fuBreakdown.some((b) => b.name === "雀頭");

      if (hasWaitFu && hasMeldFu && hasHeadFu) {
        problemCategory = "mixed";
      } else if (hasWaitFu) {
        problemCategory = "wait";
      } else if (hasMeldFu) {
        problemCategory = "meld";
      } else if (hasHeadFu) {
        problemCategory = "head";
      } else {
        problemCategory = "meld";
      }
    }

    return {
      id: `random-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      melds: highestFu.melds,
      head: highestFu.head,
      winTile: waitConfig.winTile,
      waitType: highestFu.waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
      correctFu: highestFu.fu,
      fuBreakdown: highestFu.fuBreakdown,
      category: problemCategory,
      waitMeldIndex: highestFu.waitMeldIndex,
      waitFromHead: highestFu.waitFromHead,
    };
  }

  return null;
}

// カテゴリに応じた問題生成
export function generateProblemForCategory(
  category: "wait" | "meld" | "head" | "mixed" | "all",
): QuizProblem | null {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const problem = generateRandomProblem(category);
    if (!problem) continue;

    // カテゴリに合致するか確認
    if (category === "all" || problem.category === category) {
      return problem;
    }
  }

  return null;
}
