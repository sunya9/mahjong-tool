import {
  type Meld,
  type Head,
  type WaitType,
  type WinType,
  type Wind,
  type Tile,
  type TileSuit,
  type HonorType,
  type SpecialConditions,
  type ChiitoitsuHand,
  type KokushiHand,
  type TileNumber,
  type DragonType,
  type WindType,
  isWindTile,
  isTerminalOrHonor,
  isTerminal,
  isSimple,
  isDragonTile,
} from "./mahjong-types";
import { tilesMatch } from "./tile-utils";

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

// 緑一色に使える牌かどうか
function isGreenTile(tile: Tile): boolean {
  if (tile.suit === "honor") {
    return tile.value === "green"; // 發
  }
  if (tile.suit === "sou") {
    const v = tile.value;
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

// 役牌（三元牌）かどうか - isDragonTile を使用

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
function calculateYaku(
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
    !isDragonTile(head.tiles[0]) &&
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
  const isToitoi = melds.every(
    (m) => m.type === "koutsu" || m.type === "kantsu",
  );
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
      (m.type === "koutsu" || m.type === "kantsu") && isDragonTile(m.tiles[0]),
  );
  const isDragonHead = isDragonTile(head.tiles[0]);
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
      if (!shuntsuBySuit[suit]) shuntsuBySuit[suit] = [];
      const start = meld.tiles[0].value as number;
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

// ========================================
// 特殊条件による役
// ========================================

/**
 * 特殊条件から成立する役を取得
 */
function getSpecialConditionYaku(
  conditions: SpecialConditions | undefined,
  winType: WinType,
): YakuInfo[] {
  if (!conditions) return [];

  const yaku: YakuInfo[] = [];

  // 天和（役満）
  if (conditions.isTenhou) {
    yaku.push({ name: "天和", han: 13 });
    return yaku; // 役満なので他の役は加算しない
  }

  // 地和（役満）
  if (conditions.isChiihou) {
    yaku.push({ name: "地和", han: 13 });
    return yaku;
  }

  // ダブル立直（2翻）- 立直より優先
  if (conditions.isDoubleRiichi) {
    yaku.push({ name: "ダブル立直", han: 2 });
  } else if (conditions.isRiichi) {
    // 立直（1翻）
    yaku.push({ name: "立直", han: 1 });
  }

  // 一発（1翻）
  if (conditions.isIppatsu) {
    yaku.push({ name: "一発", han: 1 });
  }

  // 嶺上開花（1翻）
  if (conditions.isRinshan && winType === "tsumo") {
    yaku.push({ name: "嶺上開花", han: 1 });
  }

  // 槍槓（1翻）
  if (conditions.isChankan && winType === "ron") {
    yaku.push({ name: "槍槓", han: 1 });
  }

  // 海底摸月（1翻）
  if (conditions.isHaitei && winType === "tsumo") {
    yaku.push({ name: "海底摸月", han: 1 });
  }

  // 河底撈魚（1翻）
  if (conditions.isHoutei && winType === "ron") {
    yaku.push({ name: "河底撈魚", han: 1 });
  }

  return yaku;
}

// ========================================
// 七対子の役判定
// ========================================

/**
 * 七対子形の役を計算
 * @param originalTiles ドラ計算用の元の手牌（isRedDoraプロパティを保持）
 */
export function calculateChiitoitsuYaku(
  hand: ChiitoitsuHand,
  winType: WinType,
  _roundWind: Wind,
  _seatWind: Wind,
  conditions?: SpecialConditions,
  originalTiles?: Tile[],
): YakuResult {
  const yaku: YakuInfo[] = [];

  // 全ての牌を取得
  const allTiles = hand.pairs.flatMap((p) => p);

  // 特殊条件による役満チェック
  const specialYaku = getSpecialConditionYaku(conditions, winType);
  if (specialYaku.some((y) => y.han >= 13)) {
    // 役満がある場合はそれだけ返す
    return {
      yaku: specialYaku,
      totalHan: specialYaku.reduce((sum, y) => sum + y.han, 0),
    };
  }

  // 字一色（役満）
  if (allTiles.every((t) => t.suit === "honor")) {
    return { yaku: [{ name: "字一色", han: 13 }], totalHan: 13 };
  }

  // 七対子（2翻）
  yaku.push({ name: "七対子", han: 2 });

  // 門前清自摸和（メンゼンツモ）
  if (winType === "tsumo") {
    yaku.push({ name: "門前清自摸和", han: 1 });
  }

  // 断幺九（タンヤオ）
  if (allTiles.every((t) => isSimple(t))) {
    yaku.push({ name: "断幺九", han: 1 });
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
      yaku.push({ name: "混一色", han: 3 });
    } else {
      yaku.push({ name: "清一色", han: 6 });
    }
  }

  // 混老頭（ホンロウトウ）
  if (allTiles.every((t) => isTerminalOrHonor(t))) {
    yaku.push({ name: "混老頭", han: 2 });
  }

  // 特殊条件による役を追加
  yaku.push(...specialYaku);

  // ドラを追加（originalTilesがあればそれを使用）
  const tilesForDora = originalTiles ?? allTiles;
  const isRiichi = conditions?.isRiichi || conditions?.isDoubleRiichi || false;
  const doraYaku = getDoraYaku(tilesForDora, conditions, isRiichi);
  yaku.push(...doraYaku);

  // 翻数計算
  const totalHan = yaku.reduce((sum, y) => sum + y.han, 0);

  return { yaku, totalHan };
}

// ========================================
// 国士無双の役判定
// ========================================

/**
 * 国士無双形の役を計算
 * 日本プロ麻雀連盟ルール：国士無双十三面もダブル役満ではなく役満
 */
export function calculateKokushiYaku(
  _hand: KokushiHand,
  winType: WinType,
  conditions?: SpecialConditions,
): YakuResult {
  // 特殊条件による役満チェック
  const specialYaku = getSpecialConditionYaku(conditions, winType);

  // 国士無双（十三面待ちも同じ役満扱い）
  const yaku: YakuInfo[] = [{ name: "国士無双", han: 13 }];
  // 天和・地和との複合
  yaku.push(...specialYaku.filter((y) => y.han >= 13));
  const totalHan = yaku.reduce((sum, y) => sum + y.han, 0);
  return { yaku, totalHan };
}

// ========================================
// 通常形の役満判定
// ========================================

/**
 * 通常形の役満を計算（役満がある場合のみ結果を返す）
 */
function calculateRegularYakuman(
  melds: Meld[],
  head: Head,
  isMenzen: boolean,
  conditions?: SpecialConditions,
): YakuResult | null {
  const yaku: YakuInfo[] = [];
  const allTiles = getAllTiles(melds, head);

  // 天和・地和
  if (conditions?.isTenhou) {
    yaku.push({ name: "天和", han: 13 });
  }
  if (conditions?.isChiihou) {
    yaku.push({ name: "地和", han: 13 });
  }

  // 四暗刻
  // 日本プロ麻雀連盟ルール：四暗刻単騎もダブル役満ではなく役満
  if (isMenzen) {
    const closedTriplets = countClosedTriplets(melds);
    if (closedTriplets === 4) {
      yaku.push({ name: "四暗刻", han: 13 });
    }
  }

  // 大三元
  const dragonTriplets = melds.filter(
    (m) =>
      (m.type === "koutsu" || m.type === "kantsu") && isDragonTile(m.tiles[0]),
  );
  if (dragonTriplets.length === 3) {
    yaku.push({ name: "大三元", han: 13 });
  }

  // 小四喜 / 大四喜
  // 日本プロ麻雀連盟ルール：大四喜もダブル役満ではなく役満
  const windTriplets = melds.filter(
    (m) =>
      (m.type === "koutsu" || m.type === "kantsu") && isWindTile(m.tiles[0]),
  );
  const isWindHead = isWindTile(head.tiles[0]);
  if (windTriplets.length === 4) {
    yaku.push({ name: "大四喜", han: 13 });
  } else if (windTriplets.length === 3 && isWindHead) {
    yaku.push({ name: "小四喜", han: 13 });
  }

  // 字一色
  if (allTiles.every((t) => t.suit === "honor")) {
    yaku.push({ name: "字一色", han: 13 });
  }

  // 清老頭
  if (allTiles.every((t) => isTerminal(t))) {
    yaku.push({ name: "清老頭", han: 13 });
  }

  // 緑一色
  if (allTiles.every((t) => isGreenTile(t))) {
    yaku.push({ name: "緑一色", han: 13 });
  }

  // 四槓子
  const kantsuCount = countKantsu(melds);
  if (kantsuCount === 4) {
    yaku.push({ name: "四槓子", han: 13 });
  }

  // 九蓮宝燈 / 純正九蓮宝燈
  if (isMenzen) {
    const chuuren = checkChuuren(melds, head, allTiles);
    if (chuuren) {
      yaku.push(chuuren);
    }
  }

  if (yaku.length === 0) return null;

  const totalHan = yaku.reduce((sum, y) => sum + y.han, 0);
  return { yaku, totalHan };
}

/**
 * 九蓮宝燈の判定
 */
function checkChuuren(
  _melds: Meld[],
  _head: Head,
  allTiles: Tile[],
): YakuInfo | null {
  // 清一色でない場合は不成立
  const suits = new Set(allTiles.map((t) => t.suit));
  if (suits.size !== 1 || suits.has("honor")) return null;

  // 1112345678999 + 1枚の形
  const count = new Array(9).fill(0);
  for (const tile of allTiles) {
    if (tile.suit !== "honor") {
      count[(tile.value as number) - 1]++;
    }
  }

  // 1と9が3枚以上、2-8が1枚以上
  if (count[0] < 3 || count[8] < 3) return null;
  for (let i = 1; i <= 7; i++) {
    if (count[i] < 1) return null;
  }

  // 日本プロ麻雀連盟ルール：純正九蓮宝燈もダブル役満ではなく役満
  return { name: "九蓮宝燈", han: 13 };
}

// ========================================
// 拡張版の役計算（特殊条件対応）
// ========================================

/**
 * 通常形の役を計算（特殊条件対応版）
 * @param originalTiles ドラ計算用の元の手牌（isRedDoraプロパティを保持）
 */
export function calculateYakuWithConditions(
  melds: Meld[],
  head: Head,
  waitType: WaitType,
  winType: WinType,
  roundWind: Wind,
  seatWind: Wind,
  isMenzen: boolean,
  conditions?: SpecialConditions,
  originalTiles?: Tile[],
): YakuResult {
  // 役満チェック
  const yakumanResult = calculateRegularYakuman(
    melds,
    head,
    isMenzen,
    conditions,
  );
  if (yakumanResult) {
    // 役満の場合はドラをカウントしない
    return yakumanResult;
  }

  // 通常役
  const baseResult = calculateYaku(
    melds,
    head,
    waitType,
    winType,
    roundWind,
    seatWind,
    isMenzen,
  );

  // 特殊条件による役を追加
  const specialYaku = getSpecialConditionYaku(conditions, winType);

  // ドラを追加（originalTilesがあればそれを使用、なければ面子から再構成）
  const tilesForDora = originalTiles ?? getAllTiles(melds, head);
  const isRiichi = conditions?.isRiichi || conditions?.isDoubleRiichi || false;
  const doraYaku = getDoraYaku(tilesForDora, conditions, isRiichi);

  const allYaku = [...baseResult.yaku, ...specialYaku, ...doraYaku];
  const totalHan = allYaku.reduce((sum, y) => {
    if (isMenzen) {
      return sum + y.han;
    } else {
      return sum + (y.hanOpen ?? y.han);
    }
  }, 0);

  return { yaku: allYaku, totalHan };
}

const nextNumberOrder: Record<TileNumber, TileNumber> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 1,
} as const;
const nextWindOrder: Record<WindType, WindType> = {
  east: "south",
  south: "west",
  west: "north",
  north: "east",
} as const;
const nextDragonOrder: Record<DragonType, DragonType> = {
  white: "green",
  green: "red",
  red: "white",
} as const;

