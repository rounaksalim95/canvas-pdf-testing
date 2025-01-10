import { useState, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Table } from './Table';
import { PDF_PAGE, getPageForY } from '../utils/pdfMode';

interface TableData {
  id: string;
  position: { x: number; y: number };
}

const STORAGE_KEY = 'workbook-tables';

export function Workbook() {
  // Initialize state from localStorage if available
  const [tables, setTables] = useState<TableData[]>(() => {
    const savedTables = localStorage.getItem(STORAGE_KEY);
    return savedTables ? JSON.parse(savedTables) : [];
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState<number>(window.innerHeight);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Check if we're in PDF mode
  const isPdfMode = new URLSearchParams(window.location.search).get('pdf') === 'true';

  // Save tables to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  }, [tables]);

  // Update canvas height when tables are dragged
  useEffect(() => {
    if (!canvasRef.current || isPdfMode) return;
    
    const updateCanvasHeight = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Find the lowest point of all tables
      const maxY = tables.reduce((max, table) => {
        return Math.max(max, table.position.y);
      }, 0);

      // Add some padding and minimum table height
      const newHeight = Math.max(window.innerHeight, maxY + 600);
      setCanvasHeight(newHeight);
    };

    updateCanvasHeight();
  }, [tables, isPdfMode]);

  // Update URL when page changes in PDF mode
  useEffect(() => {
    if (!isPdfMode) return;

    const url = new URL(window.location.href);
    url.searchParams.set('page', currentPage.toString());
    window.history.replaceState({}, '', url.toString());
  }, [currentPage, isPdfMode]);

  // Load page from URL on initial load
  useEffect(() => {
    if (!isPdfMode) return;
    
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1', 10);
    setCurrentPage(page);
  }, [isPdfMode]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (isPdfMode) return;
    
    const { active, delta } = event;
    
    setTables((tables) =>
      tables.map((table) => {
        if (table.id === active.id) {
          // Ensure table stays within canvas bounds
          const newX = Math.max(0, Math.min(table.position.x + delta.x, PDF_PAGE.WIDTH - 400)); // 400px is min table width
          const newY = Math.max(0, table.position.y + delta.y);
          
          return {
            ...table,
            position: {
              x: newX,
              y: newY,
            },
          };
        }
        return table;
      })
    );
  };

  const addTable = () => {
    const newTable: TableData = {
      id: `table-${Date.now()}`, // Use timestamp for unique IDs
      position: { x: 50, y: 50 + tables.length * 50 },
    };
    setTables([...tables, newTable]);
  };

  // Get the maximum page number based on table positions
  const maxPage = isPdfMode
    ? Math.max(
        1,
        ...tables.map((table) => getPageForY(table.position.y + 500)) // Add some height for the table
      )
    : 1;

  // Generate an array of page numbers for PDF mode
  const pages = isPdfMode ? Array.from({ length: maxPage }, (_, i) => i + 1) : [1];

  return (
    <div className={`workbook-container ${isPdfMode ? 'pdf-mode' : ''}`}>
      {!isPdfMode && (
        <div className="fixed top-4 left-4 z-10">
          <button
            onClick={addTable}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Table
          </button>
        </div>
      )}
      {isPdfMode ? (
        // Render each page in PDF mode
        pages.map((pageNum) => (
          <div
            key={pageNum}
            className="workbook-canvas"
            style={{
              height: `${PDF_PAGE.HEIGHT}px`,
              marginBottom: '2rem',
              pageBreakAfter: 'always',
              padding: `${PDF_PAGE.MARGIN}px`,
              position: 'relative',
            }}
          >
            <DndContext onDragEnd={handleDragEnd}>
              {tables.map((table) => (
                <Table
                  key={table.id}
                  id={table.id}
                  position={table.position}
                  isPdfMode={true}
                  currentPage={pageNum}
                />
              ))}
            </DndContext>
          </div>
        ))
      ) : (
        // Regular workbook view
        <div 
          ref={canvasRef}
          className="workbook-canvas"
          style={{ height: canvasHeight }}
        >
          <DndContext onDragEnd={handleDragEnd}>
            {tables.map((table) => (
              <Table
                key={table.id}
                id={table.id}
                position={table.position}
                isPdfMode={false}
                currentPage={1}
              />
            ))}
          </DndContext>
        </div>
      )}
      {isPdfMode && maxPage > 0 && (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm">Page {currentPage} of {maxPage}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(maxPage, p + 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            disabled={currentPage === maxPage}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 