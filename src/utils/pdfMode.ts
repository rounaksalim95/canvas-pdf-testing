// Constants for PDF page dimensions (letter size at 96 DPI)
export const PDF_PAGE = {
  WIDTH: 816, // 8.5 inches
  HEIGHT: 1056, // 11 inches
  MARGIN: 40, // Margin for each page
};

// Calculate which page a Y coordinate falls on
export function getPageForY(y: number): number {
  return Math.floor(y / PDF_PAGE.HEIGHT) + 1;
}

// Calculate the Y position relative to its containing page
export function getRelativeY(absoluteY: number): number {
  return absoluteY % PDF_PAGE.HEIGHT;
}

interface TableDimensions {
  top: number;
  height: number;
  rowHeight: number;
  headerHeight: number;
}

interface PaginationResult {
  startRow: number;
  endRow: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  totalPages: number;
}

// Calculate pagination for a table that might span multiple pages
export function calculateTablePagination(
  dimensions: TableDimensions,
  options: {
    totalRows: number;
    currentPage: number;
  }
): PaginationResult {
  const { top, rowHeight, headerHeight } = dimensions;
  const { totalRows, currentPage } = options;

  // Calculate the starting Y position on the first page
  const startY = getRelativeY(top);
  
  // Calculate how many rows can fit on the first page
  const firstPageAvailableHeight = PDF_PAGE.HEIGHT - startY - PDF_PAGE.MARGIN;
  const rowsPerFullPage = Math.floor((PDF_PAGE.HEIGHT - headerHeight - (PDF_PAGE.MARGIN * 2)) / rowHeight);
  const firstPageRows = Math.floor((firstPageAvailableHeight - headerHeight) / rowHeight);

  // Calculate total pages needed
  const remainingRows = totalRows - firstPageRows;
  const additionalPages = Math.ceil(Math.max(0, remainingRows) / rowsPerFullPage);
  const totalPages = 1 + additionalPages;

  // If we're on the first page
  if (currentPage === 1) {
    return {
      startRow: 0,
      endRow: Math.min(firstPageRows, totalRows),
      isFirstPage: true,
      isLastPage: totalPages === 1,
      totalPages,
    };
  }

  // For subsequent pages
  const rowsBeforePage = firstPageRows + (currentPage - 2) * rowsPerFullPage;
  const startRow = rowsBeforePage;
  const endRow = Math.min(rowsBeforePage + rowsPerFullPage, totalRows);

  return {
    startRow,
    endRow,
    isFirstPage: false,
    isLastPage: currentPage === totalPages,
    totalPages,
  };
} 