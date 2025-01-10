# Canvas Table Workbook Application

## Overview
This application is a web-based workbook that provides users with a vertically endless canvas where they can add, drag, and position tables. The canvas is designed to match the width of a standard letter page (8.5" x 11") and allows for infinite vertical scrolling. Users can add multiple tables containing dummy data and freely position them within the canvas.

## Technical Stack
- **React + Vite**: For fast development and optimal production builds
- **TypeScript**: For type safety and better developer experience
- **TailwindCSS**: For utility-first styling
- **DND Kit**: For drag-and-drop functionality

## Core Components

### 1. Workbook Component (`src/components/Workbook.tsx`)
The main container component that manages:
- Canvas state and dimensions
- Table positioning
- Drag and drop context
- Table addition functionality

Key features:
```typescript
interface TableData {
  id: string;
  position: { x: number; y: number };
}
```

The component uses several React hooks:
- `useState`: Manages tables and canvas height
- `useRef`: References the canvas DOM element
- `useEffect`: Dynamically adjusts canvas height based on table positions

### 2. Table Component (`src/components/Table.tsx`)
Represents individual tables within the workbook with:
- Fixed structure (ID, Name, Age, Location columns)
- Drag handle functionality
- Position management
- Dummy data generation

### 3. Styling (`src/index.css`)
The application uses a combination of TailwindCSS utilities and custom CSS:

```css
.workbook-canvas {
  width: 816px; /* Letter page width at 96 DPI */
  min-height: 100vh;
  background: white;
  position: relative;
}
```

## Technical Implementation Details

### Canvas Management
1. **Size Calculation**:
   - Width: Fixed at 816px (8.5" × 96 DPI)
   - Height: Dynamically calculated based on table positions
   ```typescript
   const newHeight = Math.max(window.innerHeight, maxY + 600);
   ```

2. **Position Management**:
   - Tables use absolute positioning within the canvas
   - Positions are stored as {x, y} coordinates
   - Boundaries are enforced during drag operations

### Drag and Drop Implementation
1. **DND Kit Integration**:
   - Uses `DndContext` for drag-and-drop functionality
   - Implements `useSortable` hook for table dragging
   ```typescript
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
   } = useSortable({ id });
   ```

2. **Position Updates**:
   - Tracks delta changes during drag operations
   - Updates positions while maintaining canvas boundaries
   ```typescript
   const newX = Math.max(0, Math.min(position.x + delta.x, 816 - 400));
   ```

### Table Management
1. **Table Creation**:
   - Tables are added with unique IDs
   - Initial positions are calculated based on existing tables
   ```typescript
   const newTable: TableData = {
     id: `table-${tables.length + 1}`,
     position: { x: 50, y: 50 + tables.length * 50 },
   };
   ```

2. **Data Structure**:
   - Each table contains 10 rows of dummy data
   - Data is generated with random values for age and location
   ```typescript
   const dummyData = Array.from({ length: 10 }, (_, i) => ({
     id: i + 1,
     name: `Person ${i + 1}`,
     age: Math.floor(Math.random() * 50) + 20,
     location: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][Math.floor(Math.random() * 5)],
   }));
   ```

## Performance Considerations
1. **Canvas Resizing**:
   - Canvas height updates are debounced through React's useEffect
   - Only recalculates when table positions change

2. **Rendering Optimization**:
   - Tables are rendered using unique keys for efficient updates
   - Transform operations use CSS transforms for smooth animations

## Browser Compatibility
The application uses modern web technologies:
- CSS Grid and Flexbox for layout
- CSS Transform for table positioning
- Modern JavaScript features (requires ES6+ support)

## Future Enhancements
1. Table resizing functionality
2. Data persistence
3. Table deletion
4. Editable table data
5. Undo/Redo functionality
6. Export to PDF capability

## Code Organization
```
src/
├── components/
│   ├── Workbook.tsx    # Main canvas container
│   └── Table.tsx       # Table component
├── App.tsx             # Root component
└── index.css          # Global styles and canvas layout
```

## Best Practices Implemented
1. **TypeScript Types**:
   - Strict type checking
   - Interface definitions for props and state
   - Type safety for component props

2. **React Patterns**:
   - Functional components
   - Custom hooks for complex logic
   - Proper state management
   - Controlled components

3. **CSS Organization**:
   - Utility-first approach with Tailwind
   - Scoped custom CSS for specific components
   - Responsive design considerations

4. **Code Structure**:
   - Clear component hierarchy
   - Separation of concerns
   - Modular component design
   - Clean and documented code 