import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressItemProps {
  label: string;
  progress: number;
  color: string;
  delay: number;
}

function ProgressItem({ label, progress, color, delay }: ProgressItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </motion.div>
  );
}

interface ProgressChartProps {
  projects: Array<{
    name: string;
    progress: number;
    color: string;
  }>;
}

export function ProgressChart({ projects }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-card rounded-xl p-6 shadow-soft border border-border/50"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Project Progress</h3>
        <p className="text-sm text-muted-foreground">Track completion across active projects</p>
      </div>
      
      <div className="space-y-4">
        {projects.map((project, index) => (
          <ProgressItem
            key={project.name}
            label={project.name}
            progress={project.progress}
            color={project.color}
            delay={index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}