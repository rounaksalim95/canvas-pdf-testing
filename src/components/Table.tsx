import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useCallback, useEffect, useRef } from 'react';
import { calculateTablePagination, getPageForY, getRelativeY, PDF_PAGE } from '../utils/pdfMode';

interface TableProps {
  id: string;
  position: { x: number; y: number };
  isPdfMode?: boolean;
  currentPage?: number;
}

// Dummy data for the table
const dummyData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  age: Math.floor(Math.random() * 50) + 20,
  location: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][Math.floor(Math.random() * 5)],
}));

export function Table({ id, position, isPdfMode = false, currentPage = 1 }: TableProps) {
  const [size, setSize] = useState({ width: 400, height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const [rowHeight, setRowHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Measure row and header heights for pagination calculations
  useEffect(() => {
    if (tableRef.current && isPdfMode) {
      const tableRows = tableRef.current.querySelectorAll('tbody tr');
      if (tableRows.length > 0) {
        setRowHeight(tableRows[0].getBoundingClientRect().height);
      }
      const header = tableRef.current.querySelector('thead');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    }
  }, [isPdfMode]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled: isResizing || isPdfMode });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isPdfMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.pageX;
    const startWidth = size.width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.pageX - startX;
      const newWidth = Math.max(400, startWidth + deltaX); // Minimum width of 400px
      setSize(prev => ({ ...prev, width: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size.width, isPdfMode]);

  // Calculate pagination for PDF mode
  const pagination = isPdfMode
    ? calculateTablePagination(
        {
          top: position.y,
          height: rowHeight * dummyData.length + headerHeight,
          rowHeight,
          headerHeight,
        },
        {
          totalRows: dummyData.length,
          currentPage,
        }
      )
    : null;

  // Calculate table visibility and position for PDF mode
  const tablePage = getPageForY(position.y);
  const isVisible = !isPdfMode || tablePage === currentPage;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? undefined : transition,
    left: position.x,
    top: isPdfMode ? getRelativeY(position.y) : position.y,
    width: size.width,
    display: isVisible ? 'block' : 'none',
  };

  // Get the rows to display based on pagination
  const visibleData = isPdfMode
    ? dummyData.slice(
        pagination?.startRow ?? 0,
        pagination?.endRow ?? dummyData.length
      )
    : dummyData;

  if (isPdfMode && !isVisible) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          (tableRef as { current: HTMLDivElement | null }).current = node;
        }
      }}
      style={style}
      className={`table-container ${isPdfMode ? 'pdf-mode' : ''}`}
      {...(!isPdfMode ? { ...attributes, ...listeners } : {})}
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Age</th>
            <th className="p-2 text-left">Location</th>
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row) => (
            <tr key={row.id} className="border-t border-gray-200">
              <td className="p-2">{row.id}</td>
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row.age}</td>
              <td className="p-2">{row.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isPdfMode && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          onClick={e => e.stopPropagation()}
        />
      )}
      {isPdfMode && pagination && pagination.totalPages > 1 && (
        <div className="text-sm text-gray-500 p-2 border-t">
          Page {currentPage} of {pagination.totalPages}
        </div>
      )}
    </div>
  );
} 