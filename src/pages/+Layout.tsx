import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ReadingProvider } from "@/context/ReadingContextProvider";
import "@/index.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReadingProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ReadingProvider>
  );
}
