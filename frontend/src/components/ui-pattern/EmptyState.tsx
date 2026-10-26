import React from 'react';
import { Inbox } from 'lucide-react';
import { PressButton } from '../../lib/motion';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  className = '',
}) => {
  const displayDesc = description || subtitle;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center text-slate-400 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-500">
        <Icon size={28} />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      {displayDesc && (
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{displayDesc}</p>
      )}
      {actionLabel && onAction && (
        <PressButton
          onClick={onAction}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-sm"
        >
          {actionLabel}
        </PressButton>
      )}
    </div>
  );
};
