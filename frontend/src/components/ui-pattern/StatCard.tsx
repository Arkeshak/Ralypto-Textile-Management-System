import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fadeUp } from '../../lib/motion';

export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.2,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [v, setV] = useState(0);

  useEffect(() => {
    const c = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (x) => setV(x),
    });
    return () => c.stop();
  }, [to, duration]);

  return (
    <>
      {prefix}
      {v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: string;
  isPositive?: boolean;
  isHero?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  isPositive = true,
  isHero = false,
  className = '',
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <motion.div
      variants={fadeUp}
      whileHover={isClickable ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        isClickable ? 'cursor-pointer' : ''
      } ${
        isHero
          ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20'
          : 'bg-white border border-slate-100 shadow-sm text-slate-900'
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-full ${
            isHero ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon size={18} />
        </span>
        {change && (
          <span
            className={`flex items-center gap-1 text-sm font-bold ${
              isHero
                ? 'text-white/90'
                : isPositive
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {change}
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-extrabold tracking-tight">
        <CountUp to={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>

      <p className={`text-sm font-semibold mt-1 ${isHero ? 'text-white/80' : 'text-slate-500'}`}>
        {title}
      </p>

      {isHero && (
        <span className="absolute -bottom-6 -right-4 h-24 w-16 rotate-[28deg] rounded-full bg-lime-300/80 pointer-events-none" />
      )}
    </motion.div>
  );
};
