import { motion } from 'framer-motion';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const motivationalTips = [
  "Great teams ship early and often. What's your next small win?",
  "Focus is choosing what NOT to do. Eliminate one distraction today.",
  "The best ideas come from constraints. Embrace limitations as creativity boosters.",
  "Progress over perfection. Ship something today that makes users smile.",
  "Collaboration beats competition. How can you help a teammate today?"
];

export function GreetingBanner() {
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 17 ? 'Good afternoon' : 
    'Good evening';

  const randomTip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative gradient-primary rounded-2xl p-8 mb-8 text-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/5 rounded-full"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-start justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <h1 className="text-2xl font-bold">
                {greeting}, Alex! 
              </h1>
            </div>
            
            <p className="text-white/90 text-lg mb-4 max-w-2xl">
              Ready to make today productive? You have <span className="font-semibold">3 meetings</span> and 
              <span className="font-semibold"> 5 tasks</span> on your agenda.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20"
            >
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 mt-0.5 text-white/80" />
                <div>
                  <h3 className="font-medium mb-1">💡 Today's Focus Tip</h3>
                  <p className="text-white/80 text-sm">{randomTip}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex gap-3"
            >
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                Start Meeting
              </Button>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block"
          >
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xl text-white/80">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}