import { usePageContext } from "vike-react/usePageContext";
import { BookOpen, Calculator, Hash, Home, Table } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useReading } from "@/context/useReading";
import { createUrl } from "@/lib/utils";

const quizItems = [
  {
    title: "符クイズ",
    url: "/fu-quiz",
    icon: Hash,
  },
  {
    title: "点数クイズ",
    url: "/score-quiz",
    icon: Calculator,
  },
];

const cheatsheetItems = [
  {
    title: "符表",
    url: "/fu",
    icon: Table,
  },
  {
    title: "点数表",
    url: "/score",
    icon: Table,
  },
];

const otherItems = [
  {
    title: "用語集",
    url: "/glossary",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { urlPathname } = usePageContext();
  const location = createUrl(urlPathname);
  const { showReading, setShowReading } = useReading();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href={createUrl("/")} />}
              size="lg"
              isActive={location === createUrl("/")}
            >
              <Home />
              <span className="font-bold">麻雀ツール</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>クイズ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quizItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={createUrl(item.url)} />}
                    isActive={location.startsWith(createUrl(item.url))}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>早見表</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cheatsheetItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={createUrl(item.url)} />}
                    isActive={location === createUrl(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>その他</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={createUrl(item.url)} />}
                    isActive={location === createUrl(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <label className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm">
          <span className="text-muted-foreground">読み仮名を表示</span>
          <Switch
            checked={showReading}
            onCheckedChange={setShowReading}
            size="sm"
          />
        </label>
      </SidebarFooter>
    </Sidebar>
  );
}
