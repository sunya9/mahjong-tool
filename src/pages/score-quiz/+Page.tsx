import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { ChevronRight } from "lucide-react";
import type { ScoreQuizCategory } from "@/lib/mahjong-types";
import { createUrl } from "@/lib/utils";

type Category = ScoreQuizCategory;

const categoryInfo: Record<Category, { label: string; description: string }> = {
  dealer: { label: "親", description: "親の点数計算" },
  "non-dealer": { label: "子", description: "子の点数計算" },
  tsumo: { label: "ツモ", description: "ツモの点数計算" },
  ron: { label: "ロン", description: "ロンの点数計算" },
  mixed: { label: "複合", description: "様々な条件を組み合わせた問題" },
};

export default function Page() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "麻雀ツール", href: createUrl("/") },
          { label: "点数クイズ" },
        ]}
      />
      <Contents className="space-y-8">
        <p className="text-center text-muted-foreground">
          カテゴリを選択してください
        </p>

        <ItemGroup className="mx-auto max-w-md">
          {Object.entries(categoryInfo).map(([key, { label, description }]) => (
            <Item
              key={key}
              variant="outline"
              render={<a href={createUrl(`/score-quiz/${key}`)} />}
              className="cursor-pointer hover:bg-muted/50"
            >
              <ItemContent>
                <ItemTitle>{label}</ItemTitle>
                <ItemDescription>{description}</ItemDescription>
              </ItemContent>
              <ItemContent>
                <ChevronRight />
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </Contents>
    </>
  );
}
