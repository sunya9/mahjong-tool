import type {
  Meld,
  Head,
  WaitType,
  WinType,
  Wind,
  Tile,
  TileSuit,
  HonorType,
} from "./mahjong-types";

// 役の情報
export interface YakuInfo {
  name: string;
  han: number;
  hanOpen?: number; // 鳴いた場合の翻数（なければ役なし）
}

// 役の結果
export interface YakuResult {
  yaku: YakuInfo[];
  totalHan: number;
}

// 全ての牌を収集
function getAllTiles(melds: Meld[], head: Head): Tile[] {
  const tiles: Tile[] = [...head.tiles];
  for (const meld of melds) {
    tiles.push(...meld.tiles);
  }
  return tiles;
}

// 幺九牌（1,9,字牌）かどうか
function isTerminalOrHonor(tile: Tile): boolean {
  if (tile.suit === "honor") return true;
  return tile.value === 1 || tile.value === 9;
}

// 老頭牌（1,9のみ）かどうか
function isTerminal(tile: Tile): boolean {
  if (tile.suit === "honor") return false;
  return tile.value === 1 || tile.value === 9;
}

// 中張牌（2-8）かどうか
function isSimple(tile: Tile): boolean {
  if (tile.suit === "honor") return false;
  const v = tile.value as number;
  return v >= 2 && v <= 8;
}

// 緑一色に使える牌かどうか
function isGreenTile(tile: Tile): boolean {
  if (tile.suit === "honor") {
    return tile.value === "green"; // 發
  }
  if (tile.suit === "sou") {
    const v = tile.value as number;
    return v === 2 || v === 3 || v === 4 || v === 6 || v === 8;
  }
  return false;
}

// 暗刻/暗槓の数をカウント
function countClosedTriplets(melds: Meld[]): number {
  return melds.filter(
    (m) => (m.type === "koutsu" || m.type === "kantsu") && m.state === "closed",
  ).length;
}

// 槓子の数をカウント
function countKantsu(melds: Meld[]): number {
  return melds.filter((m) => m.type === "kantsu").length;
}

// 役牌（三元牌）かどうか
function isDragon(tile: Tile): boolean {
  if (tile.suit !== "honor") return false;
  const v = tile.value as HonorType;
  return v === "white" || v === "green" || v === "red";
}

// 役牌（風牌で場風または自風）かどうか
function isWindYaku(tile: Tile, roundWind: Wind, seatWind: Wind): boolean {
  if (tile.suit !== "honor") return false;
  const v = tile.value as HonorType;
  if (v === "east" || v === "south" || v === "west" || v === "north") {
    return v === roundWind || v === seatWind;
  }
  return false;
}