// ========================================
// ドラ計算
// ========================================

/**
 * ドラ表示牌からドラ牌を取得
 *
 * ルール:
 * - 数牌: 表示牌の次の牌（9の次は1）
 * - 風牌: 東→南→西→北→東
 * - 三元牌: 白→發→中→白
 */
function getDoraFromIndicator(indicator: Tile): Tile {
  if (indicator.suit === "honor") {
    if (
      indicator.value === "east" ||
      indicator.value === "south" ||
      indicator.value === "west" ||
      indicator.value === "north"
    ) {
      const nextWind = nextWindOrder[indicator.value];
      return { suit: "honor", value: nextWind };
    } else {
      const nextDragon = nextDragonOrder[indicator.value];
      return { suit: "honor", value: nextDragon };
    }
  }
  const nextValue = nextNumberOrder[indicator.value];
  return { suit: indicator.suit, value: nextValue };
}

/**
 * 牌が一致するかどうか（赤ドラ情報を無視して比較）
 */
// tilesMatch は tile-utils.ts からインポート

/**
 * 手牌のドラ枚数をカウント（表ドラ・裏ドラ用、赤ドラは含まない）
 */
function countDora(allTiles: Tile[], doraIndicators: Tile[]): number {
  let count = 0;
  const doraTiles = doraIndicators.map(getDoraFromIndicator);

  for (const tile of allTiles) {
    for (const dora of doraTiles) {
      if (tilesMatch(tile, dora)) {
        count++;
      }
    }
  }

  return count;
}

