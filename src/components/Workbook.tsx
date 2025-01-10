import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { Table } from './Table';
import { isTableVisible } from '../utils/pagination';
import { exportToPDF } from '../utils/pdfExport';

interface TableData {
  id: string;
  position: { x: number; y: number };
}

export const Workbook: React.FC<{ isPdfMode?: boolean }> = ({ isPdfMode = false }) => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const workbookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const page = searchParams.get('page');
    if (page) {
      setCurrentPage(parseInt(page, 10));
    }
  }, []);

  const handleDragStart = () => {
    // We can add visual feedback for dragging here if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    setTables((tables) =>
      tables.map((table) => {
        if (table.id === active.id) {
          return {
            ...table,
            position: {
              x: table.position.x + delta.x,
              y: table.position.y + delta.y,
            },
          };
        }
        return table;
      })
    );
  };

  const addNewTable = () => {
    const newTable: TableData = {
      id: `table-${tables.length + 1}`,
      position: { x: 50, y: 50 + tables.length * 50 },
    };
    setTables([...tables, newTable]);
  };

  const handleExportPDF = async () => {
    if (!workbookRef.current) return;
    
    setIsExporting(true);
    try {
      await exportToPDF(workbookRef.current, {
        filename: 'workbook.pdf',
        margin: [40, 40, 40, 40],
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const visibleTables = isPdfMode
    ? tables.filter((table) => isTableVisible(table.position, currentPage))
    : tables;

  return (
    <div className="p-4">
      {!isPdfMode && (
        <div className="mb-4 flex space-x-4">
          <button
            onClick={addNewTable}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Table
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
              isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      )}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div ref={workbookRef} className="workbook">
          {visibleTables.map((table) => (
            <Table
              key={table.id}
              id={table.id}
              position={table.position}
              onPositionChange={(id, position) => {
                setTables((tables) =>
                  tables.map((t) => (t.id === id ? { ...t, position } : t))
                );
              }}
              isPdfMode={isPdfMode}
              currentPage={currentPage}
            />
          ))}
        </div>
      </DndContext>
      {isPdfMode && (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}; 