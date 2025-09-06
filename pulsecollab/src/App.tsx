import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./components/Dashboard";
import Registration from "./pages/Registraion/Registration";
import Login from "./pages/Registraion/Login";
import HomePage from "./pages/HomePage";
import VideoCall from "./components/VideoCall";
import { CalendarScheduler } from "./components/CalendarScheduler";
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TeamWorkspace } from './components/TeamWorkspace';
import TeamMemberDashboard from './components/TeamMemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsPage } from "./components/settings/SettingsPage";
import NotFound from "./pages/NotFound";

// Wrapper component to handle URL parameters
const TeamMemberDashboardWrapper = () => {
  const { memberId } = useParams<{ memberId: string }>();
  return <TeamMemberDashboard memberId={memberId || '1'} />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team-dashboard/:memberId" element={<TeamMemberDashboardWrapper />} />
          <Route path="/calendar" element={<CalendarScheduler />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/workspace" element={<TeamWorkspace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/index" element={<Index />} />
          {/* Add other routes here */}
          <Route path="/" element={<HomePage />} />
          <Route path="/video-call" element={<VideoCall />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
