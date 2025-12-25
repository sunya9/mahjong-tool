import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TileHand } from "@/components/mahjong/TileHand";
import { MahjongTile } from "@/components/mahjong/MahjongTile";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { FuBreakdown } from "@/features/fu-quiz/FuBreakdown";
import { CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreQuizCategory, ScoreQuizProblem } from "@/lib/mahjong-types";
import {
  generateScoreOptions,
  formatScore,
  tsumoOptionToKey,
} from "@/lib/score-quiz";
import { calculateFu } from "@/lib/fu-calculator";

interface ScoreQuizCardProps {
  category: ScoreQuizCategory | "all";
  onResult: (isCorrect: boolean) => void;
  onNext: () => void;
  problem: ScoreQuizProblem;
}

type QuizState = "answering" | "result";

// 風の日本語名
function getWindName(wind: string): string {
  const names: Record<string, string> = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
  };
  return names[wind] ?? wind;
}

export function ScoreQuizCard({
  onResult,
  onNext,
  problem,
}: ScoreQuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>("answering");
  const [fuHintOpen, setFuHintOpen] = useState(false);
  const [yakuHintOpen, setYakuHintOpen] = useState(false);

  const options = useMemo(
    () => (problem ? generateScoreOptions(problem) : null),
    [problem],
  );

  // 符の内訳を計算
  const fuResult = useMemo(() => {
    if (!problem) return null;
    return calculateFu({
      melds: problem.melds,
      head: problem.head,
      waitType: problem.waitType,
      winType: problem.winType,
      roundWind: problem.roundWind,
      seatWind: problem.seatWind,
      isMenzen: problem.isMenzen,
    });
  }, [problem]);

  // 正解のキー
  const correctKey = useMemo(() => {
    if (!problem) return "";
    if (problem.winType === "ron") {
      return problem.correctScore.toString();
    } else {
      return tsumoOptionToKey({
        nonDealer: problem.correctScore,
        dealer: problem.correctScoreDealer,
      });
    }
  }, [problem]);

  const isCorrect = selectedOption === correctKey;

  const handleSelect = useCallback(
    (key: string) => {
      setSelectedOption(key);
      setState("result");
      onResult(key === correctKey);
    },
    [correctKey, onResult],
  );

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  return (
    <Card
      className={cn({
        ring: state === "result",
        "ring-green-500 dark:ring-green-600": state === "result" && isCorrect,
        "ring-red-500 dark:ring-red-600": state === "result" && !isCorrect,
      })}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>この点数は？</CardTitle>
          {/* 成否アイコン */}
          {state === "result" && (
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="size-6" />
                  <span className="font-bold">正解!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-500">
                  <XCircle className="size-6" />
                  <span className="font-bold">
                    正解:{" "}
                    {formatScore(
                      problem.correctScore,
                      problem.correctScoreDealer,
                      problem.isDealer,
                      problem.winType,
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 手牌表示 */}
        <div className="flex justify-center overflow-x-auto py-3">
          <TileHand
            melds={problem.melds}
            head={problem.head}
            winTile={problem.winTile}
            waitType={problem.waitType}
            waitMeldIndex={problem.waitMeldIndex}
            waitFromHead={problem.waitFromHead}
            showClosedAsFlat
          />
        </div>

        {/* ドラ表示牌 */}
        {problem.doraIndicators && problem.doraIndicators.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">ドラ表示:</span>
            <div className="flex gap-0.5">
              {problem.doraIndicators.map((tile, i) => (
                <MahjongTile key={`dora-${i}`} tile={tile} size="sm" />
              ))}
            </div>
            {/* 裏ドラは結果表示時のみ表示 */}
            {state === "result" &&
              problem.uraDoraIndicators &&
              problem.uraDoraIndicators.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">裏ドラ:</span>
                  <div className="flex gap-0.5">
                    {problem.uraDoraIndicators.map((tile, i) => (
                      <MahjongTile key={`uradora-${i}`} tile={tile} size="sm" />
                    ))}
                  </div>
                </>
              )}
          </div>
        )}

        {/* 条件バッジ */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant={problem.isDealer ? "default" : "outline"}>
            {problem.isDealer ? (
              <MahjongTerm term="親">親</MahjongTerm>
            ) : (
              <MahjongTerm term="子">子</MahjongTerm>
            )}
          </Badge>
          <Badge variant="outline">
            {problem.winType === "tsumo" ? (
              <MahjongTerm term="ツモ">ツモ</MahjongTerm>
            ) : (
              <MahjongTerm term="ロン">ロン</MahjongTerm>
            )}
          </Badge>
          {problem.isDoubleRiichi ? (
            <Badge variant="default">
              <MahjongTerm term="ダブル立直">ダブル立直</MahjongTerm>
            </Badge>
          ) : problem.isRiichi ? (
            <Badge variant="default">
              <MahjongTerm term="立直">立直</MahjongTerm>
            </Badge>
          ) : null}
          <Badge variant="outline">{getWindName(problem.roundWind)}場</Badge>
          <Badge variant="outline">{getWindName(problem.seatWind)}家</Badge>
        </div>

        {/* ヒントセクション */}
        {state === "answering" && (
          <div className="space-y-2 pt-2">
            {/* 符のヒント */}
            {fuResult && (
              <Collapsible open={fuHintOpen} onOpenChange={setFuHintOpen}>
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-muted/50",
                    fuHintOpen && "bg-muted/30",
                  )}
                >
                  <span>符のヒントを見る</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      fuHintOpen && "rotate-180",
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden rounded-lg border border-t-0 p-4 data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[starting-style]:animate-in data-[starting-style]:fade-in-0">
                  <FuBreakdown
                    breakdown={fuResult.breakdown}
                    total={fuResult.total}
                    rawTotal={fuResult.breakdown.reduce(
                      (sum, item) => sum + item.fu,
                      0,
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* 翻数のヒント */}
            <Collapsible open={yakuHintOpen} onOpenChange={setYakuHintOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-muted/50",
                  yakuHintOpen && "bg-muted/30",
                )}
              >
                <span>翻数のヒントを見る</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    yakuHintOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden rounded-lg border border-t-0 p-4 data-ending-style:animate-out data-ending-style:fade-out-0 data-starting-style:animate-in data-starting-style:fade-in-0">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    <MahjongTerm term="役">役</MahjongTerm>の内訳
                  </h4>
                  <div className="space-y-1">
                    {problem.yaku.map((y, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          <MahjongTerm term={y.name}>{y.name}</MahjongTerm>
                        </span>
                        <span className="font-medium tabular-nums">
                          {y.han}翻
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">合計</span>
                    <span className="text-lg font-bold text-primary">
                      {problem.han}翻
                      {problem.label && (
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          ({problem.label})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* 回答選択肢 */}
        <div className="pt-2">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
            {problem.winType === "ron" && options?.ronOptions
              ? options.ronOptions.map((score) => {
                  const key = score.toString();
                  const isSelected = selectedOption === key;
                  const isAnswer = correctKey === key;
                  const showResult = state === "result";

                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="lg"
                      onClick={() => state === "answering" && handleSelect(key)}
                      disabled={showResult}
                      className={cn(
                        "text-lg font-bold",
                        showResult &&
                          isAnswer &&
                          "border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-400",
                        showResult &&
                          isSelected &&
                          !isAnswer &&
                          "border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-400",
                      )}
                    >
                      {score}点
                    </Button>
                  );
                })
              : options?.tsumoOptions?.map((option) => {
                  const key = tsumoOptionToKey(option);
                  const isSelected = selectedOption === key;
                  const isAnswer = correctKey === key;
                  const showResult = state === "result";

                  const displayText = problem.isDealer
                    ? `${option.nonDealer}オール`
                    : `${option.nonDealer}/${option.dealer}`;

                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="lg"
                      onClick={() => state === "answering" && handleSelect(key)}
                      disabled={showResult}
                      className={cn(
                        "text-lg font-bold",
                        showResult &&
                          isAnswer &&
                          "border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-400",
                        showResult &&
                          isSelected &&
                          !isAnswer &&
                          "border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-400",
                      )}
                    >
                      {displayText}
                    </Button>
                  );
                })}
          </div>
        </div>

        {/* 結果表示（役と符の内訳） */}
        {state === "result" && (
          <>
            <Separator />
            <div className="space-y-4">
              {/* 役の内訳 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  役
                </h4>
                <div className="space-y-1">
                  {problem.yaku.map((y, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        <MahjongTerm term={y.name}>{y.name}</MahjongTerm>
                      </span>
                      <span className="font-medium tabular-nums">
                        {y.han}翻
                      </span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm font-bold">
                    <span>合計</span>
                    <span>
                      {problem.han}翻{problem.label && ` (${problem.label})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 符の内訳 */}
              {fuResult && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                    符
                  </h4>
                  <FuBreakdown
                    breakdown={fuResult.breakdown}
                    total={fuResult.total}
                    rawTotal={fuResult.breakdown.reduce(
                      (sum, item) => sum + item.fu,
                      0,
                    )}
                  />
                </div>
              )}

              {/* 点数 */}
              <div className="flex justify-between text-lg font-bold">
                <span>点数</span>
                <span className="text-primary">
                  {formatScore(
                    problem.correctScore,
                    problem.correctScoreDealer,
                    problem.isDealer,
                    problem.winType,
                  )}
                </span>
              </div>
            </div>
          </>
        )}

        {/* 次へボタン */}
        {state === "result" && (
          <div className="pt-2">
            <Button onClick={handleNext} className="w-full" size="lg">
              次の問題へ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
