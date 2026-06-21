export const formatMoney = (amount: number): string => {
  if (amount === 0) return '¥0';
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(2)}万`;
  }
  return `¥${amount.toLocaleString()}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return dateStr;
};

export const getStatusText = (status: 'on' | 'off' | 'pending'): string => {
  const map = {
    on: '在场',
    off: '已退场',
    pending: '待入场',
  };
  return map[status];
};

export const getSalaryStatusText = (status: 'normal' | 'warning' | 'error'): string => {
  const map = {
    normal: '正常发放',
    warning: '发放延迟',
    error: '未发放',
  };
  return map[status];
};

export const randomPick = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
