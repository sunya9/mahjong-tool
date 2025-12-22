import { useState, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreQuizCard } from "./ScoreQuizCard";
import { ArrowLeft } from "lucide-react";
import type { ScoreQuizCategory } from "@/lib/mahjong-types";

type Category = ScoreQuizCategory | "all";

const categoryInfo: Record<Category, { label: string; description: string }> = {
  all: { label: "すべて", description: "全カテゴリからランダムに出題" },
  dealer: { label: "親", description: "親の点数計算" },
  "non-dealer": { label: "子", description: "子の点数計算" },
  tsumo: { label: "ツモ", description: "ツモの点数計算" },
  ron: { label: "ロン", description: "ロンの点数計算" },
  mixed: { label: "複合", description: "様々な条件を組み合わせた問題" },
};

function CategorySelect() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">点数計算クイズ</h1>
        <p className="text-muted-foreground">カテゴリを選択してください</p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(categoryInfo).map(([key, { label, description }]) => (
          <Link key={key} href={`/score-quiz/${key}`} asChild>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ScoreQuizPage() {
  const params = useParams<{ category?: string }>();
  const [, setLocation] = useLocation();

  const category = params.category as Category | undefined;

  // カテゴリ未選択の場合はカテゴリ選択画面を表示
  if (!category) {
    return <CategorySelect />;
  }

  return <QuizSession category={category} setLocation={setLocation} />;
}

interface QuizSessionProps {
  category: Category;
  setLocation: (path: string) => void;
}

function QuizSession({ category, setLocation }: QuizSessionProps) {
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const handleResult = useCallback((isCorrect: boolean) => {
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }, []);

  const categoryLabel = categoryInfo[category]?.label ?? category;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/score-quiz")}
            className="gap-1"
          >
            <ArrowLeft className="size-4" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold">点数計算クイズ: {categoryLabel}</h1>
        </div>
        <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium tabular-nums">
          正解: {stats.correct} / {stats.total}
        </div>
      </div>

      {/* 問題カード */}
      <ScoreQuizCard category={category} onResult={handleResult} />
    </div>
  );
}
