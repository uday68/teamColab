import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const riskData = [
  { project: 'Mobile App Redesign', risk: 'high', status: 'Behind Schedule', days: 5 },
  { project: 'API Integration', risk: 'medium', status: 'On Track', days: 0 },
  { project: 'User Research', risk: 'low', status: 'Ahead', days: -2 },
  { project: 'Marketing Campaign', risk: 'high', status: 'At Risk', days: 3 },
  { project: 'Database Migration', risk: 'medium', status: 'In Progress', days: 1 },
];

const riskStyles = {
  high: 'bg-danger/10 border-danger/20 text-danger',
  medium: 'bg-warning/10 border-warning/20 text-warning',
  low: 'bg-success/10 border-success/20 text-success'
};

const statusIcons = {
  'Behind Schedule': AlertTriangle,
  'At Risk': AlertTriangle,
  'On Track': Clock,
  'In Progress': Clock,
  'Ahead': CheckCircle
};

export function RiskHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="gradient-card rounded-xl p-6 shadow-soft border border-border/50"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Risk Assessment</h3>
        <p className="text-sm text-muted-foreground">Monitor project health and potential blockers</p>
      </div>

      <div className="space-y-3">
        {riskData.map((item, index) => {
          const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
          
          return (
            <motion.div
              key={item.project}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-smooth"
            >
              <div className="flex items-center gap-3 flex-1">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{item.project}</p>
                  <p className="text-xs text-muted-foreground">{item.status}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {item.days !== 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.days > 0 ? `+${item.days}d` : `${item.days}d`}
                  </span>
                )}
                <span 
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium border",
                    riskStyles[item.risk as keyof typeof riskStyles]
                  )}
                >
                  {item.risk.toUpperCase()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Risk Levels:</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}