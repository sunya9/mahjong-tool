import { useReducer, useState, useCallback, useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScoreQuizCard } from "@/features/score-quiz/ScoreQuizCard";
import { ScoreTable } from "@/features/score-cheatsheet/ScoreTable";
import { AlertCircle, Lightbulb, RefreshCw } from "lucide-react";
import { generateScoreQuizProblem } from "@/lib/score-quiz";
import {
  serializeScoreQuizProblem,
  deserializeScoreQuizProblem,
} from "@/lib/problem-serializer";
import type { ScoreQuizCategory, ScoreQuizProblem } from "@/lib/mahjong-types";

type Category = ScoreQuizCategory;

const categoryInfo: Record<Category, { label: string; description: string }> = {
  dealer: { label: "親", description: "親の点数計算" },
  "non-dealer": { label: "子", description: "子の点数計算" },
  tsumo: { label: "ツモ", description: "ツモの点数計算" },
  ron: { label: "ロン", description: "ロンの点数計算" },
  mixed: { label: "複合", description: "様々な条件を組み合わせた問題" },
};

// 判別可能なユニオン型で状態を表現
type QuizState =
  | { status: "error" }
  | { status: "ready"; problem: ScoreQuizProblem; key: number };

type QuizAction =
  | { type: "LOAD_PROBLEM"; problem: ScoreQuizProblem }
  | { type: "SET_ERROR" };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "LOAD_PROBLEM":
      return {
        status: "ready",
        problem: action.problem,
        key: state.status === "ready" ? state.key + 1 : 0,
      };
    case "SET_ERROR":
      return { status: "error" };
  }
}

export default function Page() {
  const pageContext = usePageContext();
  const category = pageContext.routeParams.category as Category;
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const didInitialUrlSync = useRef(false);

  // URLから初期状態を計算
  const getInitialState = useCallback((): QuizState => {
    const params = new URLSearchParams(window.location.search);
    const encodedProblem = params.get("q");

    if (encodedProblem) {
      const restored = deserializeScoreQuizProblem(encodedProblem, category);
      if (restored) {
        return { status: "ready", problem: restored, key: 0 };
      }
      return { status: "error" };
    }

    // クエリパラメータがない場合は新規生成
    const generated = generateScoreQuizProblem(category);
    if (generated) {
      return { status: "ready", problem: generated, key: 0 };
    }

    return { status: "error" };
  }, [category]);

  const [state, dispatch] = useReducer(quizReducer, null, getInitialState);

  // 初回マウント時：クエリパラメータがなければURLを更新
  useEffect(() => {
    if (didInitialUrlSync.current) return;
    didInitialUrlSync.current = true;

    if (state.status !== "ready") return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("q")) {
      const encoded = serializeScoreQuizProblem(state.problem);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [state]);

  // 新しい問題を生成してURLを更新
  const generateNewProblem = useCallback(() => {
    const generated = generateScoreQuizProblem(category);
    if (generated) {
      dispatch({ type: "LOAD_PROBLEM", problem: generated });
      const encoded = serializeScoreQuizProblem(generated);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.pushState({}, "", newUrl);
    }
  }, [category]);

  // URLから問題を読み込む（popstate用）
  const loadProblemFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedProblem = params.get("q");

    if (encodedProblem) {
      const restored = deserializeScoreQuizProblem(encodedProblem, category);
      if (restored) {
        dispatch({ type: "LOAD_PROBLEM", problem: restored });
        return;
      }
      dispatch({ type: "SET_ERROR" });
      return;
    }

    // クエリパラメータがない場合は新規生成（replaceで）
    const generated = generateScoreQuizProblem(category);
    if (generated) {
      dispatch({ type: "LOAD_PROBLEM", problem: generated });
      const encoded = serializeScoreQuizProblem(generated);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [category]);

  // ブラウザの戻る/進むボタン対応
  useEffect(() => {
    window.addEventListener("popstate", loadProblemFromUrl);
    return () => window.removeEventListener("popstate", loadProblemFromUrl);
  }, [loadProblemFromUrl]);

  const handleResult = useCallback((isCorrect: boolean) => {
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }, []);

  const categoryLabel = categoryInfo[category]?.label ?? category;

  // 問題のisDealerに応じてデフォルトタブを決定
  const defaultTab =
    state.status === "ready" && state.problem.isDealer
      ? "dealer"
      : "non-dealer";

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "麻雀ツール", href: "/" },
          { label: "点数クイズ", href: "/score-quiz" },
          { label: categoryLabel },
        ]}
      >
        <div className="ml-auto text-sm font-medium tabular-nums">
          <span className="hidden sm:inline">正解:</span> {stats.correct} /{" "}
          {stats.total}
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Lightbulb />
              <span className="sr-only">点数表</span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="overflow-y-auto data-[side=right]:w-5/6 sm:data-[side=right]:max-w-2xl"
            >
              <SheetHeader>
                <SheetTitle>点数表</SheetTitle>
                <SheetDescription>
                  符と翻から点数を確認できます
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dealer">親</TabsTrigger>
                  <TabsTrigger value="non-dealer">子</TabsTrigger>
                </TabsList>
                <TabsContent value="dealer">
                  <ScoreTable isDealer={true} />
                </TabsContent>
                <TabsContent value="non-dealer">
                  <ScoreTable isDealer={false} />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </PageHeader>
      <Contents className="space-y-4">
        {state.status === "error" && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle />
              </EmptyMedia>
              <EmptyTitle>問題を読み込めませんでした</EmptyTitle>
              <EmptyDescription>
                URLが無効か、問題データが破損しています。
                新しい問題を生成してください。
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={generateNewProblem}>
                <RefreshCw />
                新しい問題を生成
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {state.status === "ready" && (
          <ScoreQuizCard
            key={state.key}
            category={category}
            onResult={handleResult}
            onNext={generateNewProblem}
            problem={state.problem}
          />
        )}
      </Contents>
    </>
  );
}
