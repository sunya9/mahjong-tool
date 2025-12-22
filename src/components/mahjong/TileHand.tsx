import { cn } from "@/lib/utils";
import type {
  Meld,
  Head,
  Tile,
  TileSuit,
  HonorType,
  WaitType,
} from "@/lib/mahjong-types";
import { TileGroup, tilesMatch } from "./TileGroup";
import { MahjongTile } from "./MahjongTile";

interface TileHandProps {
  melds: Meld[];
  head: Head;
  winTile?: Tile;
  waitType?: WaitType;
  waitMeldIndex?: number; // 待ちの元になる面子のインデックス
  waitFromHead?: boolean; // 雀頭からの待ちか（単騎待ち）
  tileClassName?: string; // 各牌に適用するクラス（サイズなど）
  className?: string;
}

// 牌の種類の順序（萬子→筒子→索子→字牌）
const suitOrder: Record<TileSuit, number> = {
  man: 0,
  pin: 1,
  sou: 2,
  honor: 3,
};

// 字牌の順序（東南西北白發中）
const honorOrder: Record<HonorType, number> = {
  east: 0,
  south: 1,
  west: 2,
  north: 3,
  white: 4,
  green: 5,
  red: 6,
};

// 牌のソート値を取得
function getTileSortValue(tile: Tile): number {
  const suitValue = suitOrder[tile.suit] * 100;
  if (tile.suit === "honor") {
    return suitValue + honorOrder[tile.value as HonorType];
  }
  return suitValue + (tile.value as number);
}

// 面子のソート値（最初の牌で決定）
function getMeldSortValue(meld: Meld): number {
  return getTileSortValue(meld.tiles[0]);
}

// 雀頭のソート値
function getHeadSortValue(head: Head): number {
  return getTileSortValue(head.tiles[0]);
}

// 待ち状態の手牌を生成（和了牌を除去）
function createWaitingHand(
  melds: Meld[],
  head: Head,
  winTile?: Tile,
  waitType?: WaitType,
  waitMeldIndex?: number,
  waitFromHead?: boolean,
): { melds: Meld[]; head: Head } {
  if (!winTile || !waitType) {
    return { melds, head };
  }

  // 単騎待ち: 雀頭から1枚除去
  if (waitType === "tanki" || waitFromHead) {
    return {
      melds,
      head: { tiles: [head.tiles[0]] as unknown as [Tile, Tile] },
    };
  }

  // waitMeldIndexが指定されている場合は、そのインデックスの面子のみを修正
  if (waitMeldIndex !== undefined) {
    const newMelds = melds.map((meld, index) => {
      if (index !== waitMeldIndex) return meld;

      // 双碰待ち: 刻子から1枚除去して対子にする
      if (waitType === "shanpon" && meld.type === "koutsu") {
        return {
          ...meld,
          type: "toitsu" as const,
          tiles: [meld.tiles[0], meld.tiles[1]],
        };
      }

      // 順子系の待ち
      if (meld.type === "shuntsu") {
        for (let i = 0; i < meld.tiles.length; i++) {
          if (tilesMatch(meld.tiles[i], winTile)) {
            // 嵌張: 真ん中を除去
            if (waitType === "kanchan" && i === 1) {
              return {
                ...meld,
                type: "tamen" as const,
                tiles: [meld.tiles[0], meld.tiles[2]],
              };
            }
            // 両面・辺張: 端を除去
            if (
              (waitType === "ryanmen" || waitType === "penchan") &&
              (i === 0 || i === 2)
            ) {
              const remainingTiles =
                i === 0
                  ? [meld.tiles[1], meld.tiles[2]]
                  : [meld.tiles[0], meld.tiles[1]];
              return {
                ...meld,
                type: "tamen" as const,
                tiles: remainingTiles,
              };
            }
          }
        }
      }
      return meld;
    });
    return { melds: newMelds as Meld[], head };
  }

  // 後方互換: waitMeldIndexがない場合は従来の動作（最初に見つかった面子を修正）
  // 双碰待ち: 刻子から1枚除去して対子にする
  if (waitType === "shanpon") {
    const newMelds = melds.map((meld) => {
      if (meld.type === "koutsu" && tilesMatch(meld.tiles[0], winTile)) {
        return {
          ...meld,
          type: "toitsu" as const,
          tiles: [meld.tiles[0], meld.tiles[1]],
        };
      }
      return meld;
    });
    return { melds: newMelds as Meld[], head };
  }

  // 順子系の待ち: 和了牌を除去
  const newMelds = melds.map((meld) => {
    if (meld.type !== "shuntsu") return meld;

    for (let i = 0; i < meld.tiles.length; i++) {
      if (tilesMatch(meld.tiles[i], winTile)) {
        // 嵌張: 真ん中を除去
        if (waitType === "kanchan" && i === 1) {
          return {
            ...meld,
            type: "tamen" as const,
            tiles: [meld.tiles[0], meld.tiles[2]],
          };
        }
        // 両面・辺張: 端を除去
        if (
          (waitType === "ryanmen" || waitType === "penchan") &&
          (i === 0 || i === 2)
        ) {
          const remainingTiles =
            i === 0
              ? [meld.tiles[1], meld.tiles[2]]
              : [meld.tiles[0], meld.tiles[1]];
          return {
            ...meld,
            type: "tamen" as const,
            tiles: remainingTiles,
          };
        }
      }
    }
    return meld;
  });

  return { melds: newMelds as Meld[], head };
}

