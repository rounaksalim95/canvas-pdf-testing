import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateTablePagination } from '../utils/pagination';

interface TableProps {
  id: string;
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  isPdfMode?: boolean;
  currentPage?: number;
}

const generateDummyData = (rows: number) => {
  return Array.from({ length: rows }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    category: `Category ${Math.floor(Math.random() * 5) + 1}`,
  }));
};

export const Table: React.FC<TableProps> = ({
  id,
  position,
  onPositionChange,
  isPdfMode = false,
  currentPage = 1,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 300 });
  const tableRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      type: 'table',
      position,
    },
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (node) {
        tableRef.current = node;
      }
    },
    [setNodeRef]
  );

  useEffect(() => {
    if (tableRef.current) {
      const tableRows = tableRef.current.querySelectorAll('tbody tr');
      if (tableRows.length > 0) {
        setRowHeight(tableRows[0].getBoundingClientRect().height);
      }
      const header = tableRef.current.querySelector('thead');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    }
  }, []);

  useEffect(() => {
    if (transform) {
      const newPosition = {
        x: position.x + (transform.x || 0),
        y: position.y + (transform.y || 0),
      };
      onPositionChange(id, newPosition);
    }
  }, [transform, position, id, onPositionChange]);

  const totalRows = isPdfMode && isExpanded ? 50 : 10;
  const pagination = isPdfMode && isExpanded
    ? calculateTablePagination(
        {
          headerHeight,
          rowHeight,
          width: size.width,
          height: size.height,
        },
        {
          totalRows,
          currentPage,
        }
      )
    : null;

  const visibleData = generateDummyData(
    pagination ? pagination.endRow - pagination.startRow : totalRows
  ).slice(pagination ? pagination.startRow : 0, pagination ? pagination.endRow : totalRows);

  const style = {
    transform: CSS.Translate.toString(transform),
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
  };

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    const startX = e.pageX;
    const startY = e.pageY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (direction === 'se') {
        setSize({
          width: Math.max(200, startWidth + (e.pageX - startX)),
          height: Math.max(100, startHeight + (e.pageY - startY)),
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className="table-container"
      {...attributes}
      {...listeners}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sample Table</h3>
          {!isPdfMode && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isExpanded}
                onChange={(e) => setIsExpanded(e.target.checked)}
                className="form-checkbox"
              />
              <span className="text-sm">Expand in PDF</span>
            </label>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleData.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2">{row.id}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.value}</td>
                  <td className="px-4 py-2">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && (
            <div className="mt-2 text-sm text-gray-500">
              Page {currentPage} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>
      {!isPdfMode && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleResize(e, 'se')}
        />
      )}
    </div>
  );
}; 