import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import { FuCheatsheetContent } from "@/features/fu-cheatsheet/FuCheatsheetContent";
import { createUrl } from "@/lib/utils";

export default function Page() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "麻雀ツール", href: createUrl("/") },
          { label: "符表" },
        ]}
      />
      <Contents className="space-y-4">
        <p className="text-muted-foreground">
          符の計算方法と点数への影響を確認できます
        </p>
        <FuCheatsheetContent />
      </Contents>
    </>
  );
}
