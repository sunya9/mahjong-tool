import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Calculator,
  FileQuestion,
  Hash,
  Home,
  Table,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const quizItems = [
  {
    title: "符クイズ",
    url: "/quiz",
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
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              size="lg"
              isActive={location === "/"}
            >
              <Home className="size-4" />
              <span className="font-bold">麻雀ツール</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <FileQuestion className="mr-2 size-4" />
            クイズ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quizItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={location.startsWith(item.url)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Table className="mr-2 size-4" />
            早見表
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cheatsheetItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={location === item.url}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            <BookOpen className="mr-2 size-4" />
            その他
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={location === item.url}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
