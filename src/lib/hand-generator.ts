import type {
  Tile,
  Meld,
  Head,
  WaitType,
  WinType,
  Wind,
  QuizProblem,
  TileSuit,
  HonorType,
} from "./mahjong-types";
import { calculateFu } from "./fu-calculator";

// 牌のプール管理
interface TilePool {
  tiles: Map<string, number>; // "man-1" -> 残り枚数
}

function tileKey(tile: Tile): string {
  return `${tile.suit}-${tile.value}`;
}

function createTilePool(): TilePool {
  const pool = new Map<string, number>();

  // 数牌（各4枚）
  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      pool.set(`${suit}-${i}`, 4);
    }
  }

  // 字牌（各4枚）
  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
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

// 順子を生成
function generateShuntsu(
  pool: TilePool,
  isOpen: boolean,
): { meld: Meld; tiles: Tile[] } | null {
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

// 刻子を生成
function generateKoutsu(
  pool: TilePool,
  isOpen: boolean,
): { meld: Meld; tiles: Tile[] } | null {
  const allTiles: Tile[] = [];

  // 数牌
  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      allTiles.push({ suit, value: i });
    }
  }

  // 字牌
  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  for (const honor of honors) {
    allTiles.push({ suit: "honor", value: honor });
  }

  const shuffled = shuffle(allTiles);

  for (const tile of shuffled) {
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

// 槓子を生成
function generateKantsu(
  pool: TilePool,
  isOpen: boolean,
): { meld: Meld; tiles: Tile[] } | null {
  const allTiles: Tile[] = [];

  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      allTiles.push({ suit, value: i });
    }
  }

  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  for (const honor of honors) {
    allTiles.push({ suit: "honor", value: honor });
  }

  const shuffled = shuffle(allTiles);

  for (const tile of shuffled) {
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

// 雀頭を生成
function generateHead(pool: TilePool): { head: Head; tile: Tile } | null {
  const allTiles: Tile[] = [];

  const suits: TileSuit[] = ["man", "pin", "sou"];
  for (const suit of suits) {
    for (let i = 1; i <= 9; i++) {
      allTiles.push({ suit, value: i });
    }
  }

  const honors: HonorType[] = [
    "east",
    "south",
    "west",
    "north",
    "white",
    "green",
    "red",
  ];
  for (const honor of honors) {
    allTiles.push({ suit: "honor", value: honor });
  }

  const shuffled = shuffle(allTiles);

  for (const tile of shuffled) {
    if (canTake(pool, tile, 2)) {
      takeTiles(pool, tile, 2);
      return {
        head: { tiles: [tile, tile] },
        tile,
      };
    }
  }
  return null;
}

// 待ちの種類を決定して手牌を調整
interface WaitConfig {
  waitType: WaitType;
  winTile: Tile;
  modifiedMelds: Meld[];
  modifiedHead: Head;
  waitMeldIndex?: number; // 待ちの元になる面子のインデックス
  waitFromHead?: boolean; // 雀頭からの待ちか
}

// 牌が一致するかチェック
function tilesMatch(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
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
    (t) =>
      t.suit !== "honor" &&
      (t.value as number) >= 2 &&
      (t.value as number) <= 8,
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
    if (tile.suit !== "honor") return false;
    const honor = tile.value as HonorType;
    // 三元牌
    if (honor === "white" || honor === "green" || honor === "red") return true;
    // 場風
    if (honor === roundWind) return true;
    // 自風
    if (honor === seatWind) return true;
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
  const modifiedMelds = melds.map((m) => ({ ...m, tiles: [...m.tiles] }));
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
        const firstValue = modifiedMelds[idx].tiles[0].value as number;
        return firstValue >= 2 && firstValue <= 6;
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
        const firstValue = meld.tiles[0].value as number;
        if (firstValue === 1) {
          // 123 -> 3待ち (辺張)
          return {
            waitType,
            winTile: meld.tiles[2],
            modifiedMelds,
            modifiedHead,
            waitMeldIndex: idx,
          };
        } else if (firstValue === 7) {
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
    let hasKantsu = false;
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

      // 槓子は1つまで、確率低め
      if (meldType < 0.1 && !hasKantsu) {
        result = generateKantsu(pool, shouldBeOpen);
        if (result) hasKantsu = true;
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

    // カテゴリを決定
    let problemCategory: "wait" | "meld" | "head" | "mixed";
    if (category && category !== "all") {
      problemCategory = category as "wait" | "meld" | "head" | "mixed";
    } else {
      // 符の構成からカテゴリを推定
      const hasWaitFu = ["kanchan", "penchan", "tanki"].includes(
        waitConfig.waitType,
      );
      const hasMeldFu = waitConfig.modifiedMelds.some(
        (m) => m.type === "koutsu" || m.type === "kantsu",
      );
      const hasHeadFu = fuResult.breakdown.some((b) => b.name === "雀頭");

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
      melds: waitConfig.modifiedMelds,
      head: waitConfig.modifiedHead,
      winTile: waitConfig.winTile,
      waitType: waitConfig.waitType,
      winType,
      roundWind,
      seatWind,
      isMenzen,
      correctFu: fuResult.total,
      fuBreakdown: fuResult.breakdown,
      category: problemCategory,
      waitMeldIndex: waitConfig.waitMeldIndex,
      waitFromHead: waitConfig.waitFromHead,
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
