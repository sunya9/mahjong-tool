import { useState } from "react";
import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScoreTable } from "@/features/score-cheatsheet/ScoreTable";
import { Minus, Plus } from "lucide-react";
import { createUrl } from "@/lib/utils";

export default function Page() {
  const [isDealer, setIsDealer] = useState(false);
  const [honba, setHonba] = useState(0);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "麻雀ツール", href: createUrl("/") },
          { label: "点数表" },
        ]}
      >
        <div className="ml-auto flex items-center gap-4">
          {/* 親/子スイッチ */}
          <div className="flex items-center gap-2">
            <Label
              htmlFor="dealer-switch"
              className={!isDealer ? "font-bold" : "text-muted-foreground"}
            >
              子
            </Label>
            <Switch
              id="dealer-switch"
              checked={isDealer}
              onCheckedChange={setIsDealer}
            />
            <Label
              htmlFor="dealer-switch"
              className={isDealer ? "font-bold" : "text-muted-foreground"}
            >
              親
            </Label>
          </div>

          {/* 積み棒スピナー */}
          <div className="flex items-center gap-1.5">
            <Label className="text-sm text-muted-foreground">積み棒</Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-r-none p-0"
                onClick={() => setHonba((h) => Math.max(0, h - 1))}
                disabled={honba === 0}
              >
                <Minus className="size-3" />
              </Button>
              <div className="flex h-8 w-10 items-center justify-center border-y border-border bg-muted/30 text-sm font-medium tabular-nums">
                {honba}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-l-none p-0"
                onClick={() => setHonba((h) => Math.min(99, h + 1))}
              >
                <Plus className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </PageHeader>
      <Contents>
        <ScoreTable isDealer={isDealer} honba={honba} />
      </Contents>
    </>
  );
}
