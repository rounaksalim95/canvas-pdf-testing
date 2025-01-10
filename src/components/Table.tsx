import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    left: position.x,
    top: position.y,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="table-container"
      {...attributes}
      {...listeners}
    >
      <table className="min-w-[400px]">
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
    </div>
  );
} 