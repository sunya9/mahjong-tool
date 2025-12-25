import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TileHand } from "@/components/mahjong/TileHand";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { FuBreakdown } from "./FuBreakdown";
import { generateFuOptions } from "@/lib/fu-calculator";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  QuizProblem,
  Wind,
  WaitType,
  QuizCategory,
} from "@/lib/mahjong-types";

interface QuizCardProps {
  category: QuizCategory | "all";
  onResult: (isCorrect: boolean) => void;
  onNext: () => void;
  problem: QuizProblem;
}

type QuizState = "answering" | "result";

function getWindName(wind: Wind): string {
  const names: Record<Wind, string> = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
  };
  return names[wind];
}

// 待ちの種類とその用語集のキー
const waitTermMap: Record<WaitType, string> = {
  ryanmen: "両面待ち",
  kanchan: "嵌張待ち",
  penchan: "辺張待ち",
  shanpon: "双碰待ち",
  tanki: "単騎待ち",
};

export function QuizCard({ onResult, onNext, problem }: QuizCardProps) {
  const [selectedFu, setSelectedFu] = useState<number | null>(null);
  const [state, setState] = useState<QuizState>("answering");

  const fuOptions = useMemo(
    () => generateFuOptions(problem.correctFu),
    [problem.correctFu],
  );

  const waitTerm = waitTermMap[problem.waitType];
  const isCorrect = selectedFu === problem.correctFu;
  const rawTotal = problem.fuBreakdown.reduce((sum, item) => sum + item.fu, 0);

  const handleSelect = useCallback(
    (fu: number) => {
      setSelectedFu(fu);
      setState("result");
      onResult(fu === problem.correctFu);
    },
    [problem.correctFu, onResult],
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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>
            この手の<MahjongTerm term="符">符</MahjongTerm>は？
          </CardTitle>
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
                    {selectedFu}符 → {problem.correctFu}符
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

        {/* 和了情報 */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">
            {problem.winType === "tsumo" ? (
              <MahjongTerm term="ツモ">ツモ</MahjongTerm>
            ) : (
              <MahjongTerm term="ロン">ロン</MahjongTerm>
            )}
          </Badge>
          <Badge variant="outline">
            <MahjongTerm term={waitTerm}>{waitTerm}</MahjongTerm>
          </Badge>
          <Badge variant="outline">
            <MahjongTerm term="場風">
              {getWindName(problem.roundWind)}場
            </MahjongTerm>
          </Badge>
          <Badge variant="outline">
            <MahjongTerm term="自風">
              {getWindName(problem.seatWind)}家
            </MahjongTerm>
          </Badge>
          <Badge variant="outline">
            {problem.isMenzen ? (
              <MahjongTerm term="門前">門前</MahjongTerm>
            ) : (
              <>
                <MahjongTerm term="副露">副露</MahjongTerm>あり
              </>
            )}
          </Badge>
        </div>
        {/* 結果表示 */}
        {state === "result" && (
          <div className="pt-2">
            <FuBreakdown
              breakdown={problem.fuBreakdown}
              total={problem.correctFu}
              rawTotal={rawTotal}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-1 gap-1 sm:grid-cols-4">
        {/* 回答選択肢 */}
        {fuOptions.map((fu) => {
          const isSelected = selectedFu === fu;
          const isAnswer = problem.correctFu === fu;
          const showResult = state === "result";

          return (
            <Button
              key={fu}
              variant="outline"
              size="lg"
              onClick={() => state === "answering" && handleSelect(fu)}
              disabled={showResult}
              className={cn(
                "flex-1 text-lg",
                showResult &&
                  isAnswer &&
                  "border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-400",
                showResult &&
                  isSelected &&
                  !isAnswer &&
                  "border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-400",
              )}
            >
              {fu}符
            </Button>
          );
        })}
      </CardFooter>
      {state === "result" && (
        <CardFooter>
          <Button onClick={handleNext} className="w-full" size="lg">
            次の問題へ
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
