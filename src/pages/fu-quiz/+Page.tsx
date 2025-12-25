import { useReducer, useState, useCallback, useEffect, useRef } from "react";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { QuizCard } from "@/features/fu-quiz/QuizCard";
import { FuCheatsheetContent } from "@/features/fu-cheatsheet/FuCheatsheetContent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Lightbulb, RefreshCw } from "lucide-react";
import { generateProblemForCategory } from "@/lib/hand-generator";
import { serializeProblem, deserializeProblem } from "@/lib/problem-serializer";
import type { QuizProblem } from "@/lib/mahjong-types";
import { createUrl } from "@/lib/utils";

// 判別可能なユニオン型で状態を表現
type QuizState =
  | { status: "error" }
  | { status: "ready"; problem: QuizProblem; key: number };

type QuizAction =
  | { type: "LOAD_PROBLEM"; problem: QuizProblem }
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

// URLから初期状態を計算
function getInitialState(): QuizState {
  const params = new URLSearchParams(window.location.search);
  const encodedProblem = params.get("q");

  if (encodedProblem) {
    const restored = deserializeProblem(encodedProblem);
    if (restored) {
      return { status: "ready", problem: restored, key: 0 };
    }
    return { status: "error" };
  }

  // クエリパラメータがない場合は新規生成
  const generated = generateProblemForCategory("mixed");
  if (generated) {
    return { status: "ready", problem: generated, key: 0 };
  }

  return { status: "error" };
}

export default function Page() {
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [state, dispatch] = useReducer(quizReducer, null, getInitialState);
  const didInitialUrlSync = useRef(false);

  // 初回マウント時：クエリパラメータがなければURLを更新
  useEffect(() => {
    if (didInitialUrlSync.current) return;
    didInitialUrlSync.current = true;

    if (state.status !== "ready") return;

    const params = new URLSearchParams(window.location.search);
    if (!params.has("q")) {
      const encoded = serializeProblem(state.problem);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [state]);

  // 新しい問題を生成してURLを更新
  const generateNewProblem = useCallback(() => {
    const generated = generateProblemForCategory("mixed");
    if (generated) {
      dispatch({ type: "LOAD_PROBLEM", problem: generated });
      const encoded = serializeProblem(generated);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.pushState({}, "", newUrl);
    }
  }, []);

  // URLから問題を読み込む（popstate用）
  const loadProblemFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedProblem = params.get("q");

    if (encodedProblem) {
      const restored = deserializeProblem(encodedProblem);
      if (restored) {
        dispatch({ type: "LOAD_PROBLEM", problem: restored });
        return;
      }
      dispatch({ type: "SET_ERROR" });
      return;
    }

    // クエリパラメータがない場合は新規生成（replaceで）
    const generated = generateProblemForCategory("mixed");
    if (generated) {
      dispatch({ type: "LOAD_PROBLEM", problem: generated });
      const encoded = serializeProblem(generated);
      const newUrl = `${window.location.pathname}?q=${encoded}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

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

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "麻雀ツール", href: createUrl("/") },
          { label: "符クイズ" },
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
              <span className="sr-only">ヒント</span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="overflow-y-auto data-[side=right]:w-5/6 sm:data-[side=right]:max-w-md"
            >
              <SheetHeader>
                <SheetTitle>符計算早見表</SheetTitle>
                <SheetDescription>符の計算方法を確認できます</SheetDescription>
              </SheetHeader>
              <FuCheatsheetContent />
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
          <>
            <QuizCard
              key={state.key}
              category="mixed"
              onResult={handleResult}
              onNext={generateNewProblem}
              problem={state.problem}
            />
            <Alert>
              <Info />
              <AlertDescription>
                役は考慮していないため、四暗刻などの符計算の必要がない役満が出題される場合があります
              </AlertDescription>
            </Alert>
          </>
        )}
      </Contents>
    </>
  );
}
