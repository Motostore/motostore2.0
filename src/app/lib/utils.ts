// import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  let result = amount ? amount : 0;
  return (result).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  if(dateStr) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
  }
  return null;
};

export const remainingTime = (dateStr: string,) => {
  let today = new Date();
  let after = new Date(dateStr)
  let differenceInTimes =
  after.getTime() - today.getTime();

  if (differenceInTimes <= 0) return 'Servicio vencido';
  
  let differenceInDays = Math.round(differenceInTimes / (1000 * 3600 * 24));

  let differenceInMonths = Math.round((differenceInDays/365)*12);

  if (differenceInDays > 60) return `${differenceInMonths} ${differenceInMonths == 1 ? 'mes': 'meses'}`;

  return `${differenceInDays} ${differenceInDays === 1 ? 'día': 'días'}`;
}

// export const generateYAxis = (revenue: Revenue[]) => {
//   // Calculate what labels we need to display on the y-axis
//   // based on highest record and in 1000s
//   const yAxisLabels = [];
//   const highestRecord = Math.max(...revenue.map((month) => month.revenue));
//   const topLabel = Math.ceil(highestRecord / 1000) * 1000;

//   for (let i = topLabel; i >= 0; i -= 1000) {
//     yAxisLabels.push(`$${i / 1000}K`);
//   }

//   return { yAxisLabels, topLabel };
// };

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export const setPad = (num, size = 10) => {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

export const pluralizeMonth = (number) => {
  let result = '1';
  if (number === 1) {
    result = `${number} mes`;
  }
  if (number > 1) {
    result = `${number} meses`;
  }
  if (number === 12) {
    result = `${number/12} año`;
  }
  if (number > 12) {
    result = `${(number/12).toFixed(1)} años`;
  }

  return result;
}