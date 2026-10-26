import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  right?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  right,
  className = '',
}) => {
  return (
    <motion.div
      variants={fadeUp}
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}
    >
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <span>{title}</span>
          {Icon && <Icon size={20} className="text-blue-600" />}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-3 shrink-0">{right}</div>}
    </motion.div>
  );
};
