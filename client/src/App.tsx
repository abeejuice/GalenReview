import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Intake from "@/pages/intake";
import ItemDetail from "@/pages/item-detail";
import Journal from "@/pages/journal";
import Analytics from "@/pages/analytics";
import SignIn from "@/pages/sign-in";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/intake" component={Intake} />
      <Route path="/item/:id" component={ItemDetail} />
      <Route path="/journal" component={Journal} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/sign-in" component={SignIn} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
