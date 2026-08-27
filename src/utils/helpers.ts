import QRCode from 'qrcode';
import { ClearanceOverallStatus, ItemClearanceStatus, Role } from '../types';

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 256,
      color: {
        dark: '#0f375c',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export async function generateVerificationQRCode(certificateNumber: string): Promise<string> {
  const verificationUrl = `https://clearance.hu.edu.et/verify?cert=${encodeURIComponent(certificateNumber)}`;
  return generateQRCodeDataUrl(verificationUrl);
}

export function getOverallStatusConfig(status: ClearanceOverallStatus) {
  switch (status) {
    case 'CERTIFICATE_ISSUED':
      return {
        label: 'Certificate Issued',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        dotBg: 'bg-emerald-500',
        icon: 'Award'
      };
    case 'APPROVED':
    case 'COMPLETED':
      return {
        label: 'Fully Approved',
        badgeBg: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
        dotBg: 'bg-green-500',
        icon: 'CheckCircle2'
      };
    case 'PARTIALLY_CLEARED':
      return {
        label: 'Partially Cleared',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        dotBg: 'bg-blue-500',
        icon: 'Clock'
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Under Review',
        badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
        dotBg: 'bg-indigo-500',
        icon: 'FileSearch'
      };
    case 'REJECTED':
      return {
        label: 'Action Required',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
        dotBg: 'bg-rose-500',
        icon: 'AlertCircle'
      };
    case 'SUBMITTED':
      return {
        label: 'Submitted',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        dotBg: 'bg-amber-500',
        icon: 'Send'
      };
    case 'DRAFT':
    default:
      return {
        label: 'Draft',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotBg: 'bg-slate-400',
        icon: 'Edit3'
      };
  }
}

export function getItemStatusConfig(status: ItemClearanceStatus) {
  switch (status) {
    case 'CLEARED':
      return {
        label: 'Cleared',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        dotColor: 'bg-emerald-500',
        icon: 'CheckCircle'
      };
    case 'REJECTED':
      return {
        label: 'Rejected / Obligation',
        textColor: 'text-rose-700 dark:text-rose-400',
        bgColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        dotColor: 'bg-rose-500',
        icon: 'XCircle'
      };
    case 'NEEDS_DOCUMENT':
      return {
        label: 'Needs Document',
        textColor: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        dotColor: 'bg-amber-500',
        icon: 'FileUp'
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Under Review',
        textColor: 'text-sky-700 dark:text-sky-400',
        bgColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
        dotColor: 'bg-sky-500',
        icon: 'Search'
      };
    case 'PENDING':
    default:
      return {
        label: 'Pending',
        textColor: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
        dotColor: 'bg-slate-400',
        icon: 'Clock'
      };
  }
}

export function getRoleBadge(role: Role) {
  switch (role) {
    case 'SUPER_ADMIN':
      return { label: 'Super Administrator', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'ADMIN':
      return { label: 'Administrator', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'REGISTRAR':
      return { label: 'Central Registrar', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    case 'OFFICER':
      return { label: 'Clearance Officer', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    case 'STUDENT':
    default:
      return { label: 'Student', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
