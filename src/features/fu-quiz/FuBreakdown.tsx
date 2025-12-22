import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { TileGroup } from "@/components/mahjong/TileGroup";
import type { FuItem, TileSuit, HonorType, Tile } from "@/lib/mahjong-types";

interface FuBreakdownProps {
  breakdown: FuItem[];
  total: number;
  rawTotal: number;
}

// 牌の種類の順序（萬子→筒子→索子→字牌）- TileHandと同じ
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

// 符の内訳をソート（牌がある項目は牌の順序でソート）
function sortBreakdown(breakdown: FuItem[]): FuItem[] {
  // 牌がない項目（副底、ツモ、待ち）と牌がある項目（雀頭、面子）を分離
  const withoutTiles = breakdown.filter(
    (item) => !item.tiles || item.tiles.length === 0,
  );
  const withTiles = breakdown.filter(
    (item) => item.tiles && item.tiles.length > 0,
  );

  // 牌がある項目を最初の牌でソート
  const sortedWithTiles = [...withTiles].sort((a, b) => {
    const aValue = getTileSortValue(a.tiles![0]);
    const bValue = getTileSortValue(b.tiles![0]);
    return aValue - bValue;
  });

  return [...withoutTiles, ...sortedWithTiles];
}

// 符の名前を用語に分解（複合語を分割してそれぞれにルビを振る）
interface TermPart {
  text: string;
  termKey: string | null;
}

function parseTermName(name: string): TermPart[] {
  // 完全一致の用語
  const directTerms = ["副底", "ツモ", "雀頭", "順子"];
  if (directTerms.includes(name)) {
    return [{ text: name, termKey: name }];
  }

  // 待ちの種類
  const waitTypes = ["両面待ち", "嵌張待ち", "辺張待ち", "双碰待ち", "単騎待ち"];
  if (waitTypes.includes(name)) {
    return [{ text: name, termKey: name }];
  }

  // 複合語の分解（例: "中張牌暗刻" → ["中張牌", "暗刻"]）
  const prefixes = ["中張牌", "幺九牌"];
  const suffixes = ["暗刻", "明刻", "暗槓", "明槓"];

  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      if (name === prefix + suffix) {
        return [
          { text: prefix, termKey: prefix },
          { text: suffix, termKey: suffix },
        ];
      }
    }
  }

  // マッチしない場合はそのまま
  return [{ text: name, termKey: null }];
}

export function FuBreakdown({ breakdown, total, rawTotal }: FuBreakdownProps) {
  // 手牌の並びと同じ順序でソート
  const sortedBreakdown = useMemo(() => sortBreakdown(breakdown), [breakdown]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">
        <MahjongTerm term="符" showRuby>
          符
        </MahjongTerm>
        の内訳
      </h4>
      {sortedBreakdown.map((item, index) => {
        const termParts = parseTermName(item.name);
        return (
          <div
            key={index}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {termParts.map((part, partIndex) =>
                  part.termKey ? (
                    <MahjongTerm key={partIndex} term={part.termKey} showRuby>
                      {part.text}
                    </MahjongTerm>
                  ) : (
                    <span key={partIndex}>{part.text}</span>
                  ),
                )}
                {item.description && (
                  <span className="ml-1 text-xs">({item.description})</span>
                )}
              </span>
              {/* 該当する牌を名称の後に表示（面子は横向き・裏向きを反映） */}
              {(item.meld || item.head) && (
                <TileGroup
                  meld={item.meld}
                  head={item.head}
                  tileClassName="text-2xl"
                />
              )}
            </div>
            <span className="font-medium tabular-nums">{item.fu}符</span>
          </div>
        );
      })}
      <Separator className="my-2" />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          合計: {rawTotal}符{rawTotal !== total && ` → ${total}符に切り上げ`}
        </span>
        <span className="text-lg font-bold text-primary">{total}符</span>
      </div>
    </div>
  );
}
