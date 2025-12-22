import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, BookOpen, HelpCircle, Hash } from "lucide-react";

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">麻雀ツール</h1>
        <p className="text-muted-foreground">
          符計算の練習や点数確認ができるツールです
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/quiz" asChild>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-5" />
                符計算クイズ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                待ち・面子・雀頭などの符計算をクイズ形式で練習できます
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fu" asChild>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Hash className="size-5" />
                符計算早見表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                面子・待ち・雀頭ごとの符を確認できます
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/score" asChild>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                点数早見表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                親・子別に符と翻から点数を確認できます
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/glossary" asChild>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="size-5" />
                用語集
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                麻雀用語の読み方と意味を確認できます
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
