import React from 'react';

export interface CardHeaderProps {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  sub?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon: Icon,
  title,
  sub,
  subtitle,
  right,
  className = '',
}) => {
  const displaySub = sub || subtitle;

  return (
    <div className={`mb-4 flex items-center justify-between gap-3 min-h-[44px] ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600 shrink-0">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{title}</h3>
          {displaySub && <p className="text-xs text-slate-500 mt-0.5 truncate">{displaySub}</p>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
};
