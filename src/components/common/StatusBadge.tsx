import React from 'react';
import { 
  CheckCircle2, Clock, XCircle, FileSearch, 
  Award, Send, Edit3, FileUp, ShieldCheck 
} from 'lucide-react';
import { ClearanceOverallStatus, ItemClearanceStatus } from '../../types';
import { getOverallStatusConfig, getItemStatusConfig } from '../../utils/helpers';

interface StatusBadgeProps {
  status: ClearanceOverallStatus | ItemClearanceStatus;
  type?: 'overall' | 'item';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'overall',
  size = 'md',
  showIcon = true
}) => {
  if (type === 'overall') {
    const config = getOverallStatusConfig(status as ClearanceOverallStatus);
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs font-medium',
      lg: 'px-3.5 py-1.5 text-sm font-semibold'
    }[size];

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.badgeBg} ${sizeClasses}`}>
        {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />}
        {config.label}
      </span>
    );
  }

  const config = getItemStatusConfig(status as ItemClearanceStatus);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.bgColor} ${sizeClasses}`}>
      {showIcon && (
        <>
          {status === 'CLEARED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          {status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          {status === 'NEEDS_DOCUMENT' && <FileUp className="w-3.5 h-3.5 text-amber-600" />}
          {status === 'UNDER_REVIEW' && <FileSearch className="w-3.5 h-3.5 text-sky-600" />}
          {status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-slate-500" />}
        </>
      )}
      {config.label}
    </span>
  );
};
