// Date and currency formatters for the application

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatScore = (score: number): string => {
  return score.toString();
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-construction-orange';
  if (score >= 40) return 'text-warning';
  return 'text-error';
};

export const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-success/10';
  if (score >= 60) return 'bg-construction-orange/10';
  if (score >= 40) return 'bg-warning/10';
  return 'bg-error/10';
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + (parts[1]?.charAt(0).toUpperCase() || '');
};