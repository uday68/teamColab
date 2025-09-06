import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient?: string;
  delay?: number;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  gradient = 'gradient-primary',
  delay = 0 
}: KPICardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-warning'
  };

  const trendIndicator = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="gradient-card rounded-xl p-6 shadow-soft border border-border/50 hover:shadow-medium transition-smooth"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            <span className={cn("text-sm font-medium", trendColors[trend])}>
              {trendIndicator[trend]} {change}
            </span>
            <span className="text-xs text-muted-foreground">vs last week</span>
          </div>
        </div>
        
        <div className={cn("p-3 rounded-lg", gradient)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}