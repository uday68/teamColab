import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GreetingBanner } from '@/components/dashboard/GreetingBanner';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { RiskHeatmap } from '@/components/dashboard/RiskHeatmap';
import { MeetingRoom } from '@/components/meeting/MeetingRoom';
import { SettingsPage } from '@/components/settings/SettingsPage';

const kpiData = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+8%',
    trend: 'up' as const,
    icon: Target,
    gradient: 'gradient-primary'
  },
  {
    title: 'Team Members',
    value: '24',
    change: '+12%',
    trend: 'up' as const,
    icon: Users,
    gradient: 'gradient-success'
  },
  {
    title: 'Tasks Completed',
    value: '156',
    change: '+23%',
    trend: 'up' as const,
    icon: CheckCircle,
    gradient: 'gradient-warm'
  },
  {
    title: 'Avg. Response Time',
    value: '2.4h',
    change: '-15%',
    trend: 'up' as const,
    icon: Clock,
    gradient: 'gradient-success'
  }
];

const projectData = [
  { name: 'Mobile App Redesign', progress: 78, color: 'gradient-primary' },
  { name: 'API Integration', progress: 92, color: 'gradient-success' },
  { name: 'User Research Study', progress: 65, color: 'gradient-warm' },
  { name: 'Marketing Campaign', progress: 45, color: 'bg-secondary' },
  { name: 'Database Migration', progress: 88, color: 'bg-warning' }
];

function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <GreetingBanner />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart projects={projectData} />
        <RiskHeatmap />
      </div>
    </motion.div>
  );
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'meeting':
        return <MeetingRoom />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </AppLayout>
  );
};

export default Index;