export function TileHand({
  melds,
  head,
  winTile,
  waitType,
  waitMeldIndex,
  waitFromHead,
  tileClassName,
  className,
}: TileHandProps) {
  // 待ち状態の手牌を生成（和了牌を除去）
  const waitingHand = createWaitingHand(
    melds,
    head,
    winTile,
    waitType,
    waitMeldIndex,
    waitFromHead,
  );
  const displayMelds = waitingHand.melds;
  const displayHead = waitingHand.head;

  // 副露（open）・槓子と門前（closed）を分離
  // 槓子は暗槓でも右側に晒す
  const closedMelds = displayMelds.filter(
    (m) => m.state === "closed" && m.type !== "kantsu",
  );
  const exposedMelds = displayMelds.filter(
    (m) => m.state === "open" || m.type === "kantsu",
  );

  // 門前の面子をソート
  const sortedClosedMelds = [...closedMelds].sort(
    (a, b) => getMeldSortValue(a) - getMeldSortValue(b),
  );

  // 晒した面子（副露・槓子）をソート
  const sortedExposedMelds = [...exposedMelds].sort(
    (a, b) => getMeldSortValue(a) - getMeldSortValue(b),
  );

  // 雀頭の挿入位置を決定（門前の面子の中で）
  const headSortValue = getHeadSortValue(displayHead);
  let headInsertIndex = sortedClosedMelds.length;
  for (let i = 0; i < sortedClosedMelds.length; i++) {
    if (getMeldSortValue(sortedClosedMelds[i]) > headSortValue) {
      headInsertIndex = i;
      break;
    }
  }

  const hasExposedMelds = sortedExposedMelds.length > 0;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1 sm:gap-2", className)}
    >
      {/* 門前部分（左側） */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {sortedClosedMelds.map((meld, index) => (
          <span key={`closed-${index}`} className="contents">
            {index === headInsertIndex && (
              <TileGroup head={displayHead} tileClassName={tileClassName} />
            )}
            <TileGroup meld={meld} tileClassName={tileClassName} />
          </span>
        ))}
        {headInsertIndex === sortedClosedMelds.length && (
          <TileGroup head={displayHead} tileClassName={tileClassName} />
        )}
      </div>

      {/* 晒した面子（副露・槓子）（右側） */}
      {hasExposedMelds && (
        <div className="ml-2 flex items-center gap-2 sm:ml-4 sm:gap-3">
          {sortedExposedMelds.map((meld, index) => (
            <TileGroup
              key={`exposed-${index}`}
              meld={meld}
              tileClassName={tileClassName}
            />
          ))}
        </div>
      )}

      {/* 和了牌 */}
      {winTile && (
        <div className="ml-3 flex items-center gap-1 sm:ml-4">
          <MahjongTile
            tile={winTile}
            className={cn(
              tileClassName,
              "rounded-sm ring-2 ring-primary ring-offset-1",
            )}
          />
        </div>
      )}
    </div>
  );
}
