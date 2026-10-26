import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export interface SectionCardProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className = '',
  isClickable = false,
  ...rest
}) => {
  return (
    <motion.section
      variants={fadeUp}
      whileHover={isClickable ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] border border-slate-100 ${
        isClickable ? 'cursor-pointer hover:border-slate-200' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.section>
  );
};
