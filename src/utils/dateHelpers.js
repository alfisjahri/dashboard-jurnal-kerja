import { format, parseISO, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDateIndonesian = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch (error) {
    return dateString;
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy', { locale: id });
  } catch (error) {
    return dateString;
  }
};

export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

export const getDateRangePresets = () => {
  const today = new Date();
  
  const startW = startOfWeek(today, { weekStartsOn: 1 });
  const endW = endOfWeek(today, { weekStartsOn: 1 });
  
  const startM = startOfMonth(today);
  const endM = endOfMonth(today);

  return {
    today: {
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd')
    },
    thisWeek: {
      startDate: format(startW, 'yyyy-MM-dd'),
      endDate: format(endW, 'yyyy-MM-dd')
    },
    thisMonth: {
      startDate: format(startM, 'yyyy-MM-dd'),
      endDate: format(endM, 'yyyy-MM-dd')
    }
  };
};
