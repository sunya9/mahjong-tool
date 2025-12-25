import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { scoreTable } from "@/data/scoreTable";

interface ScoreTableProps {
  isDealer: boolean;
  honba?: number;
}

// 表示用の符リスト
const fuList = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
// 表示用の翻リスト（1-4翻）
const hanList = [1, 2, 3, 4];
// 満貫以上の翻リスト
const limitHanList: { han: number; label: string; hanDisplay: string }[] = [
  { han: 5, label: "満貫", hanDisplay: "5翻" },
  { han: 6, label: "跳満", hanDisplay: "6〜7翻" },
  { han: 8, label: "倍満", hanDisplay: "8〜10翻" },
  { han: 11, label: "三倍満", hanDisplay: "11〜12翻" },
  { han: 13, label: "役満", hanDisplay: "13翻〜" },
];

interface ScoreDisplay {
  ron: string | null;
  tsumo: string | null;
  tsumoDetail?: string;
}

function getScore(
  fu: number,
  han: number,
  isDealer: boolean,
  honba: number = 0,
): ScoreDisplay {
  const entry = scoreTable.find((e) => e.fu === fu && e.han === han);
  if (!entry) return { ron: null, tsumo: null };

  // 積み棒ボーナス: ロンは+300*本場、ツモは各自+100*本場
  const ronBonus = 300 * honba;
  const tsumoBonus = 100 * honba;

  if (isDealer) {
    const ronTotal = entry.dealer.ron + ronBonus;
    const tsumoEach = entry.dealer.tsumo + tsumoBonus;
    return {
      ron: ronTotal.toLocaleString(),
      tsumo: (tsumoEach * 3).toLocaleString(),
      tsumoDetail: `${tsumoEach.toLocaleString()}∀`,
    };
  } else {
    const { tsumoDealer, tsumoNonDealer, ron } = entry.nonDealer;
    if (tsumoDealer === 0 || tsumoNonDealer === 0) {
      return { ron: (ron + ronBonus).toLocaleString(), tsumo: null };
    }
    const tsumoD = tsumoDealer + tsumoBonus;
    const tsumoND = tsumoNonDealer + tsumoBonus;
    const total = tsumoD + tsumoND * 2;
    return {
      ron: (ron + ronBonus).toLocaleString(),
      tsumo: total.toLocaleString(),
      tsumoDetail: `${tsumoND.toLocaleString()}/${tsumoD.toLocaleString()}`,
    };
  }
}

function getLimitScores(
  han: number,
  isDealer: boolean,
  honba: number = 0,
): { label: string; ron: string; tsumo: string; tsumoDetail: string } | null {
  const entry = scoreTable.find((e) => e.han === han && e.fu === 0);
  if (!entry || !entry.label) return null;

  // 積み棒ボーナス
  const ronBonus = 300 * honba;
  const tsumoBonus = 100 * honba;

  if (isDealer) {
    const ronTotal = entry.dealer.ron + ronBonus;
    const tsumoEach = entry.dealer.tsumo + tsumoBonus;
    return {
      label: entry.label,
      ron: ronTotal.toLocaleString(),
      tsumo: (tsumoEach * 3).toLocaleString(),
      tsumoDetail: `${tsumoEach.toLocaleString()}∀`,
    };
  } else {
    const { tsumoDealer, tsumoNonDealer, ron } = entry.nonDealer;
    const tsumoD = tsumoDealer + tsumoBonus;
    const tsumoND = tsumoNonDealer + tsumoBonus;
    const total = tsumoD + tsumoND * 2;
    return {
      label: entry.label,
      ron: (ron + ronBonus).toLocaleString(),
      tsumo: total.toLocaleString(),
      tsumoDetail: `${tsumoND.toLocaleString()}/${tsumoD.toLocaleString()}`,
    };
  }
}

export function ScoreTable({ isDealer, honba = 0 }: ScoreTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isDealer ? "親" : "子"}の点数表</CardTitle>
        <CardDescription>
          上段: ロン / 下段: ツモ
          {isDealer
            ? "（∀ = オール）"
            : "（子/親 = 子2人の支払い / 親の支払い）"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 text-center font-bold">
                翻＼符
              </TableHead>
              {fuList.map((fu) => (
                <TableHead key={fu} className="text-center font-bold">
                  {fu}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 1-4翻（符による点数変動あり） */}
            {hanList.map((han) => {
              // 満貫になる最初の符を見つける
              const limitStartIndex = fuList.findIndex((fu) => {
                const entry = scoreTable.find(
                  (e) => e.fu === fu && e.han === han,
                );
                return entry?.label === "満貫";
              });

              const hasLimit = limitStartIndex !== -1;
              const normalFuList = hasLimit
                ? fuList.slice(0, limitStartIndex)
                : fuList;
              const limitColSpan = hasLimit
                ? fuList.length - limitStartIndex
                : 0;

              return (
                <TableRow key={han}>
                  <TableCell className="bg-muted/30 text-center font-medium">
                    {han}翻
                  </TableCell>
                  {/* 通常の符（満貫以外） */}
                  {normalFuList.map((fu) => {
                    const score = getScore(fu, han, isDealer, honba);
                    const hasScore = score.ron || score.tsumo;

                    return (
                      <TableCell
                        key={fu}
                        className={cn(
                          "p-1.5 text-center",
                          !hasScore && "text-muted-foreground",
                        )}
                      >
                        {hasScore ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="tabular-nums">{score.ron}</div>
                            {score.tsumo && (
                              <div className="text-xs text-muted-foreground tabular-nums">
                                {score.tsumoDetail}
                              </div>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    );
                  })}
                  {/* 満貫セル（結合） */}
                  {hasLimit && (
                    <TableCell
                      colSpan={limitColSpan}
                      className="bg-primary/5 p-1.5 text-center"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="font-bold text-primary tabular-nums">
                          {
                            getScore(
                              fuList[limitStartIndex],
                              han,
                              isDealer,
                              honba,
                            ).ron
                          }
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {
                            getScore(
                              fuList[limitStartIndex],
                              han,
                              isDealer,
                              honba,
                            ).tsumoDetail
                          }
                        </div>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {/* 満貫以上（符に関係なく固定点数） */}
            {limitHanList.map(({ han, label, hanDisplay }) => {
              const data = getLimitScores(han, isDealer, honba);
              if (!data) return null;
              return (
                <TableRow key={han}>
                  <TableCell className="bg-muted/30 text-center font-medium">
                    <div>{hanDisplay}</div>
                    <div className="text-muted-foreground">
                      (<MahjongTerm term={label}>{label}</MahjongTerm>)
                    </div>
                  </TableCell>
                  <TableCell
                    colSpan={fuList.length}
                    className="bg-primary/5 p-1.5 text-center"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-primary tabular-nums">
                        {data.ron}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {data.tsumoDetail}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
