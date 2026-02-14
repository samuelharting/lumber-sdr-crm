export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    
    // Skip Saturday (6) and Sunday (0)
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return result;
}

export function formatToDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateNextActionDate(currentDate: Date, businessDays: number): string {
  const targetDate = addBusinessDays(currentDate, businessDays);
  return formatToDateString(targetDate);
}