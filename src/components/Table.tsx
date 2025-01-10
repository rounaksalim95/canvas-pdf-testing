import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useCallback } from 'react';

interface TableProps {
  id: string;
  position: { x: number; y: number };
}

// Dummy data for the table
const dummyData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  age: Math.floor(Math.random() * 50) + 20,
  location: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][Math.floor(Math.random() * 5)],
}));

export function Table({ id, position }: TableProps) {
  const [size, setSize] = useState({ width: 400, height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled: isResizing });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
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
  }, [size.width]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? undefined : transition,
    left: position.x,
    top: position.y,
    width: size.width,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="table-container"
      {...attributes}
      {...listeners}
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
          {dummyData.map((row) => (
            <tr key={row.id} className="border-t border-gray-200">
              <td className="p-2">{row.id}</td>
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row.age}</td>
              <td className="p-2">{row.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
} 