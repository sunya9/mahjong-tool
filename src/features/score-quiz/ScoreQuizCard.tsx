import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TileHand } from "@/components/mahjong/TileHand";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreQuizCategory, ScoreQuizProblem } from "@/lib/mahjong-types";
import {
  generateScoreQuizProblem,
  generateScoreOptions,
  formatScore,
  tsumoOptionToKey,
} from "@/lib/score-quiz";

interface ScoreQuizCardProps {
  category: ScoreQuizCategory | "all";
  onResult: (isCorrect: boolean) => void;
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

export function ScoreQuizCard({ category, onResult }: ScoreQuizCardProps) {
  const [problem, setProblem] = useState<ScoreQuizProblem | null>(() =>
    generateScoreQuizProblem(category),
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [state, setState] = useState<QuizState>("answering");

  const options = useMemo(
    () => (problem ? generateScoreOptions(problem) : null),
    [problem],
  );

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
    setProblem(generateScoreQuizProblem(category));
    setSelectedOption(null);
    setState("answering");
  }, [category]);

  if (!problem) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          問題を生成できませんでした。もう一度お試しください。
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn({
        ring: state === "result",
        "ring-green-500 dark:ring-green-600": state === "result" && isCorrect,
        "ring-red-500 dark:ring-red-600": state === "result" && !isCorrect,
      })}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">この点数は？</CardTitle>
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
        <div className="flex justify-center py-2">
          <TileHand
            melds={problem.melds}
            head={problem.head}
            winTile={problem.winTile}
            waitType={problem.waitType}
            waitMeldIndex={problem.waitMeldIndex}
            waitFromHead={problem.waitFromHead}
            tileClassName="text-4xl sm:text-5xl"
          />
        </div>

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
          <Badge variant="outline">
            {getWindName(problem.roundWind)}場
          </Badge>
          <Badge variant="outline">
            {getWindName(problem.seatWind)}家
          </Badge>
        </div>

        {/* 回答選択肢 */}
        <div className="pt-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
            <div className="space-y-3">
              {/* 役の内訳 */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  役
                </h4>
                <div className="space-y-1">
                  {problem.yaku.map((y, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{y.name}</span>
                      <span className="font-medium">{y.han}翻</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-1 text-sm font-bold">
                    <span>合計</span>
                    <span>
                      {problem.han}翻{problem.label && ` (${problem.label})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 符と点数 */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">符</span>
                <span className="font-medium">{problem.fu}符</span>
              </div>
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