/**
 * 赤ドラの枚数をカウント
 */
function countRedDora(allTiles: Tile[]): number {
  return allTiles.filter(
    (t) => t.suit !== "honor" && "isRedDora" in t && t.isRedDora,
  ).length;
}

/**
 * ドラを役として返す
 */
function getDoraYaku(
  allTiles: Tile[],
  conditions: SpecialConditions | undefined,
  isRiichi: boolean,
): YakuInfo[] {
  const yaku: YakuInfo[] = [];

  // 表ドラ
  if (conditions?.doraIndicators && conditions.doraIndicators.length > 0) {
    const doraCount = countDora(allTiles, conditions.doraIndicators);
    if (doraCount > 0) {
      yaku.push({ name: "ドラ", han: doraCount });
    }
  }

  // 裏ドラ（リーチ時のみ）
  if (
    isRiichi &&
    conditions?.uraDoraIndicators &&
    conditions.uraDoraIndicators.length > 0
  ) {
    const uraDoraCount = countDora(allTiles, conditions.uraDoraIndicators);
    if (uraDoraCount > 0) {
      yaku.push({ name: "裏ドラ", han: uraDoraCount });
    }
  }

  // 赤ドラ
  const redDoraCount = countRedDora(allTiles);
  if (redDoraCount > 0) {
    yaku.push({ name: "赤ドラ", han: redDoraCount });
  }

  return yaku;
}
