import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-full scale-150" />
        <Camera className="w-16 h-16 mx-auto mb-6 text-foreground/80 stroke-[1.5]" />
        <h1 className="text-4xl font-light tracking-tight mb-4">
          Moment
        </h1>
        <p className="text-muted-foreground font-light text-sm tracking-wide">
          即使相隔万里，也能同刻记录。
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/create')}
        className="glass px-8 py-4 rounded-full flex items-center gap-3 text-sm font-medium tracking-widest hover:bg-foreground/5 transition-colors"
      >
        <span>开始我们的时刻</span>
      </motion.button>
    </motion.div>
  );
}