// 役を計算
export function calculateYaku(
  melds: Meld[],
  head: Head,
  waitType: WaitType,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
): YakuResult {
  const yaku: YakuInfo[] = [];
  const allTiles = getAllTiles(melds, head);

  // === 1翻役 ===

  // 門前清自摸和（メンゼンツモ）
  if (isMenzen && winType === "tsumo") {
    yaku.push({ name: "門前清自摸和", han: 1 });
  }

  // 断幺九（タンヤオ）
  const isTanyao = allTiles.every((t) => isSimple(t));
  if (isTanyao) {
    yaku.push({ name: "断幺九", han: 1, hanOpen: 1 });
  }

  // 平和（ピンフ）
  const isPinfu =
    isMenzen &&
    melds.every((m) => m.type === "shuntsu") &&
    !isWindYaku(head.tiles[0], roundWind, seatWind) &&
    !isDragon(head.tiles[0]) &&
    waitType === "ryanmen";
  if (isPinfu) {
    yaku.push({ name: "平和", han: 1 });
  }

  // 役牌（三元牌）
  for (const meld of melds) {
    if (meld.type === "koutsu" || meld.type === "kantsu") {
      const tile = meld.tiles[0];
      if (tile.suit === "honor") {
        const v = tile.value as HonorType;
        if (v === "white") {
          yaku.push({ name: "役牌:白", han: 1, hanOpen: 1 });
        } else if (v === "green") {
          yaku.push({ name: "役牌:發", han: 1, hanOpen: 1 });
        } else if (v === "red") {
          yaku.push({ name: "役牌:中", han: 1, hanOpen: 1 });
        } else if (v === roundWind) {
          yaku.push({ name: `役牌:場風${getWindName(v)}`, han: 1, hanOpen: 1 });
        }
        // 自風（場風と異なる場合のみ追加）
        if (
          v === seatWind &&
          (v === "east" || v === "south" || v === "west" || v === "north") &&
          v !== roundWind
        ) {
          yaku.push({ name: `役牌:自風${getWindName(v)}`, han: 1, hanOpen: 1 });
        }
      }
    }
  }

  // 一盃口（イーペーコー）
  if (isMenzen) {
    const shuntsuList = melds.filter((m) => m.type === "shuntsu");
    let pairCount = 0;
    const used = new Set<number>();
    for (let i = 0; i < shuntsuList.length; i++) {
      if (used.has(i)) continue;
      for (let j = i + 1; j < shuntsuList.length; j++) {
        if (used.has(j)) continue;
        if (
          shuntsuList[i].tiles[0].suit === shuntsuList[j].tiles[0].suit &&
          shuntsuList[i].tiles[0].value === shuntsuList[j].tiles[0].value
        ) {
          pairCount++;
          used.add(i);
          used.add(j);
          break;
        }
      }
    }
    if (pairCount === 1) {
      yaku.push({ name: "一盃口", han: 1 });
    } else if (pairCount === 2) {
      yaku.push({ name: "二盃口", han: 3 });
    }
  }

  // === 2翻役 ===

  // 三暗刻
  const closedTriplets = countClosedTriplets(melds);
  // ロンで双碰待ちの場合、ロン牌で完成した刻子は明刻扱いになる可能性がある
  // ここでは単純化して暗刻カウントをそのまま使用
  if (closedTriplets >= 3) {
    yaku.push({ name: "三暗刻", han: 2, hanOpen: 2 });
  }

  // 対々和（トイトイ）
  const isToitoi = melds.every((m) => m.type === "koutsu" || m.type === "kantsu");
  if (isToitoi) {
    yaku.push({ name: "対々和", han: 2, hanOpen: 2 });
  }

  // 三槓子
  const kantsuCount = countKantsu(melds);
  if (kantsuCount >= 3) {
    yaku.push({ name: "三槓子", han: 2, hanOpen: 2 });
  }

  // 混老頭（ホンロウトウ）
  const isHonroutou = allTiles.every((t) => isTerminalOrHonor(t));
  if (isHonroutou && isToitoi) {
    yaku.push({ name: "混老頭", han: 2, hanOpen: 2 });
  }

  // 小三元
  const dragonTriplets = melds.filter(
    (m) =>
      (m.type === "koutsu" || m.type === "kantsu") && isDragon(m.tiles[0]),
  );
  const isDragonHead = isDragon(head.tiles[0]);
  if (dragonTriplets.length === 2 && isDragonHead) {
    yaku.push({ name: "小三元", han: 2, hanOpen: 2 });
  }

  // 混一色 / 清一色
  const suits = new Set<TileSuit>();
  let hasHonor = false;
  for (const tile of allTiles) {
    if (tile.suit === "honor") {
      hasHonor = true;
    } else {
      suits.add(tile.suit);
    }
  }
  if (suits.size === 1) {
    if (hasHonor) {
      // 混一色
      yaku.push({ name: "混一色", han: 3, hanOpen: 2 });
    } else {
      // 清一色
      yaku.push({ name: "清一色", han: 6, hanOpen: 5 });
    }
  }

  // 純全帯幺（ジュンチャン）
  const isJunchan =
    !hasHonor &&
    melds.every((m) => m.tiles.some((t) => isTerminal(t))) &&
    isTerminal(head.tiles[0]);
  if (isJunchan) {
    yaku.push({ name: "純全帯幺九", han: 3, hanOpen: 2 });
  }

  // 混全帯幺（チャンタ）
  const isChanta =
    hasHonor &&
    melds.every((m) => m.tiles.some((t) => isTerminalOrHonor(t))) &&
    isTerminalOrHonor(head.tiles[0]);
  if (isChanta && !isHonroutou) {
    yaku.push({ name: "混全帯幺九", han: 2, hanOpen: 1 });
  }

  // 一気通貫（イッツー）
  const shuntsuBySuit: Record<string, number[]> = {};
  for (const meld of melds) {
    if (meld.type === "shuntsu") {
      const suit = meld.tiles[0].suit;
      const start = meld.tiles[0].value as number;
      if (!shuntsuBySuit[suit]) shuntsuBySuit[suit] = [];
      shuntsuBySuit[suit].push(start);
    }
  }
  for (const starts of Object.values(shuntsuBySuit)) {
    if (starts.includes(1) && starts.includes(4) && starts.includes(7)) {
      yaku.push({ name: "一気通貫", han: 2, hanOpen: 1 });
      break;
    }
  }

  // 三色同順
  const shuntsuByStart: Record<number, Set<TileSuit>> = {};
  for (const meld of melds) {
    if (meld.type === "shuntsu") {
      const start = meld.tiles[0].value as number;
      const suit = meld.tiles[0].suit as TileSuit;
      if (!shuntsuByStart[start]) shuntsuByStart[start] = new Set();
      shuntsuByStart[start].add(suit);
    }
  }
  for (const suits of Object.values(shuntsuByStart)) {
    if (suits.has("man") && suits.has("pin") && suits.has("sou")) {
      yaku.push({ name: "三色同順", han: 2, hanOpen: 1 });
      break;
    }
  }

  // 三色同刻
  const koutsuByValue: Record<number, Set<TileSuit>> = {};
  for (const meld of melds) {
    if (meld.type === "koutsu" || meld.type === "kantsu") {
      if (meld.tiles[0].suit !== "honor") {
        const value = meld.tiles[0].value as number;
        const suit = meld.tiles[0].suit as TileSuit;
        if (!koutsuByValue[value]) koutsuByValue[value] = new Set();
        koutsuByValue[value].add(suit);
      }
    }
  }
  for (const suits of Object.values(koutsuByValue)) {
    if (suits.has("man") && suits.has("pin") && suits.has("sou")) {
      yaku.push({ name: "三色同刻", han: 2, hanOpen: 2 });
      break;
    }
  }

  // 翻数計算
  let totalHan = 0;
  for (const y of yaku) {
    if (isMenzen) {
      totalHan += y.han;
    } else {
      // 鳴いている場合
      if (y.hanOpen !== undefined) {
        totalHan += y.hanOpen;
      }
      // hanOpenがundefinedの役は門前限定なので加算しない
    }
  }

  return { yaku, totalHan };
}

// 風の日本語名を取得
function getWindName(wind: Wind): string {
  const names: Record<Wind, string> = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
  };
  return names[wind];
}

// 役満判定（除外用）
export function isYakuman(
  melds: Meld[],
  head: Head,
  _winType: WinType,
  isMenzen: boolean,
): boolean {
  const allTiles = getAllTiles(melds, head);

  // 四暗刻
  if (isMenzen) {
    const closedTriplets = countClosedTriplets(melds);
    if (closedTriplets === 4) return true;
  }

  // 大三元
  const dragonTriplets = melds.filter(
    (m) =>
      (m.type === "koutsu" || m.type === "kantsu") && isDragon(m.tiles[0]),
  );
  if (dragonTriplets.length === 3) return true;

  // 字一色
  const isTsuuiisou = allTiles.every((t) => t.suit === "honor");
  if (isTsuuiisou) return true;

  // 清老頭
  const isChinroutou = allTiles.every((t) => isTerminal(t));
  if (isChinroutou) return true;

  // 緑一色
  const isRyuuiisou = allTiles.every((t) => isGreenTile(t));
  if (isRyuuiisou) return true;

  // 四槓子
  const kantsuCount = countKantsu(melds);
  if (kantsuCount === 4) return true;

  return false;
}
