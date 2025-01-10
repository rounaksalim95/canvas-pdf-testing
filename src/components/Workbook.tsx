import { useState, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Table } from './Table';

interface TableData {
  id: string;
  position: { x: number; y: number };
}

export function Workbook() {
  const [tables, setTables] = useState<TableData[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState<number>(window.innerHeight);

  // Update canvas height when tables are dragged
  useEffect(() => {
    if (!canvasRef.current) return;
    
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
  }, [tables]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    setTables((tables) =>
      tables.map((table) => {
        if (table.id === active.id) {
          // Ensure table stays within canvas bounds
          const newX = Math.max(0, Math.min(table.position.x + delta.x, 816 - 400)); // 400px is min table width
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
      id: `table-${tables.length + 1}`,
      position: { x: 50, y: 50 + tables.length * 50 },
    };
    setTables([...tables, newTable]);
  };

  return (
    <div className="workbook-container">
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={addTable}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Table
        </button>
      </div>
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
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
} 