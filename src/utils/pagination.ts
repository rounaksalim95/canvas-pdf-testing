interface TableDimensions {
  headerHeight: number;
  rowHeight: number;
  width: number;
  height: number;
}

interface TableContent {
  totalRows: number;
  currentPage: number;
}

interface PaginationResult {
  rowsPerPage: number;
  totalPages: number;
  startRow: number;
  endRow: number;
}

const A4_HEIGHT_PX = 1123; // Approximately 297mm at 96 DPI
const PAGE_MARGIN = 40;

export const calculateTablePagination = (
  tableDimensions: TableDimensions,
  content: TableContent,
  pageHeight: number = A4_HEIGHT_PX
): PaginationResult => {
  const availableHeight = pageHeight - PAGE_MARGIN * 2;
  const contentHeight = availableHeight - tableDimensions.headerHeight;
  const rowsPerPage = Math.floor(contentHeight / tableDimensions.rowHeight);

  const totalPages = Math.ceil(content.totalRows / rowsPerPage);
  const startRow = (content.currentPage - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, content.totalRows);

  return {
    rowsPerPage,
    totalPages,
    startRow,
    endRow,
  };
};

export const isTableVisible = (
  tablePosition: { y: number },
  currentPage: number,
  pageHeight: number = A4_HEIGHT_PX
): boolean => {
  const startY = (currentPage - 1) * pageHeight;
  const endY = startY + pageHeight;
  return tablePosition.y >= startY && tablePosition.y < endY;
}; 