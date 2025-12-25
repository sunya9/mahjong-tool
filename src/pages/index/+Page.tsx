import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { useReading } from "@/context/useReading";
import { Calculator, BookOpen, ChevronRight, Hash, Table } from "lucide-react";

const menuItems = [
  {
    href: "/fu-quiz",
    icon: Hash,
    title: "符クイズ",
    description: "待ち・面子・雀頭などの符計算をクイズ形式で練習できます",
  },
  {
    href: "/score-quiz",
    icon: Calculator,
    title: "点数クイズ",
    description: "手牌から役・符・点数を計算するクイズで練習できます",
  },
  {
    href: "/fu",
    icon: Table,
    title: "符表",
    description: "面子・待ち・雀頭ごとの符を確認できます",
  },
  {
    href: "/score",
    icon: Table,
    title: "点数表",
    description: "親・子別に符と翻から点数を確認できます",
  },
  {
    href: "/glossary",
    icon: BookOpen,
    title: "用語集",
    description: "麻雀用語の読み方と意味を確認できます",
  },
];

export default function Page() {
  const { showReading, setShowReading } = useReading();

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "麻雀ツール" }]} />
      <Contents className="space-y-8">
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            符計算・点数計算の練習や確認ができるツールです
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <span className="text-muted-foreground">読み仮名を表示</span>
            <Switch
              checked={showReading}
              onCheckedChange={setShowReading}
              size="sm"
            />
          </label>
        </div>

        <div className="mx-auto space-y-8 sm:mx-auto sm:max-w-xl">
          <ItemGroup>
            {menuItems.map((item) => (
              <Item
                key={item.href}
                variant="outline"
                render={<a href={item.href} />}
              >
                <ItemMedia variant="icon">
                  <item.icon className="size-10 rounded bg-muted p-3" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.description}</ItemDescription>
                </ItemContent>
                <ItemContent>
                  <ChevronRight />
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
          <Card>
            <CardHeader>
              <CardTitle>このサイトについて</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                このサイトは麻雀の符計算・点数計算を
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href="https://x.com/ephemeralMocha"
                >
                  @ephemeralMocha
                </a>
                自身が学ぶために作成したクイズサイトです。
              </p>
              <p>なにか間違い等見つけたらご連絡ください。</p>
            </CardContent>
            <CardFooter>
              <Button
                render={<a href="https://github.com/sunya9/mahjong-tool" />}
                variant="link"
              >
                GitHub
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Contents>
    </>
  );
}
