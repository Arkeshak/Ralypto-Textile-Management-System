import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  pct: number;
  color?: string;
  height?: string;
  delay?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  pct,
  color = '#2f5bff',
  height = 'h-1.5',
  delay = 0,
  className = '',
}) => {
  const clampedPct = Math.min(100, Math.max(0, pct));

  return (
    <div className={`w-full rounded-full bg-slate-100 overflow-hidden ${height} ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${clampedPct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
};
