import { Route, Switch } from "wouter";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { HomePage } from "@/features/home/HomePage";
import { FuQuizPage } from "@/features/fu-quiz/FuQuizPage";
import { ScoreQuizPage } from "@/features/score-quiz/ScoreQuizPage";
import { FuCheatsheetPage } from "@/features/fu-cheatsheet/FuCheatsheetPage";
import { ScoreCheatsheetPage } from "@/features/score-cheatsheet/ScoreCheatsheetPage";
import { GlossaryPage } from "@/features/glossary/GlossaryPage";

export function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
        </header>
        <main className="container mx-auto px-4 py-6">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/quiz" component={FuQuizPage} />
            <Route path="/quiz/:category" component={FuQuizPage} />
            <Route path="/score-quiz" component={ScoreQuizPage} />
            <Route path="/score-quiz/:category" component={ScoreQuizPage} />
            <Route path="/fu" component={FuCheatsheetPage} />
            <Route path="/score" component={ScoreCheatsheetPage} />
            <Route path="/glossary" component={GlossaryPage} />
            <Route>404 - ページが見つかりません</Route>
          </Switch>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
