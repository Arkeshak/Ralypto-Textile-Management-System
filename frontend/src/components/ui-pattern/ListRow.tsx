import React from 'react';
import { ProgressBar } from './ProgressBar';

export interface ListRowProps {
  name: string;
  valueText: string;
  pct?: number;
  avatarText?: string;
  avatarColor?: string;
  subText?: string;
  delay?: number;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  name,
  valueText,
  pct,
  avatarText,
  avatarColor = '#2f5bff',
  subText,
  delay = 0,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2.5 font-bold text-slate-800">
          {avatarText && (
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white shadow-xs shrink-0"
              style={{ background: avatarColor }}
            >
              {avatarText}
            </span>
          )}
          <span>
            {name}
            {subText && <span className="block text-xs font-normal text-slate-500">{subText}</span>}
          </span>
        </span>
        <span className="font-extrabold text-slate-900 tabular-nums">{valueText}</span>
      </div>

      {typeof pct === 'number' && (
        <ProgressBar pct={pct} color={avatarColor} delay={delay} />
      )}
    </div>
  );
};
